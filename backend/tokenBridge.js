import { pool } from './db.js';
import { broadcastNewToken, broadcastOrderEvent } from './orderStream.js';

/**
 * Auto-syncs a customer dine-in order to an active table token.
 * If the table has an active token (DINING/ORDERING/UNPAID/BILL_REQUESTED), appends items.
 * If not, auto-issues a new table token.
 */
export async function syncOrderToTableToken(client, orderData) {
  if (!client?.id || !orderData) return null;

  const rawTable = orderData.tableNumber || orderData.table || '';
  const parsedTableNum = parseInt(String(rawTable).replace(/\D/g, ''), 10);
  if (!parsedTableNum || isNaN(parsedTableNum)) {
    return null;
  }

  const rawItems = orderData.items || [];
  const itemsList = typeof rawItems === 'string' ? JSON.parse(rawItems) : rawItems;
  if (!Array.isArray(itemsList) || itemsList.length === 0) {
    return null;
  }

  const clientConn = await pool.connect();
  try {
    await clientConn.query('BEGIN');

    // 1. Check for active token on this table
    const activeRes = await clientConn.query(
      `SELECT * FROM table_tokens
       WHERE tenant_id = $1 
         AND table_number = $2 
         AND status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID')
       ORDER BY created_at DESC
       LIMIT 1
       FOR UPDATE`,
      [client.id, parsedTableNum]
    );

    let tokenRecord = activeRes.rows[0];
    let isNewToken = false;

    if (!tokenRecord) {
      isNewToken = true;
      const numRes = await clientConn.query(
        `SELECT COALESCE(MAX(token_number), 100) + 1 AS next_num 
         FROM table_tokens 
         WHERE tenant_id = $1`,
        [client.id]
      );
      const tokenNumber = parseInt(numRes.rows[0].next_num, 10);
      const tokenCode = '#' + String(tokenNumber);

      const insTokenRes = await clientConn.query(
        `INSERT INTO table_tokens (
           tenant_id, token_number, token_code, table_number, status, covers,
           customer_name, customer_phone, subtotal_paise, tax_paise, total_paise, items_json
         )
         VALUES ($1, $2, $3, $4, 'DINING', 1, $5, $6, 0, 0, 0, '[]'::jsonb)
         RETURNING *`,
        [
          client.id,
          tokenNumber,
          tokenCode,
          parsedTableNum,
          orderData.customerName || null,
          orderData.customerPhone || null,
        ]
      );
      tokenRecord = insTokenRes.rows[0];
    }

    const tokenId = tokenRecord.id;

    // 2. Insert items into token_items
    for (const item of itemsList) {
      const name = item.name || item.dishName || item.title || 'Item';
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const unitPricePaise = Math.round((parseFloat(item.price) || 0) * 100);
      const totalPricePaise = unitPricePaise * qty;
      const variant = item.variant || null;
      const isVeg = item.isVeg !== false;
      const notes = item.instructions || item.notes || null;
      const menuItemId = item.id ? String(item.id) : null;

      await clientConn.query(
        `INSERT INTO token_items (
           token_id, menu_item_id, item_name, variant, quantity, unit_price_paise, total_price_paise, is_veg, notes
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [tokenId, menuItemId, name, variant, qty, unitPricePaise, totalPricePaise, isVeg, notes]
      );
    }

    // 3. Recalculate total from all token_items
    const sumRes = await clientConn.query(
      `SELECT 
         COALESCE(SUM(total_price_paise), 0) AS subtotal_paise,
         COUNT(*) AS item_count
       FROM token_items
       WHERE token_id = $1`,
      [tokenId]
    );
    const subtotalPaise = parseInt(sumRes.rows[0].subtotal_paise, 10) || 0;
    const itemCount = parseInt(sumRes.rows[0].item_count, 10) || 0;

    // Fetch all current items to store in items_json for fast querying
    const allItemsRes = await clientConn.query(
      `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
      [tokenId]
    );

    const itemsJson = allItemsRes.rows.map(r => ({
      id: r.id,
      dishName: r.item_name,
      itemName: r.item_name,
      variant: r.variant,
      quantity: r.quantity,
      price: Math.round(r.unit_price_paise / 100),
      unit_price_paise: r.unit_price_paise,
      total_price_paise: r.total_price_paise,
      is_veg: r.is_veg,
      notes: r.notes,
    }));

    // Update table_tokens
    const updRes = await clientConn.query(
      `UPDATE table_tokens
       SET subtotal_paise = $1,
           total_paise = $1,
           status = 'DINING',
           items_json = $2,
           customer_name = COALESCE(customer_name, $3),
           customer_phone = COALESCE(customer_phone, $4),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        subtotalPaise,
        JSON.stringify(itemsJson),
        orderData.customerName || null,
        orderData.customerPhone || null,
        tokenId
      ]
    );

    await clientConn.query('COMMIT');
    tokenRecord = updRes.rows[0];

    const tokenPayload = {
      id: tokenRecord.id,
      tokenId: tokenRecord.id,
      tokenNumber: Number(tokenRecord.token_number),
      tokenCode: tokenRecord.token_code,
      tableNumber: Number(tokenRecord.table_number),
      total: Math.round(Number(tokenRecord.total_paise) / 100),
      totalPaise: Number(tokenRecord.total_paise),
      subtotal: Math.round(Number(tokenRecord.subtotal_paise) / 100),
      subtotalPaise: Number(tokenRecord.subtotal_paise),
      itemCount,
      status: tokenRecord.status,
      items: itemsJson,
      createdAt: tokenRecord.created_at,
    };

    // Broadcast SSE to cashier screen
    if (isNewToken) {
      broadcastNewToken(client.id, tokenPayload);
    } else {
      broadcastOrderEvent(client.id, 'token_item_added', tokenPayload);
    }

    return {
      tokenId: tokenRecord.id,
      tokenNumber: Number(tokenRecord.token_number),
      tokenCode: tokenRecord.token_code,
      billUrl: `/bill/${tokenRecord.id}`,
      total: Math.round(Number(tokenRecord.total_paise) / 100),
    };
  } catch (err) {
    await clientConn.query('ROLLBACK');
    console.error('[tokenBridge] Error syncing order to table_token:', err);
    throw err;
  } finally {
    clientConn.release();
  }
}

/**
 * Returns active token for a specific table if any.
 */
export async function getActiveTableToken(tenantId, tableNumber) {
  if (!tenantId || !tableNumber) return null;
  const parsedTableNum = parseInt(String(tableNumber).replace(/\D/g, ''), 10);
  if (!parsedTableNum || isNaN(parsedTableNum)) return null;

  const res = await pool.query(
    `SELECT * FROM table_tokens
     WHERE tenant_id = $1 
       AND table_number = $2 
       AND status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID')
     ORDER BY created_at DESC
     LIMIT 1`,
    [tenantId, parsedTableNum]
  );
  if (res.rows.length === 0) return null;

  const r = res.rows[0];
  return {
    id: r.id,
    tokenId: r.id,
    tokenNumber: Number(r.token_number),
    tokenCode: r.token_code,
    tableNumber: Number(r.table_number),
    status: r.status,
    total: Math.round(Number(r.total_paise) / 100),
    billUrl: `/bill/${r.id}`,
    createdAt: r.created_at,
  };
}

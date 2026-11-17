import { pool } from './db.js';
import { broadcastNewToken, broadcastOrderEvent } from './orderStream.js';
import { broadcastTokenItems } from './tokenStream.js';
import { computeBillTax, loadTenantTaxSettings, taxSettingsOfToken } from './billTax.js';

/** Subtotal, count and the items_json snapshot of a token, read inside the caller's transaction. */
async function summarizeTokenItems(clientConn, tokenId) {
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
  return { subtotalPaise, itemCount, itemsJson };
}

/**
 * Takes a cancelled customer order's dishes off its table bill, so the diner is never charged for
 * them. Only touches open bills of the same restaurant. Returns the updated totals or null.
 */
export async function removeOrderFromToken(tenantId, orderId) {
  if (!tenantId || !orderId) return null;
  const clientConn = await pool.connect();
  try {
    await clientConn.query('BEGIN');
    const tokRes = await clientConn.query(
      `SELECT t.* FROM table_tokens t
        WHERE t.tenant_id = $1
          AND t.status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID')
          AND EXISTS (SELECT 1 FROM token_items i WHERE i.token_id = t.id AND i.order_id = $2)
        FOR UPDATE`,
      [tenantId, String(orderId)]
    );
    const token = tokRes.rows[0];
    if (!token) {
      await clientConn.query('COMMIT');
      return null;
    }
    await clientConn.query('DELETE FROM token_items WHERE token_id = $1 AND order_id = $2', [token.id, String(orderId)]);
    const { subtotalPaise, itemCount, itemsJson } = await summarizeTokenItems(clientConn, token.id);
    // Same rule as the staff paths: tax follows the bill's frozen GST setting; discount and tip stay.
    const { taxPaise } = computeBillTax(subtotalPaise, taxSettingsOfToken(token));
    const totalPaise = Math.max(0, subtotalPaise + taxPaise - Number(token.discount_paise || 0) + Number(token.tip_paise || 0));
    const upd = await clientConn.query(
      `UPDATE table_tokens
          SET subtotal_paise = $1, tax_paise = $2, total_paise = $3, items_json = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *`,
      [subtotalPaise, taxPaise, totalPaise, JSON.stringify(itemsJson), token.id]
    );
    await clientConn.query('COMMIT');
    const row = upd.rows[0];
    const totals = {
      subtotalPaise: Number(row.subtotal_paise), taxPaise: Number(row.tax_paise), totalPaise: Number(row.total_paise),
      subtotal: Math.round(Number(row.subtotal_paise) / 100), total: Math.round(Number(row.total_paise) / 100),
    };
    try {
      broadcastTokenItems(row.id, itemsJson, totals);
      broadcastOrderEvent(tenantId, 'token_item_added', {
        id: row.id, tokenId: row.id, tokenNumber: Number(row.token_number), tokenCode: row.token_code,
        tableNumber: Number(row.table_number), itemCount, status: row.status, items: itemsJson, ...totals,
      });
    } catch (broadcastErr) {
      console.warn('[tokenBridge] Broadcast after order removal failed:', broadcastErr.message);
    }
    return { tokenId: row.id, itemCount, ...totals };
  } catch (err) {
    await clientConn.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    clientConn.release();
  }
}

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

  // GST rule for a bill this order may open (read outside the transaction; see billTax.js).
  const tenantTaxSettings = await loadTenantTaxSettings(client.id);

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
           customer_name, customer_phone, subtotal_paise, tax_paise, total_paise, items_json,
           tax_mode, tax_rate_bps
         )
         VALUES ($1, $2, $3, $4, 'DINING', 1, $5, $6, 0, 0, 0, '[]'::jsonb, $7, $8)
         RETURNING *`,
        [
          client.id,
          tokenNumber,
          tokenCode,
          parsedTableNum,
          orderData.customerName || null,
          orderData.customerPhone || null,
          tenantTaxSettings.mode,
          tenantTaxSettings.rateBps,
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
           token_id, menu_item_id, item_name, variant, quantity, unit_price_paise, total_price_paise, is_veg, notes, order_id
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [tokenId, menuItemId, name, variant, qty, unitPricePaise, totalPricePaise, isVeg, notes, orderData.id ? String(orderData.id) : null]
      );
    }

    // 3. Recalculate total from all token_items
    const { subtotalPaise, itemCount, itemsJson } = await summarizeTokenItems(clientConn, tokenId);

    // Update table_tokens. QR orders follow the same GST rule as orders the staff enter, so the
    // bill is the same whichever way the dishes were ordered (previously QR orders had no tax).
    const { taxPaise } = computeBillTax(subtotalPaise, taxSettingsOfToken(isNewToken ? { ...tokenRecord, tax_mode: tenantTaxSettings.mode, tax_rate_bps: tenantTaxSettings.rateBps } : tokenRecord));
    const totalPaise = Math.max(0, subtotalPaise + taxPaise - Number(tokenRecord.discount_paise || 0) + Number(tokenRecord.tip_paise || 0));
    const updRes = await clientConn.query(
      `UPDATE table_tokens
       SET subtotal_paise = $1,
           tax_paise = $6,
           total_paise = $7,
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
        tokenId,
        taxPaise,
        totalPaise,
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

/**
 * System 2: Live Digital Table Token & Realistic Thermal Bill System API Routes
 * File: backend/routes/tokens.js
 */

import { pool } from '../db.js';
import { enforceTenant } from '../auth.js';
import { resolveTenantAuthorization, requireEntitlement } from '../authorization.js';
import { apiError, sendJson, readJson } from '../utils.js';
import {
  registerTokenClient,
  broadcastTokenStatus,
  broadcastTokenItems,
  broadcastTokenEvent,
  closeTokenClients,
} from '../tokenStream.js';
import {
  broadcastNewToken,
  broadcastTokenSettled,
  broadcastTokenClosed,
  broadcastBillRequested,
  broadcastOrderEvent,
} from '../orderStream.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_PAYMENT_METHODS = new Set(['CASH', 'UPI', 'CARD']);

function formatTokenItem(row) {
  const qty = Number(row.quantity || 1);
  const unitPricePaise = Number(row.unit_price_paise || 0);
  const totalPricePaise = Number(row.total_price_paise || qty * unitPricePaise);
  const name = row.item_name || row.dishName || row.name || '';

  return {
    id: row.id,
    tokenId: row.token_id,
    menuItemId: row.menu_item_id || null,
    dishName: name,
    itemName: name,
    name,
    item_name: name,
    variant: row.variant || null,
    quantity: qty,
    unitPricePaise,
    unit_price_paise: unitPricePaise,
    price: Math.round(unitPricePaise / 100),
    totalPricePaise,
    total_price_paise: totalPricePaise,
    total: Math.round(totalPricePaise / 100),
    isVeg: row.is_veg !== false,
    is_veg: row.is_veg !== false,
    notes: row.notes || null,
    createdAt: row.created_at,
  };
}

function formatToken(row, items = null, restaurant = null) {
  const tokenNumber = Number(row.token_number || 0);
  const tokenCode = row.token_code || ('#' + String(tokenNumber).padStart(3, '0'));
  const subtotalPaise = Number(row.subtotal_paise || 0);
  const taxPaise = Number(row.tax_paise || 0);
  const discountPaise = Number(row.discount_paise || 0);
  const tipPaise = Number(row.tip_paise || 0);
  const totalPaise = Number(row.total_paise || 0);

  const subtotal = Math.round(subtotalPaise / 100);
  const tax = Math.round(taxPaise / 100);
  const total = Math.round(totalPaise / 100);

  let parsedItems = [];
  if (Array.isArray(items)) {
    parsedItems = items.map(formatTokenItem);
  } else if (row.items_json) {
    const raw = typeof row.items_json === 'string' ? JSON.parse(row.items_json) : row.items_json;
    if (Array.isArray(raw)) {
      parsedItems = raw.map(formatTokenItem);
    }
  }

  const result = {
    id: row.id,
    tokenId: row.id,
    tokenNumber,
    token_number: tokenNumber,
    tokenCode,
    token_code: tokenCode,
    tableId: row.table_id || null,
    table_id: row.table_id || null,
    tableNumber: Number(row.table_number),
    table_number: Number(row.table_number),
    status: row.status,
    covers: Number(row.covers || 1),
    waiterId: row.waiter_id || null,
    customerName: row.customer_name || null,
    customerPhone: row.customer_phone || null,
    subtotalPaise,
    subtotal_paise: subtotalPaise,
    subtotal,
    taxPaise,
    tax_paise: taxPaise,
    tax,
    gst: tax,
    discountPaise,
    discount_paise: discountPaise,
    tipPaise,
    tip_paise: tipPaise,
    totalPaise,
    total_paise: totalPaise,
    total,
    paymentMethod: row.payment_method || null,
    payment_method: row.payment_method || null,
    method: row.payment_method || null,
    paymentReference: row.payment_reference || null,
    settledAt: row.settled_at || null,
    settled_at: row.settled_at || null,
    paidAt: row.settled_at || null,
    paid_at: row.settled_at || null,
    settledById: row.settled_by_id || null,
    closedAt: row.closed_at || null,
    closed_at: row.closed_at || null,
    notes: row.notes || null,
    items: parsedItems,
    billUrl: `/bill/${row.id}`,
    bill_url: `/bill/${row.id}`,
    createdAt: row.created_at,
    created_at: row.created_at,
    updatedAt: row.updated_at,
    updated_at: row.updated_at,
  };

  if (restaurant) {
    result.restaurantName = restaurant.business_name || restaurant.name || null;
    result.googleReviewUrl = restaurant.google_review_url || restaurant.googleReviewUrl || null;
  }

  return result;
}

let columnEnsured = false;
async function ensureClientColumns() {
  if (columnEnsured || !pool) return;
  try {
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_review_url TEXT');
    columnEnsured = true;
  } catch {}
}

async function getRestaurantDetails(tenantId) {
  await ensureClientColumns();
  let clientRow = {};
  try {
    const res = await pool.query(
      `SELECT id, business_name, tagline, phone, address, city, state, google_review_url
       FROM clients WHERE id = $1`,
      [tenantId]
    );
    clientRow = res.rows[0] || {};
  } catch {
    try {
      const fallbackRes = await pool.query(
        `SELECT id, business_name, tagline, phone, address, city, state
         FROM clients WHERE id = $1`,
        [tenantId]
      );
      clientRow = fallbackRes.rows[0] || {};
    } catch {}
  }

  let reviewUrl = clientRow.google_review_url || null;
  if (!reviewUrl) {
    try {
      const reviewRes = await pool.query(
        `SELECT review_url FROM tenant_google_reviews WHERE tenant_id = $1 LIMIT 1`,
        [tenantId]
      );
      reviewUrl = reviewRes.rows[0]?.review_url || null;
    } catch {}
  }

  return {
    ...clientRow,
    google_review_url: reviewUrl,
  };
}

export default async function tokenRoutes(request, response, url) {
  await ensureClientColumns();
  const pathname = url.pathname;

  // ---------------------------------------------------------------------------
  // PUBLIC CUSTOMER ENDPOINTS (Zero auth required)
  // ---------------------------------------------------------------------------

  // GET /api/public/tokens/:tokenId/stream (Isolated Customer SSE)
  const streamMatch = pathname.match(/^\/api\/public\/tokens\/([^/]+)\/stream$/);
  if (request.method === 'GET' && streamMatch) {
    const tokenId = streamMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const tokenRes = await pool.query(
      `SELECT * FROM table_tokens WHERE id = $1`,
      [tokenId]
    );

    if (tokenRes.rows.length === 0) {
      throw apiError(404, 'Token not found.');
    }

    const tokenRow = tokenRes.rows[0];
    const restaurant = await getRestaurantDetails(tokenRow.tenant_id);

    const itemsRes = await pool.query(
      `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
      [tokenId]
    );

    const initialToken = formatToken(tokenRow, itemsRes.rows, restaurant);
    registerTokenClient(tokenId, response, request, { initialToken });
    return true;
  }

  // GET /api/public/tokens/:tokenId (Customer Bill Details)
  const publicTokenMatch = pathname.match(/^\/api\/public\/tokens\/([^/]+)$/);
  if (request.method === 'GET' && publicTokenMatch) {
    const tokenId = publicTokenMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const tokenRes = await pool.query(
      `SELECT * FROM table_tokens WHERE id = $1`,
      [tokenId]
    );

    if (tokenRes.rows.length === 0) {
      throw apiError(404, 'Token not found.');
    }

    const tokenRow = tokenRes.rows[0];
    const restaurant = await getRestaurantDetails(tokenRow.tenant_id);

    const itemsRes = await pool.query(
      `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
      [tokenId]
    );

    const formattedToken = formatToken(tokenRow, itemsRes.rows, restaurant);

    sendJson(response, 200, {
      success: true,
      token: formattedToken,
      restaurant: {
        name: restaurant.business_name,
        businessName: restaurant.business_name,
        tagline: restaurant.tagline,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        googleReviewUrl: restaurant.google_review_url,
      },
      restaurantName: restaurant.business_name,
      googleReviewUrl: restaurant.google_review_url,
      items: formattedToken.items,
      tableNumber: formattedToken.tableNumber,
    });
    return true;
  }

  // POST /api/public/tokens/:tokenId/request-bill (Customer requests bill)
  const requestBillMatch = pathname.match(/^\/api\/public\/tokens\/([^/]+)\/request-bill$/);
  if (request.method === 'POST' && requestBillMatch) {
    const tokenId = requestBillMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 FOR UPDATE`,
        [tokenId]
      );
      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }
      const tokenRow = tokenRes.rows[0];
      if (['SETTLED', 'PAID', 'CLOSED', 'VOID'].includes(tokenRow.status.toUpperCase())) {
        await client.query('ROLLBACK');
        throw apiError(409, 'Cannot request bill for settled or closed token.');
      }

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET status = 'BILL_REQUESTED', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [tokenId]
      );
      await client.query('COMMIT');

      const updatedToken = formatToken(updateRes.rows[0]);
      broadcastTokenStatus(tokenId, updatedToken);
      broadcastBillRequested(tokenRow.tenant_id, updatedToken);

      sendJson(response, 200, { success: true, token: updatedToken });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // If not staff token route, pass through
  if (!pathname.startsWith('/api/app/tokens')) {
    return false;
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED STAFF TOKEN ENDPOINTS (Requires PREMIUM reception_orders)
  // ---------------------------------------------------------------------------

  const user = await enforceTenant(request);
  const authorization = await resolveTenantAuthorization(user);
  requireEntitlement(authorization, 'reception_orders', 'Live table token management requires the PREMIUM plan.');

  // 1. POST /api/app/tokens (Create New Table Token)
  if (request.method === 'POST' && pathname === '/api/app/tokens') {
    const body = await readJson(request);
    const tableNumber = parseInt(body.tableNumber ?? body.table_number, 10);
    if (isNaN(tableNumber) || tableNumber <= 0) {
      throw apiError(400, 'Valid tableNumber is required.');
    }

    const covers = Math.max(1, parseInt(body.covers || 1, 10));
    const waiterId = body.waiterId ? String(body.waiterId).trim() : null;
    const customerName = body.customerName ? String(body.customerName).trim() : null;
    const customerPhone = body.customerPhone ? String(body.customerPhone).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    const rawItems = Array.isArray(body.items) ? body.items : [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Atomic per-tenant advisory lock for sequential numbering
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['token_seq:' + user.tenantId]);

      // Check active dining session on this table
      const activeCheck = await client.query(
        `SELECT id, token_code, status 
         FROM table_tokens 
         WHERE tenant_id = $1 
           AND table_number = $2 
           AND status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID')
         FOR UPDATE`,
        [user.tenantId, tableNumber]
      );

      if (activeCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        throw apiError(409, `Table ${tableNumber} already has an active dining session (${activeCheck.rows[0].token_code}).`);
      }

      // Compute sequential daily token number resetting at IST midnight
      const seqRes = await client.query(
        `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_token_number
         FROM table_tokens
         WHERE tenant_id = $1
           AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
        [user.tenantId]
      );
      const tokenNumber = parseInt(seqRes.rows[0].next_token_number, 10);
      const tokenCode = '#' + String(tokenNumber).padStart(3, '0');

      // Check optional restaurant_tables row
      const tableRes = await client.query(
        `SELECT id FROM restaurant_tables WHERE tenant_id = $1 AND table_number = $2`,
        [user.tenantId, tableNumber]
      );
      const tableId = tableRes.rows[0]?.id || null;

      // Calculate line items and totals in integer paise
      let subtotalPaise = 0;
      const preparedItems = [];
      for (const item of rawItems) {
        const dishName = String(item.dishName || item.itemName || item.name || '').trim();
        if (!dishName) continue;
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        const unitPricePaise = Math.max(0, parseInt(
          item.unitPricePaise ?? item.pricePaise ?? (item.price ? Math.round(Number(item.price) * 100) : 0),
          10
        ));
        const totalPricePaise = qty * unitPricePaise;
        subtotalPaise += totalPricePaise;

        preparedItems.push({
          menuItemId: item.menuItemId ? String(item.menuItemId) : null,
          dishName,
          variant: item.variant ? String(item.variant) : null,
          quantity: qty,
          unitPricePaise,
          totalPricePaise,
          isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
          notes: item.notes ? String(item.notes) : null,
        });
      }

      const taxPaise = Math.round(subtotalPaise * 0.05); // 5% GST
      const totalPaise = subtotalPaise + taxPaise;

      // Insert table_tokens row
      const insertTokenRes = await client.query(
        `INSERT INTO table_tokens (
          tenant_id, token_number, token_code, table_id, table_number,
          status, covers, waiter_id, customer_name, customer_phone,
          subtotal_paise, tax_paise, discount_paise, tip_paise, total_paise,
          notes, items_json
        ) VALUES (
          $1, $2, $3, $4, $5,
          'ISSUED', $6, $7, $8, $9,
          $10, $11, 0, 0, $12,
          $13, $14
        ) RETURNING *`,
        [
          user.tenantId,
          tokenNumber,
          tokenCode,
          tableId,
          tableNumber,
          covers,
          waiterId,
          customerName,
          customerPhone,
          subtotalPaise,
          taxPaise,
          totalPaise,
          notes,
          JSON.stringify(preparedItems),
        ]
      );
      const tokenRow = insertTokenRes.rows[0];

      // Insert line items into token_items
      const insertedItems = [];
      for (const it of preparedItems) {
        const itemRes = await client.query(
          `INSERT INTO token_items (
            token_id, menu_item_id, item_name, variant, quantity,
            unit_price_paise, total_price_paise, is_veg, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            tokenRow.id,
            it.menuItemId,
            it.dishName,
            it.variant,
            it.quantity,
            it.unitPricePaise,
            it.totalPricePaise,
            it.isVeg,
            it.notes,
          ]
        );
        insertedItems.push(itemRes.rows[0]);
      }

      await client.query('COMMIT');

      const formattedToken = formatToken(tokenRow, insertedItems);

      // Broadcast to staff kitchen/reception stream
      broadcastNewToken(user.tenantId, formattedToken);

      sendJson(response, 201, {
        success: true,
        token: formattedToken,
      });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      if (err.code === '23505') {
        throw apiError(409, `Table ${tableNumber} already has an active dining session.`);
      }
      throw err;
    } finally {
      client.release();
    }
  }

  // 2. GET /api/app/tokens (List Active & Historical Tokens)
  if (request.method === 'GET' && pathname === '/api/app/tokens') {
    const statusParam = url.searchParams.get('status');
    const tableNumberParam = url.searchParams.get('tableNumber');
    const dateParam = url.searchParams.get('date');

    const conditions = ['tenant_id = $1'];
    const params = [user.tenantId];

    if (statusParam) {
      const s = statusParam.toUpperCase();
      if (s === 'UNPAID' || s === 'ACTIVE') {
        conditions.push(`status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID')`);
      } else if (s !== 'ALL') {
        params.push(s);
        conditions.push(`status = $${params.length}`);
      }
    }

    if (tableNumberParam) {
      params.push(parseInt(tableNumberParam, 10));
      conditions.push(`table_number = $${params.length}`);
    }

    if (dateParam && dateParam !== 'all') {
      params.push(dateParam);
      conditions.push(`(created_at AT TIME ZONE 'Asia/Kolkata')::date = $${params.length}::date`);
    }

    const query = `
      SELECT * FROM table_tokens
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT 150
    `;

    const res = await pool.query(query, params);
    const tokens = res.rows.map((r) => formatToken(r));

    sendJson(response, 200, {
      success: true,
      tokens,
    });
    return true;
  }

  // 3. GET /api/app/tokens/:id (Token Details)
  const tokenDetailMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)$/);
  if (request.method === 'GET' && tokenDetailMatch) {
    const tokenId = tokenDetailMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const tokenRes = await pool.query(
      `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2`,
      [tokenId, user.tenantId]
    );

    if (tokenRes.rows.length === 0) {
      throw apiError(404, 'Token not found.');
    }

    const itemsRes = await pool.query(
      `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
      [tokenId]
    );

    const formattedToken = formatToken(tokenRes.rows[0], itemsRes.rows);
    sendJson(response, 200, { success: true, token: formattedToken });
    return true;
  }

  // 4. POST /api/app/tokens/:id/items (Append Items to Active Dining Session)
  const appendItemsMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)\/items$/);
  if (request.method === 'POST' && appendItemsMatch) {
    const tokenId = appendItemsMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const body = await readJson(request);
    const rawItems = Array.isArray(body.items) ? body.items : [body];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [tokenId, user.tenantId]
      );

      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }

      const tokenRow = tokenRes.rows[0];
      const currentStatus = tokenRow.status.toUpperCase();
      if (['SETTLED', 'PAID', 'CLOSED', 'VOID'].includes(currentStatus)) {
        await client.query('ROLLBACK');
        throw apiError(409, 'Cannot add items to a settled, closed, or voided token.');
      }

      const addedItems = [];
      for (const item of rawItems) {
        const dishName = String(item.dishName || item.itemName || item.name || '').trim();
        if (!dishName) {
          await client.query('ROLLBACK');
          throw apiError(400, 'Dish name is required.');
        }
        const qty = parseInt(item.quantity, 10);
        if (isNaN(qty) || qty <= 0) {
          await client.query('ROLLBACK');
          throw apiError(400, 'Quantity must be greater than zero.');
        }
        const unitPricePaise = parseInt(
          item.unitPricePaise ?? item.pricePaise ?? (item.price ? Math.round(Number(item.price) * 100) : 0),
          10
        ) || 0;
        const totalPricePaise = qty * unitPricePaise;
        const isVeg = item.isVeg !== undefined ? Boolean(item.isVeg) : true;
        const variant = item.variant ? String(item.variant) : null;
        const menuItemId = item.menuItemId ? String(item.menuItemId) : null;
        const notes = item.notes ? String(item.notes) : null;

        const insertItemRes = await client.query(
          `INSERT INTO token_items (
            token_id, menu_item_id, item_name, variant, quantity,
            unit_price_paise, total_price_paise, is_veg, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [tokenId, menuItemId, dishName, variant, qty, unitPricePaise, totalPricePaise, isVeg, notes]
        );
        addedItems.push(insertItemRes.rows[0]);
      }

      // Fetch all items to recalculate totals
      const allItemsRes = await client.query(
        `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
        [tokenId]
      );
      const allItems = allItemsRes.rows;

      const newSubtotalPaise = allItems.reduce((acc, it) => acc + Number(it.total_price_paise || 0), 0);
      const newTaxPaise = Math.round(newSubtotalPaise * 0.05); // 5% GST
      const newTotalPaise = newSubtotalPaise + newTaxPaise - Number(tokenRow.discount_paise || 0) + Number(tokenRow.tip_paise || 0);

      // Transition status to ORDERING / DINING if still ISSUED
      const nextStatus = currentStatus === 'ISSUED' ? 'ORDERING' : tokenRow.status;

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET subtotal_paise = $1,
             tax_paise = $2,
             total_paise = $3,
             items_json = $4,
             status = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [newSubtotalPaise, newTaxPaise, newTotalPaise, JSON.stringify(allItems.map(formatTokenItem)), nextStatus, tokenId]
      );

      await client.query('COMMIT');

      const updatedToken = formatToken(updateRes.rows[0], allItems);

      // Broadcast to customer stream
      broadcastTokenStatus(tokenId, updatedToken);
      broadcastTokenItems(tokenId, updatedToken.items, {
        subtotalPaise: newSubtotalPaise,
        taxPaise: newTaxPaise,
        totalPaise: newTotalPaise,
      });

      // Broadcast to staff kitchen stream
      broadcastOrderEvent(user.tenantId, 'token_item_added', {
        tokenId,
        tokenNumber: updatedToken.tokenNumber,
        tableNumber: updatedToken.tableNumber,
        addedItems: addedItems.map(formatTokenItem),
        newTotalPaise,
        token: updatedToken,
      });

      sendJson(response, 200, { success: true, token: updatedToken });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // 5. POST /api/app/tokens/:id/status (Advance Lifecycle State)
  const statusMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)\/status$/);
  if (request.method === 'POST' && statusMatch) {
    const tokenId = statusMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const body = await readJson(request);
    const newStatus = String(body.status || '').toUpperCase().trim();
    const VALID_LIFECYCLE = new Set(['ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED']);
    if (!VALID_LIFECYCLE.has(newStatus)) {
      throw apiError(400, `Invalid lifecycle status transition: ${newStatus}`);
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [tokenId, user.tenantId]
      );
      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }
      const tokenRow = tokenRes.rows[0];
      if (['CLOSED', 'VOID', 'SETTLED', 'PAID'].includes(tokenRow.status.toUpperCase())) {
        await client.query('ROLLBACK');
        throw apiError(409, `Cannot change status of a ${tokenRow.status} token.`);
      }

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newStatus, tokenId]
      );
      await client.query('COMMIT');

      const itemsRes = await pool.query(
        `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
        [tokenId]
      );
      const updatedToken = formatToken(updateRes.rows[0], itemsRes.rows);

      broadcastTokenStatus(tokenId, updatedToken);
      if (newStatus === 'BILL_REQUESTED') {
        broadcastBillRequested(user.tenantId, updatedToken);
      }

      sendJson(response, 200, { success: true, token: updatedToken });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // 6. POST /api/app/tokens/:id/settle (Concurrency Double-Settle Guard)
  const settleMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)\/settle$/);
  if (request.method === 'POST' && settleMatch) {
    const tokenId = settleMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const body = await readJson(request);
    const paymentMethod = String(body.paymentMethod || body.method || '').toUpperCase().trim();
    if (!ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
      throw apiError(400, 'Invalid payment method. Supported methods: CASH, UPI, CARD.');
    }
    const paymentReference = body.paymentReference ? String(body.paymentReference).trim() : null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Row-level exclusive lock prevents concurrency race conditions
      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [tokenId, user.tenantId]
      );

      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }

      const tokenRow = tokenRes.rows[0];
      const currentStatus = tokenRow.status.toUpperCase();

      // Double-settlement check
      if (['SETTLED', 'PAID'].includes(currentStatus) || tokenRow.settled_at !== null) {
        await client.query('ROLLBACK');
        throw apiError(409, 'Conflict: Token is already settled.');
      }

      if (currentStatus === 'CLOSED') {
        await client.query('ROLLBACK');
        throw apiError(409, 'Conflict: Token is closed and cannot be settled.');
      }

      if (currentStatus === 'VOID') {
        await client.query('ROLLBACK');
        throw apiError(400, 'Cannot settle a voided token.');
      }

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET status = 'SETTLED',
             payment_method = $1,
             payment_reference = $2,
             settled_at = CURRENT_TIMESTAMP,
             settled_by_id = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [paymentMethod, paymentReference, user.id, tokenId]
      );

      await client.query('COMMIT');

      // Fetch restaurant Google review link
      const restaurantRow = await getRestaurantDetails(user.tenantId);

      const itemsRes = await pool.query(
        `SELECT * FROM token_items WHERE token_id = $1 ORDER BY created_at ASC`,
        [tokenId]
      );

      const updatedToken = formatToken(updateRes.rows[0], itemsRes.rows, restaurantRow);

      // 1. Broadcast to customer stream with review link
      broadcastTokenEvent(tokenId, 'token_settled', {
        tokenId,
        tokenNumber: updatedToken.tokenNumber,
        tableNumber: updatedToken.tableNumber,
        status: 'SETTLED',
        paymentMethod,
        totalPaise: updatedToken.totalPaise,
        settledAt: updatedToken.settledAt,
        googleReviewUrl: restaurantRow.google_review_url || null,
      });
      broadcastTokenStatus(tokenId, updatedToken);

      // 2. Broadcast to staff stream
      broadcastTokenSettled(user.tenantId, updatedToken);

      sendJson(response, 200, {
        success: true,
        token: updatedToken,
      });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // 7. POST /api/app/tokens/:id/close (Close Dining Session & Free Table)
  const closeMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)\/close$/);
  if (request.method === 'POST' && closeMatch) {
    const tokenId = closeMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [tokenId, user.tenantId]
      );

      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }

      const tokenRow = tokenRes.rows[0];
      const currentStatus = tokenRow.status.toUpperCase();

      if (currentStatus === 'CLOSED') {
        await client.query('ROLLBACK');
        throw apiError(400, 'Token is already closed.');
      }

      // Must be settled or void before closing
      if (!['SETTLED', 'PAID', 'VOID'].includes(currentStatus)) {
        await client.query('ROLLBACK');
        throw apiError(400, 'Cannot close an active token that has not been settled.');
      }

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET status = 'CLOSED',
             closed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [tokenId]
      );

      await client.query('COMMIT');

      const updatedToken = formatToken(updateRes.rows[0]);

      // 1. Broadcast to customer stream and disconnect clients
      broadcastTokenStatus(tokenId, updatedToken);
      closeTokenClients(tokenId);

      // 2. Broadcast to staff stream (table now vacated)
      broadcastTokenClosed(user.tenantId, updatedToken);

      sendJson(response, 200, {
        success: true,
        token: updatedToken,
      });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  // 8. POST /api/app/tokens/:id/void (Void Unsettled Token)
  const voidMatch = pathname.match(/^\/api\/app\/tokens\/([^/]+)\/void$/);
  if (request.method === 'POST' && voidMatch) {
    const tokenId = voidMatch[1];
    if (!UUID_REGEX.test(tokenId)) {
      throw apiError(404, 'Token not found.');
    }

    const body = await readJson(request);
    const reason = String(body.reason || '').trim();
    if (!reason) {
      throw apiError(400, 'Void reason is required.');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const tokenRes = await client.query(
        `SELECT * FROM table_tokens WHERE id = $1 AND tenant_id = $2 FOR UPDATE`,
        [tokenId, user.tenantId]
      );

      if (tokenRes.rows.length === 0) {
        await client.query('ROLLBACK');
        throw apiError(404, 'Token not found.');
      }

      const tokenRow = tokenRes.rows[0];
      const currentStatus = tokenRow.status.toUpperCase();

      if (currentStatus === 'CLOSED') {
        await client.query('ROLLBACK');
        throw apiError(409, 'Cannot void an already closed token.');
      }

      if (['SETTLED', 'PAID'].includes(currentStatus)) {
        await client.query('ROLLBACK');
        throw apiError(409, 'Cannot void a settled token.');
      }

      const voidNote = `[VOID: ${reason}]`;
      const updatedNotes = tokenRow.notes ? `${tokenRow.notes} ${voidNote}` : voidNote;

      const updateRes = await client.query(
        `UPDATE table_tokens
         SET status = 'VOID',
             notes = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [updatedNotes, tokenId]
      );

      await client.query('COMMIT');

      const updatedToken = formatToken(updateRes.rows[0]);

      broadcastTokenStatus(tokenId, updatedToken);
      closeTokenClients(tokenId);

      broadcastOrderEvent(user.tenantId, 'token_voided', {
        tokenId,
        tokenNumber: updatedToken.tokenNumber,
        tableNumber: updatedToken.tableNumber,
        status: 'VOID',
        reason,
      });

      sendJson(response, 200, { success: true, token: updatedToken });
      return true;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  }

  return false;
}

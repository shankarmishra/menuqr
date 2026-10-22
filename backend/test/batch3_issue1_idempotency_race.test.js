import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import publicRoutes from '../routes/public.js';

function mockRequest(method, body = null, headers = {}) {
  const req = body ? Readable.from([Buffer.from(JSON.stringify(body))]) : Readable.from([]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', ...headers };
  return req;
}

function mockResponse() {
  let statusCode = 200;
  let headers = {};
  let body = '';
  return {
    writeHead(status, hdrs) {
      statusCode = status;
      headers = hdrs || {};
    },
    end(str) {
      body = str || '';
    },
    get statusCode() { return statusCode; },
    get body() { return body; }
  };
}

test('Batch 3 #1: Concurrent idempotency race on customer_orders (20 parallel requests)', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const tenantId = `tenant_race_${timestamp}`;
  const menuSlug = `slug-race-${timestamp}`;
  const menuId = `menu_race_${timestamp}`;
  const catId = `cat_race_${timestamp}`;
  const itemId = `item_race_${timestamp}`;
  const idempotencyKey = `idem_race_key_${timestamp}`;

  // Setup test tenant with active Premium subscription and a menu item
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Race Diner', $3, 'active')`,
    [tenantId, `pub_${timestamp}`, menuSlug]
  );
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
    [`sub_${timestamp}`, tenantId]
  );
  await pool.query(
    `INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, 'Main Menu')`,
    [menuId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, 'Mains')`,
    [catId, menuId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Burger', 150, true)`,
    [itemId, menuId, tenantId, catId]
  );

  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  await t.test('20 parallel requests with same idempotency_key must create exactly 1 order in DB', async () => {
    const orderPayload = {
      orderType: 'DINE_IN',
      tableNumber: 'T-10',
      customerName: 'Parallel Tester',
      items: [{ id: itemId, quantity: 2 }],
      idempotencyKey,
    };

    // Fire 20 parallel requests simultaneously
    const requests = Array.from({ length: 20 }, () => {
      const req = mockRequest('POST', orderPayload);
      const res = mockResponse();
      return publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`))
        .then(() => ({ status: res.statusCode, data: JSON.parse(res.body) }));
    });

    const results = await Promise.all(requests);

    // All 20 requests must succeed with 200 or 201
    for (const r of results) {
      assert.ok([200, 201].includes(r.status), `Unexpected status ${r.status}`);
      assert.ok(r.data.id, 'Response must have order ID');
    }

    // All 20 responses must point to the EXACT same order ID
    const firstOrderId = results[0].data.id;
    for (const r of results) {
      assert.equal(r.data.id, firstOrderId, 'All concurrent requests must return the identical order ID');
    }

    // Check DB count for this tenant and idempotencyKey: MUST BE EXACTLY 1!
    const dbCountRes = await pool.query(
      'SELECT count(*)::int as count FROM customer_orders WHERE tenant_id = $1 AND idempotency_key = $2',
      [tenantId, idempotencyKey]
    );

    assert.equal(
      dbCountRes.rows[0].count,
      1,
      `RACE CONDITION DETECTED: Expected 1 order in database, but found ${dbCountRes.rows[0].count} duplicate orders!`
    );
  });
});

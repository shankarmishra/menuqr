import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import publicRoutes from '../routes/public.js';
import { getActiveListenerCount } from '../orderStream.js';

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

test('Comprehensive Multi-Angle Verification: Order Idempotency & Concurrency Audit', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const tenantA = `tenant_audit_a_${timestamp}`;
  const tenantB = `tenant_audit_b_${timestamp}`;
  const menuSlugA = `slug-audit-a-${timestamp}`;
  const menuSlugB = `slug-audit-b-${timestamp}`;
  const menuIdA = `menu_audit_a_${timestamp}`;
  const menuIdB = `menu_audit_b_${timestamp}`;
  const catIdA = `cat_audit_a_${timestamp}`;
  const catIdB = `cat_audit_b_${timestamp}`;
  const itemIdA = `item_audit_a_${timestamp}`;
  const itemIdB = `item_audit_b_${timestamp}`;

  // Provision Tenant A
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Audit Diner A', $3, 'active')`,
    [tenantA, `pub_a_${timestamp}`, menuSlugA]
  );
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
    [`sub_a_${timestamp}`, tenantA]
  );
  await pool.query(`INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, 'Main Menu')`, [menuIdA, tenantA]);
  await pool.query(`INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, 'Mains')`, [catIdA, menuIdA, tenantA]);
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Paneer Tikka', 250, true)`,
    [itemIdA, menuIdA, tenantA, catIdA]
  );

  // Provision Tenant B
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Audit Diner B', $3, 'active')`,
    [tenantB, `pub_b_${timestamp}`, menuSlugB]
  );
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
    [`sub_b_${timestamp}`, tenantB]
  );
  await pool.query(`INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, 'Main Menu')`, [menuIdB, tenantB]);
  await pool.query(`INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, 'Mains')`, [catIdB, menuIdB, tenantB]);
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Butter Chicken', 350, true)`,
    [itemIdB, menuIdB, tenantB, catIdB]
  );

  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
    await pool.query('DELETE FROM menus WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id IN ($1, $2)', [tenantA, tenantB]);
    await pool.query('DELETE FROM clients WHERE id IN ($1, $2)', [tenantA, tenantB]);
  });

  await t.test('Angle 1: Sequential retry with same idempotency key returns exact same order and 0 duplicate rows', async () => {
    const key = `key_seq_${timestamp}`;
    const payload = {
      orderType: 'DINE_IN',
      tableNumber: 'Table 4',
      customerName: 'Aman Sharma',
      customerPhone: '9876543210',
      items: [{ id: itemIdA, quantity: 1 }],
      idempotencyKey: key,
    };

    // First attempt
    const req1 = mockRequest('POST', payload);
    const res1 = mockResponse();
    await publicRoutes(req1, res1, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res1.statusCode, 201, 'First attempt must return 201 Created');
    const order1 = JSON.parse(res1.body);

    // Second attempt (retry)
    const req2 = mockRequest('POST', payload);
    const res2 = mockResponse();
    await publicRoutes(req2, res2, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res2.statusCode, 200, 'Second attempt must return 200 OK');
    const order2 = JSON.parse(res2.body);

    assert.equal(order1.id, order2.id, 'Both responses must return identical order ID');
    assert.equal(order1.total, order2.total, 'Both responses must return identical total');

    // DB row count verification
    const dbCount = await pool.query('SELECT COUNT(*) FROM customer_orders WHERE tenant_id = $1 AND idempotency_key = $2', [tenantA, key]);
    assert.equal(parseInt(dbCount.rows[0].count, 10), 1, 'Database must have exactly 1 record for this key');
  });

  await t.test('Angle 2: Extreme Concurrency (15 parallel requests at the exact same millisecond)', async () => {
    const key = `key_concurrent_${timestamp}`;
    const payload = {
      orderType: 'DINE_IN',
      tableNumber: 'Table 9',
      customerName: 'High Concurrency Tester',
      customerPhone: '9876543210',
      items: [{ id: itemIdA, quantity: 2 }],
      idempotencyKey: key,
    };

    const promises = Array.from({ length: 15 }, () => {
      const req = mockRequest('POST', payload);
      const res = mockResponse();
      return publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`))
        .then(() => ({ status: res.statusCode, body: JSON.parse(res.body) }));
    });

    const results = await Promise.all(promises);

    // Verify all 15 received valid response (either 201 for the winner or 200 for the deduplicated concurrent requests)
    for (const r of results) {
      assert.ok([200, 201].includes(r.status), `Unexpected HTTP status ${r.status}`);
      assert.ok(r.body.id, 'Response must contain order ID');
    }

    const firstId = results[0].body.id;
    for (const r of results) {
      assert.equal(r.body.id, firstId, 'Every concurrent request must resolve to the identical order ID');
    }

    // Verify DB count
    const dbCheck = await pool.query('SELECT COUNT(*) FROM customer_orders WHERE tenant_id = $1 AND idempotency_key = $2', [tenantA, key]);
    assert.equal(parseInt(dbCheck.rows[0].count, 10), 1, 'DB must contain strictly 1 row despite 15 concurrent hits');
  });

  await t.test('Angle 3: Synthetic Idempotency Fallback (When client omits idempotencyKey completely)', async () => {
    // Client sends request WITHOUT idempotencyKey
    const payloadWithoutKey = {
      orderType: 'DINE_IN',
      tableNumber: 'Table 12',
      customerName: 'Omitted Key User',
      customerPhone: '9811122233',
      items: [{ id: itemIdA, quantity: 1 }],
      // NO idempotencyKey provided
    };

    // First request
    const req1 = mockRequest('POST', payloadWithoutKey);
    const res1 = mockResponse();
    await publicRoutes(req1, res1, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res1.statusCode, 201, 'First order must succeed with 201');
    const order1 = JSON.parse(res1.body);

    // Second request within 2 seconds (simulating double-tap on slow 3G network)
    const req2 = mockRequest('POST', payloadWithoutKey);
    const res2 = mockResponse();
    await publicRoutes(req2, res2, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res2.statusCode, 200, 'Duplicate double-tap must be caught by synthetic deduplication with 200 OK');
    const order2 = JSON.parse(res2.body);

    assert.equal(order1.id, order2.id, 'Synthetic deduplication must return the original order ID');
  });

  await t.test('Angle 4: Tenant Scoping Isolation (Same key across different restaurants must NOT collide)', async () => {
    const sharedKey = `cross_tenant_shared_key_${timestamp}`;

    // Tenant A places order with sharedKey
    const reqA = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 1',
      customerName: 'Tenant A Guest',
      items: [{ id: itemIdA, quantity: 1 }],
      idempotencyKey: sharedKey,
    });
    const resA = mockResponse();
    await publicRoutes(reqA, resA, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(resA.statusCode, 201, 'Tenant A order must succeed with 201');
    const orderA = JSON.parse(resA.body);

    // Tenant B places order with the EXACT same sharedKey
    const reqB = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 1',
      customerName: 'Tenant B Guest',
      items: [{ id: itemIdB, quantity: 1 }],
      idempotencyKey: sharedKey,
    });
    const resB = mockResponse();
    await publicRoutes(reqB, resB, new URL(`http://localhost/api/public/menus/${menuSlugB}/orders`));
    assert.equal(resB.statusCode, 201, 'Tenant B order must also succeed with 201 (tenant isolated)');
    const orderB = JSON.parse(resB.body);

    assert.notEqual(orderA.id, orderB.id, 'Tenant A and Tenant B must have separate orders despite identical idempotencyKey');
  });

  await t.test('Angle 5: Legitimate Follow-Up Order with different key creates new distinct order', async () => {
    const key1 = `followup_key_1_${timestamp}`;
    const key2 = `followup_key_2_${timestamp}`;

    const req1 = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 5',
      customerName: 'Rohan Mehra',
      items: [{ id: itemIdA, quantity: 1 }],
      idempotencyKey: key1,
    });
    const res1 = mockResponse();
    await publicRoutes(req1, res1, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res1.statusCode, 201);
    const order1 = JSON.parse(res1.body);

    // Follow up order with new key
    const req2 = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 5',
      customerName: 'Rohan Mehra',
      items: [{ id: itemIdA, quantity: 2 }],
      idempotencyKey: key2,
    });
    const res2 = mockResponse();
    await publicRoutes(req2, res2, new URL(`http://localhost/api/public/menus/${menuSlugA}/orders`));
    assert.equal(res2.statusCode, 201);
    const order2 = JSON.parse(res2.body);

    assert.notEqual(order1.id, order2.id, 'Distinct idempotency keys must create distinct orders');
  });
});

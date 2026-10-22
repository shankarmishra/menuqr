import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import publicRoutes from '../routes/public.js';
import appRoutes from '../routes/app.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run tests.');
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    end(data) {
      res.body = data;
    }
  };
  return res;
}

function mockRequest(method, body = null, headers = {}) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    async *[Symbol.asyncIterator]() {
      if (body) {
        yield Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
      }
    }
  };
  return req;
}

test('Order Flow End-to-End: Dine-In & Delivery with Client Reception Panel', async (t) => {
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-orderflow-${runId}`;
  const userId = `user-orderflow-${runId}`;
  const menuSlug = `slug-orderflow-${runId}`;
  const menuId = randomUUID();
  const catId = randomUUID();
  const itemId = randomUUID();

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);

    // Create client with PREMIUM plan (last tier)
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Royal Gourmet Cafe', $3, 'active')",
      [tenantId, `pub-${runId}`, menuSlug]
    );
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')",
      [userId, `owner-${runId}@example.com`, tenantId]
    );
    await pool.query(
      "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
      [randomUUID(), tenantId]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Main Menu', 'PUBLISHED')",
      [menuId, tenantId]
    );
    await pool.query(
      "INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, 'Burgers & Pizzas', 1)",
      [catId, menuId, tenantId]
    );
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, is_available) VALUES ($1, $2, $3, $4, 'Farmhouse Pizza', 'Fresh veggies and mozzarella', 350, true)",
      [itemId, menuId, tenantId, catId]
    );
  });

  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  let dineInOrderId = '';
  let deliveryOrderId = '';

  await t.test('1. Dine-In Order: requires Table Number, accepts Name, Phone, and notes', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 4',
      customerName: 'Aarav Sharma',
      customerPhone: '9876543210',
      notes: 'Please bring extra napkins',
      items: [{ id: itemId, quantity: 2 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 201);

    const body = JSON.parse(res.body);
    assert.strictEqual(body.orderType, 'DINE_IN');
    assert.strictEqual(body.tableNumber, 'Table 4');
    assert.strictEqual(body.customerName, 'Aarav Sharma');
    assert.strictEqual(body.customerPhone, '9876543210');
    assert.strictEqual(body.notes, 'Please bring extra napkins');
    assert.strictEqual(body.total, 700);
    assert.strictEqual(body.status, 'NEW');
    dineInOrderId = body.id;
  });

  await t.test('2. Delivery Order: rejects if address is missing or phone is invalid', async () => {
    // Missing address
    const req1 = mockRequest('POST', {
      orderType: 'DELIVERY',
      customerName: 'Pooja Verma',
      customerPhone: '9876543210',
      items: [{ id: itemId, quantity: 1 }]
    });
    const res1 = mockResponse();
    await assert.rejects(
      async () => publicRoutes(req1, res1, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`)),
      (err) => err.status === 400 && err.message.includes('address')
    );

    // Invalid phone
    const req2 = mockRequest('POST', {
      orderType: 'DELIVERY',
      customerName: 'Pooja Verma',
      customerPhone: '123',
      deliveryAddress: 'Flat 402, Sunshine Apartments, MG Road',
      items: [{ id: itemId, quantity: 1 }]
    });
    const res2 = mockResponse();
    await assert.rejects(
      async () => publicRoutes(req2, res2, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`)),
      (err) => err.status === 400 && err.message.includes('10-digit')
    );
  });

  await t.test('3. Delivery Order: accepts full address, landmark, city, and contact details', async () => {
    const req = mockRequest('POST', {
      orderType: 'DELIVERY',
      customerName: 'Pooja Verma',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 402, Sunshine Heights, Civil Lines',
      deliveryLandmark: 'Opposite Metro Pillar 14',
      deliveryCity: 'Jaipur',
      notes: 'Call on arrival, do not ring bell',
      items: [{ id: itemId, quantity: 1 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 201);

    const body = JSON.parse(res.body);
    assert.strictEqual(body.orderType, 'DELIVERY');
    assert.strictEqual(body.customerName, 'Pooja Verma');
    assert.strictEqual(body.customerPhone, '9876543210');
    assert.strictEqual(body.deliveryAddress, 'Flat 402, Sunshine Heights, Civil Lines');
    assert.strictEqual(body.deliveryLandmark, 'Opposite Metro Pillar 14');
    assert.strictEqual(body.deliveryCity, 'Jaipur');
    assert.strictEqual(body.total, 350);
    assert.strictEqual(body.status, 'NEW');
    deliveryOrderId = body.id;
  });

  await t.test('4. Public Order Status Tracking endpoint returns real-time order state', async () => {
    const req = mockRequest('GET');
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/orders/${deliveryOrderId}`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 200);

    const body = JSON.parse(res.body);
    assert.strictEqual(body.id, deliveryOrderId);
    assert.strictEqual(body.status, 'NEW');
    assert.strictEqual(body.restaurantName, 'Royal Gourmet Cafe');
  });

  await t.test('5. Reception Dashboard: app receives orders with all Dine-in & Delivery details', async () => {
    const { generateAuthToken } = await import('../auth.js');
    const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });
    const req = mockRequest('GET', null, { cookie: `menusqr_auth=${token}` });
    const res = mockResponse();
    const handled = await appRoutes(req, res, new URL('http://localhost/api/app/orders'));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 200);

    const orders = JSON.parse(res.body);
    assert(orders.length >= 2);

    const dineIn = orders.find(o => o.id === dineInOrderId);
    assert(dineIn);
    assert.strictEqual(dineIn.orderType, 'DINE_IN');
    assert.strictEqual(dineIn.tableNumber, 'Table 4');
    assert.strictEqual(dineIn.customerName, 'Aarav Sharma');

    const delivery = orders.find(o => o.id === deliveryOrderId);
    assert(delivery);
    assert.strictEqual(delivery.orderType, 'DELIVERY');
    assert.strictEqual(delivery.deliveryAddress, 'Flat 402, Sunshine Heights, Civil Lines');
    assert.strictEqual(delivery.customerPhone, '9876543210');
  });

  await t.test('6. Reception Dashboard: updates status through lifecycle to DELIVERED / COMPLETED', async () => {
    const { generateAuthToken } = await import('../auth.js');
    const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });

    // Accept
    const req1 = mockRequest('PATCH', { status: 'ACCEPTED' }, { cookie: `menusqr_auth=${token}` });
    const res1 = mockResponse();
    await appRoutes(req1, res1, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(JSON.parse(res1.body).status, 'ACCEPTED');

    // Preparing
    const req2 = mockRequest('PATCH', { status: 'PREPARING' }, { cookie: `menusqr_auth=${token}` });
    const res2 = mockResponse();
    await appRoutes(req2, res2, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(JSON.parse(res2.body).status, 'PREPARING');

    // Ready
    const req3 = mockRequest('PATCH', { status: 'READY' }, { cookie: `menusqr_auth=${token}` });
    const res3 = mockResponse();
    await appRoutes(req3, res3, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
    assert.strictEqual(res3.statusCode, 200);
    assert.strictEqual(JSON.parse(res3.body).status, 'READY');

    // Delivered
    const req4 = mockRequest('PATCH', { status: 'DELIVERED' }, { cookie: `menusqr_auth=${token}` });
    const res4 = mockResponse();
    await appRoutes(req4, res4, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
    assert.strictEqual(res4.statusCode, 200);
    assert.strictEqual(JSON.parse(res4.body).status, 'DELIVERED');
  });

  await t.test('7. Idempotency Protection: retrying with same idempotency key returns existing order without duplicates', async () => {
    const key = 'idem-unique-key-998811';
    const payload = {
      orderType: 'DINE_IN',
      tableNumber: 'Table 99',
      customerName: 'Test Idempotency',
      customerPhone: '9876543210',
      idempotencyKey: key,
      items: [{ id: itemId, quantity: 1 }]
    };

    const req1 = mockRequest('POST', payload);
    const res1 = mockResponse();
    await publicRoutes(req1, res1, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(res1.statusCode, 201);
    const order1 = JSON.parse(res1.body);

    // Second submission with same idempotency key
    const req2 = mockRequest('POST', payload);
    const res2 = mockResponse();
    await publicRoutes(req2, res2, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(res2.statusCode, 200);
    const order2 = JSON.parse(res2.body);

    assert.strictEqual(order1.id, order2.id, 'Idempotent retry must return the exact same order ID');
    assert.strictEqual(order1.total, order2.total);
  });

  await t.test('8. Public Order Tracking Privacy: masks sensitive data when token is missing; unmasks with valid token', async () => {
    // 1. Fetch without token: phone must be masked, delivery address must be hidden
    const reqWithoutToken = mockRequest('GET');
    const resWithoutToken = mockResponse();
    await publicRoutes(reqWithoutToken, resWithoutToken, new URL(`http://localhost/api/public/orders/${deliveryOrderId}`));
    assert.strictEqual(resWithoutToken.statusCode, 200);
    const masked = JSON.parse(resWithoutToken.body);
    assert.strictEqual(masked.deliveryAddress, 'Address hidden for privacy');
    assert(masked.customerPhone.includes('******'), 'Customer phone must be masked');
    assert.strictEqual(masked.trackingToken, undefined, 'Tracking token must not be leaked');

    // 2. Fetch with valid token
    const dbOrder = (await pool.query('SELECT tracking_token FROM customer_orders WHERE id = $1', [deliveryOrderId])).rows[0];
    const reqWithToken = mockRequest('GET');
    const resWithToken = mockResponse();
    await publicRoutes(reqWithToken, resWithToken, new URL(`http://localhost/api/public/orders/${deliveryOrderId}?token=${dbOrder.tracking_token}`));
    assert.strictEqual(resWithToken.statusCode, 200);
    const unmasked = JSON.parse(resWithToken.body);
    assert.strictEqual(unmasked.deliveryAddress, 'Flat 402, Sunshine Heights, Civil Lines');
    assert.strictEqual(unmasked.customerPhone, '9876543210');
  });

  await t.test('9. State Machine Enforcement: invalid status transitions are rejected with 400 Bad Request', async () => {
    const { generateAuthToken } = await import('../auth.js');
    const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });

    // deliveryOrderId is already DELIVERED (terminal status). Attempting to move it back to NEW or PREPARING must fail.
    const invalidReq = mockRequest('PATCH', { status: 'PREPARING' }, { cookie: `menusqr_auth=${token}` });
    const invalidRes = mockResponse();
    await assert.rejects(
      async () => {
        await appRoutes(invalidReq, invalidRes, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
      },
      (err) => err.status === 400 && err.message.includes('Cannot transition order')
    );
  });

  await t.test('10. Variant Validity Enforcement: unconfigured variant names are rejected', async () => {
    const payload = {
      orderType: 'DINE_IN',
      tableNumber: 'Table 7',
      customerName: 'Aarav',
      customerPhone: '9876543210',
      items: [{ id: itemId, quantity: 1, variant: 'NonExistentGoldVariant' }]
    };

    const req = mockRequest('POST', payload);
    const res = mockResponse();
    await assert.rejects(
      async () => {
        await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
      },
      (err) => err.status === 400 && err.message.includes('Invalid variant')
    );
  });

  await t.test('11. Cross-Tenant Isolation: other tenant cannot view or mutate foreign orders', async () => {
    const { generateAuthToken } = await import('../auth.js');
    const otherTenantId = 'other-tenant-' + Date.now();
    const otherUserId = 'other-user-' + Date.now();
    await pool.query(
      `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Other Cafe', $3, 'active')`,
      [otherTenantId, 'pub-other-' + Date.now(), 'other-slug-' + Date.now()]
    );
    await pool.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
      ['sub-other-' + Date.now(), otherTenantId]
    );
    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')`,
      [otherUserId, 'other-' + Date.now() + '@test.com', otherTenantId]
    );
    const otherToken = generateAuthToken({ id: otherUserId, role: 'RESTAURANT_OWNER', tenantId: otherTenantId });

    // Other tenant querying orders: must not see deliveryOrderId
    const getReq = mockRequest('GET', null, { cookie: `menusqr_auth=${otherToken}` });
    const getRes = mockResponse();
    await appRoutes(getReq, getRes, new URL('http://localhost/api/app/orders'));
    assert.strictEqual(getRes.statusCode, 200);
    const otherOrders = JSON.parse(getRes.body);
    assert(!otherOrders.some(o => o.id === deliveryOrderId));

    // Other tenant attempting to update deliveryOrderId status: must return 404
    const patchReq = mockRequest('PATCH', { status: 'CANCELLED' }, { cookie: `menusqr_auth=${otherToken}` });
    const patchRes = mockResponse();
    await assert.rejects(
      async () => {
        await appRoutes(patchReq, patchRes, new URL(`http://localhost/api/app/orders/${deliveryOrderId}/status`));
      },
      (err) => err.status === 404
    );

    // Clean up other tenant
    await pool.query('DELETE FROM users WHERE id = $1', [otherUserId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [otherTenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [otherTenantId]);
  });

  await t.test('12. Downgrade / Expiry Preservation: expired restaurant can still view orders, but new orders blocked', async () => {
    // Expire subscription
    await pool.query(
      `UPDATE subscriptions SET status = 'EXPIRED', expires_at = NOW() - INTERVAL '1 DAY' WHERE tenant_id = $1`,
      [tenantId]
    );

    // Public new order must be blocked with 403
    const newOrderReq = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 1',
      customerName: 'Late Guest',
      customerPhone: '9876543210',
      items: [{ id: itemId, quantity: 1 }]
    });
    const newOrderRes = mockResponse();
    await assert.rejects(
      async () => {
        await publicRoutes(newOrderReq, newOrderRes, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
      },
      (err) => err.status === 403
    );

    // Restaurant staff must STILL be able to view their existing orders
    const { generateAuthToken } = await import('../auth.js');
    const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });
    const getReq = mockRequest('GET', null, { cookie: `menusqr_auth=${token}` });
    const getRes = mockResponse();
    await assert.rejects(
      async () => {
        await appRoutes(getReq, getRes, new URL('http://localhost/api/app/orders'));
      },
      (err) => err.status === 403
    );
    const dbOrders = await pool.query('SELECT id FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    assert(dbOrders.rows.length >= 2, 'Existing orders must be preserved');
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import publicRoutes from '../routes/public.js';
import appRoutes from '../routes/app.js';
import { generateAuthToken } from '../auth.js';

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

test('Comprehensive User Flow Verification: Account Setup, Socials, Card Removal, No Gateway, Reception Time Setting, and Customer Delivery Countdown', async (t) => {
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-flowchk-${runId}`;
  const userId = `user-flowchk-${runId}`;
  const menuSlug = `slug-flowchk-${runId}`;
  const menuId = randomUUID();
  const catId = randomUUID();
  const itemId = randomUUID();

  const authToken = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });
  const authHeaders = { cookie: `menusqr_auth=${authToken}` };

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);

    // Initial provisioned client (e.g. fresh subscription)
    await pool.query(
      `INSERT INTO clients (id, public_id, business_name, menu_slug, status) 
       VALUES ($1, $2, 'Mannat Fine Dining', $3, 'active')`,
      [tenantId, `pub-${runId}`, menuSlug]
    );

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) 
       VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')`,
      [userId, `owner-${runId}@example.com`, tenantId]
    );

    await pool.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) 
       VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')`,
      [randomUUID(), tenantId]
    );

    await pool.query(
      `INSERT INTO menus (id, tenant_id, name, status) 
       VALUES ($1, $2, 'Signature Menu', 'PUBLISHED')`,
      [menuId, tenantId]
    );

    await pool.query(
      `INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) 
       VALUES ($1, $2, $3, 'Main Course', 1)`,
      [catId, menuId, tenantId]
    );

    await pool.query(
      `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, is_available) 
       VALUES ($1, $2, $3, $4, 'Paneer Tikka Butter Masala', 'Charcoal grilled cottage cheese', 380, true)`,
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

  let createdOrderId = '';
  let trackingToken = '';

  await t.test('Step 1: Restaurant completes Account Setup with optional Instagram, Facebook, and Website', async () => {
    const updateReq = mockRequest('PATCH', {
      businessName: 'Mannat Heritage Restaurant',
      tagline: 'Authentic Indian Flavours',
      cuisine: 'North Indian & Mughlai',
      openingHours: '11:00 AM - 11:30 PM',
      phone: '9876500000',
      address: 'Plot 42, Kings Avenue, Civil Lines',
      city: 'New Delhi',
      state: 'Delhi',
      instagram: 'mannatheritage',
      facebook: 'mannat.delhi',
      website: 'https://mannat.example.com'
    }, authHeaders);

    const updateRes = mockResponse();
    const handled = await appRoutes(updateReq, updateRes, new URL('http://localhost/api/app/settings'));
    assert.strictEqual(handled, true);
    assert.strictEqual(updateRes.statusCode, 200);

    const updated = JSON.parse(updateRes.body);
    assert.strictEqual(updated.businessName, 'Mannat Heritage Restaurant');
    assert.strictEqual(updated.cuisine, 'North Indian & Mughlai');
    assert.strictEqual(updated.openingHours, '11:00 AM - 11:30 PM');
    assert.strictEqual(updated.instagram, 'mannatheritage');
    assert.strictEqual(updated.facebook, 'mannat.delhi');
    assert.strictEqual(updated.website, 'https://mannat.example.com');
  });

  await t.test('Step 2: Public Digital Menu returns social links & restaurant details to customer', async () => {
    const pubReq = mockRequest('GET');
    const pubRes = mockResponse();
    const handled = await publicRoutes(pubReq, pubRes, new URL(`http://localhost/api/public/menus/${menuSlug}`));
    assert.strictEqual(handled, true);
    assert.strictEqual(pubRes.statusCode, 200);

    const publicMenu = JSON.parse(pubRes.body);
    assert.strictEqual(publicMenu.restaurant.name, 'Mannat Heritage Restaurant');
    assert.strictEqual(publicMenu.restaurant.cuisine, 'North Indian & Mughlai');
    assert.strictEqual(publicMenu.restaurant.instagram, 'mannatheritage');
    assert.strictEqual(publicMenu.restaurant.facebook, 'mannat.delhi');
    assert.strictEqual(publicMenu.restaurant.website, 'https://mannat.example.com');
    assert.strictEqual(publicMenu.orderingEnabled, true);
  });

  await t.test('Step 3: Customer places order directly without payment gateway (Pay on Delivery)', async () => {
    const orderPayload = {
      orderType: 'DELIVERY',
      customerName: 'Kunal Kapoor',
      customerPhone: '9876543210',
      deliveryAddress: 'Flat 502, Tower B, Cyber City Residences',
      deliveryLandmark: 'Near Metro Gate 3',
      deliveryCity: 'New Delhi',
      notes: 'Please provide extra green chutney',
      items: [{ id: itemId, quantity: 2 }] // Total = 760
    };

    const orderReq = mockRequest('POST', orderPayload);
    const orderRes = mockResponse();
    const handled = await publicRoutes(orderReq, orderRes, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(orderRes.statusCode, 201);

    const order = JSON.parse(orderRes.body);
    assert.strictEqual(order.orderType, 'DELIVERY');
    assert.strictEqual(order.customerName, 'Kunal Kapoor');
    assert.strictEqual(order.customerPhone, '9876543210');
    assert.strictEqual(order.total, 760);
    assert.strictEqual(order.status, 'NEW');
    assert.strictEqual(order.estimatedTimeMinutes, null);
    assert(order.trackingToken, 'Tracking token must be returned for live status tracking');

    createdOrderId = order.id;
    trackingToken = order.trackingToken;
  });

  await t.test('Step 4: Restaurant views incoming order on Reception Dashboard (/app/orders)', async () => {
    const listReq = mockRequest('GET', null, authHeaders);
    const listRes = mockResponse();
    const handled = await appRoutes(listReq, listRes, new URL('http://localhost/api/app/orders'));
    assert.strictEqual(handled, true);
    assert.strictEqual(listRes.statusCode, 200);

    const orders = JSON.parse(listRes.body);
    const target = orders.find(o => o.id === createdOrderId);
    assert(target, 'Order must be present in restaurant reception list');
    assert.strictEqual(target.status, 'NEW');
    assert.strictEqual(target.customerName, 'Kunal Kapoor');
    assert.strictEqual(target.deliveryAddress, 'Flat 502, Tower B, Cyber City Residences');
    assert.strictEqual(target.notes, 'Please provide extra green chutney');
  });

  await t.test('Step 5: Restaurant accepts order AND sets Estimated Delivery Time to 35 minutes', async () => {
    const acceptReq = mockRequest('PATCH', {
      status: 'ACCEPTED',
      estimatedTimeMinutes: 35
    }, authHeaders);

    const acceptRes = mockResponse();
    const handled = await appRoutes(acceptReq, acceptRes, new URL(`http://localhost/api/app/orders/${createdOrderId}/status`));
    assert.strictEqual(handled, true);
    assert.strictEqual(acceptRes.statusCode, 200);

    const accepted = JSON.parse(acceptRes.body);
    assert.strictEqual(accepted.status, 'ACCEPTED');
    assert.strictEqual(accepted.estimatedTimeMinutes, 35);
    assert(accepted.estimatedDeliveryTime, 'estimatedDeliveryTime timestamp must be calculated');

    const expectedTime = new Date(accepted.estimatedDeliveryTime).getTime();
    const now = Date.now();
    const diffMinutes = Math.round((expectedTime - now) / 60000);
    assert(diffMinutes >= 34 && diffMinutes <= 36, `Estimated delivery should be ~35 mins in future, got ${diffMinutes}`);
  });

  await t.test('Step 6: Customer live tracking receives the 35 minutes delivery countdown', async () => {
    const trackReq = mockRequest('GET');
    const trackRes = mockResponse();
    const handled = await publicRoutes(trackReq, trackRes, new URL(`http://localhost/api/public/orders/${createdOrderId}?token=${trackingToken}`));
    assert.strictEqual(handled, true);
    assert.strictEqual(trackRes.statusCode, 200);

    const trackData = JSON.parse(trackRes.body);
    assert.strictEqual(trackData.id, createdOrderId);
    assert.strictEqual(trackData.status, 'ACCEPTED');
    assert.strictEqual(trackData.estimatedTimeMinutes, 35);
    assert(trackData.estimatedDeliveryTime, 'Customer must receive estimatedDeliveryTime for countdown display');
  });

  await t.test('Step 7: Restaurant adjusts delivery time when kitchen is busier (e.g. 50 minutes)', async () => {
    const adjustReq = mockRequest('PATCH', {
      estimatedTimeMinutes: 50
    }, authHeaders);

    const adjustRes = mockResponse();
    const handled = await appRoutes(adjustReq, adjustRes, new URL(`http://localhost/api/app/orders/${createdOrderId}/time`));
    assert.strictEqual(handled, true);
    assert.strictEqual(adjustRes.statusCode, 200);

    const adjusted = JSON.parse(adjustRes.body);
    assert.strictEqual(adjusted.id, createdOrderId);
    assert.strictEqual(adjusted.estimatedTimeMinutes, 50);

    // Verify customer live polling immediately reflects the adjusted 50 mins
    const trackReq = mockRequest('GET');
    const trackRes = mockResponse();
    await publicRoutes(trackReq, trackRes, new URL(`http://localhost/api/public/orders/${createdOrderId}?token=${trackingToken}`));
    const trackData = JSON.parse(trackRes.body);
    assert.strictEqual(trackData.estimatedTimeMinutes, 50);
  });

  await t.test('Step 8: Order progresses through PREPARING -> READY -> DELIVERED lifecycle', async () => {
    // 1. Preparing
    const prepReq = mockRequest('PATCH', { status: 'PREPARING' }, authHeaders);
    const prepRes = mockResponse();
    await appRoutes(prepReq, prepRes, new URL(`http://localhost/api/app/orders/${createdOrderId}/status`));
    assert.strictEqual(prepRes.statusCode, 200);

    // 2. Ready (Out for delivery)
    const readyReq = mockRequest('PATCH', { status: 'READY' }, authHeaders);
    const readyRes = mockResponse();
    await appRoutes(readyReq, readyRes, new URL(`http://localhost/api/app/orders/${createdOrderId}/status`));
    assert.strictEqual(readyRes.statusCode, 200);

    // 3. Delivered (Order complete, customer pays cash/UPI)
    const delivReq = mockRequest('PATCH', { status: 'DELIVERED' }, authHeaders);
    const delivRes = mockResponse();
    await appRoutes(delivReq, delivRes, new URL(`http://localhost/api/app/orders/${createdOrderId}/status`));
    assert.strictEqual(delivRes.statusCode, 200);

    // Customer status reflects DELIVERED
    const trackReq = mockRequest('GET');
    const trackRes = mockResponse();
    await publicRoutes(trackReq, trackRes, new URL(`http://localhost/api/public/orders/${createdOrderId}?token=${trackingToken}`));
    const trackData = JSON.parse(trackRes.body);
    assert.strictEqual(trackData.status, 'DELIVERED');
  });
});

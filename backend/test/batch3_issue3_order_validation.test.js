import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import publicRoutes from '../routes/public.js';
import appRoutes from '../routes/app.js';
import { generateAuthToken } from '../auth.js';

function mockRequest(method, body = null, headers = {}, remoteAddress = '198.51.100.10') {
  const req = body ? Readable.from([Buffer.from(JSON.stringify(body))]) : Readable.from([]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', ...headers };
  req.socket = { remoteAddress };
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

test('Batch 3 #3: Order validation, server-side pricing, quantity bounds, and addon kitchen visibility', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const tenantId = `tenant_order_val_${timestamp}`;
  const menuSlug = `menu-val-${timestamp}`;
  const menuId = `menu_val_${timestamp}`;
  const catId = `cat_val_${timestamp}`;
  const itemId = `item_val_${timestamp}`;
  const addonGroupId = `group_val_${timestamp}`;
  const addonOptionId = `opt_val_${timestamp}`;
  const disabledOptionId = `opt_disabled_${timestamp}`;
  const userId = `user_val_${timestamp}`;

  // 1. Setup tenant, user, menu, category, item, and addons
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Order Validation Diner', $3, 'active')`,
    [tenantId, `pub_${timestamp}`, menuSlug]
  );
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
    [`sub_${timestamp}`, tenantId]
  );
  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1, $2, 'hash', 'RESTAURANT_OWNER', $3, 'COMPLETED')`,
    [userId, `owner_${timestamp}@example.com`, tenantId]
  );
  await pool.query(
    `INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, 'Main Menu')`,
    [menuId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, 'Burgers')`,
    [catId, menuId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Burger Supreme', 150.00, true)`,
    [itemId, menuId, tenantId, catId]
  );
  await pool.query(
    `INSERT INTO menu_item_addon_groups (id, menu_item_id, tenant_id, name, is_required, min_select, max_select)
     VALUES ($1, $2, $3, 'Toppings', false, 0, 3)`,
    [addonGroupId, itemId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available)
     VALUES ($1, $2, $3, 'Extra Truffle Cheese', 45.00, true)`,
    [addonOptionId, addonGroupId, tenantId]
  );
  await pool.query(
    `INSERT INTO menu_item_addon_options (id, addon_group_id, tenant_id, name, price, is_available)
     VALUES ($1, $2, $3, 'Sold Out Bacon', 60.00, false)`,
    [disabledOptionId, addonGroupId, tenantId]
  );

  const ownerToken = generateAuthToken({ id: userId, email: `owner_${timestamp}@example.com`, role: 'RESTAURANT_OWNER', tenantId });

  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_item_addon_options WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_item_addon_groups WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  // TEST 1: Quantity validation rejects non-integer, zero, negative, and excessive quantities
  await t.test('Quantity validation strictly requires integer between 1 and 50', async () => {
    const invalidQuantities = [0, -1, 1.5, 0.5, 51, 1000, 'invalid'];

    for (const badQty of invalidQuantities) {
      const req = mockRequest('POST', {
        orderType: 'DINE_IN',
        tableNumber: 'T-1',
        customerName: 'Test Diner',
        items: [{ id: itemId, quantity: badQty }]
      });
      const res = mockResponse();

      await assert.rejects(
        async () => publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`)),
        (err) => err.status === 400 && (err.message.includes('quantity') || err.message.includes('Quantity')),
        `Quantity ${badQty} must be rejected with 400 Bad Request`
      );
    }
  });

  // TEST 2: Client-manipulated price or total is ignored; server calculates authoritative total
  await t.test('Server ignores client-submitted price and total, calculates strictly from DB', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'T-1',
      customerName: 'Tamper Tester',
      items: [{ id: itemId, quantity: 2, price: 1.00 }], // Item costs 150, client claims 1
      total: 2.00 // Client claims total is 2
    });
    const res = mockResponse();

    await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.equal(res.statusCode, 201);

    const orderData = JSON.parse(res.body);
    // 2 * 150 = 300
    assert.equal(orderData.total, 300, 'Server must calculate authoritative total 300, ignoring client tampered 2.00');

    // Verify in DB
    const dbOrder = await pool.query('SELECT total, items FROM customer_orders WHERE id = $1', [orderData.id]);
    assert.equal(parseFloat(dbOrder.rows[0].total), 300.00);
    assert.equal(dbOrder.rows[0].items[0].price, 150.00);
  });

  // TEST 3: Add-on prices calculated server-side and recorded for kitchen reception visibility
  await t.test('Add-on prices are verified in DB, added to server total, and visible to kitchen', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'T-2',
      customerName: 'Gourmet Lover',
      items: [
        {
          id: itemId,
          quantity: 2,
          addons: [
            { id: addonOptionId, price: 0 } // Client claims addon is free
          ]
        }
      ],
      total: 100 // Client claims 100
    });
    const res = mockResponse();

    await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.equal(res.statusCode, 201);

    const orderData = JSON.parse(res.body);
    // Base item: 150, Addon: 45 => Unit price = 195. 195 * 2 = 390
    assert.equal(orderData.total, 390, 'Server must add authoritative addon price (45) to item: (150+45)*2 = 390');

    // Verify order item has addon details
    const orderItem = orderData.items[0];
    assert.ok(Array.isArray(orderItem.addons), 'Item in response must have addons array');
    assert.equal(orderItem.addons.length, 1);
    assert.equal(orderItem.addons[0].id, addonOptionId);
    assert.equal(orderItem.addons[0].name, 'Extra Truffle Cheese');
    assert.equal(orderItem.addons[0].price, 45.00);

    // Verify Kitchen / Reception endpoint receives full addon details
    const appReq = mockRequest('GET', null, { authorization: `Bearer ${ownerToken}` });
    const appRes = mockResponse();
    await appRoutes(appReq, appRes, new URL('http://localhost/api/app/orders'));
    assert.equal(appRes.statusCode, 200);

    const kitchenOrders = JSON.parse(appRes.body);
    const receptionOrder = kitchenOrders.find(o => o.id === orderData.id);
    assert.ok(receptionOrder, 'Reception must see placed order');
    assert.equal(receptionOrder.items[0].addons[0].name, 'Extra Truffle Cheese');
    assert.equal(receptionOrder.items[0].addons[0].price, 45.00);
  });

  // TEST 4: Unavailable or foreign add-on option is rejected
  await t.test('Unavailable or non-existent addon option is rejected with 400', async () => {
    // 1. Unavailable addon
    const reqDisabled = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'T-3',
      customerName: 'Disabled Addon Tester',
      items: [
        {
          id: itemId,
          quantity: 1,
          addons: [{ id: disabledOptionId }]
        }
      ]
    });
    const resDisabled = mockResponse();
    await assert.rejects(
      async () => publicRoutes(reqDisabled, resDisabled, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`)),
      (err) => err.status === 400 && err.message.includes('unavailable'),
      'Disabled addon must be rejected with 400'
    );

    // 2. Non-existent addon
    const reqFake = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'T-3',
      customerName: 'Fake Addon Tester',
      items: [
        {
          id: itemId,
          quantity: 1,
          addons: [{ id: 'fake_addon_id' }]
        }
      ]
    });
    const resFake = mockResponse();
    await assert.rejects(
      async () => publicRoutes(reqFake, resFake, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`)),
      (err) => err.status === 400,
      'Non-existent addon must be rejected with 400'
    );
  });
});

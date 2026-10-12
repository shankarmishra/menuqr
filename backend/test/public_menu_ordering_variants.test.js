import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import publicRoutes, { clearAllPublicMenuCaches } from '../routes/public.js';

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

function mockRequest(method, body = null) {
  const req = {
    method,
    headers: { 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() {
      if (body) {
        yield Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
      }
    }
  };
  return req;
}

test('Public Menu Ordering Entitlements & Half/Full Variants Test Suite', async (t) => {
  const runId = randomUUID().slice(0, 8);
  const intermediateTenantId = `tenant-inter-${runId}`;
  const intermediateSlug = `inter-slug-${runId}`;
  const premiumTenantId = `tenant-prem-${runId}`;
  const premiumSlug = `prem-slug-${runId}`;
  const premiumQrId = `qr-prem-${runId}`;

  const interMenuId = randomUUID();
  const interCatId = randomUUID();
  const interHalfFullItemId = randomUUID();
  const interVariantItemId = randomUUID();

  const premMenuId = randomUUID();
  const premCatId = randomUUID();
  const premHalfFullItemId = randomUUID();
  const premVariantItemId = randomUUID();

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);

    // 1. Create INTERMEDIATE client (~₹1,499)
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Intermediate Kitchen', $3, 'active')",
      [intermediateTenantId, `pub-inter-${runId}`, intermediateSlug]
    );
    await pool.query(
      "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'INTERMEDIATE', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
      [randomUUID(), intermediateTenantId]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Inter Menu', 'PUBLISHED')",
      [interMenuId, intermediateTenantId]
    );
    await pool.query(
      "INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, 'Mains', 1)",
      [interCatId, interMenuId, intermediateTenantId]
    );
    // Half/Full item
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, pricing_type, is_available) VALUES ($1, $2, $3, $4, 'Dry Manchurian', 'Half: 6 balls; Full: 10 balls', 120, 120, 200, 'half_full', true)",
      [interHalfFullItemId, interMenuId, intermediateTenantId, interCatId]
    );
    // Custom variant item
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, pricing_type, is_available) VALUES ($1, $2, $3, $4, 'Paneer Tikka', 'Tandoori style', 220, 'single', true)",
      [interVariantItemId, interMenuId, intermediateTenantId, interCatId]
    );
    await pool.query(
      "INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, name, price, is_available) VALUES ($1, $2, $3, 'Platter Size (8 pcs)', 320, true)",
      [randomUUID(), interVariantItemId, intermediateTenantId]
    );

    // 2. Create PREMIUM client (₹2,999)
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Premium Palace', $3, 'active')",
      [premiumTenantId, `pub-prem-${runId}`, premiumSlug]
    );
    await pool.query(
      "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
      [randomUUID(), premiumTenantId]
    );
    await pool.query(
      "INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, is_active) VALUES ($1, $2, $3, $4, true)",
      [randomUUID(), premiumTenantId, `pub-prem-${runId}`, premiumQrId]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Prem Menu', 'PUBLISHED')",
      [premMenuId, premiumTenantId]
    );
    await pool.query(
      "INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, 'Curries', 1)",
      [premCatId, premMenuId, premiumTenantId]
    );
    // Half/Full item
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, half_price, full_price, pricing_type, is_available) VALUES ($1, $2, $3, $4, 'Dal Makhani', 'Rich slow cooked dal', 150, 150, 260, 'half_full', true)",
      [premHalfFullItemId, premMenuId, premiumTenantId, premCatId]
    );
    // Variant item
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, description, price, pricing_type, is_available) VALUES ($1, $2, $3, $4, 'Butter Chicken', 'Smoky boneless', 280, 'single', true)",
      [premVariantItemId, premMenuId, premiumTenantId, premCatId]
    );
    await pool.query(
      "INSERT INTO menu_item_variants (id, menu_item_id, tenant_id, name, price, is_available) VALUES ($1, $2, $3, 'Jumbo Portion', 420, true)",
      [randomUUID(), premVariantItemId, premiumTenantId]
    );
  });

  t.after(async () => {
    clearAllPublicMenuCaches();
    await pool.query('DELETE FROM clients WHERE id IN ($1, $2)', [intermediateTenantId, premiumTenantId]);
  });

  await t.test('Intermediate Plan (~₹1,499) returns orderingEnabled = false and preserves Half/Full & variants', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockResponse();
    const url = new URL(`http://localhost/api/public/menus/${intermediateSlug}`);

    await publicRoutes(req, res, url);
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);

    assert.equal(data.orderingEnabled, false, 'Intermediate plan must have orderingEnabled = false');

    const manchurian = data.items.find(i => i.id === interHalfFullItemId);
    assert.ok(manchurian, 'Manchurian item should be present in public payload');
    assert.equal(manchurian.halfPrice, 120, 'halfPrice must be included');
    assert.equal(manchurian.fullPrice, 200, 'fullPrice must be included');
    assert.equal(manchurian.pricingType, 'half_full', 'pricingType must be half_full');

    const tikka = data.items.find(i => i.id === interVariantItemId);
    assert.ok(tikka, 'Tikka item should be present');
    assert.ok(Array.isArray(tikka.variants) && tikka.variants.length === 1, 'variants array must be populated');
    assert.equal(tikka.variants[0].name, 'Platter Size (8 pcs)');
    assert.equal(tikka.variants[0].price, 320);
  });

  await t.test('Intermediate Plan rejects forged order submission with 403 Forbidden', async () => {
    const orderPayload = {
      tableNumber: '5',
      items: [
        { id: interHalfFullItemId, quantity: 1, variant: 'Half' }
      ]
    };

    const req = mockRequest('POST', orderPayload);
    const res = mockResponse();
    const url = new URL(`http://localhost/api/public/menus/${intermediateSlug}/orders`);

    await assert.rejects(
      async () => {
        await publicRoutes(req, res, url);
      },
      (err) => {
        assert.equal(err.status, 403);
        assert.match(err.message, /Online ordering is not available on this plan/i);
        return true;
      }
    );
  });

  await t.test('Premium Plan (₹2,999) returns orderingEnabled = true', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockResponse();
    const url = new URL(`http://localhost/api/public/menus/${premiumSlug}`);

    await publicRoutes(req, res, url);
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);

    assert.equal(data.orderingEnabled, true, 'Premium plan must have orderingEnabled = true');
  });

  await t.test('Premium Plan accepts order and calculates server-authoritative Half/Full and Variant pricing', async () => {
    const orderPayload = {
      tableNumber: 'Table 12',
      items: [
        // 2x Dal Makhani Full (server price 260 each = 520) - even if client sends forged price: 10
        { id: premHalfFullItemId, quantity: 2, variant: 'Full', price: 10 },
        // 1x Butter Chicken Jumbo Portion (server price 420 = 420)
        { id: premVariantItemId, quantity: 1, variant: 'Jumbo Portion', price: 1 }
      ]
    };

    const req = mockRequest('POST', orderPayload);
    const res = mockResponse();
    const url = new URL(`http://localhost/api/public/menus/${premiumSlug}/orders`);

    const handled = await publicRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 201);
    const created = JSON.parse(res.body);

    assert.equal(created.tableNumber, 'Table 12');
    // Expected total: 260 * 2 + 420 * 1 = 520 + 420 = 940
    assert.equal(created.total, 940, 'Server must calculate total from real DB prices, ignoring forged client prices');

    const items = typeof created.items === 'string' ? JSON.parse(created.items) : created.items;
    assert.equal(items.length, 2);
    assert.equal(items[0].price, 260);
    assert.equal(items[1].price, 420);
  });

  await t.test('Permanent QR order endpoint (/api/public/qr/:qrId/orders) also enforces server pricing', async () => {
    const orderPayload = {
      tableNumber: 'T-QR',
      items: [
        { id: premHalfFullItemId, quantity: 1, variant: 'Half' } // server price 150
      ]
    };

    const req = mockRequest('POST', orderPayload);
    const res = mockResponse();
    const url = new URL(`http://localhost/api/public/qr/${premiumQrId}/orders`);

    const handled = await publicRoutes(req, res, url);
    assert.equal(handled, true);
    assert.equal(res.statusCode, 201);
    const created = JSON.parse(res.body);

    assert.equal(created.total, 150);
  });
});

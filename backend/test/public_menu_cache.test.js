import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import publicRoutes, { invalidatePublicMenuCache, clearAllPublicMenuCaches } from '../routes/public.js';

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

test('Public Menu In-Memory TTL Caching and Invalidation Test Suite', async (t) => {
  const tenantId = `cache-test-tenant-${randomUUID()}`;
  const menuSlug = `cache-slug-${randomUUID()}`;
  const menuId = randomUUID();

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Cache Dhaba', $3, 'active')",
      [tenantId, randomUUID().split('-')[0], menuSlug]
    );
    await pool.query(
      "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
      [randomUUID(), tenantId]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Cached Main Menu', 'PUBLISHED')",
      [menuId, tenantId]
    );
    await pool.query(
      "INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, 'Starters', 1)",
      [randomUUID(), menuId, tenantId]
    );
  });

  t.after(async () => {
    clearAllPublicMenuCaches();
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  await t.test('Public menu response is cached and served quickly', async () => {
    const req1 = { method: 'GET', headers: {} };
    const res1 = mockResponse();
    const url1 = new URL(`http://localhost/api/public/menus/${menuSlug}`);

    await publicRoutes(req1, res1, url1);
    assert.equal(res1.statusCode, 200);
    const data1 = JSON.parse(res1.body);
    assert.equal(data1.restaurant.name, 'Cache Dhaba');

    // Update DB directly without calling app routes (simulating DB mutation)
    await pool.query("UPDATE clients SET business_name = 'Updated Dhaba Name' WHERE id = $1", [tenantId]);

    // Second request should serve cached version with 'Cache Dhaba'
    const req2 = { method: 'GET', headers: {} };
    const res2 = mockResponse();
    await publicRoutes(req2, res2, url1);
    assert.equal(res2.statusCode, 200);
    const data2 = JSON.parse(res2.body);
    assert.equal(data2.restaurant.name, 'Cache Dhaba');

    // Invalidate cache explicitly
    invalidatePublicMenuCache(tenantId);

    // Third request after invalidation should fetch fresh data 'Updated Dhaba Name' from DB
    const req3 = { method: 'GET', headers: {} };
    const res3 = mockResponse();
    await publicRoutes(req3, res3, url1);
    assert.equal(res3.statusCode, 200);
    const data3 = JSON.parse(res3.body);
    assert.equal(data3.restaurant.name, 'Updated Dhaba Name');
  });
});

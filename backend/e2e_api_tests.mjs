import pg from 'pg';
import assert from 'node:assert/strict';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr',
});

const API_BASE = 'http://localhost:3001/api';

async function runApiTests() {
  console.log('🚀 Starting API & Integration Test Suite...');
  let totalTests = 0;
  let passedTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  }

  // 1. Health check
  await test('Backend Health API returns ok & dbConnected', async () => {
    const res = await fetchJson(`${API_BASE}/health`);
    assert.equal(res.status, 200);
    assert.equal(res.data.status, 'ok');
    assert.equal(res.data.dbConnected, true);
  });

  const testId = `api-test-${Date.now()}`;
  const testSlug = `api-slug-${Date.now()}`;
  const qrId = `qr-${Date.now()}`;

  let tenantId = testId;
  let subId = `sub-${Date.now()}`;
  let menuId = `menu-${Date.now()}`;
  let categoryId = `cat-${Date.now()}`;
  let itemId = `item-${Date.now()}`;
  let qrCodeIdRecord = `qrrec-${Date.now()}`;

  // 2. Create tenant, subscription & QR identity in DB
  await test('Create fresh client with active subscription & unique QR ID', async () => {
    await pool.query(
      `INSERT INTO clients (id, public_id, business_name, menu_slug, status) 
       VALUES ($1, $2, $3, $4, 'active')`,
      [tenantId, testId, 'API Test Cafe', testSlug]
    );

    await pool.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, expires_at) 
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 year')`,
      [subId, tenantId, 'BASIC', 'ACTIVE']
    );

    await pool.query(
      `INSERT INTO qr_codes (id, tenant_id, public_id, qr_id) 
       VALUES ($1, $2, $3, $4)`,
      [qrCodeIdRecord, tenantId, testId, qrId]
    );

    await pool.query(
      `INSERT INTO tenant_qr_identity (tenant_id, qr_code_id) VALUES ($1, $2)`,
      [tenantId, qrCodeIdRecord]
    );

    const check = await pool.query(`SELECT * FROM tenant_qr_identity WHERE tenant_id = $1`, [tenantId]);
    assert.equal(check.rows.length, 1);
  });

  // 3. Scan QR before menu setup
  await test('Scan QR before menu items -> returns tenant with empty items', async () => {
    const res = await fetchJson(`${API_BASE}/public/qr/${qrId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data.restaurant.name, 'API Test Cafe');
    assert.equal(res.data.items.length, 0);
  });

  // 4. Create Menu, Category & Item
  await test('Add Menu, Category & Item to tenant', async () => {
    await pool.query(
      `INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, $3)`,
      [menuId, tenantId, 'Main Menu']
    );

    await pool.query(
      `INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, $4)`,
      [categoryId, menuId, tenantId, 'Starters']
    );

    await pool.query(
      `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) 
       VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [itemId, menuId, tenantId, categoryId, 'Paneer Tikka', 250.00]
    );
  });

  // 5. Scan QR with items
  await test('Scan exact generated QR -> returns updated menu & items', async () => {
    const res = await fetchJson(`${API_BASE}/public/qr/${qrId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data.restaurant.name, 'API Test Cafe');
    assert.equal(res.data.items.length, 1);
    assert.equal(res.data.items[0].name, 'Paneer Tikka');
    assert.equal(res.data.items[0].price, 250);
  });

  // 6. Update item price & rescan
  await test('Update item price -> scan same QR reflects new price', async () => {
    await pool.query(`UPDATE menu_items SET price = $1 WHERE id = $2`, [280.00, itemId]);

    const res = await fetchJson(`${API_BASE}/public/qr/${qrId}`);
    assert.equal(res.status, 200);
    assert.equal(res.data.items[0].price, 280);
  });

  // 7. Verify QR identity stability
  await test('Verify QR Code ID did not change after menu update', async () => {
    const res = await pool.query(`SELECT qr_code_id FROM tenant_qr_identity WHERE tenant_id = $1`, [tenantId]);
    assert.equal(res.rows[0].qr_code_id, qrCodeIdRecord);
  });

  // 8. Isolation test
  await test('Tenant isolation: invalid QR ID returns 404', async () => {
    const res = await fetchJson(`${API_BASE}/public/qr/nonexistent-qr-id-99999`);
    assert.equal(res.status, 404);
  });

  // 9. Clean up
  await test('Clean up test client from DB', async () => {
    await pool.query(`DELETE FROM menu_items WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM menu_categories WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM menus WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM tenant_qr_identity WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM qr_codes WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM subscriptions WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM clients WHERE id = $1`, [tenantId]);
  });

  await pool.end();

  console.log(`\n📊 API Test Results: ${passedTests}/${totalTests} Passed.`);
  if (passedTests !== totalTests) {
    throw new Error('API tests failed!');
  }
}

runApiTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

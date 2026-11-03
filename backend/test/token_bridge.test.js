import test from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr';

import { pool, connectDB } from '../db.js';
import { syncOrderToTableToken, getActiveTableToken } from '../tokenBridge.js';

test('Token Bridge Suite: Customer Dine-In Auto-Token Issuance & Appending', async (t) => {
  const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr';
  await connectDB(dbUrl);

  const TEST_TENANT_ID = 'tenant_bridge_test_' + Date.now();
  const TABLE_NUM = 7;

  // Setup test tenant
  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state)
     VALUES ($1, $2, 'Bridge Cafe', $3, 'active', 'Maharashtra')
     ON CONFLICT (id) DO NOTHING;`,
    [TEST_TENANT_ID, 'pub-' + Date.now(), 'bridge-cafe-' + Date.now()]
  );

  t.after(async () => {
    await pool.query(`DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)`, [TEST_TENANT_ID]);
    await pool.query(`DELETE FROM table_tokens WHERE tenant_id = $1`, [TEST_TENANT_ID]);
    await pool.query(`DELETE FROM clients WHERE id = $1`, [TEST_TENANT_ID]);
  });

  await t.test('1. Auto-issues new table token when customer places Round 1 dine-in order', async () => {
    const orderData = {
      orderType: 'DINE_IN',
      tableNumber: 'Table ' + TABLE_NUM,
      customerName: 'Aman Sharma',
      customerPhone: '9876543210',
      items: [
        { name: 'Paneer Tikka', quantity: 2, price: 250, isVeg: true },
        { name: 'Butter Naan', quantity: 3, price: 50, isVeg: true }
      ],
      total: 650
    };

    const res = await syncOrderToTableToken({ id: TEST_TENANT_ID }, orderData);
    assert.ok(res, 'Token sync should succeed');
    assert.ok(res.tokenId, 'Returns tokenId');
    assert.equal(res.tokenCode, '#101', 'First token is #101');
    assert.equal(res.billUrl, `/bill/${res.tokenId}`, 'Returns clean /bill/:tokenId link');
    assert.equal(res.total, 650, 'Total is 650');

    // Verify database row
    const dbRes = await pool.query(`SELECT * FROM table_tokens WHERE id = $1`, [res.tokenId]);
    assert.equal(dbRes.rows.length, 1);
    assert.equal(dbRes.rows[0].status, 'DINING');
    assert.equal(dbRes.rows[0].table_number, TABLE_NUM);
  });

  await t.test('2. Appends to existing active token when customer places Round 2 order for same table', async () => {
    const round2Data = {
      orderType: 'DINE_IN',
      tableNumber: String(TABLE_NUM),
      items: [
        { name: 'Dal Makhani', quantity: 1, price: 300, isVeg: true }
      ],
      total: 300
    };

    const res2 = await syncOrderToTableToken({ id: TEST_TENANT_ID }, round2Data);
    assert.ok(res2, 'Token sync round 2 should succeed');
    assert.equal(res2.tokenCode, '#101', 'Reuses the active token #101');
    assert.equal(res2.total, 950, 'Combined total is 650 + 300 = 950');

    // Verify token_items count
    const itemsRes = await pool.query(`SELECT * FROM token_items WHERE token_id = $1`, [res2.tokenId]);
    assert.equal(itemsRes.rows.length, 3, 'Now has 3 total item lines');
  });

  await t.test('3. getActiveTableToken retrieves active token for customer menu dining state', async () => {
    const active = await getActiveTableToken(TEST_TENANT_ID, TABLE_NUM);
    assert.ok(active, 'Active token found');
    assert.equal(active.tokenCode, '#101');
    assert.equal(active.total, 950);
    assert.equal(active.status, 'DINING');
  });

  await t.test('4. Gracefully ignores orders without valid table numbers (e.g. delivery)', async () => {
    const deliveryOrder = {
      orderType: 'DELIVERY',
      tableNumber: null,
      items: [{ name: 'Burger', quantity: 1, price: 100 }],
      total: 100
    };
    const res = await syncOrderToTableToken({ id: TEST_TENANT_ID }, deliveryOrder);
    assert.equal(res, null, 'Returns null without error');
  });
});

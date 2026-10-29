import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { daySeries, shiftDay, zeroFill, percentChange, getTenantAnalytics } from '../analytics.js';
import { istDateString } from '../istTime.js';

test('day helpers', async (t) => {
  await t.test('shiftDay crosses month and year boundaries', () => {
    assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
    assert.equal(shiftDay('2026-12-31', 1), '2027-01-01');
  });
  await t.test('daySeries is oldest-first and ends on the given day', () => {
    assert.deepEqual(daySeries('2026-01-03', 3), ['2026-01-01', '2026-01-02', '2026-01-03']);
  });
  await t.test('zeroFill keeps order and fills gaps with zeros', () => {
    const out = zeroFill(['a', 'b', 'c'], new Map([['b', { scans: '4' }]]), ['scans', 'views']);
    assert.deepEqual(out, [{ day: 'a', scans: 0, views: 0 }, { day: 'b', scans: 4, views: 0 }, { day: 'c', scans: 0, views: 0 }]);
  });
  await t.test('percentChange handles no baseline', () => {
    assert.equal(percentChange(10, 0), null);
    assert.equal(percentChange(15, 10), 50);
    assert.equal(percentChange(5, 10), -50);
  });
});

test('getTenantAnalytics against the database', async (t) => {
  await connectDB(process.env.DATABASE_URL);
  const stamp = Date.now();
  const tenantId = `tenant_analytics_${stamp}`;
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Analytics Diner', $3, 'active')`, [tenantId, `pub_${stamp}`, `an-${stamp}`]);
  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_hourly_stats WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  const today = istDateString();
  const prevDay = shiftDay(today, -9); // inside the previous 7-day window
  await pool.query(`INSERT INTO menu_hourly_stats (tenant_id, day, hour, scans, views) VALUES ($1, $2, 13, 5, 2), ($1, $2, 14, 1, 0), ($1, $3, 9, 3, 0)`, [tenantId, today, prevDay]);

  const order = (id, total, status, items, type = 'DINE_IN') => pool.query(
    `INSERT INTO customer_orders (id, tenant_id, table_number, status, total, items, order_type) VALUES ($1, $2, 'T1', $3, $4, $5::jsonb, $6)`,
    [id, tenantId, status, total, JSON.stringify(items), type]
  );
  await order(`o1_${stamp}`, 300, 'COMPLETED', [{ name: 'Paneer Tikka', quantity: 2, price: 100 }, { name: 'Naan', quantity: 2, price: 50 }]);
  await order(`o2_${stamp}`, 200, 'NEW', [{ name: 'Paneer Tikka', quantity: 1, price: 100 }, { name: 'Lassi', quantity: 1, price: 100 }], 'DELIVERY');
  await order(`o3_${stamp}`, 999, 'CANCELLED', [{ name: 'Ghost Dish', quantity: 9, price: 111 }]);

  await t.test('traffic: totals, zero-filled days, hours and period comparison', async () => {
    const r = await getTenantAnalytics(pool, tenantId, 7, { includeOrders: false });
    assert.equal(r.to, today);
    assert.equal(r.traffic.days.length, 7);
    assert.equal(r.traffic.days.at(-1).day, today);
    assert.deepEqual(r.traffic.totals, { scans: 6, views: 2 });
    assert.deepEqual(r.traffic.previous, { scans: 3, views: 0 });
    assert.equal(r.traffic.change.scans, 100);
    assert.equal(r.traffic.hours[13], 7);
    assert.equal(r.traffic.hours[14], 1);
    assert.equal(r.orders, null, 'plans without ordering get no order metrics');
  });

  await t.test('orders: cancelled excluded, revenue/AOV, top items, type split', async () => {
    const r = await getTenantAnalytics(pool, tenantId, 7, { includeOrders: true });
    assert.equal(r.orders.totals.orders, 2);
    assert.equal(r.orders.totals.revenue, 500);
    assert.equal(r.orders.totals.averageOrderValue, 250);
    assert.equal(r.orders.days.at(-1).orders, 2);
    assert.equal(r.orders.topItems[0].name, 'Paneer Tikka');
    assert.equal(r.orders.topItems[0].quantity, 3);
    assert.ok(!r.orders.topItems.some((i) => i.name === 'Ghost Dish'));
    assert.deepEqual(r.orders.byType.map((x) => x.type).sort(), ['DELIVERY', 'DINE_IN']);
    assert.equal(r.orders.hours.reduce((a, b) => a + b, 0), 2);
  });

  await t.test('another tenant sees none of this data', async () => {
    const r = await getTenantAnalytics(pool, 'someone-else', 7, { includeOrders: true });
    assert.equal(r.traffic.totals.scans, 0);
    assert.equal(r.orders.totals.orders, 0);
  });
});

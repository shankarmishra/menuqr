import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import publicRoutes from '../routes/public.js';

function mockRequest(method, body = null) {
  const req = body ? Readable.from([Buffer.from(JSON.stringify(body))]) : Readable.from([]);
  req.method = method;
  req.headers = { 'content-type': 'application/json' };
  req.socket = { remoteAddress: '198.51.100.77' };
  return req;
}
function mockResponse() {
  let statusCode = 200; let body = '';
  return { writeHead(s) { statusCode = s; }, end(s) { body = s || ''; }, get statusCode() { return statusCode; }, get body() { return body; } };
}
async function call(method, path, body) {
  const res = mockResponse();
  try {
    await publicRoutes(mockRequest(method, body), res, new URL(`http://localhost${path}`));
    return { status: res.statusCode, json: res.body ? JSON.parse(res.body) : null };
  } catch (e) {
    return { status: e.statusCode || e.status || 500, json: { error: e.message } };
  }
}

test('timed categories: public flags and order rejection', async (t) => {
  await connectDB(process.env.DATABASE_URL);
  const s = Date.now();
  const tenantId = `tenant_timed_${s}`; const slug = `timed-${s}`;
  const ids = { menu: `m_${s}`, open: `c_open_${s}`, closed: `c_closed_${s}`, a: `i_a_${s}`, b: `i_b_${s}` };
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1,$2,'Timed Diner',$3,'active')`, [tenantId, `pub_${s}`, slug]);
  await pool.query(`INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1,$2,'PREMIUM','ACTIVE',NOW(),NOW()+INTERVAL '30 DAYS')`, [`sub_${s}`, tenantId]);
  await pool.query(`INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,'Main')`, [ids.menu, tenantId]);
  // "open" is always on; "closed" has a one-minute window that is never now (12:00-12:01 on a day that is not today)
  const otherDay = (new Date().getDay() + 3) % 7;
  await pool.query(`INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,'Anytime',1)`, [ids.open, ids.menu, tenantId]);
  await pool.query(`INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order, schedule) VALUES ($1,$2,$3,'Never Now',2,$4::jsonb)`, [ids.closed, ids.menu, tenantId, JSON.stringify({ from: '12:00', to: '12:01', days: [otherDay === 0 ? 1 : 0].filter(() => false).concat([(otherDay + 1) % 7]) })]);
  await pool.query(`INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1,$2,$3,$4,'Always Dish',100,true), ($5,$2,$3,$6,'Timed Dish',200,true)`, [ids.a, ids.menu, tenantId, ids.open, ids.b, ids.closed]);
  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  await t.test('public menu marks the out-of-hours dish with a note and leaves the other alone', async () => {
    const { status, json } = await call('GET', `/api/public/menus/${slug}`);
    assert.equal(status, 200);
    const always = json.items.find((i) => i.name === 'Always Dish');
    const timed = json.items.find((i) => i.name === 'Timed Dish');
    assert.equal(always.availabilityNote, null);
    assert.match(timed.availabilityNote, /^Available 12:00 PM – 12:01 PM/);
    assert.equal(timed.soldOut, false);
  });

  await t.test('ordering a dish outside its window is rejected server-side', async () => {
    const { status, json } = await call('POST', `/api/public/menus/${slug}/orders`, { orderType: 'DINE_IN', tableNumber: 'T1', items: [{ id: ids.b, name: 'Timed Dish', quantity: 1 }] });
    assert.equal(status, 400);
    assert.match(json.error, /only available/);
  });

  await t.test('an always-available dish can still be ordered', async () => {
    const { status } = await call('POST', `/api/public/menus/${slug}/orders`, { orderType: 'DINE_IN', tableNumber: 'T1', items: [{ id: ids.a, name: 'Always Dish', quantity: 1 }] });
    assert.ok([200, 201].includes(status), `status ${status}`);
  });
});

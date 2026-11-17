// Restaurant GST/FSSAI details from settings to the bill, against a real *_test database.
// Covers: migration 027 (twice), validation errors, tenant isolation, the GST rule frozen on each
// bill, QR orders getting the same tax as staff orders, the public bill showing GSTIN/FSSAI only
// when configured, the owner's hidden phone, and the public menu never carrying the GSTIN.
//
// Run with the test env (see audit-report HANDOFF section 6). It refuses to run unless the
// database name ends in _test.
import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const GSTIN = '27AAPFU0939F1ZV';
const FSSAI = '10019022008765';

function testDatabaseName() {
  try {
    return decodeURIComponent(new URL(process.env.DATABASE_URL).pathname).replace(/^\/+/, '');
  } catch {
    return '';
  }
}

const dbName = testDatabaseName();
const skip = /_test$/.test(dbName) ? false : `DATABASE_URL must point at a *_test database (got "${dbName || 'none'}")`;

test('restaurant tax and legal details: settings → bill', { skip }, async (t) => {
  const { connectDB } = await import('../db.js');
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: true });
  const current = (await db.query('SELECT current_database() AS name')).rows[0].name;
  assert.match(current, /_test$/, 'connected database must be a *_test database');

  const { default: appRoutes } = await import('../routes/app.js');
  const { default: tokenRoutes } = await import('../routes/tokens.js');
  const { syncOrderToTableToken } = await import('../tokenBridge.js');
  const { buildRestaurantBlock } = await import('../publicMenuPayload.js');
  const { fakeRequest, fakeResponse, urlFor } = await import('./helpers/http.js');
  const { ownerHeaders } = await import('./helpers/ownerFake.js');

  const run = randomUUID().slice(0, 8);
  const tenants = {
    a: { id: `tax-a-${run}`, user: `tax-user-a-${run}` },
    b: { id: `tax-b-${run}`, user: `tax-user-b-${run}` },
    c: { id: `tax-c-${run}`, user: `tax-user-c-${run}` },
  };

  async function seed({ id, user }, name) {
    await db.query(
      `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, phone)
       VALUES ($1, $2, $3, $4, 'active', 'Maharashtra', '+919876543210')`,
      [id, `pub-${id}`, name, `slug-${id}`],
    );
    await db.query(
      `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
       VALUES ($1, $2, 'x', 'RESTAURANT_OWNER', $3, 'COMPLETED')`,
      [user, `${user}@example.test`, id],
    );
    await db.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
       VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days')`,
      [`sub-${id}`, id],
    );
  }

  async function cleanup() {
    for (const { id, user } of Object.values(tenants)) {
      await db.query('DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)', [id]).catch(() => {});
      await db.query('DELETE FROM table_tokens WHERE tenant_id = $1', [id]).catch(() => {});
      await db.query('DELETE FROM activity_logs WHERE tenant_id = $1', [id]).catch(() => {});
      await db.query('DELETE FROM restaurant_profiles WHERE tenant_id = $1', [id]).catch(() => {});
      await db.query('DELETE FROM subscriptions WHERE tenant_id = $1', [id]).catch(() => {});
      await db.query('DELETE FROM users WHERE id = $1', [user]).catch(() => {});
      await db.query('DELETE FROM clients WHERE id = $1', [id]).catch(() => {});
    }
  }

  async function call(routes, { tenant, method = 'GET', path: p, body }) {
    const res = fakeResponse();
    const headers = tenant ? ownerHeaders(tenant.user, tenant.id) : {};
    let error = null;
    try {
      await routes(fakeRequest({ method, body, headers }), res, urlFor(p));
    } catch (err) {
      error = err;
    }
    if (error) return { status: error.status || 500, body: { error: error.message } };
    return { status: res.statusCode, body: res.body ? res.json() : null };
  }

  const patchLegal = (tenant, body) => call(appRoutes, { tenant, method: 'PATCH', path: '/api/app/profile/highlights-legal', body });
  const getProfile = (tenant) => call(appRoutes, { tenant, path: '/api/app/profile' });
  const createBill = (tenant, tableNumber, rupees) =>
    call(tokenRoutes, {
      tenant,
      method: 'POST',
      path: '/api/app/tokens',
      body: { tableNumber, items: [{ dishName: 'Paneer Tikka', quantity: 1, unitPricePaise: rupees * 100 }] },
    });
  const publicBill = (id) => call(tokenRoutes, { path: `/api/public/tokens/${id}` });

  await cleanup();
  await seed(tenants.a, 'Tax Test A');
  await seed(tenants.b, 'Tax Test B');
  await seed(tenants.c, 'Tax Test C');
  t.after(cleanup);

  await t.test('migration 027 can run again without error', async () => {
    const sql = fs.readFileSync(path.join(here, '..', 'migrations', '027_restaurant_tax_legal.sql'), 'utf8');
    await db.query(sql);
    await db.query(sql);
  });

  await t.test('invalid GSTIN or FSSAI is rejected with a reason, nothing is saved', async () => {
    const badGstin = await patchLegal(tenants.a, { gstMode: 'REGULAR', gstin: '27AAPFU0939F1ZW', gstRateBps: 500 });
    assert.equal(badGstin.status, 400);
    assert.match(badGstin.body.error, /last character/);
    const noGstin = await patchLegal(tenants.a, { gstMode: 'REGULAR' });
    assert.equal(noGstin.status, 400);
    const badFssai = await patchLegal(tenants.a, { fssai: '12345' });
    assert.equal(badFssai.status, 400);
    assert.match(badFssai.body.error, /14 digits/);
    const profile = await getProfile(tenants.a);
    assert.equal(profile.status, 200);
  });

  await t.test('owner saves GST and FSSAI; the profile returns them', async () => {
    const saved = await patchLegal(tenants.a, { gstMode: 'REGULAR', gstin: GSTIN.toLowerCase(), gstRateBps: 1800, fssai: FSSAI, legalName: 'Tax Test Foods' });
    assert.equal(saved.status, 200, JSON.stringify(saved.body));
    const row = (await db.query('SELECT gst_mode, gstin, gst_rate_bps, fssai, legal_name FROM restaurant_profiles WHERE tenant_id = $1', [tenants.a.id])).rows[0];
    assert.deepEqual(
      { ...row, fssai: String(row.fssai).trim() },
      { gst_mode: 'REGULAR', gstin: GSTIN, gst_rate_bps: 1800, fssai: FSSAI, legal_name: 'Tax Test Foods' },
    );
  });

  await t.test('tenant isolation: B never sees or changes A\'s details', async () => {
    const bProfile = await getProfile(tenants.b);
    assert.equal(bProfile.status, 200);
    assert.ok(!JSON.stringify(bProfile.body).includes(GSTIN), 'B must not see A\'s GSTIN');
    const bSave = await patchLegal(tenants.b, { gstMode: 'NOT_REGISTERED', fssai: '' });
    assert.equal(bSave.status, 200);
    const aRow = (await db.query('SELECT gst_mode, gstin FROM restaurant_profiles WHERE tenant_id = $1', [tenants.a.id])).rows[0];
    assert.deepEqual(aRow, { gst_mode: 'REGULAR', gstin: GSTIN }, 'A unchanged by B\'s save');
  });

  let regularBillId;
  await t.test('REGULAR 18%: bill charges CGST 9% + SGST 9% and the public bill shows GSTIN and FSSAI', async () => {
    const created = await createBill(tenants.a, 1, 1000);
    assert.equal(created.status, 201, JSON.stringify(created.body));
    regularBillId = created.body.token.id;
    assert.equal(created.body.token.taxPaise, 18000);
    assert.equal(created.body.token.taxMode, 'REGULAR');
    const bill = await publicBill(regularBillId);
    assert.equal(bill.status, 200);
    assert.equal(bill.body.restaurant.gstin, GSTIN);
    assert.equal(bill.body.restaurant.fssai, FSSAI);
    assert.equal(bill.body.restaurant.legalName, 'Tax Test Foods');
    assert.equal(bill.body.token.cgstPaise, 9000);
    assert.equal(bill.body.token.sgstPaise, 9000);
    assert.equal(bill.body.token.totalPaise, 118000);
  });

  await t.test('cashier detail carries the same legal details (shape the cashier reads)', async () => {
    const detail = await call(tokenRoutes, { tenant: tenants.a, path: `/api/app/tokens/${regularBillId}` });
    assert.equal(detail.status, 200);
    assert.equal(detail.body.token.restaurantGstin, GSTIN);
    assert.equal(detail.body.token.restaurantFssai, FSSAI);
    assert.equal(detail.body.token.restaurantName, 'Tax Test A');
  });

  await t.test('tenant isolation: B cannot open A\'s bill through the owner API', async () => {
    const detail = await call(tokenRoutes, { tenant: tenants.b, path: `/api/app/tokens/${regularBillId}` });
    assert.equal(detail.status, 404);
  });

  await t.test('changing the GST setting never rewrites an open bill', async () => {
    assert.equal((await patchLegal(tenants.a, { gstMode: 'NOT_REGISTERED' })).status, 200);
    const added = await call(tokenRoutes, {
      tenant: tenants.a,
      method: 'POST',
      path: `/api/app/tokens/${regularBillId}/items`,
      body: { items: [{ dishName: 'Roti', quantity: 2, unitPricePaise: 5000 }] },
    });
    assert.equal(added.status, 200, JSON.stringify(added.body));
    assert.equal(added.body.token.subtotalPaise, 110000);
    assert.equal(added.body.token.taxPaise, 19800, 'still 18%, the rule the bill opened with');
  });

  await t.test('NOT_REGISTERED: new bill has no GST and the public bill shows no GSTIN', async () => {
    const created = await createBill(tenants.a, 2, 500);
    assert.equal(created.status, 201);
    assert.equal(created.body.token.taxPaise, 0);
    const bill = await publicBill(created.body.token.id);
    assert.equal(bill.body.restaurant.gstin, null);
    assert.equal(bill.body.restaurant.fssai, FSSAI, 'FSSAI is still printed when configured');
  });

  await t.test('UNSET (no settings saved): the historical 5% stays, no GSTIN printed', async () => {
    const created = await createBill(tenants.c, 1, 1000);
    assert.equal(created.status, 201);
    assert.equal(created.body.token.taxPaise, 5000);
    assert.equal(created.body.token.taxMode, 'UNSET');
    const bill = await publicBill(created.body.token.id);
    assert.equal(bill.body.restaurant.gstin, null);
    assert.equal(bill.body.restaurant.fssai, null);
  });

  await t.test('QR orders get the same GST as staff orders (previously none)', async () => {
    assert.equal((await patchLegal(tenants.a, { gstMode: 'REGULAR', gstin: GSTIN, gstRateBps: 500 })).status, 200);
    const result = await syncOrderToTableToken({ id: tenants.a.id }, {
      id: `ord-${run}`,
      tableNumber: '7',
      items: [{ name: 'Masala Dosa', price: 100, quantity: 2 }],
    });
    assert.ok(result, 'bridge returned a bill');
    const row = (await db.query('SELECT subtotal_paise, tax_paise, total_paise, tax_mode FROM table_tokens WHERE tenant_id = $1 AND table_number = 7', [tenants.a.id])).rows[0];
    assert.deepEqual(
      { subtotal: Number(row.subtotal_paise), tax: Number(row.tax_paise), total: Number(row.total_paise), mode: row.tax_mode },
      { subtotal: 20000, tax: 1000, total: 21000, mode: 'REGULAR' },
    );
  });

  await t.test('composition scheme: no GST charged, GSTIN printed', async () => {
    assert.equal((await patchLegal(tenants.b, { gstMode: 'COMPOSITION', gstin: GSTIN })).status, 200);
    const created = await createBill(tenants.b, 3, 800);
    assert.equal(created.body.token.taxPaise, 0);
    assert.equal(created.body.token.taxMode, 'COMPOSITION');
    const bill = await publicBill(created.body.token.id);
    assert.equal(bill.body.restaurant.gstMode, 'COMPOSITION');
    assert.equal(bill.body.restaurant.gstin, GSTIN);
  });

  await t.test('the public bill respects a hidden phone number', async () => {
    const hide = await call(appRoutes, {
      tenant: tenants.c,
      method: 'PATCH',
      path: '/api/app/profile/contact-social',
      body: { contacts: [{ number: '98765 43210', kind: 'mobile', public: false }] },
    });
    assert.equal(hide.status, 200, JSON.stringify(hide.body));
    const bills = await db.query('SELECT id FROM table_tokens WHERE tenant_id = $1 LIMIT 1', [tenants.c.id]);
    const bill = await publicBill(bills.rows[0].id);
    assert.equal(bill.body.restaurant.phone ?? null, null);
  });

  await t.test('the public menu block never carries the GSTIN', async () => {
    const profile = (await db.query('SELECT * FROM restaurant_profiles WHERE tenant_id = $1', [tenants.a.id])).rows[0];
    const client = (await db.query('SELECT * FROM clients WHERE id = $1', [tenants.a.id])).rows[0];
    const block = buildRestaurantBlock({ client, profile });
    const json = JSON.stringify(block);
    assert.ok(!json.includes(GSTIN), 'GSTIN must not be in the public menu');
    assert.ok(!/gstin|legal_name|gst_mode/i.test(json), 'no tax keys in the public menu');
  });
});

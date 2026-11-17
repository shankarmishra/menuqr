/**
 * Integration tests (live Postgres + real server) for:
 *  - 14-day free-trial signup with no payment
 *  - trial expiry blocking access, and the TRIAL → any-plan fresh purchase
 *  - super-admin offline plan activation / feature selection / extend / revoke
 *  - authorization of the new admin endpoints
 *
 * Requires DATABASE_URL (like the other integration suites).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool, connectDB } from '../db.js';
import { generateAuthToken, generateAuthCookie } from '../auth.js';
import { generateCsrfToken } from '../csrf.js';
import { PLAN_CAPABILITIES } from '../authorization.js';
import { processOrderPaymentAndProvision } from '../routes/purchase.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run the manual plan / trial integration tests.');
}

let serverProcess;
let baseUrl;
let serverStderr = '';
const createdTenants = new Set();
const createdEmails = new Set();
let adminToken;
let adminId;

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function startServer() {
  const port = await getAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  // server.js refuses to listen in test mode (NODE_ENV=test / NODE_TEST_CONTEXT), so the child
  // runs as a normal development server against the same (test) DATABASE_URL.
  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: {
      ...childEnv,
      NODE_ENV: 'development',
      PORT: String(port),
      API_PORT: String(port),
      // Email OTP is not under test here; with the email service off, signup treats email as verified.
      ENABLE_EMAIL_SERVICE: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProcess.stderr.on('data', (chunk) => { serverStderr += chunk.toString(); });
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`Backend did not become ready.\n${serverStderr}`);
}

async function call(pathname, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers: { ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: res.status, body: json };
}

const asAdmin = (pathname, options = {}) =>
  call(pathname, { ...options, headers: { authorization: `Bearer ${adminToken}`, ...options.headers } });

function ownerHeaders(userId, tenantId) {
  const token = generateAuthToken({ id: userId, role: 'RESTAURANT_OWNER', tenantId });
  return { cookie: generateAuthCookie(token).split(';')[0], 'x-csrf-token': generateCsrfToken(token) };
}

async function createRestaurant({ plan = 'BASIC', status = 'ACTIVE', expiresInDays = 30, source = 'GATEWAY' } = {}) {
  const tenantId = randomUUID();
  const userId = randomUUID();
  const publicId = randomUUID().slice(0, 12);
  createdTenants.add(tenantId);
  await pool.query(
    'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1,$2,$3,$4,$5)',
    [tenantId, publicId, `Manual Plan Test ${publicId}`, `mpt-${publicId}`, 'active']
  );
  await pool.query(
    'INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, `mpt-${tenantId}@example.invalid`, 'x', 'RESTAURANT_OWNER', tenantId, 'COMPLETED']
  );
  const now = Date.now();
  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [randomUUID(), tenantId, plan, status, new Date(now - 86_400_000), new Date(now + expiresInDays * 86_400_000), source]
  );
  return { tenantId, userId, slug: `mpt-${publicId}`, headers: ownerHeaders(userId, tenantId) };
}

async function cleanupTenant(tenantId) {
  for (const sql of [
    'DELETE FROM order_pack_purchases WHERE tenant_id = $1',
    'DELETE FROM customer_orders WHERE tenant_id = $1',
    'DELETE FROM menu_items WHERE tenant_id = $1',
    'DELETE FROM menu_categories WHERE tenant_id = $1',
    "DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE metadata->>'tenant_id' = $1)",
    "DELETE FROM orders WHERE metadata->>'tenant_id' = $1",
    'DELETE FROM manual_plan_grants WHERE tenant_id = $1',
    'DELETE FROM subscription_events WHERE tenant_id = $1',
    'DELETE FROM trial_registrations WHERE tenant_id = $1',
    'DELETE FROM activity_logs WHERE tenant_id = $1',
    'DELETE FROM subscription_content_usage WHERE tenant_id = $1',
    'DELETE FROM subscriptions WHERE tenant_id = $1',
    'DELETE FROM tenant_qr_identity WHERE tenant_id = $1',
    'DELETE FROM qr_codes WHERE tenant_id = $1',
    'DELETE FROM appearance_settings WHERE tenant_id = $1',
    'DELETE FROM menus WHERE tenant_id = $1',
    'DELETE FROM users WHERE tenant_id = $1',
    'DELETE FROM clients WHERE id = $1',
  ]) {
    try { await pool.query(sql, [tenantId]); } catch {}
  }
}

test.before(async () => {
  await connectDB(process.env.DATABASE_URL);
  await startServer();
  adminId = `admin-mpt-${randomUUID()}`;
  adminToken = randomBytes(32).toString('hex');
  await pool.query('INSERT INTO admin_users (id, email, status) VALUES ($1, $2, $3)', [adminId, `${adminId}@example.invalid`, 'active']);
  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [randomUUID(), adminId, createHash('sha256').update(adminToken).digest('hex'), new Date(Date.now() + 3_600_000)]
  );
});

test.after(async () => {
  for (const tenantId of createdTenants) await cleanupTenant(tenantId);
  for (const email of createdEmails) {
    try { await pool.query('DELETE FROM trial_registrations WHERE LOWER(email) = $1', [email]); } catch {}
    try { await pool.query('DELETE FROM users WHERE LOWER(email) = $1 AND tenant_id IS NULL', [email]); } catch {}
  }
  try { await pool.query('DELETE FROM admin_users WHERE id = $1', [adminId]); } catch {}
  if (serverProcess && serverProcess.exitCode === null) {
    serverProcess.kill('SIGTERM');
    await new Promise((r) => serverProcess.once('exit', r));
  }
  await pool.end();
});

// ── Free trial ────────────────────────────────────────────────────────────────

test('trial signup creates a restaurant with a 14-day Premium TRIAL and no payment', async () => {
  const email = `trial-${randomUUID()}@example.invalid`;
  createdEmails.add(email);
  const res = await call('/api/purchase/trial', {
    method: 'POST',
    body: { customerName: 'Trial Owner', customerEmail: email, password: 'secret123', businessName: `Trial Bistro ${randomUUID().slice(0, 6)}`, city: 'Pune' },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body) + serverStderr);
  assert.equal(res.body.status, 'TRIAL');
  createdTenants.add(res.body.tenantId);

  const sub = (await pool.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [res.body.tenantId])).rows[0];
  assert.equal(sub.status, 'TRIAL');
  assert.equal(sub.source, 'TRIAL');
  assert.equal(sub.plan_id, 'PREMIUM');
  const days = (new Date(sub.expires_at) - new Date(sub.started_at)) / 86_400_000;
  assert.ok(Math.abs(days - 14) < 0.01, `trial length ${days}`);

  const orders = await pool.query('SELECT id FROM orders WHERE LOWER(customer_email) = $1', [email]);
  assert.equal(orders.rows.length, 0, 'no payment order is created for a trial');

  const user = (await pool.query('SELECT id, tenant_id FROM users WHERE LOWER(email) = $1', [email])).rows[0];
  const sessionSub = await call('/api/app/subscription', { headers: ownerHeaders(user.id, user.tenant_id) });
  assert.equal(sessionSub.status, 200);
  assert.equal(sessionSub.body.isTrial, true);
  assert.equal(sessionSub.body.active, true);
  assert.ok(sessionSub.body.entitlements.includes('customer_ordering'), 'trial unlocks Premium features');
  assert.ok(sessionSub.body.supportPhone);
});

test('the same email cannot start a second free trial', async () => {
  const email = `trial-dupe-${randomUUID()}@example.invalid`;
  createdEmails.add(email);
  const first = await call('/api/purchase/trial', {
    method: 'POST',
    body: { customerName: 'A', customerEmail: email, password: 'secret123', businessName: `Dupe One ${randomUUID().slice(0, 6)}` },
  });
  assert.equal(first.status, 201, JSON.stringify(first.body));
  createdTenants.add(first.body.tenantId);

  // Simulate the restaurant being deleted: the trial registration must still block a re-trial.
  // (Detach the registration first: the fixture cleanup deletes registrations by tenant.)
  await pool.query('UPDATE trial_registrations SET tenant_id = NULL WHERE LOWER(email) = $1', [email]);
  await cleanupTenant(first.body.tenantId);
  const second = await call('/api/purchase/trial', {
    method: 'POST',
    body: { customerName: 'A', customerEmail: email, password: 'secret123', businessName: `Dupe Two ${randomUUID().slice(0, 6)}` },
  });
  assert.equal(second.status, 409, JSON.stringify(second.body));
});

test('trial signup validates required fields and password length', async () => {
  const short = await call('/api/purchase/trial', {
    method: 'POST',
    body: { customerName: 'A', customerEmail: `x-${randomUUID()}@example.invalid`, password: '123', businessName: 'X' },
  });
  assert.equal(short.status, 400);
  const missing = await call('/api/purchase/trial', { method: 'POST', body: { customerEmail: 'y@example.invalid' } });
  assert.equal(missing.status, 400);
});

test('an expired trial loses access; buying any plan is priced as a fresh purchase', async () => {
  const r = await createRestaurant({ plan: 'PREMIUM', status: 'TRIAL', expiresInDays: -1, source: 'TRIAL' });
  const sub = await call('/api/app/subscription', { headers: r.headers });
  assert.equal(sub.status, 200);
  assert.equal(sub.body.active, false);
  assert.deepEqual(sub.body.entitlements, []);

  const analytics = await call('/api/app/analytics', { headers: r.headers });
  assert.equal(analytics.status, 403, 'gated features are blocked after the trial');

  // A TRIAL on Premium may still buy Basic (no proration credit).
  const preview = await call('/api/app/subscription/upgrade-preview?targetPlanId=basic', { headers: r.headers });
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.equal(preview.body.preview.prorationCreditPaise, 0);
});

test('an active trial can buy Basic even though it runs on Premium features', async () => {
  const r = await createRestaurant({ plan: 'PREMIUM', status: 'TRIAL', expiresInDays: 5, source: 'TRIAL' });
  const preview = await call('/api/app/subscription/upgrade-preview?targetPlanId=basic', { headers: r.headers });
  assert.equal(preview.status, 200, JSON.stringify(preview.body));
  assert.equal(preview.body.preview.prorationCreditPaise, 0);
  assert.equal(preview.body.preview.fullPricePaise, 199900);
});

// ── Super admin: offline plans ───────────────────────────────────────────────

test('admin plan endpoints require a super-admin session', async () => {
  const r = await createRestaurant();
  for (const [method, pathname] of [
    ['GET', '/api/admin/plans'],
    ['GET', `/api/admin/clients/${r.tenantId}/subscription`],
    ['POST', `/api/admin/clients/${r.tenantId}/manual-plan`],
    ['POST', `/api/admin/clients/${r.tenantId}/extend-trial`],
    ['GET', '/api/admin/manual-payments'],
  ]) {
    const anon = await call(pathname, { method, body: method === 'POST' ? {} : undefined });
    assert.equal(anon.status, 401, `${method} ${pathname} anonymous`);
    const owner = await call(pathname, { method, body: method === 'POST' ? {} : undefined, headers: r.headers });
    assert.ok([401, 403].includes(owner.status), `${method} ${pathname} as owner → ${owner.status}`);
  }
  const sub = (await pool.query('SELECT source FROM subscriptions WHERE tenant_id = $1', [r.tenantId])).rows[0];
  assert.equal(sub.source, 'GATEWAY', 'nothing changed');
});

test('admin activates an offline Basic plan at ₹300 for 1 month and the restaurant unlocks', async () => {
  const r = await createRestaurant({ plan: 'BASIC', status: 'EXPIRED', expiresInDays: -3 });
  const before = await call('/api/app/subscription', { headers: r.headers });
  assert.equal(before.body.active, false);

  const res = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST',
    body: { planId: 'BASIC', agreedAmount: 300, paymentMode: 'UPI', paymentReference: 'UTR123', durationValue: 1, durationUnit: 'MONTHS', notes: 'Deal agreed by phone' },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body) + serverStderr);
  assert.equal(res.body.subscription.status, 'ACTIVE');
  assert.equal(res.body.subscription.source, 'MANUAL');
  assert.equal(res.body.subscription.planId, 'BASIC');
  assert.equal(res.body.grant.agreedAmount, 300);
  assert.equal(res.body.grant.paymentReference, 'UTR123');
  assert.equal(res.body.grant.grantedBy, `${adminId}@example.invalid`);
  const days = (new Date(res.body.subscription.expiresAt) - Date.now()) / 86_400_000;
  assert.ok(days > 27 && days < 32, `about one month, got ${days}`);
  assert.ok(res.body.events.some((e) => e.eventType === 'MANUAL_PLAN_ACTIVATED'));

  const after = await call('/api/app/subscription', { headers: r.headers });
  assert.equal(after.body.active, true);
  assert.equal(after.body.source, 'MANUAL');
  assert.deepEqual(after.body.entitlements, PLAN_CAPABILITIES.BASIC);

  const ledger = await asAdmin('/api/admin/manual-payments');
  assert.equal(ledger.status, 200);
  assert.ok(ledger.body.grants.some((g) => g.id === res.body.grant.id));
});

test('admin can enable selected extra features on a cheaper plan, then edit them', async () => {
  const r = await createRestaurant({ plan: 'BASIC', status: 'ACTIVE', expiresInDays: 2 });
  const features = [...PLAN_CAPABILITIES.BASIC, 'analytics'];
  const res = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST',
    body: { planId: 'BASIC', agreedAmount: 450, paymentMode: 'CASH', durationValue: 3, durationUnit: 'MONTHS', enabledFeatures: features },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  assert.deepEqual(res.body.subscription.customFeatures.sort(), [...features].sort());

  const analytics = await call('/api/app/analytics', { headers: r.headers });
  assert.equal(analytics.status, 200, 'the extra feature is unlocked on Basic');

  const edit = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan/${res.body.grant.id}`, {
    method: 'PATCH',
    body: { enabledFeatures: PLAN_CAPABILITIES.BASIC, extendBy: { value: 10, unit: 'DAYS' } },
  });
  assert.equal(edit.status, 200, JSON.stringify(edit.body));
  assert.equal(edit.body.subscription.customFeatures, null, 'back to the plan default');
  assert.ok(new Date(edit.body.subscription.expiresAt) > new Date(res.body.subscription.expiresAt));

  const analyticsAfter = await call('/api/app/analytics', { headers: r.headers });
  assert.equal(analyticsAfter.status, 403);
});

test('carry-over stacks the new period after the current paid expiry', async () => {
  const r = await createRestaurant({ plan: 'BASIC', status: 'ACTIVE', expiresInDays: 10 });
  const current = (await pool.query('SELECT expires_at FROM subscriptions WHERE tenant_id = $1', [r.tenantId])).rows[0];
  const res = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST',
    body: { planId: 'PREMIUM', agreedAmount: 2000, paymentMode: 'BANK_TRANSFER', durationValue: 30, durationUnit: 'DAYS', carryOverRemainingDays: true },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  const expected = new Date(current.expires_at).getTime() + 30 * 86_400_000;
  assert.ok(Math.abs(new Date(res.body.subscription.expiresAt).getTime() - expected) < 2 * 3_600_000);
});

test('a new offline plan supersedes the previous one; revoking the current one blocks access', async () => {
  const r = await createRestaurant();
  const first = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST', body: { planId: 'BASIC', agreedAmount: 100, paymentMode: 'CASH', durationValue: 1, durationUnit: 'MONTHS' },
  });
  const second = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST', body: { planId: 'INTERMEDIATE', agreedAmount: 200, paymentMode: 'CASH', durationValue: 1, durationUnit: 'MONTHS' },
  });
  assert.equal(second.status, 201);
  const statuses = Object.fromEntries(second.body.grants.map((g) => [g.id, g.status]));
  assert.equal(statuses[first.body.grant.id], 'SUPERSEDED');
  assert.equal(statuses[second.body.grant.id], 'ACTIVE');

  // Editing a superseded grant is refused.
  const staleEdit = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan/${first.body.grant.id}`, {
    method: 'PATCH', body: { extendBy: { value: 1, unit: 'DAYS' } },
  });
  assert.equal(staleEdit.status, 409);

  const revoke = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan/${second.body.grant.id}/revoke`, {
    method: 'POST', body: { reason: 'Payment bounced' },
  });
  assert.equal(revoke.status, 200, JSON.stringify(revoke.body));
  assert.equal(revoke.body.subscription.status, 'EXPIRED');
  const owner = await call('/api/app/subscription', { headers: r.headers });
  assert.equal(owner.body.active, false);

  const again = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan/${second.body.grant.id}/revoke`, { method: 'POST', body: {} });
  assert.equal(again.status, 409);
});

test('grants are scoped to their restaurant (no cross-tenant edits)', async () => {
  const a = await createRestaurant();
  const b = await createRestaurant();
  const grant = await asAdmin(`/api/admin/clients/${a.tenantId}/manual-plan`, {
    method: 'POST', body: { planId: 'BASIC', agreedAmount: 100, paymentMode: 'CASH', durationValue: 1, durationUnit: 'MONTHS' },
  });
  const crossRevoke = await asAdmin(`/api/admin/clients/${b.tenantId}/manual-plan/${grant.body.grant.id}/revoke`, { method: 'POST', body: {} });
  assert.equal(crossRevoke.status, 404);
  const stillActive = (await pool.query('SELECT status FROM manual_plan_grants WHERE id = $1', [grant.body.grant.id])).rows[0];
  assert.equal(stillActive.status, 'ACTIVE');
});

test('invalid activation input is rejected and unknown restaurants 404', async () => {
  const r = await createRestaurant();
  const bad = await asAdmin(`/api/admin/clients/${r.tenantId}/manual-plan`, {
    method: 'POST', body: { planId: 'GOLD', agreedAmount: 100, paymentMode: 'CASH', durationValue: 1, durationUnit: 'MONTHS' },
  });
  assert.equal(bad.status, 400);
  const missing = await asAdmin(`/api/admin/clients/${randomUUID()}/manual-plan`, {
    method: 'POST', body: { planId: 'BASIC', agreedAmount: 100, paymentMode: 'CASH', durationValue: 1, durationUnit: 'MONTHS' },
  });
  assert.equal(missing.status, 404);
});

test('admin can extend a free trial, but not a paid plan', async () => {
  const trial = await createRestaurant({ plan: 'PREMIUM', status: 'TRIAL', expiresInDays: -1, source: 'TRIAL' });
  const res = await asAdmin(`/api/admin/clients/${trial.tenantId}/extend-trial`, { method: 'POST', body: { days: 7 } });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.equal(res.body.subscription.status, 'TRIAL');
  const daysLeft = (new Date(res.body.subscription.expiresAt) - Date.now()) / 86_400_000;
  assert.ok(daysLeft > 6.9 && daysLeft < 7.1, `expired trial restarts from today: ${daysLeft}`);
  const owner = await call('/api/app/subscription', { headers: trial.headers });
  assert.equal(owner.body.active, true);

  const paid = await createRestaurant();
  const refused = await asAdmin(`/api/admin/clients/${paid.tenantId}/extend-trial`, { method: 'POST', body: { days: 7 } });
  assert.equal(refused.status, 409);
  const tooMany = await asAdmin(`/api/admin/clients/${trial.tenantId}/extend-trial`, { method: 'POST', body: { days: 500 } });
  assert.equal(tooMany.status, 400);
});

test('admin client list reports real subscription status', async () => {
  const r = await createRestaurant({ plan: 'INTERMEDIATE', status: 'ACTIVE', expiresInDays: 20 });
  const list = await asAdmin('/api/admin/clients');
  assert.equal(list.status, 200);
  const row = list.body.find((c) => c.id === r.tenantId);
  assert.equal(row.plan, 'INTERMEDIATE');
  assert.equal(row.subscription.status, 'ACTIVE');
  assert.equal(row.subscription.isExpired, false);
});

// ── Monthly online-order limit (150 included) and extra packs (₹99 per 50) ───

async function createOrderingRestaurant(plan = 'PREMIUM') {
  const r = await createRestaurant({ plan, status: 'ACTIVE', expiresInDays: 30 });
  const menuId = randomUUID();
  const categoryId = randomUUID();
  r.itemId = randomUUID();
  await pool.query("INSERT INTO menus (id, tenant_id, name, status) VALUES ($1,$2,'Menu','PUBLISHED')", [menuId, r.tenantId]);
  await pool.query("INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,'Mains',1)", [categoryId, menuId, r.tenantId]);
  await pool.query(
    "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1,$2,$3,$4,'Dal',120,true)",
    [r.itemId, menuId, r.tenantId, categoryId]
  );
  return r;
}

/** Insert `count` customer orders directly (fast) with a status and an age in days. */
async function seedOrders(tenantId, count, { status = 'DELIVERED', daysAgo = 0 } = {}) {
  await pool.query(
    `INSERT INTO customer_orders (id, tenant_id, total, status, created_at)
     SELECT 'seed-' || $5::text || '-' || g, $1::text, 100, $2::text, now() - ($3::text || ' days')::interval
     FROM generate_series(1, $4::int) g`,
    [tenantId, status, String(daysAgo), count, randomUUID()]
  );
}

// Each call uses a new table: the app treats an identical order sent twice within a short window
// as an accidental double tap and answers with the first order (HTTP 200).
let tableCounter = 0;
const placeOrder = (r, extra = {}) =>
  call(`/api/public/menus/${r.slug}/orders`, {
    method: 'POST',
    body: { items: [{ id: r.itemId, quantity: 1 }], orderType: 'DINE_IN', tableNumber: `T${++tableCounter}`, customerName: 'Guest One', ...extra },
  });

test('the 150th order of the month is accepted, the 151st is refused', async () => {
  const r = await createOrderingRestaurant();
  await seedOrders(r.tenantId, 149);
  const ok = await placeOrder(r);
  assert.equal(ok.status, 201, JSON.stringify(ok.body) + serverStderr);
  const blocked = await placeOrder(r);
  assert.equal(blocked.status, 403);
  assert.match(blocked.body.error, /not accepting more online orders/i);

  const usage = await call('/api/app/order-usage', { headers: r.headers });
  assert.equal(usage.status, 200);
  assert.equal(usage.body.used, 150);
  assert.equal(usage.body.limit, 150);
  assert.equal(usage.body.exceeded, true);
  assert.equal(usage.body.remaining, 0);
});

test("cancelled orders and last month's orders do not count", async () => {
  const r = await createOrderingRestaurant();
  await seedOrders(r.tenantId, 100);
  await seedOrders(r.tenantId, 60, { status: 'CANCELLED' });
  await seedOrders(r.tenantId, 200, { daysAgo: 45 });
  const usage = await call('/api/app/order-usage', { headers: r.headers });
  assert.equal(usage.body.used, 100);
  assert.equal(usage.body.remaining, 50);
  assert.equal(usage.body.exceeded, false);
  assert.equal((await placeOrder(r)).status, 201);
});

test('retrying an order that was already accepted is not blocked at the limit', async () => {
  const r = await createOrderingRestaurant();
  await seedOrders(r.tenantId, 149);
  const first = await call(`/api/public/menus/${r.slug}/orders`, {
    method: 'POST',
    body: { items: [{ id: r.itemId, quantity: 1 }], orderType: 'DINE_IN', tableNumber: 'RETRY', customerName: 'Guest One', idempotencyKey: 'retry-key-1' },
  });
  assert.equal(first.status, 201, JSON.stringify(first.body));
  const replay = await call(`/api/public/menus/${r.slug}/orders`, {
    method: 'POST',
    body: { items: [{ id: r.itemId, quantity: 1 }], orderType: 'DINE_IN', tableNumber: 'RETRY', customerName: 'Guest One', idempotencyKey: 'retry-key-1' },
  });
  assert.equal(replay.status, 200, 'same key returns the existing order');
  assert.equal(replay.body.id, first.body.id);
  const another = await placeOrder(r, { idempotencyKey: 'retry-key-2' });
  assert.equal(another.status, 403);
});

test('admin adds extra order packs for an offline payment and customers can order again', async () => {
  const r = await createOrderingRestaurant();
  await seedOrders(r.tenantId, 150);
  assert.equal((await placeOrder(r)).status, 403);

  const res = await asAdmin(`/api/admin/clients/${r.tenantId}/order-packs`, {
    method: 'POST', body: { packs: 2, paymentMode: 'CASH', paymentReference: 'RCPT-9' },
  });
  assert.equal(res.status, 201, JSON.stringify(res.body) + serverStderr);
  assert.equal(res.body.orderUsage.limit, 250);
  assert.equal(res.body.orderUsage.extraOrders, 100);
  assert.equal(res.body.orderUsage.exceeded, false);
  assert.equal(res.body.orderPacks[0].amount, 198, 'defaults to ₹99 per pack');
  assert.equal(res.body.orderPacks[0].source, 'MANUAL');
  assert.ok(res.body.events.some((e) => e.eventType === 'ORDER_PACK_GRANTED'));

  assert.equal((await placeOrder(r)).status, 201);
  const usage = await call('/api/app/order-usage', { headers: r.headers });
  assert.equal(usage.body.limit, 250);
  assert.equal(usage.body.used, 151);
});

test('order pack grants validate input and require a super admin', async () => {
  const r = await createOrderingRestaurant();
  const url = `/api/admin/clients/${r.tenantId}/order-packs`;
  for (const body of [
    { packs: 0, paymentMode: 'CASH' },
    { packs: 21, paymentMode: 'CASH' },
    { packs: 1.5, paymentMode: 'CASH' },
    { packs: 1, paymentMode: 'BITCOIN' },
    { packs: 1, paymentMode: 'CASH', amount: -5 },
  ]) {
    assert.equal((await asAdmin(url, { method: 'POST', body })).status, 400, JSON.stringify(body));
  }
  assert.equal((await asAdmin(`/api/admin/clients/${randomUUID()}/order-packs`, { method: 'POST', body: { packs: 1, paymentMode: 'CASH' } })).status, 404);
  assert.equal((await call(url, { method: 'POST', body: { packs: 1, paymentMode: 'CASH' } })).status, 401);
  const asOwner = await call(url, { method: 'POST', body: { packs: 1, paymentMode: 'CASH' }, headers: r.headers });
  assert.ok([401, 403].includes(asOwner.status));
  const rows = await pool.query('SELECT 1 FROM order_pack_purchases WHERE tenant_id = $1', [r.tenantId]);
  assert.equal(rows.rows.length, 0, 'nothing was granted');
});

test('online pack purchase: ₹99 per pack, granted once after payment, no plan invoice', async () => {
  const r = await createOrderingRestaurant();
  await seedOrders(r.tenantId, 150);

  const init = await call('/api/app/order-packs/initiate', { method: 'POST', body: { packs: 3 }, headers: r.headers });
  assert.equal(init.status, 200, JSON.stringify(init.body) + serverStderr);
  assert.equal(init.body.amount, 297);
  assert.equal(init.body.ordersAdded, 150);
  assert.ok(init.body.paymentSessionId);

  const order = (await pool.query('SELECT order_subtype, amount, status FROM orders WHERE id = $1', [init.body.orderId])).rows[0];
  assert.equal(order.order_subtype, 'ORDER_PACK');
  assert.equal(Number(order.amount), 297);
  assert.equal(order.status, 'PENDING_PAYMENT');
  const before = await call('/api/app/order-usage', { headers: r.headers });
  assert.equal(before.body.limit, 150, 'nothing is granted before payment');

  const paid = await processOrderPaymentAndProvision({ orderId: init.body.orderId, mockSuccess: true });
  assert.equal(paid.provisioning_status, 'COMPLETE', JSON.stringify(paid));
  const again = await processOrderPaymentAndProvision({ orderId: init.body.orderId, mockSuccess: true });
  assert.equal(again.provisioning_status, 'COMPLETE');

  const grants = (await pool.query('SELECT packs, orders_added, source, amount FROM order_pack_purchases WHERE tenant_id = $1', [r.tenantId])).rows;
  assert.equal(grants.length, 1, 'verifying twice grants the packs once');
  assert.equal(grants[0].orders_added, 150);
  assert.equal(grants[0].source, 'ONLINE');
  assert.equal(Number(grants[0].amount), 297);
  const invoices = await pool.query('SELECT 1 FROM gst_invoices WHERE order_id = $1', [init.body.orderId]);
  assert.equal(invoices.rows.length, 0, 'packs must not be invoiced at the plan price');

  const after = await call('/api/app/order-usage', { headers: r.headers });
  assert.equal(after.body.limit, 300);
  assert.equal(after.body.exceeded, false);
  assert.equal((await placeOrder(r)).status, 201);
});

test('pack purchase is limited to 1–20 packs and to plans with online ordering', async () => {
  const premium = await createOrderingRestaurant();
  for (const packs of [0, 21, 2.5, 'x']) {
    const res = await call('/api/app/order-packs/initiate', { method: 'POST', body: { packs }, headers: premium.headers });
    assert.equal(res.status, 400, `packs=${packs}`);
  }
  const basic = await createRestaurant({ plan: 'BASIC' });
  const refused = await call('/api/app/order-packs/initiate', { method: 'POST', body: { packs: 1 }, headers: basic.headers });
  assert.equal(refused.status, 403);
  const none = await pool.query("SELECT 1 FROM orders WHERE order_subtype = 'ORDER_PACK' AND metadata->>'tenant_id' = $1", [basic.tenantId]);
  assert.equal(none.rows.length, 0, 'no payment order was created');
});

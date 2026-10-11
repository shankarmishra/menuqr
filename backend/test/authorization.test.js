import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool, connectDB } from '../db.js';
import { hashPassword, generateAuthToken, generateAuthCookie } from '../auth.js';
import { generateCsrfToken } from '../csrf.js';
import { requestAdminOtp } from '../adminAuth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run the authorization integration tests.');
}

let serverProcess;
let baseUrl;
let serverStdout = '';
let serverStderr = '';
let serverReady = false;

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Backend did not become ready.')), 15_000);
    const poll = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) {
          clearTimeout(timeout);
          serverReady = true;
          resolve();
          return;
        }
      } catch {}
      setTimeout(poll, 100);
    };
    poll();
  });
}

function requestJson(url, options = {}) {
  const headers = {
    'content-type': 'application/json',
    ...options.headers,
  };
  if (options.method === 'GET' || options.method === 'HEAD') {
    delete headers['content-type'];
  }
  return fetch(url, {
    ...options,
    headers,
    body: options.method === 'GET' || options.method === 'HEAD' ? undefined : options.body,
  }).then(async response => {
    const text = await response.text();
    let body = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
    }
    return { response, body };
  });
}

async function startServer() {
  const port = await getAvailablePort();
  baseUrl = `http://127.0.0.1:${port}`;
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      API_PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', chunk => {
    serverStdout += chunk.toString();
  });
  serverProcess.stderr.on('data', chunk => {
    serverStderr += chunk.toString();
  });

  await waitForServer();
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function stopServer() {
  if (!serverProcess || serverProcess.exitCode !== null) return;
  serverProcess.kill('SIGTERM');
  await new Promise(resolve => serverProcess.once('exit', resolve));
}

async function cleanupFixture(fixtureId) {
  const tables = [
    'activity_logs',
    'notifications',
    'sticker_request_events',
    'sticker_requests',
    'payments',
    'orders',
    'customer_orders',
    'menu_items',
    'menu_categories',
    'menus',
    'appearance_settings',
    'subscription_content_usage',
    'subscription_feature_usage',
    'tenant_qr_identity',
    'qr_codes',
    'subscriptions',
    'users',
    'clients',
    'sessions',
  ];
  for (const table of tables) {
    try {
      await pool.query(`DELETE FROM ${table} WHERE tenant_id = $1 OR id = $1`, [fixtureId, fixtureId]);
    } catch (error) {
      // Cleanup is best-effort; the fixture is isolated by UUID.
    }
  }
}

async function createFixture(plan, status, overrides = {}) {
  const fixtureId = randomUUID();
  const userId = randomUUID();
  const clientId = fixtureId;
  const publicId = randomUUID().slice(0, 12);
  const menuId = randomUUID();
  const categoryId = randomUUID();
  const itemId = randomUUID();
  const qrId = randomUUID();
  const subscriptionId = randomUUID();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  const expiredAt = new Date(now);
  expiredAt.setDate(expiredAt.getDate() - 1);
  const effectiveStatus = status || 'ACTIVE';
  const effectiveExpiry = overrides.expiryAt || expiresAt;

  await pool.query(
    'INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1,$2,$3,$4,$5)',
    [clientId, publicId, `Authorization ${plan} ${effectiveStatus}`, `auth-${publicId}`, 'active']
  );
  await pool.query(
    'INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, `auth-${fixtureId}@example.invalid`, await hashPassword('authorization-test-password'), 'RESTAURANT_OWNER', clientId, 'COMPLETED']
  );
  await pool.query(
    'INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
    [subscriptionId, clientId, plan, effectiveStatus, now, effectiveExpiry]
  );
  await pool.query(
    'INSERT INTO menus (id, tenant_id, name) VALUES ($1,$2,$3)',
    [menuId, clientId, 'Authorization Menu']
  );
  await pool.query(
    'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1,$2,$3,$4,$5)',
    [categoryId, menuId, clientId, 'Authorization Category', 1]
  );
  await pool.query(
    'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [itemId, menuId, clientId, categoryId, 'Authorization Item', 100, 1]
  );
  await pool.query(
    'INSERT INTO qr_codes (id, tenant_id, public_id, qr_id, is_active) VALUES ($1,$2,$3,$4,$5)',
    [qrId, clientId, publicId, qrId, true]
  );
  await pool.query(
    'INSERT INTO appearance_settings (id, tenant_id, template_id, restaurant_display_name) VALUES ($1,$2,$3,$4)',
    [randomUUID(), clientId, 'royal-maharaja', `Authorization ${plan}`]
  );
  const sourceOrderId = randomUUID();
  await pool.query(
    'INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, currency, status, provisioning_status, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [sourceOrderId, 'Authorization Customer', `auth-${fixtureId}@example.invalid`, `Authorization ${plan}`, plan.toLowerCase(), 100, 'INR', 'PAID', 'COMPLETE', JSON.stringify({ password_hash: '' })]
  );
  await pool.query(
    "INSERT INTO customer_orders (id, tenant_id, table_number, items, total, status) VALUES ($1,$2,$3,$4,$5,'NEW')",
    [`customer-${fixtureId}`, clientId, '1', JSON.stringify([{ id: itemId, name: 'Authorization Item', price: 100, quantity: 1 }]), 100]
  );

  const user = { id: userId, role: 'RESTAURANT_OWNER', tenantId: clientId };
  const token = generateAuthToken(user);
  const cookie = generateAuthCookie(token);
  const csrfToken = generateCsrfToken(token);
  return {
    fixtureId,
    userId,
    clientId,
    publicId,
    menuId,
    categoryId,
    itemId,
    qrId,
    subscriptionId,
    sourceOrderId,
    user,
    token,
    cookie,
    csrfToken,
    cleanup: () => cleanupFixture(fixtureId),
  };
}

async function login(fixture) {
  const { response: sessionResponse, body: sessionBody } = await requestJson(`${baseUrl}/api/auth/session`, {
    headers: headers(fixture.cookie),
  });
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionBody.authenticated, true);
  assert.equal(sessionBody.user.role, 'RESTAURANT_OWNER');
  return { sessionBody, cookie: fixture.cookie, csrfToken: sessionBody.csrfToken || fixture.csrfToken };
}

function headers(cookie) {
  return { cookie };
}

async function authenticatedRequest(fixture, path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const csrfHeaders = isStateChanging && fixture.csrfToken ? { 'X-CSRF-Token': fixture.csrfToken } : {};

  const { response, body } = await requestJson(`${baseUrl}${path}`, {
    ...options,
    headers: { ...headers(fixture.cookie), ...csrfHeaders, ...options.headers },
  });
  return { response, body };
}

async function assertProtectedEndpoint(fixture, path, method = 'GET', expectedStatus = 403) {
  const result = await authenticatedRequest(fixture, path, {
    method,
    body: method === 'GET' ? undefined : JSON.stringify({}),
  });
  assert.equal(result.response.status, expectedStatus, `${method} ${path}: ${JSON.stringify(result.body)}\nServer: ${serverStderr}`);
  return result;
}

async function assertPlanAccess(plan, expected) {
  const fixture = await createFixture(plan, 'ACTIVE');
  try {
    const category = await authenticatedRequest(fixture, '/api/app/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'Plan Test Category', menuId: fixture.menuId }),
    });
    if (category.response.status !== (expected.category ? 200 : 403)) {
      throw new Error('FAILED 403: ' + JSON.stringify(category.body));
    }
    assert.equal(category.response.status, expected.category ? 200 : 403);

    const item = await authenticatedRequest(fixture, '/api/app/items', {
      method: 'POST',
      body: JSON.stringify({ menuId: fixture.menuId, categoryId: fixture.categoryId, name: 'Plan Test Item', price: 100 }),
    });
    assert.equal(item.response.status, expected.item ? 200 : 403);

    const orders = await authenticatedRequest(fixture, '/api/app/orders', { method: 'GET' });
    assert.equal(orders.response.status, expected.orders ? 200 : 403);
  } finally {
    await fixture.cleanup();
  }
}

test.before(async () => {
  await connectDB(databaseUrl);
  await startServer();
});

test.after(async () => {
  await stopServer();
  await pool.end();
});

test('BASIC plan allows Basic features and denies Intermediate and Premium features', async () => {
  await assertPlanAccess('BASIC', { category: true, item: true, orders: false });
});

test('INTERMEDIATE plan allows Basic and Intermediate features and denies Premium features', async () => {
  await assertPlanAccess('INTERMEDIATE', { category: true, item: true, orders: false });
});

test('PREMIUM plan allows Basic, Intermediate, and Premium features', async () => {
  await assertPlanAccess('PREMIUM', { category: true, item: true, orders: true });
});

test('ACTIVE, WARNING, EXPIRING, and RENEWAL_PENDING subscriptions retain paid access', async () => {
  for (const status of ['ACTIVE', 'WARNING', 'EXPIRING', 'RENEWAL_PENDING']) {
    const fixture = await createFixture('INTERMEDIATE', status);
    try {
      const result = await authenticatedRequest(fixture, '/api/app/categories', {
        method: 'POST',
        body: JSON.stringify({ name: `Lifecycle ${status}`, menuId: fixture.menuId }),
      });
      assert.equal(result.response.status, 200);
    } finally {
      await fixture.cleanup();
    }
  }
});

test('EXPIRED, TERMINATED, and SUSPENDED subscriptions deny paid access', async () => {
  for (const status of ['EXPIRED', 'TERMINATED', 'SUSPENDED']) {
    const fixture = await createFixture('PREMIUM', status);
    try {
      await assertProtectedEndpoint(fixture, '/api/app/orders', 'GET', 403);
    } finally {
      await fixture.cleanup();
    }
  }
});

test('scheduled cancellation retains paid access until paid-through expiry', async () => {
  const fixture = await createFixture('PREMIUM', 'CANCELLED', { expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  try {
    const result = await assertProtectedEndpoint(fixture, '/api/app/orders', 'GET', 200);
    assert.equal(result.response.status, 200);
  } finally {
    await fixture.cleanup();
  }
});

test('expired clients can access account identity and subscription status but not paid features', async () => {
  const fixture = await createFixture('PREMIUM', 'EXPIRED', { expiryAt: new Date(Date.now() - 60_000) });
  try {
    const profile = await authenticatedRequest(fixture, '/api/app/profile');
    assert.equal(profile.response.status, 200);
    assert.equal(profile.body.businessName, `Authorization PREMIUM EXPIRED`);

    const subscription = await authenticatedRequest(fixture, '/api/app/subscription');
    assert.equal(subscription.response.status, 200);
    assert.equal(subscription.body.status, 'EXPIRED');

    await assertProtectedEndpoint(fixture, '/api/app/orders', 'GET', 403);
    await assertProtectedEndpoint(fixture, '/api/app/categories', 'POST', 403);
  } finally {
    await fixture.cleanup();
  }
});

test('expired clients can reach the renewal/upgrade flow but cannot use paid features', async () => {
  const fixture = await createFixture('BASIC', 'EXPIRED', { expiryAt: new Date(Date.now() - 60_000) });
  try {
    const renewal = await authenticatedRequest(fixture, '/api/app/subscription/renew', {
      method: 'POST',
      body: JSON.stringify({ planId: 'INTERMEDIATE' }),
    });
    assert.equal(renewal.response.status, 400);
    assert.equal(renewal.body.error, 'Please use the checkout page to renew your subscription. Free renewals are not allowed.');
    await assertProtectedEndpoint(fixture, '/api/app/categories', 'POST', 403);
  } finally {
    await fixture.cleanup();
  }
});

test('expired clients can log in and complete account recovery without paid access', async () => {
  const fixture = await createFixture('PREMIUM', 'EXPIRED', { expiryAt: new Date(Date.now() - 60_000) });
  try {
    const session = await login(fixture);
    assert.equal(session.sessionBody.authenticated, true);

    const profile = await requestJson(`${baseUrl}/api/app/profile`, { headers: headers(session.cookie) });
    assert.equal(profile.response.status, 200);

    const subscription = await requestJson(`${baseUrl}/api/app/subscription`, { headers: headers(session.cookie) });
    assert.equal(subscription.response.status, 200);
    assert.equal(subscription.body.status, 'EXPIRED');

    const renewal = await requestJson(`${baseUrl}/api/app/subscription/renew`, {
      method: 'POST',
      headers: { ...headers(session.cookie), 'X-CSRF-Token': session.csrfToken },
      body: JSON.stringify({ planId: 'PREMIUM' }),
    });
    assert.equal(renewal.response.status, 400);
    await assertProtectedEndpoint(fixture, '/api/app/orders', 'GET', 403);
  } finally {
    await fixture.cleanup();
  }
});

test('current database role overrides stale JWT role claims', async () => {
  const fixture = await createFixture('PREMIUM', 'ACTIVE');
  try {
    await pool.query("UPDATE users SET role = 'CUSTOMER' WHERE id = $1", [fixture.userId]);
    const result = await authenticatedRequest(fixture, '/api/app/profile');
    assert.equal(result.response.status, 403);
  } finally {
    await fixture.cleanup();
  }
});

test('onboarding persists submitted restaurant and menu before first QR creation', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    await pool.query('DELETE FROM qr_codes WHERE tenant_id = $1', [fixture.clientId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [fixture.clientId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [fixture.clientId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [fixture.clientId]);

    const onboarding = await authenticatedRequest(fixture, '/api/app/onboarding/save', {
      method: 'POST',
      body: JSON.stringify({
        businessName: 'Real Onboarding Cafe',
        tagline: 'Freshly made',
        phone: '+91 9876543210',
        city: 'Pune',
        address: '12 Market Road',
        menuName: 'Lunch Menu',
        categories: [{ name: 'Mains', description: 'Main dishes' }],
        items: [{ categoryIndex: 0, name: 'House Thali', description: 'Seasonal meal', price: 325, imageUrl: 'https://example.invalid/thali.jpg', dietType: 'veg', available: true }],
      }),
    });
    assert.equal(onboarding.response.status, 200, JSON.stringify(onboarding.body));

    const client = await pool.query('SELECT business_name, tagline, phone, city, address FROM clients WHERE id = $1', [fixture.clientId]);
    assert.deepEqual(client.rows[0], {
      business_name: 'Real Onboarding Cafe',
      tagline: 'Freshly made',
      phone: '+91 9876543210',
      city: 'Pune',
      address: '12 Market Road',
    });
    const menu = await pool.query(
      'SELECT m.name AS menu_name, c.name AS category_name, i.name AS item_name, i.price, i.image_url FROM menus m JOIN menu_categories c ON c.menu_id = m.id JOIN menu_items i ON i.category_id = c.id WHERE m.tenant_id = $1',
      [fixture.clientId]
    );
    assert.equal(menu.rows.length, 1);
    assert.equal(menu.rows[0].menu_name, 'Lunch Menu');
    assert.equal(menu.rows[0].category_name, 'Mains');
    assert.equal(menu.rows[0].item_name, 'House Thali');
    assert.equal(Number(menu.rows[0].price), 325);
    assert.equal(menu.rows[0].image_url, 'https://example.invalid/thali.jpg');
    const qrCount = await pool.query('SELECT COUNT(*)::int AS count FROM qr_codes WHERE tenant_id = $1', [fixture.clientId]);
    assert.equal(qrCount.rows[0].count, 0);
    const firstQr = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(firstQr.response.status, 201);
    assert.equal(firstQr.body.created, true);
    const retryQr = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(retryQr.body.created, false);
    assert.equal(retryQr.body.qrId, firstQr.body.qrId);
  } finally {
    await fixture.cleanup();
  }
});

test('first QR creation is idempotent and resolves the latest saved menu content', async () => {
  const fixture = await createFixture('INTERMEDIATE', 'ACTIVE');
  try {
    const discovered = await authenticatedRequest(fixture, '/api/app/qr');
    assert.equal(discovered.response.status, 200);
    assert.equal(discovered.body.qrId, fixture.qrId);
    const first = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(first.response.status, 201);
    assert.equal(first.body.created, false);
    const repeated = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(repeated.response.status, 201);
    assert.equal(repeated.body.qrId, first.body.qrId);
    assert.equal(repeated.body.created, false);

    const update = await authenticatedRequest(fixture, `/api/app/items/${fixture.itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Live Menu Update', price: 475 }),
    });
    assert.equal(update.response.status, 200);
    const themeUpdate = await authenticatedRequest(fixture, '/api/app/appearance', {
      method: 'PUT',
      body: JSON.stringify({ templateId: 'indian-street-kitchen' }),
    });
    assert.equal(themeUpdate.response.status, 200);

    const scan = await requestJson(`${baseUrl}/api/public/qr/${encodeURIComponent(first.body.qrId)}`);
    assert.equal(scan.response.status, 200);
    const scannedItem = scan.body.items.find((item) => item.id === fixture.itemId);
    assert.equal(scannedItem.name, 'Live Menu Update');
    assert.equal(scannedItem.price, 475);
    assert.equal(scan.body.templateId, 'indian-street-kitchen');

    const qrRows = await pool.query('SELECT COUNT(*)::int AS count FROM qr_codes WHERE tenant_id = $1', [fixture.clientId]);
    assert.equal(qrRows.rows[0].count, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('request-body plan and status values cannot grant entitlement', async () => {
  const fixture = await createFixture('BASIC', 'EXPIRED');
  try {
    const result = await authenticatedRequest(fixture, '/api/app/appearance', {
      method: 'PUT',
      body: JSON.stringify({ templateId: 'premium-template', plan: 'premium', subscriptionStatus: 'ACTIVE', featureFlags: ['templates_limited'] }),
    });
    assert.equal(result.response.status, 403);
  } finally {
    await fixture.cleanup();
  }
});

test('tenant A cannot access or modify tenant B resources', async () => {
  const tenantA = await createFixture('PREMIUM', 'ACTIVE');
  const tenantB = await createFixture('PREMIUM', 'ACTIVE');
  try {
    const getB = await authenticatedRequest(tenantA, `/api/app/categories/${tenantB.categoryId}`, { method: 'PUT', body: JSON.stringify({ name: 'Stolen' }) });
    assert.equal(getB.response.status, 404);

    const mutateB = await authenticatedRequest(tenantA, '/api/app/items', {
      method: 'POST',
      body: JSON.stringify({ menuId: tenantB.menuId, categoryId: tenantB.categoryId, name: 'Cross-tenant item', price: 100 }),
    });
    assert.equal(mutateB.response.status, 403);

    const orderB = await authenticatedRequest(tenantA, '/api/app/orders', { method: 'GET' });
    assert.equal(orderB.response.status, 200);
    assert.equal(orderB.body.length, 1);

    const tenantDirty = await authenticatedRequest(tenantA, '/api/app/settings', {
      method: 'PATCH',
      body: JSON.stringify({ businessName: 'Tenant A tampered identity', tenantId: tenantB.clientId, clientId: tenantB.clientId, restaurantId: tenantB.clientId }),
    });
    assert.equal(tenantDirty.response.status, 200);
    const clientAfter = await pool.query('SELECT id, business_name FROM clients WHERE id=$1', [tenantA.clientId]);
    assert.equal(clientAfter.rows[0].business_name, 'Tenant A tampered identity');
    assert.equal(clientAfter.rows[0].id, tenantA.clientId);
  } finally {
    await tenantA.cleanup();
    await tenantB.cleanup();
  }
});

test('changing resource IDs and client identifiers cannot cross tenant boundaries', async () => {
  const fixture = await createFixture('PREMIUM', 'ACTIVE');
  const foreign = await createFixture('PREMIUM', 'ACTIVE');
  try {
    const foreignMenu = await authenticatedRequest(fixture, '/api/app/items', {
      method: 'POST',
      body: JSON.stringify({ menuId: foreign.menuId, categoryId: foreign.categoryId, name: 'Foreign item', price: 100 }),
    });
    assert.equal(foreignMenu.response.status, 403);

    const foreignCategory = await authenticatedRequest(fixture, '/api/app/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'Foreign category', menuId: foreign.menuId }),
    });
    assert.equal(foreignCategory.response.status, 403);

    const foreignOrder = await authenticatedRequest(fixture, '/api/app/orders', { method: 'GET' });
    assert.equal(foreignOrder.response.status, 200);
    assert.equal(foreignOrder.body.length, 1);
  } finally {
    await fixture.cleanup();
    await foreign.cleanup();
  }
});

test('Basic allows 20 saved content changes then blocks change 21 across login', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    for (let change = 1; change <= 20; change += 1) {
      const result = await authenticatedRequest(fixture, `/api/app/items/${fixture.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: `Saved Edit ${change}`, price: 100 + change }),
      });
      assert.equal(result.response.status, 200, `Content change ${change}: ${JSON.stringify(result.body)}`);
    }

    const usage = await authenticatedRequest(fixture, '/api/app/subscription');
    assert.equal(usage.response.status, 200);
    assert.equal(usage.body.contentChangesUsed, 20);
    assert.equal(usage.body.contentChangesRemaining, 0);

    const twentyFirst = await authenticatedRequest(fixture, `/api/app/items/${fixture.itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Blocked Edit 21', price: 999 }),
    });
    assert.equal(twentyFirst.response.status, 403);

    const persisted = await pool.query('SELECT name, price FROM menu_items WHERE id=$1', [fixture.itemId]);
    assert.equal(persisted.rows[0].name, 'Saved Edit 20');
    assert.equal(Number(persisted.rows[0].price), 120);

    const reLogin = await login(fixture);
    assert.equal(reLogin.sessionBody.authenticated, true);
    const afterLogin = await requestJson(`${baseUrl}/api/app/items/${fixture.itemId}`, {
      method: 'PUT',
      headers: { cookie: reLogin.cookie, 'X-CSRF-Token': reLogin.csrfToken },
      body: JSON.stringify({ name: 'Post-login Edit', price: 100 }),
    });
    assert.equal(afterLogin.response.status, 403);

    const persistedUsage = await requestJson(`${baseUrl}/api/app/subscription`, { headers: headers(reLogin.cookie) });
    assert.equal(persistedUsage.response.status, 200);
    assert.equal(persistedUsage.body.contentChangesUsed, 20);
  } finally {
    await fixture.cleanup();
  }
});

test('Basic counts category, item, price, photo, availability, and delete mutations', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    const category = await authenticatedRequest(fixture, '/api/app/categories', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Category', menuId: fixture.menuId }),
    });
    assert.equal(category.response.status, 200);

    const item = await authenticatedRequest(fixture, '/api/app/items', {
      method: 'POST',
      body: JSON.stringify({ menuId: fixture.menuId, categoryId: category.body.id, name: 'Photo Dish', price: 199, imageUrl: 'https://example.invalid/new.jpg' }),
    });
    assert.equal(item.response.status, 200);

    const edit = await authenticatedRequest(fixture, `/api/app/items/${item.body.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: 'Photo Dish Updated', price: 249, imageUrl: 'https://example.invalid/updated.jpg' }),
    });
    assert.equal(edit.response.status, 200);

    const availability = await authenticatedRequest(fixture, `/api/app/items/${item.body.id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable: false }),
    });
    assert.equal(availability.response.status, 200);

    const deleteItem = await authenticatedRequest(fixture, `/api/app/items/${item.body.id}`, { method: 'DELETE', body: '{}' });
    assert.equal(deleteItem.response.status, 200);
    const deleteCategory = await authenticatedRequest(fixture, `/api/app/categories/${category.body.id}`, { method: 'DELETE', body: '{}' });
    assert.equal(deleteCategory.response.status, 200);

    const subscription = await authenticatedRequest(fixture, '/api/app/subscription');
    assert.equal(subscription.body.contentChangesUsed, 6);
    assert.equal(subscription.body.contentChangesRemaining, 14);
  } finally {
    await fixture.cleanup();
  }
});

test('sticker requests are tenant-owned and admins manage audited statuses', async () => {
  const tenantA = await createFixture('BASIC', 'ACTIVE');
  const tenantB = await createFixture('BASIC', 'ACTIVE');

  const adminEmail = 'xshankarmishra@gmail.com';
  await pool.query('DELETE FROM admin_auth_rate_limits');
  await pool.query("INSERT INTO admin_users (id, email, status) VALUES ($1, $2, 'active') ON CONFLICT (email) DO UPDATE SET status='active'", [randomUUID(), adminEmail]);
  const otpChallenge = await requestAdminOtp(adminEmail, '198.51.100.72');
  const verifyRes = await requestJson(`${baseUrl}/api/auth/admin/verify-otp`, { method: 'POST', body: JSON.stringify({ email: adminEmail, otp: otpChallenge.otp }) });
  const adminCookie = verifyRes.response.headers.get('set-cookie')?.split(';')[0];
  const adminCsrfToken = verifyRes.body.csrfToken;
  const adminHeaders = { cookie: adminCookie, 'X-CSRF-Token': adminCsrfToken };

  try {
    const qr = await authenticatedRequest(tenantA, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(qr.response.status, 201);

    const submitted = await authenticatedRequest(tenantA, '/api/app/sticker-requests', {
      method: 'POST',
      body: JSON.stringify({
        quantity: 250,
        contactName: 'Riya Sharma',
        contactPhone: '+91 9876543210',
        contactEmail: `auth-${tenantA.fixtureId}@example.invalid`,
        deliveryAddress: '14 Market Road',
        deliveryCity: 'Pune',
        deliveryState: 'Maharashtra',
        deliveryPostalCode: '411001',
        notes: 'Call on arrival',
      }),
    });
    assert.equal(submitted.response.status, 201, JSON.stringify(submitted.body));
    assert.equal(submitted.body.status, 'PENDING');
    assert.equal(submitted.body.quantity, 250);
    assert.equal(submitted.body.qrId, qr.body.qrId);

    const ownRequests = await authenticatedRequest(tenantA, '/api/app/sticker-requests');
    assert.equal(ownRequests.response.status, 200);
    assert.equal(ownRequests.body.length, 1);
    const foreignRequests = await authenticatedRequest(tenantB, '/api/app/sticker-requests');
    assert.equal(foreignRequests.response.status, 200);
    assert.equal(foreignRequests.body.length, 0);

    const adminQueue = await requestJson(`${baseUrl}/api/admin/sticker-requests`, { headers: headers(adminCookie) });
    assert.equal(adminQueue.response.status, 200);
    assert.equal(adminQueue.body[0].restaurantName, `Authorization BASIC ACTIVE`);
    assert.equal(adminQueue.body[0].contactName, 'Riya Sharma');

    const deniedClientUpdate = await authenticatedRequest(tenantA, `/api/app/sticker-requests/${submitted.body.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SHIPPED' }),
    });
    assert.equal(deniedClientUpdate.response.status, 404);

    const reviewing = await requestJson(`${baseUrl}/api/admin/sticker-requests/${submitted.body.id}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'REVIEWING', note: 'Contacted restaurant.' }),
    });
    assert.equal(reviewing.response.status, 200, `${JSON.stringify(reviewing.body)}\nServer: ${serverStderr}`);
    assert.equal(reviewing.body.status, 'REVIEWING');
    const events = await pool.query('SELECT previous_status, new_status, note FROM sticker_request_events WHERE request_id = $1 ORDER BY created_at', [submitted.body.id]);
    assert.deepEqual(events.rows.map((event) => event.new_status), ['PENDING', 'REVIEWING']);

    const badTransition = await requestJson(`${baseUrl}/api/admin/sticker-requests/${submitted.body.id}`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'DELIVERED' }),
    });
    assert.equal(badTransition.response.status, 409);

    for (const status of ['CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED']) {
      const transition = await requestJson(`${baseUrl}/api/admin/sticker-requests/${submitted.body.id}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status }),
      });
      assert.equal(transition.response.status, 200, `${status}: ${JSON.stringify(transition.body)}`);
      assert.equal(transition.body.status, status);
    }
  } finally {
    await tenantA.cleanup();
    await tenantB.cleanup();
  }
});

test('Premium customers order through the permanent QR and restaurant manages the server-priced order', async () => {
  const restaurant = await createFixture('PREMIUM', 'ACTIVE');
  const otherRestaurant = await createFixture('PREMIUM', 'ACTIVE');
  try {
    const qr = await authenticatedRequest(restaurant, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(qr.response.status, 201);
    const order = await requestJson(`${baseUrl}/api/public/qr/${encodeURIComponent(qr.body.qrId)}/orders`, {
      method: 'POST',
      body: JSON.stringify({
        tableNumber: '12',
        items: [{ id: restaurant.itemId, name: 'Tampered Name', quantity: 3, price: 0.01 }],
        total: 0.03,
      }),
    });
    assert.equal(order.response.status, 201, JSON.stringify(order.body));
    assert.equal(Number(order.body.total), 300);
    assert.equal(order.body.items[0].name, 'Authorization Item');
    assert.equal(order.body.items[0].quantity, 3);

    const ownQueue = await authenticatedRequest(restaurant, '/api/app/orders');
    assert.equal(ownQueue.response.status, 200);
    assert.equal(ownQueue.body.some((entry) => entry.id === order.body.id), true);
    const foreignQueue = await authenticatedRequest(otherRestaurant, '/api/app/orders');
    assert.equal(foreignQueue.body.some((entry) => entry.id === order.body.id), false);

    const updated = await authenticatedRequest(restaurant, `/api/app/orders/${order.body.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.status, 'ACCEPTED');
  } finally {
    await restaurant.cleanup();
    await otherRestaurant.cleanup();
  }
});

test('Basic cannot directly navigate to restricted app routes and the API rejects the request', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    for (const route of ['/app/appearance', '/app/orders']) {
      const api = await authenticatedRequest(fixture, `/api/app/${route.split('/').pop()}`, { method: 'GET' });
      assert.equal(api.response.status, 403);
    }
  } finally {
    await fixture.cleanup();
  }
});

test('restaurant-owner JWTs and unauthenticated requests cannot access admin APIs', async () => {
  const fixture = await createFixture('PREMIUM', 'ACTIVE');
  try {
    const ownerSession = await requestJson(`${baseUrl}/api/auth/session`, {
      headers: headers(fixture.cookie),
    });
    assert.equal(ownerSession.response.status, 200);
    assert.equal(ownerSession.body.user.role, 'RESTAURANT_OWNER');

    const ownerApi = await authenticatedRequest(fixture, '/api/admin/clients');
    assert.equal(ownerApi.response.status, 401);

    const anonymousApi = await requestJson(`${baseUrl}/api/admin/clients`);
    assert.equal(anonymousApi.response.status, 401);

    const forgedApi = await requestJson(`${baseUrl}/api/admin/clients`, {
      headers: { authorization: 'Bearer forged-token', cookie: 'menusqr_auth=forged-token' },
    });
    assert.equal(forgedApi.response.status, 401);
  } finally {
    await fixture.cleanup();
  }
});

test('renewal preserves tenant resources and changes only subscription state and period', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    const originalQr = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(originalQr.response.status, 201);
    await pool.query("UPDATE subscriptions SET status = 'EXPIRED', expires_at = $1 WHERE tenant_id = $2", [new Date(Date.now() - 60_000), fixture.clientId]);
    const before = await pool.query(
      'SELECT c.id, c.business_name, c.menu_slug, m.id AS menu_id, i.id AS item_id, q.qr_id, a.template_id FROM clients c JOIN menus m ON m.tenant_id=c.id JOIN menu_items i ON i.menu_id=m.id JOIN qr_codes q ON q.tenant_id=c.id JOIN appearance_settings a ON a.tenant_id=c.id WHERE c.id=$1',
      [fixture.clientId]
    );
    const original = before.rows[0];
    const renewal = await authenticatedRequest(fixture, `/api/purchase/renew/${fixture.sourceOrderId}`, {
      method: 'POST',
      body: JSON.stringify({ planId: 'PREMIUM', mockSuccess: true }),
    });
    assert.equal(renewal.response.status, 200);
    assert.equal(renewal.body.tenantId, fixture.clientId);

    const after = await pool.query(
      'SELECT c.id, c.business_name, c.menu_slug, m.id AS menu_id, i.id AS item_id, q.qr_id, a.template_id FROM clients c JOIN menus m ON m.tenant_id=c.id JOIN menu_items i ON i.menu_id=m.id JOIN qr_codes q ON q.tenant_id=c.id JOIN appearance_settings a ON a.tenant_id=c.id WHERE c.id=$1',
      [fixture.clientId]
    );
    assert.deepEqual(after.rows[0], original);

    const subscription = await pool.query('SELECT plan_id, status, expires_at FROM subscriptions WHERE tenant_id=$1', [fixture.clientId]);
    assert.equal(subscription.rows[0].plan_id, 'PREMIUM');
    assert.equal(subscription.rows[0].status, 'ACTIVE');
    const renewedQr = await authenticatedRequest(fixture, '/api/app/qr', { method: 'GET' });
    assert.equal(renewedQr.body.qrId, originalQr.body.qrId);
  } finally {
    await fixture.cleanup();
  }
});

test('verified Basic renewal resets the 20-change allowance without changing QR identity', async () => {
  const fixture = await createFixture('BASIC', 'ACTIVE');
  try {
    const qr = await authenticatedRequest(fixture, '/api/app/qr', { method: 'POST', body: '{}' });
    assert.equal(qr.response.status, 201);
    for (let change = 1; change <= 20; change += 1) {
      const edit = await authenticatedRequest(fixture, `/api/app/items/${fixture.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: `Pre-renewal ${change}`, price: 100 + change }),
      });
      assert.equal(edit.response.status, 200);
    }
    const atLimit = await authenticatedRequest(fixture, '/api/app/subscription');
    assert.equal(atLimit.body.contentChangesRemaining, 0);

    const renewal = await authenticatedRequest(fixture, `/api/purchase/renew/${fixture.sourceOrderId}`, {
      method: 'POST',
      body: JSON.stringify({ planId: 'BASIC', mockSuccess: true }),
    });
    assert.equal(renewal.response.status, 200);

    const after = await authenticatedRequest(fixture, '/api/app/subscription');
    assert.equal(after.body.contentChangesUsed, 0);
    assert.equal(after.body.contentChangesRemaining, 20);
    const renewedQr = await authenticatedRequest(fixture, '/api/app/qr');
    assert.equal(renewedQr.body.qrId, qr.body.qrId);
  } finally {
    await fixture.cleanup();
  }
});

test('CSRF enforcement rejects cookie-authenticated state-changing requests missing or with invalid CSRF token', async () => {
  const fixture = await createFixture('PREMIUM', 'ACTIVE');
  const otherFixture = await createFixture('PREMIUM', 'ACTIVE');
  try {
    // 1. Missing CSRF token -> 403
    const missingToken = await requestJson(`${baseUrl}/api/app/categories`, {
      method: 'POST',
      headers: { cookie: fixture.cookie },
      body: JSON.stringify({ name: 'CSRF Missing Category', menuId: fixture.menuId }),
    });
    assert.equal(missingToken.response.status, 403);
    assert.equal(missingToken.body.error, 'Forbidden: Invalid or missing CSRF token.');

    // 2. Tampered CSRF token -> 403
    const invalidToken = await requestJson(`${baseUrl}/api/app/categories`, {
      method: 'POST',
      headers: { cookie: fixture.cookie, 'x-csrf-token': 'invalid.tampered.token' },
      body: JSON.stringify({ name: 'CSRF Invalid Category', menuId: fixture.menuId }),
    });
    assert.equal(invalidToken.response.status, 403);
    assert.equal(invalidToken.body.error, 'Forbidden: Invalid or missing CSRF token.');

    // 3. CSRF token belonging to another session -> 403
    const wrongSessionToken = await requestJson(`${baseUrl}/api/app/categories`, {
      method: 'POST',
      headers: { cookie: fixture.cookie, 'x-csrf-token': otherFixture.csrfToken },
      body: JSON.stringify({ name: 'CSRF Wrong Session Category', menuId: fixture.menuId }),
    });
    assert.equal(wrongSessionToken.response.status, 403);
    assert.equal(wrongSessionToken.body.error, 'Forbidden: Invalid or missing CSRF token.');

    // 4. Valid CSRF token -> 200
    const validToken = await requestJson(`${baseUrl}/api/app/categories`, {
      method: 'POST',
      headers: { cookie: fixture.cookie, 'x-csrf-token': fixture.csrfToken },
      body: JSON.stringify({ name: 'CSRF Valid Category', menuId: fixture.menuId }),
    });
    assert.equal(validToken.response.status, 200);

    // 5. GET request with cookie does NOT require CSRF token
    const getRequest = await requestJson(`${baseUrl}/api/app/profile`, {
      headers: { cookie: fixture.cookie },
    });
    assert.equal(getRequest.response.status, 200);
  } finally {
    await fixture.cleanup();
    await otherFixture.cleanup();
  }
});

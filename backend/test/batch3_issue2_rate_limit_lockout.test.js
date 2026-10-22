import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import { getClientIp } from '../utils.js';
import authRoutes from '../routes/auth.js';
import publicRoutes from '../routes/public.js';
import { hashPassword } from '../auth.js';

function mockRequest(method, body = null, headers = {}, remoteAddress = '198.51.100.5') {
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

test('Batch 3 #2: IP spoof prevention, public order rate limits, and DB-backed account lockout', async (t) => {
  await connectDB(process.env.DATABASE_URL);
  const origTrustProxy = process.env.TRUST_PROXY;

  t.afterEach(() => {
    process.env.TRUST_PROXY = origTrustProxy;
  });

  // 1. IP SPOOFING DEFENSE TEST
  await t.test('getClientIp ignores X-Forwarded-For when TRUST_PROXY is not enabled', () => {
    delete process.env.TRUST_PROXY;
    const req = mockRequest('GET', null, { 'x-forwarded-for': '203.0.113.195, 10.0.0.1' }, '198.51.100.5');
    const ip = getClientIp(req);
    // In vulnerable code, it blindly trusted x-forwarded-for and returned '203.0.113.195'
    assert.equal(ip, '198.51.100.5', 'Must use actual socket remoteAddress when proxy is untrusted');
  });

  await t.test('getClientIp parses client IP when TRUST_PROXY is true', () => {
    process.env.TRUST_PROXY = 'true';
    const req = mockRequest('GET', null, { 'x-forwarded-for': '203.0.113.195, 10.0.0.1' }, '127.0.0.1');
    const ip = getClientIp(req);
    assert.equal(ip, '203.0.113.195');
  });

  // 2. PUBLIC ORDER RATE LIMIT TEST
  await t.test('Public order endpoint enforces per-IP and per-restaurant rate limits', async () => {
    const timestamp = Date.now();
    const tenantId = `tenant_ratelimit_${timestamp}`;
    const menuSlug = `slug-ratelimit-${timestamp}`;
    const menuId = `menu_ratelimit_${timestamp}`;
    const catId = `cat_ratelimit_${timestamp}`;
    const itemId = `item_ratelimit_${timestamp}`;

    await pool.query(
      `INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'RateLimit Diner', $3, 'active')`,
      [tenantId, `pub_${timestamp}`, menuSlug]
    );
    await pool.query(
      `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '30 DAYS')`,
      [`sub_${timestamp}`, tenantId]
    );
    await pool.query(
      `INSERT INTO menus (id, tenant_id, name) VALUES ($1, $2, 'Main Menu')`,
      [menuId, tenantId]
    );
    await pool.query(
      `INSERT INTO menu_categories (id, menu_id, tenant_id, name) VALUES ($1, $2, $3, 'Mains')`,
      [catId, menuId, tenantId]
    );
    await pool.query(
      `INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Fries', 80, true)`,
      [itemId, menuId, tenantId, catId]
    );

    try {
      const orderPayload = {
        orderType: 'DINE_IN',
        tableNumber: 'T-1',
        customerName: 'Spam Bot',
        items: [{ id: itemId, quantity: 1 }],
      };

      let rateLimited = false;
      // Send 25 orders rapidly from the same IP (limit is 30/min)
      for (let i = 0; i < 35; i++) {
        const req = mockRequest('POST', { ...orderPayload, idempotencyKey: `spam_${timestamp}_${i}` }, {}, '198.51.100.99');
        const res = mockResponse();
        try {
          await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
        } catch (err) {
          if (err.status === 429) {
            rateLimited = true;
            break;
          }
        }
      }

      assert.equal(rateLimited, true, 'Rate limit (429) must be triggered on excessive rapid order placement from same IP');
    } finally {
      await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
      await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
    }
  });

  // 3. ACCOUNT-LEVEL DB-BACKED LOGIN LOCKOUT TEST
  await t.test('5 failed attempts on an account locks it in DB across rotating IPs', async () => {
    const timestamp = Date.now();
    const userId = `user_lockout_${timestamp}`;
    const userEmail = `victim_${timestamp}@example.com`;
    const password = 'CorrectPassword123!';
    const passwordHash = await hashPassword(password);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, role, onboarding_state)
       VALUES ($1, $2, $3, 'RESTAURANT_OWNER', 'COMPLETED')`,
      [userId, userEmail, passwordHash]
    );

    try {
      // Attacker attempts 5 wrong passwords from 5 DIFFERENT IPs (IP rotation attack)
      for (let i = 1; i <= 5; i++) {
        const req = mockRequest('POST', { email: userEmail, password: `WrongPassword_${i}` }, {}, `203.0.113.${i}`);
        const res = mockResponse();
        await assert.rejects(
          async () => authRoutes(req, res, new URL('http://localhost/api/auth/login')),
          (err) => err.status === 401 || err.status === 429
        );
      }

      // Check DB: account must be recorded as locked
      const userRes = await pool.query('SELECT failed_attempts, locked_until FROM users WHERE id = $1', [userId]);
      assert.ok(userRes.rows[0].failed_attempts >= 5, 'failed_attempts must be tracked in DB');
      assert.ok(userRes.rows[0].locked_until !== null, 'locked_until must be set in DB');

      // 6th attempt with WRONG password from locked attacker IP must be rejected with 429
      const req6 = mockRequest('POST', { email: userEmail, password: 'WrongAgain' }, {}, '203.0.113.5');
      const res6 = mockResponse();
      await assert.rejects(
        async () => authRoutes(req6, res6, new URL('http://localhost/api/auth/login')),
        (err) => err.status === 429,
        'Locked IP must be rejected with 429'
      );

      // Legitimate user with correct password from their own IP is NOT locked out (Victim protection - Check b)
      const victimReq = mockRequest('POST', { email: userEmail, password: password }, {}, '198.51.100.99');
      const victimRes = mockResponse();
      await authRoutes(victimReq, victimRes, new URL('http://localhost/api/auth/login'));
      assert.equal(victimRes.statusCode, 200, 'Legitimate user with correct password is not denied service');
    } finally {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });
});

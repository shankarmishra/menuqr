import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import { createClientOtpChallenge } from '../clientAuth.js';
import { requestAdminOtp } from '../adminAuth.js';
import authRoutes from '../routes/auth.js';

function mockRequest(method, body = null, headers = {}, remoteAddress = '198.51.100.44') {
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

test('Batch 3 #4: Standalone per-IP rate limit on OTP endpoints (prevents email rotation attacks)', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const sharedIp = '203.0.113.88';

  t.after(async () => {
    await pool.query("DELETE FROM client_auth_rate_limits");
    await pool.query("DELETE FROM admin_auth_rate_limits");
    await pool.query("DELETE FROM client_otp_challenges WHERE ip_address = $1", [sharedIp]);
  });

  // 1. Client OTP standalone per-IP limit across rotated emails
  await t.test('Client OTP blocks after 5 requests from same IP even when rotating emails', async () => {
    // 5 requests with 5 different emails from the same IP
    for (let i = 1; i <= 5; i++) {
      const email = `target_user_${i}_${Date.now()}@example.com`;
      const challenge = await createClientOtpChallenge(email, sharedIp);
      assert.ok(challenge.challengeId, `Challenge ${i} should succeed`);
    }

    // 6th request with a 6th different email from the SAME IP must be BLOCKED with 429
    const email6 = `target_user_6_${Date.now()}@example.com`;
    await assert.rejects(
      async () => createClientOtpChallenge(email6, sharedIp),
      (err) => err.status === 429 && (err.message.includes('IP') || err.message.includes('Too many')),
      '6th OTP request from same IP must be rate-limited (429) despite different email'
    );
  });

  // 2. Admin OTP standalone per-IP limit
  await t.test('Admin OTP blocks after 5 requests from same IP even with rotated emails', async () => {
    const adminIp = '203.0.113.99';

    // Seed 1 active admin user
    const adminEmail = `admin_test_${Date.now()}@menusqr.in`;
    await pool.query(
      `INSERT INTO admin_users (id, email, status) VALUES ($1, $2, 'active') ON CONFLICT DO NOTHING`,
      [`adm_${Date.now()}`, adminEmail]
    );

    try {
      // 5 requests from the same IP with different/rotated emails
      for (let i = 1; i <= 5; i++) {
        const req = mockRequest('POST', { email: `admin_rotate_${i}_${Date.now()}@menusqr.in` }, {}, adminIp);
        const res = mockResponse();
        await authRoutes(req, res, new URL('http://localhost/api/auth/admin/request-otp'));
        assert.equal(res.statusCode, 200);
      }

      // 6th request from the same IP must be rate limited with 429
      const req6 = mockRequest('POST', { email: adminEmail }, {}, adminIp);
      const res6 = mockResponse();
      await assert.rejects(
        async () => authRoutes(req6, res6, new URL('http://localhost/api/auth/admin/request-otp')),
        (err) => err.status === 429,
        '6th admin OTP request from same IP must be rejected with 429'
      );
    } finally {
      await pool.query("DELETE FROM admin_users WHERE email = $1", [adminEmail]);
    }
  });
});

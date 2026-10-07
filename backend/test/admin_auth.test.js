import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool, connectDB } from '../db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run tests.');
}

const databaseName = decodeURIComponent(new URL(databaseUrl).pathname).replace(/^\/+/, '');
if (!/(?:^|[_-])test(?:$|[_-])/i.test(databaseName)) {
  throw new Error('Admin auth integration tests require a dedicated test database.');
}

process.env.JWT_SECRET = 'test-secret';
const { requestAdminOtp } = await import('../adminAuth.js');

let serverProcess;
let baseUrl;

function waitForServer() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Backend did not become ready.')), 15_000);
    const poll = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/health`);
        if (response.ok) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(poll, 250);
        }
      } catch {
        setTimeout(poll, 250);
      }
    };
    poll();
  });
}

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

test.before(async () => {
  await connectDB(databaseUrl);
  // Clear tables
  await pool.query('DELETE FROM admin_sessions');
  await pool.query('DELETE FROM admin_otp_challenges');
  await pool.query('DELETE FROM admin_auth_rate_limits');

  // Insert the 3 allowed admins
  await pool.query(`INSERT INTO admin_users (id, email, status) VALUES
    ('admin-1', 'xshankarmishra@gmail.com', 'active'),
    ('admin-2', 'qevnaro@gmail.com', 'active'),
    ('admin-3', 'menusqr.in@gmail.com', 'active')
    ON CONFLICT (email) DO UPDATE SET status = 'active'
  `);

  const port = await findFreePort();
  baseUrl = `http://127.0.0.1:${port}`;
  
  serverProcess = spawn('node', ['server.js'], {
    cwd: backendDir,
    env: { ...process.env, PORT: String(port), JWT_SECRET: 'test-secret', NODE_ENV: 'test' },
    stdio: 'ignore'
  });

  await waitForServer();
});

test.after(async () => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  await pool.end();
});

function getCookie(res, name) {
  const cookies = res.headers.get('set-cookie');
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

test('Admin Auth Flow', async (t) => {
  await t.test('unauthorized email cannot request OTP', async () => {
    const res = await fetch(`${baseUrl}/api/auth/admin/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hacker@example.com' })
    });
    
    // We expect generic success response to prevent enumeration
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.message, 'If an admin account exists, an OTP has been sent.');
    
    // Check DB: No OTP should have been generated
    const dbRes = await pool.query('SELECT * FROM admin_otp_challenges WHERE email = $1', ['hacker@example.com']);
    assert.equal(dbRes.rows.length, 0);
  });

  await t.test('allowed email can request OTP', async () => {
    for (const [index, email] of ['xshankarmishra@gmail.com', 'qevnaro@gmail.com', 'menusqr.in@gmail.com'].entries()) {
      const result = await requestAdminOtp(email, `198.51.100.${index + 1}`);
      assert.ok(result);
      assert.equal(result.email, email);

      const dbRes = await pool.query(
        'SELECT otp_hash, expires_at FROM admin_otp_challenges WHERE email = $1 AND used = false',
        [email]
      );
      assert.equal(dbRes.rows.length, 1);
      assert.notEqual(dbRes.rows[0].otp_hash, result.otp);
      assert.ok(new Date(dbRes.rows[0].expires_at) > new Date());
    }
  });

  await t.test('wrong OTP fails and increments attempts', async () => {
    const res = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'xshankarmishra@gmail.com', otp: '000000' })
    });
    assert.equal(res.status, 401);
    
    const dbRes = await pool.query('SELECT attempts FROM admin_otp_challenges WHERE email = $1 AND used = false', ['xshankarmishra@gmail.com']);
    assert.equal(dbRes.rows[0].attempts, 1);
  });

  await t.test('max attempts locks out', async () => {
    for (let i = 0; i < 4; i++) {
      await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'xshankarmishra@gmail.com', otp: '000000' })
      });
    }
    const res = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'xshankarmishra@gmail.com', otp: '000000' })
    });
    assert.equal(res.status, 429);
    const data = await res.json();
    assert.equal(data.error, 'Unable to verify sign-in. Please request a new code.');
  });

  await t.test('requesting a new code invalidates the previous code', async () => {
    const email = 'xshankarmishra@gmail.com';
    const previous = await requestAdminOtp(email, '198.51.100.21');
    const latest = await requestAdminOtp(email, '198.51.100.22');
    const previousRow = await pool.query('SELECT used FROM admin_otp_challenges WHERE id = $1', [previous.challengeId]);
    assert.equal(previousRow.rows[0].used, true);

    const staleVerify = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: previous.otp })
    });
    assert.equal(staleVerify.status, 401);
    assert.notEqual(previous.otp, latest.otp);
  });

  await t.test('correct OTP logs in and provides cookie', async () => {
    const sessions = [];
    for (const [index, email] of ['xshankarmishra@gmail.com', 'qevnaro@gmail.com', 'menusqr.in@gmail.com'].entries()) {
      const challenge = await requestAdminOtp(email, `198.51.100.${index + 11}`);
      const res = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: challenge.otp })
      });
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.authenticated, true);
      assert.equal(data.role, 'SUPER_ADMIN');

      const cookie = getCookie(res, 'menusqr_admin_session');
      assert.ok(cookie);
      sessions.push({ email, cookie, otp: challenge.otp });

      const reused = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: challenge.otp })
      });
      assert.equal(reused.status, 401);
    }

    const deactivated = sessions[0];
    await pool.query("UPDATE admin_users SET status = 'inactive' WHERE email = $1", [deactivated.email]);
    await pool.query("UPDATE admin_users SET status = 'active' WHERE email = $1", [deactivated.email]);
    const denied = await fetch(`${baseUrl}/api/admin/clients`, {
      headers: { Cookie: `menusqr_admin_session=${deactivated.cookie}` }
    });
    assert.equal(denied.status, 401);

    const stillDenied = await fetch(`${baseUrl}/api/admin/clients`, {
      headers: { Cookie: `menusqr_admin_session=${deactivated.cookie}` }
    });
    assert.equal(stillDenied.status, 401);
  });

  await t.test('expired challenge fails and unknown-email login stays generic', async () => {
    const email = 'qevnaro@gmail.com';
    const challenge = await requestAdminOtp(email, '198.51.100.31');
    await pool.query('UPDATE admin_otp_challenges SET expires_at = NOW() - INTERVAL \'1 minute\' WHERE id = $1', [challenge.challengeId]);
    const expired = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: challenge.otp })
    });
    assert.equal(expired.status, 401);

    const request = await fetch(`${baseUrl}/api/auth/admin/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@example.com' })
    });
    assert.equal(request.status, 200);
    assert.equal((await request.json()).message, 'If an admin account exists, an OTP has been sent.');
    const login = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@example.com', otp: '000000' })
    });
    assert.equal(login.status, 401);
  });

  await t.test('request rate limit rejects excessive OTP generation', async () => {
    const email = 'menusqr.in@gmail.com';
    const ip = '198.51.100.41';
    for (let attempt = 0; attempt < 3; attempt += 1) await requestAdminOtp(email, ip);
    const error = await requestAdminOtp(email, ip).then(() => null, (caught) => caught);
    assert.equal(error.status, 429);
  });
});


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
  await pool.query('DELETE FROM admin_users');

  // Insert the 3 allowed admins
  await pool.query(`INSERT INTO admin_users (id, email, status) VALUES 
    ('admin-1', 'xshankarmishra@gmail.com', 'active'),
    ('admin-2', 'qevnaro@gmail.com', 'active'),
    ('admin-3', 'menusqr.in@gmail.com', 'active')
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
    const res = await fetch(`${baseUrl}/api/auth/admin/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'xshankarmishra@gmail.com' })
    });
    
    assert.equal(res.status, 200);
    
    // Check DB: OTP should have been generated
    const dbRes = await pool.query('SELECT * FROM admin_otp_challenges WHERE email = $1 AND used = false', ['xshankarmishra@gmail.com']);
    assert.equal(dbRes.rows.length, 1);
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
    assert.equal(data.error, 'Too many failed attempts. Try again later.');
  });

  await t.test('correct OTP logs in and provides cookie', async () => {
    // Request a new OTP
    const reqRes = await fetch(`${baseUrl}/api/auth/admin/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'xshankarmishra@gmail.com' })
    });
    const reqData = await reqRes.json();
    console.log('DEBUG:', reqRes.status, reqData);
    const validOtp = reqData._testOtp;
    assert.ok(validOtp);

    // Verify
    const res = await fetch(`${baseUrl}/api/auth/admin/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'xshankarmishra@gmail.com', otp: validOtp })
    });
    const data = await res.json();
    console.log('VERIFY DEBUG:', res.status, data);
    assert.equal(res.status, 200);
    assert.equal(data.authenticated, true);
    assert.equal(data.role, 'SUPER_ADMIN');

    const setCookie = res.headers.get('set-cookie');
    console.log('SET-COOKIE HEADER:', setCookie);
    const cookie = getCookie(res, 'menusqr_admin_session');
    assert.ok(cookie);

    // Test that the OTP is marked used
    const dbRes = await pool.query('SELECT used FROM admin_otp_challenges WHERE email = $1 ORDER BY created_at DESC LIMIT 1', ['xshankarmishra@gmail.com']);
    assert.equal(dbRes.rows[0].used, true);
  });
});


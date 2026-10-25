import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, pool } from '../db.js';
import { enforceSuperAdmin, generateAuthToken } from '../auth.js';
import authRoutes from '../routes/auth.js';
import { randomBytes, createHash } from 'node:crypto';

test('enforceSuperAdmin prioritizes valid bearerToken over stale or invalid cookie', async () => {
  await connectDB(process.env.DATABASE_URL);

  const validToken = randomBytes(32).toString('hex');
  const validTokenHash = createHash('sha256').update(validToken).digest('hex');
  const sessionId = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [sessionId, 'admin-1', validTokenHash, expiresAt]
  );

  try {
    const req = {
      headers: {
        cookie: 'menusqr_admin_session=stale_invalid_cookie_from_past_session',
        authorization: `Bearer ${validToken}`,
      },
    };

    const user = await enforceSuperAdmin(req);
    assert.ok(user);
    assert.equal(user.role, 'SUPER_ADMIN');
    assert.equal(user.id, 'admin-1');
  } finally {
    await pool.query('DELETE FROM admin_sessions WHERE id = $1', [sessionId]);
  }
});

test('enforceSuperAdmin falls back to valid admin cookie when bearerToken is omitted', async () => {
  await connectDB(process.env.DATABASE_URL);

  const validCookieToken = randomBytes(32).toString('hex');
  const validCookieHash = createHash('sha256').update(validCookieToken).digest('hex');
  const sessionId = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [sessionId, 'admin-1', validCookieHash, expiresAt]
  );

  try {
    const req = {
      headers: {
        cookie: `menusqr_admin_session=${validCookieToken}`,
      },
    };

    const user = await enforceSuperAdmin(req);
    assert.ok(user);
    assert.equal(user.role, 'SUPER_ADMIN');
    assert.equal(user.id, 'admin-1');
  } finally {
    await pool.query('DELETE FROM admin_sessions WHERE id = $1', [sessionId]);
  }
});

test('/api/auth/session prioritizes active admin Bearer token over restaurant owner cookie', async () => {
  await connectDB(process.env.DATABASE_URL);

  const validToken = randomBytes(32).toString('hex');
  const validTokenHash = createHash('sha256').update(validToken).digest('hex');
  const sessionId = randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [sessionId, 'admin-1', validTokenHash, expiresAt]
  );

  try {
    // Generate a restaurant owner cookie
    const restaurantJwt = generateAuthToken({ id: '663b565a-a26f-4735-99ac-40fa8fec448e', role: 'RESTAURANT_OWNER' });

    const req = {
      method: 'GET',
      headers: {
        cookie: `menusqr_auth=${restaurantJwt}`,
        authorization: `Bearer ${validToken}`,
      },
    };

    let responseStatus = 0;
    let responseBody = '';
    const res = {
      setHeader: () => {},
      writeHead: (status) => { responseStatus = status; },
      end: (body) => { responseBody = body; },
    };

    const url = new URL('http://localhost:3001/api/auth/session');
    await authRoutes(req, res, url);

    const parsed = JSON.parse(responseBody);
    assert.equal(responseStatus, 200);
    assert.equal(parsed.authenticated, true);
    assert.equal(parsed.user.role, 'SUPER_ADMIN');
    assert.equal(parsed.user.id, 'admin-1');
  } finally {
    await pool.query('DELETE FROM admin_sessions WHERE id = $1', [sessionId]);
  }
});

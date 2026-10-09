import { randomBytes, randomInt, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { pool } from './db.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const OTP_HASH_KEY = process.env.ADMIN_OTP_PEPPER || process.env.JWT_SECRET || randomBytes(32);
const defaultAdmins = ['xshankarmishra@gmail.com', 'qevnaro@gmail.com', 'menusqr.in@gmail.com'];
const envAdmins = process.env.APPROVED_ADMIN_EMAILS
  ? process.env.APPROVED_ADMIN_EMAILS.split(',').map(e => e.replace(/["']/g, '').trim().toLowerCase()).filter(Boolean)
  : [];
const APPROVED_ADMIN_EMAILS = new Set(envAdmins.length > 0 ? envAdmins : defaultAdmins);
const APPROVED_ADMIN_EMAIL_LIST = [...APPROVED_ADMIN_EMAILS];
const REQUEST_LIMIT = 5;
const VERIFY_LIMIT = 20;
let nextRateLimitCleanupAt = 0;

function authError(message, status) {
  return Object.assign(new Error(message), { status });
}

async function incrementRateLimit(client, scope, identifier, limit) {
  const bucketKey = createHmac('sha256', OTP_HASH_KEY).update(`${scope}:${identifier || 'unknown'}`).digest('hex');
  const result = await client.query(`
    INSERT INTO admin_auth_rate_limits (bucket_key, window_started_at, hits, updated_at)
    VALUES ($1, NOW(), 1, NOW())
    ON CONFLICT (bucket_key) DO UPDATE SET
      hits = CASE
        WHEN admin_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN 1
        ELSE admin_auth_rate_limits.hits + 1
      END,
      window_started_at = CASE
        WHEN admin_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE admin_auth_rate_limits.window_started_at
      END,
      blocked_until = CASE
        WHEN admin_auth_rate_limits.blocked_until > NOW() THEN admin_auth_rate_limits.blocked_until
        WHEN admin_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN NULL
        WHEN admin_auth_rate_limits.hits + 1 > $2 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END,
      updated_at = NOW()
    RETURNING hits, blocked_until
  `, [bucketKey, limit]);

  const rateLimit = result.rows[0];
  return Number(rateLimit.hits) > limit || (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date());
}

async function applyRateLimits(client, action, email, ip, limit) {
  const ipLimited = await incrementRateLimit(client, `${action}:ip`, ip, limit);
  const emailLimited = await incrementRateLimit(client, `${action}:email`, email, limit);
  return ipLimited || emailLimited;
}

async function cleanExpiredRateLimits(client) {
  if (Date.now() < nextRateLimitCleanupAt) return;
  nextRateLimitCleanupAt = Date.now() + 60_000;
  await client.query("DELETE FROM admin_auth_rate_limits WHERE updated_at < NOW() - INTERVAL '1 day'");
}

export function generateAdminOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

export function isApprovedAdminEmail(email) {
  return APPROVED_ADMIN_EMAILS.has(String(email).trim().toLowerCase());
}

export function hashAdminOtp(otp) {
  return createHmac('sha256', OTP_HASH_KEY).update(String(otp)).digest('hex');
}

export function matchesAdminOtp(otp, storedHash) {
  if (!/^\d{6}$/.test(String(otp))) return false;
  const inputHash = Buffer.from(hashAdminOtp(otp), 'hex');
  const expectedHash = Buffer.from(String(storedHash), 'hex');
  return inputHash.length === expectedHash.length && timingSafeEqual(inputHash, expectedHash);
}

export async function requestAdminOtp(email, ip) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    await cleanExpiredRateLimits(client);

    if (await applyRateLimits(client, 'request', normalizedEmail, ip, REQUEST_LIMIT)) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Too many requests. Please try again later.', 429);
    }

    const dbUser = await client.query(
      'SELECT id, status FROM admin_users WHERE email = $1 AND email = ANY($2::text[]) FOR UPDATE',
      [normalizedEmail, APPROVED_ADMIN_EMAIL_LIST]
    );
    if (dbUser.rows.length === 0 || dbUser.rows[0].status !== 'active') {
      await client.query('COMMIT');
      transactionOpen = false;
      return null;
    }

    await client.query(
      'UPDATE admin_otp_challenges SET used = true WHERE email = $1 AND used = false',
      [normalizedEmail]
    );

    const otp = generateAdminOtp();
    const challengeId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    await client.query(
      'INSERT INTO admin_otp_challenges (id, email, otp_hash, expires_at, max_attempts) VALUES ($1, $2, $3, $4, $5)',
      [challengeId, normalizedEmail, hashAdminOtp(otp), expiresAt, MAX_OTP_ATTEMPTS]
    );
    await client.query('COMMIT');
    transactionOpen = false;

    return { otp, challengeId, email: normalizedEmail, adminId: dbUser.rows[0].id };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyAdminOtp(email, otp, ip) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    await cleanExpiredRateLimits(client);

    if (await applyRateLimits(client, 'verify', normalizedEmail, ip, VERIFY_LIMIT)) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Please request a new code.', 429);
    }

    const dbUser = await client.query(
      'SELECT id, status FROM admin_users WHERE email = $1 AND email = ANY($2::text[]) FOR UPDATE',
      [normalizedEmail, APPROVED_ADMIN_EMAIL_LIST]
    );
    if (dbUser.rows.length === 0 || dbUser.rows[0].status !== 'active') {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Check your details or request a new code.', 401);
    }

    const result = await client.query(
      'SELECT * FROM admin_otp_challenges WHERE email = $1 AND used = false ORDER BY created_at DESC LIMIT 1 FOR UPDATE',
      [normalizedEmail]
    );
    const challenge = result.rows[0];
    if (!challenge) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Check your details or request a new code.', 401);
    }

    if (new Date(challenge.expires_at) <= new Date()) {
      await client.query('UPDATE admin_otp_challenges SET used = true WHERE id = $1', [challenge.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Check your details or request a new code.', 401);
    }

    if (challenge.attempts >= challenge.max_attempts) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Please request a new code.', 429);
    }

    if (!matchesAdminOtp(String(otp).trim(), challenge.otp_hash)) {
      await client.query('UPDATE admin_otp_challenges SET attempts = attempts + 1 WHERE id = $1', [challenge.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Check your details or request a new code.', 401);
    }

    const consumed = await client.query(
      'UPDATE admin_otp_challenges SET used = true WHERE id = $1 AND used = false RETURNING id',
      [challenge.id]
    );
    if (consumed.rows.length === 0) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Unable to verify sign-in. Check your details or request a new code.', 401);
    }

    const adminId = dbUser.rows[0].id;
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const sessionExpiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const sessionId = randomBytes(16).toString('hex');
    await client.query(
      'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [sessionId, adminId, tokenHash, sessionExpiresAt, ip]
    );
    await client.query('COMMIT');
    transactionOpen = false;

    return { token, adminId, email: normalizedEmail };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function verifyAdminSession(token) {
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  
  const res = await pool.query(`
    SELECT s.id AS session_id, s.admin_id, u.email, u.status, s.expires_at
    FROM admin_sessions s
    JOIN admin_users u ON s.admin_id = u.id
    WHERE s.token_hash = $1 AND u.email = ANY($2::text[])
  `, [tokenHash, APPROVED_ADMIN_EMAIL_LIST]);

  if (res.rows.length === 0) return null;
  
  const session = res.rows[0];
  if (session.status !== 'active' || new Date() > new Date(session.expires_at)) {
    await pool.query('DELETE FROM admin_sessions WHERE id = $1', [session.session_id]);
    return null;
  }

  return {
    id: session.admin_id,
    email: session.email,
    role: 'SUPER_ADMIN'
  };
}

export async function clearAdminSession(token) {
  if (!token) return;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  await pool.query('DELETE FROM admin_sessions WHERE token_hash = $1', [tokenHash]);
}

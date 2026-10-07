import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { pool } from './db.js';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export async function requestAdminOtp(email, ip) {
  // Check rate limits by IP (using a simple in-memory map or DB for now)
  // To keep it simple, we use a basic map for IP rate limit on requests to prevent spam.
  checkIpRateLimit(ip);

  const dbUser = await pool.query('SELECT id, status FROM admin_users WHERE email = $1', [email]);
  if (dbUser.rows.length === 0 || dbUser.rows[0].status !== 'active') {
    // Return early but simulate success to prevent enumeration
    return null;
  }

  const adminId = dbUser.rows[0].id;
  const otp = process.env.NODE_ENV === 'test' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = createHash('sha256').update(otp).digest('hex');
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Store in DB
  const challengeId = randomBytes(16).toString('hex');
  await pool.query(
    'INSERT INTO admin_otp_challenges (id, email, otp_hash, expires_at) VALUES ($1, $2, $3, $4)',
    [challengeId, email, otpHash, expiresAt]
  );

  return { otp, challengeId, email, adminId };
}

export async function verifyAdminOtp(email, otp, ip) {
  checkIpRateLimit(ip);

  const dbRes = await pool.query(
    'SELECT * FROM admin_otp_challenges WHERE email = $1 AND used = false ORDER BY created_at DESC LIMIT 1',
    [email]
  );

  if (dbRes.rows.length === 0) {
    throw Object.assign(new Error('Invalid or expired session. Please request a new code.'), { status: 401 });
  }

  const challenge = dbRes.rows[0];

  if (new Date() > new Date(challenge.expires_at)) {
    throw Object.assign(new Error('Code has expired. Request a new code.'), { status: 401 });
  }

  if (challenge.attempts >= challenge.max_attempts) {
    throw Object.assign(new Error('Too many failed attempts. Try again later.'), { status: 429 });
  }

  const inputHash = createHash('sha256').update(String(otp).trim()).digest('hex');
  
  if (inputHash !== challenge.otp_hash) {
    await pool.query('UPDATE admin_otp_challenges SET attempts = attempts + 1 WHERE id = $1', [challenge.id]);
    throw Object.assign(new Error('Incorrect OTP.'), { status: 401 });
  }

  // Success
  await pool.query('UPDATE admin_otp_challenges SET used = true WHERE id = $1', [challenge.id]);

  const dbUser = await pool.query('SELECT id, status FROM admin_users WHERE email = $1', [email]);
  if (dbUser.rows.length === 0 || dbUser.rows[0].status !== 'active') {
    throw Object.assign(new Error('Admin account is no longer active.'), { status: 403 });
  }

  const adminId = dbUser.rows[0].id;
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const sessionExpiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

  const sessionId = randomBytes(16).toString('hex');
  await pool.query(
    'INSERT INTO admin_sessions (id, admin_id, token_hash, expires_at, ip_address) VALUES ($1, $2, $3, $4, $5)',
    [sessionId, adminId, tokenHash, sessionExpiresAt, ip]
  );

  return { token, adminId, email };
}

export async function verifyAdminSession(token) {
  if (!token) return null;
  const tokenHash = createHash('sha256').update(token).digest('hex');
  
  const res = await pool.query(`
    SELECT s.admin_id, u.email, u.status, s.expires_at
    FROM admin_sessions s
    JOIN admin_users u ON s.admin_id = u.id
    WHERE s.token_hash = $1
  `, [tokenHash]);

  if (res.rows.length === 0) return null;
  
  const session = res.rows[0];
  if (session.status !== 'active') return null;
  if (new Date() > new Date(session.expires_at)) return null;

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

const ipAttempts = new Map();
function checkIpRateLimit(ip) {
  const now = Date.now();
  const entry = ipAttempts.get(ip);
  if (entry && entry.lockedUntil > now) {
    throw Object.assign(new Error('Too many requests. Please try again later.'), { status: 429 });
  }
  
  if (entry) {
    if (now - entry.windowStart > WINDOW_MS) {
      ipAttempts.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
    } else {
      entry.count += 1;
      if (entry.count > 20) {
        entry.lockedUntil = now + LOCK_DURATION_MS;
      }
    }
  } else {
    ipAttempts.set(ip, { count: 1, windowStart: now, lockedUntil: 0 });
  }
}

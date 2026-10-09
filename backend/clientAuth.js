import { randomBytes, randomInt, createHmac, timingSafeEqual } from 'node:crypto';
import { pool } from './db.js';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_OTP_ATTEMPTS = 5;
const REQUEST_LIMIT = 5; // 5 requests per 15 min window
const OTP_HASH_KEY = process.env.ADMIN_OTP_PEPPER || process.env.JWT_SECRET || 'menusqr-default-client-otp-pepper-key';

function authError(message, status) {
  return Object.assign(new Error(message), { status });
}

export function generateClientOtp() {
  return String(randomInt(100000, 1_000_000));
}

export function hashClientOtp(otp) {
  return createHmac('sha256', OTP_HASH_KEY).update(String(otp)).digest('hex');
}

export function matchesClientOtp(otp, storedHash) {
  if (!/^\d{6}$/.test(String(otp))) return false;
  const inputHash = Buffer.from(hashClientOtp(otp), 'hex');
  const expectedHash = Buffer.from(String(storedHash), 'hex');
  return inputHash.length === expectedHash.length && timingSafeEqual(inputHash, expectedHash);
}

async function checkAndApplyClientRateLimits(client, email, ip) {
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. Check 30s Cooldown
  const cooldownKey = createHmac('sha256', OTP_HASH_KEY).update(`client_cooldown:${normalizedEmail}`).digest('hex');
  const cooldownRes = await client.query(`
    SELECT last_request_at FROM client_auth_rate_limits WHERE bucket_key = $1
  `, [cooldownKey]);

  if (cooldownRes.rows.length > 0 && cooldownRes.rows[0].last_request_at) {
    const elapsed = Date.now() - new Date(cooldownRes.rows[0].last_request_at).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw authError(`Please wait ${waitSec} seconds before requesting a new code.`, 429);
    }
  }

  // 2. Check 15-minute sliding window rate limits (IP & Email)
  const windowKey = createHmac('sha256', OTP_HASH_KEY).update(`client_request:${normalizedEmail}:${ip}`).digest('hex');
  const rateLimitRes = await client.query(`
    INSERT INTO client_auth_rate_limits (bucket_key, window_started_at, hits, last_request_at, updated_at)
    VALUES ($1, NOW(), 1, NOW(), NOW())
    ON CONFLICT (bucket_key) DO UPDATE SET
      hits = CASE
        WHEN client_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN 1
        ELSE client_auth_rate_limits.hits + 1
      END,
      window_started_at = CASE
        WHEN client_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN NOW()
        ELSE client_auth_rate_limits.window_started_at
      END,
      blocked_until = CASE
        WHEN client_auth_rate_limits.blocked_until > NOW() THEN client_auth_rate_limits.blocked_until
        WHEN client_auth_rate_limits.window_started_at <= NOW() - INTERVAL '15 minutes' THEN NULL
        WHEN client_auth_rate_limits.hits + 1 > $2 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END,
      last_request_at = NOW(),
      updated_at = NOW()
    RETURNING hits, blocked_until
  `, [windowKey, REQUEST_LIMIT]);

  const rateLimit = rateLimitRes.rows[0];
  if (Number(rateLimit.hits) > REQUEST_LIMIT || (rateLimit.blocked_until && new Date(rateLimit.blocked_until) > new Date())) {
    throw authError('Too many OTP requests. Please wait 15 minutes before trying again.', 429);
  }

  // Update cooldown timestamp
  await client.query(`
    INSERT INTO client_auth_rate_limits (bucket_key, window_started_at, hits, last_request_at, updated_at)
    VALUES ($1, NOW(), 1, NOW(), NOW())
    ON CONFLICT (bucket_key) DO UPDATE SET last_request_at = NOW(), updated_at = NOW()
  `, [cooldownKey]);
}

export async function createClientOtpChallenge(email, ip) {
  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query('BEGIN');
    transactionOpen = true;

    await checkAndApplyClientRateLimits(client, normalizedEmail, ip);

    // Invalidate prior active challenges for this email
    await client.query(
      'UPDATE client_otp_challenges SET used = true WHERE email = $1 AND used = false',
      [normalizedEmail]
    );

    const otp = generateClientOtp();
    const challengeId = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await client.query(
      'INSERT INTO client_otp_challenges (id, email, otp_hash, expires_at, max_attempts, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
      [challengeId, normalizedEmail, hashClientOtp(otp), expiresAt, MAX_OTP_ATTEMPTS, ip]
    );

    await client.query('COMMIT');
    transactionOpen = false;

    return { challengeId, otp, email: normalizedEmail };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function invalidateClientOtpChallenge(challengeId) {
  if (!challengeId) return;
  await pool.query('UPDATE client_otp_challenges SET used = true WHERE id = $1', [challengeId]);
}

export async function verifyClientOtpChallenge(challengeId, otp) {
  if (!challengeId || !otp) {
    throw authError('Challenge ID and verification code are required.', 400);
  }

  const client = await pool.connect();
  let transactionOpen = false;

  try {
    await client.query('BEGIN');
    transactionOpen = true;

    const res = await client.query(
      'SELECT * FROM client_otp_challenges WHERE id = $1 AND used = false FOR UPDATE',
      [challengeId]
    );

    const challenge = res.rows[0];
    if (!challenge) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Invalid or expired verification session. Please request a new code.', 400);
    }

    if (new Date(challenge.expires_at) <= new Date()) {
      await client.query('UPDATE client_otp_challenges SET used = true WHERE id = $1', [challenge.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Verification code has expired. Please request a new code.', 400);
    }

    if (challenge.attempts >= challenge.max_attempts) {
      await client.query('UPDATE client_otp_challenges SET used = true WHERE id = $1', [challenge.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Too many failed attempts. Please request a new code.', 429);
    }

    if (!matchesClientOtp(String(otp).trim(), challenge.otp_hash)) {
      await client.query('UPDATE client_otp_challenges SET attempts = attempts + 1 WHERE id = $1', [challenge.id]);
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Incorrect 6-digit verification code.', 401);
    }

    const consumed = await client.query(
      'UPDATE client_otp_challenges SET used = true WHERE id = $1 AND used = false RETURNING email',
      [challenge.id]
    );

    if (consumed.rows.length === 0) {
      await client.query('COMMIT');
      transactionOpen = false;
      throw authError('Verification code already used. Please log in again.', 400);
    }

    await client.query('COMMIT');
    transactionOpen = false;

    return { success: true, email: challenge.email };
  } catch (error) {
    if (transactionOpen) await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

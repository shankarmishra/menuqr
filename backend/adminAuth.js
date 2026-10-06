/**
 * adminAuth.js
 * Admin-specific MFA authentication: OTP generation/verification,
 * rate limiting, session management, and audit logging.
 * NEVER logs passwords, OTPs, tokens, or payment secrets.
 */

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { pool } from './db.js';

// ── In-memory stores (single-process; replace with Redis in multi-instance) ──
// Map<tempToken, { otpHash, expiresAt, attemptCount, email, adminId }>
const adminOtpSessions = new Map();

// Map<ipAddress, { count, windowStartedAt, lockedUntil }>
const adminLoginAttempts = new Map();
const adminOtpAttempts   = new Map();

const OTP_TTL_MS        = 5 * 60 * 1000;   // 5 minutes
const MAX_OTP_ATTEMPTS  = 5;
const LOCK_DURATION_MS  = 15 * 60 * 1000;  // 15 minutes lockout
const WINDOW_MS         = 15 * 60 * 1000;  // rolling window

// ── Admin credential check ────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("FATAL: ADMIN_PASSWORD environment variable is missing.");
  process.exit(1);
}
const adminPasswordHash  = createHash('sha256').update(ADMIN_PASSWORD).digest();

export function verifyAdminPassword(password) {
  if (typeof password !== 'string' || password.length > 256) return false;
  const h = createHash('sha256').update(password).digest();
  return timingSafeEqual(adminPasswordHash, h);
}

// ── Rate limiting helpers ─────────────────────────────────────────────────────
function checkRateLimit(store, key, maxAttempts, windowMs, lockMs) {
  const now = Date.now();
  const entry = store.get(key);
  if (entry?.lockedUntil > now) {
    const secsLeft = Math.ceil((entry.lockedUntil - now) / 1000);
    const minutesLeft = Math.ceil(secsLeft / 60);
    throw Object.assign(
      new Error(`Too many attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`),
      { status: 429, retryAfter: secsLeft }
    );
  }
  const fresh = !entry || (now - entry.windowStartedAt) >= windowMs;
  return fresh ? { count: 0, windowStartedAt: now, lockedUntil: 0 } : entry;
}

function recordFailedAttempt(store, key, maxAttempts, windowMs, lockMs) {
  const now = Date.now();
  const entry = store.get(key) ?? { count: 0, windowStartedAt: now, lockedUntil: 0 };
  const fresh = (now - entry.windowStartedAt) >= windowMs;
  const current = fresh ? { count: 0, windowStartedAt: now, lockedUntil: 0 } : entry;
  current.count += 1;
  if (current.count >= maxAttempts) current.lockedUntil = now + lockMs;
  store.set(key, current);
}

function clearAttempts(store, key) {
  store.delete(key);
}

// ── OTP utilities ─────────────────────────────────────────────────────────────
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return createHash('sha256').update(otp).digest('hex');
}

function timingSafeOtpCompare(inputOtp, storedHash) {
  const inputHash = createHash('sha256').update(String(inputOtp).trim()).digest('hex');
  const a = Buffer.from(inputHash);
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ── Session creation ──────────────────────────────────────────────────────────
/**
 * Creates a new pending MFA session. Returns { tempToken, otp, expiresAt }.
 */
export function createAdminOtpSession(email) {
  const otp = generateOtp();
  const tempToken = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + OTP_TTL_MS;

  adminOtpSessions.set(tempToken, {
    otpHash:      hashOtp(otp),
    expiresAt,
    attemptCount: 0,
    email,
    adminId:      'super-admin',
  });

  return { tempToken, otp, expiresAt };
}

/**
 * Refreshes OTP for an existing session. Returns new { otp, expiresAt }.
 */
export function refreshAdminOtp(tempToken) {
  const session = adminOtpSessions.get(tempToken);
  if (!session) {
    throw Object.assign(new Error('Invalid or expired session. Please log in again.'), { status: 401 });
  }
  const otp = generateOtp();
  session.otpHash      = hashOtp(otp);
  session.expiresAt    = Date.now() + OTP_TTL_MS;
  session.attemptCount = 0;
  adminOtpSessions.set(tempToken, session);
  return { otp, expiresAt: session.expiresAt };
}

/**
 * Verifies OTP. Returns email on success. Throws on failure.
 */
export function verifyAdminOtp(tempToken, otp, ip) {
  // Rate-limit OTP attempts by IP
  checkRateLimit(adminOtpAttempts, ip, MAX_OTP_ATTEMPTS, WINDOW_MS, LOCK_DURATION_MS);

  const session = adminOtpSessions.get(tempToken);
  if (!session) {
    throw Object.assign(new Error('Invalid or expired session. Please log in again.'), { status: 401 });
  }

  if (Date.now() > session.expiresAt) {
    adminOtpSessions.delete(tempToken);
    throw Object.assign(new Error('Code has expired. Request a new code.'), { status: 401 });
  }

  if (!timingSafeOtpCompare(otp, session.otpHash)) {
    session.attemptCount += 1;
    if (session.attemptCount >= MAX_OTP_ATTEMPTS) {
      adminOtpSessions.delete(tempToken);
      recordFailedAttempt(adminOtpAttempts, ip, MAX_OTP_ATTEMPTS, WINDOW_MS, LOCK_DURATION_MS);
      throw Object.assign(
        new Error(`Too many failed attempts. Try again in ${Math.ceil(LOCK_DURATION_MS / 60000)} minutes.`),
        { status: 429 }
      );
    }
    recordFailedAttempt(adminOtpAttempts, ip, MAX_OTP_ATTEMPTS, WINDOW_MS, LOCK_DURATION_MS);
    const remaining = MAX_OTP_ATTEMPTS - session.attemptCount;
    throw Object.assign(
      new Error(`We couldn't verify that code. Try again. (${remaining} attempt${remaining !== 1 ? 's' : ''} remaining)`),
      { status: 401 }
    );
  }

  // Success — clear session and rate-limit counters
  adminOtpSessions.delete(tempToken);
  clearAttempts(adminOtpAttempts, ip);
  return session.email;
}

// ── Login rate limiting ───────────────────────────────────────────────────────
export function checkAdminLoginRateLimit(ip) {
  checkRateLimit(adminLoginAttempts, ip, 5, WINDOW_MS, LOCK_DURATION_MS);
}

export function recordAdminLoginFailure(ip) {
  recordFailedAttempt(adminLoginAttempts, ip, 5, WINDOW_MS, LOCK_DURATION_MS);
}

export function clearAdminLoginAttempts(ip) {
  clearAttempts(adminLoginAttempts, ip);
}

// ── Audit logging ─────────────────────────────────────────────────────────────
/**
 * Logs an admin action to the admin_audit_log table.
 * NEVER log: password, OTP, tokens, payment secrets.
 */
export async function auditLog(event, ip, metadata = {}) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO admin_audit_log (event, ip, metadata, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [event, ip ?? 'unknown', JSON.stringify(metadata)]
    );
  } catch (err) {
    // Non-fatal — log but don't crash
    console.error('[audit] Failed to write audit log:', err.message);
  }
}

// ── Schema bootstrapper ───────────────────────────────────────────────────────
/**
 * Called once on startup to ensure the admin_audit_log table exists.
 */
export async function ensureAdminAuditLogTable() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id         BIGSERIAL PRIMARY KEY,
        event      VARCHAR(100) NOT NULL,
        ip         VARCHAR(100),
        metadata   JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('[adminAuth] Failed to ensure admin_audit_log table:', err.message);
  }
}

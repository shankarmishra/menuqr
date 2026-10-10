import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import {
  createPasswordResetChallenge,
  verifyPasswordResetChallenge,
  invalidatePasswordResetChallenge,
} from '../clientAuth.js';
import { hashPassword, verifyPassword } from '../auth.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run tests.');
}

test('Password Reset OTP Persistence and Security Test Suite', async (t) => {
  const testEmail = `reset-test-${randomUUID()}@menusqr.com`;
  const ip = '127.0.0.1';

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);
    // Create test user in DB
    const userId = randomUUID();
    const tenantId = randomUUID();
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug) VALUES ($1, $2, 'Reset Dhaba', $3)",
      [tenantId, randomUUID().split('-')[0], `reset-${randomUUID()}`]
    );
    const initialHash = hashPassword('InitialPass123!');
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role, tenant_id) VALUES ($1, $2, $3, 'RESTAURANT_OWNER', $4)",
      [userId, testEmail, initialHash, tenantId]
    );
  });

  t.after(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.query('DELETE FROM password_resets WHERE email = $1', [testEmail]);
  });

  await t.test('createPasswordResetChallenge creates a valid 6-digit OTP and hashes it in DB', async () => {
    const challenge = await createPasswordResetChallenge(testEmail, ip);

    assert.ok(challenge.challengeId);
    assert.match(challenge.otp, /^\d{6}$/);
    assert.equal(challenge.email, testEmail);

    const dbRes = await pool.query('SELECT * FROM password_resets WHERE id = $1', [challenge.challengeId]);
    assert.equal(dbRes.rows.length, 1);
    const row = dbRes.rows[0];
    assert.equal(row.email, testEmail);
    assert.equal(row.used, false);
    assert.equal(row.attempts, 0);
    assert.equal(row.max_attempts, 5);
  });

  await t.test('verifyPasswordResetChallenge succeeds with correct OTP and marks challenge as used', async () => {
    // Clear cooldown to allow new challenge
    await pool.query("DELETE FROM client_auth_rate_limits");

    const challenge = await createPasswordResetChallenge(testEmail, ip);
    const res = await verifyPasswordResetChallenge(testEmail, challenge.otp);

    assert.equal(res.success, true);
    assert.equal(res.email, testEmail);

    const dbRes = await pool.query('SELECT used, used_at FROM password_resets WHERE id = $1', [challenge.challengeId]);
    assert.equal(dbRes.rows[0].used, true);
    assert.ok(dbRes.rows[0].used_at);
  });

  await t.test('re-using a consumed password reset challenge fails', async () => {
    await pool.query("DELETE FROM client_auth_rate_limits");
    const challenge = await createPasswordResetChallenge(testEmail, ip);
    await verifyPasswordResetChallenge(testEmail, challenge.otp);

    await assert.rejects(
      async () => {
        await verifyPasswordResetChallenge(testEmail, challenge.otp);
      },
      (err) => err.status === 400 && err.message.includes('No active password reset request')
    );
  });

  await t.test('incorrect OTP code increments attempts and fails after 5 attempts', async () => {
    await pool.query("DELETE FROM client_auth_rate_limits");
    const challenge = await createPasswordResetChallenge(testEmail, ip);

    // 4 wrong attempts
    for (let i = 0; i < 4; i++) {
      await assert.rejects(
        async () => {
          await verifyPasswordResetChallenge(testEmail, '000000');
        },
        (err) => err.status === 401 && err.message.includes('Incorrect password reset OTP code')
      );
    }

    const dbRes = await pool.query('SELECT attempts FROM password_resets WHERE id = $1', [challenge.challengeId]);
    assert.equal(dbRes.rows[0].attempts, 4);

    // 5th wrong attempt triggers 429 max attempts lock
    await assert.rejects(
      async () => {
        await verifyPasswordResetChallenge(testEmail, '000000');
      },
      (err) => err.status === 401 || err.status === 429
    );
  });
});

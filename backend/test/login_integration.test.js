import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, pool } from '../db.js';
import { hashPassword } from '../auth.js';
import { createClientOtpChallenge, verifyClientOtpChallenge } from '../clientAuth.js';

test('Customer Login Integration & Auth Flow', async (t) => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  const databaseName = decodeURIComponent(new URL(databaseUrl).pathname).replace(/^\/+/, '');
  if (!/(?:^|[_-])test(?:$|[_-])/i.test(databaseName)) {
    // Skip integration test if not connected to a dedicated test database
    return;
  }

  await t.test('1. Setup test client and user in PostgreSQL', async () => {
    await connectDB(process.env.DATABASE_URL);

    // Clean test data
    await pool.query("DELETE FROM users WHERE email = 'test_owner_integration@menusqr.in'");
    await pool.query("DELETE FROM clients WHERE id = 'test_client_integration_id'");

    // Insert test client
    await pool.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status)
      VALUES ('test_client_integration_id', 'testpub123', 'Test Dhaba Integration', 'test-dhaba-integration', 'active')
    `);

    // Insert test user with valid PBKDF2 password hash
    const testPassword = 'IntegrationTestPassword2026!';
    const passwordHash = await hashPassword(testPassword);

    await pool.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id)
      VALUES ('test_user_integration_id', 'test_owner_integration@menusqr.in', $1, 'RESTAURANT_OWNER', 'test_client_integration_id')
    `, [passwordHash]);

    // Verify user insertion
    const res = await pool.query("SELECT * FROM users WHERE email = 'test_owner_integration@menusqr.in'");
    assert.equal(res.rows.length, 1);
    assert.equal(res.rows[0].role, 'RESTAURANT_OWNER');
    assert.equal(res.rows[0].tenant_id, 'test_client_integration_id');
  });

  await t.test('2. Verify password verification on test user hash', async () => {
    const { verifyPassword } = await import('../auth.js');
    const res = await pool.query("SELECT password_hash FROM users WHERE email = 'test_owner_integration@menusqr.in'");
    const storedHash = res.rows[0].password_hash;

    assert.equal(await verifyPassword('IntegrationTestPassword2026!', storedHash), true);
    assert.equal(await verifyPassword('WrongPassword123!', storedHash), false);
    assert.equal(await verifyPassword('', storedHash), false);
    assert.equal(await verifyPassword(undefined, storedHash), false);
  });

  await t.test('3. Test Client OTP Challenge creation and verification for happy path', async () => {
    const email = 'test_owner_integration@menusqr.in';
    const ip = '127.0.0.1';

    const challenge = await createClientOtpChallenge(email, ip);
    assert.ok(challenge.challengeId);
    assert.ok(challenge.otp);
    assert.equal(challenge.otp.length, 6);

    const verification = await verifyClientOtpChallenge(challenge.challengeId, challenge.otp);
    assert.equal(verification.success, true);
    assert.equal(verification.email, email);
  });

  await t.test('4. Cleanup integration test records', async () => {
    await pool.query("DELETE FROM client_otp_challenges WHERE email = 'test_owner_integration@menusqr.in'");
    await pool.query("DELETE FROM users WHERE email = 'test_owner_integration@menusqr.in'");
    await pool.query("DELETE FROM clients WHERE id = 'test_client_integration_id'");
  });
});

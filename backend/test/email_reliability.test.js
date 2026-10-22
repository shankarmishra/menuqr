import test from 'node:test';
import assert from 'node:assert/strict';
import { maskEmail, getEmailConfig, sendEmailDirectly, queueEmailOutbox, processEmailOutboxQueue } from '../email.js';
import { createClientOtpChallenge, verifyClientOtpChallenge, invalidateClientOtpChallenge, matchesClientOtp, hashClientOtp } from '../clientAuth.js';
import { connectDB, pool } from '../db.js';

test('Email Reliability & OTP Test Suite', async (t) => {

  await t.test('1. Mask email utility hides sensitive recipient details', () => {
    assert.equal(maskEmail('xshankarmishra@gmail.com'), 'x***a@g***.com');
    assert.equal(maskEmail('admin@menusqr.in'), 'a***n@m***.in');
    assert.equal(maskEmail('ab@c.com'), 'a***@c***.com');
  });

  await t.test('2. Missing RESEND_API_KEY handles error gracefully without crashing', async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalSmtp = process.env.SMTP_HOST;
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;

    const config = getEmailConfig(process.env);
    assert.equal(config.configured, false);

    const res = await sendEmailDirectly({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Test</p>',
      text: 'Test',
    }, 'test label');

    assert.equal(res.ok, false);
    assert.match(res.error, /No email transport configured|RESEND_API_KEY/);

    if (originalKey) process.env.RESEND_API_KEY = originalKey;
    if (originalSmtp) process.env.SMTP_HOST = originalSmtp;
  });

  await t.test('3. Client OTP hashing and HMAC matching work as expected', () => {
    const otp = '849204';
    const hash = hashClientOtp(otp);
    assert.ok(hash);
    assert.equal(matchesClientOtp(otp, hash), true);
    assert.equal(matchesClientOtp('000000', hash), false);
    assert.equal(matchesClientOtp('invalid', hash), false);
  });

  await t.test('4. PostgreSQL DB connection & schema tables exist', async () => {
    if (!process.env.DATABASE_URL) return;
    await connectDB(process.env.DATABASE_URL);

    const tablesRes = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('client_otp_challenges', 'client_auth_rate_limits', 'email_outbox', 'email_events')
    `);
    
    const tableNames = tablesRes.rows.map(r => r.table_name);
    assert.ok(tableNames.includes('client_otp_challenges'), 'client_otp_challenges table should exist');
    assert.ok(tableNames.includes('client_auth_rate_limits'), 'client_auth_rate_limits table should exist');
    assert.ok(tableNames.includes('email_outbox'), 'email_outbox table should exist');
    assert.ok(tableNames.includes('email_events'), 'email_events table should exist');
  });

  await t.test('5. PostgreSQL Client OTP challenge creation & verification lifecycle', async () => {
    if (!process.env.DATABASE_URL) return;
    const email = 'testowner_unique@menusqr.in';
    const ip = '127.0.0.1';

    const challenge = await createClientOtpChallenge(email, ip);
    assert.ok(challenge.challengeId);
    assert.ok(challenge.otp);
    assert.equal(challenge.email, email);

    // Verify OTP in DB
    const verification = await verifyClientOtpChallenge(challenge.challengeId, challenge.otp);
    assert.equal(verification.success, true);
    assert.equal(verification.email, email);

    // Single-use check: second verification should fail
    await assert.rejects(
      verifyClientOtpChallenge(challenge.challengeId, challenge.otp),
      (err) => err.status === 400
    );
  });

  await t.test('6. Client OTP 30s resend cooldown enforcement', async () => {
    if (!process.env.DATABASE_URL) return;
    const email = 'cooldown_test@menusqr.in';
    const ip = '127.0.0.2';

    await createClientOtpChallenge(email, ip);

    // Second request within 30s should be rejected with HTTP 429
    await assert.rejects(
      createClientOtpChallenge(email, ip),
      (err) => err.status === 429 && err.message.includes('wait')
    );
  });

  await t.test('7. Client OTP invalidation on email delivery failure', async () => {
    if (!process.env.DATABASE_URL) return;
    const email = 'fail_test@menusqr.in';
    const ip = '127.0.0.3';

    const challenge = await createClientOtpChallenge(email, ip);
    await invalidateClientOtpChallenge(challenge.challengeId);

    await assert.rejects(
      verifyClientOtpChallenge(challenge.challengeId, challenge.otp),
      (err) => err.status === 400
    );
  });

  await t.test('8. Durable Email Outbox queueing and worker execution', async () => {
    if (!process.env.DATABASE_URL) return;
    const recipient = 'outbox_test@menusqr.in';
    const idempotencyKey = `test_outbox_${Date.now()}`;

    const queueRes = await queueEmailOutbox({
      notificationType: 'TEST_WELCOME',
      recipient,
      subject: 'Welcome to Outbox',
      html: '<p>Welcome</p>',
      text: 'Welcome',
      idempotencyKey,
    });

    assert.equal(queueRes.queued, true);
    assert.ok(queueRes.outboxId);

    // Verify DB entry
    const dbRes = await pool.query('SELECT * FROM email_outbox WHERE id = $1', [queueRes.outboxId]);
    assert.equal(dbRes.rows.length, 1);
    assert.equal(dbRes.rows[0].recipient, recipient);
    assert.equal(dbRes.rows[0].idempotency_key, idempotencyKey);
  });

});

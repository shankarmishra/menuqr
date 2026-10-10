import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import { queueEmailOutbox, processEmailOutboxQueue } from '../email.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run tests.');
}

test('Email Outbox Queue & Worker Recovery Test Suite', async (t) => {
  const recipient = `outbox-test-${randomUUID()}@menusqr.com`;

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);
  });

  t.after(async () => {
    await pool.query('DELETE FROM email_outbox WHERE recipient = $1', [recipient]);
  });

  await t.test('queueEmailOutbox creates a QUEUED outbox record with idempotency key', async () => {
    const key = `test_key_${randomUUID()}`;
    const result = await queueEmailOutbox({
      notificationType: 'TEST_NOTIFICATION',
      recipient,
      subject: 'Test Outbox Subject',
      html: '<p>Test html</p>',
      text: 'Test text',
      idempotencyKey: key,
    });

    assert.equal(result.queued, true);
    assert.ok(result.outboxId);

    const dbRes = await pool.query('SELECT * FROM email_outbox WHERE id = $1', [result.outboxId]);
    assert.equal(dbRes.rows.length, 1);
    const row = dbRes.rows[0];
    assert.equal(row.recipient, recipient);
    assert.equal(row.idempotency_key, key);
    assert.ok(['QUEUED', 'PROCESSING', 'PROVIDER_ACCEPTED', 'FAILED'].includes(row.status));
    assert.equal(row.max_attempts, 5);
  });

  await t.test('queueEmailOutbox handles duplicate idempotency keys without throwing duplicate key errors', async () => {
    const key = `dup_key_${randomUUID()}`;
    const res1 = await queueEmailOutbox({
      notificationType: 'TEST_DUP',
      recipient,
      subject: 'Dup Test 1',
      html: '<p>1</p>',
      text: '1',
      idempotencyKey: key,
    });

    const res2 = await queueEmailOutbox({
      notificationType: 'TEST_DUP',
      recipient,
      subject: 'Dup Test 2',
      html: '<p>2</p>',
      text: '2',
      idempotencyKey: key,
    });

    assert.equal(res1.queued, true);
    assert.equal(res2.queued, true);

    const countRes = await pool.query('SELECT COUNT(*) FROM email_outbox WHERE idempotency_key = $1', [key]);
    assert.equal(Number(countRes.rows[0].count), 1);
  });

  await t.test('stuck PROCESSING job (> 5 mins old) is recovered by worker', async () => {
    const stuckId = randomUUID();
    const stuckKey = `stuck_key_${stuckId}`;

    // Clean up any pending jobs for recipient first
    await pool.query('DELETE FROM email_outbox WHERE recipient = $1', [recipient]);

    await pool.query(`
      INSERT INTO email_outbox (id, notification_type, recipient, subject, payload, idempotency_key, status, attempt_count, max_attempts, next_retry_at, updated_at)
      VALUES ($1, 'STUCK_TEST', $2, 'Stuck Subject', '{"text":"stuck"}', $3, 'PROCESSING', 1, 5, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '6 minutes')
    `, [stuckId, recipient, stuckKey]);

    const res = await processEmailOutboxQueue();
    assert.ok(res.processedCount >= 1);

    const checkRes = await pool.query('SELECT status, attempt_count FROM email_outbox WHERE id = $1', [stuckId]);
    assert.equal(checkRes.rows.length, 1);
    // Worker processed the job, incremented attempt count from 1 to 2
    assert.equal(checkRes.rows[0].attempt_count, 2);
    assert.ok(['QUEUED', 'PROVIDER_ACCEPTED', 'FAILED'].includes(checkRes.rows[0].status));
  });
});

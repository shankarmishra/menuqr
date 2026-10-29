import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import { validateFeedback, saveFeedback, getFeedbackSummary } from '../feedback.js';

test('validateFeedback', async (t) => {
  await t.test('accepts 1-5 and trims/limits text', () => {
    const f = validateFeedback({ rating: '4', comment: '  Great \n\n food  ', contact: ' a@b.c ', tableNumber: ' T2 ' });
    assert.deepEqual(f, { rating: 4, comment: 'Great food', contact: 'a@b.c', tableNumber: 'T2' });
    assert.equal(validateFeedback({ rating: 5, comment: 'x'.repeat(900) }).comment.length, 500);
  });
  await t.test('rejects missing, fractional and out-of-range ratings', () => {
    for (const rating of [undefined, null, 0, 6, 2.5, 'abc', -1]) assert.ok(validateFeedback({ rating }).error, `rating ${rating}`);
    assert.ok(validateFeedback(null).error);
  });
  await t.test('empty optional text becomes null and control characters are stripped', () => {
    const f = validateFeedback({ rating: 3, comment: '   ', contact: '\u0000\u0007' });
    assert.equal(f.comment, null);
    assert.equal(f.contact, null);
  });
});

test('feedback storage and summary', async (t) => {
  await connectDB(process.env.DATABASE_URL);
  const stamp = Date.now();
  const tenantId = `tenant_feedback_${stamp}`;
  await pool.query(`INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Feedback Diner', $3, 'active')`, [tenantId, `pub_${stamp}`, `fb-${stamp}`]);
  t.after(async () => {
    await pool.query('DELETE FROM menu_feedback WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });
  for (const rating of [5, 5, 4, 1]) await saveFeedback(pool, tenantId, validateFeedback({ rating, comment: `r${rating}` }));
  const s = await getFeedbackSummary(pool, tenantId);
  assert.equal(s.count, 4);
  assert.equal(s.average, 3.8);
  assert.deepEqual(s.distribution, [1, 0, 0, 1, 2]);
  assert.equal(s.recent.length, 4);
  const other = await getFeedbackSummary(pool, 'someone-else');
  assert.equal(other.count, 0);
  assert.equal(other.average, 0);
});

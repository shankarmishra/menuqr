/** Private guest feedback: input validation and the owner-facing summary. */
import { randomUUID } from 'node:crypto';

/** Returns a clean `{ rating, comment, contact, tableNumber }`, or `{ error }` for unusable input. */
export function validateFeedback(input) {
  const rating = Number(input?.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Please choose a rating from 1 to 5.' };
  }
  const clean = (value, max) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  return {
    rating,
    comment: clean(input.comment, 500) || null,
    contact: clean(input.contact, 120) || null,
    tableNumber: clean(input.tableNumber, 50) || null,
  };
}

export async function saveFeedback(db, tenantId, feedback) {
  const id = randomUUID();
  await db.query(
    'INSERT INTO menu_feedback (id, tenant_id, rating, comment, contact, table_number) VALUES ($1, $2, $3, $4, $5, $6)',
    [id, tenantId, feedback.rating, feedback.comment, feedback.contact, feedback.tableNumber]
  );
  return id;
}

/** Average, count, 1-5 distribution (index 0 = one star) and the latest comments. */
export async function getFeedbackSummary(db, tenantId, limit = 20) {
  const agg = (await db.query(
    `SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average,
            COUNT(*) FILTER (WHERE rating = 1)::int AS r1, COUNT(*) FILTER (WHERE rating = 2)::int AS r2,
            COUNT(*) FILTER (WHERE rating = 3)::int AS r3, COUNT(*) FILTER (WHERE rating = 4)::int AS r4,
            COUNT(*) FILTER (WHERE rating = 5)::int AS r5
       FROM menu_feedback WHERE tenant_id = $1`,
    [tenantId]
  )).rows[0];
  const recent = (await db.query(
    `SELECT id, rating, comment, contact, table_number AS "tableNumber", created_at AS "createdAt"
       FROM menu_feedback WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [tenantId, Math.min(Math.max(Number(limit) || 20, 1), 50)]
  )).rows;
  return {
    count: agg.count,
    average: Math.round(agg.average * 10) / 10,
    distribution: [agg.r1, agg.r2, agg.r3, agg.r4, agg.r5],
    recent,
  };
}

import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { pool as sharedPool, connectDB } from '../db.js';
import {
  sendSubscriptionWarningEmail,
  sendSubscriptionExpiredEmail,
  sendTrialEndingEmail,
  sendTrialExpiredEmail,
} from '../email.js';

/**
 * Decide which reminder (if any) a subscription needs today.
 * Free trials get 3-day and 1-day warnings; paid plans keep the 10/5/1-day warnings.
 * Anything past its expiry that is still ACTIVE or TRIAL is marked EXPIRED.
 */
export function reminderTypeFor(sub, now = new Date()) {
  if (!sub?.expires_at) return null;
  const status = String(sub.status || '').toUpperCase();
  const daysRemaining = Math.ceil((new Date(sub.expires_at).getTime() - now.getTime()) / 86_400_000);

  if (status === 'TRIAL') {
    if (daysRemaining <= 0) return { type: 'TRIAL_EXPIRED', daysRemaining };
    if (daysRemaining === 3) return { type: 'TRIAL_WARNING_3D', daysRemaining };
    if (daysRemaining === 1) return { type: 'TRIAL_WARNING_1D', daysRemaining };
    return null;
  }

  if (daysRemaining === 10) return { type: 'SUB_WARNING_10D', daysRemaining };
  if (daysRemaining === 5) return { type: 'SUB_WARNING_5D', daysRemaining };
  if (daysRemaining === 1) return { type: 'SUB_WARNING_1D', daysRemaining };
  if (daysRemaining <= 0 && status === 'ACTIVE') return { type: 'SUB_EXPIRED', daysRemaining };
  return null;
}

export async function processSubscriptionReminders({ pool = sharedPool, now = new Date() } = {}) {
  console.log('[cron] Starting daily subscription reminder check...');
  const todayStr = now.toISOString().split('T')[0];

  const res = await pool.query(`
    SELECT s.id as subscription_id, s.tenant_id, s.status, s.expires_at,
           c.business_name, u.email
    FROM subscriptions s
    JOIN clients c ON c.id = s.tenant_id
    LEFT JOIN users u ON u.tenant_id = s.tenant_id AND u.role = 'RESTAURANT_OWNER'
  `);

  let sentCount = 0;

  for (const sub of res.rows) {
    const reminder = reminderTypeFor(sub, now);
    if (!reminder) continue;
    const { type: reminderType, daysRemaining } = reminder;

    // Idempotency check: verify if sent today
    const checkRes = await pool.query(`
      SELECT id FROM activity_logs
      WHERE tenant_id = $1 AND action = $2 AND created_at >= $3::date
    `, [sub.tenant_id, reminderType, todayStr]);

    if (checkRes.rows.length > 0) {
      console.log(`[cron] ${reminderType} already sent today for ${sub.business_name}, skipping.`);
      continue;
    }

    if (reminderType === 'SUB_EXPIRED' || reminderType === 'TRIAL_EXPIRED') {
      // Only flip rows that are still in the status we evaluated (a payment may have just landed).
      const updated = await pool.query(
        `UPDATE subscriptions SET status = 'EXPIRED', updated_at = NOW()
         WHERE tenant_id = $1 AND status = $2 AND expires_at <= NOW()`,
        [sub.tenant_id, String(sub.status).toUpperCase()]
      );
      if (updated.rowCount === 0) continue;
      if (reminderType === 'TRIAL_EXPIRED') {
        await pool.query(
          `INSERT INTO subscription_events (tenant_id, event_type, from_plan, from_plan_id, to_plan, to_plan_id, from_expiry, metadata)
           SELECT tenant_id, 'TRIAL_EXPIRED', plan_id, plan_id, plan_id, plan_id, expires_at, '{}'::jsonb
           FROM subscriptions WHERE tenant_id = $1`,
          [sub.tenant_id]
        );
      }
    }

    if (sub.email) {
      if (reminderType === 'SUB_EXPIRED') {
        await sendSubscriptionExpiredEmail({ email: sub.email, businessName: sub.business_name });
      } else if (reminderType === 'TRIAL_EXPIRED') {
        await sendTrialExpiredEmail({ email: sub.email, businessName: sub.business_name });
      } else if (reminderType.startsWith('TRIAL_WARNING')) {
        await sendTrialEndingEmail({ email: sub.email, businessName: sub.business_name, daysRemaining, expiresAt: sub.expires_at });
      } else {
        await sendSubscriptionWarningEmail({ email: sub.email, businessName: sub.business_name, daysRemaining, expiresAt: sub.expires_at });
      }
    }

    await pool.query(`
      INSERT INTO activity_logs (id, tenant_id, action, details)
      VALUES ($1, $2, $3, $4)
    `, [randomUUID(), sub.tenant_id, reminderType, JSON.stringify({ daysRemaining, date: todayStr })]);

    sentCount++;
    console.log(`[cron] Processed ${reminderType} for ${sub.business_name}`);
  }

  console.log(`[cron] Finished subscription reminder run. ${sentCount} reminders processed.`);
  return { processed: sentCount };
}

// Run directly: `node scripts/subscription-reminders.js`
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  (async () => {
    let pool = sharedPool;
    try {
      pool = pool || await connectDB(process.env.DATABASE_URL, { initializeSchema: false, runMigrations: false });
      await processSubscriptionReminders({ pool });
    } catch (err) {
      console.error('[cron] Error processing subscription reminders:', err);
      process.exitCode = 1;
    } finally {
      await pool?.end?.().catch(() => {});
    }
  })();
}

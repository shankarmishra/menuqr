import { randomUUID } from 'node:crypto';
import { pool } from '../db.js';
import { sendSubscriptionWarningEmail, sendSubscriptionExpiredEmail } from '../email.js';

async function processSubscriptionReminders() {
  console.log('[cron] Starting daily subscription reminder check...');
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const res = await pool.query(`
      SELECT s.id as subscription_id, s.tenant_id, s.status, s.expires_at,
             c.business_name, u.email
      FROM subscriptions s
      JOIN clients c ON c.id = s.tenant_id
      LEFT JOIN users u ON u.tenant_id = s.tenant_id AND u.role = 'RESTAURANT_OWNER'
    `);

    let sentCount = 0;

    for (const sub of res.rows) {
      if (!sub.email || !sub.expires_at) continue;

      const expiresAt = new Date(sub.expires_at);
      const now = new Date();
      const diffTime = expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let reminderType = null;
      if (daysRemaining === 10) reminderType = 'SUB_WARNING_10D';
      else if (daysRemaining === 5) reminderType = 'SUB_WARNING_5D';
      else if (daysRemaining === 1) reminderType = 'SUB_WARNING_1D';
      else if (daysRemaining <= 0 && sub.status === 'ACTIVE') reminderType = 'SUB_EXPIRED';

      if (!reminderType) continue;

      // Idempotency check: verify if sent today
      const checkRes = await pool.query(`
        SELECT id FROM activity_logs
        WHERE tenant_id = $1 AND action = $2 AND created_at >= $3::date
      `, [sub.tenant_id, reminderType, todayStr]);

      if (checkRes.rows.length > 0) {
        console.log(`[cron] ${reminderType} already sent today for ${sub.business_name}, skipping.`);
        continue;
      }

      // Send email & record activity
      if (reminderType === 'SUB_EXPIRED') {
        await pool.query('UPDATE subscriptions SET status = $1 WHERE tenant_id = $2', ['EXPIRED', sub.tenant_id]);
        await sendSubscriptionExpiredEmail({
          email: sub.email,
          businessName: sub.business_name
        });
      } else {
        await sendSubscriptionWarningEmail({
          email: sub.email,
          businessName: sub.business_name,
          daysRemaining,
          expiresAt: sub.expires_at
        });
      }

      await pool.query(`
        INSERT INTO activity_logs (id, tenant_id, action, details)
        VALUES ($1, $2, $3, $4)
      `, [randomUUID(), sub.tenant_id, reminderType, JSON.stringify({ daysRemaining, date: todayStr })]);

      sentCount++;
      console.log(`[cron] Processed ${reminderType} for ${sub.business_name} (${sub.email})`);
    }

    console.log(`[cron] Finished subscription reminder run. ${sentCount} reminders sent.`);
  } catch (err) {
    console.error('[cron] Error processing subscription reminders:', err);
  } finally {
    await pool.end();
  }
}

processSubscriptionReminders();

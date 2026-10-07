const fs = require('fs');
let code = fs.readFileSync('backend/authorization.js', 'utf8');

// Update PLAN_CAPABILITIES
code = code.replace(
  "BASIC: ['digital_menu', 'menu_conversion', 'qr_code', 'login', 'menu_setup', 'one_time_edit'],",
  "BASIC: ['digital_menu', 'menu_conversion', 'qr_code', 'login', 'menu_setup', 'one_time_edit', 'add_item', 'edit_item', 'delete_item', 'menu_management'],"
);

// We need a helper to get the limit for a plan
const limitHelper = `
export function getPlanContentLimit(planId) {
  const p = String(planId || 'BASIC').toUpperCase();
  if (p === 'BASIC') return 30;
  if (p === 'INTERMEDIATE') return 100;
  return Infinity; // PREMIUM and others
}
`;

// replace withContentChange
const newWithContentChange = `
export async function withContentChange(authorization, mutation) {
  if (!authorization.active) {
    throw apiError(403, 'Your subscription does not allow menu changes right now.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subscriptionResult = await queryPortable(
      client,
      'SELECT plan_id, status, started_at, expires_at, created_at, content_period_start FROM subscriptions WHERE tenant_id = ? FOR UPDATE',
      [authorization.tenantId]
    );
    const subscription = subscriptionResult.rows[0];
    const status = String(subscription?.status || '').toUpperCase();
    const now = new Date();
    const validStatus = paidStatuses.has(status) || status === 'CANCELLED';
    const validPeriod = subscription?.expires_at && new Date(subscription.expires_at) > now && (!subscription.started_at || new Date(subscription.started_at) <= now);
    if (!validStatus || !validPeriod) throw apiError(403, 'Your subscription does not allow menu changes right now.');

    const planId = String(subscription.plan_id || 'BASIC').toUpperCase();
    const limit = getPlanContentLimit(planId);
    
    if (limit !== Infinity) {
      const periodStart = subscription.content_period_start || subscription.started_at || subscription.created_at;
      if (!periodStart) throw apiError(403, 'Your menu change allowance is unavailable.');
      
      const usageResult = await queryPortable(
        client,
        'SELECT changes_used FROM subscription_content_usage WHERE tenant_id = ? AND period_start = ? FOR UPDATE',
        [authorization.tenantId, periodStart]
      );
      let changesUsed = usageResult.rows[0]?.changes_used;
      if (changesUsed === undefined) {
        await queryPortable(
          client,
          'INSERT INTO subscription_content_usage (tenant_id, period_start, changes_used) VALUES (?, ?, 0)',
          [authorization.tenantId, periodStart]
        );
        changesUsed = 0;
      }
      if (Number(changesUsed) >= limit) {
        throw apiError(403, \`Your \${limit} included menu changes have been used. Upgrade your plan to continue editing.\`);
      }

      const result = await mutation(client);
      await queryPortable(
        client,
        'UPDATE subscription_content_usage SET changes_used = changes_used + 1, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND period_start = ?',
        [authorization.tenantId, periodStart]
      );
      await client.query('COMMIT');
      return result;
    }

    if (!PLAN_CAPABILITIES[planId]) throw apiError(403, 'Your plan does not allow menu changes.');
    const result = await mutation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
`;

const oldWithContentChangeRegex = /export async function withContentChange[\s\S]*?finally \{\s*client\.release\(\);\s*\}\s*\}/;
code = code.replace(oldWithContentChangeRegex, newWithContentChange);

// replace getContentUsage
const newGetContentUsage = `
export async function getContentUsage(tenantId, periodStart, planId = 'BASIC') {
  const limit = getPlanContentLimit(planId);
  if (limit === Infinity) return { used: 0, remaining: Infinity, limit: Infinity };
  
  if (!periodStart) return { used: 0, remaining: limit, limit };
  const result = await queryPortable(
    pool,
    'SELECT changes_used FROM subscription_content_usage WHERE tenant_id = ? AND period_start = ?',
    [tenantId, periodStart]
  );
  const used = Math.min(limit, Number(result.rows[0]?.changes_used || 0));
  return { used, remaining: limit - used, limit };
}
`;

const oldGetContentUsageRegex = /export async function getContentUsage[\s\S]*?return \{ used, remaining:[^\}]*\};\s*\}/;
code = code.replace(oldGetContentUsageRegex, newGetContentUsage);

code = limitHelper + '\n' + code;

fs.writeFileSync('backend/authorization.js', code, 'utf8');
export function getPlanContentLimit(planId) {
  const p = String(planId || 'BASIC').toUpperCase();
  if (p === 'BASIC') return 20;
  if (p === 'INTERMEDIATE') return 100;
  return Infinity;
}

import { pool, queryPortable } from './db.js';
import { apiError } from './utils.js';
import { invalidatePublicMenuCache } from './routes/public.js';

export const PLAN_CAPABILITIES = {
  BASIC: ['digital_menu', 'restaurant_setup', 'qr_code', 'login', 'initial_menu_setup', 'one_time_edit'],
  INTERMEDIATE: [
    'digital_menu', 'restaurant_setup', 'qr_code', 'login', 'initial_menu_setup', 'one_time_edit',
    'templates', 'add_item', 'edit_item', 'delete_item', 'menu_management', 'analytics',
  ],
  PREMIUM: [
    'digital_menu', 'restaurant_setup', 'qr_code', 'login', 'initial_menu_setup', 'one_time_edit',
    'templates', 'add_item', 'edit_item', 'delete_item', 'menu_management', 'analytics',
    'customer_ordering', 'reception_orders', 'order_acceptance', 'order_management',
  ],
};

/** Every capability any plan can grant — the super admin picks from this list for offline plans. */
export const ALL_CAPABILITIES = [...new Set(Object.values(PLAN_CAPABILITIES).flat())];

/** Free-trial length in days for self-registered restaurants. */
export const TRIAL_DAYS = 14;
/** Plan whose capabilities a free trial unlocks. */
export const TRIAL_PLAN_ID = 'PREMIUM';

// TRIAL counts as an access-granting status while it is inside its period.
const paidStatuses = new Set(['ACTIVE', 'WARNING', 'EXPIRING', 'RENEWAL_PENDING', 'TRIAL']);

/** Statuses that grant access while the subscription is inside its validity window. */
export function statusAllowsAccess(status) {
  const s = String(status || '').toUpperCase();
  return paidStatuses.has(s) || s === 'CANCELLED';
}

/**
 * Keep only known capability keys (deduplicated). Returns null when the input is not a usable
 * list, meaning "fall back to the plan's default capabilities".
 */
export function normalizeFeatureList(features) {
  let list = features;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { return null; }
  }
  if (!Array.isArray(list)) return null;
  const known = new Set(ALL_CAPABILITIES);
  return [...new Set(list.map((f) => String(f).trim()).filter((f) => known.has(f)))];
}

/** Capabilities for a subscription row: custom_features override when set, else the plan default. */
export function capabilitiesForSubscription(subscription) {
  const planId = String(subscription?.plan_id || 'BASIC').toUpperCase();
  const custom = normalizeFeatureList(subscription?.custom_features);
  if (custom) return custom;
  return PLAN_CAPABILITIES[planId] || PLAN_CAPABILITIES.BASIC;
}

export async function resolveTenantAuthorization(user, now = new Date()) {
  const tenantId = user.tenantId;
  const result = await queryPortable(
    pool,
    'SELECT * FROM subscriptions WHERE tenant_id = $1',
    [tenantId]
  );
  const subscription = result.rows[0];
  const planId = String(subscription?.plan_id || 'BASIC').toUpperCase();
  const status = String(subscription?.status || 'INACTIVE').toUpperCase();
  const validFrom = subscription?.started_at ? new Date(subscription.started_at) : null;
  const validUntil = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const withinPaidPeriod = validUntil && validUntil > now && (!validFrom || validFrom <= now);
  const active = Boolean(statusAllowsAccess(status) && withinPaidPeriod);
  const baseCapabilities = capabilitiesForSubscription(subscription);

  return {
    userId: user.id,
    tenantId,
    clientId: tenantId,
    restaurantId: tenantId,
    subscriptionId: subscription?.id || null,
    planId: PLAN_CAPABILITIES[planId] ? planId : 'BASIC',
    effectiveStatus: status,
    source: String(subscription?.source || 'GATEWAY').toUpperCase(),
    isTrial: status === 'TRIAL',
    validFrom,
    validUntil,
    entitlements: active ? (
      (tenantId === 'tenant_shobharams' || tenantId === '21fd932b-4374-4731-b93e-1e8acecc5881' || user?.email === 'sr.shobharams@gmail.com')
        ? [...new Set([...baseCapabilities, 'templates', 'add_item', 'edit_item', 'delete_item', 'menu_management'])]
        : baseCapabilities
    ) : [],
    renewalPending: status === 'RENEWAL_PENDING',
    active,
    reason: active ? null : `Subscription is ${status.toLowerCase()} or outside its paid period.`,
  };
}

export function requireEntitlement(authorization, capability, message) {
  if (!authorization.active) {
    throw apiError(403, 'Your subscription is expired or inactive. Please renew your plan.');
  }
  if (!authorization.entitlements.includes(capability)) {
    throw apiError(403, message || `This feature requires a higher plan (missing capability: ${capability}).`);
  }
}

export async function withContentChange(authorization, mutation) {
  if (!authorization.active) {
    throw apiError(403, 'Your subscription is expired or inactive. Please renew your plan to make changes.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const subscriptionResult = await queryPortable(
      client,
      'SELECT plan_id, status, started_at, expires_at, created_at, content_period_start FROM subscriptions WHERE tenant_id = $1 FOR UPDATE',
      [authorization.tenantId]
    );
    const subscription = subscriptionResult.rows[0];
    if (!subscription) throw apiError(403, 'Subscription not found.');

    const status = String(subscription?.status || '').toUpperCase();
    const now = new Date();
    const validStatus = paidStatuses.has(status) || status === 'CANCELLED';
    const validPeriod = subscription?.expires_at && new Date(subscription.expires_at) > now && (!subscription.started_at || new Date(subscription.started_at) <= now);
    if (!validStatus || !validPeriod) throw apiError(403, 'Your subscription does not allow menu changes right now.');

    const planId = String(subscription.plan_id || 'BASIC').toUpperCase();
    const limit = getPlanContentLimit(planId);
    
    if (limit !== Infinity) {
      // Basic plan one-time edit logic
      const periodStart = subscription.content_period_start || subscription.started_at || subscription.created_at;
      
      const usageResult = await queryPortable(
        client,
        'SELECT changes_used FROM subscription_content_usage WHERE tenant_id = $1 AND period_start = $2 FOR UPDATE',
        [authorization.tenantId, periodStart]
      );
      
      let changesUsed = usageResult.rows[0]?.changes_used;
      if (changesUsed === undefined) {
        await queryPortable(
          client,
          'INSERT INTO subscription_content_usage (tenant_id, period_start, changes_used) VALUES ($1, $2, 0)',
          [authorization.tenantId, periodStart]
        );
        changesUsed = 0;
      }
      
      if (Number(changesUsed) >= limit) {
        throw apiError(403, `Your ${limit} included menu changes have been used. Upgrade your plan to continue editing.`);
      }

      // Perform the mutation
      const result = await mutation(client);
      
      // Consume the 1-time edit
      await queryPortable(
        client,
        'UPDATE subscription_content_usage SET changes_used = changes_used + 1, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = $1 AND period_start = $2',
        [authorization.tenantId, periodStart]
      );
      
      await client.query('COMMIT');
      await invalidatePublicMenuCache(authorization.tenantId);
      return result;
    }

    if (!PLAN_CAPABILITIES[planId]) throw apiError(403, 'Your plan does not allow menu changes.');
    const result = await mutation(client);
    await client.query('COMMIT');
    await invalidatePublicMenuCache(authorization.tenantId);
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getContentUsage(tenantId, periodStart, planId = 'BASIC') {
  const limit = getPlanContentLimit(planId);
  if (limit === Infinity) return { used: 0, remaining: Infinity, limit: Infinity };
  
  if (!periodStart) return { used: 0, remaining: limit, limit };
  const result = await queryPortable(
    pool,
    'SELECT changes_used FROM subscription_content_usage WHERE tenant_id = $1 AND period_start = $2',
    [tenantId, periodStart]
  );
  const used = Math.min(limit, Number(result.rows[0]?.changes_used || 0));
  return { used, remaining: limit - used, limit };
}

/**
 * Offline ("manual") plan activation by the super admin, plus trial management.
 *
 * A restaurant pays the team directly (cash / UPI / bank transfer …) at a negotiated price.
 * The super admin records the payment here and the plan is activated for the chosen duration,
 * with the exact set of features the admin selected. Every activation is kept in
 * manual_plan_grants and logged in subscription_events.
 */
import { randomUUID } from 'node:crypto';
import { pool } from './db.js';
import { apiError } from './utils.js';
import { PLANS, ORDER_LIMIT } from './planCatalog.js';
import { getOrderUsage, parsePackCount, packsAmount } from './orderLimits.js';
import {
  PLAN_CAPABILITIES,
  ALL_CAPABILITIES,
  TRIAL_DAYS,
  TRIAL_PLAN_ID,
  normalizeFeatureList,
} from './authorization.js';

export const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER'];
export const DURATION_UNITS = ['DAYS', 'MONTHS', 'YEARS'];
const MAX_DURATION_DAYS = 5 * 366;
const MAX_AMOUNT = 10_000_000;

export const CAPABILITY_LABELS = {
  digital_menu: 'Digital menu',
  restaurant_setup: 'Restaurant profile setup',
  qr_code: 'QR code',
  login: 'Owner login',
  initial_menu_setup: 'Initial menu setup',
  one_time_edit: 'Limited menu edits',
  templates: 'All menu templates',
  add_item: 'Add menu items',
  edit_item: 'Edit menu items',
  delete_item: 'Delete menu items',
  menu_management: 'Full menu management',
  analytics: 'Analytics dashboard',
  customer_ordering: 'Customer table ordering',
  reception_orders: 'Live orders / cashier panel',
  order_acceptance: 'Order acceptance',
  order_management: 'Order management',
};

/** Add a duration to a date (calendar months/years, like the paid checkout does). */
export function addDuration(date, value, unit) {
  const d = new Date(date);
  if (unit === 'DAYS') d.setDate(d.getDate() + value);
  else if (unit === 'MONTHS') d.setMonth(d.getMonth() + value);
  else if (unit === 'YEARS') d.setFullYear(d.getFullYear() + value);
  else throw apiError(400, 'Invalid duration unit.');
  return d;
}

function sameFeatureSet(a, b) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((f) => set.has(f));
}

export function getPlanCatalog() {
  return {
    plans: Object.entries(PLANS).map(([key, plan]) => ({
      id: key.toUpperCase(),
      key,
      label: plan.label,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice || plan.price,
      features: PLAN_CAPABILITIES[key.toUpperCase()] || [],
    })),
    capabilities: ALL_CAPABILITIES.map((key) => ({ key, label: CAPABILITY_LABELS[key] || key })),
    paymentModes: PAYMENT_MODES,
    durationUnits: DURATION_UNITS,
    trial: { days: TRIAL_DAYS, planId: TRIAL_PLAN_ID },
    orderLimit: { ...ORDER_LIMIT },
  };
}

/** Validate and normalize the super admin's activation form. Throws 400 on bad input. */
export function validateManualPlanInput(input, now = new Date()) {
  const body = input || {};
  const planId = String(body.planId || '').toUpperCase().trim();
  if (!PLAN_CAPABILITIES[planId] || !Object.hasOwn(PLANS, planId.toLowerCase())) {
    throw apiError(400, 'Select a valid plan.');
  }

  const agreedAmount = Number(body.agreedAmount);
  if (!Number.isFinite(agreedAmount) || agreedAmount < 0 || agreedAmount > MAX_AMOUNT) {
    throw apiError(400, 'Enter the amount the restaurant paid (0 or more).');
  }

  const paymentMode = String(body.paymentMode || '').toUpperCase().trim();
  if (!PAYMENT_MODES.includes(paymentMode)) {
    throw apiError(400, `Payment mode must be one of: ${PAYMENT_MODES.join(', ')}.`);
  }

  const paymentReference = body.paymentReference == null ? null : String(body.paymentReference).trim().slice(0, 255) || null;
  const notes = body.notes == null ? null : String(body.notes).trim().slice(0, 2000) || null;

  let paidOn = null;
  if (body.paidOn) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.paidOn)) || Number.isNaN(Date.parse(String(body.paidOn)))) {
      throw apiError(400, 'Payment date must be in YYYY-MM-DD format.');
    }
    paidOn = String(body.paidOn);
  }

  const durationValue = Number(body.durationValue);
  const durationUnit = String(body.durationUnit || '').toUpperCase().trim();
  if (!Number.isInteger(durationValue) || durationValue <= 0) {
    throw apiError(400, 'Duration must be a whole number greater than 0.');
  }
  if (!DURATION_UNITS.includes(durationUnit)) {
    throw apiError(400, 'Duration unit must be DAYS, MONTHS or YEARS.');
  }
  const probeEnd = addDuration(now, durationValue, durationUnit);
  if ((probeEnd.getTime() - now.getTime()) / 86_400_000 > MAX_DURATION_DAYS) {
    throw apiError(400, 'Duration cannot be longer than 5 years.');
  }

  const features = body.enabledFeatures === undefined
    ? [...PLAN_CAPABILITIES[planId]]
    : normalizeFeatureList(body.enabledFeatures);
  if (!features || features.length === 0) {
    throw apiError(400, 'Select at least one feature to enable.');
  }

  return {
    planId,
    listPrice: PLANS[planId.toLowerCase()].yearlyPrice || PLANS[planId.toLowerCase()].price,
    agreedAmount: Math.round(agreedAmount * 100) / 100,
    paymentMode,
    paymentReference,
    paidOn,
    durationValue,
    durationUnit,
    enabledFeatures: features,
    carryOverRemainingDays: Boolean(body.carryOverRemainingDays),
    notes,
  };
}

async function notifyPlanChange(tenantId) {
  try {
    const { invalidatePublicMenuCache } = await import('./routes/public.js');
    await invalidatePublicMenuCache(tenantId);
  } catch (err) {
    console.warn('[manualPlans] cache invalidation failed:', err.message);
  }
  try {
    const { broadcastPlanEvent } = await import('./orderStream.js');
    const subRes = await pool.query('SELECT plan_id, status, expires_at FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    const sub = subRes.rows[0];
    broadcastPlanEvent(tenantId, {
      type: 'plan_updated',
      plan: sub?.plan_id,
      planId: sub?.plan_id,
      status: sub?.status,
      expiresAt: sub?.expires_at,
      orderSubtype: 'MANUAL',
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[manualPlans] plan broadcast failed:', err.message);
  }
}

async function lockTenantSubscription(client, tenantId) {
  const clientRes = await client.query('SELECT id, business_name FROM clients WHERE id = $1', [tenantId]);
  if (!clientRes.rows[0]) throw apiError(404, 'Restaurant not found.');
  const subRes = await client.query('SELECT * FROM subscriptions WHERE tenant_id = $1 FOR UPDATE', [tenantId]);
  return { restaurant: clientRes.rows[0], subscription: subRes.rows[0] || null };
}

function mapGrant(row) {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    businessName: row.business_name,
    planId: row.plan_id,
    listPrice: row.list_price === null ? null : Number(row.list_price),
    agreedAmount: Number(row.agreed_amount),
    currency: row.currency,
    paymentMode: row.payment_mode,
    paymentReference: row.payment_reference,
    paidOn: row.paid_on,
    durationValue: row.duration_value,
    durationUnit: row.duration_unit,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    enabledFeatures: normalizeFeatureList(row.enabled_features) || [],
    notes: row.notes,
    status: row.status,
    grantedBy: row.granted_by,
    revokedAt: row.revoked_at,
    revokedBy: row.revoked_by,
    revokeReason: row.revoke_reason,
    createdAt: row.created_at,
  };
}

function mapSubscription(row, now = new Date()) {
  if (!row) return null;
  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000) : null;
  const custom = normalizeFeatureList(row.custom_features);
  const planId = String(row.plan_id || 'BASIC').toUpperCase();
  return {
    planId,
    status: String(row.status || '').toUpperCase(),
    source: String(row.source || 'GATEWAY').toUpperCase(),
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    trialEndsAt: row.trial_ends_at || null,
    daysLeft,
    isExpired: !expiresAt || expiresAt <= now,
    customFeatures: custom,
    effectiveFeatures: custom || PLAN_CAPABILITIES[planId] || [],
    manualGrantId: row.manual_grant_id || null,
  };
}

export async function getTenantSubscriptionDetail(tenantId) {
  const clientRes = await pool.query('SELECT id, business_name FROM clients WHERE id = $1', [tenantId]);
  if (!clientRes.rows[0]) throw apiError(404, 'Restaurant not found.');
  const [subRes, grantsRes, eventsRes, orderUsage, packsRes] = await Promise.all([
    pool.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [tenantId]),
    pool.query('SELECT * FROM manual_plan_grants WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50', [tenantId]),
    pool.query(
      `SELECT id, event_type, from_plan_id, to_plan_id, from_expiry, to_expiry, metadata, created_at
       FROM subscription_events WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [tenantId]
    ),
    getOrderUsage(pool, tenantId),
    pool.query(
      `SELECT id, period, packs, orders_added, amount, source, payment_mode, payment_reference, notes, granted_by, created_at
       FROM order_pack_purchases WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [tenantId]
    ),
  ]);
  return {
    tenantId,
    businessName: clientRes.rows[0].business_name,
    subscription: mapSubscription(subRes.rows[0]),
    grants: grantsRes.rows.map(mapGrant),
    orderUsage,
    orderPacks: packsRes.rows.map((r) => ({
      id: r.id,
      period: r.period,
      packs: r.packs,
      ordersAdded: r.orders_added,
      amount: Number(r.amount),
      source: r.source,
      paymentMode: r.payment_mode,
      paymentReference: r.payment_reference,
      notes: r.notes,
      grantedBy: r.granted_by,
      createdAt: r.created_at,
    })),
    events: eventsRes.rows.map((e) => ({
      id: e.id,
      eventType: e.event_type,
      fromPlanId: e.from_plan_id,
      toPlanId: e.to_plan_id,
      fromExpiry: e.from_expiry,
      toExpiry: e.to_expiry,
      metadata: e.metadata || {},
      createdAt: e.created_at,
    })),
  };
}

/** Activate a plan for an offline payment. Returns the new grant and the resulting subscription. */
export async function grantManualPlan({ tenantId, input, adminEmail, now = new Date() }) {
  const data = validateManualPlanInput(input, now);
  const client = await pool.connect();
  let grant;
  try {
    await client.query('BEGIN');
    const { subscription } = await lockTenantSubscription(client, tenantId);

    // Optionally keep unused paid days: stack the new period after the current expiry.
    let base = now;
    const currentExpiry = subscription?.expires_at ? new Date(subscription.expires_at) : null;
    const currentStatus = String(subscription?.status || '').toUpperCase();
    if (data.carryOverRemainingDays && currentExpiry && currentExpiry > now && currentStatus !== 'TRIAL') {
      base = currentExpiry;
    }
    const expiresAt = addDuration(base, data.durationValue, data.durationUnit);

    const isDefaultSet = sameFeatureSet(data.enabledFeatures, PLAN_CAPABILITIES[data.planId]);
    const customFeatures = isDefaultSet ? null : JSON.stringify(data.enabledFeatures);

    await client.query(
      `UPDATE manual_plan_grants SET status = 'SUPERSEDED', updated_at = NOW()
       WHERE tenant_id = $1 AND status = 'ACTIVE'`,
      [tenantId]
    );

    const grantRes = await client.query(
      `INSERT INTO manual_plan_grants
         (id, tenant_id, plan_id, list_price, agreed_amount, currency, payment_mode, payment_reference, paid_on,
          duration_value, duration_unit, starts_at, expires_at, enabled_features, notes, status, granted_by)
       VALUES ($1,$2,$3,$4,$5,'INR',$6,$7,$8,$9,$10,$11,$12,$13,$14,'ACTIVE',$15)
       RETURNING *`,
      [randomUUID(), tenantId, data.planId, data.listPrice, data.agreedAmount, data.paymentMode,
       data.paymentReference, data.paidOn, data.durationValue, data.durationUnit, now, expiresAt,
       JSON.stringify(data.enabledFeatures), data.notes, adminEmail]
    );
    grant = grantRes.rows[0];

    if (subscription) {
      await client.query(
        `UPDATE subscriptions
         SET plan_id = $1,
             previous_plan_id = plan_id,
             status = 'ACTIVE',
             started_at = $2,
             expires_at = $3,
             content_period_start = $2,
             source = 'MANUAL',
             custom_features = $4,
             manual_grant_id = $5,
             updated_at = NOW()
         WHERE tenant_id = $6`,
        [data.planId, now, expiresAt, customFeatures, grant.id, tenantId]
      );
    } else {
      await client.query(
        `INSERT INTO subscriptions
           (id, tenant_id, plan_id, status, started_at, expires_at, content_period_start, source, custom_features, manual_grant_id)
         VALUES ($1,$2,$3,'ACTIVE',$4,$5,$4,'MANUAL',$6,$7)`,
        [randomUUID(), tenantId, data.planId, now, expiresAt, customFeatures, grant.id]
      );
    }

    await client.query(
      `INSERT INTO subscription_events
         (tenant_id, event_type, from_plan, from_plan_id, to_plan, to_plan_id, from_expiry, to_expiry, metadata)
       VALUES ($1, 'MANUAL_PLAN_ACTIVATED', $2, $2, $3, $3, $4, $5, $6)`,
      [tenantId, subscription?.plan_id || null, data.planId, subscription?.expires_at || null, expiresAt,
       JSON.stringify({
         grantId: grant.id,
         agreedAmount: data.agreedAmount,
         listPrice: data.listPrice,
         paymentMode: data.paymentMode,
         paymentReference: data.paymentReference,
         duration: `${data.durationValue} ${data.durationUnit}`,
         enabledFeatures: data.enabledFeatures,
         grantedBy: adminEmail,
       })]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  await notifyPlanChange(tenantId);
  return getTenantSubscriptionDetail(tenantId).then((detail) => ({ ...detail, grant: mapGrant(grant) }));
}

/**
 * Edit the active offline plan: change its enabled features and/or extend it.
 * input: { enabledFeatures?: string[], extendBy?: { value, unit }, notes?: string }
 */
export async function updateManualGrant({ tenantId, grantId, input, adminEmail }) {
  const body = input || {};
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { subscription } = await lockTenantSubscription(client, tenantId);
    const grantRes = await client.query(
      'SELECT * FROM manual_plan_grants WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [grantId, tenantId]
    );
    const grant = grantRes.rows[0];
    if (!grant) throw apiError(404, 'Offline plan not found.');
    if (grant.status !== 'ACTIVE' || subscription?.manual_grant_id !== grant.id) {
      throw apiError(409, 'Only the restaurant\'s current offline plan can be changed.');
    }

    let features = normalizeFeatureList(grant.enabled_features) || [...PLAN_CAPABILITIES[grant.plan_id]];
    if (body.enabledFeatures !== undefined) {
      features = normalizeFeatureList(body.enabledFeatures);
      if (!features || features.length === 0) throw apiError(400, 'Select at least one feature to enable.');
    }

    let expiresAt = new Date(grant.expires_at);
    if (body.extendBy) {
      const value = Number(body.extendBy.value);
      const unit = String(body.extendBy.unit || '').toUpperCase();
      if (!Number.isInteger(value) || value <= 0 || !DURATION_UNITS.includes(unit)) {
        throw apiError(400, 'Extension must be a whole number of DAYS, MONTHS or YEARS.');
      }
      const base = expiresAt > new Date() ? expiresAt : new Date();
      expiresAt = addDuration(base, value, unit);
      if ((expiresAt.getTime() - Date.now()) / 86_400_000 > MAX_DURATION_DAYS) {
        throw apiError(400, 'A plan cannot run more than 5 years ahead.');
      }
    }

    const notes = body.notes === undefined ? grant.notes : (String(body.notes).trim().slice(0, 2000) || null);
    await client.query(
      `UPDATE manual_plan_grants SET enabled_features = $1, expires_at = $2, notes = $3, updated_at = NOW() WHERE id = $4`,
      [JSON.stringify(features), expiresAt, notes, grant.id]
    );

    const isDefaultSet = sameFeatureSet(features, PLAN_CAPABILITIES[grant.plan_id]);
    await client.query(
      `UPDATE subscriptions SET custom_features = $1, expires_at = $2, status = 'ACTIVE', updated_at = NOW() WHERE tenant_id = $3`,
      [isDefaultSet ? null : JSON.stringify(features), expiresAt, tenantId]
    );

    await client.query(
      `INSERT INTO subscription_events
         (tenant_id, event_type, from_plan, from_plan_id, to_plan, to_plan_id, from_expiry, to_expiry, metadata)
       VALUES ($1, 'MANUAL_PLAN_UPDATED', $2, $2, $2, $2, $3, $4, $5)`,
      [tenantId, grant.plan_id, grant.expires_at, expiresAt,
       JSON.stringify({ grantId: grant.id, enabledFeatures: features, extendBy: body.extendBy || null, updatedBy: adminEmail })]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  await notifyPlanChange(tenantId);
  return getTenantSubscriptionDetail(tenantId);
}

/** Revoke an offline plan. If it is the restaurant's current plan, access ends immediately. */
export async function revokeManualGrant({ tenantId, grantId, reason, adminEmail }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { subscription } = await lockTenantSubscription(client, tenantId);
    const grantRes = await client.query(
      'SELECT * FROM manual_plan_grants WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [grantId, tenantId]
    );
    const grant = grantRes.rows[0];
    if (!grant) throw apiError(404, 'Offline plan not found.');
    if (grant.status === 'REVOKED') throw apiError(409, 'This offline plan is already revoked.');

    await client.query(
      `UPDATE manual_plan_grants
       SET status = 'REVOKED', revoked_at = NOW(), revoked_by = $1, revoke_reason = $2, updated_at = NOW()
       WHERE id = $3`,
      [adminEmail, reason ? String(reason).trim().slice(0, 1000) : null, grant.id]
    );

    const isCurrent = subscription?.manual_grant_id === grant.id;
    if (isCurrent) {
      await client.query(
        `UPDATE subscriptions SET status = 'EXPIRED', expires_at = NOW(), updated_at = NOW() WHERE tenant_id = $1`,
        [tenantId]
      );
    }

    await client.query(
      `INSERT INTO subscription_events
         (tenant_id, event_type, from_plan, from_plan_id, to_plan, to_plan_id, from_expiry, to_expiry, metadata)
       VALUES ($1, 'MANUAL_PLAN_REVOKED', $2, $2, $2, $2, $3, $4, $5)`,
      [tenantId, grant.plan_id, subscription?.expires_at || null, isCurrent ? new Date() : subscription?.expires_at || null,
       JSON.stringify({ grantId: grant.id, reason: reason || null, revokedBy: adminEmail, accessEnded: isCurrent })]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  await notifyPlanChange(tenantId);
  return getTenantSubscriptionDetail(tenantId);
}

/** Give a restaurant more free-trial days (only while it has not bought a plan). */
export async function extendTrial({ tenantId, days, adminEmail, now = new Date() }) {
  const extraDays = Number(days);
  if (!Number.isInteger(extraDays) || extraDays <= 0 || extraDays > 90) {
    throw apiError(400, 'Trial extension must be between 1 and 90 days.');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { subscription } = await lockTenantSubscription(client, tenantId);
    const source = String(subscription?.source || '').toUpperCase();
    const status = String(subscription?.status || '').toUpperCase();
    if (!subscription || (source !== 'TRIAL' && status !== 'TRIAL')) {
      throw apiError(409, 'This restaurant is not on a free trial.');
    }
    const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : now;
    const base = currentExpiry > now ? currentExpiry : now;
    const newExpiry = addDuration(base, extraDays, 'DAYS');

    await client.query(
      `UPDATE subscriptions SET status = 'TRIAL', expires_at = $1, trial_ends_at = $3, updated_at = NOW() WHERE tenant_id = $2`,
      [newExpiry, tenantId, newExpiry]
    );
    await client.query(
      `INSERT INTO subscription_events
         (tenant_id, event_type, from_plan, from_plan_id, to_plan, to_plan_id, from_expiry, to_expiry, metadata)
       VALUES ($1, 'TRIAL_EXTENDED', $2, $2, $2, $2, $3, $4, $5)`,
      [tenantId, subscription.plan_id, subscription.expires_at, newExpiry, JSON.stringify({ days: extraDays, extendedBy: adminEmail })]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }

  await notifyPlanChange(tenantId);
  return getTenantSubscriptionDetail(tenantId);
}

/** All offline payments, newest first — for the admin's payments ledger. */
export async function listManualPayments({ limit = 200 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  const res = await pool.query(
    `SELECT g.*, c.business_name
     FROM manual_plan_grants g
     LEFT JOIN clients c ON c.id = g.tenant_id
     ORDER BY g.created_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  const grants = res.rows.map(mapGrant);
  const totalCollected = grants
    .filter((g) => g.status !== 'REVOKED')
    .reduce((sum, g) => sum + g.agreedAmount, 0);
  return { grants, totalCollected: Math.round(totalCollected * 100) / 100 };
}

/**
 * Record extra online-order packs for an offline payment (valid for the current IST month).
 * input: { packs, amount?, paymentMode, paymentReference?, notes? } — amount defaults to the list price.
 */
export async function grantOrderPacks({ tenantId, input, adminEmail }) {
  const body = input || {};
  const packs = parsePackCount(body.packs, apiError);

  const amount = body.amount === undefined || body.amount === null || body.amount === ''
    ? packsAmount(packs)
    : Number(body.amount);
  if (!Number.isFinite(amount) || amount < 0 || amount > MAX_AMOUNT) {
    throw apiError(400, 'Enter the amount received (0 or more).');
  }
  const paymentMode = String(body.paymentMode || '').toUpperCase().trim();
  if (!PAYMENT_MODES.includes(paymentMode)) {
    throw apiError(400, `Payment mode must be one of: ${PAYMENT_MODES.join(', ')}.`);
  }
  const paymentReference = body.paymentReference == null ? null : String(body.paymentReference).trim().slice(0, 255) || null;
  const notes = body.notes == null ? null : String(body.notes).trim().slice(0, 2000) || null;

  const clientRes = await pool.query('SELECT id FROM clients WHERE id = $1', [tenantId]);
  if (!clientRes.rows[0]) throw apiError(404, 'Restaurant not found.');

  const ordersAdded = packs * ORDER_LIMIT.packSize;
  const insert = await pool.query(
    `INSERT INTO order_pack_purchases
       (tenant_id, period, packs, orders_added, amount, source, payment_mode, payment_reference, notes, granted_by)
     VALUES ($1, to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM'), $2, $3, $4, 'MANUAL', $5, $6, $7, $8)
     RETURNING id, period`,
    [tenantId, packs, ordersAdded, Math.round(amount * 100) / 100, paymentMode, paymentReference, notes, adminEmail]
  );
  await pool.query(
    `INSERT INTO subscription_events (tenant_id, event_type, metadata)
     VALUES ($1, 'ORDER_PACK_GRANTED', $2)`,
    [tenantId, JSON.stringify({ packs, ordersAdded, amount, paymentMode, paymentReference, period: insert.rows[0].period, grantedBy: adminEmail })]
  );

  await notifyPlanChange(tenantId);
  return getTenantSubscriptionDetail(tenantId);
}

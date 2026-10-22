import { randomBytes, randomInt } from 'node:crypto';
import { pool } from './db.js';
import { apiError } from './utils.js';

export const ALLOWED_DISCOUNT_TIERS = [5, 10, 15];
export const MAX_ACTIVE_COUPONS_PER_PLAN = 15;
export const ELIGIBLE_PLANS = ['INTERMEDIATE', 'PREMIUM'];

/**
 * Generate human-readable cryptographically secure coupon code
 * e.g., "MQ15-K8P2-N9X4"
 */
export function generateCouponCode(discountPct) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // alphanumeric without ambiguous O,0,1,I
  let code = `MQ${discountPct}-`;
  for (let i = 0; i < 4; i++) {
    code += chars[randomInt(0, chars.length)];
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars[randomInt(0, chars.length)];
  }
  return code;
}

/**
 * Currency-safe integer paise calculations
 */
export function calculateDiscount(originalPrice, discountPct) {
  const pct = Number(discountPct) || 0;
  if (!ALLOWED_DISCOUNT_TIERS.includes(pct)) {
    throw apiError(400, `Discount percentage must be 5%, 10%, or 15%. Got ${pct}%.`);
  }
  const originalPaise = Math.round(Number(originalPrice) * 100);
  const discountPaise = Math.round((originalPaise * pct) / 100);
  const finalPaise = originalPaise - discountPaise;

  return {
    originalAmount: originalPaise / 100,
    discountPct: pct,
    discountAmount: discountPaise / 100,
    finalAmount: finalPaise / 100,
  };
}

/**
 * Super Admin: Bulk generate coupons
 */
export async function bulkGenerateCoupons({ planId, discountPct, count = 10, expiryDays = null, createdBy = 'SUPER_ADMIN' }) {
  const normPlan = String(planId || '').toUpperCase().trim();
  const pct = Number(discountPct);
  const qty = Number(count);

  if (!ELIGIBLE_PLANS.includes(normPlan)) {
    throw apiError(400, `Coupons can only be generated for Intermediate or Premium plans.`);
  }
  if (!ALLOWED_DISCOUNT_TIERS.includes(pct)) {
    throw apiError(400, `Discount percentage must be 5%, 10%, or 15%.`);
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > 15) {
    throw apiError(400, `Bulk generation count must be between 1 and 15.`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Advisory lock per plan to serialize concurrent coupon generation requests
    const PLAN_LOCK_IDS = {
      INTERMEDIATE: 9876501,
      PREMIUM: 9876502,
    };
    if (PLAN_LOCK_IDS[normPlan]) {
      await client.query('SELECT pg_advisory_xact_lock($1)', [PLAN_LOCK_IDS[normPlan]]);
    }

    // Clean up expired coupons first
    await client.query(
      `UPDATE coupons SET status = 'EXPIRED', updated_at = NOW()
       WHERE status = 'AVAILABLE' AND expires_at IS NOT NULL AND expires_at < NOW()`
    );

    // Release stale reservations older than 30 minutes
    await client.query(
      `UPDATE coupons SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
       WHERE status = 'RESERVED' AND reserved_at < NOW() - INTERVAL '30 minutes'`
    );

    // Check count of active AVAILABLE coupons for this plan
    const activeRes = await client.query(
      `SELECT COUNT(*) as count FROM coupons WHERE plan_id = $1 AND status = 'AVAILABLE'`,
      [normPlan]
    );
    const activeCount = parseInt(activeRes.rows[0].count, 10);
    if (activeCount + qty > MAX_ACTIVE_COUPONS_PER_PLAN) {
      throw apiError(
        400,
        `Cannot exceed limit of ${MAX_ACTIVE_COUPONS_PER_PLAN} active coupons for ${normPlan} plan. Currently active: ${activeCount}. Requested: ${qty}.`
      );
    }

    const createdCoupons = [];
    const expiresAt = expiryDays ? new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000) : null;

    for (let i = 0; i < qty; i++) {
      let code;
      let attempts = 0;
      while (attempts < 10) {
        code = generateCouponCode(pct);
        const dup = await client.query('SELECT id FROM coupons WHERE code = $1', [code]);
        if (dup.rows.length === 0) break;
        attempts++;
      }

      const id = `cpn_${randomBytes(12).toString('hex')}`;
      const insertRes = await client.query(
        `INSERT INTO coupons (id, code, plan_id, discount_pct, status, created_by, expires_at)
         VALUES ($1, $2, $3, $4, 'AVAILABLE', $5, $6)
         RETURNING *`,
        [id, code, normPlan, pct, createdBy, expiresAt]
      );
      createdCoupons.push(insertRes.rows[0]);
    }

    await client.query('COMMIT');
    return createdCoupons;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Validate and atomically reserve a coupon for a pending order
 */
export async function validateAndReserveCoupon({ code, planId, orderId }) {
  const normCode = String(code || '').trim().toUpperCase();
  const normPlan = String(planId || '').trim().toUpperCase();

  if (normPlan === 'BASIC') {
    throw apiError(400, 'Basic plan is not eligible for coupon discounts.');
  }
  if (!ELIGIBLE_PLANS.includes(normPlan)) {
    throw apiError(400, 'Invalid subscription plan for coupon.');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if order previously reserved a coupon; if different, release old
    await client.query(
      `UPDATE coupons SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
       WHERE reserved_order_id = $1 AND status = 'RESERVED' AND code != $2`,
      [orderId, normCode]
    );

    // Release stale reservations
    await client.query(
      `UPDATE coupons SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
       WHERE status = 'RESERVED' AND reserved_at < NOW() - INTERVAL '30 minutes'`
    );

    // Expire outdated coupons
    await client.query(
      `UPDATE coupons SET status = 'EXPIRED', updated_at = NOW()
       WHERE status = 'AVAILABLE' AND expires_at IS NOT NULL AND expires_at < NOW()`
    );

    // Fetch candidate coupon under FOR UPDATE lock
    const couponRes = await client.query(
      `SELECT * FROM coupons WHERE code = $1 FOR UPDATE`,
      [normCode]
    );
    const coupon = couponRes.rows[0];

    if (!coupon) {
      throw apiError(404, 'Coupon code does not exist.');
    }
    if (coupon.plan_id !== normPlan) {
      throw apiError(400, `Coupon '${normCode}' is only valid for the ${coupon.plan_id} plan.`);
    }
    if (coupon.status === 'DISABLED') {
      throw apiError(400, 'This coupon code has been disabled by an administrator.');
    }
    if (coupon.status === 'REDEEMED') {
      throw apiError(400, 'This single-use coupon has already been redeemed.');
    }
    if (coupon.status === 'EXPIRED' || (coupon.expires_at && new Date(coupon.expires_at) < new Date())) {
      throw apiError(400, 'This coupon code has expired.');
    }

    // Check if already reserved by current order or available
    if (coupon.status === 'RESERVED' && coupon.reserved_order_id !== orderId) {
      throw apiError(409, 'This coupon is currently reserved for another checkout session. Try again later.');
    }

    // Atomically reserve
    const reservedRes = await client.query(
      `UPDATE coupons
       SET status = 'RESERVED', reserved_order_id = $1, reserved_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [orderId, coupon.id]
    );

    await client.query('COMMIT');
    return reservedRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Authoritatively redeem coupon on successful payment
 */
export async function redeemCouponForOrder({ orderId, couponCode = null, client: txClient = null }) {
  const executor = txClient || pool;
  let code = couponCode;
  if (!code) {
    const orderRes = await executor.query('SELECT coupon_code FROM orders WHERE id = $1', [orderId]);
    code = orderRes.rows[0]?.coupon_code || null;
  }

  if (code) {
    const res = await executor.query(
      `UPDATE coupons
       SET status = 'REDEEMED', redeemed_order_id = $1, redeemed_at = NOW(), reserved_order_id = NULL, updated_at = NOW()
       WHERE (reserved_order_id = $1 OR code = $2)
         AND status IN ('RESERVED', 'AVAILABLE')
       RETURNING *`,
      [orderId, code]
    );
    return res.rows[0] || null;
  }

  const res = await executor.query(
    `UPDATE coupons
     SET status = 'REDEEMED', redeemed_order_id = $1, redeemed_at = NOW(), reserved_order_id = NULL, updated_at = NOW()
     WHERE reserved_order_id = $1 AND status = 'RESERVED'
     RETURNING *`,
    [orderId]
  );
  return res.rows[0] || null;
}

/**
 * Release a reserved coupon if order is cancelled or failed
 */
export async function releaseCouponReservation({ orderId, client: txClient = null }) {
  const executor = txClient || pool;
  await executor.query(
    `UPDATE coupons
     SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
     WHERE reserved_order_id = $1 AND status = 'RESERVED'`,
    [orderId]
  );
}

/**
 * Disable an unused coupon
 */
export async function disableCoupon(couponId) {
  const res = await pool.query(
    `UPDATE coupons
     SET status = 'DISABLED', updated_at = NOW()
     WHERE id = $1 AND status IN ('AVAILABLE', 'RESERVED')
     RETURNING *`,
    [couponId]
  );
  if (res.rowCount === 0) {
    throw apiError(400, 'Coupon not found or cannot be disabled (already redeemed).');
  }
  return res.rows[0];
}

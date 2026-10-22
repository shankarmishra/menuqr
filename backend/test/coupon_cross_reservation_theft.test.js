import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import {
  validateAndReserveCoupon,
  redeemCouponForOrder
} from '../coupons.js';

test('Check (e): Coupon currently RESERVED for Order 2 cannot be stolen or redeemed by Order 1', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const couponId = `coup_steal_${timestamp}`;
  const couponCode = `STEAL${timestamp.toString().slice(-6)}`;
  const orderId1 = `ord_steal1_${timestamp}`;
  const orderId2 = `ord_steal2_${timestamp}`;

  t.after(async () => {
    await pool.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId1, orderId2]);
    await pool.query('DELETE FROM coupons WHERE id = $1', [couponId]);
  });

  // Setup: Create coupon
  await pool.query(
    `INSERT INTO coupons (id, code, plan_id, discount_pct, status, created_by)
     VALUES ($1, $2, 'PREMIUM', 15, 'AVAILABLE', 'SUPER_ADMIN')`,
    [couponId, couponCode]
  );

  await pool.query(
    `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, original_amount, discount_pct, discount_amount, coupon_code, status)
     VALUES ($1, 'Customer One', 'c1@example.com', 'Diner One', 'PREMIUM', 4250, 5000, 15, 750, $2, 'PENDING')`,
    [orderId1, couponCode]
  );

  await pool.query(
    `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, original_amount, discount_pct, discount_amount, coupon_code, status)
     VALUES ($1, 'Customer Two', 'c2@example.com', 'Diner Two', 'PREMIUM', 4250, 5000, 15, 750, $2, 'PENDING')`,
    [orderId2, couponCode]
  );

  // Step 1: Order 2 legitimately validates and reserves the coupon
  const reservedOrder2 = await validateAndReserveCoupon({
    code: couponCode,
    planId: 'PREMIUM',
    orderId: orderId2
  });
  assert.equal(reservedOrder2.status, 'RESERVED');
  assert.equal(reservedOrder2.reserved_order_id, orderId2);

  // Step 2: Order 1 attempts to redeem the coupon while it is actively RESERVED by Order 2
  const stolenResult = await redeemCouponForOrder({
    orderId: orderId1,
    couponCode: couponCode
  });

  // Order 1 must NOT be allowed to steal Order 2's reservation!
  assert.equal(
    stolenResult,
    null,
    'Order 1 must NOT be able to redeem a coupon actively reserved for Order 2'
  );

  // Verify in database: coupon must still be RESERVED for Order 2, NOT redeemed by Order 1
  const dbCoupon = await pool.query('SELECT status, reserved_order_id, redeemed_order_id FROM coupons WHERE id = $1', [couponId]);
  assert.equal(dbCoupon.rows[0].status, 'RESERVED', 'Coupon must remain in RESERVED status for Order 2');
  assert.equal(dbCoupon.rows[0].reserved_order_id, orderId2, 'Coupon reservation must still belong to Order 2');
  assert.equal(dbCoupon.rows[0].redeemed_order_id, null, 'Coupon must NOT be redeemed by Order 1');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB } from '../db.js';
import {
  validateAndReserveCoupon,
  redeemCouponForOrder,
  releaseCouponReservation
} from '../coupons.js';

test('Batch 3 #5: Expired coupon reservation must be REDEEMED on payment and never left AVAILABLE', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const couponId = `coup_race_${timestamp}`;
  const couponCode = `RACE${timestamp.toString().slice(-6)}`;
  const orderId1 = `ord_race1_${timestamp}`;
  const orderId2 = `ord_race2_${timestamp}`;

  t.after(async () => {
    await pool.query('DELETE FROM orders WHERE id IN ($1, $2)', [orderId1, orderId2]);
    await pool.query('DELETE FROM coupons WHERE id = $1', [couponId]);
  });

  // Setup: Insert coupon and initial order
  await pool.query(
    `INSERT INTO coupons (id, code, plan_id, discount_pct, status, created_by)
     VALUES ($1, $2, 'PREMIUM', 15, 'AVAILABLE', 'SUPER_ADMIN')`,
    [couponId, couponCode]
  );

  await pool.query(
    `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, original_amount, discount_pct, discount_amount, coupon_code, status)
     VALUES ($1, 'Customer One', 'c1@example.com', 'Race Diner One', 'PREMIUM', 4250, 5000, 15, 750, $2, 'PENDING')`,
    [orderId1, couponCode]
  );

  await t.test('Expired reservation must be authoritatively marked REDEEMED on payment completion', async () => {
    // Step 1: Order 1 reserves the coupon
    const reserved = await validateAndReserveCoupon({
      code: couponCode,
      planId: 'PREMIUM',
      orderId: orderId1
    });
    assert.equal(reserved.status, 'RESERVED');
    assert.equal(reserved.reserved_order_id, orderId1);

    // Step 2: Simulate 35 minutes passing, causing reservation cleanup to reset it to AVAILABLE
    await pool.query(
      `UPDATE coupons
       SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [couponId]
    );

    // Verify it is currently AVAILABLE due to expired reservation
    const staleCoupon = await pool.query('SELECT status, reserved_order_id FROM coupons WHERE id = $1', [couponId]);
    assert.equal(staleCoupon.rows[0].status, 'AVAILABLE');

    // Step 3: Payment arrives and completes for Order 1
    // The coupon attached to Order 1 must be redeemed authoritatively!
    const redeemed = await redeemCouponForOrder({
      orderId: orderId1,
      couponCode: couponCode
    });

    // Check DB state: Coupon MUST NOT be AVAILABLE! It must be REDEEMED!
    const postPaymentCoupon = await pool.query('SELECT status, redeemed_order_id FROM coupons WHERE id = $1', [couponId]);
    assert.equal(
      postPaymentCoupon.rows[0].status,
      'REDEEMED',
      'Coupon must be transitioned to REDEEMED on payment even if reservation had expired'
    );
    assert.equal(
      postPaymentCoupon.rows[0].redeemed_order_id,
      orderId1,
      'Coupon must record Order 1 as the redeemed order'
    );

    // Step 4: Another customer attempting to reserve or use this coupon must be rejected
    await assert.rejects(
      async () => validateAndReserveCoupon({
        code: couponCode,
        planId: 'PREMIUM',
        orderId: orderId2
      }),
      (err) => err.status === 400 && err.message.includes('already been redeemed'),
      'Subsequent reservation attempt on redeemed coupon must fail'
    );
  });

  // TEST 2: Real Concurrency Race Test
  await t.test('Concurrent race between payment redemption and stale reservation release', async () => {
    const raceCouponId = `coup_race2_${timestamp}`;
    const raceCouponCode = `RACE2${timestamp.toString().slice(-5)}`;
    const raceOrder1 = `ord_c1_${timestamp}`;
    const raceOrder2 = `ord_c2_${timestamp}`;

    try {
      await pool.query(
        `INSERT INTO coupons (id, code, plan_id, discount_pct, status, created_by)
         VALUES ($1, $2, 'PREMIUM', 10, 'AVAILABLE', 'SUPER_ADMIN')`,
        [raceCouponId, raceCouponCode]
      );

      await pool.query(
        `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, original_amount, discount_pct, discount_amount, coupon_code, status)
         VALUES ($1, 'Race Diner', 'race@example.com', 'Race Diner Two', 'PREMIUM', 4500, 5000, 10, 500, $2, 'PENDING')`,
        [raceOrder1, raceCouponCode]
      );

      // Reserve coupon
      await validateAndReserveCoupon({ code: raceCouponCode, planId: 'PREMIUM', orderId: raceOrder1 });

      // Simulate reservation aged past 30 minutes
      await pool.query(
        `UPDATE coupons SET reserved_at = NOW() - INTERVAL '31 minutes' WHERE id = $1`,
        [raceCouponId]
      );

      // Run 10 parallel operations racing between:
      // - Stale reservation releases
      // - Order 1 payment redemption
      // - Order 2 reservation attempts
      await Promise.all([
        redeemCouponForOrder({ orderId: raceOrder1, couponCode: raceCouponCode }),
        releaseCouponReservation({ orderId: raceOrder1 }),
        pool.query(
          `UPDATE coupons SET status = 'AVAILABLE', reserved_order_id = NULL, reserved_at = NULL, updated_at = NOW()
           WHERE status = 'RESERVED' AND reserved_at < NOW() - INTERVAL '30 minutes' AND id = $1`,
          [raceCouponId]
        ),
        redeemCouponForOrder({ orderId: raceOrder1, couponCode: raceCouponCode }),
        (async () => {
          try {
            await validateAndReserveCoupon({ code: raceCouponCode, planId: 'PREMIUM', orderId: raceOrder2 });
          } catch (e) {
            // Expected once redeemed
          }
        })()
      ]);

      // Final invariant check:
      // Because Order 1 paid, the coupon MUST be in REDEEMED state, NEVER left AVAILABLE
      const finalRes = await pool.query('SELECT status, redeemed_order_id FROM coupons WHERE id = $1', [raceCouponId]);
      assert.equal(finalRes.rows[0].status, 'REDEEMED', 'Coupon must be REDEEMED after payment despite concurrent stale releases');
      assert.equal(finalRes.rows[0].redeemed_order_id, raceOrder1);
    } finally {
      await pool.query('DELETE FROM orders WHERE id IN ($1, $2)', [raceOrder1, raceOrder2]);
      await pool.query('DELETE FROM coupons WHERE id = $1', [raceCouponId]);
    }
  });
});

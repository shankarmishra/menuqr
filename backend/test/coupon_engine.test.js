import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCouponCode,
  calculateDiscount,
  ALLOWED_DISCOUNT_TIERS,
  MAX_ACTIVE_COUPONS_PER_PLAN,
} from '../coupons.js';
import { normalizePhone, isValidPhone } from '../sms.js';

describe('Coupon Engine & Calculation Invariants', () => {
  test('ALLOWED_DISCOUNT_TIERS allows only 5%, 10%, 15%', () => {
    assert.deepEqual(ALLOWED_DISCOUNT_TIERS, [5, 10, 15]);
  });

  test('calculateDiscount computes currency-safe integer-paise discounts correctly', () => {
    // Premium plan 2999 - 15% discount
    const calc15 = calculateDiscount(2999, 15);
    assert.equal(calc15.originalAmount, 2999);
    assert.equal(calc15.discountPct, 15);
    assert.equal(calc15.discountAmount, 449.85); // 2999 * 0.15 = 449.85
    assert.equal(calc15.finalAmount, 2549.15);   // 2999 - 449.85 = 2549.15

    // Intermediate plan 1499 - 10% discount
    const calc10 = calculateDiscount(1499, 10);
    assert.equal(calc10.originalAmount, 1499);
    assert.equal(calc10.discountPct, 10);
    assert.equal(calc10.discountAmount, 149.9);
    assert.equal(calc10.finalAmount, 1349.1);

    // Intermediate plan 1499 - 5% discount
    const calc5 = calculateDiscount(1499, 5);
    assert.equal(calc5.originalAmount, 1499);
    assert.equal(calc5.discountPct, 5);
    assert.equal(calc5.discountAmount, 74.95);
    assert.equal(calc5.finalAmount, 1424.05);
  });

  test('calculateDiscount rejects disallowed discount percentages', () => {
    assert.throws(() => calculateDiscount(2999, 20), {
      message: /Discount percentage must be 5%, 10%, or 15%/,
    });
    assert.throws(() => calculateDiscount(2999, 50), {
      message: /Discount percentage must be 5%, 10%, or 15%/,
    });
    assert.throws(() => calculateDiscount(2999, 0), {
      message: /Discount percentage must be 5%, 10%, or 15%/,
    });
  });

  test('generateCouponCode produces human-readable alphanumeric code distinct from 5-digit ref code', () => {
    const code = generateCouponCode(15);
    assert.match(code, /^MQ15-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    assert.notEqual(code.length, 5, 'Coupon code must not be confused with 5-digit restaurant reference code');
  });

  test('MAX_ACTIVE_COUPONS_PER_PLAN invariant is 15', () => {
    assert.equal(MAX_ACTIVE_COUPONS_PER_PLAN, 15);
  });

  test('validateAndReserveCoupon rejects Basic plan coupons', async () => {
    const { validateAndReserveCoupon } = await import('../coupons.js');
    await assert.rejects(
      async () => {
        await validateAndReserveCoupon({ code: 'MQ15-TEST-1234', planId: 'BASIC', orderId: 'ord_1' });
      },
      (err) => err.status === 400 && /Basic plan is not eligible/i.test(err.message)
    );
  });

  test('bulkGenerateCoupons enforces max 15 count limit per plan under simulated competing requests', async () => {
    const { setPool } = await import('../db.js');
    let lockedCount = 0;
    let activeCouponsInDb = 10; // 10 already exist

    const mockClient = {
      query: async (sql, params) => {
        const s = String(sql);
        if (s.includes('BEGIN') || s.includes('COMMIT') || s.includes('ROLLBACK')) {
          return { rows: [] };
        }
        if (s.includes('pg_advisory_xact_lock')) {
          lockedCount++;
          return { rows: [] };
        }
        if (s.includes('SELECT COUNT(*)')) {
          return { rows: [{ count: activeCouponsInDb }] };
        }
        if (s.includes('INSERT INTO coupons')) {
          activeCouponsInDb++;
          return { rows: [{ id: 'cpn_mock', code: 'MQ15-TEST-MOCK', plan_id: 'PREMIUM', discount_pct: 15 }] };
        }
        return { rows: [] };
      },
      release: () => {},
    };

    setPool({
      connect: async () => mockClient,
      query: (sql, params) => mockClient.query(sql, params),
    });

    const { bulkGenerateCoupons } = await import('../coupons.js');

    // Requesting 5 when 10 exist should succeed (10 + 5 = 15)
    const res = await bulkGenerateCoupons({ planId: 'PREMIUM', discountPct: 15, count: 5 });
    assert.equal(res.length, 5);
    assert.equal(lockedCount, 1, 'pg_advisory_xact_lock was acquired for plan serialization');

    // Subsequent request of 1 when 15 exist should fail with 400
    await assert.rejects(
      async () => {
        await bulkGenerateCoupons({ planId: 'PREMIUM', discountPct: 15, count: 1 });
      },
      (err) => err.status === 400 && /Cannot exceed limit of 15 active coupons/i.test(err.message)
    );
  });
});

describe('Phone Normalization & SMS Verification Adapter', () => {
  test('normalizePhone normalizes 10-digit Indian numbers to E.164 (+91)', () => {
    assert.equal(normalizePhone('9876543210'), '+919876543210');
    assert.equal(normalizePhone('+91 98765 43210'), '+919876543210');
    assert.equal(normalizePhone('+1 (555) 123-4567'), '+15551234567');
  });

  test('isValidPhone validates E.164 phone format', () => {
    assert.equal(isValidPhone('9876543210'), true);
    assert.equal(isValidPhone('+919876543210'), true);
    assert.equal(isValidPhone('12345'), false);
    assert.equal(isValidPhone('invalid'), false);
  });

  test('requestPhoneOtp rejects SMS OTP requests safely without initiating paid SMS API calls', async () => {
    const { requestPhoneOtp } = await import('../sms.js');
    await assert.rejects(
      async () => {
        await requestPhoneOtp('9876543210');
      },
      (err) => err.status === 400 && /SMS OTP verification is disabled/i.test(err.message)
    );
  });
});

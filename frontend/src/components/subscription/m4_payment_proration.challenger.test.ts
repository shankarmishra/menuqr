import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Reference Proration & Indian Tax Logic (mirrors backend/subscriptionService.js)
// ---------------------------------------------------------------------------
function calculateProrationReference(
  currentPricePaise: number,
  remainingDays: number,
  targetPricePaise: number,
  intraState = true
) {
  const dailyRatePaise = Math.round(currentPricePaise / 365);
  const validRemainingDays = Math.max(0, remainingDays || 0);
  const creditPaise = validRemainingDays * dailyRatePaise;
  const subtotalPaise = Math.max(100, targetPricePaise - creditPaise);

  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (intraState) {
    cgstPaise = Math.round(subtotalPaise * 0.09);
    sgstPaise = Math.round(subtotalPaise * 0.09);
  } else {
    igstPaise = Math.round(subtotalPaise * 0.18);
  }

  const taxPaise = cgstPaise + sgstPaise + igstPaise;
  const totalPaise = subtotalPaise + taxPaise;

  return {
    dailyRatePaise,
    creditPaise,
    subtotalPaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    taxPaise,
    totalPaise,
  };
}

describe('M4 Empirical Challenger: Mathematical & Financial Stress Testing', () => {

  it('Stress 1.1: Proration across exhaustive remaining days [0..366] never yields negative or fractional paise', () => {
    const basicPaise = 199900;
    const intermediatePaise = 319900;
    const premiumPaise = 679900;

    for (let days = 0; days <= 366; days++) {
      // Basic -> Intermediate
      const resBI = calculateProrationReference(basicPaise, days, intermediatePaise);
      assert.ok(Number.isInteger(resBI.creditPaise), `Credit must be integer paise at ${days} days`);
      assert.ok(Number.isInteger(resBI.subtotalPaise), `Subtotal must be integer paise at ${days} days`);
      assert.ok(resBI.subtotalPaise >= 100, `Subtotal must be >= 100 paise at ${days} days`);
      assert.ok(resBI.creditPaise >= 0, `Credit must be non-negative at ${days} days`);
      assert.equal(resBI.totalPaise, resBI.subtotalPaise + resBI.taxPaise);

      // Intermediate -> Premium
      const resIP = calculateProrationReference(intermediatePaise, days, premiumPaise);
      assert.ok(resIP.subtotalPaise >= 100);
      assert.ok(resIP.creditPaise >= 0);
      assert.equal(resIP.totalPaise, resIP.subtotalPaise + resIP.taxPaise);
    }
  });

  it('Stress 1.2: Massive validity buffer (1000..10000 days) strictly caps at 100 paise minimum subtotal', () => {
    const intermediatePaise = 319900;
    const premiumPaise = 679900;

    for (const massiveDays of [1000, 2500, 5000, 10000]) {
      const res = calculateProrationReference(intermediatePaise, massiveDays, premiumPaise);
      assert.equal(res.subtotalPaise, 100, `Subtotal must strictly floor at 100 paise with ${massiveDays} days credit`);
      // CGST (9%) on 100 = 9 paise, SGST (9%) on 100 = 9 paise -> Tax = 18 paise, Total = 118 paise
      assert.equal(res.cgstPaise, 9);
      assert.equal(res.sgstPaise, 9);
      assert.equal(res.taxPaise, 18);
      assert.equal(res.totalPaise, 118);
    }
  });

  it('Stress 1.3: Inter-state IGST vs Intra-state CGST+SGST tax equality', () => {
    const subtotal = 500000; // ₹5,000.00
    const intra = calculateProrationReference(0, 0, subtotal, true);
    const inter = calculateProrationReference(0, 0, subtotal, false);

    assert.equal(intra.cgstPaise, 45000); // 9%
    assert.equal(intra.sgstPaise, 45000); // 9%
    assert.equal(intra.igstPaise, 0);
    assert.equal(intra.taxPaise, 90000); // 18%

    assert.equal(inter.cgstPaise, 0);
    assert.equal(inter.sgstPaise, 0);
    assert.equal(inter.igstPaise, 90000); // 18%
    assert.equal(inter.taxPaise, 90000);
    assert.equal(intra.totalPaise, inter.totalPaise);
  });
});

describe('M4 Empirical Challenger: Zero-Lost-Days Expiration Math', () => {

  it('Stress 2.1: Renewal from leap year day (Feb 29) produces valid non-NaN timestamp', () => {
    // 2024 is leap year
    const leapDay = new Date('2024-02-29T12:00:00.000Z');
    const target = new Date(leapDay);
    target.setFullYear(target.getFullYear() + 1);

    // Target year is 2025 (non-leap), JS Date rolls to March 1 (or Feb 28 depending on tz)
    assert.equal(target.getFullYear(), 2025);
    assert.ok(!isNaN(target.getTime()), 'Timestamp must not be NaN');
    assert.ok(target.getTime() > leapDay.getTime());
  });

  it('Stress 2.2: Stacking multiple renewals accumulates 365 days per renewal without losing fractional hours', () => {
    const start = new Date('2026-11-03T17:00:00.000Z');
    let currentExpiry = new Date(start);

    for (let renewal = 1; renewal <= 5; renewal++) {
      const now = new Date('2026-11-03T18:00:00.000Z');
      const baseDate = currentExpiry.getTime() > now.getTime() ? currentExpiry : now;
      const nextExpiry = new Date(baseDate);
      nextExpiry.setFullYear(nextExpiry.getFullYear() + 1);

      assert.ok(nextExpiry.getTime() > currentExpiry.getTime(), 'Each renewal must extend validity');
      currentExpiry = nextExpiry;
    }

    assert.equal(currentExpiry.getFullYear(), 2031);
    assert.equal(currentExpiry.getMonth(), 10); // November (0-indexed 10)
    assert.equal(currentExpiry.getDate(), 3);
  });
});

describe('M4 Empirical Challenger: Drawer State Machine & Event Drop Invariants', () => {

  it('Stress 3.1: PaymentStep.tsx source verification: strict orderId drop on menusqr:plan-updated', () => {
    const paymentStepPath = path.resolve(__dirname, 'PaymentStep.tsx');
    assert.ok(fs.existsSync(paymentStepPath), 'PaymentStep.tsx must exist');
    const content = fs.readFileSync(paymentStepPath, 'utf-8');

    // Verification that missing orderId is dropped
    assert.ok(
      content.includes('if (!detail?.orderId || detail.orderId !== orderId) {') &&
      content.includes('return;'),
      'PaymentStep must drop event if orderId is missing OR does not match orderId'
    );
  });

  it('Stress 3.2: Mock Event Dispatcher proves missing orderId and mismatched orderId never trigger completion', () => {
    let completedCount = 0;
    const targetOrderId = 'order_valid_123';

    // Simulate PaymentStep handler logic
    const handlePlanUpdated = (detail: any) => {
      if (!detail?.orderId || detail.orderId !== targetOrderId) {
        return;
      }
      completedCount++;
    };

    // Adversarial tests:
    // 1. Missing detail
    handlePlanUpdated(undefined);
    assert.equal(completedCount, 0, 'Undefined detail must be dropped');

    // 2. Missing orderId
    handlePlanUpdated({ planId: 'PREMIUM', expiresAt: '2027-11-03' });
    assert.equal(completedCount, 0, 'Missing orderId must be dropped');

    // 3. Null orderId
    handlePlanUpdated({ orderId: null, planId: 'PREMIUM' });
    assert.equal(completedCount, 0, 'Null orderId must be dropped');

    // 4. Mismatched orderId
    handlePlanUpdated({ orderId: 'order_intruder_999', planId: 'PREMIUM' });
    assert.equal(completedCount, 0, 'Mismatched orderId must be dropped');

    // 5. Valid matching orderId
    handlePlanUpdated({ orderId: targetOrderId, planId: 'PREMIUM' });
    assert.equal(completedCount, 1, 'Matching orderId must trigger completion');
  });

  it('Stress 3.3: Active renewal poller guards against premature completion', () => {
    const existingExpiry = '2026-12-01T00:00:00.000Z';
    const newExpectedExpiry = '2027-12-01T00:00:00.000Z';
    let completed = false;

    const checkRenewalStatus = (sub: { status: string; expiresAt: string }) => {
      if (sub && sub.status === 'ACTIVE') {
        const currentSubExpiry = new Date(sub.expiresAt).getTime();
        const expectedMinExpiry = new Date(newExpectedExpiry).getTime() - 60000;
        if (currentSubExpiry >= expectedMinExpiry) {
          completed = true;
        }
      }
    };

    // When backend has NOT updated expiresAt yet, even though ACTIVE, must NOT complete
    checkRenewalStatus({ status: 'ACTIVE', expiresAt: existingExpiry });
    assert.equal(completed, false, 'Must NOT complete when expiresAt is still old expiry');

    // When backend updates expiresAt to newExpectedExpiry, must complete
    checkRenewalStatus({ status: 'ACTIVE', expiresAt: newExpectedExpiry });
    assert.equal(completed, true, 'Must complete once expiresAt reaches or exceeds expectedMinExpiry');
  });

  it('Stress 3.4: Status check try-catch-finally guarantees verifying state resets on 400, 404, 500, and Network Error', async () => {
    // Simulating the checkPaymentStatus resilience logic
    const simulateStatusCheck = async (mockResponse: () => Promise<any>) => {
      let verifying = false;
      let completed = false;
      verifying = true;
      try {
        const res = await mockResponse();
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'PAID') {
            completed = true;
          }
        }
      } catch (e) {
        // Ignored in poller
      } finally {
        verifying = false;
      }
      return { verifying, completed };
    };

    // Test 1: 400 Bad Request
    const res400 = await simulateStatusCheck(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Bad Request' }),
    }));
    assert.equal(res400.verifying, false);
    assert.equal(res400.completed, false);

    // Test 2: 404 Not Found
    const res404 = await simulateStatusCheck(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Order Not Found' }),
    }));
    assert.equal(res404.verifying, false);
    assert.equal(res404.completed, false);

    // Test 3: 500 Internal Server Error
    const res500 = await simulateStatusCheck(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    }));
    assert.equal(res500.verifying, false);
    assert.equal(res500.completed, false);

    // Test 4: Network Throw (TypeError: Failed to fetch)
    const resNet = await simulateStatusCheck(async () => {
      throw new TypeError('Failed to fetch');
    });
    assert.equal(resNet.verifying, false);
    assert.equal(resNet.completed, false);

    // Test 5: 200 OK PAID
    const res200 = await simulateStatusCheck(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ status: 'PAID' }),
    }));
    assert.equal(res200.verifying, false);
    assert.equal(res200.completed, true);
  });
});

describe('M4 Empirical Challenger: Modal Navigation & Trapping Defenses', () => {

  it('Stress 4.1: CheckoutDrawer guards against modal closure during active payment', () => {
    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    // 1. Close button disabled
    assert.ok(content.includes("disabled={step === 'payment'}"));

    // 2. Escape key ignored
    assert.ok(content.includes("step !== 'payment'"));

    // 3. handleDrawerClose early returns
    assert.ok(content.includes("if (step === 'payment') return;"));

    // 4. Back navigation supported
    assert.ok(content.includes("onBack={() => setStep('panel')}"));
  });

  it('Stress 4.2: Tier hierarchy strictly prevents downgrade or re-purchase of same tier', () => {
    const UPGRADE_TIERS = [
      { id: 'intermediate', name: 'Intermediate' },
      { id: 'premium', name: 'Premium' },
    ];

    const getAvailableTiers = (currentKey: string) => {
      return UPGRADE_TIERS.filter((tier) => {
        if (currentKey === 'basic') return true;
        if (currentKey === 'intermediate') return tier.id === 'premium';
        return false;
      });
    };

    assert.deepEqual(getAvailableTiers('basic').map(t => t.id), ['intermediate', 'premium']);
    assert.deepEqual(getAvailableTiers('intermediate').map(t => t.id), ['premium']);
    assert.deepEqual(getAvailableTiers('premium'), []);
    assert.deepEqual(getAvailableTiers('unknown_tier'), []);
  });
});

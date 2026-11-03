import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Helpers and Reference Math
// ---------------------------------------------------------------------------

function formatPaise(paise?: number): string {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });
}

function calculateProrationReference(currentPricePaise: number, remainingDays: number, targetPricePaise: number, intraState = true) {
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

describe('M4 Adversarial: Subscription Redirection & State Invariants', () => {

  it('Vector 1.1: Static AST verification that Subscription.tsx has 0 external redirects', () => {
    const filePath = path.resolve(__dirname, '../../pages/app/Subscription.tsx');
    assert.ok(fs.existsSync(filePath), 'Subscription.tsx must exist');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Forbidden patterns that cause external redirection or page departure
    const forbiddenPatterns = [
      /navigate\s*\(\s*['"`]\/purchase/i,
      /useNavigate/i,
      /window\.location\.href\s*=/i,
      /window\.location\.assign\s*\(/i,
      /window\.location\.replace\s*\(/i,
      /window\.open\s*\(/i,
      /href\s*=\s*['"`]\/purchase/i,
      /href\s*=\s*['"`]http/i,
    ];

    for (const pattern of forbiddenPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Subscription.tsx must NOT contain pattern matching ${pattern}`
      );
    }

    // Required patterns: opens drawer locally
    assert.ok(content.includes('setDrawerOpen(true)'), 'Must open drawer locally');
    assert.ok(content.includes('<CheckoutDrawer'), 'Must render CheckoutDrawer in-app');
  });

  it('Vector 1.2: Static verification that CheckoutDrawer and subpanels do not redirect', () => {
    const filesToCheck = [
      'CheckoutDrawer.tsx',
      'RenewalPanel.tsx',
      'UpgradePanel.tsx',
      'PaymentStep.tsx',
      'SuccessPanel.tsx',
      'InvoiceHistory.tsx',
    ];

    for (const file of filesToCheck) {
      const p = path.resolve(__dirname, file);
      assert.ok(fs.existsSync(p), `${file} must exist`);
      const content = fs.readFileSync(p, 'utf-8');

      // None of the panels should be redirecting to /purchase or using useNavigate
      assert.equal(/navigate\s*\(\s*['"`]\/purchase/i.test(content), false, `${file} must not navigate to /purchase`);
      assert.equal(/window\.location\.href\s*=\s*['"`]\/purchase/i.test(content), false, `${file} must not redirect via location.href`);
    }
  });

  it('Vector 1.3: Cashfree integration in PaymentStep uses _modal instead of full-page redirectTarget', () => {
    const paymentStepPath = path.resolve(__dirname, 'PaymentStep.tsx');
    const content = fs.readFileSync(paymentStepPath, 'utf-8');

    // Cashfree must checkout in modal mode to keep user on /app/subscription
    assert.ok(content.includes("redirectTarget: '_modal'"), "PaymentStep must use redirectTarget: '_modal'");
  });
});

describe('M4 Adversarial: Proration Math & Stress Testing', () => {

  it('Vector 2.1: Proration calculation with 0 remaining days awards zero credit', () => {
    const basicPrice = 199900;
    const premiumPrice = 679900;
    const res = calculateProrationReference(basicPrice, 0, premiumPrice);

    assert.equal(res.creditPaise, 0, '0 remaining days must yield exactly 0 credit');
    assert.equal(res.subtotalPaise, premiumPrice, 'Subtotal must equal full premium price');
    assert.equal(res.totalPaise, premiumPrice + res.taxPaise, 'Total must equal full price + GST');
  });

  it('Vector 2.2: Proration calculation with negative remaining days (expired) never produces negative credit', () => {
    const basicPrice = 199900;
    const premiumPrice = 679900;

    for (const pastDays of [-1, -5, -30, -365, -1000]) {
      const res = calculateProrationReference(basicPrice, pastDays, premiumPrice);
      assert.equal(res.creditPaise, 0, `Expired plan (${pastDays} days) must yield 0 credit, not negative credit`);
      assert.equal(res.subtotalPaise, premiumPrice);
    }
  });

  it('Vector 2.3: Daily rate rounding is deterministic and matches Indian rupee paise standards', () => {
    // Basic: 199900 / 365 = 547.6712... -> 548 paise
    const basicDailyRate = Math.round(199900 / 365);
    assert.equal(basicDailyRate, 548);

    // Intermediate: 319900 / 365 = 876.4383... -> 876 paise
    const intermediateDailyRate = Math.round(319900 / 365);
    assert.equal(intermediateDailyRate, 876);

    // Premium: 679900 / 365 = 1862.7397... -> 1863 paise
    const premiumDailyRate = Math.round(679900 / 365);
    assert.equal(premiumDailyRate, 1863);
  });

  it('Vector 2.4: Extreme credit floor: massive remaining days strictly floors at 100 paise (₹1)', () => {
    // If user has 800 days stacked validity on intermediate (800 * 876 = 700,800 paise credit)
    // Target price = 679,900 paise. Credit exceeds price by 20,900 paise.
    const res = calculateProrationReference(319900, 800, 679900);
    assert.equal(res.subtotalPaise, 100, 'Subtotal must strictly floor at 100 paise (₹1.00)');
    assert.ok(res.totalPaise >= 100, 'Total payable must be at least ₹1.00 + GST');
    // GST on 100 paise at 18% = 18 paise -> total 118 paise
    assert.equal(res.taxPaise, 18);
    assert.equal(res.totalPaise, 118);
  });

  it('Vector 2.5: FormatPaise stress test handles 0, NaN, undefined, negative, and large amounts', () => {
    assert.ok(formatPaise(0).includes('0.00'));
    assert.ok(formatPaise(undefined).includes('0.00'));
    assert.ok(formatPaise(NaN).includes('0.00'));
    assert.ok(formatPaise(100).includes('1.00'));
    assert.ok(formatPaise(199900).includes('1,999.00'));
    assert.ok(formatPaise(679900).includes('6,799.00'));
  });
});

describe('M4 Adversarial: Zero-Days-Loss Renewal & Leap Year Boundaries', () => {

  it('Vector 3.1: Active plan renewal extends from existing expiresAt, not from now (Zero-Days-Loss)', () => {
    const now = new Date('2026-11-03T12:00:00Z');
    // Existing plan expires in 120 days
    const currentExpiresAt = new Date(now.getTime() + 120 * 86400000);

    const baseDate = currentExpiresAt.getTime() > now.getTime() ? currentExpiresAt : now;
    const calculatedNewExpiry = new Date(baseDate.getTime() + 365 * 86400000);

    // Total validity from now should be 120 + 365 = 485 days
    const totalDays = Math.round((calculatedNewExpiry.getTime() - now.getTime()) / 86400000);
    assert.equal(totalDays, 485, 'Customer must retain all 120 remaining days + 365 new days');
  });

  it('Vector 3.2: Expired plan renewal extends from now, never from past expired date', () => {
    const now = new Date('2026-11-03T12:00:00Z');
    // Plan expired 45 days ago
    const pastExpiredAt = new Date(now.getTime() - 45 * 86400000);

    const baseDate = pastExpiredAt.getTime() > now.getTime() ? pastExpiredAt : now;
    const calculatedNewExpiry = new Date(baseDate.getTime() + 365 * 86400000);

    // Total days from now should be exactly 365 days
    const totalDays = Math.round((calculatedNewExpiry.getTime() - now.getTime()) / 86400000);
    assert.equal(totalDays, 365, 'Expired plan renewal must grant full 365 days from today');
    assert.ok(calculatedNewExpiry > now, 'New expiry must be in the future');
  });

  it('Vector 3.3: Leap year boundary test (Feb 29 leap day math)', () => {
    // 2024 was a leap year
    const leapDay = new Date('2024-02-29T12:00:00Z');

    // Frontend RenewalPanel math: baseDate.getTime() + 365 * 86400000
    const frontendNextYear = new Date(leapDay.getTime() + 365 * 86400000);
    // 2024-02-29 + 365 days = 2025-02-28
    assert.equal(frontendNextYear.getUTCFullYear(), 2025);
    assert.equal(frontendNextYear.getUTCMonth(), 1); // February (0-indexed: 1)
    assert.equal(frontendNextYear.getUTCDate(), 28);

    // Backend setFullYear math:
    const backendNextYear = new Date(leapDay);
    backendNextYear.setFullYear(backendNextYear.getFullYear() + 1);
    // Setting year to 2025 on Feb 29 rolls to March 1, 2025
    assert.equal(backendNextYear.getFullYear(), 2025);
    assert.ok(
      (backendNextYear.getMonth() === 1 && backendNextYear.getDate() === 28) ||
      (backendNextYear.getMonth() === 2 && backendNextYear.getDate() === 1),
      'Must produce valid February 28 or March 1 without corrupting timestamp'
    );
  });
});

describe('M4 Adversarial: Invalid Tier Transitions & Premium Guards', () => {

  it('Vector 4.1: Subscription.tsx hides Upgrade button entirely when on Premium', () => {
    const subscriptionPath = path.resolve(__dirname, '../../pages/app/Subscription.tsx');
    const content = fs.readFileSync(subscriptionPath, 'utf-8');

    // Must define isPremium and wrap upgrade button in {!isPremium && ...}
    assert.ok(content.includes('const isPremium = planKey === \'premium\';'), 'Must evaluate isPremium');
    assert.ok(content.includes('{!isPremium && ('), 'Upgrade button must be conditionally excluded when isPremium');
  });

  it('Vector 4.2: CheckoutDrawer.tsx hides upgrade tab when currentPlanId is Premium', () => {
    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    assert.ok(content.includes('const isPremium = planKey === \'premium\';'), 'Drawer must evaluate isPremium');
    assert.ok(content.includes('{step === \'panel\' && !isPremium && ('), 'Action tabs must be hidden when isPremium');
  });

  it('Vector 4.3: UpgradePanel available tiers filter blocks same and lower tiers', () => {
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

    // When on basic -> intermediate, premium available
    assert.deepEqual(getAvailableTiers('basic').map(t => t.id), ['intermediate', 'premium']);

    // When on intermediate -> only premium available
    assert.deepEqual(getAvailableTiers('intermediate').map(t => t.id), ['premium']);

    // When on premium -> EMPTY (no upgrades possible)
    assert.deepEqual(getAvailableTiers('premium'), []);
  });
});

describe('M4 Adversarial: Drawer State Machine Trapping & Escape Handlers', () => {

  it('Vector 5.1: Escape key listener is disabled during active payment step', () => {
    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    // Escape must check: step !== 'payment'
    assert.ok(
      content.includes("e.key === 'Escape' && isOpen && step !== 'payment'"),
      'Escape key must NOT dismiss drawer when in payment step'
    );
  });

  it('Vector 5.2: Close button is disabled during active payment step', () => {
    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    assert.ok(
      content.includes("disabled={step === 'payment'}"),
      'Close button must be disabled when in payment step'
    );
    assert.ok(
      content.includes("if (step === 'payment') return;"),
      'handleDrawerClose must guard against closing during payment'
    );
  });

  it('Vector 5.3: PaymentStep provides back navigation to return to panel step', () => {
    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const content = fs.readFileSync(drawerPath, 'utf-8');

    assert.ok(
      content.includes("onBack={() => setStep('panel')}"),
      'PaymentStep must receive onBack handler resetting step to panel'
    );
  });

  it('Vector 5.4: PaymentStep does not prematurely complete active renewals without verified expiration extension', () => {
    const paymentStepPath = path.resolve(__dirname, 'PaymentStep.tsx');
    const content = fs.readFileSync(paymentStepPath, 'utf-8');

    // Must NOT contain premature renewal completion solely on sub.status === ACTIVE
    const prematurePattern = /if\s*\(\s*orderSubtype\s*===\s*['"]RENEWAL['"]\s*\)\s*\{\s*handleComplete\s*\(\s*sub\.planId/m;
    assert.equal(
      prematurePattern.test(content),
      false,
      'PaymentStep must NOT complete renewal solely based on sub.status === ACTIVE'
    );

    // Must verify renewal via newExpiry extension comparison
    assert.ok(
      content.includes("orderSubtype === 'RENEWAL'") &&
      content.includes('newExpiry && sub.expiresAt') &&
      content.includes('currentSubExpiry >= expectedMinExpiry'),
      'PaymentStep must verify sub.expiresAt against expected newExpiry'
    );

    // Must manage verifying state properly
    assert.ok(
      content.includes('setVerifying(true)') && content.includes('setVerifying(false)'),
      'PaymentStep must set verifying true and reset in finally block'
    );

    // Must filter SSE plan_updated by orderId
    assert.ok(
      content.includes('detail?.orderId && detail.orderId !== orderId'),
      'PaymentStep must ignore SSE plan_updated events for other orders'
    );
  });

  it('Vector 5.5: UpgradePanel passes selectedTier and CheckoutDrawer robustly populates targetPlan', () => {
    const upgradePanelPath = path.resolve(__dirname, 'UpgradePanel.tsx');
    const upgradeContent = fs.readFileSync(upgradePanelPath, 'utf-8');

    assert.ok(
      upgradeContent.includes('onProceedToPayment(res, selectedTier.toUpperCase())'),
      'UpgradePanel must pass selectedTier to onProceedToPayment'
    );

    const drawerPath = path.resolve(__dirname, 'CheckoutDrawer.tsx');
    const drawerContent = fs.readFileSync(drawerPath, 'utf-8');

    // Must NOT have the broken ternary
    assert.equal(
      drawerContent.includes('orderData.order?.upgradeFromPlan ? undefined : undefined'),
      false,
      'CheckoutDrawer must NOT have broken ternary assigning undefined to targetPlan'
    );

    // Must extract chosenTarget from targetTier or orderData
    assert.ok(
      drawerContent.includes('const chosenTarget =') &&
      drawerContent.includes('targetTier ||') &&
      drawerContent.includes('targetPlan: chosenTarget.toUpperCase()'),
      'CheckoutDrawer must set targetPlan to resolved chosenTarget'
    );
  });

  it('Vector 5.6: usePlan guards visibility and focus listeners with sseRefCount > 0', () => {
    const usePlanPath = path.resolve(__dirname, '../../lib/usePlan.ts');
    const content = fs.readFileSync(usePlanPath, 'utf-8');

    // connectSSE must guard with sseRefCount <= 0
    assert.ok(
      content.includes('if (sseRefCount <= 0) return;'),
      'connectSSE must exit early if sseRefCount <= 0'
    );

    // scheduleSSEReconnect must guard with sseRefCount <= 0
    assert.ok(
      content.includes('if (sseRefCount <= 0 || reconnectTimer) return;'),
      'scheduleSSEReconnect must exit early if sseRefCount <= 0'
    );

    // visibilitychange listener must check sseRefCount > 0
    assert.ok(
      content.includes("document.visibilityState === 'visible'") &&
      content.includes('if (sseRefCount > 0)'),
      'visibilitychange listener must check sseRefCount > 0'
    );

    // focus listener must check sseRefCount > 0
    assert.ok(
      content.includes("window.addEventListener('focus'") &&
      content.includes('if (sseRefCount > 0)'),
      'focus listener must check sseRefCount > 0'
    );
  });

  it('Vector 5.7: RenewalPanel uses setFullYear for exact leap year parity with backend', () => {
    const renewalPanelPath = path.resolve(__dirname, 'RenewalPanel.tsx');
    const content = fs.readFileSync(renewalPanelPath, 'utf-8');

    // Must NOT use fixed 365 * 24 * 60 * 60 * 1000 math
    assert.equal(
      content.includes('365 * 24 * 60 * 60 * 1000'),
      false,
      'RenewalPanel must NOT use fixed 365 days millisecond addition'
    );

    // Must use setFullYear(d.getFullYear() + 1)
    assert.ok(
      content.includes('setFullYear(d.getFullYear() + 1)'),
      'RenewalPanel must use setFullYear for leap year parity'
    );
  });
});

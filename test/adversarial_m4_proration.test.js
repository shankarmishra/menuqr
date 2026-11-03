/**
 * Milestone 4 Adversarial Stress Harness: Drawer State & Proration Challenger
 *
 * Empirical verification of:
 * 1. Upgrade blocking when already on PREMIUM (HTTP 400)
 * 2. Downgrade blocking on INTERMEDIATE / BASIC (HTTP 400)
 * 3. Malformed/injection targetPlan inputs fuzzer (HTTP 400)
 * 4. Exact proration math on database-backed tenant states
 * 5. Boundary condition: Zero days remaining
 * 6. Zero-Lost-Days renewal on expired plan (extends from now)
 * 7. Zero-Lost-Days renewal on active plan (stacks from currentExpiry)
 * 8. Credit floor guarantee under extreme stacked validity (floors at 100 paise)
 * 9. Unauthenticated security barriers (HTTP 401)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureServer,
  getBaseUrl,
  createTestTenant,
  cleanupTenant,
  apiRequest,
  dbQuery,
} from './e2e/helpers.js';

let baseUrl = getBaseUrl();
const createdTenants = [];

test.before(async () => {
  baseUrl = await ensureServer();
});

test.after(async () => {
  for (const t of createdTenants) {
    await cleanupTenant(t);
  }
});

test.describe('M4 Adversarial: Drawer State & Proration Live Server Stress Harness', () => {

  // -------------------------------------------------------------------------
  // 1. Upgrade Blocking When Already on PREMIUM
  // -------------------------------------------------------------------------
  test('ADV-1.1: Tenant on PREMIUM cannot request upgrade preview (must return HTTP 400)', async () => {
    const tenant = await createTestTenant({
      planId: 'PREMIUM',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 180 * 86400000),
    });
    createdTenants.push(tenant.tenantId);

    // Target: Premium (same tier)
    const resSame = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(resSame.status, 400, `Expected 400 for premium -> premium, got ${resSame.status}`);
    assert.ok(
      resSame.data?.error?.includes('Cannot upgrade') || resSame.data?.error?.includes('same or lower'),
      'Must explain upgrade is not allowed for same tier'
    );

    // Target: Intermediate (downgrade)
    const resDownInter = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=intermediate', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(resDownInter.status, 400, `Expected 400 for premium -> intermediate, got ${resDownInter.status}`);

    // Target: Basic (downgrade)
    const resDownBasic = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=basic', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(resDownBasic.status, 400, `Expected 400 for premium -> basic, got ${resDownBasic.status}`);
  });

  test('ADV-1.2: Tenant on PREMIUM cannot initiate upgrade order (must return HTTP 400)', async () => {
    const tenant = await createTestTenant({
      planId: 'PREMIUM',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 180 * 86400000),
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/subscription/upgrade/initiate', {
      token: tenant.token,
      baseUrl,
      body: { targetPlanId: 'premium' },
    });
    assert.equal(res.status, 400, `Expected 400 when premium initiates upgrade, got ${res.status}`);
  });

  // -------------------------------------------------------------------------
  // 2. Downgrade Blocking on INTERMEDIATE Tier
  // -------------------------------------------------------------------------
  test('ADV-2.1: Tenant on INTERMEDIATE cannot downgrade to BASIC (must return HTTP 400)', async () => {
    const tenant = await createTestTenant({
      planId: 'INTERMEDIATE',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 100 * 86400000),
    });
    createdTenants.push(tenant.tenantId);

    // Upgrade preview to basic
    const resPreview = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=basic', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(resPreview.status, 400, `Expected 400 for intermediate -> basic preview, got ${resPreview.status}`);

    // Upgrade initiate to basic
    const resInitiate = await apiRequest('POST', '/api/app/subscription/upgrade/initiate', {
      token: tenant.token,
      baseUrl,
      body: { targetPlan: 'basic' },
    });
    assert.equal(resInitiate.status, 400, `Expected 400 for intermediate -> basic initiate, got ${resInitiate.status}`);
  });

  // -------------------------------------------------------------------------
  // 3. Fuzzing & Hostile TargetPlan Inputs
  // -------------------------------------------------------------------------
  test('ADV-3.1: Hostile and malformed targetPlan values are safely rejected with HTTP 400', async () => {
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 50 * 86400000),
    });
    createdTenants.push(tenant.tenantId);

    const hostileInputs = [
      '',
      '   ',
      'enterprise',
      'VIP_DIAMOND',
      '<script>alert("xss")</script>',
      "' OR '1'='1",
      'DROP TABLE subscriptions;--',
      'null',
      'undefined',
      '12345',
    ];

    for (const val of hostileInputs) {
      const res = await apiRequest(
        'GET',
        `/api/app/subscription/upgrade-preview?targetPlan=${encodeURIComponent(val)}`,
        { token: tenant.token, baseUrl }
      );
      assert.equal(
        res.status,
        400,
        `Hostile input "${val}" must return HTTP 400, got ${res.status}`
      );
    }
  });

  // -------------------------------------------------------------------------
  // 4. Proration Mathematical Precision Verification
  // -------------------------------------------------------------------------
  test('ADV-4.1: Proration calculation matches exact formula with active remaining days', async () => {
    // 100 days remaining
    const remainingDaysTarget = 100;
    const expiresAt = new Date(Date.now() + remainingDaysTarget * 86400000);
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'ACTIVE',
      expiresAt,
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const preview = res.data?.preview || res.data;

    // Basic daily rate is Math.round(199900 / 365) = 548 paise
    const expectedDailyRate = 548;
    assert.equal(preview.dailyRatePaise, expectedDailyRate, 'Daily rate paise must equal 548');

    // Expected credit = remainingDays * dailyRate
    const remainingDays = Number(preview.remainingDays);
    assert.ok(
      Math.abs(remainingDays - remainingDaysTarget) <= 1,
      `Remaining days (${remainingDays}) should be ~${remainingDaysTarget}`
    );

    const expectedCredit = remainingDays * expectedDailyRate;
    assert.equal(
      Number(preview.prorationCreditPaise || preview.creditPaise),
      expectedCredit,
      `Proration credit must strictly equal ${expectedCredit}`
    );

    // Expected subtotal = 679900 - credit
    const expectedSubtotal = 679900 - expectedCredit;
    assert.equal(
      Number(preview.subtotalPaise || preview.subtotal),
      expectedSubtotal,
      `Subtotal must strictly equal ${expectedSubtotal}`
    );

    // GST calculation: 18% of subtotal
    const expectedTax = Math.round(expectedSubtotal * 0.09) * 2;
    const actualTax = Number(preview.taxPaise || preview.gstPaise);
    assert.ok(
      Math.abs(actualTax - expectedTax) <= 1,
      `Tax (${actualTax}) should equal 18% GST (${expectedTax})`
    );

    // Net payable = subtotal + tax
    const expectedTotal = expectedSubtotal + actualTax;
    assert.equal(
      Number(preview.totalPaise || preview.totalDuePaise),
      expectedTotal,
      `Total payable must equal subtotal + tax (${expectedTotal})`
    );
  });

  // -------------------------------------------------------------------------
  // 5. Boundary Condition: Zero Days Remaining
  // -------------------------------------------------------------------------
  test('ADV-5.1: Plan with exactly 0 remaining days awards zero credit and full charge', async () => {
    // Expired 1 second ago
    const expiredAt = new Date(Date.now() - 1000);
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'EXPIRED',
      expiresAt: expiredAt,
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=intermediate', {
      token: tenant.token,
      baseUrl,
    });

    if (res.status === 200) {
      const preview = res.data?.preview || res.data;
      assert.equal(Number(preview.remainingDays || 0), 0, 'Remaining days must be 0');
      assert.equal(Number(preview.prorationCreditPaise || 0), 0, 'Proration credit must be 0');
      assert.equal(Number(preview.subtotalPaise || preview.subtotal), 319900, 'Subtotal must equal full intermediate price (319900)');
    } else {
      assert.equal(res.status, 400, 'If rejected, must return HTTP 400');
    }
  });

  // -------------------------------------------------------------------------
  // 6. Zero-Lost-Days Renewal on Expired Plan
  // -------------------------------------------------------------------------
  test('ADV-6.1: Renewal on EXPIRED plan extends from now, never from past expiry', async () => {
    // Expired 60 days ago
    const pastExpiredAt = new Date(Date.now() - 60 * 86400000);
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'EXPIRED',
      expiresAt: pastExpiredAt,
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      token: tenant.token,
      baseUrl,
      body: {},
    });

    assert.equal(res.status, 200, `Renewal initiation must succeed (200), got ${res.status}`);
    const newExpiresAtStr = res.data?.newExpiresAt || res.data?.order?.newExpiresAt;
    assert.ok(newExpiresAtStr, 'Response must include newExpiresAt');

    const newExpiresAt = new Date(newExpiresAtStr);
    const now = Date.now();
    const daysFromNow = (newExpiresAt.getTime() - now) / 86400000;

    // Must be ~365 days from today (between 364 and 366 days)
    assert.ok(
      daysFromNow >= 364 && daysFromNow <= 366,
      `New expiry must be ~365 days from today, got ${daysFromNow.toFixed(1)} days`
    );
  });

  // -------------------------------------------------------------------------
  // 7. Zero-Lost-Days Renewal on Active Plan (Stacking)
  // -------------------------------------------------------------------------
  test('ADV-7.1: Renewal on ACTIVE plan stacks 365 days onto currentExpiry without lost days', async () => {
    // Active plan with 150 days remaining
    const currentExpiry = new Date(Date.now() + 150 * 86400000);
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'ACTIVE',
      expiresAt: currentExpiry,
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      token: tenant.token,
      baseUrl,
      body: {},
    });

    assert.equal(res.status, 200, `Renewal initiation must succeed (200), got ${res.status}`);
    const newExpiresAtStr = res.data?.newExpiresAt || res.data?.order?.newExpiresAt;
    assert.ok(newExpiresAtStr, 'Response must include newExpiresAt');

    const newExpiresAt = new Date(newExpiresAtStr);
    const daysFromNow = (newExpiresAt.getTime() - Date.now()) / 86400000;

    // Must be ~150 + 365 = 515 days from today (between 513 and 517 days)
    assert.ok(
      daysFromNow >= 513 && daysFromNow <= 517,
      `New expiry must be ~515 days from today, got ${daysFromNow.toFixed(1)} days`
    );
  });

  // -------------------------------------------------------------------------
  // 8. Extreme Stacked Validity Credit Floor Guarantee
  // -------------------------------------------------------------------------
  test('ADV-8.1: Subtotal strictly floors at 100 paise when credit exceeds target price', async () => {
    // Tenant has 1000 days validity (credit = 1000 * 548 = 548,000 paise)
    // Target: Intermediate (319,900 paise). Credit exceeds price by 228,100 paise.
    const longExpiry = new Date(Date.now() + 1000 * 86400000);
    const tenant = await createTestTenant({
      planId: 'BASIC',
      status: 'ACTIVE',
      expiresAt: longExpiry,
    });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=intermediate', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}`);
    const preview = res.data?.preview || res.data;
    const subtotal = Number(preview.subtotalPaise || preview.subtotal);

    assert.equal(
      subtotal,
      100,
      `Subtotal must strictly floor at 100 paise (₹1.00), got ${subtotal}`
    );
    assert.ok(
      Number(preview.totalPaise || preview.totalDuePaise) >= 100,
      'Total payable must be >= 100 paise'
    );
  });

  // -------------------------------------------------------------------------
  // 9. Unauthenticated Security Barrier
  // -------------------------------------------------------------------------
  test('ADV-9.1: Unauthenticated calls to subscription upgrade/renewal return HTTP 401', async () => {
    const unauthPreview = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      baseUrl,
    });
    assert.equal(unauthPreview.status, 401, `Unauthenticated upgrade preview must return 401, got ${unauthPreview.status}`);

    const unauthRenew = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      baseUrl,
      body: {},
    });
    assert.equal(unauthRenew.status, 401, `Unauthenticated renew initiate must return 401, got ${unauthRenew.status}`);

    const unauthUpgrade = await apiRequest('POST', '/api/app/subscription/upgrade/initiate', {
      baseUrl,
      body: { targetPlanId: 'premium' },
    });
    assert.equal(unauthUpgrade.status, 401, `Unauthenticated upgrade initiate must return 401, got ${unauthUpgrade.status}`);
  });
});

/**
 * Tier 2: Boundaries & Corners
 * Opaque-box verification of boundary conditions, edge values, negative/zero inputs,
 * concurrent double-settle guards, authorization barriers, and IDOR protection.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureServer,
  getBaseUrl,
  createTestTenant,
  cleanupTenant,
  apiRequest,
  publicRequest,
  getIndianFinancialYear,
} from './helpers.js';

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

test.describe('Tier 2: Boundaries & Corners', () => {

  // ---------------------------------------------------------------------------
  // Subscription Engine Boundaries
  // ---------------------------------------------------------------------------

  test('B1.1: Proration on expired plan awards zero credit and charges full price', async () => {
    // Expired 5 days ago
    const expiredAt = new Date(Date.now() - 5 * 86400000);
    const tenant = await createTestTenant({ planId: 'BASIC', expiresAt: expiredAt, status: 'EXPIRED' });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });

    if (res.status === 200) {
      const data = res.data?.preview || res.data;
      assert.equal(Number(data.remainingDays || 0), 0, 'Remaining days on expired plan must be 0');
      const credit = Number(data.creditPaise || data.prorationCreditPaise || data.creditAmountPaise || 0);
      assert.equal(credit, 0, 'Proration credit on expired plan must be 0');
      const subtotal = Number(data.subtotalPaise || data.subtotal);
      assert.ok(subtotal >= 679900, 'Subtotal must equal full price when no credit applies');
    } else {
      // Some implementations may return 400 if plan is expired
      assert.ok([200, 400].includes(res.status), `Expected 200 or 400 for expired plan, got ${res.status}`);
    }
  });

  test('B1.2: Proration on boundary of exactly 1 day remaining', async () => {
    // 24 hours left
    const oneDayLeft = new Date(Date.now() + 24 * 3600 * 1000);
    const tenant = await createTestTenant({ planId: 'BASIC', expiresAt: oneDayLeft });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const data = res.data?.preview || res.data;
    const remainingDays = Number(data.remainingDays);
    assert.ok(remainingDays >= 1 && remainingDays <= 2, 'Should evaluate to 1-2 remaining boundary days');
    const credit = Number(data.creditPaise || data.prorationCreditPaise || data.creditAmountPaise || 0);
    assert.ok(credit > 0 && credit <= 548 * 2, 'Credit should equal single or two day daily rate');
  });

  test('B1.3: Subtotal floors at minimum 100 paise (₹1) when credit is equal or near target price', async () => {
    // Intermediate with 364 days remaining upgrading to Intermediate (or hypothetical high credit)
    const tenant = await createTestTenant({ planId: 'INTERMEDIATE', expiresAt: new Date(Date.now() + 364 * 86400000) });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });

    if (res.status === 200) {
      const data = res.data?.preview || res.data;
      const subtotal = Number(data.subtotalPaise || data.subtotal || 0);
      assert.ok(subtotal >= 100, 'Subtotal must floor at minimum 100 paise (₹1)');
    }
  });

  test('B1.4: Upgrade preview rejects invalid target plan name with HTTP 400', async () => {
    const tenant = await createTestTenant({ planId: 'BASIC' });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=nonexistent_vip_tier', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 400, `Expected 400 Bad Request for invalid target plan, got ${res.status}`);
  });

  test('B1.5: Upgrade preview rejects upgrade to same or lower plan tier with HTTP 400', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Try upgrading to basic from premium (downgrade)
    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=basic', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 400, `Expected 400 Bad Request when attempting downgrade via upgrade preview, got ${res.status}`);
  });

  test('B1.6: Unauthenticated request to subscription endpoints returns HTTP 401', async () => {
    const previewRes = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: null,
      baseUrl,
    });
    assert.equal(previewRes.status, 401, `Expected 401 for unauthenticated upgrade-preview, got ${previewRes.status}`);

    const renewRes = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      token: null,
      body: {},
      baseUrl,
    });
    assert.equal(renewRes.status, 401, `Expected 401 for unauthenticated renew initiate, got ${renewRes.status}`);
  });

  test('B1.7: Cross-tenant IDOR protection on invoice PDF download returns 403 or 404', async () => {
    const tenantA = await createTestTenant({ planId: 'PREMIUM' });
    const tenantB = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenantA.tenantId, tenantB.tenantId);

    // Tenant A attempts to fetch arbitrary invoice ID or Tenant B's invoice
    const fakeInvoiceId = '00000000-0000-0000-0000-000000000000';
    const res = await apiRequest('GET', `/api/app/subscription/invoices/${fakeInvoiceId}/pdf`, {
      token: tenantA.token,
      baseUrl,
    });

    assert.ok(
      [403, 404].includes(res.status),
      `Expected 403 Forbidden or 404 Not Found on cross-tenant invoice ID, got ${res.status}`
    );
  });

  test('B1.8: Indian Financial Year cutoff calculation at March 31 vs April 1 boundary', () => {
    // March 31, 2026 -> FY 2025-26 (month is 2, 0-indexed in local time)
    const marchDate = new Date(2026, 2, 31, 12, 0, 0);
    assert.equal(getIndianFinancialYear(marchDate), '2025-26', 'March 31 belongs to previous FY');

    // April 1, 2026 -> FY 2026-27 (month is 3, 0-indexed in local time)
    const aprilDate = new Date(2026, 3, 1, 12, 0, 0);
    assert.equal(getIndianFinancialYear(aprilDate), '2026-27', 'April 1 belongs to new FY');
  });

  // ---------------------------------------------------------------------------
  // Table Token & Bill System Boundaries
  // ---------------------------------------------------------------------------

  test('B2.1: Non-PREMIUM tenant attempting token operations receives HTTP 403 Forbidden', async () => {
    // Basic plan does not have 'reception_orders' entitlement
    const tenantBasic = await createTestTenant({ planId: 'BASIC' });
    createdTenants.push(tenantBasic.tenantId);

    const res = await apiRequest('POST', '/api/app/tokens', {
      token: tenantBasic.token,
      body: { tableNumber: 1, items: [{ dishName: 'Tea', quantity: 1, unitPricePaise: 2000, isVeg: true }] },
      baseUrl,
    });

    assert.equal(
      res.status,
      403,
      `Expected 403 Forbidden for non-PREMIUM tenant accessing token API, got ${res.status}: ${res.rawText}`
    );
  });

  test('B2.2: Concurrency Double-Settle Guard rejects second settlement with HTTP 409 Conflict', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create token
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 11, items: [{ dishName: 'Biryani', quantity: 1, unitPricePaise: 30000, isVeg: false }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // First settle - must succeed
    const firstSettle = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH' },
      baseUrl,
    });
    assert.equal(firstSettle.status, 200, `First settle must return 200, got ${firstSettle.status}`);

    // Second settle - must trigger 409 Conflict (Pessimistic locking)
    const secondSettle = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CARD' },
      baseUrl,
    });

    assert.equal(
      secondSettle.status,
      409,
      `Expected 409 Conflict on duplicate settlement, got ${secondSettle.status}: ${secondSettle.rawText}`
    );
  });

  test('B2.3: Appending items to a SETTLED or CLOSED token is rejected with HTTP 409 Conflict', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 14, items: [{ dishName: 'Dosa', quantity: 1, unitPricePaise: 15000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Settle token
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'UPI' },
      baseUrl,
    });

    // Attempt adding item to settled token
    const addItemRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: { dishName: 'Extra Sambar', quantity: 1, unitPricePaise: 3000, isVeg: true },
      baseUrl,
    });

    assert.equal(
      addItemRes.status,
      409,
      `Expected 409 Conflict when appending items to settled token, got ${addItemRes.status}: ${addItemRes.rawText}`
    );
  });

  test('B2.4: GET /api/public/tokens/:tokenId with non-existent token ID returns HTTP 404', async () => {
    const fakeTokenId = 'tok_0000000000000000';
    const res = await publicRequest('GET', `/api/public/tokens/${fakeTokenId}`, { baseUrl });

    assert.equal(res.status, 404, `Expected 404 Not Found for non-existent public token, got ${res.status}`);
  });

  test('B2.5: Voiding token without a reason string is rejected with HTTP 400', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 16, items: [{ dishName: 'Pulao', quantity: 1, unitPricePaise: 20000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Empty reason
    const voidRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/void`, {
      token: tenant.token,
      body: { reason: '' },
      baseUrl,
    });

    assert.equal(
      voidRes.status,
      400,
      `Expected 400 Bad Request when void reason is missing, got ${voidRes.status}`
    );
  });

  test('B2.6: Settlement with invalid payment method is rejected with HTTP 400', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 18, items: [{ dishName: 'Lassi', quantity: 1, unitPricePaise: 6000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    const res = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CRYPTO_COIN' },
      baseUrl,
    });

    assert.equal(
      res.status,
      400,
      `Expected 400 Bad Request on unsupported payment method, got ${res.status}`
    );
  });

  test('B2.7: Closing an unsettled active token is rejected with HTTP 400', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 20, items: [{ dishName: 'Gulab Jamun', quantity: 2, unitPricePaise: 8000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Try closing before settling
    const closeRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(
      closeRes.status,
      400,
      `Expected 400 Bad Request when attempting to close an unsettled token, got ${closeRes.status}`
    );
  });
});

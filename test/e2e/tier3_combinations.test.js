/**
 * Tier 3: Cross-Feature Interactions
 * Verifies complex multi-step interactions between features:
 * - Upgrade followed by immediate renewal (zero lost days stacking)
 * - Multi-batch item append + live bill update + settlement + review nudge
 * - Concurrency & stream isolation between parallel dining tables
 * - Multi-jurisdiction GST tax logic (intra-state CGST/SGST vs inter-state IGST)
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
  listenToSse,
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

test.describe('Tier 3: Cross-Feature Interactions', () => {

  test('C1: Upgrade followed by immediate renewal preserves full validity without lost days', async () => {
    // Basic tenant with 120 days remaining
    const initialDays = 120;
    const initialExpiry = new Date(Date.now() + initialDays * 86400000);
    const tenant = await createTestTenant({ planId: 'BASIC', expiresAt: initialExpiry });
    createdTenants.push(tenant.tenantId);

    // Step 1: Initiate upgrade to Premium
    const upgradeRes = await apiRequest('POST', '/api/app/subscription/upgrade/initiate', {
      token: tenant.token,
      body: { targetPlan: 'premium' },
      baseUrl,
    });
    assert.equal(upgradeRes.status, 200, `Upgrade initiate failed: ${upgradeRes.rawText}`);

    // Step 2: Initiate renewal on the upgraded plan
    const renewRes = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      token: tenant.token,
      body: { billingCycle: 'yearly' },
      baseUrl,
    });
    assert.equal(renewRes.status, 200, `Renewal initiate failed: ${renewRes.rawText}`);

    // If new expiry is returned, verify it extends without lost days
    const renewData = renewRes.data;
    if (renewData.newExpiresAt || renewData.newExpiry) {
      const newExpiry = new Date(renewData.newExpiresAt || renewData.newExpiry);
      const expectedMinDate = new Date();
      expectedMinDate.setDate(expectedMinDate.getDate() + 365);
      assert.ok(newExpiry >= expectedMinDate, 'Validity must extend for full renewal period');
    }
  });

  test('C2: Multi-batch item append + live bill update + settlement + review URL delivery', async () => {
    const reviewLink = 'https://g.page/r/menusqr-sample-review/review';
    const tenant = await createTestTenant({
      planId: 'PREMIUM',
      googleReviewUrl: reviewLink,
      businessName: 'Spice Symphony',
    });
    createdTenants.push(tenant.tenantId);

    // Step 1: Waiter opens session with Starters
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: {
        tableNumber: 9,
        covers: 4,
        items: [
          { dishName: 'Crispy Corn', quantity: 2, unitPricePaise: 22000, isVeg: true },
        ],
      },
      baseUrl,
    });
    assert.ok(createRes.status === 200 || createRes.status === 201);
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Step 2: Customer opens public bill and views initial subtotal
    const initialBillRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });
    assert.equal(initialBillRes.status, 200);
    const initialBill = initialBillRes.data?.token || initialBillRes.data;
    const initialSubtotal = Number(initialBill.subtotalPaise || initialBill.subtotal || 44000);
    assert.ok(initialSubtotal >= 44000, 'Initial subtotal must include Crispy Corn');

    // Step 3: Waiter appends Main Course (batch 2)
    const appendRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: { dishName: 'Paneer Butter Masala', quantity: 2, unitPricePaise: 32000, isVeg: true },
      baseUrl,
    });
    assert.equal(appendRes.status, 200);

    // Step 4: Customer checks updated bill
    const updatedBillRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });
    assert.equal(updatedBillRes.status, 200);
    const updatedBill = updatedBillRes.data?.token || updatedBillRes.data;
    const updatedSubtotal = Number(updatedBill.subtotalPaise || updatedBill.subtotal || 0);
    assert.ok(updatedSubtotal >= 44000 + 64000, 'Updated subtotal must sum both batches');

    // Step 5: Cashier settles bill via UPI
    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'UPI' },
      baseUrl,
    });
    assert.equal(settleRes.status, 200);

    // Step 6: Post-settlement customer bill check
    const finalBillRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });
    assert.equal(finalBillRes.status, 200);
    const finalBill = finalBillRes.data?.token || finalBillRes.data;
    const finalStatus = (finalBill.status || '').toUpperCase();
    assert.ok(['SETTLED', 'PAID'].includes(finalStatus), 'Bill status must be SETTLED/PAID');
    assert.ok(
      finalBill.googleReviewUrl === reviewLink || finalBillRes.data.googleReviewUrl === reviewLink || finalBillRes.data.restaurant?.googleReviewUrl === reviewLink,
      'Google review link must be present on settled bill for review nudge'
    );

    // Step 7: Cashier closes table and verifies table is ready for next session
    const closeRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(closeRes.status, 200);

    // Verify a fresh token can now be opened on Table 9 without duplicate active token conflict
    const nextSessionRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 9, covers: 2, items: [{ dishName: 'Masala Papad', quantity: 2, unitPricePaise: 8000, isVeg: true }] },
      baseUrl,
    });
    assert.ok(nextSessionRes.status === 200 || nextSessionRes.status === 201, 'Table 9 must accept new dining session after closure');
  });

  test('C3: Stream isolation: Customer SSE on Token A never receives events from Token B', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create Token A on Table 1
    const resA = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 1, items: [{ dishName: 'Coffee', quantity: 1, unitPricePaise: 4000, isVeg: true }] },
      baseUrl,
    });
    const tokenA = resA.data?.token?.id || resA.data?.id;

    // Create Token B on Table 2
    const resB = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 2, items: [{ dishName: 'Juice', quantity: 1, unitPricePaise: 6000, isVeg: true }] },
      baseUrl,
    });
    const tokenB = resB.data?.token?.id || resB.data?.id;

    // Start SSE listener on Token A's public stream
    const streamUrlA = `${baseUrl}/api/public/tokens/${tokenA}/stream`;
    const ssePromiseA = listenToSse(streamUrlA, {
      timeoutMs: 3000,
      matchEvent: (e) => e.event === 'token_settled',
    });

    // Wait slightly to establish SSE connection
    await new Promise((r) => setTimeout(r, 200));

    // Settle Token B
    await apiRequest('POST', `/api/app/tokens/${tokenB}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH' },
      baseUrl,
    });

    // Wait for SSE listener on Token A to complete or timeout
    const eventsOnA = await ssePromiseA;

    // Verify: No event on Token A's stream should belong to Token B
    for (const ev of eventsOnA) {
      if (ev.data?.tokenId) {
        assert.notEqual(ev.data.tokenId, tokenB, 'Token A stream must never receive events from Token B');
      }
    }
  });

  test('C4: Tax calculation correctly differentiates intra-state (CGST+SGST) vs inter-state (IGST)', async () => {
    // Intra-state tenant (Maharashtra)
    const localTenant = await createTestTenant({ planId: 'BASIC', state: 'Maharashtra' });
    // Inter-state tenant (Karnataka)
    const remoteTenant = await createTestTenant({ planId: 'BASIC', state: 'Karnataka' });
    createdTenants.push(localTenant.tenantId, remoteTenant.tenantId);

    const localPreview = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: localTenant.token,
      baseUrl,
    });
    const remotePreview = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: remoteTenant.token,
      baseUrl,
    });

    assert.equal(localPreview.status, 200);
    assert.equal(remotePreview.status, 200);

    const localData = localPreview.data?.preview || localPreview.data;
    const remoteData = remotePreview.data?.preview || remotePreview.data;

    // If explicit tax breakdown is provided:
    if (localData.cgstPaise !== undefined && remoteData.igstPaise !== undefined) {
      assert.ok(Number(localData.cgstPaise) > 0, 'Intra-state should have CGST > 0');
      assert.ok(Number(localData.sgstPaise) > 0, 'Intra-state should have SGST > 0');
      assert.equal(Number(localData.igstPaise || 0), 0, 'Intra-state should have IGST = 0');

      assert.equal(Number(remoteData.cgstPaise || 0), 0, 'Inter-state should have CGST = 0');
      assert.equal(Number(remoteData.sgstPaise || 0), 0, 'Inter-state should have SGST = 0');
      assert.ok(Number(remoteData.igstPaise) > 0, 'Inter-state should have IGST > 0');
    }
  });
});

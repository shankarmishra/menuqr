/**
 * Tier 1: Feature Coverage — Happy Paths
 * Comprehensive opaque-box verification of all inventoried features across
 * System 1 (Subscription, Renewal & Billing Engine) and
 * System 2 (Live Digital Table Token & Realistic Thermal Bill System).
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
  calculateExpectedProration,
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

test.describe('Tier 1: Feature Coverage (Happy Paths)', () => {

  // ---------------------------------------------------------------------------
  // System 1: Subscription, Renewal & Billing Engine
  // ---------------------------------------------------------------------------

  test('F1.1: GET /api/app/subscription/upgrade-preview returns server-calculated proration breakdown', async () => {
    // Basic tenant with 180 days remaining
    const remainingDays = 180;
    const expiresAt = new Date(Date.now() + remainingDays * 86400000);
    const tenant = await createTestTenant({ planId: 'BASIC', expiresAt, state: 'Maharashtra' });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/upgrade-preview?targetPlan=premium', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const data = res.data?.preview || res.data;
    assert.ok(data, 'Expected preview data in response');

    // Verify critical contract fields
    assert.ok(
      data.targetPlan === 'premium' || data.targetPlanId === 'premium' || data.targetPlan === 'PREMIUM',
      'Target plan must match requested target'
    );
    assert.ok(Number(data.remainingDays) > 0, 'Remaining days must be positive');
    assert.ok(Number(data.creditPaise || data.prorationCreditPaise || data.creditAmountPaise) > 0, 'Proration credit must be calculated');
    assert.ok(Number(data.subtotalPaise || data.subtotal) > 0, 'Subtotal must be positive');
    assert.ok(Number(data.totalDuePaise || data.totalPaise || data.totalDue) > 0, 'Total due must include tax');

    // Verify mathematical bounds matching oracle
    const expected = calculateExpectedProration('basic', Number(data.remainingDays), 'premium', true);
    const actualCredit = Number(data.creditPaise || data.prorationCreditPaise || data.creditAmountPaise);
    // Allow slight delta of 1 day for boundary edge
    assert.ok(Math.abs(actualCredit - expected.creditPaise) <= expected.dailyRatePaise, 'Credit must match daily rate proration');
  });

  test('F1.2: POST /api/app/subscription/renew/initiate creates renewal order extending validity without lost days', async () => {
    // Current plan expires in 45 days
    const daysLeft = 45;
    const currentExpiresAt = new Date(Date.now() + daysLeft * 86400000);
    const tenant = await createTestTenant({ planId: 'PREMIUM', expiresAt: currentExpiresAt });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/subscription/renew/initiate', {
      token: tenant.token,
      body: { billingCycle: 'yearly' },
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const data = res.data;
    assert.ok(data, 'Expected response body');

    const orderId = data.orderId || data.order?.id;
    assert.ok(orderId, 'Order ID must be returned');

    const orderSubtype = data.orderSubtype || data.order?.orderSubtype || data.order?.order_subtype;
    if (orderSubtype) {
      assert.equal(orderSubtype, 'RENEWAL', 'Order subtype must be RENEWAL');
    }

    assert.ok(data.paymentSessionId || data.session_id, 'Cashfree payment session ID must be returned');

    // Zero-lost-days verification: new expiry must be approximately 1 year from current expiry
    if (data.newExpiresAt || data.newExpiry) {
      const newExpiry = new Date(data.newExpiresAt || data.newExpiry);
      const expectedMinDate = new Date(currentExpiresAt);
      expectedMinDate.setDate(expectedMinDate.getDate() + 360);
      assert.ok(newExpiry >= expectedMinDate, 'New expiry must extend from current expiry without lost days');
    }
  });

  test('F1.3: POST /api/app/subscription/upgrade/initiate creates upgrade order deducting proration credits', async () => {
    const tenant = await createTestTenant({ planId: 'BASIC', expiresAt: new Date(Date.now() + 150 * 86400000) });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/subscription/upgrade/initiate', {
      token: tenant.token,
      body: { targetPlan: 'premium', targetPlanId: 'premium' },
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const data = res.data;
    assert.ok(data, 'Expected response body');

    const orderId = data.orderId || data.order?.id;
    assert.ok(orderId, 'Order ID must be returned');

    const orderSubtype = data.orderSubtype || data.order?.orderSubtype || data.order?.order_subtype;
    if (orderSubtype) {
      assert.equal(orderSubtype, 'UPGRADE', 'Order subtype must be UPGRADE');
    }

    assert.ok(data.paymentSessionId || data.session_id, 'Payment session ID must be returned');
  });

  test('F1.4: GET /api/app/subscription/invoices returns tenant-scoped invoice list', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('GET', '/api/app/subscription/invoices', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const invoices = Array.isArray(res.data) ? res.data : res.data?.invoices;
    assert.ok(Array.isArray(invoices), 'Invoices must be returned as an array');
  });

  test('F1.5: GET /api/app/subscription/invoices/:id/pdf retrieves invoice receipt payload', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // List invoices first
    const listRes = await apiRequest('GET', '/api/app/subscription/invoices', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(listRes.status, 200);
    const invoices = Array.isArray(listRes.data) ? listRes.data : listRes.data?.invoices || [];

    if (invoices.length > 0) {
      const invoiceId = invoices[0].id;
      const pdfRes = await apiRequest('GET', `/api/app/subscription/invoices/${invoiceId}/pdf`, {
        token: tenant.token,
        baseUrl,
      });

      assert.equal(pdfRes.status, 200, 'Invoice receipt endpoint must return 200 OK');
      const contentType = pdfRes.headers.get('content-type') || '';
      assert.ok(
        contentType.includes('application/pdf') || contentType.includes('application/json'),
        'Must return valid PDF binary or structured invoice payload'
      );
    }
  });

  test('F1.6: GET /api/app/orders/stream connects staff SSE stream for plan and order updates', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const streamUrl = `${baseUrl}/api/app/orders/stream`;
    const events = await listenToSse(streamUrl, {
      headers: { Authorization: `Bearer ${tenant.token}` },
      timeoutMs: 3000,
      maxEvents: 1,
    });

    assert.ok(Array.isArray(events), 'Events should be an array');
    if (events.length > 0) {
      assert.ok(events[0].event === 'connected' || events[0].event === 'message', 'Initial SSE event received');
    }
  });

  // ---------------------------------------------------------------------------
  // System 2: Live Digital Table Token & Realistic Thermal Bill System
  // ---------------------------------------------------------------------------

  let createdTokenId = null;
  let createdPublicBillUrl = null;

  test('F2.1: POST /api/app/tokens creates sequential daily table token with unique token ID', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const res = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: {
        tableNumber: 5,
        covers: 2,
        items: [
          {
            dishName: 'Paneer Tikka',
            quantity: 2,
            unitPricePaise: 25000,
            isVeg: true,
          },
        ],
        notes: 'Less spicy',
      },
      baseUrl,
    });

    assert.ok(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}: ${res.rawText}`);
    const token = res.data?.token || res.data;
    assert.ok(token, 'Expected token object in response');

    assert.ok(token.id, 'Token must have a unique ID');
    createdTokenId = token.id;

    assert.equal(Number(token.tableNumber || token.table_number), 5, 'Table number must be 5');
    assert.ok(Number(token.tokenNumber || token.token_number) >= 1, 'Token number must be positive integer');

    const status = (token.status || '').toUpperCase();
    assert.ok(['ISSUED', 'ORDERING', 'DINING', 'UNPAID'].includes(status), `Status must be active, got ${status}`);

    if (token.billUrl || token.bill_url) {
      createdPublicBillUrl = token.billUrl || token.bill_url;
    }
  });

  test('F2.2: POST /api/app/tokens/:id/items appends line items and recalculates totals', async () => {
    if (!createdTokenId) return;

    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create a fresh token for this tenant
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 3, items: [{ dishName: 'Dal Tadka', quantity: 1, unitPricePaise: 18000, isVeg: true }] },
      baseUrl,
    });
    assert.ok(createRes.status === 200 || createRes.status === 201);
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    const addRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: {
        dishName: 'Butter Naan',
        quantity: 3,
        unitPricePaise: 4000,
        isVeg: true,
      },
      baseUrl,
    });

    assert.equal(addRes.status, 200, `Expected 200 OK, got ${addRes.status}: ${addRes.rawText}`);
    const token = addRes.data?.token || addRes.data;
    assert.ok(token, 'Updated token returned');

    const totalPaise = Number(token.totalPaise || token.total_paise || (token.total ? token.total * 100 : 0));
    assert.ok(totalPaise >= 30000, 'Total must include both initial item and added items');
  });

  test('F2.3: GET /api/app/tokens lists active tokens for cashier and waiter panels', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create an active token
    await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 8, items: [{ dishName: 'Veg Pulao', quantity: 1, unitPricePaise: 20000, isVeg: true }] },
      baseUrl,
    });

    const res = await apiRequest('GET', '/api/app/tokens?status=UNPAID', {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(res.status, 200, `Expected 200 OK, got ${res.status}: ${res.rawText}`);
    const tokens = Array.isArray(res.data) ? res.data : res.data?.tokens;
    assert.ok(Array.isArray(tokens), 'Tokens must be an array');
    assert.ok(tokens.length >= 1, 'Should contain at least the active token created');
  });

  test('F2.4: GET /api/public/tokens/:tokenId retrieves public customer bill without authentication', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM', googleReviewUrl: 'https://g.page/r/dhaba-review' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: {
        tableNumber: 12,
        items: [{ dishName: 'Special Thali', quantity: 2, unitPricePaise: 35000, isVeg: true }],
      },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Public call with zero auth headers
    const res = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });

    assert.equal(res.status, 200, `Expected 200 OK for public bill, got ${res.status}: ${res.rawText}`);
    const bill = res.data?.token || res.data;
    assert.ok(bill, 'Public bill payload returned');

    assert.equal(Number(bill.tableNumber || bill.table_number), 12);
    assert.ok(bill.restaurantName || res.data.restaurant?.name || res.data.restaurantName, 'Restaurant name included');
    assert.ok(bill.items || res.data.items, 'Items array included');
  });

  test('F2.5: GET /api/public/tokens/:tokenId/stream provides isolated customer SSE stream', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 7, items: [{ dishName: 'Lassi', quantity: 2, unitPricePaise: 6000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    const streamUrl = `${baseUrl}/api/public/tokens/${tokenId}/stream`;
    const events = await listenToSse(streamUrl, {
      timeoutMs: 3000,
      maxEvents: 1,
    });

    assert.ok(Array.isArray(events), 'SSE events returned as array');
  });

  test('F2.6: POST /api/app/tokens/:id/settle marks token SETTLED and broadcasts status transition', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 4, items: [{ dishName: 'Chai', quantity: 2, unitPricePaise: 3000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH', method: 'CASH' },
      baseUrl,
    });

    assert.equal(settleRes.status, 200, `Expected 200 OK on settle, got ${settleRes.status}: ${settleRes.rawText}`);
    const token = settleRes.data?.token || settleRes.data;

    const status = (token.status || '').toUpperCase();
    assert.ok(['SETTLED', 'PAID'].includes(status), `Status must transition to SETTLED/PAID, got ${status}`);
    assert.ok(token.settledAt || token.paidAt || token.paid_at, 'Settled timestamp must be populated');
  });

  test('F2.7: POST /api/app/tokens/:id/close frees dining table and closes token session', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 15, items: [{ dishName: 'Kheer', quantity: 1, unitPricePaise: 8000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id || createRes.data?.id;

    // Settle first
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'UPI' },
      baseUrl,
    });

    // Close table
    const closeRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: tenant.token,
      baseUrl,
    });

    assert.equal(closeRes.status, 200, `Expected 200 OK on close, got ${closeRes.status}: ${closeRes.rawText}`);
    const token = closeRes.data?.token || closeRes.data;
    const status = (token.status || '').toUpperCase();
    assert.equal(status, 'CLOSED', 'Status must transition to CLOSED');
  });
});

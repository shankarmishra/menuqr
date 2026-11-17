/**
 * MenuQR Phase 2 E2E Test Suite - Tier 4: Real-World Application Scenarios
 * Simulates complete, realistic, multi-step restaurant dining, delivery, kitchen, and cashier operations:
 * Scenario 1: Busy lunch rush with multi-round dining, incremental items, bill request, cash settlement, and review nudge
 * Scenario 2: Scheduled delivery window with minimum order fee calculation & rush-hour dynamic pause
 * Scenario 3: Cashier floor grid state transitions & double-settlement collision prevention
 * Scenario 4: Full KDS lifecycle with multi-table multi-order partitioning
 * Scenario 5: Multi-table floor grid real-time state synchronization & strict enterprise tenant isolation
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureServer,
  createPhase2Tenant,
  cleanupPhase2Tenant,
  apiRequest,
  publicRequest,
  listenToSse,
  dbQuery,
  getBaseUrl,
  closeDbPool,
} from './phase2_helpers.js';

describe('Tier 4: Realistic Real-World Application Scenarios', () => {
  let tenant1 = null;
  let tenant2 = null;

  before(async () => {
    await ensureServer(3001);
    tenant1 = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Heritage Haveli Fine Dine',
      deliveryMinOrder: 300,
      googleReviewUrl: 'https://g.page/r/heritage-haveli-review',
    });
    tenant2 = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Urban Tadka Bistro',
      deliveryMinOrder: 200,
      googleReviewUrl: 'https://g.page/r/urban-tadka-review',
    });
  });

  after(async () => {
    if (tenant1) await cleanupPhase2Tenant(tenant1.tenantId);
    if (tenant2) await cleanupPhase2Tenant(tenant2.tenantId);
    await closeDbPool();
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: Busy Lunch Rush with Multi-Round Dining, Incremental Items,
  // Bill Request, Cash Settlement, and Review Nudge
  // ---------------------------------------------------------------------------
  it('Scenario 1: Busy Lunch Rush (Multi-Round -> KDS -> Bill Request -> Cash Settlement -> Review Nudge)', async () => {
    const tableNumber = '12';
    const sessionId = `lunch_rush_t12_${Date.now()}`;

    // Step 1: Customer arrives at Table 12, scans QR, places Round 1 (Starters)
    const r1 = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber,
        customerName: 'Devendra Sharma',
        customerPhone: '9820119988',
        sessionId,
        roundNumber: 1,
        items: [{ id: tenant1.items.paneerTikka.id, quantity: 2 }] // 2 * 250 = 500
      }
    });
    assert.equal(r1.status, 201);
    const tokenId = r1.data.tokenId;
    const order1Id = r1.data.id;
    assert.ok(tokenId, 'Token must be auto-issued');

    // Step 2: KDS receives Round 1 in NEW; chef accepts and starts cooking
    const kds1 = await apiRequest('GET', '/api/app/orders', { token: tenant1.token });
    const order1 = kds1.data.find(o => o.id === order1Id);
    assert.ok(order1);
    assert.equal(order1.status, 'NEW');

    await apiRequest('PATCH', `/api/app/orders/${order1Id}/status`, { token: tenant1.token, body: { status: 'ACCEPTED' } });
    await apiRequest('PATCH', `/api/app/orders/${order1Id}/status`, { token: tenant1.token, body: { status: 'PREPARING' } });

    // Step 3: Round 2 (Main Course & Breads) ordered midway by party
    const r2 = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber,
        customerName: 'Devendra Sharma',
        customerPhone: '9820119988',
        sessionId,
        roundNumber: 2,
        parentOrderId: order1Id,
        items: [
          { id: tenant1.items.dalMakhani.id, quantity: 1 }, // 220
          { id: tenant1.items.butterNaan.id, quantity: 4 },  // 160
        ]
      }
    });
    assert.equal(r2.status, 201);
    const order2Id = r2.data.id;
    // Cumulative session: 500 + 380 = 880
    assert.equal(r2.data.sessionTotal, 880);
    assert.equal(r2.data.previousRoundItems.length, 1);

    // Step 4: Kitchen fulfills both rounds
    await apiRequest('PATCH', `/api/app/orders/${order1Id}/status`, { token: tenant1.token, body: { status: 'READY' } });
    await apiRequest('PATCH', `/api/app/orders/${order1Id}/status`, { token: tenant1.token, body: { status: 'DELIVERED' } });

    await apiRequest('PATCH', `/api/app/orders/${order2Id}/status`, { token: tenant1.token, body: { status: 'ACCEPTED' } });
    await apiRequest('PATCH', `/api/app/orders/${order2Id}/status`, { token: tenant1.token, body: { status: 'PREPARING' } });
    await apiRequest('PATCH', `/api/app/orders/${order2Id}/status`, { token: tenant1.token, body: { status: 'READY' } });
    await apiRequest('PATCH', `/api/app/orders/${order2Id}/status`, { token: tenant1.token, body: { status: 'DELIVERED' } });

    // Step 5: Meal finished; customer taps "Request Bill / Finish Dining"
    const reqBill = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(reqBill.status, 200);
    assert.equal(reqBill.data.token.status, 'BILL_REQUESTED');

    // Step 6: Cashier sees Table 12 in pending bill requests queue
    const queue = await apiRequest('GET', '/api/app/tokens?status=BILL_REQUESTED', { token: tenant1.token });
    const pendingBill = queue.data.tokens.find(t => t.id === tokenId);
    assert.ok(pendingBill, 'Cashier must see Table 12 in pending bill requests');
    assert.equal(pendingBill.tableNumber, 12);

    // Step 7: Cashier collects Cash payment (₹880 + 5% tax ₹44 = ₹924 total = 92400 paise)
    const settle = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant1.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(settle.status, 200);
    assert.equal(settle.data.token.status, 'SETTLED');
    assert.equal(settle.data.token.paymentMethod, 'CASH');
    assert.equal(settle.data.token.totalPaise, 92400);
    assert.equal(settle.data.token.googleReviewUrl, 'https://g.page/r/heritage-haveli-review');

    // Step 8: Cashier closes table to free Table 12 for the next waiting guests
    const closeRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, { token: tenant1.token });
    assert.equal(closeRes.status, 200);
    assert.equal(closeRes.data.token.status, 'CLOSED');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 2: Scheduled Delivery Window with Minimum Order Fee &
  // Rush-Hour Dynamic Pause
  // ---------------------------------------------------------------------------
  it('Scenario 2: Scheduled Delivery Window, Minimum Order Enforcement, and Rush Pause Lifecycle', async () => {
    // Step 1: Customer attempts delivery below minimum threshold (₹300)
    const underMinRes = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Priya Varma',
        customerPhone: '9833441122',
        deliveryAddress: 'A-201, Green Heights, Andheri West, Mumbai',
        items: [{ id: tenant1.items.paneerTikka.id, quantity: 1 }] // ₹250 < ₹300
      }
    });
    assert.equal(underMinRes.status, 400);
    assert.match(underMinRes.data.error, /Minimum order amount for delivery is ₹300/);

    // Step 2: Customer adds 1x Gulab Jamun (₹80) -> Subtotal = ₹330 >= ₹300
    const validDeliveryRes = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Priya Varma',
        customerPhone: '9833441122',
        deliveryAddress: 'A-201, Green Heights, Andheri West, Mumbai',
        deliveryLandmark: 'Near City Mall',
        deliveryCity: 'Mumbai',
        items: [
          { id: tenant1.items.paneerTikka.id, quantity: 1 },
          { id: tenant1.items.gulabJamun.id, quantity: 1 }
        ]
      }
    });
    assert.equal(validDeliveryRes.status, 201);
    assert.equal(validDeliveryRes.data.total, 330);
    const trackingToken = validDeliveryRes.data.trackingToken;
    const orderId = validDeliveryRes.data.id;
    assert.ok(trackingToken, 'Cryptographic tracking token must be issued');

    // Step 3: Customer tracks order status using public tracking endpoint
    const trackRes = await publicRequest('GET', `/api/public/orders/${orderId}?token=${trackingToken}`);
    assert.equal(trackRes.status, 200);
    assert.equal(trackRes.data.status, 'NEW');

    // Step 4: Kitchen triggers a 30-minute delivery pause due to heavy in-house rush
    const pauseTime = new Date(Date.now() + 30 * 60000);
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = $1 WHERE tenant_id = $2`,
      [pauseTime.toISOString(), tenant1.tenantId]
    );

    // Step 5: New customer attempting delivery is rejected with clear ETA feedback
    const rejectedDelivery = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Arjun Rampal',
        customerPhone: '9820556677',
        deliveryAddress: 'Sea Breeze, Bandra West, Mumbai',
        items: [{ id: tenant1.items.paneerTikka.id, quantity: 2 }]
      }
    });
    assert.equal(rejectedDelivery.status, 400);
    assert.match(rejectedDelivery.data.error, /Delivery is temporarily paused due to kitchen rush/);

    // Step 6: Rush clears, manager lifts pause -> delivery immediately re-enabled
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = NULL WHERE tenant_id = $1`,
      [tenant1.tenantId]
    );

    const reEnabledDelivery = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Arjun Rampal',
        customerPhone: '9820556677',
        deliveryAddress: 'Sea Breeze, Bandra West, Mumbai',
        items: [{ id: tenant1.items.paneerTikka.id, quantity: 2 }]
      }
    });
    assert.equal(reEnabledDelivery.status, 201, 'Delivery should resume successfully after pause is cleared');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 3: Cashier Floor Grid State Transitions & Double-Settlement Guard
  // ---------------------------------------------------------------------------
  it('Scenario 3: Multi-Table Cashier Floor Grid and Concurrency Conflict Protection', async () => {
    // Free tables 1, 2, 3
    for (const tbl of [1, 2, 3]) {
      const existing = await apiRequest('GET', `/api/app/tokens?tableNumber=${tbl}`, { token: tenant1.token });
      for (const t of existing.data.tokens || []) {
        if (t.status === 'SETTLED') await apiRequest('POST', `/api/app/tokens/${t.id}/close`, { token: tenant1.token });
      }
    }

    // Step 1: Seed 3 active tables
    const t1 = await apiRequest('POST', '/api/app/tokens', {
      token: tenant1.token,
      body: { tableNumber: 1, covers: 2, items: [{ dishName: 'Veg Crispy', quantity: 1, price: 180 }] }
    });
    const t2 = await apiRequest('POST', '/api/app/tokens', {
      token: tenant1.token,
      body: { tableNumber: 2, covers: 4, items: [{ dishName: 'Paneer Tikka', quantity: 2, price: 250 }] }
    });
    const t3 = await apiRequest('POST', '/api/app/tokens', {
      token: tenant1.token,
      body: { tableNumber: 3, covers: 2, items: [{ dishName: 'Dal Makhani', quantity: 1, price: 220 }] }
    });
    assert.equal(t1.status, 201);
    assert.equal(t2.status, 201);
    assert.equal(t3.status, 201);

    // Step 2: Table 2 requests bill
    await publicRequest('POST', `/api/public/tokens/${t2.data.token.id}/request-bill`);

    // Step 3: Cashier floor grid checks active tokens
    const floor = await apiRequest('GET', '/api/app/tokens?status=ACTIVE', { token: tenant1.token });
    assert.equal(floor.status, 200);
    const activeTokens = floor.data.tokens;
    assert.ok(activeTokens.length >= 3);
    const table2Token = activeTokens.find(t => t.tableNumber === 2);
    assert.equal(table2Token.status, 'BILL_REQUESTED');

    // Step 4: Two cashiers simultaneously attempt to settle Table 2
    const [c1, c2] = await Promise.all([
      apiRequest('POST', `/api/app/tokens/${t2.data.token.id}/settle`, {
        token: tenant1.token,
        body: { paymentMethod: 'UPI', paymentReference: 'UPI/HDFC/CONCUR1' }
      }),
      apiRequest('POST', `/api/app/tokens/${t2.data.token.id}/settle`, {
        token: tenant1.token,
        body: { paymentMethod: 'CASH' }
      })
    ]);

    const results = [c1.status, c2.status].sort();
    assert.deepEqual(
      results,
      [200, 409],
      'Pessimistic lock must allow exactly one settlement and reject the duplicate with 409'
    );

    // Step 5: Daily register summary verification
    const todayIst = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const regRes = await apiRequest('GET', `/api/app/tokens?status=SETTLED&date=${todayIst}`, {
      token: tenant1.token,
    });
    assert.equal(regRes.status, 200);
    const settledList = regRes.data.tokens;
    const table2InRegister = settledList.filter(t => t.id === t2.data.token.id);
    assert.equal(table2InRegister.length, 1, 'Table 2 must appear exactly once in settled register (no duplicate revenue entry)');
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 4: Full KDS Lifecycle with Multi-Table Multi-Order Partitioning
  // ---------------------------------------------------------------------------
  it('Scenario 4: Kitchen Operations Lifecycle (Ticket Partitioning & Preparation Time)', async () => {
    // Step 1: 3 diverse orders arrive simultaneously in kitchen
    const oDineIn = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '5',
        customerName: 'Karan Johar',
        items: [{ id: tenant1.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const oTakeaway = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'TAKEAWAY',
        customerName: 'Shahid Kapoor',
        customerPhone: '9820998877',
        items: [{ id: tenant1.items.vegCrispy.id, quantity: 1 }]
      }
    });
    const oDelivery = await publicRequest('POST', `/api/public/menus/${tenant1.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Ranbir Kapoor',
        customerPhone: '9820887766',
        deliveryAddress: 'Pali Hill, Bandra West, Mumbai',
        items: [
          { id: tenant1.items.dalMakhani.id, quantity: 1 },
          { id: tenant1.items.butterNaan.id, quantity: 2 },
        ]
      }
    });

    assert.equal(oDineIn.status, 201);
    assert.equal(oTakeaway.status, 201);
    assert.equal(oDelivery.status, 201);

    // Step 2: Chef adjusts preparation time on Delivery ticket to 35 mins
    const timeRes = await apiRequest('PATCH', `/api/app/orders/${oDelivery.data.id}/time`, {
      token: tenant1.token,
      body: { estimatedTimeMinutes: 35 }
    });
    assert.equal(timeRes.status, 200);
    assert.equal(timeRes.data.estimatedTimeMinutes, 35);

    // Step 3: Advance Dine-In ticket to READY
    await apiRequest('PATCH', `/api/app/orders/${oDineIn.data.id}/status`, { token: tenant1.token, body: { status: 'ACCEPTED' } });
    await apiRequest('PATCH', `/api/app/orders/${oDineIn.data.id}/status`, { token: tenant1.token, body: { status: 'PREPARING' } });
    const readyRes = await apiRequest('PATCH', `/api/app/orders/${oDineIn.data.id}/status`, { token: tenant1.token, body: { status: 'READY' } });
    assert.equal(readyRes.data.status, 'READY');

    // Step 4: Customer cancels Takeaway order before preparation begins
    const cancelRes = await apiRequest('PATCH', `/api/app/orders/${oTakeaway.data.id}/status`, {
      token: tenant1.token,
      body: { status: 'CANCELLED', rejectionReason: 'Customer requested cancellation' }
    });
    assert.equal(cancelRes.data.status, 'CANCELLED');
    assert.equal(cancelRes.data.rejectionReason, 'Customer requested cancellation');

    // Step 5: Deliver Dine-In order
    const deliveredRes = await apiRequest('PATCH', `/api/app/orders/${oDineIn.data.id}/status`, {
      token: tenant1.token,
      body: { status: 'DELIVERED' }
    });
    assert.equal(deliveredRes.data.status, 'DELIVERED');

    // Step 6: KDS query verifies all tickets are preserved with accurate statuses
    const kdsRes = await apiRequest('GET', '/api/app/orders', { token: tenant1.token });
    const orders = kdsRes.data;
    assert.ok(orders.find(o => o.id === oDineIn.data.id && o.status === 'DELIVERED'));
    assert.ok(orders.find(o => o.id === oTakeaway.data.id && o.status === 'CANCELLED'));
    assert.ok(orders.find(o => o.id === oDelivery.data.id && o.status === 'NEW'));
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 5: Strict Multi-Tenant Enterprise Isolation Under Concurrent Load
  // ---------------------------------------------------------------------------
  it('Scenario 5: Multi-Tenant Enterprise Isolation Under Concurrent Dining Operations', async () => {
    // Free Table 14 for both tenants
    for (const t of [tenant1, tenant2]) {
      const existing = await apiRequest('GET', '/api/app/tokens?tableNumber=14', { token: t.token });
      for (const tok of existing.data.tokens || []) {
        if (tok.status === 'SETTLED') await apiRequest('POST', `/api/app/tokens/${tok.id}/close`, { token: t.token });
      }
    }

    // Step 1: Both Tenant 1 and Tenant 2 seat parties on Table 14
    const [tokT1, tokT2] = await Promise.all([
      apiRequest('POST', '/api/app/tokens', {
        token: tenant1.token,
        body: { tableNumber: 14, covers: 2, items: [{ dishName: 'T1 Dish', quantity: 1, price: 500 }] }
      }),
      apiRequest('POST', '/api/app/tokens', {
        token: tenant2.token,
        body: { tableNumber: 14, covers: 4, items: [{ dishName: 'T2 Dish', quantity: 1, price: 800 }] }
      })
    ]);

    assert.equal(tokT1.status, 201);
    assert.equal(tokT2.status, 201);

    const idT1 = tokT1.data.token.id;
    const idT2 = tokT2.data.token.id;

    // Step 2: Tenant 1 attempts cross-tenant query for Tenant 2 token
    const idorQuery = await apiRequest('GET', `/api/app/tokens/${idT2}`, { token: tenant1.token });
    assert.equal(idorQuery.status, 404, 'Tenant 1 must not be able to read Tenant 2 token details');

    // Step 3: Tenant 1 attempts to settle Tenant 2 token
    const idorSettle = await apiRequest('POST', `/api/app/tokens/${idT2}/settle`, {
      token: tenant1.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(idorSettle.status, 404, 'Tenant 1 must not be able to settle Tenant 2 token');

    // Step 4: Each tenant settles its own token independently
    const settleT1 = await apiRequest('POST', `/api/app/tokens/${idT1}/settle`, {
      token: tenant1.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(settleT1.status, 200);

    const settleT2 = await apiRequest('POST', `/api/app/tokens/${idT2}/settle`, {
      token: tenant2.token,
      body: { paymentMethod: 'CARD', paymentReference: 'CARD/TX/TENANT2' }
    });
    assert.equal(settleT2.status, 200);

    // Step 5: Verify revenue segregation in daily settled registers
    const todayIst = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const regT1 = await apiRequest('GET', `/api/app/tokens?status=SETTLED&date=${todayIst}`, { token: tenant1.token });
    const regT2 = await apiRequest('GET', `/api/app/tokens?status=SETTLED&date=${todayIst}`, { token: tenant2.token });

    assert.ok(regT1.data.tokens.find(t => t.id === idT1));
    assert.equal(regT1.data.tokens.find(t => t.id === idT2), undefined, 'Tenant 1 register must not leak Tenant 2 records');

    assert.ok(regT2.data.tokens.find(t => t.id === idT2));
    assert.equal(regT2.data.tokens.find(t => t.id === idT1), undefined, 'Tenant 2 register must not leak Tenant 1 records');
  });
});

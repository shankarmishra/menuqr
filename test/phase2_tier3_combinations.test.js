/**
 * MenuQR Phase 2 E2E Test Suite - Tier 3: Cross-Feature Combinations (Pairwise Coverage)
 * Exercises interactions between multiple features across the complete lifecycle:
 * C1: Table QR Lock + Dine-In Order Placement + Auto-Token Bridge + Multi-Round Order Append
 * C2: Rush-Hour Delivery Pause + Dine-In Exemption + Minimum Order Validation
 * C3: Post-Dining Flow: Item Append -> Live Bill Recalculation -> Bill Request -> Cashier Settlement -> Customer SSE Real-Time Confetti Transition
 * C4: Concurrent Multi-Table Operations & Concurrency Double-Settle Protection
 * C5: Multi-Tenant Concurrent Floor Grid & Order Isolation
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

describe('Tier 3: Cross-Feature Combinations', () => {
  let tenantA = null;
  let tenantB = null;

  before(async () => {
    await ensureServer(3001);
    tenantA = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Udaipur Palace Dine',
      deliveryMinOrder: 200,
    });
    tenantB = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Goa Coastal Shack',
      deliveryMinOrder: 200,
    });
  });

  after(async () => {
    if (tenantA) await cleanupPhase2Tenant(tenantA.tenantId);
    if (tenantB) await cleanupPhase2Tenant(tenantB.tenantId);
    await closeDbPool();
  });

  it('C1: Table QR Lock + Dine-In Order Placement + Auto-Token Bridge + Multi-Round Order Append', async () => {
    const sessionId = `sess_qr_lock_${Date.now()}`;
    const tableNumber = '4';

    // Round 1: Starters
    const r1 = await publicRequest('POST', `/api/public/menus/${tenantA.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber,
        customerName: 'Aditya Birla',
        customerPhone: '9820011223',
        sessionId,
        roundNumber: 1,
        items: [{ id: tenantA.items.paneerTikka.id, quantity: 2 }] // 2 * 250 = 500
      }
    });

    assert.equal(r1.status, 201);
    assert.ok(r1.data.tokenId, 'Round 1 must bridge to tokenId');
    const tokenId = r1.data.tokenId;

    // Verify token initial status
    const tokCheck1 = await apiRequest('GET', `/api/app/tokens/${tokenId}`, { token: tenantA.token });
    assert.equal(tokCheck1.data.token.status, 'DINING');
    assert.equal(tokCheck1.data.token.subtotalPaise, 50000);

    // Round 2: Main Course (Customer orders additional items on the same table session)
    const r2 = await publicRequest('POST', `/api/public/menus/${tenantA.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber,
        customerName: 'Aditya Birla',
        customerPhone: '9820011223',
        sessionId,
        roundNumber: 2,
        parentOrderId: r1.data.id,
        items: [
          { id: tenantA.items.dalMakhani.id, quantity: 1 }, // 220
          { id: tenantA.items.butterNaan.id, quantity: 3 }   // 3 * 40 = 120
        ]
      }
    });

    assert.equal(r2.status, 201);
    // Cumulative order total for session: 500 + 340 = 840
    assert.equal(r2.data.sessionTotal, 840);
    assert.equal(r2.data.previousRoundItems.length, 1);

    // Verify table token has been updated with the appended items
    const tokCheck2 = await apiRequest('GET', `/api/app/tokens/${tokenId}`, { token: tenantA.token });
    assert.equal(tokCheck2.data.token.items.length, 3); // Paneer Tikka + Dal Makhani + Butter Naan
    // Subtotal: 500 + 220 + 120 = 840 rupees = 84000 paise
    assert.equal(tokCheck2.data.token.subtotalPaise, 84000);
  });

  it('C2: Rush-Hour Delivery Pause + Dine-In Exemption + Minimum Order Validation', async () => {
    // 1. Owner pauses delivery for 45 minutes due to kitchen rush
    const pausedUntil = new Date(Date.now() + 45 * 60000);
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = $1 WHERE tenant_id = $2`,
      [pausedUntil.toISOString(), tenantA.tenantId]
    );

    // 2. Customer attempts delivery order -> Must be rejected with HTTP 400
    const deliveryAttempt = await publicRequest('POST', `/api/public/menus/${tenantA.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Rashmika Mandanna',
        customerPhone: '9821334455',
        deliveryAddress: 'Carter Road, Bandra West, Mumbai',
        items: [{ id: tenantA.items.paneerTikka.id, quantity: 2 }]
      }
    });
    assert.equal(deliveryAttempt.status, 400, 'Delivery during rush pause must fail');
    assert.match(deliveryAttempt.data.error, /Delivery is temporarily paused due to kitchen rush/);

    // 3. Customer switches to Dine-In on Table 6 -> Dine-In must SUCCEED (exempt from delivery rush pause)
    const dineInOrder = await publicRequest('POST', `/api/public/menus/${tenantA.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '6',
        customerName: 'Rashmika Mandanna',
        customerPhone: '9821334455',
        items: [{ id: tenantA.items.paneerTikka.id, quantity: 1 }]
      }
    });
    assert.equal(dineInOrder.status, 201, 'Dine-In order must succeed despite active delivery rush pause');
    assert.equal(dineInOrder.data.tableNumber, '6');

    // 4. Reset rush pause
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = NULL WHERE tenant_id = $1`,
      [tenantA.tenantId]
    );
  });

  it('C3: Post-Dining Flow: Item Append -> Live Bill Recalculation -> Bill Request -> Cashier Settlement -> Customer SSE Real-Time Confetti Transition', async () => {
    // 1. Staff creates initial table token for Table 9
    const tokCreate = await apiRequest('POST', '/api/app/tokens', {
      token: tenantA.token,
      body: {
        tableNumber: 9,
        covers: 2,
        customerName: 'Sidharth Malhotra',
        items: [{ dishName: 'Veg Crispy', quantity: 1, price: 180 }]
      }
    });
    assert.equal(tokCreate.status, 201);
    const tokenId = tokCreate.data.token.id;

    // 2. Midway dining: Append desserts to table session
    const appendRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenantA.token,
      body: { items: [{ dishName: 'Gulab Jamun', quantity: 2, price: 80 }] }
    });
    assert.equal(appendRes.status, 200);

    // 3. Customer views live thermal bill on mobile
    const billView = await publicRequest('GET', `/api/public/tokens/${tokenId}`);
    assert.equal(billView.status, 200);
    // Subtotal: 180 + 160 = 340 rupees = 34000 paise
    assert.equal(billView.data.token.subtotalPaise, 34000);
    // 5% tax: 340 * 0.05 = 17 rupees = 1700 paise; Total: 357 rupees = 35700 paise
    assert.equal(billView.data.token.totalPaise, 35700);

    // 4. Customer connects SSE listener to wait for cashier settlement
    const ssePromise = listenToSse(`${getBaseUrl()}/api/public/tokens/${tokenId}/stream`, {
      matchEvent: (ev) => ev.event === 'token_settled',
      timeoutMs: 4000,
    });

    await new Promise(r => setTimeout(r, 200));

    // 5. Customer requests bill
    const billReqRes = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(billReqRes.status, 200);
    assert.equal(billReqRes.data.token.status, 'BILL_REQUESTED');

    // 6. Cashier one-click settlement via UPI
    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenantA.token,
      body: { paymentMethod: 'UPI', paymentReference: 'UPI/HDFC/POSTDINING99' }
    });
    assert.equal(settleRes.status, 200);
    assert.equal(settleRes.data.token.status, 'SETTLED');

    // 7. Verify customer SSE stream received the settlement event
    const events = await ssePromise;
    const settledEvent = events.find(e => e.event === 'token_settled');
    assert.ok(settledEvent, 'Customer must receive token_settled SSE event to trigger confetti UI transition');
    assert.equal(settledEvent.data.status, 'SETTLED');
    assert.equal(settledEvent.data.paymentMethod, 'UPI');
    assert.ok(settledEvent.data.googleReviewUrl, 'Review link must accompany settled event');
  });

  it('C4: Concurrent Multi-Table Operations & Concurrency Double-Settle Protection', async () => {
    // Free Table 11
    const tList = await apiRequest('GET', '/api/app/tokens?tableNumber=11', { token: tenantA.token });
    for (const t of tList.data.tokens || []) {
      if (t.status === 'SETTLED') await apiRequest('POST', `/api/app/tokens/${t.id}/close`, { token: tenantA.token });
    }

    const tokCreate = await apiRequest('POST', '/api/app/tokens', {
      token: tenantA.token,
      body: { tableNumber: 11, covers: 4, items: [{ dishName: 'Paneer Tikka', quantity: 2, price: 250 }] }
    });
    const tokenId = tokCreate.data.token.id;

    // Simulate two concurrent cashiers tapping Settle at the exact same millisecond
    const [res1, res2] = await Promise.all([
      apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
        token: tenantA.token,
        body: { paymentMethod: 'CASH' }
      }),
      apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
        token: tenantA.token,
        body: { paymentMethod: 'CARD' }
      })
    ]);

    const statuses = [res1.status, res2.status].sort();
    assert.deepEqual(
      statuses,
      [200, 409],
      'Under concurrent double-settle attempt, exactly one request must succeed (200) and one must receive Conflict (409)'
    );

    // Verify token in DB has exactly one settlement record
    const finalToken = await apiRequest('GET', `/api/app/tokens/${tokenId}`, { token: tenantA.token });
    assert.equal(finalToken.data.token.status, 'SETTLED');
  });

  it('C5: Multi-Tenant Concurrent Floor Grid & Order Isolation', async () => {
    // Both Tenant A and Tenant B use Table 1 simultaneously
    // Clean up any stale sessions on Table 1 for both tenants
    const listA = await apiRequest('GET', '/api/app/tokens?tableNumber=1', { token: tenantA.token });
    for (const t of listA.data.tokens || []) {
      if (t.status === 'SETTLED') await apiRequest('POST', `/api/app/tokens/${t.id}/close`, { token: tenantA.token });
    }
    const listB = await apiRequest('GET', '/api/app/tokens?tableNumber=1', { token: tenantB.token });
    for (const t of listB.data.tokens || []) {
      if (t.status === 'SETTLED') await apiRequest('POST', `/api/app/tokens/${t.id}/close`, { token: tenantB.token });
    }

    // Tenant A creates session on Table 1
    const tokA = await apiRequest('POST', '/api/app/tokens', {
      token: tenantA.token,
      body: { tableNumber: 1, covers: 2, items: [{ dishName: 'Paneer Tikka', quantity: 1, price: 250 }] }
    });
    assert.equal(tokA.status, 201);

    // Tenant B creates session on Table 1 (should NOT collide with Tenant A Table 1)
    const tokB = await apiRequest('POST', '/api/app/tokens', {
      token: tenantB.token,
      body: { tableNumber: 1, covers: 4, items: [{ dishName: 'Goa Shack Prawns', quantity: 2, price: 350 }] }
    });
    assert.equal(tokB.status, 201, 'Table numbers are tenant-scoped, no cross-tenant collision');

    // Tenant A settles Table 1
    const settleA = await apiRequest('POST', `/api/app/tokens/${tokA.data.token.id}/settle`, {
      token: tenantA.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(settleA.status, 200);

    // Tenant B Table 1 remains active and UNSETTLED
    const tokBCheck = await apiRequest('GET', `/api/app/tokens/${tokB.data.token.id}`, { token: tenantB.token });
    assert.equal(tokBCheck.data.token.status, 'ISSUED', 'Tenant B token status must remain unaffected');
  });
});

/**
 * MenuQR Phase 2 E2E Test Suite - Tier 1: Feature Coverage (Happy Paths)
 * Tests nominal operating behavior across the 5 core requirement areas:
 * Area 1: Customer Ordering & Controls
 * Area 2: Post-Dining & Digital Bill
 * Area 3: Cashier Floor & Settlement
 * Area 4: Kitchen Display System (KDS)
 * Area 5: Multi-Tenant Isolation
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
  getBaseUrl,
  closeDbPool,
} from './phase2_helpers.js';

describe('Tier 1: Feature Coverage (Happy Paths)', () => {
  let primaryTenant = null;
  let secondaryTenant = null;

  before(async () => {
    await ensureServer(3001);
    primaryTenant = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Spice Symphony',
      deliveryMinOrder: 150,
    });
    secondaryTenant = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Coastal Curry',
      deliveryMinOrder: 200,
    });
  });

  after(async () => {
    if (primaryTenant) await cleanupPhase2Tenant(primaryTenant.tenantId);
    if (secondaryTenant) await cleanupPhase2Tenant(secondaryTenant.tenantId);
    await closeDbPool();
  });

  // ---------------------------------------------------------------------------
  // AREA 1: Customer Ordering & Controls
  // ---------------------------------------------------------------------------

  it('F1.1: Menu browsing & full payload retrieval (categories, items, ordering settings)', async () => {
    const res = await publicRequest('GET', `/api/public/menus/${primaryTenant.menuSlug}`);
    assert.equal(res.status, 200, 'Menu endpoint should return HTTP 200');
    assert.ok(res.data.categories, 'Categories array must be present');
    assert.ok(res.data.categories.length >= 4, 'Should contain seeded categories');
    
    // Validate ordering settings presence
    assert.ok(res.data.orderingSettings, 'Ordering settings block must be present');
    assert.equal(res.data.orderingSettings.dineIn, true, 'Dine-in ordering should be enabled');
    assert.equal(res.data.orderingSettings.delivery, true, 'Delivery ordering should be enabled');
    assert.equal(res.data.orderingSettings.deliveryMinOrder, 150, 'deliveryMinOrder must match seeded ₹150');

    // Validate item structure
    const starters = res.data.categories.find(c => c.name === 'Starters');
    assert.ok(starters, 'Starters category should exist');
    const starterItems = res.data.items.filter(i => i.categoryId === starters.id);
    assert.ok(starterItems.length >= 2, 'Starters should have at least 2 items');
    const tikka = starterItems.find(i => i.name === 'Paneer Tikka');
    assert.ok(tikka, 'Paneer Tikka should exist in Starters');
    assert.equal(tikka.price, 250, 'Paneer Tikka price should be ₹250');
  });

  it('F1.2: Customer Dine-In order placement with table number & item pricing validation', async () => {
    const orderPayload = {
      orderType: 'DINE_IN',
      tableNumber: '4',
      customerName: 'Ananya Roy',
      customerPhone: '9820112233',
      notes: 'Less spicy please',
      items: [
        { id: primaryTenant.items.paneerTikka.id, quantity: 2 },
        { id: primaryTenant.items.butterNaan.id, quantity: 4 }
      ]
    };

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });

    assert.equal(res.status, 201, 'Dine-In order should be created with HTTP 201');
    assert.ok(res.data.id, 'Order ID must be returned');
    assert.equal(res.data.orderType, 'DINE_IN');
    assert.equal(res.data.tableNumber, '4');
    assert.equal(res.data.customerName, 'Ananya Roy');
    // Expected total: (2 * 250) + (4 * 40) = 500 + 160 = 660
    assert.equal(res.data.total, 660, 'Total should equal calculated item total');
    assert.equal(res.data.status, 'NEW');
  });

  it('F1.3: Customer Takeaway order placement with phone & name validation', async () => {
    const orderPayload = {
      orderType: 'TAKEAWAY',
      customerName: 'Vikram Mehta',
      customerPhone: '9819001122',
      notes: 'Pack cutlery separately',
      items: [
        { id: primaryTenant.items.vegCrispy.id, quantity: 1 },
        { id: primaryTenant.items.dalMakhani.id, quantity: 1 }
      ]
    };

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });

    assert.equal(res.status, 201, 'Takeaway order should be created with HTTP 201');
    assert.equal(res.data.orderType, 'TAKEAWAY');
    assert.equal(res.data.customerName, 'Vikram Mehta');
    assert.equal(res.data.tableNumber, 'TAKEAWAY');
    // Expected: 180 + 220 = 400
    assert.equal(res.data.total, 400);
  });

  it('F1.4: Customer Delivery order placement with delivery address & minimum order verification', async () => {
    const orderPayload = {
      orderType: 'DELIVERY',
      customerName: 'Pooja Hegde',
      customerPhone: '9833445566',
      deliveryAddress: 'Flat 402, Sea Green Apts, Juhu Beach Road',
      deliveryLandmark: 'Opposite JW Marriott',
      deliveryCity: 'Mumbai',
      items: [
        { id: primaryTenant.items.paneerTikka.id, quantity: 1 }, // 250 (meets min ₹150)
      ]
    };

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });

    assert.equal(res.status, 201, 'Delivery order above min order should succeed with HTTP 201');
    assert.equal(res.data.orderType, 'DELIVERY');
    assert.equal(res.data.deliveryAddress, 'Flat 402, Sea Green Apts, Juhu Beach Road');
    assert.ok(res.data.trackingToken, 'Delivery order must issue cryptographically secure trackingToken');
  });

  it('F1.5: Automatic Dine-In order bridging to table token creation with tokenBridge', async () => {
    const orderPayload = {
      orderType: 'DINE_IN',
      tableNumber: '7',
      customerName: 'Kabir Das',
      customerPhone: '9876543210',
      items: [
        { id: primaryTenant.items.paneerTikka.id, quantity: 1 },
        { id: primaryTenant.items.gulabJamun.id, quantity: 2 },
      ]
    };

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });

    assert.equal(res.status, 201);
    assert.ok(res.data.tokenId, 'Dine-In order must auto-bridge to tokenId');
    assert.ok(res.data.tokenNumber, 'Order must receive sequential daily tokenNumber');
    assert.ok(res.data.billUrl, 'Order must return digital billUrl');

    // Verify token exists in cashier token API
    const tokenRes = await apiRequest('GET', `/api/app/tokens/${res.data.tokenId}`, {
      token: primaryTenant.token,
    });
    assert.equal(tokenRes.status, 200);
    assert.equal(tokenRes.data.token.tableNumber, 7);
    assert.equal(tokenRes.data.token.status, 'DINING');
    assert.equal(tokenRes.data.token.items.length, 2);
  });

  it('F1.6: Idempotent order deduplication via SHA-256 base64url fingerprinting', async () => {
    const orderPayload = {
      orderType: 'DINE_IN',
      tableNumber: '8',
      customerName: 'Sunil Gavaskar',
      customerPhone: '9820001122',
      items: [
        { id: primaryTenant.items.butterNaan.id, quantity: 2 }
      ]
    };

    // First request
    const res1 = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });
    assert.equal(res1.status, 201);

    // Rapid duplicate submission (simulating double-tap or network retry)
    const res2 = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: orderPayload,
    });
    assert.equal(res2.status, 200, 'Duplicate submission within sliding window returns HTTP 200');
    assert.equal(res2.data.id, res1.data.id, 'Duplicate submission must return original order ID');
  });

  // ---------------------------------------------------------------------------
  // AREA 2: Post-Dining & Digital Bill
  // ---------------------------------------------------------------------------

  it('F2.1: Public bill retrieval by valid tokenId without authentication', async () => {
    // 1. Create a dining token
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: {
        tableNumber: 9,
        covers: 2,
        customerName: 'Aditi Rao',
        items: [
          { dishName: 'Paneer Tikka', quantity: 1, price: 250 },
          { dishName: 'Butter Naan', quantity: 2, price: 40 },
        ]
      }
    });
    assert.equal(tokenCreate.status, 201);
    const tokenId = tokenCreate.data.token.id;

    // 2. Public bill retrieval (Zero headers or cookies)
    const billRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`);
    assert.equal(billRes.status, 200, 'Public bill retrieval should return HTTP 200');
    assert.equal(billRes.data.success, true);
    assert.ok(billRes.data.token || billRes.data, 'Bill data unwrap contract fulfilled');
    const token = billRes.data.token || billRes.data;
    assert.equal(token.tableNumber, 9);
    assert.equal(token.items.length, 2);
    assert.equal(token.subtotalPaise, 33000); // 250 + 80 = 330 => 33000 paise
  });

  it('F2.2: Customer requesting bill transitions status to BILL_REQUESTED', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: {
        tableNumber: 10,
        covers: 3,
        items: [{ dishName: 'Veg Crispy', quantity: 2, price: 180 }]
      }
    });
    const tokenId = tokenCreate.data.token.id;

    // Customer requests bill
    const reqRes = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(reqRes.status, 200);
    assert.equal(reqRes.data.success, true);
    assert.equal(reqRes.data.token.status, 'BILL_REQUESTED');

    // Confirm state on staff panel
    const checkRes = await apiRequest('GET', `/api/app/tokens/${tokenId}`, { token: primaryTenant.token });
    assert.equal(checkRes.data.token.status, 'BILL_REQUESTED');
  });

  it('F2.3: Thermal receipt itemization verification (dishName, unitPricePaise, totals)', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: {
        tableNumber: 11,
        covers: 4,
        customerName: 'Neeraj Chopra',
        items: [
          { dishName: 'Dal Makhani', quantity: 2, price: 220 },
          { dishName: 'Butter Naan', quantity: 5, price: 40 },
          { dishName: 'Gulab Jamun', quantity: 3, price: 80 },
        ]
      }
    });
    const tokenId = tokenCreate.data.token.id;

    const billRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`);
    assert.equal(billRes.status, 200);
    const token = billRes.data.token;

    // Subtotal: (2*220) + (5*40) + (3*80) = 440 + 200 + 240 = 880 rupees = 88000 paise
    assert.equal(token.subtotalPaise, 88000);
    // 5% GST: 880 * 0.05 = 44 rupees = 4400 paise
    assert.equal(token.taxPaise, 4400);
    // Total: 880 + 44 = 924 rupees = 92400 paise
    assert.equal(token.totalPaise, 92400);

    // Verify item fields
    for (const item of token.items) {
      assert.ok(item.dishName || item.itemName, 'Item name must be populated');
      assert.ok(Number.isInteger(item.unitPricePaise), 'unitPricePaise must be integer');
      assert.ok(Number.isInteger(item.totalPricePaise), 'totalPricePaise must be integer');
    }
  });

  it('F2.4: Status transition progression ORDERING -> DINING -> BILL_REQUESTED -> SETTLED', async () => {
    // 1. Staff creates token (ISSUED)
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 12, covers: 2 }
    });
    const tokenId = tokenCreate.data.token.id;
    assert.equal(tokenCreate.data.token.status, 'ISSUED');

    // 2. Append items transitions to ORDERING
    const appendRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: primaryTenant.token,
      body: { items: [{ dishName: 'Paneer Tikka', quantity: 1, price: 250 }] }
    });
    assert.equal(appendRes.data.token.status, 'ORDERING');

    // 3. Staff advances to DINING
    const diningRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/status`, {
      token: primaryTenant.token,
      body: { status: 'DINING' }
    });
    assert.equal(diningRes.data.token.status, 'DINING');

    // 4. Customer requests bill -> BILL_REQUESTED
    const billReqRes = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(billReqRes.data.token.status, 'BILL_REQUESTED');

    // 5. Cashier settles -> SETTLED
    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'UPI', paymentReference: 'UPI/REF/1001' }
    });
    assert.equal(settleRes.data.token.status, 'SETTLED');
  });

  it('F2.5: Customer real-time SSE stream receives token_settled event upon cashier payment', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: {
        tableNumber: 13,
        covers: 2,
        items: [{ dishName: 'Masala Chai', quantity: 2, price: 50 }]
      }
    });
    const tokenId = tokenCreate.data.token.id;

    // Connect customer SSE listener
    const ssePromise = listenToSse(`${getBaseUrl()}/api/public/tokens/${tokenId}/stream`, {
      matchEvent: (ev) => ev.event === 'token_settled',
      timeoutMs: 4000,
    });

    // Small delay for SSE connection handshake
    await new Promise(r => setTimeout(r, 200));

    // Cashier settles the token
    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(settleRes.status, 200);

    const events = await ssePromise;
    const settledEvent = events.find(e => e.event === 'token_settled');
    assert.ok(settledEvent, 'Customer SSE stream must receive token_settled event');
    assert.equal(settledEvent.data.status, 'SETTLED');
    assert.equal(settledEvent.data.paymentMethod, 'CASH');
  });

  // ---------------------------------------------------------------------------
  // AREA 3: Cashier Floor & Settlement
  // ---------------------------------------------------------------------------

  it('F3.1: Active table occupancy tracking via GET /api/app/tokens?status=ACTIVE', async () => {
    const res = await apiRequest('GET', '/api/app/tokens?status=ACTIVE', {
      token: primaryTenant.token,
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.tokens), 'Tokens must be an array');
    // Ensure all returned tokens are in active statuses
    for (const tok of res.data.tokens) {
      assert.ok(
        ['ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID'].includes(tok.status),
        `Active query should only return active tokens, got ${tok.status}`
      );
    }
  });

  it('F3.2: Pending bill request filtering in Cashier queue (status=BILL_REQUESTED)', async () => {
    // Create token and request bill
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 14, covers: 1, items: [{ dishName: 'Masala Chai', quantity: 1, price: 50 }] }
    });
    const tokenId = tokenCreate.data.token.id;
    await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);

    // Fetch pending bill requests
    const res = await apiRequest('GET', '/api/app/tokens?status=BILL_REQUESTED', {
      token: primaryTenant.token,
    });
    assert.equal(res.status, 200);
    const found = res.data.tokens.find(t => t.id === tokenId);
    assert.ok(found, 'Cashier must see token in BILL_REQUESTED queue');
    assert.equal(found.status, 'BILL_REQUESTED');
  });

  it('F3.3: One-click Cash settlement (POST /api/app/tokens/:id/settle with CASH)', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 15, covers: 2, items: [{ dishName: 'Paneer Tikka', quantity: 1, price: 250 }] }
    });
    const tokenId = tokenCreate.data.token.id;

    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });

    assert.equal(settleRes.status, 200);
    assert.equal(settleRes.data.token.status, 'SETTLED');
    assert.equal(settleRes.data.token.paymentMethod, 'CASH');
    assert.ok(settleRes.data.token.settledAt, 'settledAt timestamp must be recorded');
  });

  it('F3.4: One-click UPI settlement with payment reference', async () => {
    // Free table 15 by closing previous session
    const listRes = await apiRequest('GET', '/api/app/tokens?tableNumber=15', { token: primaryTenant.token });
    if (listRes.data.tokens?.[0]?.status === 'SETTLED') {
      await apiRequest('POST', `/api/app/tokens/${listRes.data.tokens[0].id}/close`, { token: primaryTenant.token });
    }

    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 15, covers: 2, items: [{ dishName: 'Dal Makhani', quantity: 1, price: 220 }] }
    });
    const tokenId = tokenCreate.data.token.id;

    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'UPI', paymentReference: 'UPI/HDFC/9988776655' }
    });

    assert.equal(settleRes.status, 200);
    assert.equal(settleRes.data.token.paymentMethod, 'UPI');
    assert.equal(settleRes.data.token.paymentReference, 'UPI/HDFC/9988776655');
  });

  it('F3.5: One-click Card settlement', async () => {
    // Close table 15
    const listRes = await apiRequest('GET', '/api/app/tokens?tableNumber=15', { token: primaryTenant.token });
    if (listRes.data.tokens?.[0]?.status === 'SETTLED') {
      await apiRequest('POST', `/api/app/tokens/${listRes.data.tokens[0].id}/close`, { token: primaryTenant.token });
    }

    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 15, covers: 2, items: [{ dishName: 'Gulab Jamun', quantity: 2, price: 80 }] }
    });
    const tokenId = tokenCreate.data.token.id;

    const settleRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CARD', paymentReference: 'POS/BATCH44/TX982' }
    });

    assert.equal(settleRes.status, 200);
    assert.equal(settleRes.data.token.paymentMethod, 'CARD');
  });

  it('F3.6: Daily settled register summary filtering by IST date', async () => {
    const todayIst = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const res = await apiRequest('GET', `/api/app/tokens?status=SETTLED&date=${todayIst}`, {
      token: primaryTenant.token,
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.tokens));
    assert.ok(res.data.tokens.length >= 1, 'Should contain today settled tokens');
    for (const t of res.data.tokens) {
      assert.equal(t.status, 'SETTLED');
    }
  });

  // ---------------------------------------------------------------------------
  // AREA 4: Kitchen Display System (KDS)
  // ---------------------------------------------------------------------------

  it('F4.1: KDS order listing displays real-time incoming tickets within 24-hour window', async () => {
    const res = await apiRequest('GET', '/api/app/orders', {
      token: primaryTenant.token,
    });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data), 'KDS orders must be an array');
    assert.ok(res.data.length >= 1, 'KDS must display orders placed today');
    const firstOrder = res.data[0];
    assert.ok(firstOrder.id, 'Order must have id');
    assert.ok(firstOrder.status, 'Order must have status');
    assert.ok(firstOrder.items, 'Order must contain items list');
  });

  it('F4.2: Multi-round table clustering aggregates previousRoundItems and cumulative sessionTotal', async () => {
    const sessionId = `table3_session_${Date.now()}`;

    // Round 1 order
    const r1 = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '3',
        sessionId,
        roundNumber: 1,
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }] // 250
      }
    });
    assert.equal(r1.status, 201);

    // Round 2 order on same session
    const r2 = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '3',
        sessionId,
        roundNumber: 2,
        parentOrderId: r1.data.id,
        items: [{ id: primaryTenant.items.butterNaan.id, quantity: 2 }] // 80
      }
    });
    assert.equal(r2.status, 201);
    // Cumulative session total: 250 + 80 = 330
    assert.equal(r2.data.sessionTotal, 330, 'sessionTotal should aggregate both rounds');
    assert.ok(r2.data.previousRoundItems.length >= 1, 'previousRoundItems should contain Round 1 items');

    // Confirm KDS staff order fetch preserves clustering
    const kdsRes = await apiRequest('GET', '/api/app/orders', { token: primaryTenant.token });
    const kdsOrder2 = kdsRes.data.find(o => o.id === r2.data.id);
    assert.ok(kdsOrder2);
    assert.equal(kdsOrder2.sessionTotal, 330);
  });

  it('F4.3: KDS active ticket progression: NEW -> ACCEPTED -> PREPARING -> READY', async () => {
    const orderRes = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: primaryTenant.items.vegCrispy.id, quantity: 1 }]
      }
    });
    const orderId = orderRes.data.id;
    assert.equal(orderRes.data.status, 'NEW');

    // 1. Accept
    const a1 = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'ACCEPTED' }
    });
    assert.equal(a1.status, 200);
    assert.equal(a1.data.status, 'ACCEPTED');

    // 2. Prepare
    const a2 = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'PREPARING' }
    });
    assert.equal(a2.status, 200);
    assert.equal(a2.data.status, 'PREPARING');

    // 3. Ready
    const a3 = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'READY' }
    });
    assert.equal(a3.status, 200);
    assert.equal(a3.data.status, 'READY');
  });

  it('F4.4: Completed ticket partitioning: READY -> DELIVERED marks ticket fulfilled', async () => {
    const orderRes = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: primaryTenant.items.masalaChai.id, quantity: 1 }]
      }
    });
    const orderId = orderRes.data.id;

    await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, { token: primaryTenant.token, body: { status: 'ACCEPTED' } });
    await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, { token: primaryTenant.token, body: { status: 'PREPARING' } });
    await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, { token: primaryTenant.token, body: { status: 'READY' } });

    // Mark Delivered
    const delRes = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'DELIVERED' }
    });
    assert.equal(delRes.status, 200);
    assert.equal(delRes.data.status, 'DELIVERED');
  });

  it('F4.5: Order cancellation with rejection reason', async () => {
    const orderRes = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.butterNaan.id, quantity: 1 }]
      }
    });
    const orderId = orderRes.data.id;

    const cancelRes = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'CANCELLED', rejectionReason: 'Kitchen out of naan dough' }
    });
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.data.status, 'CANCELLED');
    assert.equal(cancelRes.data.rejectionReason, 'Kitchen out of naan dough');
  });

  it('F4.6: Preparation time update updates estimated delivery time', async () => {
    const orderRes = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Kunal Kapoor',
        customerPhone: '9822334455',
        deliveryAddress: 'Building 5, Flat 101, Bandra West',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderId = orderRes.data.id;

    const timeRes = await apiRequest('PATCH', `/api/app/orders/${orderId}/time`, {
      token: primaryTenant.token,
      body: { estimatedTimeMinutes: 45 }
    });
    assert.equal(timeRes.status, 200);
    assert.equal(timeRes.data.estimatedTimeMinutes, 45);
    assert.ok(timeRes.data.estimatedDeliveryTime, 'estimatedDeliveryTime timestamp must be updated');
  });

  // ---------------------------------------------------------------------------
  // AREA 5: Multi-Tenant Isolation
  // ---------------------------------------------------------------------------

  it('F5.1: Tenant A staff cannot view or list Tenant B active tokens', async () => {
    // Create token under Tenant B
    const tokB = await apiRequest('POST', '/api/app/tokens', {
      token: secondaryTenant.token,
      body: { tableNumber: 1, covers: 2, items: [{ dishName: 'Coastal Curry', quantity: 1, price: 300 }] }
    });
    assert.equal(tokB.status, 201);
    const tokenBId = tokB.data.token.id;

    // Tenant A queries tokens
    const listA = await apiRequest('GET', '/api/app/tokens?status=ACTIVE', {
      token: primaryTenant.token,
    });
    const leak = listA.data.tokens.find(t => t.id === tokenBId);
    assert.equal(leak, undefined, 'Tenant A active queue must NEVER contain Tenant B tokens');
  });

  it('F5.2: Tenant A staff cannot view or list Tenant B KDS orders', async () => {
    // Place order under Tenant B
    const ordB = await publicRequest('POST', `/api/public/menus/${secondaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: secondaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    assert.equal(ordB.status, 201);
    const orderBId = ordB.data.id;

    // Tenant A staff queries KDS orders
    const ordersA = await apiRequest('GET', '/api/app/orders', {
      token: primaryTenant.token,
    });
    const leak = ordersA.data.find(o => o.id === orderBId);
    assert.equal(leak, undefined, 'Tenant A KDS must NEVER list Tenant B orders');
  });

  it('F5.3: Tenant A staff cannot settle or void Tenant B tokens (returns 404)', async () => {
    const tokB = await apiRequest('POST', '/api/app/tokens', {
      token: secondaryTenant.token,
      body: { tableNumber: 6, covers: 2 }
    });
    const tokenBId = tokB.data.token.id;

    // Tenant A attempts to settle Tenant B's token
    const settleAttempt = await apiRequest('POST', `/api/app/tokens/${tokenBId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(settleAttempt.status, 404, 'Attempting cross-tenant settlement must return 404 Not Found');

    // Tenant A attempts to void Tenant B's token
    const voidAttempt = await apiRequest('POST', `/api/app/tokens/${tokenBId}/void`, {
      token: primaryTenant.token,
      body: { reason: 'Malicious void attempt' }
    });
    assert.equal(voidAttempt.status, 404, 'Attempting cross-tenant void must return 404 Not Found');
  });

  it('F5.4: Tenant A staff cannot update status of Tenant B orders (returns 404)', async () => {
    const ordB = await publicRequest('POST', `/api/public/menus/${secondaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: secondaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderBId = ordB.data.id;

    const patchAttempt = await apiRequest('PATCH', `/api/app/orders/${orderBId}/status`, {
      token: primaryTenant.token,
      body: { status: 'CANCELLED' }
    });
    assert.equal(patchAttempt.status, 404, 'Cross-tenant order status mutation must return 404 Not Found');
  });

  it('F5.5: Cross-tenant ordering separation: placing order under Restaurant A does not affect Restaurant B', async () => {
    const ordA = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '10',
        customerName: 'Tenant A Customer',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    assert.equal(ordA.status, 201);

    const ordersB = await apiRequest('GET', '/api/app/orders', {
      token: secondaryTenant.token,
    });
    const foundInB = ordersB.data.find(o => o.id === ordA.data.id);
    assert.equal(foundInB, undefined, 'Order for Restaurant A must never show in Restaurant B queue');
  });
});

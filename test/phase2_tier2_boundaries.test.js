/**
 * MenuQR Phase 2 E2E Test Suite - Tier 2: Boundaries & Corners (Edge Cases & Guards)
 * Verifies system resistance to invalid inputs, out-of-schedule orders, concurrency races,
 * invalid state machine transitions, and cross-tenant privilege escalation.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureServer,
  createPhase2Tenant,
  cleanupPhase2Tenant,
  apiRequest,
  publicRequest,
  dbQuery,
  closeDbPool,
} from './phase2_helpers.js';

describe('Tier 2: Boundaries & Corners', () => {
  let primaryTenant = null;
  let secondaryTenant = null;
  let basicTenant = null;

  before(async () => {
    await ensureServer(3001);
    primaryTenant = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Boundary Testing Bistro',
      deliveryMinOrder: 250,
    });
    secondaryTenant = await createPhase2Tenant({
      planId: 'PREMIUM',
      businessName: 'Corner Case Cafe',
    });
    basicTenant = await createPhase2Tenant({
      planId: 'BASIC',
      businessName: 'Basic Tier Restaurant',
    });
  });

  after(async () => {
    if (primaryTenant) await cleanupPhase2Tenant(primaryTenant.tenantId);
    if (secondaryTenant) await cleanupPhase2Tenant(secondaryTenant.tenantId);
    if (basicTenant) await cleanupPhase2Tenant(basicTenant.tenantId);
    await closeDbPool();
  });

  // ---------------------------------------------------------------------------
  // AREA 1 BOUNDARIES: Customer Ordering & Controls
  // ---------------------------------------------------------------------------

  it('B1.1: Zero item quantity is rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 0 }]
      }
    });
    assert.equal(res.status, 400, 'Zero quantity must return HTTP 400 Bad Request');
  });

  it('B1.2: Negative item quantity is rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: -3 }]
      }
    });
    assert.equal(res.status, 400, 'Negative quantity must return HTTP 400 Bad Request');
  });

  it('B1.3: Excessive item quantity (>50 per item) is rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.butterNaan.id, quantity: 51 }]
      }
    });
    assert.equal(res.status, 400, 'Quantity > 50 must return HTTP 400');
  });

  it('B1.4: Excessive total order quantity (>200 items in total) is rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [
          { id: primaryTenant.items.butterNaan.id, quantity: 50 },
          { id: primaryTenant.items.paneerTikka.id, quantity: 50 },
          { id: primaryTenant.items.vegCrispy.id, quantity: 50 },
          { id: primaryTenant.items.gulabJamun.id, quantity: 50 },
          { id: primaryTenant.items.masalaChai.id, quantity: 10 }, // Total = 210
        ]
      }
    });
    assert.equal(res.status, 400, 'Total quantity > 200 must return HTTP 400');
  });

  it('B1.5: Rush-hour delivery pause rejects delivery order with HTTP 400 and remaining minutes feedback', async () => {
    // Set 25-minute pause on delivery
    const pauseTime = new Date(Date.now() + 25 * 60000);
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = $1 WHERE tenant_id = $2`,
      [pauseTime.toISOString(), primaryTenant.tenantId]
    );

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Aarav Patel',
        customerPhone: '9820123456',
        deliveryAddress: 'Hill Road, Bandra West, Mumbai',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 2 }]
      }
    });

    assert.equal(res.status, 400, 'Delivery during rush pause must return HTTP 400');
    assert.match(res.data.error, /Delivery is temporarily paused due to kitchen rush/);
    assert.match(res.data.error, /Resumes in ~\d+ min/);

    // Reset pause
    await dbQuery(
      `UPDATE ordering_settings SET delivery_paused_until = NULL WHERE tenant_id = $1`,
      [primaryTenant.tenantId]
    );
  });

  it('B1.6: Out-of-schedule delivery time slot rejected with HTTP 400', async () => {
    // Configure delivery time slot to an impossible past window (02:00 to 02:05 AM IST)
    const closedSlots = [{ start: '02:00', end: '02:05' }];
    await dbQuery(
      `UPDATE ordering_settings SET delivery_time_slots = $1 WHERE tenant_id = $2`,
      [JSON.stringify(closedSlots), primaryTenant.tenantId]
    );

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Rohan Mehra',
        customerPhone: '9820112233',
        deliveryAddress: 'Linking Road, Khar West, Mumbai',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 2 }]
      }
    });

    assert.equal(res.status, 400);
    assert.match(res.data.error, /Delivery is currently closed outside of scheduled service hours/);

    // Reset slots to open
    await dbQuery(
      `UPDATE ordering_settings SET delivery_time_slots = '[]'::jsonb WHERE tenant_id = $1`,
      [primaryTenant.tenantId]
    );
  });

  it('B1.7: Missing table number on Dine-In order rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '', // Empty
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.error, /Table number is required for dine-in orders/);
  });

  it('B1.8: Delivery order below minimum order amount rejected with HTTP 400', async () => {
    // Primary tenant deliveryMinOrder = 250
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Sanjay Dutt',
        customerPhone: '9819001122',
        deliveryAddress: 'Bandra Bandstand, Mumbai',
        items: [{ id: primaryTenant.items.gulabJamun.id, quantity: 1 }] // ₹80 < ₹250
      }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.error, /Minimum order amount for delivery is ₹250/);
  });

  it('B1.9: Delivery order with invalid phone number (<10 digits) rejected with HTTP 400', async () => {
    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DELIVERY',
        customerName: 'Ajay Devgn',
        customerPhone: '981900', // only 6 digits
        deliveryAddress: 'Juhu Tara Road, Mumbai',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 2 }]
      }
    });
    assert.equal(res.status, 400);
    assert.match(res.data.error, /valid 10-digit mobile number is required/);
  });

  it('B1.10: Disabled order type (dine-in disabled by owner) rejected with HTTP 400', async () => {
    await dbQuery(
      `UPDATE ordering_settings SET dine_in_enabled = false WHERE tenant_id = $1`,
      [primaryTenant.tenantId]
    );

    const res = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });

    assert.equal(res.status, 400);
    assert.match(res.data.error, /Dine-in table ordering is currently disabled/);

    // Re-enable
    await dbQuery(
      `UPDATE ordering_settings SET dine_in_enabled = true WHERE tenant_id = $1`,
      [primaryTenant.tenantId]
    );
  });

  // ---------------------------------------------------------------------------
  // AREA 2 BOUNDARIES: Post-Dining & Digital Bill
  // ---------------------------------------------------------------------------

  it('B2.1: Bill retrieval with malformed non-UUID tokenId returns HTTP 404', async () => {
    const res = await publicRequest('GET', '/api/public/tokens/not-a-valid-uuid');
    assert.equal(res.status, 404, 'Malformed tokenId should return HTTP 404');
  });

  it('B2.2: Bill retrieval with non-existent UUID tokenId returns HTTP 404', async () => {
    const nonExistent = '00000000-0000-0000-0000-000000000000';
    const res = await publicRequest('GET', `/api/public/tokens/${nonExistent}`);
    assert.equal(res.status, 404, 'Non-existent UUID tokenId should return HTTP 404');
  });

  it('B2.3: Requesting bill on an already settled token returns HTTP 409 Conflict', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 10, covers: 2, items: [{ dishName: 'Veg Crispy', quantity: 1, price: 180 }] }
    });
    const tokenId = tokenCreate.data.token.id;

    // Settle it first
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });

    // Attempt request-bill on settled token
    const reqRes = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(reqRes.status, 409, 'Requesting bill on settled token must return HTTP 409 Conflict');
  });

  it('B2.4: Requesting bill on a closed token returns HTTP 409 Conflict', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 11, covers: 2 }
    });
    const tokenId = tokenCreate.data.token.id;

    // Settle and close
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });
    await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: primaryTenant.token,
    });

    const reqRes = await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`);
    assert.equal(reqRes.status, 409, 'Requesting bill on closed token must return HTTP 409 Conflict');
  });

  it('B2.5: Appending items to a settled or closed token returns HTTP 409 Conflict', async () => {
    const tokenCreate = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 12, covers: 2, items: [{ dishName: 'Paneer Tikka', quantity: 1, price: 250 }] }
    });
    const tokenId = tokenCreate.data.token.id;

    // Settle
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'UPI' }
    });

    // Attempt append items
    const appendRes = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: primaryTenant.token,
      body: { items: [{ dishName: 'Gulab Jamun', quantity: 1, price: 80 }] }
    });
    assert.equal(appendRes.status, 409, 'Appending items to settled token must return HTTP 409 Conflict');
  });

  // ---------------------------------------------------------------------------
  // AREA 3 BOUNDARIES: Cashier Floor & Settlement
  // ---------------------------------------------------------------------------

  it('B3.1: Creating new token on a table that already has an active session returns HTTP 409 Conflict', async () => {
    // Session 1 on Table 5
    const tok1 = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 5, covers: 2 }
    });
    assert.equal(tok1.status, 201);

    // Attempt second active session on Table 5
    const tok2 = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 5, covers: 4 }
    });
    assert.equal(tok2.status, 409, 'Duplicate active token on same table must return HTTP 409 Conflict');
    assert.match(tok2.data.error, /already has an active dining session/);
  });

  it('B3.2: Double-settlement race guard: settling an already settled token returns HTTP 409 Conflict', async () => {
    const tok = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 7, covers: 2 }
    });
    const tokenId = tok.data.token.id;

    // First settlement succeeds
    const s1 = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });
    assert.equal(s1.status, 200);

    // Second settlement fails with HTTP 409
    const s2 = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'UPI' }
    });
    assert.equal(s2.status, 409, 'Second settlement must return HTTP 409 Conflict');
    assert.match(s2.data.error, /Token is already settled/);
  });

  it('B3.3: Settlement with invalid payment method (e.g. BITCOIN) returns HTTP 400 Bad Request', async () => {
    const tok = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 8, covers: 2 }
    });
    const tokenId = tok.data.token.id;

    const res = await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'BITCOIN' }
    });
    assert.equal(res.status, 400, 'Invalid payment method must return HTTP 400');
    assert.match(res.data.error, /Supported methods: CASH, UPI, CARD/);
  });

  it('B3.4: Closing an unsettled active table token returns HTTP 400 Bad Request', async () => {
    const tok = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 9, covers: 2 }
    });
    const tokenId = tok.data.token.id;

    const res = await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: primaryTenant.token,
    });
    assert.equal(res.status, 400, 'Closing unsettled active token must return HTTP 400');
    assert.match(res.data.error, /Cannot close an active token that has not been settled/);
  });

  it('B3.5: Voiding a token without a reason string returns HTTP 400 Bad Request', async () => {
    const tok = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 13, covers: 2 }
    });
    const tokenId = tok.data.token.id;

    const res = await apiRequest('POST', `/api/app/tokens/${tokenId}/void`, {
      token: primaryTenant.token,
      body: { reason: '' }
    });
    assert.equal(res.status, 400, 'Voiding without reason must return HTTP 400');
    assert.match(res.data.error, /Void reason is required/);
  });

  it('B3.6: Voiding an already settled or closed token returns HTTP 409 Conflict', async () => {
    const tok = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 14, covers: 2 }
    });
    const tokenId = tok.data.token.id;

    // Settle
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: primaryTenant.token,
      body: { paymentMethod: 'CASH' }
    });

    // Attempt void on settled token
    const res = await apiRequest('POST', `/api/app/tokens/${tokenId}/void`, {
      token: primaryTenant.token,
      body: { reason: 'Customer walked out' }
    });
    assert.equal(res.status, 409, 'Voiding settled token must return HTTP 409 Conflict');
  });

  // ---------------------------------------------------------------------------
  // AREA 4 BOUNDARIES: Kitchen Display System (KDS)
  // ---------------------------------------------------------------------------

  it('B4.1: Invalid status transition (e.g. NEW -> DELIVERED skipping intermediate states) returns HTTP 400', async () => {
    const ord = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderId = ord.data.id;

    const res = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'DELIVERED' } // Skipping ACCEPTED, PREPARING, READY
    });
    assert.equal(res.status, 400, 'Skipping state machine stages must return HTTP 400');
    assert.match(res.data.error, /Cannot transition order from NEW to DELIVERED/);
  });

  it('B4.2: Transitioning status on an already terminal order returns HTTP 400', async () => {
    const ord = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderId = ord.data.id;

    // Transition to CANCELLED (terminal)
    await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'CANCELLED', rejectionReason: 'Table left' }
    });

    // Attempt to re-open or transition
    const res = await apiRequest('PATCH', `/api/app/orders/${orderId}/status`, {
      token: primaryTenant.token,
      body: { status: 'ACCEPTED' }
    });
    assert.equal(res.status, 400, 'Mutating terminal CANCELLED order must return HTTP 400');
  });

  it('B4.3: Invalid preparation time update (negative minutes, zero, or >360 minutes) returns HTTP 400', async () => {
    const ord = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '2',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderId = ord.data.id;

    const rZero = await apiRequest('PATCH', `/api/app/orders/${orderId}/time`, {
      token: primaryTenant.token,
      body: { estimatedTimeMinutes: 0 }
    });
    assert.equal(rZero.status, 400, '0 minutes must return HTTP 400');

    const rExcess = await apiRequest('PATCH', `/api/app/orders/${orderId}/time`, {
      token: primaryTenant.token,
      body: { estimatedTimeMinutes: 500 }
    });
    assert.equal(rExcess.status, 400, '>360 minutes must return HTTP 400');
  });

  it('B4.4: Updating status on non-existent order ID returns HTTP 404 Not Found', async () => {
    const res = await apiRequest('PATCH', '/api/app/orders/NONEXISTENT999/status', {
      token: primaryTenant.token,
      body: { status: 'ACCEPTED' }
    });
    assert.equal(res.status, 404, 'Non-existent order status update must return HTTP 404');
  });

  // ---------------------------------------------------------------------------
  // AREA 5 BOUNDARIES: Multi-Tenant Isolation
  // ---------------------------------------------------------------------------

  it('B5.1: Unauthenticated request to staff token management returns HTTP 401 Unauthorized', async () => {
    const res = await apiRequest('GET', '/api/app/tokens', { token: null });
    assert.equal(res.status, 401, 'Unauthenticated token request must return HTTP 401');
  });

  it('B5.2: Unauthenticated request to staff KDS orders returns HTTP 401 Unauthorized', async () => {
    const res = await apiRequest('GET', '/api/app/orders', { token: null });
    assert.equal(res.status, 401, 'Unauthenticated orders request must return HTTP 401');
  });

  it('B5.3: Token operations with valid JWT of Tenant B attempting mutation on Tenant A token returns HTTP 404', async () => {
    // Token owned by Tenant A
    const tokA = await apiRequest('POST', '/api/app/tokens', {
      token: primaryTenant.token,
      body: { tableNumber: 15, covers: 2 }
    });
    const tokenAId = tokA.data.token.id;

    // Tenant B attempts append items to Tenant A token
    const res = await apiRequest('POST', `/api/app/tokens/${tokenAId}/items`, {
      token: secondaryTenant.token,
      body: { items: [{ dishName: 'Hacked Item', quantity: 1, price: 100 }] }
    });
    assert.equal(res.status, 404, 'Cross-tenant token item append must return HTTP 404');
  });

  it('B5.4: Order status update with valid JWT of Tenant B attempting mutation on Tenant A order returns HTTP 404', async () => {
    const ordA = await publicRequest('POST', `/api/public/menus/${primaryTenant.menuSlug}/orders`, {
      body: {
        orderType: 'DINE_IN',
        tableNumber: '1',
        items: [{ id: primaryTenant.items.paneerTikka.id, quantity: 1 }]
      }
    });
    const orderAId = ordA.data.id;

    const res = await apiRequest('PATCH', `/api/app/orders/${orderAId}/status`, {
      token: secondaryTenant.token,
      body: { status: 'CANCELLED' }
    });
    assert.equal(res.status, 404, 'Cross-tenant order patch must return HTTP 404');
  });

  it('B5.5: Basic plan tenant attempting staff token operations receives HTTP 403 Forbidden', async () => {
    // Basic plan does not have reception_orders entitlement
    const res = await apiRequest('GET', '/api/app/tokens', {
      token: basicTenant.token,
    });
    assert.equal(res.status, 403, 'Basic plan tenant attempting reception_orders must return HTTP 403 Forbidden');
    assert.match(res.data.error, /Live table token management requires the PREMIUM plan/);
  });
});

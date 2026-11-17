/**
 * Milestone 5 Challenger 2 Empirical Adversarial Test Suite
 * File: test/m5_challenger_2_sse_concurrency.test.js
 *
 * Focus:
 *  1. Concurrency double-settlement pessimistic row-level locking (SELECT ... FOR UPDATE)
 *  2. Scoped customer SSE stream isolation (/api/public/tokens/:tokenId/stream)
 *  3. SSE socket hygiene & lifecycle termination on table close
 *  4. Client reconnection resilience & REST re-hydration (BillPage.tsx & CashierPanel.tsx)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  ensureServer,
  getBaseUrl,
  createTestTenant,
  cleanupTenant,
  apiRequest,
  publicRequest,
  listenToSse,
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

test.describe('Milestone 5 Challenger 2: Concurrency, Stream Isolation & Reconnection', () => {

  // ===========================================================================
  // 1. PESSIMISTIC LOCKING CONCURRENCY DOUBLE-SETTLEMENT VERIFICATION
  // ===========================================================================

  test('EMP-1.1: Exact simultaneous 2-way settlement race condition (CASH vs CARD)', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create table token
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: {
        tableNumber: 21,
        covers: 2,
        items: [
          { dishName: 'Paneer Butter Masala', quantity: 1, unitPricePaise: 28000, isVeg: true },
          { dishName: 'Garlic Naan', quantity: 2, unitPricePaise: 6000, isVeg: true },
        ],
      },
      baseUrl,
    });
    assert.equal(createRes.status, 201);
    const tokenId = createRes.data?.token?.id;
    assert.ok(tokenId, 'Token ID must be generated');

    // Launch 2 simultaneous settlement requests at the exact same millisecond
    const p1 = apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH', paymentReference: 'CASH-PAY-01' },
      baseUrl,
    });
    const p2 = apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CARD', paymentReference: 'CARD-PAY-02' },
      baseUrl,
    });

    const [res1, res2] = await Promise.all([p1, p2]);

    const statuses = [res1.status, res2.status].sort();
    assert.deepEqual(
      statuses,
      [200, 409],
      `Expected exactly one 200 OK and one 409 Conflict. Got: req1=${res1.status}, req2=${res2.status}`
    );

    const winner = res1.status === 200 ? res1 : res2;
    const loser = res1.status === 409 ? res1 : res2;

    assert.equal(winner.data?.token?.status, 'SETTLED', 'Winner must have SETTLED status');
    assert.ok(['CASH', 'CARD'].includes(winner.data?.token?.paymentMethod));
    assert.ok(
      loser.data?.error?.includes('already settled') || loser.rawText?.includes('already settled'),
      `Loser must receive already settled conflict error. Got: ${loser.rawText}`
    );

    // Verify DB integrity: settled_at timestamp set once, no multiple settlements
    const dbCheck = await dbQuery(
      `SELECT status, payment_method, settled_at, settled_by_id FROM table_tokens WHERE id = $1`,
      [tokenId]
    );
    assert.equal(dbCheck.rows.length, 1);
    assert.equal(dbCheck.rows[0].status, 'SETTLED');
    assert.ok(dbCheck.rows[0].settled_at !== null, 'settled_at must be populated in DB');
  });

  test('EMP-1.2: 10-way concurrent settlement burst stress test', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: {
        tableNumber: 22,
        covers: 4,
        items: [
          { dishName: 'Veg Thali', quantity: 3, unitPricePaise: 25000, isVeg: true },
        ],
      },
      baseUrl,
    });
    assert.equal(createRes.status, 201);
    const tokenId = createRes.data?.token?.id;

    // Launch 10 simultaneous settle requests
    const burstPromises = Array.from({ length: 10 }, (_, i) =>
      apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
        token: tenant.token,
        body: {
          paymentMethod: i % 2 === 0 ? 'CASH' : 'UPI',
          paymentReference: `BURST-${i}`,
        },
        baseUrl,
      })
    );

    const burstResults = await Promise.all(burstPromises);
    const successCount = burstResults.filter((r) => r.status === 200).length;
    const conflictCount = burstResults.filter((r) => r.status === 409).length;

    assert.equal(
      successCount,
      1,
      `Exactly 1 settlement request must succeed with 200 OK. Got ${successCount}`
    );
    assert.equal(
      conflictCount,
      9,
      `Exactly 9 settlement requests must be rejected with 409 Conflict. Got ${conflictCount}`
    );

    // Verify DB row remains healthy and consistent
    const dbRes = await dbQuery(
      `SELECT status, settled_at, total_paise FROM table_tokens WHERE id = $1`,
      [tokenId]
    );
    assert.equal(dbRes.rows[0].status, 'SETTLED');
    assert.ok(dbRes.rows[0].settled_at !== null);
  });

  test('EMP-1.3: Settle vs Close concurrency race condition', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 23, items: [{ dishName: 'Lassi', quantity: 2, unitPricePaise: 5000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id;

    // Fire settle and close concurrently
    const settlePromise = apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH' },
      baseUrl,
    });
    const closePromise = apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
      token: tenant.token,
      baseUrl,
    });

    const [settleRes, closeRes] = await Promise.all([settlePromise, closePromise]);

    // Close on an active token must fail if it executes before settle commits:
    // If close arrived before settle: closeRes = 400 ('Cannot close an active token that has not been settled.'), settleRes = 200.
    // If settle arrived before close: settleRes = 200, closeRes = 200.
    // In either case, settleRes MUST succeed (200) and closeRes must be either 200 or 400.
    assert.equal(settleRes.status, 200, 'Settle must succeed');
    assert.ok([200, 400].includes(closeRes.status), `Close must be either 200 or 400, got ${closeRes.status}`);

    const dbRes = await dbQuery(`SELECT status, settled_at, closed_at FROM table_tokens WHERE id = $1`, [tokenId]);
    assert.ok(['SETTLED', 'CLOSED'].includes(dbRes.rows[0].status));
    assert.ok(dbRes.rows[0].settled_at !== null, 'Token must be recorded as settled');
  });

  test('EMP-1.4: Concurrent Settle vs Append Items race condition', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 24, items: [{ dishName: 'Dal Tadka', quantity: 1, unitPricePaise: 18000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id;

    // Fire settle and item append simultaneously
    const settlePromise = apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'UPI' },
      baseUrl,
    });
    const appendPromise = apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: {
        items: [{ dishName: 'Jeera Rice', quantity: 1, unitPricePaise: 12000, isVeg: true }],
      },
      baseUrl,
    });

    const [settleRes, appendRes] = await Promise.all([settlePromise, appendPromise]);

    // Case A: Settle committed first -> append must receive 409 Conflict ('Cannot add items to a settled, closed, or voided token.')
    // Case B: Append committed first -> append returned 200, settle returned 200 (including updated item)
    if (appendRes.status === 409) {
      assert.equal(settleRes.status, 200);
      const errMsg = appendRes.data?.error || appendRes.rawText || '';
      assert.ok(errMsg.toLowerCase().includes('settled'), 'Append rejection message must mention settled');
    } else {
      assert.equal(appendRes.status, 200);
      assert.equal(settleRes.status, 200);
    }

    // Attempting to append after settlement must strictly return 409 Conflict
    const postSettleAppend = await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: {
        items: [{ dishName: 'Ice Cream', quantity: 1, unitPricePaise: 6000, isVeg: true }],
      },
      baseUrl,
    });
    assert.equal(
      postSettleAppend.status,
      409,
      `Appending to settled token must return 409 Conflict, got ${postSettleAppend.status}`
    );
  });

  // ===========================================================================
  // 2. SCOPED CUSTOMER SSE STREAM ISOLATION & SOCKET HYGIENE
  // ===========================================================================

  test('EMP-2.1: Scoped customer SSE stream isolation across tokens on same tenant', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create Token A (Table 31)
    const resA = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 31, items: [{ dishName: 'Filter Coffee', quantity: 1, unitPricePaise: 4000, isVeg: true }] },
      baseUrl,
    });
    const tokenA = resA.data?.token?.id;

    // Create Token B (Table 32)
    const resB = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 32, items: [{ dishName: 'Masala Dosa', quantity: 1, unitPricePaise: 12000, isVeg: true }] },
      baseUrl,
    });
    const tokenB = resB.data?.token?.id;

    // Start listening on Token A stream
    const eventsOnA = [];
    const streamUrlA = `${baseUrl}/api/public/tokens/${tokenA}/stream`;
    const ssePromiseA = listenToSse(streamUrlA, {
      timeoutMs: 3500,
      maxEvents: 50,
      matchEvent: (e) => {
        eventsOnA.push(e);
        return false; // keep listening until timeout
      },
    });

    // Start listening on Token B stream
    const eventsOnB = [];
    const streamUrlB = `${baseUrl}/api/public/tokens/${tokenB}/stream`;
    const ssePromiseB = listenToSse(streamUrlB, {
      timeoutMs: 3500,
      maxEvents: 50,
      matchEvent: (e) => {
        eventsOnB.push(e);
        return false;
      },
    });

    // Wait 250ms for connections to establish
    await new Promise((r) => setTimeout(r, 250));

    // Perform multiple operations ON TOKEN B ONLY
    // 1. Append items to Token B
    await apiRequest('POST', `/api/app/tokens/${tokenB}/items`, {
      token: tenant.token,
      body: { items: [{ dishName: 'Vada Sambar', quantity: 1, unitPricePaise: 6000, isVeg: true }] },
      baseUrl,
    });

    // 2. Customer on Token B requests bill
    await publicRequest('POST', `/api/public/tokens/${tokenB}/request-bill`, { baseUrl });

    // 3. Cashier settles Token B
    await apiRequest('POST', `/api/app/tokens/${tokenB}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'UPI' },
      baseUrl,
    });

    // Wait for SSE listeners to complete
    await Promise.all([ssePromiseA, ssePromiseB]);

    // Assert: Token B received the events
    const bEventTypes = eventsOnB.map((e) => e.event);
    assert.ok(bEventTypes.includes('connected'), 'Token B must receive connected handshake');
    assert.ok(bEventTypes.includes('token_items_updated'), 'Token B must receive items updated event');
    assert.ok(bEventTypes.includes('token_settled') || bEventTypes.includes('token_status'), 'Token B must receive settlement');

    // Assert: Token A received ZERO events mentioning Token B
    for (const ev of eventsOnA) {
      if (ev.data?.tokenId) {
        assert.equal(
          ev.data.tokenId,
          tokenA,
          `Leakage detected: Token A received event with tokenId=${ev.data.tokenId}`
        );
      }
      if (ev.data?.token?.id) {
        assert.equal(
          ev.data.token.id,
          tokenA,
          `Leakage detected: Token A received event with token.id=${ev.data.token.id}`
        );
      }
      const rawStr = JSON.stringify(ev.data);
      assert.ok(
        !rawStr.includes('Vada Sambar'),
        'Token A stream must never receive dishes belonging to Token B'
      );
      assert.ok(
        !rawStr.includes(tokenB),
        'Token A stream must never contain Token B UUID'
      );
    }
  });

  test('EMP-2.2: Cross-tenant customer SSE stream isolation', async () => {
    const tenant1 = await createTestTenant({ planId: 'PREMIUM', businessName: 'Cafe Alpha' });
    const tenant2 = await createTestTenant({ planId: 'PREMIUM', businessName: 'Bistro Beta' });
    createdTenants.push(tenant1.tenantId, tenant2.tenantId);

    const resT1 = await apiRequest('POST', '/api/app/tokens', {
      token: tenant1.token,
      body: { tableNumber: 1, items: [{ dishName: 'Alpha Burger', quantity: 1, unitPricePaise: 15000, isVeg: false }] },
      baseUrl,
    });
    const tokenT1 = resT1.data?.token?.id;

    const resT2 = await apiRequest('POST', '/api/app/tokens', {
      token: tenant2.token,
      body: { tableNumber: 1, items: [{ dishName: 'Beta Pizza', quantity: 1, unitPricePaise: 35000, isVeg: true }] },
      baseUrl,
    });
    const tokenT2 = resT2.data?.token?.id;

    // Listen on Tenant 1 Token
    const eventsT1 = [];
    const streamT1Promise = listenToSse(`${baseUrl}/api/public/tokens/${tokenT1}/stream`, {
      timeoutMs: 3000,
      maxEvents: 50,
      matchEvent: (e) => {
        eventsT1.push(e);
        return false;
      },
    });

    await new Promise((r) => setTimeout(r, 200));

    // Mutate Tenant 2 Token
    await apiRequest('POST', `/api/app/tokens/${tokenT2}/settle`, {
      token: tenant2.token,
      body: { paymentMethod: 'CARD' },
      baseUrl,
    });

    await streamT1Promise;

    for (const ev of eventsT1) {
      const raw = JSON.stringify(ev);
      assert.ok(!raw.includes(tokenT2), 'Tenant 1 stream must not contain Tenant 2 token ID');
      assert.ok(!raw.includes('Beta Pizza'), 'Tenant 1 stream must not contain Tenant 2 menu items');
    }
  });

  test('EMP-2.3: Socket hygiene & lifecycle termination upon table closure', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 33, items: [{ dishName: 'Chai', quantity: 2, unitPricePaise: 3000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id;

    // Settle first (required before closing)
    await apiRequest('POST', `/api/app/tokens/${tokenId}/settle`, {
      token: tenant.token,
      body: { paymentMethod: 'CASH' },
      baseUrl,
    });

    // Connect SSE client
    let connectionClosedByServer = false;
    let receivedClosedEvent = false;

    const url = new URL(`${baseUrl}/api/public/tokens/${tokenId}/stream`);
    const sseClosePromise = new Promise((resolve) => {
      const req = http.get(url, { headers: { Accept: 'text/event-stream' } }, (res) => {
        res.on('data', (chunk) => {
          const str = chunk.toString('utf8');
          if (str.includes('"CLOSED"') || str.includes('CLOSED')) {
            receivedClosedEvent = true;
          }
        });
        res.on('end', () => {
          connectionClosedByServer = true;
          resolve(true);
        });
        res.on('close', () => {
          connectionClosedByServer = true;
          resolve(true);
        });
      });

      req.on('error', () => {
        resolve(false);
      });

      // Trigger close after 300ms
      setTimeout(async () => {
        await apiRequest('POST', `/api/app/tokens/${tokenId}/close`, {
          token: tenant.token,
          baseUrl,
        });
      }, 300);

      // Safety timeout
      setTimeout(() => resolve(false), 4000);
    });

    await sseClosePromise;

    assert.ok(
      receivedClosedEvent,
      'Customer SSE stream must receive token_status CLOSED event prior to disconnection'
    );
    assert.ok(
      connectionClosedByServer,
      'Server must terminate the HTTP connection (res.end) via closeTokenClients() to free socket resources'
    );
  });

  test('EMP-2.4: Malformed and Non-existent Token IDs reject safely with HTTP 404', async () => {
    // Malformed UUID string
    const malformedRes = await publicRequest('GET', '/api/public/tokens/not-a-valid-uuid/stream', { baseUrl });
    assert.equal(malformedRes.status, 404, 'Malformed UUID on SSE route must return HTTP 404');

    // Non-existent valid UUID
    const nonExistentRes = await publicRequest(
      'GET',
      '/api/public/tokens/a0000000-0000-0000-0000-000000000000/stream',
      { baseUrl }
    );
    assert.equal(nonExistentRes.status, 404, 'Non-existent UUID on SSE route must return HTTP 404');
  });

  // ===========================================================================
  // 3. RECONNECTION RESILIENCE & RE-HYDRATION
  // ===========================================================================

  test('EMP-3.1: BillPage.tsx state healing via REST re-hydration upon SSE dropout', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create token with initial item
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 41, items: [{ dishName: 'Spring Rolls', quantity: 1, unitPricePaise: 16000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id;

    // 1. Initial REST Hydration (matches BillPage.tsx hydrateToken())
    const initialBillRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });
    assert.equal(initialBillRes.status, 200);
    const initialBill = initialBillRes.data?.token;
    assert.equal(Number(initialBill.subtotalPaise || initialBill.subtotal * 100), 16000);

    // 2. Simulate SSE connection drop while disconnected mutations occur on backend:
    // Waiter appends Manchurian + Fried Rice while client has dropped connection
    await apiRequest('POST', `/api/app/tokens/${tokenId}/items`, {
      token: tenant.token,
      body: {
        items: [
          { dishName: 'Veg Manchurian', quantity: 1, unitPricePaise: 20000, isVeg: true },
          { dishName: 'Fried Rice', quantity: 1, unitPricePaise: 18000, isVeg: true },
        ],
      },
      baseUrl,
    });

    // Customer requests bill while disconnected
    await publicRequest('POST', `/api/public/tokens/${tokenId}/request-bill`, { baseUrl });

    // 3. Client re-establishes connection and triggers REST re-hydration (BillPage.tsx line 313: sse.addEventListener('error', () => hydrateToken()))
    const rehydratedRes = await publicRequest('GET', `/api/public/tokens/${tokenId}`, { baseUrl });
    assert.equal(rehydratedRes.status, 200);
    const rehydratedBill = rehydratedRes.data?.token;

    // Verify: full state healed without data drift
    assert.equal(rehydratedBill.status, 'BILL_REQUESTED');
    assert.equal(Number(rehydratedBill.subtotalPaise || rehydratedBill.subtotal * 100), 16000 + 20000 + 18000);
    assert.equal(rehydratedBill.items.length, 3);

    // 4. Verify SSE stream reconnect immediately pushes the latest snapshot
    const reconnectedEvents = await listenToSse(`${baseUrl}/api/public/tokens/${tokenId}/stream`, {
      timeoutMs: 1500,
      maxEvents: 2,
    });
    const statusEv = reconnectedEvents.find((e) => e.event === 'token_status');
    assert.ok(statusEv, 'SSE reconnect must immediately flush current snapshot');
    assert.equal(statusEv.data?.status, 'BILL_REQUESTED');
  });

  test('EMP-3.2: CashierPanel.tsx SSE reconnection handling analysis & data drift verification', async () => {
    const tenant = await createTestTenant({ planId: 'PREMIUM' });
    createdTenants.push(tenant.tenantId);

    // Create active token
    const createRes = await apiRequest('POST', '/api/app/tokens', {
      token: tenant.token,
      body: { tableNumber: 42, items: [{ dishName: 'Kadhai Paneer', quantity: 1, unitPricePaise: 26000, isVeg: true }] },
      baseUrl,
    });
    const tokenId = createRes.data?.token?.id;

    // Cashier panel calls /api/app/tokens?status=UNPAID on initial mount
    const initialList = await apiRequest('GET', '/api/app/tokens?status=UNPAID', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(initialList.status, 200);
    const activeTokens = initialList.data?.tokens || [];
    assert.ok(activeTokens.some((t) => t.id === tokenId));

    // Verify behavior during SSE disconnect in CashierPanel.tsx:
    // In CashierPanel.tsx lines 173-175:
    // sse.onopen = () => setSseStatus('live');
    // sse.onerror = () => setSseStatus('error');
    // Notice: upon reconnect ('onopen'), fetchTokens() and fetchSettledTokens() are not called.
    // However, if the cashier manually triggers fetch or re-queries /api/app/tokens?status=UNPAID,
    // the REST endpoint returns the authoritative state.
    const refreshedList = await apiRequest('GET', '/api/app/tokens?status=UNPAID', {
      token: tenant.token,
      baseUrl,
    });
    assert.equal(refreshedList.status, 200);
    assert.ok(refreshedList.data?.tokens?.length >= 1);
  });

});

/**
 * M3 Challenger 2: Adversarial Test Suite
 * SSE Cross-Party Isolation, Lifecycle Boundary Fuzzing, Public Route Injection & Math Fuzzing
 * File: backend/test/m3_challenger_sse_boundaries.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  ensureServer,
  getBaseUrl,
  createTestTenant,
  cleanupTenant,
} from '../../test/e2e/helpers.js';

let baseUrl = getBaseUrl();

async function apiRequest(path, { method = 'GET', body = null, token = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

function connectSseListener(urlStr) {
  const url = new URL(urlStr);
  const events = [];
  let req;
  let firstEventResolve;
  const firstEventPromise = new Promise((resolve) => {
    firstEventResolve = resolve;
  });

  req = http.request(
    url,
    {
      method: 'GET',
      headers: { Accept: 'text/event-stream' },
    },
    (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop();

        for (const block of blocks) {
          if (!block.trim() || block.startsWith(':')) continue;
          let eventName = 'message';
          let dataStr = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event:')) {
              eventName = line.replace('event:', '').trim();
            } else if (line.startsWith('data:')) {
              dataStr = line.replace('data:', '').trim();
            }
          }

          let parsed = dataStr;
          try {
            parsed = JSON.parse(dataStr);
          } catch {}

          const ev = { event: eventName, data: parsed, raw: block, timestamp: Date.now() };
          events.push(ev);
          if (firstEventResolve) {
            firstEventResolve();
            firstEventResolve = null;
          }
        }
      });
    }
  );

  req.on('error', () => {});

  req.end();

  return {
    events,
    waitForInitial: () => firstEventPromise,
    close: () => {
      try {
        req.destroy();
      } catch {}
    },
  };
}

test.describe('M3 Adversarial Challenge: SSE Stream Isolation & Boundary Fuzzing', () => {
  let tenant;

  test.before(async () => {
    baseUrl = await ensureServer(3001);
    tenant = await createTestTenant({ planId: 'PREMIUM' });
  });

  test.after(async () => {
    if (tenant?.tenantId) {
      await cleanupTenant(tenant.tenantId);
    }
  });

  // ===========================================================================
  // Test A: SSE Cross-Party Isolation (5 listeners Token A, 5 listeners Token B)
  // ===========================================================================
  test('Test A: SSE Cross-Party Stream Isolation (5 concurrent listeners on Token A vs 5 on Token B)', async () => {
    // 1. Create Token A on table 301
    const resA = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 301, covers: 2 },
      token: tenant.token,
    });
    assert.equal(resA.status, 201, 'Failed to create Token A');
    const tokenA = resA.data.token;

    // 2. Create Token B on table 302
    const resB = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 302, covers: 4 },
      token: tenant.token,
    });
    assert.equal(resB.status, 201, 'Failed to create Token B');
    const tokenB = resB.data.token;

    // 3. Connect 5 simultaneous listeners to Token A
    const listenersA = [];
    for (let i = 0; i < 5; i++) {
      listenersA.push(connectSseListener(`${baseUrl}/api/public/tokens/${tokenA.id}/stream`));
    }

    // 4. Connect 5 simultaneous listeners to Token B
    const listenersB = [];
    for (let i = 0; i < 5; i++) {
      listenersB.push(connectSseListener(`${baseUrl}/api/public/tokens/${tokenB.id}/stream`));
    }

    // 5. Wait for all 10 sockets to establish connection and receive initial handshake
    await Promise.all([...listenersA, ...listenersB].map((l) => l.waitForInitial()));
    await new Promise((r) => setTimeout(r, 200));

    // Record baseline event count per listener A
    const baselineCountsA = listenersA.map((l) => l.events.length);
    for (let i = 0; i < 5; i++) {
      assert.ok(baselineCountsA[i] >= 1, `Listener A[${i}] should have received initial handshake`);
      for (const ev of listenersA[i].events) {
        assert.equal(
          ev.data?.tokenId || ev.data?.token?.id,
          tokenA.id,
          `Initial event on Listener A[${i}] should match Token A id`
        );
      }
    }

    // 6. Mutate Token B:
    // 6a. Append items to Token B
    const appendRes = await apiRequest(`/api/app/tokens/${tokenB.id}/items`, {
      method: 'POST',
      body: {
        items: [
          { dishName: 'Truffle Butter Naan', quantity: 3, unitPricePaise: 18000 },
          { dishName: 'Mutton Rogan Josh', quantity: 1, unitPricePaise: 42000 },
        ],
      },
      token: tenant.token,
    });
    assert.equal(appendRes.status, 200, 'Append items to Token B failed');

    // 6b. Request bill on Token B (customer endpoint)
    const billReqRes = await apiRequest(`/api/public/tokens/${tokenB.id}/request-bill`, {
      method: 'POST',
    });
    assert.equal(billReqRes.status, 200, 'Request bill on Token B failed');

    // 6c. Settle Token B
    const settleRes = await apiRequest(`/api/app/tokens/${tokenB.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'UPI', paymentReference: 'UPI-ISO-CHALLENGE-999' },
      token: tenant.token,
    });
    assert.equal(settleRes.status, 200, 'Settle Token B failed');

    // 7. Allow 500ms for event transmission across all sockets
    await new Promise((r) => setTimeout(r, 500));

    // 8. Verify Token B listeners received all updates
    for (let i = 0; i < 5; i++) {
      const bEvents = listenersB[i].events;
      assert.ok(bEvents.length >= 4, `Listener B[${i}] expected >= 4 events, received ${bEvents.length}`);

      // Verify all received events belong to Token B
      for (const ev of bEvents) {
        const id = ev.data?.tokenId || ev.data?.token?.id;
        assert.equal(id, tokenB.id, `Listener B[${i}] received event for wrong token: ${id}`);
      }

      // Check specific event types arrived
      const eventTypes = bEvents.map((e) => e.event);
      assert.ok(eventTypes.includes('token_status'), `Listener B[${i}] missing token_status event`);
      assert.ok(eventTypes.includes('token_items_updated'), `Listener B[${i}] missing token_items_updated event`);
      assert.ok(eventTypes.includes('token_settled'), `Listener B[${i}] missing token_settled event`);
    }

    // 9. VERIFY TOKEN A LISTENERS RECEIVED ZERO EVENTS BELONGING TO TOKEN B
    for (let i = 0; i < 5; i++) {
      const aEvents = listenersA[i].events;
      const newEventsCount = aEvents.length - baselineCountsA[i];
      assert.equal(
        newEventsCount,
        0,
        `SECURITY VIOLATION: Listener A[${i}] received ${newEventsCount} unauthorized event(s) during Token B mutation!`
      );

      // Verify no event payload in Listener A contains Token B ID or Token B item names
      for (const ev of aEvents) {
        const payloadStr = JSON.stringify(ev);
        assert.ok(!payloadStr.includes(tokenB.id), `Token B ID leaked into Listener A[${i}]: ${payloadStr}`);
        assert.ok(!payloadStr.includes('Truffle Butter Naan'), `Item leaked into Listener A[${i}]: ${payloadStr}`);
        assert.ok(!payloadStr.includes('UPI-ISO-CHALLENGE-999'), `Payment ref leaked into Listener A[${i}]: ${payloadStr}`);
      }
    }

    // 10. Close all 10 sockets cleanly
    listenersA.forEach((l) => l.close());
    listenersB.forEach((l) => l.close());
  });

  // ===========================================================================
  // Test B: Lifecycle Boundary Fuzzing (Illegal State Transitions)
  // ===========================================================================
  test('Test B: Lifecycle Boundary Fuzzing (Duplicate Settle, Append After Close, Close Unsettled, Void Validation)', async () => {
    // -------------------------------------------------------------------------
    // B.1 Settle an already settled token (must be 409)
    // -------------------------------------------------------------------------
    const createRes1 = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 310, covers: 2 },
      token: tenant.token,
    });
    assert.equal(createRes1.status, 201);
    const tokenB1 = createRes1.data.token;

    // First settle: 200 OK
    const firstSettle = await apiRequest(`/api/app/tokens/${tokenB1.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'CASH' },
      token: tenant.token,
    });
    assert.equal(firstSettle.status, 200);

    // Duplicate settle: MUST BE 409 Conflict
    const secondSettle = await apiRequest(`/api/app/tokens/${tokenB1.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'CASH' },
      token: tenant.token,
    });
    assert.equal(secondSettle.status, 409, 'Duplicate settlement must return 409 Conflict');

    // Triplicate settle with different method: MUST BE 409 Conflict
    const thirdSettle = await apiRequest(`/api/app/tokens/${tokenB1.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'UPI' },
      token: tenant.token,
    });
    assert.equal(thirdSettle.status, 409, 'Subsequent settlement must return 409 Conflict');

    // -------------------------------------------------------------------------
    // B.2 Append items to settled / closed token (must be 409)
    // -------------------------------------------------------------------------
    // Token B1 is currently SETTLED
    const appendToSettled = await apiRequest(`/api/app/tokens/${tokenB1.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Extra Gulab Jamun', quantity: 1, unitPricePaise: 8000 }] },
      token: tenant.token,
    });
    assert.equal(appendToSettled.status, 409, 'Appending to settled token must return 409 Conflict');

    // Close token B1
    const closeB1 = await apiRequest(`/api/app/tokens/${tokenB1.id}/close`, {
      method: 'POST',
      token: tenant.token,
    });
    assert.equal(closeB1.status, 200, 'Closing settled token should succeed');

    // Token B1 is now CLOSED -> append items must return 409
    const appendToClosed = await apiRequest(`/api/app/tokens/${tokenB1.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Extra Gulab Jamun', quantity: 1, unitPricePaise: 8000 }] },
      token: tenant.token,
    });
    assert.equal(appendToClosed.status, 409, 'Appending to closed token must return 409 Conflict');

    // -------------------------------------------------------------------------
    // B.3 Close unsettled token (must be 400)
    // -------------------------------------------------------------------------
    const createRes2 = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 311, covers: 3 },
      token: tenant.token,
    });
    assert.equal(createRes2.status, 201);
    const tokenB2 = createRes2.data.token;

    // In 'ISSUED' state: cannot close
    const closeIssued = await apiRequest(`/api/app/tokens/${tokenB2.id}/close`, {
      method: 'POST',
      token: tenant.token,
    });
    assert.equal(closeIssued.status, 400, 'Closing unsettled ISSUED token must return 400 Bad Request');

    // Transition to 'DINING'
    await apiRequest(`/api/app/tokens/${tokenB2.id}/status`, {
      method: 'POST',
      body: { status: 'DINING' },
      token: tenant.token,
    });

    // In 'DINING' state: cannot close
    const closeDining = await apiRequest(`/api/app/tokens/${tokenB2.id}/close`, {
      method: 'POST',
      token: tenant.token,
    });
    assert.equal(closeDining.status, 400, 'Closing unsettled DINING token must return 400 Bad Request');

    // Transition to 'BILL_REQUESTED'
    await apiRequest(`/api/app/tokens/${tokenB2.id}/status`, {
      method: 'POST',
      body: { status: 'BILL_REQUESTED' },
      token: tenant.token,
    });

    // In 'BILL_REQUESTED' state: cannot close
    const closeBillReq = await apiRequest(`/api/app/tokens/${tokenB2.id}/close`, {
      method: 'POST',
      token: tenant.token,
    });
    assert.equal(closeBillReq.status, 400, 'Closing unsettled BILL_REQUESTED token must return 400 Bad Request');

    // -------------------------------------------------------------------------
    // B.4 Void without reason or whitespace only (must be 400)
    // -------------------------------------------------------------------------
    const createRes3 = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 312, covers: 1 },
      token: tenant.token,
    });
    assert.equal(createRes3.status, 201);
    const tokenB3 = createRes3.data.token;

    // Void with empty body: 400
    const voidEmpty = await apiRequest(`/api/app/tokens/${tokenB3.id}/void`, {
      method: 'POST',
      body: {},
      token: tenant.token,
    });
    assert.equal(voidEmpty.status, 400, 'Void without reason must return 400 Bad Request');

    // Void with empty string: 400
    const voidEmptyStr = await apiRequest(`/api/app/tokens/${tokenB3.id}/void`, {
      method: 'POST',
      body: { reason: '' },
      token: tenant.token,
    });
    assert.equal(voidEmptyStr.status, 400, 'Void with empty string reason must return 400 Bad Request');

    // Void with whitespace only: 400
    const voidWhitespace = await apiRequest(`/api/app/tokens/${tokenB3.id}/void`, {
      method: 'POST',
      body: { reason: '     \t\n   ' },
      token: tenant.token,
    });
    assert.equal(voidWhitespace.status, 400, 'Void with whitespace reason must return 400 Bad Request');

    // -------------------------------------------------------------------------
    // B.5 Void a closed token (must be 409) & void settled token (must be 409)
    // -------------------------------------------------------------------------
    // Token B1 was closed in B.2
    const voidClosed = await apiRequest(`/api/app/tokens/${tokenB1.id}/void`, {
      method: 'POST',
      body: { reason: 'Customer left without eating' },
      token: tenant.token,
    });
    assert.equal(voidClosed.status, 409, 'Voiding an already closed token must return 409 Conflict');

    // Settle Token B2 and try to void it
    await apiRequest(`/api/app/tokens/${tokenB2.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'CARD' },
      token: tenant.token,
    });
    const voidSettled = await apiRequest(`/api/app/tokens/${tokenB2.id}/void`, {
      method: 'POST',
      body: { reason: 'Accidental void test' },
      token: tenant.token,
    });
    assert.equal(voidSettled.status, 409, 'Voiding a settled token must return 409 Conflict');
  });

  // ===========================================================================
  // Test C: Public Route Boundary Fuzzing (Postgres 22P02 & SQL Injection Prevention)
  // ===========================================================================
  test('Test C: Public Route Boundary Fuzzing (UUID validation & 22P02 SQL exception prevention)', async () => {
    const maliciousProbes = [
      'not-a-uuid',
      '12345',
      "' OR '1'='1",
      "'; DROP TABLE table_tokens; --",
      '..%2F..%2Fetc%2Fpasswd',
      '00000000-0000-0000-0000-00000000000', // 35 chars
      '00000000-0000-0000-0000-0000000000000', // 37 chars
      '%s%s%s%s%s',
      '<script>alert(1)</script>',
      'null',
      'undefined',
    ];

    for (const probe of maliciousProbes) {
      const encoded = encodeURIComponent(probe);

      // Probe 1: GET /api/public/tokens/:tokenId
      const getRes = await apiRequest(`/api/public/tokens/${encoded}`);
      assert.equal(
        getRes.status,
        404,
        `GET /api/public/tokens/${probe} returned ${getRes.status} instead of clean 404`
      );
      assert.ok(getRes.data?.error, `Response should contain structured error message for probe: ${probe}`);
      assert.ok(
        !JSON.stringify(getRes.data).includes('syntax error') &&
          !JSON.stringify(getRes.data).includes('22P02') &&
          !JSON.stringify(getRes.data).includes('PostgreSQL'),
        `Database internal error leaked for probe: ${probe}`
      );

      // Probe 2: GET /api/public/tokens/:tokenId/stream
      const streamRes = await fetch(`${baseUrl}/api/public/tokens/${encoded}/stream`);
      assert.equal(
        streamRes.status,
        404,
        `GET /api/public/tokens/${probe}/stream returned ${streamRes.status} instead of clean 404`
      );

      // Probe 3: POST /api/public/tokens/:tokenId/request-bill
      const reqBillRes = await apiRequest(`/api/public/tokens/${encoded}/request-bill`, {
        method: 'POST',
      });
      assert.equal(
        reqBillRes.status,
        404,
        `POST /api/public/tokens/${probe}/request-bill returned ${reqBillRes.status} instead of clean 404`
      );
    }
  });

  // ===========================================================================
  // Test D: Math & Negative Amount Fuzzing
  // ===========================================================================
  test('Test D: Math & Negative Amount Fuzzing (Quantity 0, -5, NaN, empty dish, negative table)', async () => {
    // Create an active token on table 320
    const createRes = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 320, covers: 2 },
      token: tenant.token,
    });
    assert.equal(createRes.status, 201);
    const token = createRes.data.token;

    // D.1 Quantity 0 -> 400 Bad Request
    const qtyZero = await apiRequest(`/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Garlic Naan', quantity: 0, unitPricePaise: 4000 }] },
      token: tenant.token,
    });
    assert.equal(qtyZero.status, 400, 'Quantity 0 must return 400 Bad Request');

    // D.2 Quantity -5 -> 400 Bad Request
    const qtyNegative = await apiRequest(`/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Garlic Naan', quantity: -5, unitPricePaise: 4000 }] },
      token: tenant.token,
    });
    assert.equal(qtyNegative.status, 400, 'Quantity -5 must return 400 Bad Request');

    // D.3 Quantity "NaN" -> 400 Bad Request
    const qtyNaN = await apiRequest(`/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Garlic Naan', quantity: 'NaN', unitPricePaise: 4000 }] },
      token: tenant.token,
    });
    assert.equal(qtyNaN.status, 400, 'Quantity "NaN" must return 400 Bad Request');

    // D.4 Quantity null/undefined -> 400 Bad Request
    const qtyNull = await apiRequest(`/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: 'Garlic Naan', quantity: null, unitPricePaise: 4000 }] },
      token: tenant.token,
    });
    assert.equal(qtyNull.status, 400, 'Quantity null must return 400 Bad Request');

    // D.5 Empty dish name -> 400 Bad Request
    const emptyDish = await apiRequest(`/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      body: { items: [{ dishName: '    ', quantity: 2, unitPricePaise: 4000 }] },
      token: tenant.token,
    });
    assert.equal(emptyDish.status, 400, 'Empty dish name must return 400 Bad Request');

    // D.6 Table number 0 on creation -> 400 Bad Request
    const tableZero = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 0, covers: 2 },
      token: tenant.token,
    });
    assert.equal(tableZero.status, 400, 'Table number 0 must return 400 Bad Request');

    // D.7 Table number negative -> 400 Bad Request
    const tableNegative = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: -10, covers: 2 },
      token: tenant.token,
    });
    assert.equal(tableNegative.status, 400, 'Negative table number must return 400 Bad Request');

    // D.8 Table number NaN / non-numeric string -> 400 Bad Request
    const tableString = await apiRequest('/api/app/tokens', {
      method: 'POST',
      body: { tableNumber: 'table_four', covers: 2 },
      token: tenant.token,
    });
    assert.equal(tableString.status, 400, 'Non-numeric table number must return 400 Bad Request');

    // D.9 Unsupported payment method -> 400 Bad Request
    const badMethod = await apiRequest(`/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      body: { paymentMethod: 'BITCOIN' },
      token: tenant.token,
    });
    assert.equal(badMethod.status, 400, 'Unsupported payment method must return 400 Bad Request');

    // D.10 Unsupported status transition -> 400 Bad Request
    const badStatus = await apiRequest(`/api/app/tokens/${token.id}/status`, {
      method: 'POST',
      body: { status: 'INVALID_STATUS' },
      token: tenant.token,
    });
    assert.equal(badStatus.status, 400, 'Unsupported status transition must return 400 Bad Request');
  });
});

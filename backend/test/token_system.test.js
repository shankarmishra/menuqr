/**
 * System 2 Table Token System — Automated Unit & Integration Test Suite
 * File: backend/test/token_system.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { pool, connectDB } from '../db.js';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { ensureServer, stopServer } from '../../test/e2e/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
let baseUrl = process.env.TEST_API_URL || 'http://localhost:3001';

function createAuthToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role || 'RESTAURANT_OWNER', tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function seedTestTenant(planId = 'PREMIUM', extraClient = {}) {
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-tok-${runId}`;
  const userId = `user-tok-${runId}`;
  const reviewUrl = extraClient.googleReviewUrl || 'https://g.page/r/test-review';

  try {
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_review_url TEXT');
  } catch {}

  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, google_review_url)
     VALUES ($1, $2, $3, $4, 'active', 'Maharashtra', $5)`,
    [
      tenantId,
      `pub-${runId}`,
      extraClient.businessName || `Dhaba ${runId}`,
      `slug-${runId}`,
      reviewUrl,
    ]
  );

  try {
    await pool.query(
      `INSERT INTO tenant_google_reviews (tenant_id, review_url)
       VALUES ($1, $2)
       ON CONFLICT (tenant_id) DO UPDATE SET review_url = EXCLUDED.review_url`,
      [tenantId, reviewUrl]
    );
  } catch {}

  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state)
     VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')`,
    [userId, `owner-${runId}@example.com`, tenantId]
  );

  await pool.query(
    `INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at)
     VALUES ($1, $2, $3, 'ACTIVE', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days')`,
    [`sub-${runId}`, tenantId, planId.toUpperCase()]
  );

  const token = createAuthToken({ id: userId, tenantId, role: 'RESTAURANT_OWNER' });
  return { tenantId, userId, token, runId };
}

async function cleanupTestTenant(tenantId) {
  if (!tenantId) return;
  try {
    await pool.query(`DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)`, [tenantId]);
    await pool.query(`DELETE FROM table_tokens WHERE tenant_id = $1`, [tenantId]);
    try { await pool.query(`DELETE FROM tenant_google_reviews WHERE tenant_id = $1`, [tenantId]); } catch {}
    await pool.query(`DELETE FROM subscriptions WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM users WHERE tenant_id = $1`, [tenantId]);
    await pool.query(`DELETE FROM clients WHERE id = $1`, [tenantId]);
  } catch (err) {
    console.warn(`[cleanupTestTenant] Error cleaning ${tenantId}:`, err.message);
  }
}

function listenToSse(urlStr, { timeoutMs = 3000, matchEvent = null, maxEvents = 1 } = {}) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const events = [];
    let timer = null;

    const req = http.request(
      url,
      {
        method: 'GET',
        headers: { Accept: 'text/event-stream' }, agent: false,
      },
      (res) => {
        let buffer = '';

        res.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
          const lines = buffer.split('\n\n');
          buffer = lines.pop();

          for (const rawEvent of lines) {
            if (!rawEvent.trim() || rawEvent.startsWith(':')) continue;
            let eventName = 'message';
            let dataStr = '';

            for (const line of rawEvent.split('\n')) {
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

            const ev = { event: eventName, data: parsed };
            events.push(ev);

            if (matchEvent && matchEvent(ev)) {
              cleanupAndFinish();
              return;
            }
            if (events.length >= maxEvents) {
              cleanupAndFinish();
              return;
            }
          }
        });

        res.on('end', cleanupAndFinish);
        res.on('error', cleanupAndFinish);
      }
    );

    req.on('error', cleanupAndFinish);
    req.end();

    timer = setTimeout(cleanupAndFinish, timeoutMs);

    function cleanupAndFinish() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      try {
        req.destroy();
      } catch {}
      resolve(events);
    }
  });
}

test.describe('System 2: Token System Comprehensive Suite', () => {
  let premiumTenant;
  let basicTenant;

  test.before(async () => {
    baseUrl = await ensureServer();
    await connectDB(process.env.DATABASE_URL);
    premiumTenant = await seedTestTenant('PREMIUM');
    basicTenant = await seedTestTenant('BASIC');
  });

  test.after(async () => {
    await cleanupTestTenant(premiumTenant?.tenantId);
    await cleanupTestTenant(basicTenant?.tenantId);
    await stopServer();
    try { await pool.end(); } catch {}
    process.exit(0);
  });

  test('1. Entitlement check: Non-PREMIUM tenant receives 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${basicTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 1 }),
    });
    assert.equal(res.status, 403, 'BASIC plan must not access token endpoints');
    const data = await res.json();
    assert.ok(data.error.includes('higher plan') || data.error.includes('PREMIUM'));
  });

  test('2. Sequential daily numbering and integer paise billing math (5% GST)', async () => {
    const res1 = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 10,
        covers: 2,
        items: [
          { dishName: 'Paneer Tikka', quantity: 2, unitPricePaise: 25000, isVeg: true },
        ],
      }),
    });
    assert.equal(res1.status, 201);
    const data1 = await res1.json();
    const token1 = data1.token;

    assert.equal(token1.tokenNumber, 1);
    assert.equal(token1.tokenCode, '#001');
    assert.equal(token1.tableNumber, 10);
    assert.equal(token1.subtotalPaise, 50000); // 2 * 25000
    assert.equal(token1.taxPaise, 2500); // 5% of 50000
    assert.equal(token1.totalPaise, 52500); // 50000 + 2500
    assert.equal(token1.status, 'ISSUED');

    // Create second token on different table
    const res2 = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 11,
        covers: 4,
        items: [
          { dishName: 'Dal Makhani', quantity: 1, unitPricePaise: 30000, isVeg: true },
        ],
      }),
    });
    assert.equal(res2.status, 201);
    const data2 = await res2.json();
    const token2 = data2.token;

    assert.equal(token2.tokenNumber, 2);
    assert.equal(token2.tokenCode, '#002');
    assert.equal(token2.subtotalPaise, 30000);
    assert.equal(token2.taxPaise, 1500);
    assert.equal(token2.totalPaise, 31500);
  });

  test('3. Table collision: Opening second session on active table returns 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 10, // Table 10 is already active from test 2
        covers: 2,
      }),
    });
    assert.equal(res.status, 409, 'Expected 409 Conflict on active table session collision');
  });

  test('4. Appending items recalculates subtotal, 5% tax and grand total', async () => {
    // Open Table 20
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 20,
        items: [{ dishName: 'Tomato Soup', quantity: 2, unitPricePaise: 12000, isVeg: true }],
      }),
    });
    const { token } = await createRes.json();
    assert.equal(token.subtotalPaise, 24000);

    // Append Garlic Naan (3 @ 6000 = 18000)
    const appendRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        dishName: 'Garlic Naan',
        quantity: 3,
        unitPricePaise: 6000,
        isVeg: true,
      }),
    });
    assert.equal(appendRes.status, 200);
    const updated = (await appendRes.json()).token;

    // Subtotal: 24000 + 18000 = 42000 paise
    assert.equal(updated.subtotalPaise, 42000);
    // Tax: round(42000 * 0.05) = 2100 paise
    assert.equal(updated.taxPaise, 2100);
    // Total: 42000 + 2100 = 44100 paise
    assert.equal(updated.totalPaise, 44100);
    assert.equal(updated.items.length, 2);
  });

  test('5. Concurrency double-settle guard returns 409 Conflict on duplicate settlement', async () => {
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 30,
        items: [{ dishName: 'Biryani', quantity: 1, unitPricePaise: 35000 }],
      }),
    });
    const { token } = await createRes.json();

    // First settle
    const settle1 = await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CASH' }),
    });
    assert.equal(settle1.status, 200);
    const settledToken = (await settle1.json()).token;
    assert.equal(settledToken.status, 'SETTLED');
    assert.ok(settledToken.settledAt);

    // Second settle attempt must trigger 409 Conflict
    const settle2 = await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CARD' }),
    });
    assert.equal(settle2.status, 409, 'Duplicate settlement must return 409');
  });

  test('6. Payment method validation rejects unsupported methods with 400 Bad Request', async () => {
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 31 }),
    });
    const { token } = await createRes.json();

    const settleRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'BITCOIN' }),
    });
    assert.equal(settleRes.status, 400);
  });

  test('7. Appending items to settled or closed token returns 409 Conflict', async () => {
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 32, items: [{ dishName: 'Lassi', quantity: 1, unitPricePaise: 5000 }] }),
    });
    const { token } = await createRes.json();

    await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'UPI' }),
    });

    const addRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ dishName: 'Extra Sweet', quantity: 1, unitPricePaise: 2000 }),
    });
    assert.equal(addRes.status, 409);
  });

  test('8. Closing unsettled token returns 400 Bad Request; closing settled token frees table', async () => {
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 40 }),
    });
    const { token } = await createRes.json();

    // Closing unsettled token -> 400
    const prematureClose = await fetch(`${baseUrl}/api/app/tokens/${token.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
    });
    assert.equal(prematureClose.status, 400);

    // Settle first
    await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CASH' }),
    });

    // Close now -> 200
    const closeRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
    });
    assert.equal(closeRes.status, 200);
    const closed = (await closeRes.json()).token;
    assert.equal(closed.status, 'CLOSED');
    assert.ok(closed.closedAt);

    // Re-open Table 40 immediately -> must succeed cleanly
    const reopenRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 40 }),
    });
    assert.equal(reopenRes.status, 201, 'Table 40 must be freed for next party');
  });

  test('9. Voiding token requires reason string; returns 400 if empty, 409 if closed', async () => {
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 50 }),
    });
    const { token } = await createRes.json();

    // Empty reason -> 400
    const voidEmpty = await fetch(`${baseUrl}/api/app/tokens/${token.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ reason: '   ' }),
    });
    assert.equal(voidEmpty.status, 400);

    // Valid void -> 200
    const voidValid = await fetch(`${baseUrl}/api/app/tokens/${token.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ reason: 'Guest changed mind' }),
    });
    assert.equal(voidValid.status, 200);

    // Close voided token -> 200
    const closeRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
    });
    assert.equal(closeRes.status, 200);

    // Void already closed token -> 409
    const voidClosed = await fetch(`${baseUrl}/api/app/tokens/${token.id}/void`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ reason: 'Try again' }),
    });
    assert.equal(voidClosed.status, 409);
  });

  test('10. Public bill API returns 404 on malformed UUID and non-existent IDs', async () => {
    const res1 = await fetch(`${baseUrl}/api/public/tokens/not-a-uuid`);
    assert.equal(res1.status, 404);

    const res2 = await fetch(`${baseUrl}/api/public/tokens/tok_0000000000000000`);
    assert.equal(res2.status, 404);

    const res3 = await fetch(`${baseUrl}/api/public/tokens/${randomUUID()}`);
    assert.equal(res3.status, 404);
  });

  test('11. Customer SSE Stream isolation: Client A on Token A never receives events from Token B', async () => {
    // Open Table 61
    const resA = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 61 }),
    });
    const tokenA = (await resA.json()).token;

    // Open Table 62
    const resB = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 62 }),
    });
    const tokenB = (await resB.json()).token;

    // Connect customer SSE stream on Token A
    const ssePromiseA = listenToSse(`${baseUrl}/api/public/tokens/${tokenA.id}/stream`, {
      timeoutMs: 2500,
      matchEvent: (e) => e.event === 'token_settled',
    });

    await new Promise((r) => setTimeout(r, 200));

    // Settle Token B
    await fetch(`${baseUrl}/api/app/tokens/${tokenB.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${premiumTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CASH' }),
    });

    const eventsOnA = await ssePromiseA;

    // Assert that Token A never received any event mentioning Token B
    for (const ev of eventsOnA) {
      if (ev.data?.tokenId) {
        assert.notEqual(ev.data.tokenId, tokenB.id, 'Token A stream must never receive events for Token B');
      }
    }
  });
});

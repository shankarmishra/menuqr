/**
 * Milestone 3 Adversarial Stress & Concurrency Challenger Test Suite
 * File: backend/test/m3_challenger_concurrency.test.js
 * 
 * Verifies System 2 Live Table Token lifecycle under extreme concurrency,
 * race conditions, high-burst contention, and stress scenarios:
 *   - Concurrency Test A: Double Settlement Race (20-50 simultaneous requests)
 *   - Concurrency Test B: Daily Token Numbering Contention (20 simultaneous creations)
 *   - Concurrency Test C: Table Contention & Rapid Turnover (Collision guard + re-open)
 *   - Concurrency Test D: Concurrent Line Item Appends (Zero lost updates)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { pool, connectDB } from '../db.js';
import { ensureServer } from '../../test/e2e/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
let baseUrl = process.env.TEST_API_URL || 'http://localhost:3001';

function createAuthToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role || 'RESTAURANT_OWNER', tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function seedTestTenant(planId = 'PREMIUM') {
  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-concur-${runId}`;
  const userId = `user-concur-${runId}`;
  const reviewUrl = 'https://g.page/r/test-concurrency-review';

  try {
    await pool.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_review_url TEXT');
  } catch {}

  await pool.query(
    `INSERT INTO clients (id, public_id, business_name, menu_slug, status, state, google_review_url)
     VALUES ($1, $2, $3, $4, 'active', 'Maharashtra', $5)`,
    [tenantId, `pub-${runId}`, `Concurrency Diner ${runId}`, `slug-${runId}`, reviewUrl]
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

test.describe('Milestone 3 Challenger: Concurrency & High-Burst Stress Test Suite', () => {
  let primaryTenant;
  let secondaryTenant;

  test.before(async () => {
    baseUrl = await ensureServer();
    await connectDB(process.env.DATABASE_URL);
    primaryTenant = await seedTestTenant('PREMIUM');
    secondaryTenant = await seedTestTenant('PREMIUM');
  });

  test.after(async () => {
    await cleanupTestTenant(primaryTenant?.tenantId);
    await cleanupTestTenant(secondaryTenant?.tenantId);
  });

  // =========================================================================
  // TEST A1: Double Settlement Race (30 simultaneous requests with mixed payment methods)
  // =========================================================================
  test('Concurrency Test A1: Double Settlement Race (30 simultaneous requests with mixed payment methods)', async () => {
    // 1. Create an active dining session
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 1,
        covers: 2,
        items: [
          { dishName: 'Butter Chicken', quantity: 1, unitPricePaise: 35000 },
          { dishName: 'Garlic Naan', quantity: 2, unitPricePaise: 6000 },
        ],
      }),
    });
    assert.equal(createRes.status, 201, 'Token creation should succeed');
    const { token } = await createRes.json();
    assert.equal(token.status, 'ISSUED');

    // 2. Fire 30 concurrent settlement requests with mixed payment methods
    const CONCURRENCY_COUNT = 30;
    const paymentMethods = ['CASH', 'UPI', 'CARD'];
    const settlementPromises = [];

    for (let i = 0; i < CONCURRENCY_COUNT; i++) {
      const method = paymentMethods[i % paymentMethods.length];
      settlementPromises.push(
        fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${primaryTenant.token}`,
          },
          body: JSON.stringify({
            paymentMethod: method,
            paymentReference: `REF-RACE-${i}`,
          }),
        }).then(async (res) => {
          let body = {};
          try { body = await res.json(); } catch {}
          return {
            index: i,
            method,
            status: res.status,
            body,
          };
        })
      );
    }

    const results = await Promise.all(settlementPromises);

    // 3. Analyze responses
    const successfulResponses = results.filter((r) => r.status === 200);
    const conflictResponses = results.filter((r) => r.status === 409);
    const errorResponses = results.filter((r) => r.status >= 500);
    const unexpectedResponses = results.filter((r) => r.status !== 200 && r.status !== 409);

    console.log(`[Test A1] Out of ${CONCURRENCY_COUNT} concurrent settlements:`);
    console.log(`  - HTTP 200 (Success): ${successfulResponses.length}`);
    console.log(`  - HTTP 409 (Conflict): ${conflictResponses.length}`);
    console.log(`  - HTTP 5xx (Errors): ${errorResponses.length}`);
    console.log(`  - Unexpected: ${unexpectedResponses.length}`);

    assert.equal(successfulResponses.length, 1, 'EXACTLY 1 settlement request MUST succeed (HTTP 200)');
    assert.equal(conflictResponses.length, CONCURRENCY_COUNT - 1, 'ALL OTHER requests MUST receive HTTP 409 Conflict');
    assert.equal(errorResponses.length, 0, 'Zero 5xx server errors permitted under concurrency race');
    assert.equal(unexpectedResponses.length, 0, 'Zero unexpected HTTP statuses permitted');

    // Verify the winning response structure
    const winner = successfulResponses[0];
    assert.equal(winner.body.success, true);
    assert.equal(winner.body.token.status, 'SETTLED');
    assert.ok(winner.body.token.settledAt, 'Winning token must have settledAt timestamp');
    assert.ok(['CASH', 'UPI', 'CARD'].includes(winner.body.token.paymentMethod));

    // Verify conflict responses have helpful error message
    for (const conflict of conflictResponses) {
      assert.ok(
        conflict.body.error && conflict.body.error.toLowerCase().includes('settled'),
        `Conflict response should state token is settled, got: ${conflict.body.error}`
      );
    }

    // 4. Verify database state directly
    const dbRes = await pool.query(
      `SELECT id, status, payment_method, settled_at, settled_by_id FROM table_tokens WHERE id = $1`,
      [token.id]
    );
    assert.equal(dbRes.rows.length, 1);
    const dbRow = dbRes.rows[0];
    assert.equal(dbRow.status, 'SETTLED');
    assert.ok(dbRow.settled_at);
    assert.equal(dbRow.payment_method, winner.body.token.paymentMethod);
  });

  // =========================================================================
  // TEST A2: Double Settlement Extreme Burst (50 simultaneous requests)
  // =========================================================================
  test('Concurrency Test A2: Double Settlement Extreme Burst (50 simultaneous requests)', async () => {
    // 1. Create another active session
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: 2,
        covers: 4,
      }),
    });
    assert.equal(createRes.status, 201);
    const { token } = await createRes.json();

    // 2. Fire 50 concurrent settlement requests simultaneously
    const BURST_COUNT = 50;
    const burstPromises = Array.from({ length: BURST_COUNT }, (_, idx) =>
      fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({
          paymentMethod: 'UPI',
          paymentReference: `BURST-50-${idx}`,
        }),
      }).then(async (res) => {
        let body = {};
        try { body = await res.json(); } catch {}
        return { status: res.status, body };
      })
    );

    const burstResults = await Promise.all(burstPromises);
    const burst200 = burstResults.filter((r) => r.status === 200);
    const burst409 = burstResults.filter((r) => r.status === 409);
    const burst500 = burstResults.filter((r) => r.status >= 500);

    console.log(`[Test A2] 50-Burst Concurrency Results: 200=${burst200.length}, 409=${burst409.length}, 500=${burst500.length}`);

    assert.equal(burst200.length, 1, 'In 50-request burst, exactly 1 settlement succeeds');
    assert.equal(burst409.length, BURST_COUNT - 1, 'In 50-request burst, exactly 49 requests receive 409 Conflict');
    assert.equal(burst500.length, 0, 'Zero 500 errors during 50-request burst');
  });

  // =========================================================================
  // TEST B1: Daily Token Numbering Contention (20 simultaneous creation requests)
  // =========================================================================
  test('Concurrency Test B1: Daily Token Numbering Contention (20 simultaneous creations on distinct tables)', async () => {
    // Determine baseline max token number for primaryTenant today
    const baselineRes = await pool.query(
      `SELECT COALESCE(MAX(token_number), 0) AS max_num
       FROM table_tokens
       WHERE tenant_id = $1
         AND (created_at AT TIME ZONE 'Asia/Kolkata')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date`,
      [primaryTenant.tenantId]
    );
    const baselineNumber = parseInt(baselineRes.rows[0].max_num, 10);
    console.log(`[Test B1] Baseline token_number for today is: ${baselineNumber}`);

    const TOKEN_COUNT = 20;
    // Tables 101 to 120
    const creationPromises = Array.from({ length: TOKEN_COUNT }, (_, idx) => {
      const tableNumber = 101 + idx;
      return fetch(`${baseUrl}/api/app/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({
          tableNumber,
          covers: 2,
          notes: `Concurrency Test Token for Table ${tableNumber}`,
        }),
      }).then(async (res) => {
        let body = {};
        try { body = await res.json(); } catch {}
        return {
          tableNumber,
          status: res.status,
          body,
        };
      });
    });

    const creationResults = await Promise.all(creationPromises);

    // Verify all 20 succeeded
    const failedCreations = creationResults.filter((r) => r.status !== 201);
    assert.equal(failedCreations.length, 0, `All ${TOKEN_COUNT} creations must return HTTP 201 Created`);

    const createdTokens = creationResults.map((r) => r.body.token);
    const tokenNumbers = createdTokens.map((t) => t.tokenNumber);

    console.log(`[Test B1] Generated Token Numbers:`, tokenNumbers);

    // 1. Check uniqueness: Set size must equal TOKEN_COUNT
    const uniqueNumbers = new Set(tokenNumbers);
    assert.equal(uniqueNumbers.size, TOKEN_COUNT, `Every token MUST have a strictly unique token_number. Found ${uniqueNumbers.size} unique out of ${TOKEN_COUNT}`);

    // 2. Check unbroken contiguous sequence without gaps
    const sortedNumbers = [...tokenNumbers].sort((a, b) => a - b);
    for (let i = 0; i < TOKEN_COUNT; i++) {
      const expectedNum = baselineNumber + 1 + i;
      assert.equal(
        sortedNumbers[i],
        expectedNum,
        `Token at sequence index ${i} must be ${expectedNum}, got ${sortedNumbers[i]}`
      );
    }

    // 3. Verify token codes match formatting (#001, #024, etc.)
    for (const t of createdTokens) {
      const expectedCode = '#' + String(t.tokenNumber).padStart(3, '0');
      assert.equal(t.tokenCode, expectedCode, `tokenCode must be ${expectedCode}`);
    }

    // 4. Verify in database directly
    const dbTokensRes = await pool.query(
      `SELECT token_number, token_code, table_number
       FROM table_tokens
       WHERE tenant_id = $1 AND token_number > $2
       ORDER BY token_number ASC`,
      [primaryTenant.tenantId, baselineNumber]
    );
    assert.equal(dbTokensRes.rows.length, TOKEN_COUNT, `Database should contain exactly ${TOKEN_COUNT} new rows`);
    for (let i = 0; i < TOKEN_COUNT; i++) {
      assert.equal(dbTokensRes.rows[i].token_number, baselineNumber + 1 + i);
    }
  });

  // =========================================================================
  // TEST B2: Multi-Tenant Concurrency Isolation
  // =========================================================================
  test('Concurrency Test B2: Multi-Tenant Concurrency Isolation (Interleaved creation across tenants)', async () => {
    // Interleave 10 creations on primaryTenant with 10 on secondaryTenant simultaneously
    const requests = [];

    for (let i = 0; i < 10; i++) {
      // Primary tenant on tables 201..210
      requests.push(
        fetch(`${baseUrl}/api/app/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${primaryTenant.token}`,
          },
          body: JSON.stringify({ tableNumber: 201 + i }),
        }).then(async (res) => ({ tenant: 'primary', status: res.status, data: await res.json() }))
      );

      // Secondary tenant on tables 201..210 (same table numbers, different tenant!)
      requests.push(
        fetch(`${baseUrl}/api/app/tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${secondaryTenant.token}`,
          },
          body: JSON.stringify({ tableNumber: 201 + i }),
        }).then(async (res) => ({ tenant: 'secondary', status: res.status, data: await res.json() }))
      );
    }

    const interleaveResults = await Promise.all(requests);
    assert.equal(interleaveResults.every((r) => r.status === 201), true, 'All interleaved multi-tenant creations must succeed');

    const primaryTokens = interleaveResults.filter((r) => r.tenant === 'primary').map((r) => r.data.token.tokenNumber);
    const secondaryTokens = interleaveResults.filter((r) => r.tenant === 'secondary').map((r) => r.data.token.tokenNumber);

    assert.equal(new Set(primaryTokens).size, 10, 'Primary tenant tokens must be unique');
    assert.equal(new Set(secondaryTokens).size, 10, 'Secondary tenant tokens must be unique');
  });

  // =========================================================================
  // TEST C1: Table Contention (Simultaneous attempts to open Table 5)
  // =========================================================================
  test('Concurrency Test C1: Table Contention (10 simultaneous creations on Table 5)', async () => {
    const TARGET_TABLE = 5;

    // Fire 10 simultaneous creation requests on Table 5
    const collisionPromises = Array.from({ length: 10 }, (_, idx) =>
      fetch(`${baseUrl}/api/app/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({
          tableNumber: TARGET_TABLE,
          covers: idx + 1,
        }),
      }).then(async (res) => {
        let body = {};
        try { body = await res.json(); } catch {}
        return { status: res.status, body };
      })
    );

    const collisionResults = await Promise.all(collisionPromises);
    const successes = collisionResults.filter((r) => r.status === 201);
    const conflicts = collisionResults.filter((r) => r.status === 409);
    const serverErrors = collisionResults.filter((r) => r.status >= 500);

    console.log(`[Test C1] Table 5 Collision Results: 201=${successes.length}, 409=${conflicts.length}, 500=${serverErrors.length}`);

    assert.equal(successes.length, 1, 'Exactly 1 creation request on Table 5 must succeed (HTTP 201)');
    assert.equal(conflicts.length, 9, 'Exactly 9 requests on Table 5 must be rejected with HTTP 409 Conflict');
    assert.equal(serverErrors.length, 0, 'Zero 500 errors on table collision race');

    for (const c of conflicts) {
      assert.ok(
        c.body.error && c.body.error.includes('active dining session'),
        `Error message must indicate active dining session collision: ${c.body.error}`
      );
    }
  });

  // =========================================================================
  // TEST C2: Rapid Turnover & Active Table Re-Opening Protection
  // =========================================================================
  test('Concurrency Test C2: Rapid Turnover & Table Re-Opening (Settle, Close, Re-open Table 5)', async () => {
    const TARGET_TABLE = 5;

    // 1. Find the currently active token on Table 5
    const listRes = await fetch(`${baseUrl}/api/app/tokens?tableNumber=${TARGET_TABLE}&status=ACTIVE`, {
      headers: { Authorization: `Bearer ${primaryTenant.token}` },
    });
    const listData = await listRes.json();
    assert.equal(listData.tokens.length, 1, 'Must be exactly 1 active token on Table 5');
    const firstToken = listData.tokens[0];

    // 2. Settle Table 5
    const settleRes = await fetch(`${baseUrl}/api/app/tokens/${firstToken.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CASH' }),
    });
    assert.equal(settleRes.status, 200, 'Settlement must succeed');

    // 3. Close Table 5
    const closeRes = await fetch(`${baseUrl}/api/app/tokens/${firstToken.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
    });
    assert.equal(closeRes.status, 200, 'Close must succeed');
    const closedToken = (await closeRes.json()).token;
    assert.equal(closedToken.status, 'CLOSED');
    assert.ok(closedToken.closedAt);

    // 4. Table 5 is now vacated. Rapid turnover: immediately open a new token on Table 5
    const reopenRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({
        tableNumber: TARGET_TABLE,
        covers: 3,
        notes: 'New party seated immediately',
      }),
    });
    assert.equal(reopenRes.status, 201, 'Re-opening vacated Table 5 must succeed with 201');
    const secondToken = (await reopenRes.json()).token;
    assert.notEqual(secondToken.id, firstToken.id, 'New session must have fresh token ID');
    assert.equal(secondToken.tableNumber, TARGET_TABLE);
    assert.equal(secondToken.status, 'ISSUED');

    // 5. Concurrently try to open a second active token on Table 5 while secondToken is active
    const concurrentAttempts = await Promise.all([
      fetch(`${baseUrl}/api/app/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({ tableNumber: TARGET_TABLE, covers: 1 }),
      }),
      fetch(`${baseUrl}/api/app/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({ tableNumber: TARGET_TABLE, covers: 2 }),
      }),
      fetch(`${baseUrl}/api/app/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({ tableNumber: TARGET_TABLE, covers: 4 }),
      }),
    ]);

    for (const att of concurrentAttempts) {
      assert.equal(att.status, 409, 'All concurrent attempts to double-open Table 5 while active must return 409 Conflict');
    }

    // 6. Settle and close second session to leave clean state
    await fetch(`${baseUrl}/api/app/tokens/${secondToken.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'UPI' }),
    });
    await fetch(`${baseUrl}/api/app/tokens/${secondToken.id}/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
    });

    // Verify DB has 2 historical CLOSED tokens for Table 5
    const dbHistoryRes = await pool.query(
      `SELECT id, status, closed_at FROM table_tokens WHERE tenant_id = $1 AND table_number = $2 ORDER BY created_at ASC`,
      [primaryTenant.tenantId, TARGET_TABLE]
    );
    assert.equal(dbHistoryRes.rows.length, 2);
    assert.equal(dbHistoryRes.rows.every((r) => r.status === 'CLOSED'), true);
  });

  // =========================================================================
  // TEST C3: Concurrent Settle vs Close Race Conditions
  // =========================================================================
  test('Concurrency Test C3: Concurrent Double Close & Settle vs Close Races', async () => {
    // Open Table 6
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 6 }),
    });
    const { token } = await createRes.json();

    // Settle it
    const settleRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({ paymentMethod: 'CARD' }),
    });
    assert.equal(settleRes.status, 200);

    // Fire 5 simultaneous close requests
    const closePromises = Array.from({ length: 5 }, () =>
      fetch(`${baseUrl}/api/app/tokens/${token.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
      }).then(async (res) => ({ status: res.status, body: await res.json().catch(() => ({})) }))
    );

    const closeResults = await Promise.all(closePromises);
    const close200 = closeResults.filter((r) => r.status === 200);
    const close400 = closeResults.filter((r) => r.status === 400);

    console.log(`[Test C3] Double-Close Results: 200=${close200.length}, 400=${close400.length}`);
    assert.equal(close200.length, 1, 'Exactly 1 close request succeeds (HTTP 200)');
    assert.equal(close400.length, 4, 'Remaining 4 close requests fail with HTTP 400 (Already closed)');
  });

  // =========================================================================
  // TEST D: Concurrent Line Item Appending (Zero Lost Updates)
  // =========================================================================
  test('Concurrency Test D: 15 Concurrent Line Item Appends (Zero Lost Updates)', async () => {
    // 1. Open Table 7
    const createRes = await fetch(`${baseUrl}/api/app/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${primaryTenant.token}`,
      },
      body: JSON.stringify({ tableNumber: 7 }),
    });
    const { token } = await createRes.json();

    // 2. Fire 15 concurrent item additions with unique dish names and known prices
    const ITEM_COUNT = 15;
    const itemPricePaise = 10000; // Rs 100 each
    const itemPromises = Array.from({ length: ITEM_COUNT }, (_, idx) =>
      fetch(`${baseUrl}/api/app/tokens/${token.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${primaryTenant.token}`,
        },
        body: JSON.stringify({
          dishName: `Dish-Concur-${idx + 1}`,
          quantity: 1,
          unitPricePaise: itemPricePaise,
          isVeg: idx % 2 === 0,
        }),
      }).then(async (res) => ({ status: res.status, body: await res.json().catch(() => ({})) }))
    );

    const itemResults = await Promise.all(itemPromises);
    assert.equal(itemResults.every((r) => r.status === 200), true, 'All 15 concurrent item appends must succeed (HTTP 200)');

    // 3. Check final token state
    const finalDetailRes = await fetch(`${baseUrl}/api/app/tokens/${token.id}`, {
      headers: { Authorization: `Bearer ${primaryTenant.token}` },
    });
    const finalDetail = (await finalDetailRes.json()).token;

    console.log(`[Test D] After 15 concurrent appends: Items count=${finalDetail.items.length}, Subtotal=${finalDetail.subtotalPaise}, Tax=${finalDetail.taxPaise}, Total=${finalDetail.totalPaise}`);

    assert.equal(finalDetail.items.length, ITEM_COUNT, `Token must contain exactly ${ITEM_COUNT} line items (zero lost updates)`);

    const expectedSubtotalPaise = ITEM_COUNT * itemPricePaise; // 150000
    const expectedTaxPaise = Math.round(expectedSubtotalPaise * 0.05); // 7500
    const expectedTotalPaise = expectedSubtotalPaise + expectedTaxPaise; // 157500

    assert.equal(finalDetail.subtotalPaise, expectedSubtotalPaise, `Subtotal must be exactly ${expectedSubtotalPaise}`);
    assert.equal(finalDetail.taxPaise, expectedTaxPaise, `Tax must be exactly ${expectedTaxPaise}`);
    assert.equal(finalDetail.totalPaise, expectedTotalPaise, `Total must be exactly ${expectedTotalPaise}`);

    // Verify in database directly
    const dbItemsRes = await pool.query(
      `SELECT count(*) AS count FROM token_items WHERE token_id = $1`,
      [token.id]
    );
    assert.equal(parseInt(dbItemsRes.rows[0].count, 10), ITEM_COUNT, 'Database must have exactly 15 item rows');
  });
});

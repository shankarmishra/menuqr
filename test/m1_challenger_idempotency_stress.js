/**
 * Adversarial Stress & Collision Test Suite for Synthetic Idempotency Generator
 * Target: backend/routes/public.js:534-541
 * Milestone 1 Challenger 1 Empirical Verification Harness
 */

import crypto, { randomUUID } from 'node:crypto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../backend/db.js';
import publicRoutes from '../backend/routes/public.js';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr';

// --- Production Reference Implementation (from backend/routes/public.js:534-541) ---
export function computeSyntheticIdempotencyKey(client, input, timestamp = Date.now()) {
  const itemsFingerprint = Array.isArray(input.items) 
    ? input.items.map(i => `${i.id}:${i.quantity}:${i.variantId || i.variant || ''}`).sort().join('|')
    : '';
  const windowId = Math.floor(timestamp / 15000); // 15-second time bucket
  const customerIdentifier = String(input.customerPhone || input.tableNumber || input.customerName || 'guest').slice(0, 50);
  const hash = crypto.createHash('sha256').update(itemsFingerprint).digest('base64url');
  return `auto-idem-${client.id}-${customerIdentifier}-${hash}-${windowId}`;
}

// --- Old Flawed Implementation (pre-fix) ---
export function computeOldFlawedIdempotencyKey(client, input, timestamp = Date.now()) {
  const itemsFingerprint = Array.isArray(input.items) 
    ? input.items.map(i => `${i.id}:${i.quantity}:${i.variantId || i.variant || ''}`).sort().join('|')
    : '';
  const windowId = Math.floor(timestamp / 15000);
  const customerIdentifier = String(input.customerPhone || input.tableNumber || input.customerName || 'guest').slice(0, 50);
  return `auto-idem-${client.id}-${customerIdentifier}-${Buffer.from(itemsFingerprint).toString('base64url').slice(0, 32)}-${windowId}`;
}

function mockResponse() {
  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    writeHead(status, headers = {}) {
      res.statusCode = status;
      Object.assign(res.headers, headers);
    },
    setHeader(key, value) {
      res.headers[key] = value;
    },
    end(data) {
      res.body = data;
    }
  };
  return res;
}

function mockRequest(method, body = null, headers = {}) {
  const req = {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    async *[Symbol.asyncIterator]() {
      if (body) {
        yield Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
      }
    }
  };
  return req;
}

// ---------------------------------------------------------------------------
// SUITE 1: Historical Bug Reproduction & Character 35/36 Boundary Verification
// ---------------------------------------------------------------------------
test('Suite 1: Bug Reproduction — Old slice(0, 32) Collides vs New SHA-256 Separates', () => {
  const client = { id: 'client_m1_test' };
  const basePrefix = '12345678-1234-1234-1234-1234567890'; // 34 chars long

  // UUIDs differing ONLY at char 35 and 36
  const uuid35A = `${basePrefix}11`; // Char 35=1, 36=1
  const uuid35B = `${basePrefix}21`; // Char 35=2, 36=1 (differs at char 35)
  const uuid36A = `${basePrefix}0a`; // Char 35=0, 36=a
  const uuid36B = `${basePrefix}0b`; // Char 35=0, 36=b (differs at char 36)

  const order35A = { items: [{ id: uuid35A, quantity: 1 }] };
  const order35B = { items: [{ id: uuid35B, quantity: 1 }] };
  const order36A = { items: [{ id: uuid36A, quantity: 1 }] };
  const order36B = { items: [{ id: uuid36B, quantity: 1 }] };

  const fixedTime = 1700000000000;

  // 1. Verify OLD implementation FALSIFIES (they collide because slice(0,32) drops bytes 25..36)
  const oldKey35A = computeOldFlawedIdempotencyKey(client, order35A, fixedTime);
  const oldKey35B = computeOldFlawedIdempotencyKey(client, order35B, fixedTime);
  const oldKey36A = computeOldFlawedIdempotencyKey(client, order36A, fixedTime);
  const oldKey36B = computeOldFlawedIdempotencyKey(client, order36B, fixedTime);

  assert.equal(
    oldKey35A,
    oldKey35B,
    'EMPIRICAL PROOF OF OLD BUG: Old implementation incorrectly collides when char 35 differs'
  );
  assert.equal(
    oldKey36A,
    oldKey36B,
    'EMPIRICAL PROOF OF OLD BUG: Old implementation incorrectly collides when char 36 differs'
  );

  // 2. Verify NEW implementation PRODUCES DISTINCT KEYS
  const newKey35A = computeSyntheticIdempotencyKey(client, order35A, fixedTime);
  const newKey35B = computeSyntheticIdempotencyKey(client, order35B, fixedTime);
  const newKey36A = computeSyntheticIdempotencyKey(client, order36A, fixedTime);
  const newKey36B = computeSyntheticIdempotencyKey(client, order36B, fixedTime);

  assert.notEqual(newKey35A, newKey35B, 'NEW FIX: Keys must differ when 35th char differs');
  assert.notEqual(newKey36A, newKey36B, 'NEW FIX: Keys must differ when 36th char differs');

  // 3. Verify items differing only in quantity (which previously fell past byte 24 and collided)
  const orderQty1 = { items: [{ id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1 }] };
  const orderQty2 = { items: [{ id: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 }] };

  const oldQty1 = computeOldFlawedIdempotencyKey(client, orderQty1, fixedTime);
  const oldQty2 = computeOldFlawedIdempotencyKey(client, orderQty2, fixedTime);
  assert.equal(oldQty1, oldQty2, 'OLD BUG: Differing quantities on 36-char UUID collide');

  const newQty1 = computeSyntheticIdempotencyKey(client, orderQty1, fixedTime);
  const newQty2 = computeSyntheticIdempotencyKey(client, orderQty2, fixedTime);
  assert.notEqual(newQty1, newQty2, 'NEW FIX: Differing quantities produce distinct keys');

  // 4. Verify items differing only in variant
  const orderVarA = { items: [{ id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, variant: 'Half' }] };
  const orderVarB = { items: [{ id: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, variant: 'Full' }] };

  const newVarA = computeSyntheticIdempotencyKey(client, orderVarA, fixedTime);
  const newVarB = computeSyntheticIdempotencyKey(client, orderVarB, fixedTime);
  assert.notEqual(newVarA, newVarB, 'NEW FIX: Differing variants produce distinct keys');
});

// ---------------------------------------------------------------------------
// SUITE 2: 10,000 Synthetic Order Variations Collision Stress Test
// ---------------------------------------------------------------------------
test('Suite 2: 10,000 Synthetic Order Variations Collision Resistance Harness', () => {
  const client = { id: 'tenant_stress_m1' };
  const fixedTime = 1710000000000;
  const keyMap = new Map(); // key -> order metadata

  let totalVariations = 10000;
  let collisionsDetected = 0;
  const collisionDetails = [];

  // Partition variations into 4 distinct stress vectors (2,500 variations each):
  
  // Vector A: 2,500 varying quantities on same base item (qty 1 to 2500)
  const baseItemId = '11112222-3333-4444-5555-666677778888';
  for (let q = 1; q <= 2500; q++) {
    const order = {
      customerPhone: '9876543210',
      items: [{ id: baseItemId, quantity: q }]
    };
    const key = computeSyntheticIdempotencyKey(client, order, fixedTime);
    if (keyMap.has(key)) {
      collisionsDetected++;
      collisionDetails.push({ vector: 'Vector A: Quantity', index: q, key, existing: keyMap.get(key) });
    } else {
      keyMap.set(key, { vector: 'Vector A', id: q });
    }
  }

  // Vector B: 2,500 varying variants on same item & quantity
  for (let v = 0; v < 2500; v++) {
    const order = {
      customerPhone: '9876543210',
      items: [{ id: baseItemId, quantity: 1, variantId: `variant_stress_opt_${v}` }]
    };
    const key = computeSyntheticIdempotencyKey(client, order, fixedTime);
    if (keyMap.has(key)) {
      collisionsDetected++;
      collisionDetails.push({ vector: 'Vector B: Variant', index: v, key, existing: keyMap.get(key) });
    } else {
      keyMap.set(key, { vector: 'Vector B', id: v });
    }
  }

  // Vector C: 2,500 distinct UUIDs sharing a 30-char common prefix (differing at chars 31..36)
  // Format: 12345678-1234-1234-1234-123456xxxxxx
  for (let u = 0; u < 2500; u++) {
    const suffix = u.toString(16).padStart(6, '0');
    const uuid = `12345678-1234-1234-1234-123456${suffix}`;
    const order = {
      customerPhone: '9876543210',
      items: [{ id: uuid, quantity: 1 }]
    };
    const key = computeSyntheticIdempotencyKey(client, order, fixedTime);
    if (keyMap.has(key)) {
      collisionsDetected++;
      collisionDetails.push({ vector: 'Vector C: Shared Prefix UUID', index: u, key, existing: keyMap.get(key) });
    } else {
      keyMap.set(key, { vector: 'Vector C', id: u });
    }
  }

  // Vector D: 2,500 multi-item cart permutations & combinations
  for (let m = 0; m < 2500; m++) {
    const itemCount = (m % 5) + 2; // 2 to 6 items per order
    const items = [];
    for (let k = 0; k < itemCount; k++) {
      items.push({
        id: `item_m_${m}_idx_${k}`,
        quantity: ((m + k) % 10) + 1,
        variant: k % 2 === 0 ? `spice_level_${k}` : ''
      });
    }
    const order = {
      customerPhone: '9876543210',
      items
    };
    const key = computeSyntheticIdempotencyKey(client, order, fixedTime);
    if (keyMap.has(key)) {
      collisionsDetected++;
      collisionDetails.push({ vector: 'Vector D: Multi-item Combo', index: m, key, existing: keyMap.get(key) });
    } else {
      keyMap.set(key, { vector: 'Vector D', id: m });
    }
  }

  const passRate = ((totalVariations - collisionsDetected) / totalVariations) * 100;

  console.log('--- 10,000 Order Variations Stress Test Metrics ---');
  console.log(`Total Cases Tested:    ${totalVariations}`);
  console.log(`Unique Keys Generated: ${keyMap.size}`);
  console.log(`Collisions Detected:   ${collisionsDetected}`);
  console.log(`Collision Pass Rate:   ${passRate.toFixed(4)}%`);

  if (collisionsDetected > 0) {
    console.error('Collisions found:', collisionDetails.slice(0, 5));
  }

  assert.equal(collisionsDetected, 0, `Expected 0 collisions in 10,000 variations, got ${collisionsDetected}`);
  assert.equal(keyMap.size, 10000, `Expected 10,000 unique keys, got ${keyMap.size}`);
  assert.equal(passRate, 100.0, `Expected 100.0% pass rate`);
});

// ---------------------------------------------------------------------------
// SUITE 3: Deduplication & Canonical Item Sorting Invariants
// ---------------------------------------------------------------------------
test('Suite 3: Deduplication & Canonical Sorting Invariant', () => {
  const client = { id: 'client_m1' };
  const fixedTime = 1710000000000;

  // Order with items in order [A, B, C]
  const orderOriginal = {
    customerPhone: '9876543210',
    items: [
      { id: 'item_apple', quantity: 2, variant: 'sweet' },
      { id: 'item_banana', quantity: 5, variant: 'ripe' },
      { id: 'item_cherry', quantity: 1, variant: 'red' }
    ]
  };

  // Order with items in reversed order [C, B, A]
  const orderReversed = {
    customerPhone: '9876543210',
    items: [
      { id: 'item_cherry', quantity: 1, variant: 'red' },
      { id: 'item_banana', quantity: 5, variant: 'ripe' },
      { id: 'item_apple', quantity: 2, variant: 'sweet' }
    ]
  };

  // Order with items in shuffled order [B, A, C]
  const orderShuffled = {
    customerPhone: '9876543210',
    items: [
      { id: 'item_banana', quantity: 5, variant: 'ripe' },
      { id: 'item_apple', quantity: 2, variant: 'sweet' },
      { id: 'item_cherry', quantity: 1, variant: 'red' }
    ]
  };

  const keyOriginal = computeSyntheticIdempotencyKey(client, orderOriginal, fixedTime);
  const keyReversed = computeSyntheticIdempotencyKey(client, orderReversed, fixedTime);
  const keyShuffled = computeSyntheticIdempotencyKey(client, orderShuffled, fixedTime);

  // Invariant 1: Permuted item array order MUST produce identical key for deduplication
  assert.equal(keyOriginal, keyReversed, 'Order item reversal must produce identical key');
  assert.equal(keyOriginal, keyShuffled, 'Order item shuffling must produce identical key');

  // Invariant 2: Swapped quantities MUST produce different key
  const orderSwappedQty = {
    customerPhone: '9876543210',
    items: [
      { id: 'item_apple', quantity: 5, variant: 'sweet' }, // swapped 2 -> 5
      { id: 'item_banana', quantity: 2, variant: 'ripe' },  // swapped 5 -> 2
      { id: 'item_cherry', quantity: 1, variant: 'red' }
    ]
  };
  const keySwappedQty = computeSyntheticIdempotencyKey(client, orderSwappedQty, fixedTime);
  assert.notEqual(keyOriginal, keySwappedQty, 'Swapped item quantities must produce distinct keys');

  // Invariant 3: Rapid double-tap within same 15s window produces identical key
  const keyDoubleTap1 = computeSyntheticIdempotencyKey(client, orderOriginal, fixedTime);
  const keyDoubleTap2 = computeSyntheticIdempotencyKey(client, orderOriginal, fixedTime + 12000); // 12s later in same window
  assert.equal(keyDoubleTap1, keyDoubleTap2, 'Double tap within 15s must produce exact same key');
});

// ---------------------------------------------------------------------------
// SUITE 4: Sliding Time-Window Bucket Boundary Invariants
// ---------------------------------------------------------------------------
test('Suite 4: 15-Second Sliding Window Boundary Invariant', () => {
  const client = { id: 'client_m1' };
  const order = {
    customerPhone: '9876543210',
    items: [{ id: 'item_1', quantity: 1 }]
  };

  // Base timestamp aligned to bucket start: 150000ms (windowId = 10)
  const windowStart = 150000;
  const windowEnd = 164999; // 14.999s later (still windowId = 10)
  const nextWindowStart = 165000; // windowId = 11

  const keyWindowStart = computeSyntheticIdempotencyKey(client, order, windowStart);
  const keyWindowEnd = computeSyntheticIdempotencyKey(client, order, windowEnd);
  const keyNextWindow = computeSyntheticIdempotencyKey(client, order, nextWindowStart);

  // Within the same 15-second window, keys MUST match
  assert.equal(
    keyWindowStart,
    keyWindowEnd,
    'Orders submitted at 0.0s and 14.999s within the same bucket must share idempotency key'
  );

  // Across the 15-second boundary, keys MUST differ
  assert.notEqual(
    keyWindowEnd,
    keyNextWindow,
    'Order submitted at 15.000s (new bucket) must produce distinct idempotency key'
  );

  // Multiple sequential buckets
  const windowKeys = new Set();
  for (let w = 0; w < 10; w++) {
    const t = 1000000 + (w * 15000);
    const k = computeSyntheticIdempotencyKey(client, order, t);
    assert.equal(windowKeys.has(k), false, `Window ${w} produced a colliding key`);
    windowKeys.add(k);
  }
  assert.equal(windowKeys.size, 10, '10 sequential windows must produce 10 distinct keys');
});

// ---------------------------------------------------------------------------
// SUITE 5: Edge Cases, Malformed Payloads & Hostile Customer Identifiers
// ---------------------------------------------------------------------------
test('Suite 5: Edge Cases & Hostile Inputs Robustness', () => {
  const client = { id: 'client_edge_test' };
  const fixedTime = 1710000000000;

  // 1. Empty items array
  const emptyItemsOrder = { items: [] };
  const keyEmpty = computeSyntheticIdempotencyKey(client, emptyItemsOrder, fixedTime);
  assert.ok(typeof keyEmpty === 'string' && keyEmpty.startsWith('auto-idem-'));
  // SHA-256 of empty string is 47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU
  assert.ok(keyEmpty.includes('47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU'));

  // 2. Null, undefined, and non-array items
  const nullItemsOrder = { items: null };
  const undefItemsOrder = { items: undefined };
  const stringItemsOrder = { items: 'string_items_hack' };
  const numItemsOrder = { items: 12345 };
  const objItemsOrder = { items: { id: 'x' } };

  const keyNull = computeSyntheticIdempotencyKey(client, nullItemsOrder, fixedTime);
  const keyUndef = computeSyntheticIdempotencyKey(client, undefItemsOrder, fixedTime);
  const keyStr = computeSyntheticIdempotencyKey(client, stringItemsOrder, fixedTime);
  const keyNum = computeSyntheticIdempotencyKey(client, numItemsOrder, fixedTime);
  const keyObj = computeSyntheticIdempotencyKey(client, objItemsOrder, fixedTime);

  assert.equal(keyNull, keyEmpty, 'Null items should gracefully fall back to empty fingerprint');
  assert.equal(keyUndef, keyEmpty, 'Undefined items should gracefully fall back to empty fingerprint');
  assert.equal(keyStr, keyEmpty, 'String items should gracefully fall back to empty fingerprint');
  assert.equal(keyNum, keyEmpty, 'Numeric items should gracefully fall back to empty fingerprint');
  assert.equal(keyObj, keyEmpty, 'Object items should gracefully fall back to empty fingerprint');

  // 3. Customer identifier priority: phone > tableNumber > customerName > 'guest'
  const allIdentifiers = {
    customerPhone: '9876543210',
    tableNumber: 'Table-42',
    customerName: 'Alice'
  };
  const keyPhone = computeSyntheticIdempotencyKey(client, allIdentifiers, fixedTime);
  assert.ok(keyPhone.includes('-9876543210-'), 'Phone has highest precedence');

  const noPhone = {
    tableNumber: 'Table-42',
    customerName: 'Alice'
  };
  const keyTable = computeSyntheticIdempotencyKey(client, noPhone, fixedTime);
  assert.ok(keyTable.includes('-Table-42-'), 'Table number has second precedence');

  const onlyName = {
    customerName: 'Alice'
  };
  const keyName = computeSyntheticIdempotencyKey(client, onlyName, fixedTime);
  assert.ok(keyName.includes('-Alice-'), 'Name has third precedence');

  const noIdentifiers = {};
  const keyGuest = computeSyntheticIdempotencyKey(client, noIdentifiers, fixedTime);
  assert.ok(keyGuest.includes('-guest-'), 'Fallback to guest');

  // 4. Extreme customer identifier lengths (>50 chars must be cleanly sliced)
  const extremeName = 'A'.repeat(250);
  const extremeOrder = { customerName: extremeName, items: [{ id: '1', quantity: 1 }] };
  const keyExtreme = computeSyntheticIdempotencyKey(client, extremeOrder, fixedTime);
  assert.ok(keyExtreme.includes('A'.repeat(50)), 'Should contain 50 "A" characters');
  assert.ok(!keyExtreme.includes('A'.repeat(51)), 'Should not contain 51 "A" characters');

  // 5. Special characters, SQL injection, unicode, emojis
  const specialIdentifiers = [
    '🍔 Foodie 🍣',
    'Robert\'); DROP TABLE customer_orders;--',
    '<script>alert("xss")</script>',
    'Newline\n\r\tTab',
    'Colons:and|Pipes:in:Name',
    'CJK_用户_12345',
    'Special_!@#$%^&*()_+=~`[]{}'
  ];

  for (const hostile of specialIdentifiers) {
    const hostileOrder = { customerName: hostile, items: [{ id: 'item_1', quantity: 1 }] };
    assert.doesNotThrow(() => {
      const k = computeSyntheticIdempotencyKey(client, hostileOrder, fixedTime);
      assert.ok(typeof k === 'string' && k.length > 20);
    }, `Hostile identifier failed: ${hostile}`);
  }
});

// ---------------------------------------------------------------------------
// SUITE 6: Verification of Actual Source Code in backend/routes/public.js
// ---------------------------------------------------------------------------
test('Suite 6: Inspect Production Source backend/routes/public.js for SHA-256 Digest', async () => {
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const publicRoutePath = path.resolve('backend/routes/public.js');

  const content = await fs.readFile(publicRoutePath, 'utf8');

  // Verify crypto import
  assert.ok(
    content.includes("import crypto, { randomUUID } from 'node:crypto';") ||
    content.includes("import crypto") && content.includes("'node:crypto'"),
    'backend/routes/public.js must import node:crypto'
  );

  // Verify sha256 hash calculation exists
  assert.ok(
    content.includes("crypto.createHash('sha256').update(itemsFingerprint).digest('base64url')"),
    'backend/routes/public.js must compute SHA-256 base64url hash'
  );

  // Verify slice(0, 32) on fingerprint is gone
  assert.ok(
    !content.includes("toString('base64url').slice(0, 32)"),
    'Old buggy Buffer.from(itemsFingerprint).toString("base64url").slice(0, 32) must NOT be present'
  );

  // Verify 15-second windowId
  assert.ok(
    content.includes("Math.floor(Date.now() / 15000)"),
    'backend/routes/public.js must retain 15-second windowId deduplication'
  );

  // Verify idempotencyKey format
  assert.ok(
    content.includes("idempotencyKey = `auto-idem-${client.id}-${customerIdentifier}-${hash}-${windowId}`;"),
    'backend/routes/public.js must assemble auto-idem key with hash and windowId'
  );
});

// ---------------------------------------------------------------------------
// SUITE 7: Live End-to-End Route Deduplication & Boundary Separation Test
// ---------------------------------------------------------------------------
test('Suite 7: Live Public Route Integration — Synthetic Key Deduplication & Distinctness', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const runId = randomUUID().slice(0, 8);
  const tenantId = `tenant-idem-${runId}`;
  const userId = `user-idem-${runId}`;
  const menuSlug = `slug-idem-${runId}`;
  const menuId = randomUUID();
  const catId = randomUUID();

  // Create two item IDs sharing first 34 chars, differing ONLY at char 35 and 36
  const basePrefix = '99998888-7777-6666-5555-4444333322'; // 34 chars
  const item35Id = `${basePrefix}11`;
  const item36Id = `${basePrefix}12`;

  t.before(async () => {
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, 'Idempotency Cafe', $3, 'active')",
      [tenantId, `pub-${runId}`, menuSlug]
    );
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role, tenant_id, onboarding_state) VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3, 'COMPLETED')",
      [userId, `owner-${runId}@example.com`, tenantId]
    );
    await pool.query(
      "INSERT INTO subscriptions (id, tenant_id, plan_id, status, started_at, expires_at) VALUES ($1, $2, 'PREMIUM', 'ACTIVE', NOW(), NOW() + INTERVAL '1 year')",
      [randomUUID(), tenantId]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Main Menu', 'PUBLISHED')",
      [menuId, tenantId]
    );
    await pool.query(
      "INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, 'Appetizers', 1)",
      [catId, menuId, tenantId]
    );
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Item 35', 100, true)",
      [item35Id, menuId, tenantId, catId]
    );
    await pool.query(
      "INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, is_available) VALUES ($1, $2, $3, $4, 'Item 36', 120, true)",
      [item36Id, menuId, tenantId, catId]
    );
  });

  t.after(async () => {
    await pool.query('DELETE FROM customer_orders WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_items WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menu_categories WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM menus WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM subscriptions WHERE tenant_id = $1', [tenantId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    await pool.query('DELETE FROM clients WHERE id = $1', [tenantId]);
  });

  let firstOrderId = '';

  await t.test('7.1 Order 1: Initial order with Item 35 (no explicit idempotency key)', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 10',
      customerName: 'Rahul',
      customerPhone: '9876543210',
      items: [{ id: item35Id, quantity: 1 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 201, 'First order must be created with 201 Created');
    const body = JSON.parse(res.body);
    assert.ok(body.id, 'Must return order id');
    firstOrderId = body.id;
  });

  await t.test('7.2 Order 2: Rapid double-tap with identical Item 35 returns existing order (HTTP 200)', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 10',
      customerName: 'Rahul',
      customerPhone: '9876543210',
      items: [{ id: item35Id, quantity: 1 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 200, 'Double-tap within 15s must return cached 200 OK');
    const body = JSON.parse(res.body);
    assert.strictEqual(body.id, firstOrderId, 'Double-tap must return original order ID without duplicating');
  });

  await t.test('7.3 Order 3: Order with Item 36 (differing ONLY at char 36) creates a NEW order (HTTP 201)', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 10',
      customerName: 'Rahul',
      customerPhone: '9876543210',
      items: [{ id: item36Id, quantity: 1 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 201, 'Differing UUID at char 36 must NOT collide and must create 201 Created');
    const body = JSON.parse(res.body);
    assert.notStrictEqual(body.id, firstOrderId, 'New order ID must be distinct');
  });

  await t.test('7.4 Order 4: Order with Item 35 but quantity 2 creates a NEW order (HTTP 201)', async () => {
    const req = mockRequest('POST', {
      orderType: 'DINE_IN',
      tableNumber: 'Table 10',
      customerName: 'Rahul',
      customerPhone: '9876543210',
      items: [{ id: item35Id, quantity: 2 }]
    });
    const res = mockResponse();
    const handled = await publicRoutes(req, res, new URL(`http://localhost/api/public/menus/${menuSlug}/orders`));
    assert.strictEqual(handled, true);
    assert.strictEqual(res.statusCode, 201, 'Differing quantity must NOT collide and must create 201 Created');
    const body = JSON.parse(res.body);
    assert.notStrictEqual(body.id, firstOrderId, 'New order ID must be distinct');
  });
});

import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB } from '../db.js';

test('Milestone 1 Adversarial Stress Test: Concurrency, Cascade, & Sequence Invariants', async (t) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false, initializeSchema: false });
  assert.ok(db, 'PostgreSQL database pool connected');

  const TIMESTAMP = Date.now();
  const TENANT_A = `challenger_tenant_a_${TIMESTAMP}`;
  const TENANT_B = `challenger_tenant_b_${TIMESTAMP}`;
  const USER_A = `challenger_user_${TIMESTAMP}`;
  const TABLE_NUM = 42;

  try {
    // 0. Seed test tenants and user
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status)
      VALUES 
        ($1, $2, 'Challenger Resto A', $3, 'active'),
        ($4, $5, 'Challenger Resto B', $6, 'active')
      ON CONFLICT (id) DO NOTHING;
    `, [
      TENANT_A, `pub_${TENANT_A}`, `slug-${TENANT_A}`,
      TENANT_B, `pub_${TENANT_B}`, `slug-${TENANT_B}`
    ]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3)
      ON CONFLICT (id) DO NOTHING;
    `, [USER_A, `${TENANT_A}@test.menuqr.in`, TENANT_A]);

    // Create table in restaurant_tables
    const tableRes = await db.query(`
      INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity)
      VALUES ($1, $2, 'Adversarial Table 42', 4)
      RETURNING id;
    `, [TENANT_A, TABLE_NUM]);
    const tableAId = tableRes.rows[0].id;

    // =========================================================================
    // SECTION 1: Active Table Token Concurrency Guard (idx_active_table_tokens)
    // =========================================================================
    await t.test('1.1 Concurrency Burst: 20 simultaneous active token inserts for same table (strictly 1 succeeds, 19 fail with 23505)', async () => {
      const activeStatuses = ['ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID'];
      const CONCURRENCY_COUNT = 20;

      // Construct 20 concurrent insert operations with varying active statuses
      const insertPromises = Array.from({ length: CONCURRENCY_COUNT }, (_, idx) => {
        const status = activeStatuses[idx % activeStatuses.length];
        const tokenNum = 100 + idx;
        const tokenCode = `#${tokenNum}`;
        return db.query(`
          INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
          VALUES ($1, $2, $3, $4, $5, $6, 2)
          RETURNING id, status, token_number;
        `, [TENANT_A, tokenNum, tokenCode, tableAId, TABLE_NUM, status]);
      });

      const results = await Promise.allSettled(insertPromises);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, `Exactly 1 concurrent active token insert must succeed. Actual succeeded: ${fulfilled.length}`);
      assert.equal(rejected.length, CONCURRENCY_COUNT - 1, `Exactly ${CONCURRENCY_COUNT - 1} concurrent inserts must fail. Actual failed: ${rejected.length}`);

      // Verify every rejected query failed strictly with PostgreSQL unique_violation (code 23505)
      for (const rej of rejected) {
        assert.equal(rej.reason.code, '23505', `Rejected error code must be 23505 (unique_violation), got: ${rej.reason.code}`);
        assert.match(
          rej.reason.message,
          /idx_active_table_tokens/i,
          `Error message must specifically reference partial unique index idx_active_table_tokens. Got: ${rej.reason.message}`
        );
      }

      // Verify database state: exactly 1 active token exists for (TENANT_A, TABLE_NUM)
      const countRes = await db.query(`
        SELECT COUNT(*) as count 
        FROM table_tokens 
        WHERE tenant_id = $1 
          AND table_number = $2 
          AND status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID');
      `, [TENANT_A, TABLE_NUM]);
      assert.equal(Number(countRes.rows[0].count), 1, 'Database must contain exactly 1 active token row for this table');
    });

    await t.test('1.2 Immediate Release Upon Settle: settling the token allows a new active session immediately', async () => {
      // Find the currently active token
      const activeRes = await db.query(`
        SELECT id, status FROM table_tokens 
        WHERE tenant_id = $1 AND table_number = $2 AND status IN ('ISSUED', 'ORDERING', 'DINING', 'BILL_REQUESTED', 'UNPAID');
      `, [TENANT_A, TABLE_NUM]);
      assert.equal(activeRes.rows.length, 1, 'Must find the active token');
      const activeTokenId = activeRes.rows[0].id;

      // Settle the active token
      const settleRes = await db.query(`
        UPDATE table_tokens 
        SET status = 'SETTLED', settled_at = CURRENT_TIMESTAMP, payment_method = 'CASH', settled_by_id = $1
        WHERE id = $2
        RETURNING id, status, settled_at;
      `, [USER_A, activeTokenId]);
      assert.equal(settleRes.rows[0].status, 'SETTLED');

      // Now immediately insert a new active token for the exact same table
      const newActiveRes = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
        VALUES ($1, 201, '#201', $2, $3, 'ISSUED', 3)
        RETURNING id, status, table_number;
      `, [TENANT_A, tableAId, TABLE_NUM]);

      assert.ok(newActiveRes.rows[0].id, 'New active token must be created');
      assert.equal(newActiveRes.rows[0].status, 'ISSUED');
      assert.equal(newActiveRes.rows[0].table_number, TABLE_NUM);

      // Verify that another concurrent burst of 10 inserts now fails against this new active token
      const burstResults = await Promise.allSettled(
        Array.from({ length: 10 }, (_, i) => db.query(`
          INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
          VALUES ($1, $2, $3, $4, $5, 'ORDERING', 2);
        `, [TENANT_A, 300 + i, `#${300 + i}`, tableAId, TABLE_NUM]))
      );

      const burstFulfilled = burstResults.filter((r) => r.status === 'fulfilled');
      const burstRejected = burstResults.filter((r) => r.status === 'rejected');
      assert.equal(burstFulfilled.length, 0, 'All 10 inserts must fail because table is occupied');
      assert.equal(burstRejected.length, 10, 'All 10 inserts must reject');
      for (const rej of burstRejected) {
        assert.equal(rej.reason.code, '23505');
      }

      // Close the new active token
      await db.query(`
        UPDATE table_tokens SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP WHERE id = $1;
      `, [newActiveRes.rows[0].id]);
    });

    await t.test('1.3 Coexistence of Inactive Tokens: multiple SETTLED and CLOSED tokens can coexist on same table', async () => {
      // Multiple SETTLED and CLOSED tokens for the same table should not conflict with idx_active_table_tokens
      const inactiveInserts = await Promise.all([
        db.query(`INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status) VALUES ($1, 401, '#401', $2, 'SETTLED') RETURNING id;`, [TENANT_A, TABLE_NUM]),
        db.query(`INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status) VALUES ($1, 402, '#402', $2, 'SETTLED') RETURNING id;`, [TENANT_A, TABLE_NUM]),
        db.query(`INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status) VALUES ($1, 403, '#403', $2, 'CLOSED') RETURNING id;`, [TENANT_A, TABLE_NUM]),
        db.query(`INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status) VALUES ($1, 404, '#404', $2, 'CLOSED') RETURNING id;`, [TENANT_A, TABLE_NUM]),
      ]);
      assert.equal(inactiveInserts.length, 4, 'All inactive token inserts succeed concurrently');
    });

    await t.test('1.4 Multi-Tenant Isolation: different tenants can simultaneously have active tokens on identical table numbers', async () => {
      // TENANT_A has no active token right now, let's insert active token on Table 42 for TENANT_A and TENANT_B concurrently
      const results = await Promise.all([
        db.query(`
          INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
          VALUES ($1, 501, '#501', $2, 'DINING', 2)
          RETURNING id, tenant_id;
        `, [TENANT_A, TABLE_NUM]),
        db.query(`
          INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
          VALUES ($1, 501, '#501', $2, 'DINING', 2)
          RETURNING id, tenant_id;
        `, [TENANT_B, TABLE_NUM]),
      ]);

      assert.equal(results[0].rows[0].tenant_id, TENANT_A);
      assert.equal(results[1].rows[0].tenant_id, TENANT_B);
      assert.ok(results[0].rows[0].id !== results[1].rows[0].id, 'Different tenants operate independently');

      // Clean up both tokens
      await db.query(`UPDATE table_tokens SET status = 'CLOSED' WHERE id IN ($1, $2)`, [results[0].rows[0].id, results[1].rows[0].id]);
    });

    // =========================================================================
    // SECTION 2: Cascading Deletion Stress-Test (token_items -> table_tokens)
    // =========================================================================
    await t.test('2.1 Single Parent with 15 Line Items: deleting parent cascades and purges all 15 items', async () => {
      // 1. Create a parent token
      const parentRes = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
        VALUES ($1, 601, '#601', 99, 'CLOSED', 4)
        RETURNING id;
      `, [TENANT_A]);
      const parentId = parentRes.rows[0].id;

      // 2. Insert 15 distinct line items with varied data
      const lineItems = Array.from({ length: 15 }, (_, i) => ({
        name: `Adversarial Dish ${i + 1}`,
        quantity: (i % 5) + 1,
        unitPrice: (i + 1) * 2500, // paise
        totalPrice: ((i % 5) + 1) * (i + 1) * 2500,
        isVeg: i % 2 === 0,
        notes: `Special instruction for dish ${i + 1}`
      }));

      for (const item of lineItems) {
        await db.query(`
          INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise, is_veg, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [parentId, item.name, item.quantity, item.unitPrice, item.totalPrice, item.isVeg, item.notes]);
      }

      // Verify 15 items exist in DB
      const countBefore = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = $1;
      `, [parentId]);
      assert.equal(Number(countBefore.rows[0].cnt), 15, 'All 15 line items must be inserted');

      // 3. Delete parent token
      const delRes = await db.query(`
        DELETE FROM table_tokens WHERE id = $1 RETURNING id;
      `, [parentId]);
      assert.equal(delRes.rows.length, 1, 'Parent token was deleted');

      // 4. Verify cascade deletion in token_items
      const countAfter = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = $1;
      `, [parentId]);
      assert.equal(Number(countAfter.rows[0].cnt), 0, 'All 15 line items must be completely cascade-deleted');
    });

    await t.test('2.2 Batch Cascade Stress: 5 parents with 12 items each (60 items); batch delete 2 parents, verify 24 deleted, 36 remain', async () => {
      const parentIds = [];
      for (let p = 1; p <= 5; p++) {
        const res = await db.query(`
          INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status)
          VALUES ($1, $2, $3, 888, 'CLOSED')
          RETURNING id;
        `, [TENANT_A, 700 + p, `#${700 + p}`]);
        const pid = res.rows[0].id;
        parentIds.push(pid);

        // Add 12 items per parent
        for (let i = 1; i <= 12; i++) {
          await db.query(`
            INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
            VALUES ($1, $2, $3, 10000, 10000);
          `, [pid, `Parent ${p} - Item ${i}`, 1]);
        }
      }

      // Verify total 60 items across all 5 parents
      const totalCount = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = ANY($1::uuid[]);
      `, [parentIds]);
      assert.equal(Number(totalCount.rows[0].cnt), 60);

      // Batch delete first 2 parents
      const toDelete = [parentIds[0], parentIds[1]];
      await db.query(`DELETE FROM table_tokens WHERE id = ANY($1::uuid[]);`, [toDelete]);

      // Verify 24 items deleted from those 2 parents
      const deletedCheck = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = ANY($1::uuid[]);
      `, [toDelete]);
      assert.equal(Number(deletedCheck.rows[0].cnt), 0, 'Children of deleted parents must be 0');

      // Verify remaining 3 parents still have exactly 36 items
      const remainingParents = [parentIds[2], parentIds[3], parentIds[4]];
      const remainingCheck = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = ANY($1::uuid[]);
      `, [remainingParents]);
      assert.equal(Number(remainingCheck.rows[0].cnt), 36, 'Remaining 3 parents must retain all 36 items');

      // Clean up remaining parents
      await db.query(`DELETE FROM table_tokens WHERE id = ANY($1::uuid[]);`, [remainingParents]);
      const finalCheck = await db.query(`
        SELECT COUNT(*) as cnt FROM token_items WHERE token_id = ANY($1::uuid[]);
      `, [parentIds]);
      assert.equal(Number(finalCheck.rows[0].cnt), 0, 'All items must be 0 after deleting all parents');
    });

    // =========================================================================
    // SECTION 3: Sequence Concurrency on gst_invoice_seq_2026_27
    // =========================================================================
    await t.test('3.1 50 Concurrent nextval queries on gst_invoice_seq_2026_27: zero gaps, zero duplicates', async () => {
      const CONCURRENCY = 50;

      // Concurrently fire 50 nextval queries
      const promises = Array.from({ length: CONCURRENCY }, () =>
        db.query("SELECT nextval('gst_invoice_seq_2026_27') as val;")
      );

      const results = await Promise.all(promises);
      const values = results.map((r) => Number(r.rows[0].val));

      // 1. Length must be exactly 50
      assert.equal(values.length, CONCURRENCY, `Must receive exactly ${CONCURRENCY} values`);

      // 2. Uniqueness check: zero duplicates
      const uniqueSet = new Set(values);
      assert.equal(
        uniqueSet.size,
        CONCURRENCY,
        `Expected ${CONCURRENCY} distinct sequence values, but got ${uniqueSet.size} (duplicate detected!)`
      );

      // 3. Sort numerically and check for zero gaps
      const sorted = [...values].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i] - sorted[i - 1];
        assert.equal(
          diff,
          1,
          `Sequence gap detected between index ${i - 1} (${sorted[i - 1]}) and index ${i} (${sorted[i]}): step was ${diff}, expected 1`
        );
      }

      // 4. Verify all values are positive integers
      for (const val of sorted) {
        assert.ok(Number.isInteger(val) && val > 0, `Sequence value must be positive integer: ${val}`);
      }
    });

    await t.test('3.2 50 Concurrent nextval queries on gst_invoice_seq_2027_28: zero gaps, zero duplicates', async () => {
      const CONCURRENCY = 50;

      const promises = Array.from({ length: CONCURRENCY }, () =>
        db.query("SELECT nextval('gst_invoice_seq_2027_28') as val;")
      );

      const results = await Promise.all(promises);
      const values = results.map((r) => Number(r.rows[0].val));

      assert.equal(values.length, CONCURRENCY);
      const uniqueSet = new Set(values);
      assert.equal(uniqueSet.size, CONCURRENCY, 'Zero duplicates in FY 2027-28 sequence');

      const sorted = [...values].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        const diff = sorted[i] - sorted[i - 1];
        assert.equal(diff, 1, `Gap detected in FY 2027-28 sequence at ${sorted[i - 1]} -> ${sorted[i]}`);
      }
    });

    // =========================================================================
    // SECTION 4: Additional Adversarial Checks (GST Unique Constraint & Negative Checks)
    // =========================================================================
    await t.test('4.1 GST Invoices Composite Unique Constraint uq_gst_invoices_fy_seq rejects duplicate (financial_year, sequence_no)', async () => {
      const FY = '2026-27';
      const SEQ_NO = 88888;
      const invNum1 = `MQR/${FY}/${SEQ_NO}`;
      const invNum2 = `MQR/${FY}/${SEQ_NO}_dup`;

      // Insert first invoice with sequence_no = 88888
      await db.query(`
        INSERT INTO gst_invoices (
          invoice_number, tenant_id, financial_year, sequence_no, subtotal_paise, total_paise
        ) VALUES ($1, $2, $3, $4, 100000, 118000);
      `, [invNum1, TENANT_A, FY, SEQ_NO]);

      // Attempt second insert with identical FY and SEQ_NO
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO gst_invoices (
              invoice_number, tenant_id, financial_year, sequence_no, subtotal_paise, total_paise
            ) VALUES ($1, $2, $3, $4, 200000, 236000);
          `, [invNum2, TENANT_B, FY, SEQ_NO]);
        },
        (err) => {
          assert.equal(err.code, '23505', 'Must fail with 23505 unique violation');
          assert.match(err.message, /uq_gst_invoices_fy_seq/i);
          return true;
        }
      );
    });

    await t.test('4.2 Quantity check constraint on token_items rejects quantity <= 0', async () => {
      const parentRes = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status)
        VALUES ($1, 999, '#999', 999, 'CLOSED')
        RETURNING id;
      `, [TENANT_A]);
      const parentId = parentRes.rows[0].id;

      // Quantity = 0 must fail check constraint
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
            VALUES ($1, 'Zero Qty Item', 0, 1000, 0);
          `, [parentId]);
        },
        (err) => {
          assert.equal(err.code, '23514', 'Must fail with 23514 check_violation');
          return true;
        }
      );

      // Quantity = -1 must fail check constraint
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
            VALUES ($1, 'Negative Qty Item', -1, 1000, -1000);
          `, [parentId]);
        },
        (err) => {
          assert.equal(err.code, '23514', 'Must fail with 23514 check_violation');
          return true;
        }
      );
    });

  } finally {
    // Teardown test artifacts
    try {
      await db.query(`DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id IN ($1, $2));`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM table_tokens WHERE tenant_id IN ($1, $2);`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM restaurant_tables WHERE tenant_id IN ($1, $2);`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM gst_invoices WHERE tenant_id IN ($1, $2);`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM subscription_events WHERE tenant_id IN ($1, $2);`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM users WHERE tenant_id IN ($1, $2);`, [TENANT_A, TENANT_B]);
      await db.query(`DELETE FROM clients WHERE id IN ($1, $2);`, [TENANT_A, TENANT_B]);
    } catch (e) {
      console.error('Adversarial stress cleanup error:', e.message);
    }
    await db.end();
  }
});

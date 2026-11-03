import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { connectDB } from '../db.js';
import { runMigrationPipeline } from '../run_migrations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Milestone 1: Challenger Adversarial Stress Suite', async (t) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false, initializeSchema: false });
  assert.ok(db, 'PostgreSQL database pool connected');

  const CHALLENGE_TENANT_ID = 'adv_chal_tenant_' + Date.now();
  const CHALLENGE_USER_ID = 'adv_chal_user_' + Date.now();
  const CHALLENGE_ORDER_ID = 'adv_chal_order_' + Date.now();
  const CHALLENGE_TABLE_NUM = 888;

  try {
    // 0. Seed test client, user, and order for baseline FK tests
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status)
      VALUES ($1, $2, 'Adversarial Challenger Dhaba', $3, 'active')
      ON CONFLICT (id) DO NOTHING;
    `, [CHALLENGE_TENANT_ID, 'pub_' + CHALLENGE_TENANT_ID, 'slug-' + CHALLENGE_TENANT_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3)
      ON CONFLICT (id) DO NOTHING;
    `, [CHALLENGE_USER_ID, `${CHALLENGE_TENANT_ID}@adv.menuqr.in`, CHALLENGE_TENANT_ID]);

    await db.query(`
      INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, status)
      VALUES ($1, 'Adversarial Customer', $2, 'Adv Dhaba', 'pro', 6799.00, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [CHALLENGE_ORDER_ID, `${CHALLENGE_TENANT_ID}@adv.menuqr.in`]);

    // ==========================================
    // AREA 1: MIGRATION RUNNER IDEMPOTENCY
    // ==========================================
    await t.test('1. Migration Runner Idempotency: 3 consecutive apply runs report 25 applied / 0 pending', async () => {
      for (let run = 1; run <= 3; run++) {
        const res = await runMigrationPipeline({ pool: db, apply: true, log: () => {} });
        assert.equal(res.dryRun, false, `Run ${run} should be in apply mode`);
        assert.deepEqual(res.appliedMigrations, [], `Run ${run} must apply 0 new migrations`);
      }

      // Dry run inspection must confirm 25 applied, 0 pending
      const dryRes = await runMigrationPipeline({ pool: db, apply: false, log: () => {} });
      assert.equal(dryRes.totalMigrations, 25, 'Total migrations discovered must be 25');
      assert.equal(dryRes.appliedCount, 25, 'Applied migrations must be 25');
      assert.equal(dryRes.pendingCount, 0, 'Pending migrations must be 0');
    });

    // ==========================================
    // AREA 2: DUAL-TRACKING TABLE INTEGRITY
    // ==========================================
    await t.test('2. Dual-Tracking Table Integrity: both tables contain 023 and 024 with valid timestamps', async () => {
      const smRes = await db.query(`
        SELECT id, name, applied_at 
        FROM schema_migrations 
        WHERE id IN ('023_subscription_billing_engine.sql', '024_table_tokens_system.sql')
        ORDER BY id;
      `);
      assert.equal(smRes.rows.length, 2, 'schema_migrations must contain both 023 and 024');
      assert.equal(smRes.rows[0].id, '023_subscription_billing_engine.sql');
      assert.equal(smRes.rows[1].id, '024_table_tokens_system.sql');
      assert.ok(smRes.rows[0].applied_at, '023 applied_at must be populated in schema_migrations');
      assert.ok(smRes.rows[1].applied_at, '024 applied_at must be populated in schema_migrations');

      const amRes = await db.query(`
        SELECT id, name, applied_at 
        FROM applied_migrations 
        WHERE id IN ('023_subscription_billing_engine.sql', '024_table_tokens_system.sql')
        ORDER BY id;
      `);
      assert.equal(amRes.rows.length, 2, 'applied_migrations must contain both 023 and 024');
      assert.equal(amRes.rows[0].id, '023_subscription_billing_engine.sql');
      assert.equal(amRes.rows[1].id, '024_table_tokens_system.sql');
      assert.ok(amRes.rows[0].applied_at, '023 applied_at must be populated in applied_migrations');
      assert.ok(amRes.rows[1].applied_at, '024 applied_at must be populated in applied_migrations');
    });

    // ==========================================
    // AREA 3: ROLLBACK & TRANSACTION ISOLATION
    // ==========================================
    await t.test('3. Rollback & Transaction Isolation: syntax/runtime error aborts transaction cleanly without partial commit', async () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'menuqr_adv_mig_'));
      const brokenMigName = '999_corrupted_test_migration.sql';
      const probeTableName = 'temp_probe_rollback_' + Date.now();

      // Write a migration that creates a table then fails with invalid syntax
      fs.writeFileSync(
        path.join(tempDir, brokenMigName),
        `CREATE TABLE ${probeTableName} (id INT PRIMARY KEY);\nINVALID SQL SYNTAX AT LINE 2;`
      );

      // Execute runner pointing to tempDir
      await assert.rejects(
        async () => {
          await runMigrationPipeline({ pool: db, apply: true, migrationsDir: tempDir, log: () => {} });
        },
        (err) => {
          assert.match(err.message, /Fatal error applying migration 999_corrupted_test_migration\.sql/i);
          return true;
        }
      );

      // Verify probe table was rolled back and does NOT exist
      const tableCheck = await db.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        ) AS exists;
      `, [probeTableName]);
      assert.equal(tableCheck.rows[0].exists, false, 'Probe table must be rolled back by transaction');

      // Verify migration was NOT registered in schema_migrations or applied_migrations
      const smCheck = await db.query('SELECT 1 FROM schema_migrations WHERE id = $1', [brokenMigName]);
      assert.equal(smCheck.rowCount, 0, 'Failed migration must not be registered in schema_migrations');

      const amCheck = await db.query('SELECT 1 FROM applied_migrations WHERE id = $1', [brokenMigName]);
      assert.equal(amCheck.rowCount, 0, 'Failed migration must not be registered in applied_migrations');

      // Clean up tempDir
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    // ==========================================
    // AREA 4: BOUNDARY & ENGINE CONSTRAINTS
    // ==========================================
    await t.test('4.1 token_items CHECK constraint: quantity <= 0 is rejected', async () => {
      // Create a dummy token for item testing
      const tokenRes = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
        VALUES ($1, 501, '#501', 50, 'ORDERING', 2)
        RETURNING id;
      `, [CHALLENGE_TENANT_ID]);
      const tokenId = tokenRes.rows[0].id;

      // Negative quantity (-5) -> MUST fail with 23514 (check_violation)
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
            VALUES ($1, 'Negative Dish', -5, 10000, -50000);
          `, [tokenId]);
        },
        (err) => {
          assert.equal(err.code, '23514', 'PostgreSQL must reject quantity <= 0 with check_violation (23514)');
          return true;
        }
      );

      // Zero quantity (0) -> MUST fail with 23514
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
            VALUES ($1, 'Zero Dish', 0, 10000, 0);
          `, [tokenId]);
        },
        (err) => {
          assert.equal(err.code, '23514', 'PostgreSQL must reject quantity = 0 with check_violation (23514)');
          return true;
        }
      );

      // Positive quantity (1) -> MUST succeed
      const validItem = await db.query(`
        INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise)
        VALUES ($1, 'Valid Dish', 1, 15000, 15000)
        RETURNING id;
      `, [tokenId]);
      assert.ok(validItem.rows[0].id, 'Quantity >= 1 must succeed');

      // Cleanup
      await db.query('DELETE FROM table_tokens WHERE id = $1', [tokenId]);
    });

    await t.test('4.2 gst_invoices UNIQUE (financial_year, sequence_no) constraint is enforced', async () => {
      const FY = '2026-27';
      const SEQ_NO = 8888;
      const invNum1 = 'MQR/2026-27/08888';
      const invNum2 = 'MQR/2026-27/08889';

      // Insert first invoice
      const inv1 = await db.query(`
        INSERT INTO gst_invoices (
          invoice_number, order_id, tenant_id, financial_year, sequence_no,
          subtotal_paise, cgst_paise, sgst_paise, total_paise
        ) VALUES (
          $1, $2, $3, $4, $5, 100000, 9000, 9000, 118000
        ) RETURNING id;
      `, [invNum1, CHALLENGE_ORDER_ID, CHALLENGE_TENANT_ID, FY, SEQ_NO]);
      assert.ok(inv1.rows[0].id);

      // Attempt duplicate (financial_year, sequence_no) even with different invoice_number
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO gst_invoices (
              invoice_number, order_id, tenant_id, financial_year, sequence_no,
              subtotal_paise, cgst_paise, sgst_paise, total_paise
            ) VALUES (
              $1, $2, $3, $4, $5, 200000, 18000, 18000, 236000
            );
          `, [invNum2, CHALLENGE_ORDER_ID, CHALLENGE_TENANT_ID, FY, SEQ_NO]);
        },
        (err) => {
          assert.equal(err.code, '23505', 'PostgreSQL must reject duplicate (financial_year, sequence_no) with 23505');
          assert.match(err.message, /uq_gst_invoices_fy_seq/i);
          return true;
        }
      );

      // Cleanup
      await db.query('DELETE FROM gst_invoices WHERE id = $1', [inv1.rows[0].id]);
    });

    await t.test('4.3 gst_invoices UNIQUE (invoice_number) constraint is enforced', async () => {
      const FY = '2026-27';
      const invNum = 'MQR/2026-27/UNIQUE-TEST';

      // Insert first invoice
      const inv1 = await db.query(`
        INSERT INTO gst_invoices (
          invoice_number, order_id, tenant_id, financial_year, sequence_no,
          subtotal_paise, cgst_paise, sgst_paise, total_paise
        ) VALUES (
          $1, $2, $3, $4, 7001, 100000, 9000, 9000, 118000
        ) RETURNING id;
      `, [invNum, CHALLENGE_ORDER_ID, CHALLENGE_TENANT_ID, FY]);
      assert.ok(inv1.rows[0].id);

      // Attempt duplicate invoice_number with different sequence_no
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO gst_invoices (
              invoice_number, order_id, tenant_id, financial_year, sequence_no,
              subtotal_paise, cgst_paise, sgst_paise, total_paise
            ) VALUES (
              $1, $2, $3, $4, 7002, 200000, 18000, 18000, 236000
            );
          `, [invNum, CHALLENGE_ORDER_ID, CHALLENGE_TENANT_ID, FY]);
        },
        (err) => {
          assert.equal(err.code, '23505', 'Must reject duplicate invoice_number');
          assert.match(err.message, /gst_invoices_invoice_number_key/i);
          return true;
        }
      );

      // Cleanup
      await db.query('DELETE FROM gst_invoices WHERE id = $1', [inv1.rows[0].id]);
    });

    await t.test('4.4 Foreign Key Constraints on gst_invoices: invalid tenant or order is rejected', async () => {
      // Invalid tenant_id
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO gst_invoices (
              invoice_number, order_id, tenant_id, financial_year, sequence_no,
              subtotal_paise, cgst_paise, sgst_paise, total_paise
            ) VALUES (
              'MQR/2026-27/INVALID-TENANT', $1, 'non_existent_tenant_99999', '2026-27', 7100, 1000, 90, 90, 1180
            );
          `, [CHALLENGE_ORDER_ID]);
        },
        (err) => {
          assert.equal(err.code, '23503', 'Foreign key violation on invalid tenant_id (23503)');
          return true;
        }
      );

      // Invalid order_id
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO gst_invoices (
              invoice_number, order_id, tenant_id, financial_year, sequence_no,
              subtotal_paise, cgst_paise, sgst_paise, total_paise
            ) VALUES (
              'MQR/2026-27/INVALID-ORDER', 'non_existent_order_99999', $1, '2026-27', 7101, 1000, 90, 90, 1180
            );
          `, [CHALLENGE_TENANT_ID]);
        },
        (err) => {
          assert.equal(err.code, '23503', 'Foreign key violation on invalid order_id (23503)');
          return true;
        }
      );
    });

    await t.test('4.5 restaurant_tables UNIQUE (tenant_id, table_number) constraint is enforced', async () => {
      const table1 = await db.query(`
        INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity)
        VALUES ($1, $2, 'Chal Table 888', 6)
        RETURNING id;
      `, [CHALLENGE_TENANT_ID, CHALLENGE_TABLE_NUM]);
      assert.ok(table1.rows[0].id);

      // Duplicate table number for same tenant
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity)
            VALUES ($1, $2, 'Duplicate Table 888', 4);
          `, [CHALLENGE_TENANT_ID, CHALLENGE_TABLE_NUM]);
        },
        (err) => {
          assert.equal(err.code, '23505', 'Must reject duplicate (tenant_id, table_number)');
          assert.match(err.message, /uq_restaurant_tables_tenant_table/i);
          return true;
        }
      );

      // Same table number for a different tenant should succeed
      const OTHER_TENANT = 'other_tenant_' + Date.now();
      await db.query(`
        INSERT INTO clients (id, public_id, business_name, menu_slug, status)
        VALUES ($1, $2, 'Other Tenant', $3, 'active');
      `, [OTHER_TENANT, 'pub_' + OTHER_TENANT, 'slug-' + OTHER_TENANT]);

      const tableOther = await db.query(`
        INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity)
        VALUES ($1, $2, 'Other Tenant Table 888', 4)
        RETURNING id;
      `, [OTHER_TENANT, CHALLENGE_TABLE_NUM]);
      assert.ok(tableOther.rows[0].id, 'Different tenant can have same table_number');

      // Cleanup
      await db.query('DELETE FROM restaurant_tables WHERE tenant_id IN ($1, $2)', [CHALLENGE_TENANT_ID, OTHER_TENANT]);
      await db.query('DELETE FROM clients WHERE id = $1', [OTHER_TENANT]);
    });

  } finally {
    // Teardown test data
    try {
      await db.query('DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM table_tokens WHERE tenant_id = $1', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM restaurant_tables WHERE tenant_id = $1', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM subscription_events WHERE tenant_id = $1', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM gst_invoices WHERE tenant_id = $1', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM orders WHERE id = $1', [CHALLENGE_ORDER_ID]);
      await db.query('DELETE FROM users WHERE tenant_id = $1', [CHALLENGE_TENANT_ID]);
      await db.query('DELETE FROM clients WHERE id = $1', [CHALLENGE_TENANT_ID]);
    } catch (e) {
      console.error('Adversarial cleanup error:', e.message);
    }
    await db.end();
  }
});

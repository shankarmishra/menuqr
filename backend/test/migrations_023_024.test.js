import '../env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB } from '../db.js';
import { runMigrationPipeline } from '../run_migrations.js';

test('Milestone 1: Database Migrations 023 & 024 Verification', async (t) => {
  const db = await connectDB(process.env.DATABASE_URL, { runMigrations: false, initializeSchema: false });
  assert.ok(db, 'PostgreSQL database pool connected');

  const TEST_TENANT_ID = 'test_m1_tenant_' + Date.now();
  const TEST_USER_ID = 'test_m1_user_' + Date.now();
  const TEST_ORDER_ID = 'test_m1_order_' + Date.now();
  const TEST_TABLE_NUMBER = 777;

  try {
    // Seed temporary test tenant, user, and order for FK validation
    await db.query(`
      INSERT INTO clients (id, public_id, business_name, menu_slug, status)
      VALUES ($1, $2, 'M1 Test Tenant', $3, 'active')
      ON CONFLICT (id) DO NOTHING;
    `, [TEST_TENANT_ID, 'pub_' + TEST_TENANT_ID, 'slug-' + TEST_TENANT_ID]);

    await db.query(`
      INSERT INTO users (id, email, password_hash, role, tenant_id)
      VALUES ($1, $2, 'dummyhash', 'RESTAURANT_OWNER', $3)
      ON CONFLICT (id) DO NOTHING;
    `, [TEST_USER_ID, `${TEST_TENANT_ID}@test.menuqr.in`, TEST_TENANT_ID]);

    await db.query(`
      INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, status)
      VALUES ($1, 'M1 Test Customer', $2, 'M1 Test Business', 'pro', 6799.00, 'COMPLETED')
      ON CONFLICT (id) DO NOTHING;
    `, [TEST_ORDER_ID, `${TEST_TENANT_ID}@test.menuqr.in`]);

    await t.test('1. Migration Pipeline: 023 and 024 are marked as applied with 0 pending', async () => {
      const res = await runMigrationPipeline({ pool: db, apply: false, log: () => {} });
      assert.equal(res.dryRun, true);
      assert.equal(res.pendingCount, 0, 'Should have 0 pending migrations');

      const appliedRows = await db.query(`
        SELECT id FROM applied_migrations WHERE id IN ('023_subscription_billing_engine.sql', '024_table_tokens_system.sql');
      `);
      assert.equal(appliedRows.rows.length, 2, 'Both 023 and 024 must exist in applied_migrations');
    });

    await t.test('2. Schema Tables: all 5 new tables exist in public schema', async () => {
      const res = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('gst_invoices', 'subscription_events', 'restaurant_tables', 'table_tokens', 'token_items');
      `);
      const tables = res.rows.map((r) => r.table_name);
      assert.ok(tables.includes('gst_invoices'), 'gst_invoices table exists');
      assert.ok(tables.includes('subscription_events'), 'subscription_events table exists');
      assert.ok(tables.includes('restaurant_tables'), 'restaurant_tables table exists');
      assert.ok(tables.includes('table_tokens'), 'table_tokens table exists');
      assert.ok(tables.includes('token_items'), 'token_items table exists');
    });

    await t.test('3. Schema Columns: gst_invoices columns and data types', async () => {
      const res = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'gst_invoices';
      `);
      const colMap = Object.fromEntries(res.rows.map((r) => [r.column_name, r.data_type]));

      assert.equal(colMap.id, 'uuid');
      assert.equal(colMap.invoice_number, 'character varying');
      assert.equal(colMap.tenant_id, 'character varying');
      assert.equal(colMap.order_id, 'character varying');
      assert.equal(colMap.financial_year, 'character varying');
      assert.equal(colMap.sequence_no, 'integer');
      assert.equal(colMap.subtotal_paise, 'integer');
      assert.equal(colMap.cgst_paise, 'integer');
      assert.equal(colMap.sgst_paise, 'integer');
      assert.equal(colMap.igst_paise, 'integer');
      assert.equal(colMap.total_paise, 'integer');
      assert.equal(colMap.pdf_generated_at, 'timestamp with time zone');
      assert.equal(colMap.created_at, 'timestamp with time zone');
    });

    await t.test('4. Schema Columns: subscription_events columns and data types', async () => {
      const res = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'subscription_events';
      `);
      const colMap = Object.fromEntries(res.rows.map((r) => [r.column_name, r.data_type]));

      assert.equal(colMap.id, 'uuid');
      assert.equal(colMap.tenant_id, 'character varying');
      assert.equal(colMap.event_type, 'character varying');
      assert.equal(colMap.order_id, 'character varying');
      assert.equal(colMap.actor_user_id, 'character varying');
      assert.equal(colMap.metadata, 'jsonb');
      assert.equal(colMap.created_at, 'timestamp with time zone');
    });

    await t.test('5. Schema Columns: altered orders and subscriptions tables have new columns', async () => {
      const ordersCols = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
          AND column_name IN ('order_subtype', 'proration_credit_paise', 'upgrade_from_plan', 'gst_invoice_id');
      `);
      const oMap = Object.fromEntries(ordersCols.rows.map((r) => [r.column_name, r.data_type]));
      assert.equal(oMap.order_subtype, 'character varying');
      assert.equal(oMap.proration_credit_paise, 'integer');
      assert.equal(oMap.upgrade_from_plan, 'character varying');
      assert.equal(oMap.gst_invoice_id, 'uuid');

      const subsCols = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
          AND column_name IN ('previous_plan_id', 'upgraded_at', 'renewal_count', 'last_renewed_at');
      `);
      const sMap = Object.fromEntries(subsCols.rows.map((r) => [r.column_name, r.data_type]));
      assert.equal(sMap.previous_plan_id, 'character varying');
      assert.equal(sMap.upgraded_at, 'timestamp with time zone');
      assert.equal(sMap.renewal_count, 'integer');
      assert.equal(sMap.last_renewed_at, 'timestamp with time zone');
    });

    await t.test('6. Schema Columns: restaurant_tables, table_tokens, and token_items', async () => {
      const restCols = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'restaurant_tables';
      `);
      const rMap = Object.fromEntries(restCols.rows.map((r) => [r.column_name, r.data_type]));
      assert.equal(rMap.id, 'uuid');
      assert.equal(rMap.tenant_id, 'character varying');
      assert.equal(rMap.table_number, 'integer');
      assert.equal(rMap.capacity, 'integer');
      assert.equal(rMap.is_active, 'boolean');

      const tokenCols = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'table_tokens';
      `);
      const tMap = Object.fromEntries(tokenCols.rows.map((r) => [r.column_name, r.data_type]));

      assert.equal(tMap.id, 'uuid');
      assert.equal(tMap.tenant_id, 'character varying');
      assert.equal(tMap.token_number, 'integer');
      assert.equal(tMap.token_code, 'character varying');
      assert.equal(tMap.table_id, 'uuid');
      assert.equal(tMap.table_number, 'integer');
      assert.equal(tMap.status, 'character varying');
      assert.equal(tMap.covers, 'integer');
      assert.equal(tMap.subtotal_paise, 'integer');
      assert.equal(tMap.tax_paise, 'integer');
      assert.equal(tMap.total_paise, 'integer');
      assert.equal(tMap.payment_method, 'character varying');
      assert.equal(tMap.settled_by_id, 'character varying');
      assert.equal(tMap.items_json, 'jsonb');
      assert.equal(tMap.settled_at, 'timestamp with time zone');
      assert.equal(tMap.created_at, 'timestamp with time zone');

      const itemCols = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'token_items';
      `);
      const iMap = Object.fromEntries(itemCols.rows.map((r) => [r.column_name, r.data_type]));
      assert.equal(iMap.id, 'uuid');
      assert.equal(iMap.token_id, 'uuid');
      assert.equal(iMap.item_name, 'character varying');
      assert.equal(iMap.quantity, 'integer');
      assert.equal(iMap.unit_price_paise, 'integer');
      assert.equal(iMap.total_price_paise, 'integer');
    });

    await t.test('7. Sequence Generation: FY sequences increment atomically', async () => {
      const seq1 = await db.query("SELECT nextval('gst_invoice_seq_2026_27') as val;");
      assert.ok(Number(seq1.rows[0].val) >= 1, 'gst_invoice_seq_2026_27 generates valid sequence');

      const seq2 = await db.query("SELECT nextval('gst_invoice_seq_2027_28') as val;");
      assert.ok(Number(seq2.rows[0].val) >= 1, 'gst_invoice_seq_2027_28 generates valid sequence');
    });

    await t.test('8. Indexes: partial unique index idx_active_table_tokens and query indexes exist', async () => {
      const res = await db.query(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname IN (
            'idx_active_table_tokens',
            'idx_gst_invoices_tenant_created',
            'idx_gst_invoices_fy_seq',
            'idx_sub_events_tenant_created',
            'idx_orders_gst_invoice_id',
            'idx_orders_subtype',
            'idx_restaurant_tables_tenant_table',
            'idx_table_tokens_tenant_status',
            'idx_token_items_token_id'
          );
      `);
      const indexMap = Object.fromEntries(res.rows.map((r) => [r.indexname, r.indexdef]));

      assert.ok(indexMap.idx_active_table_tokens, 'idx_active_table_tokens exists');
      assert.match(indexMap.idx_active_table_tokens, /UNIQUE INDEX/i);
      assert.match(indexMap.idx_active_table_tokens, /WHERE/i);
      assert.match(indexMap.idx_active_table_tokens, /ISSUED/i);
      assert.match(indexMap.idx_active_table_tokens, /ORDERING/i);
      assert.match(indexMap.idx_active_table_tokens, /DINING/i);
      assert.match(indexMap.idx_active_table_tokens, /BILL_REQUESTED/i);
      assert.match(indexMap.idx_active_table_tokens, /UNPAID/i);

      assert.ok(indexMap.idx_gst_invoices_tenant_created, 'idx_gst_invoices_tenant_created exists');
      assert.ok(indexMap.idx_table_tokens_tenant_status, 'idx_table_tokens_tenant_status exists');
      assert.ok(indexMap.idx_token_items_token_id, 'idx_token_items_token_id exists');
    });

    await t.test('9. Active Token Collision Guard: idx_active_table_tokens rejects duplicate active token on same table', async () => {
      // 1. Create a table in restaurant_tables
      const tableRes = await db.query(`
        INSERT INTO restaurant_tables (tenant_id, table_number, label, capacity)
        VALUES ($1, $2, 'Table 777', 4)
        RETURNING id;
      `, [TEST_TENANT_ID, TEST_TABLE_NUMBER]);
      const tableId = tableRes.rows[0].id;

      // 2. Insert first active token (status = 'ORDERING')
      const token1Res = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
        VALUES ($1, 1, '#001', $2, $3, 'ORDERING', 2)
        RETURNING id;
      `, [TEST_TENANT_ID, tableId, TEST_TABLE_NUMBER]);
      const token1Id = token1Res.rows[0].id;
      assert.ok(token1Id);

      // 3. Attempt to insert second active token for the same table (status = 'DINING') -> MUST throw 23505
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
            VALUES ($1, 2, '#002', $2, $3, 'DINING', 3);
          `, [TEST_TENANT_ID, tableId, TEST_TABLE_NUMBER]);
        },
        (err) => {
          assert.equal(err.code, '23505', 'Must throw unique_violation error code 23505');
          assert.match(err.message, /idx_active_table_tokens/i);
          return true;
        }
      );

      // 4. Attempt to insert another active token with status 'BILL_REQUESTED' -> MUST also fail
      await assert.rejects(
        async () => {
          await db.query(`
            INSERT INTO table_tokens (tenant_id, token_number, token_code, table_id, table_number, status, covers)
            VALUES ($1, 3, '#003', $2, $3, 'BILL_REQUESTED', 1);
          `, [TEST_TENANT_ID, tableId, TEST_TABLE_NUMBER]);
        },
        (err) => {
          assert.equal(err.code, '23505');
          return true;
        }
      );
    });

    await t.test('10. Table Release Upon Settlement: settling token allows issuing a new active token for same table', async () => {
      // 1. Transition the active token to 'SETTLED'
      await db.query(`
        UPDATE table_tokens 
        SET status = 'SETTLED', settled_at = CURRENT_TIMESTAMP, payment_method = 'UPI', settled_by_id = $1
        WHERE tenant_id = $2 AND table_number = $3 AND status = 'ORDERING';
      `, [TEST_USER_ID, TEST_TENANT_ID, TEST_TABLE_NUMBER]);

      // 2. Now inserting a new active token on the same table MUST succeed cleanly
      const token2Res = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
        VALUES ($1, 2, '#002', $2, 'ORDERING', 4)
        RETURNING id, status;
      `, [TEST_TENANT_ID, TEST_TABLE_NUMBER]);

      assert.ok(token2Res.rows[0].id);
      assert.equal(token2Res.rows[0].status, 'ORDERING');

      // 3. Close the second token
      await db.query(`
        UPDATE table_tokens 
        SET status = 'CLOSED', closed_at = CURRENT_TIMESTAMP 
        WHERE id = $1;
      `, [token2Res.rows[0].id]);

      // 4. Inserting token 3 with 'ISSUED' status should also succeed
      const token3Res = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
        VALUES ($1, 3, '#003', $2, 'ISSUED', 2)
        RETURNING id, status;
      `, [TEST_TENANT_ID, TEST_TABLE_NUMBER]);

      assert.ok(token3Res.rows[0].id);
      assert.equal(token3Res.rows[0].status, 'ISSUED');
    });

    await t.test('11. Line Items & Cascading Deletion: token_items cascades when parent token is deleted', async () => {
      // 1. Create a parent token
      const tokenRes = await db.query(`
        INSERT INTO table_tokens (tenant_id, token_number, token_code, table_number, status, covers)
        VALUES ($1, 99, '#099', 999, 'CLOSED', 1)
        RETURNING id;
      `, [TEST_TENANT_ID]);
      const tokenId = tokenRes.rows[0].id;

      // 2. Add child items to token_items
      await db.query(`
        INSERT INTO token_items (token_id, item_name, quantity, unit_price_paise, total_price_paise, is_veg)
        VALUES 
          ($1, 'Butter Chicken', 1, 35000, 35000, false),
          ($1, 'Garlic Naan', 2, 6000, 12000, true);
      `, [tokenId]);

      const countBefore = await db.query('SELECT COUNT(*) FROM token_items WHERE token_id = $1;', [tokenId]);
      assert.equal(Number(countBefore.rows[0].count), 2);

      // 3. Delete parent token
      await db.query('DELETE FROM table_tokens WHERE id = $1;', [tokenId]);

      // 4. Verify cascade deletion in token_items
      const countAfter = await db.query('SELECT COUNT(*) FROM token_items WHERE token_id = $1;', [tokenId]);
      assert.equal(Number(countAfter.rows[0].count), 0, 'token_items should cascade delete when parent token is deleted');
    });

    await t.test('12. Subscription & GST Invoice Insertion: validates all foreign keys and column constraints', async () => {
      // 1. Insert into gst_invoices referencing client and order
      const invRes = await db.query(`
        INSERT INTO gst_invoices (
          invoice_number, order_id, tenant_id, financial_year, sequence_no,
          plan_id, plan_name, plan_amount_paise, subtotal_paise, cgst_paise, sgst_paise, total_paise,
          buyer_name, customer_name, customer_state
        ) VALUES (
          $1, $2, $3, '2026-27', 999,
          'pro', 'Pro Annual', 679900, 679900, 61191, 61191, 802282,
          'Test Dhaba Buyer', 'Test Dhaba Customer', 'Delhi'
        ) RETURNING id, invoice_number;
      `, ['MQR/2026-27/' + Date.now().toString().slice(-5), TEST_ORDER_ID, TEST_TENANT_ID]);

      const invoiceId = invRes.rows[0].id;
      assert.ok(invoiceId);

      // 2. Link invoice to order
      await db.query(`
        UPDATE orders 
        SET order_subtype = 'RENEWAL', proration_credit_paise = 150000, gst_invoice_id = $1 
        WHERE id = $2;
      `, [invoiceId, TEST_ORDER_ID]);

      // 3. Insert subscription event
      const eventRes = await db.query(`
        INSERT INTO subscription_events (
          tenant_id, event_type, from_plan, to_plan, order_id, invoice_id, actor_user_id, metadata
        ) VALUES (
          $1, 'UPGRADE', 'starter', 'pro', $2, $3, $4, '{"reason": "M1 Test Upgrade"}'::jsonb
        ) RETURNING id;
      `, [TEST_TENANT_ID, TEST_ORDER_ID, invoiceId, TEST_USER_ID]);

      assert.ok(eventRes.rows[0].id);

      // 4. Verify linking
      const checkOrder = await db.query('SELECT order_subtype, gst_invoice_id FROM orders WHERE id = $1;', [TEST_ORDER_ID]);
      assert.equal(checkOrder.rows[0].order_subtype, 'RENEWAL');
      assert.equal(checkOrder.rows[0].gst_invoice_id, invoiceId);
    });
  } finally {
    // Clean up test data
    try {
      await db.query('DELETE FROM token_items WHERE token_id IN (SELECT id FROM table_tokens WHERE tenant_id = $1)', [TEST_TENANT_ID]);
      await db.query('DELETE FROM table_tokens WHERE tenant_id = $1', [TEST_TENANT_ID]);
      await db.query('DELETE FROM restaurant_tables WHERE tenant_id = $1', [TEST_TENANT_ID]);
      await db.query('DELETE FROM subscription_events WHERE tenant_id = $1', [TEST_TENANT_ID]);
      await db.query('DELETE FROM gst_invoices WHERE tenant_id = $1', [TEST_TENANT_ID]);
      await db.query('DELETE FROM orders WHERE id = $1', [TEST_ORDER_ID]);
      await db.query('DELETE FROM users WHERE tenant_id = $1', [TEST_TENANT_ID]);
      await db.query('DELETE FROM clients WHERE id = $1', [TEST_TENANT_ID]);
    } catch (e) {
      console.error('Cleanup error:', e.message);
    }
    await db.end();
  }
});

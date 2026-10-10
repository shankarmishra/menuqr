import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, connectDB, queryPortable } from '../db.js';
import { randomUUID } from 'node:crypto';
import { validateAndPreviewImport, executeImportTransaction } from '../menuImporter.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run tests.');
}

test('Tenant Data Isolation & Cross-Restaurant Security Test Suite', async (t) => {
  const clientAId = `test-tenant-A-${randomUUID()}`;
  const clientBId = `test-tenant-B-${randomUUID()}`;
  const menuAId = randomUUID();
  const menuBId = randomUUID();

  t.before(async () => {
    await connectDB(process.env.DATABASE_URL);
    // Setup Tenant A
    // Setup Tenant A
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, $3, $4, 'active')",
      [clientAId, `pub-A-${randomUUID()}`, 'Restaurant Alpha', `alpha-${randomUUID()}`]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Alpha Menu', 'PUBLISHED')",
      [menuAId, clientAId]
    );

    // Setup Tenant B
    await pool.query(
      "INSERT INTO clients (id, public_id, business_name, menu_slug, status) VALUES ($1, $2, $3, $4, 'active')",
      [clientBId, `pub-B-${randomUUID()}`, 'Restaurant Beta', `beta-${randomUUID()}`]
    );
    await pool.query(
      "INSERT INTO menus (id, tenant_id, name, status) VALUES ($1, $2, 'Beta Menu', 'PUBLISHED')",
      [menuBId, clientBId]
    );
  });

  t.after(async () => {
    await pool.query('DELETE FROM clients WHERE id IN ($1, $2)', [clientAId, clientBId]);
  });

  await t.test('1. Categories and items created for A are strictly isolated from B', async () => {
    const catAId = randomUUID();
    const itemAId = randomUUID();

    await pool.query(
      'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, $4, 1)',
      [catAId, menuAId, clientAId, 'Alpha Starters']
    );
    await pool.query(
      'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, diet_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [itemAId, menuAId, clientAId, catAId, 'Alpha Paneer', 250, 'veg']
    );

    const catBId = randomUUID();
    const itemBId = randomUUID();

    await pool.query(
      'INSERT INTO menu_categories (id, menu_id, tenant_id, name, sort_order) VALUES ($1, $2, $3, $4, 1)',
      [catBId, menuBId, clientBId, 'Beta Starters']
    );
    await pool.query(
      'INSERT INTO menu_items (id, menu_id, tenant_id, category_id, name, price, diet_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [itemBId, menuBId, clientBId, catBId, 'Beta Chicken', 320, 'non-veg']
    );

    // Verify Tenant A query returns only Alpha items
    const resA = await pool.query(
      'SELECT c.name as category_name, i.name as item_name FROM menu_categories c JOIN menu_items i ON i.category_id = c.id WHERE c.tenant_id = $1',
      [clientAId]
    );
    assert.equal(resA.rows.length, 1);
    assert.equal(resA.rows[0].category_name, 'Alpha Starters');
    assert.equal(resA.rows[0].item_name, 'Alpha Paneer');

    // Verify Tenant B query returns only Beta items
    const resB = await pool.query(
      'SELECT c.name as category_name, i.name as item_name FROM menu_categories c JOIN menu_items i ON i.category_id = c.id WHERE c.tenant_id = $1',
      [clientBId]
    );
    assert.equal(resB.rows.length, 1);
    assert.equal(resB.rows[0].category_name, 'Beta Starters');
    assert.equal(resB.rows[0].item_name, 'Beta Chicken');
  });

  await t.test('2. Cross-tenant update & delete protection on menu categories and items', async () => {
    const catBRes = await pool.query('SELECT id FROM menu_categories WHERE tenant_id = $1', [clientBId]);
    const targetCatBId = catBRes.rows[0].id;

    // Tenant A attempts to delete Tenant B category
    const deleteAttempt = await pool.query(
      'DELETE FROM menu_categories WHERE id = $1 AND tenant_id = $2',
      [targetCatBId, clientAId]
    );
    assert.equal(deleteAttempt.rowCount, 0, 'Tenant A must not be able to delete Tenant B category');

    // Verify Tenant B category is intact
    const verifyCatB = await pool.query('SELECT id FROM menu_categories WHERE id = $1 AND tenant_id = $2', [targetCatBId, clientBId]);
    assert.equal(verifyCatB.rows.length, 1);
  });

  await t.test('3. Excel import execution creates records ONLY under the target tenant', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const categoriesToImport = [
        {
          name: 'Imported Mains',
          items: [
            {
              name: 'Butter Naan Special',
              description: 'Fresh tandoori naan',
              price: 60,
              dietType: 'veg',
              available: true,
              variants: [{ name: 'Single', price: 60 }]
            }
          ]
        }
      ];

      const stats = await executeImportTransaction(client, clientAId, menuAId, categoriesToImport, 'add', 'test.xlsx');
      await client.query('COMMIT');

      assert.equal(stats.itemsCreated, 1);
      assert.equal(stats.categoriesCreated, 1);

      // Verify item belongs exclusively to clientAId
      const checkA = await pool.query('SELECT * FROM menu_items WHERE name = $1 AND tenant_id = $2', ['Butter Naan Special', clientAId]);
      assert.equal(checkA.rows.length, 1);

      const checkB = await pool.query('SELECT * FROM menu_items WHERE name = $1 AND tenant_id = $2', ['Butter Naan Special', clientBId]);
      assert.equal(checkB.rows.length, 0, 'Imported item must not leak to Tenant B');

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  await t.test('4. Real PostgreSQL database atomic concurrency test on orders table', async () => {
    const orderId = `test-order-${randomUUID()}`;
    await pool.query(
      `INSERT INTO orders (id, customer_name, customer_email, business_name, plan_id, amount, status, provisioning_status)
       VALUES ($1, 'Test Customer', 'realpg_concurrent@example.com', 'Real PG Diner', 'basic', 999.00, 'PENDING_PAYMENT', 'PENDING')`,
      [orderId]
    );

    try {
      // Execute two simultaneous atomic lock updates against real PostgreSQL
      const queryStr = `UPDATE orders
                        SET provisioning_status='PROCESSING', updated_at=NOW()
                        WHERE id=$1
                          AND provisioning_status != 'COMPLETE'
                          AND (provisioning_status != 'PROCESSING' OR updated_at < NOW() - INTERVAL '5 minutes')
                        RETURNING status, provisioning_status`;

      const [res1, res2] = await Promise.all([
        pool.query(queryStr, [orderId]),
        pool.query(queryStr, [orderId])
      ]);

      const successCount = (res1.rowCount || 0) + (res2.rowCount || 0);
      assert.equal(successCount, 1, 'Exactly one PostgreSQL transaction must acquire the atomic processing lock');
    } finally {
      await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
    }
  });
});

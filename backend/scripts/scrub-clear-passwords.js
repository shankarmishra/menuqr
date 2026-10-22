/**
 * Script: Scrub clear_password from orders.metadata
 * Remediates Issue #2 by purging plaintext passwords.
 *
 * NOTE: DO NOT RUN AUTOMATICALLY. Provided for manual execution by operator.
 * Run with: node --env-file=backend/.env backend/scripts/scrub-clear-passwords.js
 */

import { pool } from '../db.js';

async function scrubClearPasswords() {
  console.log('[Scrub] Connecting to database...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const checkRes = await client.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE metadata ? 'clear_password'
    `);
    const countBefore = Number(checkRes.rows[0].count);
    console.log(`[Scrub] Found ${countBefore} orders containing clear_password in metadata.`);

    if (countBefore === 0) {
      console.log('[Scrub] No orders contain clear_password. Database is already clean.');
      await client.query('ROLLBACK');
      return;
    }

    const updateRes = await client.query(`
      UPDATE orders
      SET metadata = metadata - 'clear_password',
          updated_at = CURRENT_TIMESTAMP
      WHERE metadata ? 'clear_password'
    `);
    console.log(`[Scrub] Successfully scrubbed ${updateRes.rowCount} orders.`);

    const verifyRes = await client.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE metadata ? 'clear_password'
    `);
    const countAfter = Number(verifyRes.rows[0].count);

    if (countAfter > 0) {
      throw new Error(`Sanitization incomplete: ${countAfter} records still have clear_password.`);
    }

    await client.query('COMMIT');
    console.log('[Scrub] Migration committed successfully. Zero plaintext passwords remain.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Scrub] Transaction rolled back due to error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('scrub-clear-passwords.js')) {
  scrubClearPasswords().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

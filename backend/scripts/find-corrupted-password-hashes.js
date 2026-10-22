/**
 * Script: Find users with corrupted password_hash ('[object Promise]')
 * Remediates Issue #3 audit requirements.
 *
 * Usage: node --env-file=backend/.env backend/scripts/find-corrupted-password-hashes.js
 */

import { pool } from '../db.js';

async function findCorruptedPasswordHashes() {
  console.log('[Audit] Searching for users with corrupted password hashes...');
  try {
    const res = await pool.query(`
      SELECT id, email, role, tenant_id, password_hash, created_at
      FROM users
      WHERE password_hash = '[object Promise]'
         OR password_hash LIKE '%Promise%'
         OR password_hash IS NULL
      ORDER BY created_at DESC
    `);

    if (res.rows.length === 0) {
      console.log('\x1b[32m%s\x1b[0m', '✓ No users found with "[object Promise]" or corrupted password hashes.');
      return;
    }

    console.log('\x1b[31m%s\x1b[0m', `Found ${res.rows.length} affected user(s) with corrupted password hashes:`);
    console.table(res.rows.map(user => ({
      ID: user.id,
      Email: user.email,
      Role: user.role,
      TenantID: user.tenant_id,
      HashValue: user.password_hash,
      CreatedAt: user.created_at,
    })));

    console.log('\nRemediation Instructions:');
    console.log('1. For restaurant owners, initiate a secure password reset via /api/auth/reset-password or invite email.');
    console.log('2. Alternatively, generate a fresh PBKDF2 hash using backend/auth.js:hashPassword and UPDATE users SET password_hash = $1 WHERE id = $2.');
  } catch (err) {
    console.error('[Audit Error]', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('find-corrupted-password-hashes.js')) {
  findCorruptedPasswordHashes().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { findCorruptedPasswordHashes };

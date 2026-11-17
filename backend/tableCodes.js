import { randomInt, randomUUID } from 'node:crypto';
import { pool } from './db.js';

/**
 * Per-table codes printed inside the table QR (?tc=K7Q92M).
 *
 * Every table sticker of a restaurant points to the same permanent link; only this short code
 * differs. The server, never the diner, turns the code into a table number, so a diner cannot put
 * an order on another table's bill by editing the URL or typing a number.
 */

// No 0/O/1/I/L: a printed code is never misread. 31^6 ≈ 887 million codes.
export const TABLE_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export const TABLE_CODE_LENGTH = 6;
// Restaurants created before table codes existed may have printed ?table=N stickers.
export const LEGACY_TABLE_CUTOFF = new Date('2026-11-13T00:00:00Z');

export function generateTableCode(length = TABLE_CODE_LENGTH) {
  let code = '';
  for (let i = 0; i < length; i++) code += TABLE_CODE_ALPHABET[randomInt(TABLE_CODE_ALPHABET.length)];
  return code;
}

/** Uppercases and strips separators; returns null unless the result is a well-formed code. */
export function normalizeTableCode(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const value = String(raw).toUpperCase().replace(/[\s-]/g, '');
  if (value.length < 6 || value.length > 12) return null;
  for (const ch of value) if (!TABLE_CODE_ALPHABET.includes(ch)) return null;
  return value;
}

/** Parses a legacy table value ("4", "Table 4") into a positive integer, or null. */
export function parseLegacyTableNumber(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (!/^[0-9]{1,4}$/.test(digits)) return null;
  const n = parseInt(digits, 10);
  return n >= 1 && n <= 9999 ? n : null;
}

function rowTableNumber(row) {
  if (Number.isInteger(row.table_number) && row.table_number > 0) return row.table_number;
  return parseLegacyTableNumber(row.label);
}

/** Resolves a code for one restaurant. Returns { tableNumber, label } or null. */
export async function resolveTableCode(tenantId, rawCode, executor = pool) {
  const code = normalizeTableCode(rawCode);
  if (!tenantId || !code) return null;
  const res = await executor.query(
    'SELECT label, table_number FROM dining_tables WHERE tenant_id = $1 AND qr_code = $2 AND is_active = true',
    [tenantId, code]
  );
  const row = res.rows[0];
  if (!row) return null;
  const tableNumber = rowTableNumber(row);
  if (!tableNumber) return null;
  return { tableNumber, label: row.label };
}

/** Whether this restaurant still accepts old ?table=N links (owner setting; default by signup date). */
export async function isLegacyTableAllowed(tenantId, executor = pool) {
  const res = await executor.query(
    `SELECT o.allow_legacy_table_param AS flag, c.created_at
       FROM clients c
       LEFT JOIN ordering_settings o ON o.tenant_id = c.id
      WHERE c.id = $1`,
    [tenantId]
  );
  const row = res.rows[0];
  if (!row) return false;
  if (typeof row.flag === 'boolean') return row.flag;
  return Boolean(row.created_at && new Date(row.created_at) < LEGACY_TABLE_CUTOFF);
}

/**
 * Decides the table of a dine-in request from what the diner's link carried.
 * A valid code always wins; a bare table number is accepted only for restaurants that still allow
 * old stickers. Never trusts a number the client made up when a code is present.
 * Returns { tableNumber, source: 'code' | 'legacy' } or { error }.
 */
export async function resolveDineInTable(tenantId, { tableCode, legacyTable } = {}, executor = pool) {
  if (tableCode) {
    const hit = await resolveTableCode(tenantId, tableCode, executor);
    if (hit) return { tableNumber: hit.tableNumber, label: hit.label, source: 'code' };
    return { error: 'INVALID_TABLE_CODE' };
  }
  const legacyNumber = parseLegacyTableNumber(legacyTable);
  if (legacyNumber && await isLegacyTableAllowed(tenantId, executor)) {
    return { tableNumber: legacyNumber, label: String(legacyNumber), source: 'legacy' };
  }
  return { error: 'TABLE_CODE_REQUIRED' };
}

async function insertWithFreshCode(executor, params) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateTableCode();
    try {
      await executor.query(params.sql, params.values(code));
      return code;
    } catch (err) {
      if (err && err.code === '23505' && String(err.constraint || err.detail || '').includes('qr_code')) continue;
      throw err;
    }
  }
  throw new Error('Could not allocate a unique table code.');
}

/**
 * Makes sure tables start..end exist for the restaurant and each has a code. Existing codes are
 * kept (stickers already printed keep working). Returns the rows of that range.
 */
export async function ensureTables(tenantId, start, end, executor = pool) {
  const existing = await executor.query(
    'SELECT id, label, table_number, qr_code FROM dining_tables WHERE tenant_id = $1',
    [tenantId]
  );
  const byNumber = new Map();
  const labels = new Set();
  for (const row of existing.rows) {
    labels.add(row.label);
    const n = rowTableNumber(row);
    if (n && !byNumber.has(n)) byNumber.set(n, row);
  }

  for (let n = start; n <= end; n++) {
    const row = byNumber.get(n);
    if (row) {
      if (!row.table_number || !row.qr_code) {
        await insertWithFreshCode(executor, {
          sql: `UPDATE dining_tables
                   SET table_number = COALESCE(table_number, $2),
                       qr_code = COALESCE(qr_code, $3),
                       code_rotated_at = COALESCE(code_rotated_at, NOW()),
                       is_active = true, updated_at = NOW()
                 WHERE id = $1 AND tenant_id = $4`,
          values: (code) => [row.id, n, code, tenantId],
        });
      }
      continue;
    }
    const label = [String(n), `Table ${n}`, `T${n}`, `Table ${n} (new)`].find((candidate) => !labels.has(candidate));
    if (!label) continue;
    labels.add(label);
    await insertWithFreshCode(executor, {
      sql: `INSERT INTO dining_tables (id, tenant_id, label, sort_order, table_number, qr_code, code_rotated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      values: (code) => [randomUUID(), tenantId, label, n, n, code],
    });
  }

  const res = await executor.query(
    `SELECT id, label, table_number AS "tableNumber", qr_code AS "code", code_rotated_at AS "codeRotatedAt"
       FROM dining_tables
      WHERE tenant_id = $1 AND table_number BETWEEN $2 AND $3 AND is_active = true
      ORDER BY table_number ASC`,
    [tenantId, start, end]
  );
  return res.rows;
}

/** Gives every table of the restaurant that has none a number (from its label) and a code. */
export async function backfillTableCodes(tenantId, executor = pool) {
  const res = await executor.query(
    'SELECT id, label, table_number, qr_code FROM dining_tables WHERE tenant_id = $1 AND (qr_code IS NULL OR table_number IS NULL)',
    [tenantId]
  );
  for (const row of res.rows) {
    const n = rowTableNumber(row);
    await insertWithFreshCode(executor, {
      sql: `UPDATE dining_tables
               SET table_number = COALESCE(table_number, $3),
                   qr_code = COALESCE(qr_code, $4),
                   code_rotated_at = COALESCE(code_rotated_at, NOW()),
                   updated_at = NOW()
             WHERE id = $1 AND tenant_id = $2`,
      values: (code) => [row.id, tenantId, n, code],
    });
  }
  return res.rows.length;
}

/** Gives one table a new code (old sticker of that table stops working). Returns the new row or null. */
export async function rotateTableCode(tenantId, tableId, executor = pool) {
  await insertWithFreshCode(executor, {
    sql: `UPDATE dining_tables SET qr_code = $3, code_rotated_at = NOW(), updated_at = NOW()
           WHERE id = $1 AND tenant_id = $2`,
    values: (code) => [tableId, tenantId, code],
  });
  const res = await executor.query(
    `SELECT id, label, table_number AS "tableNumber", qr_code AS "code", code_rotated_at AS "codeRotatedAt"
       FROM dining_tables WHERE id = $1 AND tenant_id = $2`,
    [tableId, tenantId]
  );
  return res.rows[0] || null;
}

/**
 * Table codes inside the table QR (?tc=K7Q92M), the CSRF rule for diner routes, and the public bill
 * view. No database: the table lookups run against a tiny fake executor.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TABLE_CODE_ALPHABET,
  generateTableCode,
  normalizeTableCode,
  parseLegacyTableNumber,
  resolveTableCode,
  resolveDineInTable,
} from '../tableCodes.js';
import { needsCsrfCheck } from '../csrf.js';
import { publicTokenView } from '../tokenStream.js';

/** A fake pg executor holding dining_tables rows and one restaurant's legacy setting. */
function fakeExecutor({ tables = [], legacyFlag = null, createdAt = new Date('2026-01-01T00:00:00Z') } = {}) {
  return {
    async query(sql, params) {
      if (/FROM dining_tables WHERE tenant_id = \$1 AND qr_code = \$2/.test(sql)) {
        const [tenantId, code] = params;
        return { rows: tables.filter((t) => t.tenant_id === tenantId && t.qr_code === code && t.is_active !== false) };
      }
      if (/FROM clients c\s+LEFT JOIN ordering_settings/.test(sql)) {
        return { rows: [{ flag: legacyFlag, created_at: createdAt }] };
      }
      throw new Error(`unexpected query: ${sql}`);
    },
  };
}

const TABLES = [
  { tenant_id: 'tenant-a', label: '4', table_number: 4, qr_code: 'K7Q92M', is_active: true },
  { tenant_id: 'tenant-a', label: 'Table 9', table_number: null, qr_code: 'ZZ88HH', is_active: true },
  { tenant_id: 'tenant-a', label: '12', table_number: 12, qr_code: 'QQQQ22', is_active: false },
  { tenant_id: 'tenant-b', label: '4', table_number: 4, qr_code: 'BBBB44', is_active: true },
];

test('generated codes use only the unambiguous alphabet and normalise to themselves', () => {
  for (let i = 0; i < 200; i++) {
    const code = generateTableCode();
    assert.equal(code.length, 6);
    for (const ch of code) assert.ok(TABLE_CODE_ALPHABET.includes(ch), `bad char ${ch}`);
    assert.equal(normalizeTableCode(code), code);
  }
  for (const ch of '01ILO') assert.ok(!TABLE_CODE_ALPHABET.includes(ch), `${ch} must not be used`);
});

test('normalizeTableCode accepts printed forms and rejects junk', () => {
  assert.equal(normalizeTableCode('k7q9-2m'), 'K7Q92M');
  assert.equal(normalizeTableCode(' K7Q9 2M '), 'K7Q92M');
  assert.equal(normalizeTableCode('K7Q0-2M'), null, 'zero is not in the alphabet');
  assert.equal(normalizeTableCode('AB'), null);
  assert.equal(normalizeTableCode("K7Q92M'; DROP"), null);
  assert.equal(normalizeTableCode(null), null);
  assert.equal(normalizeTableCode(undefined), null);
});

test('parseLegacyTableNumber reads old ?table=N values only', () => {
  assert.equal(parseLegacyTableNumber('4'), 4);
  assert.equal(parseLegacyTableNumber('Table 4'), 4);
  assert.equal(parseLegacyTableNumber('0'), null);
  assert.equal(parseLegacyTableNumber('Corner booth'), null);
  assert.equal(parseLegacyTableNumber('12345'), null);
});

test('a code resolves only for its own restaurant and only while the table is active', async () => {
  const db = fakeExecutor({ tables: TABLES });
  assert.deepEqual(await resolveTableCode('tenant-a', 'K7Q9-2M', db), { tableNumber: 4, label: '4' });
  assert.deepEqual(await resolveTableCode('tenant-a', 'zz88hh', db), { tableNumber: 9, label: 'Table 9' }, 'number comes from the label when the column is empty');
  assert.equal(await resolveTableCode('tenant-b', 'K7Q92M', db), null, 'another restaurant cannot use tenant-a codes');
  assert.equal(await resolveTableCode('tenant-a', 'BBBB44', db), null, 'tenant-a cannot use tenant-b codes');
  assert.equal(normalizeTableCode('QQQQ22'), 'QQQQ22', 'the inactive table has a well-formed code');
  assert.equal(await resolveTableCode('tenant-a', 'QQQQ22', db), null, 'deleted/inactive table');
});

test('dine-in table: the code wins and a typed number is never trusted next to it', async () => {
  const db = fakeExecutor({ tables: TABLES, legacyFlag: true });
  const ok = await resolveDineInTable('tenant-a', { tableCode: 'K7Q92M', legacyTable: '7' }, db);
  assert.equal(ok.tableNumber, 4);
  assert.equal(ok.source, 'code');
  const bad = await resolveDineInTable('tenant-a', { tableCode: 'K7Q92N' }, db);
  assert.equal(bad.error, 'INVALID_TABLE_CODE');
});

test('dine-in table: a bare ?table=N works only while old stickers are allowed', async () => {
  const allowed = await resolveDineInTable('tenant-a', { legacyTable: '7' }, fakeExecutor({ legacyFlag: true }));
  assert.equal(allowed.tableNumber, 7);
  assert.equal(allowed.source, 'legacy');

  const blocked = await resolveDineInTable('tenant-a', { legacyTable: '7' }, fakeExecutor({ legacyFlag: false }));
  assert.equal(blocked.error, 'TABLE_CODE_REQUIRED');

  const nothing = await resolveDineInTable('tenant-a', {}, fakeExecutor({ legacyFlag: true }));
  assert.equal(nothing.error, 'TABLE_CODE_REQUIRED');
});

test('legacy default: on for restaurants created before table codes, off for newer ones', async () => {
  const older = await resolveDineInTable('tenant-a', { legacyTable: '3' }, fakeExecutor({ createdAt: new Date('2026-06-01T00:00:00Z') }));
  assert.equal(older.source, 'legacy');
  const newer = await resolveDineInTable('tenant-a', { legacyTable: '3' }, fakeExecutor({ createdAt: new Date('2027-01-01T00:00:00Z') }));
  assert.equal(newer.error, 'TABLE_CODE_REQUIRED');
});

test('CSRF: diner routes are exempt, owner routes are not', () => {
  assert.equal(needsCsrfCheck('POST', '/api/public/menus/spice-route/orders'), false);
  assert.equal(needsCsrfCheck('POST', '/api/public/qr/abc123/orders'), false);
  assert.equal(needsCsrfCheck('POST', '/api/public/tokens/x/request-bill'), false);
  assert.equal(needsCsrfCheck('POST', '/api/webhooks/cashfree'), false);
  assert.equal(needsCsrfCheck('POST', '/api/auth/login'), false);
  assert.equal(needsCsrfCheck('GET', '/api/app/orders'), false);
  assert.equal(needsCsrfCheck('PATCH', '/api/app/orders/AB12/status'), true);
  assert.equal(needsCsrfCheck('POST', '/api/app/tables/ensure'), true);
  assert.equal(needsCsrfCheck('DELETE', '/api/admin/clients/x'), true);
  assert.equal(needsCsrfCheck('post', '/api/publicity/x'), true, 'prefix match must not leak to look-alike paths');
});

test('public bill view drops phone, payment reference and staff ids', () => {
  const staffToken = {
    id: 't1', status: 'DINING', tableNumber: 4, customerName: 'Rahul',
    customerPhone: '9876543210', customer_phone: '9876543210',
    paymentReference: 'UPI-REF-1', payment_reference: 'UPI-REF-1',
    waiterId: 'w-7', waiter_id: 'w-7', settledById: 'owner-1', settled_by_id: 'owner-1',
    total: 735,
  };
  const view = publicTokenView(staffToken);
  for (const key of ['customerPhone', 'customer_phone', 'paymentReference', 'payment_reference', 'waiterId', 'waiter_id', 'settledById', 'settled_by_id']) {
    assert.equal(key in view, false, `${key} must not be public`);
  }
  assert.equal(view.total, 735);
  assert.equal(view.tableNumber, 4);
  assert.equal(staffToken.customerPhone, '9876543210', 'the staff object itself is not changed');
});

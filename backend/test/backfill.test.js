/**
 * Backfill 001 against a fake pool: dry run writes nothing, apply is idempotent and batched, a
 * field holding several numbers is split, and delivery stays on. The legacy `clients` row is
 * never written.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { runBackfill, planTenant, BATCH_SIZE } from '../backfill/001_profile_backfill.js';
import { parsePhoneField, contactsFromLegacyPhone, linksFromLegacyClient } from '../legacyProfile.js';
import { createFakePool, writes } from './helpers/fakeDb.js';

const REAL_PHONE = '+91 95480 89761, +91 90689 35364'; // production data: two numbers in one field

function client(id, extra = {}) {
  return {
    id, business_name: `Dhaba ${id}`, tagline: '', phone: '9548089761', city: 'Delhi', address: '12 Market Road', state: 'Delhi',
    cuisine: 'North Indian, Chinese', opening_hours: '10am-11pm', instagram: '@dhaba', facebook: '', website: '', logo_url: '',
    review_flags: { phone_privacy_pending: true }, ...extra,
  };
}

/** A fake database holding `clients`, optionally some already-migrated tenants, and recording inserts. */
function backfillPool({ clients, profiles = [], brands = [], ordering = [], appearance = [] }) {
  const inserted = { restaurant_profiles: [], brand_kits: [], ordering_settings: [] };
  const pool = createFakePool([
    ['FROM clients ORDER BY id', () => clients],
    ['SELECT tenant_id FROM restaurant_profiles', () => profiles.map((tenant_id) => ({ tenant_id }))],
    ['SELECT tenant_id FROM brand_kits', () => brands.map((tenant_id) => ({ tenant_id }))],
    ['SELECT tenant_id FROM ordering_settings', () => ordering.map((tenant_id) => ({ tenant_id }))],
    ['FROM appearance_settings', () => appearance],
    [/^INSERT INTO (restaurant_profiles|brand_kits|ordering_settings)/, (sql, params) => {
      const table = sql.match(/^INSERT INTO (\w+)/)[1];
      inserted[table].push({ sql, params });
      return { rows: [], rowCount: sql.split('), (').length };
    }],
  ]);
  return { pool, inserted };
}

const silent = () => {};

test('dry run is the default and writes nothing, but prints the per-tenant diff', async () => {
  const { pool } = backfillPool({ clients: [client('t1', { phone: REAL_PHONE }), client('t2')] });
  const lines = [];
  const summary = await runBackfill({ pool, log: (l) => lines.push(l) });

  assert.equal(summary.dryRun, true);
  assert.equal(writes(pool).length, 0, 'no INSERT/UPDATE/DELETE in a dry run');
  assert.equal(pool.calls.some((c) => /^(BEGIN|COMMIT)/.test(c.sql)), false, 'no transaction either');
  assert.equal(pool.calls.some((c) => typeof c.sql === 'string' && /UPDATE clients/.test(c.sql)), false);
  assert.equal(summary.profilesToCreate, 2);
  assert.equal(summary.ordering ?? summary.orderingToCreate, 2);

  const text = lines.join('\n');
  assert.match(text, /tenant t1/);
  assert.match(text, /\+919548089761 \(primary\), \+919068935364/);
  assert.match(text, /visible change: phone/, 'the diff names the phone change (second number moves to contacts)');
  assert.match(text, /delivery ON/);
  assert.match(text, /nothing written/);
});

test('apply writes one transaction of batched inserts and never touches the legacy clients row', async () => {
  const { pool, inserted } = backfillPool({ clients: [client('t1', { phone: REAL_PHONE }), client('t2')] });
  const summary = await runBackfill({ pool, dryRun: false, log: silent });

  assert.equal(summary.profilesCreated, 2);
  assert.equal(summary.brandKitsCreated, 2);
  assert.equal(summary.orderingCreated, 2);
  const sqls = pool.calls.map((c) => c.sql);
  assert.equal(sqls[sqls.indexOf('BEGIN') + 1].startsWith('INSERT INTO restaurant_profiles'), true);
  assert.equal(sqls.at(-1), 'COMMIT');
  assert.equal(writes(pool).every((w) => /^INSERT INTO (restaurant_profiles|brand_kits|ordering_settings)/.test(w.sql)), true, 'only INSERTs into the three new tables');
  assert.equal(writes(pool).every((w) => /ON CONFLICT \(tenant_id\) DO NOTHING/.test(w.sql)), true, 'nothing is ever overwritten');
  assert.equal(inserted.restaurant_profiles.length, 1, 'both tenants go in one multi-row statement');
});

test('a field holding two numbers becomes two public contacts, first is primary', async () => {
  const { pool, inserted } = backfillPool({ clients: [client('t1', { phone: REAL_PHONE })] });
  await runBackfill({ pool, dryRun: false, log: silent });
  const params = inserted.restaurant_profiles[0].params;
  const contacts = JSON.parse(params.find((p) => typeof p === 'string' && p.includes('+919068935364') && p.startsWith('[')));
  assert.deepEqual(contacts.map((c) => c.number), ['+919548089761', '+919068935364']);
  assert.deepEqual(contacts.map((c) => c.public), [true, true]);
  assert.deepEqual(contacts.map((c) => c.primary), [true, false]);
  assert.equal(contacts.every((c) => c.whatsapp === false && c.label === ''), true, 'no invented WhatsApp or label');
});

test('delivery stays on for existing tenants (takeaway off, dine-in on, accepting on)', async () => {
  const { pool, inserted } = backfillPool({ clients: [client('t1')] });
  await runBackfill({ pool, dryRun: false, log: silent });
  assert.deepEqual(inserted.ordering_settings[0].params, ['t1', true, false, true, true]);
  assert.match(inserted.ordering_settings[0].sql, /\(tenant_id, dine_in_enabled, takeaway_enabled, delivery_enabled, accepting_orders\)/);
});

test('idempotent: tenants that already have rows get nothing, a second run is a no-op', async () => {
  const { pool, inserted } = backfillPool({
    clients: [client('t1'), client('t2')],
    profiles: ['t1', 't2'], brands: ['t1', 't2'], ordering: ['t1', 't2'],
  });
  const summary = await runBackfill({ pool, dryRun: false, log: silent });
  assert.equal(summary.profilesToCreate + summary.brandKitsToCreate + summary.orderingToCreate, 0);
  assert.equal(writes(pool).length, 0);
  assert.equal(pool.calls.some((c) => c.sql === 'BEGIN'), false);
  assert.equal(inserted.restaurant_profiles.length, 0);
});

test('a partly migrated database only fills the gaps', async () => {
  const { pool, inserted } = backfillPool({ clients: [client('t1'), client('t2')], profiles: ['t1'], ordering: ['t1'], brands: ['t1', 't2'] });
  const summary = await runBackfill({ pool, dryRun: false, log: silent });
  assert.deepEqual([summary.profilesToCreate, summary.brandKitsToCreate, summary.orderingToCreate], [1, 0, 1]);
  assert.equal(inserted.brand_kits.length, 0);
  assert.equal(inserted.restaurant_profiles[0].params[0], 't2');
});

test('batched: the number of queries does not grow with the number of tenants', async () => {
  const run = async (count) => {
    const clients = Array.from({ length: count }, (_, i) => client(`t${String(i).padStart(4, '0')}`));
    const { pool } = backfillPool({ clients });
    await runBackfill({ pool, dryRun: false, log: silent });
    return {
      reads: pool.calls.filter((c) => /^SELECT/.test(c.sql)).length,
      inserts: pool.calls.filter((c) => /^INSERT/.test(c.sql)).length,
    };
  };
  const small = await run(3);
  const large = await run(250);
  assert.equal(small.reads, 5);
  assert.equal(large.reads, 5, 'still five reads for 250 tenants (no N+1)');
  assert.equal(small.inserts, 3);
  assert.equal(large.inserts, 3 * Math.ceil(250 / BATCH_SIZE));
});

test('values that are not understood stay out of the structured lists and are reported, not lost', () => {
  const plan = planTenant(
    client('t1', { phone: 'call the shop', instagram: 'https://instagram.com/p/ABC123/', facebook: '', website: 'not a url' }),
    {},
    { profile: false, brand: true, ordering: true }
  );
  assert.deepEqual(plan.profile.contacts, []);
  assert.deepEqual(plan.profile.links, []);
  assert.equal(plan.notes.length >= 2, true);
  assert.match(plan.notes.join('\n'), /still shown/);
  // the public value is identical before and after: nothing visible changes
  assert.deepEqual(plan.changes, []);
});

test('the name and tagline the menu shows today are kept (appearance value wins over the legal name)', () => {
  const plan = planTenant(
    client('t1', { business_name: 'SHOBHARAMS PVT', tagline: 'old' }),
    { restaurant_display_name: 'Shobha Ram Dhaba', tagline: 'Since forever' },
    { profile: false, brand: true, ordering: true }
  );
  assert.equal(plan.profile.display_name, 'Shobha Ram Dhaba');
  assert.equal(plan.profile.tagline, 'Since forever');
  assert.equal(plan.changes.some((c) => c.field === 'name' || c.field === 'tagline'), false);
});

test('brand kit records the logo URL only, with no guessed aspect or badge', () => {
  const plan = planTenant(client('t1', { logo_url: 'https://cdn.test/logo.png' }), {}, { profile: true, brand: false, ordering: true });
  assert.deepEqual(plan.brand.logo, { mediaUrl: 'https://cdn.test/logo.png' });
  assert.deepEqual(planTenant(client('t2'), {}, { profile: true, brand: false, ordering: true }).brand.logo, {});
});

test('parsePhoneField: separators, single numbers with a slash, duplicates, limits', () => {
  assert.deepEqual(parsePhoneField(REAL_PHONE).numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761 / 9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761; 9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761 & 9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761 or 9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761 and 9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761\n9068935364').numbers, ['+919548089761', '+919068935364']);
  assert.deepEqual(parsePhoneField('9548089761, 9548089761').numbers, ['+919548089761'], 'duplicates collapse');
  assert.deepEqual(parsePhoneField('0120/4567890').numbers, ['+911204567890'], 'one landline containing a slash is not torn apart');
  assert.deepEqual(parsePhoneField('011-23456789').numbers, ['+911123456789']);
  assert.deepEqual(parsePhoneField('9548089761').numbers, ['+919548089761']);

  const five = parsePhoneField('9000000001, 9000000002, 9000000003, 9000000004, 9000000005');
  assert.equal(five.numbers.length, 4, 'at most four contacts');
  assert.deepEqual(five.unparsed, ['+919000000005']);

  assert.deepEqual(parsePhoneField('9548089761, call after 5'), { numbers: ['+919548089761'], unparsed: ['call after 5'] });
  assert.deepEqual(parsePhoneField(''), { numbers: [], unparsed: [] });
  assert.deepEqual(parsePhoneField(null), { numbers: [], unparsed: [] });
});

test('contacts and links from legacy values', () => {
  const { contacts } = contactsFromLegacyPhone('9548089761, 1800 123 4567, 011-23456789');
  assert.deepEqual(contacts.map((c) => c.kind), ['mobile', 'toll_free', 'landline']);
  assert.deepEqual(contacts.map((c) => c.id), ['phone_1', 'phone_2', 'phone_3']);
  const { links, unparsed } = linksFromLegacyClient({ instagram: '@mannat', facebook: 'facebook.com/mannat', website: 'mannat.in' });
  // (the exact normalised form of each value is covered against the shared fixture in validation_fixture.test.js)
  assert.deepEqual(links.map((l) => l.type), ['instagram', 'facebook', 'website']);
  assert.equal(links[0].value, 'mannat');
  assert.deepEqual(links.map((l) => l.placements.cover), [true, false, false]);
  assert.deepEqual(unparsed, []);
});

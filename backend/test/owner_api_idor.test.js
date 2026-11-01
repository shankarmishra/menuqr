/**
 * Cross-tenant tests (IDOR) for the owner API, run against the real route code with an in-memory
 * stand-in for the database (see helpers/ownerFake.js). Two restaurants, A and B, share one
 * "database"; every request is made as the owner of A and tries to read or change B's data.
 *
 * The offers case is the original bug: offer ids are public (they are in the public menu
 * payload) and POST /api/app/offers used to upsert by whatever id the body carried.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../db.js';
import appRoutes from '../routes/app.js';
import { getFullPublicMenuData, clearAllPublicMenuCaches } from '../routes/public.js';
import { createOwnerPool, ownerHeaders } from './helpers/ownerFake.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';

const FUTURE = new Date(Date.now() + 365 * 86400000);
const PAST = new Date(Date.now() - 86400000);

function client(id, name) {
  return { id, public_id: `pub-${id}`, business_name: name, menu_slug: id, status: 'active', category: 'Dhaba', tagline: '', phone: '9548089761', city: 'Delhi', address: '1 Road', state: 'Delhi', cuisine: '', opening_hours: '', instagram: '', facebook: '', website: '', logo_url: '', review_flags: {} };
}

function world({ planA = 'PREMIUM' } = {}) {
  const tables = {
    clients: [client('tenant-a', 'Dhaba A'), client('tenant-b', 'Dhaba B')],
    subscriptions: [
      { id: 'sub-a', tenant_id: 'tenant-a', plan_id: planA, status: 'ACTIVE', started_at: PAST, expires_at: FUTURE, created_at: PAST },
      { id: 'sub-b', tenant_id: 'tenant-b', plan_id: 'PREMIUM', status: 'ACTIVE', started_at: PAST, expires_at: FUTURE, created_at: PAST },
    ],
    menus: [{ id: 'menu-a', tenant_id: 'tenant-a' }, { id: 'menu-b', tenant_id: 'tenant-b' }],
    menu_items: [
      { id: 'item-a', menu_id: 'menu-a', tenant_id: 'tenant-a', category_id: 'c', name: 'A dish', price: '100', is_available: true },
      { id: 'item-b', menu_id: 'menu-b', tenant_id: 'tenant-b', category_id: 'c', name: 'B dish', price: '100', is_available: true },
    ],
    menu_media: [{ id: 'media-b', tenant_id: 'tenant-b' }],
    restaurant_offers: [
      { id: 'offer-b', tenant_id: 'tenant-b', title: 'B lunch special', details: 'untouched', price_text: '', schedule: {}, item_ids: [], media_id: null, is_active: true, i18n: {} },
    ],
    restaurant_announcements: [
      { id: 'ann-b', tenant_id: 'tenant-b', text: 'B is closed on Monday', link_type: 'none', link_target: null, is_active: true, i18n: {} },
    ],
    dining_tables: [{ id: 'table-b1', tenant_id: 'tenant-b', label: 'T1', sort_order: 0, is_active: true }],
    setup_progress: [{ tenant_id: 'tenant-b', current_step: 'S3', steps: { s0: true, s1: true, s2: true, s3: false, s4: false }, completed_at: null }],
    appearance_settings: [{ id: 'app-b', tenant_id: 'tenant-b', theme_draft: { presetId: 'maison-noir' }, theme_published: { presetId: 'maison-noir' }, theme_version: 4 }],
    appearance_theme_history: [{ id: 'h-b4', tenant_id: 'tenant-b', version: 4, theme: { presetId: 'maison-noir' }, created_at: PAST }],
  };
  const users = [
    { id: 'user-a', role: 'RESTAURANT_OWNER', tenant_id: 'tenant-a', onboarding_state: 'COMPLETED' },
    { id: 'user-b', role: 'RESTAURANT_OWNER', tenant_id: 'tenant-b', onboarding_state: 'COMPLETED' },
  ];
  const pool = createOwnerPool(tables, users);
  setPool(pool);
  clearAllPublicMenuCaches();
  return { tables, pool };
}

/** Calls the owner API as the owner of tenant A. */
async function asA(method, path, body) {
  const res = fakeResponse();
  try {
    await appRoutes(fakeRequest({ method, body, headers: ownerHeaders('user-a', 'tenant-a') }), res, urlFor(path));
    return { status: res.statusCode, body: res.body ? res.json() : null };
  } catch (err) {
    return { status: err.status ?? 500, message: err.message };
  }
}

const offerB = (tables) => tables.restaurant_offers.find((o) => o.id === 'offer-b');

// ── offers ───────────────────────────────────────────────────────────────────

test('harness check: the old unguarded offers upsert really does overwrite another tenant', async () => {
  const { tables, pool } = world();
  await pool.query(
    `INSERT INTO restaurant_offers (id, tenant_id, title, details, price_text, schedule, item_ids, media_id, is_active, i18n)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, details = EXCLUDED.details, updated_at = NOW() RETURNING *`,
    ['offer-b', 'tenant-a', 'HACKED', '', '', '{}', [], null, true, '{}']
  );
  assert.equal(offerB(tables).title, 'HACKED', 'the fake must be able to show the bug, otherwise the tests below prove nothing');
});

test('offers: posting another tenant\'s offer id is refused and the offer is untouched', async () => {
  const { tables } = world();
  const result = await asA('POST', '/api/app/offers', { id: 'offer-b', title: 'Hacked title', details: 'hacked', isActive: true });
  assert.equal(result.status, 404);
  assert.deepEqual(
    { title: offerB(tables).title, details: offerB(tables).details, tenant: offerB(tables).tenant_id },
    { title: 'B lunch special', details: 'untouched', tenant: 'tenant-b' }
  );
  assert.equal(tables.restaurant_offers.length, 1, 'no new row was created either');
});

test('offers: an owner can create, list, edit and delete their own offer; the other tenant is unaffected', async () => {
  const { tables } = world();
  const created = await asA('POST', '/api/app/offers', { title: 'Thali combo', details: 'Dal, rice, roti', priceText: 'Rs 149', itemIds: ['item-a'], schedule: { days: [1, 2, 3], timeStart: '12:00', timeEnd: '15:00' } });
  assert.equal(created.status, 200);
  assert.equal(created.body.tenant_id, 'tenant-a');
  assert.notEqual(created.body.id, 'offer-b');

  const edited = await asA('POST', '/api/app/offers', { id: created.body.id, title: 'Thali combo v2', priceText: 'Rs 159' });
  assert.equal(edited.status, 200);
  assert.equal(edited.body.id, created.body.id);
  assert.equal(edited.body.title, 'Thali combo v2');

  const list = await asA('GET', '/api/app/offers');
  assert.deepEqual(list.body.map((o) => o.id), [created.body.id], 'the list holds only this tenant\'s offers');

  const deleteForeign = await asA('DELETE', '/api/app/offers/offer-b');
  assert.equal(deleteForeign.status, 200);
  assert.equal(offerB(tables).title, 'B lunch special', 'a scoped delete cannot remove another tenant\'s offer');

  await asA('DELETE', `/api/app/offers/${created.body.id}`);
  assert.equal(tables.restaurant_offers.filter((o) => o.tenant_id === 'tenant-a').length, 0);
});

test('offers: input is validated', async () => {
  world();
  const bad = async (body, pattern) => {
    const r = await asA('POST', '/api/app/offers', body);
    assert.equal(r.status, 400, JSON.stringify(body));
    assert.match(r.message, pattern);
  };
  await bad({}, /title is required/i);
  await bad({ title: '   ' }, /title is required/i);
  await bad({ title: 'x'.repeat(41) }, /40 characters/);
  await bad({ title: 'ok', details: 'x'.repeat(161) }, /160 characters/);
  await bad({ title: 'ok', priceText: 'x'.repeat(31) }, /30 characters/);
  await bad({ title: 'ok', schedule: { days: [7] } }, /weekdays/);
  await bad({ title: 'ok', schedule: { timeStart: '12:00' } }, /both a start time and an end time/);
  await bad({ title: 'ok', schedule: { timeStart: '25:00', timeEnd: '26:00' } }, /times must look like/);
  await bad({ title: 'ok', schedule: { dateStart: '2026-13-40' } }, /dates must look like/);
  await bad({ title: 'ok', schedule: { dateStart: '2026-12-02', dateEnd: '2026-12-01' } }, /cannot end before/);
  await bad({ title: 'ok', itemIds: 'item-a' }, /dishes/);
  await bad({ title: 'ok', isActive: 'yes' }, /true or false/);
  await bad({ title: 40 }, /must be text/);

  const exactly = await asA('POST', '/api/app/offers', { title: 'x'.repeat(40), details: 'y'.repeat(160), priceText: 'z'.repeat(30) });
  assert.equal(exactly.status, 200, 'the limits themselves are allowed');
});

test('offers: dishes and photos must belong to the restaurant', async () => {
  const { tables } = world();
  const foreignItem = await asA('POST', '/api/app/offers', { title: 'Steal a dish', itemIds: ['item-b'] });
  assert.equal(foreignItem.status, 400);
  assert.match(foreignItem.message, /not on your menu/);
  const foreignMedia = await asA('POST', '/api/app/offers', { title: 'Steal a photo', mediaId: 'media-b' });
  assert.equal(foreignMedia.status, 400);
  assert.match(foreignMedia.message, /not in your library/);
  assert.equal(tables.restaurant_offers.filter((o) => o.tenant_id === 'tenant-a').length, 0);
});

test('offers: active-offer limits by plan (BASIC 1, INTERMEDIATE 5, PREMIUM 10); inactive offers do not count', async () => {
  for (const [plan, limit] of [['BASIC', 1], ['INTERMEDIATE', 5], ['PREMIUM', 10]]) {
    world({ planA: plan });
    const ids = [];
    for (let i = 0; i < limit; i++) {
      const r = await asA('POST', '/api/app/offers', { title: `Offer ${i + 1}` });
      assert.equal(r.status, 200, `${plan} offer ${i + 1} of ${limit}`);
      ids.push(r.body.id);
    }
    const over = await asA('POST', '/api/app/offers', { title: 'One too many' });
    assert.equal(over.status, 403, `${plan} must refuse active offer ${limit + 1}`);
    assert.match(over.message, new RegExp(`allows ${limit} active offer`));

    const inactive = await asA('POST', '/api/app/offers', { title: 'Saved for later', isActive: false });
    assert.equal(inactive.status, 200, `${plan}: an inactive offer is not limited`);
    const edit = await asA('POST', '/api/app/offers', { id: ids[0], title: 'Edited at the limit' });
    assert.equal(edit.status, 200, `${plan}: editing an active offer at the limit works`);
    const reactivate = await asA('POST', '/api/app/offers', { id: inactive.body.id, title: 'Saved for later', isActive: true });
    assert.equal(reactivate.status, 403, `${plan}: switching an inactive offer on counts against the limit`);

    await asA('POST', '/api/app/offers', { id: ids[0], title: 'Off now', isActive: false });
    const afterFreeing = await asA('POST', '/api/app/offers', { title: 'Fits again' });
    assert.equal(afterFreeing.status, 200, `${plan}: switching one off frees a slot`);
  }
});

test('offers: another tenant\'s offers never count against this tenant\'s limit', async () => {
  const { tables } = world({ planA: 'BASIC' });
  assert.equal(tables.restaurant_offers.filter((o) => o.tenant_id === 'tenant-b' && o.is_active).length, 1);
  const r = await asA('POST', '/api/app/offers', { title: 'My first offer' });
  assert.equal(r.status, 200);
});

test('offers: an expired subscription is read-only', async () => {
  const { tables } = world();
  tables.subscriptions[0].status = 'EXPIRED';
  const r = await asA('POST', '/api/app/offers', { title: 'Too late' });
  assert.equal(r.status, 403);
});

test('offers and announcements: a change reaches the public menu at once (cache is invalidated)', async () => {
  const { tables } = world();
  const before = await getFullPublicMenuData('tenant-a');
  assert.deepEqual(before.offers, []);
  assert.equal(before.announcement, null);

  const offer = await asA('POST', '/api/app/offers', { title: 'Live now' });
  assert.equal(offer.status, 200);
  const afterOffer = await getFullPublicMenuData('tenant-a');
  assert.deepEqual(afterOffer.offers.map((o) => o.title), ['Live now']);

  const ann = await asA('POST', '/api/app/announcements', { text: 'Open late tonight' });
  assert.equal(ann.status, 200);
  const afterAnn = await getFullPublicMenuData('tenant-a');
  assert.equal(afterAnn.announcement?.text, 'Open late tonight');

  await asA('DELETE', `/api/app/offers/${offer.body.id}`);
  await asA('DELETE', `/api/app/announcements/${ann.body.id}`);
  const afterDelete = await getFullPublicMenuData('tenant-a');
  assert.deepEqual(afterDelete.offers, []);
  assert.equal(afterDelete.announcement, null);
  assert.equal(tables.restaurant_offers.some((o) => o.id === 'offer-b'), true);
});

// ── announcements ────────────────────────────────────────────────────────────

test('announcements: another tenant\'s id creates a new announcement and never touches the original', async () => {
  const { tables } = world();
  const r = await asA('POST', '/api/app/announcements', { id: 'ann-b', text: 'Hacked banner' });
  assert.equal(r.status, 200);
  assert.notEqual(r.body.id, 'ann-b');
  assert.equal(r.body.tenant_id, 'tenant-a');
  assert.equal(tables.restaurant_announcements.find((a) => a.id === 'ann-b').text, 'B is closed on Monday');

  const list = await asA('GET', '/api/app/announcements');
  assert.deepEqual(list.body.map((a) => a.id), [r.body.id]);

  await asA('DELETE', '/api/app/announcements/ann-b');
  assert.equal(tables.restaurant_announcements.some((a) => a.id === 'ann-b'), true, 'scoped delete');
});

test('announcements: own announcement can be edited; links must be safe', async () => {
  world();
  const created = await asA('POST', '/api/app/announcements', { text: 'Diwali offer', linkType: 'url', linkTarget: 'mannat.in/diwali' });
  assert.equal(created.status, 200);
  assert.equal(created.body.link_target, 'https://mannat.in/diwali');
  const edited = await asA('POST', '/api/app/announcements', { id: created.body.id, text: 'Diwali offer extended' });
  assert.equal(edited.body.id, created.body.id);
  assert.equal(edited.body.text, 'Diwali offer extended');

  for (const body of [
    { text: '' },
    { text: 'x'.repeat(121) },
    { text: 'ok', linkType: 'url', linkTarget: 'javascript:alert(1)' },
    { text: 'ok', linkType: 'url', linkTarget: 'http://127.0.0.1/admin' },
    { text: 'ok', linkType: 'bogus', linkTarget: 'x' },
    { text: 'ok', linkType: 'whatsapp', linkTarget: 'not a number' },
    { text: 'ok', linkType: 'url' },
    { text: 'ok', startsAt: '2026-12-02T00:00:00Z', endsAt: '2026-12-01T00:00:00Z' },
  ]) {
    const r = await asA('POST', '/api/app/announcements', body);
    assert.equal(r.status, 400, JSON.stringify(body));
  }
});

// ── dining tables ────────────────────────────────────────────────────────────

test('tables: a label that exists for another tenant, and another tenant\'s table id, cannot be abused', async () => {
  const { tables } = world();
  const r = await asA('POST', '/api/app/tables', { tables: ['T1', 'T2', { label: 'T3' }, { nope: 1 }, '', '   '] });
  assert.equal(r.status, 200);
  const mine = tables.dining_tables.filter((t) => t.tenant_id === 'tenant-a').map((t) => t.label).sort();
  assert.deepEqual(mine, ['T1', 'T2', 'T3'], 'junk entries are skipped');
  assert.equal(tables.dining_tables.find((t) => t.id === 'table-b1').tenant_id, 'tenant-b', 'the other tenant\'s T1 is a separate row');

  const list = await asA('GET', '/api/app/tables');
  assert.equal(list.body.every((t) => t.tenant_id === 'tenant-a'), true);

  await asA('DELETE', '/api/app/tables/table-b1');
  assert.equal(tables.dining_tables.some((t) => t.id === 'table-b1'), true, 'scoped delete');
});

test('tables: at most 200', async () => {
  world();
  const many = Array.from({ length: 201 }, (_, i) => `T${i + 1}`);
  const r = await asA('POST', '/api/app/tables', { tables: many });
  assert.equal(r.status, 400);
});

// ── setup progress ───────────────────────────────────────────────────────────

test('setup progress: a body naming another tenant is ignored; only the session tenant\'s row changes', async () => {
  const { tables } = world();
  const saved = await asA('PATCH', '/api/app/setup-progress', { tenantId: 'tenant-b', tenant_id: 'tenant-b', currentStep: 's2', steps: { s0: true, s1: true, hacked: true } });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.currentStep, 'S2');
  assert.equal(saved.body.steps.hacked, undefined, 'unknown step keys are dropped');
  const b = tables.setup_progress.find((r) => r.tenant_id === 'tenant-b');
  assert.equal(b.current_step, 'S3', 'tenant B untouched');
  assert.equal(b.steps.s2, true);

  const read = await asA('GET', '/api/app/setup-progress');
  assert.equal(read.body.currentStep, 'S2', 'A reads A\'s own row, not B\'s S3');
});

test('setup progress: validation, and a partial update keeps the current step', async () => {
  world();
  assert.equal((await asA('PATCH', '/api/app/setup-progress', { currentStep: 'S9' })).status, 400);
  assert.equal((await asA('PATCH', '/api/app/setup-progress', { steps: { s1: 'yes' } })).status, 400);
  await asA('PATCH', '/api/app/setup-progress', { currentStep: 'S3' });
  const partial = await asA('PATCH', '/api/app/setup-progress', { steps: { s1: true } });
  assert.equal(partial.body.currentStep, 'S3', 'omitting currentStep no longer resets it to S0');
});

// ── design studio ────────────────────────────────────────────────────────────

test('design: reading, drafting, history and rollback only ever touch the session tenant', async () => {
  const { tables } = world();

  const read = await asA('GET', '/api/app/theme');
  assert.equal(read.status, 200);
  assert.equal(read.body.published, null, 'A has no published theme; B\'s maison-noir is not visible');
  assert.equal(read.body.version, 0);

  const draft = await asA('PUT', '/api/app/theme/draft', { tenantId: 'tenant-b', tenant_id: 'tenant-b', presetId: 'grand-haveli' });
  assert.equal(draft.status, 200);
  const rowA = tables.appearance_settings.find((r) => r.tenant_id === 'tenant-a');
  const rowB = tables.appearance_settings.find((r) => r.tenant_id === 'tenant-b');
  assert.equal(rowA.theme_draft.presetId, 'grand-haveli');
  assert.equal(rowB.theme_draft.presetId, 'maison-noir', 'B\'s draft is untouched');

  const history = await asA('GET', '/api/app/theme/history');
  assert.deepEqual(history.body, [], 'B\'s published versions are not in A\'s history');

  const rollbackForeign = await asA('POST', '/api/app/theme/rollback', { version: 4 });
  assert.equal(rollbackForeign.status, 404, 'version 4 exists only for B');
  assert.equal(rowB.theme_version, 4);
  assert.equal(rowB.theme_published.presetId, 'maison-noir');
});

test('design: a tenant can roll back to its own version', async () => {
  const { tables } = world();
  tables.appearance_settings.push({ id: 'app-a', tenant_id: 'tenant-a', theme_draft: { presetId: 'grand-haveli' }, theme_published: { presetId: 'grand-haveli' }, theme_version: 2 });
  tables.appearance_theme_history.push({ id: 'h-a1', tenant_id: 'tenant-a', version: 1, theme: { presetId: 'grand-haveli' }, created_at: PAST });
  const history = await asA('GET', '/api/app/theme/history');
  assert.deepEqual(history.body.map((h) => h.version), [1]);
  const rb = await asA('POST', '/api/app/theme/rollback', { version: 1 });
  assert.equal(rb.status, 200);
  assert.equal(tables.appearance_settings.find((r) => r.tenant_id === 'tenant-b').theme_version, 4, 'B unchanged');
});

test('every owner query carries only the session tenant id as its tenant selector', async () => {
  const { pool } = world();
  await asA('GET', '/api/app/offers');
  await asA('POST', '/api/app/offers', { tenantId: 'tenant-b', tenant_id: 'tenant-b', title: 'Mine' });
  await asA('POST', '/api/app/tables', { tenantId: 'tenant-b', label: 'X1' });
  await asA('PATCH', '/api/app/setup-progress', { tenantId: 'tenant-b', currentStep: 'S1' });
  await asA('PUT', '/api/app/theme/draft', { tenantId: 'tenant-b', presetId: 'grand-haveli' });
  const leaked = pool.calls.filter((c) => c.params.some((p) => p === 'tenant-b'));
  assert.deepEqual(leaked.map((c) => c.sql.slice(0, 80)), [], 'no query was parameterised with the other tenant\'s id');
});

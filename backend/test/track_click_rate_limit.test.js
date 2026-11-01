/**
 * POST /api/public/menus/:slug/track-click is unauthenticated and writes a row, so it is limited
 * per IP and per restaurant. A diner's tap must never see an error: a request over the limit is
 * answered like a success and simply not stored.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setPool } from '../db.js';
import publicRoutes from '../routes/public.js';
import { createFakePool } from './helpers/fakeDb.js';
import { fakeRequest, fakeResponse, urlFor } from './helpers/http.js';

function clickPool() {
  const pool = createFakePool([
    ['FROM clients WHERE menu_slug = $1 OR public_id = $1 OR id = $1', (_s, p) => ({ 'test-dhaba': [{ id: 'tenant-a' }], 'other-dhaba': [{ id: 'tenant-b' }], 'spread-dhaba': [{ id: 'tenant-c' }] }[p[0]] || [])],
    ['FROM menu_slug_history WHERE slug = $1', () => []],
    ['INSERT INTO link_clicks_daily', () => ({ rows: [], rowCount: 1 })],
  ]);
  setPool(pool);
  return pool;
}

const stored = (pool) => pool.calls.filter((c) => c.sql.startsWith('INSERT INTO link_clicks_daily'));

async function click(slug, ip, kind = 'instagram') {
  const res = fakeResponse();
  try {
    await publicRoutes(fakeRequest({ method: 'POST', body: { kind }, ip }), res, urlFor(`/api/public/menus/${slug}/track-click`));
    return { status: res.statusCode, body: res.json() };
  } catch (err) {
    return { status: err.status, message: err.message };
  }
}

test('a normal tap is stored and answered with success', async () => {
  const pool = clickPool();
  const r = await click('test-dhaba', 'ip-normal');
  assert.deepEqual([r.status, r.body], [200, { success: true }]);
  assert.equal(stored(pool).length, 1);
  assert.deepEqual(stored(pool)[0].params.slice(0, 2), ['tenant-a', 'instagram']);
});

test('per IP: the first 30 taps in a minute are stored, the rest are dropped silently', async () => {
  const pool = clickPool();
  const results = [];
  for (let i = 0; i < 45; i++) results.push(await click('test-dhaba', 'ip-flood'));
  assert.equal(results.every((r) => r.status === 200 && r.body.success === true), true, 'the diner never sees an error');
  assert.equal(stored(pool).length, 30);

  const queriesBefore = pool.calls.length;
  await click('test-dhaba', 'ip-flood');
  assert.equal(pool.calls.length, queriesBefore, 'a limited request does no database work at all');

  const other = await click('test-dhaba', 'ip-someone-else');
  assert.equal(other.status, 200);
  assert.equal(stored(pool).length, 31, 'another IP is not affected');
});

test('per restaurant: one restaurant cannot be flooded from many addresses', async () => {
  const pool = clickPool();
  // (its own restaurant, because the limiter keeps state for the whole test process)
  for (let i = 0; i < 650; i++) {
    const r = await click('spread-dhaba', `ip-spread-${i}`);
    assert.equal(r.status, 200);
  }
  assert.equal(stored(pool).filter((c) => c.params[0] === 'tenant-c').length, 600);

  await click('other-dhaba', 'ip-other-restaurant');
  assert.equal(stored(pool).filter((c) => c.params[0] === 'tenant-b').length, 1, 'another restaurant still counts');
});

test('invalid kinds are refused, unknown menus count nothing, and both still use up the IP allowance', async () => {
  const pool = clickPool();
  const bad = await click('test-dhaba', 'ip-junk', 'definitely-not-a-kind');
  assert.equal(bad.status, 400);
  const unknown = await click('no-such-menu', 'ip-junk');
  assert.equal(unknown.status, 200);
  assert.equal(stored(pool).length, 0);

  for (let i = 0; i < 40; i++) await click('no-such-menu', 'ip-junk');
  const lookups = pool.calls.filter((c) => c.sql.includes('FROM clients WHERE menu_slug')).length;
  assert.equal(lookups < 40, true, 'once the IP is over its allowance even slug lookups stop');
});

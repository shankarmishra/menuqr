import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeItemSoldOut } from '../routes/app.js';
import { istDateString } from '../istTime.js';

test('istDateString: follows the IST calendar, not UTC', () => {
  // 20:00 UTC on 1 Jan is already 01:30 on 2 Jan in India.
  assert.equal(istDateString(new Date('2026-01-01T20:00:00Z')), '2026-01-02');
  // 18:29 UTC is 23:59 IST, still the same IST day.
  assert.equal(istDateString(new Date('2026-01-01T18:29:00Z')), '2026-01-01');
  assert.equal(istDateString(new Date('2026-01-01T18:30:00Z')), '2026-01-02');
});

test('mergeItemSoldOut: preserves other metadata', async (t) => {
  await t.test('sets the marker without dropping focal or tags', () => {
    const meta = { focal: { x: 0.5, y: 0.5 }, tags: { spice: 1 } };
    assert.deepEqual(mergeItemSoldOut(meta, '2026-01-02'), { ...meta, soldOutOn: '2026-01-02' });
  });
  await t.test('clearing removes only the marker', () => {
    assert.deepEqual(mergeItemSoldOut({ focal: { x: 0, y: 1 }, soldOutOn: '2026-01-02' }, null), { focal: { x: 0, y: 1 } });
    assert.deepEqual(mergeItemSoldOut(null, null), {});
  });
});

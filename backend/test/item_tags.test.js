import test from 'node:test';
import assert from 'node:assert/strict';
import { inputItemTags, mergeItemTags } from '../routes/app.js';

test('inputItemTags: whitelist and normalisation', async (t) => {
  await t.test('keeps only known allergens and badges, de-duplicated', () => {
    const tags = inputItemTags({ allergens: ['Nuts', 'nuts', 'lava', 'DAIRY'], badges: ['bestseller', 'hacked'], spice: 2 });
    assert.deepEqual(tags, { allergens: ['nuts', 'dairy'], badges: ['bestseller'], spice: 2, jain: false, eggless: false });
  });

  await t.test('clamps spice to 0-3 and coerces strings', () => {
    assert.equal(inputItemTags({ spice: 9 }).spice, 3);
    assert.equal(inputItemTags({ spice: '2' }).spice, 2);
    assert.equal(inputItemTags({ spice: -4, jain: true }).spice, 0);
  });

  await t.test('jain/eggless only accept literal true', () => {
    assert.equal(inputItemTags({ jain: 'yes', eggless: 1 }), null);
    assert.equal(inputItemTags({ jain: true }).jain, true);
  });

  await t.test('returns null when nothing meaningful is set', () => {
    for (const bad of [null, undefined, {}, 'x', 5, { allergens: [], badges: [], spice: 0 }, { allergens: ['junk'] }]) {
      assert.equal(inputItemTags(bad), null, `expected null for ${JSON.stringify(bad)}`);
    }
  });
});

test('mergeItemTags: preserves other metadata', async (t) => {
  await t.test('adds tags alongside focal', () => {
    const tags = { allergens: [], badges: ['new'], spice: 0, jain: false, eggless: false };
    assert.deepEqual(mergeItemTags({ focal: { x: 0.1, y: 0.2 } }, tags), { focal: { x: 0.1, y: 0.2 }, tags });
  });

  await t.test('null clears tags only', () => {
    assert.deepEqual(mergeItemTags({ focal: { x: 0.1, y: 0.2 }, tags: { spice: 1 } }, null), { focal: { x: 0.1, y: 0.2 } });
    assert.deepEqual(mergeItemTags(null, null), {});
  });
});

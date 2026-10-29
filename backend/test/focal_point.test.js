import test from 'node:test';
import assert from 'node:assert/strict';
import { inputFocalPoint, mergeItemMetadata } from '../routes/app.js';

test('inputFocalPoint: validation', async (t) => {
  await t.test('accepts a well-formed 0-1 point', () => {
    assert.deepEqual(inputFocalPoint({ x: 0.3, y: 0.7 }), { x: 0.3, y: 0.7 });
    assert.deepEqual(inputFocalPoint({ x: 0, y: 0 }), { x: 0, y: 0 });
    assert.deepEqual(inputFocalPoint({ x: 1, y: 1 }), { x: 1, y: 1 });
  });

  await t.test('clamps out-of-range values rather than rejecting them', () => {
    assert.deepEqual(inputFocalPoint({ x: -5, y: 50 }), { x: 0, y: 1 });
    assert.deepEqual(inputFocalPoint({ x: 1.5, y: -0.2 }), { x: 1, y: 0 });
  });

  await t.test('coerces numeric strings, matching how form inputs arrive', () => {
    assert.deepEqual(inputFocalPoint({ x: '0.4', y: '0.6' }), { x: 0.4, y: 0.6 });
  });

  await t.test('returns null for anything that is not a usable point', () => {
    for (const bad of [null, undefined, {}, { x: 0.5 }, { x: 'abc', y: 0.5 }, { x: NaN, y: 0.5 }, 'not an object', 42, []]) {
      assert.equal(inputFocalPoint(bad), null, `expected null for ${JSON.stringify(bad)}`);
    }
  });

  await t.test('rejects Infinity, which Number.isFinite would otherwise miss if mis-implemented', () => {
    assert.equal(inputFocalPoint({ x: Infinity, y: 0.5 }), null);
    assert.equal(inputFocalPoint({ x: 0.5, y: -Infinity }), null);
  });
});

test('mergeItemMetadata: partial-update semantics', async (t) => {
  await t.test('sets focal on empty existing metadata', () => {
    assert.deepEqual(mergeItemMetadata(null, { x: 0.2, y: 0.8 }), { focal: { x: 0.2, y: 0.8 } });
    assert.deepEqual(mergeItemMetadata(undefined, { x: 0.2, y: 0.8 }), { focal: { x: 0.2, y: 0.8 } });
    assert.deepEqual(mergeItemMetadata({}, { x: 0.2, y: 0.8 }), { focal: { x: 0.2, y: 0.8 } });
  });

  await t.test('overwrites an existing focal point without touching other metadata keys', () => {
    const existing = { focal: { x: 0.1, y: 0.1 }, otherField: 'kept' };
    assert.deepEqual(mergeItemMetadata(existing, { x: 0.9, y: 0.9 }), {
      focal: { x: 0.9, y: 0.9 },
      otherField: 'kept',
    });
  });

  await t.test('clearing (focal = null) removes the key entirely rather than storing null', () => {
    const existing = { focal: { x: 0.5, y: 0.5 }, otherField: 'kept' };
    const result = mergeItemMetadata(existing, null);
    assert.deepEqual(result, { otherField: 'kept' });
    assert.ok(!('focal' in result), 'focal key must be removed, not set to null');
  });

  await t.test('clearing on metadata with no focal is a no-op', () => {
    assert.deepEqual(mergeItemMetadata({ otherField: 'kept' }, null), { otherField: 'kept' });
    assert.deepEqual(mergeItemMetadata(null, null), {});
  });

  await t.test('does not mutate the existing metadata object passed in', () => {
    const existing = { focal: { x: 0.1, y: 0.1 } };
    const snapshot = JSON.stringify(existing);
    mergeItemMetadata(existing, { x: 0.9, y: 0.9 });
    assert.equal(JSON.stringify(existing), snapshot, 'input object was mutated');
  });

  await t.test('is resilient to a non-object existing value', () => {
    assert.deepEqual(mergeItemMetadata('garbage', { x: 0.5, y: 0.5 }), { focal: { x: 0.5, y: 0.5 } });
    assert.deepEqual(mergeItemMetadata(42, { x: 0.5, y: 0.5 }), { focal: { x: 0.5, y: 0.5 } });
  });
});

test('focal point: end-to-end through the validator then the merger', async (t) => {
  await t.test('a hostile or malformed request body clears rather than corrupts metadata', () => {
    const existing = { focal: { x: 0.5, y: 0.5 }, otherField: 'kept' };
    const hostileInputs = [{ x: 'DROP TABLE', y: '<script>' }, null, 'not-an-object', { x: NaN, y: NaN }];

    for (const hostile of hostileInputs) {
      const result = mergeItemMetadata(existing, inputFocalPoint(hostile));
      assert.ok(!('focal' in result), `hostile input ${JSON.stringify(hostile)} should have cleared focal`);
      assert.equal(result.otherField, 'kept');
    }
  });
});

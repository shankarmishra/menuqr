import test from 'node:test';
import assert from 'node:assert/strict';
import { availableOrderModes } from './orderModes.ts';

test('a payload without ordering settings keeps the old dine-in and delivery pair', () => {
  assert.deepEqual(availableOrderModes(undefined), ['DINE_IN', 'DELIVERY']);
  assert.deepEqual(availableOrderModes(null), ['DINE_IN', 'DELIVERY']);
});

test('the owner switches decide the modes once the settings exist', () => {
  assert.deepEqual(availableOrderModes({ dineIn: true, takeaway: true, delivery: false }), ['DINE_IN', 'TAKEAWAY']);
  assert.deepEqual(availableOrderModes({ dineIn: true, takeaway: false, delivery: true }), ['DINE_IN', 'DELIVERY']);
  assert.deepEqual(availableOrderModes({ dineIn: true, takeaway: true, delivery: true }), ['DINE_IN', 'TAKEAWAY', 'DELIVERY']);
  assert.deepEqual(availableOrderModes({ dineIn: true, takeaway: false, delivery: false }), ['DINE_IN']);
});

test('dine-in can be switched off', () => {
  assert.deepEqual(availableOrderModes({ dineIn: false, takeaway: true, delivery: true }), ['TAKEAWAY', 'DELIVERY']);
  assert.deepEqual(availableOrderModes({ dineIn: false, takeaway: false, delivery: false }), []);
});

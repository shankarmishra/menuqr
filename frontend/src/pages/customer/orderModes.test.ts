import test from 'node:test';
import assert from 'node:assert/strict';
import { availableOrderModes, getDeliveryStatus, isDeliverySlotActive } from './orderModes.ts';

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

test('TABLE QR LOCK: customer on a physical table QR is locked to DINE_IN only', () => {
  // Even if takeaway and delivery are enabled by the restaurant:
  const settings = { dineIn: true, takeaway: true, delivery: true };
  assert.deepEqual(availableOrderModes(settings, { isTableLocked: true }), ['DINE_IN']);
});

test('DELIVERY RUSH-HOUR PAUSE: hides delivery while paused', () => {
  const future = new Date(Date.now() + 20 * 60 * 1000).toISOString();
  const settings = { dineIn: true, takeaway: true, delivery: true, deliveryPausedUntil: future };
  
  const modes = availableOrderModes(settings, { currentTime: new Date() });
  assert.deepEqual(modes, ['DINE_IN', 'TAKEAWAY']); // Delivery excluded

  const status = getDeliveryStatus(settings, new Date());
  assert.equal(status.isAvailable, false);
  assert.match(status.reason || '', /Delivery is paused for peak rush/);
});

test('TIMED DELIVERY SLOTS: midnight crossing check', () => {
  const slots = [{ start: '23:00', end: '03:00' }];
  
  // 23:30 IST
  const lateNight = new Date('2026-11-03T18:00:00Z');
  assert.equal(isDeliverySlotActive(slots, lateNight), true);

  // 14:00 IST
  const afternoon = new Date('2026-11-03T08:30:00Z');
  assert.equal(isDeliverySlotActive(slots, afternoon), false);
});

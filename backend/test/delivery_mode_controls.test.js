import test from 'node:test';
import assert from 'node:assert/strict';
import { isDeliverySlotActive, assertOrderTypeAllowed, orderingSettingsFromRow } from '../publicMenuPayload.js';

test('isDeliverySlotActive: standard daytime slot (12:00 to 16:00)', () => {
  const slots = [{ start: '12:00', end: '16:00' }];
  
  // 13:30 IST
  const inside = new Date('2026-11-03T08:00:00Z'); // 08:00 UTC = 13:30 IST
  assert.equal(isDeliverySlotActive(slots, inside), true);

  // 17:00 IST
  const outside = new Date('2026-11-03T11:30:00Z'); // 11:30 UTC = 17:00 IST
  assert.equal(isDeliverySlotActive(slots, outside), false);
});

test('isDeliverySlotActive: midnight crossing slot (23:00 to 03:00)', () => {
  const slots = [{ start: '23:00', end: '03:00' }];

  // 23:45 IST (before midnight)
  const lateNight = new Date('2026-11-03T18:15:00Z'); // 18:15 UTC = 23:45 IST
  assert.equal(isDeliverySlotActive(slots, lateNight), true);

  // 01:30 IST (after midnight next day)
  const earlyMorning = new Date('2026-11-03T20:00:00Z'); // 20:00 UTC = 01:30 IST (+1)
  assert.equal(isDeliverySlotActive(slots, earlyMorning), true);

  // 14:00 IST (afternoon, outside slot)
  const afternoon = new Date('2026-11-03T08:30:00Z'); // 08:30 UTC = 14:00 IST
  assert.equal(isDeliverySlotActive(slots, afternoon), false);
});

test('assertOrderTypeAllowed: throws when delivery is temporarily paused during peak hours', () => {
  const future = new Date(Date.now() + 30 * 60 * 1000).toISOString();
  const settingsRow = {
    dine_in_enabled: true,
    takeaway_enabled: false,
    delivery_enabled: true,
    accepting_orders: true,
    delivery_paused_until: future,
    delivery_time_slots: [],
  };

  assert.throws(
    () => assertOrderTypeAllowed(settingsRow, 'DELIVERY', new Date()),
    /Delivery is temporarily paused due to kitchen rush/
  );

  // Dine-in should still be allowed during delivery pause!
  assert.doesNotThrow(() => assertOrderTypeAllowed(settingsRow, 'DINE_IN', new Date()));
});

test('assertOrderTypeAllowed: allows delivery after pause period expires', () => {
  const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const settingsRow = {
    dine_in_enabled: true,
    takeaway_enabled: false,
    delivery_enabled: true,
    accepting_orders: true,
    delivery_paused_until: past,
    delivery_time_slots: [],
  };

  assert.doesNotThrow(() => assertOrderTypeAllowed(settingsRow, 'DELIVERY', new Date()));
});

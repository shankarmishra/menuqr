import test from 'node:test';
import assert from 'node:assert/strict';
import { applyLiveFlags, isScheduleActive, scheduleLabel, validateSchedule } from '../schedule.js';

// IST = UTC+5:30. 2026-01-05 is a Monday.
const ist = (isoLocal) => new Date(`${isoLocal}+05:30`);

test('validateSchedule', async (t) => {
  await t.test('accepts a window and normalises days', () => {
    assert.deepEqual(validateSchedule({ from: '07:00', to: '11:00' }), { from: '07:00', to: '11:00' });
    assert.deepEqual(validateSchedule({ from: '07:00', to: '11:00', days: [6, 0, 6, 9, 'x'] }), { from: '07:00', to: '11:00', days: [0, 6] });
    assert.deepEqual(validateSchedule({ from: '07:00', to: '11:00', days: [0, 1, 2, 3, 4, 5, 6] }), { from: '07:00', to: '11:00' });
  });
  await t.test('null/false/undefined mean always available', () => {
    for (const v of [null, undefined, false]) assert.equal(validateSchedule(v), null);
  });
  await t.test('rejects bad times and equal start/end', () => {
    for (const bad of [{ from: '7:00', to: '11:00' }, { from: '25:00', to: '11:00' }, { from: '07:00' }, { from: '08:00', to: '08:00' }, 'x']) {
      assert.ok(validateSchedule(bad)?.error, JSON.stringify(bad));
    }
  });
});

test('isScheduleActive', async (t) => {
  const breakfast = { from: '07:00', to: '11:00' };
  await t.test('no schedule is always active', () => assert.equal(isScheduleActive(null), true));
  await t.test('inside, at start, and at end (exclusive)', () => {
    assert.equal(isScheduleActive(breakfast, ist('2026-01-05T09:30:00')), true);
    assert.equal(isScheduleActive(breakfast, ist('2026-01-05T07:00:00')), true);
    assert.equal(isScheduleActive(breakfast, ist('2026-01-05T11:00:00')), false);
    assert.equal(isScheduleActive(breakfast, ist('2026-01-05T06:59:00')), false);
  });
  await t.test('uses India time, not the server clock', () => {
    // 04:00 UTC is 09:30 IST.
    assert.equal(isScheduleActive(breakfast, new Date('2026-01-05T04:00:00Z')), true);
    // 01:00 UTC is 06:30 IST.
    assert.equal(isScheduleActive(breakfast, new Date('2026-01-05T01:00:00Z')), false);
  });
  await t.test('day restriction', () => {
    const weekend = { from: '10:00', to: '16:00', days: [0, 6] };
    assert.equal(isScheduleActive(weekend, ist('2026-01-05T12:00:00')), false); // Monday
    assert.equal(isScheduleActive(weekend, ist('2026-01-10T12:00:00')), true); // Saturday
  });
  await t.test('overnight window continues past midnight into the next day', () => {
    const late = { from: '22:00', to: '02:00', days: [6] }; // starts Saturday
    assert.equal(isScheduleActive(late, ist('2026-01-10T23:00:00')), true); // Sat 23:00
    assert.equal(isScheduleActive(late, ist('2026-01-11T01:00:00')), true); // Sun 01:00 (still Saturday's window)
    assert.equal(isScheduleActive(late, ist('2026-01-11T23:00:00')), false); // Sun 23:00 is not a start day
    assert.equal(isScheduleActive(late, ist('2026-01-10T01:00:00')), false); // Sat 01:00 belongs to Friday's window
  });
});

test('scheduleLabel', () => {
  assert.equal(scheduleLabel({ from: '07:00', to: '11:30' }), '7:00 AM – 11:30 AM');
  assert.equal(scheduleLabel({ from: '00:00', to: '12:00', days: [6, 0] }), '12:00 AM – 12:00 PM (Sat, Sun)');
  assert.equal(scheduleLabel(null), '');
});

test('applyLiveFlags: per-request flags on a cached payload, without mutating it', () => {
  const cached = {
    categories: [{ id: 'b', name: 'Breakfast', schedule: { from: '07:00', to: '11:00' } }, { id: 'm', name: 'Mains', schedule: null }],
    items: [
      { id: '1', categoryId: 'b', soldOutOn: '2026-01-05' },
      { id: '2', categoryId: 'm', soldOutOn: '2026-01-04' },
      { id: '3' },
    ],
  };
  const snapshot = JSON.stringify(cached);
  const out = applyLiveFlags(cached, ist('2026-01-05T15:00:00'), '2026-01-05');
  assert.equal(JSON.stringify(cached), snapshot, 'input is not mutated');
  assert.equal(out.items[0].soldOut, true);
  assert.equal(out.items[0].availabilityNote, 'Available 7:00 AM – 11:00 AM');
  assert.equal(out.items[1].soldOut, false, 'yesterday’s sold-out has lapsed');
  assert.equal(out.items[1].availabilityNote, null);
  assert.equal(out.items[2].availabilityNote, null, 'items without a category are never blocked');
  const morning = applyLiveFlags(cached, ist('2026-01-05T08:00:00'), '2026-01-05');
  assert.equal(morning.items[0].availabilityNote, null);
});

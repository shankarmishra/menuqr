import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHoursExceptions, normalizeLastOrderMinutes, normalizeShift, normalizeWeeklyHours } from './openingHours.ts';

test('a shift whose close is not later than its open runs past midnight', () => {
  assert.deepEqual(normalizeShift({ open: '18:00', close: '02:00' }), { open: '18:00', close: '02:00', overnight: true });
  assert.deepEqual(normalizeShift({ open: '10:00', close: '23:00' }), { open: '10:00', close: '23:00', overnight: false });
  // The stored flag is not trusted: the times decide.
  assert.equal(normalizeShift({ open: '10:00', close: '23:00', overnight: true })?.overnight, false);
  assert.equal(normalizeShift({ open: '00:00', close: '00:00' })?.overnight, true);
});

test('single-digit hours are accepted and written as HH:mm; nonsense is dropped', () => {
  assert.deepEqual(normalizeShift({ open: '9:30', close: '22:00' }), { open: '09:30', close: '22:00', overnight: false });
  assert.equal(normalizeShift({ open: '24:00', close: '22:00' }), null);
  assert.equal(normalizeShift({ open: '10:00', close: 'late' }), null);
  assert.equal(normalizeShift({ open: '10:60', close: '22:00' }), null);
  assert.equal(normalizeShift(null), null);
  assert.equal(normalizeShift('10:00-22:00'), null);
});

test('a week with no usable shift is "no structured hours", never "closed all week"', () => {
  assert.equal(normalizeWeeklyHours(undefined), undefined);
  assert.equal(normalizeWeeklyHours(null), undefined);
  assert.equal(normalizeWeeklyHours({}), undefined);
  assert.equal(normalizeWeeklyHours({ mon: { closed: true, shifts: [] }, tue: { closed: true, shifts: [] } }), undefined);
  assert.equal(normalizeWeeklyHours({ mon: { closed: false, shifts: [{ open: 'x', close: 'y' }] } }), undefined);
});

test('a day marked closed stays closed even when shifts are present', () => {
  const weekly = normalizeWeeklyHours({
    mon: { closed: true, shifts: [{ open: '10:00', close: '22:00' }] },
    tue: { closed: false, shifts: [{ open: '10:00', close: '22:00' }] },
    wed: { closed: false, shifts: [] },
  })!;
  assert.deepEqual(weekly.mon, { closed: true, shifts: [] });
  assert.equal(weekly.tue!.closed, false);
  assert.deepEqual(weekly.wed, { closed: true, shifts: [] });
  assert.equal(weekly.thu, undefined);
});

test('at most three shifts a day are kept', () => {
  const shifts = ['06:00', '09:00', '12:00', '15:00'].map((open, index) => ({ open, close: `0${index + 7}:30` }));
  assert.equal(normalizeWeeklyHours({ mon: { closed: false, shifts } })!.mon!.shifts.length, 3);
});

test('exceptions keep real dates only and drop entries that say nothing', () => {
  const exceptions = normalizeHoursExceptions([
    { date: '2026-11-12', closed: true, note: ' Diwali ' },
    { date: '2026-11-13', closed: false, shifts: [{ open: '12:00', close: '18:00' }], note: '' },
    { date: '2026-02-30', closed: true },
    { date: 'tomorrow', closed: true },
    { date: '2026-11-14', closed: false, shifts: [] },
    null,
  ]);
  assert.deepEqual(exceptions, [
    { date: '2026-11-12', closed: true, note: 'Diwali', shifts: [] },
    { date: '2026-11-13', closed: false, note: '', shifts: [{ open: '12:00', close: '18:00', overnight: false }] },
  ]);
  assert.deepEqual(normalizeHoursExceptions(undefined), []);
});

test('last order minutes are whole numbers from 1 to 120', () => {
  assert.equal(normalizeLastOrderMinutes(30), 30);
  assert.equal(normalizeLastOrderMinutes('45'), 45);
  assert.equal(normalizeLastOrderMinutes(0), undefined);
  assert.equal(normalizeLastOrderMinutes(121), undefined);
  assert.equal(normalizeLastOrderMinutes(2.5), undefined);
  assert.equal(normalizeLastOrderMinutes(null), undefined);
});

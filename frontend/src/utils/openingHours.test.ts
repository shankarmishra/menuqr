import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatMinutes,
  getOpenStatus,
  istMoment,
  normalizeHoursExceptions,
  normalizeLastOrderMinutes,
  normalizeShift,
  normalizeWeeklyHours,
  weekRows,
  type OpeningHours,
} from './openingHours.ts';

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

// ---------------------------------------------------------------------------------------------
// Open now, next change and the readable week
// ---------------------------------------------------------------------------------------------

/** An instant given as IST wall-clock time, so the tests read like a clock on the restaurant wall. */
const ist = (date: string, clock: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = clock.split(':').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - 330 * 60_000);
};
const day = (...shifts: Array<[string, string]>) => ({
  closed: shifts.length === 0,
  shifts: shifts.map(([open, close]) => ({ open, close, overnight: close <= open })),
});

// 2026-11-02 is a Monday.
const week: OpeningHours = {
  weekly: {
    mon: day(['10:00', '23:00']),
    tue: day(['10:00', '23:00']),
    wed: day(),
    thu: day(['12:00', '15:30'], ['19:00', '02:00']),
    fri: day(['10:00', '23:00']),
    sat: day(['10:00', '23:00']),
    sun: day(['10:00', '23:00']),
  },
};

test('the test calendar is what the test names say', () => {
  assert.equal(istMoment(ist('2026-11-02', '12:00')).dayIndex, 0);
  assert.equal(istMoment(ist('2026-11-05', '12:00')).dayIndex, 3);
});

test('inside a shift the restaurant is open and says when it closes', () => {
  assert.deepEqual(getOpenStatus(week, ist('2026-11-02', '10:30')), { isOpen: true, label: 'Open · closes 11 PM', time: '11 PM' });
  assert.equal(getOpenStatus(week, ist('2026-11-02', '10:00'))?.isOpen, true);
  assert.equal(getOpenStatus(week, ist('2026-11-02', '22:59'))?.isOpen, true);
});

test('before opening and at closing time it is closed and says when it opens', () => {
  assert.deepEqual(getOpenStatus(week, ist('2026-11-02', '09:59')), { isOpen: false, label: 'Closed · opens 10 AM', time: '10 AM' });
  assert.equal(getOpenStatus(week, ist('2026-11-02', '23:00'))?.isOpen, false);
  assert.equal(getOpenStatus(week, ist('2026-11-02', '23:00'))?.label, 'Closed · opens tomorrow 10 AM');
});

test('a closed day names the next day it opens', () => {
  // Tuesday night: Wednesday is closed, Thursday opens at 12 PM.
  assert.equal(getOpenStatus(week, ist('2026-11-03', '23:30'))?.label, 'Closed · opens Thu 12 PM');
  assert.equal(getOpenStatus(week, ist('2026-11-04', '12:00'))?.label, 'Closed · opens tomorrow 12 PM');
});

test('a break between two shifts is closed, and the second shift reopens the same day', () => {
  assert.equal(getOpenStatus(week, ist('2026-11-05', '15:00'))?.label, 'Open · closes 3:30 PM');
  assert.equal(getOpenStatus(week, ist('2026-11-05', '15:30'))?.label, 'Closed · opens 7 PM');
  assert.equal(getOpenStatus(week, ist('2026-11-05', '19:00'))?.label, 'Open · closes 2 AM');
});

test('a shift that runs past midnight keeps the restaurant open after midnight', () => {
  // Thursday 19:00 to Friday 02:00.
  assert.equal(getOpenStatus(week, ist('2026-11-06', '01:00'))?.label, 'Open · closes 2 AM');
  assert.equal(getOpenStatus(week, ist('2026-11-06', '01:59'))?.isOpen, true);
  assert.equal(getOpenStatus(week, ist('2026-11-06', '02:00'))?.label, 'Closed · opens 10 AM');
});

test('after-midnight hours still count when the next calendar day is a closed day', () => {
  const lateSaturday: OpeningHours = { weekly: { sat: day(['19:00', '02:00']), sun: day() } };
  assert.equal(getOpenStatus(lateSaturday, ist('2026-11-08', '01:00'))?.isOpen, true);
  assert.equal(getOpenStatus(lateSaturday, ist('2026-11-08', '03:00'))?.isOpen, false);
});

test('the status follows India time, not the clock of the phone', () => {
  // 05:00 UTC is 10:30 in India; 19:00 UTC on Sunday is 00:30 on Monday in India.
  assert.equal(getOpenStatus(week, new Date('2026-11-02T05:00:00Z'))?.isOpen, true);
  assert.equal(getOpenStatus(week, new Date('2026-11-01T19:00:00Z'))?.label, 'Closed · opens 10 AM');
});

test('a closed date overrides the weekly pattern and shows the owner note', () => {
  const diwali: OpeningHours = { ...week, exceptions: [{ date: '2026-11-05', closed: true, note: 'Diwali', shifts: [] }] };
  const status = getOpenStatus(diwali, ist('2026-11-05', '13:00'));
  assert.equal(status?.isOpen, false);
  assert.equal(status?.label, 'Closed · opens tomorrow 10 AM');
  assert.equal(status?.note, 'Diwali');
});

test('special hours on one date replace the weekly hours of that date', () => {
  const special: OpeningHours = {
    ...week,
    exceptions: [{ date: '2026-11-02', closed: false, note: '', shifts: [{ open: '12:00', close: '18:00', overnight: false }] }],
  };
  assert.equal(getOpenStatus(special, ist('2026-11-02', '11:00'))?.label, 'Closed · opens 12 PM');
  assert.equal(getOpenStatus(special, ist('2026-11-02', '17:00'))?.label, 'Open · closes 6 PM');
  assert.equal(getOpenStatus(special, ist('2026-11-02', '19:00'))?.isOpen, false);
});

test('last order time appears only while open and only when it is still ahead', () => {
  const withLastOrder: OpeningHours = { ...week, lastOrderMinutes: 30 };
  assert.equal(getOpenStatus(withLastOrder, ist('2026-11-02', '20:00'))?.lastOrder, '10:30 PM');
  assert.equal(getOpenStatus(withLastOrder, ist('2026-11-02', '22:45'))?.lastOrder, undefined);
  assert.equal(getOpenStatus(week, ist('2026-11-02', '20:00'))?.lastOrder, undefined);
});

test('a restaurant open around the clock says so instead of inventing a closing time', () => {
  const allDay: OpeningHours = {
    weekly: Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((key) => [key, day(['00:00', '00:00'])])),
  };
  assert.equal(getOpenStatus(allDay, ist('2026-11-02', '03:15'))?.label, 'Open 24 hours');
  assert.equal(getOpenStatus(allDay, ist('2026-11-04', '23:59'))?.label, 'Open 24 hours');
});

test('no structured hours means no status at all', () => {
  assert.equal(getOpenStatus(undefined, new Date()), null);
  assert.equal(getOpenStatus({ weekly: {} }, new Date()), null);
  assert.equal(weekRows(undefined, new Date()), null);
});

test('clock times read the way a diner says them', () => {
  assert.equal(formatMinutes(0), '12 AM');
  assert.equal(formatMinutes(12 * 60), '12 PM');
  assert.equal(formatMinutes(13 * 60 + 5), '1:05 PM');
  assert.equal(formatMinutes(23 * 60), '11 PM');
  assert.equal(formatMinutes(26 * 60), '2 AM');
});

test('the week lists every day, joins shifts and marks today', () => {
  const rows = weekRows(week, ist('2026-11-05', '14:00'))!;
  assert.equal(rows.length, 7);
  assert.deepEqual(rows.map((row) => row.short), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  assert.equal(rows[0].text, '10 AM – 11 PM');
  assert.equal(rows[2].text, 'Closed');
  assert.equal(rows[2].closed, true);
  assert.equal(rows[3].text, '12 PM – 3:30 PM, 7 PM – 2 AM');
  assert.deepEqual(rows.filter((row) => row.isToday).map((row) => row.name), ['Thursday']);
});

test("today's line in the week follows a special date", () => {
  const diwali: OpeningHours = { ...week, exceptions: [{ date: '2026-11-05', closed: true, note: 'Diwali', shifts: [] }] };
  assert.equal(weekRows(diwali, ist('2026-11-05', '14:00'))![3].text, 'Closed');
  // The same weekday a week earlier is not affected.
  assert.equal(weekRows(diwali, ist('2026-10-29', '14:00'))![3].text, '12 PM – 3:30 PM, 7 PM – 2 AM');
});

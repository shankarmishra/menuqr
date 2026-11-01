/**
 * Opening hours as the public menu payload carries them (`restaurant.weeklyHours`,
 * `hoursExceptions`, `lastOrderMinutes`), and what a diner needs from them: is the restaurant open
 * right now, when does it close or open next, and a readable week.
 *
 * Everything is evaluated in India Standard Time (UTC+5:30, no daylight saving), so a phone set to
 * another time zone cannot show the wrong status. Shifts may run past midnight ("18:00" to "02:00"
 * belongs to the day it starts on). Nothing here invents a value: when the owner saved no structured
 * hours, `normalizeWeeklyHours` returns `undefined` and the caller falls back to the free-text hours.
 */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export const DAY_KEYS: readonly DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface Shift {
  /** "HH:mm", 24 hour. */
  open: string;
  close: string;
  /** The shift ends after midnight (close is not later than open). */
  overnight: boolean;
}
export interface DayHours {
  closed: boolean;
  shifts: Shift[];
}
export type WeeklyHours = Partial<Record<DayKey, DayHours>>;
export interface HoursException {
  /** IST calendar date, "YYYY-MM-DD". */
  date: string;
  closed: boolean;
  note: string;
  shifts: Shift[];
}
export interface OpeningHours {
  weekly: WeeklyHours;
  exceptions?: HoursException[];
  lastOrderMinutes?: number;
}

const CLOCK = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const pad = (value: number) => String(value).padStart(2, '0');
const minutesOf = (clock: string) => {
  const [hours, minutes] = clock.split(':');
  return Number(hours) * 60 + Number(minutes);
};

function clockOf(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = CLOCK.exec(value.trim());
  return match ? `${pad(Number(match[1]))}:${match[2]}` : null;
}

function validDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = DATE.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year && check.getUTCMonth() === month - 1 && check.getUTCDate() === day
    ? `${match[1]}-${match[2]}-${match[3]}`
    : null;
}

export function normalizeShift(raw: unknown): Shift | null {
  if (!raw || typeof raw !== 'object') return null;
  const open = clockOf((raw as Record<string, unknown>).open);
  const close = clockOf((raw as Record<string, unknown>).close);
  if (!open || !close) return null;
  // Same rule the server applies when it stores the hours: a close that is not later than the
  // open means the shift ends after midnight. The stored flag is not trusted.
  return { open, close, overnight: minutesOf(close) <= minutesOf(open) };
}

function normalizeShifts(raw: unknown): Shift[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeShift).filter((shift): shift is Shift => shift !== null).slice(0, 3);
}

/**
 * The seven-day pattern, or `undefined` when no day has a usable shift (nothing saved yet, or an
 * empty `{}`), so the caller shows the free-text hours instead of claiming the place is closed.
 */
export function normalizeWeeklyHours(raw: unknown): WeeklyHours | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const weekly: WeeklyHours = {};
  let hasShift = false;
  for (const key of DAY_KEYS) {
    const day = (raw as Record<string, unknown>)[key];
    if (!day || typeof day !== 'object') continue;
    const shifts = normalizeShifts((day as Record<string, unknown>).shifts);
    const closed = (day as Record<string, unknown>).closed === true || shifts.length === 0;
    weekly[key] = { closed, shifts: closed ? [] : shifts };
    if (!closed) hasShift = true;
  }
  return hasShift ? weekly : undefined;
}

/** Date-specific changes ("12 Nov: closed for Diwali"). Entries with nothing to say are dropped. */
export function normalizeHoursExceptions(raw: unknown): HoursException[] {
  if (!Array.isArray(raw)) return [];
  const exceptions: HoursException[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const date = validDate(record.date);
    if (!date) continue;
    const closed = record.closed === true;
    const shifts = closed ? [] : normalizeShifts(record.shifts);
    if (!closed && shifts.length === 0) continue;
    const note = typeof record.note === 'string' ? record.note.trim().slice(0, 80) : '';
    exceptions.push({ date, closed, note, shifts });
  }
  return exceptions;
}

/** Minutes the owner stops taking orders before closing; only whole numbers from 1 to 120 count. */
export function normalizeLastOrderMinutes(raw: unknown): number | undefined {
  const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 120 ? value : undefined;
}

// ---------------------------------------------------------------------------------------------
// Open now, next change and the readable week
// ---------------------------------------------------------------------------------------------

const MINUTES_PER_DAY = 1440;
const IST_OFFSET_MINUTES = 330;
/** How many days ahead "opens ..." looks. */
const LOOKAHEAD_DAYS = 7;

export interface IstMoment {
  /** IST calendar date, "YYYY-MM-DD". */
  date: string;
  /** 0 = Monday ... 6 = Sunday. */
  dayIndex: number;
  /** Minutes since IST midnight. */
  minutes: number;
}

/** The IST wall clock for an instant, whatever time zone the device is set to. */
export function istMoment(now: Date): IstMoment {
  const shifted = new Date(now.getTime() + IST_OFFSET_MINUTES * 60_000);
  return {
    date: `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}`,
    dayIndex: (shifted.getUTCDay() + 6) % 7,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return `${moved.getUTCFullYear()}-${pad(moved.getUTCMonth() + 1)}-${pad(moved.getUTCDate())}`;
}

function dayIndexOf(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

/** "10 AM", "10:30 AM", "12 PM"; minutes past midnight wrap, so 26:00 reads "2 AM". */
export function formatMinutes(total: number): string {
  const minutesOfDay = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}${minutes === 0 ? '' : `:${pad(minutes)}`} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** "10 AM" for a stored "10:00". */
export function formatClock(clock: string): string {
  return formatMinutes(minutesOf(clock));
}

interface DayPlan {
  closed: boolean;
  shifts: Shift[];
  note: string;
}

/** What the owner set for one calendar date: an exception when there is one, else the weekly pattern. */
function planFor(hours: OpeningHours, date: string): DayPlan {
  const exception = hours.exceptions?.find((entry) => entry.date === date);
  if (exception) return { closed: exception.closed, shifts: exception.closed ? [] : exception.shifts, note: exception.note };
  const day = hours.weekly[DAY_KEYS[dayIndexOf(date)]];
  return day && !day.closed ? { closed: false, shifts: day.shifts, note: '' } : { closed: true, shifts: [], note: '' };
}

interface Interval {
  start: number;
  end: number;
}

/** The open stretches of one date, in minutes from today's IST midnight. A shift ending after midnight runs into the next day. */
function intervalsFor(hours: OpeningHours, date: string, offsetDays: number): Interval[] {
  return planFor(hours, date).shifts.map((shift) => {
    const start = offsetDays * MINUTES_PER_DAY + minutesOf(shift.open);
    // Equal open and close times mean a full 24 hours.
    const length = (minutesOf(shift.close) - minutesOf(shift.open) + MINUTES_PER_DAY) % MINUTES_PER_DAY || MINUTES_PER_DAY;
    return { start, end: start + length };
  });
}

/** Yesterday (for a shift that is still running after midnight) up to a week ahead, touching stretches joined. */
function openStretches(hours: OpeningHours, moment: IstMoment): Interval[] {
  const all: Interval[] = [];
  for (let offset = -1; offset <= LOOKAHEAD_DAYS; offset += 1) {
    all.push(...intervalsFor(hours, addDays(moment.date, offset), offset));
  }
  all.sort((a, b) => a.start - b.start);
  const merged: Interval[] = [];
  for (const interval of all) {
    const last = merged[merged.length - 1];
    if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
    else merged.push({ ...interval });
  }
  return merged;
}

export interface OpenStatus {
  isOpen: boolean;
  /** "Open · closes 11 PM", "Closed · opens 10 AM", "Closed · opens tomorrow 10 AM", "Open 24 hours". */
  label: string;
  /** The closing time while open, the next opening time while closed. */
  time?: string;
  /** When the owner stops taking orders, while open and only when they set last-order minutes. */
  lastOrder?: string;
  /** The owner's note for a special date ("Diwali"), when today is one. */
  note?: string;
}

/**
 * Whether the restaurant is open at `now`, from the owner's structured hours; `null` when there are
 * none, so the caller shows the free-text hours and no status rather than guessing.
 */
export function getOpenStatus(hours: OpeningHours | null | undefined, now: Date): OpenStatus | null {
  if (!hours || !hours.weekly || Object.keys(hours.weekly).length === 0) return null;
  const moment = istMoment(now);
  const note = planFor(hours, moment.date).note;
  const stretches = openStretches(hours, moment);

  const current = stretches.find((stretch) => stretch.start <= moment.minutes && moment.minutes < stretch.end);
  if (current) {
    if (current.end >= (LOOKAHEAD_DAYS + 1) * MINUTES_PER_DAY) {
      return { isOpen: true, label: 'Open 24 hours', ...(note ? { note } : {}) };
    }
    const time = formatMinutes(current.end);
    const status: OpenStatus = { isOpen: true, label: `Open · closes ${time}`, time };
    const lastOrderAt = current.end - (hours.lastOrderMinutes ?? 0);
    if ((hours.lastOrderMinutes ?? 0) > 0 && lastOrderAt > moment.minutes) status.lastOrder = formatMinutes(lastOrderAt);
    if (note) status.note = note;
    return status;
  }

  const next = stretches.find((stretch) => stretch.start > moment.minutes);
  if (!next) return { isOpen: false, label: 'Closed', ...(note ? { note } : {}) };
  const daysAhead = Math.floor(next.start / MINUTES_PER_DAY);
  const when = daysAhead === 0 ? '' : daysAhead === 1 ? 'tomorrow ' : `${DAY_SHORT[dayIndexOf(addDays(moment.date, daysAhead))]} `;
  const time = formatMinutes(next.start);
  return { isOpen: false, label: `Closed · opens ${when}${time}`, time, ...(note ? { note } : {}) };
}

export interface WeekRow {
  key: DayKey;
  name: string;
  short: string;
  /** "10 AM – 11 PM", "12 PM – 3:30 PM, 7 PM – 2 AM" or "Closed". */
  text: string;
  closed: boolean;
  isToday: boolean;
}

/** Monday to Sunday as readable lines. Today's line follows a special date when there is one. */
export function weekRows(hours: OpeningHours | null | undefined, now: Date): WeekRow[] | null {
  if (!hours || !hours.weekly || Object.keys(hours.weekly).length === 0) return null;
  const moment = istMoment(now);
  return DAY_KEYS.map((key, index) => {
    const isToday = index === moment.dayIndex;
    const day = hours.weekly[key];
    const plan = isToday ? planFor(hours, moment.date) : { closed: !day || day.closed, shifts: day?.shifts ?? [] };
    const shifts = plan.closed ? [] : plan.shifts;
    return {
      key,
      name: DAY_NAMES[index],
      short: DAY_SHORT[index],
      text: shifts.length === 0 ? 'Closed' : shifts.map((shift) => `${formatClock(shift.open)} – ${formatClock(shift.close)}`).join(', '),
      closed: shifts.length === 0,
      isToday,
    };
  });
}

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

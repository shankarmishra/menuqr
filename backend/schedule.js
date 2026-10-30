/**
 * Time-based menu categories (breakfast / lunch / dinner / happy hour).
 *
 * A schedule is `{ from: 'HH:MM', to: 'HH:MM', days?: number[] }` in India time; `days` uses
 * 0 = Sunday .. 6 = Saturday and an absent or empty list means every day. A window whose `to`
 * is earlier than `from` runs past midnight (22:00 to 02:00), and `days` then names the day it
 * starts on. Evaluated per request, never cached, because the menu payload itself is cached.
 */
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Returns a clean schedule, `null` (always available), or `{ error }` for unusable input. */
export function validateSchedule(input) {
  if (input === null || input === undefined || input === false) return null;
  if (typeof input !== 'object') return { error: 'Invalid schedule.' };
  const from = String(input.from ?? '');
  const to = String(input.to ?? '');
  if (!TIME.test(from) || !TIME.test(to)) return { error: 'Use a start and end time like 07:00 and 11:00.' };
  if (from === to) return { error: 'Start and end time cannot be the same.' };
  const days = Array.isArray(input.days)
    ? [...new Set(input.days.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort()
    : [];
  return days.length === 7 || days.length === 0 ? { from, to } : { from, to, days };
}

/** Whether the schedule allows ordering at `now`. A missing schedule is always active. */
export function isScheduleActive(schedule, now = new Date()) {
  if (!schedule || !schedule.from || !schedule.to) return true;
  const parts = Object.fromEntries(clockFormatter.formatToParts(now).map((p) => [p.type, p.value]));
  const day = WEEKDAYS[parts.weekday];
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const from = toMinutes(schedule.from);
  const to = toMinutes(schedule.to);
  const onDay = (d) => !schedule.days?.length || schedule.days.includes(d);

  if (from < to) return onDay(day) && minutes >= from && minutes < to;
  return (onDay(day) && minutes >= from) || (onDay((day + 6) % 7) && minutes < to);
}

function clock12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** "7:00 AM – 11:00 AM" or "7:00 PM – 11:00 PM (Sat, Sun)". */
export function scheduleLabel(schedule) {
  if (!schedule?.from || !schedule?.to) return '';
  const days = schedule.days?.length ? ` (${schedule.days.map((d) => DAY_NAMES[d]).join(', ')})` : '';
  return `${clock12(schedule.from)} – ${clock12(schedule.to)}${days}`;
}

/**
 * Applies the per-request flags to a (possibly cached) public menu payload without mutating it:
 * today's sold-out state and whether each category is inside its serving window.
 */
export function applyLiveFlags(data, now, todayIst) {
  if (!data || !Array.isArray(data.items)) return data;
  const categories = (data.categories || []).map((c) => {
    const active = isScheduleActive(c.schedule, now);
    return { ...c, availableNow: active, scheduleLabel: c.schedule ? scheduleLabel(c.schedule) : '' };
  });
  const byId = new Map(categories.map((c) => [c.id, c]));
  const items = data.items.map((item) => {
    const cat = byId.get(item.categoryId);
    const outOfHours = Boolean(cat && cat.availableNow === false);
    return {
      ...item,
      soldOut: item.soldOutOn === todayIst,
      availabilityNote: outOfHours ? `Available ${cat.scheduleLabel}` : null,
    };
  });
  return { ...data, categories, items };
}

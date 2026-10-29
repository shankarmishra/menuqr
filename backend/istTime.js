/**
 * India Standard Time helpers.
 *
 * Restaurant-facing "today" (sold-out resets, timed menus, analytics buckets) must follow the
 * restaurant's wall clock, not the server's timezone, which on most hosts is UTC.
 */
const IST_ZONE = 'Asia/Kolkata';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Returns the IST calendar date as `YYYY-MM-DD`. */
export function istDateString(now = new Date()) {
  return dateFormatter.format(now);
}

const hourFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: IST_ZONE,
  hour: '2-digit',
  hourCycle: 'h23',
});

/** Returns the IST `{ day: 'YYYY-MM-DD', hour: 0-23 }` bucket for a moment. */
export function istHourBucket(now = new Date()) {
  return { day: istDateString(now), hour: Number(hourFormatter.format(now)) };
}

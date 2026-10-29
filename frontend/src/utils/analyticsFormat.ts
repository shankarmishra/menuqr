export type DayPoint = { day: string; [field: string]: number | string };

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹1,23,456 (Indian digit grouping). */
export function formatInr(value: number): string {
  return `₹${inr.format(Math.round(value || 0))}`;
}

/** 1,23,456 (Indian digit grouping, no currency). */
export function formatCount(value: number): string {
  return inr.format(Math.round(value || 0));
}

/** 0 → "12 AM", 13 → "1 PM". */
export function formatHour(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? 'AM' : 'PM';
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve} ${suffix}`;
}

/** The busiest hour as "1 PM – 2 PM", or null when nothing happened. */
export function busiestHourLabel(hours: number[]): string | null {
  let best = -1;
  let bestValue = 0;
  hours.forEach((value, hour) => {
    if (value > bestValue) {
      best = hour;
      bestValue = value;
    }
  });
  return best < 0 ? null : `${formatHour(best)} – ${formatHour(best + 1)}`;
}

/** "+12.5%" / "−4%" / "New" (no baseline) / "—" (nothing to compare). */
export function formatChange(change: number | null, current: number): { text: string; tone: 'up' | 'down' | 'flat' | 'new' } {
  if (change === null) return current > 0 ? { text: 'New', tone: 'new' } : { text: '—', tone: 'flat' };
  if (change === 0) return { text: '0%', tone: 'flat' };
  const abs = Math.abs(change);
  const shown = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return change > 0 ? { text: `+${shown}%`, tone: 'up' } : { text: `−${shown}%`, tone: 'down' };
}

/** Rounds a chart maximum up to a tidy number so gridlines read well (7 → 8, 130 → 150). */
export function niceMax(value: number): number {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return 10 * magnitude;
}

/** "2026-10-29" → "29 Oct". Parsed manually so the browser timezone cannot shift the day. */
export function shortDay(day: string): string {
  const [, m, d] = day.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[(m || 1) - 1]}`;
}

export function orderTypeLabel(type: string): string {
  if (type === 'DELIVERY') return 'Delivery';
  if (type === 'DINE_IN') return 'Dine-in';
  return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, ' ');
}

// Core Web Vitals (LCP, INP, CLS) measured with the browser's own PerformanceObserver,
// so no extra package is shipped. Values are reported once, when the page is hidden.

export type VitalName = 'LCP' | 'INP' | 'CLS';
export type VitalRating = 'good' | 'needs-improvement' | 'poor';
export type VitalReport = { name: VitalName; value: number; rating: VitalRating };

// Google's published thresholds: [good up to, poor above].
const THRESHOLDS: Record<VitalName, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
};

export function rateVital(name: VitalName, value: number): VitalRating {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 'good';
  return value <= poor ? 'needs-improvement' : 'poor';
}

export type ShiftSession = { start: number; last: number; value: number };

/**
 * CLS is the largest "session window" of layout shifts: shifts less than 1 s apart,
 * in a window of at most 5 s. Returns the updated current session and the best so far.
 */
export function addLayoutShift(
  current: ShiftSession | null,
  best: number,
  shift: { startTime: number; value: number },
): { current: ShiftSession; best: number } {
  const joins = current !== null && shift.startTime - current.last < 1000 && shift.startTime - current.start < 5000;
  const next: ShiftSession = joins
    ? { start: current.start, last: shift.startTime, value: current.value + shift.value }
    : { start: shift.startTime, last: shift.startTime, value: shift.value };
  return { current: next, best: Math.max(best, next.value) };
}

/**
 * INP is the slowest interaction, ignoring one outlier for every 50 interactions.
 * `durations` holds the longest event duration of each distinct interaction.
 */
export function pickInp(durations: number[]): number | null {
  if (durations.length === 0) return null;
  const sorted = [...durations].sort((a, b) => b - a);
  const skip = Math.min(sorted.length - 1, Math.floor(durations.length / 50));
  return sorted[skip];
}

type LayoutShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean };
type EventTimingEntry = PerformanceEntry & { interactionId?: number };

export function startWebVitals(report: (vital: VitalReport) => void): void {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

  let lcp: number | null = null;
  let session: ShiftSession | null = null;
  let cls = 0;
  let sawShiftSupport = false;
  const interactions = new Map<number, number>();

  const observe = (type: string, onEntry: (entry: PerformanceEntry) => void, extra?: Record<string, unknown>) => {
    try {
      const observer = new PerformanceObserver((list) => list.getEntries().forEach(onEntry));
      observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
      return true;
    } catch {
      return false; // this browser does not report that entry type
    }
  };

  observe('largest-contentful-paint', (entry) => {
    lcp = entry.startTime;
  });
  sawShiftSupport = observe('layout-shift', (entry) => {
    const shift = entry as LayoutShiftEntry;
    if (shift.hadRecentInput) return;
    const result = addLayoutShift(session, cls, { startTime: shift.startTime, value: shift.value });
    session = result.current;
    cls = result.best;
  });
  observe(
    'event',
    (entry) => {
      const id = (entry as EventTimingEntry).interactionId;
      if (!id) return;
      interactions.set(id, Math.max(interactions.get(id) ?? 0, entry.duration));
    },
    { durationThreshold: 40 },
  );

  let sent = false;
  const flush = () => {
    if (sent) return;
    sent = true;
    if (lcp !== null) report({ name: 'LCP', value: Math.round(lcp), rating: rateVital('LCP', lcp) });
    if (sawShiftSupport) report({ name: 'CLS', value: Math.round(cls * 1000) / 1000, rating: rateVital('CLS', cls) });
    const inp = pickInp([...interactions.values()]);
    if (inp !== null) report({ name: 'INP', value: Math.round(inp), rating: rateVital('INP', inp) });
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

import { getApiBaseUrl } from './apiBaseUrl';

const storageKey = (slug: string, day: string) => `mq-hit:${slug}:${day}`;

/**
 * Counts one visit per device per day for a restaurant's analytics. Fire-and-forget: it never
 * throws, never blocks rendering, and sends nothing that identifies the diner.
 */
export function reportMenuVisit(slug: string, source: 'qr' | 'direct'): void {
  if (!slug || typeof window === 'undefined') return;
  const day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const key = storageKey(slug, day);
  try {
    if (window.localStorage.getItem(key)) return;
    window.localStorage.setItem(key, '1');
  } catch {
    // Private mode: fall through and count the visit; the server rate limit still applies.
  }
  void fetch(`${getApiBaseUrl()}/api/public/menu/${encodeURIComponent(slug)}/hit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
    keepalive: true,
  }).catch(() => undefined);
}

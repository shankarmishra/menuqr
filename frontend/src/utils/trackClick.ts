import { getApiBaseUrl } from './apiBaseUrl.ts';

/** The tap kinds the server counts (backend/routes/public.js ALLOWED_KINDS). */
export type TrackKind = 'instagram' | 'whatsapp' | 'call' | 'directions' | 'website' | 'share' | 'zomato' | 'swiggy' | 'custom';

/** A second tap of the same kind inside this window is not counted again (double taps, bouncing fingers). */
const THROTTLE_MS = 2000;
const lastSentAt = new Map<string, number>();

export function trackClickRequest(baseUrl: string, slug: string, kind: TrackKind): { url: string; init: RequestInit } {
  return {
    url: `${baseUrl}/api/public/menus/${encodeURIComponent(slug)}/track-click`,
    // Only the kind: no visitor id, no cookie, no page address.
    init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }), keepalive: true },
  };
}

/**
 * Privacy-safe tap counter for the owner's Insights ("34 guests tapped Instagram this week").
 * Fire and forget: it never throws, never waits and never blocks the tap that triggered it.
 */
export function trackClick(
  slug: string | undefined,
  kind: TrackKind,
  options: { send?: typeof fetch; baseUrl?: string; now?: number } = {}
): void {
  if (!slug) return;
  const now = options.now ?? Date.now();
  const key = `${slug}:${kind}`;
  const previous = lastSentAt.get(key);
  if (previous !== undefined && now - previous < THROTTLE_MS) return;
  lastSentAt.set(key, now);
  try {
    const { url, init } = trackClickRequest(options.baseUrl ?? getApiBaseUrl(), slug, kind);
    void (options.send ?? fetch)(url, init).catch(() => undefined);
  } catch {
    // A failed beacon must never get in the way of the tap.
  }
}

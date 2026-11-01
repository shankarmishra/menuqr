/**
 * Menu traffic counters.
 *
 * Each hit increments one aggregated row per tenant per IST hour. Nothing identifying is stored,
 * so there is no consent surface and the table cannot grow per-visitor.
 */
import { istHourBucket } from './istTime.js';

const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|curl|wget|python-requests/i;

/** True for crawlers and link-preview fetchers, which should not count as diners. */
export function isBotAgent(userAgent) {
  const ua = String(userAgent || '');
  return !ua || BOT_PATTERN.test(ua);
}

/**
 * Sliding fixed-window limiter. `store` is a Map owned by the caller so tests can inject their own.
 * Returns true when the hit is allowed.
 */
export function allowHit(store, key, now = Date.now(), limit = 120, windowMs = 60 * 60 * 1000) {
  const entry = store.get(key);
  if (!entry || now - entry.start >= windowMs) {
    store.set(key, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

/**
 * Drops expired entries once a limiter map has grown large, so a flood of distinct keys (for
 * example one request from each of many IPs) cannot grow it without bound.
 */
export function pruneHits(store, now = Date.now(), windowMs = 60 * 60 * 1000, maxEntries = 5000) {
  if (store.size <= maxEntries) return;
  for (const [key, entry] of store) {
    if (now - entry.start >= windowMs) store.delete(key);
  }
}

/** Upserts one hit. `source` is 'qr' (scanned a code) or anything else (direct link / typed URL). */
export async function recordMenuHit(db, tenantId, source, now = new Date()) {
  const { day, hour } = istHourBucket(now);
  const isScan = source === 'qr';
  await db.query(
    `INSERT INTO menu_hourly_stats (tenant_id, day, hour, scans, views)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (tenant_id, day, hour)
     DO UPDATE SET scans = menu_hourly_stats.scans + EXCLUDED.scans, views = menu_hourly_stats.views + EXCLUDED.views`,
    [tenantId, day, hour, isScan ? 1 : 0, isScan ? 0 : 1]
  );
}

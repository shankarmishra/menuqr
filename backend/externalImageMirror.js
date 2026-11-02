/**
 * Copies dish photos that live on other websites (Wikimedia, Unsplash, a restaurant's own site...)
 * into this app's own storage.
 *
 * Why: a menu that hot-links 150+ photos from a third party is slow (their servers build each
 * thumbnail on first request), gets rate-limited (HTTP 429) under real traffic, and loses photos
 * whenever the other site moves or deletes a file. Photos we host ourselves are small WebP files
 * served from our own bucket.
 *
 * Safety: the URLs come from a spreadsheet the owner uploaded, so the server must not be tricked
 * into calling internal addresses (SSRF). Every connection is resolved here and refused if any
 * address is private, loopback, link-local or otherwise non-public; redirects are followed by hand
 * (max 3) so each hop is checked again. Size, time and content type are capped.
 */
import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import net from 'node:net';
import { optimizeAndSaveImage } from './imageOptimizer.js';

const MAX_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 3;

export function isNonPublicIp(address) {
  if (net.isIPv6(address)) {
    const a = address.toLowerCase();
    if (a === '::1' || a === '::') return true;
    if (a.startsWith('fc') || a.startsWith('fd')) return true; // unique local
    if (a.startsWith('fe8') || a.startsWith('fe9') || a.startsWith('fea') || a.startsWith('feb')) return true; // link-local
    const mapped = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isNonPublicIp(mapped[1]) : false;
  }
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a, b] = parts;
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224 // multicast and reserved
  );
}

function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true }, (error, addresses) => {
    if (error) return callback(error);
    if (!addresses.length || addresses.some((entry) => isNonPublicIp(entry.address))) {
      return callback(new Error('Blocked: address is not a public internet address.'));
    }
    if (options && options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

export function parsePublicHttpUrl(value) {
  let url;
  try {
    url = new URL(String(value).trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (url.port && url.port !== '80' && url.port !== '443') return null;
  if (net.isIP(url.hostname) && isNonPublicIp(url.hostname)) return null;
  if (url.hostname === 'localhost' || url.hostname.endsWith('.local') || url.hostname.endsWith('.internal')) return null;
  return url;
}

function fetchOnce(url) {
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const request = client.get(
      url,
      {
        lookup: safeLookup,
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          'User-Agent': 'MenusQR-image-mirror/1.0 (+https://menusqr.in)',
          Accept: 'image/avif,image/webp,image/jpeg,image/png,*/*;q=0.5',
        },
      },
      (response) => {
        const status = response.statusCode || 0;
        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          return resolve({ redirect: new URL(response.headers.location, url).toString() });
        }
        if (status !== 200) {
          response.resume();
          return reject(new Error(`HTTP ${status}`));
        }
        const type = String(response.headers['content-type'] || '').toLowerCase();
        if (!type.startsWith('image/') || type.includes('svg')) {
          response.resume();
          return reject(new Error(`Not a raster image (${type || 'no content-type'})`));
        }
        const declared = Number(response.headers['content-length'] || 0);
        if (declared > MAX_BYTES) {
          response.resume();
          return reject(new Error('Image is too large.'));
        }
        const chunks = [];
        let size = 0;
        response.on('data', (chunk) => {
          size += chunk.length;
          if (size > MAX_BYTES) {
            request.destroy(new Error('Image is too large.'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => resolve({ buffer: Buffer.concat(chunks) }));
        response.on('error', reject);
      }
    );
    request.on('timeout', () => request.destroy(new Error('Timed out.')));
    request.on('error', reject);
  });
}

export async function fetchPublicImage(rawUrl) {
  let current = parsePublicHttpUrl(rawUrl);
  if (!current) throw new Error('Not a public http(s) URL.');
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const result = await fetchOnce(current);
    if (result.buffer) return result.buffer;
    current = parsePublicHttpUrl(result.redirect);
    if (!current) throw new Error('Redirected to a blocked address.');
  }
  throw new Error('Too many redirects.');
}

/** True for photos already served by us: site-relative paths and our own bucket / asset host. */
export function isOwnImageUrl(value, env = process.env) {
  const url = String(value || '').trim();
  if (!url) return true;
  if (url.startsWith('/') || url.startsWith('data:')) return true;
  const own = [env.ASSET_BASE_URL, env.S3_ENDPOINT].filter(Boolean);
  return own.some((base) => {
    try {
      return new URL(url).host === new URL(base).host;
    } catch {
      return false;
    }
  });
}

/**
 * Replaces every external `imageUrl` on `items` (in place) with a copy hosted in our storage.
 * Never throws and never drops a photo: if a link cannot be fetched, is not an image, or the time
 * budget runs out, that item keeps its original URL and the dish card still shows it directly.
 *
 * @returns {{ mirrored: number, failed: number, skipped: number }}
 */
export async function mirrorExternalImages(items, tenantId, options = {}) {
  const { budgetMs = 70_000, concurrency = 3, field = 'imageUrl', maxWidth = 800, quality = 78, env = process.env } = options;
  const result = { mirrored: 0, failed: 0, skipped: 0 };
  if (!Array.isArray(items) || !tenantId) return result;

  const byUrl = new Map();
  for (const item of items) {
    const url = item?.[field];
    if (typeof url !== 'string' || isOwnImageUrl(url, env) || !parsePublicHttpUrl(url)) {
      result.skipped += 1;
      continue;
    }
    if (!byUrl.has(url)) byUrl.set(url, []);
    byUrl.get(url).push(item);
  }

  const queue = [...byUrl.keys()];
  const deadline = Date.now() + budgetMs;

  async function worker() {
    while (queue.length > 0 && Date.now() < deadline) {
      const url = queue.shift();
      try {
        const buffer = await fetchPublicImage(url);
        const saved = await optimizeAndSaveImage(buffer, tenantId, 'dishes', { maxWidth, quality, variants: false });
        for (const item of byUrl.get(url)) item[field] = saved.url;
        result.mirrored += byUrl.get(url).length;
      } catch (error) {
        result.failed += byUrl.get(url).length;
        console.warn(`[image-mirror] kept original link (${error.message}): ${url.slice(0, 120)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  // Anything still queued when the time budget ended keeps its external link.
  for (const url of queue) result.failed += byUrl.get(url).length;
  return result;
}

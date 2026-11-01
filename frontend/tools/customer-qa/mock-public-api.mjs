#!/usr/bin/env node
/**
 * Local mock of the public menu API, for checking the customer menu page without a database.
 *
 *   node tools/customer-qa/mock-public-api.mjs --port 3911 --dir <folder with <slug>.json files>
 *   MENUSQR_API_PROXY=http://127.0.0.1:3911 npx vite --port 5191
 *
 * Serves, from the fixtures folder:
 *   GET  /api/public/menus/:slug            <slug>.json (the public payload)
 *   GET  /api/public/qr/:id                 the fixture named in _qr.json ({ "<id>": "<slug>" }), with menuSlug added
 *   POST /api/public/menus/:slug/track-click  recorded; read them back with GET /__mock/clicks (DELETE clears)
 *   POST /api/public/menu/:slug/hit         accepted and ignored
 *   GET  /api/mock-img/:name.jpg            generated JPEG; ?w=&h=&delay=<ms> (default 800x600, no delay)
 *
 * A fixture may carry a "__mock" object to simulate trouble (it is removed from the answer):
 *   { "status": 403, "body": { "error": "SUBSCRIPTION_EXPIRED" } }   answer with this status and body
 *   { "delayMs": 4000 }                                                answer slowly
 *   { "failFirst": 2 }                                                 answer 503 to the first 2 requests, then normally
 *
 * Local QA tool only. It reads nothing but the fixtures folder and never contacts a real service.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const port = Number(option('port', '3911'));
const dir = path.resolve(option('dir', '.'));

const clicks = [];
const seen = new Map();
const imageCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readFixture(name) {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return null;
  const file = path.join(dir, `${name}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function answerWithFixture(res, key, fixture, extra = {}) {
  const mock = fixture.__mock ?? {};
  if (mock.delayMs) await sleep(mock.delayMs);
  if (mock.failFirst) {
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    if (count <= mock.failFirst) return json(res, 503, { error: 'Service temporarily unavailable.' });
  }
  if (mock.status) return json(res, mock.status, mock.body ?? { error: 'Mock error.' });
  const { __mock, ...payload } = fixture;
  return json(res, 200, { ...payload, ...extra });
}

async function image(res, name, query) {
  const width = Math.min(1600, Math.max(16, Number(query.get('w')) || 800));
  const height = Math.min(1600, Math.max(16, Number(query.get('h')) || 600));
  const delay = Math.min(10_000, Number(query.get('delay')) || 0);
  const key = `${name}:${width}x${height}`;
  if (!imageCache.has(key)) {
    const hash = crypto.createHash('md5').update(name).digest();
    const hue = (hash[0] * 360) / 255;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},55%,45%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},60%,28%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 4}" fill="rgba(255,255,255,0.25)"/></svg>`;
    imageCache.set(key, await sharp(Buffer.from(svg)).jpeg({ quality: 72 }).toBuffer());
  }
  if (delay) await sleep(delay);
  res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' });
  res.end(imageCache.get(key));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://mock.local');
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

    if (url.pathname === '/__mock/clicks') {
      if (req.method === 'DELETE') clicks.length = 0;
      return json(res, 200, clicks);
    }
    if (parts[0] === 'api' && parts[1] === 'mock-img' && parts[2]) return await image(res, parts[2], url.searchParams);

    if (parts[0] === 'api' && parts[1] === 'public') {
      if (req.method === 'GET' && parts[2] === 'menus' && parts[3] && !parts[4]) {
        const fixture = readFixture(parts[3]);
        if (!fixture) return json(res, 404, { error: 'This menu was not found.' });
        return await answerWithFixture(res, `menu:${parts[3]}`, fixture);
      }
      if (req.method === 'GET' && parts[2] === 'qr' && parts[3]) {
        const map = readFixture('_qr') ?? {};
        const slug = map[parts[3]];
        const fixture = slug ? readFixture(slug) : null;
        if (!fixture) return json(res, 404, { error: 'This QR code is inactive or invalid.' });
        return await answerWithFixture(res, `qr:${parts[3]}`, fixture, { menuSlug: slug });
      }
      if (req.method === 'POST' && parts[2] === 'menus' && parts[4] === 'track-click') {
        let body = '';
        for await (const chunk of req) body += chunk;
        clicks.push({ slug: parts[3], body: JSON.parse(body || '{}'), at: Date.now() });
        return json(res, 200, { success: true });
      }
      if (req.method === 'POST' && parts[2] === 'menu' && parts[4] === 'hit') {
        for await (const chunk of req) void chunk;
        return json(res, 200, { success: true });
      }
    }
    return json(res, 404, { error: 'Not found in the mock API.' });
  } catch (error) {
    return json(res, 500, { error: `Mock API failure: ${error instanceof Error ? error.message : String(error)}` });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`mock public API on http://127.0.0.1:${port} serving ${dir}`);
});

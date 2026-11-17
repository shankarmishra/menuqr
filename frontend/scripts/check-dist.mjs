// Checks the built site in dist/: SEO rules for every indexable page and a bundle size budget.
// Run after `npm run build`:  node scripts/check-dist.mjs
// Exit code 1 when a rule marked "fail" is broken; "warn" lines are goals not yet enforced.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('check-dist: dist/index.html not found. Run the build first.');
  process.exit(1);
}

const ORIGIN = 'https://menusqr.in';
// Prices that were once hard-coded in the prerender fallback and are no longer true.
const STALE_PRICES = ['₹999', '₹1,499', '₹1499', '₹2,999', '₹2999'];
// Goals from the redesign plan. Raise a "warn" to "fail" once the pages reach it.
const MIN_WORDS = { pillar: 1500, guide: 1000, other: 300 };
const PILLARS = ['/digital-qr-menu', '/qr-menu-for-restaurants', '/qr-ordering-for-restaurants'];
// Entry budget is a ceiling against growth, not the target. Long content pages are in their
// own chunk (content/manifest.ts); the diner/marketing split (plan 3.5) should bring the
// entry under 300 KB. Lower this number when that lands.
const BUDGET_KB = { entryJs: 500, anyChunk: 500 };

const failures = [];
const warnings = [];
const fail = (page, message) => failures.push(`${page}: ${message}`);
const warn = (page, message) => warnings.push(`${page}: ${message}`);

const count = (html, pattern) => (html.match(pattern) || []).length;
const visibleWords = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

function fileFor(route) {
  if (route === '/') return path.join(dist, 'index.html');
  return path.join(dist, route.slice(1), 'index.html');
}

// ── Pages listed in the sitemap ──
const sitemapPath = path.join(dist, 'sitemap.xml');
const routes = fs.existsSync(sitemapPath)
  ? [...fs.readFileSync(sitemapPath, 'utf-8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, '') || '/')
  : [];
if (routes.length === 0) fail('sitemap.xml', 'missing or has no URLs');

const rows = [];
for (const route of routes) {
  const file = fileFor(route);
  if (!fs.existsSync(file)) {
    fail(route, 'listed in the sitemap but no HTML file was built');
    continue;
  }
  const html = fs.readFileSync(file, 'utf-8');
  const words = visibleWords(html);

  if (count(html, /<title[\s>]/g) !== 1) fail(route, `expected 1 <title>, found ${count(html, /<title[\s>]/g)}`);
  if (count(html, /rel="canonical"/g) !== 1) fail(route, `expected 1 canonical link, found ${count(html, /rel="canonical"/g)}`);
  if (count(html, /<h1[\s>]/g) !== 1) fail(route, `expected 1 <h1>, found ${count(html, /<h1[\s>]/g)}`);
  if (!/name="description" content="[^"]{50,}/.test(html)) fail(route, 'meta description missing or shorter than 50 characters');
  if (/name="robots" content="noindex/.test(html)) fail(route, 'is in the sitemap but marked noindex');

  const expectedCanonical = `${ORIGIN}${route === '/' ? '' : route}`;
  const canonical = (html.match(/rel="canonical" href="([^"]+)"/) || html.match(/href="([^"]+)"[^>]*rel="canonical"/) || [])[1];
  // The homepage may be written with or without the trailing slash; both are the same URL.
  if (canonical && canonical.replace(/\/$/, '') !== expectedCanonical) fail(route, `canonical is ${canonical}, expected ${expectedCanonical}`);

  for (const block of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch {
      fail(route, 'JSON-LD block is not valid JSON');
    }
  }
  if (count(html, /application\/ld\+json/g) === 0) warn(route, 'no structured data');

  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length > 60) warn(route, `title is ${title.length} characters (goal: 60 or fewer)`);

  for (const price of STALE_PRICES) {
    // "₹1,999" contains "₹999"-like text only after a digit or comma, so require a non-digit before the rupee sign match end.
    const pattern = new RegExp(`${price.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d,])`);
    if (pattern.test(html)) fail(route, `shows the old price ${price}`);
  }

  const kind = PILLARS.includes(route) ? 'pillar' : route.startsWith('/guides/') ? 'guide' : 'other';
  if (words < MIN_WORDS[kind]) warn(route, `${words} words (goal for ${kind} pages: ${MIN_WORDS[kind]}+)`);
  rows.push([route, words, title.length]);
}

// ── Bundle budget ──
const assetsDir = path.join(dist, 'assets');
const assets = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js')) : [];
const sizes = assets.map((f) => [f, Math.round(fs.statSync(path.join(assetsDir, f)).size / 1024)]).sort((a, b) => b[1] - a[1]);
const entry = sizes.find(([f]) => /^index-/.test(f));
if (entry && entry[1] > BUDGET_KB.entryJs) fail('bundle', `entry ${entry[0]} is ${entry[1]} KB (budget ${BUDGET_KB.entryJs} KB)`);
for (const [file, kb] of sizes) {
  if (kb > BUDGET_KB.anyChunk && file !== entry?.[0]) warn('bundle', `${file} is ${kb} KB (goal: ${BUDGET_KB.anyChunk} KB or less)`);
}

// ── Report ──
console.log(`check-dist: ${routes.length} sitemap pages, ${assets.length} JS files`);
console.log('words  title  page');
for (const [route, words, titleLength] of rows) console.log(`${String(words).padStart(5)}  ${String(titleLength).padStart(5)}  ${route}`);
console.log(`largest JS: ${sizes.slice(0, 5).map(([f, kb]) => `${f.replace(/-[^.]+\./, '.')} ${kb} KB`).join(', ')}`);
if (warnings.length) console.log(`\n${warnings.length} warning(s):\n  ${warnings.join('\n  ')}`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log('\ncheck-dist: no failures');

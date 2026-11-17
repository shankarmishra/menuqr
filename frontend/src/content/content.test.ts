import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_LONG_FORM_PAGES, CONTENT_PATHS, GUIDES, GUIDES_PATH, MERGED_PAGE_REDIRECTS, PILLAR_PAGES, STANDALONE_PAGES } from './index.ts';
import { countWords } from './types.ts';
import { NICHE_PAGES, nichePath } from '../pages/public/seo/nichePages.ts';

// Every public route a content page may link to. Keep in sync with src/ssr-entry.tsx.
const STATIC_ROUTES = ['/', '/plans', '/how-it-works', '/templates', '/about', '/contact', '/faq', '/privacy', '/terms', '/refund-cancellation', GUIDES_PATH];
const KNOWN_ROUTES = new Set([...STATIC_ROUTES, ...ALL_LONG_FORM_PAGES.map((p) => p.path), ...NICHE_PAGES.map((p) => nichePath(p.slug))]);

const linksOf = (page: (typeof ALL_LONG_FORM_PAGES)[number]) => [...page.related, page.cta, ...page.sections.flatMap((s) => s.links ?? [])];

test('paths and titles are unique across all long-form pages', () => {
  assert.equal(new Set(ALL_LONG_FORM_PAGES.map((p) => p.path)).size, ALL_LONG_FORM_PAGES.length);
  assert.equal(new Set(ALL_LONG_FORM_PAGES.map((p) => p.title)).size, ALL_LONG_FORM_PAGES.length);
});

test('titles fit in 60 characters and descriptions in 50-160', () => {
  for (const page of ALL_LONG_FORM_PAGES) {
    assert.ok(page.title.length <= 60, `${page.path} title is ${page.title.length} characters`);
    assert.ok(page.description.length >= 50 && page.description.length <= 160, `${page.path} description is ${page.description.length}`);
  }
});

test('guides live under /guides/ and have 1,000+ words; standalone pages 1,000+', () => {
  for (const page of GUIDES) {
    assert.ok(page.path.startsWith(`${GUIDES_PATH}/`), page.path);
    assert.ok(countWords(page) >= 1000, `${page.path} has ${countWords(page)} words`);
  }
  for (const page of STANDALONE_PAGES) assert.ok(countWords(page) >= 1000, `${page.path} has ${countWords(page)} words`);
});

test('every internal link points at a page that exists and is not a merged page', () => {
  for (const page of ALL_LONG_FORM_PAGES) {
    for (const link of linksOf(page)) {
      assert.ok(!(link.to in MERGED_PAGE_REDIRECTS), `${page.path} links to merged ${link.to}`);
      assert.ok(KNOWN_ROUTES.has(link.to), `${page.path} links to unknown ${link.to}`);
    }
  }
});

test('updated dates are real ISO dates', () => {
  for (const page of ALL_LONG_FORM_PAGES) {
    assert.match(page.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!Number.isNaN(Date.parse(page.updated)), page.path);
  }
});

test('no page shows an old price', () => {
  const stale = /₹(999|1,499|1499|2,999|2999)(?![\d,])/;
  for (const page of ALL_LONG_FORM_PAGES) assert.ok(!stale.test(JSON.stringify(page)), `${page.path} shows an old price`);
});

test('the yearly saving table on the price page matches the plan prices', () => {
  const page = STANDALONE_PAGES.find((p) => p.path === '/qr-menu-price-india');
  assert.ok(page);
  const table = page.sections.flatMap((s) => s.blocks).find((b) => b.type === 'table' && b.caption.startsWith('Twelve monthly'));
  assert.ok(table && table.type === 'table');
  const rupees = (s: string) => Number(s.replace(/[^\d]/g, ''));
  const prices: Record<string, [number, number]> = { Basic: [559, 1999], Intermediate: [959, 3199], Premium: [1119, 6799] };
  for (const [plan, twelve, yearly, saving, perMonth] of table.rows) {
    const [m, y] = prices[plan];
    assert.equal(rupees(twelve), m * 12, `${plan} 12 x monthly`);
    assert.equal(rupees(yearly), y, `${plan} yearly`);
    assert.equal(rupees(saving), m * 12 - y, `${plan} saving`);
    assert.equal(rupees(perMonth), Math.round(y / 12), `${plan} per month`);
  }
});

test('the lightweight route manifest lists exactly the content pages', () => {
  const expected = [GUIDES_PATH, ...ALL_LONG_FORM_PAGES.map((p) => p.path)].sort();
  assert.deepEqual([...CONTENT_PATHS].sort(), expected);
});

test('pillar pages are still the three service pages', () => {
  assert.deepEqual(PILLAR_PAGES.map((p) => p.path), ['/digital-qr-menu', '/qr-menu-for-restaurants', '/qr-ordering-for-restaurants']);
});

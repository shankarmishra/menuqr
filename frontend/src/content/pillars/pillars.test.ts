import test from 'node:test';
import assert from 'node:assert/strict';
import { PILLAR_PAGES, MERGED_PAGE_REDIRECTS } from './index.ts';
import { countWords } from '../types.ts';

test('pillar pages have unique paths, titles and descriptions within length limits', () => {
  const paths = new Set(PILLAR_PAGES.map((p) => p.path));
  const titles = new Set(PILLAR_PAGES.map((p) => p.title));
  assert.equal(paths.size, PILLAR_PAGES.length);
  assert.equal(titles.size, PILLAR_PAGES.length);
  for (const page of PILLAR_PAGES) {
    assert.ok(page.title.length <= 60, `${page.path} title is ${page.title.length} characters`);
    assert.ok(page.description.length >= 50 && page.description.length <= 160, `${page.path} description is ${page.description.length} characters`);
  }
});

test('each pillar page has at least 1,500 words of body copy', () => {
  for (const page of PILLAR_PAGES) {
    const words = countWords(page);
    assert.ok(words >= 1500, `${page.path} has ${words} words`);
  }
});

test('section ids are unique on a page and FAQ questions are not repeated across pages', () => {
  const questions = new Set<string>();
  for (const page of PILLAR_PAGES) {
    const ids = page.sections.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${page.path} repeats a section id`);
    for (const faq of page.faqs) {
      assert.ok(!questions.has(faq.question), `repeated FAQ: ${faq.question}`);
      questions.add(faq.question);
    }
  }
});

test('internal links never point at a merged page', () => {
  const merged = Object.keys(MERGED_PAGE_REDIRECTS);
  for (const page of PILLAR_PAGES) {
    const links = [...page.related, page.cta, ...page.sections.flatMap((s) => s.links ?? [])];
    for (const link of links) assert.ok(!merged.includes(link.to), `${page.path} links to ${link.to}`);
  }
});

test('merged pages redirect to a pillar page', () => {
  const paths = PILLAR_PAGES.map((p) => p.path);
  for (const target of Object.values(MERGED_PAGE_REDIRECTS)) assert.ok(paths.includes(target));
});

test('copy only shows the current plan prices', () => {
  const allowed = new Set(['₹559', '₹1,999', '₹959', '₹3,199', '₹1,119', '₹6,799']);
  for (const page of PILLAR_PAGES) {
    for (const price of JSON.stringify(page).match(/₹[\d,]+/g) ?? []) {
      assert.ok(allowed.has(price), `${page.path} shows ${price}`);
    }
  }
});

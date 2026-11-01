#!/usr/bin/env node
/**
 * Prints the size of elements matched by a CSS selector at a given viewport width, for layout debugging.
 *   node tools/customer-qa/measure.mjs --base http://127.0.0.1:5191 --slug profile-full --width 360 --selector "header > *"
 */
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(opt('width', '360')), height: 740 } });
await page.goto(`${opt('base', 'http://127.0.0.1:5191')}/menu/${opt('slug', 'profile-full')}`, { waitUntil: 'domcontentloaded' });
await page.getByText('Prepared with care at').waitFor({ timeout: 30_000 });
const boxes = await page.locator(opt('selector', 'header > *')).evaluateAll((nodes) =>
  nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return { tag: node.tagName.toLowerCase(), cls: String(node.className).slice(0, 50), x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) };
  })
);
console.table(boxes);
await browser.close();

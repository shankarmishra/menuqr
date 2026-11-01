#!/usr/bin/env node
/**
 * Browser check of the customer menu page's Info sheet (CU-2) against the local mock API.
 *
 *   node tools/customer-qa/qa-info.mjs --base http://127.0.0.1:5191 --mock http://127.0.0.1:3911 --shots <folder>
 *
 * Needs the fixtures from build-fixtures.mjs, the mock API and a Vite dev (or preview) server proxied to it.
 * Exits with code 1 when any check fails.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 && args[at + 1] ? args[at + 1] : fallback;
};
const base = opt('base', 'http://127.0.0.1:5191');
const mock = opt('mock', 'http://127.0.0.1:3911');
const shots = path.resolve(opt('shots', './shots'));
fs.mkdirSync(shots, { recursive: true });

const VIEWPORTS = [
  { name: '360', width: 360, height: 740, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '412', width: 412, height: 915, mobile: true },
  { name: '1280', width: 1280, height: 800, mobile: false },
];

let failures = 0;
const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` - ${detail}` : ''}`);
};

// Monday 10:30 in India.
const MONDAY_MORNING = new Date('2026-11-02T05:00:00Z');
// Sunday 01:00 in India, inside Saturday's late shift.
const SUNDAY_AFTER_MIDNIGHT = new Date('2026-11-07T19:30:00Z');

const browser = await chromium.launch();

async function open(viewport, slug, { time = MONDAY_MORNING, share = 'none' } = {}) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  // Never leave the page: external links are answered with an empty page.
  await context.route(/^https:\/\/(?!maps\.app).*/, (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>external</title>' }));
  await context.addInitScript((mode) => {
    if (mode === 'none') Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    if (mode === 'stub') {
      window.__shared = [];
      Object.defineProperty(navigator, 'share', { value: (data) => { window.__shared.push(data); return Promise.resolve(); }, configurable: true });
    }
  }, share);
  const page = await context.newPage();
  await page.clock.setFixedTime(time);
  await fetch(`${mock}/__mock/clicks`, { method: 'DELETE' });
  await page.goto(`${base}/menu/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Prepared with care at').waitFor({ timeout: 30_000 });
  return { context, page };
}

const clicks = async () => (await (await fetch(`${mock}/__mock/clicks`)).json()).map((entry) => entry.body.kind);

for (const viewport of VIEWPORTS) {
  const tag = `[${viewport.name}]`;
  const { context, page } = await open(viewport, 'profile-full');
  const infoButton = page.getByRole('button', { name: 'Restaurant info and contact' });
  await infoButton.waitFor();
  await page.screenshot({ path: path.join(shots, `cu2-${viewport.name}-1-top.png`) });
  check(`${tag} no horizontal scroll on the page`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await infoButton.click();
  const dialog = page.getByRole('dialog', { name: 'Test Dhaba' });
  await dialog.waitFor();
  await page.waitForTimeout(450);
  check(`${tag} sheet is a modal dialog named after the restaurant`, (await dialog.getAttribute('aria-modal')) === 'true');
  check(`${tag} focus moves into the sheet`, await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))));
  check(`${tag} the page behind is inert`, await page.evaluate(() => document.getElementById('root')?.hasAttribute('inert') === true));
  check(`${tag} page scroll is locked`, await page.evaluate(() => document.body.style.overflow === 'hidden'));
  await page.screenshot({ path: path.join(shots, `cu2-${viewport.name}-2-info.png`) });

  const text = await dialog.innerText();
  check(`${tag} shows open status and closing time`, text.includes('Open · closes 11 PM'));
  check(`${tag} shows today's hours`, text.includes('Today 10 AM – 11 PM'));
  check(`${tag} shows last order time`, text.includes('Last order 10:30 PM'));
  check(`${tag} shows the address lines`, text.includes('E-36, Test Nagar') && text.includes('Testpur, Test State 201001') && text.includes('Landmark: Opposite Test Mall'));
  check(`${tag} shows FSSAI as small print`, text.includes('FSSAI Lic. No. 12345678901234'));
  check(`${tag} shows the diet label`, text.includes('Veg and non-veg'));

  const links = await dialog.locator('a').evaluateAll((anchors) => anchors.map((a) => ({ text: a.innerText.replace(/\s+/g, ' ').trim(), href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') })));
  const byText = (needle) => links.find((link) => link.text.includes(needle));
  check(`${tag} directions use the saved maps link`, byText('Get directions')?.href === 'https://maps.app.goo.gl/test123');
  check(`${tag} both public numbers are call buttons`, links.filter((l) => l.href?.startsWith('tel:')).map((l) => l.href).join() === 'tel:+919876543210,tel:+919876543211');
  check(`${tag} WhatsApp link is a wa.me link`, byText('WhatsApp')?.href?.startsWith('https://wa.me/919876543210?text=') === true);
  check(`${tag} Instagram link is built from the handle`, byText('Instagram')?.href === 'https://www.instagram.com/testdhaba/');
  check(`${tag} Facebook, website and Zomato links exist`, Boolean(byText('Facebook')) && Boolean(byText('Website')) && Boolean(byText('Zomato')));
  check(`${tag} no link is "#" or empty`, links.every((l) => l.href && l.href !== '#'));
  check(`${tag} every web link opens in a new tab safely`, links.filter((l) => l.href.startsWith('http')).every((l) => l.target === '_blank' && /noopener/.test(l.rel ?? '') && /noreferrer/.test(l.rel ?? '')));

  // Focus trap: Tab many times, focus must never leave the dialog.
  let escaped = false;
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))) escaped = true;
  }
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Shift+Tab');
    if (!(await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))))) escaped = true;
  }
  check(`${tag} focus stays inside the sheet with Tab and Shift+Tab`, !escaped);

  await dialog.getByRole('button', { name: 'Full week' }).click();
  const rows = dialog.locator('dl > div');
  check(`${tag} full week lists 7 days with today marked`, (await rows.count()) === 7 && (await dialog.locator('[aria-current="date"]').count()) === 1);
  await page.screenshot({ path: path.join(shots, `cu2-${viewport.name}-3-week.png`) });

  // Beacons
  await dialog.getByRole('link', { name: /Instagram/ }).click();
  await page.waitForTimeout(300);
  await dialog.getByRole('link', { name: /Get directions/ }).click();
  await page.waitForTimeout(300);
  await dialog.getByRole('link', { name: /WhatsApp/ }).click();
  await page.waitForTimeout(300);
  const sent = await clicks();
  check(`${tag} beacons sent for instagram, directions and whatsapp`, ['instagram', 'directions', 'whatsapp'].every((kind) => sent.includes(kind)), sent.join());
  check(`${tag} beacon body holds only the kind`, (await (await fetch(`${mock}/__mock/clicks`)).json()).every((entry) => Object.keys(entry.body).join() === 'kind'));

  // Share falls back to copying the link
  await dialog.getByRole('button', { name: 'Share this menu' }).click();
  await page.waitForTimeout(300);
  check(`${tag} share without a share sheet copies the link`, (await dialog.innerText()).includes('Link copied'));
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  check(`${tag} copied link is the clean menu address`, copied === `${base}/menu/profile-full`, copied);

  // Escape closes and returns focus to the Info button
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  check(`${tag} Escape closes the sheet`, true);
  check(`${tag} focus returns to the Info button`, await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === 'Restaurant info and contact'));
  check(`${tag} page is interactive and scrollable again`, await page.evaluate(() => !document.getElementById('root')?.hasAttribute('inert') && document.body.style.overflow !== 'hidden'));

  // Backdrop closes
  await infoButton.click();
  await dialog.waitFor();
  await page.waitForTimeout(350);
  await page.mouse.click(viewport.mobile ? 8 : 20, 8);
  await dialog.waitFor({ state: 'detached' });
  check(`${tag} clicking the backdrop closes the sheet`, true);

  // The top bar links come from the same helpers
  const header = await page.locator('header').first().locator('a').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
  check(`${tag} top bar links are valid helper-built links`, header.some((href) => href === 'https://www.instagram.com/testdhaba/') && header.every((href) => href !== '#'), header.join(' | '));
  await context.close();
}

// Desktop: the call button copies the number instead of dialling
{
  const { context, page } = await open(VIEWPORTS[3], 'profile-full');
  await page.getByRole('button', { name: 'Restaurant info and contact' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('link', { name: /Call Reservations/ }).click();
  await page.waitForTimeout(300);
  check('[1280] call on a computer copies the number', (await dialog.innerText()).includes('Number copied') && (await page.evaluate(() => navigator.clipboard.readText())) === '+91 98765 43210');
  await context.close();
}

// A phone with a share sheet uses it
{
  const { context, page } = await open(VIEWPORTS[1], 'profile-full', { share: 'stub' });
  await page.getByRole('button', { name: 'Restaurant info and contact' }).click();
  await page.getByRole('button', { name: 'Share this menu' }).click();
  await page.waitForTimeout(300);
  const shared = await page.evaluate(() => window.__shared);
  check('[390] share sheet receives title and clean URL', shared?.[0]?.title === 'Test Dhaba' && shared?.[0]?.url === `${base}/menu/profile-full`, JSON.stringify(shared));
  check('[390] share beacon sent', (await clicks()).includes('share'));
  await context.close();
}

// Overnight shift: still open at 01:00 on a calendar day the owner marked as starting later
{
  const { context, page } = await open(VIEWPORTS[1], 'profile-full', { time: SUNDAY_AFTER_MIDNIGHT });
  await page.getByRole('button', { name: 'Restaurant info and contact' }).click();
  const text = await page.getByRole('dialog').innerText();
  check('[390] after midnight the late Saturday shift keeps the restaurant open', text.includes('Open · closes 2 AM'), text.split('\n')[1]);
  await context.close();
}

// A closed restaurant says when it opens
{
  const { context, page } = await open(VIEWPORTS[1], 'profile-full-closed');
  await page.getByRole('button', { name: 'Restaurant info and contact' }).click();
  const dialog = page.getByRole('dialog');
  const text = await dialog.innerText();
  check('[390] closed now says when it opens', text.includes('Closed · opens Fri 10 AM'));
  await page.screenshot({ path: path.join(shots, 'cu2-390-4-closed.png') });
  await context.close();
}

// An older backend: flat fields only
{
  const { context, page } = await open(VIEWPORTS[1], 'profile-legacy');
  await page.getByRole('button', { name: 'Restaurant info and contact' }).click();
  const dialog = page.getByRole('dialog');
  const text = await dialog.innerText();
  const hrefs = await dialog.locator('a').evaluateAll((anchors) => anchors.map((a) => a.getAttribute('href')));
  check('[390] legacy: free-text hours shown, no status', text.includes('10 AM to 11 PM') && !text.includes('Open ·') && !text.includes('Closed ·'));
  check('[390] legacy: only the first phone number is dialled', hrefs.filter((h) => h.startsWith('tel:')).join() === 'tel:+919876543210');
  check('[390] legacy: directions search for name, address and city', hrefs.includes('https://www.google.com/maps/search/?api=1&query=Test%20Dhaba%20Test%20Road%2C%20Near%20Test%20Chowk%20Testpur'));
  check('[390] legacy: Instagram, Facebook and website links are valid', hrefs.includes('https://www.instagram.com/testdhaba/') && hrefs.includes('https://www.facebook.com/testdhaba') && hrefs.includes('https://testdhaba.in'));
  check('[390] legacy: no WhatsApp without a chat number', !hrefs.some((h) => h.includes('wa.me')));
  await page.screenshot({ path: path.join(shots, 'cu2-390-5-legacy.png') });
  await context.close();
}

// Nothing saved: no Info button at all
{
  const { context, page } = await open(VIEWPORTS[1], 'profile-minimal');
  check('[390] no data means no Info button', (await page.getByRole('button', { name: 'Restaurant info and contact' }).count()) === 0);
  await context.close();
}

await browser.close();
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 1 - 1 : 1);

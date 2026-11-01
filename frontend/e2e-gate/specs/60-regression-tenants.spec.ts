import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, loadWorld } from '../lib/gate';
import { Telemetry, scrapeMenu, scrollThrough, INDIAN_PRICE, INVENTED_COPY, placeholderHits } from '../lib/diner';

// Existing-customer regression: tenants shaped like the live ones must keep rendering.
//   shankar = PREMIUM, 205 dishes in 19 categories (one with 65), stock-style photos, 47 half/full, Edition theme
//   shobha  = BASIC, 137 dishes in 19 categories, 76 Half/Full variants, no photos, a phone field holding two numbers
//   empty   = paid tenant that has not loaded a menu yet
const MOBILE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } as const;

test('regression: Shankar-style PREMIUM Edition tenant (205 dishes, photos, half/full)', async ({ browser, g }) => {
  test.setTimeout(150_000);
  const world = loadWorld();
  const t = world.tenants.shankar;
  const context = await browser.newContext(MOBILE);
  const page = await context.newPage();
  const telemetry = new Telemetry(page, [world.base]);
  await page.goto(`/menu/${t.slug}`);
  await page.locator('.mq-dish-name').first().waitFor({ timeout: 30_000 });
  await scrollThrough(page);
  const scrape = await scrapeMenu(page);
  mkdirSync(join(world.outDir, 'visual'), { recursive: true });
  await page.screenshot({ path: join(world.outDir, 'visual', 'regression-shankar-M390-top.png') });

  await g.check('REG-SH-01-counts', '205 dishes render and every price is formatted', async () => {
    expect(scrape.dishCount).toBe(205);
    expect(scrape.priceTexts.filter((text) => !INDIAN_PRICE.test(text))).toEqual([]);
    expect(scrape.bodyText).not.toMatch(/₹\s?0(?![\d,.])/);
  });
  await g.check('REG-SH-02-photos', 'photo dishes load their images: none broken, no empty frames', async () => {
    expect(scrape.brokenImages).toEqual([]);
    expect(scrape.emptyFrames).toEqual([]);
  });
  await g.check('REG-SH-03-no-invented-copy', 'the Edition prints no invented founding year, award or seal (owner supplied none)', async () => {
    expect(scrape.bodyText).not.toMatch(INVENTED_COPY);
    expect(placeholderHits(scrape.bodyText)).toEqual([]);
  });
  await g.check('REG-SH-04-half-full-labels', '47 half/full dishes announce their options', async () => {
    const options = (scrape.bodyText.match(/\(2 options\)/g) || []).length;
    expect(options).toBe(47);
  });
  await g.check('REG-SH-05-no-overflow', 'no horizontal scroll at 390 px', async () => {
    expect(scrape.scrollWidth).toBeLessThanOrEqual(scrape.innerWidth + 1);
  });
  await g.check('REG-SH-06-no-console-errors', 'no console or page errors', async () => {
    expect(telemetry.errors).toEqual([]);
  });
  await g.check('REG-SH-07-theme-applied', 'the published Edition theme reaches the public payload', async () => {
    const body = await (await page.request.get(`${world.base}/api/public/menus/${t.slug}`)).json();
    expect(body.theme?.presetId).toBe('edition-bombay-chowk');
    expect(body.orderingEnabled).toBe(true);
  });
  await g.check('REG-SH-08-delivery-tab', 'PREMIUM with no ordering settings row still offers Dine-In and Delivery (legacy behaviour)', async () => {
    await page.getByRole('button', { name: /^Add / }).first().click();
    await page.getByRole('button', { name: /View Tray with/ }).first().click();
    const modal = page.locator('.menu-cart-modal').first();
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('button', { name: /dine-in/i }).first()).toBeVisible();
    await expect(modal.getByRole('button', { name: /delivery/i }).first(), 'no Delivery tab in the cart').toBeVisible();
  });
  await context.close();
});

test('regression: Shobharam-style BASIC tenant (137 dishes, 76 variants, no photos, two phone numbers)', async ({ browser, g }) => {
  test.setTimeout(150_000);
  const world = loadWorld();
  const t = world.tenants.shobha;
  const context = await browser.newContext(MOBILE);
  const page = await context.newPage();
  const telemetry = new Telemetry(page, [world.base]);
  await page.goto(`/menu/${t.slug}`);
  await page.locator('.mq-dish-name, h1').first().waitFor({ timeout: 30_000 });
  await page.waitForTimeout(1500);
  await scrollThrough(page);
  const scrape = await scrapeMenu(page);
  await page.screenshot({ path: join(world.outDir, 'visual', 'regression-shobha-M390-top.png') });

  await g.check('REG-SB-01-counts', '137 dishes render and no price shows rupee zero', async () => {
    expect(scrape.dishCount).toBe(137);
    expect(scrape.bodyText).not.toMatch(/₹\s?0(?![\d,.])/);
  });
  await g.check('REG-SB-02-no-photo-frames', 'a menu with no photos has no empty image frames and no broken images', async () => {
    expect(scrape.emptyFrames).toEqual([]);
    expect(scrape.brokenImages).toEqual([]);
  });
  await g.check('REG-SB-03-variants', 'Half/Full variants render (38 dishes announce two options) without duplicate portions', async () => {
    expect((scrape.bodyText.match(/\(2 options\)/g) || []).length).toBe(38);
  });
  await g.check('REG-SB-04-phone-first-number', 'tap-to-call dials only the first number of a two-number phone field', async () => {
    const tel = scrape.links.map((link) => link.href).filter((href) => href.startsWith('tel:'));
    expect(tel.length).toBeGreaterThan(0);
    for (const href of tel) expect(href).toBe('tel:+919876543212');
  });
  await g.check('REG-SB-05-basic-no-ordering', 'BASIC plan: no Add buttons, no tray', async () => {
    await expect(page.getByRole('button', { name: /^Add .* to your order/ })).toHaveCount(0);
    await expect(page.locator('.menu-floating-cart-bar')).toHaveCount(0);
  });
  await g.check('REG-SB-06-no-console-errors', 'no console or page errors', async () => {
    expect(telemetry.errors).toEqual([]);
  });
  await g.check('REG-SB-07-legacy-theme', 'the legacy PDF theme (no theme JSON) still renders the menu', async () => {
    const body = await (await page.request.get(`${world.base}/api/public/menus/${t.slug}`)).json();
    expect(body.items).toHaveLength(137);
    expect(scrape.bodyText).not.toMatch(INVENTED_COPY);
  });
  await context.close();
});

test('regression: a paid tenant with no menu yet shows an honest empty state', async ({ browser, g }) => {
  const world = loadWorld();
  const t = world.tenants.empty;
  const context = await browser.newContext(MOBILE);
  const page = await context.newPage();
  const telemetry = new Telemetry(page, [world.base]);
  await g.check('REG-EM-01-api-empty', 'the public API returns zero dishes (no invented placeholder dishes)', async () => {
    const body = await (await page.request.get(`${world.base}/api/public/menus/${t.slug}`)).json();
    expect(body.items.map((item: { name: string }) => item.name).slice(0, 4), 'invented dishes in the API payload').toEqual([]);
  });
  await page.goto(`/menu/${t.slug}`);
  await page.waitForTimeout(2500);
  const text = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: join(world.outDir, 'visual', 'regression-empty-M390.png') });
  await g.check('REG-EM-02-coming-soon', 'the page says the menu is being prepared and lists no dishes or prices', async () => {
    expect(text).toMatch(/menu is being prepared/i);
    expect(await page.locator('.mq-dish-name').count()).toBe(0);
    expect(text).not.toMatch(/₹\s?\d/);
  });
  await g.check('REG-EM-03-contact', 'the owner phone is a tap-to-call link', async () => {
    await expect(page.locator(`a[href="tel:+919876543213"]`).first()).toBeVisible();
  });
  await g.check('REG-EM-04-no-console-errors', 'no console or page errors', async () => {
    expect(telemetry.errors).toEqual([]);
  });
  await context.close();
});

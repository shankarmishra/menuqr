import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect, loadWorld } from '../lib/gate';
import { Telemetry, scrapeMenu, scrollThrough, INDIAN_PRICE, INVENTED_COPY, inr, placeholderHits } from '../lib/diner';
import { buildMenu } from '../lib/menu-data.mjs';

const menu = buildMenu();
const VIEWPORTS = [
  { key: 'M390', name: 'mobile 390px', width: 390, height: 844, mobile: true },
  { key: 'D1280', name: 'desktop 1280px', width: 1280, height: 800, mobile: false },
] as const;

test('QR path: the permanent /qr/<id> resolves to the live menu and keeps the table', async ({ browser, g }) => {
  const world = loadWorld();
  const lab = world.tenants.lab;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const telemetry = new Telemetry(page, [world.base]);

  await g.check('QR-01-resolves-to-menu', 'scanning /qr/<id> lands on /menu/<slug> with the restaurant name', async () => {
    await page.goto(`/qr/${lab.qrId}`);
    await page.waitForURL(new RegExp(`/menu/${lab.slug}\\?qr=${lab.qrId}`), { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: lab.businessName, level: 1 })).toBeVisible();
  });
  await g.check('QR-02-table-param', 'a table QR (?table=7) keeps the table through the redirect', async () => {
    await page.goto(`/qr/${lab.qrId}?table=7`);
    await page.waitForURL(/table=7/, { timeout: 20_000 });
  });
  await g.check('QR-03-unknown-id', 'an unknown QR id shows an error state, not a blank page', async () => {
    await page.goto('/qr/00000000-not-a-real-qr');
    await expect(page.getByRole('alert')).toContainText(/unavailable|could not open/i);
  });
  await g.check('QR-04-api-404', 'the public QR API answers 404 for an unknown id', async () => {
    const response = await page.request.get(`${world.base}/api/public/qr/00000000-not-a-real-qr`);
    expect(response.status()).toBe(404);
  });
  await g.check('QR-05-no-errors', 'no console or page errors on the QR path', async () => {
    expect(telemetry.errors.filter((line) => !/404/.test(line))).toEqual([]);
  });
  await context.close();
});

for (const vp of VIEWPORTS) {
  test(`diner menu at ${vp.name}: 220 dishes, prices, Hindi, links, images`, async ({ browser, g }, testInfo) => {
    test.setTimeout(180_000);
    const world = loadWorld();
    const lab = world.tenants.lab;
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile });
    const page = await context.newPage();
    const telemetry = new Telemetry(page, [world.base]);
    let sheetFacts = { role: '', modal: false };
    let closedByEscape = false;
    const started = Date.now();
    await page.goto(`/qr/${lab.qrId}`);
    await page.locator('.mq-dish-name').first().waitFor({ timeout: 30_000 });
    const firstDishMs = Date.now() - started;
    await scrollThrough(page);
    const scrape = await scrapeMenu(page);
    const visualDir = join(world.outDir, 'visual');
    mkdirSync(visualDir, { recursive: true });
    await page.screenshot({ path: join(visualDir, `diner-lab-${vp.key}-top.png`) });

    await g.check(`DIN-01-${vp.key}-all-dishes`, 'all 220 seeded dishes render under their 20 categories', async () => {
      expect(scrape.dishCount).toBe(220);
      const missing = menu.items.filter((item) => !scrape.dishNames.includes(item.name)).map((item) => item.name);
      expect(missing, `dish names not rendered: ${missing.slice(0, 5).join(' | ')}`).toEqual([]);
    });
    await g.check(`DIN-02-${vp.key}-price-format`, 'every price is a rupee amount with Indian grouping and none is zero', async () => {
      const wrong = scrape.priceTexts.filter((text) => !INDIAN_PRICE.test(text) || /^₹0(\.0+)?$/.test(text));
      expect(wrong, `badly formatted prices: ${wrong.slice(0, 5).join(' | ')}`).toEqual([]);
      expect(scrape.bodyText).not.toMatch(/₹\s?0(?![\d,.])/);
    });
    await g.check(`DIN-03-${vp.key}-indian-grouping`, `${inr(125000)} and ${inr(12500)} are shown with lakh/thousand grouping`, async () => {
      expect(scrape.priceTexts).toContain(inr(125000));
      expect(scrape.priceTexts).toContain(inr(12500));
    });
    await g.check(`DIN-04-${vp.key}-missing-price`, 'a dish without a price shows no amount (not a rupee zero) and the page still has 214 prices', async () => {
      expect(scrape.priceTexts).toHaveLength(menu.items.filter((item) => item.price != null).length);
      const row = page.locator('article', { has: page.locator('.mq-dish-name', { hasText: /^Manchow Soup$/ }) }).first();
      await expect(row).toBeVisible();
      expect(await row.innerText()).not.toMatch(/₹/);
    });
    await g.check(`DIN-05-${vp.key}-hindi`, 'Devanagari dish names render with normal letter-spacing and no forced uppercase', async () => {
      const devanagari = scrape.dishNames.filter((name) => /[ऀ-ॿ]/.test(name));
      expect(devanagari.length).toBeGreaterThanOrEqual(80);
      const facts = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('.mq-dish-name')].filter((element) => /[ऀ-ॿ]/.test(element.textContent || ''));
        const bad = nodes.filter((element) => {
          const style = getComputedStyle(element);
          return (style.letterSpacing !== 'normal' && parseFloat(style.letterSpacing) !== 0) || style.textTransform === 'uppercase';
        });
        const style = getComputedStyle(nodes[0]);
        const ratio = parseFloat(style.lineHeight) / parseFloat(style.fontSize);
        return { bad: bad.length, total: nodes.length, letterSpacing: style.letterSpacing, lineHeightRatio: Math.round(ratio * 100) / 100 };
      });
      expect(facts.bad, `${facts.bad}/${facts.total} Devanagari dish names have letter-spacing ${facts.letterSpacing} (line-height ratio ${facts.lineHeightRatio}; Devanagari needs 0 spacing and about 1.5)`).toBe(0);
      expect(facts.lineHeightRatio, 'Devanagari line-height ratio').toBeGreaterThanOrEqual(1.4);
    });
    await g.check(`DIN-06-${vp.key}-half-full`, 'a half/full dish exposes both portions with their prices', async () => {
      const split = menu.items.find((item) => item.halfPrice != null)!;
      const row = page.locator('article', { has: page.locator('.mq-dish-name', { hasText: new RegExp(`^${split.name}$`) }) }).first();
      await row.scrollIntoViewIfNeeded();
      await row.getByRole('button', { name: /customi[sz]e/i }).first().click();
      const sheet = page.locator('.dish-customization-portal, [role="dialog"]').last();
      await expect(sheet).toContainText(/half/i);
      await expect(sheet).toContainText(/full/i);
      await expect(sheet).toContainText(inr(split.halfPrice!));
      await expect(sheet).toContainText(inr(split.fullPrice!));
      sheetFacts = await sheet.evaluate((element) => ({ role: element.getAttribute('role') || element.querySelector('[role="dialog"]')?.getAttribute('role') || '', modal: element.querySelector('[aria-modal="true"]') !== null || element.getAttribute('aria-modal') === 'true' }));
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      closedByEscape = (await page.locator('.dish-customization-portal').count()) === 0;
      if (!closedByEscape) await page.getByRole('button', { name: /close dish customization/i }).first().click();
      await expect(page.locator('.dish-customization-portal')).toHaveCount(0);
    });
    await g.check(`DIN-17-${vp.key}-sheet-a11y`, 'the dish customise sheet is a labelled modal dialog and closes with Escape', async () => {
      expect(sheetFacts.role === 'dialog' || sheetFacts.modal, 'sheet has no role="dialog" / aria-modal').toBe(true);
      expect(closedByEscape, 'Escape does not close the sheet').toBe(true);
    });
    await g.check(`DIN-07-${vp.key}-links`, 'Instagram, Facebook, website, phone and map links are well formed', async () => {
      const hrefs = scrape.links.map((link) => link.href);
      const find = (pattern: RegExp) => hrefs.filter((href) => pattern.test(href));
      expect(find(/instagram\.com/)[0], 'instagram').toMatch(/^https:\/\/(www\.)?instagram\.com\/gate\.dhaba\/?$/);
      expect(find(/facebook\.com/)[0], 'facebook').toMatch(/^https:\/\/(www\.)?facebook\.com\/gatedhaba\/?$/);
      expect(find(/gate-dhaba\.in/)[0], 'website').toMatch(/^https:\/\/(www\.)?gate-dhaba\.in\/?$/);
      expect(find(/^tel:/)[0], 'phone').toBe('tel:+919876543210');
      expect(find(/maps/)[0], 'maps').toMatch(/^https:\/\/(www\.)?(maps\.google\.com|google\.com\/maps)/);
      const bad = hrefs.filter((href) => /^(#|javascript:)/i.test(href) || /example\.com|undefined|null/i.test(href));
      expect(bad).toEqual([]);
    });
    await g.check(`DIN-08-${vp.key}-no-console-errors`, 'no console errors, page errors or failed same-origin requests', async () => {
      expect(telemetry.errors).toEqual([]);
    });
    await g.check(`DIN-09-${vp.key}-images`, 'no broken images and no empty image frames', async () => {
      expect(scrape.brokenImages, `broken: ${scrape.brokenImages.slice(0, 3).join(' | ')}`).toEqual([]);
      expect(scrape.emptyFrames, `empty frames: ${scrape.emptyFrames.slice(0, 3).join(' | ')}`).toEqual([]);
    });
    await g.check(`DIN-10-${vp.key}-no-overflow`, 'the page has no horizontal scroll', async () => {
      expect(scrape.scrollWidth).toBeLessThanOrEqual(scrape.innerWidth + 1);
    });
    await g.check(`DIN-11-${vp.key}-long-description`, 'a 1,500-character description does not blow up one dish row', async () => {
      expect(scrape.tallestRow, `tallest dish row ${scrape.tallestRow}px`).toBeLessThanOrEqual(vp.mobile ? 700 : 520);
    });
    await g.check(`DIN-12-${vp.key}-truth`, 'no placeholder strings and no invented founding years or awards', async () => {
      expect(placeholderHits(scrape.bodyText)).toEqual([]);
      expect(scrape.bodyText).not.toMatch(INVENTED_COPY);
    });
    await g.check(`DIN-13-${vp.key}-filter-chips`, 'the All / Pure Veg / Non-Veg chips carry the real counts (220 / 171 / 49)', async () => {
      const veg = menu.items.filter((item) => item.diet !== 'non-veg').length;
      const text = scrape.bodyText.replace(/\s+/g, ' ');
      expect(text).toMatch(/All\s*220/);
      expect(text).toMatch(new RegExp(`Pure Veg\\s*${veg}`));
      expect(text).toMatch(new RegExp(`Non-Veg\\s*${220 - veg}`));
    });
    await g.check(`DIN-14-${vp.key}-search`, 'searching "biryani" narrows the list to biryani dishes', async () => {
      await page.getByPlaceholder(/search dishes/i).first().fill('biryani');
      await page.waitForTimeout(600);
      const names = await page.locator('.mq-dish-name').allInnerTexts();
      expect(names.length).toBeGreaterThan(0);
      expect(names.length).toBeLessThan(40);
      expect(names.every((name) => /biryani|बिरयानी/i.test(name))).toBe(true);
      await page.getByPlaceholder(/search dishes/i).first().fill('');
    });
    await g.check(`DIN-15-${vp.key}-category-nav`, 'tapping a category chip scrolls to that category', async () => {
      await page.getByRole('button', { name: 'Biryani & Rice', exact: true }).first().click();
      await page.waitForTimeout(900);
      const top = await page.evaluate(() => {
        const heading = [...document.querySelectorAll('h2,h3')].find((element) => /Biryani & Rice/.test(element.textContent || '') && !element.classList.contains('mq-dish-name'));
        return heading ? Math.round(heading.getBoundingClientRect().top) : null;
      });
      expect(top, 'category heading not found').not.toBeNull();
      expect(top!).toBeGreaterThanOrEqual(-5);
      expect(top!).toBeLessThanOrEqual(vp.height * 0.6);
    });
    await g.check(`DIN-16-${vp.key}-performance`, `first dish visible in under 10 s on the dev server (measured ${firstDishMs} ms, ${scrape.domNodes} DOM nodes)`, async () => {
      expect(firstDishMs).toBeLessThan(10_000);
      expect(scrape.domNodes).toBeLessThan(25_000);
    });
    testInfo.annotations.push({ type: 'metrics', description: `${vp.key}: first dish ${firstDishMs} ms, ${scrape.domNodes} DOM nodes, ${scrape.images.length} images, tallest row ${scrape.tallestRow}px` });
    if (telemetry.external.length) testInfo.annotations.push({ type: 'external-requests', description: telemetry.external.slice(0, 5).join(' || ') });
    await context.close();
  });
}

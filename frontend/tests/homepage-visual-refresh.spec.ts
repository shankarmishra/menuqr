import { expect, test } from '@playwright/test';

const homepageUrl = 'http://localhost:5173/';

test('homepage hero is static and gallery cards are image previews', async ({ page }) => {
  await page.goto(homepageUrl);
  await expect(
    page.getByRole('heading', { name: "Your menu changes. Your QR code doesn't." })
  ).toBeVisible();

  const cards = page.locator('#templates .scroll-stack-card');
  await expect(cards).toHaveCount(21);
  await expect(cards.first().locator('img')).toBeVisible();
  await expect(cards.first().getByRole('button')).toHaveCount(0);

  await page.getByRole('button', { name: 'Indian', exact: true }).click();
  await expect(cards).not.toHaveCount(21);
  await expect(cards).not.toHaveCount(0);
});

test('gallery preview reveals when its card enters the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const preview = page.locator('#templates .scroll-stack-card article').first();

  const initialOpacity = await preview.evaluate((element) => Number(getComputedStyle(element).opacity));
  expect(initialOpacity).toBeLessThan(0.1);

  await preview.scrollIntoViewIfNeeded();
  await expect.poll(() => preview.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.99);
});

test('gallery keeps an opacity-only entrance when reduced motion is enabled', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(homepageUrl);
  const preview = page.locator('#templates .scroll-stack-card article').first();

  await expect.poll(() => preview.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeLessThan(0.1);
  await preview.scrollIntoViewIfNeeded();
  await expect.poll(() => preview.evaluate((element) => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0.99);
  await expect.poll(() => preview.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
});

test('scroll-stack leaves cards untransformed for reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(homepageUrl);
  const cards = page.locator('#templates .scroll-stack-card');
  await expect(cards).toHaveCount(21);
  await page.locator('#templates').scrollIntoViewIfNeeded();

  await expect.poll(() => cards.first().evaluate((card) => getComputedStyle(card).transform)).toBe('none');
  await expect.poll(() => cards.first().locator('article').evaluate((card) => getComputedStyle(card).opacity)).toBe('1');
});

test('physical QR illustration animates independently of its heading', async ({ page }) => {
  await page.goto(homepageUrl);
  const scene = page.locator('[data-qr-story-scene]');
  const connectorPulse = page.locator('[data-qr-link-pulse]');
  const heading = page.getByRole('heading', { name: /One permanent code/ });
  await expect(scene).toBeVisible();
  await expect(connectorPulse).toBeVisible();
  await scene.scrollIntoViewIfNeeded();
  await expect.poll(() => scene.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await expect.poll(() => heading.evaluate((element) => getComputedStyle(element).transform)).toBe('none');
});

test('mobile hero headline clears the fixed header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(homepageUrl);
  const header = page.locator('header');
  const heading = page.getByRole('heading', { name: "Your menu changes. Your QR code doesn't." });

  await expect.poll(async () => {
    const headerBox = await header.boundingBox();
    const headingBox = await heading.boundingBox();
    return headerBox && headingBox ? headingBox.y - (headerBox.y + headerBox.height) : -1;
  }).toBeGreaterThanOrEqual(8);
});

test('desktop hero actions stay inside the clipped hero', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const hero = page.locator('main > section').first();
  const action = hero.locator('a[href="/plans"]');

  await expect.poll(async () => {
    const heroBox = await hero.boundingBox();
    const actionBox = await action.boundingBox();
    return heroBox && actionBox ? heroBox.y + heroBox.height - actionBox.y - actionBox.height : -1;
  }).toBeGreaterThanOrEqual(16);
});

test('gallery card stays centered during page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const card = page.locator('#templates .scroll-stack-card').first();
  await expect(card).toBeVisible();

  const layoutTop = await card.evaluate((element) => {
    let top = 0;
    let current: HTMLElement | null = element as HTMLElement;
    while (current) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return top;
  });
  const expectedTop = await card.evaluate((element) => Math.max((window.innerHeight - element.offsetHeight) / 2, 0));
  const targetScroll = layoutTop - 162;

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), targetScroll);
  await page.waitForTimeout(100);
  const observedTops: number[] = [];
  for (let step = 0; step < 8; step += 1) {
    await page.evaluate(() => window.scrollBy({ top: 24, behavior: 'instant' }));
    await page.waitForTimeout(40);
    observedTops.push(await card.evaluate((element) => element.getBoundingClientRect().top));
  }

  expect(observedTops.every((top) => Math.abs(top - expectedTop) <= 16)).toBe(true);
  await expect(page.locator('#templates .scroll-stack-scroller--window')).toHaveCSS('overflow-y', 'visible');
});

test('successive gallery designs enter at the same viewport center', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const cards = page.locator('#templates .scroll-stack-card');
  const expectedTop = await cards.first().evaluate((element) => Math.max((window.innerHeight - element.offsetHeight) / 2, 0));

  for (let index = 0; index < 6; index += 1) {
    const card = cards.nth(index);
    const layoutTop = await card.evaluate((element) => {
      let top = 0;
      let current: HTMLElement | null = element as HTMLElement;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return top;
    });
    const targetScroll = layoutTop - expectedTop - 24 * index + 4;
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), targetScroll);
    await page.waitForTimeout(100);

    const box = await card.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.y - expectedTop)).toBeLessThanOrEqual(16);
  }
});

test('only the active gallery design receives a scroll transform', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const cards = page.locator('#templates .scroll-stack-card');
  const targetIndex = 3;
  const targetCard = cards.nth(targetIndex);
  const layoutTop = await targetCard.evaluate((element) => {
    let top = 0;
    let current: HTMLElement | null = element as HTMLElement;
    while (current) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }
    return top;
  });
  const center = await targetCard.evaluate((element) => Math.max((window.innerHeight - element.offsetHeight) / 2, 0));
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), layoutTop - center - 24 * targetIndex + 4);
  await page.waitForTimeout(100);

  const transformedCards = await cards.evaluateAll((elements) => elements.filter((element) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return false;
    const matrix = new DOMMatrixReadOnly(transform);
    return Math.abs(matrix.e) > 1 || Math.abs(matrix.f) > 1 || Math.abs(matrix.a - 1) > 0.002;
  }).length);

  expect(transformedCards).toBe(1);
});

test('active gallery design recenters after a viewport resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const cards = page.locator('#templates .scroll-stack-card');
  const card = cards.nth(3);
  for (let index = 0; index <= 3; index += 1) {
    const currentCard = cards.nth(index);
    const layout = await currentCard.evaluate((element) => {
      let top = 0;
      let current: HTMLElement | null = element as HTMLElement;
      while (current) {
        top += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      return { top, height: element.offsetHeight };
    });
    const targetScroll = layout.top - (900 - layout.height) / 2 - 24 * index + 4;
    await page.evaluate((value) => window.scrollTo({ top: value, behavior: 'instant' }), targetScroll);
    await page.waitForTimeout(100);
  }
    await expect.poll(() => card.evaluate((element) => element.style.willChange)).toBe('transform');
  await page.setViewportSize({ width: 1440, height: 760 });

  const expectedTop = await card.evaluate((element) => Math.max((window.innerHeight - element.offsetHeight) / 2, 0));
  await expect.poll(() => card.evaluate((element) => element.getBoundingClientRect().top)).toBeCloseTo(expectedTop, 0);
});

test('gallery cards are centered horizontally in the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const card = page.locator('#templates .scroll-stack-card').first();
  const horizontalOffset = await card.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return Math.abs(box.left + box.width / 2 - document.documentElement.clientWidth / 2);
  });

  expect(horizontalOffset).toBeLessThanOrEqual(16);
});

test('gallery clips outgoing cards at the next section boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const gallery = page.locator('#templates');
  const nextSection = page.locator('main > section').filter({ hasText: 'Different personality.' });
  await expect(nextSection).toHaveCount(1);

  await expect(gallery).toHaveCSS('overflow-y', 'clip');
});

test('personality showcase preserves sticky positioning', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(homepageUrl);
  const section = page.locator('main > section').filter({ hasText: 'Different personality.' });
  const stage = section.locator(':scope > div').first();

  await expect(section).toHaveCount(1);
  await expect.poll(() => section.evaluate((element) => element.getBoundingClientRect().height)).toBeLessThanOrEqual(1800);
  await expect.poll(() => stage.evaluate((element) => getComputedStyle(element).position)).toBe('sticky');

  const sectionBounds = await section.boundingBox();
  const scrollToSectionTail = await section.evaluate((element) => {
    const box = element.getBoundingClientRect();
    return box.top + window.scrollY + box.height - window.innerHeight;
  });
  expect(sectionBounds).not.toBeNull();
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), scrollToSectionTail);
  await page.waitForTimeout(100);

  const stageBounds = await stage.boundingBox();
  const headerBounds = await page.locator('header').boundingBox();
  expect(stageBounds).not.toBeNull();
  expect(headerBounds).not.toBeNull();
  expect(stageBounds!.y).toBeGreaterThanOrEqual(headerBounds!.y + headerBounds!.height);
  expect(stageBounds!.y).toBeLessThan(900);
  expect(stageBounds!.y + stageBounds!.height).toBeGreaterThan(0);
});

test('homepage presents one plan chooser with all purchase links', async ({ page }) => {
  await page.goto(homepageUrl);
  await expect(page.getByRole('heading', { name: 'Choose the level of control your business needs.' })).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'How much control do you need?' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ready to upgrade your menu?' })).toHaveCount(0);
  await expect(page.locator('a[href^="/purchase/details?plan="]')).toHaveCount(3);
});

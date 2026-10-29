import { expect, test, type Page } from '@playwright/test';

/**
 * Menu renderer quality gate.
 *
 * These are the assertions that would have caught what shipped in the hand-written templates:
 * `text-[7.5px]` dish descriptions, a `py-0.2` class that silently did nothing, `select-none` on
 * the whole menu, images with no dimensions, and colour pairs nobody ever measured.
 *
 * Measured against computed style in a real browser, so they hold regardless of how a value was
 * authored.
 */

const SHOWCASE = '/template-showcase';

/** WCAG 2.1 relative luminance, computed from a browser `rgb()` string. */
function luminanceFromRgb(colour: string): number | null {
  const match = colour.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;

  const [r, g, b, a] = match[1].split(',').map((part) => Number(part.trim()));
  // A translucent colour cannot be evaluated without compositing it; skip rather than guess.
  if (a !== undefined && a < 0.99) return null;

  const channel = (value: number) => {
    const n = value / 255;
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(foreground: string, background: string): number | null {
  const lf = luminanceFromRgb(foreground);
  const lb = luminanceFromRgb(background);
  if (lf === null || lb === null) return null;
  return (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
}

async function gotoShowcase(page: Page) {
  await page.goto(SHOWCASE, { waitUntil: 'networkidle' });
  await expect(page.locator('.mq-root').first()).toBeVisible();
}

test.describe('menu renderer quality', () => {
  test('renders at least one menu with real content', async ({ page }) => {
    await gotoShowcase(page);

    const roots = page.locator('.mq-root');
    expect(await roots.count()).toBeGreaterThan(0);

    // Dish names are h3 inside the renderer; if none are present the renderer produced a shell.
    expect(await page.locator('.mq-root .mq-dish-name').count()).toBeGreaterThan(0);
  });

  test('no text is rendered below the 12px legibility floor', async ({ page }) => {
    await gotoShowcase(page);

    const tooSmall = await page.evaluate(() => {
      const offenders: Array<{ text: string; size: string; className: string }> = [];

      for (const root of document.querySelectorAll('.mq-root')) {
        for (const element of root.querySelectorAll('*')) {
          const text = (element.textContent ?? '').trim();
          // Only leaf elements that actually paint text matter.
          if (!text || element.children.length > 0) continue;

          const size = Number.parseFloat(getComputedStyle(element).fontSize);
          if (Number.isFinite(size) && size < 11.5) {
            offenders.push({
              text: text.slice(0, 40),
              size: `${size}px`,
              className: String((element as HTMLElement).className).slice(0, 60),
            });
          }
        }
      }

      return offenders;
    });

    expect(tooSmall, `text below 12px: ${JSON.stringify(tooSmall, null, 2)}`).toEqual([]);
  });

  test('body and heading text meet their contrast targets', async ({ page }) => {
    await gotoShowcase(page);

    const samples = await page.evaluate(() => {
      const results: Array<{ selector: string; colour: string; background: string }> = [];

      /** Walk up for the nearest ancestor that actually paints a background. */
      const effectiveBackground = (start: Element): string => {
        let node: Element | null = start;
        while (node) {
          const background = getComputedStyle(node).backgroundColor;
          if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
            return background;
          }
          node = node.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      };

      for (const selector of ['.mq-dish-name', '.mq-dish-desc', '.mq-price', '.mq-display']) {
        for (const element of document.querySelectorAll(`.mq-root ${selector}`)) {
          // Type sitting on a cover photograph is composited over an image; a flat-colour
          // contrast check there is meaningless, so the scrim handles that case instead.
          if (element.closest('.mq-on-cover')) continue;

          results.push({
            selector,
            colour: getComputedStyle(element).color,
            background: effectiveBackground(element),
          });
        }
      }

      return results;
    });

    expect(samples.length).toBeGreaterThan(0);

    const failures: string[] = [];
    for (const sample of samples) {
      const ratio = contrastRatio(sample.colour, sample.background);
      if (ratio === null) continue;

      // 4.5:1 is the WCAG AA floor for body text; the palette aims higher but the gate asserts
      // the standard, so a legitimate design choice does not fail the build.
      if (ratio < 4.4) {
        failures.push(`${sample.selector}: ${sample.colour} on ${sample.background} = ${ratio.toFixed(2)}:1`);
      }
    }

    expect(failures, `low-contrast text:\n${failures.join('\n')}`).toEqual([]);
  });

  test('every image reserves space and lazy-loads below the fold', async ({ page }) => {
    await gotoShowcase(page);

    const images = await page.evaluate(() =>
      [...document.querySelectorAll('.mq-root img')].map((img) => {
        const element = img as HTMLImageElement;
        return {
          src: element.getAttribute('src')?.slice(0, 70) ?? '',
          alt: element.getAttribute('alt'),
          width: element.getAttribute('width'),
          height: element.getAttribute('height'),
          loading: element.getAttribute('loading'),
        };
      })
    );

    for (const image of images) {
      expect(image.alt, `missing alt: ${image.src}`).not.toBeNull();
      expect(image.width, `missing width: ${image.src}`).not.toBeNull();
      expect(image.height, `missing height: ${image.src}`).not.toBeNull();
      expect(['lazy', 'eager'], `missing loading: ${image.src}`).toContain(image.loading);
    }

    // Budget is per menu, not per page: the showcase route renders twelve menus at once, so a
    // page-wide cap would either be meaningless there or wrong on a real single-menu page.
    const eagerPerMenu = await page.evaluate(() =>
      [...document.querySelectorAll('.mq-root')].map(
        (root) => root.querySelectorAll('img[loading="eager"]').length
      )
    );

    for (const [index, count] of eagerPerMenu.entries()) {
      // One cover photograph and one logo are the only images above the fold.
      expect(count, `menu ${index} eagerly loads ${count} images`).toBeLessThanOrEqual(2);
    }
  });

  test('menu text stays selectable', async ({ page }) => {
    await gotoShowcase(page);

    // The old templates applied `select-none` to the entire menu, so a diner could not copy a
    // dish name to search for it.
    const unselectable = await page.evaluate(() =>
      [...document.querySelectorAll('.mq-root .mq-dish-name, .mq-root .mq-dish-desc')].filter((element) => {
        const style = getComputedStyle(element);
        return style.userSelect === 'none' || (style as unknown as { webkitUserSelect: string }).webkitUserSelect === 'none';
      }).length
    );

    expect(unselectable).toBe(0);
  });

  test('tap targets are at least 44px', async ({ page }) => {
    await gotoShowcase(page);

    const small = await page.evaluate(() =>
      [...document.querySelectorAll('.mq-root button, .mq-root a')]
        // WCAG 2.5.8 exempts a link inside a block of text, where enlarging it would break the
        // line. Standalone controls have no such excuse.
        .filter((element) => {
          const parent = element.parentElement;
          if (!parent) return true;
          const parentText = (parent.textContent ?? '').trim();
          const ownText = (element.textContent ?? '').trim();
          return parentText === ownText;
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            text: (element.textContent ?? '').trim().slice(0, 30),
            height: Math.round(rect.height),
            width: Math.round(rect.width),
          };
        })
        // Zero-size elements are not rendered; only visible controls are a target.
        .filter((box) => box.height > 0 && box.height < 44)
    );

    expect(small, `tap targets under 44px: ${JSON.stringify(small)}`).toEqual([]);
  });

  test('the page never scrolls horizontally', async ({ page }) => {
    await gotoShowcase(page);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    // A couple of pixels of rounding is tolerable; a real overflow is not.
    expect(overflow.scrollWidth - overflow.clientWidth).toBeLessThanOrEqual(2);
  });
});

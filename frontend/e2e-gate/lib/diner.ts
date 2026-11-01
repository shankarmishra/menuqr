import type { Page } from '@playwright/test';

/** Collects console errors, page errors and failed same-origin requests for the whole life of a page. */
export class Telemetry {
  readonly errors: string[] = [];
  readonly external: string[] = [];
  constructor(page: Page, origins: string[] = []) {
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const text = message.text();
      // Browser-generated lines about blocked third-party requests are reported separately (no network in the gate).
      if (/Failed to load resource/.test(text) && !/127\.0\.0\.1|localhost/.test(message.location().url || '')) {
        this.external.push(`${text.slice(0, 120)} @ ${(message.location().url || '').slice(0, 80)}`);
        return;
      }
      this.errors.push(`console.error: ${text.slice(0, 220)}`);
    });
    page.on('pageerror', (error) => this.errors.push(`pageerror: ${String(error).slice(0, 220)}`));
    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || '';
      if (/ERR_ABORTED/.test(failure)) return; // beacons cancelled by navigation
      const url = request.url();
      const same = origins.some((origin) => url.startsWith(origin));
      (same ? this.errors : this.external).push(`requestfailed: ${url.slice(0, 120)} ${failure}`);
    });
    page.on('response', (response) => {
      const url = response.url();
      if (response.status() >= 500 && origins.some((origin) => url.startsWith(origin))) this.errors.push(`HTTP ${response.status()}: ${url.slice(0, 120)}`);
    });
  }
}

/** Scroll the whole page in steps so lazy images and sections load. */
export async function scrollThrough(page: Page, stepRatio = 0.8, maxSteps = 120) {
  await page.evaluate(async ({ stepRatio, maxSteps }) => {
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    let last = -1;
    for (let i = 0; i < maxSteps; i++) {
      window.scrollBy(0, Math.round(window.innerHeight * stepRatio));
      await pause(70);
      if (window.scrollY === last) break;
      last = window.scrollY;
    }
    window.scrollTo(0, 0);
    await pause(150);
  }, { stepRatio, maxSteps });
}

export type MenuScrape = {
  dishNames: string[];
  priceTexts: string[];
  dishCount: number;
  articles: number;
  images: { src: string; ok: boolean; w: number; h: number }[];
  brokenImages: string[];
  emptyFrames: string[];
  links: { href: string; text: string; label: string }[];
  scrollWidth: number;
  innerWidth: number;
  bodyText: string;
  tallestRow: number;
  domNodes: number;
};

/** Reads the facts about a rendered menu page that the checks are based on. */
export async function scrapeMenu(page: Page): Promise<MenuScrape> {
  return page.evaluate(() => {
    const root = document.querySelector('.mq-root') || document.body;
    const visible = (element: Element) => {
      const box = (element as HTMLElement).getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    const images = [...root.querySelectorAll('img')].map((img) => ({
      src: img.currentSrc || img.src, ok: img.complete && img.naturalWidth > 0,
      w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height),
    }));
    const frames = [...root.querySelectorAll('[class*="thumb"],[class*="photo"],[class*="image"],[class*="media"],[class*="frame"],[class*="avatar"]')]
      .filter((element) => {
        if (!visible(element)) return false;
        const box = element.getBoundingClientRect();
        return box.width >= 40 && box.height >= 40 && !element.querySelector('img,svg,video,canvas,picture')
          && !(element.textContent || '').trim() && getComputedStyle(element).backgroundImage === 'none';
      })
      .map((element) => `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} ${Math.round(element.getBoundingClientRect().width)}x${Math.round(element.getBoundingClientRect().height)}`);
    const articles = [...root.querySelectorAll('article')];
    return {
      dishNames: [...root.querySelectorAll('.mq-dish-name')].map((element) => (element.textContent || '').trim()),
      priceTexts: [...root.querySelectorAll('.mq-price')].map((element) => (element.textContent || '').trim()),
      dishCount: root.querySelectorAll('.mq-dish-name').length,
      articles: articles.length,
      images,
      brokenImages: images.filter((image) => !image.ok).map((image) => image.src.slice(0, 100)),
      emptyFrames: frames.slice(0, 12),
      links: [...document.querySelectorAll('a[href]')].map((anchor) => ({ href: anchor.getAttribute('href') || '', text: (anchor.textContent || '').trim().slice(0, 40), label: anchor.getAttribute('aria-label') || '' })),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyText: document.body.innerText,
      tallestRow: Math.max(0, ...articles.map((article) => Math.round(article.getBoundingClientRect().height))),
      domNodes: document.getElementsByTagName('*').length,
    };
  });
}

/** Indian digit grouping: 1,25,000 / 12,500 / 1,280 / 90. */
export const INDIAN_PRICE = /^₹(\d{1,3}|\d{1,2}(,\d{2})*,\d{3})(\.\d{1,2})?$/;

export function inr(value: number): string {
  const whole = Math.round(value).toString();
  if (whole.length <= 3) return `₹${whole}`;
  const head = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${head},${whole.slice(-3)}`;
}

const PLACEHOLDER = new RegExp(['example\\.com', 'yourwebsite', 'lorem ipsum', '@ApnaDhaba', '\\bundefined\\b', '\\bNaN\\b', '\\[object Object\\]'].join('|'), 'gi');
export function placeholderHits(text: string): string[] {
  return [...new Set([...text.matchAll(PLACEHOLDER)].map((match) => match[0]))];
}

/** Invented-copy patterns the truth rule forbids when the owner supplied no such fact. */
export const INVENTED_COPY = /\b(ESTD?\.?|EST\.?|SINCE|FOUNDED|ESTABLISHED)\s*(IN\s*)?(19|20)\d{2}\b|michelin|award[- ]winning|world[- ]famous|#1\s+in\b/i;

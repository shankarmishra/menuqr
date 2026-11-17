// Lightweight list of content URLs. App.tsx imports only this file, so the content itself
// (several thousand words per page) stays out of the entry bundle and loads in its own chunk.
// content.test.ts fails if this list and the content data drift apart.

export const GUIDES_PATH = '/guides';

// Old pages that covered the same topics as a pillar page. Permanent redirects (also in
// vercel.json and public/_redirects).
export const MERGED_PAGE_REDIRECTS: Record<string, string> = {
  '/restaurant-qr-menu': '/qr-menu-for-restaurants',
  '/digital-menu-for-restaurants': '/digital-qr-menu',
  '/restaurant-digital-menu': '/digital-qr-menu',
};

export const CONTENT_PATHS: string[] = [
  '/digital-qr-menu',
  '/qr-menu-for-restaurants',
  '/qr-ordering-for-restaurants',
  '/qr-menu-price-india',
  '/restaurant-software',
  '/kitchen-display-system',
  '/restaurant-billing-software',
  GUIDES_PATH,
  '/guides/restaurant-menu-design-tips',
  '/guides/food-photos-for-menu',
  '/guides/kot-kitchen-order-ticket',
  '/guides/reduce-order-mistakes',
];

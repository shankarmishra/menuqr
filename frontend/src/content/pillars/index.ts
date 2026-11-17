import type { LongFormPage } from '../types.ts';
import { digitalQrMenu } from './digitalQrMenu.ts';
import { qrMenuForRestaurants } from './qrMenuForRestaurants.ts';
import { qrOrderingForRestaurants } from './qrOrderingForRestaurants.ts';

export { MERGED_PAGE_REDIRECTS } from '../manifest.ts';

// The three main service pages. Each answers a different question so they do not compete:
// what a QR menu is, how to set one up, and how ordering works.
export const PILLAR_PAGES: LongFormPage[] = [digitalQrMenu, qrMenuForRestaurants, qrOrderingForRestaurants];

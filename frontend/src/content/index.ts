import type { LongFormPage } from './types.ts';
import { PILLAR_PAGES, MERGED_PAGE_REDIRECTS } from './pillars/index.ts';
import { kotKitchenOrderTicket } from './guides/kotKitchenOrderTicket.ts';
import { reduceOrderMistakes } from './guides/reduceOrderMistakes.ts';
import { restaurantMenuDesignTips } from './guides/restaurantMenuDesignTips.ts';
import { foodPhotosForMenu } from './guides/foodPhotosForMenu.ts';
import { qrMenuPriceIndia } from './pages/qrMenuPriceIndia.ts';
import { restaurantSoftware } from './pages/restaurantSoftware.ts';
import { kitchenDisplaySystem } from './pages/kitchenDisplaySystem.ts';
import { restaurantBillingSoftware } from './pages/restaurantBillingSoftware.ts';

export { PILLAR_PAGES, MERGED_PAGE_REDIRECTS };
export { GUIDES_PATH, CONTENT_PATHS } from './manifest.ts';

/** Guides for restaurant owners, newest first. Add a new guide at the top. */
export const GUIDES: LongFormPage[] = [restaurantMenuDesignTips, foodPhotosForMenu, kotKitchenOrderTicket, reduceOrderMistakes];

/** One-off long pages that are neither pillars nor guides. */
export const STANDALONE_PAGES: LongFormPage[] = [restaurantSoftware, kitchenDisplaySystem, restaurantBillingSoftware, qrMenuPriceIndia];

export const ALL_LONG_FORM_PAGES: LongFormPage[] = [...PILLAR_PAGES, ...GUIDES, ...STANDALONE_PAGES];

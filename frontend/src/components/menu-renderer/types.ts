/**
 * MENUQR Menu Renderer — Data Contract
 *
 * Defined here rather than imported from `components/menu-builder/templates/types.ts` so the new
 * renderer carries no dependency on the template tree that Phase 6 deletes. The shapes are
 * structurally compatible, so `MenuTemplateRenderer` can pass its data straight through.
 */

export type DietType = 'veg' | 'non-veg' | 'vegan';

/** Owner-set dish tags. Mirrors the whitelisted shape the backend stores in `metadata.tags`. */
export type ItemTags = {
  allergens: string[];
  badges: string[];
  spice: number;
  jain: boolean;
  eggless: boolean;
};

export type MenuItemVariant = {
  id?: string;
  name: string;
  price: number | string;
  variantGroup?: string;
};

export type RenderMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number | string;

  /** Portion pricing. Parsed by the shared `parseItemPricing` helper, not by slots. */
  halfPrice?: number | string;
  fullPrice?: number | string;
  regPrice?: number | string;
  medPrice?: number | string;
  largePrice?: number | string;
  pricingType?: string;
  variants?: MenuItemVariant[];

  dietType: DietType;
  available?: boolean;
  isBestseller?: boolean;
  isSpecial?: boolean;
  /** Ordered 3+ times today (IST) — see `getTrendingItemIds` in `backend/analytics.js`. */
  trending?: boolean;
  spicyLevel?: number;
  tags?: ItemTags | null;
  /** True while the owner has marked the dish sold out for today. */
  soldOut?: boolean;
  /** Set while the dish's category is outside its serving window; replaces the price controls. */
  availabilityNote?: string | null;

  imageUrl?: string;
  /**
   * Owner-chosen focal point in 0-1 coordinates, defaulting to the centre.
   *
   * Set by dragging a dot onto the photo in the Design Studio. Deterministic and free, and more
   * accurate than an automatic crop because the owner knows which part of the plate is the hero.
   */
  focal?: { x: number; y: number };
};

export type RenderCategory = {
  id: string;
  name: string;
  description?: string;
  items: RenderMenuItem[];
};

export type RenderRestaurant = {
  name: string;
  tagline?: string;
  cuisine?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  openingHours?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  logoUrl?: string;
};

/**
 * Props a Signature composition receives. Unlike a slot, it owns filtering and navigation
 * itself (via `useMenuFilters`), because it is the whole page rather than one piece of it.
 */
export type SignatureProps = {
  restaurant: RenderRestaurant;
  categories: RenderCategory[];
  compact?: boolean;
  readOnly?: boolean;
};

/** Props every slot component receives. Slots read tokens from CSS, never from props. */
export type SlotProps = {
  restaurant: RenderRestaurant;
  categories: RenderCategory[];
  /** Unfiltered categories, for navigation that must show every tab even while filtering. */
  allCategories: RenderCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  /** Compact mode drives gallery thumbnails and the Design Studio preview. */
  compact?: boolean;
};

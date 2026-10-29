/**
 * MENUQR — MenuTemplateRenderer (compatibility shim)
 *
 * This file used to be the renderer: it owned search, diet filtering, category grouping and a
 * lazy switch over thirty-five hand-written template components. All of that now lives in
 * `components/menu-renderer/`, driven by `design-system/` tokens.
 *
 * What remains is a thin adapter, kept deliberately so the migration is not a big-bang rewrite.
 * Ten call sites still pass a legacy `templateId` — the customer menu (`pages/customer/MenuPage.tsx`),
 * the Design Studio, the template gallery, the marketing mockups, the showcase page and the
 * onboarding wizard. They keep working unchanged while each is migrated to `MenuRenderer` and a
 * stored `MenuTheme` directly.
 *
 * It does three things:
 *   1. resolves a legacy `templateId` (including retired and numeric ids) to a preset;
 *   2. layers the client's stored branding over that preset;
 *   3. reshapes the flat `items` array into the category structure the renderer expects.
 *
 * Phase 6 deletes it, once no caller passes a `templateId`.
 */

import React, { useMemo } from 'react';
import MenuRenderer from '../menu-renderer/MenuRenderer';
import { MenuCartContext } from './templates/shared/MenuCartContext';
import { themeFromPresetId } from '../../design-system/presets.ts';
import { coerceTheme } from '../../design-system/validateTheme.ts';
import type { MenuTheme } from '../../design-system/theme.types.ts';
import type { RenderCategory, RenderMenuItem } from '../menu-renderer/types.ts';
import { ShobharamBookletSpread } from './templates/bespoke/ShobharamBookletSpread';
import type { CategoryGroup, MenuItem } from './templates/types';

export interface MenuTemplateRendererProps {
  templateId: string;
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    openingHours?: string;
    logo?: string;
  };
  categories: Array<{ id: string; name: string; order?: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number | string;
    halfPrice?: number | string;
    fullPrice?: number | string;
    regPrice?: number | string;
    medPrice?: number | string;
    largePrice?: number | string;
    pricingType?: string;
    category: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available?: boolean;
    isBestseller?: boolean;
    image?: string;
    imageUrl?: string;
    focalX?: number;
    focalY?: number;
    variants?: Array<{ id?: string; name: string; price: number | string; variantGroup?: string }>;
  }>;
  compact?: boolean;
  className?: string;
  onAddToCart?: (item: any, priceStr?: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
  /**
   * A stored `MenuTheme`, once the caller has one. Takes precedence over `templateId`, which is
   * the migration path: a caller moves over by passing this instead.
   */
  theme?: unknown;
  /** Legacy field, previously unused by this component. Accepted and ignored. */
  accentConfiguration?: unknown;
}

export const MenuTemplateRenderer: React.FC<MenuTemplateRendererProps> = ({
  templateId,
  restaurant,
  categories,
  items,
  compact = false,
  className,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantity,
  isPremium = false,
  theme: storedTheme,
}) => {
  const theme: MenuTheme = useMemo(() => {
    // The preset supplies the palette and slots; the client record supplies only the logo.
    const base = themeFromPresetId(templateId);
    const withBrand: MenuTheme = {
      ...base,
      brand: { ...base.brand, logoUrl: restaurant.logo ?? null },
    };

    // A stored theme wins, but still passes through coercion — it arrives from the network, and
    // the preset-derived theme is the fallback for any field that fails validation.
    return storedTheme ? coerceTheme(storedTheme, withBrand) : withBrand;
  }, [templateId, restaurant.logo, storedTheme]);

  const renderCategories: RenderCategory[] = useMemo(() => {
    const toRenderItem = (item: MenuTemplateRendererProps['items'][number]): RenderMenuItem => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      halfPrice: item.halfPrice,
      fullPrice: item.fullPrice,
      regPrice: item.regPrice,
      medPrice: item.medPrice,
      largePrice: item.largePrice,
      pricingType: item.pricingType,
      variants: item.variants,
      dietType: item.dietType,
      available: item.available,
      isBestseller: item.isBestseller,
      // Older callers use `image`; newer ones use `imageUrl`.
      imageUrl: item.imageUrl ?? item.image,
      focal:
        typeof item.focalX === 'number' && typeof item.focalY === 'number'
          ? { x: item.focalX, y: item.focalY }
          : undefined,
    });

    const ordered = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const grouped = ordered.map((category) => ({
      id: category.id,
      name: category.name,
      // Items reference their category by id in newer data and by name in older data.
      items: items.filter((item) => item.category === category.id || item.category === category.name).map(toRenderItem),
    }));

    if (grouped.some((category) => category.items.length > 0)) {
      return grouped;
    }

    // No declared category matched, so derive the categories from the items themselves rather
    // than render an empty menu.
    return [...new Set(items.map((item) => item.category))].filter(Boolean).map((name, index) => ({
      id: `derived-${index}`,
      name: String(name),
      items: items.filter((item) => item.category === name).map(toRenderItem),
    }));
  }, [categories, items]);

  // Entitlement gating is unchanged: ordering controls appear only when the plan allows it.
  const cartValue = useMemo(
    () => ({
      onAddToCart: isPremium ? onAddToCart : undefined,
      onRemoveFromCart: isPremium ? onRemoveFromCart : undefined,
      getItemQuantity,
      isPremium,
    }),
    [isPremium, onAddToCart, onRemoveFromCart, getItemQuantity]
  );

  // Bespoke Tenant Isolation for Shobharam's
  if (restaurant.name?.toLowerCase().includes('shobharam')) {
    const toMenuItem = (item: MenuTemplateRendererProps['items'][number]): MenuItem => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      halfPrice: item.halfPrice,
      fullPrice: item.fullPrice,
      regPrice: item.regPrice,
      medPrice: item.medPrice,
      largePrice: item.largePrice,
      pricingType: item.pricingType,
      dietType: item.dietType,
      available: item.available,
      isBestseller: item.isBestseller,
      image: item.imageUrl ?? item.image,
      variants: item.variants,
    });

    const ordered = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    let groupedCategories: CategoryGroup[] = ordered.map((category) => ({
      id: category.id,
      name: category.name,
      items: items.filter((item) => item.category === category.id || item.category === category.name).map(toMenuItem),
    }));

    if (!groupedCategories.some((c) => c.items.length > 0)) {
      const uniqueCats = [...new Set(items.map((item) => item.category))].filter(Boolean);
      groupedCategories = uniqueCats.map((name, idx) => ({
        id: `derived-shobharam-${idx}`,
        name: String(name),
        items: items.filter((item) => item.category === name).map(toMenuItem),
      }));
    }

    return (
      <MenuCartContext.Provider value={cartValue}>
        <ShobharamBookletSpread
          template={{} as any}
          restaurant={{
            name: restaurant.name,
            tagline: restaurant.tagline,
            cuisine: restaurant.cuisine,
            phone: restaurant.phone,
            address: restaurant.address,
            city: restaurant.city,
            logo: restaurant.logo,
          }}
          categories={groupedCategories}
          rawCategories={groupedCategories}
          compact={compact}
          onAddToCart={isPremium ? onAddToCart : undefined}
          isPremium={isPremium}
          activeCategory="all"
          setActiveCategory={() => {}}
        />
      </MenuCartContext.Provider>
    );
  }

  return (
    <MenuCartContext.Provider value={cartValue}>
      <MenuRenderer
        theme={theme}
        restaurant={{
          name: restaurant.name,
          tagline: restaurant.tagline,
          cuisine: restaurant.cuisine,
          phone: restaurant.phone,
          address: restaurant.address,
          city: restaurant.city,
          state: restaurant.state,
          openingHours: restaurant.openingHours,
          logoUrl: restaurant.logo,
        }}
        categories={renderCategories}
        compact={compact}
        className={className}
      />
    </MenuCartContext.Provider>
  );
};

export default MenuTemplateRenderer;

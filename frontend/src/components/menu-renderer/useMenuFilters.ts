/**
 * MENUQR Menu Renderer — Search & Diet Filter State
 *
 * Shared between the composable renderer and every Signature composition, so "search for a
 * dish" and "show veg only" behave identically everywhere rather than being reimplemented (and
 * drifting) per layout.
 */

import { useMemo, useState } from 'react';
import type { DietFilter } from './primitives/MenuToolbar.tsx';
import type { RenderCategory } from './types.ts';

const ALL = 'all';

export function useMenuFilters(categories: RenderCategory[]) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');
  // Multi-select: a dish is excluded if it contains ANY selected allergen — "show me what's
  // safe", not "show me dishes with exactly this allergen".
  const [allergenFilter, setAllergenFilter] = useState<string[]>([]);
  // A ceiling, not an exact match: "mild only" (1) also includes a 0-spice dish.
  const [spiceFilter, setSpiceFilterState] = useState<number | null>(null);
  const setSpiceFilter = (value: number | null) => setSpiceFilterState((prev) => (prev === value ? null : value));

  const counts = useMemo(() => {
    const items = categories.flatMap((category) => category.items);
    // The same spice reconciliation DishMeta.tsx uses for display, reused here for filtering —
    // legacy `spicyLevel` and the newer `tags.spice` must agree on which number is "the" level.
    const spiceOf = (item: RenderCategory['items'][number]) => Math.max(item.spicyLevel ?? 0, item.tags?.spice ?? 0);
    const allergenCounts: Record<string, number> = {};
    items.forEach((item) => {
      (item.tags?.allergens ?? []).forEach((allergen) => {
        allergenCounts[allergen] = (allergenCounts[allergen] ?? 0) + 1;
      });
    });
    return {
      all: items.length,
      veg: items.filter((item) => item.dietType === 'veg' || item.dietType === 'vegan').length,
      nonVeg: items.filter((item) => item.dietType === 'non-veg').length,
      jain: items.filter((item) => item.tags?.jain).length,
      allergens: allergenCounts,
      spicy: items.filter((item) => spiceOf(item) > 0).length,
    };
  }, [categories]);

  // Search, diet, allergen and spice filtering are applied to items, then empty categories are
  // dropped, so a category heading never appears above zero results.
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (dietFilter === 'veg' && item.dietType !== 'veg' && item.dietType !== 'vegan') return false;
          if (dietFilter === 'non-veg' && item.dietType !== 'non-veg') return false;
          if (dietFilter === 'jain' && !item.tags?.jain) return false;
          if (allergenFilter.length > 0 && (item.tags?.allergens ?? []).some((a) => allergenFilter.includes(a))) return false;
          if (spiceFilter !== null && Math.max(item.spicyLevel ?? 0, item.tags?.spice ?? 0) > spiceFilter) return false;
          if (!needle) return true;
          return (
            item.name.toLowerCase().includes(needle) ||
            (item.description ?? '').toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, query, dietFilter, allergenFilter, spiceFilter]);

  const visible = useMemo(
    () => filtered,
    [filtered]
  );

  // Navigation lists every category that has items, not just the ones surviving the current
  // filter, so a diner can always move out of an empty result.
  const navigableCategories = useMemo(
    () => categories.filter((category) => category.items.length > 0),
    [categories]
  );

  return {
    activeCategoryId,
    setActiveCategoryId,
    query,
    setQuery,
    dietFilter,
    setDietFilter,
    allergenFilter,
    setAllergenFilter,
    spiceFilter,
    setSpiceFilter,
    counts,
    filtered,
    visible,
    navigableCategories,
    hasQuery: query.trim().length > 0,
  };
}

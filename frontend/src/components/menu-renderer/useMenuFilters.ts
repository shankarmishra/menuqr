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

  const counts = useMemo(() => {
    const items = categories.flatMap((category) => category.items);
    return {
      all: items.length,
      veg: items.filter((item) => item.dietType === 'veg' || item.dietType === 'vegan').length,
      nonVeg: items.filter((item) => item.dietType === 'non-veg').length,
      jain: items.filter((item) => item.tags?.jain).length,
    };
  }, [categories]);

  // Search and diet filtering are applied to items, then empty categories are dropped, so a
  // category heading never appears above zero results.
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return categories
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          if (dietFilter === 'veg' && item.dietType !== 'veg' && item.dietType !== 'vegan') return false;
          if (dietFilter === 'non-veg' && item.dietType !== 'non-veg') return false;
          if (dietFilter === 'jain' && !item.tags?.jain) return false;
          if (!needle) return true;
          return (
            item.name.toLowerCase().includes(needle) ||
            (item.description ?? '').toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, query, dietFilter]);

  const visible = useMemo(
    () => (activeCategoryId === ALL ? filtered : filtered.filter((c) => c.id === activeCategoryId)),
    [filtered, activeCategoryId]
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
    counts,
    filtered,
    visible,
    navigableCategories,
    hasQuery: query.trim().length > 0,
  };
}

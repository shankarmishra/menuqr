/**
 * MENUQR Menu Renderer — Composition Root
 *
 * One renderer for every menu. It reads the slot selections from the resolved theme and composes
 * the matching components; it contains no per-preset branching, because a preset is data.
 *
 * This replaces thirty-five hand-written template components (about 13,400 lines) whose only
 * structural difference was which pieces they assembled and in what colours.
 */

import React, { useMemo, useState } from 'react';
import { MenuThemeProvider, useMenuTheme } from './MenuThemeProvider.tsx';
import {
  COVER_COMPONENTS,
  DISH_CARD_COMPONENTS,
  DISH_CARD_CONTAINER,
  FOOTER_COMPONENTS,
  NAV_COMPONENTS,
  SECTION_COMPONENTS,
} from './slots/registry.ts';
import { EmptyResults, MenuToolbar, type DietFilter } from './primitives/MenuToolbar.tsx';
import type { MenuTheme } from '../../design-system/theme.types.ts';
import type { RenderCategory, RenderRestaurant, SlotProps } from './types.ts';
import './menu-renderer.css';

const ALL = 'all';

export type MenuRendererProps = {
  theme: MenuTheme;
  restaurant: RenderRestaurant;
  categories: RenderCategory[];
  /** Compact mode for gallery thumbnails and the Design Studio preview. */
  compact?: boolean;
  /** Hides ordering controls, e.g. for a print or PDF export. */
  readOnly?: boolean;
  className?: string;
};

/** Inner body, so slots can call `useMenuTheme` from inside the provider. */
const MenuBody: React.FC<Omit<MenuRendererProps, 'theme' | 'className'>> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL);
  const [query, setQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<DietFilter>('all');

  const counts = useMemo(() => {
    const items = categories.flatMap((category) => category.items);
    return {
      all: items.length,
      veg: items.filter((item) => item.dietType === 'veg' || item.dietType === 'vegan').length,
      nonVeg: items.filter((item) => item.dietType === 'non-veg').length,
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

  const hasQuery = query.trim().length > 0;

  const Cover = COVER_COMPONENTS[tokens.slots.cover];
  const Nav = NAV_COMPONENTS[tokens.slots.nav];
  const SectionHeading = SECTION_COMPONENTS[tokens.slots.section];
  const DishCard = DISH_CARD_COMPONENTS[tokens.slots.dishCard];
  const Footer = FOOTER_COMPONENTS[tokens.slots.footer];

  // Navigation lists every category that has items, not just the ones surviving the current
  // filter, so a diner can always move out of an empty result.
  const navigableCategories = useMemo(
    () => categories.filter((category) => category.items.length > 0),
    [categories]
  );

  const slotProps: SlotProps = {
    restaurant,
    categories: visible,
    allCategories: navigableCategories,
    activeCategoryId,
    onSelectCategory: setActiveCategoryId,
    compact,
  };

  const itemContainerStyle = DISH_CARD_CONTAINER[tokens.slots.dishCard];
  const usesSidebar = tokens.slots.nav === 'sidebar-index';

  return (
    <>
      {tokens.cover.showCoverPage && <Cover {...slotProps} />}

      {/* The sidebar variant renders its own sticky pill row for narrow screens, so rendering it
       * here as well would produce two navigations on a phone. */}
      {!usesSidebar && <Nav {...slotProps} />}

      {/* The compact preview is too small for a usable search field, so it is omitted there. */}
      {!compact && (
        <MenuToolbar
          query={query}
          onQueryChange={setQuery}
          dietFilter={dietFilter}
          onDietFilterChange={setDietFilter}
          counts={counts}
        />
      )}

      <div className={usesSidebar ? 'mq-page mq-with-sidebar' : 'mq-page'}>
        {usesSidebar && <Nav {...slotProps} />}

        <main className="mq-section-stack mq-grow">
          {visible.length === 0 ? (
            hasQuery ? (
              <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
            ) : (
              <p className="mq-tagline" role="status">
                {counts.all === 0 ? 'This menu has no items yet.' : 'No dishes match this filter.'}
              </p>
            )
          ) : (
            visible.map((category) => (
              <section key={category.id} aria-labelledby={`mq-cat-${category.id}`}>
                <SectionHeading
                  id={`mq-cat-${category.id}`}
                  name={category.name}
                  description={category.description}
                  itemCount={category.items.length}
                />
                <div style={{ ...itemContainerStyle, marginTop: 'var(--mq-space-4)' }}>
                  {category.items.map((item, index) => (
                    <DishCard
                      key={item.id}
                      item={item}
                      index={index}
                      compact={compact}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          <Footer restaurant={restaurant} />
        </main>
      </div>
    </>
  );
};

export const MenuRenderer: React.FC<MenuRendererProps> = ({ theme, className, ...rest }) => (
  <MenuThemeProvider theme={theme} className={className}>
    <MenuBody {...rest} />
  </MenuThemeProvider>
);

export default MenuRenderer;

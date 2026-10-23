import React, { useState, useMemo, Suspense } from 'react';
import clsx from 'clsx';
import { menuTemplates, isTemplateDark, isColorDark } from '../../data/menuTemplates';
import { getTemplateComponent, getTemplateTextureKey, TEMPLATE_TEXTURES, type CategoryGroup } from './templates';
import { UniversalMenuSearch } from './templates/shared/UniversalMenuSearch';
import { MenuCartContext } from './templates/shared/MenuCartContext';
import { validateDesignSpecification } from './design-engine/types';

const DynamicDesignEngine = React.lazy(() =>
  import('./design-engine/DynamicDesignEngine').then((m) => ({ default: m.DynamicDesignEngine }))
);

function TemplateFallback({ compact, isDark }: { compact?: boolean; isDark?: boolean }) {
  return (
    <div
      className={clsx(
        'w-full flex flex-col items-center justify-center p-6 space-y-4 animate-pulse',
        compact ? 'min-h-[460px]' : 'min-h-[500px]'
      )}
      aria-label="Loading menu template..."
      role="status"
    >
      <div
        className={clsx(
          'w-9 h-9 rounded-full border-2 border-t-transparent animate-spin opacity-60',
          isDark ? 'border-amber-400' : 'border-emerald-600'
        )}
      />
      <div className="space-y-2 w-full max-w-[180px] flex flex-col items-center">
        <div className={clsx('h-2.5 w-3/4 rounded-full', isDark ? 'bg-white/15' : 'bg-black/10')} />
        <div className={clsx('h-2 w-1/2 rounded-full', isDark ? 'bg-white/10' : 'bg-black/5')} />
      </div>
    </div>
  );
}

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
    variants?: Array<{ id?: string; name: string; price: number | string; variantGroup?: string }>;
  }>;
  compact?: boolean;
  className?: string;
  onAddToCart?: (item: any, priceStr?: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
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
  accentConfiguration,
}) => {
  const template = menuTemplates.find((t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId) || menuTemplates[0];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authoritative entitlement gating: only provide addToCart when plan ordering is permitted
  const effectiveAddToCart = isPremium && onAddToCart ? onAddToCart : undefined;

  // Search filtering: matches name and meaningful description
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      return name.includes(normalizedQuery) || desc.includes(normalizedQuery);
    });
  }, [items, normalizedQuery]);

  // Group items by category
  const sortedCategories = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  
  const itemsByCategory: CategoryGroup[] = sortedCategories
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: matchingItems.filter((item) => item.category === cat.id || item.category === cat.name),
    }))
    .filter((cat) => cat.items.length > 0);

  const rawCategories: CategoryGroup[] =
    itemsByCategory.length > 0
      ? itemsByCategory
      : Array.from(new Set(matchingItems.map((i) => i.category))).map((catName, idx) => ({
          id: `cat-${idx}`,
          name: catName,
          items: matchingItems.filter((i) => i.category === catName),
        }));

  // Filter categories based on active category selection
  const filteredCategories = rawCategories.filter((cat) => {
    if (activeCategory !== 'all') {
      return cat.id === activeCategory || cat.name === activeCategory;
    }
    return true;
  });

  const validatedSpec = useMemo(() => {
    return accentConfiguration ? validateDesignSpecification(accentConfiguration) : null;
  }, [accentConfiguration]);

  // If a valid custom Design Specification exists, render through the Dynamic Design Engine
  if (validatedSpec) {
    const isDark = isColorDark(validatedSpec.colors.bg);
    const searchBar = compact ? null : (
      <UniversalMenuSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        accentColor={validatedSpec.colors.accent || validatedSpec.colors.heading}
        placeholder="Search dishes..."
        isDarkTheme={isDark}
      />
    );

    return (
      <MenuCartContext.Provider value={{ onAddToCart: effectiveAddToCart, onRemoveFromCart, getItemQuantity, isPremium }}>
        <Suspense fallback={<TemplateFallback compact={compact} isDark={isDark} />}>
          <DynamicDesignEngine
            spec={validatedSpec}
            template={template}
            restaurant={restaurant}
            categories={filteredCategories}
            rawCategories={rawCategories}
            compact={compact}
            onAddToCart={effectiveAddToCart}
            isPremium={isPremium}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchBar={searchBar}
            className={className}
          />
        </Suspense>
      </MenuCartContext.Provider>
    );
  }

  const TemplateComponent = getTemplateComponent(template.id);
  const textureKey = getTemplateTextureKey(template.id);
  const textureObj = TEMPLATE_TEXTURES[textureKey];
  const isDark = isTemplateDark(template);

  const searchBar = compact ? null : (
    <UniversalMenuSearch
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      accentColor={template.colors.accent || template.colors.heading}
      placeholder="Search dishes..."
      isDarkTheme={isDark}
    />
  );

  return (
    <MenuCartContext.Provider value={{ onAddToCart, onRemoveFromCart, getItemQuantity }}>
    <div
      className={clsx(
        'w-full transition-all duration-300 relative overflow-hidden',
        textureObj?.bg || 'bg-white',
        textureObj?.gradient || '',
        compact ? 'p-0.5 text-xs' : 'p-4 sm:p-8 min-h-screen text-sm',
        className
      )}
      style={{
        fontFamily: template.typography.body,
        backgroundImage: textureObj?.overlayPattern !== 'none' ? textureObj?.overlayPattern : undefined,
      }}
    >
      <div className={clsx('mx-auto relative z-10', compact ? 'max-w-xl' : 'max-w-6xl')}>
        <Suspense fallback={<TemplateFallback compact={compact} isDark={isDark} />}>
          <TemplateComponent
            template={template}
            restaurant={restaurant}
            categories={filteredCategories}
            rawCategories={rawCategories}
            compact={compact}
            onAddToCart={effectiveAddToCart}
            isPremium={isPremium}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchBar={searchBar}
          />
        </Suspense>

        {/* Global Empty Search State if no dishes matched */}
        {!compact && normalizedQuery && filteredCategories.length === 0 && (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 opacity-70">
              🔍
            </div>
            <p className="text-base font-medium opacity-80">
              No dishes found matching <span className="font-bold">"{searchQuery}"</span>
            </p>
            {activeCategory !== 'all' && (
              <p className="text-xs opacity-60">
                Searching inside category only. Try viewing all dishes or clearing your search.
              </p>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              {activeCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  View in All Dishes
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-current text-black dark:text-white transition-opacity cursor-pointer"
                style={{ backgroundColor: template.colors.accent || template.colors.heading, color: isDark ? '#000000' : '#FFFFFF' }}
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </MenuCartContext.Provider>
  );
};

export default MenuTemplateRenderer;

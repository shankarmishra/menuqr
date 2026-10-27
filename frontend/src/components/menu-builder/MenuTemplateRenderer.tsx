import React, { useState, useMemo, Suspense } from 'react';
import clsx from 'clsx';
import { menuTemplates, isTemplateDark } from '../../data/menuTemplates';
import { artisanGraphicThemes } from '../../data/artisanGraphicThemes';
import { paginateMenu } from '../../utils/menuPaginator';
import { ArtisanGraphicTemplate } from './templates/artisan/ArtisanGraphicTemplate';
import { ChevronLeft, ChevronRight, Layers, BookOpen } from 'lucide-react';
import { getTemplateComponent, getTemplateTextureKey, TEMPLATE_TEXTURES, type CategoryGroup } from './templates';
import { UniversalMenuSearch } from './templates/shared/UniversalMenuSearch';
import { MenuCartContext } from './templates/shared/MenuCartContext';


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
  accentConfiguration: _accentConfiguration,
}) => {
  const template = menuTemplates.find((t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId) || menuTemplates[0];
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authoritative entitlement gating: only provide addToCart when plan ordering is permitted
  const effectiveAddToCart = isPremium && onAddToCart ? onAddToCart : undefined;

  // Search filtering: matches name and meaningful description
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const totalVegCount = useMemo(() => items.filter((i) => i.dietType === 'veg' || i.dietType === 'vegan').length, [items]);
  const totalNonVegCount = useMemo(() => items.filter((i) => i.dietType === 'non-veg').length, [items]);

  const matchingItems = useMemo(() => {
    let result = items;
    if (normalizedQuery) {
      result = result.filter((item) => {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        return name.includes(normalizedQuery) || desc.includes(normalizedQuery);
      });
    }
    if (dietFilter === 'veg') {
      result = result.filter((item) => item.dietType === 'veg' || item.dietType === 'vegan');
    } else if (dietFilter === 'non-veg') {
      result = result.filter((item) => item.dietType === 'non-veg');
    }
    return result;
  }, [items, normalizedQuery, dietFilter]);

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



  const artisanTheme = useMemo(() => {
    return artisanGraphicThemes.find(
      (t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId
    );
  }, [templateId]);

  const [activeArtisanPageIdx, setActiveArtisanPageIdx] = useState(0);
  const [artisanViewMode, setArtisanViewMode] = useState<'flip' | 'scroll'>('scroll');

  const effectiveCategoriesForPagination = useMemo(() => {
    if (categories && categories.length > 0) {
      return categories;
    }
    return rawCategories.map((c, i) => ({ id: c.id, name: c.name, order: i }));
  }, [categories, rawCategories]);

  const artisanPages = useMemo(() => {
    if (!artisanTheme) return [];
    return paginateMenu(effectiveCategoriesForPagination, matchingItems as any, {
      layoutMode: 'two-column',
      enableCoverPage: true,
    });
  }, [artisanTheme, effectiveCategoriesForPagination, matchingItems]);

  const TemplateComponent = getTemplateComponent(template.id);
  const textureKey = getTemplateTextureKey(template.id);
  const textureObj = TEMPLATE_TEXTURES[textureKey];
  const isDark = isTemplateDark(template);

  const searchBar = compact ? null : (
    <div className="space-y-3 mb-6">
      <UniversalMenuSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        accentColor={template.colors.accent || template.colors.heading}
        placeholder="Search dishes..."
        isDarkTheme={isDark}
      />
      {(totalVegCount > 0 || totalNonVegCount > 0) && (
        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <button
            type="button"
            onClick={() => setDietFilter('all')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer',
              dietFilter === 'all'
                ? (isDark ? 'bg-white/20 text-white border-white/40 shadow-sm' : 'bg-black/15 text-black border-black/30 shadow-sm')
                : (isDark ? 'bg-black/30 text-white/70 border-white/10 hover:text-white' : 'bg-white/60 text-black/70 border-black/10 hover:text-black')
            )}
          >
            All Dishes ({items.length})
          </button>
          {totalVegCount > 0 && (
            <button
              type="button"
              onClick={() => setDietFilter('veg')}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer',
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                  : (isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100')
              )}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white/50" />
              Pure Veg ({totalVegCount})
            </button>
          )}
          {totalNonVegCount > 0 && (
            <button
              type="button"
              onClick={() => setDietFilter('non-veg')}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer',
                dietFilter === 'non-veg'
                  ? 'bg-[#8B3A2B] text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                  : (isDark ? 'bg-rose-950/40 text-rose-300 border-rose-900/40 hover:bg-rose-900/50' : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100')
              )}
            >
              <span className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-rose-400" />
              Non-Veg ({totalNonVegCount})
            </button>
          )}
        </div>
      )}
    </div>
  );

  if (artisanTheme) {
    const totalPages = Math.max(artisanPages.length, 1);
    const safeIdx = Math.min(Math.max(activeArtisanPageIdx, 0), totalPages - 1);
    const currentPage = artisanPages[safeIdx] || {
      pageNumber: 1,
      totalPages: 1,
      pageType: 'cover' as const,
      sections: [],
    };

    return (
      <MenuCartContext.Provider value={{ onAddToCart, onRemoveFromCart, getItemQuantity }}>
        <div
          className={clsx(
            'w-full transition-all duration-300 relative',
            compact ? 'p-1 text-xs' : 'p-3 sm:p-8 min-h-screen text-sm bg-neutral-950 text-stone-200',
            className
          )}
        >
          <div className={clsx('mx-auto relative z-10', compact ? 'max-w-xl' : 'max-w-4xl')}>
            {!compact && searchBar}

            {!compact && totalPages > 1 && (
              <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{artisanTheme.name}</span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    {artisanTheme.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setArtisanViewMode(artisanViewMode === 'flip' ? 'scroll' : 'flip')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
                  >
                    {artisanViewMode === 'flip' ? <Layers size={13} /> : <BookOpen size={13} />}
                    <span>{artisanViewMode === 'flip' ? 'View All Pages' : 'Flip Page by Page'}</span>
                  </button>
                </div>
              </div>
            )}

            {(compact || artisanViewMode === 'flip') ? (
              <div className="flex flex-col items-center space-y-2 w-full">
                {totalPages > 1 && (
                  <div className="flex items-center justify-between w-full max-w-sm px-3 py-1.5 bg-neutral-900/95 border border-white/10 rounded-xl shadow-lg backdrop-blur-md text-xs mb-1 sticky top-0 z-30">
                    <button
                      type="button"
                      disabled={safeIdx <= 0}
                      onClick={() => setActiveArtisanPageIdx((p) => Math.max(0, p - 1))}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="font-mono text-stone-200 font-bold text-center text-xs">
                      Page {safeIdx + 1} of {totalPages}
                      <span className="text-[9px] text-amber-400 font-normal block">
                        {currentPage.pageType === 'cover' ? 'Front Cover' : currentPage.runningTitle || 'Menu Dishes'}
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled={safeIdx >= totalPages - 1}
                      onClick={() => setActiveArtisanPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                    >
                      Next <ChevronRight size={14} />
                    </button>
                  </div>
                )}

                <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <ArtisanGraphicTemplate
                    theme={artisanTheme}
                    page={currentPage}
                    restaurant={{
                      name: restaurant.name,
                      tagline: restaurant.tagline,
                      cuisine: restaurant.cuisine,
                      phone: restaurant.phone,
                      address: restaurant.address,
                      city: restaurant.city,
                      state: restaurant.state,
                      openingHours: restaurant.openingHours,
                      logo: restaurant.logo,
                      slug: (restaurant as any).slug,
                    }}
                    onAddToCart={effectiveAddToCart}
                    getItemQuantity={getItemQuantity}
                  />
                </div>

                {!compact && totalPages > 1 && (
                  <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 bg-neutral-900/90 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md text-xs mt-2">
                    <button
                      type="button"
                      disabled={safeIdx <= 0}
                      onClick={() => setActiveArtisanPageIdx((p) => Math.max(0, p - 1))}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="font-mono text-stone-300 font-bold text-center">
                      Page {safeIdx + 1} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeIdx >= totalPages - 1}
                      onClick={() => setActiveArtisanPageIdx((p) => Math.min(totalPages - 1, p + 1))}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {artisanPages.map((pg, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <ArtisanGraphicTemplate
                      theme={artisanTheme}
                      page={pg}
                      restaurant={{
                        name: restaurant.name,
                        tagline: restaurant.tagline,
                        cuisine: restaurant.cuisine,
                        phone: restaurant.phone,
                        address: restaurant.address,
                        city: restaurant.city,
                        state: restaurant.state,
                        openingHours: restaurant.openingHours,
                        logo: restaurant.logo,
                        slug: (restaurant as any).slug,
                      }}
                      onAddToCart={effectiveAddToCart}
                      getItemQuantity={getItemQuantity}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MenuCartContext.Provider>
    );
  }

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

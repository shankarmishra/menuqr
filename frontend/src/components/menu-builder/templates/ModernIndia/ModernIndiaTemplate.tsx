import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { SaffronNotchDivider } from '../artwork/SectionDividers';

export const ModernIndiaTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  isPremium,
  activeCategory,
  setActiveCategory,
  searchBar,
}) => {
  const saffronColor = template.colors.accent || '#D97706';
  const headingFont = template.typography.heading || "'Montserrat', sans-serif";

  return (
    <div className="text-[#2D241E] font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: PROGRESSIVE INDIAN GASTRONOMY ATELIER
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-8 rounded-lg bg-[#FFFDF8] border border-[#E8DFD5] shadow-lg text-center">
        {/* Architectonic saffron corner notches */}
        <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D97706]" />
        <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D97706]" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D97706]" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D97706]" />

        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <span className="text-[9.5px] uppercase tracking-[0.45em] font-bold text-[#D97706]">
            Progressive Indian Cuisine • Modern Atelier
          </span>

          <h1
            className={clsx(
              'font-light tracking-wide text-[#1E1A17] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-[#786657] font-serif italic tracking-wide max-w-xl mx-auto px-4">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#A39080] font-mono tracking-wider flex items-center justify-center gap-2">
              <span>—</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>—</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#FFFDF8]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#D97706]/30 shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#D97706] text-white shadow-md'
                : 'text-[#786657] hover:text-[#1E1A17]'
            )}
          >
            All Courses
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#D97706] text-white font-bold shadow-md'
                    : 'text-[#786657] hover:text-[#1E1A17]'
                )}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODERN GASTRONOMY SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-lg bg-[#FFFDF8] border border-[#E8DFD5] shadow-md space-y-6"
          >
            {/* Category Header with Minimal Saffron Notch */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2
                  className={clsx(
                    'font-medium text-[#1E1A17] uppercase tracking-[0.2em]',
                    compact ? 'text-xs' : 'text-sm sm:text-base'
                  )}
                  style={{ fontFamily: headingFont }}
                >
                  {cat.name}
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-[#D97706] uppercase">
                  Course
                </span>
              </div>
              <SaffronNotchDivider color={saffronColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#E8DFD5]">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#FAF6EF]/60 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#D97706" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-medium text-[#1E1A17] group-hover:text-[#D97706] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Minimal Saffron Hairline Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-[#D97706]/20 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RenderItemPrices
                          item={item}
                          accentColor="#D97706"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-medium text-[#1E1A17] tracking-wider font-mono whitespace-nowrap text-xs sm:text-sm"
                          btnStyle="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1E1A17] text-[#FFFDF8] hover:bg-[#D97706] transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {pricing.cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-[#786657] leading-relaxed font-sans break-words">
                            {pricing.cleanDescription}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/30 font-bold">
                              Atelier Selection
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#E8DFD5] shadow-sm shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

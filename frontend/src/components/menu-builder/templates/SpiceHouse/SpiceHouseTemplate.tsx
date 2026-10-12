import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { SpiceDustDivider } from '../artwork/SectionDividers';

export const SpiceHouseTemplate: React.FC<LayoutProps> = ({
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
  const spiceColor = template.colors.accent || '#E07A5F';
  const headingFont = template.typography.heading || "'Oswald', serif";

  return (
    <div className="text-[#F5EBE6] font-serif relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: ARTISANAL SPICE BAZAAR & ROASTED MASALA
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-8 rounded-lg bg-gradient-to-b from-[#3A2A24] via-[#2C211D] to-[#1E1613] border-2 border-[#E07A5F]/40 shadow-2xl text-center">
        {/* Subtle Paprika Corner Studs */}
        <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#E07A5F]" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E07A5F]" />
        <span className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#E07A5F]" />
        <span className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#E07A5F]" />

        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          <span className="text-[9.5px] uppercase tracking-[0.45em] font-bold text-[#E07A5F] font-mono">
            ✦ Artisanal Spice Blends & Slow Fire Kitchen ✦
          </span>

          <h1
            className={clsx(
              'font-black tracking-wide text-[#FFF0E6] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-[#F4A261] font-serif italic tracking-wide max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#E07A5F]/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>●</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>●</span>
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
        <div className="sticky top-2 z-30 bg-[#2C211D]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#E07A5F]/40 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#E07A5F] text-white shadow-md'
                : 'text-[#E07A5F] hover:bg-[#E07A5F]/20'
            )}
          >
            All Spices
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
                    ? 'bg-[#E07A5F] text-white font-bold shadow-md'
                    : 'text-[#E07A5F] hover:bg-[#E07A5F]/20'
                )}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SPICE HOUSE SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-lg bg-[#271D1A] border border-[#E07A5F]/35 shadow-xl space-y-6"
          >
            {/* Category Header with Spice Dust Divider */}
            <div className="text-center space-y-1">
              <h2
                className={clsx(
                  'font-black text-[#F4A261] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#352520] border border-[#E07A5F]/30',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ❖ {cat.name} ❖
              </h2>
              <SpiceDustDivider color={spiceColor} secondaryColor="#F4A261" />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#E07A5F]/15">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#E07A5F]/5 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#E07A5F" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-[#FFF0E6] group-hover:text-[#F4A261] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Spice Terracotta Dotted Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#E07A5F]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RenderItemPrices
                          item={item}
                          accentColor="#E07A5F"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-bold text-[#F4A261] tracking-wide font-mono whitespace-nowrap text-xs sm:text-sm"
                          btnStyle="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E07A5F] text-white hover:bg-[#c96247] transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {pricing.cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-[#DFCEBF] leading-relaxed font-serif italic break-words">
                            {pricing.cleanDescription}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#E07A5F]/20 text-[#F4A261] border border-[#E07A5F]/40 font-bold">
                              House Special
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#E07A5F]/40 shadow-sm shrink-0">
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

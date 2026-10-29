import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { SwissPrecisionDivider } from '../artwork/SectionDividers';
import { SwissArchitecturalFrame } from '../artwork/OrnamentalFrames';

export const MinimalEditorialTemplate: React.FC<LayoutProps> = ({
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
  const headingFont = template.typography.heading || "'Inter', sans-serif";

  return (
    <div className="text-[#0A0A0A] font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: SWISS INTERNATIONAL TYPOGRAPHIC STYLE & GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <SwissArchitecturalFrame className="bg-white text-center shadow-md">
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          {restaurant.logo && (
            <div className="w-12 h-12 rounded-full p-1 border border-black/20 shadow-xs flex items-center justify-center overflow-hidden mb-1">
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" decoding="async" loading="lazy" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-black/50 uppercase">
              [ {restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} — EDITORIAL` : 'EDITION NO. 01 — SWISS EDITORIAL'} ]
            </span>
          </div>

          <h1
            className={clsx(
              'font-light tracking-tight text-black uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-black/60 font-serif italic tracking-wide max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-black/40 font-mono tracking-widest flex items-center justify-center gap-2">
              <span>+</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>/ {restaurant.phone}</span>}
              <span>+</span>
            </div>
          )}
        </div>
      </SwissArchitecturalFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md py-2 px-2 rounded-full border border-black/20 shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-mono uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'text-black/60 hover:text-black'
            )}
          >
            All [00]
          </button>
          {rawCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            const indexStr = String(idx + 1).padStart(2, '0');
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-black text-white font-bold shadow-sm'
                    : 'text-black/60 hover:text-black'
                )}
              >
                {cat.name} [{indexStr}]
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SWISS EDITORIAL SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat, catIdx) => {
          const catNum = String(catIdx + 1).padStart(2, '0');
          return (
            <SwissArchitecturalFrame
              key={cat.id}
              className="bg-white shadow-md"
            >
              {/* Category Header with Swiss Precision Divider */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs text-black/40">§ {catNum}</span>
                    <h2
                      className={clsx(
                        'font-light text-black uppercase tracking-[0.2em]',
                        compact ? 'text-xs' : 'text-sm sm:text-base'
                      )}
                      style={{ fontFamily: headingFont }}
                    >
                      {cat.name}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-black/40 uppercase">
                    {cat.items.length} Entries
                  </span>
                </div>
                <SwissPrecisionDivider color="#000000" />
              </div>

              {/* Dishes Listing */}
              <div className="space-y-4 divide-y divide-black/10">
                {cat.items.map((item, itemIdx) => {
                  const pricing = parseItemPricing(item);
                  const itemNum = `${catNum}.${String(itemIdx + 1).padStart(2, '0')}`;
                  return (
                    <div
                      key={item.id}
                      className="pt-3 first:pt-0 group hover:bg-black/[0.02] px-2 -mx-2 rounded transition-colors"
                    >
                      {/* Top Baseline Row: Index + Diet + Name + Leader Line + Price + Add */}
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-black/40 shrink-0 self-center">
                            {itemNum}
                          </span>
                          <DietIndicator type={item.dietType} compact={compact} color="#000000" className="self-center shrink-0" />
                          <h3
                            className={clsx(
                              'font-normal text-black group-hover:text-black/70 transition-colors break-words',
                              compact ? 'text-xs' : 'text-sm sm:text-base'
                            )}
                            style={{ fontFamily: template.typography.body }}
                          >
                            {item.name}
                          </h3>
                          {/* Swiss Precision Hairline Leader Line */}
                          <span className="hidden sm:inline-block flex-1 border-b border-black/15 mx-2 self-baseline mb-1" />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <RenderItemPrices
                            item={item}
                            accentColor="#000000"
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="font-mono text-black tracking-wider font-medium whitespace-nowrap text-xs sm:text-sm"
                            btnStyle="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-black text-black hover:bg-black hover:text-white transition-all cursor-pointer"
                            compact={compact}
                          />
                        </div>
                      </div>

                      {/* Second Row: Description & Optional Image Thumbnail */}
                      <div className="flex items-start justify-between gap-3 mt-1">
                        <div className="min-w-0 flex-1">
                          {pricing.cleanDescription && (
                            <p className="text-[11px] sm:text-xs text-black/60 leading-relaxed font-sans break-words">
                              {pricing.cleanDescription}
                            </p>
                          )}

                          {item.isBestseller && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-black text-black">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>

                        {item.image && (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded overflow-hidden border border-black/20 shadow-sm shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none');
                              }}
                              decoding="async"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SwissArchitecturalFrame>
          );
        })}
      </div>
    </div>
  );
};

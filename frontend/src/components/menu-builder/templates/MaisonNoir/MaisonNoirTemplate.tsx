import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';
import { MichelinSealEmblem } from '../artwork/ArchesAndEmblems';
import { PlatinumHairlineDivider } from '../artwork/SectionDividers';

export const MaisonNoirTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  activeCategory,
  setActiveCategory,
}) => {
  const goldColor = template.colors.accent || '#C5A059';
  const headingFont = template.typography.heading || "'Bodoni Moda', serif";

  return (
    <div className="text-[#E0E0E0] font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: PARISIAN MICHELIN 3-STAR HAUTE CUISINE
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-9 rounded-lg bg-gradient-to-b from-[#141416] via-[#0E0E10] to-[#08080A] border border-[#C5A059]/40 shadow-2xl text-center">
        {/* Platinum Corner Insets */}
        <span className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-[#C5A059]" />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-[#C5A059]" />
        <span className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-[#C5A059]" />
        <span className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-[#C5A059]" />

        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          {/* Michelin Star Crest & Platinum Hairlines */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C5A059]" />
            <MichelinSealEmblem size={compact ? 36 : 46} goldColor={goldColor} />
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C5A059]" />
          </div>

          <span className="text-[9px] uppercase tracking-[0.55em] font-light text-[#C5A059] font-mono">
            Haute Cuisine • Menu Dégustation
          </span>

          <h1
            className={clsx(
              'font-light tracking-[0.18em] text-[#F5F5F5] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-[#C5A059]/80 font-serif italic tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-white/50 font-mono tracking-widest flex items-center justify-center gap-2">
              <span>—</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>—</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#0E0E10]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#C5A059]/40 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-light',
              activeCategory === 'all'
                ? 'bg-[#C5A059] text-[#0A0A0C] font-semibold shadow-md'
                : 'text-[#C5A059] hover:bg-[#C5A059]/15'
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
                    ? 'bg-[#C5A059] text-[#0A0A0C] font-semibold shadow-md'
                    : 'text-[#C5A059] hover:bg-[#C5A059]/15'
                )}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          HAUTE CUISINE SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-lg bg-[#0E0E10] border border-[#C5A059]/30 shadow-xl space-y-6"
          >
            {/* Category Header with Platinum Hairline */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h2
                  className={clsx(
                    'font-light text-[#C5A059] uppercase tracking-[0.25em]',
                    compact ? 'text-xs' : 'text-sm sm:text-base'
                  )}
                  style={{ fontFamily: headingFont }}
                >
                  {cat.name}
                </h2>
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
                  Service
                </span>
              </div>
              <PlatinumHairlineDivider color={goldColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-white/10">
              {cat.items.map((item) => {
                const displayPrice = item.price ? `₹${item.price}` : '';
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-white/[0.03] px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Order */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#C5A059" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-normal text-white group-hover:text-[#C5A059] transition-colors tracking-wide break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Parisian Platinum Gold Hairline Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-[#C5A059]/25 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {displayPrice && (
                          <span
                            className={clsx(
                              'font-mono text-[#C5A059] tracking-wider whitespace-nowrap',
                              compact ? 'text-xs' : 'text-sm sm:text-base'
                            )}
                          >
                            {displayPrice}
                          </span>
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, displayPrice)}
                            className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0E0E10] transition-all"
                          >
                            Order
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {item.description && (
                          <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed font-serif italic break-words">
                            {item.description}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border border-[#C5A059]/40 text-[#C5A059]">
                              Signature
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#C5A059]/40 shadow-sm shrink-0">
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

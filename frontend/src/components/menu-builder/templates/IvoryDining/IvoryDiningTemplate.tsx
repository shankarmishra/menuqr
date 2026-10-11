import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';
import { SalonLeafDivider } from '../artwork/SectionDividers';

export const IvoryDiningTemplate: React.FC<LayoutProps> = ({
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
  const headingFont = template.typography.heading || "'Playfair Display', serif";

  return (
    <div className="text-[#2C2523] font-serif relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: ALABASTER SALON & CHAMPAGNE DINING
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-9 rounded-lg bg-[#FCFBF7] border-2 border-[#C5A059]/40 shadow-xl text-center">
        {/* Salon Double Border Inset */}
        <div className="absolute inset-2 rounded border border-[#C5A059]/25 pointer-events-none" />

        <div className="flex flex-col items-center justify-center space-y-2.5 py-2">
          <span className="text-[9.5px] uppercase tracking-[0.45em] font-medium text-[#C5A059]">
            Alabaster Salon • Fine Dining
          </span>

          <h1
            className={clsx(
              'font-normal tracking-wide text-[#2C2523] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm italic text-[#7A6B63] tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#A6978E] font-mono tracking-wider flex items-center justify-center gap-2">
              <span>✤</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>✤</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#FCFBF7]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#C5A059]/40 shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-medium',
              activeCategory === 'all'
                ? 'bg-[#C5A059] text-white shadow-md'
                : 'text-[#7A6B63] hover:text-[#2C2523]'
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
                    ? 'bg-[#C5A059] text-white font-medium shadow-md'
                    : 'text-[#7A6B63] hover:text-[#2C2523]'
                )}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ALABASTER SALON SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-lg bg-[#FCFBF7] border border-[#C5A059]/30 shadow-md space-y-6"
          >
            {/* Category Header with Salon Leaf Divider */}
            <div className="text-center space-y-1">
              <h2
                className={clsx(
                  'font-normal text-[#C5A059] uppercase tracking-[0.25em] inline-block px-4 py-1',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                — {cat.name} —
              </h2>
              <SalonLeafDivider color={goldColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#C5A059]/20">
              {cat.items.map((item) => {
                const displayPrice = item.price ? `₹${item.price}` : '';
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#F5F2EB]/50 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#C5A059" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-normal text-[#2C2523] group-hover:text-[#C5A059] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Salon Champagne Gold Dotted Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#C5A059]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {displayPrice && (
                          <span
                            className={clsx(
                              'font-serif text-[#C5A059] tracking-wider whitespace-nowrap font-medium',
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
                            className="text-[10px] uppercase font-serif tracking-wider px-2 py-0.5 rounded bg-[#C5A059] text-white hover:bg-[#ad883c] transition-all"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {item.description && (
                          <p className="text-[11px] sm:text-xs text-[#7A6B63] leading-relaxed font-serif italic break-words">
                            {item.description}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-serif uppercase px-1.5 py-0.5 rounded bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
                              Salon Selection
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

import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';
import { GrandGoldDivider } from '../artwork/SectionDividers';
import { GrandBallroomFrame } from '../artwork/OrnamentalFrames';

export const GrandTableTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  activeCategory,
  setActiveCategory,
}) => {
  const goldColor = template.colors.accent || '#C8A962';
  const headingFont = template.typography.heading || "'Cinzel', serif";

  return (
    <div className="text-[#E2E8F0] font-serif relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: MIDNIGHT NAVY & GRAND BALLROOM SPREAD
          ═══════════════════════════════════════════════════════════════════════ */}
      <GrandBallroomFrame
        goldColor={goldColor}
        className="bg-gradient-to-b from-[#162438] via-[#0E1724] to-[#080E17] text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C8A962]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.45em] font-bold text-[#C8A962]">
              ✦ THE GRAND TABLE ROOM ✦
            </span>
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C8A962]" />
          </div>

          <h1
            className={clsx(
              'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF5] via-[#C8A962] to-[#997C3A] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm italic text-[#94A3B8] tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#C8A962]/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>✤</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>✤</span>
            </div>
          )}
        </div>
      </GrandBallroomFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#0C1420]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#C8A962]/40 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#C8A962] text-[#0A0F17] shadow-md'
                : 'text-[#C8A962] hover:bg-[#C8A962]/15'
            )}
          >
            ✦ All Courses
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
                    ? 'bg-[#C8A962] text-[#0A0F17] font-bold shadow-md'
                    : 'text-[#C8A962] hover:bg-[#C8A962]/15'
                )}
              >
                ✦ {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          GRAND BALLROOM SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <GrandBallroomFrame
            key={cat.id}
            goldColor={goldColor}
            className="bg-[#0E1724] shadow-2xl"
          >
            {/* Category Header with Grand Gold Divider */}
            <div className="text-center space-y-1 pb-4">
              <h2
                className={clsx(
                  'font-black text-[#C8A962] uppercase tracking-[0.25em] inline-block px-4 py-1 rounded bg-[#162438] border border-[#C8A962]/30',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ❖ {cat.name} ❖
              </h2>
              <GrandGoldDivider color={goldColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#C8A962]/15">
              {cat.items.map((item) => {
                const displayPrice = item.price ? `₹${item.price}` : '';
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#C8A962]/5 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#C8A962" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-[#F8FAFC] group-hover:text-[#C8A962] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Grand Ballroom Gold Dotted Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#C8A962]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {displayPrice && (
                          <span
                            className={clsx(
                              'font-bold text-[#C8A962] tracking-wide font-mono whitespace-nowrap',
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
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C8A962] text-[#080E17] hover:bg-[#dec17e] transition-all"
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
                          <p className="text-[11px] sm:text-xs text-[#94A3B8] leading-relaxed font-serif italic break-words">
                            {item.description}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#C8A962]/20 text-[#C8A962] border border-[#C8A962]/40 font-bold">
                              Grand Selection
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#C8A962]/40 shadow-sm shrink-0">
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
          </GrandBallroomFrame>
        ))}
      </div>
    </div>
  );
};

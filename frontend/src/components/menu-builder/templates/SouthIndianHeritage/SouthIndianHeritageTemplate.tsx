import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';
import { TempleGopuramCrest } from '../artwork/ArchesAndEmblems';
import { KolamKnotDivider } from '../artwork/SectionDividers';
import { TempleStonePillarFrame } from '../artwork/OrnamentalFrames';

export const SouthIndianHeritageTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  activeCategory,
  setActiveCategory,
}) => {
  const brassColor = template.colors.accent || '#C28838';
  const headingFont = template.typography.heading || "'Cinzel', serif";

  return (
    <div className="text-[#2D2319] font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: DRAVIDIAN TEMPLE GOPURAM & BRASS BELLS
          ═══════════════════════════════════════════════════════════════════════ */}
      <TempleStonePillarFrame
        maroon="#6E1B1B"
        brass={brassColor}
        className="bg-gradient-to-b from-[#FFFDF7] via-[#FAF6ED] to-[#F5EEDB] text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          {/* Temple Gopuram Silhouette & Symmetrical Bells */}
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#C28838]" />
            <TempleGopuramCrest size={compact ? 36 : 46} maroon="#6E1B1B" brass={brassColor} />
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#C28838]" />
          </div>

          <span className="text-[9.5px] font-mono uppercase tracking-[0.4em] font-bold text-[#6E1B1B]">
            ✦ Traditional Dakshin Cuisine • Chettinad & Malabar ✦
          </span>

          <h1
            className={clsx(
              'font-black tracking-wide text-[#6E1B1B] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm italic text-[#59493B] font-serif tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#6E1B1B]/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>●</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>●</span>
            </div>
          )}
        </div>
      </TempleStonePillarFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#6E1B1B]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#C28838]/50 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#C28838] text-[#FAF6ED] shadow-[0_0_12px_rgba(194,136,56,0.5)]'
                : 'text-[#FAF6ED] hover:bg-[#C28838]/20'
            )}
          >
            ● All Dishes
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
                    ? 'bg-[#C28838] text-[#FAF6ED] font-bold shadow-[0_0_12px_rgba(194,136,56,0.5)]'
                    : 'text-[#FAF6ED] hover:bg-[#C28838]/20'
                )}
              >
                ● {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TEMPLE STONE SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <TempleStonePillarFrame
            key={cat.id}
            maroon="#6E1B1B"
            brass={brassColor}
            className="bg-[#FFFDF7] shadow-xl"
          >
            {/* Category Header with Kolam Knot Motif */}
            <div className="text-center space-y-1 pb-4">
              <h2
                className={clsx(
                  'font-bold text-[#6E1B1B] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#FAF2E1] border border-[#C28838]/40 shadow-sm',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ❖ {cat.name} ❖
              </h2>
              <KolamKnotDivider color={brassColor} secondaryColor="#6E1B1B" />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#6E1B1B]/15">
              {cat.items.map((item) => {
                const displayPrice = item.price ? `₹${item.price}` : '';
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#FAF2E1]/60 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#6E1B1B" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-[#6E1B1B] group-hover:text-[#8D2525] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Temple Kolam Maroon Dotted Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#6E1B1B]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {displayPrice && (
                          <span
                            className={clsx(
                              'font-bold text-[#6E1B1B] tracking-wide font-mono whitespace-nowrap',
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
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#6E1B1B] text-[#FFFDF7] hover:bg-[#8D2525] transition-all"
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
                          <p className="text-[11px] sm:text-xs text-[#59493B] leading-relaxed font-sans break-words">
                            {item.description}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#6E1B1B]/10 text-[#6E1B1B] border border-[#6E1B1B]/30 font-bold">
                              ★ Dakshin Special
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#C28838]/40 shadow-sm shrink-0">
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
          </TempleStonePillarFrame>
        ))}
      </div>
    </div>
  );
};

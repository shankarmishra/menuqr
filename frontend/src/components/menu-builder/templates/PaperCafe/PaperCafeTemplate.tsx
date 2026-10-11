import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator } from '../shared/RenderItemPrices';
import { WheatStalkEmblem } from '../artwork/ArchesAndEmblems';
import { TwineDashedDivider } from '../artwork/SectionDividers';

export const PaperCafeTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  activeCategory,
  setActiveCategory,
}) => {
  const sepiaColor = template.colors.accent || '#8C6D53';
  const headingFont = template.typography.heading || "'Courier Prime', monospace";

  return (
    <div className="text-[#3A2E2B] font-mono relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: RUSTIC KRAFT PAPER & ARTISAN BAKERY
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-8 rounded-lg bg-[#F5EFE6] border-2 border-dashed border-[#8C6D53]/60 shadow-lg text-center">
        {/* Farmhouse Corner Stitch Marks */}
        <span className="absolute top-2 left-2 text-[#8C6D53] text-xs font-mono">✁</span>
        <span className="absolute top-2 right-2 text-[#8C6D53] text-xs font-mono">✁</span>

        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          {/* Wheat Stalk Crest */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 sm:w-16 border-b border-dashed border-[#8C6D53]" />
            <WheatStalkEmblem size={compact ? 36 : 44} color="#DDA15E" />
            <span className="h-px w-10 sm:w-16 border-b border-dashed border-[#8C6D53]" />
          </div>

          <span className="text-[9.5px] uppercase tracking-[0.4em] font-bold text-[#8C6D53]">
            [ ARTISAN BAKERY • KRAFT KITCHEN ]
          </span>

          <h1
            className={clsx(
              'font-black tracking-tight text-[#2B211E] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-[#6E543F] font-mono italic tracking-wide max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#8C6D53] font-mono tracking-wider flex items-center justify-center gap-2">
              <span>*</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>*</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#F5EFE6]/95 backdrop-blur-md py-2 px-2 rounded-full border border-dashed border-[#8C6D53] shadow-lg flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#8C6D53] text-[#FAF6F0] shadow-sm'
                : 'text-[#8C6D53] hover:bg-[#8C6D53]/15'
            )}
          >
            [All Items]
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-full transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#8C6D53] text-[#FAF6F0] font-bold shadow-sm'
                    : 'text-[#8C6D53] hover:bg-[#8C6D53]/15'
                )}
              >
                [{cat.name}] ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          KRAFT PAPER SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-lg bg-[#FAF6F0] border-2 border-dashed border-[#8C6D53]/40 shadow-md space-y-6"
          >
            {/* Category Header with Twine Stitched Divider */}
            <div className="text-center space-y-1">
              <h2
                className={clsx(
                  'font-bold font-mono text-[#8C6D53] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#EFE8DC] border border-[#8C6D53]/30',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                # {cat.name}
              </h2>
              <TwineDashedDivider color={sepiaColor} secondaryColor="#DDA15E" />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-dashed divide-[#8C6D53]/30">
              {cat.items.map((item) => {
                const displayPrice = item.price ? `₹${item.price}` : '';
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#EFE8DC]/50 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Order */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#8C6D53" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-[#2B211E] group-hover:text-[#8C6D53] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Rustic Kraft Twine Dashed Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dashed border-[#8C6D53]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {displayPrice && (
                          <span
                            className={clsx(
                              'font-bold text-[#8C6D53] tracking-wide font-mono whitespace-nowrap',
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
                            className="text-[10px] uppercase font-bold font-mono tracking-wider px-2 py-0.5 rounded bg-[#8C6D53] text-[#FAF6F0] hover:bg-[#70543e] transition-all"
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
                          <p className="text-[11px] sm:text-xs text-[#635147] leading-relaxed font-mono break-words">
                            {item.description}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#8C6D53]/15 text-[#8C6D53] border border-[#8C6D53]/30 font-bold">
                              Baker's Batch
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#8C6D53]/40 shadow-sm shrink-0">
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

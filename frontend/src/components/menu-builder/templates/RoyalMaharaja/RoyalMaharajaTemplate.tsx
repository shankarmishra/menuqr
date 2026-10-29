import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { PalaceCrownEmblem } from '../artwork/ArchesAndEmblems';
import { FiligreeDiamondDivider } from '../artwork/SectionDividers';
import { PalaceGoldFrame } from '../artwork/OrnamentalFrames';

export const RoyalMaharajaTemplate: React.FC<LayoutProps> = ({
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
  const goldColor = template.colors.heading || '#D4AF37';

  return (
    <div className="text-[#FAF3E0] font-serif relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: IMPERIAL PALACE BANQUET CREST
          ═══════════════════════════════════════════════════════════════════════ */}
      <PalaceGoldFrame goldColor={goldColor} className="bg-gradient-to-b from-[#2E0B20] via-[#1F0716] to-[#12030C] text-center">
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          {/* Royal Crown Crest & Symmetrical Wings or Client Logo */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            {restaurant.logo ? (
              <div className="w-12 h-12 rounded-full p-1 border-2 border-[#D4AF37] bg-[#12030C] overflow-hidden flex items-center justify-center shadow-lg">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain rounded-full" decoding="async" loading="lazy" />
              </div>
            ) : (
              <PalaceCrownEmblem size={compact ? 36 : 46} color={goldColor} />
            )}
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>

          <span className="text-[9.5px] uppercase tracking-[0.4em] font-bold text-[#D4AF37]">
            {restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} • ROYAL DINING` : 'Imperial Palace Dining • Darbar Hall'}
          </span>

          <h1
            className={clsx(
              'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] via-[#D4AF37] to-[#9E7311] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: template.typography.heading }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm italic text-[#FAF3E0]/80 font-serif tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              {restaurant.tagline}
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#D4AF37]/70 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>✦</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>✦</span>
            </div>
          )}
        </div>
      </PalaceGoldFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#16040F]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#D4AF37]/35 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#D4AF37] text-[#180912] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'text-[#D4AF37] hover:bg-[#D4AF37]/15'
            )}
          >
            ❖ All Dishes
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
                    ? 'bg-[#D4AF37] text-[#180912] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'text-[#D4AF37] hover:bg-[#D4AF37]/15'
                )}
              >
                ❖ {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BANQUET SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <PalaceGoldFrame
            key={cat.id}
            goldColor={goldColor}
            className="bg-gradient-to-br from-[#230C19]/95 via-[#180912]/98 to-[#10040B]/95"
          >
            {/* Category Header with Gold Cartouche */}
            <div className="text-center space-y-1 pb-4">
              <h2
                className={clsx(
                  'font-bold text-[#D4AF37] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#2D0D21] border border-[#D4AF37]/40 shadow-md',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: template.typography.heading }}
              >
                ❖ {cat.name} ❖
              </h2>
              <FiligreeDiamondDivider color={goldColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#D4AF37]/15">
              {cat.items.map((item, idx) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#D4AF37]/5 px-2 -mx-2 rounded transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Index + Diet + Name */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#D4AF37] flex items-center justify-center font-mono text-[9px] font-bold mt-0.5">
                          {idx + 1}
                        </span>

                        <div className="shrink-0 mt-1">
                          <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline flex-wrap gap-2">
                            <h3
                              className={clsx(
                                'font-bold text-[#FFF8EA] group-hover:text-[#D4AF37] transition-colors leading-snug break-words',
                                compact ? 'text-xs' : 'text-sm sm:text-base'
                              )}
                              style={{ fontFamily: template.typography.heading }}
                            >
                              {item.name}
                            </h3>
                            {item.isBestseller && (
                              <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                                ROYAL SIGNATURE
                              </span>
                            )}
                          </div>

                          {pricing.cleanDescription && (
                            <p
                              className={clsx(
                                'text-[#E0CCA8] mt-1 leading-relaxed font-serif italic max-w-xl',
                                compact ? 'text-[10px] line-clamp-2' : 'text-xs'
                              )}
                            >
                              {pricing.cleanDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Price + Add to cart + Optional Photo Thumbnail */}
                      <div className="shrink-0 flex items-center gap-3 ml-2 self-start mt-0.5">
                        {item.image && (
                          <div className="hidden sm:block w-14 h-14 rounded overflow-hidden border border-[#D4AF37]/50 shadow-md shrink-0">
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

                        <RenderItemPrices
                          item={item}
                          accentColor="#D4AF37"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-mono font-bold text-xs sm:text-sm text-[#D4AF37] tracking-wider px-2 py-0.5 bg-[#2B0E20] rounded border border-[#D4AF37]/40"
                          btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#180912] rounded hover:bg-[#e7c758] transition-colors cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PalaceGoldFrame>
        ))}
      </div>
    </div>
  );
};

export default RoyalMaharajaTemplate;

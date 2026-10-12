import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { BanarasiKalka } from '../artwork/ArchesAndEmblems';
import { BanarasiZariDivider } from '../artwork/SectionDividers';
import { BanarasiZariFrame } from '../artwork/OrnamentalFrames';

export const BanarasiGoldTemplate: React.FC<LayoutProps> = ({
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
  const zariGold = template.colors.accent || '#FFD700';
  const headingFont = template.typography.heading || "'Philosopher', serif";

  return (
    <div className="text-[#FFF9EF] font-serif relative z-10 space-y-6 max-w-5xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: VARANASI HANDLOOM SILK PALLU EMBROIDERY
          ═══════════════════════════════════════════════════════════════════════ */}
      <BanarasiZariFrame
        zariGold={zariGold}
        className="bg-gradient-to-b from-[#380E26] via-[#28081B] to-[#1E0514] text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          {/* Zari Kalka Medallion with Weave Flanks */}
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#FFD700]" />
            <BanarasiKalka size={compact ? 36 : 46} color={zariGold} />
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#FFD700]" />
          </div>

          <span className="text-[9.5px] font-mono uppercase tracking-[0.45em] font-bold text-[#FFD700]">
            ✦ Varanasi Silk Brocade & Pure Zari ✦
          </span>

          <h1
            className={clsx(
              'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF0] via-[#FFD700] to-[#C8963E] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm italic text-[#FFF9EF]/80 font-serif tracking-widest max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#FFD700]/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>✤</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>✤</span>
            </div>
          )}
        </div>
      </BanarasiZariFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#210617]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#FFD700]/40 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#FFD700] text-[#1E0514] shadow-[0_0_12px_rgba(255,215,0,0.45)]'
                : 'text-[#FFD700] hover:bg-[#FFD700]/15'
            )}
          >
            ✦ All Weaves
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
                    ? 'bg-[#FFD700] text-[#1E0514] font-bold shadow-[0_0_12px_rgba(255,215,0,0.45)]'
                    : 'text-[#FFD700] hover:bg-[#FFD700]/15'
                )}
              >
                ✦ {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          2-COLUMN SILK BROCADE SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className={clsx(compact ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6 items-start')}>
        {categories.map((cat) => (
          <BanarasiZariFrame
            key={cat.id}
            zariGold={zariGold}
            className="bg-gradient-to-br from-[#300C22]/95 via-[#230618]/98 to-[#180410]/95 h-full flex flex-col justify-between"
          >
            <div>
              {/* Category Header with Zari Cartouche */}
              <div className="text-center space-y-1 pb-3">
                <h2
                  className={clsx(
                    'font-bold text-[#FFD700] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#3D0E2B] border border-[#FFD700]/40 shadow-md',
                    compact ? 'text-xs' : 'text-sm sm:text-base'
                  )}
                  style={{ fontFamily: headingFont }}
                >
                  ✤ {cat.name} ✤
                </h2>
                <BanarasiZariDivider color={zariGold} />
              </div>

              {/* Dishes Listing */}
              <div className="space-y-3.5 divide-y divide-[#FFD700]/15">
                {cat.items.map((item) => {
                  const pricing = parseItemPricing(item);
                  return (
                    <div
                      key={item.id}
                      className="pt-3 first:pt-0 group hover:bg-[#FFD700]/5 px-2 -mx-2 rounded transition-colors"
                    >
                      {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2 min-w-0 flex-1">
                          <DietIndicator type={item.dietType} compact={compact} color="#FFD700" className="self-center shrink-0" />
                          <h3
                            className={clsx(
                              'font-bold text-[#FFF9EF] group-hover:text-[#FFD700] transition-colors break-words',
                              compact ? 'text-xs' : 'text-sm sm:text-base'
                            )}
                            style={{ fontFamily: headingFont }}
                          >
                            {item.name}
                          </h3>
                          {/* Banarasi Silk Dotted Gold Leader Line */}
                          <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#FFD700]/40 mx-2 self-baseline mb-1" />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <RenderItemPrices
                            item={item}
                            accentColor="#FFD700"
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="font-mono font-bold text-xs sm:text-sm text-[#FFD700] tracking-wide px-2 py-0.5 bg-[#3D0E2B] rounded border border-[#FFD700]/40"
                            btnStyle="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FFD700] text-[#1E0514] hover:bg-[#ffe347] transition-all cursor-pointer"
                            compact={compact}
                          />
                        </div>
                      </div>

                      {/* Second Row: Description & Optional Image Thumbnail */}
                      <div className="flex items-start justify-between gap-3 mt-1">
                        <div className="min-w-0 flex-1">
                          {pricing.cleanDescription && (
                            <p className="text-[11px] sm:text-xs text-[#E6D5C3] leading-relaxed font-serif italic break-words">
                              {pricing.cleanDescription}
                            </p>
                          )}

                          {item.isBestseller && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/40 font-bold">
                                ★ Zari Special
                              </span>
                            </div>
                          )}
                        </div>

                        {item.image && (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#FFD700]/40 shadow-md shrink-0">
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
          </BanarasiZariFrame>
        ))}
      </div>
    </div>
  );
};

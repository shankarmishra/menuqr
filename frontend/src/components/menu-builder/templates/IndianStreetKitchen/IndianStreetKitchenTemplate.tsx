import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { StreetStripeDivider } from '../artwork/SectionDividers';
import { StreetDhabaFrame } from '../artwork/OrnamentalFrames';

export const IndianStreetKitchenTemplate: React.FC<LayoutProps> = ({
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
  const yellowColor = '#FACC15';
  const redColor = '#DC2626';
  const headingFont = template.typography.heading || "'Bebas Neue', sans-serif";

  return (
    <div className="text-white font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: AUTHENTIC HIGHWAY DHABA & CHAT BAZAAR MARQUEE
          ═══════════════════════════════════════════════════════════════════════ */}
      <StreetDhabaFrame
        flameOrange={redColor}
        mustardYellow={yellowColor}
        className="bg-gradient-to-b from-[#222226] via-[#18181B] to-[#0F0F12] text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          {/* Marquee Flashes */}
          <div className="inline-flex items-center gap-2 bg-[#DC2626] text-white px-3 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-md">
            <span>🔥</span>
            <span>HIGHWAY DHABA SPECIAL • DESI TADKA</span>
            <span>🔥</span>
          </div>

          <h1
            className={clsx(
              'font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] via-[#FFF] to-[#FACC15] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm font-bold text-[#FACC15] tracking-wide max-w-xl mx-auto px-4">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-white/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span className="text-[#FACC15]">★</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span className="text-[#FACC15]">★</span>
            </div>
          )}
        </div>
      </StreetDhabaFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#18181B]/95 backdrop-blur-md py-2 px-2 rounded-full border-2 border-[#FACC15] shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full transition-all shrink-0',
              activeCategory === 'all'
                ? 'bg-[#FACC15] text-[#0F0F12] shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                : 'text-[#FACC15] hover:bg-[#FACC15]/20'
            )}
          >
            ★ All Items
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#FACC15] text-[#0F0F12] shadow-[0_0_12px_rgba(250,204,21,0.5)]'
                    : 'text-[#FACC15] hover:bg-[#FACC15]/20'
                )}
              >
                ★ {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          STREET DHABA SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <StreetDhabaFrame
            key={cat.id}
            flameOrange={redColor}
            mustardYellow={yellowColor}
            className="bg-[#1C1C20] shadow-2xl"
          >
            {/* Category Header with Dhaba Striped Accent */}
            <div className="text-center space-y-1 pb-4">
              <h2
                className={clsx(
                  'font-black text-[#0F0F12] uppercase tracking-wider inline-block px-4 py-1 rounded bg-[#FACC15] shadow-md',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ⚡ {cat.name} ⚡
              </h2>
              <StreetStripeDivider color={yellowColor} secondaryColor={redColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-white/10">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-white/5 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#FACC15" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-white group-hover:text-[#FACC15] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Dhaba Yellow Dashed Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dashed border-[#FACC15]/40 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RenderItemPrices
                          item={item}
                          accentColor="#FACC15"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-black text-[#FACC15] tracking-wide font-mono px-2 py-0.5 rounded bg-black/40 border border-[#FACC15]/40 whitespace-nowrap text-xs sm:text-sm"
                          btnStyle="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded bg-[#FACC15] text-[#0F0F12] hover:bg-yellow-300 transition-all shadow cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {pricing.cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-white/70 leading-snug font-sans break-words">
                            {pricing.cleanDescription}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#DC2626] text-white shadow-sm">
                              🔥 DHABA SPECIAL
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 border-[#FACC15] shadow-md shrink-0">
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
          </StreetDhabaFrame>
        ))}
      </div>
    </div>
  );
};

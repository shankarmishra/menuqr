import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { ChaiGlassEmblem } from '../artwork/ArchesAndEmblems';
import { IraniCheckerDivider } from '../artwork/SectionDividers';
import { VintageIraniFrame } from '../artwork/OrnamentalFrames';

export const BombayStreetTemplate: React.FC<LayoutProps> = ({
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
  const redColor = '#C82323';
  const amberColor = '#F26522';
  const headingFont = template.typography.heading || "'Anton', sans-serif";

  return (
    <div className="text-white font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: VINTAGE BOMBAY IRANI CAFE & CHAI CANTEEN
          ═══════════════════════════════════════════════════════════════════════ */}
      <VintageIraniFrame
        leopoldRed={redColor}
        className="bg-gradient-to-b from-[#241313] via-[#1A0D0D] to-[#120808] text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-2 py-3">
          {/* Chai Glass Crest or Client Logo */}
          <div className="flex items-center gap-3">
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#F26522]" />
            {restaurant.logo ? (
              <div className="w-12 h-12 rounded-full p-1 border-2 border-[#F26522] bg-[#1A0D0D] overflow-hidden flex items-center justify-center shadow-lg">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain rounded-full" />
              </div>
            ) : (
              <ChaiGlassEmblem size={compact ? 36 : 46} primary={redColor} accent={amberColor} />
            )}
            <span className="h-0.5 w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#F26522]" />
          </div>

          <span className="text-[9.5px] uppercase tracking-[0.45em] font-black text-[#F26522] font-mono">
            ★ {restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} • STREET DINING` : 'VINTAGE IRANI CHAI & BUN MASKA CANTEEN'} ★
          </span>

          <h1
            className={clsx(
              'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FFF] via-[#F26522] to-[#FFF] uppercase leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm font-bold text-[#FCD34D] tracking-wide max-w-xl mx-auto px-4">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-white/80 font-mono tracking-wider flex items-center justify-center gap-2">
              <span className="text-[#F26522]">●</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span className="text-[#F26522]">●</span>
            </div>
          )}
        </div>
      </VintageIraniFrame>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#1A0D0D]/95 backdrop-blur-md py-2 px-2 rounded-full border-2 border-[#C82323] shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-black uppercase tracking-wider rounded-full transition-all shrink-0',
              activeCategory === 'all'
                ? 'bg-[#C82323] text-white shadow-[0_0_12px_rgba(200,35,35,0.6)]'
                : 'text-[#FCD34D] hover:bg-[#C82323]/20'
            )}
          >
            ★ Sab Kuch (All)
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
                    ? 'bg-[#C82323] text-white shadow-[0_0_12px_rgba(200,35,35,0.6)]'
                    : 'text-[#FCD34D] hover:bg-[#C82323]/20'
                )}
              >
                ★ {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VINTAGE IRANI SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <VintageIraniFrame
            key={cat.id}
            leopoldRed={redColor}
            className="bg-[#1C0E0E] shadow-2xl"
          >
            {/* Category Header with Irani Checker Divider */}
            <div className="text-center space-y-1 pb-4">
              <h2
                className={clsx(
                  'font-black text-white uppercase tracking-wider inline-block px-4 py-1 rounded bg-[#C82323] shadow-md',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ☕ {cat.name} ☕
              </h2>
              <IraniCheckerDivider color={amberColor} secondaryColor={redColor} />
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
                        <DietIndicator type={item.dietType} compact={compact} color="#F26522" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-white group-hover:text-[#F26522] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Irani Cafe Orange Dashed Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dashed border-[#F26522]/40 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RenderItemPrices
                          item={item}
                          accentColor="#FCD34D"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-black text-[#FCD34D] tracking-wide font-mono px-2 py-0.5 rounded bg-black/50 border border-[#F26522]/40 whitespace-nowrap text-xs sm:text-sm"
                          btnStyle="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded bg-[#C82323] text-white hover:bg-red-700 transition-all shadow cursor-pointer"
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
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#C82323] text-white shadow-sm">
                              ★ IRANI SPECIAL
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 border-[#F26522] shadow-md shrink-0">
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
          </VintageIraniFrame>
        ))}
      </div>
    </div>
  );
};

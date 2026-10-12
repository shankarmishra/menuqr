import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { CoffeeBranchEmblem } from '../artwork/ArchesAndEmblems';
import { CoffeeBeanDivider } from '../artwork/SectionDividers';

export const CoffeeHouseTemplate: React.FC<LayoutProps> = ({
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
  const caramelColor = template.colors.accent || '#D4A373';
  const headingFont = template.typography.heading || "'Montserrat', sans-serif";

  return (
    <div className="text-[#F5EBE6] font-sans relative z-10 space-y-6 max-w-4xl mx-auto w-full">
      {/* ═══════════════════════════════════════════════════════════════════════
          COVER MASTHEAD: SPECIALTY COFFEE ROASTERY & BAKERY
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="relative p-6 sm:p-8 rounded-xl bg-gradient-to-b from-[#2E201B] via-[#211612] to-[#160E0B] border border-[#D4A373]/40 shadow-2xl text-center">
        <div className="flex flex-col items-center justify-center space-y-2 py-2">
          {/* Coffee Branch Crest */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#D4A373]" />
            <CoffeeBranchEmblem size={compact ? 36 : 44} woodColor={caramelColor} leafColor="#4A6B5D" />
            <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#D4A373]" />
          </div>

          <span className="text-[9.5px] uppercase tracking-[0.4em] font-mono font-bold text-[#D4A373]">
            ☕ Specialty Roastery & Artisanal Bakery ☕
          </span>

          <h1
            className={clsx(
              'font-black tracking-wide text-[#FEFAE0] leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
            )}
            style={{ fontFamily: headingFont }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="text-xs sm:text-sm text-[#D4A373]/90 font-serif italic tracking-wide max-w-xl mx-auto px-4 leading-relaxed">
              "{restaurant.tagline}"
            </p>
          )}

          {restaurant.address && (
            <div className="pt-1 text-[10px] sm:text-[11px] text-[#D4A373]/70 font-mono tracking-wider flex items-center justify-center gap-2">
              <span>☕</span>
              <span>{restaurant.address}</span>
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>☕</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          UNIVERSAL MENU SEARCH
          ═══════════════════════════════════════════════════════════════════════ */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (ALL VIEWPORTS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <div className="sticky top-2 z-30 bg-[#211612]/95 backdrop-blur-md py-2 px-2 rounded-full border border-[#D4A373]/40 shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs uppercase tracking-wider rounded-full transition-all shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#D4A373] text-[#160E0B] shadow-md'
                : 'text-[#D4A373] hover:bg-[#D4A373]/20'
            )}
          >
            All Brews
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs uppercase tracking-wider rounded-full transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#D4A373] text-[#160E0B] font-bold shadow-md'
                    : 'text-[#D4A373] hover:bg-[#D4A373]/20'
                )}
              >
                {cat.name} ({cat.items.length})
              </button>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          COFFEE HOUSE SPREAD CARDS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 sm:p-7 rounded-xl bg-[#211612] border border-[#D4A373]/35 shadow-xl space-y-6"
          >
            {/* Category Header with Coffee Bean Divider */}
            <div className="text-center space-y-1">
              <h2
                className={clsx(
                  'font-black text-[#FEFAE0] uppercase tracking-[0.2em] inline-block px-4 py-1 rounded bg-[#2E201B] border border-[#D4A373]/30',
                  compact ? 'text-xs' : 'text-sm sm:text-base'
                )}
                style={{ fontFamily: headingFont }}
              >
                ☕ {cat.name} ☕
              </h2>
              <CoffeeBeanDivider color={caramelColor} />
            </div>

            {/* Dishes Listing */}
            <div className="space-y-4 divide-y divide-[#D4A373]/15">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="pt-3 first:pt-0 group hover:bg-[#D4A373]/10 px-2 -mx-2 rounded transition-colors"
                  >
                    {/* Top Baseline Row: Diet + Name + Leader Line + Price + Add */}
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4A373" className="self-center shrink-0" />
                        <h3
                          className={clsx(
                            'font-bold text-[#FEFAE0] group-hover:text-[#D4A373] transition-colors break-words',
                            compact ? 'text-xs' : 'text-sm sm:text-base'
                          )}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                        {/* Espresso Caramel Dotted Leader Line */}
                        <span className="hidden sm:inline-block flex-1 border-b border-dotted border-[#D4A373]/35 mx-2 self-baseline mb-1" />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <RenderItemPrices
                          item={item}
                          accentColor="#D4A373"
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-bold text-[#D4A373] tracking-wide font-mono whitespace-nowrap text-xs sm:text-sm"
                          btnStyle="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#D4A373] text-[#160E0B] hover:bg-[#e2b78b] transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Second Row: Description & Optional Image Thumbnail */}
                    <div className="flex items-start justify-between gap-3 mt-1">
                      <div className="min-w-0 flex-1">
                        {pricing.cleanDescription && (
                          <p className="text-[11px] sm:text-xs text-[#E6D5C3] leading-relaxed font-sans break-words">
                            {pricing.cleanDescription}
                          </p>
                        )}

                        {item.isBestseller && (
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#D4A373]/20 text-[#D4A373] border border-[#D4A373]/40 font-bold">
                              Barista's Pick
                            </span>
                          </div>
                        )}
                      </div>

                      {item.image && (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border border-[#D4A373]/40 shadow-sm shrink-0">
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

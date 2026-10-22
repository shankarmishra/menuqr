// MENUQR Design Engine — Editorial Fine Dining Composition

import React from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { PalaceCrownEmblem, LotusMedallion, CoffeeBranchEmblem } from '../../templates/artwork/ArchesAndEmblems';
import { FiligreeDiamondDivider } from '../../templates/artwork/SectionDividers';

export const EditorialFineDiningComposition: React.FC<CompositionProps> = ({
  spec,
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
  const { colors, typography, header } = spec;

  const renderCrest = () => {
    if (header.crestType === 'crown') {
      return <PalaceCrownEmblem size={compact ? 32 : 44} color={colors.accent} />;
    }
    if (header.crestType === 'lotus') {
      return <LotusMedallion size={compact ? 30 : 40} primaryColor={colors.accent} secondaryColor={colors.border} />;
    }
    if (header.crestType === 'coffee') {
      return <CoffeeBranchEmblem size={compact ? 30 : 40} woodColor={colors.accent} leafColor={colors.heading} />;
    }
    return <span className="text-xl" style={{ color: colors.accent }}>✦</span>;
  };

  return (
    <div
      className="relative z-10 space-y-6 max-w-4xl mx-auto w-full transition-colors duration-300"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: FINE DINING EDITORIAL FRAME
          ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className={clsx(
          'relative p-6 sm:p-8 text-center transition-all shadow-xl',
          spec.decorations.borderRadius === 'xl' ? 'rounded-2xl' : spec.decorations.borderRadius === 'md' ? 'rounded-lg' : 'rounded-none'
        )}
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          boxShadow: spec.decorations.shadow === 'elevated' ? '0 20px 25px -5px rgba(0, 0, 0, 0.4)' : undefined,
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-3 py-2">
          {/* Restaurant Logo OR Thematic Crest */}
          {restaurant.logo && header.showLogo ? (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 p-1 bg-black/20 shadow-md mb-1" style={{ borderColor: colors.accent }}>
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover rounded-full" />
            </div>
          ) : header.decorativeElement !== 'none' ? (
            <div className="flex items-center gap-3">
              <span className="h-px w-8 sm:w-16 opacity-60" style={{ backgroundColor: colors.accent }} />
              {renderCrest()}
              <span className="h-px w-8 sm:w-16 opacity-60" style={{ backgroundColor: colors.accent }} />
            </div>
          ) : null}

          {/* Subtitle / Cuisine */}
          {restaurant.cuisine && (
            <span
              className="text-[9.5px] uppercase tracking-[0.35em] font-bold"
              style={{ color: colors.accent }}
            >
              {restaurant.cuisine}
            </span>
          )}

          {/* Restaurant Display Name */}
          <h1
            className={clsx(
              'tracking-wide leading-tight px-2 break-words max-w-2xl',
              compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl font-black'
            )}
            style={{
              fontFamily: typography.headingFont,
              color: colors.heading,
            }}
          >
            {restaurant.name}
          </h1>

          {/* Tagline */}
          {restaurant.tagline && (
            <p
              className="text-xs sm:text-sm italic tracking-wide max-w-xl mx-auto px-4 leading-relaxed opacity-90"
              style={{ color: colors.textMuted }}
            >
              "{restaurant.tagline}"
            </p>
          )}

          {/* Address & Contact Meta */}
          {(restaurant.address || restaurant.phone) && (
            <div
              className="pt-2 text-[10px] sm:text-[11px] font-mono tracking-wider flex flex-wrap items-center justify-center gap-2 opacity-80"
              style={{ color: colors.textMuted }}
            >
              <span>✦</span>
              {restaurant.address && <span>{restaurant.address}</span>}
              {restaurant.phone && <span>• {restaurant.phone}</span>}
              <span>✦</span>
            </div>
          )}
        </div>
      </header>

      {/* Universal Search Bar */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (EDITORIAL PILLS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <nav
          aria-label="Category navigation"
          className="sticky top-2 z-30 py-2 px-2 rounded-full shadow-xl flex items-center gap-1.5 overflow-x-auto scrollbar-none backdrop-blur-md"
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-3.5 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 font-bold cursor-pointer"
            style={{
              backgroundColor: activeCategory === 'all' ? colors.accent : 'transparent',
              color: activeCategory === 'all' ? colors.badgeText : colors.text,
            }}
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
                className="px-3 py-1 text-xs uppercase tracking-widest rounded-full transition-all shrink-0 whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: isActive ? colors.accent : 'transparent',
                  color: isActive ? colors.badgeText : colors.text,
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          CATEGORY SECTIONS & DISH LISTINGS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-8">
        {categories.map((cat, catIdx) => {
          const catNum = String(catIdx + 1).padStart(2, '0');
          return (
            <section
              key={cat.id}
              aria-label={cat.name}
              className={clsx(
                'p-5 sm:p-7 shadow-lg transition-all',
                spec.decorations.borderRadius === 'xl' ? 'rounded-2xl' : spec.decorations.borderRadius === 'md' ? 'rounded-lg' : 'rounded-none'
              )}
              style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Category Title Header */}
              <div className="space-y-2 mb-5">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs opacity-60">§ {catNum}</span>
                    <h2
                      className={clsx(
                        'uppercase tracking-widest leading-snug',
                        compact ? 'text-sm' : 'text-base sm:text-lg font-bold'
                      )}
                      style={{
                        fontFamily: typography.headingFont,
                        color: colors.heading,
                      }}
                    >
                      {cat.name}
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono opacity-60 uppercase">
                    {cat.items.length} items
                  </span>
                </div>
                <FiligreeDiamondDivider color={colors.accent} />
              </div>

              {/* Items List */}
              <div className="space-y-4 divide-y" style={{ borderColor: `${colors.border}40` }}>
                {cat.items.map((item, itemIdx) => {
                  const pricing = parseItemPricing(item);
                  const itemNum = `${catNum}.${String(itemIdx + 1).padStart(2, '0')}`;
                  return (
                    <article
                      key={item.id}
                      className="pt-3.5 first:pt-0 group px-2 -mx-2 rounded transition-colors"
                      style={{
                        ['--hover-bg' as any]: colors.surfaceAlt,
                      }}
                    >
                      {/* Top Baseline Row: Index + Diet + Name + Leader Line + Price */}
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono opacity-50 shrink-0 self-center">
                            {itemNum}
                          </span>
                          <DietIndicator type={item.dietType} compact={compact} className="self-center shrink-0" />
                          <h3
                            className={clsx(
                              'font-medium transition-colors break-words',
                              compact ? 'text-xs' : 'text-sm sm:text-base'
                            )}
                            style={{
                              fontFamily: typography.bodyFont,
                              color: colors.text,
                            }}
                          >
                            {item.name}
                          </h3>
                          {/* Dot / Hairline Leader Line */}
                          <span
                            className="hidden sm:inline-block flex-1 border-b border-dotted mx-2 self-baseline mb-1 opacity-30"
                            style={{ borderColor: colors.border }}
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <RenderItemPrices
                            item={item}
                            accentColor={colors.accent}
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="font-mono tracking-tight font-bold whitespace-nowrap text-xs sm:text-sm"
                            btnStyle="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer shadow-sm"
                            compact={compact}
                          />
                        </div>
                      </div>

                      {/* Description & Thumbnail */}
                      <div className="flex items-start justify-between gap-3 mt-1.5 pl-6 sm:pl-7">
                        <div className="min-w-0 flex-1">
                          {pricing.cleanDescription && (
                            <p
                              className="text-[11px] sm:text-xs leading-relaxed break-words opacity-80"
                              style={{ color: colors.textMuted }}
                            >
                              {pricing.cleanDescription}
                            </p>
                          )}
                          {item.isBestseller && (
                            <span
                              className="inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded mt-1 shadow-sm"
                              style={{
                                backgroundColor: colors.badgeBg,
                                color: colors.badgeText,
                              }}
                            >
                              ✦ House Special
                            </span>
                          )}
                        </div>

                        {item.image && (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 border shadow-sm" style={{ borderColor: colors.border }}>
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

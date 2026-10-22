// MENUQR Design Engine — Modern Image-Led Showcase Composition

import React from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../../templates/shared/RenderItemPrices';
import { Sparkles } from 'lucide-react';

export const ModernImageLedComposition: React.FC<CompositionProps> = ({
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
  const { colors, typography } = spec;

  return (
    <div
      className="relative z-10 space-y-6 max-w-5xl mx-auto w-full transition-colors duration-300"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: CONTEMPORARY SHOWCASE BANNER
          ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className="relative overflow-hidden p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-md"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {restaurant.logo ? (
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 p-1 shadow-md border"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
              }}
            >
              <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover rounded-xl" />
            </div>
          ) : (
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-md border text-2xl font-bold"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.accent,
                fontFamily: typography.headingFont,
              }}
            >
              {restaurant.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {restaurant.cuisine && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: colors.badgeBg,
                    color: colors.badgeText,
                  }}
                >
                  {restaurant.cuisine}
                </span>
              )}
              <span
                className="text-[10px] uppercase tracking-wider font-semibold opacity-70"
                style={{ color: colors.textMuted }}
              >
                Curated Culinary Showcase
              </span>
            </div>

            <h1
              className={clsx(
                'tracking-tight leading-tight break-words font-black',
                compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl'
              )}
              style={{
                fontFamily: typography.headingFont,
                color: colors.heading,
              }}
            >
              {restaurant.name}
            </h1>

            {restaurant.tagline && (
              <p
                className="text-xs sm:text-sm font-medium tracking-wide max-w-2xl line-clamp-2 opacity-90"
                style={{ color: colors.textMuted }}
              >
                {restaurant.tagline}
              </p>
            )}

            {(restaurant.address || restaurant.phone) && (
              <div
                className="pt-1 text-[11px] flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 opacity-75 font-mono"
                style={{ color: colors.textMuted }}
              >
                {restaurant.address && <span>📍 {restaurant.address}</span>}
                {restaurant.phone && <span>📞 {restaurant.phone}</span>}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Universal Search Bar */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (FLOATING GLASS CAPSULES)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <nav
          aria-label="Category navigation"
          className="sticky top-2 z-30 py-2.5 px-3 rounded-2xl shadow-xl flex items-center gap-2 overflow-x-auto scrollbar-none backdrop-blur-md"
          style={{
            backgroundColor: `${colors.surface}EE`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
            style={{
              backgroundColor: activeCategory === 'all' ? colors.accent : 'transparent',
              color: activeCategory === 'all' ? colors.badgeText : colors.text,
            }}
          >
            All Items
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shrink-0 whitespace-nowrap cursor-pointer hover:opacity-100"
                style={{
                  backgroundColor: isActive ? colors.accent : colors.surfaceAlt,
                  color: isActive ? colors.badgeText : colors.text,
                  border: `1px solid ${isActive ? colors.accent : colors.border}`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          IMAGE-FORWARD DISH GRID
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat.id} aria-label={cat.name} className="space-y-4">
            {/* Category Header */}
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 rounded-full" style={{ backgroundColor: colors.accent }} />
                <h2
                  className={clsx(
                    'font-bold tracking-tight',
                    compact ? 'text-base' : 'text-lg sm:text-xl'
                  )}
                  style={{
                    fontFamily: typography.headingFont,
                    color: colors.heading,
                  }}
                >
                  {cat.name}
                </h2>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: colors.surfaceAlt, color: colors.textMuted }}
              >
                {cat.items.length} dishes
              </span>
            </div>

            {/* 2-Column Responsive Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                const hasImage = Boolean(item.image);

                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl overflow-hidden shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl border"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    {/* Top Media Container if Image Exists */}
                    {hasImage ? (
                      <div className="relative w-full aspect-[16/9] bg-black/10 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                          <DietIndicator type={item.dietType} compact color="#FFFFFF" />
                        </div>
                        {item.isBestseller && (
                          <div
                            className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md"
                            style={{
                              backgroundColor: colors.badgeBg,
                              color: colors.badgeText,
                            }}
                          >
                            <Sparkles size={11} /> Featured
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Minimal Decorative Accent Top Bar for items without images */
                      <div className="h-1.5 w-full" style={{ backgroundColor: colors.accent }} />
                    )}

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {!hasImage && <DietIndicator type={item.dietType} compact className="shrink-0" />}
                            <h3
                              className="font-bold text-sm sm:text-base leading-snug break-words"
                              style={{
                                fontFamily: typography.bodyFont,
                                color: colors.text,
                              }}
                            >
                              {item.name}
                            </h3>
                          </div>
                        </div>

                        {pricing.cleanDescription && (
                          <p
                            className="text-xs leading-relaxed line-clamp-2 opacity-80"
                            style={{ color: colors.textMuted }}
                          >
                            {pricing.cleanDescription}
                          </p>
                        )}
                      </div>

                      {/* Card Footer: Price & Add to Cart */}
                      <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: `${colors.border}40` }}>
                        <div className="flex items-center gap-2">
                          <RenderItemPrices
                            item={item}
                            accentColor={colors.accent}
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="font-bold text-sm sm:text-base font-mono tracking-tight"
                            btnStyle="text-xs font-bold px-3 py-1 rounded-xl shadow-md transition-all cursor-pointer"
                            compact={compact}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

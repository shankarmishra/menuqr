// MENUQR Design Engine — Compact Typographic Bistro Composition

import React from 'react';
import clsx from 'clsx';
import type { CompositionProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../../templates/shared/RenderItemPrices';

export const CompactBistroComposition: React.FC<CompositionProps> = ({
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
      className="relative z-10 space-y-4 max-w-5xl mx-auto w-full transition-colors duration-300"
      style={{
        color: colors.text,
        fontFamily: typography.bodyFont,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          MASTHEAD: ULTRA-COMPACT BISTRO BAR
          ═══════════════════════════════════════════════════════════════════════ */}
      <header
        className="p-4 sm:p-5 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <div className="flex items-center gap-3 text-center sm:text-left">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="w-12 h-12 rounded-lg object-cover shrink-0 border"
              style={{ borderColor: colors.border }}
              decoding="async"
              loading="lazy"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-black text-lg border"
              style={{
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                color: colors.accent,
              }}
            >
              {restaurant.name.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1
                className={clsx(
                  'font-black tracking-tight leading-none break-words',
                  compact ? 'text-lg' : 'text-xl sm:text-2xl'
                )}
                style={{
                  fontFamily: typography.headingFont,
                  color: colors.heading,
                }}
              >
                {restaurant.name}
              </h1>
              {restaurant.cuisine && (
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: colors.badgeBg,
                    color: colors.badgeText,
                  }}
                >
                  {restaurant.cuisine}
                </span>
              )}
            </div>

            {restaurant.tagline && (
              <p
                className="text-xs font-medium mt-1 opacity-80 line-clamp-1"
                style={{ color: colors.textMuted }}
              >
                {restaurant.tagline}
              </p>
            )}
          </div>
        </div>

        {(restaurant.address || restaurant.phone) && (
          <div
            className="text-[10px] font-mono opacity-70 flex flex-wrap items-center justify-center gap-2 text-right"
            style={{ color: colors.textMuted }}
          >
            {restaurant.address && <span>{restaurant.address}</span>}
            {restaurant.phone && <span>• {restaurant.phone}</span>}
          </div>
        )}
      </header>

      {/* Universal Search Bar */}
      {searchBar}

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY CATEGORY FILTER (SLIM CHIPS)
          ═══════════════════════════════════════════════════════════════════════ */}
      {rawCategories.length > 1 && (
        <nav
          aria-label="Category navigation"
          className="sticky top-2 z-30 py-1.5 px-2 rounded-xl shadow-md flex items-center gap-1.5 overflow-x-auto scrollbar-none backdrop-blur-md"
          style={{
            backgroundColor: `${colors.surface}F0`,
            border: `1px solid ${colors.border}`,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all shrink-0 cursor-pointer"
            style={{
              backgroundColor: activeCategory === 'all' ? colors.accent : 'transparent',
              color: activeCategory === 'all' ? colors.badgeText : colors.text,
            }}
          >
            All
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all shrink-0 whitespace-nowrap cursor-pointer hover:opacity-100"
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
          HIGH-DENSITY CATEGORY SECTIONS (2-COL DESKTOP SPLIT)
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <section
            key={cat.id}
            aria-label={cat.name}
            className="p-3.5 sm:p-4 rounded-xl border shadow-sm"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {/* Category Subhead */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b" style={{ borderColor: `${colors.border}60` }}>
              <h2
                className="font-bold text-xs sm:text-sm uppercase tracking-wider"
                style={{
                  fontFamily: typography.headingFont,
                  color: colors.heading,
                }}
              >
                {cat.name}
              </h2>
              <span className="font-mono text-[10px] opacity-60">
                {cat.items.length} items
              </span>
            </div>

            {/* High-Density 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);

                return (
                  <article
                    key={item.id}
                    className="py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-baseline justify-between gap-2 border-b md:border-b-0 last:border-b-0"
                    style={{ borderColor: `${colors.border}30` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <DietIndicator type={item.dietType} compact className="shrink-0" />
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover shrink-0 border"
                            style={{ borderColor: colors.border }}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <h3
                          className="font-semibold text-xs sm:text-sm truncate"
                          style={{ color: colors.text }}
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        {item.isBestseller && (
                          <span
                            className="text-[8px] font-bold uppercase px-1 rounded shrink-0"
                            style={{
                              backgroundColor: colors.badgeBg,
                              color: colors.badgeText,
                            }}
                          >
                            Hot
                          </span>
                        )}
                      </div>

                      {pricing.cleanDescription && (
                        <p
                          className="text-[10px] sm:text-[11px] leading-tight line-clamp-1 opacity-70 mt-0.5 pl-4"
                          style={{ color: colors.textMuted }}
                        >
                          {pricing.cleanDescription}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <RenderItemPrices
                        item={item}
                        accentColor={colors.accent}
                        isPremium={isPremium}
                        onAddToCart={onAddToCart}
                        priceClassName="font-mono font-bold text-xs sm:text-sm tracking-tight"
                        btnStyle="text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm cursor-pointer"
                        compact={true}
                      />
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

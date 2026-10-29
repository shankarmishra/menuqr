import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Minimal editorial hairline rule
const EditorialRule = ({ color = '#E8D5B0' }: { color?: string }) => (
  <div className="flex items-center gap-3 w-full my-2">
    <div className="flex-1 h-px bg-white/10" />
    <span className="text-[8px] uppercase tracking-[0.4em] font-mono" style={{ color: `${color}80` }}>
      N° 10
    </span>
    <div className="flex-1 h-px bg-white/10" />
  </div>
);

export const Studio10Template: React.FC<LayoutProps> = ({
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
  const accentColor = template.colors.accent || '#E8D5B0';
  const headingFont = template.typography.heading || "'Montserrat', sans-serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-8"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD: Monochromatic Art Director's Grid ── */}
      <div
        className={clsx(
          'relative overflow-hidden border',
          compact ? 'p-6' : 'p-8 sm:p-12'
        )}
        style={{
          background: '#161616',
          borderColor: 'rgba(240, 237, 232, 0.12)',
        }}
      >
        {/* Subtle grid line overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `linear-gradient(#F0EDE8 1px, transparent 1px), linear-gradient(90deg, #F0EDE8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
              <p
                className="text-[9px] uppercase tracking-[0.6em] font-mono text-zinc-400"
              >
                {restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} · TASTING EDITORIAL` : 'STUDIO 10 · TASTING EDITORIAL'}
              </p>
            </div>

            <h1
              className={clsx('tracking-tight font-extralight uppercase leading-tight break-words text-white', compact ? 'text-3xl' : 'text-4xl sm:text-5xl md:text-6xl')}
              style={{ fontFamily: headingFont }}
            >
              {restaurant.name}
            </h1>

            {restaurant.tagline && (
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
                {restaurant.tagline}
              </p>
            )}

            {(restaurant.address || restaurant.phone) && (
              <p className="text-[10px] tracking-widest text-zinc-500 font-mono">
                {restaurant.address}{restaurant.phone && ` — ${restaurant.phone}`}
              </p>
            )}
          </div>

          {/* Logo or geometric badge */}
          <div className="shrink-0 flex items-center md:flex-col gap-3">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className={clsx('object-cover border shrink-0 grayscale hover:grayscale-0 transition-all duration-500', compact ? 'w-14 h-14' : 'w-20 h-20')}
                style={{ borderColor: 'rgba(240, 237, 232, 0.2)' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div
                className={clsx('border flex items-center justify-center font-mono text-xs', compact ? 'w-12 h-12' : 'w-16 h-16')}
                style={{ borderColor: accentColor, color: accentColor }}
              >
                S-10
              </div>
            )}
            <span className="text-[9px] uppercase tracking-[0.3em] font-mono text-zinc-500">
              VOL. 2026
            </span>
          </div>
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY BAR: Minimalist Monospace Index ── */}
      {rawCategories.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] shrink-0 transition-all"
            style={{
              color: activeCategory === 'all' ? '#111111' : '#A1A1AA',
              background: activeCategory === 'all' ? accentColor : 'transparent',
            }}
          >
            [ALL]
          </button>
          {rawCategories.map((cat, idx) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.2em] shrink-0 whitespace-nowrap transition-all"
                style={{
                  color: isActive ? '#111111' : '#A1A1AA',
                  background: isActive ? accentColor : 'transparent',
                }}
              >
                [{String(idx + 1).padStart(2, '0')} {cat.name}]
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU SECTIONS ── */}
      <div className="space-y-12">
        {categories.map((cat, catIdx) => (
          <section key={cat.id}>
            <div className="mb-6">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-zinc-500">
                    #{String(catIdx + 1).padStart(2, '0')}
                  </span>
                  <h2
                    className={clsx('uppercase tracking-widest font-light text-white', compact ? 'text-lg' : 'text-xl sm:text-2xl')}
                    style={{ fontFamily: headingFont }}
                  >
                    {cat.name}
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 tracking-widest">
                  {cat.items.length} SELECTIONS
                </span>
              </div>
              <EditorialRule color={accentColor} />
            </div>

            {/* Michelin-style layout */}
            <div className="space-y-6">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group border-b border-zinc-900 pb-5 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} className="mt-1 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3
                              className={clsx('tracking-wide text-zinc-100 font-normal break-words', compact ? 'text-sm' : 'text-base')}
                              style={{ fontFamily: headingFont }}
                            >
                              {item.name}
                            </h3>
                            {item.isBestseller && (
                              <span
                                className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 border"
                                style={{ borderColor: `${accentColor}40`, color: accentColor }}
                              >
                                ESSENTIAL
                              </span>
                            )}
                          </div>
                          {pricing.cleanDescription && (
                            <p className="mt-1 text-xs text-zinc-400 font-light leading-relaxed max-w-2xl">
                              {pricing.cleanDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pl-6 sm:pl-0">
                        <RenderItemPrices
                          item={item}
                          accentColor={accentColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-mono text-zinc-200 whitespace-nowrap"
                          btnStyle="text-[10px] px-3 py-1 font-mono uppercase border border-zinc-700 hover:border-zinc-400 text-zinc-200 transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Tight crop editorial food photo */}
                    {item.image && (
                      <div className="mt-3 ml-6 max-w-sm h-28 overflow-hidden rounded-sm border border-zinc-800">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="py-8 text-center border-t border-zinc-800">
        <p className="text-[9px] uppercase tracking-[0.5em] font-mono text-zinc-500">
          STUDIO 10 · {restaurant.name} · TASTING EDITORIAL
        </p>
      </div>
    </div>
  );
};

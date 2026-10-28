import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

export const SmashClubTemplate: React.FC<LayoutProps> = ({
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
  const redColor = template.colors.accent || '#FF3B1A';
  const headingFont = template.typography.heading || "'Bebas Neue', Impact, sans-serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-5"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD — full-bleed bold header ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: template.colors.surface, borderBottom: `4px solid ${redColor}` }}
      >
        {/* Background texture diagonal stripes */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, ${redColor} 0px, ${redColor} 2px, transparent 2px, transparent 20px)`,
          }}
        />

        <div className={clsx('relative flex items-center justify-between', compact ? 'p-4' : 'p-5 sm:p-8')}>
          <div>
            {/* Restaurant name — massive Bebas */}
            <h1
              className={clsx('uppercase leading-none break-words tracking-wide', compact ? 'text-3xl' : 'text-4xl sm:text-5xl md:text-6xl')}
              style={{ fontFamily: headingFont, color: template.colors.text }}
            >
              {restaurant.name}
            </h1>

            {restaurant.tagline && (
              <p
                className={clsx('mt-1 uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ color: redColor, fontFamily: headingFont, fontSize: compact ? '11px' : undefined }}
              >
                {restaurant.tagline}
              </p>
            )}

            {(restaurant.address || restaurant.phone) && (
              <p className="mt-1 text-[10px]" style={{ color: `${template.colors.text}60` }}>
                {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
              </p>
            )}
          </div>

          {/* Logo or red badge */}
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-xl object-cover border-2 shrink-0', compact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20')}
              style={{ borderColor: redColor }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div
              className={clsx('rounded-xl flex items-center justify-center shrink-0', compact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20')}
              style={{ background: redColor }}
            >
              <span
                className="font-bold text-white text-center leading-tight uppercase"
                style={{ fontFamily: headingFont, fontSize: compact ? '18px' : '24px' }}
              >
                {restaurant.name.slice(0, 2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY FILTERS — brutal tab strip ── */}
      {rawCategories.length > 1 && (
        <div
          className="flex gap-0 overflow-x-auto scrollbar-none border-b-2"
          style={{ borderColor: `${redColor}40` }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0 transition-all"
            style={{
              background: activeCategory === 'all' ? redColor : 'transparent',
              color: activeCategory === 'all' ? '#fff' : `${template.colors.text}70`,
              fontFamily: headingFont,
              fontSize: '14px',
              letterSpacing: '0.1em',
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
                className="px-5 py-3 text-xs font-bold uppercase tracking-wider shrink-0 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? redColor : 'transparent',
                  color: isActive ? '#fff' : `${template.colors.text}70`,
                  fontFamily: headingFont,
                  fontSize: '14px',
                  letterSpacing: '0.1em',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU CONTENT — bold card grid ── */}
      <div className="space-y-8 px-1">
        {categories.map((cat) => (
          <div key={cat.id}>
            {/* Category heading */}
            <div className="mb-4 flex items-center gap-3">
              <div className="w-1 h-8" style={{ background: redColor }} />
              <h2
                className={clsx('uppercase', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')}
                style={{ fontFamily: headingFont, color: template.colors.heading }}
              >
                {cat.name}
              </h2>
            </div>

            {/* Card grid */}
            <div className={clsx('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl"
                    style={{
                      background: template.colors.surface,
                      border: `1px solid ${redColor}20`,
                    }}
                  >
                    {/* Bestseller badge */}
                    {item.isBestseller && (
                      <div
                        className="absolute top-0 right-0 z-10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: redColor, color: '#fff', fontFamily: headingFont }}
                      >
                        SMASH HIT
                      </div>
                    )}

                    {/* Food photo */}
                    {item.image ? (
                      <div className="relative overflow-hidden" style={{ height: compact ? '100px' : '140px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,15,15,0.8) 0%, transparent 60%)' }} />
                      </div>
                    ) : (
                      <div
                        className="flex items-center justify-center"
                        style={{ height: compact ? '60px' : '80px', background: `${redColor}08` }}
                      >
                        <span style={{ color: `${redColor}30`, fontFamily: headingFont, fontSize: '32px' }}>
                          {item.name.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className={clsx('p-3', compact && 'p-2.5')}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <DietIndicator type={item.dietType} compact={true} />
                            <h3
                              className={clsx('break-words uppercase tracking-wide', compact ? 'text-sm' : 'text-base sm:text-lg')}
                              style={{ fontFamily: headingFont, color: template.colors.text }}
                            >
                              {item.name}
                            </h3>
                          </div>
                          {pricing.cleanDescription && (
                            <p className="mt-1 text-[11px] line-clamp-2" style={{ color: `${template.colors.text}60` }}>
                              {pricing.cleanDescription}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0">
                          <RenderItemPrices
                            item={item}
                            accentColor={redColor}
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="text-sm font-bold whitespace-nowrap"
                            btnStyle="text-[10px] px-2.5 py-1.5 rounded font-bold uppercase tracking-wider transition-all cursor-pointer"
                            compact={compact}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="py-4 text-center border-t-2" style={{ borderColor: redColor }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: headingFont, color: redColor }}>
          {restaurant.name} · Order Up
        </p>
      </div>
    </div>
  );
};

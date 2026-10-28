import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

const EmberFlameIcon = () => (
  <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
    <path
      d="M10 0 C8 5 3 8 4 14 C5 18 8 20 10 24 C12 20 15 18 16 14 C17 8 12 5 10 0Z"
      fill="url(#flame-grad)"
    />
    <path
      d="M10 8 C9 11 7 12 7.5 15 C8 17 9 18 10 20 C11 18 12 17 12.5 15 C13 12 11 11 10 8Z"
      fill="rgba(255,255,255,0.4)"
    />
    <defs>
      <linearGradient id="flame-grad" x1="10" y1="0" x2="10" y2="24" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5A623" />
        <stop offset="60%" stopColor="#E84040" />
        <stop offset="100%" stopColor="#C0703A" />
      </linearGradient>
    </defs>
  </svg>
);

const EmberDivider = ({ color = '#F5A623' }: { color?: string }) => (
  <div className="flex items-center gap-3 w-full py-1">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}60)` }} />
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" fill={color} fillOpacity="0.6" />
      <circle cx="8" cy="8" r="1.5" fill={color} />
    </svg>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}60)` }} />
  </div>
);

export const EmberTemplate: React.FC<LayoutProps> = ({
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
  const amberColor = template.colors.accent || '#F5A623';
  const headingFont = template.typography.heading || "'Cormorant Garamond', serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-5"
      style={{ color: template.colors.text, fontFamily: template.typography.body }}
    >
      {/* ── MASTHEAD ── */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(160deg, #1A1209 0%, #0D0A08 50%, #261208 100%)`,
          border: `1px solid ${amberColor}30`,
        }}
      >
        {/* Ember glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(245,166,35,0.12) 0%, transparent 70%)',
          }}
        />

        <div className={clsx('relative flex flex-col items-center text-center py-8 px-6', compact && 'py-5 px-4')}>
          {/* Flame icon row */}
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, transparent, ${amberColor})` }} />
            <EmberFlameIcon />
            <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to left, transparent, ${amberColor})` }} />
          </div>

          <p
            className="text-[9px] uppercase tracking-[0.5em] font-semibold mb-2"
            style={{ color: amberColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Signature Dining · Tandoor & Fire
          </p>

          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-full object-cover border-2 mb-3 shadow-lg', compact ? 'w-10 h-10' : 'w-14 h-14')}
              style={{ borderColor: `${amberColor}50` }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          <h1
            className={clsx('font-light tracking-widest uppercase leading-tight break-words max-w-lg px-2', compact ? 'text-xl' : 'text-2xl sm:text-3xl md:text-4xl')}
            style={{ fontFamily: headingFont, color: template.colors.heading }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="mt-2 text-xs italic tracking-wide" style={{ color: `${amberColor}CC`, fontFamily: headingFont }}>
              "{restaurant.tagline}"
            </p>
          )}

          {(restaurant.address || restaurant.phone) && (
            <p className="mt-2 text-[10px] tracking-widest" style={{ color: `${template.colors.text}70`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
            </p>
          )}
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY TABS ── */}
      {rawCategories.length > 1 && (
        <div
          className="sticky top-2 z-30 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-3 rounded-xl backdrop-blur-md shadow-xl"
          style={{ background: `${template.colors.bg}F0`, border: `1px solid ${amberColor}30` }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx('px-3.5 py-1.5 rounded-lg text-[11px] uppercase tracking-widest shrink-0 transition-all font-semibold', activeCategory === 'all' ? 'text-[#0D0A08]' : 'text-opacity-70')}
            style={{
              background: activeCategory === 'all' ? amberColor : 'transparent',
              color: activeCategory === 'all' ? '#0D0A08' : `${amberColor}90`,
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
                className="px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-widest shrink-0 whitespace-nowrap transition-all font-semibold"
                style={{
                  background: isActive ? amberColor : 'transparent',
                  color: isActive ? '#0D0A08' : `${amberColor}80`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU CONTENT ── */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id}>
            {/* Category Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 rounded-full" style={{ background: amberColor }} />
                <h2
                  className={clsx('uppercase tracking-[0.2em]', compact ? 'text-sm' : 'text-base sm:text-lg')}
                  style={{ fontFamily: headingFont, color: amberColor }}
                >
                  {cat.name}
                </h2>
                <span className="text-[10px] tracking-widest" style={{ color: `${template.colors.text}50` }}>
                  {cat.items.length} dishes
                </span>
              </div>
              <EmberDivider color={amberColor} />
            </div>

            {/* Items — magazine card grid */}
            <div className={clsx('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                    style={{ background: template.colors.surface, border: `1px solid ${amberColor}20` }}
                  >
                    {/* Bestseller flame badge */}
                    {item.isBestseller && (
                      <div
                        className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: amberColor, color: '#0D0A08' }}
                      >
                        🔥 Signature
                      </div>
                    )}

                    {/* Image */}
                    {item.image && (
                      <div className="relative w-full overflow-hidden" style={{ height: compact ? '100px' : '140px' }}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: 'linear-gradient(to top, rgba(13,10,8,0.7) 0%, transparent 60%)' }}
                        />
                      </div>
                    )}

                    <div className={clsx('p-4', compact && 'p-3')}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <DietIndicator type={item.dietType} compact={compact} className="mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <h3
                              className={clsx('font-medium leading-tight break-words', compact ? 'text-sm' : 'text-base')}
                              style={{ fontFamily: headingFont, color: template.colors.text }}
                            >
                              {item.name}
                            </h3>
                            {pricing.cleanDescription && (
                              <p className="mt-1 text-[11px] leading-relaxed line-clamp-2" style={{ color: `${template.colors.text}70` }}>
                                {pricing.cleanDescription}
                              </p>
                            )}
                          </div>
                        </div>
                        <RenderItemPrices
                          item={item}
                          accentColor={amberColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="font-semibold text-sm whitespace-nowrap"
                          btnStyle="text-[10px] px-2 py-1 rounded-lg font-bold uppercase tracking-wide transition-all cursor-pointer"
                          compact={compact}
                        />
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
      <div className="text-center py-4">
        <p className="text-[10px] tracking-widest uppercase" style={{ color: `${amberColor}50` }}>
          ✦ {restaurant.name} ✦
        </p>
      </div>
    </div>
  );
};

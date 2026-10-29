import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Platinum hairline divider — Parisian fine dining
const MaisonRule = ({ color = '#B8944A' }: { color?: string }) => (
  <div className="flex items-center gap-4 w-full py-1.5">
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, transparent, ${color}80, ${color})` }} />
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill={color} fillOpacity="0.5" />
    </svg>
    <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, transparent, ${color}80, ${color})` }} />
  </div>
);

export const MaisonTemplate: React.FC<LayoutProps> = ({
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
  const goldColor = template.colors.accent || '#B8944A';
  const headingFont = template.typography.heading || "'Bodoni Moda', serif";
  const bodyFont = template.typography.body || "'Lato', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-3xl mx-auto space-y-8"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD ── */}
      <div className={clsx('text-center relative', compact ? 'pt-6 pb-4 px-6' : 'pt-10 pb-6 px-8')}>
        {/* Top corner marks */}
        <span className="absolute top-3 left-3 w-4 h-4 border-t border-l" style={{ borderColor: `${goldColor}60` }} />
        <span className="absolute top-3 right-3 w-4 h-4 border-t border-r" style={{ borderColor: `${goldColor}60` }} />

        {/* Subtitle line */}
        <p
          className="text-[9px] uppercase tracking-[0.65em] mb-3 font-medium"
          style={{ color: goldColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {restaurant.cuisine ? `${restaurant.cuisine} • Fine Dining` : 'Haute Cuisine'}
        </p>

        {/* Thin gold rule */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px w-16" style={{ background: goldColor }} />
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-full object-cover border', compact ? 'w-9 h-9' : 'w-12 h-12')}
              style={{ borderColor: `${goldColor}50` }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div
              className={clsx('rounded-full border flex items-center justify-center', compact ? 'w-9 h-9' : 'w-12 h-12')}
              style={{ borderColor: goldColor, background: `${goldColor}15` }}
            >
              <span className="text-sm font-bold" style={{ color: goldColor, fontFamily: headingFont }}>
                {restaurant.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="h-px w-16" style={{ background: goldColor }} />
        </div>

        <h1
          className={clsx('tracking-[0.12em] uppercase leading-tight break-words max-w-lg mx-auto px-2', compact ? 'text-xl' : 'text-2xl sm:text-4xl md:text-5xl')}
          style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
        >
          {restaurant.name}
        </h1>

        {restaurant.tagline && (
          <p
            className="mt-3 text-xs italic tracking-[0.08em] leading-relaxed"
            style={{ color: `${goldColor}CC`, fontFamily: headingFont }}
          >
            {restaurant.tagline}
          </p>
        )}

        {(restaurant.address || restaurant.phone) && (
          <p className="mt-3 text-[10px] tracking-widest" style={{ color: `${template.colors.secondary}` }}>
            {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
          </p>
        )}

        {/* Bottom corner marks */}
        <span className="absolute bottom-2 left-3 w-4 h-4 border-b border-l" style={{ borderColor: `${goldColor}60` }} />
        <span className="absolute bottom-2 right-3 w-4 h-4 border-b border-r" style={{ borderColor: `${goldColor}60` }} />
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── COURSE NAVIGATION ── */}
      {rawCategories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 px-4">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-sm"
            style={{
              color: activeCategory === 'all' ? template.colors.bg : goldColor,
              background: activeCategory === 'all' ? goldColor : 'transparent',
              border: `1px solid ${goldColor}50`,
            }}
          >
            All Courses
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-sm whitespace-nowrap"
                style={{
                  color: isActive ? template.colors.bg : goldColor,
                  background: isActive ? goldColor : 'transparent',
                  border: `1px solid ${goldColor}50`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU BODY ── */}
      <div className={clsx('space-y-12', compact && 'space-y-8')}>
        {categories.map((cat) => (
          <section key={cat.id} className="px-6 sm:px-10">
            {/* Category heading */}
            <div className="text-center mb-6">
              <h2
                className={clsx('uppercase tracking-[0.3em]', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: headingFont, color: goldColor, fontWeight: 400 }}
              >
                {cat.name}
              </h2>
              <MaisonRule color={goldColor} />
            </div>

            {/* Michelin-style list items */}
            <div className="space-y-5">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div key={item.id} className="group">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2 min-w-0 flex-1">
                        <DietIndicator type={item.dietType} compact={compact} className="self-center shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <h3
                              className={clsx('break-words tracking-wide', compact ? 'text-sm' : 'text-base')}
                              style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
                            >
                              {item.name}
                            </h3>
                            {item.isBestseller && (
                              <span
                                className="shrink-0 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded border"
                                style={{ color: goldColor, borderColor: `${goldColor}50` }}
                              >
                                Maison
                              </span>
                            )}
                          </div>
                          {pricing.cleanDescription && (
                            <p className="mt-0.5 text-[11px] italic leading-relaxed" style={{ color: template.colors.secondary }}>
                              {pricing.cleanDescription}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Leader dots + price */}
                      <div className="flex items-baseline gap-2 shrink-0">
                        <span
                          className="hidden sm:block text-[#B8944A]/20 text-xs tracking-widest"
                          style={{ letterSpacing: '0.2em' }}
                        >
                          · · · · ·
                        </span>
                        <RenderItemPrices
                          item={item}
                          accentColor={goldColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-medium whitespace-nowrap"
                          btnStyle="text-[10px] px-2.5 py-1 rounded border font-semibold uppercase tracking-wider transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                    </div>

                    {/* Optional food photo — small thumbnail */}
                    {item.image && !compact && (
                      <div className="mt-2 ml-6">
                        <div className="w-full max-w-xs h-24 rounded overflow-hidden border" style={{ borderColor: `${goldColor}15` }}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 hover:opacity-100"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                          />
                        </div>
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
      <div className="text-center pb-8">
        <MaisonRule color={goldColor} />
        <p className="text-[9px] uppercase tracking-[0.5em] mt-3" style={{ color: `${goldColor}60` }}>
          {restaurant.name}
        </p>
      </div>
    </div>
  );
};

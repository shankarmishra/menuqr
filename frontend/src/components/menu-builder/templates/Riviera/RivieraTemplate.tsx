import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Wave SVG decoration
const CoastalWave = ({ color = '#F0C674', opacity = 0.4 }: { color?: string; opacity?: number }) => (
  <svg width="100%" height="20" viewBox="0 0 300 20" preserveAspectRatio="none" fill="none">
    <path
      d="M0 10 Q37.5 0 75 10 Q112.5 20 150 10 Q187.5 0 225 10 Q262.5 20 300 10"
      stroke={color}
      strokeWidth="1.5"
      strokeOpacity={opacity}
      fill="none"
    />
    <path
      d="M0 14 Q37.5 4 75 14 Q112.5 24 150 14 Q187.5 4 225 14 Q262.5 24 300 14"
      stroke={color}
      strokeWidth="0.7"
      strokeOpacity={opacity * 0.6}
      fill="none"
    />
  </svg>
);

export const RivieraTemplate: React.FC<LayoutProps> = ({
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
  const goldColor = template.colors.accent || '#F0C674';
  const headingFont = template.typography.heading || "'Cormorant Garamond', Georgia, serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-6"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD ── */}
      <div
        className={clsx('relative overflow-hidden', compact ? 'rounded-xl' : 'rounded-2xl')}
        style={{ background: `linear-gradient(160deg, #0A2A4A 0%, #0E3460 50%, #0A1D35 100%)`, border: `1px solid ${goldColor}25` }}
      >
        {/* Background stars/bokeh effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(1.5px 1.5px at 20% 30%, rgba(240,198,116,0.15) 0%, transparent 100%), radial-gradient(1px 1px at 60% 70%, rgba(240,198,116,0.1) 0%, transparent 100%), radial-gradient(2px 2px at 80% 20%, rgba(240,198,116,0.08) 0%, transparent 100%)',
          }}
        />

        <div className={clsx('relative flex flex-col items-center text-center', compact ? 'py-7 px-5' : 'py-10 px-8')}>
          {/* Eyebrow label */}
          <p
            className="text-[9px] uppercase tracking-[0.6em] mb-3 font-medium"
            style={{ color: goldColor, fontFamily: bodyFont }}
          >
            Mediterranean · Fine Dining
          </p>

          {/* Wave divider */}
          <div className="w-32 mb-3">
            <CoastalWave color={goldColor} opacity={0.6} />
          </div>

          {/* Logo */}
          {restaurant.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-full object-cover border-2 shadow-lg mb-4', compact ? 'w-10 h-10' : 'w-14 h-14')}
              style={{ borderColor: `${goldColor}60` }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          {/* Name */}
          <h1
            className={clsx('italic leading-tight break-words max-w-lg px-2', compact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl')}
            style={{ fontFamily: headingFont, color: goldColor, fontWeight: 400 }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p
              className="mt-2 text-sm tracking-wide"
              style={{ color: `${template.colors.text}90`, fontFamily: headingFont, fontStyle: 'italic' }}
            >
              {restaurant.tagline}
            </p>
          )}

          {(restaurant.address || restaurant.phone) && (
            <p className="mt-3 text-[10px] tracking-widest" style={{ color: `${goldColor}70` }}>
              {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
            </p>
          )}

          {/* Wave bottom decoration */}
          <div className="w-full mt-4">
            <CoastalWave color={goldColor} opacity={0.3} />
          </div>
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY PILLS ── */}
      {rawCategories.length > 1 && (
        <div
          className="sticky top-2 z-30 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-3 backdrop-blur-md rounded-full shadow-xl"
          style={{ background: `${template.colors.bg}F0`, border: `1px solid ${goldColor}25` }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium shrink-0 transition-all"
            style={{
              background: activeCategory === 'all' ? goldColor : 'transparent',
              color: activeCategory === 'all' ? '#0A2A4A' : `${goldColor}90`,
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
                className="px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium shrink-0 transition-all whitespace-nowrap"
                style={{
                  background: isActive ? goldColor : 'transparent',
                  color: isActive ? '#0A2A4A' : `${goldColor}80`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU CONTENT ── */}
      <div className="space-y-10 px-2">
        {categories.map((cat) => (
          <section key={cat.id}>
            {/* Category heading */}
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${goldColor}60, transparent)` }} />
                <h2
                  className={clsx('italic shrink-0', compact ? 'text-lg' : 'text-xl sm:text-2xl')}
                  style={{ fontFamily: headingFont, color: goldColor, fontWeight: 400 }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px" style={{ background: `linear-gradient(to left, ${goldColor}60, transparent)` }} />
              </div>
              <div className="mt-1">
                <CoastalWave color={goldColor} opacity={0.25} />
              </div>
            </div>

            {/* Items — detailed cards */}
            <div className="space-y-4">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl transition-all duration-300"
                    style={{
                      background: template.colors.surface,
                      border: `1px solid ${goldColor}20`,
                    }}
                  >
                    {item.isBestseller && (
                      <div
                        className="absolute top-2 right-2 z-10 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm font-semibold"
                        style={{ background: `${goldColor}20`, color: goldColor, border: `1px solid ${goldColor}40` }}
                      >
                        Maison Spéciale
                      </div>
                    )}

                    <div className={clsx('flex gap-4', compact ? 'p-3' : 'p-4 sm:p-5')}>
                      {/* Food photo */}
                      {item.image && (
                        <div className={clsx('shrink-0 overflow-hidden rounded-lg', compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24')}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <DietIndicator type={item.dietType} compact={compact} />
                            <h3
                              className={clsx('italic break-words', compact ? 'text-sm' : 'text-base sm:text-lg')}
                              style={{ fontFamily: headingFont, color: template.colors.text, fontWeight: 400 }}
                            >
                              {item.name}
                            </h3>
                          </div>
                          <RenderItemPrices
                            item={item}
                            accentColor={goldColor}
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="text-sm font-medium whitespace-nowrap"
                            btnStyle="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer"
                            compact={compact}
                          />
                        </div>

                        {pricing.cleanDescription && (
                          <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: `${template.colors.text}80` }}>
                            {pricing.cleanDescription}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <div className="w-48 mx-auto mb-3">
          <CoastalWave color={goldColor} opacity={0.4} />
        </div>
        <p className="text-[9px] uppercase tracking-[0.5em] italic" style={{ color: `${goldColor}60`, fontFamily: headingFont }}>
          {restaurant.name}
        </p>
      </div>
    </div>
  );
};

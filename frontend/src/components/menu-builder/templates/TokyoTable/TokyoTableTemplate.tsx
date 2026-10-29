import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Japanese ink brush stroke SVG
const InkBrushLine = ({ color = '#1A1A1A' }: { color?: string }) => (
  <svg width="100%" height="8" viewBox="0 0 300 8" preserveAspectRatio="none" fill="none">
    <path
      d="M0 4 Q30 1 60 4 Q90 7 120 4 Q150 1 180 4 Q210 7 240 4 Q270 1 300 4"
      stroke={color}
      strokeWidth="1.2"
      strokeOpacity="0.35"
      strokeLinecap="round"
    />
  </svg>
);

// Red circle with dot (Japanese seal)
const TokyoSeal = ({ color = '#C0392B', size = 28 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="1.5" />
    <circle cx="14" cy="14" r="4" fill={color} />
  </svg>
);

export const TokyoTableTemplate: React.FC<LayoutProps> = ({
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
  const redColor = template.colors.accent || '#C0392B';
  const headingFont = template.typography.heading || "'Noto Serif Display', 'Playfair Display', serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-8"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD — Japanese editorial ── */}
      <div
        className={clsx('relative', compact ? 'pt-6 pb-4 px-5' : 'pt-10 pb-6 px-8')}
        style={{ borderBottom: `1px solid ${template.colors.border}` }}
      >
        {/* Red accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: redColor }} />

        <div className="flex items-start justify-between gap-6">
          {/* Left — restaurant name */}
          <div className="flex-1 min-w-0">
            <p
              className="text-[9px] uppercase tracking-[0.5em] mb-3 font-medium"
              style={{ color: redColor, fontFamily: bodyFont }}
            >
              {restaurant.cuisine ? `${restaurant.cuisine} · Kitchen` : 'Asian Fusion · Kitchen'}
            </p>
            <h1
              className={clsx('break-words leading-none', compact ? 'text-2xl' : 'text-3xl sm:text-5xl md:text-6xl')}
              style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 500, letterSpacing: '-0.01em' }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: template.colors.secondary }}>
                {restaurant.tagline}
              </p>
            )}
          </div>

          {/* Right — logo or Japanese seal */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            {restaurant.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className={clsx('object-cover rounded border', compact ? 'w-12 h-12' : 'w-16 h-16')}
                style={{ borderColor: `${redColor}30` }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                decoding="async"
                loading="lazy"
              />
            ) : (
              <TokyoSeal color={redColor} size={compact ? 36 : 48} />
            )}
            <p className="text-[8px] uppercase tracking-[0.3em]" style={{ color: `${template.colors.text}40` }}>
              Menu
            </p>
          </div>
        </div>

        {(restaurant.address || restaurant.phone) && (
          <p className="mt-3 text-[10px] tracking-widest" style={{ color: `${template.colors.secondary}` }}>
            {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
          </p>
        )}
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY TABS — zen pill row ── */}
      {rawCategories.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none px-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 text-[11px] tracking-widest font-medium shrink-0 transition-all rounded-sm"
            style={{
              color: activeCategory === 'all' ? '#fff' : template.colors.text,
              background: activeCategory === 'all' ? redColor : 'transparent',
              border: `1px solid ${activeCategory === 'all' ? redColor : template.colors.border}`,
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
                className="px-4 py-1.5 text-[11px] tracking-widest font-medium shrink-0 transition-all rounded-sm whitespace-nowrap"
                style={{
                  color: isActive ? '#fff' : template.colors.text,
                  background: isActive ? redColor : 'transparent',
                  border: `1px solid ${isActive ? redColor : template.colors.border}`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU CONTENT — two-column editorial list ── */}
      <div className="space-y-12">
        {categories.map((cat) => (
          <section key={cat.id}>
            {/* Category header */}
            <div className="mb-6 pb-3" style={{ borderBottom: `1px solid ${template.colors.border}` }}>
              <div className="flex items-center justify-between">
                <h2
                  className={clsx('tracking-wide', compact ? 'text-base' : 'text-xl sm:text-2xl')}
                  style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 500 }}
                >
                  {cat.name}
                </h2>
                <TokyoSeal color={redColor} size={compact ? 16 : 20} />
              </div>
              <InkBrushLine color={template.colors.text} />
            </div>

            {/* Two-column grid */}
            <div className={clsx('grid gap-x-8 gap-y-5', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group flex items-start gap-3 pb-4"
                    style={{ borderBottom: `1px solid ${template.colors.border}` }}
                  >
                    {/* Food thumbnail */}
                    {item.image && (
                      <div className={clsx('shrink-0 overflow-hidden', compact ? 'w-14 h-14 rounded' : 'w-16 h-16 rounded-sm')}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 grayscale-[15%]"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                          decoding="async"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <DietIndicator type={item.dietType} compact={compact} />
                          <h3
                            className={clsx('break-words', compact ? 'text-sm' : 'text-base')}
                            style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 500 }}
                          >
                            {item.name}
                          </h3>
                        </div>
                        <RenderItemPrices
                          item={item}
                          accentColor={redColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-medium whitespace-nowrap"
                          btnStyle="text-[10px] px-2.5 py-1 rounded border font-medium transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>

                      {pricing.cleanDescription && (
                        <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: template.colors.secondary }}>
                          {pricing.cleanDescription}
                        </p>
                      )}

                      {item.isBestseller && (
                        <span
                          className="mt-1.5 inline-block text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
                          style={{ background: `${redColor}10`, color: redColor }}
                        >
                          Chef's Pick
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 pb-6 text-center" style={{ borderTop: `1px solid ${template.colors.border}` }}>
        <p className="text-[10px] tracking-[0.4em] uppercase" style={{ color: `${template.colors.text}40` }}>
          {restaurant.name}
        </p>
      </div>
    </div>
  );
};

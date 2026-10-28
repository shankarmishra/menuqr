import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Botanical line leaf SVG
const GreenLeafDivider = ({ color = '#3A6B3A' }: { color?: string }) => (
  <div className="flex items-center gap-2 w-full my-2">
    <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: `${color}40` }} />
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
      <path d="M12 1 C8 3 3 8 5 12 C7 13 12 13 12 13 C12 13 17 13 19 12 C21 8 16 3 12 1Z" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="0.8" />
      <path d="M12 2 L12 12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
      <path d="M12 5 Q9 6 7 9" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
      <path d="M12 5 Q15 6 17 9" stroke={color} strokeWidth="0.5" strokeOpacity="0.4" />
    </svg>
    <div className="flex-1 h-px border-t border-dashed" style={{ borderColor: `${color}40` }} />
  </div>
);

export const GreenhouseTemplate: React.FC<LayoutProps> = ({
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
  const greenColor = template.colors.accent || '#3A6B3A';
  const headingFont = template.typography.heading || "'DM Serif Display', Georgia, serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-6"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD ── */}
      <div
        className={clsx('relative text-center overflow-hidden', compact ? 'py-6 px-5 rounded-xl' : 'py-10 px-8 rounded-2xl')}
        style={{ background: template.colors.surface, border: `1.5px solid ${greenColor}25` }}
      >
        {/* Background greenhouse pane grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `linear-gradient(${greenColor} 1px, transparent 1px), linear-gradient(90deg, ${greenColor} 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative">
          {/* Decorative leaf row */}
          <div className="flex justify-center gap-2 mb-3 opacity-40">
            {['🌿', '🍃', '🌱', '🍃', '🌿'].map((e, i) => (
              <span key={i} className="text-sm">{e}</span>
            ))}
          </div>

          {/* Eyebrow */}
          <p
            className="text-[9px] uppercase tracking-[0.5em] mb-2 font-semibold"
            style={{ color: greenColor, fontFamily: bodyFont }}
          >
            Plant-forward · Thoughtfully grown
          </p>

          {/* Logo */}
          {restaurant.logo && (
            <div className="flex justify-center mb-3">
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className={clsx('rounded-full object-cover border-2 shadow-sm', compact ? 'w-11 h-11' : 'w-15 h-15')}
                style={{ borderColor: `${greenColor}50` }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Name */}
          <h1
            className={clsx('leading-tight break-words max-w-lg mx-auto', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')}
            style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="mt-2 text-sm" style={{ color: `${greenColor}CC` }}>
              {restaurant.tagline}
            </p>
          )}

          {(restaurant.address || restaurant.phone) && (
            <p className="mt-2 text-[10px]" style={{ color: `${template.colors.secondary}` }}>
              {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
            </p>
          )}
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY TABS ── */}
      {rawCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all border"
            style={{
              background: activeCategory === 'all' ? greenColor : 'transparent',
              color: activeCategory === 'all' ? '#fff' : greenColor,
              borderColor: `${greenColor}40`,
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
                className="px-4 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all border whitespace-nowrap"
                style={{
                  background: isActive ? greenColor : 'transparent',
                  color: isActive ? '#fff' : greenColor,
                  borderColor: `${greenColor}40`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU CONTENT ── */}
      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="mb-5">
              <h2
                className={clsx('', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}
                style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
              >
                {cat.name}
              </h2>
              <GreenLeafDivider color={greenColor} />
            </div>

            {/* Detailed card list */}
            <div className="space-y-4">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group flex items-start gap-4 rounded-xl p-4 transition-all hover:shadow-md"
                    style={{
                      background: template.colors.surface,
                      border: `1px solid ${greenColor}15`,
                    }}
                  >
                    {/* Photo */}
                    {item.image && (
                      <div className={clsx('shrink-0 overflow-hidden rounded-lg', compact ? 'w-16 h-16' : 'w-20 h-20')}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none'); }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 min-w-0">
                          <DietIndicator type={item.dietType} compact={compact} color={greenColor} className="mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <h3
                              className={clsx('break-words leading-tight', compact ? 'text-sm' : 'text-base')}
                              style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
                            >
                              {item.name}
                            </h3>
                            {item.isBestseller && (
                              <span
                                className="inline-block text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-1"
                                style={{ background: `${greenColor}15`, color: greenColor }}
                              >
                                🌟 House Fave
                              </span>
                            )}
                          </div>
                        </div>
                        <RenderItemPrices
                          item={item}
                          accentColor={greenColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-semibold whitespace-nowrap"
                          btnStyle="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                      {pricing.cleanDescription && (
                        <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: template.colors.secondary }}>
                          {pricing.cleanDescription}
                        </p>
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
      <div className="text-center py-5">
        <GreenLeafDivider color={greenColor} />
        <p className="text-[9px] uppercase tracking-widest mt-2" style={{ color: `${greenColor}60` }}>
          {restaurant.name} · Good food, good planet
        </p>
      </div>
    </div>
  );
};

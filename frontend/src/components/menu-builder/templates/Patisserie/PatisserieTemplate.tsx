import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Delicate ribbon and bow SVG
const RibbonDivider = ({ color = '#C4736A' }: { color?: string }) => (
  <div className="flex items-center justify-center gap-3 w-full my-2.5">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#C4736A]/40" />
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <path
        d="M12 10 C8 6 4 7 4 10 C4 13 8 14 12 10 Z"
        stroke={color}
        strokeWidth="1"
        fill={`${color}15`}
      />
      <path
        d="M12 10 C16 6 20 7 20 10 C20 13 16 14 12 10 Z"
        stroke={color}
        strokeWidth="1"
        fill={`${color}15`}
      />
      <circle cx="12" cy="10" r="2" fill={color} />
      <path d="M11 11 Q9 16 7 19" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M13 11 Q15 16 17 19" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#C4736A]/40" />
  </div>
);

export const PatisserieTemplate: React.FC<LayoutProps> = ({
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
  const roseColor = template.colors.accent || '#C4736A';
  const headingFont = template.typography.heading || "'Playfair Display', Georgia, serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-6"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD: Parisian Boutique ── */}
      <div
        className={clsx(
          'relative text-center overflow-hidden rounded-2xl',
          compact ? 'py-6 px-4' : 'py-10 px-8'
        )}
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FDF6F0 100%)',
          border: `1.5px solid ${roseColor}30`,
          boxShadow: '0 10px 30px rgba(196, 115, 106, 0.08)',
        }}
      >
        {/* Subtle confectioner dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `radial-gradient(${roseColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '16px 16px',
          }}
        />

        <div className="relative">
          <p
            className="text-[9px] uppercase tracking-[0.55em] font-semibold mb-2"
            style={{ color: roseColor }}
          >
            {restaurant.cuisine ? `${restaurant.cuisine} & Bakery` : 'Artisanal Confectionery & Bakery'}
          </p>

          <RibbonDivider color={roseColor} />

          {/* Logo */}
          {restaurant.logo && (
            <div className="flex justify-center my-3">
              <img
                src={restaurant.logo}
                alt={restaurant.name}
                className={clsx('rounded-full object-cover border-2 shadow-sm', compact ? 'w-12 h-12' : 'w-16 h-16')}
                style={{ borderColor: `${roseColor}40` }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          {/* Name */}
          <h1
            className={clsx('italic leading-tight break-words max-w-lg mx-auto', compact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl')}
            style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 500 }}
          >
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="mt-2 text-sm italic" style={{ color: `${roseColor}CC`, fontFamily: headingFont }}>
              "{restaurant.tagline}"
            </p>
          )}

          {(restaurant.address || restaurant.phone) && (
            <p className="mt-2 text-[10px] tracking-wider" style={{ color: `${template.colors.secondary}` }}>
              {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
            </p>
          )}
        </div>
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY PILLS: Pastel Macaron Tabs ── */}
      {rawCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1.5 px-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all shadow-sm border"
            style={{
              background: activeCategory === 'all' ? roseColor : '#FFFFFF',
              color: activeCategory === 'all' ? '#FFFFFF' : roseColor,
              borderColor: `${roseColor}40`,
            }}
          >
            All Delights
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-1.5 rounded-full text-xs font-medium shrink-0 whitespace-nowrap transition-all shadow-sm border"
                style={{
                  background: isActive ? roseColor : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : roseColor,
                  borderColor: `${roseColor}40`,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU SECTIONS ── */}
      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="mb-5 text-center">
              <h2
                className={clsx('italic', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}
                style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 500 }}
              >
                {cat.name}
              </h2>
              <RibbonDivider color={roseColor} />
            </div>

            {/* Items grid */}
            <div className={clsx('grid gap-4', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-2xl overflow-hidden p-4 transition-all duration-300 hover:shadow-lg"
                    style={{
                      background: template.colors.surface,
                      border: `1px solid ${roseColor}20`,
                      boxShadow: '0 4px 15px rgba(196, 115, 106, 0.05)',
                    }}
                  >
                    {item.isBestseller && (
                      <span
                        className="absolute top-3 right-3 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shadow-sm"
                        style={{ background: '#FDEAE8', color: roseColor, border: `1px solid ${roseColor}40` }}
                      >
                        ✦ Signature
                      </span>
                    )}

                    <div className="flex gap-3.5">
                      {item.image && (
                        <div className={clsx('shrink-0 rounded-xl overflow-hidden border', compact ? 'w-16 h-16' : 'w-20 h-20')} style={{ borderColor: `${roseColor}25` }}>
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
                          <div className="flex items-center gap-1.5 min-w-0">
                            <DietIndicator type={item.dietType} compact={compact} color={roseColor} />
                            <h3
                              className={clsx('italic break-words', compact ? 'text-sm' : 'text-base font-medium')}
                              style={{ fontFamily: headingFont, color: template.colors.heading }}
                            >
                              {item.name}
                            </h3>
                          </div>
                          <RenderItemPrices
                            item={item}
                            accentColor={roseColor}
                            isPremium={isPremium}
                            onAddToCart={onAddToCart}
                            priceClassName="text-sm font-semibold whitespace-nowrap"
                            btnStyle="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer shadow-sm text-white"
                            compact={compact}
                          />
                        </div>

                        {pricing.cleanDescription && (
                          <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: template.colors.secondary }}>
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
        <RibbonDivider color={roseColor} />
        <p className="text-[10px] uppercase tracking-widest mt-2" style={{ color: `${roseColor}80` }}>
          {restaurant.name} · Douceurs et Gourmandises
        </p>
      </div>
    </div>
  );
};

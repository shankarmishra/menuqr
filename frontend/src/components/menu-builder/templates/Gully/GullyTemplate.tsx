import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// Chalk-style dashed border divider
const ChalkDivider = ({ color = '#FFD700' }: { color?: string }) => (
  <div className="flex items-center gap-2 w-full my-2">
    <div className="flex-1 h-px border-t-2 border-dashed" style={{ borderColor: `${color}60` }} />
    <span className="text-[10px] font-black tracking-widest uppercase px-1" style={{ color }}>
      ★ CHOWK SPECIAL ★
    </span>
    <div className="flex-1 h-px border-t-2 border-dashed" style={{ borderColor: `${color}60` }} />
  </div>
);

export const GullyTemplate: React.FC<LayoutProps> = ({
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
  const yellowColor = template.colors.heading || '#FFD700';
  const redColor = template.colors.accent || '#E84040';
  const headingFont = template.typography.heading || "'Bebas Neue', Impact, sans-serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-6"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD: Street sign / food truck chalkboard style ── */}
      <div
        className={clsx(
          'relative overflow-hidden rounded-2xl text-center',
          compact ? 'p-5' : 'p-6 sm:p-8'
        )}
        style={{
          background: `linear-gradient(145deg, #1A1200 0%, #261A00 50%, #170F00 100%)`,
          border: `2px dashed ${yellowColor}50`,
          boxShadow: `inset 0 0 40px rgba(0,0,0,0.8), 0 8px 30px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Top street badge */}
        <div className="inline-block px-3 py-1 rounded-sm mb-3 bg-red-600 shadow">
          <p
            className="text-[10px] font-black uppercase tracking-[0.3em] text-white"
            style={{ fontFamily: headingFont }}
          >
            DESI STREET FOOD · DHABA VIBES
          </p>
        </div>

        {/* Logo */}
        {restaurant.logo && (
          <div className="flex justify-center mb-3">
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-xl object-cover border-2 shadow-lg', compact ? 'w-12 h-12' : 'w-16 h-16')}
              style={{ borderColor: yellowColor }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Name */}
        <h1
          className={clsx('tracking-wider uppercase leading-none break-words px-2 drop-shadow-md', compact ? 'text-3xl' : 'text-4xl sm:text-6xl')}
          style={{ fontFamily: headingFont, color: yellowColor }}
        >
          {restaurant.name}
        </h1>

        {restaurant.tagline && (
          <p className="mt-2 text-sm italic font-medium" style={{ color: '#FFB800' }}>
            "{restaurant.tagline}"
          </p>
        )}

        {(restaurant.address || restaurant.phone) && (
          <p className="mt-2 text-[11px] tracking-wide" style={{ color: `${template.colors.text}80` }}>
            📍 {restaurant.address}{restaurant.phone && ` · 📞 ${restaurant.phone}`}
          </p>
        )}
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY PILLS: Street Stall Badges ── */}
      {rawCategories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow"
            style={{
              background: activeCategory === 'all' ? yellowColor : '#2A1D05',
              color: activeCategory === 'all' ? '#1A1200' : yellowColor,
              border: `1px solid ${yellowColor}50`,
              fontFamily: headingFont,
              fontSize: '14px',
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
                className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shrink-0 whitespace-nowrap transition-all shadow"
                style={{
                  background: isActive ? yellowColor : '#2A1D05',
                  color: isActive ? '#1A1200' : yellowColor,
                  border: `1px solid ${yellowColor}50`,
                  fontFamily: headingFont,
                  fontSize: '14px',
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── MENU SECTIONS ── */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <section key={cat.id}>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2
                  className={clsx('uppercase tracking-wider', compact ? 'text-2xl' : 'text-3xl sm:text-4xl')}
                  style={{ fontFamily: headingFont, color: yellowColor }}
                >
                  {cat.name}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  style={{ background: redColor, color: '#fff', fontFamily: headingFont }}
                >
                  {cat.items.length} Khane
                </span>
              </div>
              <ChalkDivider color={yellowColor} />
            </div>

            {/* Street food grid */}
            <div className={clsx('grid gap-3', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group relative rounded-xl p-3 flex gap-3 transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: template.colors.surface,
                      border: `1px solid ${yellowColor}25`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* Food image */}
                    {item.image && (
                      <div className={clsx('shrink-0 rounded-lg overflow-hidden border', compact ? 'w-16 h-16' : 'w-20 h-20')} style={{ borderColor: `${yellowColor}40` }}>
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
                        <div className="flex items-center gap-1.5 min-w-0">
                          <DietIndicator type={item.dietType} compact={compact} />
                          <h3
                            className={clsx('tracking-wide break-words uppercase font-bold', compact ? 'text-sm' : 'text-base')}
                            style={{ fontFamily: headingFont, color: '#FFF5CC' }}
                          >
                            {item.name}
                          </h3>
                        </div>
                        <RenderItemPrices
                          item={item}
                          accentColor={yellowColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-bold whitespace-nowrap text-amber-400"
                          btnStyle="text-[10px] px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold uppercase transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>

                      {pricing.cleanDescription && (
                        <p className="mt-1 text-xs leading-relaxed line-clamp-2" style={{ color: `${template.colors.text}80` }}>
                          {pricing.cleanDescription}
                        </p>
                      )}

                      {item.isBestseller && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          🔥 GULLY SPECIAL
                        </div>
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
      <div className="text-center py-6 border-t border-dashed" style={{ borderColor: `${yellowColor}40` }}>
        <p className="text-xs uppercase tracking-widest font-black" style={{ color: yellowColor, fontFamily: headingFont }}>
          ★ {restaurant.name} · TASTE OF THE STREETS ★
        </p>
      </div>
    </div>
  );
};

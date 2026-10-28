import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';

// SVG botanical leaf motif
const LeafMotif = ({ color = '#5C7A4E', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2 C7 4 3 9 4 15 C5 18 8 20 12 20 C16 20 19 18 20 15 C21 9 17 4 12 2Z"
      fill={color}
      fillOpacity="0.25"
      stroke={color}
      strokeWidth="0.8"
    />
    <path d="M12 4 L12 18" stroke={color} strokeWidth="0.8" strokeOpacity="0.6" />
    <path d="M12 8 Q9 9 7 12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
    <path d="M12 8 Q15 9 17 12" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
  </svg>
);

const BotanicaDivider = ({ color = '#5C7A4E' }: { color?: string }) => (
  <div className="flex items-center gap-3 w-full my-2">
    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${color}40` }} />
    <LeafMotif color={color} size={16} />
    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${color}40` }} />
  </div>
);

export const BotanicaTemplate: React.FC<LayoutProps> = ({
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
  const sageColor = template.colors.accent || '#5C7A4E';
  const headingFont = template.typography.heading || "'DM Serif Display', Georgia, serif";
  const bodyFont = template.typography.body || "'Plus Jakarta Sans', sans-serif";

  return (
    <div
      className="relative z-10 w-full max-w-4xl mx-auto space-y-6"
      style={{ color: template.colors.text, fontFamily: bodyFont, background: template.colors.bg }}
    >
      {/* ── MASTHEAD ── */}
      <div
        className={clsx(
          'relative text-center overflow-hidden rounded-2xl',
          compact ? 'py-6 px-5' : 'py-10 px-8'
        )}
        style={{ background: template.colors.surface, border: `1.5px solid ${sageColor}25` }}
      >
        {/* Corner leaf decorations */}
        <div className="absolute top-2 left-2 rotate-[-30deg] opacity-30">
          <LeafMotif color={sageColor} size={36} />
        </div>
        <div className="absolute top-2 right-2 rotate-[30deg] opacity-30">
          <LeafMotif color={sageColor} size={36} />
        </div>
        <div className="absolute bottom-2 left-2 rotate-[150deg] opacity-20">
          <LeafMotif color={sageColor} size={28} />
        </div>
        <div className="absolute bottom-2 right-2 rotate-[-150deg] opacity-20">
          <LeafMotif color={sageColor} size={28} />
        </div>

        {/* Logo */}
        {restaurant.logo && (
          <div className="flex justify-center mb-4">
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className={clsx('rounded-full object-cover border-2 shadow-sm', compact ? 'w-12 h-12' : 'w-16 h-16')}
              style={{ borderColor: `${sageColor}40` }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}

        {/* Eyebrow */}
        <p
          className="text-[9px] uppercase tracking-[0.5em] mb-2 font-medium"
          style={{ color: sageColor, fontFamily: bodyFont }}
        >
          Artisan · Botanical · Honest
        </p>

        {/* Name */}
        <h1
          className={clsx('leading-tight break-words max-w-lg mx-auto', compact ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl')}
          style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
        >
          {restaurant.name}
        </h1>

        {restaurant.tagline && (
          <p className="mt-3 text-sm italic" style={{ color: `${sageColor}CC`, fontFamily: headingFont }}>
            {restaurant.tagline}
          </p>
        )}

        {(restaurant.address || restaurant.phone) && (
          <p className="mt-2 text-[10px] tracking-wider" style={{ color: `${template.colors.secondary}` }}>
            {restaurant.address}{restaurant.phone && ` · ${restaurant.phone}`}
          </p>
        )}
      </div>

      {/* ── SEARCH ── */}
      {searchBar}

      {/* ── CATEGORY TABS ── */}
      {rawCategories.length > 1 && (
        <div
          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 px-1"
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className="px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all border"
            style={{
              background: activeCategory === 'all' ? sageColor : 'transparent',
              color: activeCategory === 'all' ? '#fff' : sageColor,
              borderColor: `${sageColor}50`,
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
                className="px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all border whitespace-nowrap"
                style={{
                  background: isActive ? sageColor : 'transparent',
                  color: isActive ? '#fff' : sageColor,
                  borderColor: `${sageColor}50`,
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
            {/* Category title */}
            <div className="mb-5">
              <h2
                className={clsx('', compact ? 'text-xl' : 'text-2xl sm:text-3xl')}
                style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
              >
                {cat.name}
              </h2>
              <BotanicaDivider color={sageColor} />
            </div>

            {/* Items — clean inline list */}
            <div className="space-y-4">
              {cat.items.map((item) => {
                const pricing = parseItemPricing(item);
                return (
                  <div
                    key={item.id}
                    className="group flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm"
                    style={{ background: item.image ? template.colors.surface : 'transparent', border: item.image ? `1px solid ${sageColor}10` : 'none' }}
                  >
                    {/* Food photo thumbnail */}
                    {item.image && (
                      <div className={clsx('shrink-0 rounded-xl overflow-hidden border', compact ? 'w-16 h-16' : 'w-20 h-20')} style={{ borderColor: `${sageColor}20` }}>
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
                          <DietIndicator type={item.dietType} compact={compact} className="shrink-0" color={sageColor} />
                          <h3
                            className={clsx('break-words', compact ? 'text-sm' : 'text-base')}
                            style={{ fontFamily: headingFont, color: template.colors.heading, fontWeight: 400 }}
                          >
                            {item.name}
                          </h3>
                          {item.isBestseller && (
                            <span
                              className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ background: `${sageColor}20`, color: sageColor }}
                            >
                              🌿 Fave
                            </span>
                          )}
                        </div>
                        <RenderItemPrices
                          item={item}
                          accentColor={sageColor}
                          isPremium={isPremium}
                          onAddToCart={onAddToCart}
                          priceClassName="text-sm font-semibold whitespace-nowrap"
                          btnStyle="text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer"
                          compact={compact}
                        />
                      </div>
                      {pricing.cleanDescription && (
                        <p className="mt-1 text-xs leading-relaxed" style={{ color: `${template.colors.secondary}` }}>
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
      <div className="text-center py-6">
        <BotanicaDivider color={sageColor} />
        <p className="text-[10px] tracking-widest uppercase mt-3" style={{ color: `${sageColor}70` }}>
          {restaurant.name} · Grown with care
        </p>
      </div>
    </div>
  );
};

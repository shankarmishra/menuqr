import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { SpiceHouseAtmosphere } from '../assets/builtInImages';

export const SpiceHouseTemplate: React.FC<LayoutProps> = ({
  template,
  restaurant,
  categories,
  rawCategories,
  compact,
  onAddToCart,
  isPremium,
  activeCategory,
  setActiveCategory,
}) => {
  return (
    <div className="text-[#F5EBE6] font-serif relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Earthy Spice House Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#2C211D] border-2 border-[#E07A5F]/40 p-4 rounded-lg shadow-2xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#2C211D] border-2 border-[#E07A5F]/40 p-5 rounded-lg shadow-2xl')}>
          <div className="text-center space-y-1 pb-3 border-b border-[#E07A5F]/30">
            <span className="text-[9px] font-serif uppercase tracking-[0.35em] text-[#E07A5F] font-bold block">
              ARTISANAL SPICE & DINING
            </span>
            <h1
              className={clsx('font-black text-[#F5EBE6] tracking-wide', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#E07A5F]/80 font-serif">{restaurant.tagline}</p>}
          </div>

          <SpiceHouseAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-serif uppercase tracking-[0.3em] font-bold text-[#E07A5F] block text-center mb-1">MENU SECTIONS</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-serif tracking-wider border rounded transition-all text-left flex items-center justify-between',
                    activeCategory === 'all'
                      ? 'bg-[#E07A5F] text-white border-[#E07A5F] font-bold'
                      : 'bg-[#2C211D] text-[#E07A5F] border-[#E07A5F]/30 hover:border-[#E07A5F]'
                  )}
                >
                  <span>All Items</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3 py-1.5 text-xs font-serif tracking-wider border rounded transition-all text-left flex items-center justify-between whitespace-nowrap',
                        isActive
                          ? 'bg-[#E07A5F] text-white border-[#E07A5F] font-bold'
                          : 'bg-[#2C211D] text-[#E07A5F] border-[#E07A5F]/30 hover:border-[#E07A5F]'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-75">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Spice House Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#2C211D] border-2 border-[#E07A5F]/40 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E07A5F]/30 pb-1">
                <span className="text-[#E07A5F] text-xs">❖</span>
                <h2
                  className={clsx('font-black text-[#E07A5F] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#E07A5F]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#E07A5F]/15 hover:border-[#E07A5F]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#E07A5F" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-[#F5EBE6] group-hover:text-[#E07A5F] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-[#E07A5F]/40 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#E07A5F"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#E07A5F] text-white rounded hover:bg-[#c45e43]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#E07A5F]/75 pl-5 mt-0.5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

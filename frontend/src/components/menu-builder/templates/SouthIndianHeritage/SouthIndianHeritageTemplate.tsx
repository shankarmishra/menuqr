import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { SouthIndianHeritageAtmosphere } from '../assets/builtInImages';

export const SouthIndianHeritageTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#E2C044] font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Traditional Dakshin Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#172A1F] border-2 border-[#E2C044]/40 p-4 rounded-lg shadow-2xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#172A1F] border-2 border-[#E2C044]/40 p-5 rounded-lg shadow-2xl')}>
          <div className="text-center space-y-1 pb-3 border-b border-[#E2C044]/30">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#E2C044] font-semibold">
              ✦ TRADITIONAL DAKSHIN CUISINE ✦
            </div>
            <h1
              className={clsx('font-black text-[#FAF3E0] tracking-wide', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#E2C044]/80 font-serif">{restaurant.tagline}</p>}
          </div>

          <SouthIndianHeritageAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#E2C044]/80 block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-bold border transition-all text-left flex items-center justify-between rounded-full',
                    activeCategory === 'all'
                      ? 'bg-[#E2C044] text-[#0E1A13] border-[#E2C044]'
                      : 'bg-[#172A1F] text-[#E2C044] border-[#E2C044]/30 hover:border-[#E2C044]'
                  )}
                >
                  <span>ALL DISHES</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3 py-1.5 text-xs font-bold border transition-all text-left flex items-center justify-between rounded-full whitespace-nowrap',
                        isActive
                          ? 'bg-[#E2C044] text-[#0E1A13] border-[#E2C044]'
                          : 'bg-[#172A1F] text-[#E2C044] border-[#E2C044]/30 hover:border-[#E2C044]'
                      )}
                    >
                      <span>● {cat.name}</span>
                      <span className="text-[10px] opacity-75">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Dakshin Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#172A1F] border-2 border-[#E2C044]/40 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E2C044]/30 pb-1">
                <span className="text-[#E2C044] text-xs">❖</span>
                <h2
                  className={clsx('font-black text-[#E2C044] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#E2C044]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#E2C044]/15 hover:border-[#E2C044]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#E2C044" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-[#FAF3E0] group-hover:text-[#E2C044] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-[#E2C044]/40 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#E2C044"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#E2C044] text-[#0E1A13] rounded hover:bg-[#c9a836]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#E2C044]/75 pl-5 mt-0.5 leading-relaxed font-sans">
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

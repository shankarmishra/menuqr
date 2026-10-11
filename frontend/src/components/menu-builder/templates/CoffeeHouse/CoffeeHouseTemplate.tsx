import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { CoffeeHouseAtmosphere } from '../assets/builtInImages';

export const CoffeeHouseTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#F5EBE6] font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Espresso Bakery Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#2A211D] border border-[#D4A373]/40 p-4 rounded-xl shadow-2xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#2A211D] border border-[#D4A373]/40 p-5 rounded-xl shadow-2xl')}>
          <div className="text-center space-y-1 pb-3 border-b border-[#D4A373]/30">
            <span className="text-[10px] font-mono tracking-widest text-[#D4A373] uppercase block">
              ☕ ARTISANAL COFFEE & BAKERY ☕
            </span>
            <h1
              className={clsx('font-black text-[#FEFAE0] tracking-wide', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-[#D4A373]/80 font-serif italic">{restaurant.tagline}</p>}
          </div>

          <CoffeeHouseAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-[#D4A373] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all text-left flex items-center justify-between',
                    activeCategory === 'all'
                      ? 'bg-[#D4A373] text-[#1C1613] border-[#D4A373] shadow'
                      : 'bg-[#2A211D] text-[#D4A373] border-[#D4A373]/30 hover:border-[#D4A373]'
                  )}
                >
                  <span>ALL COFFEE & FOOD</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all text-left flex items-center justify-between whitespace-nowrap',
                        isActive
                          ? 'bg-[#D4A373] text-[#1C1613] border-[#D4A373] shadow'
                          : 'bg-[#2A211D] text-[#D4A373] border-[#D4A373]/30 hover:border-[#D4A373]'
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

        {/* Right Column: Printed Cafe Menu Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#2A211D] border border-[#D4A373]/40 p-4 sm:p-6 rounded-xl shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D4A373]/30 pb-1">
                <h2
                  className={clsx('font-black text-[#D4A373] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#D4A373]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#D4A373]/15 hover:border-[#D4A373]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4A373" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-[#FEFAE0] group-hover:text-[#D4A373] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-[#D4A373]/40 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#D4A373"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#D4A373] text-[#1C1613] rounded hover:bg-[#b88556]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#D4A373]/75 pl-5 mt-0.5 leading-relaxed font-sans">
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

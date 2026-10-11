import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { IndianStreetKitchenAtmosphere } from '../assets/builtInImages';

export const IndianStreetKitchenTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-white font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Street Kitchen Identity & Poster Badge */}
        <div className={clsx(compact ? 'space-y-3 bg-[#252528] border-2 border-[#FACC15] p-4 rounded-lg shadow-2xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#252528] border-2 border-[#FACC15] p-5 rounded-lg shadow-2xl')}>
          <div className="text-center space-y-2 pb-3 border-b-2 border-[#FACC15]">
            <span className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase block">
              ★ AUTHENTIC DESI STREET KITCHEN ★
            </span>
            <h1
              className={clsx('font-black text-white uppercase tracking-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-[#FACC15]/90 font-bold">{restaurant.tagline}</p>}
          </div>

          <IndianStreetKitchenAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#FACC15] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-black uppercase border-2 transition-all text-left flex items-center justify-between rounded-md',
                    activeCategory === 'all'
                      ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-md'
                      : 'bg-[#18181A] text-white border-white/20 hover:border-[#FACC15]'
                  )}
                >
                  <span>ALL STREET ITEMS</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-black uppercase border-2 transition-all text-left flex items-center justify-between rounded-md whitespace-nowrap',
                        isActive
                          ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-md'
                          : 'bg-[#18181A] text-white border-white/20 hover:border-[#FACC15]'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-80">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Street Poster Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#252528] border-2 border-[#FACC15] p-4 sm:p-6 rounded-lg shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#FACC15] pb-1">
                <span className="text-[#FACC15] font-black text-sm">✦</span>
                <h2
                  className={clsx('font-black text-[#FACC15] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-0.5 bg-[#FACC15]/40" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-white/10 hover:border-[#FACC15]/50 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#FACC15" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-white group-hover:text-[#FACC15] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-white/20 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#FACC15"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-black px-2.5 py-1 bg-[#FACC15] text-black rounded hover:bg-yellow-400"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-white/70 pl-5 mt-0.5 leading-tight font-sans">
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

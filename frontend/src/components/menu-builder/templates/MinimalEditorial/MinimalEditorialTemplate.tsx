import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { MinimalEditorialAtmosphere } from '../assets/builtInImages';

export const MinimalEditorialTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-black font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Swiss Monochrome Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-white border border-black/15 p-4 rounded shadow-sm' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-white border border-black/15 p-5 rounded shadow-sm')}>
          <div className="text-center space-y-1 pb-3 border-b border-black/10">
            <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-black/60 block">
              INTERNATIONAL EDITORIAL MENU
            </span>
            <h1
              className={clsx('font-light text-black tracking-tight uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-black/50 font-light italic">{restaurant.tagline}</p>}
          </div>

          <MinimalEditorialAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-sans uppercase tracking-[0.3em] font-bold text-black/60 block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-sans uppercase tracking-widest transition-all text-left flex items-center justify-between border-b-2',
                    activeCategory === 'all'
                      ? 'text-black border-black font-bold'
                      : 'text-black/40 border-transparent hover:text-black'
                  )}
                >
                  <span>All Dishes</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-sans uppercase tracking-widest transition-all text-left flex items-center justify-between border-b-2 whitespace-nowrap',
                        isActive
                          ? 'text-black border-black font-bold'
                          : 'text-black/40 border-transparent hover:text-black'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Swiss Monochrome Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-white border border-black/15 p-4 sm:p-6 rounded shadow-sm space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-black/15 pb-1">
                <h2
                  className={clsx('font-bold text-black uppercase tracking-[0.2em]', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-black/15" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-black/10 hover:border-black/30 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#000000" />
                        <h3
                          className={clsx('font-medium text-xs sm:text-sm text-black group-hover:text-black/70 transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-black/20 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#000000"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 border border-black text-black rounded hover:bg-black hover:text-white"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-black/60 pl-5 mt-0.5 leading-relaxed font-light">
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

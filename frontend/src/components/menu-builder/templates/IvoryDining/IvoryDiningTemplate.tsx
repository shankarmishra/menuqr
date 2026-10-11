import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { IvoryDiningAtmosphere } from '../assets/builtInImages';

export const IvoryDiningTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#2C2523] font-serif relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Alabaster Parchment Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#FFFDF9] border border-[#C5A059]/30 p-4 rounded-lg shadow-xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#FFFDF9] border border-[#C5A059]/30 p-5 rounded-lg shadow-xl')}>
          <div className="text-center space-y-1 pb-3 border-b border-[#C5A059]/30">
            <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#C5A059] font-bold block">
              ALABASTER FINE DINING
            </span>
            <h1
              className={clsx('font-normal text-[#2C2523] tracking-wide', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#7A6B63] font-serif">{restaurant.tagline}</p>}
          </div>

          <IvoryDiningAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-serif uppercase tracking-[0.3em] font-bold text-[#C5A059] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-serif uppercase tracking-widest transition-all text-left flex items-center justify-between border-b-2',
                    activeCategory === 'all'
                      ? 'text-[#C5A059] border-[#C5A059] font-bold'
                      : 'text-[#7A6B63] border-transparent hover:text-[#2C2523]'
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
                        'px-3.5 py-1.5 text-xs font-serif uppercase tracking-widest transition-all text-left flex items-center justify-between border-b-2 whitespace-nowrap',
                        isActive
                          ? 'text-[#C5A059] border-[#C5A059] font-bold'
                          : 'text-[#7A6B63] border-transparent hover:text-[#2C2523]'
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

        {/* Right Column: Printed Ivory Parchment Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#FFFDF9] border border-[#C5A059]/30 p-4 sm:p-6 rounded-lg shadow-xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-1">
                <span className="h-px flex-1 bg-[#C5A059]/30" />
                <h2
                  className={clsx('font-bold text-[#C5A059] uppercase tracking-[0.25em]', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <span className="h-px flex-1 bg-[#C5A059]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#C5A059]/20 hover:border-[#C5A059]/60 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#C5A059" />
                        <h3
                          className={clsx('font-normal text-xs sm:text-sm text-[#2C2523] group-hover:text-[#C5A059] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-[#C5A059]/30 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#C5A059"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-serif px-2 py-0.5 bg-[#C5A059] text-white rounded hover:bg-[#a8843c]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#7A6B63] pl-5 mt-0.5 leading-relaxed font-serif italic">
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

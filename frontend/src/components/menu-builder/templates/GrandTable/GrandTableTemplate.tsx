import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { GrandTableAtmosphere } from '../assets/builtInImages';

export const GrandTableTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#E2E8F0] font-serif relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Navy Leather & Antique Brass Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#142030] border-2 border-[#C8A962]/40 p-4 rounded-lg shadow-2xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#142030] border-2 border-[#C8A962]/40 p-5 rounded-lg shadow-2xl')}>
          <div className="text-center space-y-1 pb-3 border-b-2 border-[#C8A962]/40">
            <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#C8A962] font-bold block">
              THE GRAND TABLE DINING ROOM
            </span>
            <h1
              className={clsx('font-black text-[#F8FAFC] tracking-wider uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#C8A962]/80 font-serif">{restaurant.tagline}</p>}
          </div>

          <GrandTableAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-serif uppercase tracking-[0.3em] font-bold text-[#C8A962] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-serif tracking-widest border transition-all text-left flex items-center justify-between',
                    activeCategory === 'all'
                      ? 'bg-[#C8A962] text-[#0C131D] border-[#C8A962] font-bold shadow'
                      : 'text-[#C8A962] border-[#C8A962]/30 hover:border-[#C8A962]'
                  )}
                >
                  <span>ALL SECTIONS</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-serif tracking-widest border transition-all text-left flex items-center justify-between whitespace-nowrap',
                        isActive
                          ? 'bg-[#C8A962] text-[#0C131D] border-[#C8A962] font-bold shadow'
                          : 'text-[#C8A962] border-[#C8A962]/30 hover:border-[#C8A962]'
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

        {/* Right Column: Printed Grand Table Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#142030] border-2 border-[#C8A962]/40 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#C8A962]/30 pb-1">
                <span className="text-[#C8A962] text-xs">❖</span>
                <h2
                  className={clsx('font-black text-[#C8A962] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#C8A962]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#C8A962]/15 hover:border-[#C8A962]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#C8A962" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-[#F8FAFC] group-hover:text-[#C8A962] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dotted border-[#C8A962]/40 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#C8A962"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#C8A962] text-[#0C131D] rounded hover:bg-[#a88a48]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#94A3B8] pl-5 mt-0.5 leading-relaxed font-serif italic">
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

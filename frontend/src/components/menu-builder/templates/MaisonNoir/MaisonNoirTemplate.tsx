import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { MaisonNoirAtmosphere } from '../assets/builtInImages';

export const MaisonNoirTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#E0E0E0] font-mono relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Dark Luxury Fine Dining Identity (35% on Desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#161618] border border-[#C5A059]/40 p-5 rounded-lg shadow-2xl">
          <div className="text-center space-y-1 pb-3 border-b border-[#C5A059]/30">
            <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-[#C5A059] block">
              HAUTE CUISINE & EDITORIAL
            </span>
            <h1
              className={clsx('font-light text-[#F5F5F5] tracking-widest uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#C5A059]/80 font-serif">{restaurant.tagline}</p>}
          </div>

          <MaisonNoirAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-[#C5A059] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-all text-left flex items-center justify-between',
                    activeCategory === 'all'
                      ? 'text-[#C5A059] font-bold underline'
                      : 'text-white/40 hover:text-white'
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
                        'px-3 py-1.5 text-xs font-mono uppercase tracking-widest transition-all text-left flex items-center justify-between whitespace-nowrap',
                        isActive
                          ? 'text-[#C5A059] font-bold underline'
                          : 'text-white/40 hover:text-white'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-60">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Luxury Spread (65% on Desktop) */}
        <div className="lg:col-span-8 bg-[#161618] border border-[#C5A059]/40 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-1">
                <h2
                  className={clsx('font-light text-[#C5A059] uppercase tracking-[0.3em]', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <span className="text-[10px] text-white/30">SECT. {cat.id.slice(0, 3)}</span>
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-white/5 hover:border-[#C5A059]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#C5A059" />
                        <h3
                          className="font-normal text-xs sm:text-sm text-white group-hover:text-[#C5A059] transition-colors truncate tracking-wide"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Gold Leader Dots */}
                      <span className="flex-1 border-b border-dotted border-[#C5A059]/40 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#C5A059"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-mono px-2 py-0.5 border border-[#C5A059] text-[#C5A059] rounded hover:bg-[#C5A059] hover:text-black"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-white/50 pl-5 mt-0.5 leading-relaxed font-sans font-light">
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

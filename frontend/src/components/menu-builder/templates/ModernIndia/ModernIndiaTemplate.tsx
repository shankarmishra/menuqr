import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { ModernIndiaAtmosphere } from '../assets/builtInImages';

export const ModernIndiaTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#2D241E] font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Minimal Saffron Identity (35% on Desktop) */}
        <div className={clsx(compact ? 'space-y-3 bg-[#FFFDF7] border border-[#D97706]/30 p-4 rounded-lg shadow-xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#FFFDF7] border border-[#D97706]/30 p-5 rounded-lg shadow-xl')}>
          <div className="text-center space-y-1 pb-3 border-b border-[#D97706]/20">
            <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#D97706] font-bold block">
              MODERN INDIAN GASTRONOMY
            </span>
            <h1
              className={clsx('font-light text-[#2D241E] tracking-wider uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-[#8A7568] font-light italic">{restaurant.tagline}</p>}
          </div>

          <ModernIndiaAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-sans uppercase tracking-[0.3em] font-bold text-[#D97706] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-sans uppercase tracking-widest transition-all text-left flex items-center justify-between rounded border',
                    activeCategory === 'all'
                      ? 'bg-[#D97706] text-white border-[#D97706] font-bold shadow'
                      : 'text-[#8A7568] border-transparent hover:text-[#2D241E]'
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
                        'px-3.5 py-1.5 text-xs font-sans uppercase tracking-widest transition-all text-left flex items-center justify-between rounded border whitespace-nowrap',
                        isActive
                          ? 'bg-[#D97706] text-white border-[#D97706] font-bold shadow'
                          : 'text-[#8A7568] border-transparent hover:text-[#2D241E]'
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

        {/* Right Column: Printed Modern Spread (65% on Desktop) */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#FFFDF7] border border-[#D97706]/30 p-4 sm:p-6 rounded-lg shadow-xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D97706]/20 pb-1">
                <h2
                  className={clsx('font-bold text-[#D97706] uppercase tracking-[0.2em]', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#D97706]/20" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#D97706]/10 hover:border-[#D97706]/30 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#D97706" />
                        <h3
                          className="font-semibold text-xs sm:text-sm text-[#2D241E] group-hover:text-[#D97706] transition-colors"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className="flex-1 border-b border-dotted border-[#D97706]/30 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#D97706"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D97706] text-white rounded hover:bg-[#b56102]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#8A7568] pl-5 mt-0.5 leading-relaxed font-light">
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

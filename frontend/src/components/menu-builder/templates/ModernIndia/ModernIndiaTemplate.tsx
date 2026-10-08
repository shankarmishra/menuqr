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
    <div className="space-y-6 relative z-10 text-[#2D241E]">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#D97706]/20">
        <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-[#D97706] font-bold block mb-1">
          MODERN INDIAN GASTRONOMY
        </span>
        <h1
          className={clsx('font-light text-[#2D241E] tracking-wider uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#8A7568] mt-1 font-light italic">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <ModernIndiaAtmosphere compact={compact} />

      {/* Saffron Minimalist Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-4 py-2 border-b border-[#D97706]/10">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'text-xs font-sans uppercase tracking-widest transition-all pb-1 border-b-2',
              activeCategory === 'all'
                ? 'text-[#D97706] border-[#D97706] font-bold'
                : 'text-[#8A7568] border-transparent hover:text-[#2D241E]'
            )}
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
                className={clsx(
                  'text-xs font-sans uppercase tracking-widest transition-all pb-1 border-b-2 whitespace-nowrap',
                  isActive
                    ? 'text-[#D97706] border-[#D97706] font-bold'
                    : 'text-[#8A7568] border-transparent hover:text-[#2D241E]'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <h2
              className={clsx('font-bold text-[#D97706] uppercase tracking-[0.2em] pb-1 border-b border-[#D97706]/20', compact ? 'text-xs' : 'text-sm')}
              style={{ fontFamily: template.typography.heading }}
            >
              {cat.name}
            </h2>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white/90 rounded-lg border border-[#D97706]/15 hover:border-[#D97706]/40 transition-all flex justify-between items-start gap-3 shadow-sm"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#D97706" />
                      <h3
                        className="font-semibold text-xs sm:text-sm text-[#2D241E]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#8A7568] pl-5 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#D97706"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#D97706] text-white rounded hover:bg-[#b56102]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

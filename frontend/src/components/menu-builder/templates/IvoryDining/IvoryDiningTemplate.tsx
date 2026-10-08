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
    <div className="space-y-6 relative z-10 text-[#2C2523]">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#C5A059]/30">
        <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#C5A059] font-bold block mb-1">
          ALABASTER FINE DINING
        </span>
        <h1
          className={clsx('font-normal text-[#2C2523] tracking-wide', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#7A6B63] mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <IvoryDiningAtmosphere compact={compact} />

      {/* Parchment Underlined Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-4 py-2 border-b border-[#C5A059]/20">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'text-xs font-serif uppercase tracking-widest transition-all pb-1 border-b-2',
              activeCategory === 'all'
                ? 'text-[#C5A059] border-[#C5A059] font-bold'
                : 'text-[#7A6B63] border-transparent hover:text-[#2C2523]'
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
                  'text-xs font-serif uppercase tracking-widest transition-all pb-1 border-b-2 whitespace-nowrap',
                  isActive
                    ? 'text-[#C5A059] border-[#C5A059] font-bold'
                    : 'text-[#7A6B63] border-transparent hover:text-[#2C2523]'
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
            <div className="flex items-center justify-center gap-3">
              <span className="h-px flex-1 bg-[#C5A059]/30" />
              <h2
                className={clsx('font-bold text-[#C5A059] uppercase tracking-[0.25em]', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
              <span className="h-px flex-1 bg-[#C5A059]/30" />
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#FFFDF9] rounded-lg border border-[#C5A059]/20 hover:border-[#C5A059]/60 transition-all flex justify-between items-start gap-3 shadow-sm"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#C5A059" />
                      <h3
                        className="font-normal text-xs sm:text-sm text-[#2C2523]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#7A6B63] pl-5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#C5A059"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-serif px-2 py-0.5 bg-[#C5A059] text-white rounded hover:bg-[#a8843c]"
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

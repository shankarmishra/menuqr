import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { SpiceHouseAtmosphere } from '../assets/builtInImages';

export const SpiceHouseTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-[#F5EBE6]">
      {/* Header */}
      <div className="text-center pb-3 border-b border-[#E07A5F]/30">
        <span className="text-[9px] font-serif uppercase tracking-[0.35em] text-[#E07A5F] font-bold block mb-1">
          ARTISANAL SPICE & DINING HOUSE
        </span>
        <h1
          className={clsx('font-black text-[#F5EBE6] tracking-wide', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#E07A5F]/80 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <SpiceHouseAtmosphere compact={compact} />

      {/* Earthy Spice Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-serif tracking-wider border rounded transition-all',
              activeCategory === 'all'
                ? 'bg-[#E07A5F] text-white border-[#E07A5F] font-bold'
                : 'bg-[#2C211D] text-[#E07A5F] border-[#E07A5F]/30 hover:border-[#E07A5F]'
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
                  'px-3.5 py-1 text-xs font-serif tracking-wider border rounded transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#E07A5F] text-white border-[#E07A5F] font-bold'
                    : 'bg-[#2C211D] text-[#E07A5F] border-[#E07A5F]/30 hover:border-[#E07A5F]'
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
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E07A5F]/20 pb-1">
              <span className="text-[#E07A5F] text-xs">❖</span>
              <h2
                className={clsx('font-black text-[#E07A5F] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#2C211D]/90 rounded-lg border border-[#E07A5F]/30 hover:border-[#E07A5F] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#E07A5F" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#F5EBE6]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#E07A5F]/70 pl-5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#E07A5F"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E07A5F] text-white rounded hover:bg-[#c45e43]"
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

import React from 'react';
import clsx from 'clsx';
import { LayoutProps } from '../types';
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
    <div className="space-y-6 relative z-10 text-[#E2E8F0]">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-[#C8A962]/40">
        <span className="text-[9px] font-serif uppercase tracking-[0.4em] text-[#C8A962] font-bold block mb-1">
          THE GRAND TABLE DINING ROOM
        </span>
        <h1
          className={clsx('font-black text-[#F8FAFC] tracking-wider uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#C8A962]/80 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <GrandTableAtmosphere compact={compact} />

      {/* Classic Brass Navigation */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2 py-2 border-y border-[#C8A962]/20">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-4 py-1 text-xs font-serif tracking-widest border transition-all',
              activeCategory === 'all'
                ? 'bg-[#C8A962] text-[#0C131D] border-[#C8A962] font-bold'
                : 'text-[#C8A962] border-[#C8A962]/30 hover:border-[#C8A962]'
            )}
          >
            ALL
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-4 py-1 text-xs font-serif tracking-widest border transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#C8A962] text-[#0C131D] border-[#C8A962] font-bold'
                    : 'text-[#C8A962] border-[#C8A962]/30 hover:border-[#C8A962]'
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
            <div className="flex items-center gap-3 border-b border-[#C8A962]/30 pb-1">
              <span className="text-[#C8A962] text-xs">❖</span>
              <h2
                className={clsx('font-black text-[#C8A962] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#141F2E] rounded-lg border border-[#C8A962]/30 hover:border-[#C8A962] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#C8A962" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#F8FAFC]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#94A3B8] pl-5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#C8A962"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#C8A962] text-[#0C131D] rounded hover:bg-[#a88a48]"
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

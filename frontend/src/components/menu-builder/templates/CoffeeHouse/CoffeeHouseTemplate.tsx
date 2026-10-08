import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { CoffeeHouseAtmosphere } from '../assets/builtInImages';

export const CoffeeHouseTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-5 relative z-10 text-[#F5EBE6]">
      {/* Header */}
      <div className="p-4 bg-[#2A211D] rounded-xl border border-[#D4A373]/40 text-center shadow-lg">
        <span className="text-[10px] font-mono tracking-widest text-[#D4A373] uppercase block mb-1">
          ☕ ARTISANAL COFFEE & BAKERY ☕
        </span>
        <h1
          className={clsx('font-black text-[#FEFAE0] tracking-wide', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#D4A373]/80 font-serif italic mt-1">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <CoffeeHouseAtmosphere compact={compact} />

      {/* Amber Badge Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all',
              activeCategory === 'all'
                ? 'bg-[#D4A373] text-[#1C1613] border-[#D4A373]'
                : 'bg-[#2A211D] text-[#D4A373] border-[#D4A373]/30 hover:border-[#D4A373]'
            )}
          >
            ALL COFFEE & FOOD
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-[#D4A373] text-[#1C1613] border-[#D4A373]'
                    : 'bg-[#2A211D] text-[#D4A373] border-[#D4A373]/30 hover:border-[#D4A373]'
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
            <h2
              className={clsx('font-black text-[#D4A373] uppercase tracking-wider border-b border-[#D4A373]/20 pb-1', compact ? 'text-xs' : 'text-sm')}
              style={{ fontFamily: template.typography.heading }}
            >
              {cat.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#2A211D] rounded-lg border border-[#D4A373]/20 hover:border-[#D4A373] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#D4A373" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#FEFAE0]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#D4A373]/70 pl-5 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#D4A373"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#D4A373] text-[#1C1613] rounded hover:bg-[#b88556]"
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

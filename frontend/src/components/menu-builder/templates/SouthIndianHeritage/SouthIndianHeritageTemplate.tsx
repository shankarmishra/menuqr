import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { SouthIndianHeritageAtmosphere } from '../assets/builtInImages';

export const SouthIndianHeritageTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-[#E2C044]">
      {/* Header */}
      <div className="text-center pb-3 border-b border-[#E2C044]/30">
        <div className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#E2C044] font-semibold mb-1">
          ✦ TRADITIONAL DAKSHIN CUISINE ✦
        </div>
        <h1
          className={clsx('font-black text-[#FAF3E0] tracking-wide', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#E2C044]/80 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <SouthIndianHeritageAtmosphere compact={compact} />

      {/* Kolam / Bronze Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-bold font-sans border transition-all rounded-full',
              activeCategory === 'all'
                ? 'bg-[#E2C044] text-[#0F1E16] border-[#E2C044]'
                : 'bg-[#182B21] text-[#E2C044] border-[#E2C044]/30 hover:border-[#E2C044]'
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
                  'px-3.5 py-1 text-xs font-bold font-sans border transition-all rounded-full whitespace-nowrap',
                  isActive
                    ? 'bg-[#E2C044] text-[#0F1E16] border-[#E2C044]'
                    : 'bg-[#182B21] text-[#E2C044] border-[#E2C044]/30 hover:border-[#E2C044]'
                )}
              >
                ● {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E2C044]/20 pb-1">
              <span className="text-[#E2C044] text-xs">❖</span>
              <h2
                className={clsx('font-black text-[#E2C044] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#182B21]/90 rounded-lg border border-[#E2C044]/30 hover:border-[#E2C044] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#E2C044" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#FAF3E0]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#E2C044]/70 pl-5 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#E2C044"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E2C044] text-[#0F1E16] rounded hover:bg-[#c9a836]"
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

import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { BanarasiGoldAtmosphere } from '../assets/builtInImages';

export const BanarasiGoldTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-[#F3E5AB]">
      {/* Header */}
      <div className="text-center pb-3 border-b border-[#F3E5AB]/30">
        <div className="text-[9px] font-serif uppercase tracking-[0.35em] text-[#F3E5AB] font-bold mb-1">
          ✦ Banarasi Silk & Royal Feast ✦
        </div>
        <h1
          className={clsx('font-black text-[#FFF5D1] tracking-wider', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#F3E5AB]/70 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <BanarasiGoldAtmosphere compact={compact} />

      {/* Gold Silk Navigation */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1 text-xs font-serif tracking-widest border transition-all',
              activeCategory === 'all'
                ? 'bg-[#F3E5AB] text-[#190C1E] border-[#F3E5AB] font-bold'
                : 'text-[#F3E5AB] border-[#F3E5AB]/30 hover:border-[#F3E5AB]'
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
                  'px-3.5 py-1 text-xs font-serif tracking-widest border transition-all',
                  isActive
                    ? 'bg-[#F3E5AB] text-[#190C1E] border-[#F3E5AB] font-bold'
                    : 'text-[#F3E5AB] border-[#F3E5AB]/30 hover:border-[#F3E5AB]'
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
            <div className="flex items-center gap-3 border-b border-[#F3E5AB]/20 pb-1">
              <span className="text-[#F3E5AB] text-xs">✦</span>
              <h2
                className={clsx('font-black text-[#F3E5AB] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#2B1533]/80 rounded border border-[#F3E5AB]/30 hover:border-[#F3E5AB] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#F3E5AB" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#FFF5D1]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#F3E5AB]/70 pl-5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#F3E5AB"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#F3E5AB] text-[#190C1E] rounded hover:bg-[#d6c78a]"
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

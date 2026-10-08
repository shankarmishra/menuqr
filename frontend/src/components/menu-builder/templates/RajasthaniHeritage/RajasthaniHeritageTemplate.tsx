import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { RajasthaniHeritageAtmosphere } from '../assets/builtInImages';

export const RajasthaniHeritageTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-[#2B1710]">
      {/* Header */}
      <div className="text-center pb-3 border-b-2 border-[#C85A32]/30">
        <div className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#C85A32] font-bold mb-1">
          ❖ Heritage Dining of Rajasthan ❖
        </div>
        <h1
          className={clsx('font-black text-[#8B2613] tracking-wide', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#694235] mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Atmospheric Art */}
      <RajasthaniHeritageAtmosphere compact={compact} />

      {/* Terracotta Block-Print Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-center flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1 text-xs font-bold font-serif border-2 transition-all rounded-sm',
              activeCategory === 'all'
                ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-md'
                : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40 hover:border-[#C85A32]'
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
                  'px-3 py-1 text-xs font-bold font-serif border-2 transition-all rounded-sm whitespace-nowrap',
                  isActive
                    ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-md'
                    : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40 hover:border-[#C85A32]'
                )}
              >
                ✦ {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[#C85A32] text-xs">❖</span>
              <h2
                className={clsx('font-black text-[#8B2613] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-[#C85A32]/40 via-[#C85A32]/20 to-transparent" />
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#F5EBE6]/80 rounded-md border border-[#C85A32]/30 hover:border-[#C85A32] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#C85A32" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#3E1B10]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#694235] pl-5 leading-relaxed font-serif italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#C85A32"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#C85A32] text-white rounded hover:bg-[#a64522]"
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

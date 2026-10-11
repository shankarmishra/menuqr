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
    <div className="text-[#2B1710] font-serif relative z-10 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center space-y-1 pb-3 border-b-2 border-[#C85A32]/40 bg-[#FAF2EC] border-2 border-[#C85A32]/50 p-4 rounded-md shadow-xl">
        <div className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#C85A32] font-bold">
          ✦ ROYAL HOUSE OF RAJPUTANA ✦
        </div>
        <h1
          className={clsx('font-black text-[#8B2613] tracking-wide', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#694235] font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Sticky Mobile Category Bar */}
      {!compact && rawCategories.length > 1 && (
        <div className="sticky top-12 z-30 lg:hidden bg-[#FAF2EC]/95 backdrop-blur-md py-2 px-1 border-y-2 border-[#C85A32]/40 shadow-md overflow-x-auto scrollbar-none flex gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1 text-xs font-bold font-serif border-2 transition-all rounded-sm shrink-0',
              activeCategory === 'all'
                ? 'bg-[#C85A32] text-white border-[#C85A32]'
                : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40'
            )}
          >
            ✦ ALL
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs font-bold font-serif border-2 transition-all rounded-sm shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#C85A32] text-white border-[#C85A32]'
                    : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40'
                )}
              >
                ✦ {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid Container */}
      <div className={clsx(compact ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Desktop Sidebar (35%) */}
        {!compact && (
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#FAF2EC] border-2 border-[#C85A32]/50 p-5 rounded-md shadow-xl">
            <RajasthaniHeritageAtmosphere compact={compact} />

            {rawCategories.length > 1 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[9px] font-serif uppercase tracking-[0.3em] font-bold text-[#C85A32] block text-center mb-1">CATEGORIES</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={clsx(
                      'px-3.5 py-2 text-xs font-bold font-serif border-2 transition-all text-left flex items-center justify-between rounded-sm',
                      activeCategory === 'all'
                        ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-md'
                        : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40 hover:border-[#C85A32]'
                    )}
                  >
                    <span>✦ ALL DISHES</span>
                  </button>
                  {rawCategories.map((cat) => {
                    const isActive = activeCategory === cat.id || activeCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={clsx(
                          'px-3.5 py-2 text-xs font-bold font-serif border-2 transition-all text-left flex items-center justify-between rounded-sm whitespace-nowrap',
                          isActive
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-md'
                            : 'bg-[#F5EBE6] text-[#8B2613] border-[#C85A32]/40 hover:border-[#C85A32]'
                        )}
                      >
                        <span>✦ {cat.name}</span>
                        <span className="text-[10px] opacity-75">({cat.items.length})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Content Spread (65% Desktop, 100% Mobile) */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#FAF2EC] border-2 border-[#C85A32]/50 p-4 sm:p-6 rounded-md shadow-xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-[#C85A32]/40 pb-1">
                <span className="text-[#C85A32] text-xs">❖</span>
                <h2
                  className={clsx('font-black text-[#8B2613] uppercase tracking-widest', compact ? 'text-xs' : 'text-xs sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[#C85A32]/40 via-[#C85A32]/20 to-transparent" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#C85A32]/20 hover:border-[#C85A32]/60 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#C85A32" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-[#3E1B10] group-hover:text-[#8B2613] transition-colors"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className="flex-1 border-b border-dotted border-[#C85A32]/40 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#C85A32"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#C85A32] text-white rounded hover:bg-[#a64522]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#694235] pl-5 mt-0.5 leading-relaxed font-serif italic">
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

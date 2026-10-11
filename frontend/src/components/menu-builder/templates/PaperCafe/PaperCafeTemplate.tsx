import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { PaperCafeAtmosphere } from '../assets/builtInImages';

export const PaperCafeTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#3A2E2B] font-mono relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className={clsx(compact ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column: Recycled Kraft Paper Identity */}
        <div className={clsx(compact ? 'space-y-3 bg-[#FBF6F0] border-2 border-[#8C6D53]/40 p-4 rounded shadow-xl' : 'lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#FBF6F0] border-2 border-[#8C6D53]/40 p-5 rounded shadow-xl')}>
          <div className="text-center space-y-1 pb-3 border-b-2 border-[#8C6D53]/40">
            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#8C6D53] font-bold block">
              CRAFT PRINT & KITCHEN
            </span>
            <h1
              className={clsx('font-black text-[#2B211E] tracking-tight uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-[#8C6D53] font-mono italic">{restaurant.tagline}</p>}
          </div>

          <PaperCafeAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-[#8C6D53] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all text-left flex items-center justify-between border-b-2',
                    activeCategory === 'all'
                      ? 'text-[#8C6D53] border-[#8C6D53] font-bold'
                      : 'text-[#8C6D53]/60 border-transparent hover:text-[#2B211E]'
                  )}
                >
                  <span>[ALL ITEMS]</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all text-left flex items-center justify-between border-b-2 whitespace-nowrap',
                        isActive
                          ? 'text-[#8C6D53] border-[#8C6D53] font-bold'
                          : 'text-[#8C6D53]/60 border-transparent hover:text-[#2B211E]'
                      )}
                    >
                      <span>[{cat.name}]</span>
                      <span className="text-[10px] opacity-70">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Kraft Menu Spread */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-[#FBF6F0] border-2 border-[#8C6D53]/40 p-4 sm:p-6 rounded shadow-xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-[#8C6D53]/40 pb-1">
                <h2
                  className={clsx('font-bold font-mono text-[#8C6D53] uppercase tracking-widest', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  # {cat.name}
                </h2>
                <div className="flex-1 h-px bg-[#8C6D53]/30" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#8C6D53]/20 hover:border-[#8C6D53]/60 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#8C6D53" />
                        <h3
                          className={clsx('font-bold text-xs sm:text-sm text-[#2B211E] group-hover:text-[#8C6D53] transition-colors', compact ? 'leading-snug' : 'truncate')}
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dashed Leader Line */}
                      <span className={clsx(!compact && 'hidden sm:inline-block', 'flex-1 border-b border-dashed border-[#8C6D53]/40 mx-2')} />

                      <RenderItemPrices
                        item={item}
                        accentColor="#8C6D53"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#8C6D53] text-white rounded hover:bg-[#70543e]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#635147] pl-5 mt-0.5 leading-relaxed font-mono">
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

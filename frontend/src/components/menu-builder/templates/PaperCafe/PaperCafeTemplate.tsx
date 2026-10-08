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
    <div className="space-y-6 relative z-10 text-[#3A2E2B]">
      {/* Header */}
      <div className="text-center pb-4 border-b-2 border-[#8C6D53]/40">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#8C6D53] font-bold block mb-1">
          CRAFT PRINT & KITCHEN
        </span>
        <h1
          className={clsx('font-black text-[#2B211E] tracking-tight uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#8C6D53] font-mono mt-1 italic">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <PaperCafeAtmosphere compact={compact} />

      {/* Typewriter Nav */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-3 py-2 border-b border-[#8C6D53]/20">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'text-xs font-mono uppercase tracking-wider transition-all pb-0.5 border-b-2',
              activeCategory === 'all'
                ? 'text-[#8C6D53] border-[#8C6D53] font-bold'
                : 'text-[#8C6D53]/60 border-transparent hover:text-[#2B211E]'
            )}
          >
            [ALL]
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'text-xs font-mono uppercase tracking-wider transition-all pb-0.5 border-b-2 whitespace-nowrap',
                  isActive
                    ? 'text-[#8C6D53] border-[#8C6D53] font-bold'
                    : 'text-[#8C6D53]/60 border-transparent hover:text-[#2B211E]'
                )}
              >
                [{cat.name}]
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
              className={clsx('font-bold font-mono text-[#8C6D53] uppercase tracking-widest border-b border-[#8C6D53]/30 pb-1', compact ? 'text-xs' : 'text-sm')}
              style={{ fontFamily: template.typography.heading }}
            >
              # {cat.name}
            </h2>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#FBF6F0] rounded border border-[#8C6D53]/30 hover:border-[#8C6D53] transition-all flex justify-between items-start gap-3 shadow-sm"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#8C6D53" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-[#2B211E]"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-[#635147] pl-5 leading-relaxed font-mono">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#8C6D53"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#8C6D53] text-white rounded hover:bg-[#70543e]"
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

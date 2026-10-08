import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { MaisonNoirAtmosphere } from '../assets/builtInImages';

export const MaisonNoirTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-[#E0E0E0]">
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#C5A059]/30">
        <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-[#C5A059] block mb-1">
          HAUTE CUISINE & EDITORIAL
        </span>
        <h1
          className={clsx('font-light text-[#F5F5F5] tracking-widest uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#C5A059]/80 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <MaisonNoirAtmosphere compact={compact} />

      {/* Extreme Typographic Discipline Nav */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-4 py-2 border-y border-white/10 my-4">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'text-xs font-mono uppercase tracking-widest transition-all',
              activeCategory === 'all' ? 'text-[#C5A059] font-bold underline' : 'text-white/40 hover:text-white'
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
                  'text-xs font-mono uppercase tracking-widest transition-all whitespace-nowrap',
                  isActive ? 'text-[#C5A059] font-bold underline' : 'text-white/40 hover:text-white'
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-1">
              <h2
                className={clsx('font-light text-[#C5A059] uppercase tracking-[0.3em]', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
              <span className="text-[10px] font-mono text-white/30">SECT. {cat.id.slice(0, 3)}</span>
            </div>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-[#161618] rounded-lg border border-white/5 hover:border-[#C5A059]/40 transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#C5A059" />
                      <h3
                        className="font-normal text-xs sm:text-sm text-white tracking-wide"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-white/50 pl-5 leading-relaxed font-sans font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#C5A059"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-mono px-2 py-0.5 border border-[#C5A059] text-[#C5A059] rounded hover:bg-[#C5A059] hover:text-black"
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

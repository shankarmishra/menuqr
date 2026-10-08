import React from 'react';
import clsx from 'clsx';
import { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { MinimalEditorialAtmosphere } from '../assets/builtInImages';

export const MinimalEditorialTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-6 relative z-10 text-black">
      {/* Header */}
      <div className="text-center pb-4 border-b border-black/10">
        <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-black/60 block mb-1">
          INTERNATIONAL EDITORIAL MENU
        </span>
        <h1
          className={clsx('font-light text-black tracking-tight uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-black/50 font-light italic mt-1">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <MinimalEditorialAtmosphere compact={compact} />

      {/* Swiss Monochrome Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-4 py-2 border-b border-black/10">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'text-xs font-sans uppercase tracking-widest transition-all pb-1 border-b-2',
              activeCategory === 'all'
                ? 'text-black border-black font-bold'
                : 'text-black/40 border-transparent hover:text-black'
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
                  'text-xs font-sans uppercase tracking-widest transition-all pb-1 border-b-2 whitespace-nowrap',
                  isActive
                    ? 'text-black border-black font-bold'
                    : 'text-black/40 border-transparent hover:text-black'
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
            <h2
              className={clsx('font-bold text-black uppercase tracking-[0.2em] pb-1 border-b border-black/15', compact ? 'text-xs' : 'text-sm')}
              style={{ fontFamily: template.typography.heading }}
            >
              {cat.name}
            </h2>

            <div className="space-y-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded border border-black/10 hover:border-black/30 transition-all flex justify-between items-start gap-3 shadow-xs"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#000000" />
                      <h3
                        className="font-medium text-xs sm:text-sm text-black"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-black/60 pl-5 leading-relaxed font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#000000"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-bold px-2 py-0.5 border border-black text-black rounded hover:bg-black hover:text-white"
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

import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { BombayStreetAtmosphere } from '../assets/builtInImages';

export const BombayStreetTemplate: React.FC<LayoutProps> = ({
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
    <div className="space-y-5 relative z-10 text-[#F5F5F5]">
      {/* Header */}
      <div className="p-4 bg-[#262626] rounded-md border-2 border-[#EAB308] text-center shadow-lg">
        <span className="text-[10px] font-black tracking-widest text-[#EAB308] uppercase block mb-1">
          BOMBAY URBAN STREET FOOD
        </span>
        <h1
          className={clsx('font-black text-white uppercase tracking-tight', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs text-[#EAB308] font-bold mt-1">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <BombayStreetAtmosphere compact={compact} />

      {/* Urban Poster Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-black uppercase rounded border-2 transition-all shrink-0',
              activeCategory === 'all'
                ? 'bg-[#EAB308] text-black border-[#EAB308] shadow'
                : 'bg-[#262626] text-white border-white/20 hover:border-[#EAB308]'
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
                  'px-3.5 py-1.5 text-xs font-black uppercase rounded border-2 transition-all shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#EAB308] text-black border-[#EAB308] shadow'
                    : 'bg-[#262626] text-white border-white/20 hover:border-[#EAB308]'
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
            <div className="flex items-center gap-2 border-b-2 border-[#EAB308] pb-1">
              <span className="text-[#EAB308] font-black text-sm">✦</span>
              <h2
                className={clsx('font-black text-[#EAB308] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm')}
                style={{ fontFamily: template.typography.heading }}
              >
                {cat.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#262626] rounded border border-white/10 hover:border-[#EAB308] transition-all flex justify-between items-start gap-3"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <DietIndicator type={item.dietType} compact={compact} color="#EAB308" />
                      <h3
                        className="font-bold text-xs sm:text-sm text-white"
                        style={{ fontFamily: template.typography.body }}
                      >
                        {item.name}
                      </h3>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-white/70 pl-5 leading-tight font-sans">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <RenderItemPrices
                    item={item}
                    accentColor="#EAB308"
                    onAddToCart={onAddToCart}
                    isPremium={isPremium}
                    btnStyle="text-[10px] font-black px-2 py-0.5 bg-[#EAB308] text-black rounded hover:bg-yellow-400"
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

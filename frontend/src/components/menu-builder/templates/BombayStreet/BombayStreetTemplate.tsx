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
    <div className="text-white font-sans relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Urban Poster Identity (35% on Desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-[#262626] border-2 border-[#EAB308] p-5 rounded-md shadow-2xl">
          <div className="text-center space-y-2 pb-3 border-b-2 border-[#EAB308]">
            <span className="text-[10px] font-black tracking-widest text-[#EAB308] uppercase block">
              BOMBAY URBAN STREET FOOD
            </span>
            <h1
              className={clsx('font-black text-white uppercase tracking-tight', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs text-[#EAB308] font-bold">{restaurant.tagline}</p>}
          </div>

          <BombayStreetAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#EAB308] block text-center mb-1">CATEGORIES</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-black uppercase rounded border-2 transition-all text-left flex items-center justify-between',
                    activeCategory === 'all'
                      ? 'bg-[#EAB308] text-black border-[#EAB308] shadow'
                      : 'bg-[#171717] text-white border-white/20 hover:border-[#EAB308]'
                  )}
                >
                  <span>ALL STREET ITEMS</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-black uppercase rounded border-2 transition-all text-left flex items-center justify-between whitespace-nowrap',
                        isActive
                          ? 'bg-[#EAB308] text-black border-[#EAB308] shadow'
                          : 'bg-[#171717] text-white border-white/20 hover:border-[#EAB308]'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-80">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Urban Poster Spread (65% on Desktop) */}
        <div className="lg:col-span-8 bg-[#262626] border-2 border-[#EAB308] p-4 sm:p-6 rounded-md shadow-2xl space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-2 border-b-2 border-[#EAB308] pb-1">
                <span className="text-[#EAB308] font-black text-sm">✦</span>
                <h2
                  className={clsx('font-black text-[#EAB308] uppercase tracking-wider', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-0.5 bg-[#EAB308]/40" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-white/10 hover:border-[#EAB308]/50 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#EAB308" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-white group-hover:text-[#EAB308] transition-colors truncate"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className="flex-1 border-b border-dotted border-white/20 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#EAB308"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-black px-2 py-0.5 bg-[#EAB308] text-black rounded hover:bg-yellow-400"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-white/70 pl-5 mt-0.5 leading-tight font-sans">
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

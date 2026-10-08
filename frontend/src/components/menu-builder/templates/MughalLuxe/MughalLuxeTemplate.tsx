import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { MughalLuxeAtmosphere } from '../assets/builtInImages';

export const MughalLuxeTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#E5C158] font-serif relative z-10 space-y-6">
      {/* Editorial Menu Spread Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* Left Column: Emerald Arch Identity (35% on Desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-gradient-to-b from-[#132D24] to-[#0A1813] border-2 border-[#E5C158]/50 p-5 rounded-lg shadow-2xl">
          <div className="text-center space-y-2 pb-4 border-b border-[#E5C158]/30">
            <div className="w-12 h-6 border-t-2 border-x-2 border-[#E5C158]/60 rounded-t-full mx-auto" />
            <h1
              className={clsx('font-black text-[#F3E5AB] tracking-widest uppercase', compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl')}
              style={{ fontFamily: template.typography.heading }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && <p className="text-xs italic text-[#E5C158]/70 font-serif">{restaurant.tagline}</p>}
          </div>

          <MughalLuxeAtmosphere compact={compact} />

          {!compact && rawCategories.length > 1 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-serif uppercase tracking-[0.3em] font-bold text-[#E5C158]/80 block text-center mb-1">IMPERIAL SECTIONS</span>
              <div className="flex lg:flex-col flex-wrap gap-1.5 justify-center">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={clsx(
                    'px-3.5 py-1.5 text-xs font-serif tracking-widest transition-all text-left flex items-center justify-between rounded-t-full border',
                    activeCategory === 'all'
                      ? 'bg-[#E5C158] text-[#0A1813] border-[#E5C158] font-bold shadow-md'
                      : 'text-[#E5C158] border-[#E5C158]/30 hover:border-[#E5C158] bg-[#132D24]/50'
                  )}
                >
                  <span>All Dishes</span>
                </button>
                {rawCategories.map((cat) => {
                  const isActive = activeCategory === cat.id || activeCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={clsx(
                        'px-3.5 py-1.5 text-xs font-serif tracking-widest transition-all text-left flex items-center justify-between rounded-t-full border whitespace-nowrap',
                        isActive
                          ? 'bg-[#E5C158] text-[#0A1813] border-[#E5C158] font-bold shadow-md'
                          : 'text-[#E5C158] border-[#E5C158]/30 hover:border-[#E5C158] bg-[#132D24]/50'
                      )}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] opacity-70">({cat.items.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Printed Mughal Menu Spread (65% on Desktop) */}
        <div className="lg:col-span-8 bg-gradient-to-br from-[#112921]/95 to-[#0A1813]/98 border-2 border-[#E5C158]/50 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#E5C158]/30 pb-1">
                <span className="text-[#E5C158] text-xs">❖</span>
                <h2
                  className={clsx('font-black text-[#F3E5AB] uppercase tracking-[0.25em]', compact ? 'text-xs' : 'text-sm sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#E5C158]/40 to-transparent" />
              </div>

              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#E5C158]/15 hover:border-[#E5C158]/40 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#E5C158" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-[#F3E5AB] group-hover:text-[#E5C158] transition-colors truncate"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className="flex-1 border-b border-dotted border-[#E5C158]/40 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#E5C158"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#E5C158] text-[#0A1813] rounded hover:bg-[#c9a63c]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#E5C158]/70 pl-5 mt-0.5 leading-relaxed font-serif italic">
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

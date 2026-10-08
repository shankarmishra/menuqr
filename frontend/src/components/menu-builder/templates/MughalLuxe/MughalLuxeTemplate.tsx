import React from 'react';
import clsx from 'clsx';
import { LayoutProps } from '../types';
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
    <div className="space-y-6 relative z-10 text-[#E5C158]">
      {/* Header */}
      <div className="text-center pb-4 pt-1">
        <div className="w-12 h-6 border-t-2 border-x-2 border-[#E5C158]/50 rounded-t-full mx-auto mb-2" />
        <h1
          className={clsx('font-black text-[#F3E5AB] tracking-widest uppercase', compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl')}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && <p className="text-xs italic text-[#E5C158]/70 mt-1 font-serif">{restaurant.tagline}</p>}
      </div>

      {/* Built-in Art */}
      <MughalLuxeAtmosphere compact={compact} />

      {/* Emerald Arch Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2 py-2 border-y border-[#E5C158]/30 my-4">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-4 py-1.5 text-xs font-serif tracking-widest transition-all rounded-t-full border',
              activeCategory === 'all'
                ? 'bg-[#E5C158] text-[#0B1A15] border-[#E5C158] font-bold shadow-md shadow-[#E5C158]/20'
                : 'text-[#E5C158] border-[#E5C158]/30 hover:border-[#E5C158] bg-[#112921]/50'
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
                  'px-4 py-1.5 text-xs font-serif tracking-widest transition-all rounded-t-full border',
                  isActive
                    ? 'bg-[#E5C158] text-[#0B1A15] border-[#E5C158] font-bold shadow-md shadow-[#E5C158]/20'
                    : 'text-[#E5C158] border-[#E5C158]/30 hover:border-[#E5C158] bg-[#112921]/50'
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
            <div className="text-center relative py-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-[#E5C158]/30" />
              </div>
              <span className="relative z-10 bg-[#0B1A15] px-4 text-xs font-serif tracking-[0.25em] text-[#E5C158] uppercase font-bold border border-[#E5C158]/40 rounded-full py-0.5">
                {cat.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-gradient-to-b from-[#112921] to-[#0B1A15] rounded-lg border border-[#E5C158]/30 hover:border-[#E5C158] transition-all"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <DietIndicator type={item.dietType} compact={compact} color="#E5C158" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-[#F3E5AB]"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-[#E5C158]/70 pl-5 leading-relaxed font-serif italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <RenderItemPrices
                      item={item}
                      accentColor="#E5C158"
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                      btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#E5C158] text-[#0B1A15] rounded hover:bg-[#c9a63c]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

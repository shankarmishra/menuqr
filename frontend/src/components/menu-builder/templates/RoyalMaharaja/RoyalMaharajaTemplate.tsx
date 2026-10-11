import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../types';
import { DietIndicator, RenderItemPrices } from '../shared/RenderItemPrices';
import { RoyalMaharajaAtmosphere } from '../assets/builtInImages';

export const RoyalMaharajaTemplate: React.FC<LayoutProps> = ({
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
    <div className="text-[#FAF3E0] font-serif relative z-10 space-y-4 sm:space-y-6">
      {/* Mobile-First Header & Masthead */}
      <div className="text-center space-y-1.5 pb-3 border-b border-[#D4AF37]/30 bg-gradient-to-b from-[#2A111F]/90 to-[#180912]/95 border-2 border-[#D4AF37]/40 p-4 rounded-lg shadow-xl">
        <div className="flex justify-center items-center gap-2 text-[#D4AF37]">
          <span className="h-px w-6 bg-[#D4AF37]/60" />
          <span className="text-[9px] uppercase tracking-[0.35em] font-bold text-[#D4AF37]">Palace Dining</span>
          <span className="h-px w-6 bg-[#D4AF37]/60" />
        </div>
        <h1
          className={clsx(
            'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] via-[#D4AF37] to-[#AA7C11]',
            compact ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
          )}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="text-xs italic text-[#FAF3E0]/70 font-serif tracking-widest">{restaurant.tagline}</p>
        )}
      </div>

      {/* Sticky Mobile Category Navigation Bar (Horizontally scrollable) */}
      {!compact && rawCategories.length > 1 && (
        <div className="sticky top-12 z-30 lg:hidden bg-[#180912]/95 backdrop-blur-md py-2 px-1 border-y border-[#D4AF37]/30 shadow-md overflow-x-auto scrollbar-none flex gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3 py-1 text-xs uppercase tracking-widest border transition-all rounded-full shrink-0 font-bold',
              activeCategory === 'all'
                ? 'bg-[#D4AF37] text-[#180912] border-[#D4AF37]'
                : 'text-[#D4AF37] border-[#D4AF37]/40 bg-[#180912]'
            )}
          >
            ❖ All
          </button>
          {rawCategories.map((cat) => {
            const isActive = activeCategory === cat.id || activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  'px-3 py-1 text-xs uppercase tracking-widest border transition-all rounded-full shrink-0 whitespace-nowrap',
                  isActive
                    ? 'bg-[#D4AF37] text-[#180912] border-[#D4AF37] font-bold'
                    : 'text-[#D4AF37] border-[#D4AF37]/40 bg-[#180912]'
                )}
              >
                ❖ {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Grid: Desktop Split View / Mobile Direct Menu Flow */}
      <div className={clsx(compact ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start')}>
        
        {/* Left Column (Desktop Only Sidebar - 35%) */}
        {!compact && (
          <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-8 space-y-5 bg-gradient-to-b from-[#2A111F]/90 to-[#180912]/95 border-2 border-[#D4AF37]/40 p-5 rounded-lg shadow-2xl">
            <RoyalMaharajaAtmosphere compact={compact} />

            {rawCategories.length > 1 && (
              <div className="space-y-1 pt-2">
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#D4AF37]/70 block text-center mb-2">Categories</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCategory('all')}
                    className={clsx(
                      'px-3.5 py-2 text-xs uppercase tracking-widest border transition-all text-left flex items-center justify-between rounded-sm',
                      activeCategory === 'all'
                        ? 'bg-[#D4AF37] text-[#180912] border-[#D4AF37] font-bold shadow-md'
                        : 'text-[#D4AF37] border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#180912]/40'
                    )}
                  >
                    <span>❖ All Dishes</span>
                  </button>
                  {rawCategories.map((cat) => {
                    const isActive = activeCategory === cat.id || activeCategory === cat.name;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={clsx(
                          'px-3.5 py-2 text-xs uppercase tracking-widest border transition-all text-left flex items-center justify-between rounded-sm whitespace-nowrap',
                          isActive
                            ? 'bg-[#D4AF37] text-[#180912] border-[#D4AF37] font-bold shadow-md'
                            : 'text-[#D4AF37] border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#180912]/40'
                        )}
                      >
                        <span>❖ {cat.name}</span>
                        <span className="text-[10px] opacity-75">({cat.items.length})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Printed Restaurant Menu Spread (65% on Desktop, Full Width on Mobile) */}
        <div className={clsx(!compact && 'lg:col-span-8', 'bg-gradient-to-br from-[#230C19]/95 via-[#180912]/98 to-[#10040B]/95 border-2 border-[#D4AF37]/40 p-4 sm:p-6 rounded-lg shadow-2xl space-y-8')}>
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 py-2 border-b-2 border-[#D4AF37]/40">
                <span className="text-[#D4AF37] text-xs">❖</span>
                <h2
                  className={clsx('font-extrabold text-[#D4AF37] uppercase tracking-[0.2em]', compact ? 'text-xs' : 'text-xs sm:text-base')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/50 to-transparent" />
              </div>

              {/* Menu Item Listing */}
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="group py-1.5 border-b border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-[#FFF5D1] group-hover:text-[#D4AF37] transition-colors"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>

                      {/* Dotted Leader Line */}
                      <span className="flex-1 border-b border-dotted border-[#D4AF37]/40 mx-2 hidden sm:inline-block" />

                      <RenderItemPrices
                        item={item}
                        accentColor="#D4AF37"
                        onAddToCart={onAddToCart}
                        isPremium={isPremium}
                        btnStyle="text-[9px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#180912] rounded hover:bg-[#b59226]"
                      />
                    </div>

                    {item.description && (
                      <p className="text-[11px] text-[#FAF3E0]/70 pl-5 mt-0.5 leading-relaxed font-serif italic">
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

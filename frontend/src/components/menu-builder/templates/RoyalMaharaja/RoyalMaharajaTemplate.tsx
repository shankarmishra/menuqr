import React from 'react';
import clsx from 'clsx';
import { LayoutProps } from '../types';
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
    <div className="space-y-6 relative z-10 text-[#FAF3E0]">
      {/* Header */}
      <div className="relative text-center pb-4 pt-2">
        <div className="flex justify-center items-center gap-2 mb-2 text-[#D4AF37]">
          <span className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <span className="text-[9px] font-serif uppercase tracking-[0.35em] font-bold text-[#D4AF37]">Palace Dining</span>
          <span className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>
        <h1
          className={clsx(
            'font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] via-[#D4AF37] to-[#AA7C11]',
            compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-5xl'
          )}
          style={{ fontFamily: template.typography.heading }}
        >
          {restaurant.name}
        </h1>
        {restaurant.tagline && (
          <p className="text-xs italic text-[#FAF3E0]/70 mt-1 font-serif tracking-widest">{restaurant.tagline}</p>
        )}
      </div>

      {/* Built-in Atmospheric Art Panel */}
      <RoyalMaharajaAtmosphere compact={compact} />

      {/* Category Navigation: Brass Framed Arch Tabs */}
      {!compact && rawCategories.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 py-2 border-y border-[#D4AF37]/30 my-4">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={clsx(
              'px-3.5 py-1.5 text-xs font-serif uppercase tracking-widest border transition-all rounded-t-lg',
              activeCategory === 'all'
                ? 'bg-[#D4AF37] text-[#1A0B13] border-[#D4AF37] font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'text-[#D4AF37] border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#1A0B13]/60'
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
                  'px-3.5 py-1.5 text-xs font-serif uppercase tracking-widest border transition-all rounded-t-lg',
                  isActive
                    ? 'bg-[#D4AF37] text-[#1A0B13] border-[#D4AF37] font-bold shadow-lg shadow-[#D4AF37]/20'
                    : 'text-[#D4AF37] border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#1A0B13]/60'
                )}
              >
                ❖ {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Categories & Items */}
      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <div className="flex items-center justify-center py-1.5 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
              </div>
              <div className="bg-[#1A0B13] px-4 py-1 border border-[#D4AF37]/50 rounded-sm relative z-10 flex items-center gap-2">
                <span className="text-[#D4AF37] text-[9px]">❖</span>
                <h2
                  className={clsx('font-extrabold text-[#D4AF37] uppercase tracking-[0.2em]', compact ? 'text-xs' : 'text-sm')}
                  style={{ fontFamily: template.typography.heading }}
                >
                  {cat.name}
                </h2>
                <span className="text-[#D4AF37] text-[9px]">❖</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {cat.items.map((item) => (
                <div
                  key={item.id}
                  className="relative group p-3.5 rounded-tr-2xl rounded-bl-2xl bg-gradient-to-br from-[#2A111F]/90 to-[#1A0B13]/95 border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <DietIndicator type={item.dietType} compact={compact} color="#D4AF37" />
                        <h3
                          className="font-bold text-xs sm:text-sm text-[#FFF5D1] group-hover:text-[#D4AF37] transition-colors"
                          style={{ fontFamily: template.typography.body }}
                        >
                          {item.name}
                        </h3>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-[#FAF3E0]/70 pl-5 leading-relaxed font-serif italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <RenderItemPrices
                      item={item}
                      accentColor="#D4AF37"
                      onAddToCart={onAddToCart}
                      isPremium={isPremium}
                      btnStyle="text-[10px] font-bold px-2 py-0.5 bg-[#D4AF37] text-[#1A0B13] rounded hover:bg-[#b59226]"
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

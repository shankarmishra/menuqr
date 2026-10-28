import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { NauticalMaritimeBg, CutoutLimeSlice } from '../artwork/FoodDoodleBackgrounds';
import { Phone, Globe, BookOpen, Utensils, Plus, Anchor, Waves } from 'lucide-react';

export const CoastalSeafoodTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const heroSeafoodPhoto = 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'; // seafood platter
  const oysterPhoto = 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80'; // grilled fish

  return (
    <div 
      className="w-full relative min-h-screen bg-[#F4F8FA] text-[#223038] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Nautical Maritime Background */}
      <NauticalMaritimeBg opacity={0.14} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#0B2545]/90 backdrop-blur-md p-1 rounded-full border border-cyan-400/30 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#00838F] text-white shadow-md font-bold'
                : 'text-cyan-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Raw Bar Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#00838F] text-white shadow-md font-bold'
                : 'text-cyan-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Seafood Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: AEGEAN PORTHOLE RAW BAR COVER                       */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Nautical Crest */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#00838F] font-black flex items-center gap-1">
              <Anchor size={12} /> Wild Caught Daily
            </span>
            <div className="px-2.5 py-1 rounded-full bg-[#0D47A1]/10 text-[#0D47A1] text-[10px] font-black tracking-wider uppercase border border-[#0D47A1]/20">
              Raw Bar
            </div>
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#0D47A1] text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
              <Waves size={12} /> MEDITERRANEAN COASTAL
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-serif text-[#0B2545] font-black tracking-tight leading-none mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Catch & Raw Bar
            </h1>
          </div>

          {/* Brass Porthole Frame with Oysters & Lemon */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#C8D5DB] p-2 bg-[#E1EAF0] shadow-xl relative">
              {/* Brass Rivet Dots */}
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#00838F]/40 pointer-events-none" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-400 shadow-inner">
                <img 
                  src={heroSeafoodPhoto} 
                  alt="Seafood Platter" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Lime Cutout */}
              <CutoutLimeSlice className="absolute -bottom-2 -left-2 w-14 rotate-[-15deg] z-20" />
            </div>

            {/* Quality Badge */}
            <div className="absolute -bottom-2 right-1 bg-[#0D47A1] text-white font-mono text-[10px] font-black px-3 py-1 rounded-full shadow-md border border-cyan-300">
              Fresh Oysters on Ice
            </div>
          </div>

          {/* Sunset Raw Bar Promo Card */}
          <div className="w-full bg-white border border-[#C8D5DB] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div>
                <h3 className="text-xs font-black text-[#0D47A1] uppercase">Sunset Catch Hour 4-7pm</h3>
                <p className="text-[11px] text-stone-600">Half dozen oysters with mignonette & crisp white wine</p>
              </div>
              <span className="text-xs font-black text-[#00838F] font-mono">$14.00</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#0D47A1]" />
                {restaurant.phone || '+30 2289 023456'}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={11} className="text-[#0D47A1]" />
                coastalseafood.menuqr
              </span>
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-[#0D47A1] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#0A3882] transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Coastal Raw Bar</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: SEASIDE RAW BAR MENU LISTINGS                       */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-[#0D47A1]/20">
            <span className="text-[10px] font-mono text-[#00838F] uppercase tracking-widest font-black">
              Daily Coastal Catch
            </span>
            <h2 className="text-xl font-serif text-[#0D47A1] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name || 'Aegean Blue Raw Bar'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Navy Pill */}
              <div className="flex items-center gap-2">
                <div className="bg-[#0D47A1] text-white px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Waves size={12} className="text-cyan-300" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-px bg-[#0D47A1]/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-[#C8D5DB] hover:border-[#0D47A1]/50 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#00838F]">
                            0{idx + 1}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#0B2545] group-hover:text-[#0D47A1] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <RenderItemPrices item={item} accentColor="#0D47A1" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-[#C8D5DB] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#00838F] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#00695C] transition-colors"
                          >
                            <Plus size={10} />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Spotlight Catch Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#0D47A1] text-white flex items-center justify-between gap-3 shadow-md">
            <img src={oysterPhoto} alt="Grilled Catch" className="w-14 h-14 rounded-xl object-cover border border-cyan-400/40" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 font-bold">Chef Catch</span>
              <div className="text-xs font-bold truncate">Wood-Grilled Mediterranean Seabass</div>
              <div className="text-[10px] text-stone-300">Served with capers & lemon butter emulsion</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-cyan-300">$24.00</span>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#0D47A1] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Raw Bar Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { BotanicalOrganicBg, CutoutBasilLeaf } from '../artwork/FoodDoodleBackgrounds';
import { Phone, Globe, BookOpen, Utensils, Plus, Leaf } from 'lucide-react';

export const GreenhouseBotanicTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const heroBowlPhoto = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'; // salad
  const pokeBowlPhoto = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80'; // healthy bowl

  return (
    <div 
      className="w-full relative min-h-screen bg-[#F6FAF4] text-[#2A362B] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Botanical Leaf Silhouette Background */}
      <BotanicalOrganicBg opacity={0.16} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#1C2C1E]/90 backdrop-blur-md p-1 rounded-full border border-green-500/30 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#2E7D32] text-white shadow-md font-bold'
                : 'text-green-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Organic Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#2E7D32] text-white shadow-md font-bold'
                : 'text-green-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Greenhouse Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: BOTANICA GREEN COVER                                */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Botanical Wax Seal Emblem */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#2E7D32] font-black flex items-center gap-1">
              <Leaf size={12} /> 100% Certified Organic
            </span>
            <div className="w-10 h-10 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-md">
              <Leaf size={18} />
            </div>
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#558B2F] text-xs font-black tracking-widest uppercase">
              PLANT-FORWARD & WHOLESOME
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-serif text-[#2E7D32] font-black tracking-tight leading-none mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Botanica Kitchen
            </h1>
          </div>

          {/* Circular Garden Bowl Frame */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#D2E2D3] p-2 bg-[#EAF2E8] shadow-xl relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-green-600/30 shadow-inner">
                <img 
                  src={heroBowlPhoto} 
                  alt="Superfood Bowl" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Basil Leaf Cutout */}
              <CutoutBasilLeaf className="absolute -bottom-2 -left-2 w-12 rotate-[20deg] z-20" />
            </div>

            {/* Quality Stamp */}
            <div className="absolute -bottom-2 right-1 bg-[#2E7D32] text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
              Farm-to-Table
            </div>
          </div>

          {/* Mindful Morning Promo Card */}
          <div className="w-full bg-white border border-[#D2E2D3] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div>
                <h3 className="text-xs font-black text-[#2E7D32] uppercase">Mindful Morning Combo</h3>
                <p className="text-[11px] text-stone-600">Açaí Superfood bowl + 12oz Cold-Pressed Green Glow juice</p>
              </div>
              <span className="text-xs font-bold text-[#2E7D32] font-mono">$13.50</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#2E7D32]" />
                {restaurant.phone || '+1 (415) 890-3412'}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={11} className="text-[#2E7D32]" />
                botanica.menuqr
              </span>
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-[#2E7D32] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#256829] transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Clean Bowl Menu</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: MODERN ORGANIC WELLNESS CARDS                       */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-[#2E7D32]/20">
            <span className="text-[10px] font-mono text-[#558B2F] uppercase tracking-widest font-black">
              Pure Nutritional Craft
            </span>
            <h2 className="text-xl font-serif text-[#2E7D32] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name || 'Botanica Greenhouse'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Pill */}
              <div className="flex items-center gap-2">
                <div className="bg-[#2E7D32] text-white px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Leaf size={12} className="text-green-200" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-px bg-[#2E7D32]/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-white border border-[#D2E2D3] hover:border-[#2E7D32]/50 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#558B2F]">
                            0{idx + 1}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#2A362B] group-hover:text-[#2E7D32] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-green-50 text-green-700 border border-green-200">
                            GF • ORGANIC
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <RenderItemPrices item={item} accentColor="#2E7D32" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-[#D2E2D3] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#2E7D32] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#256829] transition-colors"
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

          {/* Poke Bowl Spotlight Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#1C2C1E] to-[#2E7D32] text-white flex items-center justify-between gap-3 shadow-md">
            <img src={pokeBowlPhoto} alt="Poke Bowl" className="w-14 h-14 rounded-xl object-cover border border-green-300/40" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-green-300 font-bold">House Signature</span>
              <div className="text-xs font-bold truncate">Organic Rainbow Poke Bowl</div>
              <div className="text-[10px] text-stone-200">Edamame, avocado, pickled ginger, brown rice</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-green-300">$15.00</span>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Organic Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

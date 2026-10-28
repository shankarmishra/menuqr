import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { VintageKitchenDoodleBg, CutoutRedChili, CutoutLimeSlice } from '../artwork/FoodDoodleBackgrounds';
import { Phone, Globe, BookOpen, Utensils, Plus, Crown, Sparkles } from 'lucide-react';

export const AwadhiDastarkhwanTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const heroAwadhiPhoto = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80'; // dum biryani
  const kababPhoto = 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'; // galawati kabab

  return (
    <div 
      className="w-full relative min-h-screen bg-[#FBF7EE] text-[#2D2422] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Royal Jaali Arch Background */}
      <VintageKitchenDoodleBg opacity={0.12} color="#8D1436" />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#420A19]/95 backdrop-blur-md p-1 rounded-full border border-amber-400/40 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#8D1436] text-amber-200 shadow-md font-bold'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Shahi Dastarkhwan</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#8D1436] text-amber-200 shadow-md font-bold'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Nawabi Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: IMPERIAL AWADHI DASTARKHWAN COVER                    */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Top Royal Seal Crest */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#8D1436] font-black flex items-center gap-1">
              <Crown size={12} className="text-[#C99700]" /> Dastarkhwan-e-Awadh
            </span>
            <div className="px-2.5 py-0.5 rounded-full bg-[#C99700]/10 text-[#8D1436] border border-[#C99700]/40 text-[10px] font-serif italic font-bold">
              Lakhnavi Shahi
            </div>
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#C99700] text-xs font-black tracking-widest uppercase flex items-center justify-center gap-1">
              <Sparkles size={11} /> NAWABI IMPERIAL BANQUET
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-black text-[#8D1436] tracking-tight leading-none mt-1"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Royal Awadhi
            </h1>
          </div>

          {/* Copper Handi Circular Frame */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#E4CF9F] p-2 bg-[#FFFDF9] shadow-2xl relative">
              {/* Outer Cusped Gold Border Illusion */}
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#C99700]/50 pointer-events-none" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#8D1436] shadow-inner">
                <img 
                  src={heroAwadhiPhoto} 
                  alt="Awadhi Dum Biryani" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Chili and Lime Cutouts */}
              <CutoutRedChili className="absolute -bottom-2 -left-2 w-12 rotate-[-15deg] z-20" />
              <CutoutLimeSlice className="absolute -top-1 -right-2 w-12 rotate-[25deg] z-20" />
            </div>

            {/* Quality Stamp */}
            <div className="absolute -bottom-2 right-1 bg-gradient-to-r from-[#8D1436] to-[#420A19] text-amber-200 font-serif text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-[#C99700]">
              Slow-Cooked Dum
            </div>
          </div>

          {/* Shahi Feast Promo Card */}
          <div className="w-full bg-[#FFFDF9] border border-[#E4CF9F] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E4CF9F] pb-2">
              <div>
                <h3 className="text-xs font-black text-[#8D1436] uppercase">Shahi Dastarkhwan Feast</h3>
                <p className="text-[11px] text-stone-700">Galawati Kabab, Awadhi Gosht Biryani, Sheermal & Shahi Tukda</p>
              </div>
              <span className="text-xs font-black text-[#8D1436] font-mono">₹899</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#8D1436]" />
                {restaurant.phone || '+91 522 261 4088'}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={11} className="text-[#8D1436]" />
                awadhidastarkhwan.menuqr
              </span>
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#8D1436] to-[#5C0A1F] text-amber-200 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-[#C99700]/50"
          >
            <span>Dastarkhwan Menu Dekhein</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: ROYAL AWADHI COURT MENU CARDS                       */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-[#8D1436]/20">
            <span className="text-[10px] font-mono text-[#C99700] uppercase tracking-widest font-black">
              Nawabi Zaika
            </span>
            <h2 className="text-xl font-bold text-[#8D1436]" style={{ fontFamily: "'Cinzel', serif" }}>
              {restaurant.name || 'Dastarkhwan Royale'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <div className="bg-[#8D1436] text-amber-200 px-3.5 py-1 rounded-lg text-xs font-serif font-bold uppercase tracking-wider shadow-xs flex items-center gap-1.5 border border-[#C99700]/40">
                  <Crown size={12} className="text-[#C99700]" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-0.5 bg-[#8D1436]/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E4CF9F] hover:border-[#8D1436]/50 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#C99700]">
                            {idx + 1}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#2D2422] group-hover:text-[#8D1436] transition-colors">
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
                          <RenderItemPrices item={item} accentColor="#8D1436" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-[#E4CF9F] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#8D1436] text-amber-200 text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#5C0A1F] transition-colors border border-[#C99700]/30"
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

          {/* Galawati Kabab Spotlight Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#420A19] to-[#8D1436] text-amber-100 flex items-center justify-between gap-3 shadow-md border border-[#C99700]/30">
            <img src={kababPhoto} alt="Galawati Kabab" className="w-14 h-14 rounded-xl object-cover border border-[#C99700]/60" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#C99700] font-bold">Chef Shahi Nazrana</span>
              <div className="text-xs font-bold truncate">Melt-in-Mouth Galawati Kabab</div>
              <div className="text-[10px] text-stone-300">Infused with 160 secret Nawabi spices</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-[#C99700]">₹450</span>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#8D1436] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Shahi Dastarkhwan</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

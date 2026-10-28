import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { FrenchBoutiqueBg } from '../artwork/FoodDoodleBackgrounds';
import { Phone, Globe, BookOpen, Utensils, Plus, Sparkles, Heart } from 'lucide-react';

export const ArtisanPastryTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const heroPastryPhoto = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'; // croissant
  const cakePhoto = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80'; // cake
  const macaronPhoto = 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&auto=format&fit=crop&q=80'; // macarons

  return (
    <div 
      className="w-full relative min-h-screen bg-[#FDF8F9] text-[#3D2E33] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* French Boutique Engravings Background */}
      <FrenchBoutiqueBg opacity={0.16} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#4A1525]/90 backdrop-blur-md p-1 rounded-full border border-pink-300/40 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#C2185B] text-white shadow-md font-bold'
                : 'text-pink-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Salon de Thé</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#C2185B] text-white shadow-md font-bold'
                : 'text-pink-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Pâtisserie Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: PARISIAN HIGH TEA COVER                             */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Delicate Top Gold Bow Emblem */}
          <div className="flex flex-col items-center mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#880E4F] font-bold font-serif italic">
              Maison Fondée à Paris • 1892
            </span>
            <div className="w-10 h-6 border-b-2 border-dashed border-[#D81B60]/40 flex items-center justify-center">
              <Heart size={14} className="text-[#C2185B] fill-[#C2185B]/20" />
            </div>
          </div>

          {/* Elegant French Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#880E4F] text-xs font-black tracking-widest uppercase">
              ARTISAN DESSERTS & CAFÉ
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-serif text-[#C2185B] italic tracking-tight leading-none mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sweet Velvet
            </h1>
          </div>

          {/* 3-Tier Pastry Collage Showcase */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#F3D5DE] p-1.5 shadow-xl bg-white relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#D81B60]/20 relative">
                <img 
                  src={heroPastryPhoto} 
                  alt="French Croissant" 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Mini Pastry Badge */}
              <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={macaronPhoto} alt="Macaron" className="w-full h-full object-cover" />
              </div>

              <div className="absolute -bottom-2 -left-2 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={cakePhoto} alt="Gateau" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Quality Seal */}
            <div className="absolute bottom-1 right-2 bg-gradient-to-r from-[#D81B60] to-[#AD1457] text-white font-serif text-[10px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles size={10} /> 100% French Butter
            </div>
          </div>

          {/* High Tea Promo Card */}
          <div className="w-full bg-[#FFF9FA] border border-[#F3D5DE] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F3D5DE] pb-2">
              <div>
                <h3 className="text-xs font-black text-[#880E4F] uppercase">Afternoon Tea 3-5pm</h3>
                <p className="text-[11px] text-stone-600">Free Parisian Macaron Duo with any Single-Origin Pour-over</p>
              </div>
              <span className="text-xs font-bold text-[#C2185B] font-serif">€12.00</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#C2185B]" />
                {restaurant.phone || '+33 1 42 68 55 00'}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={11} className="text-[#C2185B]" />
                sweetvelvet.menuqr
              </span>
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#C2185B] to-[#AD1457] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Browse Pastry Boutique</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: PARISIAN PATISSERIE MENU CARDS                     */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="text-center pb-2 border-b border-[#F3D5DE]">
            <span className="text-[10px] font-serif italic text-[#880E4F] tracking-widest uppercase">
              La Carte des Gourmandises
            </span>
            <h2 className="text-xl font-serif text-[#C2185B] font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name || 'Maison Sweet Velvet'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Pill Ribbon */}
              <div className="flex items-center gap-2">
                <div className="bg-[#C2185B] text-white px-3.5 py-1 rounded-full text-xs font-serif italic font-bold shadow-xs">
                  {cat.name}
                </div>
                <div className="flex-1 h-px bg-[#F3D5DE]" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-2xl bg-white border border-[#F3D5DE] hover:border-[#C2185B]/40 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-serif italic font-bold text-[#880E4F]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#3D2E33] group-hover:text-[#C2185B] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <RenderItemPrices item={item} accentColor="#C2185B" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-xl object-cover border border-[#F3D5DE] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#C2185B] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#AD1457] transition-colors"
                          >
                            <Plus size={10} />
                            <span>Select</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#C2185B] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Salon de Thé</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

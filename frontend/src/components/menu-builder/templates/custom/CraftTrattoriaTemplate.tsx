import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { 
  VintageKitchenDoodleBg, 
  CutoutRedChili, 
  CutoutBasilLeaf, 
  CutoutLimeSlice, 
  Image1WheelCollage 
} from '../artwork/FoodDoodleBackgrounds';
import { Phone, MapPin, Globe, BookOpen, Utensils, Plus } from 'lucide-react';

export const CraftTrattoriaTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  // Featured Italian photography
  const trattoriaPhotos: [string, string, string] = [
    'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=80', // pasta
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', // burger
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80', // spaghetti
  ];

  return (
    <div 
      className="w-full relative min-h-screen bg-[#FAF6ED] text-[#3A332C] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Vintage Kitchen Doodle Pattern Watermark */}
      <VintageKitchenDoodleBg opacity={0.16} color="#5C4028" />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#2E1E14]/90 backdrop-blur-md p-1 rounded-full border border-amber-900/40 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#C62828] text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Poster Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#2E7D32] text-white shadow-md'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Trattoria Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: VINTAGE POSTER COVER (Exact Match to Image 1)       */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-4 flex flex-col items-center">
          {/* Top Logo Badge (Exact placement from Image 1: Top-Right Badge) */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-widest text-[#2E7D32] font-black">
                {restaurant.tagline || 'Cucina Italiana dal 1984'}
              </span>
            </div>

            {/* Circular Stamp Badge */}
            <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#C62828] bg-[#FFF9EE] p-1 flex flex-col items-center justify-center text-center shadow-md rotate-[6deg]">
              <span className="text-[9px] font-black uppercase text-[#C62828] leading-tight">
                Authentic
              </span>
              <span className="text-[8px] font-serif italic text-stone-600">Italian</span>
            </div>
          </div>

          {/* Main Poster Title (Image 1 Typography) */}
          <div className="text-center w-full mb-3">
            <h2 className="text-[#2E7D32] text-base sm:text-lg font-black tracking-wider uppercase">
              FOODS & BEVERAGES
            </h2>
            <h1 
              className="text-[#C62828] text-4xl sm:text-5xl font-black tracking-tight leading-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              MENU
            </h1>
          </div>

          {/* Center Stage: Circular 3-Slice Wheel Collage & Category List */}
          <div className="relative w-full my-2 flex flex-col items-center">
            {/* Cutout PNGs with Drop Shadows */}
            <CutoutRedChili className="absolute -top-3 -left-1 w-12 sm:w-16 z-20" />
            <CutoutBasilLeaf className="absolute top-1/2 -right-3 w-10 sm:w-14 z-20" />
            <CutoutLimeSlice className="absolute -bottom-3 left-4 w-11 sm:w-14 z-20" />

            {/* 3-Slice Food Wheel Collage */}
            <div className="my-2">
              <Image1WheelCollage 
                photos={trattoriaPhotos}
                centerText="Trattoria"
                centerColor="#C62828"
                borderColor="#FFF"
                className="!w-[200px] !h-[200px] sm:!w-[230px] sm:!h-[230px]"
              />
            </div>

            {/* Category Highlights with Square Bullets (Exact from Image 1) */}
            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-1 my-3 text-xs font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C62828]" /> Salads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C62828]" /> Woodfire Pizza
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C62828]" /> Artisan Pasta
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C62828]" /> Paninis
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#C62828]" /> Chianti Wines
              </span>
            </div>
          </div>

          {/* Promo Card: "Happy Hours 4-6pm" (Exact from Image 1) */}
          <div className="w-full bg-[#FFFDF9] border border-[#E3D8C4] rounded-2xl p-3.5 my-2 shadow-xs text-left">
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 mb-2">
              <div>
                <h3 className="text-sm font-black text-[#C62828] uppercase">Happy Hours 4-6pm</h3>
                <p className="text-[11px] text-stone-600">20% off on all artisan woodfire pizzas & house wines</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20">
                DAILY
              </span>
            </div>

            {/* Reservation Contact Details */}
            <div className="space-y-1 text-[11px] text-stone-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Phone size={12} className="text-[#C62828] shrink-0" />
                <span>{restaurant.phone || '+39 02 8765 4321'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[#C62828] shrink-0" />
                <span className="truncate">{restaurant.address || 'Via dei Giubbonari, 28, Roma'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-[#C62828] shrink-0" />
                <span>menuqr.com/trattoria</span>
              </div>
            </div>
          </div>

          {/* Prompt to View Menu */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-2 rounded-xl bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#B71C1C] transition-all flex items-center justify-center gap-2"
          >
            <span>Open Inside Menu Pages</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: INSIDE TRATTORIA MENU LISTINGS                      */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header Banner */}
          <div className="text-center pb-2 border-b-2 border-[#C62828]/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D32]">
              Menu Del Giorno
            </span>
            <h2 className="text-xl font-black text-[#C62828]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name || 'Trattoria da Luigi'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Ribbon */}
              <div className="flex items-center gap-2">
                <div className="bg-[#C62828] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs">
                  {cat.name}
                </div>
                <div className="flex-1 h-0.5 bg-[#C62828]/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E3D8C4] hover:shadow-md transition-shadow flex items-start justify-between gap-2.5 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-stone-400">
                            {String(idx + 1).padStart(2, '0')}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#2E1E14] group-hover:text-[#C62828] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                          {item.isBestseller && (
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              ★ CHEF'S CHOICE
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <RenderItemPrices item={item} accentColor="#C62828" />
                        </div>
                      </div>

                      {/* Thumbnail & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-stone-200 shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#C62828] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#B71C1C] transition-colors"
                          >
                            <Plus size={11} />
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

          {/* Footer Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#C62828] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Poster Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

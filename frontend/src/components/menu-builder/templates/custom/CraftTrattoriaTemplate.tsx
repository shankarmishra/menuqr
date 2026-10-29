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
    '/img/photos/photo-1546549032-9571cd6b27df-w600.webp', // pasta
    '/img/photos/photo-1568901346375-23c9450c58cd-w600.webp', // burger
    '/img/photos/photo-1551183053-bf91a1d81141-w600.webp', // spaghetti
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
      {/* PAGE 1: VINTAGE POSTER COVER (Dynamic Client Branding)       */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-4 flex flex-col items-center">
          {/* Top Row: Tagline + Client Logo Stamp Badge */}
          <div className="w-full flex items-center justify-between mb-3">
            <div className="text-left max-w-[200px]">
              <span className="text-[10px] uppercase tracking-widest text-[#2E7D32] font-black truncate block">
                {restaurant.tagline || restaurant.cuisine || 'Authentic Handcrafted Flavors'}
              </span>
            </div>

            {/* Circular Stamp Badge with Client Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-[#C62828] bg-[#FFF9EE] p-1 flex flex-col items-center justify-center text-center shadow-md rotate-[6deg] overflow-hidden">
              {restaurant.logo ? (
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-cover rounded-full" decoding="async" loading="lazy" />
              ) : (
                <>
                  <span className="text-[9px] font-black uppercase text-[#C62828] leading-tight truncate max-w-full px-0.5">
                    {restaurant.name.split(' ')[0] || 'ESTD'}
                  </span>
                  <span className="text-[7.5px] font-serif italic text-stone-600">Original</span>
                </>
              )}
            </div>
          </div>

          {/* Main Poster Title: Client Restaurant Name */}
          <div className="text-center w-full mb-3 px-2">
            <h2 className="text-[#2E7D32] text-xs sm:text-sm font-black tracking-widest uppercase">
              {restaurant.tagline ? 'AUTHENTIC HANDCRAFTED MENU' : (restaurant.cuisine ? `${restaurant.cuisine.toUpperCase()} SPECIALS` : 'EXQUISITE FLAVORS')}
            </h2>
            <h1 
              className="text-[#C62828] text-2xl sm:text-4xl font-black tracking-tight leading-tight mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {restaurant.name}
            </h1>
            {restaurant.tagline && (
              <p className="text-[11px] sm:text-xs text-stone-600 font-serif italic mt-0.5 max-w-xs mx-auto">
                {restaurant.tagline}
              </p>
            )}
          </div>

          {/* Center Stage: Circular 3-Slice Wheel Collage & Category List */}
          <div className="relative w-full my-2 flex flex-col items-center">
            {/* Cutout PNGs with Drop Shadows */}
            <CutoutRedChili className="absolute -top-3 -left-1 w-12 sm:w-16 z-20" />
            <CutoutBasilLeaf className="absolute top-1/2 -right-3 w-10 sm:w-14 z-20" />
            <CutoutLimeSlice className="absolute -bottom-3 left-4 w-11 sm:w-14 z-20" />

            {/* 3-Slice Food Wheel Collage with Restaurant Name Monogram */}
            <div className="my-2">
              <Image1WheelCollage 
                photos={trattoriaPhotos}
                centerText={restaurant.name.split(' ')[0].substring(0, 10)}
                centerColor="#C62828"
                borderColor="#FFF"
                className="!w-[200px] !h-[200px] sm:!w-[230px] sm:!h-[230px]"
              />
            </div>

            {/* Dynamic Client Category Highlights with Square Bullets */}
            <div className="w-full flex flex-wrap justify-center gap-x-4 gap-y-1.5 my-3 text-xs font-bold text-stone-800">
              {(categories.length > 0 ? categories.slice(0, 5) : [
                { id: 'c1', name: 'Starters' },
                { id: 'c2', name: 'Chef Specials' },
                { id: 'c3', name: 'Main Course' },
                { id: 'c4', name: 'Breads & Sides' },
                { id: 'c5', name: 'Beverages' }
              ]).map((cat) => (
                <span key={cat.id || cat.name} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C62828] shrink-0" /> {cat.name}
                </span>
              ))}
            </div>
          </div>

          {/* Promo Card: Dynamic Bestseller / Chef Highlight */}
          {(() => {
            const allDishes = categories.flatMap((c) => c.items);
            const featured = allDishes.find((i) => i.isBestseller) || allDishes.find((i) => i.isSpecial) || allDishes[0];
            const promoTitle = featured ? `Chef Special: ${featured.name}` : `${restaurant.name} Specialties`;
            const promoSub = featured?.description || restaurant.tagline || 'Fresh handcrafted ingredients prepared daily.';
            const pricing = featured ? parseItemPricing(featured) : null;
            const promoPrice = pricing?.formattedBasePrice || (featured?.price ? `₹${featured.price}` : '');

            return (
              <div className="w-full bg-[#FFFDF9] border border-[#E3D8C4] rounded-2xl p-3.5 my-2 shadow-xs text-left">
                <div className="flex items-center justify-between border-b border-stone-200/60 pb-2 mb-2">
                  <div className="min-w-0 flex-1 mr-2">
                    <h3 className="text-xs font-black text-[#C62828] uppercase truncate">{promoTitle}</h3>
                    <p className="text-[11px] text-stone-600 line-clamp-1">{promoSub}</p>
                  </div>
                  {promoPrice ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 shrink-0 font-mono">
                      {promoPrice}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20 shrink-0">
                      SPECIAL
                    </span>
                  )}
                </div>

                {/* Reservation & Contact Details */}
                <div className="space-y-1 text-[11px] text-stone-600 font-medium">
                  {restaurant.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-[#C62828] shrink-0" />
                      <span>Order / Call: {restaurant.phone}</span>
                    </div>
                  )}
                  {(restaurant.address || restaurant.city) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#C62828] shrink-0" />
                      <span className="truncate">{restaurant.address || restaurant.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-stone-500 text-[10px]">
                    <Globe size={11} className="text-[#2E7D32] shrink-0" />
                    <span>Scan QR Code To Order Digitally</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Prompt to View Menu */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-2 rounded-xl bg-[#C62828] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#B71C1C] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="text-center pb-2 border-b-2 border-[#C62828]/20 flex flex-col items-center">
            {restaurant.logo && (
              <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-cover rounded-full mb-1 border border-[#C62828]/30 shadow-xs" decoding="async" loading="lazy" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2E7D32]">
              {restaurant.tagline || 'Menu Del Giorno'}
            </span>
            <h2 className="text-xl font-black text-[#C62828]" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name}
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
                            decoding="async"
                            loading="lazy"
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

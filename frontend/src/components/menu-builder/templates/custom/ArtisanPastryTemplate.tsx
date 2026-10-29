import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { FrenchBoutiqueBg } from '../artwork/FoodDoodleBackgrounds';
import { Phone, BookOpen, Utensils, Plus, Sparkles, Heart } from 'lucide-react';

export const ArtisanPastryTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featuredItem = categories.flatMap(c => c.items).find(i => i.isBestseller || (i as any).isChefSpecial || i.isSpecial || i.image) 
    || categories.flatMap(c => c.items)[0];
  const featuredPrice = featuredItem ? (parseItemPricing(featuredItem).formattedBasePrice || (featuredItem.price ? `₹${featuredItem.price}` : '')) : '';

  const heroPastryPhoto = featuredItem?.image || '/img/photos/photo-1509440159596-0249088772ff-w600.webp'; // croissant
  const cakePhoto = '/img/photos/photo-1563729784474-d77dbb933a9e-w600.webp'; // cake
  const macaronPhoto = '/img/photos/photo-1569864358642-9d1684040f43-w600.webp'; // macarons

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
          {/* Delicate Top Gold Bow Emblem / Logo */}
          <div className="flex flex-col items-center mb-2">
            {restaurant.logo ? (
              <div className="w-16 h-16 rounded-full p-1 bg-white border-2 border-[#D81B60]/30 shadow-md flex items-center justify-center overflow-hidden mb-1">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" decoding="async" loading="lazy" />
              </div>
            ) : (
              <div className="w-10 h-6 border-b-2 border-dashed border-[#D81B60]/40 flex items-center justify-center">
                <Heart size={14} className="text-[#C2185B] fill-[#C2185B]/20" />
              </div>
            )}
            <span className="text-[10px] uppercase tracking-widest text-[#880E4F] font-bold font-serif italic text-center">
              {restaurant.tagline || (restaurant.cuisine ? `${restaurant.cuisine} • Artisan Pâtisserie` : 'Maison Fondée d’Artisanat')}
            </span>
          </div>

          {/* Elegant French Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#880E4F] text-xs font-black tracking-widest uppercase">
              {restaurant.cuisine || 'ARTISAN DESSERTS & CAFÉ'}
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-serif text-[#C2185B] italic tracking-tight leading-tight mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {restaurant.name || 'Sweet Velvet'}
            </h1>
          </div>

          {/* 3-Tier Pastry Collage Showcase */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#F3D5DE] p-1.5 shadow-xl bg-white relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#D81B60]/20 relative">
                <img 
                  src={heroPastryPhoto} 
                  alt={featuredItem?.name || 'French Croissant'} 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  decoding="async"
                  loading="lazy"
                />
              </div>

              {/* Floating Mini Pastry Badge */}
              <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={macaronPhoto} alt="Macaron" className="w-full h-full object-cover" decoding="async" loading="lazy" />
              </div>

              <div className="absolute -bottom-2 -left-2 w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={cakePhoto} alt="Gateau" className="w-full h-full object-cover" decoding="async" loading="lazy" />
              </div>
            </div>

            {/* Quality Seal */}
            <div className="absolute bottom-1 right-2 bg-gradient-to-r from-[#D81B60] to-[#AD1457] text-white font-serif text-[10px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles size={10} /> 100% French Butter
            </div>
          </div>

          {/* High Tea / Featured Promo Card */}
          <div className="w-full bg-[#FFF9FA] border border-[#F3D5DE] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F3D5DE] pb-2">
              <div className="pr-2">
                <h3 className="text-xs font-black text-[#880E4F] uppercase">
                  {featuredItem ? `Chef's Recommendation: ${featuredItem.name}` : 'Afternoon High Tea Special'}
                </h3>
                <p className="text-[11px] text-stone-600 line-clamp-1">
                  {featuredItem?.description || 'Freshly baked daily with premium ingredients and artisan craft.'}
                </p>
              </div>
              {featuredPrice && (
                <span className="text-xs font-bold text-[#C2185B] font-serif whitespace-nowrap">
                  {featuredPrice}
                </span>
              )}
            </div>

            {/* Category Tags */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 py-1">
                {categories.slice(0, 5).map((c, idx) => (
                  <span key={idx} className="text-[10px] bg-pink-100/60 text-[#880E4F] px-2 py-0.5 rounded-full font-medium">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#C2185B]" />
                {restaurant.phone || '+91 98765 43210'}
              </span>
              {(restaurant.city || restaurant.address) && (
                <span className="text-[11px] text-stone-600 truncate max-w-[150px]">
                  {restaurant.city || restaurant.address}
                </span>
              )}
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
          <div className="text-center pb-2 border-b border-[#F3D5DE] flex flex-col items-center">
            {restaurant.logo && (
              <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-contain rounded-full mb-1 border border-pink-200" decoding="async" loading="lazy" />
            )}
            <span className="text-[10px] font-serif italic text-[#880E4F] tracking-widest uppercase">
              {restaurant.tagline || 'La Carte des Gourmandises'}
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
                            decoding="async"
                            loading="lazy"
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

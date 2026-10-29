import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { PunjabiTruckArtBg, CutoutRedChili } from '../artwork/FoodDoodleBackgrounds';
import { Phone, BookOpen, Utensils, Plus, Flame } from 'lucide-react';

export const DesiDhabaTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featuredItem = categories.flatMap(c => c.items).find(i => i.isBestseller || (i as any).isChefSpecial || i.isSpecial || i.image) 
    || categories.flatMap(c => c.items)[0];
  const featuredPrice = featuredItem ? (parseItemPricing(featuredItem).formattedBasePrice || (featuredItem.price ? `₹${featuredItem.price}` : '')) : '';

  const heroThaliPhoto = featuredItem?.image || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80'; // tandoori paneer
  const biryaniPhoto = 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80'; // biryani

  return (
    <div 
      className="w-full relative min-h-screen bg-[#FFF8EE] text-[#38251C] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Punjabi Truck-Art Chevrons & Marigold Floral Background */}
      <PunjabiTruckArtBg opacity={0.15} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#4E1708]/95 backdrop-blur-md p-1 rounded-full border border-amber-500/40 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#E65100] text-white shadow-md font-black'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Dhaba Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#E65100] text-white shadow-md font-black'
                : 'text-amber-100/70 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Tandoor Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: GRAND HIGHWAY DHABA TRUCK-ART COVER                 */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Truck-Art Painted Top Signboard / Logo */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[#B71C1C] font-black flex items-center gap-1">
              <Flame size={12} className="text-[#E65100]" /> {restaurant.tagline || '100% Shuddh Desi Swad'}
            </span>
            {restaurant.logo ? (
              <div className="w-12 h-12 rounded-full bg-white p-1 border border-amber-500/40 shadow-md flex items-center justify-center overflow-hidden">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-md bg-[#BF360C] text-white text-[10px] font-black uppercase shadow-xs">
                {restaurant.cuisine ? restaurant.cuisine.slice(0, 8).toUpperCase() : 'DESI DHABA'}
              </div>
            )}
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#E65100] text-xs font-black tracking-widest uppercase">
              {restaurant.cuisine || 'HIGHWAY TANDOOR DHABA'}
            </h2>
            <h1 
              className="text-3xl sm:text-4xl font-black text-[#B71C1C] tracking-tight leading-tight mt-1"
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              {restaurant.name || 'Grand Highway Dhaba'}
            </h1>
          </div>

          {/* Round Brass Thali Aperture Frame */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#F57F17] p-2 bg-[#FFFAF0] shadow-2xl relative">
              {/* Outer Decorative Zigzag Ring */}
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#E65100]/50 pointer-events-none" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-600 shadow-inner">
                <img 
                  src={heroThaliPhoto} 
                  alt={featuredItem?.name || 'Tandoori Paneer Tikka'} 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Chili Cutout */}
              <CutoutRedChili className="absolute -bottom-2 -left-2 w-14 rotate-[-25deg] z-20" />
            </div>

            {/* Quality Stamp */}
            <div className="absolute -bottom-2 right-1 bg-gradient-to-r from-[#E65100] to-[#BF360C] text-white font-mono text-[10px] font-black px-3 py-1 rounded-full shadow-md border border-amber-300">
              {featuredItem?.dietType === 'veg' || featuredItem?.dietType === 'vegan' ? 'Pure Veg Specialty' : 'Charcoal Tandoor Se'}
            </div>
          </div>

          {/* Maha Dhaba Thali Promo Card */}
          <div className="w-full bg-[#FFFAF2] border border-[#EFD4B2] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#EFD4B2] pb-2">
              <div className="pr-2">
                <h3 className="text-xs font-black text-[#B71C1C] uppercase">
                  {featuredItem ? `Dhaba Special: ${featuredItem.name}` : 'Maha Dhaba Thali Combo'}
                </h3>
                <p className="text-[11px] text-stone-700 line-clamp-1">
                  {featuredItem?.description || 'Authentic highway recipes cooked fresh with rich spices and desi tadka.'}
                </p>
              </div>
              {featuredPrice && (
                <span className="text-xs font-black text-[#E65100] font-mono whitespace-nowrap">
                  {featuredPrice}
                </span>
              )}
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 py-1">
                {categories.slice(0, 5).map((c, idx) => (
                  <span key={idx} className="text-[10px] bg-amber-100/80 text-[#B71C1C] px-2 py-0.5 rounded-full font-bold">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-600 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#B71C1C]" />
                {restaurant.phone || '+91 98110 44556'}
              </span>
              {(restaurant.city || restaurant.address) && (
                <span className="text-[11px] text-stone-700 truncate max-w-[150px]">
                  {restaurant.city || restaurant.address}
                </span>
              )}
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#BF360C] to-[#E65100] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>Bhojan Menu Dekhein</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: HIGHWAY DHABA MENU CARDS                            */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-[#B71C1C]/20 flex flex-col items-center">
            {restaurant.logo && (
              <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-contain rounded-full mb-1 border border-amber-300" />
            )}
            <span className="text-[10px] font-mono text-[#E65100] uppercase tracking-widest font-black">
              {restaurant.tagline || 'Shuddh Desi Swad'}
            </span>
            <h2 className="text-xl font-bold text-[#B71C1C]" style={{ fontFamily: "'Cinzel', serif" }}>
              {restaurant.name || 'Grand Highway Dhaba'}
            </h2>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center gap-2">
                <div className="bg-[#BF360C] text-white px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Flame size={12} className="text-amber-300" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-0.5 bg-[#BF360C]/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FFFAF2] border border-[#EFD4B2] hover:border-[#E65100]/50 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#E65100]">
                            {idx + 1}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-[#38251C] group-hover:text-[#B71C1C] transition-colors">
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
                          <RenderItemPrices item={item} accentColor="#BF360C" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-[#EFD4B2] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#BF360C] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#A32A06] transition-colors"
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

          {/* Thali Spotlight Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#4E1708] to-[#BF360C] text-white flex items-center justify-between gap-3 shadow-md">
            <img src={biryaniPhoto} alt="Dum Biryani Handi" className="w-14 h-14 rounded-xl object-cover border border-amber-400/40" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 font-bold">Dhaba Special</span>
              <div className="text-xs font-bold truncate">Dum Matka Biryani Thali</div>
              <div className="text-[10px] text-stone-200">Served with Boondi Raita & Sirka Pyaaz</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-amber-300">₹340</span>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#BF360C] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Dhaba Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

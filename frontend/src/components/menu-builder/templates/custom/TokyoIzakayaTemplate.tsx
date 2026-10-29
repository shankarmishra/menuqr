import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { JapaneseSeigaihaBg, CutoutRedChili } from '../artwork/FoodDoodleBackgrounds';
import { Phone, BookOpen, Utensils, Plus, Flame } from 'lucide-react';

export const TokyoIzakayaTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featuredItem = categories.flatMap(c => c.items).find(i => i.isBestseller || (i as any).isChefSpecial || i.isSpecial || i.image) 
    || categories.flatMap(c => c.items)[0];
  const featuredPrice = featuredItem ? (parseItemPricing(featuredItem).formattedBasePrice || (featuredItem.price ? `₹${featuredItem.price}` : '')) : '';

  const ramenHeroPhoto = featuredItem?.image || 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80';
  const gyozaCallout = 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80';
  const sushiCallout = 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=600&auto=format&fit=crop&q=80';

  return (
    <div 
      className="w-full relative min-h-screen bg-[#111215] text-[#ECECF0] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Japanese Seigaiha Wave Background */}
      <JapaneseSeigaihaBg opacity={0.14} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#1C1D24]/95 backdrop-blur-md p-1 rounded-full border border-red-500/30 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#E53935] text-white shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>🏮 Izakaya Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#E53935] text-white shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Ramen & Yakitori</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: TOKYO STREET LANTERN COVER                          */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Vertical Japanese Kanji Ribbon + Red Lantern Crest */}
          <div className="w-full flex items-center justify-between mb-2">
            <div className="bg-[#E53935] text-white px-2.5 py-3 rounded-b-xl shadow-lg flex flex-col items-center font-black text-xs tracking-widest">
              <span>居</span>
              <span>酒</span>
              <span>屋</span>
            </div>

            {/* Glowing Lantern Crest / Logo */}
            <div className="flex items-center gap-2">
              {restaurant.logo ? (
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-red-500/50 p-1 shadow-lg shadow-red-500/30 flex items-center justify-center overflow-hidden">
                  <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-14 bg-gradient-to-b from-[#FF5252] to-[#C62828] rounded-xl border border-amber-300/60 shadow-lg shadow-red-500/20 flex flex-col items-center justify-center p-1 text-center">
                  <span className="text-[10px] font-black text-amber-200 uppercase leading-none">
                    {(restaurant.name || 'TOKYO').slice(0, 5)}
                  </span>
                  <span className="text-[8px] font-mono text-white/90">
                    {restaurant.cuisine ? restaurant.cuisine.slice(0, 6).toUpperCase() : 'DINING'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center my-2">
            <h2 className="text-[#FFB300] text-xs font-black tracking-widest uppercase">
              {restaurant.tagline || restaurant.cuisine || 'MIDNIGHT STREET DINING'}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mt-1">
              {restaurant.name || 'RAMEN & IZAKAYA'}
            </h1>
          </div>

          {/* Ensō Circular Brush Hero Ramen Frame */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#E53935] p-1.5 shadow-2xl relative">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-700 relative">
                <img 
                  src={ramenHeroPhoto} 
                  alt={featuredItem?.name || 'Tonkotsu Ramen'} 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" 
                />
              </div>

              {/* Floating Chili Cutout */}
              <CutoutRedChili className="absolute -bottom-2 -left-2 w-12 rotate-[-20deg] z-20" />
            </div>

            {/* Highlight Badge */}
            <div className="absolute -bottom-2 right-2 bg-gradient-to-r from-[#FFB300] to-amber-500 text-stone-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-lg border border-amber-200">
              {featuredItem?.dietType === 'veg' || featuredItem?.dietType === 'vegan' ? 'Pure Craft Vegetarian' : 'Slow Cooked Broth & Sizzler'}
            </div>
          </div>

          {/* Izakaya Promo Card */}
          <div className="w-full bg-[#1A1B22] border border-stone-800 rounded-2xl p-3 text-left space-y-2 mt-2">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <div className="pr-2">
                <h3 className="text-xs font-black text-[#FF5252] uppercase">
                  {featuredItem ? `Featured Special: ${featuredItem.name}` : 'Izakaya Combo Special'}
                </h3>
                <p className="text-[10px] text-stone-400 line-clamp-1">
                  {featuredItem?.description || 'Authentic artisan flavors cooked fresh on traditional hot iron plates.'}
                </p>
              </div>
              {featuredPrice && (
                <span className="text-xs font-black text-[#FFB300] font-mono whitespace-nowrap">
                  {featuredPrice}
                </span>
              )}
            </div>

            {/* Dynamic category tags */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 py-1">
                {categories.slice(0, 5).map((c, idx) => (
                  <span key={idx} className="text-[10px] bg-red-950/70 border border-red-500/30 text-red-200 px-2 py-0.5 rounded-md font-medium">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#FF5252]" />
                {restaurant.phone || '+91 98765 43210'}
              </span>
              {(restaurant.city || restaurant.address) && (
                <span className="text-[11px] text-stone-300 truncate max-w-[150px]">
                  {restaurant.city || restaurant.address}
                </span>
              )}
            </div>
          </div>

          {/* Prompt to View Menu */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#E53935] to-[#C62828] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>View Izakaya Menu</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: JAPANESE ALLEYWAY MENU CARDS                        */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-red-500/30">
            <div className="flex items-center gap-2.5">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-contain rounded-xl border border-red-500/40 bg-[#1A1B22]" />
              )}
              <div>
                <span className="text-[10px] font-mono text-[#FFB300] uppercase tracking-widest font-bold">
                  {restaurant.tagline || 'Tokyo Kitchen'}
                </span>
                <h2 className="text-lg font-black text-white">{restaurant.name || 'Hakata Street Ramen'}</h2>
              </div>
            </div>
            <div className="bg-[#E53935] text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase">
              本場
            </div>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Wooden Tab Header */}
              <div className="flex items-center gap-2">
                <div className="bg-[#E53935] text-white px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Flame size={12} className="text-amber-300" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-px bg-red-500/20" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1A1B22] border border-stone-800 hover:border-red-500/40 transition-colors flex items-start justify-between gap-2.5 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#FFB300]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-[#FF5252] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-2">
                          <RenderItemPrices item={item} accentColor="#FFB300" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-stone-700 shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#E53935] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#C62828] transition-colors"
                          >
                            <Plus size={10} />
                            <span>Order</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Izakaya Spotlight Side Callouts */}
          <div className="pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2 block">
              Popular Izakaya Sides
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2 rounded-xl bg-[#1A1B22] border border-stone-800 flex items-center gap-2">
                <img src={gyozaCallout} alt="Gyoza" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <div className="text-[10px] font-bold text-stone-200">Kurobuta Gyoza</div>
                  <div className="text-[10px] font-mono text-[#FFB300] font-black">$6.50</div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-[#1A1B22] border border-stone-800 flex items-center gap-2">
                <img src={sushiCallout} alt="Sushi" className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <div className="text-[10px] font-bold text-stone-200">Salmon Nigiri</div>
                  <div className="text-[10px] font-mono text-[#FFB300] font-black">$8.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#FF5252] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Izakaya Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

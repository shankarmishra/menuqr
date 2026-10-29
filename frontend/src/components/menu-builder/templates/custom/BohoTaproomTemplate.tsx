import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { BohoCraftBeerBg, Image1WheelCollage } from '../artwork/FoodDoodleBackgrounds';
import { Phone, BookOpen, Utensils, Plus, Beer } from 'lucide-react';

export const BohoTaproomTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featuredItem = categories.flatMap(c => c.items).find(i => i.isBestseller || (i as any).isChefSpecial || i.isSpecial || i.image) 
    || categories.flatMap(c => c.items)[0];
  const featuredPrice = featuredItem ? (parseItemPricing(featuredItem).formattedBasePrice || (featuredItem.price ? `₹${featuredItem.price}` : '')) : '';

  const itemPhotos = categories.flatMap(c => c.items).map(i => i.image).filter(Boolean) as string[];
  const taproomPhotos: [string, string, string] = [
    itemPhotos[0] || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', // sliders
    itemPhotos[1] || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', // pizza
    itemPhotos[2] || 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=80', // pasta
  ];

  return (
    <div 
      className="w-full relative min-h-screen bg-[#14171B] text-[#E3E6EB] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Industrial Slate & Hop Cone Background */}
      <BohoCraftBeerBg opacity={0.16} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#1E232A]/95 backdrop-blur-md p-1 rounded-full border border-amber-400/30 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#FF8F00] text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Taproom Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#FF8F00] text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>On-Tap Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: INDUSTRIAL CRAFT TAPROOM COVER                      */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Hexagonal Craft Emblem / Logo */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#FFB300] uppercase tracking-widest font-black flex items-center gap-1">
              <Beer size={12} className="text-[#FF8F00]" /> {restaurant.tagline || 'Small-Batch Brewery & Kitchen'}
            </span>
            {restaurant.logo ? (
              <div className="w-12 h-12 rounded-xl bg-[#1E2228] p-1 border border-amber-400/40 shadow-md flex items-center justify-center overflow-hidden">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-md bg-[#FF8F00]/20 text-[#FFB300] border border-[#FF8F00]/40 text-[10px] font-mono font-bold">
                {restaurant.cuisine ? restaurant.cuisine.slice(0, 8).toUpperCase() : 'CRAFT TAP'}
              </div>
            )}
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#FFB300] text-xs font-black tracking-widest uppercase">
              {restaurant.cuisine || 'ARTISAN BREWERY & BITES'}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mt-1">
              {restaurant.name || 'BOHO TAPROOM'}
            </h1>
          </div>

          {/* 3-Slice Slider & Craft Pints Collage Wheel */}
          <div className="relative my-3">
            <Image1WheelCollage 
              photos={taproomPhotos}
              centerText={restaurant.name ? restaurant.name.split(' ')[0] : 'Craft'}
              centerColor="#FF8F00"
              borderColor="#14171B"
              className="!w-[200px] !h-[200px] sm:!w-[230px] sm:!h-[230px]"
            />
          </div>

          {/* Hoppy Hour Promo Card */}
          <div className="w-full bg-[#1E2228] border border-[#343B47] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#343B47] pb-2">
              <div className="pr-2">
                <h3 className="text-xs font-black text-[#FFB300] uppercase">
                  {featuredItem ? `Featured Special: ${featuredItem.name}` : 'Taproom Happy Hours'}
                </h3>
                <p className="text-[11px] text-stone-400 line-clamp-1">
                  {featuredItem?.description || 'Crafted with premium ingredients and curated artisanal pairings.'}
                </p>
              </div>
              {featuredPrice && (
                <span className="text-xs font-black text-[#FF8F00] font-mono whitespace-nowrap">
                  {featuredPrice}
                </span>
              )}
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 py-1">
                {categories.slice(0, 5).map((c, idx) => (
                  <span key={idx} className="text-[10px] bg-amber-950/60 border border-amber-500/30 text-amber-200 px-2 py-0.5 rounded-md font-medium">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#FFB300]" />
                {restaurant.phone || '+91 98765 43210'}
              </span>
              {(restaurant.city || restaurant.address) && (
                <span className="text-[11px] text-stone-300 truncate max-w-[150px]">
                  {restaurant.city || restaurant.address}
                </span>
              )}
            </div>
          </div>

          {/* Prompt */}
          <button
            type="button"
            onClick={() => setPage('menu')}
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#FF8F00] to-[#FFA000] text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore On-Tap & Food Menu</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: CHALKBOARD BEER & FOOD LISTINGS                     */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#343B47]">
            <div className="flex items-center gap-2.5">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-contain rounded-xl border border-amber-400/40 bg-[#1E2228]" />
              )}
              <div>
                <span className="text-[10px] font-mono text-[#FFB300] uppercase tracking-widest font-bold">
                  {restaurant.tagline || 'Small-Batch Brewery'}
                </span>
                <h2 className="text-lg font-black text-white">{restaurant.name || 'Boho Taproom & Social'}</h2>
              </div>
            </div>
            <div className="bg-[#FF8F00] text-stone-950 text-[10px] font-mono font-black px-2.5 py-1 rounded-md uppercase">
              CRAFT
            </div>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Stamped Header */}
              <div className="flex items-center gap-2">
                <div className="bg-[#FF8F00] text-stone-950 px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Beer size={12} className="text-stone-950" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-px bg-[#343B47]" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#1E2228] border border-[#343B47] hover:border-[#FFB300]/40 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#FFB300]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-[#FFB300] transition-colors">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                          <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            6.2% ABV • 45 IBU
                          </span>
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
                            className="w-12 h-12 rounded-lg object-cover border border-[#343B47] shadow-xs" 
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#FF8F00] text-stone-950 text-[10px] font-black flex items-center gap-1 shadow-xs hover:bg-[#FFA000] transition-colors"
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

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#FFB300] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Taproom Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

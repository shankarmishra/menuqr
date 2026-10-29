import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, RenderItemPrices, parseItemPricing } from '../shared/RenderItemPrices';
import { SmokehouseTimberBg, CutoutRedChili } from '../artwork/FoodDoodleBackgrounds';
import { Phone, BookOpen, Utensils, Plus, Flame } from 'lucide-react';

export const RusticSmokehouseTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  const featuredItem = categories.flatMap(c => c.items).find(i => i.isBestseller || (i as any).isChefSpecial || i.isSpecial || i.image) 
    || categories.flatMap(c => c.items)[0];
  const featuredPrice = featuredItem ? (parseItemPricing(featuredItem).formattedBasePrice || (featuredItem.price ? `₹${featuredItem.price}` : '')) : '';

  const heroRibsPhoto = featuredItem?.image || '/img/photos/photo-1544025162-d76694265947-w600.webp'; // ribs
  const brisketPhoto = '/img/photos/photo-1529193591184-b1d58069ecdd-w600.webp'; // brisket

  return (
    <div 
      className="w-full relative min-h-screen bg-[#181311] text-[#EBE0D8] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Smokehouse Crossed Cleavers & Fire Embers Background */}
      <SmokehouseTimberBg opacity={0.16} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#2C1F1A]/95 backdrop-blur-md p-1 rounded-full border border-orange-500/30 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#E65100] text-white shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Pitmaster Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#E65100] text-white shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Smoked BBQ Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: CAST IRON SKILLET SMOKEHOUSE COVER                  */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Leather Stamped Ribbon Crest / Logo */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-[#FFA726] uppercase tracking-widest font-black flex items-center gap-1">
              <Flame size={12} className="text-[#FF7043]" /> {restaurant.tagline || '14-Hour Hickory Smoked'}
            </span>
            {restaurant.logo ? (
              <div className="w-12 h-12 rounded-xl bg-[#2C1F1A] p-1 border border-orange-500/40 shadow-md flex items-center justify-center overflow-hidden">
                <img src={restaurant.logo} alt={restaurant.name} className="w-full h-full object-contain" decoding="async" loading="lazy" />
              </div>
            ) : (
              <div className="px-2.5 py-0.5 rounded-md bg-[#E65100]/20 text-[#FFA726] border border-[#E65100]/40 text-[10px] font-mono font-bold">
                {restaurant.cuisine ? restaurant.cuisine.slice(0, 10).toUpperCase() : 'SMOKEHOUSE'}
              </div>
            )}
          </div>

          {/* Typography */}
          <div className="text-center my-2">
            <h2 className="text-[#FFA726] text-xs font-black tracking-widest uppercase">
              {restaurant.cuisine || 'TEXAS TIMBER BBQ & GRILL'}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mt-1">
              {restaurant.name || 'PITMASTER SMOKEHOUSE'}
            </h1>
          </div>

          {/* Cast Iron Skillet Circular Hero Frame */}
          <div className="relative my-3">
            <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-4 border-[#3E3028] p-2 bg-[#261E1A] shadow-2xl relative">
              {/* Outer Cast-Iron Skillet Handle Illusion */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-[#3E3028] rounded-t-lg border-t-2 border-stone-600" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-700 shadow-inner">
                <img 
                  src={heroRibsPhoto} 
                  alt={featuredItem?.name || 'Smoked St. Louis Ribs'} 
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  decoding="async"
                  loading="lazy"
                />
              </div>

              {/* Floating Chili Cutout */}
              <CutoutRedChili className="absolute -bottom-2 -right-2 w-12 rotate-[25deg] z-20" />
            </div>

            {/* Quality Stamp */}
            <div className="absolute -bottom-2 left-2 bg-[#D84315] text-white font-mono text-[10px] font-black px-3 py-1 rounded-full shadow-md border border-amber-400">
              {featuredItem?.dietType === 'veg' || featuredItem?.dietType === 'vegan' ? 'Pure Veg Specialty' : 'Prime Oak Smoked'}
            </div>
          </div>

          {/* Pitmaster Feast Promo Card */}
          <div className="w-full bg-[#241D1A] border border-[#42332C] rounded-2xl p-3.5 text-left space-y-2 mt-2 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#42332C] pb-2">
              <div className="pr-2">
                <h3 className="text-xs font-black text-[#FFA726] uppercase">
                  {featuredItem ? `House Specialty: ${featuredItem.name}` : 'Pitmaster Feast Platter'}
                </h3>
                <p className="text-[11px] text-stone-400 line-clamp-1">
                  {featuredItem?.description || 'Sample platter served with house sauces, fresh garnish & chef sides.'}
                </p>
              </div>
              {featuredPrice && (
                <span className="text-xs font-black text-[#FF7043] font-mono whitespace-nowrap">
                  {featuredPrice}
                </span>
              )}
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 py-1">
                {categories.slice(0, 5).map((c, idx) => (
                  <span key={idx} className="text-[10px] bg-orange-950/60 border border-orange-500/30 text-amber-200 px-2 py-0.5 rounded-md font-medium">
                    {c.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <Phone size={11} className="text-[#FFA726]" />
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
            className="w-full py-2.5 mt-3 rounded-xl bg-gradient-to-r from-[#E65100] to-[#D84315] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Butcher Paper Menu</span>
            <Utensils size={13} />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: BUTCHER KRAFT PAPER BBQ MENU LISTINGS               */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#42332C]">
            <div className="flex items-center gap-2.5">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-contain rounded-xl border border-orange-500/40 bg-[#261E1A]" decoding="async" loading="lazy" />
              )}
              <div>
                <span className="text-[10px] font-mono text-[#FFA726] uppercase tracking-widest font-bold">
                  {restaurant.tagline || 'Texas Hickory Smoke'}
                </span>
                <h2 className="text-lg font-black text-white">{restaurant.name || 'Lone Star Smokehouse'}</h2>
              </div>
            </div>
            <div className="bg-[#E65100] text-white text-[10px] font-mono font-black px-2.5 py-1 rounded-md uppercase">
              SMOKED
            </div>
          </div>

          {/* Categories */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Category Stamped Header */}
              <div className="flex items-center gap-2">
                <div className="bg-[#D84315] text-white px-3.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                  <Flame size={12} className="text-amber-300" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex-1 h-px bg-[#42332C]" />
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div 
                      key={item.id}
                      className="p-3 rounded-xl bg-[#241D1A] border border-[#42332C] hover:border-[#FFA726]/40 transition-colors flex items-start justify-between gap-2.5 shadow-xs group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-[#FFA726]">
                            0{idx + 1}.
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-[#FFA726] transition-colors">
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
                          <RenderItemPrices item={item} accentColor="#FFA726" />
                        </div>
                      </div>

                      {/* Photo & Add Button */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 rounded-lg object-cover border border-[#42332C] shadow-xs"
                            decoding="async"
                            loading="lazy"
                          />
                        )}

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2.5 py-1 rounded-lg bg-[#E65100] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs hover:bg-[#D84315] transition-colors"
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

          {/* Brisket Platter Spotlight Card */}
          <div className="p-3 rounded-2xl bg-[#2C211C] border border-[#FFA726]/30 text-white flex items-center justify-between gap-3 shadow-lg">
            <img src={brisketPhoto} alt="14hr Smoked Brisket" className="w-14 h-14 rounded-xl object-cover border border-[#FFA726]/40" decoding="async" loading="lazy" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#FFA726] font-bold">Pitmaster Special</span>
              <div className="text-xs font-bold truncate">14-Hour Prime Beef Brisket</div>
              <div className="text-[10px] text-stone-400">Oak smoked with coarse black pepper rub</div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-black text-[#FFA726]">$22.50</span>
            </div>
          </div>

          {/* Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#FFA726] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Pitmaster Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import type { LayoutProps, MenuItem, CategoryGroup } from '../types';
import { DietIndicator, parseItemPricing } from '../shared/RenderItemPrices';
import { 
  ChalkboardDoodleBg, 
  Image2ApertureRing,
  CutoutRedChili
} from '../artwork/FoodDoodleBackgrounds';
import { Phone, MapPin, Globe, BookOpen, Utensils, Plus } from 'lucide-react';

export const MidnightBurgerTemplate: React.FC<LayoutProps> = ({
  restaurant,
  categories,
  onAddToCart,
}) => {
  const [page, setPage] = useState<'cover' | 'menu'>('cover');

  // Hero burger photo from Image 2
  const heroBurgerPhoto = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80';
  const calloutPhoto1 = 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'; // spicy chicken
  const calloutPhoto2 = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'; // 13" pizza

  return (
    <div 
      className="w-full relative min-h-screen bg-[#141416] text-[#E5E5EB] overflow-x-hidden font-sans select-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Chalkboard Typography Doodles Background */}
      <ChalkboardDoodleBg opacity={0.18} />

      {/* Floating Interactive Page Switcher (Sticky at top) */}
      <div className="sticky top-2 z-40 flex justify-center px-4 py-2 pointer-events-auto">
        <div className="bg-[#1F1F24]/95 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage('cover')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'cover'
                ? 'bg-[#FF9800] text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <BookOpen size={13} />
            <span>Chalkboard Cover</span>
          </button>
          <button
            type="button"
            onClick={() => setPage('menu')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              page === 'menu'
                ? 'bg-[#FF9800] text-stone-950 shadow-md font-black'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Utensils size={13} />
            <span>Fast Food Menu</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PAGE 1: CHALKBOARD APERTURE COVER (Dynamic Client Branding)  */}
      {/* ============================================================ */}
      {page === 'cover' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-4 py-3 flex flex-col items-center">
          {/* Top Hanging Orange Ribbon Crest Logo with Client Logo */}
          <div className="relative mb-3 flex flex-col items-center">
            <div className="w-20 h-16 bg-gradient-to-b from-[#FFA726] to-[#F57C00] rounded-b-2xl shadow-xl flex flex-col items-center justify-center p-2 border-t-2 border-white/40">
              {restaurant.logo ? (
                <img src={restaurant.logo} alt={restaurant.name} className="w-10 h-10 object-cover rounded-full border border-white/70 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full border border-white/50 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] font-black tracking-tighter text-stone-950 uppercase leading-none truncate max-w-[36px]">
                    {restaurant.name.slice(0, 4).toUpperCase()}
                  </span>
                  <span className="text-[7px] font-serif italic font-bold text-stone-900 leading-none">Club</span>
                </div>
              )}
            </div>
            {/* Ribbon V-Cut Notch Bottom */}
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[8px] border-t-[#F57C00]" />
          </div>

          {/* Center Stage: Circular Aperture Hero Food Frame with Client Name Badge */}
          <div className="relative my-2">
            <Image2ApertureRing 
              photo={heroBurgerPhoto}
              badgeRibbonText={restaurant.name.substring(0, 16).toUpperCase()}
              badgeRibbonColor="#FFA726"
              accentRingColor="#FFA726"
              className="!w-[210px] !h-[210px] sm:!w-[240px] sm:!h-[240px]"
            />
            {/* Cutout Chili */}
            <CutoutRedChili className="absolute -bottom-2 -right-2 w-12 rotate-[15deg] z-20" />
          </div>

          {/* Client Title & Tagline in Chalk Display Typography */}
          <div className="text-center my-3 px-2">
            <h1 
              className="text-2xl sm:text-4xl text-[#FFB74D] font-serif italic tracking-wide drop-shadow-md leading-tight"
              style={{ fontFamily: "'Playfair Display', cursive" }}
            >
              {restaurant.name}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mt-1">
              {restaurant.tagline || restaurant.cuisine || 'Handcrafted Smash Burgers & Specialties'}
            </p>
          </div>

          {/* Dynamic Category Highlights from Client's Actual Menu */}
          {categories.length > 0 && (
            <div className="w-full flex flex-wrap justify-center gap-1.5 my-2">
              {categories.slice(0, 4).map((c) => (
                <span key={c.id || c.name} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F57C00]/15 text-[#FFA726] border border-[#F57C00]/30 uppercase tracking-wider">
                  {c.name}
                </span>
              ))}
            </div>
          )}

          {/* Contact Bar & Order Button */}
          <div className="w-full bg-[#1B1B20] border border-stone-800 rounded-2xl p-3 text-center space-y-2 mt-1">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-stone-400 font-medium">
              {restaurant.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} className="text-[#FFA726]" />
                  {restaurant.phone}
                </span>
              )}
              {(restaurant.address || restaurant.city) && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin size={12} className="text-[#FFA726]" />
                    {restaurant.address || restaurant.city}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe size={12} className="text-[#FFA726]" />
                Scan QR To Order
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPage('menu')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FFA726] to-[#F57C00] text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Full Menu</span>
              <Utensils size={13} />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PAGE 2: EXACT IMAGE 2 INNER MENU LAYOUT                    */}
      {/* ============================================================ */}
      {page === 'menu' && (
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto px-3.5 py-4 space-y-6">
          {/* Top Brand Tag with Client Logo */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2">
              {restaurant.logo && (
                <img src={restaurant.logo} alt={restaurant.name} className="w-7 h-7 object-cover rounded-full border border-[#FFA726]/40" />
              )}
              <span className="text-xs font-black tracking-wider text-[#FFA726] uppercase">
                {restaurant.name}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFA726]/10 text-[#FFA726] border border-[#FFA726]/30">
              CHALKBOARD MENU
            </span>
          </div>

          {/* Category Sections (Orange Pills exact from Image 2) */}
          {categories.map((cat: CategoryGroup) => (
            <div key={cat.id} className="space-y-3">
              {/* Image 2 Orange Pill Banner */}
              <div className="inline-block bg-[#F57C00] text-stone-950 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                {cat.name}
              </div>

              {/* Numbered Items with Dot Leaders (Exact from Image 2) */}
              <div className="space-y-2 bg-[#1A1A1F] border border-stone-800/80 rounded-2xl p-3">
                {cat.items.map((item: MenuItem, idx: number) => {
                  const pricing = parseItemPricing(item);
                  const priceStr = pricing.formattedBasePrice || String(item.price || 0);

                  return (
                    <div key={item.id} className="border-b border-stone-800/50 last:border-0 pb-2 last:pb-0">
                      <div className="flex items-baseline justify-between gap-1 text-xs sm:text-sm font-bold">
                        {/* Number & Name */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[#FFA726] font-mono text-[11px] font-black shrink-0">
                            {idx + 1}.
                          </span>
                          <span className="truncate text-stone-200">
                            {item.name}
                          </span>
                          <DietIndicator type={item.dietType} compact />
                        </div>

                        {/* Dot Leader */}
                        <div className="flex-1 border-b border-dotted border-stone-700/60 mx-1.5 mb-1" />

                        {/* Price */}
                        <span className="text-[#FFA726] font-mono font-black shrink-0">
                          {priceStr}
                        </span>
                      </div>

                      {/* Description & Add Button */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-[11px] text-stone-400 line-clamp-1 flex-1">
                          {item.description || 'Crispy grilled patty with house secret sauce'}
                        </p>

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(item, priceStr)}
                            className="px-2 py-0.5 rounded-md bg-[#FFA726]/20 hover:bg-[#FFA726] text-[#FFA726] hover:text-stone-950 text-[10px] font-bold transition-all border border-[#FFA726]/40 flex items-center gap-0.5 shrink-0"
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

          {/* Bottom Organic Brush-Stroke Callouts (Exact from Image 2 bottom: "Spicy chicken $5.99" / "13' Pizza $4.99") */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-stone-400">
              Chef Highlights & Combos
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Callout Card 1: Spicy Chicken */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 group">
                <img 
                  src={calloutPhoto1} 
                  alt="Spicy Chicken" 
                  className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase leading-tight drop-shadow-md">
                    Spicy Chicken
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#F57C00] text-stone-950 text-[10px] font-black shadow-xs">
                    $5.99
                  </span>
                </div>
              </div>

              {/* Callout Card 2: 13" Pizza */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-stone-700 bg-stone-900 group">
                <img 
                  src={calloutPhoto2} 
                  alt="13' Pizza" 
                  className="w-full h-24 object-cover transform group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase leading-tight drop-shadow-md">
                    13" Pizza
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#F57C00] text-stone-950 text-[10px] font-black shadow-xs">
                    $4.99
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Back to Cover */}
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setPage('cover')}
              className="text-xs font-bold text-[#FFA726] hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <BookOpen size={12} />
              <span>Back to Chalkboard Cover</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

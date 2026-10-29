import React from 'react';
import { Phone, MapPin, Globe, Sparkles, Utensils, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ChalkboardDoodleBg, CutoutBasilLeaf, CutoutLimeSlice } from '../artwork/FoodDoodleBackgrounds';

export interface ShobharamCoverProps {
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    openingHours?: string;
    logo?: string;
    website?: string;
  };
  categories?: Array<{ id: string; name: string; items?: any[] }>;
  onExploreMenu?: () => void;
  compact?: boolean;
}

export const ShobharamBespokeCover: React.FC<ShobharamCoverProps> = ({
  restaurant,
  categories = [],
  onExploreMenu,
  compact = false,
}) => {
  const logoUrl =
    restaurant.logo ||
    '/uploads/shobharam/shobharam_logo_transparent.webp';

  const heroDishUrl = '/uploads/shobharam/generated_cover_hero_circle.webp';

  const categoryHighlights = categories.length > 0
    ? categories.slice(0, 5).map((c) => c.name)
    : [
        'Special Paneer Tikka Masala',
        'Dal Makhani Bukhara',
        'Tandoori Chaap & Momos',
        'Authentic Crispy Dosas',
        'Traditional Desi Ghee Sweets',
      ];

  const phone = restaurant.phone || '+91 98765 43210';
  const address = [restaurant.address, restaurant.city].filter(Boolean).join(', ') || 'Main Market, City Center';
  const website = restaurant.website || 'WWW.MENUSQR.IN';

  return (
    <header className={`relative w-full max-w-3xl mx-auto overflow-hidden rounded-3xl border border-[#D4AF37]/40 shadow-2xl bg-[#0B0E0D] text-[#F3F4F6] select-none ${compact ? 'my-2 scale-[0.98]' : 'my-4'}`}>
      {/* ── Background textures & lighting ──────────────────────────── */}
      {/* Authentic Chalkboard Food Doodle Background */}
      <ChalkboardDoodleBg opacity={0.12} />

      {/* Subtle charcoal slate chalkboard texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Radial Gold & Emerald Ambient Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 48%, rgba(245, 197, 66, 0.22) 0%, rgba(30, 94, 58, 0.18) 35%, transparent 70%),
            radial-gradient(circle at 15% 15%, rgba(30, 94, 58, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(212, 175, 55, 0.12) 0%, transparent 45%)
          `,
        }}
      />

      {/* Ornate Gold Border Inset Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#D4AF37]/30 pointer-events-none" />
      <div className="absolute inset-3 sm:inset-4 rounded-xl border border-dashed border-[#D4AF37]/20 pointer-events-none" />

      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#F5C542] pointer-events-none" />

      {/* ── Top Bar: Logo & Badges ───────────────────────────────────── */}
      <div className="relative z-10 pt-6 px-6 sm:px-10 flex flex-col items-center text-center">
        {/* Top Tagline / Tradition Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E5E3A]/40 border border-[#1E5E3A] text-[10px] sm:text-xs font-bold tracking-widest uppercase text-emerald-300 mb-3 backdrop-blur-xs">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span>ESTD. TRADITIONAL RECIPES • 100% PURE VEG</span>
        </div>

        {/* Shobharam's Authentic Logo Display */}
        <div className="relative group my-2">
          <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-emerald-500/20 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative w-44 sm:w-56 h-auto p-2 rounded-2xl bg-black/60 border border-[#D4AF37]/40 shadow-xl backdrop-blur-md flex items-center justify-center">
            <img
              src={logoUrl}
              alt={restaurant.name || "Shobharam's"}
              className="w-full h-auto max-h-24 sm:max-h-28 object-contain filter drop-shadow-[0_4px_12px_rgba(30,94,58,0.6)]"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* Cursive Today's & Main Special Food Menu Headline */}
        <div className="mt-4 space-y-1">
          <p
            className="text-2xl sm:text-4xl text-[#F5C542] tracking-wide"
            style={{
              fontFamily: "'Playfair Display', Georgia, cursive, serif",
              fontStyle: 'italic',
              textShadow: '0 2px 8px rgba(245, 197, 66, 0.4)',
            }}
          >
            Today&apos;s
          </p>

          <h1
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.04em',
              textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.25)',
            }}
          >
            SPECIAL FOOD MENU
          </h1>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="w-10 h-px bg-gradient-to-r from-transparent to-[#F5C542]" />
            <p
              className="text-xs sm:text-sm font-semibold tracking-wider text-amber-200/90 italic"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Limited Time Offer & Royal Signatures
            </p>
            <span className="w-10 h-px bg-gradient-to-l from-transparent to-[#F5C542]" />
          </div>
        </div>
      </div>

      {/* ── Center Stage: Hero Dish Plate & Sizzle Spotlight ─────────── */}
      <div className="relative z-10 px-4 sm:px-8 my-4 flex flex-col items-center">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Sizzle Glow Behind Plate */}
          <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-[#F5C542]/30 via-emerald-600/20 to-amber-500/20 blur-xl animate-pulse" />

          {/* Golden Ring Plate Frame */}
          <div className="absolute w-60 h-60 sm:w-76 sm:h-76 rounded-full border border-[#D4AF37]/35 border-dashed" />
          <div className="absolute w-52 h-52 sm:w-68 sm:h-68 rounded-full border border-[#F5C542]/20" />

          {/* Dish Image */}
          <div className="relative z-10 w-52 h-52 sm:w-68 sm:h-68 rounded-full overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_22px_30px_rgba(0,0,0,0.95)]">
            <img
              src={heroDishUrl}
              alt="Chef's Special Culinary Dish"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Floating Fresh Culinary Garnishes */}
          <CutoutBasilLeaf size={40} rotation={-25} className="absolute -top-3 -right-2 z-20" />
          <CutoutBasilLeaf size={34} rotation={40} className="absolute -bottom-2 -left-3 z-20" />
          <CutoutLimeSlice size={46} className="absolute top-1 -left-4 z-20" />

          {/* Floating Pill Badges */}
          <div className="absolute -left-2 sm:left-0 top-1/4 z-20 px-2.5 py-1 rounded-full bg-black/80 border border-emerald-500/60 shadow-lg backdrop-blur-md text-[10px] sm:text-xs font-bold text-emerald-300 flex items-center gap-1.5 transform -rotate-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>100% Desi Ghee</span>
          </div>

          <div className="absolute -right-2 sm:right-0 bottom-1/4 z-20 px-2.5 py-1 rounded-full bg-black/80 border border-[#F5C542]/60 shadow-lg backdrop-blur-md text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5 transform rotate-6">
            <Award size={12} className="text-amber-400" />
            <span>Chef's Choice</span>
          </div>
        </div>

        {/* Dynamic Category Bullets List */}
        <div className="w-full max-w-lg mt-2 px-4 py-3 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Sparkles size={12} />
              <span>Menu Highlights</span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium">Authentic Flavors</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {categoryHighlights.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] shrink-0" />
                <span className="truncate font-medium">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA: Explore Inside Menu Button */}
        {onExploreMenu && (
          <button
            type="button"
            onClick={onExploreMenu}
            className="mt-5 px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black font-extrabold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(245,197,66,0.4)] hover:shadow-[0_0_30px_rgba(245,197,66,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <Utensils size={15} />
            <span>Explore Full Menu ({categories.reduce((acc, c) => acc + (c.items?.length || 0), 0) || '200+'} Items)</span>
          </button>
        )}
      </div>

      {/* ── Footer Plaque: Free Home Delivery & Contact Details ───────── */}
      <div className="relative z-10 mt-6 mx-4 sm:mx-8 mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141A17] to-[#0A0D0B] border border-[#D4AF37]/40 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Delivery Callout */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] flex items-center gap-1">
              <HeartHandshake size={12} />
              <span>Dine-In • Takeaway • Delivery</span>
            </span>
            <span className="text-sm sm:text-base font-black tracking-wide text-white uppercase mt-0.5">
              FREE HOME DELIVERY
            </span>
            <a
              href={`tel:${phone}`}
              className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 mt-0.5 transition-colors"
            >
              <Phone size={13} className="text-[#F5C542]" />
              <span>{phone}</span>
            </a>
          </div>

          {/* Location & Website */}
          <div className="flex flex-col items-center sm:items-end text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-400 shrink-0" />
              <span className="text-gray-300 text-[11px] sm:text-xs text-center sm:text-right max-w-xs truncate">
                {address}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/80">
              <Globe size={11} className="text-[#F5C542]" />
              <span>{website}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShobharamBespokeCover;

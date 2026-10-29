import React from 'react';
import { Phone, MapPin, Globe, Sparkles, Award, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';
import { AuthenticNoirChalkboardBg } from '../artwork/AuthenticNoirChalkboardBg';
import { CutoutBasilLeaf, CutoutLimeSlice } from '../artwork/FoodDoodleBackgrounds';

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

  const phone = restaurant.phone || '+91 98765 43210';
  const address = [restaurant.address, restaurant.city].filter(Boolean).join(', ') || 'Main Market Road, City Center, Jaipur';
  const website =
    restaurant.website && !restaurant.website.toLowerCase().includes('menusqr')
      ? restaurant.website
      : undefined;

  const totalDishes = categories.reduce((sum, c) => sum + (c.items?.length || 0), 0) || 205;

  return (
    <header className={`relative w-full max-w-3xl mx-auto overflow-hidden rounded-3xl border border-[#D4AF37]/50 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-[#0C100E] text-[#F3F4F6] select-none ${compact ? 'my-2 scale-[0.98]' : 'my-4'}`}>
      {/* ── Background textures & lighting ──────────────────────────── */}
      {/* Subtle authentic Indian spice & culinary chalk background */}
      <AuthenticNoirChalkboardBg opacity={0.12} />

      {/* Subtle slate stipple grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Radial Gold & Emerald Ambient Spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(245, 197, 66, 0.18) 0%, rgba(30, 94, 58, 0.15) 40%, transparent 70%),
            radial-gradient(circle at 10% 10%, rgba(30, 94, 58, 0.2) 0%, transparent 45%),
            radial-gradient(circle at 90% 90%, rgba(212, 175, 55, 0.16) 0%, transparent 45%)
          `,
        }}
      />

      {/* Ornate Gold Border Inset Frame */}
      <div className="absolute inset-2 sm:inset-3 rounded-2xl border border-[#D4AF37]/35 pointer-events-none" />
      <div className="absolute inset-3 sm:inset-4 rounded-xl border border-dashed border-[#D4AF37]/20 pointer-events-none" />

      {/* Corner Ornaments */}
      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#F5C542] pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#F5C542] pointer-events-none" />

      {/* ── Top Bar: Logo & Badges ───────────────────────────────────── */}
      <div className="relative z-10 pt-6 px-6 sm:px-10 flex flex-col items-center text-center">
        {/* Top Tagline / Tradition Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E5E3A]/50 border border-[#1E5E3A] text-[10px] sm:text-xs font-bold tracking-widest uppercase text-emerald-300 mb-3 backdrop-blur-md shadow-lg">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>ESTD. TRADITIONAL RECIPES • 100% PURE VEG</span>
        </div>

        {/* Shobharam's Authentic Transparent Crest Logo Display */}
        <div className="relative group my-1">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/25 via-amber-400/25 to-emerald-500/25 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
          <img
            src={logoUrl}
            alt={restaurant.name || "Shobharam's"}
            className="relative z-10 w-44 sm:w-56 h-auto max-h-24 sm:max-h-28 object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Cursive Today's & Main Special Food Menu Headline (Direct match to reference) */}
        <div className="mt-3 space-y-1">
          <p
            className="text-3xl sm:text-5xl text-[#F5C542] tracking-wide"
            style={{
              fontFamily: "'Playfair Display', Georgia, cursive, serif",
              fontStyle: 'italic',
              textShadow: '0 2px 10px rgba(245, 197, 66, 0.5)',
            }}
          >
            Today&apos;s
          </p>

          <h1
            className="text-3xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: '0.04em',
              textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 0 25px rgba(212, 175, 55, 0.35)',
            }}
          >
            SPECIAL FOOD MENU
          </h1>

          <div className="flex items-center justify-center gap-3 pt-1.5">
            <span className="w-12 h-px bg-gradient-to-r from-transparent to-[#F5C542]" />
            <p
              className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-200/90"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Limited Time Offer • Royal Signatures
            </p>
            <span className="w-12 h-px bg-gradient-to-l from-transparent to-[#F5C542]" />
          </div>
        </div>
      </div>

      {/* ── Center Stage: Giant Hero Sizzling Dish Plate ─────────── */}
      <div className="relative z-10 px-4 sm:px-8 my-5 flex flex-col items-center">
        <div className="relative w-64 h-64 sm:w-84 sm:h-84 flex items-center justify-center">
          {/* Sizzle Glow Behind Plate */}
          <div className="absolute w-60 h-60 sm:w-76 sm:h-76 rounded-full bg-gradient-to-tr from-[#F5C542]/35 via-emerald-600/25 to-amber-500/25 blur-2xl animate-pulse" />

          {/* Golden Ring Plate Frame */}
          <div className="absolute w-62 h-62 sm:w-80 sm:h-80 rounded-full border border-[#D4AF37]/45 border-dashed" />
          <div className="absolute w-54 h-54 sm:w-72 sm:h-72 rounded-full border border-[#F5C542]/30" />

          {/* Dish Image */}
          <div className="relative z-10 w-54 h-54 sm:w-72 sm:h-72 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_24px_40px_rgba(0,0,0,0.95)]">
            <img
              src={heroDishUrl}
              alt="Chef's Special Culinary Dish"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Floating Fresh Culinary Garnishes */}
          <CutoutBasilLeaf size={42} rotation={-25} className="absolute -top-3 -right-2 z-20" />
          <CutoutBasilLeaf size={34} rotation={40} className="absolute -bottom-2 -left-3 z-20" />
          <CutoutLimeSlice size={48} className="absolute top-1 -left-4 z-20" />

          {/* Floating Badges */}
          <div className="absolute -left-2 sm:left-0 top-1/4 z-20 px-3 py-1 rounded-full bg-black/85 border border-emerald-500/70 shadow-xl backdrop-blur-md text-[10px] sm:text-xs font-bold text-emerald-300 flex items-center gap-1.5 transform -rotate-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>100% Desi Ghee</span>
          </div>

          <div className="absolute -right-2 sm:right-0 bottom-1/4 z-20 px-3 py-1 rounded-full bg-black/85 border border-[#F5C542]/70 shadow-xl backdrop-blur-md text-[10px] sm:text-xs font-bold text-amber-300 flex items-center gap-1.5 transform rotate-6">
            <Award size={13} className="text-amber-400" />
            <span>Chef&apos;s Choice</span>
          </div>
        </div>
      </div>

      {/* ── Explore Menu Action CTA Button ────────────────────────────── */}
      {onExploreMenu && (
        <div className="relative z-10 flex justify-center px-4 mb-4">
          <button
            type="button"
            onClick={onExploreMenu}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] hover:brightness-110 text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_8px_24px_rgba(212,175,55,0.45)] flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>EXPLORE FULL MENU ({totalDishes} ITEMS)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── Bottom Delivery Plaque (Direct match to reference poster) ─────────────────────────── */}
      <div className="relative z-10 mt-2 mx-4 sm:mx-8 mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141A17] to-[#0A0D0B] border border-[#D4AF37]/40 shadow-inner">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Delivery Callout */}
          <div className="flex flex-col items-center sm:items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] flex items-center gap-1">
              <HeartHandshake size={12} />
              <span>Dine-In • Takeaway • Free Delivery</span>
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

          {/* Location & Client Website (only if client has their own website) */}
          <div className="flex flex-col items-center sm:items-end text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-400 shrink-0" />
              <span className="text-gray-300 text-[11px] sm:text-xs text-center sm:text-right max-w-xs truncate">
                {address}
              </span>
            </div>
            {website ? (
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-amber-200/80 hover:text-amber-100 transition-colors"
              >
                <Globe size={11} className="text-[#F5C542]" />
                <span>{website}</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                <ShieldCheck size={11} className="text-emerald-400" />
                <span>100% Pure Vegetarian</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShobharamBespokeCover;

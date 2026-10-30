import React from 'react';
import { Phone, Globe, MessageCircle } from 'lucide-react';
import type { SlotProps } from '../types.ts';

function InstagramIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export const DhabaMasterpieceCover: React.FC<SlotProps> = ({ restaurant, compact }) => {
  // Split restaurant name into 2 impactful lines for the cartouche
  const name = (restaurant.name || 'Apna Dhaba').trim();
  const words = name.split(/\s+/);
  
  let line1 = 'APNA';
  let line2 = 'DHABA';
  
  if (words.length === 1) {
    line1 = words[0];
    line2 = 'KITCHEN';
  } else if (words.length === 2) {
    line1 = words[0];
    line2 = words[1];
  } else {
    const mid = Math.ceil(words.length / 2);
    line1 = words.slice(0, mid).join(' ');
    line2 = words.slice(mid).join(' ');
  }

  const phone = restaurant.phone || '323-517-4946';
  const rawPhone = phone.replace(/[^0-9+]/g, '');
  const website = restaurant.website || 'WWW.YOURWEBSITE.COM';
  const cleanWebsite = website.replace(/^https?:\/\//i, '').replace(/\/$/, '').toUpperCase();
  const instagram = (restaurant as any).instagram;
  const facebook = (restaurant as any).facebook;

  const scrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('menu-content') || 
                   document.querySelector('.mq-nav') || 
                   document.querySelector('.mq-toolbar') ||
                   document.querySelector('main');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className="relative w-full overflow-hidden select-none bg-[#FAF7F2] text-[#1A1C1B]"
      style={{
        backgroundImage: "url('/assets/dhaba-cover/white_stucco_wall.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: compact ? '10px' : '14px',
        paddingBottom: compact ? '14px' : '20px',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. FOUR CORNER ARTISAN FOOD DISHES
             (Pure Circular High-Resolution Dishes — 0 Cutout Artifacts,
              0 Mirrored SVGs, 0 Overlapping Issues)
          ───────────────────────────────────────────────────────────── */}
      
      {/* Top-Left: Pure Shahi Paneer Tikka Masala Bowl */}
      <div className="absolute -top-7 -left-7 sm:-top-9 sm:-left-9 pointer-events-none z-10">
        <div 
          className="relative transition-transform duration-500 hover:scale-105"
          style={{
            width: compact ? '110px' : '140px',
            height: compact ? '110px' : '140px',
          }}
        >
          <img
            src="/assets/dhaba-cover/paneer_tikka_masala.png"
            alt="Shahi Paneer Tikka Masala"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.25)] -rotate-3"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Top-Right: Pure Dal Tadka Terracotta Earthen Handi */}
      <div className="absolute -top-7 -right-7 sm:-top-9 sm:-right-9 pointer-events-none z-10">
        <div 
          className="relative transition-transform duration-500 hover:scale-105"
          style={{
            width: compact ? '110px' : '140px',
            height: compact ? '110px' : '140px',
          }}
        >
          <img
            src="/assets/dhaba-cover/dal_tadka.png"
            alt="Dal Tadka Handi"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.25)] rotate-3"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Bottom-Left: Pure Grilled Tandoori Skewers Pan */}
      <div className="absolute -bottom-8 -left-8 sm:-bottom-10 sm:-left-10 pointer-events-none z-10">
        <div 
          className="relative transition-transform duration-500 hover:scale-105"
          style={{
            width: compact ? '120px' : '155px',
            height: compact ? '120px' : '155px',
          }}
        >
          <img
            src="/assets/dhaba-cover/tandoori_skewers.png"
            alt="Grilled Tandoori Skewers"
            className="w-full h-full object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] rotate-2"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Bottom-Right: Pure Roasted Tandoori Chicken Platter */}
      <div className="absolute -bottom-8 -right-8 sm:-bottom-10 sm:-right-10 pointer-events-none z-10">
        <div 
          className="relative transition-transform duration-500 hover:scale-105"
          style={{
            width: compact ? '120px' : '155px',
            height: compact ? '120px' : '155px',
          }}
        >
          <img
            src="/assets/dhaba-cover/roasted_chicken_platter.png"
            alt="Roasted Tandoori Chicken Platter"
            className="w-full h-full object-contain filter drop-shadow-[0_14px_24px_rgba(0,0,0,0.28)] -rotate-2"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CENTER COLUMN CONTENT
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-[370px] sm:max-w-[430px] mx-auto">
        
        {/* Top Center: Official FSSAI Veg / Non-Veg Diet Indicators (STRICTLY NO LOGO ON TOP) */}
        <div className="flex items-center gap-2 mb-1.5" aria-label="Veg and Non-Veg Available">
          {/* Non-Veg Mark (Red square with solid red circle) */}
          <div 
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 border-[1.6px] border-[#B71C1C] rounded-[3px] bg-white flex items-center justify-center shadow-xs"
            title="Non-Vegetarian Available"
          >
            <div className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#C62828]" />
          </div>

          {/* Veg Mark (Green square with solid green circle) */}
          <div 
            className="w-5 h-5 sm:w-5.5 sm:h-5.5 border-[1.6px] border-[#1B5E20] rounded-[3px] bg-white flex items-center justify-center shadow-xs"
            title="100% Vegetarian Available"
          >
            <div className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2E7D32]" />
          </div>
        </div>

        {/* Vintage Master Chef Mascot ('Chef Kiss' Gesture) with Feathered Clean Cutout */}
        <div 
          className="relative pointer-events-none z-10 -mb-5 sm:-mb-6 transition-transform duration-300 hover:scale-105"
          style={{ width: compact ? '98px' : '118px' }}
        >
          <img
            src="/assets/dhaba-cover/chef_mascot.png"
            alt="Master Chef"
            className="w-full h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.22)]"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. AUTHENTIC MULTI-LOBED SCALLOPED DHABA CARTOUCHE PLAQUE
               (Exact SVG geometry from the reference poster with lace ribbon)
            ───────────────────────────────────────────────────────────── */}
        <div className="relative z-20 w-full flex items-center justify-center my-0.5">
          {/* SVG Cartouche Plaque Container */}
          <div 
            className="relative flex items-center justify-center"
            style={{
              width: compact ? '260px' : '298px',
              height: compact ? '150px' : '172px',
            }}
          >
            {/* The Authentic 12-Lobed Scalloped Plaque SVG with Gold Stitch & Lace Ribbon */}
            <img
              src="/assets/dhaba-cover/cartouche_plaque.svg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />

            {/* Typography Content Positioned Inside the Plaque */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-2 pt-3">
              {/* Line 1: Distressed White Stamp Typography */}
              <h1 
                className="font-black uppercase tracking-[0.16em] leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{
                  fontSize: compact ? '1.1rem' : '1.3rem',
                  fontFamily: "'Cinzel', 'Playfair Display', Impact, sans-serif",
                  letterSpacing: '0.14em',
                }}
              >
                {line1}
              </h1>

              {/* Line 2: Distressed Warm Golden-Orange Block Typography */}
              <h2 
                className="font-black uppercase tracking-wider leading-none my-0.5"
                style={{
                  fontSize: compact ? '1.65rem' : '1.95rem',
                  fontFamily: "Impact, 'Arial Black', sans-serif",
                  color: '#FFA726',
                  textShadow: '0 2px 5px rgba(0,0,0,0.9), 0 0 10px rgba(255,167,38,0.45)',
                  letterSpacing: '0.04em',
                }}
              >
                {line2}
              </h2>

              {/* Line 3: MENUBOOK with Golden Ornamental Wings */}
              <div className="flex items-center justify-center gap-2 mt-1 text-[#FFD54F]">
                <span className="w-6 sm:w-8 h-[1.5px] bg-[#FFD54F]/70" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.24em] uppercase text-[#FFE082] drop-shadow-sm">
                  MENUBOOK
                </span>
                <span className="w-6 sm:w-8 h-[1.5px] bg-[#FFD54F]/70" />
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. CUISINE & CLASSIFICATION SUBTITLE
            ───────────────────────────────────────────────────────────── */}
        <div className="mt-1 text-center space-y-0.5">
          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-[#111827]">
            VEG / NON-VEG
          </p>
          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#E65100]">
            {restaurant.tagline || restaurant.cuisine || 'FAMILY RESTAURANT'}
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. ORDER NOW CALL TO ACTION BUTTON
            ───────────────────────────────────────────────────────────── */}
        <div className="mt-1.5 mb-1.5">
          <a
            href="#menu-content"
            onClick={scrollToMenu}
            className="inline-flex items-center justify-center px-7 py-2 rounded-full bg-gradient-to-r from-[#FF9800] via-[#F57C00] to-[#E65100] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/35 hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
          >
            ORDER NOW
          </a>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            6. CONTACT & SOCIAL MEDIA INFORMATION
               (Per prompt: "sab uska social medila ka dikehga agar hoga toh")
            ───────────────────────────────────────────────────────────── */}
        <div className="w-full space-y-1 pt-0.5 text-center">
          {/* Phone Number */}
          <div>
            <a 
              href={`tel:${rawPhone}`}
              className="inline-flex items-center gap-1.5 text-sm sm:text-base font-black text-[#111827] hover:text-[#E65100] tracking-wider transition-colors"
            >
              <Phone size={13} className="text-[#E65100] shrink-0" />
              <span>{phone}</span>
            </a>
          </div>

          {/* Website */}
          <div>
            <a 
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#4B5563] hover:text-[#E65100] tracking-widest uppercase transition-colors"
            >
              <Globe size={11} className="text-[#4B5563] shrink-0" />
              <span>{cleanWebsite}</span>
            </a>
          </div>

          {/* Social Media Links & Handles (Instagram, WhatsApp, Facebook) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {/* Instagram */}
            <a
              href={instagram ? (instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`) : `https://instagram.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#C13584] shadow-xs hover:border-[#C13584] transition-colors"
              title="Follow on Instagram"
            >
              <InstagramIcon size={12} className="text-[#C13584]" />
              <span>{instagram ? (instagram.startsWith('@') ? instagram : `@${instagram}`) : '@ApnaDhaba'}</span>
            </a>

            {/* WhatsApp Direct Order */}
            <a
              href={`https://wa.me/${rawPhone.replace('+', '')}?text=Hi%2C%20I%20would%20like%20to%20place%20an%20order`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#25D366] shadow-xs hover:border-[#25D366] transition-colors"
              title="Order on WhatsApp"
            >
              <MessageCircle size={12} className="text-[#25D366]" />
              <span>WhatsApp</span>
            </a>

            {/* Facebook */}
            {facebook && (
              <a
                href={facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 border border-stone-300/80 text-[10px] font-bold text-[#1877F2] shadow-xs hover:border-[#1877F2] transition-colors"
                title="Follow on Facebook"
              >
                <FacebookIcon size={12} className="text-[#1877F2]" />
                <span>Facebook</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};

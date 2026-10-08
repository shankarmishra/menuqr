import React from 'react';
import { ChefHat, CheckCircle2, Download } from 'lucide-react';

export interface RoyalWalnutStickerCardProps {
  restaurantName: string;
  category?: string;
  tagline?: string;
  menuUrl: string;
  qrImage: string;
  phone?: string;
  address?: string;
  showStatusBadge?: boolean;
  showDownloadButtons?: boolean;
  onDownloadPNG?: () => void;
  onDownloadSVG?: () => void;
  headerText?: string;
  stickerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function RoyalWalnutStickerCard({
  restaurantName,
  category = 'DIGITAL MENU',
  tagline,
  menuUrl,
  qrImage,
  showStatusBadge = true,
  showDownloadButtons = true,
  onDownloadPNG,
  onDownloadSVG,
  headerText = 'Scan Me for Menu',
  stickerRef,
}: RoyalWalnutStickerCardProps) {
  // Extract host domain from menuUrl safely
  let domain = 'menusqr.in';
  try {
    if (menuUrl) {
      const parsed = new URL(menuUrl.startsWith('http') ? menuUrl : `https://${menuUrl}`);
      domain = parsed.host || 'menusqr.in';
    }
  } catch {
    domain = 'menusqr.in';
  }

  return (
    <div className="flex flex-col items-center select-none font-sans">
      {/* WOODEN TABLE TENT CARD FRAME */}
      <div
        ref={stickerRef}
        className="relative flex w-[380px] sm:w-[410px] min-h-[610px] flex-col items-center overflow-hidden rounded-[2.2rem] p-4 sm:p-5 box-border ring-1 ring-black/30"
        style={{
          background: 'linear-gradient(155deg, #442a19 0%, #29170c 35%, #382113 65%, #180b05 100%)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 0 35px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15)',
        }}
      >
        {/* SVG Wood Grain Subtle Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <filter id="woodGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.05 0.95" numOctaves="3" result="noise" />
              <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#woodGrain)" />
          </svg>
        </div>

        {/* --- METALLIC GOLD CORNER BRACKETS --- */}
        {/* Top-Left Bracket */}
        <svg className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-20" viewBox="0 0 70 70" fill="none">
          <defs>
            <linearGradient id="goldGradTL" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="35%" stopColor="#F0C857" />
              <stop offset="70%" stopColor="#C49619" />
              <stop offset="100%" stopColor="#785600" />
            </linearGradient>
            <filter id="shadowTL" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="2" dy="3" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>
          <path d="M 0 0 L 62 0 C 46 0 26 10 20 26 C 15 36 15 50 0 62 Z" fill="url(#goldGradTL)" filter="url(#shadowTL)" />
          <path d="M 3 3 L 54 3 C 41 3 22 12 18 25 C 14 34 14 47 3 54 Z" fill="none" stroke="#FFF7D6" strokeWidth="1" opacity="0.8" />
          <circle cx="12" cy="12" r="3" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="1" fill="#FFF2B2" />
          <circle cx="42" cy="11" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
          <circle cx="11" cy="42" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
        </svg>

        {/* Top-Right Bracket */}
        <svg className="absolute top-0 right-0 w-16 h-16 pointer-events-none z-20 transform scale-x-[-1]" viewBox="0 0 70 70" fill="none">
          <path d="M 0 0 L 62 0 C 46 0 26 10 20 26 C 15 36 15 50 0 62 Z" fill="url(#goldGradTL)" filter="url(#shadowTL)" />
          <path d="M 3 3 L 54 3 C 41 3 22 12 18 25 C 14 34 14 47 3 54 Z" fill="none" stroke="#FFF7D6" strokeWidth="1" opacity="0.8" />
          <circle cx="12" cy="12" r="3" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="1" fill="#FFF2B2" />
          <circle cx="42" cy="11" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
          <circle cx="11" cy="42" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
        </svg>

        {/* Bottom-Left Bracket */}
        <svg className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none z-20 transform scale-y-[-1]" viewBox="0 0 70 70" fill="none">
          <path d="M 0 0 L 62 0 C 46 0 26 10 20 26 C 15 36 15 50 0 62 Z" fill="url(#goldGradTL)" filter="url(#shadowTL)" />
          <path d="M 3 3 L 54 3 C 41 3 22 12 18 25 C 14 34 14 47 3 54 Z" fill="none" stroke="#FFF7D6" strokeWidth="1" opacity="0.8" />
          <circle cx="12" cy="12" r="3" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="1" fill="#FFF2B2" />
          <circle cx="42" cy="11" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
          <circle cx="11" cy="42" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
        </svg>

        {/* Bottom-Right Bracket */}
        <svg className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none z-20 transform scale-x-[-1] scale-y-[-1]" viewBox="0 0 70 70" fill="none">
          <path d="M 0 0 L 62 0 C 46 0 26 10 20 26 C 15 36 15 50 0 62 Z" fill="url(#goldGradTL)" filter="url(#shadowTL)" />
          <path d="M 3 3 L 54 3 C 41 3 22 12 18 25 C 14 34 14 47 3 54 Z" fill="none" stroke="#FFF7D6" strokeWidth="1" opacity="0.8" />
          <circle cx="12" cy="12" r="3" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.9" />
          <circle cx="12" cy="12" r="1" fill="#FFF2B2" />
          <circle cx="42" cy="11" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
          <circle cx="11" cy="42" r="2" fill="#3D2900" stroke="#FFF2B2" strokeWidth="0.7" />
        </svg>

        {/* --- HEADER SECTION: 3D Embossed Metallic Gold Badge ("Scan Me for Menu") --- */}
        <div
          className="relative z-30 mx-auto mt-1 mb-3 flex items-center justify-center px-7 py-2.5 rounded-full border border-[#FFF3C4]/70"
          style={{
            background: 'linear-gradient(135deg, #FFE99E 0%, #D4AF37 40%, #B8860B 75%, #7A550B 100%)',
            boxShadow: '0 6px 18px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.4)',
          }}
        >
          <span
            className="font-extrabold text-sm sm:text-base tracking-wide uppercase text-[#3B2500] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]"
            style={{ fontFamily: "'Montserrat', 'Poppins', system-ui, sans-serif" }}
          >
            {headerText}
          </span>
        </div>

        {/* --- INNER PARCHMENT CARD --- */}
        <div
          className="relative z-10 flex w-full flex-1 flex-col items-center overflow-hidden rounded-2xl p-4 sm:p-5 box-border"
          style={{
            background: 'linear-gradient(175deg, #FCF8F2 0%, #FAF4EA 50%, #F4EAD8 100%)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(212,175,55,0.45), inset 0 0 20px rgba(184,150,86,0.15)',
          }}
        >
          {/* Subtle Paper Noise Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paperNoise)' opacity='0.08'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Golden Frame Inner Border Line */}
          <div className="absolute inset-2 pointer-events-none rounded-xl border border-[#D4AF37]/35" />

          {/* --- BOTANICAL WATERCOLOR LEAVES (4 CORNERS) --- */}
          {/* Top-Left Botanical Leaf */}
          <svg className="absolute top-2 left-2 w-16 h-16 pointer-events-none opacity-85 text-[#B89656]" viewBox="0 0 100 100" fill="none">
            <path d="M15 15 C 35 5, 65 15, 80 40 C 60 50, 45 42, 28 55 C 18 42, 12 28, 15 15 Z" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18 18 Q 48 30 75 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 32 24 Q 40 18 50 20" stroke="currentColor" strokeWidth="0.9" />
            <path d="M 44 28 Q 54 24 64 28" stroke="currentColor" strokeWidth="0.9" />
            <path d="M 28 32 Q 32 42 26 50" stroke="currentColor" strokeWidth="0.9" />
            <circle cx="20" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
          </svg>

          {/* Top-Right Botanical Leaf */}
          <svg className="absolute top-2 right-2 w-16 h-16 pointer-events-none opacity-85 text-[#B89656] transform scale-x-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M15 15 C 35 5, 65 15, 80 40 C 60 50, 45 42, 28 55 C 18 42, 12 28, 15 15 Z" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18 18 Q 48 30 75 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 32 24 Q 40 18 50 20" stroke="currentColor" strokeWidth="0.9" />
            <path d="M 44 28 Q 54 24 64 28" stroke="currentColor" strokeWidth="0.9" />
            <circle cx="20" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
          </svg>

          {/* Bottom-Left Botanical Leaf */}
          <svg className="absolute bottom-2 left-2 w-16 h-16 pointer-events-none opacity-85 text-[#B89656] transform scale-y-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M15 15 C 35 5, 65 15, 80 40 C 60 50, 45 42, 28 55 C 18 42, 12 28, 15 15 Z" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18 18 Q 48 30 75 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 32 24 Q 40 18 50 20" stroke="currentColor" strokeWidth="0.9" />
            <path d="M 44 28 Q 54 24 64 28" stroke="currentColor" strokeWidth="0.9" />
            <circle cx="20" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
          </svg>

          {/* Bottom-Right Botanical Leaf */}
          <svg className="absolute bottom-2 right-2 w-16 h-16 pointer-events-none opacity-85 text-[#B89656] transform scale-x-[-1] scale-y-[-1]" viewBox="0 0 100 100" fill="none">
            <path d="M15 15 C 35 5, 65 15, 80 40 C 60 50, 45 42, 28 55 C 18 42, 12 28, 15 15 Z" fill="currentColor" fillOpacity="0.13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18 18 Q 48 30 75 42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 32 24 Q 40 18 50 20" stroke="currentColor" strokeWidth="0.9" />
            <path d="M 44 28 Q 54 24 64 28" stroke="currentColor" strokeWidth="0.9" />
            <circle cx="20" cy="12" r="2.5" fill="currentColor" opacity="0.6" />
            <circle cx="12" cy="20" r="2" fill="currentColor" opacity="0.5" />
          </svg>

          {/* --- BRANDING AREA --- */}
          <div className="relative z-10 flex flex-col items-center pt-2 text-center">
            {/* MenusQR Logo Mark */}
            <div className="flex items-center gap-1.5 mb-1">
              <div className="p-1 rounded-md bg-[#3B2500] text-[#FFE89E] shadow-sm">
                <ChefHat size={16} strokeWidth={2} />
              </div>
              <span className="text-xs font-black tracking-widest text-[#3B2500] uppercase">
                Menus<span className="text-[#D4AF37]">QR</span>
              </span>
            </div>

            {/* Restaurant Name */}
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-[#22140A] tracking-tight leading-tight max-w-[280px] break-words mt-1 mb-0.5"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              {restaurantName}
            </h2>

            {/* Subtitle */}
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#8C6D37] opacity-90">
              {category}
            </p>

            {tagline && (
              <p className="text-xs italic text-[#6B4F26] mt-0.5 max-w-[260px] truncate">
                {tagline}
              </p>
            )}
          </div>

          {/* --- QR CODE CONTAINER AREA --- */}
          <div className="relative z-10 my-4 flex flex-col items-center">
            <div
              className="relative flex h-44 w-44 sm:h-48 sm:w-48 items-center justify-center rounded-2xl bg-white p-3 shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
              style={{
                border: '3px solid #D4AF37',
              }}
            >
              {qrImage ? (
                <>
                  <img src={qrImage} alt="Menu QR Code" className="h-full w-full object-contain" />
                  {/* Center Badge Icon on QR */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white p-1 rounded-lg shadow-md">
                      <div className="bg-[#3B2500] text-[#FFE99E] p-1.5 rounded-md flex items-center justify-center">
                        <ChefHat size={16} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-[#D4AF37]/40 rounded-xl bg-[#FAF4EA]">
                  <span className="text-xs font-semibold text-[#8C6D37]">Generating QR...</span>
                </div>
              )}
            </div>
          </div>

          {/* --- FOOTER CONTENT ON CARD --- */}
          <div className="relative z-10 flex flex-col items-center text-center mt-auto pb-1">
            <h3
              className="text-base sm:text-lg font-extrabold text-[#22140A] tracking-tight"
              style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
            >
              Scan to view our menu
            </h3>

            <p className="text-xs font-medium text-[#7C5E28] tracking-wide mt-0.5">
              {domain}
            </p>

            <div className="flex items-center justify-center gap-2 w-full mt-2 pt-1 border-t border-[#D4AF37]/30">
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#A88241]">
                ONE QR — ALWAYS THE LATEST MENU
              </span>
            </div>
          </div>
        </div>

        {/* --- ACTION & STATUS BAR (ON WOODEN PANEL) --- */}
        {showStatusBadge && (
          <div
            className="relative z-30 mx-auto mt-3 flex items-center justify-center gap-2 px-5 py-2 rounded-full border border-[#FFF3C4]/60"
            style={{
              background: 'linear-gradient(135deg, #FFE99E 0%, #D4AF37 50%, #8C6200 100%)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.8)',
            }}
          >
            <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <CheckCircle2 size={12} strokeWidth={3} />
            </div>
            <span className="font-bold text-xs text-[#3A2300] tracking-wide">
              Your permanent QR is ready
            </span>
          </div>
        )}

        {/* Download Buttons Bar */}
        {showDownloadButtons && (onDownloadPNG || onDownloadSVG) && (
          <div className="relative z-30 flex items-center justify-center gap-3 w-full max-w-[320px] mt-3">
            {onDownloadPNG && (
              <button
                type="button"
                onClick={onDownloadPNG}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-[#D4AF37]/70 bg-gradient-to-b from-[#4A2D1B] to-[#25140A] text-[#FFE89E] font-bold text-xs sm:text-sm shadow-md hover:brightness-125 transition-all active:scale-95 cursor-pointer"
              >
                <Download size={14} /> PNG
              </button>
            )}
            {onDownloadSVG && (
              <button
                type="button"
                onClick={onDownloadSVG}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl border border-[#D4AF37]/70 bg-gradient-to-b from-[#4A2D1B] to-[#25140A] text-[#FFE89E] font-bold text-xs sm:text-sm shadow-md hover:brightness-125 transition-all active:scale-95 cursor-pointer"
              >
                <Download size={14} /> SVG
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

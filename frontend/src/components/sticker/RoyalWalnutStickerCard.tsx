import React from 'react';
import { MenusQRMark } from '../brand/MenusQRMark';
import { type StickerThemeId } from './StickerTemplates';

export type { StickerThemeId };

export interface RoyalWalnutStickerCardProps {
  restaurantName: string;
  category?: string;
  tagline?: string;
  menuUrl: string;
  qrImage: string;
  phone?: string;
  address?: string;
  headerText?: string;
  footerText?: string;
  isModal?: boolean;
  themeId?: StickerThemeId;
  stickerRef?: React.RefObject<HTMLDivElement | null>;
  showStatusBadge?: boolean;
  showDownloadButtons?: boolean;
  onDownloadPNG?: () => void;
  tableNumber?: string;
}

// ============================================================================
// HIGH-FIDELITY VECTOR GRAPHICS: TANDOOR FIRE (Indian Spices & Haveli Arch)
// ============================================================================

function HaveliArchSilhouette({ color = '#EA580C' }: { color?: string }) {
  return (
    <svg className="w-full h-7 overflow-visible opacity-80 my-1" viewBox="0 0 300 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 15 24 L 75 24 Q 105 24 125 17 Q 142 9 150 2 Q 158 9 175 17 Q 195 24 225 24 L 285 24"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="150" cy="2" r="3" fill={color} />
      <circle cx="105" cy="24" r="1.5" fill={color} />
      <circle cx="195" cy="24" r="1.5" fill={color} />
    </svg>
  );
}

function StarAniseEtching({ className = 'w-7 h-7', color = '#F59E0B' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill={color} fillOpacity="0.9">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 50 50)`}>
            <path d="M50 8 C53 22 56 32 63 36 C57 40 53 46 50 50 C47 46 43 40 37 36 C44 32 47 22 50 8 Z" />
            <ellipse cx="50" cy="24" rx="2.5" ry="5" fill="#1C1917" />
          </g>
        ))}
        <circle cx="50" cy="50" r="7" fill={color} />
        <circle cx="50" cy="50" r="3" fill="#1C1917" />
      </g>
    </svg>
  );
}

function CardamomCluster({ className = 'w-5 h-7', color = '#EA580C' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M35 5 C52 22 60 50 48 76 C40 88 28 88 20 76 C8 50 16 22 35 5 Z"
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeWidth="2.2"
      />
      <path d="M35 10 Q37 48 35 80" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M26 30 Q30 52 28 72" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M44 30 Q40 52 42 72" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
}

// ============================================================================
// HIGH-FIDELITY VECTOR GRAPHICS: HERB GARDEN (Artisan French Bistro & Olive Leaves)
// ============================================================================

function ArtisanClocheCrest({ color = '#143823', accent = '#B85032' }: { color?: string; accent?: string }) {
  return (
    <svg className="w-20 h-14 overflow-visible" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="56" width="80" height="5" rx="2.5" fill={color} />
      <line x1="14" y1="64" x2="106" y2="64" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      <path
        d="M 26 56 C 26 30 42 22 60 22 C 78 22 94 30 94 56 Z"
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeWidth="2.5"
      />
      <circle cx="60" cy="18" r="4.5" fill={accent} stroke={color} strokeWidth="1.5" />
      
      <path d="M 52 12 Q 50 6 54 2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
      <path d="M 60 11 Q 62 5 60 1" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
      <path d="M 68 12 Q 70 6 66 2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />

      <path d="M 28 72 Q 44 76 60 76 Q 76 76 92 72" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="44" cy="74" rx="4" ry="2" fill={color} transform="rotate(-15 44 74)" />
      <ellipse cx="76" cy="74" rx="4" ry="2" fill={color} transform="rotate(15 76 74)" />
      <circle cx="60" cy="76" r="2.5" fill={accent} />
    </svg>
  );
}

function OliveSprigCorner({ className = 'w-11 h-15', color = '#143823' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 110 Q40 60 50 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="28" cy="90" rx="9" ry="4" fill={color} transform="rotate(-35 28 90)" />
      <ellipse cx="44" cy="80" rx="9" ry="4" fill={color} transform="rotate(35 44 80)" />
      <ellipse cx="34" cy="60" rx="8" ry="3.5" fill={color} transform="rotate(-30 34 60)" />
      <ellipse cx="48" cy="50" rx="8" ry="3.5" fill={color} transform="rotate(30 48 50)" />
      <ellipse cx="40" cy="32" rx="7" ry="3" fill={color} transform="rotate(-25 40 32)" />
      <ellipse cx="50" cy="24" rx="6" ry="2.8" fill={color} transform="rotate(25 50 24)" />
      <circle cx="24" cy="74" r="3.5" fill="#B85032" />
    </svg>
  );
}

// ============================================================================
// HIGH-FIDELITY VECTOR GRAPHICS: NEON BITES (Urban Gastro-Bar & Street Food)
// ============================================================================

function GastroBurgerEmblem() {
  return (
    <svg className="w-11 h-11 overflow-visible" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 16 34 C 16 16 64 16 64 34 Z"
        fill="#FFE600"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      <circle cx="30" cy="24" r="1.8" fill="#FFFFFF" />
      <circle cx="42" cy="20" r="1.8" fill="#FFFFFF" />
      <circle cx="52" cy="24" r="1.8" fill="#FFFFFF" />
      <path d="M 12 40 Q 20 36 28 42 Q 36 36 44 42 Q 52 36 60 42 Q 68 36 72 40" stroke="#FF3366" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="15" y="47" width="50" height="9" rx="4.5" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M 18 61 C 18 68 62 68 62 61 Z" fill="#FFE600" stroke="#FFFFFF" strokeWidth="2.5" />
    </svg>
  );
}

function CraftDrinkEmblem() {
  return (
    <svg className="w-9 h-11 overflow-visible" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M 10 18 Q 12 38 30 38 Q 48 38 50 18 Z" fill="#FF3366" fillOpacity="0.25" stroke="#FF3366" strokeWidth="2.5" />
      <line x1="30" y1="38" x2="30" y2="58" stroke="#00F0FF" strokeWidth="2.5" />
      <line x1="18" y1="58" x2="42" y2="58" stroke="#00F0FF" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="8" x2="36" y2="28" stroke="#FFE600" strokeWidth="2" />
      <circle cx="36" cy="28" r="4" fill="#FFE600" />
    </svg>
  );
}

// ============================================================================
// CONCEPT 0: FLAGSHIP CULINARY STANDEE (Physical Walnut Base, 3D Gold Rim, Sizzling Skillet & Spices)
// ============================================================================

interface CardProps {
  restaurantName: string;
  category: string;
  tagline?: string;
  headerText: string;
  footerText: string;
  menuUrl: string;
  qrImage: string;
  domain: string;
  tableNumber?: string;
}

function FlagshipCulinaryStandeeCard({
  restaurantName,
  category,
  tagline,
  headerText,
  qrImage,
  tableNumber,
}: CardProps) {
  const [standeeImg, setStandeeImg] = React.useState('/assets/standee/flagship_culinary_standee_master.webp');

  return (
    <div className="relative w-full aspect-[815/1255] overflow-hidden rounded-[2.2rem] select-none font-sans">
      {/* Photorealistic 3D Table Standee Base Layer */}
      <img
        src={standeeImg}
        alt="MenusQR Physical Table Standee"
        onError={() => setStandeeImg('/assets/standee/flagship_culinary_standee_master.png')}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* --- TOP DYNAMIC BRANDING ZONE --- */}
      <div
        className="absolute z-10 flex flex-col items-center text-center"
        style={{
          top: '3.6%',
          left: '18%',
          right: '18%',
        }}
      >
        {/* Official MenusQR Brand Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#D4AF37]/60 shadow-lg">
          <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
            <MenusQRMark color="#FFFFFF" orange="#EA580C" />
          </div>
          <span className="text-[10px] font-black tracking-[0.24em] text-[#FEF3C7] uppercase">
            MENUSQR
          </span>
          <span className="text-[#D4AF37] text-[7px]">✦</span>
          <span className="text-[8px] font-bold tracking-widest text-[#E8C15A] uppercase">
            {headerText || 'DIGITAL MENU'}
          </span>
        </div>

        {/* Dynamic Client Restaurant Name (Embossed 3D Gold Typography) */}
        <h2
          className={`font-black tracking-tight leading-tight w-full max-w-[320px] px-2 break-words text-center uppercase mt-1 ${
            restaurantName.length > 24
              ? 'text-base sm:text-lg'
              : restaurantName.length > 15
              ? 'text-lg sm:text-xl'
              : 'text-xl sm:text-2xl'
          }`}
          style={{
            fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif",
            background: 'linear-gradient(135deg, #FFF9D2 0%, #F5D77F 25%, #D4AF37 55%, #9E7412 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.95)) drop-shadow(0 0 14px rgba(212,175,55,0.45))',
          }}
        >
          {restaurantName}
        </h2>

        {/* Dynamic Cuisine Category with Gold Accents */}
        <div className="flex items-center justify-center gap-2 mt-0.5 max-w-[280px]">
          <span className="h-[1px] w-5 bg-gradient-to-r from-transparent to-[#D4AF37]" />
          <p className="text-[8.5px] sm:text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-[#E8C15A] truncate drop-shadow">
            {category || 'AUTHENTIC FLAVORS • TABLE SERVICE'}
          </p>
          <span className="h-[1px] w-5 bg-gradient-to-l from-transparent to-[#D4AF37]" />
        </div>

        {/* Tagline */}
        {tagline && (
          <p className="text-[8px] italic text-[#FEF3C7]/80 max-w-[240px] truncate mt-0.5 drop-shadow">
            "{tagline}"
          </p>
        )}
      </div>

      {/* --- CENTER 3D GOLD QR CHAMBER --- */}
      <div
        className="absolute z-10 flex items-center justify-center rounded-[1.2rem] sm:rounded-[1.4rem] overflow-hidden p-2 sm:p-2.5"
        style={{
          left: '32.88%',
          top: '41.27%',
          width: '36.81%',
          height: '23.90%',
        }}
      >
        {qrImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={qrImage}
              alt={`QR code for ${restaurantName}`}
              className="w-full h-full object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Center MenusQR Seal */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-[#110D0B] border-2 border-[#D4AF37] p-1 flex items-center justify-center shadow-lg">
                <MenusQRMark color="#FFFFFF" orange="#EA580C" />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[9px] font-bold text-black/60">Generating QR...</div>
        )}
      </div>

      {/* Dynamic Table Number Plaque (if provided) */}
      {tableNumber && (
        <div
          className="absolute z-20 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#FFF1B0] to-[#D4AF37] text-[#1A120B] font-black text-[9px] sm:text-[10px] tracking-widest uppercase shadow-xl border border-black/30"
          style={{
            top: '66.2%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          TABLE #{tableNumber}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONCEPT 1: TANDOOR FIRE CARD (Authentic Hearth, Smoked Charcoal & Saffron)
// ============================================================================

function TandoorFireCard({
  restaurantName,
  category,
  tagline,
  headerText,
  footerText,
  qrImage,
  domain,
  tableNumber,
}: CardProps) {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-between overflow-hidden rounded-[2.3rem] bg-[#110D0B] p-5 sm:p-6 text-[#FAF4E8] border-2 border-[#EA580C]/50 shadow-2xl">
      {/* Warm Saffron & Clay Charcoal Hearth Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle at 50% -5%, #C2410C 0%, #431407 35%, #180D07 70%, #0A0807 100%)',
        }}
      />

      {/* Subtle Micro Spice Hearth Stipple Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Architectural Inner Haveli Frame */}
      <div className="absolute inset-3 pointer-events-none rounded-[1.7rem] border border-[#EA580C]/35" />
      <div className="absolute inset-4 pointer-events-none rounded-[1.5rem] border border-[#F59E0B]/20" />

      {/* Spice Botanical Corner Ornaments */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-90 rotate-[-12deg]">
        <StarAniseEtching className="w-8 h-8" color="#F59E0B" />
      </div>
      <div className="absolute top-4 right-4 pointer-events-none opacity-90 rotate-[18deg]">
        <StarAniseEtching className="w-8 h-8" color="#F59E0B" />
      </div>
      <div className="absolute bottom-16 left-4 pointer-events-none opacity-80">
        <CardamomCluster className="w-6 h-8" color="#EA580C" />
      </div>
      <div className="absolute bottom-16 right-4 pointer-events-none opacity-80 scale-x-[-1]">
        <CardamomCluster className="w-6 h-8" color="#EA580C" />
      </div>

      {/* --- TOP BRAND MASTHEAD & HAVELI ARCH --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full pt-1">
        
        {/* Heritage Service Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#27120A] border border-[#EA580C]/60 shadow-md mb-1.5">
          <span className="text-[#F59E0B] text-xs">✦</span>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FEF3C7]">
            {headerText}
          </span>
          <span className="text-[#F59E0B] text-xs">✦</span>
        </div>

        {/* Traditional Haveli Arch Silhouette */}
        <HaveliArchSilhouette color="#EA580C" />

        {/* Restaurant Name (Grand Regal Typography) */}
        <h2
          className={`font-black tracking-tight leading-tight w-full max-w-[340px] px-2 break-words text-[#FFFBEB] mt-0.5 ${
            restaurantName.length > 24
              ? 'text-xl sm:text-2xl'
              : restaurantName.length > 15
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-4xl'
          }`}
          style={{
            fontFamily: "'Playfair Display', 'Rozha One', Georgia, serif",
            textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 0 25px rgba(234,88,12,0.3)',
          }}
        >
          {restaurantName}
        </h2>

        {/* Cuisine Subtitle Banner */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#F59E0B]" />
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#F59E0B]">
            {category || 'AUTHENTIC TANDOOR & CLAY OVEN CRAFT'}
          </p>
          <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#F59E0B]" />
        </div>

        {tagline && (
          <p className="text-[10px] italic text-[#D6C7B2] max-w-[280px] truncate mt-1">
            "{tagline}"
          </p>
        )}
      </div>

      {/* --- CENTER CLAY HEARTH QR PORTAL --- */}
      <div className="relative z-10 my-2 flex flex-col items-center">
        {/* Clay Oven Portal Bezel */}
        <div
          className="relative p-3.5 rounded-[2.2rem] border-2 shadow-2xl transition-all"
          style={{
            background: 'linear-gradient(150deg, #2A140B 0%, #150B06 100%)',
            borderColor: '#EA580C',
            boxShadow: '0 18px 40px rgba(0,0,0,0.85), 0 0 35px rgba(234,88,12,0.3), inset 0 1px 2px rgba(255,255,255,0.2)',
          }}
        >
          {/* Saffron Corner Notches */}
          <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-[#F59E0B] rounded-tl-lg" />
          <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-[#F59E0B] rounded-tr-lg" />
          <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-[#F59E0B] rounded-bl-lg" />
          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-[#F59E0B] rounded-br-lg" />

          {/* High-Contrast Pure White QR Canvas Bed */}
          <div className="relative flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center rounded-[1.6rem] bg-white p-2.5 shadow-inner">
            {qrImage ? (
              <>
                <img
                  src={qrImage}
                  alt={`QR code for ${restaurantName}`}
                  className="h-full w-full object-contain"
                />
                {/* Central MenusQR Seal */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-[#110D0B] border-2 border-[#EA580C] p-1 flex items-center justify-center shadow-lg">
                    <MenusQRMark color="#FFFFFF" orange="#EA580C" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-black/60">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* Table Number Brass Plaque */}
        {tableNumber && (
          <div className="mt-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#C2410C] via-[#EA580C] to-[#C2410C] text-[#FFFBEB] font-black text-xs tracking-widest uppercase shadow-lg border border-[#F59E0B]/60">
            TABLE #{tableNumber}
          </div>
        )}
      </div>

      {/* --- BOTTOM APPETIZING CALLOUT & INSTRUCTIONS --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <h3
          className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#FEF3C7]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {footerText}
        </h3>

        {/* Instant Action Pill Badge */}
        <div className="mt-1.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#241108] border border-[#EA580C]/50 text-[9px] sm:text-[10px] font-bold text-[#F59E0B] tracking-wider uppercase shadow-inner">
          <span>📷 POINT CAMERA</span>
          <span>•</span>
          <span>TAP BANNER</span>
          <span>•</span>
          <span>EXPLORE LIVE MENU</span>
        </div>

        {/* Clean Balanced Footer Strip */}
        <div className="mt-2.5 flex items-center justify-between w-full pt-2 border-t border-[#EA580C]/25 text-[8px] sm:text-[9px] font-bold tracking-[0.16em] text-[#CBB9A3] uppercase px-1">
          <span>FRESH TO ORDER</span>
          <span className="text-[#F59E0B] font-mono lowercase font-extrabold">{domain}</span>
          <span>100% CONTACTLESS</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 2: HERB GARDEN CARD (French Bistro, Botanical Sage & Olive Paper)
// ============================================================================

function HerbGardenCard({
  restaurantName,
  category,
  tagline,
  headerText,
  footerText,
  qrImage,
  domain,
  tableNumber,
}: CardProps) {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-between overflow-hidden rounded-[2.3rem] bg-[#FCFBF7] p-5 sm:p-6 text-[#143823] border-2 border-[#143823]/30 shadow-2xl">
      {/* Warm French Linen Paper Tone Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, #F8F5EE 60%, #EFE9DC 100%)',
        }}
      />

      {/* Double Fine Heritage Framing Lines */}
      <div className="absolute inset-3 pointer-events-none rounded-[1.7rem] border-2 border-[#143823]/20" />
      <div className="absolute inset-4 pointer-events-none rounded-[1.5rem] border border-dashed border-[#4A7C59]/35" />

      {/* Botanical Olive & Herb Sprigs Framing All 4 Corners */}
      <div className="absolute top-3 left-3 pointer-events-none opacity-85 rotate-[-15deg]">
        <OliveSprigCorner className="w-11 h-14" color="#143823" />
      </div>
      <div className="absolute top-3 right-3 pointer-events-none opacity-85 scale-x-[-1] rotate-[-15deg]">
        <OliveSprigCorner className="w-11 h-14" color="#143823" />
      </div>
      <div className="absolute bottom-14 left-3 pointer-events-none opacity-65 scale-y-[-1] rotate-[10deg]">
        <OliveSprigCorner className="w-9 h-12" color="#4A7C59" />
      </div>
      <div className="absolute bottom-14 right-3 pointer-events-none opacity-65 scale-[-1] rotate-[10deg]">
        <OliveSprigCorner className="w-9 h-12" color="#4A7C59" />
      </div>

      {/* --- TOP BRANDING & ARTISAN CLOCHE CREST --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full pt-0.5">
        
        {/* Artisan Cloche & Laurel Crest */}
        <div className="mb-0.5 flex items-center justify-center">
          <ArtisanClocheCrest color="#143823" accent="#B85032" />
        </div>

        {/* Artisanal Eyebrow */}
        <span className="text-[10px] font-extrabold tracking-[0.24em] text-[#B85032] uppercase mb-1">
          {headerText}
        </span>

        {/* Restaurant Name (Editorial Paris Bistro Typography) */}
        <h2
          className={`font-black tracking-tight leading-tight w-full max-w-[340px] px-2 break-words text-[#143823] ${
            restaurantName.length > 24
              ? 'text-xl sm:text-2xl'
              : restaurantName.length > 15
              ? 'text-2xl sm:text-3xl'
              : 'text-3xl sm:text-4xl'
          }`}
          style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
          }}
        >
          {restaurantName}
        </h2>

        {/* Category & Botanical Leaf Divider */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-[#4A7C59]">❧</span>
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#143823]">
            {category || 'BISTRO • BAKERY • FARM-TO-TABLE'}
          </p>
          <span className="text-xs text-[#4A7C59]">☙</span>
        </div>

        {tagline && (
          <p className="text-[10px] italic text-[#526B5C] max-w-[280px] truncate mt-0.5">
            "{tagline}"
          </p>
        )}
      </div>

      {/* --- CENTER PORCELAIN CERAMIC PLATE QR DOCK --- */}
      <div className="relative z-10 my-2 flex flex-col items-center">
        {/* Ceramic Rim Bezel with Soft Shadow */}
        <div
          className="relative p-3.5 rounded-[2.2rem] border-2 shadow-xl"
          style={{
            background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F1E6 100%)',
            borderColor: '#143823',
            boxShadow: '0 16px 36px rgba(20,56,35,0.14), inset 0 1px 2px rgba(255,255,255,0.9)',
          }}
        >
          {/* Running Stitch Border */}
          <div className="absolute inset-1.5 pointer-events-none rounded-[1.8rem] border border-dashed border-[#4A7C59]/40" />

          {/* High-Contrast Pure White QR Canvas */}
          <div className="relative flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center rounded-[1.6rem] bg-white p-2.5 shadow-sm">
            {qrImage ? (
              <>
                <img
                  src={qrImage}
                  alt={`QR code for ${restaurantName}`}
                  className="h-full w-full object-contain"
                />
                {/* Central Emblem Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-xl bg-[#143823] border-2 border-[#FCFBF7] p-1 flex items-center justify-center shadow-md">
                    <MenusQRMark color="#FFFFFF" orange="#B85032" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#143823]/50">
                Generating QR...
              </div>
            )}
          </div>
        </div>

        {/* Table Number Seal */}
        {tableNumber && (
          <div className="mt-2 px-4 py-1 rounded-full bg-[#143823] text-white font-black text-xs tracking-widest uppercase shadow-md border border-[#FCFBF7]">
            TABLE #{tableNumber}
          </div>
        )}
      </div>

      {/* --- BOTTOM CALLOUT & INSTRUCTIONS --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <h3
          className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#143823]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {footerText}
        </h3>

        {/* Instruction Badge */}
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAE4D5]/80 border border-[#143823]/25 text-[9px] sm:text-[10px] font-bold text-[#143823] tracking-wider uppercase">
          <span>🌿 TOUCHLESS DIGITAL MENU</span>
          <span>•</span>
          <span>SEASONAL SELECTION</span>
        </div>

        {/* Clean Balanced Footer Strip */}
        <div className="mt-2.5 flex items-center justify-between w-full pt-2 border-t border-[#143823]/20 text-[8px] sm:text-[9px] font-bold tracking-[0.16em] text-[#526B5C] uppercase px-1">
          <span>ORGANICALLY CRAFTED</span>
          <span className="text-[#143823] font-mono lowercase font-extrabold">{domain}</span>
          <span>TOUCHLESS DINING</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONCEPT 3: NEON BITES CARD (Trendy Urban Gastro-Bar & Modern Street Eats)
// ============================================================================

function NeonBitesCard({
  restaurantName,
  category,
  tagline,
  headerText,
  footerText,
  qrImage,
  domain,
  tableNumber,
}: CardProps) {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-between overflow-hidden rounded-[2.3rem] bg-[#0B0E14] p-5 sm:p-6 text-white border-2 border-[#00F0FF]/60 shadow-2xl">
      {/* High-Contrast Cyber Sunset Gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background: 'radial-gradient(circle at 80% 0%, #FF3366 0%, #00F0FF 40%, transparent 75%)',
        }}
      />

      {/* Modern Street Stencil Texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#00F0FF 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Modern Gastro-Bar Graphic Badges in Top Corners */}
      <div className="absolute top-4 left-4 pointer-events-none opacity-90">
        <GastroBurgerEmblem />
      </div>
      <div className="absolute top-4 right-4 pointer-events-none opacity-90">
        <CraftDrinkEmblem />
      </div>

      {/* Industrial Reticle Corner Tabs */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#00F0FF]" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#FF3366]" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#FF3366]" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#00F0FF]" />

      {/* --- TOP HIGH-ENERGY MASTHEAD --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full pt-1">
        
        {/* Punchy Neon Header Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#151B27] border border-[#00F0FF] shadow-lg shadow-[#00F0FF]/20 mb-2">
          <span className="text-[#FFE600] text-xs">⚡</span>
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#00F0FF]">
            {headerText}
          </span>
          <span className="text-[#FFE600] text-xs">⚡</span>
        </div>

        {/* Restaurant Name (Heavy Condensed Street Typography) */}
        <h2
          className={`font-black tracking-tight leading-none w-full max-w-[340px] px-2 break-words uppercase text-white mt-1 ${
            restaurantName.length > 24
              ? 'text-2xl sm:text-3xl'
              : restaurantName.length > 15
              ? 'text-3xl sm:text-4xl'
              : 'text-4xl sm:text-5xl'
          }`}
          style={{
            fontFamily: "'Anton', 'Oswald', 'Bebas Neue', sans-serif",
            letterSpacing: '0.04em',
            textShadow: '0 0 14px rgba(0,240,255,0.45), 0 2px 0 #FF3366',
          }}
        >
          {restaurantName}
        </h2>

        {/* High-Energy Category Badge */}
        <div className="mt-2 inline-block px-3 py-0.5 rounded bg-[#FF3366]/20 border border-[#FF3366]">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FFE600]">
            {category || 'STREET FOOD • GASTRO-BAR • CRAFT BITES'}
          </p>
        </div>

        {tagline && (
          <p className="text-[10px] font-mono text-[#94A3B8] max-w-[280px] truncate mt-1">
            //{tagline}
          </p>
        )}
      </div>

      {/* --- CENTER HIGH-TECH NEON QR DOCK --- */}
      <div className="relative z-10 my-2 flex flex-col items-center">
        {/* Neon Dock Bezel */}
        <div
          className="relative p-3.5 rounded-2xl border-2 transition-all"
          style={{
            background: 'linear-gradient(145deg, #141A26 0%, #080A0E 100%)',
            borderColor: '#00F0FF',
            boxShadow: '0 0 30px rgba(0,240,255,0.35), inset 0 0 15px rgba(255,51,102,0.2)',
          }}
        >
          {/* Target Alignment Reticles */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00F0FF]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FF3366]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#FF3366]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00F0FF]" />

          {/* High-Contrast Pure White QR Canvas */}
          <div className="relative flex h-48 w-48 sm:h-52 sm:w-52 items-center justify-center rounded-xl bg-white p-2.5 shadow-2xl">
            {qrImage ? (
              <>
                <img
                  src={qrImage}
                  alt={`QR code for ${restaurantName}`}
                  className="h-full w-full object-contain"
                />
                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-lg bg-black border-2 border-[#00F0FF] p-1 flex items-center justify-center shadow-lg">
                    <MenusQRMark color="#FFFFFF" orange="#FF3366" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-mono font-bold text-black/60">
                INITIALIZING QR...
              </div>
            )}
          </div>
        </div>

        {/* Table Number Bar Tab */}
        {tableNumber && (
          <div className="mt-2 px-4 py-1 rounded bg-[#FFE600] text-black font-black text-xs tracking-widest uppercase shadow-lg border border-black">
            TAB // #{tableNumber}
          </div>
        )}
      </div>

      {/* --- BOTTOM CALLOUT & INSTRUCTIONS --- */}
      <div className="relative z-10 flex flex-col items-center text-center w-full">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
          {footerText}
        </h3>

        {/* Action Button Pill */}
        <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#151B27] border border-[#FF3366] text-[9px] sm:text-[10px] font-mono font-bold text-[#FFE600] tracking-wider uppercase">
          <span>⚡ POINT CAMERA</span>
          <span>•</span>
          <span>NO APP DOWNLOAD</span>
        </div>

        {/* Clean Balanced Footer Strip */}
        <div className="mt-2.5 flex items-center justify-between w-full pt-2 border-t border-[#00F0FF]/30 text-[8px] sm:text-[9px] font-mono font-bold tracking-[0.16em] text-[#94A3B8] uppercase px-1">
          <span>ZERO CONTACT</span>
          <span className="text-[#00F0FF] font-mono lowercase font-extrabold">{domain}</span>
          <span>HIGH VIBES</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT EXPORT
// ============================================================================

export default function RoyalWalnutStickerCard({
  restaurantName,
  category = 'FINE DINING & CULINARY EXCELLENCE',
  tagline,
  menuUrl,
  qrImage,
  headerText,
  footerText,
  isModal = false,
  themeId = 'menusqr-flagship-standee',
  stickerRef,
  tableNumber,
}: RoyalWalnutStickerCardProps) {
  // Domain extraction
  let domain = 'menusqr.in';
  try {
    if (menuUrl) {
      const parsed = new URL(menuUrl.startsWith('http') ? menuUrl : `https://${menuUrl}`);
      domain = parsed.host || 'menusqr.in';
    }
  } catch {
    domain = 'menusqr.in';
  }

  // Normalize legacy themes to flagship culinary concepts
  let activeTheme: 'flagship' | 'tandoor' | 'herb' | 'neon' = 'flagship';
  if (
    themeId === 'menusqr-flagship-standee' ||
    themeId === 'menusqr-obsidian-gold' ||
    themeId === 'menusqr-walnut-gold'
  ) {
    activeTheme = 'flagship';
  } else if (themeId === 'menusqr-tandoor-fire') {
    activeTheme = 'tandoor';
  } else if (themeId === 'menusqr-herb-garden' || themeId === 'menusqr-emerald-gold') {
    activeTheme = 'herb';
  } else if (
    themeId === 'menusqr-neon-bites' ||
    themeId === 'menusqr-ruby-gold' ||
    themeId === 'menusqr-marble-gold'
  ) {
    activeTheme = 'neon';
  } else {
    activeTheme = 'flagship';
  }

  // Shared props with tailored defaults per concept
  const cardProps: CardProps = {
    restaurantName,
    category,
    tagline,
    headerText:
      headerText ||
      (activeTheme === 'flagship'
        ? 'TABLE DINE-IN SERVICE'
        : activeTheme === 'tandoor'
        ? 'TABLE DINE-IN SERVICE'
        : activeTheme === 'herb'
        ? 'ARTISANAL KITCHEN & TABLE SERVICE'
        : 'STREET FOOD & GASTRO-BAR VIBES'),
    footerText:
      footerText ||
      (activeTheme === 'flagship'
        ? 'Point Phone Camera to Explore Menu'
        : activeTheme === 'tandoor'
        ? 'Point Phone Camera to Explore Menu'
        : activeTheme === 'herb'
        ? 'Scan with Camera to View Daily Menu'
        : 'Point Camera to Unlock Live Menu'),
    menuUrl,
    qrImage,
    domain,
    tableNumber,
  };

  return (
    <div className="flex flex-col items-center select-none font-sans">
      {/* --- PHYSICAL STAND / STICKER FRAME CONTAINER --- */}
      <div
        ref={stickerRef}
        data-testid="menusqr-standee-card"
        className={`${isModal ? 'qr-print-sticker ' : ''}relative flex w-[380px] sm:w-[416px] flex-col items-center overflow-hidden ${
          activeTheme === 'flagship'
            ? 'p-0 rounded-[2.2rem]'
            : 'min-h-[640px] rounded-[2.6rem] p-3'
        } box-border transition-all`}
        style={{
          background:
            activeTheme === 'flagship'
              ? 'transparent'
              : activeTheme === 'tandoor'
              ? 'linear-gradient(160deg, #24140D 0%, #0E0A08 50%, #1A0D07 100%)'
              : activeTheme === 'herb'
              ? 'linear-gradient(160deg, #EBE6DA 0%, #D8D0C0 50%, #C4B9A3 100%)'
              : 'linear-gradient(160deg, #151926 0%, #07080C 50%, #120D1A 100%)',
          boxShadow:
            activeTheme === 'flagship'
              ? '0 30px 70px -10px rgba(0,0,0,0.95)'
              : activeTheme === 'tandoor'
              ? '0 28px 60px -12px rgba(0,0,0,0.85), inset 0 1px 2px rgba(234,88,12,0.4)'
              : activeTheme === 'herb'
              ? '0 28px 60px -12px rgba(20,56,35,0.35), inset 0 1px 2px rgba(255,255,255,0.9)'
              : '0 28px 60px -12px rgba(0,0,0,0.95), 0 0 30px rgba(0,240,255,0.2), inset 0 1px 2px rgba(0,240,255,0.4)',
        }}
      >
        {activeTheme === 'flagship' && <FlagshipCulinaryStandeeCard {...cardProps} />}
        {activeTheme === 'tandoor' && <TandoorFireCard {...cardProps} />}
        {activeTheme === 'herb' && <HerbGardenCard {...cardProps} />}
        {activeTheme === 'neon' && <NeonBitesCard {...cardProps} />}
      </div>
    </div>
  );
}

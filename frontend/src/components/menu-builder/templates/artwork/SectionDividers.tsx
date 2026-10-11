import React from 'react';

export interface DividerProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
}

// 01. Royal Maharaja: Double Line + Central Faceted Diamond
export const FiligreeDiamondDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#D4AF37',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none">
      <path d="M12 0 L18 7 L12 14 L6 7 Z" fill={color} />
      <circle cx="12" cy="7" r="2" fill="#2A081A" />
      <circle cx="2" cy="7" r="1.5" fill={color} fillOpacity="0.7" />
      <circle cx="22" cy="7" r="1.5" fill={color} fillOpacity="0.7" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D4AF37]/60 to-[#D4AF37]" />
  </div>
);

// 02. Rajasthani Heritage: Terracotta Floral Lotus + Teal Vines
export const BotanicalVineDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#D76C3C',
  secondaryColor = '#315A53',
}) => (
  <div className={`flex items-center justify-center gap-2 w-full py-2 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#315A53]/50" />
    <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
      {/* Central Lotus */}
      <path d="M18 2 C16 7, 15 11, 18 14 C21 11, 20 7, 18 2 Z" fill={color} />
      <path d="M18 6 C13 9, 11 13, 16 14 Z" fill={color} fillOpacity="0.8" />
      <path d="M18 6 C23 9, 25 13, 20 14 Z" fill={color} fillOpacity="0.8" />
      {/* Side Foliage Tendrils */}
      <path d="M10 14 Q6 10 2 12" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 14 Q30 10 34 12" stroke={secondaryColor} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="4" cy="11" r="1" fill={color} />
      <circle cx="32" cy="11" r="1" fill={color} />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#315A53]/50" />
  </div>
);

// 03. Mughal Luxe: Interlocking 8-Point Gold Star Jaali
export const MughalJaaliDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#D7B66D',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#D7B66D]/50 to-[#D7B66D]" />
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
      <path
        d="M14 1 L17 5 L21 5 L19 9 L21 13 L17 13 L14 17 L11 13 L7 13 L9 9 L7 5 L11 5 Z"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="1"
      />
      <circle cx="14" cy="9" r="1.5" fill={color} />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#D7B66D]/50 to-[#D7B66D]" />
  </div>
);

// 04. Banarasi Gold: Woven Silk Zari Chevron
export const BanarasiZariDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#FFD700',
}) => (
  <div className={`flex items-center justify-center gap-2 w-full py-2 ${className}`}>
    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-[#FFD700]/40 to-[#FFD700]" />
    <svg width="32" height="12" viewBox="0 0 32 12" fill="none">
      <path d="M0 6 L8 0 L16 6 L24 0 L32 6 L24 12 L16 6 L8 12 Z" fill={color} fillOpacity="0.8" />
    </svg>
    <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-[#FFD700]/40 to-[#FFD700]" />
  </div>
);

// 05. Southern Heritage: Sacred Kolam Knotwork
export const KolamKnotDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#6E1B1B',
  secondaryColor = '#C28838',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#6E1B1B]/40" />
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
      <circle cx="10" cy="8" r="2" fill={secondaryColor} />
      <circle cx="20" cy="8" r="2.5" fill={color} />
      <circle cx="30" cy="8" r="2" fill={secondaryColor} />
      <path
        d="M6 8 C10 2, 20 2, 24 8 C28 14, 38 14, 34 8"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M6 8 C10 14, 20 14, 24 8 C28 2, 38 2, 34 8"
        stroke={secondaryColor}
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#6E1B1B]/40" />
  </div>
);

// 06. Indian Street Kitchen: Heavy Flame Stroke & Halftone Dashes
export const StreetStripeDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#E85A2A',
  secondaryColor = '#FACC15',
}) => (
  <div className={`flex items-center gap-1 w-full py-2 ${className}`}>
    <div className="h-1 flex-1" style={{ backgroundColor: color }} />
    <div className="h-1 w-4" style={{ backgroundColor: secondaryColor }} />
    <div className="h-1 w-2 bg-[#1C1C1C]" />
    <div className="h-1 w-4" style={{ backgroundColor: secondaryColor }} />
    <div className="h-1 flex-1" style={{ backgroundColor: color }} />
  </div>
);

// 07. Modern India: Saffron Notch Hairline
export const SaffronNotchDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#E8783C',
}) => (
  <div className={`flex items-center gap-2 w-full py-2 ${className}`}>
    <div className="w-10 h-0.5" style={{ backgroundColor: color }} />
    <div className="flex-1 h-px bg-neutral-300" />
    <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-400">MODERN GASTRONOMY</span>
  </div>
);

// 08. Spice House: Cinnamon Dust & Clove Point
export const SpiceDustDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#E68A00',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2 ${className}`}>
    <div className="flex-1 border-b border-dashed" style={{ borderColor: `${color}66` }} />
    <span className="text-xs" style={{ color }}>✦</span>
    <span className="text-sm" style={{ color }}>❖</span>
    <span className="text-xs" style={{ color }}>✦</span>
    <div className="flex-1 border-b border-dashed" style={{ borderColor: `${color}66` }} />
  </div>
);

// 09. Maison Noir: Ultra-Thin Platinum Line with Centered Dot
export const PlatinumHairlineDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#D4AF37',
}) => (
  <div className={`flex items-center justify-center gap-4 w-full py-3 ${className}`}>
    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    <div className="w-1.5 h-1.5 rotate-45 border" style={{ borderColor: `${color}99` }} />
    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  </div>
);

// 10. Ivory Dining: Classic Engraved Leaf & Bronze Bar
export const SalonLeafDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#8B7355',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2.5 ${className}`}>
    <div className="flex-1 h-px" style={{ backgroundColor: `${color}4D` }} />
    <span className="text-xs tracking-widest font-serif" style={{ color }}>✦ CARTE DU JOUR ✦</span>
    <div className="flex-1 h-px" style={{ backgroundColor: `${color}4D` }} />
  </div>
);

// 11. The Grand Table: Double Gold Banquet Bar
export const GrandGoldDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#D4AF37',
}) => (
  <div className={`flex flex-col items-center gap-0.5 w-full py-2.5 ${className}`}>
    <div className="w-full h-0.5" style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }} />
    <div className="w-4/5 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${color}99, transparent)` }} />
  </div>
);

// 12. Coffee House: Espresso Bean & Dashed Track
export const CoffeeBeanDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#E0A96D',
}) => (
  <div className={`flex items-center justify-center gap-3 w-full py-2 ${className}`}>
    <div className="flex-1 border-b border-dashed" style={{ borderColor: `${color}66` }} />
    <span className="text-xs" style={{ color }}>☕</span>
    <div className="flex-1 border-b border-dashed" style={{ borderColor: `${color}66` }} />
  </div>
);

// 13. Paper Cafe: Twisted Baker's Twine
export const TwineDashedDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#A65628',
}) => (
  <div className={`w-full py-2 ${className}`}>
    <div className="w-full h-0 border-b-2 border-dashed" style={{ borderColor: `${color}66` }} />
  </div>
);

// 14. Bombay Street: Irani Checkered Ribbon
export const IraniCheckerDivider: React.FC<DividerProps> = ({
  className = '',
  color = '#C82323',
  secondaryColor = '#FFFDF2',
}) => (
  <div className={`w-full py-1.5 flex items-center gap-2 ${className}`}>
    <div
      className="h-2.5 w-full rounded-sm"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${color} 0, ${color} 5px, ${secondaryColor} 5px, ${secondaryColor} 10px)`,
        border: `1px solid ${color}40`,
      }}
    />
  </div>
);

// 15. Minimal Editorial: Pure 0.5px Precision Hairline
export const SwissPrecisionDivider: React.FC<DividerProps> = ({
  className = '',
}) => (
  <div className={`w-full py-2 ${className}`}>
    <div className="w-full h-[0.5px] bg-neutral-200" />
  </div>
);

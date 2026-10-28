import React from 'react';

// ============================================================================
// 1. VINTAGE CREAM KITCHEN DOODLE BACKGROUND (Style of Image 1)
// ============================================================================
export const VintageKitchenDoodleBg: React.FC<{
  className?: string;
  opacity?: number;
  color?: string;
}> = ({ className = '', opacity = 0.14, color = '#6E5030' }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="vintageKitchenDoodles" width="280" height="280" patternUnits="userSpaceOnUse">
        <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Bell Pepper */}
          <path d="M 30 40 C 25 30, 45 30, 40 40 C 50 45, 55 65, 45 75 C 35 85, 20 80, 20 65 C 20 50, 25 45, 30 40 Z" />
          <path d="M 35 30 C 35 20, 40 18, 42 22" strokeWidth="1.6" />
          <path d="M 28 48 C 30 65, 36 70, 36 70" strokeWidth="0.8" />
          
          {/* Garlic Bulb */}
          <path d="M 85 45 C 75 55, 75 70, 85 75 C 95 80, 105 75, 105 60 C 105 50, 95 45, 90 40 Z" />
          <path d="M 90 40 L 92 32" strokeWidth="1.4" />
          <path d="M 85 75 C 87 60, 92 50, 90 40" strokeWidth="0.8" />
          <path d="M 97 74 C 95 62, 92 50, 90 40" strokeWidth="0.8" />

          {/* Mushroom */}
          <path d="M 140 50 C 130 30, 170 30, 160 50 Z" fill={color} fillOpacity="0.06" />
          <path d="M 146 50 L 148 65 C 148 68, 154 68, 154 65 L 156 50" />
          <circle cx="145" cy="40" r="1.5" fill={color} />
          <circle cx="155" cy="38" r="2" fill={color} />

          {/* Chili Pepper */}
          <path d="M 210 35 C 230 45, 235 65, 215 80 C 210 75, 220 55, 205 45 Z" fill={color} fillOpacity="0.08" />
          <path d="M 205 45 L 200 40" strokeWidth="1.5" />

          {/* Slice of Pizza */}
          <path d="M 40 140 L 75 185 C 65 192, 50 192, 35 185 Z" fill={color} fillOpacity="0.05" />
          <circle cx="48" cy="160" r="3" fill={color} fillOpacity="0.3" />
          <circle cx="60" cy="170" r="2.5" fill={color} fillOpacity="0.3" />
          <circle cx="42" cy="175" r="2" fill={color} fillOpacity="0.3" />

          {/* Burger Outline */}
          <path d="M 110 145 C 110 130, 140 130, 140 145 Z" />
          <rect x="108" y="147" width="26" height="4" rx="2" />
          <path d="M 108 153 Q 115 156 121 153 T 134 153" strokeWidth="1.4" />
          <rect x="110" y="157" width="22" height="4" rx="1.5" />

          {/* Noodles Bowl & Chopsticks */}
          <path d="M 180 150 C 180 170, 210 170, 210 150 Z" />
          <line x1="176" y1="150" x2="214" y2="150" strokeWidth="1.5" />
          <line x1="175" y1="140" x2="218" y2="135" strokeWidth="1.4" />
          <line x1="177" y1="144" x2="220" y2="139" strokeWidth="1.4" />
          <path d="M 186 150 Q 192 144 195 150" />
          <path d="M 194 150 Q 200 144 204 150" />

          {/* Tomato */}
          <circle cx="50" cy="235" r="14" fill={color} fillOpacity="0.05" />
          <path d="M 50 221 C 48 217, 52 217, 50 221" />
          <path d="M 45 221 L 55 221" />

          {/* Drink Cup with Straw */}
          <path d="M 115 225 L 120 255 C 120 258, 134 258, 134 255 L 139 225 Z" />
          <line x1="113" y1="225" x2="141" y2="225" strokeWidth="1.5" />
          <line x1="128" y1="225" x2="135" y2="210" strokeWidth="1.6" />

          {/* Broccoli Florette */}
          <path d="M 185 240 C 175 235, 175 225, 185 220 C 185 210, 205 210, 205 220 C 215 225, 215 235, 205 240 Z" />
          <path d="M 192 240 L 194 255 L 198 255 L 200 240" />

          {/* Kitchen Fork & Knife crossed */}
          <line x1="245" y1="130" x2="265" y2="160" strokeWidth="1.2" />
          <line x1="265" y1="130" x2="245" y2="160" strokeWidth="1.2" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#vintageKitchenDoodles)" />
  </svg>
);

// ============================================================================
// 2. CHALKBOARD WATERMARK DOODLE BACKGROUND (Style of Image 2)
// ============================================================================
export const ChalkboardDoodleBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.08 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="chalkboardDoodles" width="320" height="320" patternUnits="userSpaceOnUse">
        {/* Faint Chalk Typography */}
        <text x="20" y="45" fill="#FFFFFF" fontFamily="sans-serif" fontSize="22" fontWeight="900" letterSpacing="2" opacity="0.8">
          FAST FOOD
        </text>
        <text x="180" y="70" fill="#FFFFFF" fontFamily="serif" fontStyle="italic" fontSize="18" opacity="0.6">
          Delicious
        </text>
        <text x="40" y="120" fill="#FFFFFF" fontFamily="sans-serif" fontSize="32" fontWeight="900" opacity="0.4">
          BURGER
        </text>
        <text x="200" y="145" fill="#FFFFFF" fontFamily="sans-serif" fontSize="20" fontWeight="bold" opacity="0.7">
          PIZZA
        </text>
        <text x="15" y="200" fill="#FFFFFF" fontFamily="sans-serif" fontSize="24" fontWeight="800" opacity="0.6">
          CRISPY
        </text>
        <text x="150" y="225" fill="#FFFFFF" fontFamily="serif" fontStyle="italic" fontSize="26" opacity="0.5">
          Fresh Drinks
        </text>
        <text x="35" y="280" fill="#FFFFFF" fontFamily="sans-serif" fontSize="18" fontWeight="bold" letterSpacing="4" opacity="0.6">
          TASTY & HOT
        </text>
        <text x="200" y="295" fill="#FFFFFF" fontFamily="sans-serif" fontSize="20" fontWeight="900" opacity="0.5">
          GRILL
        </text>

        {/* Chalk Graphics */}
        <g stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.7">
          {/* Burger icon */}
          <path d="M 230 20 C 230 10, 260 10, 260 20 Z" />
          <line x1="228" y1="23" x2="262" y2="23" />
          <line x1="230" y1="27" x2="260" y2="27" />

          {/* French Fries icon */}
          <path d="M 120 70 L 125 95 L 145 95 L 150 70 Z" />
          <line x1="126" y1="70" x2="124" y2="55" strokeWidth="2" />
          <line x1="134" y1="70" x2="135" y2="52" strokeWidth="2" />
          <line x1="142" y1="70" x2="144" y2="56" strokeWidth="2" />

          {/* Pizza Slice */}
          <path d="M 130 145 L 155 180 C 145 186, 135 186, 125 180 Z" />
          <circle cx="137" cy="165" r="2" />
          <circle cx="145" cy="172" r="2" />

          {/* Drink bottle */}
          <rect x="250" y="220" width="16" height="35" rx="3" />
          <rect x="254" y="212" width="8" height="8" rx="1" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#chalkboardDoodles)" />
  </svg>
);

// ============================================================================
// 3. FLOATING CUTOUT ELEMENTS (Chilies, Basil, Lime, Spices)
// ============================================================================
export const CutoutRedChili: React.FC<{
  className?: string;
  size?: number;
  rotation?: number;
}> = ({ className = '', size = 52, rotation = -25 }) => (
  <div 
    className={`pointer-events-none select-none inline-block filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.35)] transition-transform ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <svg width={size} height={size * 1.3} viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chiliBody" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="40%" stopColor="#D91E18" />
          <stop offset="100%" stopColor="#7F0000" />
        </radialGradient>
        <linearGradient id="chiliStem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#558B2F" />
          <stop offset="100%" stopColor="#2E7D32" />
        </linearGradient>
      </defs>
      {/* Green Stem & Calyx */}
      <path d="M 32 8 C 34 2, 40 4, 38 12 L 34 16 C 30 18, 26 15, 28 12 Z" fill="url(#chiliStem)" />
      <path d="M 28 14 C 22 17, 36 21, 38 15 C 41 18, 32 23, 28 14 Z" fill="#2E7D32" />
      {/* Curved Chili Body */}
      <path d="M 32 16 C 44 26, 46 50, 24 74 C 23 76, 20 73, 22 70 C 35 48, 30 28, 26 18 Z" fill="url(#chiliBody)" />
      {/* High-Gloss Highlight */}
      <path d="M 31 22 C 37 32, 38 48, 28 62" stroke="#FFA4A4" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  </div>
);

export const CutoutBasilLeaf: React.FC<{
  className?: string;
  size?: number;
  rotation?: number;
}> = ({ className = '', size = 44, rotation = 18 }) => (
  <div 
    className={`pointer-events-none select-none inline-block filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] transition-transform ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="basilGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#7CB342" />
          <stop offset="50%" stopColor="#43A047" />
          <stop offset="100%" stopColor="#1B5E20" />
        </radialGradient>
      </defs>
      {/* Leaf Silhouette */}
      <path d="M 8 42 C 12 20, 25 8, 44 6 C 42 24, 30 38, 8 42 Z" fill="url(#basilGrad)" />
      {/* Main Rib */}
      <path d="M 8 42 C 18 30, 28 20, 44 6" stroke="#A5D6A7" strokeWidth="1.4" opacity="0.7" />
      {/* Side Veins */}
      <path d="M 20 30 C 26 26, 32 28, 35 25" stroke="#81C784" strokeWidth="1" opacity="0.5" />
      <path d="M 14 36 C 20 32, 24 35, 28 32" stroke="#81C784" strokeWidth="0.9" opacity="0.5" />
      <path d="M 26 22 C 30 18, 36 20, 39 16" stroke="#81C784" strokeWidth="0.9" opacity="0.5" />
    </svg>
  </div>
);

export const CutoutLimeSlice: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 56 }) => (
  <div 
    className={`pointer-events-none select-none inline-block filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)] ${className}`}
  >
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dark green rind */}
      <circle cx="30" cy="30" r="28" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
      {/* White pith ring */}
      <circle cx="30" cy="30" r="25" fill="#E8F5E9" />
      {/* Lime Segments */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path
          key={angle}
          d="M 30 30 L 46 22 C 49 28, 47 34, 43 38 Z"
          fill="#81C784"
          stroke="#C8E6C9"
          strokeWidth="1.2"
          transform={`rotate(${angle} 30 30)`}
        />
      ))}
      {/* Center core */}
      <circle cx="30" cy="30" r="3.5" fill="#E8F5E9" />
    </svg>
  </div>
);

// ============================================================================
// 4. CIRCULAR WHEEL COLLAGE FRAME (From Image 1)
// ============================================================================
export const Image1WheelCollage: React.FC<{
  photos: [string, string, string]; // 3 high-res food photo URLs
  borderColor?: string;
  centerColor?: string;
  centerText?: string;
  className?: string;
}> = ({
  photos,
  borderColor = '#FFFFFF',
  centerColor = '#D32F2F',
  centerText = '',
  className = '',
}) => {
  return (
    <div className={`relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full overflow-hidden shadow-2xl border-4 ${className}`} style={{ borderColor }}>
      {/* Slice 1: Top Half Sector (e.g. Pasta) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%, 100% 35%)',
        }}
      >
        <img 
          src={photos[0]} 
          alt="Featured food dish 1"
          className="w-full h-full object-cover transform scale-110 hover:scale-115 transition-transform duration-500" 
        />
      </div>

      {/* Slice 2: Right/Bottom Sector (e.g. Burger) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'polygon(50% 50%, 100% 35%, 100% 100%, 35% 100%)',
        }}
      >
        <img 
          src={photos[1]} 
          alt="Featured food dish 2"
          className="w-full h-full object-cover transform scale-110 hover:scale-115 transition-transform duration-500" 
        />
      </div>

      {/* Slice 3: Left/Bottom Sector (e.g. Spaghetti) */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: 'polygon(50% 50%, 35% 100%, 0% 100%, 0% 0%)',
        }}
      >
        <img 
          src={photos[2]} 
          alt="Featured food dish 3"
          className="w-full h-full object-cover transform scale-110 hover:scale-115 transition-transform duration-500" 
        />
      </div>

      {/* Divider Spokes */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <line x1="50" y1="50" x2="0" y2="0" stroke={borderColor} strokeWidth="2.5" />
          <line x1="50" y1="50" x2="100" y2="35" stroke={borderColor} strokeWidth="2.5" />
          <line x1="50" y1="50" x2="35" y2="100" stroke={borderColor} strokeWidth="2.5" />
        </svg>
      </div>

      {/* Center Hub */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg border-4 flex items-center justify-center text-center p-1 z-10"
        style={{ backgroundColor: centerColor, borderColor }}
      >
        {centerText ? (
          <span className="text-[10px] sm:text-xs font-black uppercase text-white tracking-wider leading-tight">
            {centerText}
          </span>
        ) : (
          <div className="w-4 h-4 rounded-full bg-white/30" />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 5. APERTURE RING COLLAGE (From Image 2)
// ============================================================================
export const Image2ApertureRing: React.FC<{
  photo: string;
  badgeRibbonText?: string;
  badgeRibbonColor?: string;
  accentRingColor?: string;
  className?: string;
}> = ({
  photo,
  badgeRibbonText = 'FAST FOOD',
  badgeRibbonColor = '#FF8A00',
  accentRingColor = '#FF8A00',
  className = '',
}) => {
  return (
    <div className={`relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center ${className}`}>
      {/* Outer Dashed Accent Halo */}
      <div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-70 animate-[spin_60s_linear_infinite]"
        style={{ borderColor: accentRingColor }}
      />

      {/* Outer Double Frame */}
      <div className="w-[90%] h-[90%] rounded-full p-2 border-2 border-white/20 bg-black/40 backdrop-blur-xs flex items-center justify-center">
        {/* Main Food Photo Circle */}
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-stone-800 shadow-2xl relative group">
          <img 
            src={photo} 
            alt="Hero Dish"
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Top Hanging Ribbon Logo Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
        <div 
          className="px-4 py-1.5 rounded-b-xl shadow-xl flex items-center gap-1.5 text-stone-950 font-black text-xs uppercase tracking-wider"
          style={{ backgroundColor: badgeRibbonColor }}
        >
          <span>{badgeRibbonText}</span>
        </div>
        <div 
          className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px]"
          style={{ borderTopColor: badgeRibbonColor }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// 6. JAPANESE SEIGAIHA & SUMI WAVE BACKGROUND
// ============================================================================
export const JapaneseSeigaihaBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.12 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="seigaihaWave" width="60" height="30" patternUnits="userSpaceOnUse">
        <path d="M 0 30 A 30 30 0 0 1 60 30" fill="none" stroke="#E53935" strokeWidth="1" />
        <path d="M 6 30 A 24 24 0 0 1 54 30" fill="none" stroke="#FFF176" strokeWidth="0.8" />
        <path d="M 12 30 A 18 18 0 0 1 48 30" fill="none" stroke="#E53935" strokeWidth="0.8" />
        <path d="M 18 30 A 12 12 0 0 1 42 30" fill="none" stroke="#FFF176" strokeWidth="0.6" />
        <path d="M 24 30 A 6 6 0 0 1 36 30" fill="none" stroke="#E53935" strokeWidth="0.6" />
        {/* Alternate row offset */}
        <path d="M -30 15 A 30 30 0 0 1 30 15" fill="none" stroke="#E53935" strokeWidth="1" />
        <path d="M -24 15 A 24 24 0 0 1 24 15" fill="none" stroke="#FFF176" strokeWidth="0.8" />
        <path d="M 30 15 A 30 30 0 0 1 90 15" fill="none" stroke="#E53935" strokeWidth="1" />
        <path d="M 36 15 A 24 24 0 0 1 84 15" fill="none" stroke="#FFF176" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#seigaihaWave)" />
  </svg>
);

// ============================================================================
// 7. FRENCH PARISIAN BOUTIQUE ENGRAVINGS
// ============================================================================
export const FrenchBoutiqueBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.15 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="frenchBoutique" width="120" height="120" patternUnits="userSpaceOnUse">
        <g stroke="#C2185B" strokeWidth="0.9" fill="none">
          {/* Parisian Whisk */}
          <ellipse cx="30" cy="30" rx="8" ry="16" />
          <line x1="30" y1="46" x2="30" y2="60" strokeWidth="1.5" />
          <line x1="26" y1="20" x2="34" y2="40" strokeWidth="0.6" />
          {/* Wheat Sheaf */}
          <path d="M 85 20 Q 90 40 95 60" />
          <ellipse cx="88" cy="25" rx="3" ry="6" transform="rotate(-30 88 25)" />
          <ellipse cx="92" cy="35" rx="3" ry="6" transform="rotate(30 92 35)" />
          {/* Delicate Macaron */}
          <rect x="20" y="85" width="22" height="7" rx="3.5" />
          <rect x="20" y="93" width="22" height="7" rx="3.5" />
          <line x1="21" y1="92" x2="41" y2="92" strokeWidth="1.5" />
          {/* Mini Bow */}
          <circle cx="90" cy="90" r="2.5" fill="#D81B60" />
          <path d="M 90 90 C 82 82, 80 94, 90 90 Z" fill="#D81B60" fillOpacity="0.4" />
          <path d="M 90 90 C 98 82, 100 94, 90 90 Z" fill="#D81B60" fillOpacity="0.4" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#frenchBoutique)" />
  </svg>
);

// ============================================================================
// 8. NAUTICAL MARITIME COMPASS & WAVE PATTERN
// ============================================================================
export const NauticalMaritimeBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.12 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="nauticalPattern" width="140" height="140" patternUnits="userSpaceOnUse">
        <g stroke="#0D47A1" strokeWidth="1" fill="none">
          {/* Anchor */}
          <circle cx="35" cy="25" r="4" />
          <line x1="35" y1="29" x2="35" y2="55" strokeWidth="1.8" />
          <line x1="26" y1="36" x2="44" y2="36" strokeWidth="1.8" />
          <path d="M 20 45 C 24 58, 46 58, 50 45" strokeWidth="1.8" />
          <polygon points="18,45 22,43 20,48" fill="#0D47A1" />
          <polygon points="52,45 48,43 50,48" fill="#0D47A1" />
          {/* Compass Star */}
          <g transform="translate(100, 35)">
            <circle cx="0" cy="0" r="14" strokeDasharray="2 2" />
            <polygon points="0,-16 3,-4 0,0 -3,-4" fill="#00838F" />
            <polygon points="0,16 3,4 0,0 -3,4" fill="#00838F" />
            <polygon points="16,0 4,3 0,0 4,-3" fill="#0D47A1" />
            <polygon points="-16,0 -4,3 0,0 -4,-3" fill="#0D47A1" />
          </g>
          {/* Soft Wave Lines */}
          <path d="M 10 100 Q 25 90 40 100 T 70 100 T 100 100 T 130 100" />
          <path d="M 10 112 Q 25 102 40 112 T 70 112 T 100 112 T 130 112" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#nauticalPattern)" />
  </svg>
);

// ============================================================================
// 9. SMOKEHOUSE CROSSED CLEAVERS & WOODGRAIN
// ============================================================================
export const SmokehouseTimberBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.14 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="smokehousePattern" width="160" height="160" patternUnits="userSpaceOnUse">
        <g stroke="#FFA726" strokeWidth="1.2" fill="none">
          {/* Crossed Cleavers */}
          <g transform="translate(45, 45)">
            <g transform="rotate(45)">
              <rect x="-12" y="-24" width="24" height="16" rx="2" fill="#FFA726" fillOpacity="0.1" />
              <line x1="0" y1="-8" x2="0" y2="18" strokeWidth="2.5" />
            </g>
            <g transform="rotate(-45)">
              <rect x="-12" y="-24" width="24" height="16" rx="2" fill="#FFA726" fillOpacity="0.1" />
              <line x1="0" y1="-8" x2="0" y2="18" strokeWidth="2.5" />
            </g>
          </g>
          {/* Flame Embers */}
          <path d="M 120 40 Q 115 25 125 15 Q 130 30 120 40 Z" fill="#E65100" />
          <path d="M 126 38 Q 123 28 130 20 Q 134 32 126 38 Z" fill="#FFA726" />
          {/* Grill Grate Lines */}
          <line x1="20" y1="110" x2="140" y2="110" strokeDasharray="4 4" strokeWidth="0.8" />
          <line x1="20" y1="125" x2="140" y2="125" strokeDasharray="4 4" strokeWidth="0.8" />
          <line x1="20" y1="140" x2="140" y2="140" strokeDasharray="4 4" strokeWidth="0.8" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#smokehousePattern)" />
  </svg>
);

// ============================================================================
// 10. BOTANICAL ORGANIC LEAF PATTERN
// ============================================================================
export const BotanicalOrganicBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.15 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="botanicalPattern" width="130" height="130" patternUnits="userSpaceOnUse">
        <g stroke="#2E7D32" strokeWidth="1" fill="none">
          {/* Monstera Leaf Silhouette */}
          <path d="M 35 20 C 15 25, 10 50, 35 65 C 60 50, 55 25, 35 20 Z" fill="#2E7D32" fillOpacity="0.08" />
          <line x1="35" y1="20" x2="35" y2="72" strokeWidth="1.5" />
          <path d="M 35 32 Q 22 28 18 36" />
          <path d="M 35 44 Q 20 42 16 50" />
          <path d="M 35 32 Q 48 28 52 36" />
          <path d="M 35 44 Q 50 42 54 50" />
          {/* Eucalyptus Sprig */}
          <path d="M 90 30 Q 100 65 85 100" />
          <circle cx="85" cy="40" r="5" fill="#558B2F" fillOpacity="0.15" />
          <circle cx="98" cy="55" r="6" fill="#558B2F" fillOpacity="0.15" />
          <circle cx="82" cy="70" r="6" fill="#558B2F" fillOpacity="0.15" />
          <circle cx="95" cy="85" r="5" fill="#558B2F" fillOpacity="0.15" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#botanicalPattern)" />
  </svg>
);

// ============================================================================
// 11. PUNJABI HIGHWAY TRUCK-ART BORDER & MARIGOLD MOTIFS
// ============================================================================
export const PunjabiTruckArtBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.16 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="truckArtPattern" width="120" height="120" patternUnits="userSpaceOnUse">
        <g stroke="#E65100" strokeWidth="1" fill="none">
          {/* Chevron Zigzag Truck Border */}
          <path d="M 0 10 L 15 25 L 30 10 L 45 25 L 60 10 L 75 25 L 90 10 L 105 25 L 120 10" stroke="#B71C1C" strokeWidth="2" />
          {/* Marigold Blossom */}
          <g transform="translate(60, 65)">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <ellipse key={deg} cx="0" cy="-12" rx="3.5" ry="7" fill="#F57F17" fillOpacity="0.3" transform={`rotate(${deg})`} />
            ))}
            <circle cx="0" cy="0" r="7" fill="#E65100" />
            <circle cx="0" cy="0" r="3" fill="#FFF9F0" />
          </g>
          {/* Clay Tandoor Silhouette */}
          <path d="M 15 95 C 10 115, 35 115, 30 95 Z" stroke="#B71C1C" strokeWidth="1.5" />
          <ellipse cx="22.5" cy="95" rx="7.5" ry="2.5" fill="#E65100" fillOpacity="0.3" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#truckArtPattern)" />
  </svg>
);

// ============================================================================
// 12. BOHO CRAFT BEER HOP & RIVET PATTERN
// ============================================================================
export const BohoCraftBeerBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.14 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="craftBeerPattern" width="130" height="130" patternUnits="userSpaceOnUse">
        <g stroke="#FFB300" strokeWidth="1" fill="none">
          {/* Hop Cone */}
          <g transform="translate(35, 40)">
            <ellipse cx="0" cy="-6" rx="8" ry="12" fill="#FFA000" fillOpacity="0.1" />
            <path d="M -6 -12 Q 0 -6 6 -12" />
            <path d="M -7 -6 Q 0 0 7 -6" />
            <path d="M -5 0 Q 0 6 5 0" />
            <path d="M -3 5 Q 0 9 3 5" />
          </g>
          {/* Hexagonal Rivet Plate */}
          <polygon points="90,30 102,37 102,51 90,58 78,51 78,37" stroke="#FF8F00" strokeWidth="1.5" fill="#1E2228" />
          <circle cx="90" cy="44" r="2.5" fill="#FFB300" />
          {/* Pint Glass Silhouette */}
          <polygon points="30,90 44,90 41,118 33,118" stroke="#FFB300" strokeWidth="1.2" />
          <ellipse cx="37" cy="90" rx="7" ry="2" fill="#FFA000" fillOpacity="0.2" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#craftBeerPattern)" />
  </svg>
);

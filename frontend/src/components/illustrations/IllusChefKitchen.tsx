import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusChefKitchen (Asset #3)
 * Communicates: Master Chef in action, Kitchen Display Ticket flow, KOT prep timers.
 */
export const IllusChefKitchen: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Chef Receiving Kitchen Orders',
  description = 'Master chef receiving live kitchen order tickets with prep timers and blazing wok.',
  className = '',
  style,
  ...rest
}) => {
  const sizeConfig = SIZE_MAP[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 400"
      width={sizeConfig.width}
      className={`select-none ${sizeConfig.className || ''} ${className}`}
      style={style}
      role="img"
      aria-label={title}
      {...rest}
    >
      <defs>
        <linearGradient id="ck-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#110B08" />
          <stop offset="60%" stopColor="#1C140E" />
          <stop offset="100%" stopColor="#0B0E0D" />
        </linearGradient>

        <linearGradient id="ck-fire" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#E8783C" />
          <stop offset="50%" stopColor="#FF5E4D" />
          <stop offset="100%" stopColor="#FFC928" />
        </linearGradient>

        <radialGradient id="ck-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5E4D" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#E8783C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="ck-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.6" />
        </filter>

        <clipPath id="ck-clip">
          <rect x="20" y="20" width="500" height="360" rx="16" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes ckFlame { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.15) translateY(-3px); } }
            @keyframes ckFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            .ck-flame { animation: ckFlame 1.2s ease-in-out infinite alternate; transform-origin: center bottom; }
            .ck-float-1 { animation: ckFloat 4s ease-in-out infinite; }
            .ck-float-2 { animation: ckFloat 3.4s ease-in-out infinite 0.5s; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#ck-bg)'} />

      {/* Real Commercial Kitchen Background */}
      <g clipPath="url(#ck-clip)" opacity="0.8">
        <image href="/marketing/carousel/chef_kitchen.webp" x="20" y="20" width="500" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="360" fill="#0B130E" opacity="0.75" />
      </g>

      <rect x="20" y="20" width="500" height="360" rx="16" fill="none" stroke="#3D291D" strokeWidth="1.5" />

      {/* Sizzling Wok & Dancing Tandoori Flames */}
      <g transform="translate(80, 240)">
        <circle cx="80" cy="40" r="70" fill="url(#ck-glow)" />
        {/* Flames */}
        <g className="ck-flame" transform="translate(40, 20)">
          <path d="M 10 30 Q 20 0, 30 30 T 50 30 T 70 30" fill="url(#ck-fire)" opacity="0.85" />
          <path d="M 25 30 Q 35 5, 45 30 T 60 30" fill="#FFE066" opacity="0.9" />
        </g>
        {/* Heavy Iron Wok */}
        <ellipse cx="80" cy="50" rx="60" ry="18" fill="#1C1815" stroke="#38302B" strokeWidth="2" />
        <path d="M 20 50 C 20 85, 140 85, 140 50 Z" fill="#120F0C" stroke="#251E18" strokeWidth="1.5" />
        {/* Tossed Paneer / Chaap Tikka & Spices */}
        <circle cx="65" cy="45" r="4.5" fill="#FFC928" />
        <circle cx="85" cy="42" r="5" fill="#E8783C" />
        <circle cx="98" cy="46" r="4" fill="#34B56A" />
        <circle cx="78" cy="38" r="4.5" fill="#FF5E4D" />
      </g>

      {/* Master Chef Mascot (Real High-Res Character Artwork from Dhaba Suite) */}
      <g transform="translate(190, 75)" filter="url(#ck-shadow)">
        <image href="/assets/dhaba-cover/chef_mascot.webp" x="0" y="0" width="180" height="260" preserveAspectRatio="xMidYMid meet" />
      </g>

      {/* Floating HUD 1: Live Kitchen Display Screen (KOT Ticket) */}
      <g className="ck-float-1" transform="translate(330, 45)" filter="url(#ck-shadow)">
        <rect x="0" y="0" width="175" height="115" rx="14" fill="#161F1A" stroke="#2E4437" strokeWidth="1.5" />
        <rect x="0" y="0" width="175" height="26" rx="14" fill="#203326" />
        <circle cx="16" cy="13" r="3.5" fill="#34B56A">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="26" y="17" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">KDS LIVE TICKET #042</text>
        <text x="135" y="17" fill="#FFC928" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold">⏱ 08:42</text>
        {/* Ticket Line Items */}
        <text x="14" y="44" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">Table #04 (Dine-In)</text>
        <text x="14" y="60" fill="#34B56A" fontSize="8" fontFamily="sans-serif">✓ 1x Dal Makhani (Butter Topping)</text>
        <text x="14" y="74" fill="#FFC928" fontSize="8" fontFamily="sans-serif">🔥 2x Garlic Butter Naan</text>
        <text x="14" y="88" fill="#FFA64D" fontSize="8" fontFamily="sans-serif">🔥 1x Paneer Tikka (Spicy)</text>
        <rect x="14" y="96" width="147" height="12" rx="3" fill="#E8783C" />
        <text x="87" y="105" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">MARK ORDER COOKING</text>
      </g>

      {/* Floating HUD 2: Kitchen Rush Prep Indicator */}
      <g className="ck-float-2" transform="translate(30, 60)" filter="url(#ck-shadow)">
        <rect x="0" y="0" width="135" height="65" rx="12" fill="#171C19" stroke="#332B25" strokeWidth="1.5" />
        <text x="14" y="24" fill="#8FA69B" fontSize="8" fontFamily="sans-serif" fontWeight="bold">RUSH HOUR SHIELD</text>
        <text x="14" y="46" fill="#E8783C" fontSize="18" fontFamily="sans-serif" fontWeight="900">12 Mins</text>
        <text x="82" y="44" fill="#C5D1CB" fontSize="8" fontFamily="sans-serif">Avg Table Prep</text>
      </g>
    </svg>
  );
};

export default IllusChefKitchen;

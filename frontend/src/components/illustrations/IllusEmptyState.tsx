import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusEmptyState (Asset #12)
 * Communicates: Fresh Culinary Canvas, Empty Menu, Waiting for Dishes/Orders.
 */
export const IllusEmptyState: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Empty State',
  description = 'Fresh wooden cutting board with chef knife, coriander sprig, and unwritten menu awaiting dishes.',
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
        <linearGradient id="es-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#13211A" />
          <stop offset="100%" stopColor="#070C0A" />
        </linearGradient>

        <linearGradient id="es-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#D5DFDA" />
          <stop offset="100%" stopColor="#8DA398" />
        </linearGradient>

        <filter id="es-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.5" />
        </filter>

        {animated && (
          <style>{`
            @keyframes esFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes esSparkle { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.3); opacity: 1; } }
            .es-float { animation: esFloat 4.2s ease-in-out infinite; }
            .es-sparkle { animation: esSparkle 2.2s ease-in-out infinite; transform-origin: center; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#es-bg)'} />
      <rect x="20" y="20" width="500" height="360" rx="16" fill="#111B16" stroke="#25382D" strokeWidth="1.5" />

      {/* Main Artisan Wooden Prep Block */}
      <g transform="translate(100, 70)" filter="url(#es-shadow)">
        <rect x="0" y="0" width="340" height="230" rx="18" fill="#241910" stroke="#8A5A32" strokeWidth="3" />
        <rect x="12" y="12" width="316" height="206" rx="12" fill="#382517" />
        {/* Wood grain curves */}
        <path d="M 20 60 Q 150 40, 310 70" stroke="#4D3320" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 20 120 Q 180 100, 310 130" stroke="#4D3320" strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 20 180 Q 140 160, 310 190" stroke="#4D3320" strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* Unwritten Golden Parchment Menu Slanted on Board */}
        <g transform="translate(45, 20) rotate(-4)" filter="url(#es-shadow)">
          <rect x="0" y="0" width="130" height="175" rx="8" fill="#FAFAF7" stroke="#DCD6C7" strokeWidth="1.2" />
          {/* Menu header ribbon */}
          <rect x="14" y="14" width="102" height="12" rx="3" fill="#E8783C" />
          <text x="65" y="23" textAnchor="middle" fill="#FFFFFF" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">OUR SPECIALTIES</text>
          {/* Dotted empty lines awaiting dishes */}
          <line x1="16" y1="45" x2="114" y2="45" stroke="#CBD5D0" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="16" y1="65" x2="114" y2="65" stroke="#CBD5D0" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="16" y1="85" x2="114" y2="85" stroke="#CBD5D0" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="16" y1="105" x2="114" y2="105" stroke="#CBD5D0" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="16" y1="125" x2="114" y2="125" stroke="#CBD5D0" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="65" cy="150" r="12" fill="#E8F5EE" stroke="#34B56A" strokeWidth="1" strokeDasharray="2 2" />
          <text x="65" y="154" textAnchor="middle" fill="#34B56A" fontSize="12" fontWeight="bold">+</text>
        </g>

        {/* Master Chef Japanese Santoku Knife resting on board */}
        <g transform="translate(190, 45) rotate(25)" filter="url(#es-shadow)">
          {/* Steel Blade */}
          <path d="M 0 0 L 110 0 C 130 0, 140 18, 120 30 L 0 30 Z" fill="url(#es-blade)" stroke="#5B7266" strokeWidth="1" />
          {/* Cutting Edge Highlight */}
          <line x1="0" y1="30" x2="120" y2="30" stroke="#FFFFFF" strokeWidth="1.5" />
          {/* Rosewood Handle with Brass Pins */}
          <rect x="-42" y="5" width="42" height="20" rx="3" fill="#1C1008" stroke="#3D2617" strokeWidth="1" />
          <circle cx="-12" cy="15" r="2" fill="#FFC928" />
          <circle cx="-28" cy="15" r="2" fill="#FFC928" />
        </g>

        {/* Fresh Coriander Sprig and Red Chili */}
        <g transform="translate(240, 160)">
          {/* Red Chili */}
          <path d="M 0 10 C 20 -10, 45 5, 55 20 C 45 22, 20 18, 0 10 Z" fill="#FF5E4D" stroke="#A82B1E" strokeWidth="1" />
          <path d="M 0 10 C -5 6, -8 4, -10 6" fill="none" stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
          {/* Coriander Leaves */}
          <circle cx="45" cy="10" r="6" fill="#34B56A" opacity="0.8" />
          <circle cx="55" cy="4" r="5" fill="#2E9E5C" opacity="0.8" />
          <circle cx="36" cy="16" r="5" fill="#38C272" opacity="0.8" />
        </g>
      </g>

      {/* Encouraging Headline Below */}
      <g transform="translate(270, 335)" textAnchor="middle">
        <text x="0" y="0" fill="#FAFAF7" fontSize="15" fontFamily="sans-serif" fontWeight="bold">
          Your Culinary Canvas is Ready
        </text>
        <text x="0" y="16" fill="#8FA69B" fontSize="9.5" fontFamily="sans-serif">
          Add your first signature dish or upload an Excel menu spreadsheet to get cooking
        </text>
      </g>

      {/* Decorative Starbursts */}
      <g transform="translate(80, 130)" className="es-sparkle">
        <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#FFC928" />
      </g>
      <g transform="translate(470, 180)" className="es-sparkle">
        <polygon points="0,-5 1.5,-1.5 5,0 1.5,1.5 0,5 -1.5,1.5 -5,0 -1.5,-1.5" fill="#E8783C" />
      </g>
    </svg>
  );
};

export default IllusEmptyState;

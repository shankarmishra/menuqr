import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusRestaurantOwner (v3.0.0 Editorial Masterpiece)
 * Feature: Restaurant Owner Command Center / Live Desk Overview
 * Style: Direction A — Modern Luxury Editorial Vector
 * Character: Vikramaditya "Vikram" Sen (Visionary Restaurateur)
 */
export const IllusRestaurantOwner: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  className = '',
  title = 'MENUQR Restaurant Owner Command Center',
  description = 'Dignified Indian restaurateur commanding live table tokens, dynamic surge pricing, and revenue analytics on a digital tablet.',
  style,
  ...rest
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.responsive;
  const isParchment = theme === 'parchment';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 440"
      width={sizeConfig.width}
      height={sizeConfig.height}
      className={`select-none ${sizeConfig.className || ''} ${className}`}
      style={style}
      role="img"
      aria-label={title}
      {...rest}
    >
      <title>{title}</title>
      <desc>{description}</desc>

      <defs>
        {/* Dynamic Background Canvas Gradient */}
        <linearGradient id="ro-v3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#FFFDF8' : '#070D0A'} />
          <stop offset="50%" stopColor={isParchment ? '#F4EFE6' : '#0E1A14'} />
          <stop offset="100%" stopColor={isParchment ? '#E8DFCE' : '#050806'} />
        </linearGradient>

        <filter id="ro-v3-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity={isParchment ? 0.15 : 0.6} />
        </filter>

        <clipPath id="ro-v3-clip">
          <rect x="0" y="0" width="640" height="440" rx="20" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes roPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } }
            @keyframes roFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            .ro-live-pulse { transform-origin: 16px 13px; animation: roPulse 1.8s ease-in-out infinite; }
            .ro-float-badge { animation: roFloat 4s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      {/* Frame Canvas */}
      <rect width="640" height="440" rx="20" fill="url(#ro-v3-bg)" />

      {/* Pure Vector Artwork Layer */}
      <g clipPath="url(#ro-v3-clip)" style={{ filter: isParchment ? 'contrast(1.05) brightness(1.15) sepia(0.08)' : undefined }}>
        <image
          href="/illustrations/editorial/illus-restaurant-owner-vector.svg"
          x="0"
          y="0"
          width="640"
          height="440"
          preserveAspectRatio="xMidYMid slice"
        />
      </g>

      {/* Elegant Border */}
      <rect
        x="1.5"
        y="1.5"
        width="637"
        height="437"
        rx="18.5"
        fill="none"
        stroke={isParchment ? '#D4AF37' : '#233E31'}
        strokeWidth="1.5"
        opacity={0.7}
      />

      {/* Floating HUD: Real-time Live Desk Telemetry */}
      <g className="ro-float-badge" transform="translate(380, 24)" filter="url(#ro-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="236"
          height="82"
          rx="12"
          fill={isParchment ? '#FFFFFF' : '#0B1712'}
          stroke={isParchment ? '#D4AF37' : '#10B981'}
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="236" height="26" rx="12" fill={isParchment ? '#F4EFE6' : '#14291F'} />
        
        {/* Pulsing Signal Mint Indicator */}
        <circle cx="16" cy="13" r="4" fill="#10B981" className="ro-live-pulse" />
        <text
          x="28"
          y="17"
          fill={isParchment ? '#182E23' : '#E8F5E9'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          LIVE DESK • 18/24 TABLES
        </text>
        <text
          x="195"
          y="17"
          fill="#10B981"
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
        >
          ACTIVE
        </text>

        {/* Real-time RevPASH Metrics */}
        <text
          x="14"
          y="44"
          fill={isParchment ? '#182E23' : '#F5EFE6'}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Today's Revenue: <tspan fill="#10B981">₹48,250</tspan>
        </text>
        <text
          x="14"
          y="62"
          fill={isParchment ? '#524336' : '#9EBAAC'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
        >
          Avg Table Turn: 34m &bull; RevPASH +18.4%
        </text>
      </g>

      {/* Floating HUD: Restaurateur Identity */}
      <g transform="translate(24, 24)" filter="url(#ro-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="170"
          height="48"
          rx="10"
          fill={isParchment ? '#FFFFFF' : '#0B1712'}
          stroke={isParchment ? '#D4AF37' : '#233E31'}
          strokeWidth="1.2"
        />
        <text
          x="12"
          y="20"
          fill={isParchment ? '#7C6752' : '#8FA89B'}
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          RESTAURATEUR
        </text>
        <text
          x="12"
          y="37"
          fill={isParchment ? '#182E23' : '#FFFFFF'}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Vikramaditya Sen &bull; CEO
        </text>
      </g>
    </svg>
  );
};

export default IllusRestaurantOwner;

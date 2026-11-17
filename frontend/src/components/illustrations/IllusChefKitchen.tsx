import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusChefKitchen (v3.0.0 Editorial Masterpiece)
 * Feature: Kitchen Display System & KOT Ticket Automation
 * Style: Direction A — Modern Luxury Editorial Vector
 * Character: Chef Raghav (Executive Culinary Director)
 */
export const IllusChefKitchen: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Chef Receiving Kitchen Orders — Culinary Command',
  description = 'Executive chef in tailored whites precisely plating gourmet dishes beneath a live Kitchen Display System (KDS) showing digital KOT countdowns.',
  className = '',
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
        {/* Gradients */}
        <linearGradient id="ck-v3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#FFFDF8' : '#070D0A'} />
          <stop offset="50%" stopColor={isParchment ? '#F4EFE6' : '#140E0A'} />
          <stop offset="100%" stopColor={isParchment ? '#E8DFCE' : '#060807'} />
        </linearGradient>

        <filter id="ck-v3-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity={isParchment ? 0.15 : 0.6} />
        </filter>

        <clipPath id="ck-v3-clip">
          <rect x="0" y="0" width="640" height="440" rx="20" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes ckPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.15); } }
            @keyframes ckFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            .ck-live-pulse { transform-origin: 16px 13px; animation: ckPulse 1.8s ease-in-out infinite; }
            .ck-float-badge { animation: ckFloat 4.2s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      {/* Frame Background Canvas */}
      <rect width="640" height="440" rx="20" fill="url(#ck-v3-bg)" />

      {/* Pure Vector Artwork Layer */}
      <g clipPath="url(#ck-v3-clip)" style={{ filter: isParchment ? 'contrast(1.05) brightness(1.15) sepia(0.08)' : undefined }}>
        <image
          href="/illustrations/editorial/illus-chef-kitchen-vector.svg"
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
        stroke={isParchment ? '#D4AF37' : '#33271F'}
        strokeWidth="1.5"
        opacity={0.7}
      />

      {/* Floating HUD: Live KDS Screen */}
      <g className="ck-float-badge" transform="translate(370, 24)" filter="url(#ck-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="246"
          height="92"
          rx="12"
          fill={isParchment ? '#FFFFFF' : '#0F1612'}
          stroke={isParchment ? '#D4AF37' : '#E8783C'}
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="246" height="28" rx="12" fill={isParchment ? '#F4EFE6' : '#211710'} />
        
        {/* Pulsing Ember Indicator */}
        <circle cx="16" cy="14" r="4" fill="#E8783C" className="ck-live-pulse" />
        <text
          x="28"
          y="18"
          fill={isParchment ? '#182E23' : '#FFF5ED'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          KDS PASS • TICKET #042
        </text>
        <text
          x="200"
          y="18"
          fill="#E8783C"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
        >
          ⏱ 08:42
        </text>

        {/* Real-time Cooking Items */}
        <text
          x="14"
          y="46"
          fill={isParchment ? '#182E23' : '#F5EFE6'}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          Table #04 (Dine-In) &bull; <tspan fill="#10B981">✓ Dal Makhani</tspan>
        </text>
        <text
          x="14"
          y="64"
          fill={isParchment ? '#524336' : '#FFB584'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
        >
          🔥 2x Garlic Butter Naan &bull; 1x Paneer Tikka
        </text>
        
        {/* Action Button */}
        <rect x="14" y="72" width="218" height="13" rx="4" fill="#E8783C" />
        <text
          x="123"
          y="81.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="7.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
          letterSpacing="0.05em"
        >
          MARK ORDER COMPLETE (PASS READY)
        </text>
      </g>

      {/* Floating HUD: Executive Chef Badge */}
      <g transform="translate(24, 24)" filter="url(#ck-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="170"
          height="48"
          rx="10"
          fill={isParchment ? '#FFFFFF' : '#0F1612'}
          stroke={isParchment ? '#D4AF37' : '#2B3D33'}
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
          EXECUTIVE CHEF
        </text>
        <text
          x="12"
          y="37"
          fill={isParchment ? '#182E23' : '#FFFFFF'}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Chef Raghav &bull; Kitchen Pass
        </text>
      </g>
    </svg>
  );
};

export default IllusChefKitchen;

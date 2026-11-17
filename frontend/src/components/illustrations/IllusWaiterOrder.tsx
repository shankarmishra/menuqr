import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusWaiterOrder (v3.0.0 Editorial Masterpiece)
 * Feature: Live Digital Table Token & Reception Coordination
 * Style: Direction A — Modern Luxury Editorial Vector
 * Character: Captain Kabir (Attentive Hospitality Specialist)
 */
export const IllusWaiterOrder: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Waiter Taking Orders — Precision Table Service',
  description = 'Attentive restaurant captain in tailored forest green vest taking dining orders at a luxury table with a wireless handheld terminal streaming live KOTs to kitchen.',
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
        <linearGradient id="wo-v3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#FFFDF8' : '#070D0A'} />
          <stop offset="50%" stopColor={isParchment ? '#F4EFE6' : '#0E1A14'} />
          <stop offset="100%" stopColor={isParchment ? '#E8DFCE' : '#050806'} />
        </linearGradient>

        <filter id="wo-v3-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity={isParchment ? 0.15 : 0.6} />
        </filter>

        <clipPath id="wo-v3-clip">
          <rect x="0" y="0" width="640" height="440" rx="20" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes woBeam { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
            @keyframes woPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.08); } }
            @keyframes woFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            .wo-live-beam { stroke-dasharray: 6 5; animation: woBeam 1.6s linear infinite; }
            .wo-live-pulse { transform-origin: 32px 32px; animation: woPulse 2s ease-in-out infinite; }
            .wo-float-badge { animation: woFloat 4s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      {/* Frame Background Canvas */}
      <rect width="640" height="440" rx="20" fill="url(#wo-v3-bg)" />

      {/* Vector Artwork Layer */}
      <g clipPath="url(#wo-v3-clip)" style={{ filter: isParchment ? 'contrast(1.05) brightness(1.15) sepia(0.08)' : undefined }}>
        <image
          href="/illustrations/editorial/illus-waiter-order-vector.svg"
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
        stroke={isParchment ? '#D4AF37' : '#23382D'}
        strokeWidth="1.5"
        opacity={0.7}
      />

      {/* Interactive Floating HUD: Live Handheld KOT Streaming */}
      <g className="wo-float-badge" transform="translate(380, 24)" filter="url(#wo-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="236"
          height="82"
          rx="12"
          fill={isParchment ? '#FFFFFF' : '#0B1611'}
          stroke={isParchment ? '#D4AF37' : '#10B981'}
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="236" height="26" rx="12" fill={isParchment ? '#F4EFE6' : '#14291F'} />
        
        {/* Pulsing Signal Mint Indicator */}
        <circle cx="16" cy="13" r="4" fill="#10B981" className="wo-live-pulse" />
        <text
          x="28"
          y="17"
          fill={isParchment ? '#182E23' : '#E8F5E9'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
          letterSpacing="0.05em"
        >
          LIVE KOT • TABLE #04
        </text>
        <text
          x="192"
          y="17"
          fill="#10B981"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
          fontWeight="800"
        >
          STREAMING
        </text>

        {/* Real-time Order Stream Items */}
        <text
          x="14"
          y="44"
          fill={isParchment ? '#182E23' : '#F5EFE6'}
          fontSize="10"
          fontFamily="system-ui, sans-serif"
          fontWeight="600"
        >
          ✓ 2x Murgh Malai Tikka <tspan fill="#10B981">(Ready)</tspan>
        </text>
        <text
          x="14"
          y="62"
          fill={isParchment ? '#524336' : '#A3B8AD'}
          fontSize="9.5"
          fontFamily="system-ui, sans-serif"
        >
          ⏳ 1x Dal Makhani &bull; 3x Garlic Naan
        </text>
        <text
          x="180"
          y="72"
          fill="#D4AF37"
          fontSize="8.5"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          ₹1,480.00
        </text>
      </g>

      {/* Floating HUD: Captain Status Badge */}
      <g transform="translate(24, 24)" filter="url(#wo-v3-shadow)">
        <rect
          x="0"
          y="0"
          width="170"
          height="48"
          rx="10"
          fill={isParchment ? '#FFFFFF' : '#0B1611'}
          stroke={isParchment ? '#D4AF37' : '#23382D'}
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
          FLOOR CAPTAIN
        </text>
        <text
          x="12"
          y="37"
          fill={isParchment ? '#182E23' : '#FFFFFF'}
          fontSize="12"
          fontFamily="system-ui, sans-serif"
          fontWeight="700"
        >
          Captain Kabir &bull; Sec-B
        </text>
      </g>
    </svg>
  );
};

export default IllusWaiterOrder;

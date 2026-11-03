import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusPosBilling (Asset #6)
 * Communicates: POS Thermal Billing, Instant Token Settle, Paid Stamp, UPI Integration.
 */
export const IllusPosBilling: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR POS Billing',
  description = 'POS counter with 80mm thermal receipt roll, green PAID stamp, and UPI terminal.',
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
        <linearGradient id="pb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#13211A" />
          <stop offset="100%" stopColor="#070C0A" />
        </linearGradient>

        <filter id="pb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        <clipPath id="pb-clip">
          <rect x="20" y="20" width="500" height="360" rx="16" />
        </clipPath>

        {animated && (
          <style>{`
            @keyframes pbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes pbStamp { 0% { transform: scale(1.4) rotate(-10deg); opacity: 0; } 70% { transform: scale(0.96) rotate(-5deg); opacity: 1; } 100% { transform: scale(1) rotate(-5deg); opacity: 1; } }
            .pb-float { animation: pbFloat 4s ease-in-out infinite; }
            .pb-stamp-anim { animation: pbStamp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite alternate; transform-origin: center; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#pb-bg)'} />

      {/* Atmospheric Counter Background */}
      <g clipPath="url(#pb-clip)" opacity="0.75">
        <image href="/marketing/carousel/split_bill.webp" x="20" y="20" width="500" height="360" preserveAspectRatio="xMidYMid slice" />
        <rect x="20" y="20" width="500" height="360" fill="#0A140F" opacity="0.75" />
      </g>

      <rect x="20" y="20" width="500" height="360" rx="16" fill="none" stroke="#283F32" strokeWidth="1.5" />

      {/* Counter POS Terminal Stand (Left) */}
      <g transform="translate(60, 90)" filter="url(#pb-shadow)">
        <rect x="0" y="0" width="145" height="180" rx="12" fill="#0F1713" stroke="#2B3D33" strokeWidth="2" />
        {/* Screen */}
        <rect x="8" y="8" width="129" height="100" rx="8" fill="#15241C" />
        <rect x="14" y="14" width="117" height="14" rx="3" fill="#1C3226" />
        <text x="20" y="24" fill="#34B56A" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">CASHIER DESK • TOKEN #018</text>
        <text x="14" y="44" fill="#8FA69B" fontSize="7" fontFamily="sans-serif">Table #06 · 4 Guests</text>
        <text x="14" y="62" fill="#FAFAF7" fontSize="16" fontFamily="sans-serif" fontWeight="900">₹1,840.00</text>
        <text x="14" y="76" fill="#FFC928" fontSize="7" fontFamily="sans-serif">Includes 5% GST (CGST+SGST)</text>
        {/* Action Buttons */}
        <rect x="14" y="118" width="36" height="22" rx="4" fill="#1E3328" stroke="#34B56A" strokeWidth="0.8" />
        <text x="32" y="132" textAnchor="middle" fill="#34B56A" fontSize="7" fontFamily="sans-serif" fontWeight="bold">UPI</text>

        <rect x="54" y="118" width="36" height="22" rx="4" fill="#1E3328" stroke="#FFC928" strokeWidth="0.8" />
        <text x="72" y="132" textAnchor="middle" fill="#FFC928" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CASH</text>

        <rect x="94" y="118" width="36" height="22" rx="4" fill="#1E3328" stroke="#E8783C" strokeWidth="0.8" />
        <text x="112" y="132" textAnchor="middle" fill="#E8783C" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CARD</text>
        {/* Base stand */}
        <rect x="50" y="180" width="45" height="40" fill="#0C120F" stroke="#2B3D33" strokeWidth="1.5" />
      </g>

      {/* Realistic 80mm Thermal Receipt (Right) */}
      <g transform="translate(250, 50)" filter="url(#pb-shadow)">
        {/* Thermal Paper with Zigzag Torn Edge */}
        <path
          d="M 0 0 L 170 0 L 170 270 
             L 160 263 L 150 270 L 140 263 L 130 270 L 120 263 L 110 270 L 100 263 L 90 270 L 80 263 L 70 270 L 60 263 L 50 270 L 40 263 L 30 270 L 20 263 L 10 270 L 0 263 Z"
          fill="#FAFAF7"
          stroke="#D8D2C4"
          strokeWidth="1.2"
        />

        {/* Receipt Header */}
        <text x="85" y="24" textAnchor="middle" fill="#151C19" fontSize="9" fontFamily="Courier, monospace" fontWeight="bold">
          MANNAT TANDOORI JUNCTION
        </text>
        <text x="85" y="36" textAnchor="middle" fill="#666666" fontSize="6.5" fontFamily="Courier, monospace">
          GSTIN: 07AAAAA0000A1Z5
        </text>
        <line x1="14" y1="44" x2="156" y2="44" stroke="#151C19" strokeWidth="1" strokeDasharray="3 3" />

        {/* Token Meta */}
        <text x="16" y="56" fill="#151C19" fontSize="7.5" fontFamily="Courier, monospace" fontWeight="bold">
          TABLE: #06
        </text>
        <text x="154" y="56" textAnchor="end" fill="#151C19" fontSize="7.5" fontFamily="Courier, monospace" fontWeight="bold">
          TOKEN: #018
        </text>

        {/* Itemized lines */}
        <text x="16" y="74" fill="#333333" fontSize="7" fontFamily="Courier, monospace">2x Paneer Tikka</text>
        <text x="154" y="74" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">640.00</text>

        <text x="16" y="88" fill="#333333" fontSize="7" fontFamily="Courier, monospace">1x Dal Makhani</text>
        <text x="154" y="88" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">320.00</text>

        <text x="16" y="102" fill="#333333" fontSize="7" fontFamily="Courier, monospace">4x Butter Naan</text>
        <text x="154" y="102" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">240.00</text>

        <text x="16" y="116" fill="#333333" fontSize="7" fontFamily="Courier, monospace">2x Cold Beverage</text>
        <text x="154" y="116" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">180.00</text>

        <line x1="14" y1="128" x2="156" y2="128" stroke="#151C19" strokeWidth="1" strokeDasharray="3 3" />

        <text x="16" y="142" fill="#555555" fontSize="7" fontFamily="Courier, monospace">SUBTOTAL</text>
        <text x="154" y="142" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">1,380.00</text>

        <text x="16" y="154" fill="#555555" fontSize="7" fontFamily="Courier, monospace">GST @ 5%</text>
        <text x="154" y="154" textAnchor="end" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">69.00</text>

        <line x1="14" y1="164" x2="156" y2="164" stroke="#151C19" strokeWidth="1.5" />

        <text x="16" y="180" fill="#151C19" fontSize="9" fontFamily="Courier, monospace" fontWeight="900">NET TOTAL</text>
        <text x="154" y="180" textAnchor="end" fill="#151C19" fontSize="10" fontFamily="Courier, monospace" fontWeight="900">₹1,449.00</text>

        {/* High-Impact Green "PAID" Rubber Stamp */}
        <g className="pb-stamp-anim" transform="translate(85, 215)">
          <rect x="-48" y="-16" width="96" height="32" rx="4" fill="none" stroke="#25A25A" strokeWidth="3" strokeDasharray="60 4 60 4" />
          <text x="0" y="6" textAnchor="middle" fill="#25A25A" fontSize="18" fontFamily="sans-serif" fontWeight="900" letterSpacing="2">
            PAID
          </text>
        </g>
      </g>

      {/* Floating HUD: Zero-Wait Review Nudge */}
      <g className="pb-float" transform="translate(340, 290)" filter="url(#pb-shadow)">
        <rect x="0" y="0" width="165" height="68" rx="14" fill="#131F19" stroke="#2B3F32" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="5" fill="#FFC928" />
        <text x="32" y="24" fill="#FFC928" fontSize="8" fontFamily="sans-serif" fontWeight="bold">GOOGLE REVIEW NUDGE</text>
        <text x="16" y="44" fill="#FAFAF7" fontSize="12" fontFamily="sans-serif" fontWeight="bold">1.5s Post-Settle</text>
        <text x="16" y="58" fill="#8FA69B" fontSize="7.5" fontFamily="sans-serif">Max 5-star review conversion</text>
      </g>
    </svg>
  );
};

export default IllusPosBilling;

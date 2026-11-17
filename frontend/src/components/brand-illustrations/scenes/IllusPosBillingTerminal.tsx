import React from 'react';
import type { BrandTheme } from '../core/tokens';

export interface PosBillingTerminalProps {
  theme?: BrandTheme;
  animated?: boolean;
  isPrinting?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IllusPosBillingTerminal — Benchmark 2D Brand Vector & Motion Component
 * 
 * Purpose: POS Billing & Cashier Panel (/app/cashier, /customer/bill, /purchase/success)
 * Style: 2D Semi-Flat Vector with 2.5px contours, 100% Transparent Ground
 * Brand: MENUQR Signature Obsidian, Signal Mint (#10B981) & Brushed Brass (#D4AF37)
 * Motion: Thermal receipt paper slide-out, pulsing NFC contactless ripples, card chip shimmer
 */
export const IllusPosBillingTerminal: React.FC<PosBillingTerminalProps> = ({
  theme = 'obsidian',
  animated = true,
  isPrinting = true,
  size = 'responsive',
  className = '',
  style,
}) => {
  const isParchment = theme === 'parchment';
  const sizeMap = {
    sm: { width: 300, height: 240 },
    md: { width: 420, height: 330 },
    lg: { width: 540, height: 420 },
    responsive: { width: '100%', height: 'auto' },
  };

  const currentSize = sizeMap[size] || sizeMap.responsive;

  // Palette mappings
  const terminalBody = isParchment ? '#1E2C24' : '#0B1510';
  const terminalScreenBg = isParchment ? '#131F19' : '#070D0A';
  const screenBorder = isParchment ? '#2F483A' : '#173022';
  const brassMain = '#D4AF37';
  const brassDark = '#997A24';
  const mintGreen = '#10B981';
  const receiptBg = isParchment ? '#FFFFFF' : '#F9F8F5';
  const receiptTextDark = '#141E18';
  const receiptTextMuted = '#687B72';
  const contourStroke = isParchment ? '#0C1711' : '#030805';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 420"
      width={currentSize.width}
      height={currentSize.height}
      className={`select-none ${className}`}
      style={style}
      role="img"
      aria-label="MENUQR POS Billing Terminal & Instant Thermal Receipt"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="pos-brass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D77F" />
          <stop offset="45%" stopColor={brassMain} />
          <stop offset="100%" stopColor={brassDark} />
        </linearGradient>

        <linearGradient id="pos-terminal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#2D3E34' : '#14241C'} />
          <stop offset="60%" stopColor={terminalBody} />
          <stop offset="100%" stopColor={isParchment ? '#131E18' : '#050B08'} />
        </linearGradient>

        <linearGradient id="pos-screen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={terminalScreenBg} />
          <stop offset="100%" stopColor={isParchment ? '#0A120E' : '#030604'} />
        </linearGradient>

        <linearGradient id="pos-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E382B" />
          <stop offset="50%" stopColor="#13241C" />
          <stop offset="100%" stopColor="#0B1510" />
        </linearGradient>

        {/* Soft Drop Shadows for 2D Depth (No Muddy Rasters) */}
        <filter id="pos-soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity={isParchment ? 0.18 : 0.45} />
        </filter>

        <filter id="pos-receipt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity={isParchment ? 0.15 : 0.35} />
        </filter>

        {/* Keyframe Micro-Interactions */}
        {animated && (
          <style>{`
            @keyframes receiptRollOut {
              0% { transform: translateY(85px); opacity: 0; }
              25% { opacity: 1; }
              100% { transform: translateY(0); opacity: 1; }
            }
            @keyframes nfcPulse {
              0% { r: 8px; opacity: 0.9; }
              70% { r: 24px; opacity: 0.05; }
              100% { r: 28px; opacity: 0; }
            }
            @keyframes chipShimmer {
              0%, 100% { opacity: 0.8; }
              50% { opacity: 1; filter: drop-shadow(0 0 4px #F5D77F); }
            }
            @keyframes mintBeacon {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(1.15); }
            }
            .pos-receipt-slide {
              animation: receiptRollOut 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .pos-nfc-ring-1 {
              animation: nfcPulse 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
            }
            .pos-nfc-ring-2 {
              animation: nfcPulse 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.7s;
            }
            .pos-chip-gleam {
              animation: chipShimmer 3s ease-in-out infinite;
            }
            .pos-status-pulse {
              transform-origin: 104px 94px;
              animation: mintBeacon 2s ease-in-out infinite;
            }
          `}</style>
        )}
      </defs>

      {/* ── 100% TRANSPARENT CANVAS (NO PHOTO, NO BACKGROUND WALL) ── */}

      {/* Ambient Decorative Accents (Brand Identity Symbols) */}
      <g opacity={isParchment ? 0.35 : 0.6}>
        {/* Subtle Geometric Dotted Grid */}
        <g fill={isParchment ? '#D6C8B4' : '#1C3326'} opacity="0.4">
          <circle cx="60" cy="50" r="1.5" />
          <circle cx="80" cy="50" r="1.5" />
          <circle cx="100" cy="50" r="1.5" />
          <circle cx="60" cy="70" r="1.5" />
          <circle cx="80" cy="70" r="1.5" />
          <circle cx="100" cy="70" r="1.5" />
          <circle cx="60" cy="90" r="1.5" />
          <circle cx="80" cy="90" r="1.5" />
          <circle cx="100" cy="90" r="1.5" />
        </g>
        {/* Star Sparkle Accent in Brand Brass */}
        <path
          d="M480 80 Q485 92 497 97 Q485 102 480 114 Q475 102 463 97 Q475 92 480 80 Z"
          fill="url(#pos-brass-grad)"
          opacity="0.75"
        />
        <circle cx="505" cy="70" r="2.5" fill={mintGreen} opacity="0.6" />
      </g>

      {/* Ground Counter Shadow (Flat Oval, No Heavy Scene) */}
      <ellipse
        cx="270"
        cy="375"
        rx="220"
        ry="22"
        fill="#000000"
        opacity={isParchment ? 0.08 : 0.35}
      />

      {/* ── POS BILLING TERMINAL BASE (BRUSHED BRASS & OBSIDIAN) ── */}
      <g filter="url(#pos-soft-shadow)">
        {/* Brushed Brass Base Pedestal */}
        <path
          d="M 180 340 L 320 340 L 340 365 L 160 365 Z"
          fill="url(#pos-brass-grad)"
          stroke={contourStroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Base Bevel Highlight */}
        <line x1="168" y1="363" x2="332" y2="363" stroke="#FFF0B3" strokeWidth="1.2" opacity="0.8" />

        {/* Articulated Stand Neck */}
        <rect
          x="235"
          y="275"
          width="30"
          height="70"
          rx="6"
          fill={terminalBody}
          stroke={contourStroke}
          strokeWidth="2"
        />
        <rect x="242" y="285" width="16" height="50" rx="3" fill="url(#pos-brass-grad)" opacity="0.9" />

        {/* ── MAIN TOUCHSCREEN MONITOR (ANGLED 2D POS) ── */}
        <g transform="translate(90, 70)">
          {/* Outer Monitor Chassis */}
          <rect
            x="0"
            y="0"
            width="250"
            height="185"
            rx="16"
            fill="url(#pos-terminal-grad)"
            stroke={contourStroke}
            strokeWidth="2.5"
          />
          {/* Elegant Top Screen Trim */}
          <line x1="16" y1="1.5" x2="234" y2="1.5" stroke="url(#pos-brass-grad)" strokeWidth="2" />

          {/* Inner Touch Glass Screen */}
          <rect
            x="12"
            y="12"
            width="226"
            height="161"
            rx="10"
            fill="url(#pos-screen-grad)"
            stroke={screenBorder}
            strokeWidth="1.5"
          />

          {/* Screen Header Bar */}
          <rect x="12" y="12" width="226" height="30" rx="10" fill={isParchment ? '#1A2921' : '#0F1A14'} />
          {/* Signal Mint Live Online Beacon */}
          <circle cx="28" cy="27" r="4.5" fill={mintGreen} className="pos-status-pulse" />
          <text
            x="39"
            y="31"
            fill="#EAF5EF"
            fontSize="10"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="700"
            letterSpacing="0.06em"
          >
            MENUQR POS • T-04
          </text>
          <text
            x="222"
            y="31"
            textAnchor="end"
            fill={mintGreen}
            fontSize="9"
            fontFamily="system-ui, sans-serif"
            fontWeight="800"
          >
            DINE-IN ACTIVE
          </text>

          {/* Itemized Cart Screen List */}
          <g transform="translate(24, 56)">
            {/* Row 1 */}
            <text x="0" y="10" fill="#E1EBE5" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="600">
              2x Murgh Malai Tikka
            </text>
            <text x="202" y="10" textAnchor="end" fill="#E1EBE5" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="600">
              ₹840
            </text>

            {/* Row 2 */}
            <text x="0" y="28" fill="#A4B8AE" fontSize="10" fontFamily="system-ui, sans-serif">
              1x Dal Bukhara (Butter)
            </text>
            <text x="202" y="28" textAnchor="end" fill="#A4B8AE" fontSize="10" fontFamily="system-ui, sans-serif">
              ₹420
            </text>

            {/* Row 3 */}
            <text x="0" y="44" fill="#A4B8AE" fontSize="10" fontFamily="system-ui, sans-serif">
              3x Garlic Butter Naan
            </text>
            <text x="202" y="44" textAnchor="end" fill="#A4B8AE" fontSize="10" fontFamily="system-ui, sans-serif">
              ₹220
            </text>

            {/* Divider */}
            <line x1="0" y1="56" x2="202" y2="56" stroke={screenBorder} strokeWidth="1" strokeDasharray="3 3" />

            {/* Grand Total Bar */}
            <text x="0" y="74" fill="#889E93" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="600">
              TOTAL DUE
            </text>
            <text
              x="202"
              y="76"
              textAnchor="end"
              fill={mintGreen}
              fontSize="17"
              fontFamily="system-ui, sans-serif"
              fontWeight="900"
              letterSpacing="-0.02em"
            >
              ₹1,480.00
            </text>

            {/* Instant Split Pay Button */}
            <rect x="0" y="86" width="202" height="24" rx="6" fill={mintGreen} />
            <text
              x="101"
              y="102"
              textAnchor="middle"
              fill="#06120B"
              fontSize="10"
              fontFamily="system-ui, sans-serif"
              fontWeight="800"
              letterSpacing="0.04em"
            >
              ✓ PRINT BILL &amp; SETTLE
            </text>
          </g>
        </g>

        {/* ── HIGH-SPEED THERMAL PRINTER UNIT (TOP RIGHT) ── */}
        <g transform="translate(325, 110)">
          {/* Printer Housing */}
          <rect
            x="0"
            y="70"
            width="145"
            height="135"
            rx="12"
            fill="url(#pos-terminal-grad)"
            stroke={contourStroke}
            strokeWidth="2.5"
          />
          {/* Thermal Dispense Slot Edge */}
          <rect x="14" y="75" width="117" height="6" rx="3" fill="#040806" stroke={contourStroke} strokeWidth="1.2" />

          {/* Printer Indicator LED & Brand Logo */}
          <circle cx="25" cy="98" r="3" fill={mintGreen} />
          <text
            x="35"
            y="101"
            fill="#8BA296"
            fontSize="8"
            fontFamily="system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="0.08em"
          >
            MENUQR THERMAL
          </text>

          {/* ── REALISTIC SLIDING THERMAL PAPER RECEIPT ── */}
          <g
            className={animated && isPrinting ? 'pos-receipt-slide' : ''}
            filter="url(#pos-receipt-shadow)"
            transform="translate(18, -40)"
          >
            {/* Paper Sheet with Perforated Top Edge */}
            <path
              d="
                M 0 0
                L 7 5 L 14 0 L 21 5 L 28 0 L 35 5 L 42 0 L 49 5 L 56 0 L 63 5 L 70 0 L 77 5 L 84 0 L 91 5 L 98 0 L 105 5 L 109 0
                L 109 155
                L 0 155
                Z
              "
              fill={receiptBg}
              stroke="#D8D0C2"
              strokeWidth="1.2"
            />

            {/* Receipt Header */}
            <text
              x="54.5"
              y="22"
              textAnchor="middle"
              fill={receiptTextDark}
              fontSize="9"
              fontFamily="system-ui, sans-serif"
              fontWeight="900"
              letterSpacing="0.08em"
            >
              MENUQR DINING
            </text>
            <text
              x="54.5"
              y="32"
              textAnchor="middle"
              fill={receiptTextMuted}
              fontSize="7"
              fontFamily="system-ui, sans-serif"
            >
              Table #04 • Dine-In Bill
            </text>

            <line x1="8" y1="38" x2="101" y2="38" stroke="#DDD4C4" strokeWidth="1" strokeDasharray="2 2" />

            {/* Itemized Lines */}
            <text x="10" y="50" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace" fontWeight="600">
              2x Murgh Tikka
            </text>
            <text x="99" y="50" textAnchor="end" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace" fontWeight="600">
              840
            </text>

            <text x="10" y="62" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace">
              1x Dal Bukhara
            </text>
            <text x="99" y="62" textAnchor="end" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace">
              420
            </text>

            <text x="10" y="74" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace">
              3x Butter Naan
            </text>
            <text x="99" y="74" textAnchor="end" fill={receiptTextDark} fontSize="7.5" fontFamily="monospace">
              220
            </text>

            <line x1="8" y1="82" x2="101" y2="82" stroke="#DDD4C4" strokeWidth="1" />

            {/* Grand Total on Receipt */}
            <text x="10" y="94" fill={receiptTextDark} fontSize="8.5" fontFamily="system-ui, sans-serif" fontWeight="800">
              TOTAL
            </text>
            <text x="99" y="94" textAnchor="end" fill={receiptTextDark} fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="900">
              ₹1,480.00
            </text>

            {/* Verified Stamp Badge */}
            <g transform="translate(14, 104)">
              <rect x="0" y="0" width="81" height="18" rx="4" fill="#E8F8F0" stroke={mintGreen} strokeWidth="1" />
              <text
                x="40.5"
                y="12.5"
                textAnchor="middle"
                fill="#0D7D54"
                fontSize="7.5"
                fontFamily="system-ui, sans-serif"
                fontWeight="800"
                letterSpacing="0.04em"
              >
                ✓ PAID (UPI SPLIT)
              </text>
            </g>

            {/* Mini QR Code Graphic on Receipt */}
            <g transform="translate(42, 128)" stroke={receiptTextDark} strokeWidth="1.2">
              <rect x="0" y="0" width="24" height="20" fill="none" strokeWidth="1" />
              <rect x="3" y="3" width="6" height="5" fill={receiptTextDark} />
              <rect x="15" y="3" width="6" height="5" fill={receiptTextDark} />
              <rect x="3" y="12" width="6" height="5" fill={receiptTextDark} />
              <rect x="12" y="11" width="3" height="3" fill={receiptTextDark} />
              <rect x="17" y="14" width="4" height="3" fill={receiptTextDark} />
            </g>
          </g>
        </g>

        {/* ── CONTACTLESS TAP / CARD SWIPE ACCESSORY (LEFT FOREGROUND) ── */}
        <g transform="translate(50, 260)">
          {/* Card Tap Pad Base */}
          <rect
            x="0"
            y="20"
            width="110"
            height="75"
            rx="12"
            fill="url(#pos-terminal-grad)"
            stroke={contourStroke}
            strokeWidth="2.2"
          />

          {/* Contactless NFC Waves with Animated Pulse */}
          <g transform="translate(55, 50)">
            {animated && (
              <>
                <circle cx="0" cy="0" r="10" fill="none" stroke={mintGreen} strokeWidth="1.5" className="pos-nfc-ring-1" />
                <circle cx="0" cy="0" r="10" fill="none" stroke={mintGreen} strokeWidth="1.5" className="pos-nfc-ring-2" />
              </>
            )}
            {/* NFC Icon Waves */}
            <path d="M-8 4 A 12 12 0 0 1 -8 -4" fill="none" stroke={mintGreen} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M-4 7 A 17 17 0 0 1 -4 -7" fill="none" stroke={mintGreen} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M0 10 A 22 22 0 0 1 0 -10" fill="none" stroke={mintGreen} strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* Metal Debit / Credit Card Overlapping */}
          <g transform="translate(25, 45) rotate(-14)">
            <rect
              x="0"
              y="0"
              width="85"
              height="52"
              rx="6"
              fill="url(#pos-card-grad)"
              stroke="url(#pos-brass-grad)"
              strokeWidth="1.4"
            />
            {/* EMV Smart Chip (Shimmering Brass) */}
            <rect
              x="12"
              y="18"
              width="14"
              height="11"
              rx="2.5"
              fill="url(#pos-brass-grad)"
              stroke="#B38F2E"
              strokeWidth="0.8"
              className="pos-chip-gleam"
            />
            {/* Contactless Wave on Card */}
            <path d="M72 14 A 6 6 0 0 1 72 24" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />
            <text x="12" y="44" fill="#E2EBE5" fontSize="6.5" fontFamily="monospace" letterSpacing="0.1em">
              •••• 4821
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default IllusPosBillingTerminal;

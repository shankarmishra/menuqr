import React from 'react';

export interface PosMasterpieceProps {
  theme?: 'obsidian' | 'parchment' | 'transparent';
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * IllusPosMasterpiece — Static Master Vector Artwork
 * 
 * Concept: "The Handshake" — Refined Character-Led Restaurant Billing Interaction
 * Focus: Authentic human anatomy, industrial-grade hardware construction,
 *        tactile material distinction (glass, metal, plastic, paper, marble, skin),
 *        and grounded spatial perspective.
 * 
 * ZERO decorative animations, ZERO floating stars, ZERO primitive geometric hacks.
 */
export const IllusPosMasterpiece: React.FC<PosMasterpieceProps> = ({
  theme = 'obsidian',
  size = 'responsive',
  className = '',
  style,
}) => {
  const isParchment = theme === 'parchment';

  const sizeMap = {
    sm: { width: 320, height: 235 },
    md: { width: 480, height: 353 },
    lg: { width: 680, height: 500 },
    responsive: { width: '100%', height: 'auto' },
  };

  const currentSize = sizeMap[size] || sizeMap.responsive;

  // Palette tokens
  const brassLight = '#F3D276';
  const brassMid = '#D4AF37';
  const brassDark = '#8C6C1B';
  const mintGreen = '#10B981';
  const forestFabric = '#182E23';
  const whiteCuff = '#F7FAF8';
  
  // Skin tones (warm South Asian olive/wheatish)
  const skinBase = '#C68B59';
  const skinShadow = '#A3683A';
  const skinHighlight = '#DC9F6E';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 680 500"
      width={currentSize.width}
      height={currentSize.height}
      className={`select-none ${className}`}
      style={style}
      role="img"
      aria-label="MENUQR Restaurant POS Billing & Customer Handshake Master Illustration"
    >
      <defs>
        {/* Metallic Brass Gradients */}
        <linearGradient id="mp-brass-pedestal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={brassLight} />
          <stop offset="45%" stopColor={brassMid} />
          <stop offset="85%" stopColor={brassDark} />
          <stop offset="100%" stopColor="#5E470E" />
        </linearGradient>

        <linearGradient id="mp-brass-trim" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={brassMid} />
          <stop offset="50%" stopColor={brassLight} />
          <stop offset="100%" stopColor={brassDark} />
        </linearGradient>

        {/* Marble Tabletop Gradient */}
        <linearGradient id="mp-marble-slab" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isParchment ? '#EFE9DE' : '#0B1712'} />
          <stop offset="50%" stopColor={isParchment ? '#E3DBD0' : '#070F0B'} />
          <stop offset="100%" stopColor={isParchment ? '#D6CDBF' : '#040907'} />
        </linearGradient>

        {/* Terminal Chassis Matte Polycarbonate */}
        <linearGradient id="mp-chassis-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1B2B22" />
          <stop offset="40%" stopColor="#111B16" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        {/* Screen Glass Sheen */}
        <linearGradient id="mp-screen-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#050B08" />
          <stop offset="100%" stopColor="#020503" />
        </linearGradient>

        <linearGradient id="mp-glass-reflection" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="40%" stopColor="#10B981" stopOpacity="0.04" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        {/* Skin Gradients */}
        <linearGradient id="mp-cashier-hand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={skinHighlight} />
          <stop offset="60%" stopColor={skinBase} />
          <stop offset="100%" stopColor={skinShadow} />
        </linearGradient>

        <linearGradient id="mp-customer-hand" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DEAA80" />
          <stop offset="60%" stopColor="#CB9367" />
          <stop offset="100%" stopColor="#A86E45" />
        </linearGradient>

        {/* Thermal Receipt Paper */}
        <linearGradient id="mp-receipt-paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="65%" stopColor="#F9F6F0" />
          <stop offset="100%" stopColor="#ECE4D8" />
        </linearGradient>

        {/* Controlled Drop Shadows */}
        <filter id="mp-ground-shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="9" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.45 0" />
          <feOffset dx="0" dy="8" />
          <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
        </filter>

        <filter id="mp-receipt-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" />
          <feOffset dx="-2" dy="5" />
          <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
        </filter>
      </defs>

      {/* ── LAYER 1: GROUNDED TABLETOP ENVIRONMENT (DARK MARBLE COUNTER) ── */}
      <g id="countertop-environment">
        {/* Counter Top Slab in Perspective */}
        <polygon
          points="40,360 640,360 680,480 0,480"
          fill="url(#mp-marble-slab)"
          stroke={isParchment ? '#C5BCAE' : '#14261D'}
          strokeWidth="1.5"
        />

        {/* Brass Inlay Seam on Counter */}
        <line x1="45" y1="362" x2="635" y2="362" stroke="url(#mp-brass-trim)" strokeWidth="1.5" opacity="0.8" />
        <line x1="10" y1="465" x2="670" y2="465" stroke="url(#mp-brass-trim)" strokeWidth="1.2" opacity="0.4" />

        {/* Subtle Organic Marble Veins */}
        <path
          d="M 120 400 Q 180 380, 240 410 T 360 395 T 440 430"
          fill="none"
          stroke={isParchment ? '#D4C8B5' : '#173024'}
          strokeWidth="1.2"
          opacity="0.35"
        />
        <path
          d="M 480 375 Q 520 400, 560 385 T 620 420"
          fill="none"
          stroke={isParchment ? '#D4C8B5' : '#173024'}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Contact Shadow for Terminal Base */}
        <ellipse cx="320" cy="385" rx="140" ry="24" fill="#000000" opacity="0.45" />

        {/* Contact Shadow for Customer Hand & Card */}
        <ellipse cx="510" cy="395" rx="55" ry="14" fill="#000000" opacity="0.3" />
      </g>

      {/* ── LAYER 2: POS HARDWARE ARCHITECTURE (INDUSTRIAL-GRADE CONSTRUCTION) ── */}
      <g id="pos-hardware" filter="url(#mp-ground-shadow)">
        
        {/* Cast Brass Pedestal Base */}
        <path
          d="M 230 355 L 410 355 L 435 385 L 205 385 Z"
          fill="url(#mp-brass-pedestal)"
          stroke="#47350A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Base Rim Polished Highlight */}
        <line x1="212" y1="383" x2="428" y2="383" stroke="#FFF5D1" strokeWidth="1.5" />

        {/* Articulated Stand Neck */}
        <path
          d="M 295 270 L 345 270 L 350 355 L 290 355 Z"
          fill="#0C1611"
          stroke="#050B08"
          strokeWidth="2"
        />
        {/* Brass Collar Accents */}
        <rect x="298" y="280" width="44" height="6" rx="2" fill="url(#mp-brass-pedestal)" />
        <rect x="294" y="340" width="52" height="7" rx="2" fill="url(#mp-brass-pedestal)" />

        {/* Terminal Chassis Rear Support & Angled Housing */}
        <path
          d="M 140 100 L 460 80 L 490 290 L 170 310 Z"
          fill="url(#mp-chassis-grad)"
          stroke="#070C09"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Brushed Brass Screen Bezel Inset */}
        <path
          d="M 152 110 L 448 92 L 476 280 L 180 298 Z"
          fill="none"
          stroke="url(#mp-brass-trim)"
          strokeWidth="2"
        />

        {/* Deep Screen Glass Surface */}
        <path
          d="M 155 113 L 445 95 L 473 277 L 183 295 Z"
          fill="url(#mp-screen-glass)"
        />

        {/* Diagonal Screen Glass Reflection (Materiality) */}
        <path
          d="M 155 113 L 310 103 L 230 292 L 183 295 Z"
          fill="url(#mp-glass-reflection)"
        />

        {/* Thermal Printer Unit Integrated on Right Bezel */}
        <path
          d="M 440 85 L 500 81 L 515 155 L 455 159 Z"
          fill="#132019"
          stroke="#060C08"
          strokeWidth="2"
        />
        {/* Printer Dispense Slot */}
        <polygon
          points="452,94 488,92 489,97 453,99"
          fill="#020503"
        />
        {/* Status LED Beacon */}
        <circle cx="493" cy="95" r="2.5" fill={mintGreen} />
      </g>

      {/* ── LAYER 3: CLEAN APPLICATION UI DATA (CRISP MATHEMATICAL TYPOGRAPHY) ── */}
      <g id="screen-readable-ui" transform="translate(165, 110)">
        {/* Screen Header Bar */}
        <rect x="10" y="10" width="280" height="26" rx="5" fill="#0C1912" />
        <circle cx="23" cy="23" r="3.5" fill={mintGreen} />
        <text x="33" y="27" fill="#EAF5EF" fontSize="9.5" fontFamily="system-ui, sans-serif" fontWeight="700">
          MENUQR POS &bull; TABLE #04 (DINE-IN)
        </text>
        <text x="280" y="27" textAnchor="end" fill={mintGreen} fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="800">
          ACTIVE
        </text>

        {/* Itemized Order List on Screen */}
        <g transform="translate(16, 50)">
          <text x="0" y="12" fill="#E2EEE7" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="600">
            2x Murgh Malai Tikka
          </text>
          <text x="260" y="12" textAnchor="end" fill="#E2EEE7" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="600">
            ₹840
          </text>

          <text x="0" y="32" fill="#A1B8AC" fontSize="10" fontFamily="system-ui, sans-serif">
            1x Dal Bukhara (Butter)
          </text>
          <text x="260" y="32" textAnchor="end" fill="#A1B8AC" fontSize="10" fontFamily="system-ui, sans-serif">
            ₹420
          </text>

          <text x="0" y="50" fill="#A1B8AC" fontSize="10" fontFamily="system-ui, sans-serif">
            3x Garlic Butter Naan
          </text>
          <text x="260" y="50" textAnchor="end" fill="#A1B8AC" fontSize="10" fontFamily="system-ui, sans-serif">
            ₹220
          </text>

          {/* Dotted Total Divider */}
          <line x1="0" y1="64" x2="260" y2="64" stroke="#1C3829" strokeWidth="1" strokeDasharray="3 3" />

          {/* Total & Action Button */}
          <text x="0" y="86" fill="#8DA69A" fontSize="10" fontFamily="system-ui, sans-serif" fontWeight="700">
            TOTAL AMOUNT DUE
          </text>
          <text x="260" y="88" textAnchor="end" fill={mintGreen} fontSize="18" fontFamily="system-ui, sans-serif" fontWeight="900">
            ₹1,480.00
          </text>

          {/* Action Settlement Button */}
          <rect x="0" y="100" width="260" height="28" rx="7" fill={mintGreen} />
          <text x="130" y="118" textAnchor="middle" fill="#041209" fontSize="11" fontFamily="system-ui, sans-serif" fontWeight="800">
            ✓ ACCEPT PAYMENT &amp; SETTLE
          </text>
        </g>
      </g>

      {/* ── LAYER 4: CASHIER CAPTAIN'S ARM & HAND (ANATOMICALLY ACCURATE) ── */}
      <g id="cashier-hand-interaction" filter="url(#mp-ground-shadow)">
        
        {/* Midnight Forest Green Vest Sleeve */}
        <path
          d="M 0 200 L 95 185 L 125 240 L 0 260 Z"
          fill={forestFabric}
          stroke="#09140D"
          strokeWidth="2"
        />
        {/* Vest Fabric Seam */}
        <path d="M 30 195 Q 60 215, 85 205" fill="none" stroke="#264736" strokeWidth="1.5" />

        {/* Crisp White Shirt Cuff */}
        <polygon
          points="90,186 122,181 133,230 101,235"
          fill={whiteCuff}
          stroke="#C5D6CD"
          strokeWidth="1.5"
        />
        {/* Brass Cufflink */}
        <circle cx="114" cy="218" r="3.5" fill="url(#mp-brass-pedestal)" stroke="#5E470E" strokeWidth="0.8" />

        {/* Articulated Wrist & Forearm */}
        <path
          d="M 120,183 Q 145,178, 165,190 L 160,232 Q 138,235, 116,233 Z"
          fill="url(#mp-cashier-hand)"
          stroke="#7A4B27"
          strokeWidth="1.5"
        />

        {/* Hand Palm & Curled Fingers */}
        <path
          d="M 160,190 C 180,188, 195,198, 202,215 C 205,225, 198,240, 175,242 C 160,243, 150,235, 148,225 Z"
          fill="url(#mp-cashier-hand)"
          stroke="#7A4B27"
          strokeWidth="1.5"
        />

        {/* Index Finger Extending Forward Touching Screen Button */}
        <path
          d="M 195,202 C 215,200, 235,210, 246,217 C 248,219, 247,225, 241,226 C 228,228, 212,222, 198,218 Z"
          fill="url(#mp-cashier-hand)"
          stroke="#7A4B27"
          strokeWidth="1.5"
        />
        {/* Index Fingernail Highlight */}
        <path d="M 238 217 Q 244 220, 242 224" fill="none" stroke="#FCE7D2" strokeWidth="1.2" />

        {/* Middle, Ring & Pinky Fingers Curled Naturally */}
        <path
          d="M 190,218 C 202,220, 210,228, 212,234 C 213,237, 208,240, 200,239 C 190,237, 185,230, 182,225 Z"
          fill={skinShadow}
          stroke="#7A4B27"
          strokeWidth="1.2"
        />
        <path
          d="M 180,227 C 190,229, 198,236, 199,242 C 200,245, 194,248, 186,246 C 178,244, 175,238, 172,233 Z"
          fill={skinShadow}
          stroke="#7A4B27"
          strokeWidth="1.2"
        />
      </g>

      {/* ── LAYER 5: CUSTOMER'S HAND & PAYMENT CARD (REFINED ANATOMY & INTERACTION) ── */}
      <g id="customer-hand-and-card" filter="url(#mp-ground-shadow)">
        
        {/* Customer Forearm (Entering From Right Side) */}
        <path
          d="M 680 290 L 590 280 L 570 335 L 680 350 Z"
          fill="#1C1814"
          stroke="#0D0B09"
          strokeWidth="2"
        />
        {/* Watch on Wrist */}
        <rect x="580" y="280" width="14" height="56" rx="3" fill="#0A0907" stroke="#3D352E" strokeWidth="1" />
        <circle cx="587" cy="308" r="9" fill="url(#mp-brass-pedestal)" stroke="#523F11" strokeWidth="1" />
        <circle cx="587" cy="308" r="7" fill="#0C1410" />

        {/* Customer Hand Palm */}
        <path
          d="M 572 284 C 545 285, 528 298, 515 315 C 508 326, 518 340, 540 342 C 558 343, 570 338, 575 330 Z"
          fill="url(#mp-customer-hand)"
          stroke="#6E4424"
          strokeWidth="1.5"
        />

        {/* Forefinger Gripping Card Top */}
        <path
          d="M 522 305 C 500 302, 480 308, 472 314 C 470 316, 472 321, 478 322 C 490 323, 505 318, 518 316 Z"
          fill="url(#mp-customer-hand)"
          stroke="#6E4424"
          strokeWidth="1.4"
        />
        {/* Thumb Gripping Card Edge */}
        <path
          d="M 535 292 C 518 290, 502 296, 492 301 C 490 303, 492 307, 498 308 C 510 309, 522 305, 532 302 Z"
          fill="url(#mp-customer-hand)"
          stroke="#6E4424"
          strokeWidth="1.4"
        />

        {/* Sleek Matte-Black Titanium Payment Card (Accurate 3/4 Perspective) */}
        <g transform="translate(435, 305) rotate(-11)">
          {/* Card Body */}
          <rect
            x="0"
            y="0"
            width="105"
            height="65"
            rx="6"
            fill="#0D1612"
            stroke="url(#mp-brass-trim)"
            strokeWidth="1.5"
          />
          {/* Shimmering Gold EMV Smart Chip */}
          <rect
            x="14"
            y="22"
            width="17"
            height="13"
            rx="2.5"
            fill="url(#mp-brass-pedestal)"
            stroke="#634C10"
            strokeWidth="0.8"
          />
          <line x1="22" y1="22" x2="22" y2="35" stroke="#634C10" strokeWidth="0.6" />
          <line x1="14" y1="28" x2="31" y2="28" stroke="#634C10" strokeWidth="0.6" />

          {/* Contactless Wave Glyph */}
          <path d="M 88 16 A 8 8 0 0 1 88 28" fill="none" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.75" />
          <path d="M 84 19 A 5 5 0 0 1 84 25" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6" />

          {/* Masked Card Number */}
          <text x="14" y="52" fill="#E2EEE7" fontSize="7" fontFamily="monospace" letterSpacing="0.12em">
            •••• 4821
          </text>
        </g>
      </g>

      {/* ── LAYER 6: THERMAL RECEIPT DISPENSING (NATURAL MATTE PAPER FINISH) ── */}
      <g id="thermal-receipt" filter="url(#mp-receipt-shadow)" transform="translate(450, 40)">
        
        {/* Paper Sheet with Perforated Top Edge & Delicate Wave */}
        <path
          d="
            M 0 0
            L 7 4 L 14 0 L 21 4 L 28 0 L 35 4 L 42 0 L 49 4 L 56 0 L 63 4 L 70 0 L 77 4 L 84 0 L 91 4 L 98 0 L 105 4 L 112 0
            L 112 165
            C 90 162, 30 168, 0 165
            Z
          "
          fill="url(#mp-receipt-paper)"
          stroke="#D8CFBD"
          strokeWidth="1.2"
        />

        {/* Receipt Header Text */}
        <text x="56" y="24" textAnchor="middle" fill="#0E1A14" fontSize="9" fontFamily="system-ui, sans-serif" fontWeight="900" letterSpacing="0.08em">
          MENUQR DINING
        </text>
        <text x="56" y="34" textAnchor="middle" fill="#5F7368" fontSize="7" fontFamily="system-ui, sans-serif">
          Table #04 &bull; Dine-In Bill
        </text>

        {/* Dotted Divider */}
        <line x1="8" y1="40" x2="104" y2="40" stroke="#CDC2AF" strokeWidth="1" strokeDasharray="2 2" />

        {/* Itemized Lines */}
        <text x="10" y="52" fill="#14211A" fontSize="7.5" fontFamily="monospace" fontWeight="600">
          2x Murgh Tikka
        </text>
        <text x="102" y="52" textAnchor="end" fill="#14211A" fontSize="7.5" fontFamily="monospace" fontWeight="600">
          840
        </text>

        <text x="10" y="65" fill="#14211A" fontSize="7.5" fontFamily="monospace">
          1x Dal Bukhara
        </text>
        <text x="102" y="65" textAnchor="end" fill="#14211A" fontSize="7.5" fontFamily="monospace">
          420
        </text>

        <text x="10" y="77" fill="#14211A" fontSize="7.5" fontFamily="monospace">
          3x Butter Naan
        </text>
        <text x="102" y="77" textAnchor="end" fill="#14211A" fontSize="7.5" fontFamily="monospace">
          220
        </text>

        {/* Solid Line */}
        <line x1="8" y1="85" x2="104" y2="85" stroke="#C2B7A2" strokeWidth="1" />

        {/* Total on Paper */}
        <text x="10" y="98" fill="#0C1711" fontSize="8.5" fontFamily="system-ui, sans-serif" fontWeight="800">
          TOTAL
        </text>
        <text x="102" y="98" textAnchor="end" fill="#0C1711" fontSize="10.5" fontFamily="system-ui, sans-serif" fontWeight="900">
          ₹1,480.00
        </text>

        {/* Green Paid Stamp Badge */}
        <g transform="translate(14, 108)">
          <rect x="0" y="0" width="84" height="20" rx="4" fill="#E6F7EF" stroke={mintGreen} strokeWidth="1.2" />
          <text x="42" y="14" textAnchor="middle" fill="#096E49" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="800" letterSpacing="0.04em">
            ✓ PAID (CARD / UPI)
          </text>
        </g>

        {/* Clean Geometric Download QR Code */}
        <g transform="translate(44, 134)" stroke="#111B16" strokeWidth="1">
          <rect x="0" y="0" width="24" height="22" fill="none" />
          <rect x="3" y="3" width="6" height="5" fill="#111B16" />
          <rect x="15" y="3" width="6" height="5" fill="#111B16" />
          <rect x="3" y="14" width="6" height="5" fill="#111B16" />
          <rect x="13" y="12" width="3" height="3" fill="#111B16" />
          <rect x="17" y="15" width="4" height="3" fill="#111B16" />
        </g>
      </g>
    </svg>
  );
};

export default IllusPosMasterpiece;

/**
 * MENUQR Signature Edition — Dakshin Heritage (South Indian Heritage Dining)
 *
 * Modeled after the grand dining halls of Madurai, Chettinad, and Thanjavur:
 *   - Dravidian Gopuram temple tower arch with 5 brass kalasams & hanging bells
 *   - Authentic Kerala/Tamil Kuthu Vilakku lamp cartouche with 5 glowing flames & 36 brass beads
 *   - Interlocking Sikku Pulli Kolam threshold corner brackets
 *   - Hand-crafted banana leaf (Vazhai Ilai) midrib & vein dividers
 *   - Chettinad diet emblems (plantain sprout for Saivam, bronze Uruli flame for Asaivam)
 *   - Tamil numeral course medallions (௧, ௨, ௩, ௪, ௫...)
 *   - "Vazhai Ilai Virundhu" plantain leaf banquet protocol aside plaque
 *   - Traditional South Indian Samayalkar & Kaapi Ustad brigade colophon
 *   - Precision last-baseline anchored radial brass dotted leaders
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DishPrice } from '../../primitives/DishMeta.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  cleanDescription,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-indian.css';

// =============================================================================
// VECTOR ASSETS & ARCHITECTURAL ORNAMENTS (Pure SVG, zero dependencies)
// =============================================================================

/**
 * Dravidian Gopuram Temple Tower Arch with 5-Kalasam Finials & Hanging Temple Bells.
 */
export const GopuramTempleArch: React.FC<{ size?: number; className?: string }> = ({
  size = 110,
  className,
}) => (
  <svg
    viewBox="0 0 160 140"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-dakshin-gopuram-svg', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="dakshinBrassFoil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="25%" stopColor="#eab308" />
        <stop offset="50%" stopColor="#ca8a04" />
        <stop offset="75%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <radialGradient id="bellGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#ca8a04" />
      </radialGradient>
    </defs>

    {/* Five Crown Kalasams (Pancha Stūpi) at Gopuram Summit */}
    {[60, 70, 80, 90, 100].map((cx, i) => (
      <g key={i}>
        <path
          d={`M ${cx} 6 C ${cx - 3} 10, ${cx - 4} 14, ${cx} 18 C ${cx + 4} 14, ${cx + 3} 10, ${cx} 6 Z`}
          fill="url(#dakshinBrassFoil)"
        />
        <circle cx={cx} cy="4" r={i === 2 ? 2 : 1.5} fill="url(#dakshinBrassFoil)" />
        <line x1={cx - 3} y1="18" x2={cx + 3} y2="18" stroke="url(#dakshinBrassFoil)" strokeWidth="1" />
      </g>
    ))}

    {/* Upper Horizontal Ridge Bar (Sala Shikhara Bar) */}
    <rect x="52" y="18" width="56" height="4" rx="1.5" fill="url(#dakshinBrassFoil)" />

    {/* Tier 1 (Uppermost Tala) */}
    <path
      d="M 54 22 L 106 22 L 112 36 L 48 36 Z"
      fill="none"
      stroke="url(#dakshinBrassFoil)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="80" cy="29" r="3" fill="url(#dakshinBrassFoil)" opacity="0.85" />
    <path d="M 64 36 L 68 28 L 72 36 Z M 88 36 L 92 28 L 96 36 Z" fill="url(#dakshinBrassFoil)" opacity="0.7" />

    {/* Tier 2 (Middle Tala) */}
    <path
      d="M 44 36 L 116 36 L 124 56 L 36 56 Z"
      fill="none"
      stroke="url(#dakshinBrassFoil)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <rect x="42" y="54" width="76" height="3" fill="url(#dakshinBrassFoil)" opacity="0.6" />
    <circle cx="80" cy="46" r="3.5" fill="none" stroke="url(#dakshinBrassFoil)" strokeWidth="1" />
    <circle cx="80" cy="46" r="1.5" fill="url(#dakshinBrassFoil)" />

    {/* Tier 3 (Lower Tala with Stepped Kudu Niches) */}
    <path
      d="M 32 58 L 128 58 L 138 84 L 22 84 Z"
      fill="none"
      stroke="url(#dakshinBrassFoil)"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <line x1="26" y1="82" x2="134" y2="82" stroke="url(#dakshinBrassFoil)" strokeWidth="1" />

    {/* Inner Sanctum Gateway Arch (Kudu Torana Curve) */}
    <path
      d="M 38 128 L 38 96
         C 38 82, 54 74, 80 74
         C 106 74, 122 82, 122 96
         L 122 128"
      fill="none"
      stroke="url(#dakshinBrassFoil)"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M 44 128 L 44 98
         C 44 87, 58 80, 80 80
         C 102 80, 116 87, 116 98
         L 116 128"
      fill="none"
      stroke="url(#dakshinBrassFoil)"
      strokeWidth="0.7"
      opacity="0.65"
    />

    {/* Hanging Temple Bells (Mani) on Flanking Brass Chains */}
    {/* Left Bell */}
    <g transform="translate(18, 70)">
      <line x1="0" y1="0" x2="0" y2="28" stroke="url(#dakshinBrassFoil)" strokeWidth="1" strokeDasharray="1.5 2" />
      <path d="M -7 40 C -7 32, -3 30, 0 30 C 3 30, 7 32, 7 40 Z" fill="url(#bellGlow)" />
      <ellipse cx="0" cy="40" rx="7" ry="2" fill="url(#dakshinBrassFoil)" />
      <circle cx="0" cy="43" r="1.8" fill="#fef08a" />
    </g>
    {/* Right Bell */}
    <g transform="translate(142, 70)">
      <line x1="0" y1="0" x2="0" y2="28" stroke="url(#dakshinBrassFoil)" strokeWidth="1" strokeDasharray="1.5 2" />
      <path d="M -7 40 C -7 32, -3 30, 0 30 C 3 30, 7 32, 7 40 Z" fill="url(#bellGlow)" />
      <ellipse cx="0" cy="40" rx="7" ry="2" fill="url(#dakshinBrassFoil)" />
      <circle cx="0" cy="43" r="1.8" fill="#fef08a" />
    </g>

    {/* Stepped Stone Plinth (Adhishthana Base with Padma Petals) */}
    <rect x="14" y="128" width="132" height="4" fill="url(#dakshinBrassFoil)" />
    <path
      d="M 12 134 L 148 134 L 144 138 L 16 138 Z"
      fill="url(#dakshinBrassFoil)"
      opacity="0.8"
    />
    {Array.from({ length: 15 }).map((_, i) => (
      <circle key={i} cx={22 + i * 8.3} cy="131" r="1" fill="#101c13" />
    ))}
  </svg>
);

/**
 * Authentic Kerala/Tamil Brass Kuthu Vilakku Cartouche.
 * Features 5 glowing wick flames, sacred Annam bird finial, and 36 beaded brass pearls.
 */
export const KuthuvilakkuCartouche: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 156 }) => {
  const pearlCount = 36;
  const pearls = Array.from({ length: pearlCount }, (_, i) => {
    const rad = (i * 10 * Math.PI) / 180;
    return {
      cx: 80 + 58.5 * Math.cos(rad),
      cy: 80 + 58.5 * Math.sin(rad),
    };
  });

  return (
    <div className="mq-ed-dakshin-cartouche" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        aria-hidden="true"
        focusable="false"
        className="mq-ed-dakshin-cartouche-svg"
      >
        <defs>
          <linearGradient id="kuthuGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="75%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <radialGradient id="wickGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef08a" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="teakCoinBed" cx="50%" cy="48%" r="52%">
            <stop offset="0%" stopColor="#1a2e20" />
            <stop offset="65%" stopColor="#122016" />
            <stop offset="100%" stopColor="#08100a" />
          </radialGradient>
        </defs>

        {/* Sacred Annam (Hamsa) Finial at Top Crown (12 o'clock) */}
        <g transform="translate(80, 8)">
          <path
            d="M 0 -6 C -3 -3, -5 2, 0 6 C 5 2, 3 -3, 0 -6 Z"
            fill="url(#kuthuGold)"
          />
          <path d="M 0 -6 C -2 -9, 0 -11, 2 -8 Z" fill="url(#kuthuGold)" />
          <path d="M 0 0 C -6 -2, -9 3, -4 6 Z" fill="url(#kuthuGold)" opacity="0.85" />
          <path d="M 0 0 C 6 -2, 9 3, 4 6 Z" fill="url(#kuthuGold)" opacity="0.85" />
          <circle cx="0" cy="8" r="1.8" fill="url(#kuthuGold)" />
        </g>

        {/* Five Glowing Wick Snouts (Pancha Mukha Deepam) */}
        {[
          { angle: -90, x: 80, y: 17 },
          { angle: -30, x: 134, y: 48 },
          { angle: 30, x: 134, y: 112 },
          { angle: 150, x: 26, y: 112 },
          { angle: 210, x: 26, y: 48 },
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="2.8" fill="url(#kuthuGold)" />
            <circle cx={pt.x} cy={pt.y - 4} r="4.5" fill="url(#wickGlow)" />
            <circle cx={pt.x} cy={pt.y - 4} r="1.5" fill="#ffffff" />
          </g>
        ))}

        {/* Outer Fluted Kumbakonam Brass Ring */}
        <circle cx="80" cy="80" r="66" fill="none" stroke="url(#kuthuGold)" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="62.5" fill="none" stroke="url(#kuthuGold)" strokeWidth="0.6" opacity="0.6" />

        {/* 36 Micro-Beaded Brass Pearls Chain */}
        <g fill="url(#kuthuGold)">
          {pearls.map((pt, i) => (
            <circle key={i} cx={pt.cx} cy={pt.cy} r="1.2" />
          ))}
        </g>

        {/* Inner Teak & Bronze Coin Bed */}
        <circle
          cx="80"
          cy="80"
          r="54"
          fill="url(#teakCoinBed)"
          stroke="url(#kuthuGold)"
          strokeWidth="1.2"
        />
        <circle cx="80" cy="80" r="50.5" fill="none" stroke="url(#kuthuGold)" strokeWidth="0.5" opacity="0.4" />

        {/* Flared Stepped Base Baluster (Aadhanam Base at 6 o'clock) */}
        <g transform="translate(80, 146)">
          <path d="M -12 0 L 12 0 L 18 10 L -18 10 Z" fill="url(#kuthuGold)" opacity="0.9" />
          <circle cx="0" cy="2" r="2.5" fill="#fef08a" />
          <line x1="-22" y1="10" x2="22" y2="10" stroke="url(#kuthuGold)" strokeWidth="1.5" />
        </g>
      </svg>
      <div className="mq-ed-dakshin-cartouche-logo">{children}</div>
    </div>
  );
};

/**
 * Traditional Interlocking Sikku Kolam (Rice-Flour Dot Grid Bracket).
 */
export const PulliKolamCornerBracket: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
}> = ({ position, size = 48 }) => {
  const rotationMap = {
    'top-left': 'rotate(0deg)',
    'top-right': 'rotate(90deg)',
    'bottom-right': 'rotate(180deg)',
    'bottom-left': 'rotate(270deg)',
  };

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`mq-ed-dakshin-kolam-bracket is-${position}`}
      style={{ transformOrigin: '32px 32px', transform: rotationMap[position] }}
    >
      <defs>
        <radialGradient id="riceDotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fefce8" />
          <stop offset="100%" stopColor="rgba(254, 252, 232, 0.4)" />
        </radialGradient>
      </defs>

      {/* Stepped Corner Outer Border Filigree */}
      <path
        d="M 4 4 L 60 4 L 60 8 L 8 8 L 8 60 L 4 60 Z"
        fill="#ca8a04"
        opacity="0.8"
      />
      <path
        d="M 8 8 L 52 8 L 52 11 L 11 11 L 11 52 L 8 52 Z"
        fill="#fef08a"
        opacity="0.45"
      />

      {/* Traditional Sikku Kolam Interlacing Loops (White Rice Flour) */}
      <path
        d="M 16 16
           C 22 10, 32 10, 38 16
           C 44 22, 44 32, 38 38
           C 32 44, 22 44, 16 38
           C 10 32, 10 22, 16 16 Z"
        fill="none"
        stroke="#fefce8"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M 28 16
           C 34 10, 48 10, 52 16
           C 56 22, 56 34, 50 40
           C 44 46, 32 46, 26 40"
        fill="none"
        stroke="#fefce8"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 16 28
           C 10 34, 10 48, 16 52
           C 22 56, 34 56, 40 50
           C 46 44, 46 32, 40 26"
        fill="none"
        stroke="#fefce8"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Dot Grid (Pullis) around which the loops flow */}
      {[
        { cx: 16, cy: 16 }, { cx: 28, cy: 16 }, { cx: 40, cy: 16 }, { cx: 52, cy: 16 },
        { cx: 16, cy: 28 }, { cx: 28, cy: 28 }, { cx: 40, cy: 28 },
        { cx: 16, cy: 40 }, { cx: 28, cy: 40 },
        { cx: 16, cy: 52 },
      ].map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={1.8} fill="url(#riceDotGlow)" />
      ))}

      {/* Corner Lotus Flourish Accent */}
      <circle cx="6" cy="6" r="2.2" fill="#ca8a04" />
      <circle cx="6" cy="6" r="1" fill="#fef08a" />
    </svg>
  );
};

/**
 * Stylized Plantain Banana Leaf (Vazhai Ilai) Divider with Midrib and Radiating Veins.
 */
export const VazhaiIlaiAstragal: React.FC<{
  variant?: 'grand' | 'course';
  className?: string;
}> = ({ variant = 'course', className }) => {
  const isGrand = variant === 'grand';

  return (
    <div
      className={['mq-ed-dakshin-astragal', isGrand ? 'is-grand' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="mq-ed-dakshin-astragal-rail rail-left" />
      <svg
        viewBox="0 0 160 28"
        width={isGrand ? 164 : 124}
        height={isGrand ? 28 : 22}
        focusable="false"
        className="mq-ed-dakshin-astragal-svg"
      >
        <defs>
          <linearGradient id="leafGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="45%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="astragalBrass" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="35%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* Left Fluted Brass Rails */}
        <line x1="8" y1="14" x2="48" y2="14" stroke="url(#astragalBrass)" strokeWidth="1.2" />
        <line x1="16" y1="10.5" x2="48" y2="10.5" stroke="url(#astragalBrass)" strokeWidth="0.6" opacity="0.8" />
        <line x1="16" y1="17.5" x2="48" y2="17.5" stroke="url(#astragalBrass)" strokeWidth="0.6" opacity="0.8" />
        <circle cx="8" cy="14" r="2.2" fill="url(#astragalBrass)" />

        {/* Central Stylized Banana Plantain Leaf (Vazhai Ilai) */}
        <g transform="translate(80, 14)">
          <path
            d="M -30 0
               C -24 -9, 14 -10, 30 0
               C 14 10, -24 9, -30 0 Z"
            fill="url(#leafGreen)"
            stroke="url(#astragalBrass)"
            strokeWidth="0.8"
          />
          <line x1="-30" y1="0" x2="30" y2="0" stroke="#fef08a" strokeWidth="1" opacity="0.85" />

          {/* Lateral Feathered Veins */}
          {[-20, -12, -4, 4, 12, 20].map((vx, i) => (
            <g key={i}>
              <line
                x1={vx}
                y1="0"
                x2={vx + 6}
                y2="-5.5"
                stroke="#86efac"
                strokeWidth="0.6"
                opacity="0.8"
              />
              <line
                x1={vx}
                y1="0"
                x2={vx + 6}
                y2="5.5"
                stroke="#86efac"
                strokeWidth="0.6"
                opacity="0.8"
              />
            </g>
          ))}
          <circle cx="0" cy="0" r="1.5" fill="#fef08a" />
        </g>

        {/* Right Fluted Brass Rails */}
        <line x1="112" y1="14" x2="152" y2="14" stroke="url(#astragalBrass)" strokeWidth="1.2" />
        <line x1="112" y1="10.5" x2="144" y2="10.5" stroke="url(#astragalBrass)" strokeWidth="0.6" opacity="0.8" />
        <line x1="112" y1="17.5" x2="144" y2="17.5" stroke="url(#astragalBrass)" strokeWidth="0.6" opacity="0.8" />
        <circle cx="152" cy="14" r="2.2" fill="url(#astragalBrass)" />
      </svg>
      <span className="mq-ed-dakshin-astragal-rail rail-right" />
    </div>
  );
};

/**
 * Chettinad Heritage Diet Mark:
 * - Veg (Shuddha Saivam): Plantain leaf sprout in Kumbakonam brass ring.
 * - Non-Veg (Asaivam): Traditional heavy bronze Uruli with Tellicherry pepper flame.
 */
export const ChettinadDietMark: React.FC<{
  type?: 'veg' | 'non-veg' | 'vegan';
  className?: string;
}> = ({ type = 'veg', className }) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const label = isVeg ? 'Shuddha Saivam (Vegetarian)' : 'Asaivam (Non-Vegetarian)';

  return (
    <span
      className={['mq-ed-dakshin-diet', isVeg ? 'is-veg' : 'is-non-veg', className]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" focusable="false" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="#ca8a04" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="6.8" fill="none" stroke="#fef08a" strokeWidth="0.5" opacity="0.75" />

        {isVeg ? (
          <g transform="translate(10, 10)">
            <path
              d="M 0 5 C -2 1, -4 -3, -1 -6 C 1 -4, 1 1, 0 5 Z"
              fill="#22c55e"
              stroke="#15803d"
              strokeWidth="0.5"
            />
            <path
              d="M 0 5 C 2 2, 4 -2, 2 -5 C 0 -3, 0 1, 0 5 Z"
              fill="#15803d"
            />
            <circle cx="0" cy="5" r="1" fill="#fef08a" />
          </g>
        ) : (
          <g transform="translate(10, 10)">
            <path
              d="M -5 1 C -4 4, 4 4, 5 1 Z"
              fill="#ca8a04"
              stroke="#854d0e"
              strokeWidth="0.5"
            />
            <line x1="-6" y1="1" x2="6" y2="1" stroke="#fef08a" strokeWidth="0.7" />
            <path
              d="M 0 -5 C -2.5 -2, -3 0, 0 1 C 3 0, 2.5 -2, 0 -5 Z"
              fill="#b91c1c"
              stroke="#f87171"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="-1.5" r="1.2" fill="#eab308" />
          </g>
        )}
      </svg>
    </span>
  );
};

/**
 * Authentic Temple Bell Seal with Tamil Numeral Typography for Course Ordering.
 * (௧ = 1, ௨ = 2, ௩ = 3, ௪ = 4, ௫ = 5, ௬ = 6, ௭ = 7, ௮ = 8, ௯ = 9, ௰ = 10)
 */
export const DakshinCourseMedallion: React.FC<{
  index: number;
  size?: number;
}> = ({ index, size = 52 }) => {
  const tamilNumerals = ['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௰'];
  const numeral = tamilNumerals[index] || String(index + 1);

  return (
    <div className="mq-ed-dakshin-medallion" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="medallionBrass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="25%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="75%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <radialGradient id="medallionTeak" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a2e20" />
            <stop offset="75%" stopColor="#101c13" />
            <stop offset="100%" stopColor="#08100a" />
          </radialGradient>
        </defs>

        {/* Outer Stepped Padma Rim */}
        <circle cx="32" cy="32" r="28" fill="url(#medallionTeak)" stroke="url(#medallionBrass)" strokeWidth="1.4" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="url(#medallionBrass)" strokeWidth="0.6" opacity="0.6" />

        {/* 16 Cast Brass Studs (Mani Beads) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const rad = (i * 22.5 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={32 + 22 * Math.cos(rad)}
              cy={32 + 22 * Math.sin(rad)}
              r="1"
              fill="url(#medallionBrass)"
            />
          );
        })}

        {/* Tamil Numeral Inscription */}
        <text
          x="32"
          y="38.5"
          textAnchor="middle"
          fill="url(#medallionBrass)"
          fontFamily="'Noto Serif Tamil', 'Mukta Malar', var(--mq-font-display, serif)"
          fontSize={numeral.length > 2 ? '15' : '18'}
          fontWeight="700"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.85))' }}
        >
          {numeral}
        </text>
      </svg>
    </div>
  );
};

// =============================================================================
// MAIN EDITION COMPONENT
// =============================================================================

export const DakshinHeritageEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const signatures = useFeatured(categories, 2);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/dakshin-heritage-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-dakshin is-compact' : 'mq-ed mq-ed-dakshin'}>
      {/* =========================================================================
          COVER : Dravidian Temple Gateway & Kuthu Vilakku Cartouche
          ========================================================================= */}
      <header className="mq-ed-dakshin-cover" data-edition-cover="dakshin-heritage">
        {heroImage && (
          <div className="mq-ed-cover-media" aria-hidden="true">
            <SmartImage
              src={heroImage}
              alt=""
              role="hero"
              focal={tokens.cover.focal}
              priority
              aspectRatio={undefined}
            />
          </div>
        )}

        {/* Deep temple teak veil & sacred kolam border */}
        <span className="mq-ed-dakshin-veil" aria-hidden="true" />
        <span className="mq-ed-dakshin-kolam-border" aria-hidden="true" />

        {/* 4 Interlocking Sikku Kolam Threshold Corners */}
        <span className="mq-ed-dakshin-corner corner-tl">
          <PulliKolamCornerBracket position="top-left" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-dakshin-corner corner-tr">
          <PulliKolamCornerBracket position="top-right" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-dakshin-corner corner-bl">
          <PulliKolamCornerBracket position="bottom-left" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-dakshin-corner corner-br">
          <PulliKolamCornerBracket position="bottom-right" size={compact ? 32 : 44} />
        </span>

        <div className="mq-ed-dakshin-cover-body">
          {/* Sacred Heritage Eyebrow Banner */}
          <div className="mq-ed-dakshin-heritage-badge">
            <span aria-hidden="true">🪔</span>
            <span>Vazhai Ilai Virundhu • Flavours of the 5 Southern States</span>
            <span aria-hidden="true">🪔</span>
          </div>

          {/* Kuthu Vilakku Lamp Logo Cartouche */}
          <KuthuvilakkuCartouche size={compact ? 120 : 156}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 72 : 92}
              className="mq-ed-mark-in-cartouche"
            />
          </KuthuvilakkuCartouche>

          {/* Restaurant Title in Kumbakonam Turmeric Foil */}
          <h1 className="mq-ed-dakshin-title mq-ed-dakshin-foil-text">{restaurant.name}</h1>

          {/* Vazhai Ilai Banana Leaf Astragal Divider */}
          <VazhaiIlaiAstragal variant="grand" />

          {/* Tagline / Subtitle */}
          {restaurant.tagline ? (
            <p className="mq-ed-dakshin-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
          ) : (
            <p className="mq-ed-dakshin-tagline">Heirloom Podi Tiffins, Fiery Chettinad Roasts &amp; Kumbakonam Filter Kaapi</p>
          )}

          {/* Category Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="•"
            className="mq-ed-dakshin-teaser"
          />
        </div>

        {/* Contact & Hours */}
        <EditionContact restaurant={restaurant} className="mq-ed-dakshin-contact" separator="·" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span className="mq-ed-noir-announce-bullet">🪔</span>
              {tokens.announcement}
              <span className="mq-ed-noir-announce-bullet">🪔</span>
            </p>
          )}

          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            dietFilter={dietFilter}
            onDietFilterChange={setDietFilter}
            counts={counts}
          />
        </>
      )}

      {/* =========================================================================
          INTERIOR : Plantain Leaf Banquet Plate
          ========================================================================= */}
      <main className="mq-ed-dakshin-plate">
        <div className="mq-ed-dakshin-leaf-banner">
          <span>🌿</span>
          <span>Served on Fresh Plantain Leaves with Stone-Ground Chutneys &amp; Ghee</span>
          <span>🌿</span>
        </div>

        {/* 1. SIGNATURE TIFFIN & ROAST SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-dakshin-showcase" aria-label="Heritage Highlights">
            <div className="mq-ed-dakshin-showcase-header">
              <VazhaiIlaiAstragal />
              <span className="mq-ed-dakshin-section-eyebrow">சிறப்பு தட்டச்சு • Signature Highlights</span>
              <h2 className="mq-ed-dakshin-showcase-title mq-ed-dakshin-foil-text">
                Podi &amp; Ghee Specialities
              </h2>
              <p className="mq-ed-dakshin-showcase-subtitle">
                Slow-roasted on heavy seasoned cast-iron tawas with unrefined cold-pressed sesame oil and A2 cow ghee
              </p>
            </div>

            <div className="mq-ed-dakshin-showcase-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-dakshin-card">
                  {/* Sikku Kolam Corner Accents */}
                  <span className="mq-ed-dakshin-card-bracket bracket-tl">
                    <PulliKolamCornerBracket position="top-left" size={24} />
                  </span>
                  <span className="mq-ed-dakshin-card-bracket bracket-tr">
                    <PulliKolamCornerBracket position="top-right" size={24} />
                  </span>
                  <span className="mq-ed-dakshin-card-bracket bracket-bl">
                    <PulliKolamCornerBracket position="bottom-left" size={24} />
                  </span>
                  <span className="mq-ed-dakshin-card-bracket bracket-br">
                    <PulliKolamCornerBracket position="bottom-right" size={24} />
                  </span>

                  {item.imageUrl && (
                    <div className="mq-ed-dakshin-card-media">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="16 / 10"
                      />
                      <span className="mq-ed-dakshin-card-badge">
                        Heritage Masterpiece {idx === 0 ? '௧' : '௨'}
                      </span>
                    </div>
                  )}

                  <div className="mq-ed-dakshin-card-body">
                    <div className="mq-ed-dakshin-card-head">
                      <div className="mq-ed-dakshin-card-title-group">
                        <ChettinadDietMark type={item.dietType} />
                        <h3 className="mq-ed-dakshin-card-name mq-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-dakshin-card-price-slot">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-dakshin-card-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Authentic Chutney & Podi Accompaniment Ribbon */}
                    <div className="mq-ed-dakshin-pairing-ribbon">
                      <span aria-hidden="true">🌿</span>
                      <span>
                        {idx === 0
                          ? 'Accompanied by: Roasted Chana Podi, Vellore Brinjal Gothsu & Vadai'
                          : 'Accompanied by: Shallot Vatha Kuzhambu, Coconut Thuvaiyal & Ghee'}
                      </span>
                    </div>

                    {/* Culinary Lore Tag */}
                    <p className="mq-ed-dakshin-card-lore">
                      <em>Cast-Iron Tawa Tradition:</em> Cast on vintage century-old iron plates, crisping golden-brown edges with aromatic kariveppilai (curry leaves) &amp; freshly churned butter.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. "VAZHAI ILAI VIRUNDHU" EDITORIAL PLAQUE ASIDE */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-dakshin-virundhu-plaque" aria-label="The Plantain Leaf Banquet Lore">
            <span className="mq-ed-dakshin-plaque-bracket bracket-tl">
              <PulliKolamCornerBracket position="top-left" size={32} />
            </span>
            <span className="mq-ed-dakshin-plaque-bracket bracket-tr">
              <PulliKolamCornerBracket position="top-right" size={32} />
            </span>
            <span className="mq-ed-dakshin-plaque-bracket bracket-bl">
              <PulliKolamCornerBracket position="bottom-left" size={32} />
            </span>
            <span className="mq-ed-dakshin-plaque-bracket bracket-br">
              <PulliKolamCornerBracket position="bottom-right" size={32} />
            </span>

            <span className="mq-ed-dakshin-section-eyebrow">◈ வாழை இலை விருந்து • BANQUET TRADITION ◈</span>
            <h3 className="mq-ed-dakshin-plaque-title mq-ed-dakshin-foil-text">
              The Plantain Leaf Banquet Protocol
            </h3>
            <p className="mq-ed-dakshin-plaque-prose">
              &ldquo;The plantain leaf is laid with its tapered tip pointing towards the guest's heart. As steaming Ponni rice touches the leaf's natural waxy surface, it awakens potent polyphenols and subtle herbal aromas. The meal begins with ghee and stone-ground paruppu, deepens through tamarind-simmered kuzhambu, kindles the digestive fire with pepper-garlic rasam, and concludes with frothy brass-dabarah filter coffee.&rdquo;
            </p>

            <VazhaiIlaiAstragal />

            <div className="mq-ed-dakshin-plaque-pillars">
              <div className="mq-ed-dakshin-plaque-col">
                <h4 className="mq-ed-dakshin-col-title">VOL. I — KAL CHATTI &amp; URULI</h4>
                <p className="mq-ed-dakshin-col-desc">
                  Curries and broths simmered inside soapstone pots (Kal Chatti) and heavy bronze urulis, retaining mineral nutrients and gentle radiant heat.
                </p>
              </div>
              <div className="mq-ed-dakshin-plaque-sep" aria-hidden="true" />
              <div className="mq-ed-dakshin-plaque-col">
                <h4 className="mq-ed-dakshin-col-title">VOL. II — STONE-GROUND PODIS</h4>
                <p className="mq-ed-dakshin-col-desc">
                  Curry leaves, Tellicherry black pepper, roasted lentils, and cold-pressed unrefined gingelly (sesame) oil ground slowly on granite ammi kals.
                </p>
              </div>
            </div>

            <p className="mq-ed-dakshin-plaque-footer">
              🌿 Pure Ghee • Sea Salt • Hand-Roasted Masalas • Zero Preservatives 🌿
            </p>
          </aside>
        )}

        {/* 3. DAKSHIN COURSES WITH TAMIL MEDALLIONS & PRECISION LEADERS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No items found in this category.</p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-dakshin-course"
              aria-labelledby={`mq-ed-dakshin-${category.id}`}
            >
              <div className="mq-ed-dakshin-course-header">
                <GopuramTempleArch size={compact ? 46 : 68} className="mq-ed-dakshin-course-arch" />
                <DakshinCourseMedallion index={catIdx} size={compact ? 42 : 52} />
                <div className="mq-ed-dakshin-course-title-wrap">
                  <span className="mq-ed-dakshin-course-subtitle">
                    பகுதி {['௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯', '௰'][catIdx] || (catIdx + 1)} • Course {catIdx + 1}
                  </span>
                  <h2 id={`mq-ed-dakshin-${category.id}`} className="mq-ed-dakshin-course-title mq-ed-dakshin-foil-text">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="mq-ed-dakshin-course-desc">{category.description}</p>
                )}
                <VazhaiIlaiAstragal className="mq-ed-dakshin-course-divider" />
              </div>

              <div className="mq-ed-dakshin-list">
                {category.items.map((item) => (
                  <article key={item.id} className="mq-ed-dakshin-dish-row">
                    <div className="mq-ed-dakshin-dish-head">
                      <ChettinadDietMark type={item.dietType} />
                      <h3 className="mq-ed-dakshin-dish-name mq-dish-name">{item.name}</h3>
                      <span className="mq-ed-dakshin-dish-rule" aria-hidden="true" />
                      <div className="mq-ed-dakshin-dish-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-dakshin-dish-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Regional Badges & Spiciness */}
                    <div className="mq-ed-dakshin-dish-meta">
                      {item.isBestseller && (
                        <span className="mq-ed-dakshin-tag is-bestseller">
                          🌿 Virundhu Special
                        </span>
                      )}
                      {item.isSpecial && (
                        <span className="mq-ed-dakshin-tag is-special">
                          🪔 Heritage Recipe
                        </span>
                      )}
                      {item.spicyLevel && item.spicyLevel > 1 && (
                        <span className="mq-ed-dakshin-tag is-spice">
                          {'🌶'.repeat(Math.min(item.spicyLevel, 3))} Chettinad Kaaram
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* =========================================================================
          FOOTER & SOUTH INDIAN BRIGADE COLOPHON
          ========================================================================= */}
      <footer className="mq-ed-dakshin-foot">
        <VazhaiIlaiAstragal variant="grand" />
        <p className="mq-ed-dakshin-foot-name mq-ed-dakshin-foil-text">{restaurant.name}</p>
        <p className="mq-ed-dakshin-foot-sub">Vazhai Ilai Virundhu • Traditional South Indian Hospitality</p>

        {/* South Indian Culinary Brigade Colophon */}
        {!compact && (
          <div className="mq-ed-dakshin-brigade-grid">
            <div className="mq-ed-dakshin-brigade-item">
              <span className="mq-ed-dakshin-brigade-title">Pramukha Samayalkar</span>
              <span className="mq-ed-dakshin-brigade-role">Master Chef of the Traditional Kitchen</span>
            </div>
            <div className="mq-ed-dakshin-brigade-item">
              <span className="mq-ed-dakshin-brigade-title">Dosai Ustad</span>
              <span className="mq-ed-dakshin-brigade-role">Artisan of the Fiery Cast-Iron Tawa</span>
            </div>
            <div className="mq-ed-dakshin-brigade-item">
              <span className="mq-ed-dakshin-brigade-title">Rasam &amp; Kuzhambu Vidwan</span>
              <span className="mq-ed-dakshin-brigade-role">Master of Aromatic Stone-Ground Broths</span>
            </div>
            <div className="mq-ed-dakshin-brigade-item">
              <span className="mq-ed-dakshin-brigade-title">Kaapi Ustad</span>
              <span className="mq-ed-dakshin-brigade-role">Degree Filter Coffee Master with Brass Dabarah</span>
            </div>
          </div>
        )}

        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default DakshinHeritageEdition;

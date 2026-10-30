/**
 * MENUQR Signature Edition — Maharaja's Table (Imperial Indian Royal Dining)
 *
 * Modeled after the imperial darbars and private banquet pavilions of the Mughal
 * Emperors and the royal palaces of Rajputana:
 *   - Multifoil cusped 9-arch gateways with keystone lotus kalasa finials
 *   - Imperial Royal Darbar Cartouche with 36 micro-beaded brass pearls & velvet coin bed
 *   - "Shahi Dastarkhwan" grand feast showcase with Dum Pukht culinary lore
 *   - Custom royal brass-ring diet emblems (jade emerald for veg, ruby carnelian for non-veg)
 *   - Precision-aligned radial-gradient brass dotted price leaders
 *   - "The Nawab's Dastarkhwan Protocol" ceremonial banquet plaque
 *   - Imperial Khansama & Bawarchi brigade hierarchy colophon
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

/**
 * Authentic Mughal 9-Cusped Multifoil Arch with Keystone Lotus Finial & Stepped Jambs.
 */
const MultifoilArch: React.FC<{ size?: number; className?: string }> = ({
  size = 110,
  className,
}) => (
  <svg
    viewBox="0 0 140 140"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-maharaja-arch-svg', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="maharajaGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bf953f" />
        <stop offset="25%" stopColor="#fcf6ba" />
        <stop offset="50%" stopColor="#b38728" />
        <stop offset="75%" stopColor="#fbf5b7" />
        <stop offset="100%" stopColor="#8a6117" />
      </linearGradient>
    </defs>

    {/* Kalasa Pinnacle & Lotus Bud Finial */}
    <path
      d="M 70 4 C 67 9, 65 14, 70 18 C 75 14, 73 9, 70 4 Z"
      fill="url(#maharajaGoldFoil)"
    />
    <circle cx="70" cy="20" r="2.5" fill="url(#maharajaGoldFoil)" />

    {/* Primary 9-Cusped Scalloped Outer Arch */}
    <path
      d="M 16 132 L 16 78
         C 16 68, 22 62, 28 64
         C 32 54, 40 50, 48 54
         C 52 44, 60 40, 70 46
         C 80 40, 88 44, 92 54
         C 100 50, 108 54, 112 64
         C 118 62, 124 68, 124 78
         L 124 132"
      fill="none"
      stroke="url(#maharajaGoldFoil)"
      strokeWidth="1.6"
      strokeLinecap="round"
    />

    {/* Secondary Concentric Hairline Cusped Fillet */}
    <path
      d="M 22 132 L 22 80
         C 22 72, 27 68, 32 69
         C 36 61, 43 58, 49 61
         C 54 53, 61 50, 70 54
         C 79 50, 86 53, 91 61
         C 97 58, 104 61, 108 69
         C 113 68, 118 72, 118 80
         L 118 132"
      fill="none"
      stroke="url(#maharajaGoldFoil)"
      strokeWidth="0.65"
      opacity="0.65"
    />

    {/* Scallop Cusp Accent Jewels */}
    {[
      { cx: 28, cy: 64 },
      { cx: 48, cy: 54 },
      { cx: 70, cy: 46 },
      { cx: 92, cy: 54 },
      { cx: 112, cy: 64 },
    ].map((pt, i) => (
      <circle key={i} cx={pt.cx} cy={pt.cy} r="1.5" fill="url(#maharajaGoldFoil)" />
    ))}

    {/* Imperial Arch Horizontal Base Rail */}
    <line x1="10" y1="132" x2="130" y2="132" stroke="url(#maharajaGoldFoil)" strokeWidth="1.2" />
    <line x1="14" y1="135" x2="126" y2="135" stroke="url(#maharajaGoldFoil)" strokeWidth="0.5" opacity="0.6" />
  </svg>
);

/**
 * Authentic Mughal Jaali Fretwork Tile (8-Point Star and Octagonal Interlace).
 */
const JaaliPatternDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }} aria-hidden="true">
    <defs>
      <pattern id="mughalJaaliTile" width="48" height="48" patternUnits="userSpaceOnUse">
        <path
          d="M 24 6 L 29 18 L 42 18 L 32 25 L 36 38 L 24 30 L 12 38 L 16 25 L 6 18 L 19 18 Z"
          fill="none"
          stroke="#d4af37"
          strokeWidth="0.75"
          opacity="0.32"
        />
        <polygon
          points="24,0 48,24 24,48 0,24"
          fill="none"
          stroke="#d4af37"
          strokeWidth="0.6"
          opacity="0.22"
        />
        <line x1="24" y1="0" x2="24" y2="6" stroke="#d4af37" strokeWidth="0.75" opacity="0.3" />
        <line x1="24" y1="38" x2="24" y2="48" stroke="#d4af37" strokeWidth="0.75" opacity="0.3" />
        <line x1="0" y1="24" x2="6" y2="24" stroke="#d4af37" strokeWidth="0.75" opacity="0.3" />
        <line x1="42" y1="24" x2="48" y2="24" stroke="#d4af37" strokeWidth="0.75" opacity="0.3" />
        <circle cx="24" cy="24" r="2.2" fill="#d4af37" opacity="0.25" />
      </pattern>
    </defs>
  </svg>
);

/**
 * Chased Antique Brass Corner Bracket with 3 Stepped Arch Terraces and Raised Dome Rivets.
 */
const RoyalCornerBracket: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className,
}) => (
  <svg
    viewBox="0 0 36 36"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-maharaja-corner-bracket-svg', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="bracketGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#bf953f" />
        <stop offset="50%" stopColor="#fcf6ba" />
        <stop offset="100%" stopColor="#8a6117" />
      </linearGradient>
    </defs>
    <path
      d="M 2 2 L 34 2 L 34 5 L 15 5 L 15 15 L 5 15 L 5 34 L 2 34 Z"
      fill="none"
      stroke="url(#bracketGold)"
      strokeWidth="1.2"
    />
    <path
      d="M 5 5 L 28 5 L 28 8 L 12 8 L 12 20 L 8 20 L 8 28 L 5 28 Z"
      fill="none"
      stroke="url(#bracketGold)"
      strokeWidth="0.5"
      opacity="0.65"
    />
    <circle cx="7" cy="7" r="2.5" fill="url(#bracketGold)" />
    <circle cx="7" cy="7" r="1" fill="#04100b" opacity="0.6" />
  </svg>
);

/**
 * Imperial Royal Darbar Cartouche with 36 Micro-Beaded Brass Pearls,
 * Lotus Kalasa Finial, Flanking Acanthus/Mor-Pankh Wings, and Velvet Coin Bed.
 */
const DarbarLogoCartouche: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 156 }) => (
  <div className="mq-ed-maharaja-cartouche" style={{ width: size, height: size }}>
    <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false" className="mq-ed-maharaja-cartouche-svg">
      <defs>
        <linearGradient id="darbarGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bf953f" />
          <stop offset="25%" stopColor="#fcf6ba" />
          <stop offset="50%" stopColor="#b38728" />
          <stop offset="75%" stopColor="#fbf5b7" />
          <stop offset="100%" stopColor="#8a6117" />
        </linearGradient>
        <radialGradient id="darbarVelvetBed" cx="50%" cy="46%" r="54%">
          <stop offset="0%" stopColor="#0e2a1d" />
          <stop offset="70%" stopColor="#071911" />
          <stop offset="100%" stopColor="#030c08" />
        </radialGradient>
      </defs>

      {/* Lotus Kalasa Pinnacle (Crown at 12 o'clock) */}
      <g transform="translate(80, 10)">
        <path d="M 0 -8 C -4 -2, -7 4, 0 8 C 7 4, 4 -2, 0 -8 Z" fill="url(#darbarGoldFoil)" />
        <path d="M 0 0 C -7 -1, -10 4, -4 7 Z" fill="url(#darbarGoldFoil)" opacity="0.8" />
        <path d="M 0 0 C 7 -1, 10 4, 4 7 Z" fill="url(#darbarGoldFoil)" opacity="0.8" />
        <circle cx="0" cy="10" r="1.8" fill="url(#darbarGoldFoil)" />
      </g>

      {/* Flanking Royal Rajput Winglets / Acanthus Scrolls (3 and 9 o'clock) */}
      <path
        d="M 12 80 C 18 70, 32 72, 28 80 C 32 88, 18 90, 12 80 Z"
        fill="url(#darbarGoldFoil)"
        opacity="0.85"
      />
      <path
        d="M 148 80 C 142 70, 128 72, 132 80 C 128 88, 142 90, 148 80 Z"
        fill="url(#darbarGoldFoil)"
        opacity="0.85"
      />

      {/* Outer Cusped Multifoil Medallion Border */}
      <circle cx="80" cy="80" r="66" fill="none" stroke="url(#darbarGoldFoil)" strokeWidth="1.4" />
      <circle cx="80" cy="80" r="62.5" fill="none" stroke="url(#darbarGoldFoil)" strokeWidth="0.5" opacity="0.6" />

      {/* 36 Micro-Beaded Brass Pearls Ring */}
      <g fill="url(#darbarGoldFoil)" opacity="0.85">
        {Array.from({ length: 36 }).map((_, i) => {
          const rad = (i * 10 * Math.PI) / 180;
          return <circle key={i} cx={80 + 58.5 * Math.cos(rad)} cy={80 + 58.5 * Math.sin(rad)} r="1.15" />;
        })}
      </g>

      {/* Inner Recessed Imperial Velvet Coin Bed */}
      <circle cx="80" cy="80" r="54" fill="url(#darbarVelvetBed)" stroke="url(#darbarGoldFoil)" strokeWidth="1.2" />
      <circle cx="80" cy="80" r="51" fill="none" stroke="url(#darbarGoldFoil)" strokeWidth="0.5" opacity="0.45" />
    </svg>
    <div className="mq-ed-maharaja-cartouche-logo">{children}</div>
  </div>
);

/**
 * Grand Imperial Astragal with 7-Petal Blooming Lotus Bud, Graduated Fluting, and Diamond Rivets.
 */
const ShahiAstragalDivider: React.FC<{
  variant?: 'grand' | 'course';
  className?: string;
}> = ({ variant = 'course', className }) => {
  const isGrand = variant === 'grand';

  return (
    <div
      className={['mq-ed-maharaja-astragal', isGrand ? 'is-grand' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="mq-ed-maharaja-astragal-rail rail-left" />
      <svg
        viewBox="0 0 140 24"
        width={isGrand ? 144 : 108}
        height={isGrand ? 24 : 18}
        focusable="false"
        className="mq-ed-maharaja-astragal-svg"
      >
        <defs>
          <linearGradient id="astragalGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="30%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="70%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#8a6117" />
          </linearGradient>
        </defs>

        {/* Left Triple-Fluted Beaten Brass Bars */}
        <line x1="8" y1="12" x2="52" y2="12" stroke="url(#astragalGold)" strokeWidth="1.2" />
        <line x1="18" y1="8.5" x2="52" y2="8.5" stroke="url(#astragalGold)" strokeWidth="0.6" opacity="0.8" />
        <line x1="18" y1="15.5" x2="52" y2="15.5" stroke="url(#astragalGold)" strokeWidth="0.6" opacity="0.8" />
        <rect x="6" y="12" width="3.5" height="3.5" transform="translate(-1.75,-1.75) rotate(45 6 12)" fill="url(#astragalGold)" />

        {/* Center Blooming Royal Lotus Bud Motif */}
        <g transform="translate(70, 12)">
          <path d="M 0 -8 C -2 -4, -3 2, 0 7 C 3 2, 2 -4, 0 -8 Z" fill="url(#astragalGold)" />
          <path d="M 0 1 C -4 -4, -8 -2, -6 5 C -3 5, -1 3, 0 1 Z" fill="url(#astragalGold)" opacity="0.85" />
          <path d="M 0 3 C -6 2, -10 6, -8 9 C -4 9, -2 6, 0 3 Z" fill="url(#astragalGold)" opacity="0.65" />
          <path d="M 0 1 C 4 -4, 8 -2, 6 5 C 3 5, 1 3, 0 1 Z" fill="url(#astragalGold)" opacity="0.85" />
          <path d="M 0 3 C 6 2, 10 6, 8 9 C 4 9, 2 6, 0 3 Z" fill="url(#astragalGold)" opacity="0.65" />
          <circle cx="0" cy="5" r="1.5" fill="#04100b" />
        </g>

        {/* Right Triple-Fluted Beaten Brass Bars */}
        <line x1="88" y1="12" x2="132" y2="12" stroke="url(#astragalGold)" strokeWidth="1.2" />
        <line x1="88" y1="8.5" x2="122" y2="8.5" stroke="url(#astragalGold)" strokeWidth="0.6" opacity="0.8" />
        <line x1="88" y1="15.5" x2="122" y2="15.5" stroke="url(#astragalGold)" strokeWidth="0.6" opacity="0.8" />
        <rect x="134" y="12" width="3.5" height="3.5" transform="translate(-1.75,-1.75) rotate(45 134 12)" fill="url(#astragalGold)" />
      </svg>
      <span className="mq-ed-maharaja-astragal-rail rail-right" />
    </div>
  );
};

/**
 * Custom Imperial Veg & Non-Veg Brass-Ring Emblems.
 */
const RoyalDietMark: React.FC<{ type?: 'veg' | 'non-veg' | 'vegan'; className?: string }> = ({
  type = 'veg',
  className,
}) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const label = isVeg ? 'Shakahari (Vegetarian)' : 'Mamsahari (Non-Vegetarian)';

  return (
    <span
      className={['mq-ed-royal-diet', isVeg ? 'is-veg' : 'is-non-veg', className]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" focusable="false" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="#d4af37" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="6.8" fill="none" stroke="#fcf6ba" strokeWidth="0.5" opacity="0.65" />
        {isVeg ? (
          <circle cx="10" cy="10" r="3.8" fill="#15803d" stroke="#86efac" strokeWidth="0.6" />
        ) : (
          <polygon points="10,6.2 14,13.2 6,13.2" fill="#b91c1c" stroke="#fca5a5" strokeWidth="0.6" />
        )}
      </svg>
    </span>
  );
};

/**
 * Authentic 12-Foil Cusped Medallion for Course Ordering (Daur I, Daur II...).
 */
const ShahiCourseMedallion: React.FC<{
  index: number;
  size?: number;
}> = ({ index, size = 52 }) => {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][index] || String(index + 1);

  return (
    <div className="mq-ed-maharaja-medallion" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="medallionGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bf953f" />
            <stop offset="25%" stopColor="#fcf6ba" />
            <stop offset="50%" stopColor="#b38728" />
            <stop offset="75%" stopColor="#fbf5b7" />
            <stop offset="100%" stopColor="#8a6117" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="28" fill="#06150e" stroke="url(#medallionGold)" strokeWidth="1.4" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="url(#medallionGold)" strokeWidth="0.6" opacity="0.6" />

        {Array.from({ length: 12 }).map((_, i) => {
          const rad = (i * 30 * Math.PI) / 180;
          return <circle key={i} cx={32 + 22 * Math.cos(rad)} cy={32 + 22 * Math.sin(rad)} r="1" fill="url(#medallionGold)" />;
        })}

        <text
          x="32"
          y="37.5"
          textAnchor="middle"
          fill="url(#medallionGold)"
          fontFamily="var(--mq-font-display, serif)"
          fontSize={roman.length > 2 ? '13' : '15'}
          fontWeight="600"
          letterSpacing="0.06em"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}
        >
          {roman}
        </text>
      </svg>
    </div>
  );
};

export const MaharajaTableEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/maharaja-table-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-maharaja is-compact' : 'mq-ed mq-ed-maharaja'}>
      <JaaliPatternDefs />

      {/* =========================================================================
          COVER : Imperial Mughal Palace Darbar Gateway
          ========================================================================= */}
      <header className="mq-ed-maharaja-cover" data-edition-cover="maharaja-table">
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

        {/* Deep obsidian-emerald veil with royal jaali watermark */}
        <span className="mq-ed-maharaja-veil" aria-hidden="true" />
        <span className="mq-ed-maharaja-arch-frame" aria-hidden="true" />
        <span className="mq-ed-maharaja-jali-watermark" aria-hidden="true" />

        {/* 4 Chased Antique Brass Corner Brackets */}
        <span className="mq-ed-maharaja-corner mq-ed-maharaja-corner-tl"><RoyalCornerBracket size={compact ? 26 : 36} /></span>
        <span className="mq-ed-maharaja-corner mq-ed-maharaja-corner-tr"><RoyalCornerBracket size={compact ? 26 : 36} /></span>
        <span className="mq-ed-maharaja-corner mq-ed-maharaja-corner-bl"><RoyalCornerBracket size={compact ? 26 : 36} /></span>
        <span className="mq-ed-maharaja-corner mq-ed-maharaja-corner-br"><RoyalCornerBracket size={compact ? 26 : 36} /></span>

        <div className="mq-ed-maharaja-cover-body">
          {/* Prestige Sur-Titre Strip */}
          <div className="mq-ed-maharaja-heritage-badge">
            <span aria-hidden="true">⚜</span>
            <span>Shahi Dastarkhwan • Imperial Darbar Feast</span>
            <span aria-hidden="true">⚜</span>
          </div>

          {/* Imperial Royal Darbar Cartouche */}
          <DarbarLogoCartouche size={compact ? 124 : 156}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 78 : 98}
              className="mq-ed-mark-in-cartouche"
            />
          </DarbarLogoCartouche>

          {/* Grand 24K Gold Foil Title */}
          <h1 className="mq-ed-maharaja-title mq-ed-maharaja-foil-text">{restaurant.name}</h1>

          {/* Blooming Lotus Astragal Divider */}
          <ShahiAstragalDivider variant="grand" />

          {/* Tagline / Subtitle */}
          {restaurant.tagline ? (
            <p className="mq-ed-maharaja-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
          ) : (
            <p className="mq-ed-maharaja-tagline">Awadhi &amp; Rajputana Imperial Recipes Since Antiquity</p>
          )}

          {/* Category Teaser Strip */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="❖"
            className="mq-ed-maharaja-teaser"
          />
        </div>

        {/* Colophon & Contact */}
        <EditionContact restaurant={restaurant} className="mq-ed-maharaja-contact" separator="·" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span className="mq-ed-noir-announce-bullet">✦</span>
              {tokens.announcement}
              <span className="mq-ed-noir-announce-bullet">✦</span>
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
          INTERIOR : Shahi Banquet Layout
          ========================================================================= */}
      <main className="mq-ed-maharaja-plate">
        {/* 1. SHAHI KHAS — SIGNATURE SHOWCASE (DUAL-CARD EDITORIAL) */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-maharaja-showcase" aria-label="Royal Highlights">
            <div className="mq-ed-maharaja-showcase-header">
              <ShahiAstragalDivider />
              <span className="mq-ed-maharaja-section-eyebrow">Daur-e-Khaas • Royal Selection</span>
              <h2 className="mq-ed-maharaja-showcase-title mq-ed-maharaja-foil-text">
                Khaas Dastarkhwan
              </h2>
              <p className="mq-ed-maharaja-showcase-subtitle">
                Slow-simmered culinary crown jewels prepared according to ancient royal decrees
              </p>
            </div>

            <div className="mq-ed-maharaja-showcase-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-maharaja-card">
                  {/* Stepped brass corner brackets on showcase cards */}
                  <span className="mq-ed-maharaja-card-bracket bracket-tl"><RoyalCornerBracket size={20} /></span>
                  <span className="mq-ed-maharaja-card-bracket bracket-tr"><RoyalCornerBracket size={20} /></span>
                  <span className="mq-ed-maharaja-card-bracket bracket-bl"><RoyalCornerBracket size={20} /></span>
                  <span className="mq-ed-maharaja-card-bracket bracket-br"><RoyalCornerBracket size={20} /></span>

                  {item.imageUrl && (
                    <div className="mq-ed-maharaja-card-media">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="16 / 10"
                      />
                      <span className="mq-ed-maharaja-card-badge">
                        Royal Service {idx === 0 ? 'I' : 'II'}
                      </span>
                    </div>
                  )}

                  <div className="mq-ed-maharaja-card-body">
                    <div className="mq-ed-maharaja-card-head">
                      <div className="mq-ed-maharaja-card-title-group">
                        <RoyalDietMark type={item.dietType} />
                        <h3 className="mq-ed-maharaja-card-name mq-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-maharaja-card-price-slot">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-maharaja-card-desc mq-dish-desc">{cleanDescription(item)}</p>
                    )}

                    {/* Royal Dum Pukht & Saffron Pairing Ribbon */}
                    <div className="mq-ed-maharaja-pairing-ribbon">
                      <span aria-hidden="true">✦</span>
                      <span>
                        {idx === 0
                          ? 'Paired with: Warqi Sheermal & Burani Garlic Raita'
                          : 'Paired with: Roghani Khameeri Roti & Saffron Rice'}
                      </span>
                    </div>

                    {/* Culinary Lore Tag */}
                    <p className="mq-ed-maharaja-card-lore">
                      <em>Dum Pukht Tradition:</em> Hand-sealed with whole-wheat dough, steeped overnight over fragrant charcoal embers with Kashmiri saffron &amp; damask rose.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. THE NAWAB'S DASTARKHWAN PROTOCOL (EDITORIAL PLAQUE ASIDE) */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-maharaja-dastarkhwan-plaque" aria-label="Imperial Dining Protocol">
            <span className="mq-ed-maharaja-plaque-bracket mq-ed-maharaja-plaque-bracket-tl"><RoyalCornerBracket size={28} /></span>
            <span className="mq-ed-maharaja-plaque-bracket mq-ed-maharaja-plaque-bracket-tr"><RoyalCornerBracket size={28} /></span>
            <span className="mq-ed-maharaja-plaque-bracket mq-ed-maharaja-plaque-bracket-bl"><RoyalCornerBracket size={28} /></span>
            <span className="mq-ed-maharaja-plaque-bracket mq-ed-maharaja-plaque-bracket-br"><RoyalCornerBracket size={28} /></span>

            <span className="mq-ed-maharaja-section-eyebrow">◈ Shahi Protocol &amp; Culinary Ritual ◈</span>
            <h3 className="mq-ed-maharaja-plaque-title mq-ed-maharaja-foil-text">The Grand Imperial Dastarkhwan</h3>
            <p className="mq-ed-maharaja-plaque-prose">
              &ldquo;In the grand courts of Awadh and Rajputana, dining was an elevated spiritual art form. The banquet commenced with the ceremonial hand-washing from a beaten brass Aftaba and Sailabchi, progressed through gentle aromatics and slow-simmered handi gravies, and concluded with silver-leafed royal confections.&rdquo;
            </p>

            <ShahiAstragalDivider />

            <div className="mq-ed-maharaja-plaque-pillars">
              <div className="mq-ed-maharaja-plaque-col">
                <h4 className="mq-ed-maharaja-col-title">VOL. I — DUM PUKHT TRADITION</h4>
                <p className="mq-ed-maharaja-col-desc">Clay and copper pots sealed with hand-kneaded dough, capturing every volatile aromatic vapor over gentle embers.</p>
              </div>
              <div className="mq-ed-maharaja-plaque-sep" aria-hidden="true" />
              <div className="mq-ed-maharaja-plaque-col">
                <h4 className="mq-ed-maharaja-col-title">VOL. II — SHAHI MASALEDAR</h4>
                <p className="mq-ed-maharaja-col-desc">Heirloom potli of 32 botanicals, Kannauj rose attar, stone-ground mace, and royal Kashmiri saffron stigmas.</p>
              </div>
            </div>

            <p className="mq-ed-maharaja-plaque-footer">
              ✦ Imperial Courses • Served Family-Style in Beaten Brass &amp; Kansa ✦
            </p>
          </aside>
        )}

        {/* 3. ROYAL COURSES : DOTTED LEADER ROWS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No dishes found in this category.</p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-maharaja-course"
              aria-labelledby={`mq-ed-royal-${category.id}`}
            >
              <div className="mq-ed-maharaja-course-header">
                <MultifoilArch size={compact ? 44 : 64} className="mq-ed-maharaja-course-arch" />
                <ShahiCourseMedallion index={catIdx} size={compact ? 42 : 52} />
                <div className="mq-ed-maharaja-course-title-wrap">
                  <span className="mq-ed-maharaja-course-subtitle">Daur {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][catIdx] || (catIdx + 1)}</span>
                  <h2 id={`mq-ed-royal-${category.id}`} className="mq-ed-maharaja-course-title mq-ed-maharaja-foil-text">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="mq-ed-maharaja-course-desc">{category.description}</p>
                )}
                <ShahiAstragalDivider className="mq-ed-maharaja-course-divider" />
              </div>

              <div className="mq-ed-maharaja-list">
                {category.items.map((item) => (
                  <article key={item.id} className="mq-ed-maharaja-dish-row">
                    <div className="mq-ed-maharaja-dish-head">
                      <RoyalDietMark type={item.dietType} />
                      <h3 className="mq-ed-maharaja-dish-name mq-dish-name">{item.name}</h3>
                      <span className="mq-ed-maharaja-dish-rule" aria-hidden="true" />
                      <div className="mq-ed-maharaja-dish-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-maharaja-dish-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Regional Tasting Tags & Bestseller Badge */}
                    <div className="mq-ed-maharaja-dish-meta">
                      {item.isBestseller && (
                        <span className="mq-ed-maharaja-tag is-bestseller">
                          ⚜ Khaas Pasand
                        </span>
                      )}
                      {item.isSpecial && (
                        <span className="mq-ed-maharaja-tag is-special">
                          ✦ Royal Recipe
                        </span>
                      )}
                      {item.spicyLevel && item.spicyLevel > 1 && (
                        <span className="mq-ed-maharaja-tag is-spice">
                          {'🌶'.repeat(Math.min(item.spicyLevel, 3))} Shahi Teekha
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
          FOOTER & IMPERIAL BRIGADE COLOPHON
          ========================================================================= */}
      <footer className="mq-ed-maharaja-foot">
        <ShahiAstragalDivider variant="grand" />
        <p className="mq-ed-maharaja-foot-name mq-ed-maharaja-foil-text">{restaurant.name}</p>
        <p className="mq-ed-maharaja-foot-sub">Royal Indian Hospitality &amp; Heirloom Palace Recipes</p>

        {/* Imperial Chef Brigade Hierarchy */}
        {!compact && (
          <div className="mq-ed-maharaja-brigade-grid">
            <div className="mq-ed-maharaja-brigade-item">
              <span className="mq-ed-maharaja-brigade-title">Khansama-e-Aazam</span>
              <span className="mq-ed-maharaja-brigade-role">Master Royal Custodian</span>
            </div>
            <div className="mq-ed-maharaja-brigade-item">
              <span className="mq-ed-maharaja-brigade-title">Bawarchi-e-Khas</span>
              <span className="mq-ed-maharaja-brigade-role">Master of Dum Pukht</span>
            </div>
            <div className="mq-ed-maharaja-brigade-item">
              <span className="mq-ed-maharaja-brigade-title">Ustad-e-Tandoor</span>
              <span className="mq-ed-maharaja-brigade-role">Clay Hearth Sigri Master</span>
            </div>
            <div className="mq-ed-maharaja-brigade-item">
              <span className="mq-ed-maharaja-brigade-title">Halwai-e-Shahi</span>
              <span className="mq-ed-maharaja-brigade-role">Imperial Confections</span>
            </div>
          </div>
        )}

        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default MaharajaTableEdition;

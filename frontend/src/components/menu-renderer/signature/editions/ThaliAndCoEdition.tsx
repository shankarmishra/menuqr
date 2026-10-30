/**
 * MENUQR Signature Edition — Thali & Co. (Modern Indian Regional Bhojanalaya Masterpiece)
 *
 * Inspired by the royal dining traditions of Rajasthan, Gujarat, and Awadh:
 *   - Burnished Kansa (Bell Metal bronze: 78% copper, 22% tin) overhead 12-katori circular cartouche
 *   - Intricate Sanganeri & Bagru wooden block-print floral corner brackets
 *   - Sacred Ayurvedic Shadrasa (षड्रस — The 6 Sacred Tastes) wheel astragal divider
 *   - Kansa bell metal diet seals (Saatvik tulsi leaf vs Rajasik earthen ember)
 *   - Scalloped bronze katori course medallions with Devanagari numerals (१, २, ३, ४, ५...)
 *   - "Kansa & Shadrasa: The Healing Science of Vedic Dining" editorial aside plaque
 *   - Traditional Bhojanalaya Kitchen Brigade Colophon (Pradhan Bawarchi, Maharaj-e-Mithai, etc.)
 *   - Precision last-baseline anchored radial dotted leader rows with ₹ pricing
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
// VECTOR ASSETS & ARCHITECTURAL ORNAMENTS (Pure inline SVG, zero external dependencies)
// =============================================================================

/**
 * Authentic Overhead Kansa (Bell Metal Bronze) 12-Katori Platter Cartouche.
 * Features central rice medallion, 12 radiating katoris, and 24 hand-beaten brass rivets.
 */
export const KansaThaliCartouche: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 156 }) => {
  const katoriCount = 12;
  const katoris = Array.from({ length: katoriCount }, (_, i) => {
    const rad = (i * 30 * Math.PI) / 180;
    return {
      cx: 80 + 55 * Math.cos(rad),
      cy: 80 + 55 * Math.sin(rad),
    };
  });

  const rivetCount = 24;
  const rivets = Array.from({ length: rivetCount }, (_, i) => {
    const rad = (i * 15 * Math.PI) / 180;
    return {
      cx: 80 + 72 * Math.cos(rad),
      cy: 80 + 72 * Math.sin(rad),
    };
  });

  return (
    <div className="mq-ed-thali-cartouche" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        aria-hidden="true"
        focusable="false"
        className="mq-ed-thali-cartouche-svg"
      >
        <defs>
          <linearGradient id="kansaBronzeFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae8b4" />
            <stop offset="25%" stopColor="#d4a359" />
            <stop offset="50%" stopColor="#b8860b" />
            <stop offset="75%" stopColor="#fae8b4" />
            <stop offset="100%" stopColor="#784a1a" />
          </linearGradient>
          <radialGradient id="kansaPlateBed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c1a12" />
            <stop offset="65%" stopColor="#1e110b" />
            <stop offset="100%" stopColor="#120906" />
          </radialGradient>
          <radialGradient id="katoriGlow" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#d4a359" />
            <stop offset="70%" stopColor="#8b5a2b" />
            <stop offset="100%" stopColor="#452611" />
          </radialGradient>
        </defs>

        {/* Outer Fluted Kansa Bronze Rim with Beaten Lip */}
        <circle cx="80" cy="80" r="76" fill="url(#kansaPlateBed)" stroke="url(#kansaBronzeFoil)" strokeWidth="2.5" />
        <circle cx="80" cy="80" r="68" fill="none" stroke="url(#kansaBronzeFoil)" strokeWidth="0.8" opacity="0.6" />

        {/* 24 Hand-Stamped Brass Rivets around Thali Perimeter */}
        <g fill="url(#kansaBronzeFoil)">
          {rivets.map((pt, i) => (
            <circle key={i} cx={pt.cx} cy={pt.cy} r="1.3" />
          ))}
        </g>

        {/* 12 Radiating Bronze Katoris (Curry Bowls) */}
        {katoris.map((pt, i) => (
          <g key={i}>
            <circle cx={pt.cx} cy={pt.cy} r="10" fill="url(#katoriGlow)" stroke="url(#kansaBronzeFoil)" strokeWidth="1" />
            <circle cx={pt.cx} cy={pt.cy} r="7.5" fill="#1e110b" opacity="0.75" />
            <circle cx={pt.cx} cy={pt.cy} r="2" fill="url(#kansaBronzeFoil)" opacity="0.9" />
          </g>
        ))}

        {/* Central Lotus Rice Platter Ring */}
        <circle cx="80" cy="80" r="42" fill="url(#kansaPlateBed)" stroke="url(#kansaBronzeFoil)" strokeWidth="1.5" />
        <circle cx="80" cy="80" r="38.5" fill="none" stroke="url(#kansaBronzeFoil)" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.7" />
      </svg>
      <div className="mq-ed-thali-cartouche-logo">{children}</div>
    </div>
  );
};

/**
 * Hand-Carved Sanganeri Wooden Block-Print Corner Bracket (Marigold & Cypress Motif).
 */
export const SanganeriBlockPrintBracket: React.FC<{
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
      className={`mq-ed-thali-bracket is-${position}`}
      style={{ transformOrigin: '32px 32px', transform: rotationMap[position] }}
    >
      <defs>
        <linearGradient id="blockPrintTerracotta" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b85334" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
      </defs>

      {/* Stepped Block-Print Corner Framework */}
      <path
        d="M 4 4 L 56 4 L 56 8 L 8 8 L 8 56 L 4 56 Z"
        fill="url(#blockPrintTerracotta)"
        opacity="0.85"
      />
      <path
        d="M 8 8 L 48 8 L 48 11 L 11 11 L 11 48 L 8 48 Z"
        fill="#f59e0b"
        opacity="0.5"
      />

      {/* Four-Petal Sanganeri Marigold Bloom */}
      <g transform="translate(24, 24)">
        <circle cx="0" cy="0" r="3" fill="#fbbf24" />
        {/* Top Petal */}
        <path d="M -3 -3 C -5 -9, 5 -9, 3 -3 Z" fill="url(#blockPrintTerracotta)" />
        {/* Bottom Petal */}
        <path d="M -3 3 C -5 9, 5 9, 3 3 Z" fill="url(#blockPrintTerracotta)" />
        {/* Left Petal */}
        <path d="M -3 -3 C -9 -5, -9 5, -3 3 Z" fill="url(#blockPrintTerracotta)" />
        {/* Right Petal */}
        <path d="M 3 -3 C 9 -5, 9 5, 3 3 Z" fill="url(#blockPrintTerracotta)" />
      </g>

      {/* Flanking Cypress Tree of Life Tendril */}
      <path
        d="M 40 14 C 44 18, 44 26, 38 30 C 34 33, 28 32, 28 38"
        fill="none"
        stroke="#d97706"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="44" cy="22" r="1.5" fill="#f59e0b" />
      <circle cx="34" cy="36" r="1.5" fill="#b85334" />

      {/* Corner Marigold Stud */}
      <circle cx="6" cy="6" r="2.2" fill="#d97706" />
      <circle cx="6" cy="6" r="1" fill="#fef08a" />
    </svg>
  );
};

/**
 * Sacred Ayurvedic Shadrasa (षड्रस — 6 Tastes) Wheel Astragal Divider.
 * Features central 6-spoke taste lotus, flanked by fluted bronze rails and carved block-print studs.
 */
export const ShadrasaWheelAstragal: React.FC<{
  variant?: 'grand' | 'course';
  className?: string;
}> = ({ variant = 'course', className }) => {
  const isGrand = variant === 'grand';

  return (
    <div
      className={['mq-ed-thali-astragal', isGrand ? 'is-grand' : '', className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="mq-ed-thali-astragal-rail rail-left" />
      <svg
        viewBox="0 0 160 28"
        width={isGrand ? 164 : 124}
        height={isGrand ? 28 : 22}
        focusable="false"
        className="mq-ed-thali-astragal-svg"
      >
        <defs>
          <linearGradient id="astragalKansa" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="30%" stopColor="#fae8b4" />
            <stop offset="50%" stopColor="#d4a359" />
            <stop offset="70%" stopColor="#fae8b4" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
        </defs>

        {/* Left Bronze Rails */}
        <line x1="8" y1="14" x2="52" y2="14" stroke="url(#astragalKansa)" strokeWidth="1.2" />
        <line x1="16" y1="10.5" x2="52" y2="10.5" stroke="url(#astragalKansa)" strokeWidth="0.6" opacity="0.8" />
        <line x1="16" y1="17.5" x2="52" y2="17.5" stroke="url(#astragalKansa)" strokeWidth="0.6" opacity="0.8" />
        <circle cx="8" cy="14" r="2.2" fill="url(#astragalKansa)" />

        {/* Central 6-Petal Shadrasa Mandala (The 6 Sacred Ayurvedic Tastes) */}
        <g transform="translate(80, 14)">
          <circle cx="0" cy="0" r="11" fill="#2c1a12" stroke="url(#astragalKansa)" strokeWidth="1.2" />
          {/* 6 Radiating Lotus Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-5"
              rx="2.2"
              ry="4"
              fill={i % 2 === 0 ? '#b85334' : '#d4a359'}
              transform={`rotate(${angle} 0 0)`}
            />
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#fae8b4" />
        </g>

        {/* Right Bronze Rails */}
        <line x1="108" y1="14" x2="152" y2="14" stroke="url(#astragalKansa)" strokeWidth="1.2" />
        <line x1="108" y1="10.5" x2="144" y2="10.5" stroke="url(#astragalKansa)" strokeWidth="0.6" opacity="0.8" />
        <line x1="108" y1="17.5" x2="144" y2="17.5" stroke="url(#astragalKansa)" strokeWidth="0.6" opacity="0.8" />
        <circle cx="152" cy="14" r="2.2" fill="url(#astragalKansa)" />
      </svg>
      <span className="mq-ed-thali-astragal-rail rail-right" />
    </div>
  );
};

/**
 * Kansa Heritage Diet Mark:
 * - Saatvik / Veg: Hammered Kansa bronze katori with fresh green tulsi sprout.
 * - Rajasik / Non-Veg: Terracotta handi with burning spice ember.
 */
export const KansaDietMark: React.FC<{
  type?: 'veg' | 'non-veg' | 'vegan';
  className?: string;
}> = ({ type = 'veg', className }) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const label = isVeg ? 'Saatvik Bhojan (Vegetarian)' : 'Rajasik Bhojan (Non-Vegetarian)';

  return (
    <span
      className={['mq-ed-thali-diet', isVeg ? 'is-veg' : 'is-non-veg', className]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 20 20" width="16" height="16" focusable="false" aria-hidden="true">
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="#b8860b" strokeWidth="1.2" />
        <circle cx="10" cy="10" r="6.8" fill="none" stroke="#fae8b4" strokeWidth="0.5" opacity="0.75" />

        {isVeg ? (
          <g transform="translate(10, 10)">
            <path
              d="M 0 5 C -2.5 1, -4 -3, -1 -6 C 1 -4, 1 1, 0 5 Z"
              fill="#16a34a"
              stroke="#15803d"
              strokeWidth="0.5"
            />
            <path
              d="M 0 5 C 2.5 2, 4 -2, 2 -5 C 0 -3, 0 1, 0 5 Z"
              fill="#15803d"
            />
            <circle cx="0" cy="5" r="1" fill="#fae8b4" />
          </g>
        ) : (
          <g transform="translate(10, 10)">
            <path
              d="M -5 1 C -4 4, 4 4, 5 1 Z"
              fill="#b85334"
              stroke="#7c2d12"
              strokeWidth="0.5"
            />
            <line x1="-6" y1="1" x2="6" y2="1" stroke="#fae8b4" strokeWidth="0.7" />
            <path
              d="M 0 -5 C -2.5 -2, -3 0, 0 1 C 3 0, 2.5 -2, 0 -5 Z"
              fill="#dc2626"
              stroke="#f87171"
              strokeWidth="0.5"
            />
            <circle cx="0" cy="-1.5" r="1.2" fill="#fbbf24" />
          </g>
        )}
      </svg>
    </span>
  );
};

/**
 * Scalloped Bronze Katori Medallion with Devanagari Numeral Typography for Course Ordering.
 * (१ = 1, २ = 2, ३ = 3, ४ = 4, ५ = 5, ६ = 6, ७ = 7, ८ = 8, ९ = 9, १० = 10)
 */
export const BhojanalayaCourseMedallion: React.FC<{
  index: number;
  size?: number;
}> = ({ index, size = 52 }) => {
  const devanagariNumerals = ['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'];
  const numeral = devanagariNumerals[index] || String(index + 1);

  return (
    <div className="mq-ed-thali-medallion" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={size} height={size} focusable="false">
        <defs>
          <linearGradient id="medallionKansa" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae8b4" />
            <stop offset="25%" stopColor="#d4a359" />
            <stop offset="50%" stopColor="#b8860b" />
            <stop offset="75%" stopColor="#fae8b4" />
            <stop offset="100%" stopColor="#784a1a" />
          </linearGradient>
          <radialGradient id="medallionBed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c1a12" />
            <stop offset="75%" stopColor="#1e110b" />
            <stop offset="100%" stopColor="#100805" />
          </radialGradient>
        </defs>

        {/* Outer Scalloped Katori Rim */}
        <circle cx="32" cy="32" r="28" fill="url(#medallionBed)" stroke="url(#medallionKansa)" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="25" fill="none" stroke="url(#medallionKansa)" strokeWidth="0.6" strokeDasharray="3 1.5" opacity="0.65" />

        {/* 12 Cast Brass Studs */}
        {Array.from({ length: 12 }).map((_, i) => {
          const rad = (i * 30 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={32 + 22 * Math.cos(rad)}
              cy={32 + 22 * Math.sin(rad)}
              r="1"
              fill="url(#medallionKansa)"
            />
          );
        })}

        {/* Devanagari Numeral Inscription */}
        <text
          x="32"
          y="39.5"
          textAnchor="middle"
          fill="url(#medallionKansa)"
          fontFamily="'Rozha One', 'Yatra One', 'Cinzel', serif"
          fontSize={numeral.length > 2 ? '16' : '20'}
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

export const ThaliAndCoEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);
  const signatures = useFeatured(categories, 2);
  const sections = liveCategories(visible);

  const heroImage = tokens.cover.imageUrl || '/assets/themes/thali-and-co-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-thali is-compact' : 'mq-ed mq-ed-thali'}>
      {/* =========================================================================
          COVER : Artisanal Regional Thali Gateway
          ========================================================================= */}
      <header className="mq-ed-thali-cover" data-edition-cover="thali-and-co">
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

        {/* Deep roasted terracotta & evening spices scrim */}
        <span className="mq-ed-thali-veil" aria-hidden="true" />
        <span className="mq-ed-thali-jaal-border" aria-hidden="true" />

        {/* 4 Handcrafted Sanganeri Wooden Block-Print Corner Brackets */}
        <span className="mq-ed-thali-corner corner-tl">
          <SanganeriBlockPrintBracket position="top-left" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-thali-corner corner-tr">
          <SanganeriBlockPrintBracket position="top-right" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-thali-corner corner-bl">
          <SanganeriBlockPrintBracket position="bottom-left" size={compact ? 32 : 44} />
        </span>
        <span className="mq-ed-thali-corner corner-br">
          <SanganeriBlockPrintBracket position="bottom-right" size={compact ? 32 : 44} />
        </span>

        <div className="mq-ed-thali-cover-body">
          {/* Heritage Regional Eyebrow Banner */}
          <div className="mq-ed-thali-heritage-badge">
            <span aria-hidden="true">🏺</span>
            <span>विरासत थाली • Curated Regional Feasts from the 28 States</span>
            <span aria-hidden="true">🏺</span>
          </div>

          {/* 12-Katori Overhead Kansa Platter Cartouche */}
          <KansaThaliCartouche size={compact ? 120 : 156}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 72 : 92}
              className="mq-ed-mark-in-cartouche"
            />
          </KansaThaliCartouche>

          {/* Restaurant Title with Burnished Kansa Bronze Foil */}
          <h1 className="mq-ed-thali-title mq-ed-thali-foil-text">{restaurant.name}</h1>

          {/* Sacred Ayurvedic Shadrasa Wheel Divider */}
          <ShadrasaWheelAstragal variant="grand" />

          {/* Tagline / Subtitle */}
          {restaurant.tagline ? (
            <p className="mq-ed-thali-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
          ) : (
            <p className="mq-ed-thali-tagline">Artisanal Grand Thalis, Earthen Hearth Breads &amp; Vedic Shadrasa Dining</p>
          )}

          {/* Category Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="◈"
            className="mq-ed-thali-teaser"
          />
        </div>

        {/* Contact & Hours */}
        <EditionContact restaurant={restaurant} className="mq-ed-thali-contact" separator="·" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noir-announce" role="note">
              <span className="mq-ed-noir-announce-bullet">🏺</span>
              {tokens.announcement}
              <span className="mq-ed-noir-announce-bullet">🏺</span>
            </p>
          )}

          <MenuToolbar
            query={query}
            onQueryChange={setQuery}
            dietFilter={dietFilter}
            onDietFilterChange={setDietFilter}
            counts={counts}
            allergenFilter={allergenFilter}
            onAllergenFilterChange={setAllergenFilter}
            spiceFilter={spiceFilter}
            onSpiceFilterChange={setSpiceFilter}
          />
        </>
      )}

      {/* =========================================================================
          INTERIOR : Regional Platter Layout
          ========================================================================= */}
      <main className="mq-ed-thali-plate">
        {/* Anatomy of an Indian Thali: Sacred Shadrasa Banner */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-thali-anatomy-banner" aria-label="Thali Tradition">
            <div className="mq-ed-thali-anatomy-head">
              <span className="mq-ed-thali-section-eyebrow">◈ षड्रस • AYURVEDIC GASTRONOMY ◈</span>
              <h3 className="mq-ed-thali-anatomy-title">The Grand Thali Experience • The 6 Sacred Tastes</h3>
              <p className="mq-ed-thali-anatomy-desc">
                Every thali is composed in harmonic balance across the 6 Ayurvedic tastes (Shadrasa) to nourish mind, body, and digestion:
              </p>
            </div>
            <div className="mq-ed-thali-anatomy-tags">
              <span className="mq-ed-thali-state-pill">
                <strong>मधुर (Sweet)</strong> • Energy &amp; Grounding
              </span>
              <span className="mq-ed-thali-state-pill">
                <strong>अम्ल (Sour)</strong> • Digestive Fire
              </span>
              <span className="mq-ed-thali-state-pill">
                <strong>लवण (Salty)</strong> • Mineral Absorption
              </span>
              <span className="mq-ed-thali-state-pill">
                <strong>कटु (Pungent)</strong> • Circulation &amp; Warmth
              </span>
              <span className="mq-ed-thali-state-pill">
                <strong>तिक्त (Bitter)</strong> • Natural Cleansing
              </span>
              <span className="mq-ed-thali-state-pill">
                <strong>कषाय (Astringent)</strong> • Cooling Harmony
              </span>
            </div>
          </aside>
        )}

        {/* 1. SIGNATURE THALIS SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-thali-showcase" aria-label="Thali Highlights">
            <div className="mq-ed-thali-showcase-header">
              <ShadrasaWheelAstragal />
              <span className="mq-ed-thali-section-eyebrow">शाही थाली • Signature Platters</span>
              <h2 className="mq-ed-thali-showcase-title mq-ed-thali-foil-text">
                Maharaja&rsquo;s Royal Bhojan
              </h2>
              <p className="mq-ed-thali-showcase-subtitle">
                Served on pure burnished Kansa bell metal platters, accompanied by stone-churned butter, raw pickles, and puffed hearth breads
              </p>
            </div>

            <div className="mq-ed-thali-showcase-grid">
              {signatures.map((item, idx) => (
                <article key={item.id} className="mq-ed-thali-card">
                  {/* Sanganeri Block-Print Corner Accents */}
                  <span className="mq-ed-thali-card-bracket bracket-tl">
                    <SanganeriBlockPrintBracket position="top-left" size={24} />
                  </span>
                  <span className="mq-ed-thali-card-bracket bracket-tr">
                    <SanganeriBlockPrintBracket position="top-right" size={24} />
                  </span>
                  <span className="mq-ed-thali-card-bracket bracket-bl">
                    <SanganeriBlockPrintBracket position="bottom-left" size={24} />
                  </span>
                  <span className="mq-ed-thali-card-bracket bracket-br">
                    <SanganeriBlockPrintBracket position="bottom-right" size={24} />
                  </span>

                  {item.imageUrl && (
                    <div className="mq-ed-thali-card-media">
                      <SmartImage
                        src={item.imageUrl}
                        alt={item.name}
                        role="card"
                        focal={item.focal}
                        aspectRatio="16 / 10"
                      />
                      <span className="mq-ed-thali-card-badge">
                        Royal Platter {idx === 0 ? '१' : '२'}
                      </span>
                    </div>
                  )}

                  <div className="mq-ed-thali-card-body">
                    <div className="mq-ed-thali-card-head">
                      <div className="mq-ed-thali-card-title-group">
                        <KansaDietMark type={item.dietType} />
                        <h3 className="mq-ed-thali-card-name mq-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-thali-card-price-slot">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-thali-card-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Katori Ensemble Pairing Ribbon */}
                    <div className="mq-ed-thali-pairing-ribbon">
                      <span aria-hidden="true">🏺</span>
                      <span>
                        {idx === 0
                          ? '12-Katori Ensemble: Dal Baati Churma, Gatte ki Sabzi, Ker Sangri & Malpua'
                          : '12-Katori Ensemble: Gujarati Kadhi, Sev Tameta, Ringna No Oro & Shrikhand'}
                      </span>
                    </div>

                    {/* Ayurvedic Kansa Lore Tag */}
                    <p className="mq-ed-thali-card-lore">
                      <em>Kansa Bell Metal Benefit:</em> Handcrafted from 78% Copper &amp; 22% Tin alloy. Naturally alkalizes food, balances the tridoshas, and retains thermal purity.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. "KANSA & SHADRASA" EDITORIAL ASIDE PLAQUE */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-thali-vedic-plaque" aria-label="The Science of Kansa and Shadrasa">
            <span className="mq-ed-thali-plaque-bracket bracket-tl">
              <SanganeriBlockPrintBracket position="top-left" size={32} />
            </span>
            <span className="mq-ed-thali-plaque-bracket bracket-tr">
              <SanganeriBlockPrintBracket position="top-right" size={32} />
            </span>
            <span className="mq-ed-thali-plaque-bracket bracket-bl">
              <SanganeriBlockPrintBracket position="bottom-left" size={32} />
            </span>
            <span className="mq-ed-thali-plaque-bracket bracket-br">
              <SanganeriBlockPrintBracket position="bottom-right" size={32} />
            </span>

            <span className="mq-ed-thali-section-eyebrow">◈ कांस्य पात्र भोजनम् • VEDIC DINING SCIENCE ◈</span>
            <h3 className="mq-ed-thali-plaque-title mq-ed-thali-foil-text">
              Kansa &amp; Shadrasa: The Healing Bhojan
            </h3>
            <p className="mq-ed-thali-plaque-prose">
              &ldquo;In the ancient Ayurvedic texts of Charaka Samhita, eating from a burnished Kansa (Bell Metal) platter is revered as an act of therapeutic healing. The alloy of copper and tin naturally balances acidity, purifies blood circulation, and enhances intellect. A true Indian feast is consumed in harmony with the clock: awakening the tongue with pungent radishes and salt, savoring rich dal and vegetables in the center, and concluding with cooling curd and sweet halwa to seal the digestive fire.&rdquo;
            </p>

            <ShadrasaWheelAstragal />

            <div className="mq-ed-thali-plaque-pillars">
              <div className="mq-ed-thali-plaque-col">
                <h4 className="mq-ed-thali-col-title">VOL. I — ALCHEMICAL KANSA</h4>
                <p className="mq-ed-thali-col-desc">
                  Hand-hammered bell metal retains vital minerals and neutralizes harsh acid compounds, preserving the wholesome prana of every slow-simmered curry.
                </p>
              </div>
              <div className="mq-ed-thali-plaque-sep" aria-hidden="true" />
              <div className="mq-ed-thali-plaque-col">
                <h4 className="mq-ed-thali-col-title">VOL. II — SHADRASA ORDERING</h4>
                <p className="mq-ed-thali-col-desc">
                  Arranged clockwise from left to right: salt, lemon, chutneys, lentils, dry vegetables, gravies, rice, breads, and ending with desi ghee sweets.
                </p>
              </div>
            </div>

            <p className="mq-ed-thali-plaque-footer">
              🏺 A2 Cow Ghee • Cold-Pressed Mustard Oil • Himalayan Rock Salt • Hand-Pounded Spices 🏺
            </p>
          </aside>
        )}

        {/* 3. REGIONAL COURSES WITH DEVANAGARI MEDALLIONS & PRECISION LEADERS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">No items found in this section.</p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-thali-course"
              aria-labelledby={`mq-ed-thali-${category.id}`}
            >
              <div className="mq-ed-thali-course-header">
                <BhojanalayaCourseMedallion index={catIdx} size={compact ? 42 : 52} />
                <div className="mq-ed-thali-course-title-wrap">
                  <span className="mq-ed-thali-course-subtitle">
                    विरासत थाली • भाग {['१', '२', '३', '४', '५', '६', '७', '८', '९', '१०'][catIdx] || (catIdx + 1)} • Course {catIdx + 1}
                  </span>
                  <h2 id={`mq-ed-thali-${category.id}`} className="mq-ed-thali-course-title mq-ed-thali-foil-text">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="mq-ed-thali-course-desc">{category.description}</p>
                )}
                <ShadrasaWheelAstragal className="mq-ed-thali-course-divider" />
              </div>

              <div className="mq-ed-thali-list">
                {category.items.map((item) => (
                  <article key={item.id} className="mq-ed-thali-dish-row">
                    <div className="mq-ed-thali-dish-head">
                      <KansaDietMark type={item.dietType} />
                      <h3 className="mq-ed-thali-dish-name mq-dish-name">{item.name}</h3>
                      <span className="mq-ed-thali-dish-rule" aria-hidden="true" />
                      <div className="mq-ed-thali-dish-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-ed-thali-dish-desc mq-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Regional Badges & Spiciness */}
                    <div className="mq-ed-thali-dish-meta">
                      {item.isBestseller && (
                        <span className="mq-ed-thali-tag is-bestseller">
                          🏺 Bhojan Special
                        </span>
                      )}
                      {item.isSpecial && (
                        <span className="mq-ed-thali-tag is-special">
                          👑 Royal Recipe
                        </span>
                      )}
                      {item.spicyLevel && item.spicyLevel > 1 && (
                        <span className="mq-ed-thali-tag is-spice">
                          {'🌶'.repeat(Math.min(item.spicyLevel, 3))} Shahi Kaaram
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
          FOOTER & BHOJANALAYA KITCHEN BRIGADE COLOPHON
          ========================================================================= */}
      <footer className="mq-ed-thali-foot">
        <ShadrasaWheelAstragal variant="grand" />
        <p className="mq-ed-thali-foot-name mq-ed-thali-foil-text">{restaurant.name}</p>
        <p className="mq-ed-thali-foot-sub">Shadrasa • The Sacred Six Tastes of Indian Regional Cuisine</p>

        {/* Traditional Bhojanalaya Culinary Brigade Hierarchy */}
        {!compact && (
          <div className="mq-ed-thali-brigade-grid">
            <div className="mq-ed-thali-brigade-item">
              <span className="mq-ed-thali-brigade-title">Pradhan Bawarchi</span>
              <span className="mq-ed-thali-brigade-role">Grand Master of the Royal Kitchen &amp; Heirloom Masalas</span>
            </div>
            <div className="mq-ed-thali-brigade-item">
              <span className="mq-ed-thali-brigade-title">Maharaj-e-Mithai</span>
              <span className="mq-ed-thali-brigade-role">Artisan of Pure Desi Ghee Halwas &amp; Confections</span>
            </div>
            <div className="mq-ed-thali-brigade-item">
              <span className="mq-ed-thali-brigade-title">Ustad-e-Chulha</span>
              <span className="mq-ed-thali-brigade-role">Master of Hand-Stretched Earthen Hearth Phulkas</span>
            </div>
            <div className="mq-ed-thali-brigade-item">
              <span className="mq-ed-thali-brigade-title">Rasoi-e-Katori</span>
              <span className="mq-ed-thali-brigade-role">Steward of 12-Flavour Balance &amp; Kansa Service</span>
            </div>
          </div>
        )}

        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default ThaliAndCoEdition;

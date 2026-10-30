/**
 * MENUQR Signature Edition — Atelier Pastel (Haute Pâtisserie & Salon de Thé Masterpiece)
 *
 * Inspired by the legendary culinary institutions of Paris:
 *   - The gilded Belle Époque tea salons of Rue Royale (Ladurée 1862) & Rue de Rivoli (Angelina 1903)
 *   - Modern architectural haute pâtisserie ateliers of Saint-Germain-des-Prés & Place Vendôme
 *   - Scalloped Belle Époque wrought-iron vitrine archway with Madagascar vanilla orchids
 *   - Refined French Fleur-de-Lys & vanilla flower garland divider astragals
 *   - Bordeaux fluted copper canelé mold course medallions (I, II, III, IV, V...)
 *   - Handcrafted French Rococo ribbon scrollwork corner brackets
 *   - French tea sommelier pairings & confectionery dietary seals (Végétarien, Végétalien, Sans Gluten)
 *   - Dual Signature Haute Pâtisserie Showcase (Millefeuille Inversé 729 Couches & Entremet Ispahan)
 *   - Storytelling Manifesto: "Le Manifeste de l'Atelier : L'Art du Feuilletage & du Salon de Thé"
 *   - Master Haute Pâtisserie Kitchen Brigade Colophon (Chef Pâtissier Exécutif, Chef Boulanger-Tourrier, etc.)
 *   - Precision last-baseline micro-pearl radial gold dotted leader rows
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
import './editions-b.css';

// =============================================================================
// BESPOKE CULTURAL VECTOR SVG MOTIFS
// =============================================================================

/**
 * Parisian Belle Époque Patisserie Arch Cartouche.
 * Features a grand scalloped vitrine archway, Madagascar vanilla orchid keystone,
 * concentric filigree pearls, and gold-leaf brackets housing the brand monogram.
 */
export const PatisserieArchCartouche: React.FC<{
  children?: React.ReactNode;
  size?: number;
  className?: string;
}> = ({ children, size = 160, className }) => {
  return (
    <div
      className={['mq-ed-pastel-arch-cartouche', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size * 1.22 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 244"
        width="100%"
        height="100%"
        focusable="false"
        className="mq-ed-pastel-cartouche-svg"
      >
        <defs>
          <linearGradient id="pastelGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="pastelPorcelainBack" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fffdf9" />
            <stop offset="100%" stopColor="#f7f3eb" />
          </linearGradient>
          <filter id="pastelDropGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2d4a3e" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Outer Parisian Belle Époque Arch with Scalloped Crest */}
        <path
          d="M 28 236 L 28 92 C 28 44, 60 14, 100 14 C 140 14, 172 44, 172 92 L 172 236 Z"
          fill="url(#pastelPorcelainBack)"
          stroke="url(#pastelGoldFoil)"
          strokeWidth="2.5"
          filter="url(#pastelDropGlow)"
        />

        {/* Inner Hairline Fillet with Scalloped Crown Radii */}
        <path
          d="M 36 230 L 36 94 C 36 50, 64 22, 100 22 C 136 22, 164 50, 164 94 L 164 230 Z"
          fill="none"
          stroke="url(#pastelGoldFoil)"
          strokeWidth="0.9"
          strokeDasharray="4 2.5"
        />

        {/* Scalloped Arch Crest Pearls (11 Beads around the Tympanum) */}
        {[0, 18, 36, 54, 72, 90, 108, 126, 144, 162, 180].map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 100 - 78 * Math.cos(rad);
          const cy = 92 - 78 * Math.sin(rad);
          return (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r="2.8"
              fill="url(#pastelGoldFoil)"
              stroke="#2d4a3e"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Center Vanilla Flower Orchid Blossom at Keystone */}
        <g transform="translate(100, 14)">
          <path d="M 0 -2 C -4 -12, 4 -12, 0 -2" fill="#fdf2f4" stroke="url(#pastelGoldFoil)" strokeWidth="0.8" />
          <path d="M -2 0 C -12 -5, -10 5, -2 2" fill="#fffdf9" stroke="url(#pastelGoldFoil)" strokeWidth="0.8" />
          <path d="M 2 0 C 12 -5, 10 5, 2 2" fill="#fffdf9" stroke="url(#pastelGoldFoil)" strokeWidth="0.8" />
          <path d="M -1 2 C -8 11, -2 13, 0 3" fill="#e8f4ee" stroke="url(#pastelGoldFoil)" strokeWidth="0.8" />
          <path d="M 1 2 C 8 11, 2 13, 0 3" fill="#e8f4ee" stroke="url(#pastelGoldFoil)" strokeWidth="0.8" />
          <path d="M -2 3 Q -18 8 -24 24" fill="none" stroke="#2d4a3e" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 2 3 Q 18 8 24 24" fill="none" stroke="#2d4a3e" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="1" r="2.2" fill="url(#pastelGoldFoil)" />
        </g>

        {/* Rococo Ribbon Tie at Lower Base Corner Plinths */}
        <path d="M 16 236 L 40 236 M 160 236 L 184 236" stroke="url(#pastelGoldFoil)" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="22" y="232" width="12" height="6" rx="2" fill="#2d4a3e" />
        <rect x="166" y="232" width="12" height="6" rx="2" fill="#2d4a3e" />
      </svg>
      <div className="mq-ed-pastel-cartouche-content">{children}</div>
    </div>
  );
};

/**
 * Refined French Ribbon Garland with Centered Vanilla Orchid Astragal.
 */
export const FleurDeLysOrchidAstragal: React.FC<{
  className?: string;
  width?: number | string;
}> = ({ className, width = 240 }) => (
  <div
    className={['mq-ed-pastel-astragal', className].filter(Boolean).join(' ')}
    style={{ width, height: typeof width === 'number' ? (width * 32) / 240 : 32 }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 240 32" width="100%" height="100%" focusable="false">
      <defs>
        <linearGradient id="astragalGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
          <stop offset="25%" stopColor="#d4af37" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#d4af37" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal Hairlines with Bead Terminals */}
      <line x1="8" y1="16" x2="88" y2="16" stroke="url(#astragalGold)" strokeWidth="1" />
      <line x1="152" y1="16" x2="232" y2="16" stroke="url(#astragalGold)" strokeWidth="1" />
      <line x1="30" y1="13" x2="84" y2="13" stroke="#2d4a3e" strokeWidth="0.5" strokeDasharray="3 2" />
      <line x1="156" y1="13" x2="210" y2="13" stroke="#2d4a3e" strokeWidth="0.5" strokeDasharray="3 2" />

      {/* Ribbon Loops */}
      <path d="M 78 16 C 88 8, 96 22, 106 16" fill="none" stroke="url(#astragalGold)" strokeWidth="1.2" />
      <path d="M 162 16 C 152 8, 144 22, 134 16" fill="none" stroke="url(#astragalGold)" strokeWidth="1.2" />

      {/* Centered Vanilla Orchid Blossom */}
      <g transform="translate(120, 16)">
        <path d="M 0 0 C -4 -9, 4 -9, 0 0" fill="#fdf2f4" stroke="#d4af37" strokeWidth="0.8" />
        <path d="M 0 0 C -9 -3, -9 5, 0 2" fill="#fffdf9" stroke="#d4af37" strokeWidth="0.8" />
        <path d="M 0 0 C 9 -3, 9 5, 0 2" fill="#fffdf9" stroke="#d4af37" strokeWidth="0.8" />
        <path d="M 0 0 C -6 8, -2 10, 0 2" fill="#e8f4ee" stroke="#2d4a3e" strokeWidth="0.7" />
        <path d="M 0 0 C 6 8, 2 10, 0 2" fill="#e8f4ee" stroke="#2d4a3e" strokeWidth="0.7" />
        <path d="M -1 0 C -12 6, -20 3, -26 8" fill="none" stroke="#2d4a3e" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M 1 0 C 12 6, 20 3, 26 8" fill="none" stroke="#2d4a3e" strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="0" cy="1" r="2" fill="#d4af37" />
        <circle cx="0" cy="1" r="0.8" fill="#132a21" />
      </g>
    </svg>
  </div>
);

/**
 * Fluted Bordeaux Canelé Pastry Mold Course Medallion with Roman Numerals.
 */
export const CaneleCourseMedallion: React.FC<{
  index: number;
  size?: number;
}> = ({ index, size = 52 }) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  const roman = romanNumerals[index] || `${index + 1}`;

  return (
    <div
      className="mq-ed-pastel-canele-medallion"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" width="100%" height="100%" focusable="false">
        <defs>
          <linearGradient id="caneleGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="80%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <radialGradient id="caneleCore" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2d4a3e" />
            <stop offset="85%" stopColor="#132a21" />
            <stop offset="100%" stopColor="#0a1712" />
          </radialGradient>
        </defs>

        {/* 12-Fluted Canelé Mold Silhouette Contour */}
        <circle cx="32" cy="32" r="28" fill="#132a21" stroke="url(#caneleGold)" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="23" fill="url(#caneleCore)" stroke="url(#caneleGold)" strokeWidth="0.8" />
        <circle cx="32" cy="32" r="20" fill="none" stroke="#e8f4ee" strokeWidth="0.5" strokeDasharray="2.5 1.5" opacity="0.6" />

        {/* 12 Fluted Indentation Rays */}
        {Array.from({ length: 12 }, (_, i) => {
          const rad = (i * 30 * Math.PI) / 180;
          return (
            <line
              key={i}
              x1={32 + 23 * Math.cos(rad)}
              y1={32 + 23 * Math.sin(rad)}
              x2={32 + 27.5 * Math.cos(rad)}
              y2={32 + 27.5 * Math.sin(rad)}
              stroke="url(#caneleGold)"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          );
        })}

        {/* Hot-Stamped Gold Roman Numeral */}
        <text
          x="32"
          y="37"
          textAnchor="middle"
          fill="url(#caneleGold)"
          fontFamily="var(--mq-font-display, 'Playfair Display', Georgia, serif)"
          fontSize={roman.length > 2 ? '13' : '15'}
          fontWeight="600"
          letterSpacing="0.06em"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.7))' }}
        >
          {roman}
        </text>
      </svg>
    </div>
  );
};

/**
 * Delicate French Rococo Ribbon Corner Filigree.
 */
export const RococoCornerFiligree: React.FC<{
  size?: number;
  className?: string;
}> = ({ size = 32, className }) => (
  <svg
    viewBox="0 0 40 40"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
    className={['mq-ed-pastel-rococo-corner', className].filter(Boolean).join(' ')}
  >
    <defs>
      <linearGradient id="rococoGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#d4af37" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    <path
      d="M 3 36 C 3 16, 16 3, 36 3"
      fill="none"
      stroke="url(#rococoGold)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M 7 36 C 7 20, 20 7, 36 7"
      fill="none"
      stroke="#2d4a3e"
      strokeWidth="0.6"
      strokeDasharray="2 2"
      opacity="0.75"
    />
    <path
      d="M 12 12 C 16 8, 22 9, 20 14 C 18 19, 10 16, 12 12 Z"
      fill="#fdf2f4"
      stroke="url(#rococoGold)"
      strokeWidth="0.8"
    />
    <path
      d="M 4 24 C 2 18, 8 16, 11 19 C 13 22, 8 26, 4 24 Z"
      fill="#e8f4ee"
      stroke="#2d4a3e"
      strokeWidth="0.6"
    />
    <path
      d="M 24 4 C 18 2, 16 8, 19 11 C 22 13, 26 8, 24 4 Z"
      fill="#e8f4ee"
      stroke="#2d4a3e"
      strokeWidth="0.6"
    />
    <circle cx="5" cy="5" r="2.2" fill="url(#rococoGold)" />
    <circle cx="5" cy="5" r="4" fill="none" stroke="url(#rococoGold)" strokeWidth="0.5" opacity="0.6" />
  </svg>
);

/**
 * Artisanal French Confectionery Dietary Badges.
 */
export const PastelDietBadge: React.FC<{
  type?: 'veg' | 'vegan' | 'gluten-free' | 'halal' | 'signature';
}> = ({ type }) => {
  if (type === 'veg') {
    return (
      <span className="mq-pastel-badge-diet mq-pastel-veg" title="Végétarien">
        <span className="mq-pastel-badge-dot">❦</span> Végétarien
      </span>
    );
  }
  if (type === 'vegan') {
    return (
      <span className="mq-pastel-badge-diet mq-pastel-vegan" title="Végétalien Pur">
        <span className="mq-pastel-badge-dot">🌱</span> Végétalien
      </span>
    );
  }
  if (type === 'gluten-free') {
    return (
      <span className="mq-pastel-badge-diet mq-pastel-gf" title="Sans Gluten">
        <span className="mq-pastel-badge-dot">🌾</span> Sans Gluten
      </span>
    );
  }
  if (type === 'signature') {
    return (
      <span className="mq-pastel-badge-diet mq-pastel-signature" title="Création de la Maison">
        <span className="mq-pastel-badge-dot">★</span> Maison
      </span>
    );
  }
  return null;
};

// =============================================================================
// STORYTELLING ASIDE PLAQUE
// =============================================================================

export const AtelierPastelManifestoPlaque: React.FC = () => (
  <aside className="mq-ed-pastel-manifesto" aria-label="Manifeste de l'Atelier">
    <span className="mq-ed-pastel-plaque-bracket tl"><RococoCornerFiligree size={36} /></span>
    <span className="mq-ed-pastel-plaque-bracket tr"><RococoCornerFiligree size={36} /></span>
    <span className="mq-ed-pastel-plaque-bracket bl"><RococoCornerFiligree size={36} /></span>
    <span className="mq-ed-pastel-plaque-bracket br"><RococoCornerFiligree size={36} /></span>

    <div className="mq-ed-pastel-manifesto-inner">
      <div className="mq-ed-pastel-manifesto-header">
        <span className="mq-ed-pastel-prestige-pip">❦</span>
        <span className="mq-ed-pastel-surtitle">HAUTE PÂTISSERIE &amp; SALON DE THÉ PARIS</span>
        <span className="mq-ed-pastel-prestige-pip">❦</span>
      </div>

      <h3 className="mq-ed-pastel-manifesto-title">
        Le Manifeste de l'Atelier : L'Art du Feuilletage &amp; du Salon de Thé
      </h3>

      <FleurDeLysOrchidAstragal width={260} className="mq-ed-pastel-manifesto-astragal" />

      <p className="mq-ed-pastel-manifesto-lead">
        Dans le silence de notre laboratoire avant l&apos;aurore, la haute pâtisserie se fait architecture
        et recueillement. Chaque création honore les lois séculaires de la gourmandise française.
      </p>

      {/* The 3 Pillars Grid */}
      <div className="mq-ed-pastel-pillars-grid">
        <div className="mq-ed-pastel-pillar-card">
          <div className="mq-ed-pastel-pillar-icon">🧈</div>
          <h4 className="mq-ed-pastel-pillar-name">Les 729 Couches de Tourage</h4>
          <p className="mq-ed-pastel-pillar-desc">
            Dans le <em>feuilletage inversé</em>, la détrempe est emprisonnée dans un beurre de tourage
            AOP Charentes-Poitou à 84% de matière grasse. Six tours successifs élèvent la pâte à exactement
            729 feuillets microscopiques pour un croustillant sans égal.
          </p>
        </div>

        <div className="mq-ed-pastel-pillar-sep" aria-hidden="true">❦</div>

        <div className="mq-ed-pastel-pillar-card">
          <div className="mq-ed-pastel-pillar-icon">🌿</div>
          <h4 className="mq-ed-pastel-pillar-name">Extraction Froide 48 Heures</h4>
          <p className="mq-ed-pastel-pillar-desc">
            Nos gousses entières de vanille Bourbon de Madagascar et de Tahiti sont fendues à la main puis infusées
            à froid durant 48 heures dans la crème fleurette de Normandie. Cette patience libère la totalité
            des vanillines et notes boisées sans altération thermique.
          </p>
        </div>

        <div className="mq-ed-pastel-pillar-sep" aria-hidden="true">❦</div>

        <div className="mq-ed-pastel-pillar-card">
          <div className="mq-ed-pastel-pillar-icon">🫖</div>
          <h4 className="mq-ed-pastel-pillar-name">Le Rituel du Salon de Thé</h4>
          <p className="mq-ed-pastel-pillar-desc">
            L&apos;esprit des grands salons parisiens de la Belle Époque : théières en argent poli maintenues
            à 85°C, porcelaine de Limoges fine et ballotins gaufrés au ruban de soie noué main pour
            prolonger l&apos;émotion sucrée.
          </p>
        </div>
      </div>

      {/* Guarantee Seals Badges */}
      <div className="mq-ed-pastel-manifesto-tags">
        <span className="mq-ed-pastel-manifesto-tag">Beurre de Tourage Charentes-Poitou AOP</span>
        <span className="mq-ed-pastel-pip-dot">·</span>
        <span className="mq-ed-pastel-manifesto-tag">Gousses de Vanille Bourbon Givrée</span>
        <span className="mq-ed-pastel-pip-dot">·</span>
        <span className="mq-ed-pastel-manifesto-tag">Farine de Meule de Pierre T65</span>
        <span className="mq-ed-pastel-pip-dot">·</span>
        <span className="mq-ed-pastel-manifesto-tag">Pétales de Rose de Grasse</span>
      </div>
    </div>
  </aside>
);

// =============================================================================
// HAUTE PÂTISSERIE BRIGADE COLOPHON
// =============================================================================

export const AtelierPastelColophon: React.FC<{
  restaurant: EditionProps['restaurant'];
}> = ({ restaurant }) => (
  <footer className="mq-ed-pastel-foot">
    <span className="mq-ed-pastel-scallop mq-ed-pastel-scallop-up" aria-hidden="true" />

    {/* Center Astragal */}
    <FleurDeLysOrchidAstragal width={280} className="mq-ed-pastel-foot-astragal" />

    {/* Embossed Parisian Guarantee Medallion */}
    <div className="mq-ed-pastel-guarantee-seal" aria-hidden="true">
      <svg viewBox="0 0 120 120" width="88" height="88">
        <defs>
          <radialGradient id="sealGold" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="#2d4a3e" stroke="url(#sealGold)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="48" fill="none" stroke="url(#sealGold)" strokeWidth="0.8" strokeDasharray="3 2" />
        <path id="curveSeal" d="M 22 60 A 38 38 0 1 1 98 60 A 38 38 0 1 1 22 60" fill="none" />
        <text fill="url(#sealGold)" fontSize="7" fontWeight="600" letterSpacing="0.14em">
          <textPath href="#curveSeal" startOffset="50%" textAnchor="middle">
            • HAUTE PÂTISSERIE FRANÇAISE • SALON DE THÉ D&apos;EXCEPTION
          </textPath>
        </text>
        <g transform="translate(60, 60)">
          <path d="M 0 -12 L 3 -3 L 12 0 L 3 3 L 0 12 L -3 3 L -12 0 L -3 -3 Z" fill="url(#sealGold)" />
        </g>
      </svg>
    </div>

    <p className="mq-ed-pastel-foot-name">{restaurant.name}</p>
    <p className="mq-ed-pastel-foot-sub">Haute Pâtisserie, Viennoiserie &amp; Salon de Thé Paris</p>

    {/* 4 Master Brigade Officers */}
    <div className="mq-ed-pastel-brigade-grid">
      <div className="mq-ed-pastel-brigade-item">
        <span className="mq-ed-pastel-brigade-title">Chef Pâtissier Exécutif</span>
        <span className="mq-ed-pastel-brigade-role">Maître des Entremets &amp; Créations Architecturales</span>
      </div>
      <div className="mq-ed-pastel-brigade-item">
        <span className="mq-ed-pastel-brigade-title">Chef Boulanger-Tourrier</span>
        <span className="mq-ed-pastel-brigade-role">Maître du Levain Naturel &amp; Feuilletage Inversé</span>
      </div>
      <div className="mq-ed-pastel-brigade-item">
        <span className="mq-ed-pastel-brigade-title">Chocolatier-Confiseur</span>
        <span className="mq-ed-pastel-brigade-role">Artisan des Grands Crus Valrhona &amp; Ganaches Noires</span>
      </div>
      <div className="mq-ed-pastel-brigade-item">
        <span className="mq-ed-pastel-brigade-title">Maître Sommelier du Thé</span>
        <span className="mq-ed-pastel-brigade-role">Sélectionneur de Thés Rares &amp; Infusions Botaniques</span>
      </div>
    </div>

    <EditionContact restaurant={restaurant} />

    {/* Regulatory, Butter Provenance & Tea Brewing Disclosures */}
    <div className="mq-ed-pastel-disclosures">
      <p className="mq-ed-pastel-disclosure-line">
        <strong>Service et taxes compris.</strong> Tous nos prix sont nets en monnaie légale.
      </p>
      <p className="mq-ed-pastel-disclosure-line">
        Toutes nos créations sont confectionnées au jour le jour au sein de notre atelier avec des matières
        premières d&apos;origine certifiée (Beurres AOP, Chocolats Valrhona, Farines de tradition française sans additif).
      </p>
      <p className="mq-ed-pastel-disclosure-line">
        Nos thés et infusions d&apos;origine sont infusés à l&apos;eau de source pure à température contrôlée (80°C - 95°C).
      </p>
    </div>

    {/* Finial Lozenge */}
    <div className="mq-ed-pastel-finial" aria-hidden="true">
      <span className="mq-ed-pastel-finial-bar" />
      <span className="mq-ed-pastel-finial-lozenge">❦</span>
      <span className="mq-ed-pastel-finial-bar" />
    </div>
  </footer>
);

// =============================================================================
// MAIN EDITION COMPONENT
// =============================================================================

export const AtelierPastelEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const {
    query,
    setQuery,
    dietFilter,
    setDietFilter,
    counts,
    visible,
    hasQuery,
    allergenFilter,
    setAllergenFilter,
    spiceFilter,
    setSpiceFilter,
  } = useMenuFilters(categories);

  const sections = liveCategories(visible);
  const featured = useFeatured(categories, 2);
  const heroSrc =
    tokens.cover.imageUrl ||
    featured[0]?.imageUrl ||
    '/assets/themes/atelier-pastel-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-pastel is-compact' : 'mq-ed mq-ed-pastel'}>
      {/* =========================================================================
          COVER HEADER: BELLE ÉPOQUE VITRINE & SCALLOPED ARCH WINDOW
          ========================================================================= */}
      <header className="mq-ed-pastel-cover" data-edition-cover="atelier-pastel">
        <div className="mq-ed-pastel-prestige-strip">
          <span className="mq-ed-pastel-prestige-star">❦</span>
          <span>HAUTE PÂTISSERIE • SALON DE THÉ • PARIS</span>
          <span className="mq-ed-pastel-prestige-star">❦</span>
        </div>

        {/* Arch Window containing 8K Haute Pâtisserie Photography */}
        <div className="mq-ed-pastel-arch">
          {heroSrc ? (
            <SmartImage
              src={heroSrc}
              alt={restaurant.name}
              role="hero"
              focal={tokens.cover.imageUrl ? tokens.cover.focal : featured[0]?.focal}
              priority
              aspectRatio="var(--mq-aspect-portrait)"
            />
          ) : (
            <span className="mq-ed-pastel-arch-empty" aria-hidden="true" />
          )}
          <span className="mq-ed-pastel-arch-ring" aria-hidden="true" />
        </div>

        {/* Brand Identity & Monogram Cartouche */}
        <div className="mq-ed-pastel-cover-body">
          <PatisserieArchCartouche size={compact ? 130 : 165}>
            <BrandMark
              restaurant={restaurant}
              size={compact ? 48 : 64}
              className="mq-ed-mark-in-cartouche"
            />
          </PatisserieArchCartouche>

          {restaurant.cuisine ? (
            <p className="mq-ed-pastel-cuisine">{restaurant.cuisine}</p>
          ) : (
            <p className="mq-ed-pastel-cuisine">Haute Pâtisserie &amp; Salon de Thé</p>
          )}

          <h1 className="mq-ed-pastel-title">{restaurant.name}</h1>

          <FleurDeLysOrchidAstragal width={compact ? 200 : 250} className="mq-ed-pastel-hero-astragal" />

          {restaurant.tagline ? (
            <p className="mq-ed-pastel-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
          ) : (
            <p className="mq-ed-pastel-tagline">
              Créations d&apos;Auteur, Tourage au Beurre AOP &amp; Grands Thés d&apos;Origine
            </p>
          )}

          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="❦"
            className="mq-ed-pastel-teaser"
          />

          <EditionContact restaurant={restaurant} className="mq-ed-pastel-contact" separator="•" />
        </div>

        {/* Scalloped decorative border separator */}
        <span className="mq-ed-pastel-scallop" aria-hidden="true" />
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-pastel-announce" role="note">
              <span className="mq-ed-pastel-announce-bullet">❦</span>
              {tokens.announcement}
              <span className="mq-ed-pastel-announce-bullet">❦</span>
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
          DUAL SIGNATURE SHOWCASE (MILLEFEUILLE INVERSÉ & ISPAHAN ENTREMET)
          ========================================================================= */}
      {!compact && !hasQuery && (
        <section className="mq-ed-pastel-showcase-section" aria-label="Créations Signatures de la Maison">
          <div className="mq-ed-pastel-showcase-heading">
            <span className="mq-ed-pastel-showcase-pre">LA SÉLECTION DE NOTRE MAÎTRE PÂTISSIER</span>
            <h2 className="mq-ed-pastel-showcase-title">Créations Architecturales &amp; Entremets d&apos;Art</h2>
            <FleurDeLysOrchidAstragal width={220} className="mq-ed-pastel-showcase-astragal" />
          </div>

          <div className="mq-ed-pastel-curation-grid">
            {/* Signature 1: Millefeuille Inversé Vanille Bourbon */}
            <article className="mq-ed-pastel-curation-card">
              <span className="mq-ed-pastel-card-corner tl"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner tr"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner bl"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner br"><RococoCornerFiligree size={30} /></span>

              <div className="mq-ed-pastel-card-media-wrapper">
                <SmartImage
                  src={heroSrc}
                  alt="Millefeuille Inversé Vanille Bourbon"
                  role="card"
                  aspectRatio="16 / 10"
                  priority
                />
                <span className="mq-ed-pastel-card-badge">Création Signature I</span>
              </div>

              <div className="mq-ed-pastel-card-info">
                <div className="mq-ed-pastel-card-header">
                  <div className="mq-ed-pastel-card-identity">
                    <PastelDietBadge type="veg" />
                    <h3 className="mq-dish-name mq-ed-pastel-card-name">Millefeuille Inversé Vanille Bourbon</h3>
                  </div>
                  <div className="mq-ed-pastel-card-price-slot">
                    <span className="mq-price mq-pastel-price-pill">18,50 €</span>
                  </div>
                </div>

                <p className="mq-dish-desc mq-ed-pastel-card-desc">
                  Feuilletage inversé aux 729 couches croustillantes au beurre de Charentes-Poitou AOP,
                  crème diplomate aérée à la vanille bourbon de Madagascar givrée, caramel blond
                  à la fleur de sel de Guérande et éclats d&apos;or pur 24 carats.
                </p>

                {/* Tea Pairing Ribbon */}
                <div className="mq-ed-pastel-tea-ribbon">
                  <div className="mq-ed-pastel-tea-tag">
                    <span className="mq-ed-pastel-tea-icon">🫖</span>
                    <span className="mq-ed-pastel-tea-label">Rituel du Salon • Accord Thé</span>
                    <span className="mq-ed-pastel-tea-origin">Oolong Dong Ding 1998</span>
                  </div>
                  <p className="mq-ed-pastel-tea-text">
                    Notes miellées et boisées de châtaigne grillée prolongeant la rondeur de la vanille givrée.
                  </p>
                </div>
              </div>
            </article>

            {/* Signature 2: Ispahan Rose, Framboise & Litchi */}
            <article className="mq-ed-pastel-curation-card">
              <span className="mq-ed-pastel-card-corner tl"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner tr"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner bl"><RococoCornerFiligree size={30} /></span>
              <span className="mq-ed-pastel-card-corner br"><RococoCornerFiligree size={30} /></span>

              <div className="mq-ed-pastel-card-media-wrapper">
                <SmartImage
                  src={heroSrc}
                  alt="Ispahan Rose, Framboise & Litchi Macaron Entremet"
                  role="card"
                  aspectRatio="16 / 10"
                />
                <span className="mq-ed-pastel-card-badge">Création Signature II</span>
              </div>

              <div className="mq-ed-pastel-card-info">
                <div className="mq-ed-pastel-card-header">
                  <div className="mq-ed-pastel-card-identity">
                    <PastelDietBadge type="gluten-free" />
                    <h3 className="mq-dish-name mq-ed-pastel-card-name">
                      Ispahan Rose, Framboise &amp; Litchi Entremet
                    </h3>
                  </div>
                  <div className="mq-ed-pastel-card-price-slot">
                    <span className="mq-price mq-pastel-price-pill">19,00 €</span>
                  </div>
                </div>

                <p className="mq-dish-desc mq-ed-pastel-card-desc">
                  Coque macaron soufflée aux amandes douces de Provence, crème mousseline parfumée
                  aux pétales de rose de Grasse, framboises fraîches sauvages et compotée translucide de litchis de Madagascar.
                </p>

                {/* Tea Pairing Ribbon */}
                <div className="mq-ed-pastel-tea-ribbon">
                  <div className="mq-ed-pastel-tea-tag">
                    <span className="mq-ed-pastel-tea-icon">🫖</span>
                    <span className="mq-ed-pastel-tea-label">Rituel du Salon • Accord Infusion</span>
                    <span className="mq-ed-pastel-tea-origin">Thé Blanc Pai Mu Tan Imperial</span>
                  </div>
                  <p className="mq-ed-pastel-tea-text">
                    Infusion florale aux boutons de pivoine et bergamote fraîche sublimant l&apos;essence de rose.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* =========================================================================
          STORYTELLING ASIDE PLAQUE
          ========================================================================= */}
      {!compact && !hasQuery && <AtelierPastelManifestoPlaque />}

      {/* =========================================================================
          COURSES & CATEGORIES BODY
          ========================================================================= */}
      <main className="mq-ed-pastel-body">
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">Ce menu ne contient aucun dessert pour l&apos;instant.</p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-pastel-section"
              aria-labelledby={`mq-ed-pastel-${category.id}`}
            >
              {/* Category Header with Fluted Canelé Medallion */}
              <div className="mq-ed-pastel-section-header">
                <CaneleCourseMedallion index={catIdx} size={48} />
                <div className="mq-ed-pastel-section-title-wrap">
                  <h2 id={`mq-ed-pastel-${category.id}`} className="mq-ed-pastel-section-title">
                    {category.name}
                  </h2>
                  <FleurDeLysOrchidAstragal width={180} className="mq-ed-pastel-section-astragal" />
                </div>
              </div>

              {category.description && (
                <p className="mq-ed-pastel-section-note">{category.description}</p>
              )}

              {/* Items List with Precision Dotted Leaders */}
              <div className="mq-ed-pastel-items-list">
                {category.items.map((item) => (
                  <article key={item.id} className="mq-ed-pastel-dish-row">
                    <div className="mq-ed-pastel-dish-top">
                      <div className="mq-ed-pastel-dish-identity">
                        {item.dietType === 'veg' && <PastelDietBadge type="veg" />}
                        {item.dietType === 'vegan' && <PastelDietBadge type="vegan" />}
                        {item.isBestseller && <PastelDietBadge type="signature" />}
                        <h3 className="mq-dish-name mq-ed-pastel-dish-title">{item.name}</h3>
                      </div>

                      {/* Precision Last-Baseline Radial Dotted Leader Rule */}
                      <span className="mq-ed-leader-rule" aria-hidden="true" />

                      <div className="mq-ed-pastel-dish-price-wrap">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {/* Dish Description with Strict Invariant */}
                    {item.description && (
                      <p className="mq-dish-desc mq-ed-pastel-dish-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    {/* Meta badges (bestseller, special, trending) */}
                    {(item.isBestseller || item.isSpecial || item.trending) ? (
                      <div className="mq-ed-pastel-dish-meta">
                        {item.isBestseller && (
                          <span className="mq-ed-pastel-allergen-pill">
                            ★ Maison Bestseller
                          </span>
                        )}
                        {item.isSpecial && (
                          <span className="mq-ed-pastel-tag-pill">
                            ❦ Spécialité du Chef
                          </span>
                        )}
                        {item.trending && (
                          <span className="mq-ed-pastel-allergen-pill">
                            ✦ Favori du Moment
                          </span>
                        )}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* =========================================================================
          HAUTE PÂTISSERIE BRIGADE COLOPHON
          ========================================================================= */}
      <AtelierPastelColophon restaurant={restaurant} />
    </div>
  );
};

export default AtelierPastelEdition;

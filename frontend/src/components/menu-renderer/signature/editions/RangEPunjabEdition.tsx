/**
 * MENUQR Signature Edition — Rang-e-Punjab (Grand Highway Dhaba & Royal Punjabi Dining)
 *
 * Inspired by the legendary roadside dhabas of the Grand Trunk Road (NH 1) and the
 * heritage culinary traditions of undivided Punjab:
 *   - Authentic Phulkari geometric stepped-diamond silk embroidery vectors
 *   - Hammered Peetal (brass) Degchi logo cartouche with 28 hand-stamped rivets
 *   - NH 1 Grand Trunk Road yellow-and-white milestone heritage tablet
 *   - "Bhatthi Da Swaad" sizzling tandoor feast showcase with charcoal ember shaders
 *   - Earthen clay & beaten-brass diet seals (Mint emerald for Veg, Clay crimson for Non-Veg)
 *   - "Sanjha Chulha Te Grand Trunk Road" cultural lore aside plaque
 *   - Dhaba Ustad & Bawarchi culinary brigade hierarchy colophon
 *   - Precision last-baseline dotted leaders with saffron brass bead leaders
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
 * Geometric Phulkari Silk-Thread Corner Bracket.
 * Inspired by Punjab's traditional darning-stitch Bagh ("garden") embroidery.
 */
const PhulkariCornerBracket: React.FC<{
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
}> = ({ position, size = 48 }) => {
  const rotationMap = {
    'top-left': 'rotate(0)',
    'top-right': 'rotate(90)',
    'bottom-right': 'rotate(180)',
    'bottom-left': 'rotate(270)',
  };

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={`mq-ed-punjab-phulkari-corner is-${position}`}
      style={{ transformOrigin: '32px 32px', transform: rotationMap[position] }}
    >
      <defs>
        <linearGradient id="phulkariSaffron" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="phulkariCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>

      {/* Stepped corner outer border */}
      <path
        d="M 4 4 L 60 4 L 60 12 L 12 12 L 12 60 L 4 60 Z"
        fill="url(#phulkariCrimson)"
        opacity="0.9"
      />
      {/* Secondary golden zigzag running stitch */}
      <polyline
        points="16,16 24,8 32,16 40,8 48,16 56,8"
        fill="none"
        stroke="url(#phulkariSaffron)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="16,16 8,24 16,32 8,40 16,48 8,56"
        fill="none"
        stroke="url(#phulkariSaffron)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central diamond lozenges */}
      <polygon points="28,28 36,20 44,28 36,36" fill="#fef3c7" stroke="#b45309" strokeWidth="1.2" />
      <polygon points="20,36 28,28 36,36 28,44" fill="url(#phulkariCrimson)" />
      <polygon points="36,36 44,28 52,36 44,44" fill="url(#phulkariSaffron)" />
      <circle cx="36" cy="28" r="2" fill="#dc2626" />
      <circle cx="28" cy="36" r="2" fill="#fef3c7" />
      <circle cx="44" cy="36" r="2" fill="#991b1b" />
    </svg>
  );
};

/**
 * Hammered Brass (Peetal) Degchi Logo Cartouche.
 * Modeled after slow-simmering handis and degchis with 28 stamped brass rivets.
 */
const DegchiLogoCartouche: React.FC<{
  restaurant: { name: string; logoUrl?: string };
  size?: number;
}> = ({ restaurant, size = 104 }) => {
  const rivetCount = 24;
  const rivets = Array.from({ length: rivetCount }, (_, i) => {
    const angle = (i * 360) / rivetCount;
    const rad = (angle * Math.PI) / 180;
    const cx = 80 + 70 * Math.cos(rad);
    const cy = 80 + 70 * Math.sin(rad);
    return { cx, cy };
  });

  return (
    <div className="mq-ed-punjab-degchi-cartouche" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 160 160"
        width={size}
        height={size}
        className="mq-ed-punjab-degchi-svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="brassPeetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd875" />
            <stop offset="25%" stopColor="#f3b335" />
            <stop offset="50%" stopColor="#c88219" />
            <stop offset="75%" stopColor="#f7c858" />
            <stop offset="100%" stopColor="#874e05" />
          </linearGradient>
          <radialGradient id="charcoalEmber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c140e" />
            <stop offset="65%" stopColor="#180a06" />
            <stop offset="100%" stopColor="#0a0403" />
          </radialGradient>
          <filter id="brassBevel" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* Outer Heavy Beaten Brass Rim */}
        <circle
          cx="80"
          cy="80"
          r="74"
          fill="none"
          stroke="url(#brassPeetal)"
          strokeWidth="4"
          filter="url(#brassBevel)"
        />

        {/* 24 Hand-Pounded Brass Rivets */}
        {rivets.map((r, i) => (
          <circle
            key={i}
            cx={r.cx}
            cy={r.cy}
            r="2"
            fill="url(#brassPeetal)"
            stroke="#452203"
            strokeWidth="0.5"
          />
        ))}

        {/* Secondary Rope Bead Band */}
        <circle
          cx="80"
          cy="80"
          r="65"
          fill="none"
          stroke="url(#brassPeetal)"
          strokeWidth="1.2"
          strokeDasharray="3 2"
        />

        {/* Dark Charcoal Heart Coin Bed */}
        <circle cx="80" cy="80" r="61" fill="url(#charcoalEmber)" stroke="#452203" strokeWidth="1" />

        {/* Concentric Flame Flare Fillet */}
        <circle
          cx="80"
          cy="80"
          r="54"
          fill="none"
          stroke="url(#brassPeetal)"
          strokeWidth="0.75"
          opacity="0.5"
        />
      </svg>

      {/* Center Logo or Brand Monogram */}
      <div className="mq-ed-punjab-degchi-brand">
        <BrandMark restaurant={restaurant} size={Math.round(size * 0.58)} className="mq-ed-mark-bare" />
      </div>
    </div>
  );
};

/**
 * Grand Trunk Road (NH 1) Milestone Heritage Tablet Badge.
 * Authentic curved stone highway milestone seen across Delhi, Haryana & Punjab.
 */
const HighwayMilestoneBadge: React.FC<{ milestoneText?: string; routeText?: string }> = ({
  milestoneText = 'NH 1 • GRAND TRUNK ROAD',
  routeText = 'ESTD. 1984 • DHABA EDITION',
}) => (
  <aside className="mq-ed-punjab-milestone" aria-label="Highway Heritage Badge">
    <div className="mq-ed-punjab-milestone-top">
      <span className="mq-ed-punjab-milestone-route">{milestoneText}</span>
    </div>
    <div className="mq-ed-punjab-milestone-base">
      <span className="mq-ed-punjab-milestone-edition">{routeText}</span>
    </div>
  </aside>
);

/**
 * Phulkari Astragal (Horizontal Diamond & Grain Spike Divider).
 */
const PhulkariAstragal: React.FC<{ className?: string }> = ({ className }) => (
  <div className={['mq-ed-punjab-astragal', className].filter(Boolean).join(' ')} aria-hidden="true">
    <span className="mq-ed-punjab-astragal-stem" />
    <svg viewBox="0 0 100 24" width="90" height="20" focusable="false">
      {/* Central Diamond */}
      <polygon points="50,2 62,12 50,22 38,12" fill="#c8321a" stroke="#ffd875" strokeWidth="1.5" />
      <circle cx="50" cy="12" r="3" fill="#ffd875" />
      {/* Flanking Stepped Diamonds */}
      <polygon points="30,6 36,12 30,18 24,12" fill="#d97706" />
      <polygon points="70,6 76,12 70,18 64,12" fill="#d97706" />
      {/* Flanking Wheat Grains */}
      <ellipse cx="14" cy="12" rx="4" ry="2" fill="#ffd875" transform="rotate(-20 14 12)" />
      <ellipse cx="86" cy="12" rx="4" ry="2" fill="#ffd875" transform="rotate(20 86 12)" />
    </svg>
    <span className="mq-ed-punjab-astragal-stem" />
  </div>
);

/**
 * Authentic Clay-Hearth Diet Mark with Brass Beaten Rim.
 */
const ClayDietMark: React.FC<{ type?: string; isSpicy?: boolean }> = ({ type, isSpicy }) => {
  const isVeg = type === 'veg';
  const isNonVeg = type === 'non-veg';

  if (!isVeg && !isNonVeg) {
    return null;
  }

  return (
    <span
      className={`mq-ed-punjab-diet ${isVeg ? 'is-veg' : 'is-nonveg'}`}
      title={isVeg ? 'Vegetarian (Shakahari - Pure Desi Ghee)' : 'Non-Vegetarian (Mansaahari - Clay Tandoor)'}
      aria-label={isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
    >
      <span className="mq-ed-punjab-diet-rim">
        <span className="mq-ed-punjab-diet-core" />
      </span>
      {isSpicy && (
        <span className="mq-ed-punjab-diet-chilli" title="Bhatthi Spiced" aria-hidden="true">
          🌶️
        </span>
      )}
    </span>
  );
};

/**
 * Traditional Brass Handi Lid Course Medallion.
 */
const DhabaCourseMedallion: React.FC<{ index: number }> = ({ index }) => {
  const gurmukhiNumerals = ['੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯', '੧੦'];
  const gurmukhi = gurmukhiNumerals[index] || `${index + 1}`;

  return (
    <div className="mq-ed-punjab-medallion" aria-hidden="true">
      <span className="mq-ed-punjab-medallion-ring">
        <span className="mq-ed-punjab-medallion-gurmukhi">{gurmukhi}</span>
      </span>
      <span className="mq-ed-punjab-medallion-label">
        COURSE {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  );
};

export const RangEPunjabEdition: React.FC<EditionProps> = ({
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

  const heroImage = tokens.cover.imageUrl || '/assets/themes/rang-e-punjab-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-punjab is-compact' : 'mq-ed mq-ed-punjab'}>
      {/* =========================================================================
          COVER : Grand Tandoor Gateway of Punjab
          ========================================================================= */}
      <header className="mq-ed-punjab-cover" data-edition-cover="rang-e-punjab">
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

        {/* Smoked Terracotta & Charcoal Embers Veil */}
        <span className="mq-ed-punjab-veil" aria-hidden="true" />

        {/* Embroidered Phulkari Fringes */}
        <span className="mq-ed-punjab-phulkari-strip mq-ed-punjab-phulkari-top" aria-hidden="true" />
        <span className="mq-ed-punjab-phulkari-strip mq-ed-punjab-phulkari-bottom" aria-hidden="true" />

        {/* Phulkari Stepped Corners */}
        <PhulkariCornerBracket position="top-left" size={60} />
        <PhulkariCornerBracket position="top-right" size={60} />
        <PhulkariCornerBracket position="bottom-left" size={60} />
        <PhulkariCornerBracket position="bottom-right" size={60} />

        <div className="mq-ed-punjab-cover-body">
          {/* Milestone Badge */}
          <HighwayMilestoneBadge
            milestoneText="NH 1 • GRAND TRUNK ROAD"
            routeText="ASLI DHABA • CLAY TANDOOR & BHATTHI"
          />

          {/* Hammered Peetal Degchi Logo Cartouche */}
          <DegchiLogoCartouche restaurant={restaurant} size={compact ? 80 : 110} />

          {/* Restaurant Title with Tandoori Brass Glow */}
          <h1 className="mq-ed-punjab-title">{restaurant.name}</h1>

          {/* Gurmukhi Heritage Epithet */}
          <div className="mq-ed-punjab-gurmukhi-epithet" aria-hidden="true">
            ਸਵਾਦ ਪੰਜਾਬ ਦਾ • ਦਿਲ ਖੋਲ੍ਹ ਕੇ ਖਾਓ
          </div>

          {/* Tagline */}
          {restaurant.tagline ? (
            <p className="mq-ed-punjab-tagline">{restaurant.tagline}</p>
          ) : (
            <p className="mq-ed-punjab-tagline">
              Highway Bhatthi Fire, Slow-Simmered Copper Handis & Fresh Makhan Since 1984
            </p>
          )}

          {/* Phulkari Astragal Divider */}
          <PhulkariAstragal className="mq-ed-punjab-cover-astragal" />

          {/* Category Quick Preview Teaser */}
          <CategoryTeaser
            categories={categories}
            limit={4}
            separator="◆"
            className="mq-ed-punjab-teaser"
          />
        </div>

        {/* Contact Strip */}
        <EditionContact restaurant={restaurant} className="mq-ed-punjab-contact" />
      </header>

      {/* =========================================================================
          TOOLBAR & SEARCH
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <aside className="mq-ed-punjab-announce" role="note" aria-label="Announcement">
              <span className="mq-ed-punjab-announce-icon" aria-hidden="true">
                🔥
              </span>
              <span className="mq-ed-punjab-announce-text">{tokens.announcement}</span>
              <span className="mq-ed-punjab-announce-icon" aria-hidden="true">
                🔥
              </span>
            </aside>
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
          INTERIOR : Hearty Dhaba Dining & Tandoor Feasts
          ========================================================================= */}
      <main className="mq-ed-punjab-plate">
        {/* 1. BHATTHI DA SWAAD • SIGNATURE TANDOOR SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-punjab-showcase" aria-label="Bhatthi Highlights">
            <header className="mq-ed-punjab-showcase-header">
              <span className="mq-ed-punjab-showcase-kicker">ਖ਼ਾਸ ਤੰਦੂਰੀ ਸੁਗਾਤਾਂ • CHEF&apos;S CLAY OVEN PRIDE</span>
              <h2 className="mq-ed-punjab-showcase-title">Bhatthi Te Tandoor Da Kamaal</h2>
              <p className="mq-ed-punjab-showcase-sub">
                Skewered over live hardwood charcoal embers, basted in spiced yellow mustard oil and
                served sizzling with hand-churned white butter.
              </p>
              <PhulkariAstragal />
            </header>

            <div className="mq-ed-punjab-showcase-grid">
              {signatures.map((item) => (
                <article key={item.id} className="mq-ed-punjab-showcase-card">
                  <div className="mq-ed-punjab-showcase-media">
                    <SmartImage
                      src={item.imageUrl || heroImage}
                      alt={item.name}
                      role="card"
                      focal={item.focal}
                      aspectRatio="16 / 10"
                    />
                    <span className="mq-ed-punjab-showcase-badge">
                      <span className="mq-ed-punjab-showcase-badge-fire">🔥</span>
                      BHATTHI SPECIAL
                    </span>
                  </div>

                  <div className="mq-ed-punjab-showcase-content">
                    <div className="mq-ed-punjab-showcase-row">
                      <div className="mq-ed-punjab-showcase-name-wrap">
                        <ClayDietMark
                          type={
                            item.dietType ||
                            (item.name.toLowerCase().includes('paneer') ||
                            item.name.toLowerCase().includes('dal') ||
                            item.name.toLowerCase().includes('veg')
                              ? 'veg'
                              : 'non-veg')
                          }
                          isSpicy={!!item.spicyLevel}
                        />
                        <h3 className="mq-dish-name mq-ed-punjab-showcase-dish-name">{item.name}</h3>
                      </div>
                      <div className="mq-ed-punjab-showcase-price-box">
                        <DishPrice item={item} readOnly={readOnly} />
                      </div>
                    </div>

                    {item.description && (
                      <p className="mq-dish-desc mq-ed-punjab-showcase-desc">
                        {cleanDescription(item)}
                      </p>
                    )}

                    <div className="mq-ed-punjab-showcase-footer">
                      <span className="mq-ed-punjab-showcase-prep">
                        Charcoal Pit Roasted • Basted in Desi Ghee
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. CULTURAL ASIDE PLAQUE : "Sanjha Chulha Te Grand Trunk Road" */}
        {!compact && !hasQuery && (
          <aside className="mq-ed-punjab-plaque" aria-label="Punjab Dhaba Heritage Tradition">
            <div className="mq-ed-punjab-plaque-inner">
              <span className="mq-ed-punjab-plaque-seal" aria-hidden="true">
                ਧਾਬਾ
              </span>
              <span className="mq-ed-punjab-plaque-kicker">THE GRAND TRUNK ROAD TRADITION</span>
              <h3 className="mq-ed-punjab-plaque-title">Sanjha Chulha: The Community Hearth</h3>
              <p className="mq-ed-punjab-plaque-text">
                For centuries along Sher Shah Suri&apos;s ancient highway, weary travelers, truckers, and
                merchants found solace around the roaring heat of the village <em>Sanjha Chulha</em>.
                Our black lentils simmer gently in seasoned copper cauldrons for over sixteen hours
                through the night, while our rotis and kulchas are slapped against fiery earthenware walls
                fed by seasoned babool charcoal. Food made with large hearts, rich dairy, and unhurried patience.
              </p>
              <div className="mq-ed-punjab-plaque-footer">
                <span>PIND DA SWAAD</span>
                <span>•</span>
                <span>DESI GHEE TAAZA MAKHAN</span>
                <span>•</span>
                <span>KHULLA DILL</span>
              </div>
            </div>
          </aside>
        )}

        {/* 3. DHABA COURSES & DOTTED PRICE LEADERS */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">
              No items available.
            </p>
          )
        ) : (
          sections.map((category, catIdx) => (
            <section
              key={category.id}
              className="mq-ed-punjab-course"
              aria-labelledby={`mq-ed-punjab-${category.id}`}
            >
              {/* Corner Phulkari Brackets on each course card */}
              <PhulkariCornerBracket position="top-left" size={28} />
              <PhulkariCornerBracket position="top-right" size={28} />

              <header className="mq-ed-punjab-course-header">
                <DhabaCourseMedallion index={catIdx} />
                <div className="mq-ed-punjab-course-title-wrap">
                  <h2 id={`mq-ed-punjab-${category.id}`} className="mq-ed-punjab-course-title">
                    {category.name}
                  </h2>
                </div>
                {category.description && (
                  <p className="mq-ed-punjab-course-desc">{category.description}</p>
                )}
                <PhulkariAstragal className="mq-ed-punjab-course-divider" />
              </header>

              <div className="mq-ed-punjab-list">
                {category.items.map((item) => {
                  const diet =
                    item.dietType ||
                    (item.name.toLowerCase().includes('paneer') ||
                    item.name.toLowerCase().includes('dal') ||
                    item.name.toLowerCase().includes('veg') ||
                    item.name.toLowerCase().includes('paratha') ||
                    item.name.toLowerCase().includes('roti') ||
                    item.name.toLowerCase().includes('naan') ||
                    item.name.toLowerCase().includes('chana') ||
                    item.name.toLowerCase().includes('lassi')
                      ? 'veg'
                      : 'non-veg');

                  return (
                    <article key={item.id} className="mq-ed-punjab-dish-row">
                      <div className="mq-ed-punjab-dish-head">
                        <ClayDietMark type={diet} isSpicy={!!item.spicyLevel} />

                        {/* Dish Name with mandatory .mq-dish-name for Quality Gate */}
                        <h3 className="mq-dish-name mq-ed-punjab-dish-name">{item.name}</h3>

                        {/* Saffron dotted leader line anchored to last baseline */}
                        <span className="mq-ed-punjab-dish-rule" aria-hidden="true" />

                        {/* Dish Price with mandatory .mq-price */}
                        <div className="mq-ed-punjab-dish-price-slot">
                          <DishPrice item={item} readOnly={readOnly} />
                        </div>
                      </div>

                      {/* Dish Description with mandatory .mq-dish-desc */}
                      {item.description && (
                        <p className="mq-dish-desc mq-ed-punjab-dish-desc">
                          {cleanDescription(item)}
                        </p>
                      )}

                      {/* Authentic Dhaba Badges (Bestseller, Tandoor Signature, Desi Ghee) */}
                      {!compact && (
                        <div className="mq-ed-punjab-dish-tags" aria-label="Item notes">
                          {item.isSpecial && (
                            <span className="mq-ed-punjab-tag is-signature">
                              <span aria-hidden="true">★</span> Ustad&apos;s Signature
                            </span>
                          )}
                          {item.isBestseller && (
                            <span className="mq-ed-punjab-tag is-popular">Dhaba Favourite</span>
                          )}
                          {item.spicyLevel && item.spicyLevel > 0 && (
                            <span className="mq-ed-punjab-tag is-spiced">
                              {'🌶️'.repeat(Math.min(3, item.spicyLevel))} Teekha Bhatthi
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* =========================================================================
          FOOTER & DHABA KITCHEN BRIGADE
          ========================================================================= */}
      <footer className="mq-ed-punjab-foot">
        <PhulkariAstragal />

        <div className="mq-ed-punjab-foot-crest">
          <DegchiLogoCartouche restaurant={restaurant} size={68} />
        </div>

        <h3 className="mq-ed-punjab-foot-name">{restaurant.name}</h3>
        <p className="mq-ed-punjab-foot-sub">
          Slow-Simmered Copper Handis • Clay Tandoor Hearth • Desi Ghee
        </p>

        {/* Dhaba Brigade Hierarchy Colophon */}
        <section className="mq-ed-punjab-brigade-grid" aria-label="Kitchen Brigade">
          <div className="mq-ed-punjab-brigade-item">
            <span className="mq-ed-punjab-brigade-title">Ustad-e-Bhatthi</span>
            <span className="mq-ed-punjab-brigade-role">Master of the Hardwood Tandoor</span>
          </div>
          <div className="mq-ed-punjab-brigade-item">
            <span className="mq-ed-punjab-brigade-title">Bawarchi-e-Handi</span>
            <span className="mq-ed-punjab-brigade-role">Copper Cauldron & Daal Simmering</span>
          </div>
          <div className="mq-ed-punjab-brigade-item">
            <span className="mq-ed-punjab-brigade-title">Halwai-e-Lassi</span>
            <span className="mq-ed-punjab-brigade-role">Hand-Churned Makhan & Malai</span>
          </div>
          <div className="mq-ed-punjab-brigade-item">
            <span className="mq-ed-punjab-brigade-title">Rotiwala-e-Tandoor</span>
            <span className="mq-ed-punjab-brigade-role">Naan, Paratha & Kulcha Artisan</span>
          </div>
        </section>

        <p className="mq-ed-punjab-foot-colophon">
          &ldquo;ਜਿਥੇ ਦਿਲ ਮਿਲੇ, ਓਥੇ ਰੱਬ ਮਿਲੇ — Where hearts unite, the divine resides.&rdquo;
        </p>

        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default RangEPunjabEdition;

/**
 * MENUQR Edition — Noren (暖簾)
 *
 * Japanese Culinary Minimalism & Master-Craft Editorial Design.
 *
 * Grounded in the philosophy of Wabi-Sabi, Ma (間 - intentional negative space),
 * and Omotenashi (おもてなし - selfless hospitality).
 *
 * Key Design Elements:
 * - Suspended Noren fabric divider with cedar rod and brass brackets
 * - Cinnabar vermillion Hanko stone-carved chop seal (朱肉 印鑑)
 * - Raw Echizen washi paper canvas with sumi ink typography
 * - Museum-grade culinary photographic mount with Kento registration marks
 * - Curated "Shun Tokusen" (旬の特選) seasonal showcase
 * - Precision hairline course registers with Kanji indices (壱, 弐, 参...)
 * - Kishū Binchōtan charcoal hearth aside plaque
 * - Archival colophon with Hanko seal and "Ichigo Ichie" (一期一会) motto
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DietMark, DishPrice } from '../../primitives/DishMeta.tsx';
import {
  CategoryTeaser,
  EditionContact,
  cleanDescription,
  initials,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';

/** Formal Kanji numerical indices for course registers (1 to 10) */
const KANJI_NUMS = ['壱', '弐', '参', '四', '伍', '六', '七', '八', '九', '拾'];

/**
 * Architectural Noren hanging curtain with cedar bamboo rod, brass brackets,
 * and 3 hanging fabric panels with hemmed slits.
 */
const NorenRodAndCurtain: React.FC = () => (
  <div className="mq-ed-noren-curtain-wrap" aria-hidden="true">
    {/* Dark Cedar / Bamboo Hanging Rod with Brass Brackets */}
    <div className="mq-ed-noren-rod">
      <span className="mq-ed-noren-rod-brass brass-left" />
      <span className="mq-ed-noren-rod-bar" />
      <span className="mq-ed-noren-rod-brass brass-right" />
    </div>

    {/* Hanging Fabric Loops (Chitsugi - 乳継ぎ) */}
    <div className="mq-ed-noren-loops">
      <span className="mq-ed-noren-loop" />
      <span className="mq-ed-noren-loop" />
      <span className="mq-ed-noren-loop" />
      <span className="mq-ed-noren-loop" />
      <span className="mq-ed-noren-loop" />
    </div>

    {/* 3 Suspended Linen Fabric Panels with Slit Shadows */}
    <div className="mq-ed-noren-valance">
      <div className="mq-ed-noren-panel">
        <span className="noren-hem" />
      </div>
      <div className="mq-ed-noren-panel">
        <span className="noren-hem" />
      </div>
      <div className="mq-ed-noren-panel">
        <span className="noren-hem" />
      </div>
    </div>
  </div>
);

/**
 * Hand-carved stone Hanko chop seal (朱肉 印鑑).
 * Stamped in vibrant cinnabar vermillion with organic stone-cut edges,
 * micro-texture, and four corner registry kanji accents:
 * 特 (Tokusen), 選 (Select), 極 (Kiwami), 印 (Seal).
 */
const HankoChopSeal: React.FC<{
  restaurant: EditionProps['restaurant'];
  size?: number;
  className?: string;
}> = ({ restaurant, size = 96, className }) => {
  const mark = initials(restaurant.name, 1);

  return (
    <div
      className={['mq-ed-noren-hanko', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-label={`${restaurant.name} Seal`}
    >
      <svg
        viewBox="0 0 120 120"
        className="mq-ed-noren-hanko-svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="norenHankoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#db4633" />
            <stop offset="50%" stopColor="#c93a2a" />
            <stop offset="100%" stopColor="#ab2a1b" />
          </linearGradient>
        </defs>

        {/* Organic hand-carved stone chop outline */}
        <path
          d="M 12 16 C 35 11, 85 12, 108 15 C 111 38, 110 82, 107 104 C 85 108, 35 107, 13 105 C 9 82, 9 38, 12 16 Z"
          fill="url(#norenHankoGrad)"
        />

        {/* Inner carved hairline border with artisanal gaps */}
        <path
          d="M 18 22 C 38 18, 82 19, 102 21 C 105 41, 104 79, 101 98 C 82 101, 38 100, 19 99 C 16 79, 16 41, 18 22 Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeDasharray="42 2 24 2"
          opacity="0.88"
        />

        {/* 4 Corner Seal Registration Kanji Accents */}
        <text x="25" y="33" fill="#ffffff" opacity="0.65" fontSize="10" fontFamily="serif" fontWeight="bold">
          特
        </text>
        <text x="95" y="33" fill="#ffffff" opacity="0.65" fontSize="10" fontFamily="serif" fontWeight="bold" textAnchor="end">
          選
        </text>
        <text x="25" y="93" fill="#ffffff" opacity="0.65" fontSize="10" fontFamily="serif" fontWeight="bold">
          極
        </text>
        <text x="95" y="93" fill="#ffffff" opacity="0.65" fontSize="10" fontFamily="serif" fontWeight="bold" textAnchor="end">
          印
        </text>
      </svg>

      <div className="mq-ed-noren-hanko-content">
        {restaurant.logoUrl ? (
          <img
            src={restaurant.logoUrl}
            alt=""
            className="mq-ed-noren-hanko-img"
            loading="eager"
            decoding="async"
          />
        ) : (
          <span className="mq-ed-noren-hanko-initials">{mark}</span>
        )}
      </div>
    </div>
  );
};

export const NorenEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);
  const sections = liveCategories(visible);
  const signatures = useFeatured(categories, 2);
  const coverImage = tokens.cover.imageUrl || signatures[0]?.imageUrl || '/assets/themes/noren-hero.webp';

  return (
    <div className={compact ? 'mq-ed mq-ed-noren is-compact' : 'mq-ed mq-ed-noren'}>
      {/* =========================================================================
          COVER : Minimalist Japanese Washi & Suspended Noren Folio
          ========================================================================= */}
      <header className="mq-ed-noren-cover" data-edition-cover="noren">
        {/* 1. Architectural Suspended Noren Curtain Header */}
        <NorenRodAndCurtain />

        <div className="mq-ed-noren-cover-body">
          {/* 2. Archival Register Header */}
          <div className="mq-ed-noren-folio">
            <span className="mq-ed-noren-folio-kanji">旬の味覚 · お品書き</span>
            <span className="mq-ed-noren-folio-sep">／</span>
            <span className="mq-ed-noren-folio-text">SEASONAL REGISTER · FOLIO NO. 03</span>
          </div>

          {/* 3. Central Hanko Cinnabar Seal with Brand Logo */}
          <div className="mq-ed-noren-seal-slot">
            <HankoChopSeal
              restaurant={restaurant}
              size={compact ? 80 : 108}
            />
          </div>

          {/* 4. Restaurant Identity */}
          <div className="mq-ed-noren-identity" data-testid="mq-cover-mark">
            {restaurant.cuisine ? (
              <p className="mq-ed-noren-cuisine">
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
                <span>{restaurant.cuisine}</span>
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
              </p>
            ) : (
              <p className="mq-ed-noren-cuisine">
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
                <span>ROBATAYAKI · KAISEKI · OMATASE</span>
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
              </p>
            )}

            <h1 className="mq-ed-noren-title">{restaurant.name}</h1>

            {restaurant.tagline ? (
              <p className="mq-ed-noren-tagline">&ldquo;{restaurant.tagline}&rdquo;</p>
            ) : (
              <p className="mq-ed-noren-tagline">
                &ldquo;Where seasonal discipline meets the radiant warmth of charcoal.&rdquo;
              </p>
            )}

            {/* Curated Category Teaser Pills */}
            <CategoryTeaser
              categories={categories}
              limit={4}
              separator="／"
              className="mq-ed-noren-teaser"
            />
          </div>

          {/* 5. Minimalist Washi Photographic Mount (Specimen Plate) */}
          <div className="mq-ed-noren-mount">
            {/* Kento Registration Crosshairs (見当) */}
            <span className="mq-ed-noren-kento kento-tl" aria-hidden="true" />
            <span className="mq-ed-noren-kento kento-tr" aria-hidden="true" />
            <span className="mq-ed-noren-kento kento-bl" aria-hidden="true" />
            <span className="mq-ed-noren-kento kento-br" aria-hidden="true" />

            <div className="mq-ed-noren-mount-inner">
              <SmartImage
                src={coverImage}
                alt={restaurant.name}
                role="card"
                aspectRatio="16 / 10"
              />
            </div>

            <div className="mq-ed-noren-mount-caption">
              <span className="mq-ed-noren-caption-kanji">炭火と旬の恵み</span>
              <span className="mq-ed-noren-caption-sep">・</span>
              <span className="mq-ed-noren-caption-text">
                CHEF&apos;S SEASONAL CHARCOAL HEARTH TASTING
              </span>
            </div>
          </div>

          {/* 6. Precision Hairline & Contact Colophon */}
          <div className="mq-ed-noren-cover-contact">
            <span className="mq-ed-noren-hair" aria-hidden="true" />
            <EditionContact restaurant={restaurant} separator="／" className="mq-ed-noren-contact" />
          </div>
        </div>
      </header>

      {/* =========================================================================
          TOOLBAR & FILTERS
          ========================================================================= */}
      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-noren-announce" role="note">
              <span className="mq-ed-noren-announce-kanji">お知らせ</span>
              <span className="mq-ed-noren-announce-sep">／</span>
              <span>{tokens.announcement}</span>
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
          INTERIOR : Kaiseki Register & Binchōtan Hearth
          ========================================================================= */}
      <main className="mq-ed-noren-body">
        {/* 1. SHUN TOKUSEN (旬の特選) — CURATED SIGNATURE SHOWCASE */}
        {signatures.length > 0 && !compact && !hasQuery && (
          <section className="mq-ed-noren-showcase" aria-label="旬の特選">
            <div className="mq-ed-noren-showcase-header">
              <div className="mq-ed-noren-showcase-eyebrow">
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
                <span>旬の特選</span>
                <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
              </div>
              <h3 className="mq-ed-noren-showcase-title">CHEF&apos;S SEASONAL SPECIALTIES</h3>
              <p className="mq-ed-noren-showcase-sub">
                Charcoal-seared masterworks, aged dashi reductions, and seasonal heritage delicacies.
              </p>
            </div>

            <div className="mq-ed-noren-showcase-grid">
              {signatures.map((dish, idx) => (
                <article key={dish.id} className="mq-ed-noren-card">
                  <span className="mq-ed-noren-card-kanji-num">{KANJI_NUMS[idx] || '特'}</span>
                  {dish.imageUrl && (
                    <div className="mq-ed-noren-card-media">
                      <SmartImage
                        src={dish.imageUrl}
                        alt={dish.name}
                        role="card"
                        focal={dish.focal}
                        aspectRatio="16 / 10"
                      />
                    </div>
                  )}
                  <div className="mq-ed-noren-card-body">
                    <div className="mq-ed-noren-card-head">
                      <div className="mq-ed-noren-card-name-group">
                        <DietMark type={dish.dietType} />
                        <h4 className="mq-ed-noren-card-name mq-dish-name">{dish.name}</h4>
                      </div>
                      <div className="mq-ed-noren-card-price">
                        <DishPrice item={dish} readOnly={readOnly} />
                      </div>
                    </div>
                    {cleanDescription(dish) && (
                      <p className="mq-ed-noren-card-desc mq-dish-desc">{cleanDescription(dish)}</p>
                    )}
                    <div className="mq-ed-noren-card-accent">
                      <span className="noren-pill-red">名物</span>
                      <span>Binchōtan charcoal seared • House-crafted glaze</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 2. COURSE SECTIONS WITH HAIRLINE REGISTRATION */}
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">This menu has no dishes yet.</p>
          )
        ) : (
          <div className="mq-ed-noren-columns">
            {sections.map((category, sectionIndex) => (
              <section
                key={category.id}
                className="mq-ed-noren-section"
                aria-labelledby={`mq-ed-noren-${category.id}`}
              >
                <header className="mq-ed-noren-section-header">
                  <div className="mq-ed-noren-section-title-wrap">
                    <span className="mq-ed-noren-section-kanji">
                      {KANJI_NUMS[sectionIndex] || String(sectionIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="mq-ed-noren-red-dot" aria-hidden="true">●</span>
                    <h2 id={`mq-ed-noren-${category.id}`} className="mq-ed-noren-section-title">
                      {category.name}
                    </h2>
                    <span className="mq-ed-noren-section-count">
                      {category.items.length} 品目
                    </span>
                  </div>
                  <span className="mq-ed-noren-section-hairline" aria-hidden="true" />
                  {category.description && (
                    <p className="mq-ed-noren-section-desc">{category.description}</p>
                  )}
                </header>

                <ul className="mq-ed-noren-list">
                  {category.items.map((item) => {
                    const description = cleanDescription(item);
                    return (
                      <li key={item.id} className="mq-ed-noren-row">
                        <div className="mq-ed-noren-row-head">
                          <div className="mq-ed-noren-row-identity">
                            <DietMark type={item.dietType} />
                            <h4 className="mq-ed-noren-name mq-dish-name">{item.name}</h4>
                          </div>
                          <span className="mq-ed-noren-leader-hair" aria-hidden="true" />
                          <div className="mq-ed-noren-price">
                            <DishPrice item={item} readOnly={readOnly} />
                          </div>
                        </div>

                        {description && <p className="mq-ed-noren-desc mq-dish-desc">{description}</p>}

                        {!compact && (
                          <div className="mq-ed-noren-tags">
                            {item.isBestseller && <span className="noren-badge bestseller">一番人気</span>}
                            {item.isSpecial && <span className="noren-badge special">名物特選</span>}
                            {item.spicyLevel && item.spicyLevel > 0 && (
                              <span className="noren-badge spice">辛味 {'🌶️'.repeat(Math.min(item.spicyLevel, 3))}</span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {/* 3. BINCHŌTAN HEARTH & KAISEKI PHILOSOPHY ASIDE PLAQUE */}
        {!compact && !hasQuery && sections.length > 0 && (
          <aside className="mq-ed-noren-hearth-aside" aria-label="炭火の極意">
            <div className="mq-ed-noren-hearth-inner">
              <div className="mq-ed-noren-hearth-seal">
                <svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true">
                  <rect x="2" y="2" width="36" height="36" rx="4" fill="#c93a2a" />
                  <text
                    x="20"
                    y="26"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="18"
                    fontFamily="serif"
                    fontWeight="bold"
                  >
                    極
                  </text>
                </svg>
              </div>
              <p className="mq-ed-noren-hearth-kanji">炭火と出汁の美学</p>
              <h3 className="mq-ed-noren-hearth-title">The Art of Binchōtan &amp; Umami</h3>
              <p className="mq-ed-noren-hearth-text">
                Every skewer and hearth creation is kissed by pure Kishū Binchōtan white charcoal,
                reaching intense radiant infrared heat to caramelize surfaces while preserving
                deep natural juices. Our master dashi is brewed daily from aged Rishiri kombu
                and hand-shaved katsuobushi.
              </p>
              <div className="mq-ed-noren-hearth-tags">
                <span className="hearth-pill">KISHŪ BINCHŌTAN</span>
                <span className="hearth-pill">AGED RISHIRI KOMBU</span>
                <span className="hearth-pill">HERITAGE CLAY OVEN</span>
                <span className="hearth-pill">SLOW-SIMMERED TARE</span>
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* =========================================================================
          FOOTER : Archival Colophon with Hanko Chop Stamp
          ========================================================================= */}
      <footer className="mq-ed-noren-foot">
        <div className="mq-ed-noren-foot-hanko">
          <HankoChopSeal restaurant={restaurant} size={54} />
        </div>
        <p className="mq-ed-noren-foot-name">{restaurant.name}</p>
        <p className="mq-ed-noren-foot-motto">
          一期一会 · CHERISH EVERY ENCOUNTER · OMOTENASHI HOSPITALITY
        </p>
        <EditionContact
          restaurant={restaurant}
          separator="／"
          className="mq-ed-noren-foot-contact"
        />
      </footer>
    </div>
  );
};

export default NorenEdition;

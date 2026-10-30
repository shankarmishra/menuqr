/**
 * MENUQR Edition — Darbar
 *
 * Indian royal: a cusped jali arch drawn as a single SVG, filigree corners, and a medallion
 * carrying the owner's mark. The interior sets each course under its own small arch, with
 * leader rows in the accent — the language of a palace banquet card rather than a thali list.
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import {
  BrandMark,
  CategoryTeaser,
  EditionContact,
  Leader,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

/** Cusped (multifoil) arch — the motif that reads unmistakably as Mughal rather than generic. */
const JaliArch: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 300" aria-hidden="true" focusable="false" className={className} preserveAspectRatio="none">
    <path
      d="M120 6
         C166 6 204 44 204 90
         L204 294 L36 294 L36 90
         C36 44 74 6 120 6 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M120 20
         C158 20 190 52 190 90
         L190 282 L50 282 L50 90
         C50 52 82 20 120 20 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeDasharray="4 4"
      opacity="0.7"
    />
    {/* Cusped lobes along the arch crown, the defining jali detail. */}
    {[0, 1, 2, 3, 4, 5, 6].map((index) => {
      const angle = Math.PI * (0.08 + index * 0.14);
      const cx = 120 - 70 * Math.cos(angle);
      const cy = 92 - 70 * Math.sin(angle);
      return <circle key={index} cx={cx} cy={cy} r="7" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.75" />;
    })}
  </svg>
);

/** Paisley filigree for the cover corners. */
const Paisley: React.FC<{ size?: number }> = ({ size = 46 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
    <path
      d="M6 42 C6 20 18 6 34 6 C44 6 46 16 40 22 C34 28 22 24 22 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M11 42 C11 24 20 12 32 12 C38 12 40 18 36 21"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      opacity="0.6"
      strokeLinecap="round"
    />
    <circle cx="27" cy="17" r="2.2" fill="currentColor" opacity="0.8" />
  </svg>
);

export const DarbarEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);
  const sections = liveCategories(visible);
  const royal = useFeatured(categories, 1)[0];

  return (
    <div className={compact ? 'mq-ed mq-ed-darbar is-compact' : 'mq-ed mq-ed-darbar'}>
      <header className="mq-ed-darbar-cover" data-edition-cover="darbar">
        {tokens.cover.imageUrl && (
          <div className="mq-ed-cover-media" aria-hidden="true">
            <SmartImage
              src={tokens.cover.imageUrl}
              alt=""
              role="hero"
              focal={tokens.cover.focal}
              priority
              aspectRatio={undefined}
            />
          </div>
        )}
        <span className="mq-ed-darbar-veil" aria-hidden="true" />

        <span className="mq-ed-darbar-paisley mq-ed-darbar-paisley-tl"><Paisley size={compact ? 26 : 48} /></span>
        <span className="mq-ed-darbar-paisley mq-ed-darbar-paisley-tr"><Paisley size={compact ? 26 : 48} /></span>
        <span className="mq-ed-darbar-paisley mq-ed-darbar-paisley-bl"><Paisley size={compact ? 26 : 48} /></span>
        <span className="mq-ed-darbar-paisley mq-ed-darbar-paisley-br"><Paisley size={compact ? 26 : 48} /></span>

        <div className="mq-ed-darbar-arch">
          <JaliArch className="mq-ed-darbar-arch-art" />

          <div className="mq-ed-darbar-arch-body">
            <span className="mq-ed-darbar-medallion">
              <BrandMark restaurant={restaurant} size={compact ? 30 : 50} className="mq-ed-mark-bare" />
            </span>

            {restaurant.cuisine && <p className="mq-ed-darbar-cuisine">{restaurant.cuisine}</p>}
            <h1 className="mq-ed-darbar-title">{restaurant.name}</h1>
            {restaurant.tagline && <p className="mq-ed-darbar-tagline">{restaurant.tagline}</p>}
            <CategoryTeaser categories={categories} limit={3} separator="◆" className="mq-ed-darbar-teaser" />
          </div>
        </div>

        <EditionContact restaurant={restaurant} className="mq-ed-darbar-contact" />
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-darbar-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-darbar-body">
        {royal?.imageUrl && !compact && (
          <figure className="mq-ed-darbar-royal">
            <SmartImage
              src={royal.imageUrl}
              alt={royal.name}
              role="card"
              focal={royal.focal}
              aspectRatio="var(--mq-aspect-hero)"
            />
            <figcaption>
              <span className="mq-ed-eyebrow">Khaas Pasand</span>
              <strong>{royal.name}</strong>
            </figcaption>
          </figure>
        )}

        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">This menu has no dishes yet.</p>
          )
        ) : (
          sections.map((category) => (
            <section
              key={category.id}
              className="mq-ed-darbar-course"
              aria-labelledby={`mq-ed-darbar-${category.id}`}
            >
              <div className="mq-ed-darbar-course-head">
                <span className="mq-ed-darbar-course-wing" aria-hidden="true" />
                <h2 id={`mq-ed-darbar-${category.id}`} className="mq-ed-darbar-course-title">
                  {category.name}
                </h2>
                <span className="mq-ed-darbar-course-wing" aria-hidden="true" />
              </div>

              <div className="mq-ed-darbar-list">
                {category.items.map((item) => (
                  <Leader key={item.id} item={item} readOnly={readOnly} showFlags={!compact} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="mq-ed-darbar-foot">
        <Paisley size={34} />
        <p className="mq-ed-darbar-foot-name">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default DarbarEdition;

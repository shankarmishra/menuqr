/**
 * MENUQR Edition — Chalk House
 *
 * A bistro board: slate ground, a hand-drawn chalk rule that wobbles because a ruled line would
 * break the illusion, and courses written out rather than laid out. Prices sit in chalk rings.
 *
 * The "hand-drawn" strokes are fixed SVG paths, not generated jitter — a board that redraws
 * itself differently on every render is a board nobody can snapshot-test.
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DietMark, DishFlags, DishPrice } from '../../primitives/DishMeta.tsx';
import {
  BrandMark,
  EditionContact,
  cleanDescription,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

/** A chalk underline with a deliberate wobble and a lifted tail. */
const ChalkSwoosh: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 220 14" aria-hidden="true" focusable="false" className={className} preserveAspectRatio="none">
    <path
      d="M3 9 C40 4 70 11 108 7 C146 3 178 10 214 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M10 12 C52 8 92 13 130 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      opacity="0.45"
    />
  </svg>
);

/** The chalked border around the whole board. */
const ChalkFrame: React.FC = () => (
  <svg
    className="mq-ed-chalk-frame"
    viewBox="0 0 400 560"
    aria-hidden="true"
    focusable="false"
    preserveAspectRatio="none"
  >
    <path
      d="M14 18 C130 11 270 13 386 17 C391 150 392 410 387 543
         C262 549 132 548 15 542 C9 400 8 150 14 18 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M22 27 C136 21 266 22 378 26 C383 152 383 406 378 534
         C258 540 136 539 23 533 C17 398 17 152 22 27 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      opacity="0.4"
    />
  </svg>
);

export const ChalkHouseEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery, allergenFilter, setAllergenFilter, spiceFilter, setSpiceFilter } = useMenuFilters(categories);
  const sections = liveCategories(visible);
  const special = useFeatured(categories, 1)[0];

  return (
    <div className={compact ? 'mq-ed mq-ed-chalk is-compact' : 'mq-ed mq-ed-chalk'}>
      <header className="mq-ed-chalk-cover" data-edition-cover="chalk-house">
        <ChalkFrame />

        <div className="mq-ed-chalk-cover-body">
          <p className="mq-ed-chalk-kicker">Today&rsquo;s Board</p>

          <BrandMark restaurant={restaurant} size={compact ? 32 : 56} className="mq-ed-mark-ring" />

          <h1 className="mq-ed-chalk-title">{restaurant.name}</h1>
          <ChalkSwoosh className="mq-ed-chalk-swoosh" />

          {restaurant.tagline && <p className="mq-ed-chalk-tagline">{restaurant.tagline}</p>}

          {special?.imageUrl && (
            <figure className="mq-ed-chalk-special">
              <SmartImage
                src={special.imageUrl}
                alt={special.name}
                role="card"
                focal={special.focal}
                aspectRatio="var(--mq-aspect-card)"
              />
              <figcaption>
                <span className="mq-ed-chalk-star" aria-hidden="true">★</span>
                {special.name}
              </figcaption>
            </figure>
          )}

          <EditionContact restaurant={restaurant} className="mq-ed-chalk-contact" />
        </div>
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-chalk-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-chalk-body">
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
              className="mq-ed-chalk-section"
              aria-labelledby={`mq-ed-chalk-${category.id}`}
            >
              <h2 id={`mq-ed-chalk-${category.id}`} className="mq-ed-chalk-section-title">
                {category.name}
              </h2>
              <ChalkSwoosh className="mq-ed-chalk-swoosh mq-ed-chalk-swoosh-section" />

              <div className="mq-ed-chalk-list">
                {category.items.map((item) => {
                  const description = cleanDescription(item);
                  return (
                    <article key={item.id} className="mq-ed-chalk-row">
                      <div className="mq-ed-chalk-row-main">
                        <div className="mq-ed-chalk-row-title">
                          <DietMark type={item.dietType} />
                          <h4 className="mq-ed-leader-name">{item.name}</h4>
                        </div>
                        {description && <p className="mq-ed-leader-desc">{description}</p>}
                        <div className="mq-ed-leader-flags">
                          <DishFlags item={item} />
                        </div>
                      </div>
                      <span className="mq-ed-chalk-ring">
                        <DishPrice item={item} readOnly={readOnly} />
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="mq-ed-chalk-foot">
        <ChalkSwoosh className="mq-ed-chalk-swoosh" />
        <p className="mq-ed-chalk-foot-name">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default ChalkHouseEdition;

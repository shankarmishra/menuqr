/**
 * MENUQR Edition — Littorale
 *
 * Coastal Mediterranean: a wide photographic band set across the page like a horizon, a drawn
 * wave rule, and an airy interior where each course opens with its own strip of photography.
 * Light, high-key and generous — the opposite of Maison Noir's density, on the same tokens.
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

/** A drawn swell, used as the divider everywhere a plain rule would feel too hard. */
const WaveRule: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 240 16" aria-hidden="true" focusable="false" className={className} preserveAspectRatio="none">
    <path
      d="M0 11 C20 3 40 3 60 11 C80 19 100 19 120 11 C140 3 160 3 180 11 C200 19 220 19 240 11"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M0 6 C20 -2 40 -2 60 6 C80 14 100 14 120 6 C140 -2 160 -2 180 6 C200 14 220 14 240 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.8"
      opacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

export const LittoraleEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const sections = liveCategories(visible);
  const horizon = useFeatured(categories, 4);
  const bandSrc = tokens.cover.imageUrl ?? horizon[0]?.imageUrl;

  return (
    <div className={compact ? 'mq-ed mq-ed-litt is-compact' : 'mq-ed mq-ed-litt'}>
      <header className="mq-ed-litt-cover" data-edition-cover="littorale">
        <div className="mq-ed-litt-head">
          <BrandMark restaurant={restaurant} size={compact ? 30 : 48} className="mq-ed-mark-ring" />
          {restaurant.cuisine && <p className="mq-ed-litt-cuisine">{restaurant.cuisine}</p>}
          <h1 className="mq-ed-litt-title">{restaurant.name}</h1>
          <WaveRule className="mq-ed-litt-wave" />
          {restaurant.tagline && <p className="mq-ed-litt-tagline">{restaurant.tagline}</p>}
        </div>

        {bandSrc && (
          <div className="mq-ed-litt-band">
            <SmartImage
              src={bandSrc}
              alt=""
              role="hero"
              focal={tokens.cover.imageUrl ? tokens.cover.focal : horizon[0]?.focal}
              priority
              aspectRatio="var(--mq-aspect-hero)"
            />
          </div>
        )}

        <div className="mq-ed-litt-foot">
          <CategoryTeaser categories={categories} limit={4} separator="~" className="mq-ed-litt-teaser" />
          <EditionContact restaurant={restaurant} className="mq-ed-litt-contact" />
        </div>
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-litt-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-litt-body">
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">This menu has no dishes yet.</p>
          )
        ) : (
          sections.map((category, sectionIndex) => {
            // Each course opens with its own photograph, taken from that course's own dishes so
            // the strip always belongs to the section it heads.
            const strip = category.items.find((item) => item.imageUrl);
            return (
              <section
                key={category.id}
                className="mq-ed-litt-section"
                aria-labelledby={`mq-ed-litt-${category.id}`}
              >
                <div className="mq-ed-litt-section-head">
                  <span className="mq-ed-litt-section-index" aria-hidden="true">
                    {String(sectionIndex + 1).padStart(2, '0')}
                  </span>
                  <h2 id={`mq-ed-litt-${category.id}`} className="mq-ed-litt-section-title">
                    {category.name}
                  </h2>
                  <WaveRule className="mq-ed-litt-wave mq-ed-litt-wave-inline" />
                </div>

                {strip?.imageUrl && !compact && (
                  <div className="mq-ed-litt-strip">
                    <SmartImage
                      src={strip.imageUrl}
                      alt={strip.name}
                      role="card"
                      focal={strip.focal}
                      aspectRatio="var(--mq-aspect-hero)"
                    />
                  </div>
                )}

                <div className="mq-ed-litt-list">
                  {category.items.map((item) => (
                    <Leader key={item.id} item={item} readOnly={readOnly} showFlags={!compact} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      <footer className="mq-ed-litt-footer">
        <WaveRule className="mq-ed-litt-wave" />
        <p className="mq-ed-litt-foot-name">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default LittoraleEdition;

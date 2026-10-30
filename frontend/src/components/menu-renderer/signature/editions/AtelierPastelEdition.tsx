/**
 * MENUQR Edition — Atelier Pastel
 *
 * Patisserie: a scalloped arch window holding the hero photograph, a hairline monogram, and an
 * interior of soft two-column cards. The scallop is a repeating radial mask rather than a
 * border-image, so it stays crisp at any width and takes the palette's surface colour.
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import {
  BrandMark,
  EditionContact,
  PhotoDish,
  liveCategories,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

export const AtelierPastelEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const sections = liveCategories(visible);
  const window = useFeatured(categories, 1)[0];
  const heroSrc = tokens.cover.imageUrl ?? window?.imageUrl;

  return (
    <div className={compact ? 'mq-ed mq-ed-pastel is-compact' : 'mq-ed mq-ed-pastel'}>
      <header className="mq-ed-pastel-cover" data-edition-cover="atelier-pastel">
        <div className="mq-ed-pastel-arch">
          {heroSrc ? (
            <SmartImage
              src={heroSrc}
              alt=""
              role="hero"
              focal={tokens.cover.imageUrl ? tokens.cover.focal : window?.focal}
              priority
              aspectRatio="var(--mq-aspect-portrait)"
            />
          ) : (
            <span className="mq-ed-pastel-arch-empty" aria-hidden="true" />
          )}
          <span className="mq-ed-pastel-arch-ring" aria-hidden="true" />
        </div>

        <div className="mq-ed-pastel-cover-body">
          <BrandMark restaurant={restaurant} size={compact ? 30 : 46} className="mq-ed-mark-ring" />
          {restaurant.cuisine && <p className="mq-ed-pastel-cuisine">{restaurant.cuisine}</p>}
          <h1 className="mq-ed-pastel-title">{restaurant.name}</h1>
          {restaurant.tagline && <p className="mq-ed-pastel-tagline">{restaurant.tagline}</p>}
          <EditionContact restaurant={restaurant} className="mq-ed-pastel-contact" />
        </div>

        <span className="mq-ed-pastel-scallop" aria-hidden="true" />
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-pastel-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-pastel-body">
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
              className="mq-ed-pastel-section"
              aria-labelledby={`mq-ed-pastel-${category.id}`}
            >
              <div className="mq-ed-pastel-ribbon">
                <h2 id={`mq-ed-pastel-${category.id}`}>{category.name}</h2>
              </div>
              {category.description && (
                <p className="mq-ed-pastel-section-note">{category.description}</p>
              )}

              <div className="mq-ed-pastel-grid">
                {category.items.map((item) => (
                  <PhotoDish
                    key={item.id}
                    item={item}
                    readOnly={readOnly}
                    aspect="var(--mq-aspect-square)"
                    className="mq-ed-pastel-card"
                    eyebrow={item.isBestseller ? 'Maison Favourite' : undefined}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="mq-ed-pastel-foot">
        <span className="mq-ed-pastel-scallop mq-ed-pastel-scallop-up" aria-hidden="true" />
        <p className="mq-ed-pastel-foot-name">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} />
      </footer>
    </div>
  );
};

export default AtelierPastelEdition;

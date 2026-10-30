/**
 * MENUQR Edition — Presse Brut
 *
 * Brutalist type specimen: no ornament at all, by design. The restaurant name is set oversized
 * and tight enough to crop against the page edge, metadata runs in a monospaced register, and
 * every dish is numbered. The hierarchy is produced entirely by scale, weight and rule weight.
 *
 * This is the Edition that proves the catalogue is not "one ornament engine with ten skins" —
 * strip the ornament and the composition still has to stand up, and here it does it alone.
 */

import React from 'react';
import { useMenuTheme } from '../../MenuThemeProvider.tsx';
import { useMenuFilters } from '../../useMenuFilters.ts';
import { SmartImage } from '../../primitives/SmartImage.tsx';
import { EmptyResults, MenuToolbar } from '../../primitives/MenuToolbar.tsx';
import { DietMark, DishFlags, DishPrice } from '../../primitives/DishMeta.tsx';
import {
  EditionContact,
  cleanDescription,
  liveCategories,
  locationLine,
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

export const PresseBrutEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const sections = liveCategories(visible);
  const slab = useFeatured(categories, 1)[0];
  const total = categories.reduce((sum, category) => sum + category.items.length, 0);

  return (
    <div className={compact ? 'mq-ed mq-ed-brut is-compact' : 'mq-ed mq-ed-brut'}>
      <header className="mq-ed-brut-cover" data-edition-cover="presse-brut">
        <div className="mq-ed-brut-meta" data-testid="mq-cover-mark">
          <span>{restaurant.cuisine || 'Kitchen'}</span>
          <span>{String(total).padStart(3, '0')} Items</span>
          <span>{restaurant.city || 'Menu'}</span>
        </div>

        <h1 className="mq-ed-brut-title">{restaurant.name}</h1>

        <span className="mq-ed-brut-bar" aria-hidden="true" />

        <div className="mq-ed-brut-cover-foot">
          <div className="mq-ed-brut-cover-copy">
            {restaurant.tagline && <p className="mq-ed-brut-tagline">{restaurant.tagline}</p>}
            <EditionContact restaurant={restaurant} separator="/" className="mq-ed-brut-contact" />
          </div>

          {slab?.imageUrl && !compact && (
            <div className="mq-ed-brut-slab">
              <SmartImage
                src={slab.imageUrl}
                alt={slab.name}
                role="card"
                focal={slab.focal}
                aspectRatio="var(--mq-aspect-square)"
              />
              <span className="mq-ed-brut-slab-tag">{slab.name}</span>
            </div>
          )}
        </div>

        {restaurant.logoUrl && (
          <img src={restaurant.logoUrl} alt="" className="mq-ed-brut-logo" loading="eager" decoding="async" />
        )}
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-brut-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-brut-body">
        {sections.length === 0 ? (
          hasQuery ? (
            <EmptyResults query={query.trim()} onClear={() => setQuery('')} />
          ) : (
            <p className="mq-ed-empty" role="status">This menu has no dishes yet.</p>
          )
        ) : (
          sections.map((category, sectionIndex) => (
            <section
              key={category.id}
              className="mq-ed-brut-section"
              aria-labelledby={`mq-ed-brut-${category.id}`}
            >
              <h2 id={`mq-ed-brut-${category.id}`} className="mq-ed-brut-section-title">
                <span className="mq-ed-brut-section-index">
                  {String(sectionIndex + 1).padStart(2, '0')}
                </span>
                <span>{category.name}</span>
              </h2>

              <ol className="mq-ed-brut-list">
                {category.items.map((item, index) => {
                  const description = cleanDescription(item);
                  return (
                    <li key={item.id} className="mq-ed-brut-row">
                      <span className="mq-ed-brut-row-index" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="mq-ed-brut-row-main">
                        <div className="mq-ed-brut-row-title">
                          <DietMark type={item.dietType} />
                          <h4 className="mq-ed-leader-name">{item.name}</h4>
                        </div>
                        {description && <p className="mq-ed-leader-desc">{description}</p>}
                        <div className="mq-ed-leader-flags">
                          <DishFlags item={item} />
                        </div>
                      </div>
                      <span className="mq-ed-brut-row-price">
                        <DishPrice item={item} readOnly={readOnly} />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))
        )}
      </main>

      <footer className="mq-ed-brut-foot">
        <span className="mq-ed-brut-bar" aria-hidden="true" />
        <p className="mq-ed-brut-foot-name">{restaurant.name}</p>
        <p className="mq-ed-brut-foot-meta">{locationLine(restaurant) || restaurant.phone}</p>
      </footer>
    </div>
  );
};

export default PresseBrutEdition;

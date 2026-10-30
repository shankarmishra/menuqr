/**
 * MENUQR Edition — Neon Ichiban
 *
 * Late-night counter: the restaurant name set oversized with a hard offset copy behind it in the
 * accent — a printed-misregistration effect, not a glow filter — plus a measured grid overlay
 * and rotated sticker badges. The interior is photo-forward tiles with hard-edge price tags.
 *
 * The offset layer is `aria-hidden` and duplicated in the DOM rather than drawn with
 * `text-shadow`, because a shadow cannot be given its own colour stop crisply at every size.
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
  useFeatured,
  type EditionProps,
} from './shared.tsx';
import './editions.css';
import './editions-b.css';

export const NeonIchibanEdition: React.FC<EditionProps> = ({
  restaurant,
  categories,
  compact,
  readOnly,
}) => {
  const tokens = useMenuTheme();
  const { query, setQuery, dietFilter, setDietFilter, counts, visible, hasQuery } =
    useMenuFilters(categories);
  const sections = liveCategories(visible);
  const hero = useFeatured(categories, 1)[0];
  const heroSrc = tokens.cover.imageUrl ?? hero?.imageUrl;

  return (
    <div className={compact ? 'mq-ed mq-ed-neon is-compact' : 'mq-ed mq-ed-neon'}>
      <header className="mq-ed-neon-cover" data-edition-cover="neon-ichiban">
        <span className="mq-ed-neon-grid" aria-hidden="true" />

        <div className="mq-ed-neon-cover-body">
          {restaurant.cuisine && (
            <p className="mq-ed-neon-kicker">
              <span className="mq-ed-neon-blip" aria-hidden="true" />
              {restaurant.cuisine}
            </p>
          )}

          <div className="mq-ed-neon-wordmark" data-testid="mq-cover-mark">
            <span className="mq-ed-neon-wordmark-echo" aria-hidden="true">{restaurant.name}</span>
            <h1 className="mq-ed-neon-title">{restaurant.name}</h1>
          </div>

          {restaurant.tagline && <p className="mq-ed-neon-tagline">{restaurant.tagline}</p>}

          <div className="mq-ed-neon-stickers" aria-hidden="true">
            <span className="mq-ed-neon-sticker mq-ed-neon-sticker-a">Open Late</span>
            <span className="mq-ed-neon-sticker mq-ed-neon-sticker-b">Counter Only</span>
          </div>
        </div>

        {heroSrc && (
          <div className="mq-ed-neon-hero">
            <SmartImage
              src={heroSrc}
              alt=""
              role="hero"
              focal={tokens.cover.imageUrl ? tokens.cover.focal : hero?.focal}
              priority
              aspectRatio="var(--mq-aspect-card)"
            />
            {hero && <span className="mq-ed-neon-hero-tag">{hero.name}</span>}
          </div>
        )}

        <EditionContact restaurant={restaurant} separator="•" className="mq-ed-neon-contact" />
      </header>

      {!compact && (
        <>
          {tokens.announcement && (
            <p className="mq-ed-neon-announce" role="note">{tokens.announcement}</p>
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

      <main className="mq-ed-neon-body">
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
              className="mq-ed-neon-section"
              aria-labelledby={`mq-ed-neon-${category.id}`}
            >
              <h2 id={`mq-ed-neon-${category.id}`} className="mq-ed-neon-section-title">
                <span>{category.name}</span>
                <span className="mq-ed-neon-section-count">{category.items.length}</span>
              </h2>

              <div className="mq-ed-neon-grid-list">
                {category.items.map((item) => {
                  const description = cleanDescription(item);
                  return (
                    <article key={item.id} className="mq-ed-neon-tile">
                      {item.imageUrl && (
                        <div className="mq-ed-neon-tile-media">
                          <SmartImage
                            src={item.imageUrl}
                            alt={item.name}
                            role="card"
                            focal={item.focal}
                            aspectRatio="var(--mq-aspect-card)"
                          />
                        </div>
                      )}
                      <div className="mq-ed-neon-tile-body">
                        <div className="mq-ed-neon-tile-title">
                          <DietMark type={item.dietType} />
                          <h4 className="mq-ed-leader-name">{item.name}</h4>
                        </div>
                        {description && <p className="mq-ed-leader-desc mq-clamp-2">{description}</p>}
                        <div className="mq-ed-neon-tile-foot">
                          <span className="mq-ed-neon-tag">
                            <DishPrice item={item} readOnly={readOnly} />
                          </span>
                          <DishFlags item={item} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="mq-ed-neon-foot">
        <p className="mq-ed-neon-foot-name">{restaurant.name}</p>
        <EditionContact restaurant={restaurant} separator="•" />
      </footer>
    </div>
  );
};

export default NeonIchibanEdition;

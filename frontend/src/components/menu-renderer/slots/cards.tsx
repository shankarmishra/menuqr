/**
 * MENUQR Menu Renderer — Dish Card Slots
 *
 * The highest-impact choice an owner makes, because it is repeated for every item on the menu.
 * A 180-item dhaba list and a 12-course tasting menu need genuinely different presentations, and
 * forcing one layout on both is the main reason the old templates looked wrong for most clients.
 *
 * Every card shares the same primitives (`DietMark`, `DishPrice`, `DishFlags`, `SmartImage`), so
 * ordering behaviour, diet marks and image handling cannot drift between layouts.
 */

import React from 'react';
import { DietMark, DishFlags, DishPrice } from '../primitives/DishMeta.tsx';
import { SmartImage } from '../primitives/SmartImage.tsx';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import type { DishCardSlot } from '../../../design-system/theme.types.ts';
import type { RenderMenuItem } from '../types.ts';

export type DishCardProps = {
  item: RenderMenuItem;
  /** Index within its category, used to prioritise only the first image above the fold. */
  index: number;
  compact?: boolean;
  /** Hides ordering controls, e.g. in a print export or the gallery preview. */
  readOnly?: boolean;
};

/**
 * `parseItemPricing` strips portion text ("Half: 6 pieces") out of the description so it is not
 * duplicated beside the price. Falling back to the raw description keeps copy from vanishing if
 * the parser finds nothing to clean.
 */
function dishDescription(item: RenderMenuItem): string {
  const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
  return (pricing.cleanDescription ?? item.description ?? '').trim();
}

/**
 * Container layout each card expects. Exposed so `MenuRenderer` can set up the right wrapper —
 * a bento tile is meaningless outside a grid, and a compact row is meaningless inside one.
 */
export const DISH_CARD_CONTAINER: Record<DishCardSlot, React.CSSProperties> = {
  magazine: { display: 'grid', gap: 'var(--mq-space-5)' },
  'michelin-leader': { display: 'grid', gap: 'var(--mq-space-5)' },
  'compact-row': { display: 'grid', gap: 'var(--mq-space-2)' },
  'bento-tile': {
    display: 'grid',
    gap: 'var(--mq-space-3)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(10.5rem, 1fr))',
  },
};

/**
 * Magazine — a large 16:9 photograph above the text.
 *
 * The highest-converting layout when the client has real photography, and the worst when they
 * do not, which is why the photo library work in Phase 3 pairs with it.
 */
export const MagazineCard: React.FC<DishCardProps> = ({ item, index, readOnly }) => {
  const description = dishDescription(item);

  return (
    <article className="mq-card mq-card-lg" style={{ overflow: 'hidden' }}>
      {item.imageUrl && (
        <SmartImage
          src={item.imageUrl}
          alt={item.name}
          role="card"
          focal={item.focal}
          aspectRatio="var(--mq-aspect-hero)"
          priority={index === 0}
          className="mq-image-frame-flush"
        />
      )}
      <div className="mq-stack" style={{ padding: 'var(--mq-space-4)' }}>
        <div className="mq-row" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <DietMark type={item.dietType} />
          <h3 className="mq-dish-name mq-grow">{item.name}</h3>
          <DishFlags item={item} />
        </div>
        {description && <p className="mq-dish-desc mq-clamp-2">{description}</p>}
        <div className="mq-row-between" style={{ alignItems: 'center' }}>
          <DishPrice item={item} readOnly={readOnly} />
        </div>
      </div>
    </article>
  );
};

/**
 * Michelin leader — name, dotted rule, price, with the description beneath.
 *
 * The classic fine-dining form. Photographs are reduced to a small thumbnail because at this
 * price point the typography is the product; a large photo actively cheapens it.
 */
export const MichelinLeaderCard: React.FC<DishCardProps> = ({ item, readOnly }) => {
  const description = dishDescription(item);

  return (
    <article className="mq-stack" style={{ gap: 'var(--mq-space-1)' }}>
      <div className="mq-row" style={{ alignItems: 'baseline' }}>
        <DietMark type={item.dietType} />
        <h3 className="mq-dish-name" style={{ fontWeight: 600 }}>
          {item.name}
        </h3>
        {/* The leader is a flexible rule rather than a row of dot characters, so it stays aligned
         * at any zoom level and is skipped by screen readers. */}
        <span
          aria-hidden="true"
          className="mq-grow"
          style={{
            alignSelf: 'center',
            height: 1,
            minWidth: 'var(--mq-space-4)',
            borderBottom: '1px dotted var(--mq-color-border-strong)',
          }}
        />
        <DishPrice item={item} readOnly={readOnly} />
      </div>

      {(description || item.isBestseller || item.isSpecial) && (
        <div className="mq-row" style={{ alignItems: 'flex-start' }}>
          {item.imageUrl && (
            <SmartImage
              src={item.imageUrl}
              alt={item.name}
              role="thumb"
              focal={item.focal}
              aspectRatio="var(--mq-aspect-square)"
              className="mq-thumb"
            />
          )}
          <div className="mq-grow mq-stack" style={{ gap: 'var(--mq-space-1)' }}>
            {description && <p className="mq-dish-desc">{description}</p>}
            <div className="mq-row">
              <DishFlags item={item} />
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

/**
 * Compact row — maximum items per screen, no photography.
 *
 * For dhabas, fast casual and anywhere the diner already knows what they want and is scanning
 * for a price. Dropping images here is the point, not a compromise: it is what makes a long menu
 * usable and fast on mobile data.
 */
export const CompactRowCard: React.FC<DishCardProps> = ({ item, readOnly }) => (
  <article
    className="mq-row"
    style={{
      alignItems: 'center',
      paddingBlock: 'var(--mq-space-2)',
      borderBottom: '1px solid var(--mq-color-border)',
    }}
  >
    <DietMark type={item.dietType} />
    <div className="mq-grow" style={{ minWidth: 0 }}>
      <h3 className="mq-dish-name" style={{ fontSize: 'var(--mq-text-sm)' }}>
        {item.name}
      </h3>
    </div>
    <DishFlags item={item} />
    <DishPrice item={item} readOnly={readOnly} />
  </article>
);

/**
 * Bento tile — square photo tiles in a responsive grid.
 *
 * Suits cocktails, desserts, sushi and burgers: categories where the diner chooses by sight.
 * The grid uses `auto-fill` so it is two columns on a phone and four on a tablet without the
 * preset needing to know anything about viewports.
 */
export const BentoTileCard: React.FC<DishCardProps> = ({ item, index, readOnly }) => (
  <article className="mq-card" style={{ overflow: 'hidden' }}>
    <SmartImage
      src={item.imageUrl}
      alt={item.name}
      role="card"
      focal={item.focal}
      aspectRatio="var(--mq-aspect-square)"
      priority={index === 0}
    />
    <div className="mq-stack" style={{ padding: 'var(--mq-space-3)', gap: 'var(--mq-space-1)' }}>
      <div className="mq-row" style={{ alignItems: 'center' }}>
        <DietMark type={item.dietType} />
        <h3 className="mq-dish-name mq-grow mq-clamp-2" style={{ fontSize: 'var(--mq-text-sm)' }}>
          {item.name}
        </h3>
      </div>
      <DishPrice item={item} readOnly={readOnly} />
    </div>
  </article>
);

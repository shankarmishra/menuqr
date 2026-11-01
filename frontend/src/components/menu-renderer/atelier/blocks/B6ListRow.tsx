import React from 'react';
import type { RenderMenuItem } from '../../types.ts';
import { DietMark, DishFlags, DishPrice } from '../../primitives/DishMeta.tsx';
import { cleanDescription } from '../../signature/editions/shared.tsx';
import { SmartImage } from '../../primitives/SmartImage.tsx';

export interface B6ListRowProps {
  item: RenderMenuItem;
  index: number;
  readOnly?: boolean;
}

export const B6ListRow: React.FC<B6ListRowProps> = ({ item, index, readOnly }) => {
  const hindiName = (item as any).i18n?.hi?.name || (item as any).hindiName || (item as any).hindi;
  const description = cleanDescription(item);
  const hasImage = Boolean(item.imageUrl);

  return (
    <article className="atelier-b6-row" data-dish-index={index}>
      <div className="atelier-dish-main-col">
        {/* Title row: Diet mark + Dish Name */}
        <div className="atelier-dish-header">
          <DietMark type={item.dietType} className="atelier-dish-diet" />
          <h3 className="atelier-dish-name mq-dish-name">
            {item.name}
          </h3>
        </div>

        {/* Optional Hindi Subtitle if present */}
        {hindiName && (
          <span className="atelier-dish-hindi-name">
            {hindiName}
          </span>
        )}

        {/* Clean Description */}
        {description && (
          <p className="atelier-dish-desc mq-dish-desc">
            {description}
          </p>
        )}

        {/* Dish Flags (Bestseller, Chef's Special, Spicy level, etc.) */}
        <div className="atelier-dish-flags">
          <DishFlags item={item} />
        </div>

        {/* Price & Variants & Quantity Controls */}
        <div className="atelier-dish-price-wrap">
          <DishPrice item={item} readOnly={readOnly} />
        </div>
      </div>

      {/* Dish Photo Thumbnail (only rendered when an image exists) */}
      {hasImage && (
        <div className="atelier-dish-media">
          <SmartImage
            src={item.imageUrl!}
            alt={item.name}
            role="card"
            focal={item.focal}
            aspectRatio="1/1"
            className="atelier-dish-img"
          />
        </div>
      )}
    </article>
  );
};

export default B6ListRow;

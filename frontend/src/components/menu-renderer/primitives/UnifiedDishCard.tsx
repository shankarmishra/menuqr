/**
 * MENUQR Menu Renderer — UnifiedDishCard Primitive
 *
 * Implements the Unified Split-Row Menu Experience across MENUQR templates under layoutVersion: 2:
 * - Left column:
 *   - Top: DietMark (FSSAI green/red/brown symbol)
 *   - Dish Name (prominent bold title)
 *   - Badges / Flags (Bestseller, Chef's Special, Jain, Eggless, Spicy, Allergens)
 *   - Description (clean, muted, with accessible "Read more" expansion if >110 chars)
 *   - Bottom row: Price on left, ADD / Stepper button on right (situated next to price)
 * - Right column: Compact, clean food photo thumbnail (1:1 squircle) with rounded corners, completely
 *   unobstructed by action buttons.
 * - Elastic no-image layout: When item.imageUrl is absent, the thumbnail container is completely omitted
 *   and the food information expands smoothly to 100% width with zero placeholder gaps.
 * - Strict plan gating: ADD button and Stepper render ONLY when canOrder is true (cart.isPremium && cart.onAddToCart).
 */

import React, { useState } from 'react';
import { DietMark, DishFlags } from './DishMeta.tsx';
import { SmartImage } from './SmartImage.tsx';
import { useMenuCart } from '../../menu-builder/templates/shared/MenuCartContext';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import type { RenderMenuItem } from '../types.ts';
import './UnifiedDishCard.css';

export interface UnifiedDishCardProps {
  item: RenderMenuItem;
  index?: number;
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const UnifiedDishDescription: React.FC<{
  text?: string | null;
  maxLength?: number;
}> = ({ text, maxLength = 110 }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > maxLength;
  const displayText = isLong && !expanded ? `${text.slice(0, maxLength).trimEnd()}…` : text;

  return (
    <p className="mq-dish-desc mq-unified-desc">
      {displayText}{' '}
      {isLong && (
        <button
          type="button"
          className="mq-unified-more-btn"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          aria-expanded={expanded}
        >
          {expanded ? 'Less' : 'Read more'}
        </button>
      )}
    </p>
  );
};

export const UnifiedDishCard: React.FC<UnifiedDishCardProps> = ({
  item,
  index,
  readOnly = false,
  className = '',
  style,
}) => {
  const cart = useMenuCart();
  const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
  const cleanDescription = (pricing.cleanDescription ?? item.description ?? '').trim();

  // Entitlement check: ordering is strictly enabled ONLY when onAddToCart exists and plan is premium/authorized
  const canOrder = !readOnly && Boolean(cart.isPremium && cart.onAddToCart);

  const pricedVariants = pricing.variants.filter((v) => v.price != null && Number(v.price) > 0);
  const hasVariants = pricedVariants.length > 0;
  const hasMultipleVariants = pricedVariants.length > 1;

  // Single item quantity tracking
  const quantity = cart.getItemQuantity?.(item.id) ?? 0;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) return;
    if (canOrder && cart.onCustomizeDish) {
      cart.onCustomizeDish(item);
    }
  };

  const hasImage = Boolean(item.imageUrl);

  const renderAddAction = () => {
    if (!canOrder) return null;

    if (hasMultipleVariants || Boolean(item.variants && item.variants.length > 1)) {
      return (
        <button
          type="button"
          className="mq-unified-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            cart.onCustomizeDish?.(item);
          }}
          aria-label={`Customise options for ${item.name}`}
        >
          <span className="mq-unified-add-plus">+</span>
          <span>ADD</span>
        </button>
      );
    }

    const priceToAdd = String(pricing.basePrice ?? item.price ?? '');

    if (quantity === 0) {
      return (
        <button
          type="button"
          className="mq-unified-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            cart.onAddToCart?.(item, priceToAdd);
          }}
          aria-label={`Add ${item.name} to order`}
        >
          <span className="mq-unified-add-plus">+</span>
          <span>ADD</span>
        </button>
      );
    }

    return (
      <div className="mq-unified-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
        <button
          type="button"
          className="mq-unified-step-btn"
          onClick={(e) => {
            e.stopPropagation();
            cart.onRemoveFromCart?.(item.id);
          }}
          aria-label={`Reduce quantity of ${item.name}`}
        >
          &minus;
        </button>
        <span className="mq-unified-step-count" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          className="mq-unified-step-btn"
          onClick={(e) => {
            e.stopPropagation();
            cart.onAddToCart?.(item, priceToAdd);
          }}
          aria-label={`Increase quantity of ${item.name}`}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <article
      className={[
        'mq-unified-dish-card',
        hasImage ? 'has-image' : 'mq-no-image',
        canOrder && cart.onCustomizeDish ? 'is-customizable' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleCardClick}
      style={style}
    >
      {/* Left Column: Food Information */}
      <div className="mq-unified-info">
        <div className="mq-unified-meta-top">
          {typeof index === 'number' && (
            <span className="mq-unified-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
          <DietMark type={item.dietType} />
        </div>

        <h3 className="mq-dish-name mq-unified-dish-name">{item.name}</h3>

        <div className="mq-unified-flags-row">
          <DishFlags item={item} />
        </div>

        {cleanDescription && <UnifiedDishDescription text={cleanDescription} />}

        <div className="mq-unified-bottom-row">
          <div className="mq-unified-price-wrap">
            {hasVariants ? (
              hasMultipleVariants ? (
                <div className="mq-unified-variant-pills">
                  {pricedVariants.map((v) => (
                    <span key={v.label} className="mq-unified-variant-pill">
                      <span className="mq-unified-v-label">{v.label}</span>
                      <span className="mq-price mq-unified-v-price">{v.formattedPrice}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <span className="mq-price mq-unified-price">{pricedVariants[0].formattedPrice}</span>
              )
            ) : (
              pricing.formattedBasePrice && Number(pricing.basePrice) > 0 && (
                <span className="mq-price mq-unified-price">{pricing.formattedBasePrice}</span>
              )
            )}
          </div>

          {canOrder && (
            <div className="mq-unified-action-slot">{renderAddAction()}</div>
          )}
        </div>
      </div>

      {/* Right Column: Clean Food Photograph Thumbnail */}
      {hasImage && (
        <div className="mq-unified-media-col">
          <div className="mq-unified-thumb-wrapper">
            <SmartImage
              src={item.imageUrl!}
              alt={item.name}
              role="thumb"
              focal={item.focal}
              aspectRatio="1"
              className="mq-unified-thumb-img"
            />
          </div>
        </div>
      )}
    </article>
  );
};

export default UnifiedDishCard;

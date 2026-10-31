/**
 * MENUQR Menu Renderer — Dish Metadata Primitives
 *
 * Diet marks, prices and badges. These are the pieces every dish-card slot shares, so they live
 * here once rather than being re-implemented per layout — which is how the old templates ended
 * up with five slightly different veg indicators.
 *
 * Pricing *logic* is reused from the existing
 * `components/menu-builder/templates/shared/pricingUtils.ts`: it already handles structured
 * variants, half/full, regular/medium/large, Indian digit grouping and description cleanup, and
 * that logic is genuinely good. Only the *presentation* is new, because the old presentation
 * hardcoded colours and sub-12px type.
 */

import React from 'react';
import { parseItemPricing } from '../../menu-builder/templates/shared/pricingUtils';
import { useMenuCart } from '../../menu-builder/templates/shared/MenuCartContext';
import type { DietType, RenderMenuItem } from '../types.ts';

// --------------------------------------- diet mark ---------------------------------------

export const DietMark: React.FC<{ type?: DietType; className?: string }> = ({ type, className }) => {
  // Vegan is marked with the vegetarian glyph, matching Indian menu convention.
  const isVeg = type === 'veg' || type === 'vegan' || !type;
  const label = isVeg ? (type === 'vegan' ? 'Vegan' : 'Vegetarian') : 'Non-vegetarian';

  return (
    <span
      className={['mq-diet', isVeg ? 'mq-diet-veg' : 'mq-diet-non-veg', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="mq-diet-glyph" />
    </span>
  );
};

/** Prominent FSSAI-compliant Veg / Non-Veg badge with regulatory symbol and clear text */
export const FssaiBadge: React.FC<{ type?: DietType; className?: string; prominent?: boolean }> = ({
  type,
  className,
  prominent = false,
}) => {
  const isVeg = type === 'veg' || type === 'vegan' || !type;
  const label = isVeg ? (type === 'vegan' ? '100% VEGAN' : '100% PURE VEG') : 'NON-VEG';

  if (!prominent) {
    return <DietMark type={type} className={className} />;
  }

  return (
    <span
      className={`mq-fssai-badge ${isVeg ? 'is-veg' : 'is-nonveg'} ${className || ''}`}
      role="img"
      aria-label={label}
      title={`FSSAI Verified: ${label}`}
    >
      <span className="mq-fssai-symbol" aria-hidden="true">
        <span className="mq-fssai-dot" />
      </span>
      <span className="mq-fssai-label">{label}</span>
    </span>
  );
};

// ----------------------------------------- badges -----------------------------------------

export const Badge: React.FC<{ children: React.ReactNode; quiet?: boolean }> = ({ children, quiet }) => (
  <span className={quiet ? 'mq-badge mq-badge-quiet' : 'mq-badge'}>{children}</span>
);

/** Bestseller and chef-special flags, rendered consistently across every card layout. */
export const DishFlags: React.FC<{ item: RenderMenuItem }> = ({ item }) => {
  const tags = item.tags;
  const spice = Math.max(item.spicyLevel ?? 0, tags?.spice ?? 0);
  const allergens = tags?.allergens ?? [];
  const isNew = Boolean(tags?.badges?.includes('new'));
  const hasAny =
    item.isBestseller || item.isSpecial || item.trending || isNew || spice > 0 || tags?.jain || tags?.eggless || allergens.length > 0;
  if (!hasAny) return null;
  return (
    <>
      {item.isBestseller && <Badge>Bestseller</Badge>}
      {item.trending && !item.isBestseller && <Badge>🔥 Trending</Badge>}
      {item.isSpecial && !item.isBestseller && <Badge quiet>Chef&rsquo;s Special</Badge>}
      {isNew && <Badge quiet>New</Badge>}
      {tags?.jain && <Badge quiet>Jain</Badge>}
      {tags?.eggless && <Badge quiet>Eggless</Badge>}
      {spice > 0 && (
        <span className="mq-badge mq-badge-quiet" title={`Spice level ${spice} of 3`} aria-label={`Spice level ${spice} of 3`}>
          {'🌶️'.repeat(spice)}
        </span>
      )}
      {allergens.length > 0 && (
        <span className="mq-badge mq-badge-quiet" title={`Contains: ${allergens.join(', ')}`}>
          Contains {allergens.join(', ')}
        </span>
      )}
    </>
  );
};


// ------------------------------------ beverage customizer ------------------------------------

export type BeverageChoice = {
  temp: 'hot' | 'iced';
  milk: 'oat' | 'almond' | 'whole' | 'soy';
  sweetness: 'standard' | 'half' | 'none';
};

/**
 * Beverage customization selector for Artisan Bakery & Café Archetype.
 * Supports Iced/Hot temperature toggle and artisan milk choices (Oat, Almond, Whole, Soy).
 */
export const BeverageCustomizer: React.FC<{
  onChange?: (choice: BeverageChoice) => void;
  compact?: boolean;
}> = ({ onChange, compact = false }) => {
  const [temp, setTemp] = React.useState<'hot' | 'iced'>('hot');
  const [milk, setMilk] = React.useState<'oat' | 'almond' | 'whole' | 'soy'>('oat');

  const handleTemp = (t: 'hot' | 'iced') => {
    setTemp(t);
    onChange?.({ temp: t, milk, sweetness: 'standard' });
  };

  const handleMilk = (m: 'oat' | 'almond' | 'whole' | 'soy') => {
    setMilk(m);
    onChange?.({ temp, milk: m, sweetness: 'standard' });
  };

  return (
    <div className={`mq-beverage-customizer ${compact ? 'is-compact' : ''}`}>
      <div className="mq-bev-row">
        <span className="mq-bev-label">Temp:</span>
        <div className="mq-bev-group" role="radiogroup" aria-label="Temperature choice">
          <button
            type="button"
            className={`mq-bev-pill ${temp === 'hot' ? 'is-active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleTemp('hot'); }}
            aria-label="Hot beverage"
          >
            Hot ♨️
          </button>
          <button
            type="button"
            className={`mq-bev-pill ${temp === 'iced' ? 'is-active' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleTemp('iced'); }}
            aria-label="Iced beverage"
          >
            Iced 🧊
          </button>
        </div>
      </div>
      <div className="mq-bev-row">
        <span className="mq-bev-label">Milk:</span>
        <div className="mq-bev-group mq-bev-milk-group" role="radiogroup" aria-label="Milk choice">
          {(['oat', 'almond', 'whole', 'soy'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={`mq-bev-pill mq-bev-pill-milk ${milk === m ? 'is-active' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleMilk(m); }}
              aria-label={`${m} milk option`}
            >
              {m === 'oat' ? '🌾 Oat' : m === 'almond' ? '🌰 Almond' : m === 'whole' ? '🥛 Whole' : '🌱 Soy'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------ speed ordering ------------------------------------

/**
 * Speed-ordering button for Street Food & Fast-Casual Archetype.
 * Enables 1-tap rapid cart add with high-contrast electric styling.
 */
export const SpeedOrderButton: React.FC<{
  item: RenderMenuItem;
  price?: string;
  variantLabel?: string;
  readOnly?: boolean;
}> = ({ item, price, variantLabel, readOnly = false }) => {
  const cart = useMenuCart();
  const quantity = cart.getItemQuantity?.(item.id, variantLabel) ?? 0;
  const canOrder = !readOnly && Boolean(cart.isPremium && cart.onAddToCart);

  if (item.soldOut || item.available === false) {
    return <span className="mq-unavailable">Sold out</span>;
  }

  if (!canOrder) {
    return null;
  }

  const effectivePrice = price || String(item.price || 0);

  if (quantity === 0) {
    return (
      <button
        type="button"
        className="mq-speed-order-btn"
        onClick={(e) => {
          e.stopPropagation();
          cart.onAddToCart?.(item, effectivePrice, variantLabel);
        }}
        aria-label={`⚡ Quick Add ${item.name} to order`}
      >
        <span className="mq-speed-icon">⚡</span>
        <span>Quick Add</span>
      </button>
    );
  }

  return (
    <span className="mq-speed-stepper">
      <button
        type="button"
        className="mq-speed-stepper-btn"
        onClick={(e) => {
          e.stopPropagation();
          cart.onRemoveFromCart?.(item.id, variantLabel);
        }}
        aria-label={`Reduce ${item.name}`}
      >
        &minus;
      </button>
      <span className="mq-speed-qty">{quantity}</span>
      <button
        type="button"
        className="mq-speed-stepper-btn"
        onClick={(e) => {
          e.stopPropagation();
          cart.onAddToCart?.(item, effectivePrice, variantLabel);
        }}
        aria-label={`Add more ${item.name}`}
      >
        +
      </button>
    </span>
  );
};

// ----------------------------------------- pricing -----------------------------------------

export type DishPriceProps = {
  item: RenderMenuItem;
  /** Hide the add-to-cart control, e.g. in the gallery preview or a print export. */
  readOnly?: boolean;
};

/**
 * Price block plus an optional quantity stepper.
 *
 * Ordering controls only appear when the plan permits them and a handler is present, matching
 * the entitlement gating `MenuTemplateRenderer` already applies.
 */
export const DishPrice: React.FC<DishPriceProps> = ({ item, readOnly = false }) => {
  const cart = useMenuCart();

  if (item.soldOut) {
    return <span className="mq-unavailable">Sold out today</span>;
  }

  if (item.availabilityNote) {
    return <span className="mq-unavailable">{item.availabilityNote}</span>;
  }

  if (item.available === false) {
    return <span className="mq-unavailable">Currently unavailable</span>;
  }

  const pricing = parseItemPricing(item as Parameters<typeof parseItemPricing>[0]);
  const canOrder = !readOnly && Boolean(cart.isPremium && cart.onAddToCart);

  if (pricing.hasVariants) {
    if (cart.onCustomizeDish) {
      return (
        <div className="mq-row" style={{ alignItems: 'center', gap: 'var(--mq-space-2)' }}>
          <span className="mq-price">{pricing.variants[0]?.formattedPrice}</span>
          {pricing.variants.length > 1 && (
            <span className="mq-price-label" style={{ fontSize: '11px', opacity: 0.85 }}>
              ({pricing.variants.length} options)
            </span>
          )}
          {canOrder && (
            <button
              type="button"
              className="mq-button"
              style={{ paddingInline: '12px', minHeight: '34px', height: '34px', fontSize: '12px' }}
              onClick={(e) => {
                e.stopPropagation();
                cart.onCustomizeDish?.(item);
              }}
              aria-label={`Customise options for ${item.name}`}
            >
              Customise +
            </button>
          )}
        </div>
      );
    }
    return (
      <div className="mq-stack" style={{ alignItems: 'flex-end' }}>
        {pricing.variants.map((variant) => (
          <div key={variant.label} className="mq-row" style={{ alignItems: 'center' }}>
            <span className="mq-price-label">{variant.label}</span>
            <span className="mq-price">{variant.formattedPrice}</span>
            {canOrder && <Stepper item={item} variantLabel={variant.label} price={String(variant.price)} />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mq-row" style={{ alignItems: 'center' }}>
      {pricing.formattedBasePrice && <span className="mq-price">{pricing.formattedBasePrice}</span>}
      {canOrder && <Stepper item={item} price={String(pricing.basePrice ?? item.price)} />}
    </div>
  );
};

const Stepper: React.FC<{ item: RenderMenuItem; price: string; variantLabel?: string }> = ({
  item,
  price,
  variantLabel,
}) => {
  const cart = useMenuCart();
  const quantity = cart.getItemQuantity?.(item.id, variantLabel) ?? 0;

  const suffix = variantLabel ? ` (${variantLabel})` : '';

  if (quantity === 0) {
    return (
      <button
        type="button"
        className="mq-button"
        onClick={(event) => {
          event.stopPropagation();
          cart.onAddToCart?.(item, price, variantLabel);
        }}
        aria-label={`Add ${item.name}${suffix} to your order`}
      >
        Add
      </button>
    );
  }

  return (
    <span className="mq-row" style={{ alignItems: 'center', gap: 'var(--mq-space-1)' }}>
      <button
        type="button"
        className="mq-button mq-button-quiet"
        onClick={(event) => {
          event.stopPropagation();
          cart.onRemoveFromCart?.(item.id, variantLabel);
        }}
        aria-label={
          quantity === 1
            ? `Remove ${item.name}${suffix} from your order`
            : `Reduce ${item.name}${suffix} to ${quantity - 1}`
        }
      >
        &minus;
      </button>
      <span className="mq-price" aria-live="polite">
        {quantity}
        <span className="mq-sr-only"> {item.name}{suffix} in your order</span>
      </span>
      <button
        type="button"
        className="mq-button"
        onClick={(event) => {
          event.stopPropagation();
          cart.onAddToCart?.(item, price, variantLabel);
        }}
        aria-label={`Increase ${item.name}${suffix} to ${quantity + 1}`}
      >
        +
      </button>
    </span>
  );
};

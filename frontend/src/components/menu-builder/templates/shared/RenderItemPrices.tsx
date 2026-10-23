import React from 'react';
import clsx from 'clsx';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { MenuItem } from '../types';
import { formatIndianPrice, parseItemPricing } from './pricingUtils';
import { useMenuCart } from './MenuCartContext';

export const FormatPrice = formatIndianPrice;
export { parseItemPricing, formatIndianPrice };

export const DietIndicator: React.FC<{
  type: 'veg' | 'non-veg' | 'vegan';
  compact?: boolean;
  color?: string;
  className?: string;
}> = ({ type, compact, color, className = '' }) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const borderColor = color || (isVeg ? '#2E7D32' : '#D32F2F');
  const dotColor = color || (isVeg ? '#2E7D32' : '#D32F2F');
  const size = compact ? 'w-3 h-3 p-[1px]' : 'w-3.5 h-3.5 p-0.5';

  return (
    <span
      className={`inline-flex items-center justify-center border shrink-0 ${size} ${className}`}
      style={{ borderColor }}
      title={type.toUpperCase()}
    >
      <span className="w-full h-full rounded-full" style={{ backgroundColor: dotColor }} />
    </span>
  );
};

export const RenderItemPrices: React.FC<{
  item: MenuItem;
  accentColor?: string;
  onAddToCart?: (item: MenuItem, priceStr: string, variant?: string) => void;
  onRemoveFromCart?: (itemId: string, variant?: string) => void;
  getItemQuantity?: (itemId: string, variant?: string) => number;
  isPremium?: boolean;
  priceClassName?: string;
  btnStyle?: string;
  btnLabel?: string;
  compact?: boolean;
}> = ({
  item,
  accentColor,
  onAddToCart,
  onRemoveFromCart,
  getItemQuantity,
  isPremium = false,
  priceClassName,
  btnStyle,
  btnLabel = '+ ADD',
  compact = false,
}) => {
  const menuCart = useMenuCart();
  const effectiveAddToCart = onAddToCart || menuCart.onAddToCart;
  const effectiveRemoveFromCart = onRemoveFromCart || menuCart.onRemoveFromCart;
  const effectiveGetQuantity = getItemQuantity || menuCart.getItemQuantity;
  const effectiveIsPremium = isPremium || menuCart.isPremium || false;

  if (item.available === false) {
    return <span className="text-[10px] italic opacity-60 font-sans">Currently unavailable</span>;
  }

  const pricing = parseItemPricing(item);

  if (pricing.hasVariants) {
    return (
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {pricing.variants.map((v) => {
          const qty = effectiveGetQuantity ? effectiveGetQuantity(item.id, v.label) : 0;
          return (
            <div key={v.label} className="flex items-center gap-1.5 whitespace-nowrap">
              <span className={clsx(
                "font-medium opacity-80 tracking-tight font-mono",
                compact ? "text-[9px]" : "text-[10px] sm:text-xs"
              )}>
                {v.label}
              </span>
              <span
                className={clsx(priceClassName || 'font-mono text-xs font-bold')}
                style={!priceClassName && accentColor ? { color: accentColor } : undefined}
              >
                {v.formattedPrice}
              </span>
              {effectiveIsPremium && effectiveAddToCart && (
                qty > 0 ? (
                  <div className="flex items-center gap-1 rounded-lg bg-[#e8783c] text-white px-1.5 py-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (effectiveRemoveFromCart) effectiveRemoveFromCart(item.id, v.label);
                      }}
                      className="hover:opacity-80 active:scale-90 transition-transform p-0.5 cursor-pointer text-white"
                      aria-label={`Remove one ${item.name} (${v.label})`}
                      title={qty === 1 ? "Remove from cart" : "Decrease quantity"}
                    >
                      {qty === 1 ? <Trash2 size={11} strokeWidth={2.5} /> : <Minus size={11} strokeWidth={3} />}
                    </button>
                    <span className="font-mono text-[11px] font-black px-1 min-w-[14px] text-center text-white">{qty}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        effectiveAddToCart(item, String(v.price), v.label);
                      }}
                      className="hover:opacity-80 active:scale-90 transition-transform p-0.5 cursor-pointer text-white"
                      aria-label={`Add one more ${item.name} (${v.label})`}
                      title="Add one more"
                    >
                      <Plus size={11} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      effectiveAddToCart(item, String(v.price), v.label);
                    }}
                    className={clsx(
                      btnStyle || 'text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40 cursor-pointer'
                    )}
                    aria-label={`+ Add ${item.name} (${v.label})`}
                  >
                    {btnLabel}
                  </button>
                )
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const baseQty = effectiveGetQuantity ? effectiveGetQuantity(item.id) : 0;

  return (
    <div className="flex items-center gap-2 shrink-0">
      {pricing.formattedBasePrice && (
        <span
          className={clsx(priceClassName || 'font-mono text-xs sm:text-sm font-bold tracking-tight')}
          style={!priceClassName && accentColor ? { color: accentColor } : undefined}
        >
          {pricing.formattedBasePrice}
        </span>
      )}
      {effectiveIsPremium && effectiveAddToCart && (
        baseQty > 0 ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-[#e8783c] text-white px-2 py-0.5 shadow-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (effectiveRemoveFromCart) effectiveRemoveFromCart(item.id);
              }}
              className="hover:opacity-80 active:scale-90 transition-transform p-0.5 cursor-pointer text-white"
              aria-label={`Remove one ${item.name}`}
              title={baseQty === 1 ? "Remove from cart" : "Decrease quantity"}
            >
              {baseQty === 1 ? <Trash2 size={12} strokeWidth={2.5} /> : <Minus size={12} strokeWidth={3} />}
            </button>
            <span className="font-mono text-xs font-black px-1 min-w-[16px] text-center text-white">{baseQty}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                effectiveAddToCart(item, String(pricing.basePrice ?? item.price));
              }}
              className="hover:opacity-80 active:scale-90 transition-transform p-0.5 cursor-pointer text-white"
              aria-label={`Add one more ${item.name}`}
              title="Add one more"
            >
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              effectiveAddToCart(item, String(pricing.basePrice ?? item.price));
            }}
            className={clsx(
              btnStyle || 'text-[10px] font-bold px-2 py-0.5 rounded border opacity-90 hover:opacity-100 cursor-pointer'
            )}
            aria-label={`+ Add ${item.name}`}
          >
            {btnLabel}
          </button>
        )
      )}
    </div>
  );
};

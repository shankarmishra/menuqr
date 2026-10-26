import React from 'react';
import clsx from 'clsx';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { MenuItem } from '../types';
import { formatIndianPrice, parseItemPricing } from './pricingUtils';
import { useMenuCart } from './MenuCartContext';

export const FormatPrice = formatIndianPrice;
export { parseItemPricing, formatIndianPrice };

export const DietIndicator: React.FC<{
  type?: 'veg' | 'non-veg' | 'vegan' | string;
  compact?: boolean;
  color?: string;
  className?: string;
}> = ({ type, compact, color, className = '' }) => {
  const isVeg = type === 'veg' || type === 'vegan' || !type;
  const isVegan = type === 'vegan';
  const size = compact ? 'w-3.5 h-3.5 p-[2px]' : 'w-4 h-4 p-[2px]';

  if (isVeg) {
    return (
      <span
        className={`inline-flex items-center justify-center border-[1.5px] border-emerald-600 rounded-[3px] bg-white shrink-0 shadow-xs ${size} ${className}`}
        style={color ? { borderColor: color } : undefined}
        title={isVegan ? 'Vegan' : 'Vegetarian (Pure Veg)'}
      >
        <span 
          className="w-[75%] h-[75%] rounded-full bg-emerald-600" 
          style={color ? { backgroundColor: color } : undefined} 
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center border-[1.5px] border-[#8B3A2B] rounded-[3px] bg-white shrink-0 shadow-xs ${size} ${className}`}
      style={color ? { borderColor: color } : undefined}
      title="Non-Vegetarian"
    >
      <span 
        className="w-[75%] h-[75%] bg-[#8B3A2B]"
        style={{
          clipPath: 'polygon(50% 10%, 0% 90%, 100% 90%)',
          backgroundColor: color || '#8B3A2B'
        }}
      />
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

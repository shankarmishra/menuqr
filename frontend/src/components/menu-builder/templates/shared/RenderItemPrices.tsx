import React from 'react';
import clsx from 'clsx';
import type { MenuItem } from '../types';
import { formatIndianPrice, parseItemPricing } from './pricingUtils';

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
  isPremium?: boolean;
  priceClassName?: string;
  btnStyle?: string;
  btnLabel?: string;
  compact?: boolean;
}> = ({
  item,
  accentColor,
  onAddToCart,
  isPremium = false,
  priceClassName,
  btnStyle,
  btnLabel = '+ ADD',
  compact = false,
}) => {
  if (item.available === false) {
    return <span className="text-[10px] italic opacity-60 font-sans">Currently unavailable</span>;
  }

  const pricing = parseItemPricing(item);

  if (pricing.hasVariants) {
    return (
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {pricing.variants.map((v) => (
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
            {isPremium && onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(item, String(v.price), v.label);
                }}
                className={clsx(
                  btnStyle || 'text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40 cursor-pointer'
                )}
                aria-label={`+ Add ${item.name} (${v.label})`}
              >
                {btnLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

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
      {isPremium && onAddToCart && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(item, String(pricing.basePrice ?? item.price));
          }}
          className={clsx(
            btnStyle || 'text-[10px] font-bold px-2 py-0.5 rounded border opacity-90 hover:opacity-100 cursor-pointer'
          )}
          aria-label={`+ Add ${item.name}`}
        >
          {btnLabel}
        </button>
      )}
    </div>
  );
};

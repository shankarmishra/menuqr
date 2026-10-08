import React from 'react';
import type { MenuItem } from '../types';

export const FormatPrice = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return String(val);
  return `₹${num.toLocaleString('en-IN')}`;
};

export const DietIndicator: React.FC<{
  type: 'veg' | 'non-veg' | 'vegan';
  compact?: boolean;
  color?: string;
  className?: string;
}> = ({ type, compact, color, className = '' }) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const borderColor = color || (isVeg ? '#2E7D32' : '#D32F2F');
  const dotColor = color || (isVeg ? '#2E7D32' : '#D32F2F');
  const size = compact ? 'w-3 h-3 p-[1.5px]' : 'w-4 h-4 p-0.5';

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
  accentColor: string;
  onAddToCart?: (item: MenuItem, priceStr: string, variant?: string) => void;
  isPremium?: boolean;
  btnStyle?: string;
}> = ({ item, accentColor, onAddToCart, isPremium, btnStyle }) => {
  if (item.available === false) {
    return <span className="text-[10px] italic opacity-60 font-sans">Currently unavailable</span>;
  }

  if (item.halfPrice || item.fullPrice) {
    return (
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {item.halfPrice && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] opacity-70">Half</span>
            <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>{FormatPrice(item.halfPrice)}</span>
            {onAddToCart && isPremium && (
              <button
                type="button"
                onClick={() => onAddToCart(item, String(item.halfPrice), 'Half')}
                className={btnStyle || "text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40"}
              >
                +
              </button>
            )}
          </div>
        )}
        {item.fullPrice && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] opacity-70">Full</span>
            <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>{FormatPrice(item.fullPrice)}</span>
            {onAddToCart && isPremium && (
              <button
                type="button"
                onClick={() => onAddToCart(item, String(item.fullPrice), 'Full')}
                className={btnStyle || "text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/40"}
              >
                +
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="font-mono text-xs sm:text-sm font-bold" style={{ color: accentColor }}>
        {FormatPrice(item.price)}
      </span>
      {onAddToCart && isPremium && (
        <button
          type="button"
          onClick={() => onAddToCart(item, String(item.price))}
          className={btnStyle || "text-[10px] font-bold px-2 py-0.5 rounded border opacity-90 hover:opacity-100"}
        >
          + Add
        </button>
      )}
    </div>
  );
};

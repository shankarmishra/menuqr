import React from 'react';
import { Eye } from 'lucide-react';

export type SurfaceTarget =
  | 'cover'
  | 'guestBar'
  | 'infoSheet'
  | 'inner'
  | 'about'
  | 'backCover'
  | 'print'
  | 'tent'
  | 'share'
  | 'checkout';

interface AppearsOnChipsProps {
  surfaces: SurfaceTarget[];
  activeSurface?: string | null;
  onHighlight?: (surface: SurfaceTarget) => void;
}

const SURFACE_LABELS: Record<SurfaceTarget, { label: string; previewHint: string }> = {
  cover: { label: 'Cover Banner', previewHint: 'Top cover header & badges' },
  guestBar: { label: 'Guest Bar', previewHint: 'Diner header & table status' },
  infoSheet: { label: 'Info Sheet (ⓘ)', previewHint: 'Quick details drawer' },
  inner: { label: 'Inner Pages', previewHint: 'Menu dish cards & categories' },
  about: { label: 'About & Visit', previewHint: 'Story & amenities section' },
  backCover: { label: 'Back Cover', previewHint: 'Footer & social handles' },
  print: { label: 'Print Menu', previewHint: 'Print & PDF exports' },
  tent: { label: 'Table Tent', previewHint: 'Tabletop QR stands' },
  share: { label: 'Share Preview', previewHint: 'WhatsApp & social link cards' },
  checkout: { label: 'Checkout Bar', previewHint: 'Sticky cart & tax policy' },
};

export const AppearsOnChips: React.FC<AppearsOnChipsProps> = ({
  surfaces,
  activeSurface,
  onHighlight,
}) => {
  if (!surfaces || surfaces.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 my-2">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
        <Eye size={12} className="text-[#e8783c]" />
        <span>Appears on:</span>
      </span>
      {surfaces.map((s) => {
        const item = SURFACE_LABELS[s] || { label: s, previewHint: s };
        const isActive = activeSurface === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onHighlight?.(s)}
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${
              isActive
                ? 'bg-[#e8783c] text-white border-[#e8783c] ring-2 ring-[#e8783c]/50 shadow-[0_0_14px_rgba(232,120,60,0.5)] font-semibold'
                : 'bg-[#151c19] border-[#2a3832] text-slate-300 hover:text-white hover:border-[#e8783c]/60'
            }`}
            title={`Preview on mock phone: ${item.previewHint}`}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

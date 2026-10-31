import React, { useState } from 'react';
import { Upload, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import { uploadImage } from '../appStore';

interface BrandTabProps {
  logoUrl?: string;
  colourMood?: string;
  onUpdateLogo: (url: string | null) => void;
  onUpdateMood: (mood: string) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
}

const COLOR_MOODS = [
  { id: 'royal_gold', label: 'Royal Gold', hex: '#eab308', bg: 'bg-amber-500' },
  { id: 'charcoal_saffron', label: 'Charcoal Saffron', hex: '#f97316', bg: 'bg-orange-500' },
  { id: 'terracotta', label: 'Terracotta', hex: '#e8783c', bg: 'bg-[#e8783c]' },
  { id: 'chilli_red', label: 'Chilli Red', hex: '#dc2626', bg: 'bg-red-600' },
  { id: 'sage_green', label: 'Sage Green', hex: '#10b981', bg: 'bg-emerald-600' },
  { id: 'indigo_night', label: 'Indigo Night', hex: '#4338ca', bg: 'bg-indigo-600' },
  { id: 'truck_yellow', label: 'Truck Yellow', hex: '#facc15', bg: 'bg-yellow-400' },
  { id: 'rose_palace', label: 'Rose Palace', hex: '#db2777', bg: 'bg-pink-600' },
];

export const BrandTab: React.FC<BrandTabProps> = ({
  logoUrl,
  colourMood = 'royal_gold',
  onUpdateLogo,
  onUpdateMood,
  onHighlightSurface,
  activeSurface,
}) => {
  const [uploading, setUploading] = useState(false);
  const [logoIncludesName, setLogoIncludesName] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, 'logos');
        onUpdateLogo(res.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Failed to upload logo: ' + (err.message || 'Unknown error'));
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Section */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Restaurant Logo (Optional)
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            MenuQR is name-first: if you don't upload a logo, your restaurant name is rendered in high-end typography wordmark.
          </p>
        </div>

        <AppearsOnChips
          surfaces={['cover', 'guestBar', 'backCover', 'tent', 'share']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Logo Preview Tile */}
          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-[#2a3832] bg-[#151c19] flex items-center justify-center p-3 relative group overflow-hidden shrink-0 shadow-inner">
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain filter drop-shadow-md"
                />
                <button
                  type="button"
                  onClick={() => onUpdateLogo(null)}
                  className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 font-semibold text-xs gap-1"
                  title="Remove logo"
                >
                  <Trash2 size={20} />
                  <span>Remove</span>
                </button>
              </>
            ) : (
              <div className="text-center text-slate-500">
                <Upload size={24} className="mx-auto mb-1.5 opacity-60 text-slate-400" />
                <span className="text-[11px] block font-medium">No logo uploaded</span>
              </div>
            )}
          </div>

          {/* Upload Button & File Input */}
          <div className="space-y-3 flex-1 w-full">
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#d66c32] text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#e8783c]/20 hover:scale-[1.02] active:scale-95">
                <Upload size={15} />
                <span>
                  {uploading ? 'Processing logo…' : logoUrl ? 'Replace Logo' : 'Upload Brand Logo'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <span className="block text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                PNG, JPEG, WebP or SVG up to 8MB. Transparent background recommended for dark menu themes.
              </span>
            </div>

            {logoUrl && (
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={logoIncludesName}
                  onChange={(e) => setLogoIncludesName(e.target.checked)}
                  className="rounded bg-[#151c19] border-[#2a3832] text-[#e8783c] focus:ring-0"
                />
                <span>This logo already contains our restaurant name in artwork</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Brand Colour Mood */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Sparkles size={16} className="text-[#e8783c]" />
              <span>Brand Color Mood</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Drives accent borders, category active tabs, and cover highlights across the customer menu.
            </p>
          </div>
          <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#151c19] border border-[#2a3832] text-[#f49b6b]">
            Active: {COLOR_MOODS.find((m) => m.id === colourMood)?.label || colourMood}
          </span>
        </div>

        <AppearsOnChips
          surfaces={['cover', 'guestBar', 'inner', 'about', 'backCover', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {COLOR_MOODS.map((m) => {
            const isSelected = colourMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateMood(m.id)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all duration-200 text-left ${
                  isSelected
                    ? 'bg-[#151c19] border-[#e8783c] ring-2 ring-[#e8783c]/50 shadow-[0_0_18px_rgba(232,120,60,0.25)]'
                    : 'bg-[#151c19]/80 border-[#2a3832] hover:border-slate-600 text-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full ${m.bg} shrink-0 ring-2 ring-black/60 shadow-sm`}
                />
                <span
                  className={`text-xs font-semibold truncate ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {m.label}
                </span>
                {isSelected && <CheckCircle2 size={14} className="text-[#e8783c] ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

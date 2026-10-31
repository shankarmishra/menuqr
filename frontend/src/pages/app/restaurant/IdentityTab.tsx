import React from 'react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import type { CanonicalProfileData } from '../appStore';

interface IdentityTabProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
}

const COMMON_CUISINES = [
  'North Indian',
  'South Indian',
  'Mughlai',
  'Chinese',
  'Indo-Chinese',
  'Tandoori',
  'Biryani',
  'Street Food',
  'Continental',
  'Italian',
  'Bakery & Desserts',
  'Beverages',
  'Punjabi',
  'Rajasthani',
  'Gujarati',
];

export const IdentityTab: React.FC<IdentityTabProps> = ({
  profile,
  onChange,
  onHighlightSurface,
  activeSurface,
}) => {
  const cuisineTags = profile.cuisineTags || [];

  const handleToggleCuisine = (c: string) => {
    if (cuisineTags.includes(c)) {
      onChange({ cuisineTags: cuisineTags.filter((t) => t !== c) });
    } else if (cuisineTags.length < 5) {
      onChange({ cuisineTags: [...cuisineTags, c] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Display Name */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
            Restaurant Brand Name <span className="text-[#e8783c]">*</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {(profile.displayName || '').length}/60
          </span>
        </div>
        <AppearsOnChips
          surfaces={['cover', 'guestBar', 'about', 'backCover', 'tent', 'share', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <input
          type="text"
          value={profile.displayName || ''}
          onChange={(e) => onChange({ displayName: e.target.value })}
          placeholder="e.g. Mannat Tandoori Junction"
          maxLength={60}
          className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
        />
        <p className="text-[11px] text-slate-400">
          The primary title seen on guest phone screens, QR table stands, and invoices.
        </p>
      </div>

      {/* Hindi Name */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:border-[#2a3832]/90">
        <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
          Restaurant Name in Hindi (Devanagari)
        </label>
        <AppearsOnChips
          surfaces={['cover', 'about', 'backCover']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <input
          type="text"
          value={profile.i18n?.hi?.name || ''}
          onChange={(e) =>
            onChange({
              i18n: {
                ...profile.i18n,
                hi: { ...(profile.i18n?.hi || {}), name: e.target.value },
              },
            })
          }
          placeholder="मन्नत तंदूरी जंक्शन"
          maxLength={60}
          className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors font-hindi"
        />
        <p className="text-[11px] text-slate-400">
          Rendered alongside the English title for bilingual Indian menus.
        </p>
      </div>

      {/* Tagline */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
            Tagline / Slogan
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {(profile.tagline || '').length}/60
          </span>
        </div>
        <AppearsOnChips
          surfaces={['cover', 'about', 'backCover', 'tent']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <input
          type="text"
          value={profile.tagline || ''}
          onChange={(e) => onChange({ tagline: e.target.value })}
          placeholder="e.g. Authentic Charcoal Flavours Since 2015"
          maxLength={60}
          className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
        />
      </div>

      {/* Food Type / Diet Declaration */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-3 shadow-sm transition-all hover:border-[#2a3832]/90">
        <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
          Diet Declaration
        </label>
        <AppearsOnChips
          surfaces={['cover', 'guestBar', 'inner', 'about', 'backCover']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <button
            type="button"
            onClick={() => onChange({ dietDeclaration: 'PURE_VEG' })}
            className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left ${
              profile.dietDeclaration === 'PURE_VEG'
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                : 'bg-[#151c19] border-[#2a3832] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <div className="w-6 h-6 rounded border-2 border-emerald-500 flex items-center justify-center p-0.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-bold">100% Pure Vegetarian</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Displays verified Pure Veg badge on cover & filters out non-veg cues
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange({ dietDeclaration: 'VEG_AND_NON_VEG' })}
            className={`p-4 rounded-xl border flex items-center gap-3.5 transition-all text-left ${
              profile.dietDeclaration === 'VEG_AND_NON_VEG'
                ? 'bg-[#e8783c]/15 border-[#e8783c]/60 text-[#f49b6b] ring-1 ring-[#e8783c]/40 shadow-[0_0_15px_rgba(232,120,60,0.15)]'
                : 'bg-[#151c19] border-[#2a3832] text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <div className="w-6 h-6 rounded border-2 border-[#e8783c] flex items-center justify-center p-0.5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#e8783c]" />
            </div>
            <div>
              <div className="text-sm font-bold">Veg & Non-Veg Available</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Shows standard green/red diet markers per dish with toggle filters
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Cuisine Tags */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-3 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
            Cuisine Tags (up to 5)
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {cuisineTags.length}/5 selected
          </span>
        </div>
        <AppearsOnChips
          surfaces={['cover', 'about']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_CUISINES.map((c) => {
            const selected = cuisineTags.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleToggleCuisine(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  selected
                    ? 'bg-[#e8783c]/20 text-[#f49b6b] border-[#e8783c]/60 shadow-[0_0_10px_rgba(232,120,60,0.2)] font-semibold'
                    : 'bg-[#151c19] border-[#2a3832] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {selected ? `✓ ${c}` : `+ ${c}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Established Year & Story */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:border-[#2a3832]/90">
          <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
            Established Year
          </label>
          <AppearsOnChips
            surfaces={['cover', 'about', 'backCover']}
            onHighlight={onHighlightSurface}
            activeSurface={activeSurface}
          />
          <input
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={profile.establishedYear || ''}
            onChange={(e) =>
              onChange({ establishedYear: e.target.value ? Number(e.target.value) : null })
            }
            placeholder="e.g. 2015"
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] font-mono transition-colors"
          />
        </div>

        <div className="sm:col-span-2 bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-2 shadow-sm transition-all hover:border-[#2a3832]/90">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-100 tracking-wide uppercase">
              Restaurant Story / Heritage
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {(profile.story || '').length}/600
            </span>
          </div>
          <AppearsOnChips
            surfaces={['about']}
            onHighlight={onHighlightSurface}
            activeSurface={activeSurface}
          />
          <textarea
            value={profile.story || ''}
            onChange={(e) => onChange({ story: e.target.value })}
            placeholder="Tell diners what makes your recipes special, secret family spices, or founding story..."
            rows={3}
            maxLength={600}
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] resize-none transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

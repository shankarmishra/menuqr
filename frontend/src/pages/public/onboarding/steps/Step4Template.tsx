import { useMemo, useState } from 'react';
import { Check, Search, Sparkles } from 'lucide-react';
import { SHOWCASE_PRESETS, getPreset, type Preset } from '../../../../design-system/presets';
import { derivePalette } from '../../../../design-system/palette';
import type { MenuTheme } from '../../../../design-system/theme.types';
import PhonePreviewFrame from '../../../../components/preview/PhonePreviewFrame';
import MenuTemplateRenderer from '../../../../components/menu-builder/MenuTemplateRenderer';

export interface Step4TemplateProps {
  selectedPresetId: string;
  onSelectPreset: (preset: Preset) => void;
  theme?: MenuTheme;
  restaurant?: {
    name?: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    logoUrl?: string;
  };
  categories?: Array<{ id: string; name: string }>;
  items?: Array<any>;
}

const CATEGORIES = [
  { id: 'all', label: `All (${SHOWCASE_PRESETS.length})` },
  { id: 'fine-dining', label: 'Fine Dining' },
  { id: 'heritage', label: 'Heritage' },
  { id: 'cafe', label: 'Cafe & Bakery' },
  { id: 'contemporary', label: 'Contemporary' },
  { id: 'street', label: 'Street & Grill' },
];

/**
 * Onboarding Wizard Step 4 — Template & Edition Selection
 *
 * Prominently presents the full catalog of Art-Directed Signature Editions,
 * specifically highlighting the new `atelier-rangeen` preset with its truthful
 * '★ Atelier 400' badge, and provides a faithful 390x844 mobile-scale preview.
 */
export default function Step4Template({
  selectedPresetId,
  onSelectPreset,
  theme,
  restaurant = { name: 'Your Restaurant' },
  categories = [],
  items = [],
}: Step4TemplateProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activePreset = useMemo(
    () => SHOWCASE_PRESETS.find((p) => p.id === selectedPresetId) ?? getPreset(selectedPresetId),
    [selectedPresetId]
  );

  const filteredPresets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SHOWCASE_PRESETS.filter((preset) => {
      const matchCat = categoryFilter === 'all' || preset.category === categoryFilter;
      const matchSearch =
        !q ||
        [preset.label, preset.description, preset.audience, preset.id]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchCat && matchSearch;
    });
  }, [categoryFilter, searchQuery]);

  const effectiveTheme: MenuTheme | undefined = useMemo(() => (theme ? { ...theme, layoutVersion: (theme.layoutVersion === 1 ? 1 : 2) as 1 | 2 } : undefined), [theme]);

  const activePalette = useMemo(() => {
    return derivePalette(theme?.brand?.seedColor || activePreset.seedColor, activePreset.mode);
  }, [theme?.brand?.seedColor, activePreset]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Preset Gallery & Controls */}
      <div className="lg:col-span-7 space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <p className="text-xs text-[#A3957E]">
              Select from <span className="font-bold text-white">Art-Directed Signature Editions</span>. Each is an authentic publication with its own typography, architecture, and plating identity.
            </p>
            <div className="relative shrink-0">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search editions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37] w-full sm:w-48"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#E8783C] text-white shadow-sm'
                    : 'bg-[#0E0C09] text-[#A3957E] border border-[#D4AF37]/15 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1 mq-showcase-preview-frame">
          {filteredPresets.map((preset) => {
            const active = selectedPresetId === preset.id;
            const palette = derivePalette(preset.seedColor, preset.mode);
            const editionNum = String(
              SHOWCASE_PRESETS.findIndex((p) => p.id === preset.id) + 1
            ).padStart(2, '0');

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 group ${
                  active
                    ? 'border-[#D4AF37] bg-[#D4AF37]/12 ring-2 ring-[#D4AF37] shadow-xl'
                    : 'border-[#D4AF37]/15 bg-[#0E0C09] hover:border-[#D4AF37]/30 hover:bg-[#2B251D]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                        #{editionNum}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3957E]">
                        {preset.category}
                      </span>
                      {preset.id === 'atelier-rangeen' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                          ★ Atelier 400
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#D4AF37]/25 shadow-xs"
                        style={{ backgroundColor: palette.bg }}
                        title={`Background: ${palette.bg}`}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#D4AF37]/25 shadow-xs"
                        style={{ backgroundColor: preset.seedColor }}
                        title={`Accent: ${preset.seedColor}`}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-[#D4AF37]/25 shadow-xs"
                        style={{ backgroundColor: palette.heading }}
                        title={`Heading: ${palette.heading}`}
                      />

                      {active && (
                        <span className="w-4 h-4 rounded-full bg-[#E8783C] text-white flex items-center justify-center shrink-0 ml-1">
                          <Check size={10} />
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#E8783C] transition-colors">{preset.label}</h4>
                  <p className="text-[11px] text-[#A3957E] leading-relaxed line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#D4AF37]/10 flex items-center justify-between text-[10px] text-[#998A72]">
                  <span className="truncate max-w-[170px]">{preset.audience}</span>
                  <span className="uppercase font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 font-semibold text-white/70">
                    {preset.mode}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Standard 390x844 Mobile-Scale Preview */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-1 mb-2 text-xs font-mono text-[#A3957E]">
          <span>LIVE CUSTOMER MENU</span>
          <span className="text-[#D4AF37] font-bold">{activePreset.label} Edition</span>
        </div>

        <PhonePreviewFrame
          viewportWidth={390}
          viewportHeight={844}
          scaleToFit={true}
          theme={effectiveTheme}
          presetId={selectedPresetId}
          palette={activePalette}
          badgeText={`${activePreset.label} Edition`}
          statusBarTheme={activePreset.mode === 'dark' ? 'light' : 'dark'}
          screenStyle={{ backgroundColor: activePalette.bg }}
        >
          <div className="w-full h-full overflow-y-auto mq-showcase-preview-frame">
            <MenuTemplateRenderer
              templateId={selectedPresetId}
              theme={effectiveTheme}
              restaurant={{
                name: restaurant.name || 'Your Restaurant',
                tagline: restaurant.tagline,
                cuisine: restaurant.cuisine || 'North Indian • Mughlai • Tandoor',
                phone: restaurant.phone,
                address: restaurant.address,
                city: restaurant.city,
                logo: restaurant.logoUrl,
              }}
              categories={categories}
              items={items}
              compact={false}
              isPremium={true}
              onAddToCart={() => {}}
              getItemQuantity={() => 0}
            />
          </div>
        </PhonePreviewFrame>

        <div className="mt-2 text-center text-[10px] text-stone-400">
          <Sparkles size={11} className="inline mr-1 text-[#E8783C]" />
          <span className="text-white font-medium">Standard 390px Mobile Viewport</span> · Interactive Live Preview
        </div>
      </div>
    </div>
  );
}

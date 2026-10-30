/**
 * MENUQR — Edition Gallery
 *
 * Shows the ten art-directed Editions rendered live, through the same `MenuTemplateRenderer` a
 * real customer menu uses, against the same demo restaurant. Nothing here is a mockup image: if
 * a design looks wrong on this page it is wrong in production, which is the only way a gallery
 * stays honest.
 *
 * Three viewports (phone / tablet / desktop) and a true full-bleed mode, because a menu that
 * reads well at 390px can still fall apart at 1280px and the gallery has to surface that.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Monitor,
  Palette,
  Search,
  Smartphone,
  Tablet,
  Type,
  Utensils,
} from 'lucide-react';
import { DEMO_RESTAURANT } from '../../data/menuTemplates';
import { SHOWCASE_PRESETS, type Preset, type PresetCategory } from '../../design-system/presets';
import { derivePalette } from '../../design-system/palette';
import { FONT_PAIRINGS } from '../../design-system/fonts';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';

type Viewport = 'phone' | 'tablet' | 'desktop';

const VIEWPORTS: Record<Viewport, { label: string; width: number; icon: typeof Smartphone }> = {
  phone: { label: 'Phone', width: 390, icon: Smartphone },
  tablet: { label: 'Tablet', width: 834, icon: Tablet },
  desktop: { label: 'Desktop', width: 1280, icon: Monitor },
};

const CATEGORY_LABELS: Partial<Record<PresetCategory, string>> = {
  heritage: 'Heritage',
  'fine-dining': 'Fine Dining',
  cafe: 'Cafe & Bakery',
  street: 'Street & Grill',
  bar: 'Bar',
  contemporary: 'Contemporary',
  signature: 'Signature',
};

export default function TemplateShowcasePage() {
  const [selectedId, setSelectedId] = useState<string>(SHOWCASE_PRESETS[0]?.id ?? '');
  const [viewport, setViewport] = useState<Viewport>('phone');
  const [isFullBleed, setIsFullBleed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return SHOWCASE_PRESETS;
    return SHOWCASE_PRESETS.filter((preset) =>
      [preset.label, preset.description, preset.audience, preset.id]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  const current = useMemo<Preset>(
    () => SHOWCASE_PRESETS.find((preset) => preset.id === selectedId) ?? SHOWCASE_PRESETS[0],
    [selectedId]
  );

  const palette = useMemo(() => derivePalette(current.seedColor, current.mode), [current]);
  const currentIndex = SHOWCASE_PRESETS.findIndex((preset) => preset.id === current.id);

  const step = useCallback((delta: number) => {
    setSelectedId((previous) => {
      const index = SHOWCASE_PRESETS.findIndex((preset) => preset.id === previous);
      const next = (index + delta + SHOWCASE_PRESETS.length) % SHOWCASE_PRESETS.length;
      return SHOWCASE_PRESETS[next].id;
    });
  }, []);

  // Arrow keys step through the catalogue and Escape leaves full-bleed, so comparing ten designs
  // does not mean ten round trips to the sidebar. Ignored while typing in the search field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        step(1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        step(-1);
      } else if (event.key === 'Escape') {
        setIsFullBleed(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  const preview = (
    <div
      className="mx-auto h-full overflow-y-auto overflow-x-hidden shadow-2xl mq-showcase-preview-frame"
      style={{
        width: isFullBleed ? '100%' : VIEWPORTS[viewport].width,
        maxWidth: '100%',
        backgroundColor: palette.bg,
      }}
    >
      <MenuTemplateRenderer
        key={`${current.id}-${viewport}-${isFullBleed}`}
        templateId={current.id}
        restaurant={DEMO_RESTAURANT}
        categories={DEMO_RESTAURANT.categories}
        items={DEMO_RESTAURANT.items}
      />
    </div>
  );

  if (isFullBleed) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07100D] flex flex-col">
        <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2.5 bg-[#0E1714] border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-bold text-white truncate">{current.label}</span>
            <span className="text-[11px] font-mono text-[#8EA298] truncate">{current.id}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => step(-1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
              aria-label="Previous design"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-[11px] font-mono text-[#8EA298] tabular-nums">
              {currentIndex + 1}/{SHOWCASE_PRESETS.length}
            </span>
            <button
              type="button"
              onClick={() => step(1)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
              aria-label="Next design"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsFullBleed(false)}
              className="ml-2 px-3 py-1.5 rounded-lg bg-[#E8783C] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Minimize2 size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{preview}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C120F] text-[#FAF3E0] font-sans selection:bg-[#E8783C] selection:text-white flex flex-col">
      <header className="sticky top-0 z-40 bg-[#121B16]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E8783C] to-amber-400 flex items-center justify-center text-stone-900 font-extrabold shadow-lg shadow-[#E8783C]/20">
            <Utensils size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                MenuQR Editions
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E8783C] text-white">
                {SHOWCASE_PRESETS.length} Designs
              </span>
            </div>
            <p className="text-[11px] text-[#8EA298] font-mono">
              Art-directed menu publications · cover and interior designed together
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search designs…"
              className="w-full bg-[#18231E] border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C]"
            />
          </div>

          <div className="bg-[#18231E] border border-white/10 rounded-xl p-1 flex items-center gap-1">
            {(Object.keys(VIEWPORTS) as Viewport[]).map((key) => {
              const Icon = VIEWPORTS[key].icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewport(key)}
                  title={`${VIEWPORTS[key].label} — ${VIEWPORTS[key].width}px`}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewport === key ? 'bg-[#E8783C] text-white shadow-md' : 'text-[#8EA298] hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  <span className="hidden md:inline">{VIEWPORTS[key].label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsFullBleed(true)}
            className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white font-medium inline-flex items-center gap-1.5"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">Full Screen</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Catalogue rail */}
        <nav
          className="lg:col-span-3 border-r border-white/10 bg-[#0E1512] flex flex-col lg:h-[calc(100vh-69px)] overflow-hidden"
          aria-label="Edition catalogue"
        >
          <div className="p-3 border-b border-white/10 bg-[#121A15] flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8EA298]">
              {filtered.length} {filtered.length === 1 ? 'Design' : 'Designs'}
            </span>
            <span className="text-[10px] font-mono text-stone-500">↑↓ to switch</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filtered.map((preset, index) => {
              const isSelected = preset.id === current.id;
              const dots = derivePalette(preset.seedColor, preset.mode);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedId(preset.id)}
                  aria-current={isSelected}
                  className={`w-full text-left p-3 rounded-xl transition-all group border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#E8783C]/20 to-amber-500/5 border-[#E8783C]/50 shadow-md'
                      : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#E8783C] text-white' : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <span
                        className={`block font-bold text-sm tracking-tight truncate ${
                          isSelected ? 'text-white' : 'text-[#D0DBD5] group-hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </span>
                      <span className="block text-[11px] text-[#7E9388] truncate">
                        {CATEGORY_LABELS[preset.category] ?? preset.category}
                      </span>
                    </div>

                    <span className="flex items-center gap-1 shrink-0">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: dots.accent }}
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: dots.bg }}
                      />
                    </span>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <p className="px-3 py-6 text-xs text-stone-500 text-center">
                No design matches “{searchQuery}”.
              </p>
            )}
          </div>
        </nav>

        {/* Stage */}
        <main className="lg:col-span-6 bg-[#090D0B] flex flex-col lg:h-[calc(100vh-69px)] overflow-hidden">
          <div className="shrink-0 px-5 py-3 border-b border-white/10 bg-[#101713] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base font-extrabold text-white truncate">{current.label}</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-[#8EA298] font-mono truncate">
                {current.id}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400">
              <button
                type="button"
                onClick={() => step(-1)}
                className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white"
                aria-label="Previous design"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="tabular-nums">
                {currentIndex + 1} / {SHOWCASE_PRESETS.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-white"
                aria-label="Next design"
              >
                <ChevronRight size={15} />
              </button>
              <span className="ml-2 hidden sm:inline">{VIEWPORTS[viewport].width}px</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center">
            <div className="w-full">{preview}</div>
          </div>
        </main>

        {/* Specification */}
        <aside className="lg:col-span-3 border-l border-white/10 bg-[#111914] p-5 space-y-5 lg:h-[calc(100vh-69px)] overflow-y-auto">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8783C] font-bold">
              Design Specification
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{current.label}</h2>
            <p className="text-xs text-amber-400 font-medium">{current.audience}</p>
            <p className="text-xs text-[#8EA298] mt-2 leading-relaxed">{current.description}</p>
          </div>

          <div className="bg-[#18231E] p-3.5 rounded-xl border border-white/5 space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Palette size={12} className="text-[#E8783C]" /> Derived Palette
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(
                [
                  ['Background', palette.bg],
                  ['Accent', palette.accent],
                  ['Heading', palette.heading],
                  ['Body Text', palette.text],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5"
                >
                  <span
                    className="w-4 h-4 rounded-md border border-white/20 shrink-0"
                    style={{ backgroundColor: value }}
                  />
                  <div className="truncate">
                    <p className="text-[9px] text-stone-400">{label}</p>
                    <p className="font-mono text-white text-[10px]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed">
              Every colour above is derived from one seed —{' '}
              <span className="font-mono text-stone-400">{current.seedColor}</span> — so changing it
              redraws the whole Edition, ornament included.
            </p>
          </div>

          <div className="bg-[#18231E] p-3.5 rounded-xl border border-white/5 space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Type size={12} className="text-emerald-400" /> Composition
            </span>
            <dl className="space-y-1.5 text-xs">
              {(
                [
                  ['Display Face', FONT_PAIRINGS[current.typePair].display.family],
                  ['Text Face', FONT_PAIRINGS[current.typePair].body.family],
                  ['Texture', current.texture],
                  ['Density', current.density],
                  ['Mode', current.mode === 'dark' ? 'Dark' : 'Light'],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-white/5 pb-1">
                  <dt className="text-stone-400">{label}</dt>
                  <dd className="font-bold text-white text-right capitalize truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <Link
            to={`/signup?template=${current.id}`}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-[#E8783C] hover:from-amber-500 hover:to-[#f18b50] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Use {current.label} For My Menu</span>
            <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  );
}

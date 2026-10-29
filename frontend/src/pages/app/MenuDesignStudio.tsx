/**
 * MENUQR — Menu Design Studio
 *
 * Replaces `Appearance.tsx`. That page exposed four fields (template, logo, display name,
 * tagline) with a `THEME_CATEGORIES` filter that always evaluated to one group — the rest of the
 * design system was unreachable. This page exposes the full `MenuTheme` contract: preset, brand
 * colour, cover, dish-card layout, typography, texture, density and per-dish photo focal points.
 *
 * The preview on the right is not a mockup of the renderer — it IS `MenuRenderer`, mounted with
 * the owner's real menu data inside `IsolatedMobileFrame` (a true-width iframe, so responsive
 * breakpoints evaluate correctly regardless of how wide this page itself is). A control changing
 * `theme` only rewrites CSS custom properties on one wrapper (`MenuThemeProvider`), so the
 * preview repaints without remounting — no image reloads, no lost scroll position.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  History,
  Image as ImageIcon,
  Loader2,
  Lock,
  Palette,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';

import MenuRenderer from '../../components/menu-renderer/MenuRenderer';
import { FocalPointPicker } from '../../components/menu-renderer/primitives/FocalPointPicker';
import IsolatedMobileFrame from '../../components/menu-builder/IsolatedMobileFrame';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { useToast } from '../../components/feedback/ToastProvider';

import { CURATED_SEEDS } from '../../design-system/palette';
import { FONT_PAIRINGS, FONT_PAIRING_IDS, type FontPairingId } from '../../design-system/fonts';
import { PRESETS, getPreset, themeFromPreset, type Preset } from '../../design-system/presets';
import { isValidHex } from '../../design-system/color';
import {
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  NAV_SLOTS,
  SECTION_SLOTS,
  TEXTURE_IDS,
  type CoverSlot,
  type DishCardSlot,
  type FocalPoint,
  type FooterSlot,
  type MenuTheme,
  type NavSlot,
  type SectionSlot,
  type TextureId,
} from '../../design-system/theme.types';
import type { Density, RadiusToken, ShadowToken } from '../../design-system/scales';
import type { RenderCategory, RenderMenuItem } from '../../components/menu-renderer/types';

import {
  getMenu,
  getProfile,
  getSubscription,
  getTheme,
  getThemeHistory,
  publishTheme,
  rollbackTheme,
  saveThemeDraft,
  updateMenuItem,
  uploadImage,
  type AppMenuData,
  type AppMenuItem,
  type AppProfile,
  type AppSubscriptionData,
  type ThemeHistoryEntry,
} from './appStore';

type TabId = 'preset' | 'brand' | 'cover' | 'cards' | 'photos';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'preset', label: 'Preset' },
  { id: 'brand', label: 'Brand' },
  { id: 'cover', label: 'Cover' },
  { id: 'cards', label: 'Cards' },
  { id: 'photos', label: 'Photos' },
];

const AUTOSAVE_DELAY_MS = 900;

// ───────────────────────────────── data shaping for the preview ─────────────────────────────────

function toRenderItem(item: AppMenuItem): RenderMenuItem {
  const focal = item.metadata?.focal;
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? undefined,
    price: item.price ?? 0,
    halfPrice: item.half_price ?? undefined,
    fullPrice: item.full_price ?? undefined,
    pricingType: item.pricing_type,
    variants: item.variants?.map((v) => ({ id: v.id, name: v.name, price: v.price })),
    dietType: (item.diet_type as RenderMenuItem['dietType']) || 'veg',
    available: item.is_available !== false,
    imageUrl: item.image_url ?? undefined,
    focal: focal ? { x: focal.x, y: focal.y } : undefined,
  };
}

function toRenderCategories(menu: AppMenuData | null): RenderCategory[] {
  if (!menu) return [];
  return menu.categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    items: category.items.map(toRenderItem),
  }));
}

// A handful of placeholder dishes, shown only until the owner's own menu has any items — so the
// preview is never a blank page, but switches to real data the moment there is any.
const SAMPLE_CATEGORIES: RenderCategory[] = [
  {
    id: 'sample-starters',
    name: 'Starters',
    items: [
      { id: 's1', name: 'Paneer Tikka', description: 'Charcoal-grilled, mint chutney', price: 280, dietType: 'veg', isBestseller: true },
      { id: 's2', name: 'Chicken Seekh Kebab', description: 'Hand-pounded spices, char-grilled', price: 340, dietType: 'non-veg' },
    ],
  },
  {
    id: 'sample-mains',
    name: 'Main Course',
    items: [
      { id: 's3', name: 'Dal Makhani', description: 'Slow-cooked overnight, finished with cream', price: 260, dietType: 'veg' },
      { id: 's4', name: 'Butter Chicken', description: 'Tandoori chicken in tomato-cashew gravy', price: 420, dietType: 'non-veg', isBestseller: true },
    ],
  },
];

export default function MenuDesignStudio() {
  const showToast = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [menu, setMenu] = useState<AppMenuData | null>(null);
  const [history, setHistory] = useState<ThemeHistoryEntry[]>([]);

  const [theme, setTheme] = useState<MenuTheme | null>(null);
  const [publishedVersion, setPublishedVersion] = useState(0);
  const [hasUnpublished, setHasUnpublished] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('preset');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextAutosave = useRef(true);

  useEffect(() => {
    let current = true;
    Promise.all([getTheme(), getProfile(), getSubscription(), getMenu()])
      .then(([themeState, profileData, subData, menuData]) => {
        if (!current) return;
        setProfile(profileData);
        setSub(subData);
        setMenu(menuData);
        setPublishedVersion(themeState.version);
        setHasUnpublished(themeState.hasUnpublishedChanges);

        if (themeState.draft) {
          setTheme(themeState.draft as MenuTheme);
        } else {
          // No theme saved yet: seed from the cuisine on file, same deterministic rule table
          // onboarding uses, so a brand-new Studio session already looks intentional.
          const seeded = themeFromPreset(
            PRESETS.find((p) => p.id === getPreset(undefined).id) ?? PRESETS[0]
          );
          setTheme({ ...seeded, brand: { ...seeded.brand, logoUrl: profileData.logoUrl ?? null } });
        }
      })
      .catch(() => {
        if (current) showToast('error', 'Could not load your menu design. Please refresh and try again.');
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [showToast]);

  // Debounced autosave. Skips the very first effect run (the load above already set the draft
  // server-side; re-saving it immediately would be a no-op network call on every page open).
  useEffect(() => {
    if (!theme) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }

    setSaving(true);
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      saveThemeDraft(theme)
        .then(() => setHasUnpublished(true))
        .catch(() => showToast('error', 'Your latest change could not be saved. Check your connection.'))
        .finally(() => setSaving(false));
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [theme, showToast]);

  const planId = sub?.planId?.toUpperCase() || 'BASIC';
  const isBasic = planId === 'BASIC';

  const previewCategories = useMemo(() => {
    const real = toRenderCategories(menu);
    return real.some((c) => c.items.length > 0) ? real : SAMPLE_CATEGORIES;
  }, [menu]);

  const handlePublish = useCallback(() => {
    if (!theme) return;
    setPublishing(true);
    publishTheme(theme)
      .then((result) => {
        setPublishedVersion(result.version);
        setHasUnpublished(false);
        showToast('success', 'Your menu design is live.');
        getThemeHistory().then(setHistory).catch(() => {});
      })
      .catch((err) => showToast('error', err instanceof Error ? err.message : 'Publish failed.'))
      .finally(() => setPublishing(false));
  }, [theme, showToast]);

  const handleOpenHistory = useCallback(() => {
    setHistoryOpen((open) => !open);
    if (!historyOpen && history.length === 0) {
      getThemeHistory()
        .then(setHistory)
        .catch(() => showToast('error', 'Could not load version history.'));
    }
  }, [historyOpen, history.length, showToast]);

  const handleRollback = useCallback(
    (version: number) => {
      rollbackTheme(version)
        .then((result) => {
          setTheme(result.published as MenuTheme);
          setPublishedVersion(result.version);
          setHasUnpublished(false);
          skipNextAutosave.current = true; // the rollback already persisted server-side
          showToast('success', `Restored version ${version}.`);
          setHistoryOpen(false);
        })
        .catch((err) => showToast('error', err instanceof Error ? err.message : 'Rollback failed.'));
    },
    [showToast]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#e8783c]" size={28} />
      </div>
    );
  }

  if (isBasic) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 sm:pt-6">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Menu Design Studio</h1>
          <p className="mt-2 text-sm text-[#849a90]">Customize how your digital menu looks to customers.</p>
        </header>
        <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] p-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5 pointer-events-none">
            <Palette size={200} />
          </div>
          <div className="bg-[#151c19] p-4 rounded-full mb-6 border border-[#2a3832]">
            <Lock size={32} className="text-[#849a90]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Menu Design Studio Locked</h2>
          <p className="text-[#849a90] max-w-md mb-8">
            Brand colours, cover styles and dish layouts are available on Intermediate and Premium plans.
          </p>
          <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white transition-colors shadow-lg shadow-[#e8783c]/20">
            <Zap size={18} /> Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  if (!theme) return null;

  const restaurant = {
    name: profile?.businessName || 'Your Restaurant',
    tagline: profile?.tagline,
    cuisine: profile?.cuisine,
    phone: profile?.phone,
    address: profile?.address,
    city: profile?.city,
    state: profile?.state,
    openingHours: profile?.openingHours,
    logoUrl: theme.brand.logoUrl ?? undefined,
  };

  return (
    <div className="max-w-[1500px] mx-auto px-4 md:px-8 pt-4 sm:pt-6 pb-16">
      <header className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Menu Design Studio</h1>
          <p className="mt-2 text-sm text-[#849a90] flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving draft…
              </>
            ) : hasUnpublished ? (
              'Unpublished changes'
            ) : (
              `Live · version ${publishedVersion}`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={handleOpenHistory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1d2723] hover:bg-[#25322c] border border-[#2a3832] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <History size={14} /> History <ChevronDown size={12} />
            </button>
            {historyOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#1d2723] border border-[#2a3832] rounded-xl shadow-2xl z-30 p-2 max-h-80 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-[#849a90] p-3">No published versions yet.</p>
                ) : (
                  history.map((entry) => (
                    <button
                      key={entry.version}
                      type="button"
                      onClick={() => handleRollback(entry.version)}
                      disabled={entry.version === publishedVersion}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-[#151c19] text-left disabled:opacity-50 disabled:cursor-default cursor-pointer"
                    >
                      <span className="text-xs">
                        <span className="font-bold text-white">Version {entry.version}</span>
                        <span className="block text-[#849a90]">{new Date(entry.createdAt).toLocaleString()}</span>
                      </span>
                      {entry.version === publishedVersion ? (
                        <Check size={14} className="text-emerald-400 shrink-0" />
                      ) : (
                        <RotateCcw size={13} className="text-[#849a90] shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing || (!hasUnpublished && publishedVersion > 0)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] disabled:opacity-50 disabled:cursor-default text-sm font-bold text-white shadow-lg shadow-[#e8783c]/20 transition-colors cursor-pointer"
          >
            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Publish
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
        {/* ───────────────────────── Controls ───────────────────────── */}
        <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden">
          <nav className="flex border-b border-[#2a3832] overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-white border-[#e8783c]'
                    : 'text-[#849a90] border-transparent hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="p-5 sm:p-6">
            {activeTab === 'preset' && <PresetTab theme={theme} onChange={setTheme} />}
            {activeTab === 'brand' && (
              <BrandTab theme={theme} onChange={setTheme} showToast={showToast} />
            )}
            {activeTab === 'cover' && (
              <CoverTab theme={theme} onChange={setTheme} showToast={showToast} />
            )}
            {activeTab === 'cards' && <CardsTab theme={theme} onChange={setTheme} />}
            {activeTab === 'photos' && (
              <PhotosTab menu={menu} onMenuChange={setMenu} showToast={showToast} />
            )}
          </div>
        </div>

        {/* ───────────────────────── Live preview ───────────────────────── */}
        <div className="lg:sticky lg:top-4 self-start flex flex-col items-center">
          <PremiumIPhoneMockup
            badgeText="Live Preview"
            showStatusBar
            showDynamicIsland
            showHomeIndicator
            statusBarTheme={theme.mode === 'dark' ? 'light' : 'dark'}
            homeIndicatorTheme={theme.mode === 'dark' ? 'light' : 'dark'}
          >
            <IsolatedMobileFrame>
              <MenuRenderer theme={theme} restaurant={restaurant} categories={previewCategories} compact />
            </IsolatedMobileFrame>
          </PremiumIPhoneMockup>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────── Preset tab ─────────────────────────────────────────

function PresetTab({ theme, onChange }: { theme: MenuTheme; onChange: (t: MenuTheme) => void }) {
  const applyPreset = (preset: Preset) => {
    // Keep the owner's brand (logo, colour, photos) — only the structural choices reset.
    onChange({
      ...themeFromPreset(preset),
      brand: theme.brand,
      cover: theme.cover,
      announcement: theme.announcement,
    });
  };

  return (
    <div>
      <p className="text-xs text-[#849a90] mb-4">
        Start from an archetype. Your logo, colour and cover photo carry over — only the layout changes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map((preset) => {
          const active = preset.id === theme.presetId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                active ? 'border-[#e8783c] bg-[#e8783c]/10' : 'border-[#2a3832] bg-[#151c19] hover:border-[#3a4a42]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white">{preset.label}</span>
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: preset.seedColor }}
                />
              </div>
              <p className="text-[11px] text-[#849a90] leading-relaxed">{preset.audience}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────── Brand tab ──────────────────────────────────────────

function BrandTab({
  theme,
  onChange,
  showToast,
}: {
  theme: MenuTheme;
  onChange: (t: MenuTheme) => void;
  showToast: ReturnType<typeof useToast>;
}) {
  const [hexInput, setHexInput] = useState(theme.brand.seedColor);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setSeed = (seed: string) => onChange({ ...theme, brand: { ...theme.brand, seedColor: seed } });

  const handleHexSubmit = () => {
    const normalised = hexInput.trim();
    if (!isValidHex(normalised)) {
      showToast('error', 'Enter a valid hex colour, e.g. #D4AF37.');
      return;
    }
    setSeed(normalised.startsWith('#') ? normalised : `#${normalised}`);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file.');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await uploadImage(reader.result as string, 'logos', 800);
        onChange({ ...theme, brand: { ...theme.brand, logoUrl: result.url } });
        showToast('success', 'Logo uploaded.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Logo upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      showToast('error', 'Could not read that image.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-bold text-white mb-3">Logo</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#2a3832] bg-[#151c19] flex items-center justify-center overflow-hidden shrink-0">
            {theme.brand.logoUrl ? (
              <img src={theme.brand.logoUrl} alt="Logo" className="w-full h-full object-contain p-1.5" />
            ) : (
              <ImageIcon size={20} className="text-[#849a90]" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#151c19] hover:bg-[#25322c] border border-[#2a3832] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} className="text-[#e8783c]" />}
              {theme.brand.logoUrl ? 'Change' : 'Upload'}
            </button>
            {theme.brand.logoUrl && (
              <button
                type="button"
                onClick={() => onChange({ ...theme, brand: { ...theme.brand, logoUrl: null } })}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {(['circle', 'square', 'wordmark'] as const).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => onChange({ ...theme, brand: { ...theme.brand, logoShape: shape } })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                theme.brand.logoShape === shape
                  ? 'bg-[#e8783c] text-white'
                  : 'bg-[#151c19] text-[#849a90] border border-[#2a3832] hover:text-white'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-white mb-3">Brand Colour</h3>
        <p className="text-xs text-[#849a90] mb-3">
          Pick one colour — every other colour on your menu is derived from it, with legibility guaranteed.
        </p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {CURATED_SEEDS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setSeed(entry.seed);
                onChange({ ...theme, brand: { ...theme.brand, seedColor: entry.seed }, mode: entry.mode });
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
              title={entry.label}
            >
              <span
                className={`w-10 h-10 rounded-full border-2 transition-transform group-hover:scale-105 ${
                  theme.brand.seedColor.toLowerCase() === entry.seed.toLowerCase() ? 'border-white' : 'border-white/20'
                }`}
                style={{ backgroundColor: entry.seed }}
              />
              <span className="text-[9px] text-[#849a90] text-center leading-tight">{entry.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={isValidHex(theme.brand.seedColor) ? theme.brand.seedColor : '#D4AF37'}
            onChange={(e) => setSeed(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[#2a3832] bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
            placeholder="#D4AF37"
            maxLength={9}
            className="flex-1 bg-[#151c19] border border-[#2a3832] focus:border-[#e8783c] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white font-mono transition-colors"
          />
        </div>

        <div className="flex gap-2 mt-4">
          {(['light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...theme, mode })}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                theme.mode === mode
                  ? 'bg-[#e8783c] text-white'
                  : 'bg-[#151c19] text-[#849a90] border border-[#2a3832] hover:text-white'
              }`}
            >
              {mode} page
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────── Cover tab ──────────────────────────────────────────

const COVER_LABELS: Record<CoverSlot, string> = {
  'hero-photo': 'Cinematic Photo',
  monogram: 'Monogram',
  'heritage-arch': 'Heritage Arch',
  'bento-collage': 'Dish Collage',
};

function CoverTab({
  theme,
  onChange,
  showToast,
}: {
  theme: MenuTheme;
  onChange: (t: MenuTheme) => void;
  showToast: ReturnType<typeof useToast>;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file.');
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = await uploadImage(reader.result as string, 'covers', 1600);
        onChange({ ...theme, cover: { ...theme.cover, imageUrl: result.url, focal: { x: 0.5, y: 0.5 } } });
        showToast('success', 'Cover photo uploaded.');
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      showToast('error', 'Could not read that image.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-bold text-white mb-3">Cover Style</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {COVER_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onChange({ ...theme, slots: { ...theme.slots, cover: slot } })}
              className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                theme.slots.cover === slot
                  ? 'bg-[#e8783c]/10 border border-[#e8783c] text-white'
                  : 'bg-[#151c19] border border-[#2a3832] text-[#849a90] hover:text-white'
              }`}
            >
              {COVER_LABELS[slot]}
            </button>
          ))}
        </div>
      </section>

      {theme.slots.cover === 'hero-photo' && (
        <section>
          <h3 className="text-sm font-bold text-white mb-3">Cover Photo</h3>
          <p className="text-xs text-[#849a90] mb-3">
            Drag the dot onto the part of the photo that matters — every crop anchors there.
          </p>

          {theme.cover.imageUrl ? (
            <FocalPointPicker
              src={theme.cover.imageUrl}
              alt="Cover photo"
              value={theme.cover.focal}
              onChange={(focal: FocalPoint) => onChange({ ...theme, cover: { ...theme.cover, focal } })}
            />
          ) : (
            <div className="rounded-xl border-2 border-dashed border-[#2a3832] bg-[#151c19] p-8 text-center">
              <ImageIcon size={24} className="text-[#849a90] mx-auto mb-2" />
              <p className="text-xs text-[#849a90]">No cover photo yet — the menu uses a compact fallback cover.</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#151c19] hover:bg-[#25322c] border border-[#2a3832] text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} className="text-[#e8783c]" />}
              {theme.cover.imageUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
          </div>

          <label className="flex items-center gap-2 mt-4 text-xs text-[#849a90]">
            Overlay strength
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(theme.cover.overlayStrength * 100)}
              onChange={(e) => onChange({ ...theme, cover: { ...theme.cover, overlayStrength: Number(e.target.value) / 100 } })}
              className="flex-1 accent-[#e8783c]"
            />
          </label>
        </section>
      )}

      <section>
        <h3 className="text-sm font-bold text-white mb-3">Announcement Strip</h3>
        <input
          type="text"
          value={theme.announcement ?? ''}
          onChange={(e) => onChange({ ...theme, announcement: e.target.value || null })}
          placeholder="e.g. Happy Hours 4-7 PM"
          maxLength={120}
          className="w-full bg-[#151c19] border border-[#2a3832] focus:border-[#e8783c] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
        />
      </section>

      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm font-bold text-white">Show as a cover page</span>
        <button
          type="button"
          role="switch"
          aria-checked={theme.cover.showCoverPage}
          onClick={() => onChange({ ...theme, cover: { ...theme.cover, showCoverPage: !theme.cover.showCoverPage } })}
          className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
            theme.cover.showCoverPage ? 'bg-[#e8783c]' : 'bg-[#2a3832]'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              theme.cover.showCoverPage ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </label>
    </div>
  );
}

// ────────────────────────────────────────── Cards tab ──────────────────────────────────────────

const DISH_CARD_LABELS: Record<DishCardSlot, string> = {
  magazine: 'Magazine',
  'michelin-leader': 'Michelin Leader',
  'compact-row': 'Compact Row',
  'bento-tile': 'Bento Tile',
};
const NAV_LABELS: Record<NavSlot, string> = {
  'capsule-pills': 'Capsule Pills',
  'underline-tabs': 'Underline Tabs',
  'sidebar-index': 'Sidebar Index',
};
const SECTION_LABELS: Record<SectionSlot, string> = {
  ribbon: 'Ribbon',
  'hairline-caps': 'Hairline Caps',
  'arch-title': 'Arch Title',
};
const FOOTER_LABELS: Record<FooterSlot, string> = {
  'contact-block': 'Contact Block',
  'minimal-mark': 'Minimal Mark',
};
const TEXTURE_LABELS: Record<TextureId, string> = {
  none: 'None',
  grain: 'Grain',
  parchment: 'Parchment',
  slate: 'Slate',
  silk: 'Silk',
  dots: 'Dots',
};
const DENSITY_LABELS: Record<Density, string> = { compact: 'Compact', balanced: 'Balanced', spacious: 'Spacious' };
const RADIUS_OPTIONS: RadiusToken[] = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const SHADOW_OPTIONS: ShadowToken[] = ['none', 'subtle', 'elevated', 'glass'];

function PillGroup<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels?: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <h3 className="text-xs font-bold text-[#849a90] uppercase tracking-wide mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
              value === option
                ? 'bg-[#e8783c] text-white'
                : 'bg-[#151c19] text-[#849a90] border border-[#2a3832] hover:text-white'
            }`}
          >
            {labels?.[option] ?? option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardsTab({ theme, onChange }: { theme: MenuTheme; onChange: (t: MenuTheme) => void }) {
  return (
    <div className="space-y-6">
      <PillGroup
        label="Dish Cards"
        value={theme.slots.dishCard}
        options={DISH_CARD_SLOTS}
        labels={DISH_CARD_LABELS}
        onChange={(dishCard) => onChange({ ...theme, slots: { ...theme.slots, dishCard } })}
      />
      <PillGroup
        label="Navigation"
        value={theme.slots.nav}
        options={NAV_SLOTS}
        labels={NAV_LABELS}
        onChange={(nav) => onChange({ ...theme, slots: { ...theme.slots, nav } })}
      />
      <PillGroup
        label="Category Headings"
        value={theme.slots.section}
        options={SECTION_SLOTS}
        labels={SECTION_LABELS}
        onChange={(section) => onChange({ ...theme, slots: { ...theme.slots, section } })}
      />
      <PillGroup
        label="Footer"
        value={theme.slots.footer}
        options={FOOTER_SLOTS}
        labels={FOOTER_LABELS}
        onChange={(footer) => onChange({ ...theme, slots: { ...theme.slots, footer } })}
      />

      <div>
        <h3 className="text-xs font-bold text-[#849a90] uppercase tracking-wide mb-2">Typography</h3>
        <div className="flex flex-wrap gap-2">
          {FONT_PAIRING_IDS.map((id: FontPairingId) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange({ ...theme, typePair: id })}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                theme.typePair === id
                  ? 'bg-[#e8783c] text-white'
                  : 'bg-[#151c19] text-[#849a90] border border-[#2a3832] hover:text-white'
              }`}
              title={FONT_PAIRINGS[id].description}
            >
              {FONT_PAIRINGS[id].label}
            </button>
          ))}
        </div>
      </div>

      <PillGroup
        label="Texture"
        value={theme.texture}
        options={TEXTURE_IDS}
        labels={TEXTURE_LABELS}
        onChange={(texture) => onChange({ ...theme, texture })}
      />
      <PillGroup
        label="Density"
        value={theme.density}
        options={['compact', 'balanced', 'spacious'] as const}
        labels={DENSITY_LABELS}
        onChange={(density) => onChange({ ...theme, density })}
      />
      <PillGroup
        label="Corner Radius"
        value={theme.radius}
        options={RADIUS_OPTIONS}
        onChange={(radius) => onChange({ ...theme, radius })}
      />
      <PillGroup
        label="Shadow"
        value={theme.shadow}
        options={SHADOW_OPTIONS}
        onChange={(shadow) => onChange({ ...theme, shadow })}
      />
    </div>
  );
}

// ────────────────────────────────────────── Photos tab ──────────────────────────────────────────

function PhotosTab({
  menu,
  onMenuChange,
  showToast,
}: {
  menu: AppMenuData | null;
  onMenuChange: (m: AppMenuData) => void;
  showToast: ReturnType<typeof useToast>;
}) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo(
    () => (menu?.categories ?? []).flatMap((c) => c.items.map((item) => ({ item, categoryName: c.name }))),
    [menu]
  );

  const withoutPhoto = items.filter(({ item }) => !item.image_url);
  const withPhoto = items.filter(({ item }) => item.image_url);

  const patchItem = (updated: AppMenuItem) => {
    if (!menu) return;
    onMenuChange({
      ...menu,
      categories: menu.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => (i.id === updated.id ? updated : i)),
      })),
    });
  };

  const handleUpload = (item: AppMenuItem, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file.');
      return;
    }
    setUploadingItemId(item.id);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const uploaded = await uploadImage(reader.result as string, 'dishes', 1200);
        const saved = await updateMenuItem(item.id, { imageUrl: uploaded.url, focal: { x: 0.5, y: 0.5 } });
        patchItem(saved);
        setExpandedItemId(item.id);
        showToast('success', `Photo added to ${item.name}.`);
      } catch (err) {
        showToast('error', err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploadingItemId(null);
      }
    };
    reader.onerror = () => setUploadingItemId(null);
    reader.readAsDataURL(file);
  };

  const handleFocalChange = (item: AppMenuItem, focal: FocalPoint) => {
    // Optimistic — the picker drags continuously, so the preview must not wait on the network.
    patchItem({ ...item, metadata: { ...item.metadata, focal } });
    updateMenuItem(item.id, { focal }).catch(() => showToast('error', 'Could not save that focal point.'));
  };

  if (!menu || items.length === 0) {
    return <p className="text-sm text-[#849a90]">Add dishes to your menu first, then come back here to photograph them.</p>;
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const id = fileInputRef.current?.dataset.itemId;
          const item = items.find((entry) => entry.item.id === id)?.item;
          if (item) handleUpload(item, e);
          e.target.value = '';
        }}
      />

      {withoutPhoto.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-[#849a90] uppercase tracking-wide mb-2">
            Needs a photo ({withoutPhoto.length})
          </h3>
          <div className="space-y-2">
            {withoutPhoto.map(({ item, categoryName }) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#151c19] border border-[#2a3832]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-[#849a90]">{categoryName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.dataset.itemId = item.id;
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={uploadingItemId === item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1d2723] hover:bg-[#25322c] border border-[#2a3832] text-xs font-bold text-white transition-colors cursor-pointer shrink-0"
                >
                  {uploadingItemId === item.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Upload size={12} className="text-[#e8783c]" />
                  )}
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {withPhoto.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-[#849a90] uppercase tracking-wide mb-2">Photographed ({withPhoto.length})</h3>
          <div className="space-y-2">
            {withPhoto.map(({ item, categoryName }) => {
              const expanded = expandedItemId === item.id;
              return (
                <div key={item.id} className="rounded-xl bg-[#151c19] border border-[#2a3832] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedItemId(expanded ? null : item.id)}
                    className="w-full flex items-center gap-3 p-3 cursor-pointer text-left"
                  >
                    <img src={item.image_url!} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-[#849a90]">{categoryName}</p>
                    </div>
                    <Sparkles size={13} className="text-[#849a90] shrink-0" />
                  </button>
                  {expanded && (
                    <div className="px-3 pb-3 space-y-3">
                      <FocalPointPicker
                        src={item.image_url!}
                        alt={item.name}
                        value={item.metadata?.focal ?? { x: 0.5, y: 0.5 }}
                        onChange={(focal) => handleFocalChange(item, focal)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.dataset.itemId = item.id;
                            fileInputRef.current.click();
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1d2723] hover:bg-[#25322c] border border-[#2a3832] text-xs font-bold text-white transition-colors cursor-pointer"
                      >
                        <Upload size={12} className="text-[#e8783c]" /> Replace Photo
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

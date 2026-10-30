import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Copy,
  ExternalLink,
  Store,
  Sparkles, 
  Smartphone, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Edit3, 
  CheckCircle2, 
  FileSpreadsheet, 
  Download, 
  RefreshCw,
  Palette,
  Eye,
  Layers,
  Layout,
  Type,
  Sun,
  Moon,
  Camera,
  Utensils,
  Search,
} from 'lucide-react';
import QRCode from 'qrcode';
import RoyalWalnutStickerCard from '../../components/sticker/RoyalWalnutStickerCard';
import { exportStickerToPng } from '../../utils/stickerExporter';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import QRGenerationSequence from '../../components/qr-studio/QRGenerationSequence';
import {
  PRESETS,
  SHOWCASE_PRESETS,
  DEFAULT_SHOWCASE_PRESET_ID,
  themeFromPreset,
  themeFromPresetId,
  type Preset,
} from '../../design-system/presets';
import { derivePalette } from '../../design-system/palette';
import { SIGNATURE_COVER_CAPS } from '../../components/menu-renderer/signature/registry';
import type {
  CoverSlot,
  DishCardSlot,
  NavSlot,
  SectionSlot,
  TextureId,
  MenuTheme
} from '../../design-system/theme.types';
import type { Density } from '../../design-system/scales';
import type { FontPairingId } from '../../design-system/fonts';
import { CURATED_SEEDS } from '../../design-system/palette';
import { isValidHex } from '../../design-system/color';
import { DEMO_RESTAURANT } from '../../data/menuTemplates';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { 
  parseExcelMenuFile, 
  downloadSampleMenuExcel, 
  getDemoMenuData, 
  type ParsedCategory, 
  type ParsedMenuItem 
} from '../../utils/excelMenuParser';
import {
  createPermanentQr,
  getQr,
  getSubscription,
  getProfile,
  saveOnboarding,
  publishTheme,
  uploadImage,
  resolveMenuImages,
  type AppQrData
} from '../app/appStore';
import { useToast } from '../../components/feedback/ToastProvider';
import LottieMoment from '../../components/common/LottieMoment';
import { useOnboardingDraft } from './onboarding/useOnboardingDraft';
import OnboardingShell, { type ShellStep } from './onboarding/OnboardingShell';
import DishPhotosStep from './onboarding/steps/DishPhotosStep';
import MenuTableEditor from './onboarding/steps/MenuTableEditor';
import { OB, DISPLAY } from './onboarding/chrome';

// Reads a file as a data URL, then runs it through the real optimize+storage
// pipeline (sharp resize, AVIF/WebP variants, durable storage driver) instead
// of holding a raw base64 blob in component state — that pipeline already
// exists (appStore.uploadImage -> POST /api/app/upload-image) but nothing in
// this wizard called it before.
async function uploadImageFile(file: File, category: 'dishes' | 'logos' | 'covers'): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image file size must be less than 5MB');
  }
  const dataUri = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
  const result = await uploadImage(dataUri, category, 1200);
  return result.url;
}

type RestaurantData = {
  name: string;
  tagline: string;
  phone: string;
  city: string;
  address: string;
  logoUrl: string;
  templateId: string;
  categories: ParsedCategory[];
  items: ParsedMenuItem[];
};

// Reusable Image Selector Component (File Picker -> real optimize+upload pipeline, + URL Paste Fallback)
function ImageSelector({
  label,
  value,
  onChange,
  placeholder = 'Select an image file or paste URL',
  compact = false,
  category = 'logos',
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  compact?: boolean;
  category?: 'dishes' | 'logos' | 'covers';
}) {
  // The button used to say "Choose Logo Image" whatever it was picking, which is why the cover
  // photo uploader never read as one.
  const noun = category === 'covers' ? 'Cover Photo' : category === 'dishes' ? 'Dish Photo' : 'Logo Image';

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImageFile(file, category);
      onChange(url);
      setJustUploaded(true);
    } catch (err: any) {
      setUploadError(err?.message || 'Could not upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-[#A3957E]">{label}</label>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {isUploading ? (
          <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl border-2 border-dashed border-[#D4AF37]/40 bg-[#0E0C09] flex items-center justify-center shrink-0`}>
            <LottieMoment moment="photo-matching" loop className="w-full h-full" />
          </div>
        ) : justUploaded ? (
          <div className="relative shrink-0 self-start">
            <img
              src={value}
              alt="Selected preview"
              className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl object-cover border-2 border-emerald-400 bg-black shadow-md`}
              decoding="async"
              loading="lazy"
            />
            <LottieMoment
              moment="logo-upload-success"
              loop={false}
              onComplete={() => setJustUploaded(false)}
              className="absolute -top-3 -right-3 w-8 h-8 pointer-events-none"
            />
          </div>
        ) : value ? (
          <div className="relative group shrink-0 self-start">
            <img
              src={value}
              alt="Selected preview"
              className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl object-cover border-2 border-[#D4AF37] bg-black shadow-md`}
              decoding="async"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110 cursor-pointer"
              title="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div
            className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl border-2 border-dashed border-[#D4AF37]/25 bg-[#0E0C09] flex flex-col items-center justify-center text-[#A3957E] shrink-0`}
          >
            <ImageIcon size={compact ? 20 : 26} className="opacity-50 text-[#D4AF37]" />
            {!compact && <span className="text-[10px] mt-1 opacity-60">No {noun.toLowerCase()}</span>}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer bg-[#2B251D] hover:bg-[#332C22] border border-[#D4AF37]/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
              <Upload size={14} className="text-[#D4AF37]" />
              <span>{isUploading ? 'Uploading...' : `${value ? 'Change' : 'Choose'} ${noun}`}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-[#A3957E] hover:text-white underline decoration-dashed transition-colors py-1 px-2 cursor-pointer"
            >
              {showUrlInput ? 'Hide URL input' : 'Paste web URL'}
            </button>
          </div>
          {showUrlInput && (
            <input
              type="url"
              value={value.startsWith('data:') ? '' : value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
            />
          )}
          {uploadError && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
              <LottieMoment moment="error" loop={false} className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * How the brand mark will actually sit on the cover.
 *
 * A logo is never just a file in a form — shown in its cartouche, an owner can tell straight away
 * whether their PNG has a white box behind it, and sees that the cover is never blank without one
 * (the Editions set the initials in their own display face, via `editions/shared.tsx`'s BrandMark).
 */
function BrandLockPreview({ logoUrl, name }: { logoUrl: string; name: string }) {
  const initials = (name || 'MQ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('') || 'MQ';

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[#D4AF37]/15 bg-[#0E0C09] p-4">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#A3957E]">On your menu cover</span>
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#141009] p-2.5 shadow-inner">
        {logoUrl ? (
          <img src={logoUrl} alt="" className="h-full w-full object-contain" decoding="async" />
        ) : (
          <span className="text-xl tracking-[0.12em] text-[#D4AF37]" style={{ fontFamily: DISPLAY }}>
            {initials}
          </span>
        )}
      </div>
      <p className="max-w-xs text-center text-[10px] leading-relaxed text-[#766A58]">
        {logoUrl
          ? 'A transparent PNG sits best on the darker Editions — anything else shows its own background.'
          : 'Without a logo your initials are set in the Edition’s display face, so the cover is never blank.'}
      </p>
    </div>
  );
}

// ──────────────────────────────── Design Studio Curated Presets & Assets ────────────────────────────────

const CURATED_COVER_PHOTOS = [
  {
    id: 'royal-darbar',
    title: 'Royal Darbar Feast',
    cuisine: 'Mughlai & Heritage Indian',
    url: '/assets/themes/variations/royal-darbar-facing.jpg',
  },
  {
    id: 'dum-pukht',
    title: 'Nawabi Dum Pukht',
    cuisine: 'Royal Biryani & Kebabs',
    url: '/assets/themes/variations/nawabi-dum-pukht-facing.jpg',
  },
  {
    id: 'rustic-bbq',
    title: 'Charcoal BBQ Grill',
    cuisine: 'Steaks & Sizzlers',
    url: '/assets/themes/variations/rustic-bbq-facing.jpg',
  },
  {
    id: 'artisan-bakery',
    title: 'Artisan Bakery & Cafe',
    cuisine: 'Croissants & Specialty Coffee',
    url: '/assets/themes/variations/artisan-bakery-facing.jpg',
  },
  {
    id: 'asian-dimsum',
    title: 'Asian Dimsum & Bowls',
    cuisine: 'Ramen, Sushi & Dimsum',
    url: '/assets/themes/variations/asian-dimsum-facing.jpg',
  },
  {
    id: 'desi-street',
    title: 'Desi Street Food & Chaat',
    cuisine: 'Tandoor, Chaat & Rolls',
    url: '/assets/themes/variations/desi-street-food-facing.jpg',
  },
  {
    id: 'retro-burger',
    title: 'Gourmet Smash Burger',
    cuisine: 'Burgers, Wings & Shakes',
    url: '/assets/themes/variations/retro-burger-diner-facing.jpg',
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean Mezze',
    cuisine: 'Hummus, Falafel & Fresh Salads',
    url: '/assets/themes/variations/mediterranean-mezze-facing.jpg',
  },
];

const COVER_STYLE_OPTIONS: Array<{ id: CoverSlot; label: string; desc: string; icon: string }> = [
  { id: 'hero-photo', label: 'Cinematic Photo', desc: 'Full-bleed high-res food photo with darkened gradient scrim', icon: '📸' },
  { id: 'heritage-arch', label: 'Royal Heritage Arch', desc: 'Classical scalloped arch frame with ornamental palace borders', icon: '🏛️' },
  { id: 'bento-collage', label: 'Dish Bento Collage', desc: 'Dynamic grid collage showing off your signature dishes', icon: '🍱' },
  { id: 'monogram', label: 'Luxury Monogram', desc: 'Minimalist typography with subtle embossed emblem', icon: '⚜️' },
];

const DISH_CARD_OPTIONS: Array<{ id: DishCardSlot; label: string; desc: string; icon: string }> = [
  { id: 'magazine', label: 'Magazine Hero Cards', desc: 'Large photography cards with full descriptions and bestseller tags', icon: '📸' },
  { id: 'bento-tile', label: 'Bento Grid Tiles', desc: 'Modern 2-column image tiles perfect for fast mobile browsing', icon: '🍱' },
  { id: 'michelin-leader', label: 'Michelin Star Leader', desc: 'Elegant typography with fine-dining dotted price lines', icon: '⭐' },
  { id: 'compact-row', label: 'Speed Compact Rows', desc: 'Clean, dense rows built for fast scrolling and quick ordering', icon: '⚡' },
];

const NAV_OPTIONS: Array<{ id: NavSlot; label: string; icon: string }> = [
  { id: 'capsule-pills', label: 'Capsule Pills', icon: '💊' },
  { id: 'underline-tabs', label: 'Underline Tabs', icon: '📑' },
  { id: 'sidebar-index', label: 'Sidebar Index', icon: '📑' },
];

const SECTION_OPTIONS: Array<{ id: SectionSlot; label: string; icon: string }> = [
  { id: 'arch-title', label: 'Royal Arch Title', icon: '🏛️' },
  { id: 'ribbon', label: 'Bold Ribbon Bar', icon: '🎗️' },
  { id: 'hairline-caps', label: 'Hairline Caps', icon: '🔤' },
];

const TEXTURE_OPTIONS: Array<{ id: TextureId; label: string; icon: string }> = [
  { id: 'parchment', label: 'Warm Parchment', icon: '📜' },
  { id: 'slate', label: 'Dark Slate', icon: '🪨' },
  { id: 'grain', label: 'Artisan Grain', icon: '🌾' },
  { id: 'dots', label: 'Polka Dots', icon: '⚪' },
  { id: 'silk', label: 'Subtle Silk', icon: '🧣' },
  { id: 'none', label: 'Clean Minimal', icon: '💎' },
];

const TYPOGRAPHY_OPTIONS: Array<{ id: FontPairingId; label: string; fontName: string }> = [
  { id: 'royal-serif', label: 'Royal Serif', fontName: 'Playfair Display + Inter' },
  { id: 'modern-sans', label: 'Modern Sans', fontName: 'Plus Jakarta Sans' },
  { id: 'bold-street', label: 'Bold Street', fontName: 'Syne + Outfit' },
  { id: 'devanagari-pro', label: 'Devanagari Pro', fontName: 'Rozha One + Mukta' },
];

const DENSITY_OPTIONS: Array<{ id: Density; label: string }> = [
  { id: 'compact', label: 'Compact' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'spacious', label: 'Spacious' },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [planId, setPlanId] = useState('PREMIUM');
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [justUploadedLogo, setJustUploadedLogo] = useState(false);

  // Local-only draft resume (same browser/device) — see useOnboardingDraft.
  const [userId, setUserId] = useState<string | null>(null);
  const { loadDraft, saveDraft, clearDraft } = useOnboardingDraft<RestaurantData>();

  // Excel Upload State
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [isResolvingImages, setIsResolvingImages] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [excelSummary, setExcelSummary] = useState<{
    totalDishes: number;
    categoriesCount: number;
    vegCount: number;
    nonVegCount: number;
    dualPriceCount: number;
  } | null>(null);

  // Luxury Table Plaque Sticker State
  const [stickerQrDataUrl, setStickerQrDataUrl] = useState<string>('');
  const stickerCardRef = useRef<HTMLDivElement>(null);
  const [isDownloadingSticker, setIsDownloadingSticker] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      getSubscription(),
      getProfile()
    ]).then(([subResult, profileResult]) => {
      if (subResult.status === 'fulfilled' && subResult.value?.planId) {
        setPlanId(subResult.value.planId.toUpperCase());
      }

      const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
      if (profile?.id) setUserId(profile.id);

      // A local draft is a full, more-recent snapshot of this session's progress — prefer it
      // over re-deriving the identity step from the profile alone when one exists.
      const draft = profile?.id ? loadDraft(profile.id) : null;
      if (draft) {
        const isShowcase = SHOWCASE_PRESETS.some((p) => p.id === draft.restaurantData.templateId);
        const safeTemplateId = isShowcase ? draft.restaurantData.templateId : DEFAULT_SHOWCASE_PRESET_ID;
        setCurrentStepIdx(draft.currentStepIdx);
        setRestaurantData({ ...draft.restaurantData, templateId: safeTemplateId });
        setStudioTheme(isShowcase ? draft.studioTheme : themeFromPresetId(safeTemplateId));
        if (draft.restaurantData.name || draft.restaurantData.phone) setIsPreloaded(true);
      } else if (profile) {
        if (profile.businessName || profile.phone || profile.city || profile.address) {
          setRestaurantData((prev) => ({
            ...prev,
            name: profile.businessName || prev.name,
            tagline: profile.tagline || prev.tagline,
            phone: profile.phone || prev.phone,
            city: profile.city || prev.city,
            address: profile.address || prev.address,
            logoUrl: profile.logoUrl || prev.logoUrl,
          }));
          setIsPreloaded(true);
        }
      }
      setIsLoadingProfile(false);
    }).catch((err) => {
      console.error(err);
      setIsLoadingProfile(false);
    });
    // Runs once on mount — loadDraft is a stable useCallback, intentionally not re-triggering this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // `dish-photos` is new; the other four ids are unchanged so nothing downstream shifts.
  const getSteps = () => {
    return ['identity', 'excel-upload', 'dish-photos', 'templates', 'preview'];
  };

  const steps = getSteps();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = steps[currentStepIdx];

  const [restaurantData, setRestaurantData] = useState<RestaurantData>({
    name: '',
    tagline: '',
    phone: '',
    city: '',
    address: '',
    logoUrl: '',
    templateId: DEFAULT_SHOWCASE_PRESET_ID, // Start with Maison Noir Signature Edition
    categories: [],
    items: [],
  });

  const [studioSubTab, setStudioSubTab] = useState<'design' | 'cover' | 'layout' | 'brand'>('design');
  const [designCategory, setDesignCategory] = useState<string>('all');
  const [designSearch, setDesignSearch] = useState<string>('');
  const [previewSection, setPreviewSection] = useState<'cover' | 'dishes'>('cover');
  const phoneScrollRef = useRef<HTMLDivElement>(null);
  const [customHexInput, setCustomHexInput] = useState('');

  const [studioTheme, setStudioTheme] = useState<MenuTheme>(() => {
    return themeFromPresetId(DEFAULT_SHOWCASE_PRESET_ID);
  });

  const scrollToSection = (section: 'cover' | 'dishes') => {
    setPreviewSection(section);
    if (phoneScrollRef.current) {
      if (section === 'cover') {
        phoneScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        phoneScrollRef.current.scrollTo({ top: 620, behavior: 'smooth' });
      }
    }
  };

  // Sync logo when uploaded in Step 1 or Step 3
  useEffect(() => {
    setStudioTheme((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        logoUrl: restaurantData.logoUrl || null,
      },
    }));
  }, [restaurantData.logoUrl]);

  // Switching the starting design resets every slot/style/colour field to that preset's defaults
  // — "reset to preset" is the documented semantics of a preset (design-system/presets.ts) — while
  // keeping the two things genuinely specific to this owner: their logo and announcement text.
  const [justSelectedPresetId, setJustSelectedPresetId] = useState<string | null>(null);

  const filteredPresets = useMemo(() => {
    const q = designSearch.trim().toLowerCase();
    return SHOWCASE_PRESETS.filter((preset) => {
      const matchCat = designCategory === 'all' || preset.category === designCategory;
      const matchSearch =
        !q ||
        [preset.label, preset.description, preset.audience, preset.id]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchCat && matchSearch;
    });
  }, [designCategory, designSearch]);

  const handleSelectPreset = useCallback((preset: Preset) => {
    setRestaurantData((prev) => ({ ...prev, templateId: preset.id }));
    setStudioTheme((prev) => {
      const fresh = themeFromPreset(preset);
      return {
        ...fresh,
        brand: { ...fresh.brand, logoUrl: prev.brand.logoUrl },
        announcement: prev.announcement,
      };
    });
    setJustSelectedPresetId(preset.id);
  }, []);

  // Local-only draft autosave (debounced inside the hook) — lets a refresh mid-wizard resume
  // on the same browser instead of restarting at step 1.
  useEffect(() => {
    if (!userId) return;
    saveDraft(userId, { currentStepIdx, restaurantData, studioTheme });
  }, [userId, currentStepIdx, restaurantData, studioTheme, saveDraft]);

  const previewTheme = studioTheme;

  // Which cover controls this design can honestly offer. An Edition's architecture is fixed, but
  // most Editions do read `theme.cover.imageUrl` — SIGNATURE_COVER_CAPS is the source of truth.
  const canPickCoverPhoto =
    !studioTheme.signatureId || Boolean(SIGNATURE_COVER_CAPS[studioTheme.signatureId]?.coverPhoto);

  const previewCategories = restaurantData.categories.length > 0
    ? restaurantData.categories
    : DEMO_RESTAURANT.categories;

  // The preview shows exactly what will be published — no stand-in photography. Substituting stock
  // images here used to make Steps 4 and 5 look finished while the live menu came out bare; dish
  // photos are now chosen explicitly in Step 3 (including an opt-in stock set).
  const previewItems = useMemo(() => {
    const raw = restaurantData.items.length > 0
      ? (restaurantData.items as any[])
      : DEMO_RESTAURANT.items;

    return raw.map((item) => ({
      ...item,
      imageUrl: item.imageUrl || item.image || '',
    }));
  }, [restaurantData.items]);

  const nextStep = () => {
    if (currentStep === 'identity' && !restaurantData.name.trim()) {
      showToast('error', 'Please enter your restaurant or business name.');
      return;
    }
    if (currentStep === 'excel-upload' && restaurantData.items.length === 0) {
      showToast('error', 'Please upload your menu spreadsheet (.xlsx, .csv) or click "Load Demo Menu" to proceed.');
      return;
    }
    setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStepIdx((prev) => Math.max(prev - 1, 0));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qr, setQr] = useState<AppQrData | null>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const photographedCount = restaurantData.items.filter((item) => item.imageUrl).length;

  const shellSteps: ShellStep[] = [
    { id: 'identity', label: 'Identity', hint: restaurantData.name || undefined },
    {
      id: 'excel-upload',
      label: 'Menu',
      hint: restaurantData.items.length
        ? `${restaurantData.items.length} dishes · ${restaurantData.categories.length} sections`
        : undefined,
    },
    {
      id: 'dish-photos',
      label: 'Photos',
      hint: restaurantData.items.length ? `${photographedCount}/${restaurantData.items.length} photographed` : undefined,
    },
    {
      id: 'templates',
      label: 'Design',
      hint: SHOWCASE_PRESETS.find((preset) => preset.id === restaurantData.templateId)?.label,
    },
    { id: 'preview', label: 'Activate', hint: qrReady ? 'QR live' : undefined },
  ];

  const stepCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
    identity: {
      eyebrow: 'Step 1 · Identity',
      title: 'Your restaurant, on the cover',
      description:
        'The name, contact details and logo that print on your menu cover and on the table plaque. A PNG logo with a transparent background sits best on the darker Editions.',
    },
    'excel-upload': {
      eyebrow: 'Step 2 · The Menu',
      title: 'Bring in your menu',
      description:
        'Upload your spreadsheet and every section, dish, description and Half/Full price is read automatically — then correct anything that came through wrong, right here.',
    },
    'dish-photos': {
      eyebrow: 'Step 3 · Photography',
      title: 'Dish photos & highlights',
      description:
        'We have already matched photos to the dishes we recognised. Replace any of them with your own, and star the dishes you want shown as bestsellers — the Editions use those for the cover.',
    },
    templates: {
      eyebrow: 'Step 4 · Design Studio',
      title: 'Choose your Edition',
      description:
        'Fifteen art-directed Signature Editions, each a complete restaurant publication. Pick one, then set its cover photograph, typography and brand colour.',
    },
    preview: {
      eyebrow: 'Step 5 · Activate',
      title: 'Your plaque & permanent QR',
      description:
        'Your 24K gold and marble table plaque, and the permanent QR behind it. The link never changes — update the menu any time and every printed plaque stays correct.',
    },
  };

  const liveMenuUrl = qr?.qrId ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}` : '';

  useEffect(() => {
    const slug = restaurantData.name ? restaurantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'demo';
    const targetUrl = qr?.qrId
      ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}`
      : `${window.location.origin}/m/${slug}`;

    QRCode.toDataURL(targetUrl, {
      width: 600,
      margin: 2,
      color: { dark: '#140D05', light: '#FFFFFF' },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setStickerQrDataUrl(url))
      .catch(() => {});
  }, [qr?.qrId, restaurantData.name]);

  // Handle Excel / CSV File Drop or Select
  // The spreadsheet never carries a photo for most rows. Without this, an onboarded-via-Excel
  // menu stays photo-less forever — the Excel import done later from the Menu page already gets
  // matched photos via the same resolveDishImage() this calls, so this closes that gap.
  const resolveMissingPhotos = async (items: ParsedMenuItem[], categories: ParsedCategory[]): Promise<ParsedMenuItem[]> => {
    const missing = items
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.imageUrl);
    if (missing.length === 0) return items;
    setIsResolvingImages(true);
    try {
      const { matches } = await resolveMenuImages(
        missing.map(({ item, index }) => ({
          index,
          name: item.name,
          category: categories.find((c) => c.id === item.category)?.name || '',
        }))
      );
      const byIndex = new Map(matches.map((m) => [m.index, m.imageUrl]));
      return items.map((item, index) => (
        !item.imageUrl && byIndex.has(index) ? { ...item, imageUrl: byIndex.get(index) as string } : item
      ));
    } catch {
      return items; // Non-fatal — items simply keep rendering without a matched photo, as before.
    } finally {
      setIsResolvingImages(false);
    }
  };

  // Step 3's "Auto-match the rest" — same matcher, run on demand for whatever is still missing.
  const resolveRemainingPhotos = async () => {
    const withPhotos = await resolveMissingPhotos(restaurantData.items, restaurantData.categories);
    setRestaurantData((prev) => ({ ...prev, items: withPhotos }));
  };

  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      showToast('error', 'Please upload a valid .xlsx, .xls or .csv spreadsheet.');
      return;
    }
    setIsParsingExcel(true);
    try {
      const parsed = await parseExcelMenuFile(file);
      const itemsWithPhotos = await resolveMissingPhotos(parsed.items, parsed.categories);
      setRestaurantData((prev) => ({
        ...prev,
        categories: parsed.categories,
        items: itemsWithPhotos,
      }));
      setUploadedFileName(file.name);
      setExcelSummary(parsed.summary);
      showToast('success', `Success! Extracted ${parsed.summary.totalDishes} dishes across ${parsed.summary.categoriesCount} categories with Half/Full prices.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to parse spreadsheet. Please use our sample template format.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  // Quick Demo Menu Loader — runs the same photo matching as a real spreadsheet upload, so both
  // entry points reach Step 3 with photos already attached.
  const handleLoadDemoMenu = async () => {
    const demo = getDemoMenuData();
    setRestaurantData((prev) => ({
      ...prev,
      categories: demo.categories,
      items: demo.items,
    }));
    setUploadedFileName('Demo Authentic Restaurant Menu (13 Dishes)');
    setExcelSummary(demo.summary);
    showToast('success', 'Loaded authentic demo menu with Starters, Mains, Breads, Beverages and Half/Full pricing.');

    const withPhotos = await resolveMissingPhotos(demo.items, demo.categories);
    setRestaurantData((prev) => ({ ...prev, items: withPhotos }));
  };

  // Download Sample Template
  const handleDownloadSample = async () => {
    try {
      await downloadSampleMenuExcel();
      showToast('info', 'Sample Excel template downloaded. Fill your dishes and upload here.');
    } catch {
      showToast('error', 'Could not generate sample spreadsheet.');
    }
  };

  const handlePrinterComplete = useCallback(() => {
    setQrReady(true);
    showToast('success', 'Your permanent QR sticker is ready to download or print.');
  }, [showToast]);

  const [qrError, setQrError] = useState(false);

  const createFirstQr = async () => {
    if (!restaurantData.name.trim() || restaurantData.categories.length === 0 || restaurantData.items.length === 0) {
      showToast('error', 'Add your restaurant name and upload at least one menu item first.');
      return;
    }
    setIsSubmitting(true);
    setQrError(false);
    try {
      await saveOnboarding({
        businessName: restaurantData.name,
        tagline: restaurantData.tagline,
        phone: restaurantData.phone,
        city: restaurantData.city,
        address: restaurantData.address,
        logoUrl: restaurantData.logoUrl,
        menuName: `${restaurantData.name} Menu`,
        templateId: restaurantData.templateId,
        categories: restaurantData.categories.map(({ name, description }) => ({ name, description })),
        items: restaurantData.items.map((item) => ({
          categoryIndex: Math.max(0, restaurantData.categories.findIndex((category) => category.id === item.category)),
          name: item.name,
          description: item.description,
          price: Number(item.price || item.fullPrice || item.halfPrice || 0),
          halfPrice: item.halfPrice ? Number(item.halfPrice) : undefined,
          fullPrice: item.fullPrice ? Number(item.fullPrice) : undefined,
          imageUrl: item.imageUrl,
          dietType: item.dietType,
          available: item.available,
          isBestseller: item.isBestseller,
          focalX: item.focalX,
          focalY: item.focalY,
        })),
      });
      let currentQr = await getQr();
      if (!currentQr?.qrId) {
        currentQr = await createPermanentQr();
      }
      if (!currentQr?.qrId) throw new Error('QR could not be created.');
      setQr(currentQr);

      // Also publish the customized theme designed in Step 3!
      try {
        await publishTheme(studioTheme);
      } catch (themeErr) {
        console.warn('Theme publish notice:', themeErr);
      }

      setIsPrinterOpen(true);
    } catch {
      setQrError(true);
      showToast('error', 'We could not save your menu just now. Your details are still here; please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!qrReady) {
      showToast('info', 'Save your menu and create its permanent QR before finishing setup.');
      return;
    }
    if (userId) clearDraft(userId);
    navigate('/app/dashboard', { replace: true });
  };

  const isFinalStep = currentStepIdx === steps.length - 1;

  return (
    <OnboardingShell
      steps={shellSteps}
      currentStepIdx={currentStepIdx}
      eyebrow={stepCopy[currentStep]?.eyebrow}
      title={stepCopy[currentStep]?.title || ''}
      description={stepCopy[currentStep]?.description}
      onSkip={() => navigate('/app/dashboard')}
      onBack={currentStepIdx > 0 ? prevStep : undefined}
      onNext={isFinalStep ? handleComplete : nextStep}
      nextDisabled={isSubmitting}
      isFinalStep={isFinalStep}
      onStepSelect={setCurrentStepIdx}
      nextLabel={
        isFinalStep
          ? isSubmitting
            ? 'Saving…'
            : 'Go to Dashboard'
          : `Continue to ${shellSteps[currentStepIdx + 1].label}`
      }
    >
          <AnimatePresence mode="wait">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 'identity' && (
              <motion.div key="step-identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Preloaded Summary Card (Auto-filled from checkout) */}
                {isLoadingProfile ? (
                  // Sub-second load — a skeleton reads as faster than a Lottie loop would here.
                  <div className="bg-[#0E0C09] border border-[#D4AF37]/15 rounded-2xl p-5 sm:p-6 space-y-5 animate-pulse" aria-hidden="true">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-[#D4AF37]/15">
                      <span className="w-7 h-7 rounded-full bg-white/10 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-2.5 w-48 rounded bg-white/10" />
                        <div className="h-2 w-64 rounded bg-white/5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="bg-white/5 p-3.5 rounded-xl space-y-2">
                          <div className="h-2 w-24 rounded bg-white/10" />
                          <div className="h-3 w-32 rounded bg-white/10" />
                        </div>
                      ))}
                    </div>
                    <div className="h-16 rounded-xl bg-white/5" />
                  </div>
                ) : isPreloaded && !isEditingIdentity ? (
                  <div className="bg-[#0E0C09] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
                    <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/15 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 size={16} />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">Auto-filled from your registration details</p>
                          <p className="text-[11px] text-emerald-300/80">You don't need to re-enter anything. Edit if something changed or proceed directly.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingIdentity(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#D4AF37]/15 cursor-pointer"
                      >
                        <Edit3 size={13} className="text-[#D4AF37]" /> Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-[#231E18]/70 p-3.5 rounded-xl border border-[#D4AF37]/10">
                        <span className="text-[10px] font-mono text-[#A3957E] uppercase tracking-wider block mb-1">Restaurant / Business Name</span>
                        <span className="font-bold text-white text-base flex items-center gap-1.5">
                          <Store size={15} className="text-[#D4AF37] shrink-0" />
                          {restaurantData.name || 'Not provided'}
                        </span>
                      </div>
                      <div className="bg-[#231E18]/70 p-3.5 rounded-xl border border-[#D4AF37]/10">
                        <span className="text-[10px] font-mono text-[#A3957E] uppercase tracking-wider block mb-1">Phone Number</span>
                        <span className="font-semibold text-white">
                          {restaurantData.phone || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      <div className="bg-[#231E18]/70 p-3.5 rounded-xl border border-[#D4AF37]/10">
                        <span className="text-[10px] font-mono text-[#A3957E] uppercase tracking-wider block mb-1">City / Location</span>
                        <span className="font-semibold text-white">
                          {restaurantData.city || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      <div className="bg-[#231E18]/70 p-3.5 rounded-xl border border-[#D4AF37]/10">
                        <span className="text-[10px] font-mono text-[#A3957E] uppercase tracking-wider block mb-1">Full Address</span>
                        <span className="font-semibold text-white">
                          {restaurantData.address || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      {restaurantData.tagline && (
                        <div className="sm:col-span-2 bg-[#231E18]/70 p-3.5 rounded-xl border border-[#D4AF37]/10">
                          <span className="text-[10px] font-mono text-[#A3957E] uppercase tracking-wider block mb-1">Tagline</span>
                          <span className="text-white italic">"{restaurantData.tagline}"</span>
                        </div>
                      )}
                    </div>

                    <BrandLockPreview logoUrl={restaurantData.logoUrl} name={restaurantData.name} />

                    {/* Brand Logo Section in Preloaded View */}
                    <div className="p-4 bg-[#231E18]/90 rounded-xl border border-[#D4AF37]/15 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {isLogoUploading ? (
                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[#D4AF37]/40 bg-[#0E0C09] flex items-center justify-center shrink-0">
                            <LottieMoment moment="photo-matching" loop className="w-full h-full" />
                          </div>
                        ) : restaurantData.logoUrl ? (
                          <div className="relative shrink-0">
                            <img
                              src={restaurantData.logoUrl}
                              alt="Logo"
                              className="w-14 h-14 rounded-xl object-contain bg-black/50 border-2 border-[#D4AF37] shadow-md shrink-0"
                              decoding="async"
                              loading="lazy"
                            />
                            {justUploadedLogo && (
                              <LottieMoment
                                moment="logo-upload-success"
                                loop={false}
                                onComplete={() => setJustUploadedLogo(false)}
                                className="absolute -top-2.5 -right-2.5 w-7 h-7 pointer-events-none"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[#D4AF37]/25 bg-[#0E0C09] flex flex-col items-center justify-center text-[#A3957E] shrink-0">
                            <ImageIcon size={22} className="text-[#D4AF37] opacity-70" />
                            <span className="text-[9px] mt-0.5 opacity-60">No logo</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">Brand Logo / Crest</p>
                          <p className="text-[11px] text-[#A3957E]">
                            {restaurantData.logoUrl ? 'Active on menu cover & table standee.' : 'Upload your logo to print on the menu cover & permanent standee.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-[#2B251D] hover:bg-[#332C22] border border-[#D4AF37]/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
                          <Upload size={13} className="text-[#D4AF37]" />
                          <span>{isLogoUploading ? 'Uploading...' : restaurantData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isLogoUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsLogoUploading(true);
                              try {
                                const url = await uploadImageFile(file, 'logos');
                                setRestaurantData((prev) => ({ ...prev, logoUrl: url }));
                                setJustUploadedLogo(true);
                              } catch (err: any) {
                                showToast('error', err?.message || 'Could not upload logo. Please try again.');
                              } finally {
                                setIsLogoUploading(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                        {restaurantData.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setRestaurantData((prev) => ({ ...prev, logoUrl: '' }))}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Editable Form Inputs */
                  <div className="space-y-4">
                    {isPreloaded && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-xs text-[#A3957E] flex items-center gap-1.5">
                          <Edit3 size={12} className="text-[#D4AF37]" /> Editing restaurant details
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingIdentity(false)}
                          className="text-xs text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          Keep Details / Done Editing &times;
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#A3957E]">Restaurant / Business Name *</label>
                        <input type="text" aria-label="Restaurant name" placeholder="e.g. Royal Punjab Dhaba" value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#A3957E]">Tagline / Subtitle</label>
                        <input type="text" placeholder="e.g. Authentic Flavours Since 1998" value={restaurantData.tagline} onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })} className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#A3957E]">Phone Number</label>
                        <input type="tel" aria-label="Restaurant phone" placeholder="e.g. +91 98XXXXXXXX" value={restaurantData.phone} onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })} className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#A3957E]">City / Location</label>
                        <input type="text" aria-label="Restaurant city" placeholder="e.g. Mumbai" value={restaurantData.city} onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })} className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-[#A3957E]">Full Address</label>
                        <input type="text" aria-label="Restaurant address" placeholder="e.g. Shop 12, Main Street, Bandra West, Mumbai" value={restaurantData.address} onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })} className="w-full bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      </div>

                      <div className="sm:col-span-2 grid grid-cols-1 gap-4 border-t border-[#D4AF37]/15 pt-3 sm:grid-cols-[1fr_auto] sm:items-start">
                        <ImageSelector
                          label="Restaurant Logo / Brand Mark (Recommended)"
                          value={restaurantData.logoUrl}
                          onChange={(val) => setRestaurantData((prev) => ({ ...prev, logoUrl: val }))}
                          placeholder="https://example.com/logo.png"
                        />
                        <BrandLockPreview logoUrl={restaurantData.logoUrl} name={restaurantData.name} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: EXCEL MENU SPREADSHEET UPLOAD */}
            {currentStep === 'excel-upload' && (
              <motion.div key="step-excel-upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer rounded-3xl border-2 border-dashed border-[#D4AF37]/40 hover:border-[#D4AF37] bg-[#0E0C09]/80 hover:bg-[#0E0C09] p-8 sm:p-12 text-center transition-all duration-300 shadow-xl"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] group-hover:scale-110 transition-transform">
                    {isParsingExcel || isResolvingImages ? (
                      <LottieMoment moment="excel-parsing" loop className="w-12 h-12" />
                    ) : restaurantData.items.length === 0 ? (
                      <LottieMoment moment="upload-idle" loop className="w-12 h-12" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8" />
                    )}
                  </div>

                  <h3 className="mt-4 text-lg sm:text-xl text-white" style={{ fontFamily: DISPLAY }}>
                    {isParsingExcel
                      ? 'Parsing Spreadsheet...'
                      : isResolvingImages
                      ? 'Matching Dish Photos...'
                      : 'Drop your Excel menu file here, or click to browse'}
                  </h3>
                  <p className="mt-1 text-xs text-[#A3957E]">
                    Supports <span className="font-mono text-emerald-400 font-bold">.xlsx, .xls, .csv</span> formats
                  </p>
                  <p className="mt-2 text-[11px] text-stone-400">
                    Auto-maps: Category • Dish Name • Single Price • Half Price • Full Price • Description • Veg/Non-Veg • Image URL • Bestseller
                  </p>
                </div>

                {/* Quick Action Helpers: Download Template or 1-Click Demo */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0E0C09] border border-[#D4AF37]/15 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8783C]" />
                    <span className="text-[#A3957E]">Need a pre-formatted template or want to test instantly?</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors border border-[#D4AF37]/15 cursor-pointer"
                    >
                      <Download size={13} className="text-[#D4AF37]" /> Download Sample (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadDemoMenu}
                      className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-bold flex items-center gap-1.5 transition-colors border border-[#D4AF37]/30 cursor-pointer"
                    >
                      <Sparkles size={13} /> Load Demo Menu (1-Click)
                    </button>
                  </div>
                </div>

                {/* Parsed Results Summary & Items Table */}
                {restaurantData.items.length > 0 && excelSummary && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {uploadedFileName || 'Menu Parsed Successfully'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#D4AF37] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={11} /> Replace Spreadsheet
                      </button>
                    </div>

                    {/* Stat Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="bg-[#0E0C09] p-3 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-[10px] text-[#A3957E] font-mono block">TOTAL DISHES</span>
                        <span className="text-lg font-black text-white">{excelSummary.totalDishes}</span>
                      </div>
                      <div className="bg-[#0E0C09] p-3 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-[10px] text-[#A3957E] font-mono block">CATEGORIES</span>
                        <span className="text-lg font-black text-white">{excelSummary.categoriesCount}</span>
                      </div>
                      <div className="bg-[#0E0C09] p-3 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-[10px] text-emerald-400 font-mono block">PURE VEG</span>
                        <span className="text-lg font-black text-emerald-400">{excelSummary.vegCount}</span>
                      </div>
                      <div className="bg-[#0E0C09] p-3 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-[10px] text-rose-400 font-mono block">NON-VEG</span>
                        <span className="text-lg font-black text-rose-400">{excelSummary.nonVegCount}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 bg-[#0E0C09] p-3 rounded-xl border border-[#D4AF37]/15">
                        <span className="text-[10px] text-amber-400 font-mono block">HALF / FULL</span>
                        <span className="text-lg font-black text-amber-400">{excelSummary.dualPriceCount}</span>
                      </div>
                    </div>

                    {/* Editable grid — a real spreadsheet always needs a correction or two. */}
                    <MenuTableEditor
                      categories={restaurantData.categories}
                      items={restaurantData.items}
                      onChange={({ categories, items }) =>
                        setRestaurantData((prev) => ({ ...prev, categories, items }))
                      }
                    />
                  </div>
                )}

                {/* Nothing parsed yet — say what the sheet needs instead of showing a blank panel. */}
                {restaurantData.items.length === 0 && !isParsingExcel && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#D4AF37]/15 bg-[#0E0C09] p-6 text-center">
                    <LottieMoment moment="empty-state" loop className="h-24 w-24" />
                    <p className="text-sm font-bold text-white">No dishes read yet</p>
                    <p className="max-w-md text-xs leading-relaxed text-[#A3957E]">
                      Your sheet needs one row per dish, with a header row naming the columns. Only two
                      are required — <span className="font-mono text-[#D4AF37]">Category</span> and{' '}
                      <span className="font-mono text-[#D4AF37]">Dish Name</span>. Optional:{' '}
                      <span className="font-mono">Single Price</span>, <span className="font-mono">Half Price</span>,{' '}
                      <span className="font-mono">Full Price</span>, <span className="font-mono">Description</span>,{' '}
                      <span className="font-mono">Diet Type</span>, <span className="font-mono">Image URL</span>,{' '}
                      <span className="font-mono">Bestseller</span>. Download the sample above for the exact layout.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: DISH PHOTOS & HIGHLIGHTS */}
            {currentStep === 'dish-photos' && (
              <motion.div key="step-dish-photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <DishPhotosStep
                  items={restaurantData.items}
                  categories={restaurantData.categories}
                  onItemsChange={(items) => setRestaurantData((prev) => ({ ...prev, items }))}
                  uploadFile={(file) => uploadImageFile(file, 'dishes')}
                  onResolveRemaining={() => void resolveRemainingPhotos()}
                  isResolving={isResolvingImages}
                />
              </motion.div>
            )}

            {/* STEP 4: MENU DESIGN STUDIO */}
            {currentStep === 'templates' && (
              <motion.div key="step-templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* STUDIO NAVIGATION SUB-TABS */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#0E0C09] border border-[#D4AF37]/15 rounded-2xl w-fit shadow-md">
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('design')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      studioSubTab === 'design'
                        ? 'bg-[#E8783C] text-white shadow-lg'
                        : 'text-[#A3957E] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layers size={14} /> 1. Choose Design
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('cover')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      studioSubTab === 'cover'
                        ? 'bg-[#E8783C] text-white shadow-lg'
                        : 'text-[#A3957E] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Camera size={14} /> 2. Cover Page & Photos
                    {studioTheme.cover.imageUrl && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('layout')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      studioSubTab === 'layout'
                        ? 'bg-[#E8783C] text-white shadow-lg'
                        : 'text-[#A3957E] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Layout size={14} /> 3. Menu Layout & Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('brand')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      studioSubTab === 'brand'
                        ? 'bg-[#E8783C] text-white shadow-lg'
                        : 'text-[#A3957E] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Palette size={14} /> 4. Brand Colors & Logo
                    <span className="w-2.5 h-2.5 rounded-full border border-[#D4AF37]/35" style={{ backgroundColor: studioTheme.brand.seedColor }} />
                  </button>
                </div>

                {/* STUDIO WORKSPACE: CONTROLS (7 COLS) + LIVE MOBILE MOCKUP (5 COLS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT CONTROLS (7 COLS) */}
                  <div className="lg:col-span-7 space-y-5">
                    
                    {/* TAB 0: CHOOSE STARTING DESIGN */}
                    {studioSubTab === 'design' && (
                      <div className="space-y-4">
                        {/* Category Filter Pills & Search */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <p className="text-xs text-[#A3957E]">
                              Select from <span className="font-bold text-white">15 Art-Directed Signature Editions</span>. Each is an authentic restaurant publication with its own typography, architecture, and plating identity.
                            </p>
                            <div className="relative shrink-0">
                              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                              <input
                                type="text"
                                placeholder="Search editions..."
                                value={designSearch}
                                onChange={(e) => setDesignSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-[#0E0C09] border border-[#D4AF37]/20 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37] w-full sm:w-48"
                              />
                            </div>
                          </div>

                          {/* Category Filter Pills */}
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            {[
                              { id: 'all', label: `All (${SHOWCASE_PRESETS.length})` },
                              { id: 'fine-dining', label: 'Fine Dining' },
                              { id: 'heritage', label: 'Heritage' },
                              { id: 'cafe', label: 'Cafe & Bakery' },
                              { id: 'contemporary', label: 'Contemporary' },
                              { id: 'street', label: 'Street & Grill' },
                            ].map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setDesignCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                  designCategory === cat.id
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1 mq-showcase-preview-frame">
                          {filteredPresets.map((preset) => {
                            const active = restaurantData.templateId === preset.id;
                            const justConfirmed = active && justSelectedPresetId === preset.id;
                            const palette = derivePalette(preset.seedColor, preset.mode);
                            const editionNum = String(
                              SHOWCASE_PRESETS.findIndex((p) => p.id === preset.id) + 1
                            ).padStart(2, '0');

                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSelectPreset(preset)}
                                className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                  active
                                    ? 'border-[#D4AF37] bg-[#D4AF37]/12 ring-2 ring-[#D4AF37] shadow-xl'
                                    : 'border-[#D4AF37]/15 bg-[#0E0C09] hover:border-[#D4AF37]/30 hover:bg-[#2B251D]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                                        #{editionNum}
                                      </span>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3957E]">
                                        {preset.category}
                                      </span>
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
                                        justConfirmed ? (
                                          <LottieMoment
                                            moment="design-pick-confirm"
                                            loop={false}
                                            onComplete={() => setJustSelectedPresetId(null)}
                                            className="w-5 h-5 ml-1 shrink-0"
                                          />
                                        ) : (
                                          <span className="w-4 h-4 rounded-full bg-[#E8783C] text-white flex items-center justify-center shrink-0 ml-1">
                                            <Check size={10} />
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <h4 className="text-sm font-bold text-white mb-1">{preset.label}</h4>
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
                    )}

                    {/* TAB 1: COVER PAGE & CHEF PHOTOGRAPHY */}
                    {studioSubTab === 'cover' && (
                      <div className="space-y-6">
                        {/* Cover Page Enable Toggle */}
                        <div className="p-4 rounded-2xl bg-[#231E18] border border-[#D4AF37]/15 flex items-center justify-between shadow-xs">
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Eye size={14} className="text-[#D4AF37]" /> Show Dedicated Cover Screen
                            </h4>
                            <p className="text-[11px] text-[#A3957E] mt-0.5">
                              Display an immersive full-screen welcome cover before opening the menu
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStudioTheme((prev) => ({
                              ...prev,
                              cover: { ...prev.cover, showCoverPage: !prev.cover.showCoverPage }
                            }))}
                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                              studioTheme.cover.showCoverPage ? 'bg-[#E8783C]' : 'bg-[#332C22]'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                                studioTheme.cover.showCoverPage ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {/* An Edition owns its cover *architecture* — that part really is fixed. Most of
                          * them still paint `theme.cover.imageUrl` over their own hero fallback, and
                          * SIGNATURE_COVER_CAPS records exactly which, so the photo picker below is
                          * offered on capability rather than hidden for every Edition alike. */}
                        {studioTheme.signatureId && (
                          <div className="p-4 rounded-2xl bg-[#231E18] border border-[#D4AF37]/30 space-y-2">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Layers size={13} className="text-[#D4AF37]" />
                              {PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'This Signature design'} has a fixed, art-directed cover layout
                            </p>
                            <p className="text-[11px] text-[#A3957E] leading-relaxed">
                              {canPickCoverPhoto
                                ? 'Its composition, ornament and type are part of the Edition — but the cover photograph is yours. Pick one below, or upload your own.'
                                : 'This Edition builds its cover from typography and ornament instead of a photograph, so there is no cover image to pick. Its feature imagery comes from your own dish photos — star a dish as a bestseller and give it a photo.'}
                            </p>
                            {!canPickCoverPhoto && (
                              <button
                                type="button"
                                onClick={() => setCurrentStepIdx(steps.indexOf('dish-photos'))}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#D4AF37]/35 px-3 py-1.5 text-[11px] font-bold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/10 cursor-pointer"
                              >
                                <Camera size={12} /> Go to Dish Photos
                              </button>
                            )}
                          </div>
                        )}

                        {!studioTheme.signatureId && (
                          <>
                            {/* Cover Style Picker */}
                            <div className="space-y-2.5">
                              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Layers size={13} className="text-[#D4AF37]" /> Select Cover Architecture
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {COVER_STYLE_OPTIONS.map((opt) => {
                                  const active = studioTheme.slots.cover === opt.id;
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => setStudioTheme((prev) => ({
                                        ...prev,
                                        slots: { ...prev.slots, cover: opt.id }
                                      }))}
                                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                        active
                                          ? 'border-[#D4AF37] bg-[#D4AF37]/12 ring-2 ring-[#D4AF37] shadow-lg'
                                          : 'border-[#D4AF37]/15 bg-[#0E0C09] hover:border-[#D4AF37]/30 hover:bg-[#2B251D]'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                          <span>{opt.icon}</span> {opt.label}
                                        </span>
                                        {active && (
                                          <span className="w-4 h-4 rounded-full bg-[#E8783C] text-white flex items-center justify-center text-[10px]">
                                            <Check size={10} />
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-[#A3957E] leading-relaxed">{opt.desc}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}

                        {canPickCoverPhoto && (
                          <>
                            {/* Curated Ultra-HD Food Cover Photography */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <Camera size={13} className="text-[#D4AF37]" /> Cover Photograph (1-Click Apply)
                                </label>
                                <span className="text-[10px] font-mono text-[#D4AF37] font-semibold">Ultra-HD Quality</span>
                              </div>
                              <p className="text-[11px] text-[#A3957E]">
                                Select from our art-directed restaurant photography collection, or upload your own below.
                              </p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {CURATED_COVER_PHOTOS.map((photo) => {
                                  const active = studioTheme.cover.imageUrl === photo.url;
                                  return (
                                    <button
                                      key={photo.id}
                                      type="button"
                                      onClick={() => setStudioTheme((prev) => ({
                                        ...prev,
                                        cover: { ...prev.cover, imageUrl: photo.url }
                                      }))}
                                      className={`group relative rounded-2xl overflow-hidden border text-left transition-all cursor-pointer aspect-[4/3] ${
                                        active
                                          ? 'border-[#D4AF37] ring-2 ring-[#D4AF37] shadow-xl scale-[1.02]'
                                          : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/35 hover:scale-[1.01]'
                                      }`}
                                    >
                                      <img
                                        src={photo.url}
                                        alt={photo.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-2 flex flex-col justify-end">
                                        <p className="text-[10.5px] font-bold text-white truncate drop-shadow-sm">{photo.title}</p>
                                        <p className="text-[8.5px] text-stone-300 truncate">{photo.cuisine}</p>
                                      </div>
                                      {active && (
                                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E8783C] text-white flex items-center justify-center shadow-md">
                                          <Check size={11} />
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Custom Cover Photo Uploader */}
                              <div className="pt-2">
                                <ImageSelector
                                  label="Or Upload Your Own Custom Restaurant Cover Photo"
                                  value={studioTheme.cover.imageUrl?.startsWith('/assets/') ? '' : (studioTheme.cover.imageUrl || '')}
                                  onChange={(val) => setStudioTheme((prev) => ({
                                    ...prev,
                                    cover: { ...prev.cover, imageUrl: val || '/assets/themes/variations/royal-darbar-facing.jpg' }
                                  }))}
                                  placeholder="https://example.com/restaurant-cover.jpg"
                                  category="covers"
                                />
                              </div>
                            </div>

                            {/* Scrim Overlay Slider */}
                            <div className="p-4 rounded-2xl bg-[#0E0C09] border border-[#D4AF37]/15 space-y-4 shadow-sm">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="font-semibold text-white">Cover Overlay Darkness</span>
                                  <span className="font-mono text-[#D4AF37] font-bold">
                                    {Math.round(studioTheme.cover.overlayStrength * 100)}%
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={10}
                                  max={90}
                                  value={Math.round(studioTheme.cover.overlayStrength * 100)}
                                  onChange={(e) => setStudioTheme((prev) => ({
                                    ...prev,
                                    cover: { ...prev.cover, overlayStrength: Number(e.target.value) / 100 }
                                  }))}
                                  className="w-full accent-[#D4AF37] cursor-pointer"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">
                                  Darkens the cover photo so your restaurant name and buttons stay crisp and easy to read.
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Announcement — read by every design, Signature included */}
                        <div className="p-4 rounded-2xl bg-[#0E0C09] border border-[#D4AF37]/15 shadow-sm">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white">Cover Announcement Banner (Optional)</label>
                            <input
                              type="text"
                              value={studioTheme.announcement || ''}
                              onChange={(e) => setStudioTheme((prev) => ({ ...prev, announcement: e.target.value || null }))}
                              placeholder="e.g. ✨ Chef's Tasting Menu Live | Flat 15% Off on Dine-In"
                              maxLength={120}
                              className="w-full bg-[#231E18] border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: MENU LAYOUT & CARDS */}
                    {studioSubTab === 'layout' && (
                      <div className="space-y-6">
                        {studioTheme.signatureId && (
                          <div className="p-4 rounded-2xl bg-[#231E18] border border-[#D4AF37]/30 space-y-1.5">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Layout size={14} className="text-[#D4AF37]" />
                              {PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'This Signature design'} has a fixed menu layout
                            </p>
                            <p className="text-[11px] text-[#A3957E] leading-relaxed">
                              Dish card style, navigation and section headers are part of its art direction and
                              are not individually adjustable. Texture and typography below still apply.
                            </p>
                          </div>
                        )}

                        {!studioTheme.signatureId && (
                        <>
                        {/* Dish Card Style */}
                        <div className="space-y-2.5">
                          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Utensils size={13} className="text-[#D4AF37]" /> Dish Card Presentation Style
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {DISH_CARD_OPTIONS.map((opt) => {
                              const active = studioTheme.slots.dishCard === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({
                                    ...prev,
                                    slots: { ...prev.slots, dishCard: opt.id }
                                  }))}
                                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                                    active
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/12 ring-2 ring-[#D4AF37] shadow-lg'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] hover:border-[#D4AF37]/30 hover:bg-[#2B251D]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>{opt.icon}</span> {opt.label}
                                    </span>
                                    {active && (
                                      <span className="w-4 h-4 rounded-full bg-[#E8783C] text-white flex items-center justify-center text-[10px]">
                                        <Check size={10} />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-[#A3957E] leading-relaxed">{opt.desc}</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Navigation Style & Section Header Style */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Navigation Bar */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-wider">
                              Category Navigation
                            </label>
                            <div className="space-y-1.5">
                              {NAV_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({
                                    ...prev,
                                    slots: { ...prev.slots, nav: opt.id }
                                  }))}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    studioTheme.slots.nav === opt.id
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] text-[#A3957E] hover:text-white'
                                  }`}
                                >
                                  <span>{opt.icon} {opt.label}</span>
                                  {studioTheme.slots.nav === opt.id && <Check size={12} className="text-[#D4AF37]" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Section Header */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-wider">
                              Section Header Style
                            </label>
                            <div className="space-y-1.5">
                              {SECTION_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({
                                    ...prev,
                                    slots: { ...prev.slots, section: opt.id }
                                  }))}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    studioTheme.slots.section === opt.id
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] text-[#A3957E] hover:text-white'
                                  }`}
                                >
                                  <span>{opt.icon} {opt.label}</span>
                                  {studioTheme.slots.section === opt.id && <Check size={12} className="text-[#D4AF37]" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        </>
                        )}

                        {/* Background Texture & Typography */}
                        <div className="space-y-4 pt-2 border-t border-[#D4AF37]/15">
                          {/* Background Texture */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-wider">
                              Background Texture
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {TEXTURE_OPTIONS.map((tex) => (
                                <button
                                  key={tex.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({ ...prev, texture: tex.id }))}
                                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center gap-2 cursor-pointer ${
                                    studioTheme.texture === tex.id
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] text-[#A3957E] hover:text-white'
                                  }`}
                                >
                                  <span>{tex.icon}</span>
                                  <span className="truncate">{tex.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Typography Pairing */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <Type size={13} className="text-[#D4AF37]" /> Typography Pairings
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {TYPOGRAPHY_OPTIONS.map((font) => (
                                <button
                                  key={font.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({ ...prev, typePair: font.id }))}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    studioTheme.typePair === font.id
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/12 text-white ring-1 ring-[#D4AF37]'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] text-[#A3957E] hover:text-white'
                                  }`}
                                >
                                  <p className="text-xs font-bold text-white">{font.label}</p>
                                  <p className="text-[10px] text-stone-400 font-mono mt-0.5">{font.fontName}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Density */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-white uppercase tracking-wider">
                              Layout Spacing & Density
                            </label>
                            <div className="flex items-center gap-2">
                              {DENSITY_OPTIONS.map((d) => (
                                <button
                                  key={d.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({ ...prev, density: d.id }))}
                                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                    studioTheme.density === d.id
                                      ? 'border-[#D4AF37] bg-[#E8783C] text-white shadow-sm'
                                      : 'border-[#D4AF37]/15 bg-[#0E0C09] text-[#A3957E] hover:text-white'
                                  }`}
                                >
                                  {d.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: BRAND COLORS & LOGO */}
                    {studioSubTab === 'brand' && (
                      <div className="p-5 rounded-3xl bg-[#0E0C09] border border-[#D4AF37]/15 space-y-6 shadow-xl">
                        {/* Page Mode: Light vs Dark */}
                        <div>
                          <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                            Menu Color Theme Mode
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setStudioTheme((prev) => ({ ...prev, mode: 'light' }))}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                studioTheme.mode === 'light'
                                  ? 'border-[#D4AF37] bg-white/15 text-white ring-2 ring-[#D4AF37]'
                                  : 'border-[#D4AF37]/15 bg-[#231E18] text-[#A3957E] hover:border-[#D4AF37]/35'
                              }`}
                            >
                              <Sun size={16} className="text-amber-400" />
                              <div>
                                <p className="text-xs font-bold text-white">Light Luxury</p>
                                <p className="text-[10px] text-stone-400">Warm ivory & parchment</p>
                              </div>
                            </button>
                            <button
                              type="button"
                              onClick={() => setStudioTheme((prev) => ({ ...prev, mode: 'dark' }))}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                                studioTheme.mode === 'dark'
                                  ? 'border-[#D4AF37] bg-white/15 text-white ring-2 ring-[#D4AF37]'
                                  : 'border-[#D4AF37]/15 bg-[#231E18] text-[#A3957E] hover:border-[#D4AF37]/35'
                              }`}
                            >
                              <Moon size={16} className="text-indigo-400" />
                              <div>
                                <p className="text-xs font-bold text-white">Dark Obsidian</p>
                                <p className="text-[10px] text-stone-400">Deep luxury noir & slate</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Curated Seeds */}
                        <div className="space-y-2.5 pt-2 border-t border-[#D4AF37]/15">
                          <label className="text-xs font-bold text-white uppercase tracking-wider block">
                            Curated Designer Brand Accents
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {CURATED_SEEDS.map((seed) => {
                              const active = (studioTheme.brand.seedColor || '').toLowerCase() === seed.seed.toLowerCase();
                              return (
                                <button
                                  key={seed.id}
                                  type="button"
                                  onClick={() => {
                                    setStudioTheme((prev) => ({
                                      ...prev,
                                      brand: { ...prev.brand, seedColor: seed.seed },
                                      mode: seed.mode,
                                    }));
                                  }}
                                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                    active
                                      ? 'border-[#D4AF37] bg-white/10 ring-2 ring-[#D4AF37]'
                                      : 'border-[#D4AF37]/15 bg-[#231E18] hover:border-[#D4AF37]/35'
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-[#D4AF37]/35 shrink-0 shadow-xs" style={{ backgroundColor: seed.seed }} />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-white truncate">{seed.label}</p>
                                    <p className="text-[9px] font-mono text-stone-400 uppercase">{seed.seed}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Hex / Color Input */}
                        <div className="pt-2 border-t border-[#D4AF37]/15 space-y-2">
                          <label className="text-xs font-semibold text-stone-300">Custom Brand Color Hex</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={isValidHex(studioTheme.brand.seedColor) ? studioTheme.brand.seedColor : '#D4AF37'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomHexInput(val);
                                setStudioTheme((prev) => ({ ...prev, brand: { ...prev.brand, seedColor: val } }));
                              }}
                              className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                              title="Choose brand color"
                            />
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="#D4AF37"
                                value={customHexInput || studioTheme.brand.seedColor}
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  setCustomHexInput(val);
                                  if (isValidHex(val)) {
                                    setStudioTheme((prev) => ({ ...prev, brand: { ...prev.brand, seedColor: val } }));
                                  }
                                }}
                                className="w-36 bg-[#231E18] border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                              />
                              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                <CheckCircle2 size={13} className="text-emerald-400" /> Auto WCAG AAA Contrast
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Brand Logo & Shape */}
                        <div className="pt-3 border-t border-[#D4AF37]/15 space-y-4">
                          <ImageSelector
                            label="Restaurant Logo (Cover & Header)"
                            value={restaurantData.logoUrl}
                            onChange={(val) => {
                              setRestaurantData((prev) => ({ ...prev, logoUrl: val }));
                              setStudioTheme((prev) => ({ ...prev, brand: { ...prev.brand, logoUrl: val || null } }));
                            }}
                            placeholder="https://example.com/logo.png"
                          />

                          {/* Logo Shape */}
                          <div>
                            <label className="text-xs font-semibold text-stone-300 block mb-1.5">Logo Frame Shape</label>
                            <div className="flex items-center gap-2">
                              {(['circle', 'square', 'wordmark'] as const).map((shape) => (
                                <button
                                  key={shape}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({
                                    ...prev,
                                    brand: { ...prev.brand, logoShape: shape }
                                  }))}
                                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                                    studioTheme.brand.logoShape === shape
                                      ? 'bg-[#E8783C] text-white shadow-xs'
                                      : 'bg-[#231E18] text-[#A3957E] border border-[#D4AF37]/15 hover:text-white'
                                  }`}
                                >
                                  {shape}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Tagline */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-stone-300">Menu Tagline</label>
                            <input
                              type="text"
                              value={restaurantData.tagline}
                              onChange={(e) => setRestaurantData((prev) => ({ ...prev, tagline: e.target.value }))}
                              placeholder="e.g. Authentic Royal Mughlai & Artisanal Flavours"
                              className="w-full bg-[#231E18] border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: REALISTIC LIVE IPHONE MOCKUP (5 COLS) */}
                  <div className="lg:col-span-5 bg-[#0E0C09] p-4 rounded-3xl border border-[#D4AF37]/15 shadow-2xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-3 px-1 text-[11px] font-mono text-[#A3957E] border-b border-[#D4AF37]/10 mb-3">
                      <span className="flex items-center gap-1.5 font-bold tracking-wider text-white">
                        <Smartphone size={13} className="text-[#D4AF37]" /> LIVE PHONE VIEW
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#D4AF37] font-bold uppercase">
                          {SHOWCASE_PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'Edition'}
                        </span>
                        <span className="text-stone-600">·</span>
                        <span className="text-stone-300 uppercase font-mono">
                          {studioTheme.mode}
                        </span>
                      </div>
                    </div>

                    {/* Cover vs Menu Dishes Section Switcher */}
                    <div className="w-full grid grid-cols-2 gap-1.5 mb-3 bg-[#231E18] p-1 rounded-xl border border-[#D4AF37]/15">
                      <button
                        type="button"
                        onClick={() => scrollToSection('cover')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          previewSection === 'cover'
                            ? 'bg-[#E8783C] text-white shadow-xs'
                            : 'text-[#A3957E] hover:text-white'
                        }`}
                      >
                        <Eye size={12} /> Cover Page
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollToSection('dishes')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          previewSection === 'dishes'
                            ? 'bg-[#E8783C] text-white shadow-xs'
                            : 'text-[#A3957E] hover:text-white'
                        }`}
                      >
                        <Utensils size={12} /> Menu Dishes
                      </button>
                    </div>

                    {/* Premium Realistic iPhone Mockup */}
                    <div className="w-full flex justify-center py-1">
                      <PremiumIPhoneMockup
                        className="w-[285px] sm:w-[315px]"
                        statusBarTheme={studioTheme.mode === 'dark' ? 'light' : 'dark'}
                      >
                        <div
                          ref={phoneScrollRef}
                          className="w-full h-full overflow-y-auto mq-showcase-preview-frame"
                        >
                          <MenuTemplateRenderer
                            templateId={restaurantData.templateId}
                            theme={studioTheme}
                            restaurant={{
                              name: restaurantData.name || 'Your Restaurant',
                              tagline: restaurantData.tagline || 'Exquisite Culinary Dining',
                              cuisine: (restaurantData as any).cuisine || 'North Indian • Mughlai • Tandoor',
                              phone: restaurantData.phone || '+91 98765 43210',
                              address: restaurantData.address || 'Diplomatic Enclave, Chanakyapuri, New Delhi',
                              city: restaurantData.city || 'New Delhi',
                              logo: restaurantData.logoUrl,
                            }}
                            categories={previewCategories}
                            items={previewItems}
                            compact={false}
                          />
                        </div>
                      </PremiumIPhoneMockup>
                    </div>

                    {/* Preview status info */}
                    <div className="mt-2 text-center text-[10px] text-stone-400">
                      ✨ <span className="text-white font-medium">Signature Edition Rendering</span> · Interactive Live Phone View
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PREVIEW & PERMANENT QR */}
            {currentStep === 'preview' && (
              <motion.div key="step-preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                  {/* Left Column (6 cols): LUXURY PRINT-READY STICKER CARD */}
                  <div className="lg:col-span-6 flex flex-col items-center space-y-4">
                    <div className="w-full flex items-center justify-between px-1">
                      <span className="text-xs font-mono uppercase text-[#D4AF37] font-bold tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} /> Table Plaque Artwork
                        {qrReady && <LottieMoment moment="qr-activation-success" loop={false} className="w-6 h-6" />}
                      </span>
                      {qrReady && (
                        <button
                          type="button"
                          disabled={isDownloadingSticker}
                          onClick={async () => {
                            if (stickerCardRef.current) {
                              setIsDownloadingSticker(true);
                              try {
                                await exportStickerToPng(stickerCardRef.current, {
                                  fileName: `${(restaurantData.name || 'restaurant').toLowerCase().replace(/[^a-z0-9]/g, '_')}_table_qr.png`,
                                });
                                showToast('success', 'High-resolution printable sticker downloaded!');
                              } catch {
                                showToast('error', 'Could not export sticker image.');
                              } finally {
                                setIsDownloadingSticker(false);
                              }
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E8783C] hover:bg-[#d66a30] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Download size={13} /> {isDownloadingSticker ? 'Exporting...' : 'Download Sticker (PNG)'}
                        </button>
                      )}
                    </div>

                    <div className="w-full flex justify-center scale-[0.88] sm:scale-100 origin-top">
                      <RoyalWalnutStickerCard
                        stickerRef={stickerCardRef}
                        restaurantName={restaurantData.name || 'Your Restaurant'}
                        logoUrl={restaurantData.logoUrl || undefined}
                        category={restaurantData.tagline || 'FINE DINING & CULINARY EXCELLENCE'}
                        menuUrl={
                          qr?.qrId
                            ? `${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}`
                            : `${window.location.origin}/m/${(restaurantData.name || 'demo').toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                        }
                        qrImage={stickerQrDataUrl}
                        phone={restaurantData.phone}
                        address={restaurantData.address}
                        headerText="SCAN FOR DIGITAL MENU"
                        footerText="Point Camera to Scan Menu"
                        showStatusBadge={false}
                        showDownloadButtons={false}
                      />
                    </div>

                    {/* Table ordering is granted by the plan's `customer_ordering` entitlement, not by a
                      * per-restaurant setting — this used to be a switch that saved nowhere, so it now
                      * reports the real state instead of pretending to change it. */}
                    <div className="w-full max-w-sm p-3.5 rounded-2xl bg-[#0E0C09] border border-[#D4AF37]/15 flex items-center justify-between gap-3 shadow-md">
                      <div>
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Smartphone size={13} className="text-[#D4AF37]" /> Direct Table QR Ordering
                        </h4>
                        <p className="text-[10px] text-[#A3957E]">
                          {planId === 'PREMIUM'
                            ? 'Included on your plan — guests can order straight from this QR.'
                            : 'Your plan shows the menu only. Upgrade to Premium to take orders from the table.'}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: planId === 'PREMIUM' ? 'rgba(52,181,106,0.16)' : 'rgba(212,175,55,0.12)',
                          color: planId === 'PREMIUM' ? OB.ok : OB.gold,
                        }}
                      >
                        {planId === 'PREMIUM' ? 'Active' : 'Menu only'}
                      </span>
                    </div>

                    {/* The live link, once the QR exists */}
                    {qrReady && liveMenuUrl && (
                      <div className="w-full max-w-sm space-y-2.5 rounded-2xl border border-[#D4AF37]/15 bg-[#0E0C09] p-3.5 shadow-md">
                        <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#A3957E]">Your permanent menu link</p>
                        <p className="truncate font-mono text-[11px] text-white">{liveMenuUrl}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(liveMenuUrl);
                                showToast('success', 'Menu link copied.');
                              } catch {
                                showToast('error', 'Could not copy — select the link and copy it manually.');
                              }
                            }}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/25 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#D4AF37]/10"
                          >
                            <Copy size={12} className="text-[#D4AF37]" /> Copy link
                          </button>
                          <a
                            href={liveMenuUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/25 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#D4AF37]/10"
                          >
                            <ExternalLink size={12} className="text-[#D4AF37]" /> Open live menu
                          </a>
                        </div>
                        <p className="text-[10px] leading-relaxed text-[#766A58]">
                          Print the plaque at 100% on A5 or larger — the QR stays scannable down to about
                          3&nbsp;cm wide. This link never changes, so edits to your menu reach every printed
                          plaque instantly.
                        </p>
                      </div>
                    )}

                    {!qrReady && (
                      <div className="w-full max-w-sm pt-1 text-center space-y-2">
                        <button
                          type="button"
                          onClick={() => void createFirstQr()}
                          disabled={isSubmitting}
                          className="w-full rounded-2xl bg-[#E8783C] hover:bg-[#f08b55] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60 shadow-xl transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles size={16} />
                          {isSubmitting ? 'Saving Menu & Activating QR...' : 'Lock & Activate Permanent QR'}
                        </button>
                        <p className="text-[11px] text-[#A3957E]">
                          Locks your dishes, prices, and activates your permanent table QR standee.
                        </p>
                        {qrError && (
                          <div className="flex items-center justify-center gap-1.5 text-[11px] text-rose-400 pt-1">
                            <LottieMoment moment="error" loop={false} className="w-6 h-6" />
                            <span>Could not save your menu. Your details are safe — please try again.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column (6 cols): LIVE CUSTOMER MENU MOCKUP */}
                  <div className="lg:col-span-6 flex flex-col items-center space-y-3">
                    <div className="w-full flex items-center justify-between px-1 text-xs font-mono text-[#A3957E]">
                      <span>LIVE CUSTOMER MENU</span>
                      <span className="text-[#D4AF37] font-bold">
                        {studioTheme.signatureId
                          ? (PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'Signature Design')
                          : (COVER_STYLE_OPTIONS.find((o) => o.id === studioTheme.slots.cover)?.label || 'Studio Design')}
                      </span>
                    </div>

                    <div className="w-full flex justify-center py-1">
                      <PremiumIPhoneMockup
                        className="w-[285px] sm:w-[315px]"
                        statusBarTheme={previewTheme.mode === 'dark' ? 'light' : 'dark'}
                      >
                        <div className="w-full h-full overflow-y-auto mq-showcase-preview-frame">
                          <MenuTemplateRenderer
                            templateId={restaurantData.templateId}
                            theme={previewTheme}
                            restaurant={{
                              name: restaurantData.name || 'Your Restaurant',
                              tagline: restaurantData.tagline,
                              cuisine: (restaurantData as any).cuisine || 'North Indian • Mughlai • Tandoor',
                              phone: restaurantData.phone,
                              address: restaurantData.address,
                              city: restaurantData.city,
                              logo: restaurantData.logoUrl,
                            }}
                            categories={previewCategories}
                            items={previewItems}
                            compact={false}
                          />
                        </div>
                      </PremiumIPhoneMockup>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

      {isPrinterOpen && qr?.qrId && (
        <QRGenerationSequence
          restaurantName={restaurantData.name}
          menuUrl={`${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}`}
          phone={restaurantData.phone}
          address={restaurantData.address}
          templateId={restaurantData.templateId}
          onClose={() => setIsPrinterOpen(false)}
          onComplete={handlePrinterComplete}
        />
      )}
    </OnboardingShell>
  );
}

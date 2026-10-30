import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
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
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
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
  orderingEnabled: boolean;
  receptionDevice: string;
  customSeedColor?: string;
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
      {label && <label className="block text-xs font-semibold text-[#AAB7B2]">{label}</label>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {isUploading ? (
          <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl border-2 border-dashed border-[#E8783C]/40 bg-[#151C19] flex items-center justify-center shrink-0`}>
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
              className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl object-cover border-2 border-[#E8783C] bg-black shadow-md`}
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
            className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl border-2 border-dashed border-white/20 bg-[#151C19] flex flex-col items-center justify-center text-[#AAB7B2] shrink-0`}
          >
            <ImageIcon size={compact ? 20 : 26} className="opacity-50 text-[#E8783C]" />
            {!compact && <span className="text-[10px] mt-1 opacity-60">No logo</span>}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer bg-[#25322D] hover:bg-[#2A3832] border border-white/15 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
              <Upload size={14} className="text-[#E8783C]" />
              <span>{isUploading ? 'Uploading...' : value ? 'Change Logo Image' : 'Choose Logo Image'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-[#AAB7B2] hover:text-white underline decoration-dashed transition-colors py-1 px-2 cursor-pointer"
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
              className="w-full bg-[#151C19] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C]"
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

  const [_planId, setPlanId] = useState('PREMIUM');
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

  const getSteps = () => {
    return ['identity', 'excel-upload', 'templates', 'preview'];
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
    orderingEnabled: false,
    receptionDevice: 'none',
    customSeedColor: '',
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

  const previewCategories = restaurantData.categories.length > 0
    ? restaurantData.categories
    : DEMO_RESTAURANT.categories;

  const previewItems = useMemo(() => {
    const raw = restaurantData.items.length > 0
      ? (restaurantData.items as any[])
      : DEMO_RESTAURANT.items;

    const CULINARY_PHOTOS = [
      '/img/photos/photo-1567184109191-37a69f369f24-w500.webp', // Paneer Tikka
      '/img/photos/photo-1599488615731-7e5c2823ff28-w500.webp', // Tandoori Chicken
      '/img/photos/photo-1546833999-b9f581a1996d-w500.webp', // Dal Makhani
      '/img/photos/photo-1563379091339-03b21ab4a4f8-w500.webp', // Dum Biryani
      '/img/photos/photo-1626074353765-517a681e40be-w500.webp', // Garlic Naan
      '/img/photos/photo-1601050690597-df0568f70950-w500.webp', // Saffron Gulab Jamun
      '/img/photos/photo-1576092768241-dec231879fc3-w500.webp', // Masala Chai
    ];

    return raw.map((item, idx) => ({
      ...item,
      imageUrl: item.imageUrl || item.image || CULINARY_PHOTOS[idx % CULINARY_PHOTOS.length],
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

  const getStepTitle = (stepId: string) => {
    switch(stepId) {
      case 'identity': return 'Restaurant Identity & Logo';
      case 'excel-upload': return 'Menu Spreadsheet Upload';
      case 'templates': return 'Menu Design Studio (Cover & Layout)';
      case 'preview': return 'Preview & Permanent QR';
      default: return '';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qr, setQr] = useState<AppQrData | null>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [qrReady, setQrReady] = useState(false);

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

  // Quick Demo Menu Loader
  const handleLoadDemoMenu = () => {
    const demo = getDemoMenuData();
    setRestaurantData((prev) => ({
      ...prev,
      categories: demo.categories,
      items: demo.items,
    }));
    setUploadedFileName('Demo Authentic Restaurant Menu (13 Dishes)');
    setExcelSummary(demo.summary);
    showToast('success', 'Loaded authentic demo menu with Starters, Mains, Breads, Beverages and Half/Full pricing.');
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

  return (
    <div className="min-h-screen bg-[#151C19] text-white font-sans flex flex-col justify-between selection:bg-[#E8783C] selection:text-white">
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1D2723]/80 backdrop-blur-md sticky top-0 z-50">
        <MenusQRBrand size="sm" variant="light" />
        <div className="flex items-center gap-2 text-xs font-mono text-[#AAB7B2]">
          <span>Step {currentStepIdx + 1} of {steps.length}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8783C]" />
          <span className="font-bold text-white uppercase tracking-wider">
            {getStepTitle(currentStep)}
          </span>
        </div>
        <button onClick={() => navigate('/app/dashboard')} className="text-xs text-[#AAB7B2] hover:text-white transition-colors cursor-pointer">
          Skip Setup
        </button>
      </header>

      <main className="flex-1 max-w-[1240px] w-full mx-auto p-4 sm:p-6 flex flex-col justify-center my-auto">
        {/* Progress Tracker Dots */}
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  idx === currentStepIdx
                    ? 'bg-[#E8783C] text-white ring-4 ring-[#E8783C]/20 shadow-lg'
                    : idx < currentStepIdx
                    ? 'bg-[#34B56A] text-white'
                    : 'bg-[#1D2723] text-[#AAB7B2] border border-white/10'
                }`}
              >
                {idx < currentStepIdx ? <Check size={14} /> : idx + 1}
              </div>
              {idx < steps.length - 1 && <div className={`w-4 sm:w-10 h-0.5 ${idx < currentStepIdx ? 'bg-[#34B56A]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-[#1D2723] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: IDENTITY */}
            {currentStep === 'identity' && (
              <motion.div key="step-identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Store size={14} /> Step 1</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Restaurant Identity</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">
                    {isPreloaded && !isEditingIdentity
                      ? 'Your restaurant details are already saved from registration. Review below or proceed.'
                      : 'Enter basic restaurant details to customize your QR menu.'}
                  </p>
                </div>

                {/* Preloaded Summary Card (Auto-filled from checkout) */}
                {isLoadingProfile ? (
                  // Sub-second load — a skeleton reads as faster than a Lottie loop would here.
                  <div className="bg-[#151C19] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 animate-pulse" aria-hidden="true">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
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
                  <div className="bg-[#151C19] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg">
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
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
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                      >
                        <Edit3 size={13} className="text-[#E8783C]" /> Edit Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-[#1D2723]/70 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-[#AAB7B2] uppercase tracking-wider block mb-1">Restaurant / Business Name</span>
                        <span className="font-bold text-white text-base flex items-center gap-1.5">
                          <Store size={15} className="text-[#E8783C] shrink-0" />
                          {restaurantData.name || 'Not provided'}
                        </span>
                      </div>
                      <div className="bg-[#1D2723]/70 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-[#AAB7B2] uppercase tracking-wider block mb-1">Phone Number</span>
                        <span className="font-semibold text-white">
                          {restaurantData.phone || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      <div className="bg-[#1D2723]/70 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-[#AAB7B2] uppercase tracking-wider block mb-1">City / Location</span>
                        <span className="font-semibold text-white">
                          {restaurantData.city || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      <div className="bg-[#1D2723]/70 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-mono text-[#AAB7B2] uppercase tracking-wider block mb-1">Full Address</span>
                        <span className="font-semibold text-white">
                          {restaurantData.address || <span className="text-white/40 italic">Not provided</span>}
                        </span>
                      </div>
                      {restaurantData.tagline && (
                        <div className="sm:col-span-2 bg-[#1D2723]/70 p-3.5 rounded-xl border border-white/5">
                          <span className="text-[10px] font-mono text-[#AAB7B2] uppercase tracking-wider block mb-1">Tagline</span>
                          <span className="text-white italic">"{restaurantData.tagline}"</span>
                        </div>
                      )}
                    </div>

                    {/* Brand Logo Section in Preloaded View */}
                    <div className="p-4 bg-[#1D2723]/90 rounded-xl border border-white/10 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {isLogoUploading ? (
                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-[#E8783C]/40 bg-[#151C19] flex items-center justify-center shrink-0">
                            <LottieMoment moment="photo-matching" loop className="w-full h-full" />
                          </div>
                        ) : restaurantData.logoUrl ? (
                          <div className="relative shrink-0">
                            <img
                              src={restaurantData.logoUrl}
                              alt="Logo"
                              className="w-14 h-14 rounded-xl object-contain bg-black/50 border-2 border-[#E8783C] shadow-md shrink-0"
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
                          <div className="w-14 h-14 rounded-xl border-2 border-dashed border-white/20 bg-[#151C19] flex flex-col items-center justify-center text-[#AAB7B2] shrink-0">
                            <ImageIcon size={22} className="text-[#E8783C] opacity-70" />
                            <span className="text-[9px] mt-0.5 opacity-60">No logo</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-white">Brand Logo / Crest</p>
                          <p className="text-[11px] text-[#AAB7B2]">
                            {restaurantData.logoUrl ? 'Active on menu cover & table standee.' : 'Upload your logo to print on the menu cover & permanent standee.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-[#25322D] hover:bg-[#2A3832] border border-white/15 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm">
                          <Upload size={13} className="text-[#E8783C]" />
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
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs text-[#AAB7B2] flex items-center gap-1.5">
                          <Edit3 size={12} className="text-[#E8783C]" /> Editing restaurant details
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingIdentity(false)}
                          className="text-xs text-[#E8783C] hover:underline font-semibold cursor-pointer"
                        >
                          Keep Details / Done Editing &times;
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#AAB7B2]">Restaurant / Business Name *</label>
                        <input type="text" aria-label="Restaurant name" placeholder="e.g. Royal Punjab Dhaba" value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#AAB7B2]">Tagline / Subtitle</label>
                        <input type="text" placeholder="e.g. Authentic Flavours Since 1998" value={restaurantData.tagline} onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#AAB7B2]">Phone Number</label>
                        <input type="tel" aria-label="Restaurant phone" placeholder="e.g. +91 98XXXXXXXX" value={restaurantData.phone} onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-[#AAB7B2]">City / Location</label>
                        <input type="text" aria-label="Restaurant city" placeholder="e.g. Mumbai" value={restaurantData.city} onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-[#AAB7B2]">Full Address</label>
                        <input type="text" aria-label="Restaurant address" placeholder="e.g. Shop 12, Main Street, Bandra West, Mumbai" value={restaurantData.address} onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                      </div>

                      <div className="sm:col-span-2 pt-3 border-t border-white/10">
                        <ImageSelector
                          label="Restaurant Logo / Brand Mark (Recommended)"
                          value={restaurantData.logoUrl}
                          onChange={(val) => setRestaurantData((prev) => ({ ...prev, logoUrl: val }))}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: EXCEL MENU SPREADSHEET UPLOAD */}
            {currentStep === 'excel-upload' && (
              <motion.div key="step-excel-upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5">
                    <FileSpreadsheet size={14} /> Step 2
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Upload Menu Spreadsheet</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">
                    Upload your complete restaurant menu via Excel or CSV. Categories, dish names, descriptions, and Half/Full prices are automatically extracted.
                  </p>
                </div>

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
                  className="group relative cursor-pointer rounded-3xl border-2 border-dashed border-[#E8783C]/40 hover:border-[#E8783C] bg-[#151C19]/80 hover:bg-[#151C19] p-8 sm:p-12 text-center transition-all duration-300 shadow-xl"
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

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8783C]/15 text-[#E8783C] group-hover:scale-110 transition-transform">
                    {isParsingExcel || isResolvingImages ? (
                      <LottieMoment moment="excel-parsing" loop className="w-12 h-12" />
                    ) : restaurantData.items.length === 0 ? (
                      <LottieMoment moment="upload-idle" loop className="w-12 h-12" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8" />
                    )}
                  </div>

                  <h3 className="mt-4 text-base sm:text-lg font-bold text-white">
                    {isParsingExcel
                      ? 'Parsing Spreadsheet...'
                      : isResolvingImages
                      ? 'Matching Dish Photos...'
                      : 'Drop your Excel menu file here, or click to browse'}
                  </h3>
                  <p className="mt-1 text-xs text-[#AAB7B2]">
                    Supports <span className="font-mono text-emerald-400 font-bold">.xlsx, .xls, .csv</span> formats
                  </p>
                  <p className="mt-2 text-[11px] text-stone-400">
                    Auto-maps: Category • Dish Name • Single Price • Half Price • Full Price • Description • Veg/Non-Veg
                  </p>
                </div>

                {/* Quick Action Helpers: Download Template or 1-Click Demo */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#151C19] border border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E8783C]" />
                    <span className="text-[#AAB7B2]">Need a pre-formatted template or want to test instantly?</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors border border-white/10 cursor-pointer"
                    >
                      <Download size={13} className="text-[#E8783C]" /> Download Sample (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadDemoMenu}
                      className="px-3.5 py-2 rounded-xl bg-[#E8783C]/20 hover:bg-[#E8783C]/30 text-[#E8783C] font-bold flex items-center gap-1.5 transition-colors border border-[#E8783C]/30 cursor-pointer"
                    >
                      <Sparkles size={13} /> Load Demo Menu (1-Click)
                    </button>
                  </div>
                </div>

                {/* Parsed Results Summary & Items Table */}
                {restaurantData.items.length > 0 && excelSummary && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {uploadedFileName || 'Menu Parsed Successfully'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#E8783C] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={11} /> Replace Spreadsheet
                      </button>
                    </div>

                    {/* Stat Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      <div className="bg-[#151C19] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#AAB7B2] font-mono block">TOTAL DISHES</span>
                        <span className="text-lg font-black text-white">{excelSummary.totalDishes}</span>
                      </div>
                      <div className="bg-[#151C19] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-[#AAB7B2] font-mono block">CATEGORIES</span>
                        <span className="text-lg font-black text-white">{excelSummary.categoriesCount}</span>
                      </div>
                      <div className="bg-[#151C19] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-emerald-400 font-mono block">PURE VEG</span>
                        <span className="text-lg font-black text-emerald-400">{excelSummary.vegCount}</span>
                      </div>
                      <div className="bg-[#151C19] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-rose-400 font-mono block">NON-VEG</span>
                        <span className="text-lg font-black text-rose-400">{excelSummary.nonVegCount}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 bg-[#151C19] p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-amber-400 font-mono block">HALF / FULL</span>
                        <span className="text-lg font-black text-amber-400">{excelSummary.dualPriceCount}</span>
                      </div>
                    </div>

                    {/* Scrollable Preview Table of Parsed Dishes */}
                    <div className="max-h-[260px] overflow-y-auto rounded-2xl border border-white/10 bg-[#151C19]">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-[#1D2723] sticky top-0 border-b border-white/10 text-stone-300 font-mono text-[10px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Dish Name</th>
                            <th className="py-2.5 px-3 text-right">Pricing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-stone-200">
                          {restaurantData.items.map((item, idx) => {
                            const cat = restaurantData.categories.find((c) => c.id === item.category);
                            return (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="py-2 px-3">
                                  <span
                                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                                      item.dietType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                </td>
                                <td className="py-2 px-3 text-[#AAB7B2] font-semibold">
                                  {cat?.name || 'General'}
                                </td>
                                <td className="py-2 px-3 font-medium text-white">
                                  {item.name}
                                  {item.description && (
                                    <span className="block text-[10px] text-stone-400 line-clamp-1 italic">
                                      {item.description}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold">
                                  {item.halfPrice || item.fullPrice ? (
                                    <span className="text-amber-400">
                                      {item.halfPrice ? `H:₹${item.halfPrice} ` : ''}
                                      {item.fullPrice ? `F:₹${item.fullPrice}` : ''}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-400">₹{item.price}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: MENU DESIGN STUDIO */}
            {currentStep === 'templates' && (
              <motion.div key="step-templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {/* STUDIO HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5 font-bold">
                      <Sparkles size={14} /> Step 3 · Menu Design Studio
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Design Your Cover & Menu Layout</h2>
                    <p className="text-xs sm:text-sm text-[#AAB7B2]">
                      Style your welcome cover page with chef photography, tailor dish cards, choose typography, and customize brand colors.
                    </p>
                  </div>
                </div>

                {/* STUDIO NAVIGATION SUB-TABS */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#151C19] border border-white/10 rounded-2xl w-fit shadow-md">
                  <button
                    type="button"
                    onClick={() => setStudioSubTab('design')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      studioSubTab === 'design'
                        ? 'bg-[#E8783C] text-white shadow-lg'
                        : 'text-[#AAB7B2] hover:text-white hover:bg-white/5'
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
                        : 'text-[#AAB7B2] hover:text-white hover:bg-white/5'
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
                        : 'text-[#AAB7B2] hover:text-white hover:bg-white/5'
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
                        : 'text-[#AAB7B2] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Palette size={14} /> 4. Brand Colors & Logo
                    <span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ backgroundColor: studioTheme.brand.seedColor }} />
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
                            <p className="text-xs text-[#AAB7B2]">
                              Select from <span className="font-bold text-white">15 Art-Directed Signature Editions</span>. Each is an authentic restaurant publication with its own typography, architecture, and plating identity.
                            </p>
                            <div className="relative shrink-0">
                              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                              <input
                                type="text"
                                placeholder="Search editions..."
                                value={designSearch}
                                onChange={(e) => setDesignSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-[#151C19] border border-white/15 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C] w-full sm:w-48"
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
                                    : 'bg-[#151C19] text-[#AAB7B2] border border-white/10 hover:text-white hover:bg-white/5'
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
                                    ? 'border-[#E8783C] bg-[#E8783C]/12 ring-2 ring-[#E8783C] shadow-xl'
                                    : 'border-white/10 bg-[#151C19] hover:border-white/25 hover:bg-[#1a2320]'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                                        #{editionNum}
                                      </span>
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#AAB7B2]">
                                        {preset.category}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                        style={{ backgroundColor: palette.bg }}
                                        title={`Background: ${palette.bg}`}
                                      />
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                                        style={{ backgroundColor: preset.seedColor }}
                                        title={`Accent: ${preset.seedColor}`}
                                      />
                                      <span
                                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
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
                                  <p className="text-[11px] text-[#AAB7B2] leading-relaxed line-clamp-2">
                                    {preset.description}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-[#8EA298]">
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
                        <div className="p-4 rounded-2xl bg-[#1D2723] border border-white/10 flex items-center justify-between shadow-xs">
                          <div>
                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Eye size={14} className="text-[#E8783C]" /> Show Dedicated Cover Screen
                            </h4>
                            <p className="text-[11px] text-[#AAB7B2] mt-0.5">
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
                              studioTheme.cover.showCoverPage ? 'bg-[#E8783C]' : 'bg-[#2A3832]'
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                                studioTheme.cover.showCoverPage ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {studioTheme.signatureId ? (
                          /* Signature compositions own their entire cover layout and always pull their
                           * hero photo from the menu's own bestseller dish photos — they never read
                           * theme.slots.cover or theme.cover.imageUrl, so an architecture/photo picker
                           * here would silently do nothing. Say that plainly instead of faking a control. */
                          <div className="p-4 rounded-2xl bg-[#1D2723] border border-[#E8783C]/30 space-y-1.5">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Layers size={13} className="text-[#E8783C]" />
                              {PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'This Signature design'} has a fixed, art-directed cover
                            </p>
                            <p className="text-[11px] text-[#AAB7B2] leading-relaxed">
                              {SIGNATURE_COVER_CAPS[studioTheme.signatureId].coverPhoto
                                ? 'Its cover photo comes from your own menu — mark a dish as a bestseller and add a photo to it, and that photo becomes the hero image automatically.'
                                : 'This design uses typography and ornament instead of a photo, so there is no cover photo to pick.'}
                              {' '}Switch to a non-Signature design in "Choose Design" to pick a cover architecture and photo by hand.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Cover Style Picker */}
                            <div className="space-y-2.5">
                              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <Layers size={13} className="text-[#E8783C]" /> Select Cover Architecture
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
                                          ? 'border-[#E8783C] bg-[#E8783C]/12 ring-2 ring-[#E8783C] shadow-lg'
                                          : 'border-white/10 bg-[#151C19] hover:border-white/25 hover:bg-[#1a2320]'
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
                                      <p className="text-[10px] text-[#AAB7B2] leading-relaxed">{opt.desc}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Curated Ultra-HD Food Cover Photography */}
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                  <Camera size={13} className="text-[#E8783C]" /> Curated Chef Cover Photography (1-Click Apply)
                                </label>
                                <span className="text-[10px] font-mono text-[#E8783C] font-semibold">Ultra-HD Quality</span>
                              </div>
                              <p className="text-[11px] text-[#AAB7B2]">
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
                                          ? 'border-[#E8783C] ring-2 ring-[#E8783C] shadow-xl scale-[1.02]'
                                          : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
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
                            <div className="p-4 rounded-2xl bg-[#151C19] border border-white/10 space-y-4 shadow-sm">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="font-semibold text-white">Cover Overlay Darkness</span>
                                  <span className="font-mono text-[#E8783C] font-bold">
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
                                  className="w-full accent-[#E8783C] cursor-pointer"
                                />
                                <p className="text-[10px] text-stone-400 mt-1">
                                  Darkens the cover photo so your restaurant name and buttons stay crisp and easy to read.
                                </p>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Announcement — read by every design, Signature included */}
                        <div className="p-4 rounded-2xl bg-[#151C19] border border-white/10 shadow-sm">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-white">Cover Announcement Banner (Optional)</label>
                            <input
                              type="text"
                              value={studioTheme.announcement || ''}
                              onChange={(e) => setStudioTheme((prev) => ({ ...prev, announcement: e.target.value || null }))}
                              placeholder="e.g. ✨ Chef's Tasting Menu Live | Flat 15% Off on Dine-In"
                              maxLength={120}
                              className="w-full bg-[#1D2723] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: MENU LAYOUT & CARDS */}
                    {studioSubTab === 'layout' && (
                      <div className="space-y-6">
                        {studioTheme.signatureId && (
                          <div className="p-4 rounded-2xl bg-[#1D2723] border border-[#E8783C]/30 space-y-1.5">
                            <p className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Layout size={14} className="text-[#E8783C]" />
                              {PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'This Signature design'} has a fixed menu layout
                            </p>
                            <p className="text-[11px] text-[#AAB7B2] leading-relaxed">
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
                            <Utensils size={13} className="text-[#E8783C]" /> Dish Card Presentation Style
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
                                      ? 'border-[#E8783C] bg-[#E8783C]/12 ring-2 ring-[#E8783C] shadow-lg'
                                      : 'border-white/10 bg-[#151C19] hover:border-white/25 hover:bg-[#1a2320]'
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
                                  <p className="text-[10px] text-[#AAB7B2] leading-relaxed">{opt.desc}</p>
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
                                      ? 'border-[#E8783C] bg-[#E8783C]/15 text-white'
                                      : 'border-white/10 bg-[#151C19] text-[#AAB7B2] hover:text-white'
                                  }`}
                                >
                                  <span>{opt.icon} {opt.label}</span>
                                  {studioTheme.slots.nav === opt.id && <Check size={12} className="text-[#E8783C]" />}
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
                                      ? 'border-[#E8783C] bg-[#E8783C]/15 text-white'
                                      : 'border-white/10 bg-[#151C19] text-[#AAB7B2] hover:text-white'
                                  }`}
                                >
                                  <span>{opt.icon} {opt.label}</span>
                                  {studioTheme.slots.section === opt.id && <Check size={12} className="text-[#E8783C]" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        </>
                        )}

                        {/* Background Texture & Typography */}
                        <div className="space-y-4 pt-2 border-t border-white/10">
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
                                      ? 'border-[#E8783C] bg-[#E8783C]/15 text-white'
                                      : 'border-white/10 bg-[#151C19] text-[#AAB7B2] hover:text-white'
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
                              <Type size={13} className="text-[#E8783C]" /> Typography Pairings
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {TYPOGRAPHY_OPTIONS.map((font) => (
                                <button
                                  key={font.id}
                                  type="button"
                                  onClick={() => setStudioTheme((prev) => ({ ...prev, typePair: font.id }))}
                                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                    studioTheme.typePair === font.id
                                      ? 'border-[#E8783C] bg-[#E8783C]/12 text-white ring-1 ring-[#E8783C]'
                                      : 'border-white/10 bg-[#151C19] text-[#AAB7B2] hover:text-white'
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
                                      ? 'border-[#E8783C] bg-[#E8783C] text-white shadow-sm'
                                      : 'border-white/10 bg-[#151C19] text-[#AAB7B2] hover:text-white'
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
                      <div className="p-5 rounded-3xl bg-[#151C19] border border-white/10 space-y-6 shadow-xl">
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
                                  ? 'border-[#E8783C] bg-white/15 text-white ring-2 ring-[#E8783C]'
                                  : 'border-white/10 bg-[#1D2723] text-[#AAB7B2] hover:border-white/30'
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
                                  ? 'border-[#E8783C] bg-white/15 text-white ring-2 ring-[#E8783C]'
                                  : 'border-white/10 bg-[#1D2723] text-[#AAB7B2] hover:border-white/30'
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
                        <div className="space-y-2.5 pt-2 border-t border-white/10">
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
                                    setRestaurantData((prev) => ({ ...prev, customSeedColor: seed.seed }));
                                  }}
                                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                    active
                                      ? 'border-[#E8783C] bg-white/10 ring-2 ring-[#E8783C]'
                                      : 'border-white/10 bg-[#1D2723] hover:border-white/30'
                                  }`}
                                >
                                  <span className="w-5 h-5 rounded-full border border-white/30 shrink-0 shadow-xs" style={{ backgroundColor: seed.seed }} />
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
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <label className="text-xs font-semibold text-stone-300">Custom Brand Color Hex</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={isValidHex(studioTheme.brand.seedColor) ? studioTheme.brand.seedColor : '#D4AF37'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomHexInput(val);
                                setStudioTheme((prev) => ({ ...prev, brand: { ...prev.brand, seedColor: val } }));
                                setRestaurantData((prev) => ({ ...prev, customSeedColor: val }));
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
                                    setRestaurantData((prev) => ({ ...prev, customSeedColor: val }));
                                  }
                                }}
                                className="w-36 bg-[#1D2723] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C]"
                              />
                              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                <CheckCircle2 size={13} className="text-emerald-400" /> Auto WCAG AAA Contrast
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Brand Logo & Shape */}
                        <div className="pt-3 border-t border-white/10 space-y-4">
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
                                      : 'bg-[#1D2723] text-[#AAB7B2] border border-white/10 hover:text-white'
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
                              className="w-full bg-[#1D2723] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: REALISTIC LIVE IPHONE MOCKUP (5 COLS) */}
                  <div className="lg:col-span-5 bg-[#151C19] p-4 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
                    <div className="w-full flex items-center justify-between pb-3 px-1 text-[11px] font-mono text-[#AAB7B2] border-b border-white/5 mb-3">
                      <span className="flex items-center gap-1.5 font-bold tracking-wider text-white">
                        <Smartphone size={13} className="text-[#E8783C]" /> LIVE PHONE VIEW
                      </span>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#E8783C] font-bold uppercase">
                          {SHOWCASE_PRESETS.find((p) => p.id === restaurantData.templateId)?.label || 'Edition'}
                        </span>
                        <span className="text-stone-600">·</span>
                        <span className="text-stone-300 uppercase font-mono">
                          {studioTheme.mode}
                        </span>
                      </div>
                    </div>

                    {/* Cover vs Menu Dishes Section Switcher */}
                    <div className="w-full grid grid-cols-2 gap-1.5 mb-3 bg-[#1D2723] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => scrollToSection('cover')}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          previewSection === 'cover'
                            ? 'bg-[#E8783C] text-white shadow-xs'
                            : 'text-[#AAB7B2] hover:text-white'
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
                            : 'text-[#AAB7B2] hover:text-white'
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
                <div className="space-y-2 text-center">
                  <span className="text-xs font-mono text-[#34B56A] uppercase tracking-widest flex items-center justify-center gap-1.5"><Check size={14} /> Step 4 (Final)</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Your Official Table Stand & Permanent QR Menu</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">
                    Here is your custom 24K gold & marble table plaque sticker artwork alongside your live digital menu.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
                  {/* Left Column (6 cols): LUXURY PRINT-READY STICKER CARD */}
                  <div className="lg:col-span-6 flex flex-col items-center space-y-4">
                    <div className="w-full flex items-center justify-between px-1">
                      <span className="text-xs font-mono uppercase text-[#E8783C] font-bold tracking-wider flex items-center gap-1.5">
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

                    {/* Optional Direct Table Ordering Toggle */}
                    <div className="w-full max-w-sm p-3.5 rounded-2xl bg-[#151C19] border border-white/10 flex items-center justify-between shadow-md">
                      <div>
                        <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Smartphone size={13} className="text-[#E8783C]" /> Direct Table QR Ordering
                        </h4>
                        <p className="text-[10px] text-[#AAB7B2]">Let customers place orders directly from their phones</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRestaurantData((prev) => ({ ...prev, orderingEnabled: !prev.orderingEnabled }))}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${restaurantData.orderingEnabled ? 'bg-[#E8783C]' : 'bg-[#2A3832]'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${restaurantData.orderingEnabled ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>

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
                        <p className="text-[11px] text-[#AAB7B2]">
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
                    <div className="w-full flex items-center justify-between px-1 text-xs font-mono text-[#AAB7B2]">
                      <span>LIVE CUSTOMER MENU</span>
                      <span className="text-[#E8783C] font-bold">
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

          {/* NAV CONTROLS */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {currentStepIdx > 0 ? (
              <button onClick={prevStep} className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {currentStepIdx < steps.length - 1 ? (
              <button onClick={nextStep} className="px-6 py-2.5 rounded-xl bg-[#E8783C] text-xs font-bold text-white hover:bg-[#f08b55] flex items-center gap-2 shadow-md transition-colors cursor-pointer">
                {currentStep === 'identity' && isPreloaded && !isEditingIdentity ? 'Confirm & Continue' : 'Continue'} <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={isSubmitting} className="px-7 py-3 rounded-xl bg-[#34B56A] text-xs font-bold text-white hover:bg-emerald-600 flex items-center gap-2 shadow-lg disabled:opacity-70 transition-colors cursor-pointer">
                {isSubmitting ? 'Saving...' : 'Go to Dashboard'} <Check size={15} />
              </button>
            )}
          </div>
        </div>
      </main>

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
    </div>
  );
}

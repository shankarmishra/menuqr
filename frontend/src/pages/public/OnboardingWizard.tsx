import { useCallback, useState, useEffect, useRef } from 'react';
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
  RefreshCw 
} from 'lucide-react';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import QRCode from 'qrcode';
import RoyalWalnutStickerCard from '../../components/sticker/RoyalWalnutStickerCard';
import { exportStickerToPng } from '../../utils/stickerExporter';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import QRGenerationSequence from '../../components/qr-studio/QRGenerationSequence';
import { menuTemplates } from '../../data/menuTemplates';
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
  type AppQrData 
} from '../app/appStore';
import { useToast } from '../../components/feedback/ToastProvider';

// Reusable Image Selector Component (File Picker + Base64 Converter + URL Paste Fallback)
function ImageSelector({
  label,
  value,
  onChange,
  placeholder = 'Select an image file or paste URL',
  compact = false,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-[#AAB7B2]">{label}</label>}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {value ? (
          <div className="relative group shrink-0 self-start">
            <img
              src={value}
              alt="Selected preview"
              className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} rounded-xl object-cover border-2 border-[#E8783C] bg-black shadow-md`}
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
              <span>{value ? 'Change Logo Image' : 'Choose Logo Image'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
        </div>
      </div>
    </div>
  );
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [_planId, setPlanId] = useState('PREMIUM');
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Excel Upload State
  const [isParsingExcel, setIsParsingExcel] = useState(false);
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
      if (profileResult.status === 'fulfilled' && profileResult.value) {
        const p = profileResult.value;
        if (p.businessName || p.phone || p.city || p.address) {
          setRestaurantData((prev) => ({
            ...prev,
            name: p.businessName || prev.name,
            tagline: p.tagline || prev.tagline,
            phone: p.phone || prev.phone,
            city: p.city || prev.city,
            address: p.address || prev.address,
            logoUrl: p.logoUrl || prev.logoUrl,
          }));
          setIsPreloaded(true);
        }
      }
      setIsLoadingProfile(false);
    }).catch((err) => {
      console.error(err);
      setIsLoadingProfile(false);
    });
  }, []);

  const getSteps = () => {
    return ['identity', 'excel-upload', 'templates', 'preview'];
  };

  const steps = getSteps();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = steps[currentStepIdx];

  const [restaurantData, setRestaurantData] = useState<{
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
  }>({
    name: '',
    tagline: '',
    phone: '',
    city: '',
    address: '',
    logoUrl: '',
    templateId: 'rajasthani-heritage', // Default to Heritage Parchment Atelier
    categories: [],
    items: [],
    orderingEnabled: false,
    receptionDevice: 'none',
  });

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
      case 'templates': return 'Select Theme (35 Themes)';
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
  const handleFileUpload = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      showToast('error', 'Please upload a valid .xlsx, .xls or .csv spreadsheet.');
      return;
    }
    setIsParsingExcel(true);
    try {
      const parsed = await parseExcelMenuFile(file);
      setRestaurantData((prev) => ({
        ...prev,
        categories: parsed.categories,
        items: parsed.items,
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

  const createFirstQr = async () => {
    if (!restaurantData.name.trim() || restaurantData.categories.length === 0 || restaurantData.items.length === 0) {
      showToast('error', 'Add your restaurant name and upload at least one menu item first.');
      return;
    }
    setIsSubmitting(true);
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
      setIsPrinterOpen(true);
    } catch {
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
                  <div className="p-8 rounded-2xl bg-[#151C19] border border-white/10 flex items-center justify-center gap-3 text-sm text-[#AAB7B2]">
                    <div className="w-5 h-5 border-2 border-[#E8783C] border-t-transparent rounded-full animate-spin" />
                    <span>Loading your registration details...</span>
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
                        {restaurantData.logoUrl ? (
                          <img
                            src={restaurantData.logoUrl}
                            alt="Logo"
                            className="w-14 h-14 rounded-xl object-contain bg-black/50 border-2 border-[#E8783C] shadow-md shrink-0"
                          />
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
                          <span>{restaurantData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  alert('File must be under 5MB');
                                  return;
                                }
                                const r = new FileReader();
                                r.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setRestaurantData((prev) => ({ ...prev, logoUrl: ev.target?.result as string }));
                                  }
                                };
                                r.readAsDataURL(file);
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
                    {isParsingExcel ? (
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8" />
                    )}
                  </div>

                  <h3 className="mt-4 text-base sm:text-lg font-bold text-white">
                    {isParsingExcel ? 'Parsing Spreadsheet...' : 'Drop your Excel menu file here, or click to browse'}
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

            {/* STEP 3: SELECT MENU THEME (ALL 35 THEMES) */}
            {currentStep === 'templates' && (
              <motion.div key="step-templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={14} /> Step 3
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Select Menu Theme ({menuTemplates.length} Themes)</h2>
                    <p className="text-xs sm:text-sm text-[#AAB7B2]">
                      Choose from {menuTemplates.length} handcrafted mobile-first digital themes.
                    </p>
                  </div>
                </div>

                {/* THEME PICKER GRID & LIVE PREVIEW SPLIT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Theme Cards Grid (8 cols) */}
                  <div className="lg:col-span-7 max-h-[460px] overflow-y-auto pr-1 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {menuTemplates.map((tpl) => {
                        const isSelected = restaurantData.templateId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => setRestaurantData({ ...restaurantData, templateId: tpl.id })}
                            className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                              isSelected
                                ? 'border-[#E8783C] bg-[#E8783C]/10 ring-2 ring-[#E8783C] shadow-xl'
                                : 'border-white/10 bg-[#151C19] hover:border-white/30 hover:bg-[#1a2320]'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: tpl.colors.bg }} />
                              <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: tpl.colors.accent }} />
                              <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: tpl.colors.heading }} />
                              {isSelected && (
                                <span className="ml-auto w-5 h-5 rounded-full bg-[#E8783C] text-white flex items-center justify-center">
                                  <Check size={12} />
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-bold text-white leading-tight truncate">{tpl.name}</h4>
                            <p className="text-[10px] text-[#AAB7B2] truncate">{tpl.subtitle}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Mobile Mockup Preview (5 cols) */}
                  <div className="lg:col-span-5 bg-[#151C19] p-3 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center">
                    
                    {/* Brand Logo Fast-Uploader Chip in Theme Step */}
                    <div className="w-full mb-2.5 px-3 py-2 bg-[#1D2723] rounded-2xl border border-white/10 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {restaurantData.logoUrl ? (
                          <img
                            src={restaurantData.logoUrl}
                            alt="Logo"
                            className="w-7 h-7 rounded-lg object-contain bg-black/40 border border-[#E8783C]/40 shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-[#AAB7B2] shrink-0">
                            <ImageIcon size={14} className="text-[#E8783C]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">Restaurant Logo</p>
                          <p className="text-[9.5px] text-[#AAB7B2] truncate">
                            {restaurantData.logoUrl ? 'Attached to menu cover' : 'Optional (Add brand logo)'}
                          </p>
                        </div>
                      </div>
                      <label className="cursor-pointer bg-[#25322D] hover:bg-[#2F3F39] text-[#E8783C] text-[10.5px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10 shrink-0 transition-colors">
                        <Upload size={12} />
                        <span>{restaurantData.logoUrl ? 'Change' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('File must be under 5MB');
                                return;
                              }
                              const r = new FileReader();
                              r.onload = (ev) => {
                                if (ev.target?.result) {
                                  setRestaurantData((prev) => ({ ...prev, logoUrl: ev.target?.result as string }));
                                }
                              };
                              r.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="w-full flex items-center justify-between pb-2 px-1 text-[11px] font-mono text-[#AAB7B2]">
                      <span>LIVE PREVIEW</span>
                      <span className="text-[#E8783C] font-bold">
                        {menuTemplates.find(t => t.id === restaurantData.templateId)?.name || 'Custom Theme'}
                      </span>
                    </div>

                    <div className="w-full max-w-[360px] rounded-3xl border-4 border-stone-800 shadow-2xl bg-black flex flex-col items-center p-2 overflow-hidden ring-1 ring-white/10">
                      <MenuTemplateRenderer
                        templateId={restaurantData.templateId}
                        restaurant={{
                          name: restaurantData.name || 'Your Restaurant',
                          tagline: restaurantData.tagline,
                          cuisine: (restaurantData as any).cuisine,
                          phone: restaurantData.phone,
                          address: restaurantData.address,
                          city: restaurantData.city,
                          logo: restaurantData.logoUrl,
                        }}
                        categories={restaurantData.categories}
                        items={restaurantData.items as any}
                        compact={true}
                      />
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
                      </div>
                    )}
                  </div>

                  {/* Right Column (6 cols): LIVE CUSTOMER MENU MOCKUP */}
                  <div className="lg:col-span-6 flex flex-col items-center space-y-3">
                    <div className="w-full flex items-center justify-between px-1 text-xs font-mono text-[#AAB7B2]">
                      <span>LIVE CUSTOMER MENU</span>
                      <span className="text-[#E8783C] font-bold">
                        {menuTemplates.find((t) => t.id === restaurantData.templateId)?.name || 'Custom Theme'}
                      </span>
                    </div>

                    <div className="w-full max-w-[360px] rounded-3xl border-4 border-stone-800 shadow-2xl bg-black flex flex-col items-center p-2 overflow-hidden ring-1 ring-white/10">
                      <MenuTemplateRenderer
                        templateId={restaurantData.templateId}
                        restaurant={{
                          name: restaurantData.name || 'Your Restaurant',
                          tagline: restaurantData.tagline,
                          cuisine: (restaurantData as any).cuisine,
                          phone: restaurantData.phone,
                          address: restaurantData.address,
                          city: restaurantData.city,
                          logo: restaurantData.logoUrl,
                        }}
                        categories={restaurantData.categories}
                        items={restaurantData.items as any}
                        compact={true}
                      />
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

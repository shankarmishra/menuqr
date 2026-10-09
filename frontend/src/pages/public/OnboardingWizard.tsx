import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Store, Palette, Utensils, Sparkles, Smartphone, Monitor, Upload, X, Image as ImageIcon, Plus, Trash2, Leaf } from 'lucide-react';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import ScannableQRCode from '../../components/marketing/ScannableQRCode';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import QRGenerationSequence from '../../components/qr-studio/QRGenerationSequence';
import { menuTemplates } from '../../data/menuTemplates';
import { createPermanentQr, getQr, getSubscription, saveOnboarding, type AppQrData } from '../app/appStore';
import { useToast } from '../../components/feedback/ToastProvider';

type OnboardingCategory = { id: string; name: string; description: string; order: number };
type OnboardingItem = { id: string; name: string; description: string; price: number; category: string; dietType: 'veg' | 'non-veg' | 'vegan'; available: boolean; imageUrl: string };

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
              className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-transform hover:scale-110"
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
            {!compact && <span className="text-[10px] mt-1 opacity-60">No image</span>}
          </div>
        )}

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer bg-[#25322D] hover:bg-[#2A3832] border border-white/15 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
              <Upload size={14} className="text-[#E8783C]" />
              <span>{value ? 'Change Image File' : 'Choose Image File'}</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-xs text-[#AAB7B2] hover:text-white underline decoration-dashed transition-colors py-1 px-2"
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
  const [planId, setPlanId] = useState('PREMIUM');

  useEffect(() => {
    getSubscription().then(sub => {
      if (sub?.planId) {
        setPlanId(sub.planId.toUpperCase());
      }
    }).catch(console.error);
  }, []);

  const getSteps = () => {
    if (planId === 'BASIC') return ['identity', 'branding', 'categories', 'items', 'preview'];
    if (planId === 'INTERMEDIATE') return ['identity', 'branding', 'categories', 'items', 'templates', 'preview'];
    return ['identity', 'branding', 'categories', 'items', 'templates', 'ordering', 'reception', 'preview'];
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
    categories: OnboardingCategory[];
    items: OnboardingItem[];
    orderingEnabled: boolean;
    receptionDevice: string;
  }>({
    name: '', tagline: '', phone: '', city: '', address: '', logoUrl: '',
    templateId: 'royal-maharaja',
    categories: [
      { id: 'cat-1', name: 'Main Course', description: 'Delicious main entrees', order: 0 },
      { id: 'cat-2', name: 'Starters & Drinks', description: 'Appetizers and beverages', order: 1 }
    ],
    items: [
      {
        id: 'item-1',
        name: 'Margherita Pizza',
        description: 'Classic cheese pizza with fresh basil and tomato sauce',
        price: 199,
        category: 'cat-1',
        dietType: 'veg',
        available: true,
        imageUrl: ''
      }
    ],
    orderingEnabled: false,
    receptionDevice: 'none',
  });

  const nextStep = () => setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStepIdx((prev) => Math.max(prev - 1, 0));

  const getStepTitle = (stepId: string) => {
    switch(stepId) {
      case 'identity': return 'Restaurant Identity';
      case 'branding': return 'Branding & Logo';
      case 'categories': return 'Menu Categories';
      case 'items': return 'First Dishes';
      case 'templates': return 'Select Menu Template';
      case 'ordering': return 'Ordering Setup';
      case 'reception': return 'Reception Panel';
      case 'preview': return 'Preview & Permanent QR';
      default: return '';
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qr, setQr] = useState<AppQrData | null>(null);
  const [isPrinterOpen, setIsPrinterOpen] = useState(false);
  const [qrReady, setQrReady] = useState(false);

  const addCategory = () => setRestaurantData((current) => ({
    ...current,
    categories: [...current.categories, { id: crypto.randomUUID(), name: '', description: '', order: current.categories.length }],
  }));

  const addItem = () => setRestaurantData((current) => ({
    ...current,
    items: [...current.items, {
      id: crypto.randomUUID(), name: '', description: '', price: 99,
      category: current.categories[0]?.id || '', dietType: 'veg', available: true, imageUrl: '',
    }],
  }));

  const handlePrinterComplete = useCallback(() => {
    setQrReady(true);
    showToast('success', 'Your permanent QR sticker is ready to download or print.');
  }, [showToast]);

  const createFirstQr = async () => {
    if (!restaurantData.name.trim() || restaurantData.categories.length === 0 || restaurantData.items.length === 0) {
      showToast('error', 'Add your restaurant name, a menu category, and at least one item first.');
      return;
    }
    if (restaurantData.categories.some((category) => !category.name.trim()) || restaurantData.items.some((item) => !item.name.trim() || !item.category || item.price < 0)) {
      showToast('error', 'Check the menu names, categories, and prices before saving.');
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
          categoryIndex: restaurantData.categories.findIndex((category) => category.id === item.category),
          name: item.name,
          description: item.description,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          dietType: item.dietType,
          available: item.available,
        })),
      });
      const existingQr = await getQr();
      if (existingQr?.qrId) {
        setQr(existingQr);
        setQrReady(true);
        showToast('success', 'Your saved menu is ready. Your permanent QR is unchanged.');
        return;
      }
      const createdQr = await createPermanentQr();
      if (!createdQr.qrId) throw new Error('QR could not be created.');
      setQr(createdQr);
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
        <button onClick={() => navigate('/app/dashboard')} className="text-xs text-[#AAB7B2] hover:text-white transition-colors">
          Skip Setup
        </button>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-6 flex flex-col justify-center my-auto">
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
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">Enter basic restaurant details to customize your QR menu.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#AAB7B2]">Restaurant / Business Name *</label>
                    <input type="text" placeholder="e.g. Royal Punjab Dhaba" value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#AAB7B2]">Tagline / Subtitle</label>
                    <input type="text" placeholder="e.g. Authentic Punjabi Cuisine Since 1998" value={restaurantData.tagline} onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#AAB7B2]">Phone Number</label>
                    <input type="tel" placeholder="e.g. +91 9876543210" value={restaurantData.phone} onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#AAB7B2]">City / Location</label>
                    <input type="text" placeholder="e.g. Mumbai" value={restaurantData.city} onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-[#AAB7B2]">Full Address</label>
                    <input type="text" placeholder="e.g. Shop 12, Main Street, Bandra West, Mumbai" value={restaurantData.address} onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })} className="w-full bg-[#151C19] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C] transition-colors" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: BRANDING & LOGO SELECTION */}
            {currentStep === 'branding' && (
              <motion.div key="step-branding" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Palette size={14} /> Step 2</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Logo & Branding</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">Upload your restaurant logo to display at the top of your digital QR menu.</p>
                </div>
                
                <div className="p-6 bg-[#151C19] rounded-2xl border border-white/15 space-y-6">
                  <ImageSelector
                    label="Restaurant Logo Image"
                    value={restaurantData.logoUrl}
                    onChange={(val) => setRestaurantData({ ...restaurantData, logoUrl: val })}
                    placeholder="https://example.com/logo.png"
                  />
                  <div className="pt-2 border-t border-white/10">
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Restaurant Tagline / Slogan</label>
                    <input
                      type="text"
                      placeholder="e.g. Fresh ingredients, great taste"
                      value={restaurantData.tagline}
                      onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })}
                      className="w-full bg-[#1D2723] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E8783C]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CATEGORIES */}
            {currentStep === 'categories' && (
              <motion.div key="step-categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Utensils size={14} /> Step 3</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">Menu Categories</h2>
                    <p className="text-xs sm:text-sm text-[#AAB7B2]">Organize your dishes into sections (e.g., Starters, Main Course, Drinks).</p>
                  </div>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-2 rounded-xl bg-[#E8783C] hover:bg-[#f08b55] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-colors"
                  >
                    <Plus size={16} /> Add Category
                  </button>
                </div>

                <div className="space-y-3">
                  {restaurantData.categories.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-3 bg-[#151C19] p-4 rounded-2xl border border-white/15 shadow-sm">
                      <span className="w-8 h-8 rounded-lg bg-[#E8783C]/10 text-[#E8783C] font-mono text-xs font-black flex items-center justify-center shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Category Name (e.g. Starters)"
                          value={cat.name}
                          onChange={(e) => {
                            const updated = [...restaurantData.categories];
                            updated[idx].name = e.target.value;
                            setRestaurantData({ ...restaurantData, categories: updated });
                          }}
                          className="bg-[#1D2723] border border-white/10 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-[#E8783C]"
                        />
                        <input
                          type="text"
                          placeholder="Description (optional)"
                          value={cat.description || ''}
                          onChange={(e) => {
                            const updated = [...restaurantData.categories];
                            updated[idx].description = e.target.value;
                            setRestaurantData({ ...restaurantData, categories: updated });
                          }}
                          className="bg-[#1D2723] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#AAB7B2] focus:outline-none focus:border-[#E8783C]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setRestaurantData((current) => ({
                            ...current,
                            categories: current.categories.filter((category) => category.id !== cat.id),
                            items: current.items.filter((item) => item.category !== cat.id),
                          }))
                        }
                        className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                        title="Delete category"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: FIRST DISHES WITH PHOTO FILE SELECTOR & UI POLISH */}
            {currentStep === 'items' && (
              <motion.div key="step-items" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Utensils size={14} /> Step 4</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">First Dishes</h2>
                    <p className="text-xs sm:text-sm text-[#AAB7B2]">Add your initial menu items. You can edit or add more anytime later.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={restaurantData.categories.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-[#E8783C] hover:bg-[#f08b55] px-4 py-2.5 text-xs font-bold text-white shadow-md disabled:opacity-40 transition-colors"
                  >
                    <Plus size={16} /> Add Menu Item
                  </button>
                </div>

                <div className="space-y-4">
                  {restaurantData.items.map((item, idx) => (
                    <div key={item.id} className="p-5 bg-[#151C19] rounded-2xl border border-white/15 space-y-4 shadow-sm">
                      
                      {/* Top Row: Name, Price, Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                        
                        {/* Name & Description */}
                        <div className="sm:col-span-5 space-y-2">
                          <input
                            type="text"
                            placeholder="Dish Name (e.g. Margherita Pizza)"
                            value={item.name}
                            onChange={(e) => {
                              const updated = [...restaurantData.items];
                              updated[idx].name = e.target.value;
                              setRestaurantData({ ...restaurantData, items: updated });
                            }}
                            className="w-full bg-[#1D2723] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#E8783C]"
                          />
                          <input
                            type="text"
                            placeholder="Ingredients / Description"
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...restaurantData.items];
                              updated[idx].description = e.target.value;
                              setRestaurantData({ ...restaurantData, items: updated });
                            }}
                            className="w-full bg-[#1D2723] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#AAB7B2] focus:outline-none focus:border-[#E8783C]"
                          />
                        </div>

                        {/* Price */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="block text-[11px] font-semibold text-[#AAB7B2]">Price (₹)</label>
                          <div className="relative flex items-center">
                            <span className="absolute left-3.5 text-xs font-bold text-[#E8783C]">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => {
                                const updated = [...restaurantData.items];
                                updated[idx].price = Number(e.target.value);
                                setRestaurantData({ ...restaurantData, items: updated });
                              }}
                              className="w-full bg-[#1D2723] border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#E8783C] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="block text-[11px] font-semibold text-[#AAB7B2]">Category</label>
                          <select
                            value={item.category}
                            onChange={(event) =>
                              setRestaurantData((current) => ({
                                ...current,
                                items: current.items.map((entry) =>
                                  entry.id === item.id ? { ...entry, category: event.target.value } : entry
                                ),
                              }))
                            }
                            className="w-full bg-[#1D2723] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#E8783C]"
                          >
                            {restaurantData.categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name || 'Untitled Category'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Delete Button */}
                        <div className="sm:col-span-1 flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              setRestaurantData((current) => ({
                                ...current,
                                items: current.items.filter((entry) => entry.id !== item.id),
                              }))
                            }
                            className="text-rose-400 hover:text-rose-300 p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove dish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Diet Type Buttons & Photo File Selector */}
                      <div className="pt-3 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Diet Type Selector Buttons */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-[#AAB7B2]">Diet Preference</label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setRestaurantData((current) => ({
                                  ...current,
                                  items: current.items.map((entry) =>
                                    entry.id === item.id ? { ...entry, dietType: 'veg' } : entry
                                  ),
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                item.dietType === 'veg'
                                  ? 'bg-[#34B56A]/20 border-[#34B56A] text-[#34B56A]'
                                  : 'bg-[#1D2723] border-white/10 text-[#AAB7B2] hover:text-white'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-[#34B56A]" /> Veg
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRestaurantData((current) => ({
                                  ...current,
                                  items: current.items.map((entry) =>
                                    entry.id === item.id ? { ...entry, dietType: 'non-veg' } : entry
                                  ),
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                item.dietType === 'non-veg'
                                  ? 'bg-[#FF5E4D]/20 border-[#FF5E4D] text-[#FF5E4D]'
                                  : 'bg-[#1D2723] border-white/10 text-[#AAB7B2] hover:text-white'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-[#FF5E4D]" /> Non-Veg
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setRestaurantData((current) => ({
                                  ...current,
                                  items: current.items.map((entry) =>
                                    entry.id === item.id ? { ...entry, dietType: 'vegan' } : entry
                                  ),
                                }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                item.dietType === 'vegan'
                                  ? 'bg-emerald-400/20 border-emerald-400 text-emerald-400'
                                  : 'bg-[#1D2723] border-white/10 text-[#AAB7B2] hover:text-white'
                              }`}
                            >
                              <Leaf size={12} className="text-emerald-400" /> Vegan
                            </button>
                          </div>
                        </div>

                        {/* Dish Photo ImageSelector Component */}
                        <div className="flex-1 md:max-w-md">
                          <ImageSelector
                            compact
                            value={item.imageUrl}
                            onChange={(val) =>
                              setRestaurantData((current) => ({
                                ...current,
                                items: current.items.map((entry) =>
                                  entry.id === item.id ? { ...entry, imageUrl: val } : entry
                                ),
                              }))
                            }
                            placeholder="Dish photo web URL"
                          />
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: TEMPLATES */}
            {currentStep === 'templates' && (
              <motion.div key="step-templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Step 5</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Select Menu Template</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">Choose a visual design theme for your digital QR menu.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-h-[360px] overflow-y-auto p-1">
                  {menuTemplates.slice(0, 8).map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setRestaurantData({ ...restaurantData, templateId: tpl.id })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        restaurantData.templateId === tpl.id
                          ? 'border-[#E8783C] bg-[#E8783C]/10 ring-2 ring-[#E8783C] shadow-lg'
                          : 'border-white/15 bg-[#151C19] hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white block truncate">{tpl.name}</span>
                        {restaurantData.templateId === tpl.id && <Check size={14} className="text-[#E8783C] shrink-0" />}
                      </div>
                      <span className="text-[10px] text-[#AAB7B2] block truncate">{tpl.subtitle}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 6: ORDERING */}
            {currentStep === 'ordering' && (
              <motion.div key="step-ordering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Smartphone size={14} /> Step 6</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Enable Table Ordering</h2>
                  <p className="text-[#aab7b2] text-sm">Premium feature: allow diners to place orders directly from their mobile menu scan.</p>
                </div>
                <div className="flex items-center justify-between p-5 bg-[#151C19] rounded-2xl border border-white/15">
                  <div>
                    <h4 className="font-bold text-white text-sm">Direct Table QR Ordering</h4>
                    <p className="text-xs text-[#AAB7B2] mt-0.5">Orders will appear live in your reception dashboard.</p>
                  </div>
                  <button
                    onClick={() => setRestaurantData({ ...restaurantData, orderingEnabled: !restaurantData.orderingEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${restaurantData.orderingEnabled ? 'bg-[#E8783C]' : 'bg-[#2A3832]'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${restaurantData.orderingEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: RECEPTION */}
            {currentStep === 'reception' && (
              <motion.div key="step-reception" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Monitor size={14} /> Reception Panel</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Live Orders Panel</h2>
                  <p className="text-[#aab7b2] text-sm">Your order reception terminal is enabled and connected to your account.</p>
                </div>
                <div className="p-5 bg-[#151C19] rounded-2xl border border-white/15">
                  <p className="text-white text-sm">Reception panel successfully provisioned. You can access it anytime from your dashboard.</p>
                </div>
              </motion.div>
            )}

            {/* STEP 8: PREVIEW & PERMANENT QR */}
            {currentStep === 'preview' && (
              <motion.div key="step-preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-mono text-[#34B56A] uppercase tracking-widest flex items-center justify-center gap-1.5"><Check size={14} /> Ready</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Your Permanent QR</h2>
                  {planId === 'BASIC' && <p className="text-xs text-[#E8783C] mt-2">20 menu changes are included after setup.</p>}
                </div>
                {!qrReady ? (
                  <div className="mx-auto max-w-lg space-y-4 text-center">
                    <p className="text-sm text-[#AAB7B2]">Your menu will be saved and linked to your permanent QR code.</p>
                    <button
                      type="button"
                      onClick={() => void createFirstQr()}
                      disabled={isSubmitting}
                      className="rounded-xl bg-[#E8783C] hover:bg-[#f08b55] px-8 py-3.5 text-sm font-bold text-white disabled:opacity-60 shadow-lg transition-colors"
                    >
                      {isSubmitting ? 'Saving Menu & Creating QR...' : 'Save Menu & Create Permanent QR'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="bg-[#151C19] p-6 rounded-2xl border border-white/15 flex flex-col items-center text-center space-y-4">
                      {qr?.qrId && <ScannableQRCode url={`${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}`} size={160} />}
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{restaurantData.name || 'Your Restaurant'}</h4>
                        <p className="text-[10px] font-mono text-[#E8783C] mt-0.5 uppercase tracking-widest">PERMANENT QR CODE</p>
                      </div>
                    </div>
                    <div className="h-[300px] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-white">
                      <MenuTemplateRenderer
                        templateId={restaurantData.templateId}
                        restaurant={{
                          name: restaurantData.name,
                          tagline: restaurantData.tagline,
                          phone: restaurantData.phone,
                          address: restaurantData.address,
                          logo: restaurantData.logoUrl
                        }}
                        categories={restaurantData.categories}
                        items={restaurantData.items.map((item) => ({ ...item, image: item.imageUrl, dietType: item.dietType === 'vegan' ? 'veg' : item.dietType }))}
                        compact
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* NAV CONTROLS */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {currentStepIdx > 0 ? (
              <button onClick={prevStep} className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {currentStepIdx < steps.length - 1 ? (
              <button onClick={nextStep} className="px-6 py-2.5 rounded-xl bg-[#E8783C] text-xs font-bold text-white hover:bg-[#f08b55] flex items-center gap-2 shadow-md transition-colors">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={isSubmitting} className="px-7 py-3 rounded-xl bg-[#34B56A] text-xs font-bold text-white hover:bg-emerald-600 flex items-center gap-2 shadow-lg disabled:opacity-70 transition-colors">
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
          onComplete={handlePrinterComplete}
          onClose={() => setIsPrinterOpen(false)}
        />
      )}
    </div>
  );
}

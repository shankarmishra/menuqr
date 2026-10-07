import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Store, Palette, Utensils, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import ScannableQRCode from '../../components/marketing/ScannableQRCode';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import QRGenerationSequence from '../../components/qr-studio/QRGenerationSequence';
import { menuTemplates } from '../../data/menuTemplates';
import { createPermanentQr, getQr, getSubscription, saveOnboarding, type AppQrData } from '../app/appStore';
import { useToast } from '../../components/feedback/ToastProvider';

type OnboardingCategory = { id: string; name: string; description: string; order: number };
type OnboardingItem = { id: string; name: string; description: string; price: number; category: string; dietType: 'veg' | 'non-veg' | 'vegan'; available: boolean; imageUrl: string };

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
    templateId: 'royal-maharaja', categories: [], items: [], orderingEnabled: false, receptionDevice: 'none',
  });

  const nextStep = () => setCurrentStepIdx((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStepIdx((prev) => Math.max(prev - 1, 0));

  const getStepTitle = (stepId: string) => {
    switch(stepId) {
      case 'identity': return 'Restaurant Identity';
      case 'branding': return 'Branding';
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
      id: crypto.randomUUID(), name: '', description: '', price: 0,
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
      <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#1D2723]/80 backdrop-blur-md">
        <MenusQRBrand size="sm" variant="light" />
        <div className="flex items-center gap-2 text-xs font-mono text-[#AAB7B2]">
          <span>Step {currentStepIdx + 1} of {steps.length}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8783C]" />
          <span className="font-bold text-white uppercase">
            {getStepTitle(currentStep)}
          </span>
        </div>
        <button onClick={() => navigate('/app/dashboard')} className="text-xs text-[#AAB7B2] hover:text-white transition-colors">
          Skip Setup
        </button>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-6 flex flex-col justify-center my-auto">
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto w-full">
          {steps.map((step, idx) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  idx === currentStepIdx
                    ? 'bg-[#E8783C] text-white ring-4 ring-[#E8783C]/20'
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

        <div className="bg-[#1D2723] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          <AnimatePresence mode="wait">
            {currentStep === 'identity' && (
              <motion.div key="step-identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Store size={14} /> Identity</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Restaurant Identity</h2>
                  <p className="text-xs sm:text-sm text-[#AAB7B2]">Enter your restaurant details.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Restaurant Name *</label>
                    <input type="text" aria-label="Restaurant name" value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Phone</label>
                    <input type="tel" aria-label="Restaurant phone" value={restaurantData.phone} onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">City</label>
                    <input type="text" aria-label="Restaurant city" value={restaurantData.city} onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Address</label>
                    <input type="text" aria-label="Restaurant address" value={restaurantData.address} onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Tagline</label>
                    <input type="text" aria-label="Restaurant tagline" value={restaurantData.tagline} onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'branding' && (
              <motion.div key="step-branding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Palette size={14} /> Branding</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Logo & Branding</h2>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#151C19] rounded-xl border border-white/10">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E8783C] bg-black shrink-0">
                    {restaurantData.logoUrl ? <img src={restaurantData.logoUrl} alt="Restaurant logo preview" className="w-full h-full object-cover" /> : <Store className="m-auto mt-6 text-white/60" />}
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="text-xs font-bold text-white">Logo URL</p>
                    <input type="url" aria-label="Logo URL" value={restaurantData.logoUrl} onChange={(e) => setRestaurantData({ ...restaurantData, logoUrl: e.target.value })} placeholder="https://..." className="w-full bg-[#1D2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'categories' && (
              <motion.div key="step-categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Utensils size={14} /> Menu Setup</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Menu Categories</h2>
                  <button type="button" onClick={addCategory} className="rounded-md border border-[#E8783C]/50 px-3 py-2 text-sm font-semibold text-[#E8783C]">Add category</button>
                </div>
                <div className="space-y-3">
                  {restaurantData.categories.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-3 bg-[#151C19] p-3 rounded-xl border border-white/10">
                      <span className="text-xs font-mono text-[#E8783C] font-bold">0{idx + 1}</span>
                      <input type="text" value={cat.name} onChange={(e) => {
                        const updated = [...restaurantData.categories];
                        updated[idx].name = e.target.value;
                        setRestaurantData({ ...restaurantData, categories: updated });
                      }} aria-label={`Category name ${idx + 1}`} className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none" />
                      <button type="button" aria-label={`Remove ${cat.name || 'category'}`} onClick={() => setRestaurantData((current) => ({ ...current, categories: current.categories.filter((category) => category.id !== cat.id), items: current.items.filter((item) => item.category !== cat.id) }))} className="text-xs text-rose-300">Remove</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'items' && (
              <motion.div key="step-items" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Utensils size={14} /> Menu Setup</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">First Dishes</h2>
                  <button type="button" onClick={addItem} disabled={restaurantData.categories.length === 0} className="rounded-md border border-[#E8783C]/50 px-3 py-2 text-sm font-semibold text-[#E8783C] disabled:opacity-40">Add menu item</button>
                </div>
                <div className="space-y-3">
                  {restaurantData.items.map((item, idx) => (
                    <div key={item.id} className="p-4 bg-[#151C19] rounded-xl border border-white/10 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.dietType === 'veg' ? 'bg-[#34B56A]' : 'bg-[#FF5E4D]'}`} />
                          <input type="text" value={item.name} onChange={(e) => {
                            const updated = [...restaurantData.items];
                            updated[idx].name = e.target.value;
                            setRestaurantData({ ...restaurantData, items: updated });
                          }} aria-label={`Dish name ${idx + 1}`} className="bg-transparent font-bold text-sm text-white focus:outline-none" />
                        </div>
                        <input type="text" aria-label={`Dish description ${idx + 1}`} value={item.description} onChange={(e) => {
                          const updated = [...restaurantData.items];
                          updated[idx].description = e.target.value;
                          setRestaurantData({ ...restaurantData, items: updated });
                        }} className="bg-transparent text-xs text-[#AAB7B2] w-full focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#E8783C] font-bold">₹</span>
                        <input type="number" aria-label={`Dish price ${idx + 1}`} value={item.price} onChange={(e) => {
                          const updated = [...restaurantData.items];
                          updated[idx].price = Number(e.target.value);
                          setRestaurantData({ ...restaurantData, items: updated });
                        }} className="w-20 bg-[#1D2723] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none" />
                      </div>
                      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                        <select aria-label="Category" value={item.category} onChange={(event) => setRestaurantData((current) => ({ ...current, items: current.items.map((entry) => entry.id === item.id ? { ...entry, category: event.target.value } : entry) }))} className="rounded-lg border border-white/10 bg-[#1D2723] px-2 py-2 text-xs text-white">
                          {restaurantData.categories.map((category) => <option key={category.id} value={category.id}>{category.name || 'New category'}</option>)}
                        </select>
                        <select aria-label="Diet type" value={item.dietType} onChange={(event) => setRestaurantData((current) => ({ ...current, items: current.items.map((entry) => entry.id === item.id ? { ...entry, dietType: event.target.value as OnboardingItem['dietType'] } : entry) }))} className="rounded-lg border border-white/10 bg-[#1D2723] px-2 py-2 text-xs text-white">
                          <option value="veg">Vegetarian</option><option value="non-veg">Non-vegetarian</option><option value="vegan">Vegan</option>
                        </select>
                        <input type="url" aria-label="Dish photo URL" placeholder="Dish photo URL" value={item.imageUrl} onChange={(event) => setRestaurantData((current) => ({ ...current, items: current.items.map((entry) => entry.id === item.id ? { ...entry, imageUrl: event.target.value } : entry) }))} className="rounded-lg border border-white/10 bg-[#1D2723] px-2 py-2 text-xs text-white" />
                      </div>
                      <button type="button" onClick={() => setRestaurantData((current) => ({ ...current, items: current.items.filter((entry) => entry.id !== item.id) }))} className="text-xs text-rose-300">Remove item</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'templates' && (
              <motion.div key="step-templates" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Sparkles size={14} /> Templates</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Select Menu Template</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {menuTemplates.slice(0, 8).map((tpl) => (
                    <button key={tpl.id} onClick={() => setRestaurantData({ ...restaurantData, templateId: tpl.id })} className={`p-3 rounded-xl border text-left transition-all ${
                      restaurantData.templateId === tpl.id ? 'border-[#E8783C] bg-[#E8783C]/10 ring-2 ring-[#E8783C]' : 'border-white/10 bg-[#151C19] hover:border-white/20'
                    }`}>
                      <span className="text-xs font-bold text-white block truncate">{tpl.name}</span>
                      <span className="text-[10px] text-[#AAB7B2] block truncate mt-0.5">{tpl.subtitle}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'ordering' && (
              <motion.div key="step-ordering" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Smartphone size={14} /> Ordering Setup</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Enable Ordering</h2>
                  <p className="text-[#aab7b2] text-sm">Premium feature: let guests order directly from the QR code.</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#151C19] rounded-xl border border-white/10">
                  <span className="font-semibold text-white">Table Ordering</span>
                  <button onClick={() => setRestaurantData({...restaurantData, orderingEnabled: !restaurantData.orderingEnabled})} className={`w-12 h-6 rounded-full transition-colors relative ${restaurantData.orderingEnabled ? 'bg-[#e8783c]' : 'bg-[#2a3832]'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${restaurantData.orderingEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 'reception' && (
              <motion.div key="step-reception" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Monitor size={14} /> Reception Panel</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Live Orders Panel</h2>
                  <p className="text-[#aab7b2] text-sm">Premium feature: set up the reception device for managing orders.</p>
                </div>
                <div className="p-4 bg-[#151C19] rounded-xl border border-white/10">
                  <p className="text-white text-sm">Reception panel successfully provisioned. You can access it from your Dashboard.</p>
                </div>
              </motion.div>
            )}

            {currentStep === 'preview' && (
              <motion.div key="step-preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-mono text-[#34B56A] uppercase tracking-widest flex items-center justify-center gap-1.5"><Check size={14} /> Ready</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Your Permanent QR</h2>
                  {planId === 'BASIC' && <p className="text-xs text-[#e8783c] mt-2">20 menu changes are included after setup.</p>}
                </div>
                {!qrReady ? (
                  <div className="mx-auto max-w-lg space-y-4 text-center">
                    <p className="text-sm text-[#AAB7B2]">Your menu is saved first. Then we create one permanent QR that always opens its latest version.</p>
                    <button type="button" onClick={() => void createFirstQr()} disabled={isSubmitting} className="rounded-xl bg-[#E8783C] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{isSubmitting ? 'Saving menu...' : 'Save menu and create permanent QR'}</button>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-[#151C19] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center space-y-4">
                    {qr?.qrId && <ScannableQRCode url={`${window.location.origin}/qr/${encodeURIComponent(qr.qrId)}`} size={140} />}
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{restaurantData.name}</h4>
                      <p className="text-[10px] font-mono text-[#E8783C] mt-0.5">PERMANENT QR CODE</p>
                    </div>
                  </div>
                  <div className="h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white">
                    <MenuTemplateRenderer templateId={restaurantData.templateId} restaurant={{ name: restaurantData.name, tagline: restaurantData.tagline, phone: restaurantData.phone, address: restaurantData.address, logo: restaurantData.logoUrl }} categories={restaurantData.categories} items={restaurantData.items.map((item) => ({ ...item, image: item.imageUrl, dietType: item.dietType === 'vegan' ? 'veg' : item.dietType }))} compact />
                  </div>
                </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {currentStepIdx > 0 ? (
              <button onClick={prevStep} className="px-5 py-2.5 rounded-xl border border-white/15 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2">
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {currentStepIdx < steps.length - 1 ? (
              <button onClick={nextStep} className="px-6 py-2.5 rounded-xl bg-[#E8783C] text-xs font-bold text-white hover:bg-[#f08145] flex items-center gap-2 shadow-md">
                Continue <ArrowRight size={14} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={isSubmitting} className="px-7 py-3 rounded-xl bg-[#34B56A] text-xs font-bold text-white hover:bg-emerald-600 flex items-center gap-2 shadow-lg disabled:opacity-70">
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Store, Palette, Utensils, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import ScannableQRCode from '../../components/marketing/ScannableQRCode';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import { menuTemplates } from '../../data/menuTemplates';
import { getSubscription } from '../app/appStore';

export default function OnboardingWizard() {
  const navigate = useNavigate();
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

  const [restaurantData, setRestaurantData] = useState({
    name: 'The Golden Spoon',
    tagline: 'Authentic Indian Bistro & Tandoor',
    cuisine: 'North Indian & Mughlai',
    phone: '+91 98765 43210',
    email: 'contact@goldenspoon.com',
    address: 'Indiranagar, Bengaluru',
    slug: 'golden-spoon-bistros',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    templateId: 'royal-maharaja',
    categories: [
      { id: 'cat-1', name: 'STARTERS', order: 0 },
      { id: 'cat-2', name: 'MAIN COURSE', order: 1 },
      { id: 'cat-3', name: 'DESSERTS', order: 2 },
    ],
    items: [
      {
        id: 'item-1',
        name: 'Tandoori Paneer Tikka',
        description: 'Smoked cottage cheese marinated in hung curd and aromatics',
        price: 280,
        category: 'cat-1',
        dietType: 'veg' as const,
        available: true,
      },
      {
        id: 'item-2',
        name: 'Butter Chicken Signature',
        description: 'Clay oven chicken in velvety tomato butter gravy',
        price: 360,
        category: 'cat-2',
        dietType: 'non-veg' as const,
        available: true,
      },
      {
        id: 'item-3',
        name: 'Gulab Jamun Flambé',
        description: 'Soft milk solids in saffron syrup',
        price: 140,
        category: 'cat-3',
        dietType: 'veg' as const,
        available: true,
      },
    ],
    orderingEnabled: false,
    receptionDevice: 'none'
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

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/app/onboarding/complete`, {
        method: 'POST',
      });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      navigate('/app/dashboard', { replace: true });
    }
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
                    <input type="text" value={restaurantData.name} onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#AAB7B2] mb-1.5">Tagline</label>
                    <input type="text" value={restaurantData.tagline} onChange={(e) => setRestaurantData({ ...restaurantData, tagline: e.target.value })} className="w-full bg-[#151C19] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E8783C]" />
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
                    <img src={restaurantData.logo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 w-full">
                    <p className="text-xs font-bold text-white">Logo URL</p>
                    <input type="text" value={restaurantData.logo} onChange={(e) => setRestaurantData({ ...restaurantData, logo: e.target.value })} className="w-full bg-[#1D2723] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8783C]" />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'categories' && (
              <motion.div key="step-categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#E8783C] uppercase tracking-widest flex items-center gap-1.5"><Utensils size={14} /> Menu Setup</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">Menu Categories</h2>
                </div>
                <div className="space-y-3">
                  {restaurantData.categories.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-3 bg-[#151C19] p-3 rounded-xl border border-white/10">
                      <span className="text-xs font-mono text-[#E8783C] font-bold">0{idx + 1}</span>
                      <input type="text" value={cat.name} onChange={(e) => {
                        const updated = [...restaurantData.categories];
                        updated[idx].name = e.target.value;
                        setRestaurantData({ ...restaurantData, categories: updated });
                      }} className="flex-1 bg-transparent text-sm font-bold text-white focus:outline-none" />
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
                          }} className="bg-transparent font-bold text-sm text-white focus:outline-none" />
                        </div>
                        <input type="text" value={item.description} onChange={(e) => {
                          const updated = [...restaurantData.items];
                          updated[idx].description = e.target.value;
                          setRestaurantData({ ...restaurantData, items: updated });
                        }} className="bg-transparent text-xs text-[#AAB7B2] w-full focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-[#E8783C] font-bold">₹</span>
                        <input type="number" value={item.price} onChange={(e) => {
                          const updated = [...restaurantData.items];
                          updated[idx].price = Number(e.target.value);
                          setRestaurantData({ ...restaurantData, items: updated });
                        }} className="w-20 bg-[#1D2723] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none" />
                      </div>
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
                  {planId === 'BASIC' && <p className="text-xs text-[#e8783c] mt-2">Note: You have 1 included menu edit remaining.</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-[#151C19] p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center space-y-4">
                    <ScannableQRCode url={`https://menusqr.app/menu/${restaurantData.slug}`} size={140} />
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{restaurantData.name}</h4>
                      <p className="text-[10px] font-mono text-[#E8783C] mt-0.5">PERMANENT QR CODE</p>
                    </div>
                  </div>
                  <div className="h-[280px] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white">
                    <MenuTemplateRenderer templateId={restaurantData.templateId} restaurant={restaurantData} categories={restaurantData.categories} items={restaurantData.items} compact />
                  </div>
                </div>
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
    </div>
  );
}

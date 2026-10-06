import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { QrCode, Sparkles, ShieldCheck, Zap, Layers, CheckCircle2, Scan, ShoppingBag } from 'lucide-react';
import { MenuTemplateRenderer } from '../menu-builder/MenuTemplateRenderer';

const MOCK_RESTAURANT = {
  name: 'The Rustic Spatula',
  tagline: 'Farm to table goodness',
};

const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Starters', order: 1 },
  { id: 'c2', name: 'Mains', order: 2 },
];

const MOCK_ITEMS = [
  { id: 'i1', name: 'Truffle Fries', price: 299, category: 'c1', dietType: 'veg' as const, available: true, isBestseller: true, description: 'Crispy fries with truffle oil and parmesan.' },
  { id: 'i2', name: 'Spicy Wings', price: 449, category: 'c1', dietType: 'non-veg' as const, available: true, description: 'Signature hot wings with blue cheese dip.' },
  { id: 'i3', name: 'Mushroom Risotto', price: 699, category: 'c2', dietType: 'veg' as const, available: true, description: 'Creamy arborio rice with wild mushrooms.' },
  { id: 'i4', name: 'Grilled Salmon', price: 899, category: 'c2', dietType: 'non-veg' as const, available: true, description: 'Fresh salmon with asparagus and lemon butter.' },
];

const STEPS = [
  {
    id: 'print-once',
    stepNumber: '01',
    title: 'Print it once.',
    subtitle: 'Permanent Hardware Fixture',
    description: 'Your physical QR code is a permanent fixture. No more reprinting for price changes, out-of-stock items, or new menu additions.',
    icon: ShieldCheck,
    badge: 'Zero Reprinting Costs',
    color: '#1A2B24',
    features: ['Permanent acrylic or wood QR stands', 'Dynamic backend link routing', 'Zero print re-orders forever']
  },
  {
    id: 'instant-access',
    stepNumber: '02',
    title: 'Instant Access.',
    subtitle: 'Zero App Downloads',
    description: 'Customers scan with their native smartphone camera. No app downloads, no registration walls, no friction.',
    icon: Zap,
    badge: '1.2s Average Load Time',
    color: '#E8783C',
    features: ['Native iOS & Android camera scan', 'PWA instant web loading', 'No App Store download required']
  },
  {
    id: 'live-experience',
    stepNumber: '03',
    title: 'A Live Experience.',
    subtitle: 'Real-Time Brand Identity',
    description: 'Beautiful, always up-to-date digital menus that reflect your brand identity, respect dietary tags, and drive guest ordering.',
    icon: Layers,
    badge: '100% Live Updates',
    color: '#2D5A3D',
    features: ['Instant item availability toggles', 'Dietary (Veg/Non-Veg) badges', '15 architectural themes']
  }
];

export default function PhysicalQrSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Auto-cycle tabs every 6 seconds if user doesn't interact
  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, prefersReducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
    <section className="py-14 md:py-20 bg-[#F6F6F2] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 texture-fine-noise pointer-events-none opacity-[0.15]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E8783C]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#1A2B24]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#1A2B24] text-[12px] font-bold uppercase tracking-widest mb-6 shadow-sm border border-black/5">
            <QrCode size={14} className="text-[#E8783C]" />
            <span>Physical Dining × Digital Presence</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1A2B24] tracking-tight leading-tight">
            One permanent code.{' '}
            <span className="text-[#E8783C] italic font-serif font-normal block sm:inline">
              Infinite digital updates.
            </span>
          </h2>
          <p className="text-gray-500 text-lg md:text-xl mt-6 leading-relaxed font-medium">
            Eliminate reprinting costs forever. Bridge the gap between physical dining tables and real-time digital menus.
          </p>
        </div>

        {/* 2-Column Split Showcase */}
        <div 
          className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          
          {/* Left Column: Interactive Step Selector Cards */}
          <div className="xl:col-span-5 space-y-5">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-[2rem] p-7 transition-all duration-500 relative border ${
                    isActive
                      ? 'bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border-[#1A2B24]/10 ring-1 ring-black/5 scale-[1.02] z-10'
                      : 'bg-white/40 hover:bg-white/80 border-transparent hover:border-black/5 scale-100 z-0'
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                        isActive ? 'bg-[#1A2B24] text-white shadow-xl shadow-[#1A2B24]/20' : 'bg-gray-100/80 text-gray-400'
                      }`}
                    >
                      <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black tracking-[0.2em] text-[#E8783C] uppercase">
                          Step {step.stepNumber}
                        </span>
                        {isActive && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#E8783C]/10 text-[#E8783C] border border-[#E8783C]/20"
                          >
                            {step.badge}
                          </motion.span>
                        )}
                      </div>

                      <h3 className={`text-2xl font-extrabold tracking-tight transition-colors duration-300 ${isActive ? 'text-[#1A2B24]' : 'text-gray-500'}`}>
                        {step.title}
                      </h3>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-600 text-sm mt-3 leading-relaxed font-medium pr-4">
                              {step.description}
                            </p>
                            <div className="mt-5 pt-5 border-t border-gray-100 space-y-3">
                              {step.features.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-3 text-[13px] font-bold text-gray-700">
                                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#1A2B24]/5 flex items-center justify-center shrink-0">
                                    <CheckCircle2 size={12} className="text-[#E8783C]" />
                                  </div>
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Active Progress Bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-8 bottom-8 w-1.5 bg-[#E8783C] rounded-r-full shadow-[0_0_10px_rgba(232,120,60,0.5)]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Premium Stage Showcase */}
          <motion.div
            data-qr-story-scene
            initial={prefersReducedMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="xl:col-span-7 flex justify-center items-center h-full min-h-[600px]"
          >
            <div className="relative w-full max-w-[500px] aspect-square xl:aspect-[4/4.5] bg-gradient-to-br from-[#121E19] to-[#0A110D] rounded-[3rem] p-8 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col justify-center items-center overflow-hidden border border-white/10 group">
              
              {/* Dynamic Glow Background based on step */}
              <motion.div 
                animate={{ 
                  backgroundColor: activeStep === 0 ? 'rgba(232,120,60,0.15)' : activeStep === 1 ? 'rgba(52,181,106,0.15)' : 'rgba(232,120,60,0.1)'
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[80px] pointer-events-none transition-colors duration-1000" 
              />

              <div className="pointer-events-none absolute inset-x-4 top-1/2 z-20 flex -translate-y-1/2 items-center justify-between" aria-hidden="true">
                <div className="flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-[#17211d]/90 p-2 text-[#F1D99D] shadow-lg backdrop-blur-sm">
                  <QrCode size={24} strokeWidth={1.5} />
                  <span className="text-[7px] font-bold uppercase tracking-wider">Same QR</span>
                </div>
                <div className="absolute left-12 right-12 top-1/2 h-px -translate-y-1/2 overflow-hidden bg-white/15">
                  <motion.div
                    data-qr-link-pulse
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#F1D99D] to-transparent shadow-[0_0_12px_rgba(241,217,157,0.8)]"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl border border-white/15 bg-[#17211d]/90 p-2 text-[#F1D99D] shadow-lg backdrop-blur-sm">
                  <ShoppingBag size={24} strokeWidth={1.5} />
                  <span className="text-[7px] font-bold uppercase tracking-wider">Live Menu</span>
                </div>
              </div>

              {/* Stage Content Switch */}
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  /* STEP 1: PHYSICAL ACRYLIC QR STAND ON TABLE (3D Isometric) */
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, y: 40, rotateX: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, rotateX: -20, scale: 0.9, filter: 'blur(12px)' }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center justify-center text-center w-full h-full relative z-10 perspective-[1000px]"
                  >
                     <motion.div 
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="relative bg-[#FAFAF7] text-[#1A2B24] p-8 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border-b-[16px] border-[#D4D4D0] max-w-[300px] w-full flex flex-col items-center transform-gpu"
                     >
                       <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent rounded-[2.5rem] pointer-events-none" />
                       
                       <div className="w-48 h-48 bg-white p-3.5 rounded-[1.5rem] shadow-[inset_0_4px_16px_rgba(0,0,0,0.08)] mb-6 relative overflow-hidden ring-1 ring-black/5">
                         <QrCode className="w-full h-full text-[#1A2B24]" strokeWidth={1.5} />
                         {/* Scanner laser sweep */}
                         <motion.div 
                           animate={{ top: ['-20%', '120%'] }}
                           transition={{ repeat: Infinity, duration: 3, ease: 'linear', delay: 0.5 }}
                           className="absolute left-0 right-0 h-1 bg-[#E8783C] shadow-[0_0_24px_4px_rgba(232,120,60,0.5)] opacity-80"
                         />
                       </div>
                       
                       <div className="h-1.5 w-20 bg-gradient-to-r from-[#E8783C] to-[#F1A679] rounded-full mb-3" />
                       <span className="text-[12px] font-black uppercase tracking-[0.25em] text-[#1A2B24]/80">
                         TABLE #12
                       </span>
                     </motion.div>
                     
                     {/* 3D Drop Shadow */}
                     <div className="w-72 h-8 bg-black/60 rounded-[100%] blur-[20px] mt-10 opacity-70" />
                  </motion.div>
                )}

                {activeStep === 1 && (
                  /* STEP 2: NATIVE CAMERA SCANNER VIEW */
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, scale: 0.85, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(12px)' }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    className="flex flex-col items-center justify-center text-center w-full h-full relative z-10"
                  >
                    <div className="w-[300px] h-[560px] bg-black rounded-[3.5rem] p-3 border-[6px] border-gray-800 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative flex flex-col overflow-hidden">
                      {/* Dynamic Island / Notch */}
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-40" />
                      
                      <div className="relative w-full h-full bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center p-4 overflow-hidden">
                         {/* Camera background blur simulation */}
                         <div className="absolute inset-0 bg-[#2D3A34] opacity-80" />
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-40 blur-md mix-blend-overlay" />

                        {/* Scanner Viewfinder Box */}
                        <motion.div 
                           initial={{ scale: 1.3, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                           className="w-52 h-52 border-2 border-white/30 rounded-3xl relative flex items-center justify-center z-10 backdrop-blur-sm"
                        >
                          <div className="absolute -top-1.5 -left-1.5 w-10 h-10 border-t-[5px] border-l-[5px] border-[#E8783C] rounded-tl-2xl" />
                          <div className="absolute -top-1.5 -right-1.5 w-10 h-10 border-t-[5px] border-r-[5px] border-[#E8783C] rounded-tr-2xl" />
                          <div className="absolute -bottom-1.5 -left-1.5 w-10 h-10 border-b-[5px] border-l-[5px] border-[#E8783C] rounded-bl-2xl" />
                          <div className="absolute -bottom-1.5 -right-1.5 w-10 h-10 border-b-[5px] border-r-[5px] border-[#E8783C] rounded-br-2xl" />
                          <Scan size={56} className="text-white/20" strokeWidth={1} />

                          {/* Dynamic Bouncing Laser */}
                          <motion.div
                            animate={{ y: [-100, 100, -100] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                            className="absolute left-0 right-0 h-1 bg-[#E8783C] shadow-[0_0_30px_5px_rgba(232,120,60,0.6)]"
                          />
                        </motion.div>

                        {/* Instant Scan NFC/QR Toast Notification */}
                        <motion.div
                          initial={{ y: 60, opacity: 0, scale: 0.9 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8, type: "spring", stiffness: 300, damping: 20 }}
                          className="absolute bottom-10 bg-white/95 text-[#1A2B24] px-5 py-4 rounded-[1.5rem] text-sm font-bold shadow-2xl flex items-center gap-4 backdrop-blur-xl border border-white/20 z-20 w-[92%]"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#E8783C]/10 flex items-center justify-center text-[#E8783C] shrink-0">
                            <Sparkles size={18} />
                          </div>
                          <div className="flex flex-col items-start">
                             <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-0.5">NFC / QR Detected</span>
                             <span className="text-[14px]">Open Menu</span>
                          </div>
                          <div className="ml-auto w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                            <motion.div 
                              animate={{ x: [0, 3, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-gray-400 rotate-45" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  /* STEP 3: LIVE DIGITAL MENU */
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, y: 60, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -60, scale: 0.9, filter: 'blur(12px)' }}
                    transition={{ type: "spring", stiffness: 220, damping: 22 }}
                    className="w-full h-full flex flex-col items-center justify-center relative z-10"
                  >
                    <div className="w-[300px] h-[560px] bg-black rounded-[3.5rem] p-2.5 border-[6px] border-gray-800 shadow-[0_40px_100px_rgba(232,120,60,0.15)] relative flex flex-col overflow-hidden">
                      {/* Dynamic Island */}
                      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-40" />
                      
                      <div className="w-full h-full rounded-[2.8rem] overflow-hidden relative bg-[#FAFAF7]">
                         <motion.div 
                           initial={{ y: 200, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                           className="h-full w-full"
                         >
                           <MenuTemplateRenderer
                             templateId="maison-noir"
                             restaurant={MOCK_RESTAURANT}
                             categories={MOCK_CATEGORIES}
                             items={MOCK_ITEMS}
                             compact={true}
                             className="h-full w-full pt-14 pb-6 hide-scrollbar"
                           />
                         </motion.div>

                         {/* Floating Action Button simulation */}
                         <motion.div 
                           initial={{ scale: 0 }}
                           animate={{ scale: 1 }}
                           transition={{ delay: 0.8, type: "spring", stiffness: 400, damping: 15 }}
                           className="absolute bottom-8 right-6 w-14 h-14 bg-[#E8783C] rounded-full shadow-[0_10px_20px_rgba(232,120,60,0.4)] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
                         >
                            <ShoppingBag size={22} fill="currentColor" strokeWidth={1} />
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#1A2B24] rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold">2</div>
                         </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced Bottom Carousel Indicator */}
              <div className="flex items-center gap-3 mt-8 relative z-20">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="relative py-2 flex justify-center group"
                    aria-label={`Go to step ${i + 1}`}
                  >
                    <div className={`transition-all duration-500 rounded-full ${
                      i === activeStep ? 'w-8 h-2 bg-[#E8783C]' : 'w-2 h-2 bg-white/20 group-hover:bg-white/40'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
    </MotionConfig>
  );
}

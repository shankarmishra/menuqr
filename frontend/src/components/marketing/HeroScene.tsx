import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import PhysicalQRStand from './PhysicalQRStand';
import PremiumIPhoneMockup from './PremiumIPhoneMockup';
import { Signal, Wifi, Battery, CheckCircle2, Loader2 } from 'lucide-react';
const heroRestaurantPoster = '/marketing/hero/hero-restaurant-poster.webp';

type HeroStage = 'hidden' | 'entering' | 'aiming' | 'scanning' | 'detected' | 'processing' | 'menu-open';

export default function HeroScene() {
  const [stage, setStage] = useState<HeroStage>('hidden');
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  // Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%']);
  const qrY = useTransform(scrollYProgress, [0, 1], ['-2%', '2%']);
  const phoneY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setStage('menu-open');
      return;
    }

    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout, t5: NodeJS.Timeout, t6: NodeJS.Timeout;

    setStage('hidden');
    t1 = setTimeout(() => setStage('entering'), 300);
    t2 = setTimeout(() => setStage('aiming'), 1000);
    t3 = setTimeout(() => setStage('scanning'), 1500);
    t4 = setTimeout(() => setStage('detected'), 3000);
    t5 = setTimeout(() => setStage('processing'), 3800);
    t6 = setTimeout(() => setStage('menu-open'), 4600);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
    };
  }, [isInView, shouldReduceMotion]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[550px] sm:h-[650px] lg:h-[750px] flex items-center justify-center overflow-visible select-none"
    >
      {/* Background Layer: Real Restaurant Table Environment with soft edge blending */}
      <motion.div 
        style={{ 
          y: bgY,
          maskImage: 'radial-gradient(ellipse at 60% 50%, black 30%, transparent 65%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 60% 50%, black 30%, transparent 65%)'
        }}
        className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%] pointer-events-none z-0"
      >
        <img
          src={heroRestaurantPoster}
          alt="Restaurant background"
          className="w-full h-full object-cover filter brightness-[0.85] contrast-[1.1] scale-105"
        />
      </motion.div>

      {/* Layer 2: Physical QR Stand (Left Foreground) */}
      <motion.div
        style={{ y: qrY }}
        animate={{
          scale: ['aiming', 'scanning', 'detected', 'processing'].includes(stage) ? 1.03 : 1,
          x: stage === 'menu-open' ? '-60%' : '-45%',
          opacity: stage === 'menu-open' ? 0.90 : 1,
          filter: stage === 'menu-open' ? 'blur(1px)' : 'blur(0px)',
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <PhysicalQRStand />
      </motion.div>

      {/* Layer 3: Phone Mockup */}
      <motion.div
        style={{ y: phoneY }}
        initial={shouldReduceMotion ? false : { y: '110%', opacity: 0 }}
        animate={
          stage === 'hidden'
            ? { y: '110%', opacity: 0, x: '25%', rotate: 0 }
            : stage === 'entering'
            ? { y: '10%', opacity: 1, x: '25%', rotate: 0 }
            : stage === 'aiming'
            ? { y: '0%', opacity: 1, x: '-15%', rotate: -3 }
            : stage === 'scanning'
            ? { y: '0%', opacity: 1, x: '-15%', rotate: -3 }
            : stage === 'detected'
            ? { y: '0%', opacity: 1, x: '-15%', rotate: -2 }
            : stage === 'processing'
            ? { y: '0%', opacity: 1, x: '-10%', rotate: -1 }
            : { y: '0%', opacity: 1, x: '28%', rotate: 0 }
        }
        transition={{ duration: shouldReduceMotion ? 0 : 1.1, type: 'spring', stiffness: 55, damping: 16 }}
        className="absolute bottom-[5%] sm:bottom-[8%] left-1/2 -translate-x-1/2 z-20 origin-bottom"
      >
        <PremiumIPhoneMockup>
          {/* iOS Status Bar */}
          <div className="absolute top-0 left-0 w-full h-[40px] flex justify-between items-center px-6 pt-2 z-50 text-white font-semibold text-[11px] drop-shadow-sm">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal size={12} className="stroke-[2.5]" />
              <Wifi size={12} className="stroke-[2.5]" />
              <div className="relative flex items-center">
                <Battery size={15} className="stroke-2" />
                <div className="absolute left-[2px] top-[4px] h-[6px] w-[8px] bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen Content: Scan Camera Mode vs Customer Menu */}
          <div className="relative w-full h-full flex flex-col pt-[40px] font-sans">
            <AnimatePresence mode="wait">
              {['entering', 'aiming', 'scanning', 'detected', 'processing'].includes(stage) ? (
                /* CAMERA UI SCANNING SCREEN */
                <motion.div
                  key="camera-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-[#151C19] flex flex-col justify-between p-5 pt-[44px] z-30"
                >
                  {/* Blurred Camera Feed Background */}
                  <div className="absolute inset-0 opacity-30">
                    <img src={heroRestaurantPoster} alt="" className="w-full h-full object-cover blur-sm scale-110" />
                  </div>

                  {/* Viewfinder Center */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
                    <motion.div
                      animate={{
                        borderColor: stage === 'detected' ? '#34B56A' : 'rgba(255,255,255,0.4)',
                        scale: stage === 'detected' ? 1.04 : 1,
                      }}
                      className="relative w-44 h-44 border-2 border-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-white/10 transition-colors overflow-hidden"
                    >
                      {/* Viewfinder Corners */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-xl z-20 pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-xl z-20 pointer-events-none" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-xl z-20 pointer-events-none" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-xl z-20 pointer-events-none" />

                      {/* Live Camera View of Physical QR Stand being scanned */}
                      <div className="absolute inset-0 flex items-center justify-center scale-[0.48] translate-y-3 pointer-events-none opacity-90">
                        <PhysicalQRStand tableNumber="TABLE 12" />
                      </div>

                      {/* Laser Beam Animation */}
                      {stage === 'scanning' && (
                        <motion.div
                          initial={{ top: '10%' }}
                          animate={{ top: '85%' }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                          className="absolute left-0 right-0 h-0.5 bg-[#FFC928] shadow-[0_0_12px_2px_rgba(255,201,40,0.8)] z-30 pointer-events-none"
                        />
                      )}

                      {/* QR Confirmation Overlay */}
                      {(stage === 'detected' || stage === 'processing') && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative z-40 bg-[#34B56A] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5"
                        >
                          {stage === 'processing' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          <span>{stage === 'processing' ? 'Opening...' : 'QR Detected'}</span>
                        </motion.div>
                      )}
                    </motion.div>

                    <p className="mt-6 text-xs text-white/80 font-medium text-center">
                      Point at menu QR to order
                    </p>
                  </div>

                  {/* Shutter Button Mock */}
                  <div className="relative z-10 pb-2 flex justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-white" />
                    </div>
                  </div>
                </motion.div>
              ) : stage === 'menu-open' ? (
                /* MENUSQR CUSTOMER MENU SCREEN */
                <motion.div
                  key="customer-menu"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 bg-[#FAFAF7] flex flex-col text-left z-30 overflow-hidden"
                >
                  {/* Restaurant Header */}
                  <div className="bg-[#151C19] text-white p-3.5 pt-7 shrink-0 relative border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8783C] text-white flex items-center justify-center font-serif font-bold text-xs shadow-sm">
                          RH
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xs tracking-tight leading-none mb-0.5 text-white">Royal Haveli</h3>
                          <p className="text-[9px] text-[#E8783C] font-mono font-bold tracking-wider uppercase">
                            FINE DINING • TABLE 12
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A] animate-pulse" />
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wide">Live</span>
                      </span>
                    </div>
                  </div>

                  {/* Category Navigation Pills */}
                  <div className="bg-white border-b border-slate-200/80 px-3 py-2 flex gap-1.5 shrink-0 overflow-x-auto scrollbar-none">
                    <span className="bg-[#E8783C] text-white text-[9.5px] font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                      Starters
                    </span>
                    <span className="bg-slate-100 text-[#4A5D54] text-[9.5px] font-semibold px-2.5 py-1 rounded-full shrink-0">
                      Main Course
                    </span>
                    <span className="bg-slate-100 text-[#4A5D54] text-[9.5px] font-semibold px-2.5 py-1 rounded-full shrink-0">
                      Biryani & Rice
                    </span>
                    <span className="bg-slate-100 text-[#4A5D54] text-[9.5px] font-semibold px-2.5 py-1 rounded-full shrink-0">
                      Breads
                    </span>
                  </div>

                  {/* Food Menu Items List */}
                  <div className="flex-1 p-2.5 space-y-2 overflow-y-auto">
                    {/* Item 1: Paneer Tikka Angara */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="w-3 h-3 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[11.5px] leading-tight">Paneer Tikka Angara</h4>
                            <span className="text-[7.5px] font-bold uppercase tracking-wider bg-[#E8783C]/10 text-[#E8783C] px-1.5 py-0.2 rounded border border-[#E8783C]/20">
                              BESTSELLER
                            </span>
                          </div>
                          <p className="text-[9px] text-[#55635B] leading-snug line-clamp-2">
                            Chargrilled cottage cheese marinated in smoked chili paste & mustard oil.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-xs text-[#151C19]">₹385</span>
                        <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-md transition-colors shadow-sm">
                          Add +
                        </button>
                      </div>
                    </div>

                    {/* Item 2: Galouti Kebab */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="w-3 h-3 border border-[#FF5E4D] rounded-[2px] flex items-center justify-center bg-rose-50 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E4D]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[11.5px] leading-tight">Awadhi Galouti Kebab</h4>
                            <span className="text-[7.5px] font-bold uppercase tracking-wider bg-[#151C19]/10 text-[#151C19] px-1.5 py-0.2 rounded border border-[#151C19]/20">
                              CHEF SPECIAL
                            </span>
                          </div>
                          <p className="text-[9px] text-[#55635B] leading-snug line-clamp-2">
                            Melt-in-mouth minced mutton kebabs infused with 16 royal spices & rose water.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-xs text-[#151C19]">₹495</span>
                        <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-md transition-colors shadow-sm">
                          Add +
                        </button>
                      </div>
                    </div>

                    {/* Item 3: Dahi Ke Sholay */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="w-3 h-3 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[11.5px] leading-tight">Dahi Ke Sholay</h4>
                          </div>
                          <p className="text-[9px] text-[#55635B] leading-snug line-clamp-2">
                            Crispy fried bread rolls stuffed with hung curd, coriander, and green chillies.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="font-extrabold text-xs text-[#151C19]">₹320</span>
                        <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[9.5px] font-bold px-2.5 py-0.5 rounded-md transition-colors shadow-sm">
                          Add +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Floating View Order Cart Bar */}
                  <div className="bg-[#151C19] text-white p-2.5 px-3 flex items-center justify-between shrink-0 shadow-lg border-t border-white/10">
                    <div>
                      <p className="text-[8px] font-bold text-white/60 uppercase tracking-wider">Your Order</p>
                      <p className="text-[11px] font-extrabold text-white">2 items • ₹880</p>
                    </div>
                    <button className="bg-[#E8783C] text-white text-[9.5px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      View Cart →
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </PremiumIPhoneMockup>
      </motion.div>
    </div>
  );
}


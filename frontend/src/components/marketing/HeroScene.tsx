import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import PhysicalQRStand from './PhysicalQRStand';
import PremiumIPhoneMockup from './PremiumIPhoneMockup';
import { CheckCircle2, Loader2 } from 'lucide-react';
const heroRestaurantPoster = '/marketing/hero/hero-restaurant-poster.webp';

type HeroStage = 'hidden' | 'entering' | 'aiming' | 'scanning' | 'detected' | 'processing' | 'menu-open';

export default function HeroScene() {
  const [stage, setStage] = useState<HeroStage>('hidden');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      className="relative w-full h-[430px] sm:h-[480px] md:h-[510px] lg:h-[540px] xl:h-[560px] flex items-center justify-center overflow-visible select-none"
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
          fetchPriority="high"
        />
      </motion.div>

      {/* Layer 2: Physical QR Stand (Left Foreground) */}
      <motion.div
        style={{ y: qrY }}
        animate={{
          scale: ['aiming', 'scanning', 'detected', 'processing'].includes(stage) ? 1.03 : stage === 'menu-open' ? 0.92 : 1,
          x: stage === 'menu-open' ? (isMobile ? '-46%' : '-52%') : (isMobile ? '-38%' : '-45%'),
          opacity: stage === 'menu-open' ? 0.92 : 1,
          filter: stage === 'menu-open' ? 'blur(0.4px)' : 'blur(0px)',
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <PhysicalQRStand variant={isMobile ? 'compact' : 'standard'} />
      </motion.div>

      {/* Layer 3: Phone Mockup */}
      <motion.div
        style={{ y: phoneY }}
        initial={shouldReduceMotion ? false : { y: '110%', opacity: 0 }}
        animate={
          stage === 'hidden'
            ? { y: '110%', opacity: 0, x: '0%', rotate: 0 }
            : stage === 'entering'
            ? { y: '10%', opacity: 1, x: '0%', rotate: 0 }
            : stage === 'aiming'
            ? { y: '0%', opacity: 1, x: isMobile ? '0%' : '-10%', rotate: isMobile ? 0 : -2 }
            : stage === 'scanning'
            ? { y: '0%', opacity: 1, x: isMobile ? '0%' : '-10%', rotate: isMobile ? 0 : -2 }
            : stage === 'detected'
            ? { y: '0%', opacity: 1, x: isMobile ? '0%' : '-8%', rotate: isMobile ? 0 : -1 }
            : stage === 'processing'
            ? { y: '0%', opacity: 1, x: isMobile ? '0%' : '-4%', rotate: 0 }
            : { y: '0%', opacity: 1, x: isMobile ? '0%' : '18%', rotate: 0 }
        }
        transition={{ duration: shouldReduceMotion ? 0 : 1.1, type: 'spring', stiffness: 55, damping: 16 }}
        className="absolute bottom-[2%] sm:bottom-[3%] md:bottom-[3.5%] lg:bottom-[4%] left-1/2 -translate-x-1/2 z-20 origin-bottom"
      >
        <PremiumIPhoneMockup
          className="w-[190px] sm:w-[208px] md:w-[220px] lg:w-[232px] xl:w-[244px]"
          statusBarTheme="light"
          statusBarMode="overlay"
          badgeText="Live Digital Menu"
        >
          {/* Screen Content: Scan Camera Mode vs Customer Menu */}
          <div className="relative w-full h-full flex flex-col font-sans">
            <AnimatePresence mode="wait">
              {['entering', 'aiming', 'scanning', 'detected', 'processing'].includes(stage) ? (
                /* CAMERA UI SCANNING SCREEN */
                <motion.div
                  key="camera-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-[#151C19] flex flex-col justify-between p-4 pt-[46px] z-20"
                >
                  {/* Blurred Camera Feed Background */}
                  <div className="absolute inset-0 opacity-30">
                    <img src={heroRestaurantPoster} alt="" className="w-full h-full object-cover blur-sm scale-110" decoding="async" />
                  </div>

                  {/* Viewfinder Center */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-3">
                    <motion.div
                      animate={{
                        borderColor: stage === 'detected' ? '#34B56A' : 'rgba(255,255,255,0.4)',
                        scale: stage === 'detected' ? 1.04 : 1,
                      }}
                      className="relative w-40 h-40 border-2 border-white/40 rounded-2xl flex items-center justify-center backdrop-blur-sm bg-white/10 transition-colors overflow-hidden"
                    >
                      {/* Viewfinder Corners */}
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-xl z-20 pointer-events-none" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-xl z-20 pointer-events-none" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-xl z-20 pointer-events-none" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-xl z-20 pointer-events-none" />

                      {/* Live Camera View of Physical QR Stand being scanned */}
                      <div className="absolute inset-0 flex items-center justify-center scale-[0.48] translate-y-3 pointer-events-none opacity-90">
                        <PhysicalQRStand tableNumber="TABLE 12" variant="compact" />
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
                          className="relative z-40 bg-[#34B56A] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5"
                        >
                          {stage === 'processing' ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                          <span>{stage === 'processing' ? 'Opening...' : 'QR Detected'}</span>
                        </motion.div>
                      )}
                    </motion.div>

                    <p className="mt-5 text-[11px] text-white/80 font-medium text-center">
                      Point at menu QR to order
                    </p>
                  </div>

                  {/* Shutter Button Mock */}
                  <div className="relative z-10 pb-2 flex justify-center">
                    <div className="w-11 h-11 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white" />
                    </div>
                  </div>
                </motion.div>
              ) : stage === 'menu-open' ? (
                /* MENUSQR CUSTOMER MENU SCREEN (Authentic High-Fidelity Dining Experience) */
                <motion.div
                  key="menu-mode"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="relative w-full h-full flex flex-col font-sans bg-[#FBF9F5] text-left overflow-hidden"
                >
                  {/* Restaurant Header */}
                  <div className="bg-gradient-to-b from-[#111915] via-[#17231E] to-[#1E2B25] text-white px-3.5 pt-[42px] pb-2.5 shrink-0 relative border-b border-white/10 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8783C] to-[#B8501E] text-white flex items-center justify-center font-serif font-black text-[10.5px] shadow-md border border-white/20 shrink-0">
                          MT
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-[12.5px] tracking-tight leading-tight text-white truncate">
                            Mannat Tandoori
                          </h3>
                          <p className="text-[7.5px] text-[#F1A679] font-mono font-bold tracking-wider uppercase mt-0.5 truncate">
                            AWADHI & CLAY TANDOOR • TABLE 12
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A] animate-pulse" />
                        <span className="text-[7px] font-bold text-emerald-300 uppercase tracking-wide">Live</span>
                      </span>
                    </div>

                    {/* Dining Mode & Timings Status */}
                    <div className="flex items-center justify-between text-[7px] text-white/70 pt-1 border-t border-white/10 font-medium">
                      <span>Dine-In • Table 12</span>
                      <span>• Charcoal Clay Roast</span>
                      <span className="text-emerald-400 font-semibold">Ready to Order</span>
                    </div>
                  </div>

                  {/* Category Navigation Pills */}
                  <div className="bg-white border-b border-stone-200/80 px-2.5 py-1.5 flex gap-1.5 shrink-0 overflow-x-auto scrollbar-none shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                    <span className="bg-[#E8783C] text-white text-[8px] font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
                      Tandoor
                    </span>
                    <span className="bg-stone-100 text-[#3A4A41] text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                      Signature Curries
                    </span>
                    <span className="bg-stone-100 text-[#3A4A41] text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                      Dum Biryani
                    </span>
                    <span className="bg-stone-100 text-[#3A4A41] text-[8px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                      Breads & Sides
                    </span>
                  </div>

                  {/* Food Menu Items List with Authentic Photography */}
                  <div className="flex-1 p-2 space-y-1.5 overflow-y-auto scrollbar-none">
                    {/* Item 1: Tandoori Malai Chaap */}
                    <div className="bg-white p-2 rounded-xl border border-stone-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex gap-2 hover:border-[#E8783C]/40 transition-colors">
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="w-2.5 h-2.5 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0" title="Vegetarian">
                              <span className="w-1 h-1 rounded-full bg-[#34B56A]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[10px] leading-tight truncate">Tandoori Malai Chaap</h4>
                            <span className="text-[6px] font-extrabold uppercase tracking-wider bg-[#E8783C]/10 text-[#E8783C] px-1 py-0.2 rounded border border-[#E8783C]/25">
                              BESTSELLER
                            </span>
                          </div>
                          <p className="text-[7.5px] text-[#616E67] leading-relaxed line-clamp-2">
                            Charcoal-roasted soy chaap in cardamom cream, hung curd & roasted cashews.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-stone-100">
                          <span className="font-extrabold text-[10.5px] text-[#151C19]">₹280</span>
                          <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                            + Add
                          </button>
                        </div>
                      </div>
                      <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200/80 shadow-xs relative">
                        <img
                          src="/uploads/mannat/hero_chaap.webp"
                          alt="Tandoori Malai Chaap"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/img/photos/photo-1567188040759-fb8a883dc6d8-w200.webp';
                          }}
                          decoding="async"
                          width={755}
                          height={480}
                        />
                      </div>
                    </div>

                    {/* Item 2: Butter Chicken Royale */}
                    <div className="bg-white p-2 rounded-xl border border-stone-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex gap-2 hover:border-[#E8783C]/40 transition-colors">
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="w-2.5 h-2.5 border border-[#E11D48] rounded-[2px] flex items-center justify-center bg-rose-50 shrink-0" title="Non-Vegetarian">
                              <span className="w-1 h-1 rounded-full bg-[#E11D48]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[10px] leading-tight truncate">Murgh Makhani Royale</h4>
                            <span className="text-[6px] font-extrabold uppercase tracking-wider bg-[#D4AF37]/15 text-[#9E7A18] px-1 py-0.2 rounded border border-[#D4AF37]/30">
                              CHEF SPECIAL
                            </span>
                          </div>
                          <p className="text-[7.5px] text-[#616E67] leading-relaxed line-clamp-2">
                            Slow-simmered chicken in velvet San Marzano tomato reduction & fresh white butter.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-stone-100">
                          <span className="font-extrabold text-[10.5px] text-[#151C19]">₹380</span>
                          <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                            + Add
                          </button>
                        </div>
                      </div>
                      <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200/80 shadow-xs relative">
                        <img
                          src="/img/photos/photo-1588166524941-3bf61a9c41db-w200.webp"
                          alt="Murgh Makhani Royale"
                          className="w-full h-full object-cover"
                          decoding="async"
                          width={200}
                          height={302}
                        />
                      </div>
                    </div>

                    {/* Item 3: Dal Makhani Dum Pukht */}
                    <div className="bg-white p-2 rounded-xl border border-stone-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex gap-2 hover:border-[#E8783C]/40 transition-colors">
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <span className="w-2.5 h-2.5 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0" title="Vegetarian">
                              <span className="w-1 h-1 rounded-full bg-[#34B56A]" />
                            </span>
                            <h4 className="font-bold text-[#151C19] text-[10px] leading-tight truncate">Dal Makhani Dum Pukht</h4>
                            <span className="text-[6px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-600 px-1 py-0.2 rounded">
                              SLOW COOKED
                            </span>
                          </div>
                          <p className="text-[7.5px] text-[#616E67] leading-relaxed line-clamp-2">
                            24-hr charcoal-simmered black urad lentils finished with churned butter & fenugreek.
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 mt-1 border-t border-stone-100">
                          <span className="font-extrabold text-[10.5px] text-[#151C19]">₹290</span>
                          <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                            + Add
                          </button>
                        </div>
                      </div>
                      <div className="w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200/80 shadow-xs relative">
                        <img
                          src="/img/photos/photo-1546833999-b9f581a1996d-w200.webp"
                          alt="Dal Makhani"
                          className="w-full h-full object-cover"
                          decoding="async"
                          width={200}
                          height={133}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Restrained Bottom Cart Bar */}
                  <div className="bg-[#111915] text-white p-2 px-3 flex items-center justify-between shrink-0 shadow-lg border-t border-white/10 mb-1">
                    <div>
                      <p className="text-[6.5px] font-bold text-[#F1A679] uppercase tracking-wider">YOUR ORDER</p>
                      <p className="text-[9.5px] font-extrabold text-white">2 items • ₹660</p>
                    </div>
                    <button className="bg-[#E8783C] hover:bg-[#F1A679] text-white text-[8px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors active:scale-95">
                      <span>View Order</span>
                      <span>→</span>
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

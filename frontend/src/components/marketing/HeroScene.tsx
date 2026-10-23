import { useEffect, useState, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import PhysicalQRStand from './PhysicalQRStand';
import PremiumIPhoneMockup from './PremiumIPhoneMockup';
const heroRestaurantPoster = '/marketing/hero/hero-restaurant-poster.webp';

export default function HeroScene() {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-40px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[470px] sm:h-[530px] md:h-[570px] lg:h-[600px] xl:h-[620px] flex items-end justify-center overflow-visible select-none pb-2 sm:pb-3 lg:pb-4"
    >
      {/* Background Layer: Real Restaurant Table Environment with soft radial glow edge */}
      <div 
        style={{ 
          maskImage: 'radial-gradient(ellipse at 55% 55%, black 35%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 55% 55%, black 35%, transparent 72%)'
        }}
        className="absolute inset-0 w-[115%] h-[115%] -top-[8%] -left-[8%] pointer-events-none z-0"
      >
        <img
          src={heroRestaurantPoster}
          alt="Restaurant background atmosphere"
          className="w-full h-full object-cover filter brightness-[0.88] contrast-[1.08] scale-105"
          loading="eager"
        />
      </div>

      {/* Shared Grounding Plane / Table Horizon Glow */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0E1512]/20 via-[#0E1512]/5 to-transparent pointer-events-none z-0" />

      {/* Layer 2: Physical Tabletop QR Stand (follows phone with short delay, settles beside phone) */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: -24, y: 24, scale: 0.95 }}
        animate={
          isInView
            ? { opacity: 1, x: 0, y: 0, scale: 1 }
            : { opacity: 0, x: -24, y: 24, scale: 0.95 }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.7,
          delay: shouldReduceMotion ? 0 : 0.52,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`absolute ${
          isMobile
            ? 'left-[4%] sm:left-[10%] bottom-2 z-10'
            : 'left-[8%] sm:left-[14%] md:left-[18%] lg:left-[20%] xl:left-[22%] bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 z-10'
        }`}
      >
        <PhysicalQRStand variant={isMobile ? 'compact' : 'standard'} />
      </motion.div>

      {/* Layer 3: Phone Mockup with Live Restaurant Customer Menu (visibly enters from right / rises into place) */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, x: 38, y: 38, scale: 0.96 }}
        animate={
          isInView
            ? { opacity: 1, x: 0, y: 0, scale: 1 }
            : { opacity: 0, x: 38, y: 38, scale: 0.96 }
        }
        transition={{
          duration: shouldReduceMotion ? 0 : 0.75,
          delay: shouldReduceMotion ? 0 : 0.32,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={`absolute ${
          isMobile
            ? 'left-[38%] bottom-2 z-20'
            : 'left-[44%] sm:left-[48%] md:left-[51%] lg:left-[53%] xl:left-[55%] bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 z-20'
        }`}
      >
        <PremiumIPhoneMockup
          className="w-[210px] sm:w-[230px] md:w-[245px] lg:w-[258px] xl:w-[268px]"
          statusBarTheme="light"
          statusBarMode="overlay"
          badgeText="Live Digital Menu"
        >
          {/* MenusQR Customer Menu Screen */}
          <div className="relative w-full h-full flex flex-col font-sans bg-[#FAF8F5] text-left overflow-hidden">
            {/* Restaurant Header */}
            <div className="bg-gradient-to-b from-[#131C18] to-[#1E2B24] text-white px-3.5 pt-[44px] pb-2.5 shrink-0 relative border-b border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8783C] to-[#C96028] text-white flex items-center justify-center font-serif font-black text-[11px] shadow-md border border-white/20">
                    RH
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[13px] tracking-tight leading-none text-white">Royal Haveli</h3>
                    <p className="text-[8px] text-[#F1A679] font-mono font-bold tracking-wider uppercase mt-0.5">
                      AWADHI & MUGHLAI • TABLE 12
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A] animate-pulse" />
                  <span className="text-[7.5px] font-bold text-emerald-300 uppercase tracking-wide">Live</span>
                </span>
              </div>

              {/* Quality badge line */}
              <div className="flex items-center justify-between text-[7.5px] text-white/65 pt-1 border-t border-white/10 font-medium">
                <span>Dine-In • Table 12</span>
                <span>• Charcoal Clay Roast</span>
                <span className="text-emerald-400 font-semibold">Open Now</span>
              </div>
            </div>

            {/* Category Navigation Pills */}
            <div className="bg-white border-b border-stone-200/80 px-2.5 py-1.5 flex gap-1.5 shrink-0 overflow-x-auto scrollbar-none shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <span className="bg-[#E8783C] text-white text-[8.5px] font-bold px-2.5 py-0.5 rounded-full shrink-0 shadow-xs">
                Starters
              </span>
              <span className="bg-stone-100 text-[#3A4A41] text-[8.5px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                Royal Curries
              </span>
              <span className="bg-stone-100 text-[#3A4A41] text-[8.5px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                Dum Biryani
              </span>
              <span className="bg-stone-100 text-[#3A4A41] text-[8.5px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                Tandoor
              </span>
            </div>

            {/* Food Menu Items List */}
            <div className="flex-1 p-2 space-y-1.5 overflow-y-auto scrollbar-none">
              {/* Item 1: Paneer Tikka Angara */}
              <div className="bg-white p-2 rounded-xl border border-stone-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 hover:border-[#E8783C]/40 transition-colors">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="w-2.5 h-2.5 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0" title="Vegetarian">
                        <span className="w-1 h-1 rounded-full bg-[#34B56A]" />
                      </span>
                      <h4 className="font-bold text-[#151C19] text-[10.5px] leading-tight">Paneer Tikka Angara</h4>
                      <span className="text-[6.5px] font-extrabold uppercase tracking-wider bg-[#E8783C]/10 text-[#E8783C] px-1 py-0.2 rounded border border-[#E8783C]/20">
                        BESTSELLER
                      </span>
                    </div>
                    <p className="text-[8px] text-[#616E67] leading-relaxed line-clamp-2">
                      Charcoal-smoked organic paneer in Mathania chili paste, hung curd & cold-pressed mustard oil.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="font-extrabold text-[11px] text-[#151C19]">₹385</span>
                  <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                    + Add
                  </button>
                </div>
              </div>

              {/* Item 2: Galouti Kebab */}
              <div className="bg-white p-2 rounded-xl border border-stone-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 hover:border-[#E8783C]/40 transition-colors">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="w-2.5 h-2.5 border border-[#E11D48] rounded-[2px] flex items-center justify-center bg-rose-50 shrink-0" title="Non-Vegetarian">
                        <span className="w-1 h-1 rounded-full bg-[#E11D48]" />
                      </span>
                      <h4 className="font-bold text-[#151C19] text-[10.5px] leading-tight">Awadhi Galouti Kebab</h4>
                      <span className="text-[6.5px] font-extrabold uppercase tracking-wider bg-[#D4AF37]/15 text-[#9E7A18] px-1 py-0.2 rounded border border-[#D4AF37]/30">
                        CHEF SPECIAL
                      </span>
                    </div>
                    <p className="text-[8px] text-[#616E67] leading-relaxed line-clamp-2">
                      Melt-in-mouth minced mutton kebabs infused with 16 royal potli spices, rose water & clove smoke.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="font-extrabold text-[11px] text-[#151C19]">₹495</span>
                  <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                    + Add
                  </button>
                </div>
              </div>

              {/* Item 3: Dal Makhani Haveli */}
              <div className="bg-white p-2 rounded-xl border border-stone-200/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-1 hover:border-[#E8783C]/40 transition-colors">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2.5 h-2.5 border border-[#34B56A] rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0" title="Vegetarian">
                        <span className="w-1 h-1 rounded-full bg-[#34B56A]" />
                      </span>
                      <h4 className="font-bold text-[#151C19] text-[10.5px] leading-tight">Dal Makhani Haveli</h4>
                      <span className="text-[6.5px] font-extrabold uppercase tracking-wider bg-stone-100 text-stone-600 px-1 py-0.2 rounded">
                        SLOW COOKED
                      </span>
                    </div>
                    <p className="text-[8px] text-[#616E67] leading-relaxed line-clamp-2">
                      Overnight charcoal-simmered black urad lentils, slow-cooked with fresh white butter & cream.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  <span className="font-extrabold text-[11px] text-[#151C19]">₹345</span>
                  <button className="bg-[#151C19] hover:bg-[#E8783C] text-white text-[8.5px] font-bold px-2 py-0.5 rounded-md transition-colors shadow-xs active:scale-95">
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Restrained Bottom Cart Bar */}
            <div className="bg-[#151C19] text-white p-2 px-3 flex items-center justify-between shrink-0 shadow-lg border-t border-white/10 mb-1">
              <div>
                <p className="text-[7px] font-bold text-[#F1A679] uppercase tracking-wider">YOUR ORDER</p>
                <p className="text-[10px] font-extrabold text-white">2 items • ₹880</p>
              </div>
              <button className="bg-[#E8783C] hover:bg-[#F1A679] text-white text-[8.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs transition-colors active:scale-95">
                <span>View Order</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </PremiumIPhoneMockup>
      </motion.div>
    </div>
  );
}

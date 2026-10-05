import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import HeroRestaurantVideo from './HeroRestaurantVideo';
import HeroQRStand from './HeroQRStand';
import HeroPhone from './HeroPhone';
import HeroScanSequence from './HeroScanSequence';
import HeroMenuPreview from './HeroMenuPreview';

type HeroStage = 'idle' | 'approaching' | 'scanning' | 'detected' | 'menu-open' | 'menu-scroll' | 'menu-update' | 'same-qr';

export default function HeroScene() {
  const [stage, setStage] = useState<HeroStage>('idle');
  const [price, setPrice] = useState(240);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [replayKey, setReplayKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setStage('same-qr');
      setPrice(280);
      return;
    }

    let timer1: NodeJS.Timeout, timer2: NodeJS.Timeout, timer3: NodeJS.Timeout, timer4: NodeJS.Timeout, timer5: NodeJS.Timeout, timer6: NodeJS.Timeout, timer7: NodeJS.Timeout;

    setStage('idle');
    setPrice(240);

    timer1 = setTimeout(() => setStage('approaching'), 1200);
    timer2 = setTimeout(() => setStage('scanning'), 2000);
    timer3 = setTimeout(() => setStage('detected'), 3800);
    timer4 = setTimeout(() => setStage('menu-open'), 4400);
    timer5 = setTimeout(() => setStage('menu-scroll'), 5500); // Scroll down to item
    timer6 = setTimeout(() => {
      setStage('menu-update');
      setTimeout(() => setPrice(280), 800); // Price changes on screen
    }, 7000);
    timer7 = setTimeout(() => setStage('same-qr'), 9000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
    };
  }, [isInView, replayKey, shouldReduceMotion]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[550px] sm:h-[700px] flex items-center justify-center overflow-visible"
    >
      
      {/* Layer 1: Restaurant Video Environment - Masked for seamless blend */}
      <div 
        className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -right-[10%] pointer-events-none"
        style={{
          maskImage: 'radial-gradient(ellipse at 80% 40%, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 80% 40%, black 30%, transparent 70%)'
        }}
      >
        <HeroRestaurantVideo />
      </div>

      {/* Layer 2: Physical QR Stand */}
      <motion.div 
        animate={{ 
          scale: stage === 'approaching' || stage === 'scanning' ? 1.05 : 1,
          x: stage === 'scanning' || stage === 'detected' ? '-80%' : '-40%', 
          y: stage === 'same-qr' ? -10 : 0,
          rotateY: stage === 'scanning' || stage === 'detected' ? 10 : 15,
          rotateX: stage === 'scanning' || stage === 'detected' ? 5 : 8,
          filter: stage === 'menu-open' || stage === 'menu-scroll' || stage === 'menu-update' || stage === 'same-qr' ? 'blur(2px)' : 'blur(0px)',
          opacity: stage === 'menu-open' || stage === 'menu-scroll' || stage === 'menu-update' || stage === 'same-qr' ? 0.9 : 1
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 origin-bottom transform-gpu perspective-[1000px]"
      >
        <HeroQRStand />
      </motion.div>

      {/* Layer 3: Phone Mockup */}
      <motion.div
        initial={shouldReduceMotion ? false : { y: '100%', rotate: 10, opacity: 0 }}
        animate={{ 
          y: stage === 'scanning' || stage === 'detected' ? '10%' : (stage === 'menu-open' || stage === 'menu-scroll' || stage === 'menu-update' || stage === 'same-qr' ? '2%' : '100%'),
          x: stage === 'scanning' || stage === 'detected' ? '30%' : '40%',
          rotate: stage === 'scanning' || stage === 'detected' ? -3 : 0,
          opacity: stage === 'idle' || stage === 'approaching' ? 0 : 1,
          scale: stage === 'menu-open' || stage === 'menu-scroll' || stage === 'menu-update' || stage === 'same-qr' ? 1.05 : 1
        }}
        transition={{ duration: shouldReduceMotion ? 0 : 1.2, type: 'spring', stiffness: 50, damping: 15 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 origin-bottom"
      >
        <HeroPhone>
          <HeroScanSequence stage={stage} />
          <HeroMenuPreview stage={stage} price={price} />
        </HeroPhone>
      </motion.div>
      
      {/* Hint Label during Approaching stage */}
      <AnimatePresence>
        {stage === 'approaching' && !shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-[30%] sm:top-[35%] left-1/2 -translate-x-1/2 z-30"
          >
            <span className="bg-white/90 backdrop-blur-md text-[#151C19] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md border border-white">
              Scan to view menu
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replay Button */}
      <AnimatePresence>
        {stage === 'same-qr' && !shouldReduceMotion && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => setReplayKey(k => k + 1)}
            className="absolute bottom-[20%] right-1/2 translate-x-1/2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white text-[#151C19] px-4 py-2 rounded-full text-[11px] font-bold shadow-sm transition-all border border-slate-200/50"
          >
            <RotateCcw size={12} />
            See the story again
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}



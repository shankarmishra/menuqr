import { motion, useReducedMotion } from 'framer-motion';
import HeroActions from './HeroActions';

export default function HeroCopy() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="max-w-[540px] text-left z-10 w-full">
      {/* 1. Eyebrow Tag */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.5,
          delay: shouldReduceMotion ? 0 : 0.05,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-[#E8783C] text-xs font-bold uppercase tracking-[0.2em] mb-4"
      >
        THE QR MENU THAT NEVER NEEDS REPRINTING
      </motion.div>

      {/* 2. Main Heading Lines */}
      <motion.h1
        initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.65,
          delay: shouldReduceMotion ? 0 : 0.15,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-[clamp(2.5rem,5.55vw,5rem)] font-extrabold leading-[1.05] tracking-normal mb-6 w-full max-w-[540px]"
      >
        <span className="block text-[#151C19]">Your menu</span>
        <span className="block text-[#151C19]">changes.</span>
        <span className="block text-[#E8783C]">Your QR code</span>
        <span className="block text-[#E8783C]">doesn&apos;t.</span>
      </motion.h1>

      {/* 3. Supporting Text */}
      <motion.p
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.6,
          delay: shouldReduceMotion ? 0 : 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="text-lg sm:text-xl text-[#626776] max-w-[480px] leading-[1.6] mb-8 font-medium"
      >
        Create your digital menu once, print your QR once, and update everything behind it anytime.
      </motion.p>

      {/* 4. Action CTAs */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.55,
          delay: shouldReduceMotion ? 0 : 0.7,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <HeroActions />
      </motion.div>
    </div>
  );
}

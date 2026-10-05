import { motion } from 'framer-motion';
import HeroActions from './HeroActions';

const staggerContainer: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

export default function HeroCopy() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-[540px] text-left z-10 w-full"
    >
      <motion.div variants={itemVariants} className="text-[#E8783C] text-xs font-bold uppercase tracking-[0.2em] mb-4">
        THE QR MENU THAT NEVER NEEDS REPRINTING
      </motion.div>

      <motion.h1 variants={itemVariants} className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold text-[#151C19] leading-[0.9] tracking-[-0.04em] mb-6">
        <span className="block">Your menu</span>
        <span className="block">changes.</span>
        <span className="block text-[#E8783C]">Your QR code</span>
        <span className="block text-[#E8783C]">doesn't.</span>
      </motion.h1>

      <motion.p variants={itemVariants} className="text-lg sm:text-xl text-[#626776] max-w-[480px] leading-[1.6] mb-8 font-medium">
        Create your digital menu once, print your QR once, and update everything behind it anytime.
      </motion.p>

      <motion.div variants={itemVariants}>
        <HeroActions />
      </motion.div>
    </motion.div>
  );
}





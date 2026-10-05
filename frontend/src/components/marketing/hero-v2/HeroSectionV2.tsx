import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import HeroScene from './HeroScene';

export default function HeroSectionV2() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-6 text-[#151C19] overflow-hidden border-b border-slate-200/50/50 font-sans">
      
      <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Copy & Hero Headlines */}
        <div className="w-full lg:w-[45%] text-left flex flex-col justify-center order-1">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 lg:mb-6"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E8783C]">
              The QR Menu That Never Needs Reprinting
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[2.6rem] leading-[1.1] sm:text-[3.8rem] lg:text-[4.2rem] font-black lg:leading-[1.05] tracking-tight mb-4 lg:mb-6 text-[#151C19]"
          >
            Your menu changes. <br />
            <span className="text-[#E8783C]">
              Your QR code doesn't.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-lg text-[#626776] max-w-md leading-relaxed mb-6 lg:mb-8 font-normal"
          >
            Create your digital menu once, print your QR once, and update everything behind it anytime.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 mb-8 lg:mb-10"
          >
            <a
              href="#/admin/login"
              className="group relative inline-flex items-center justify-center gap-2 bg-[#E8783C] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:bg-[#151C19] hover:shadow-[0_8px_20px_rgba(232,120,60,0.3)] hover:-translate-y-0.5"
            >
              <span>Create Your Menu</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center text-[#151C19] bg-transparent border-[1.5px] border-[#151C19]/20 px-7 py-3.5 rounded-xl font-bold text-sm transition-all hover:bg-[#151C19]/5 hover:border-[#151C19]/40"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Micro Proof Row (Only visible on desktop here, mobile moved to bottom) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-slate-200/50"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#626776] uppercase tracking-wider">
              <Check size={14} className="text-[#34B56A]" />
              Permanent QR
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#626776] uppercase tracking-wider">
              <Check size={14} className="text-[#34B56A]" />
              Update Anytime
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#626776] uppercase tracking-wider">
              <Check size={14} className="text-[#34B56A]" />
              No Reprint
            </div>
          </motion.div>
        </div>

        {/* Right Side: Cinematic Product Storytelling Scene */}
        <div className="w-full lg:w-[55%] relative order-2 perspective-1000">
          <HeroScene />
          
          {/* Decorative architectural layout line */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b border-r border-slate-300 pointer-events-none opacity-50 hidden lg:block" />
        </div>

        {/* Micro Proof Row for Mobile (Appears at the very bottom) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full flex lg:hidden flex-wrap items-center justify-center gap-x-4 gap-y-3 pt-6 border-t border-slate-200/50 order-3 mt-4"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#626776] uppercase tracking-wider">
            <Check size={14} className="text-[#34B56A]" />
            Permanent QR
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#626776] uppercase tracking-wider">
            <Check size={14} className="text-[#34B56A]" />
            Update Anytime
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#626776] uppercase tracking-wider">
            <Check size={14} className="text-[#34B56A]" />
            No Reprint
          </div>
        </motion.div>

      </div>
    </section>
  );
}



import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="text-[2.5rem] md:text-[4rem] font-bold text-white leading-tight tracking-tight max-w-4xl mb-6"
      >
        Your menu changes. <br className="hidden md:block"/> Your QR doesn't.
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
        className="text-lg md:text-[1.125rem] text-[#aab7b2] max-w-2xl mb-10"
      >
        The premium digital menu platform that bridges the physical table with an instantly updatable digital experience.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <a href="#/admin/login" className="bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block">
          Create Your Menu
        </a>
        <a href="#how-it-works" className="bg-transparent border border-[#aab7b2]/30 hover:border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block">
          See How It Works
        </a>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="mt-20 w-full max-w-5xl aspect-video bg-[#1d2723] rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative shadow-2xl shadow-[#e8783c]/5"
      >
        <div className="text-[#aab7b2] flex flex-col items-center gap-4">
          <div className="w-24 h-24 border-4 border-dashed border-[#aab7b2]/50 rounded-xl flex items-center justify-center">QR</div>
          <p>Cinematic QR Sequence Placeholder</p>
        </div>
      </motion.div>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Search, Sparkles, Utensils, CheckCircle2, ArrowRight } from 'lucide-react';
import IPhoneMockup from './IPhoneMockup';

const SAMPLE_DISHES = [
  { id: '1', name: 'Truffle Mushroom Risotto', category: 'Mains', price: '₹480', isVeg: true, tag: 'Chef Special', image: '🍄' },
  { id: '2', name: 'Smoked Woodfire Pizza', category: 'Pizza', price: '₹520', isVeg: false, tag: 'Bestseller', image: '🍕' },
  { id: '3', name: 'Artisanal Cold Brew', category: 'Beverages', price: '₹220', isVeg: true, tag: 'Popular', image: '☕' },
  { id: '4', name: 'Belgian Chocolate Lava', category: 'Desserts', price: '₹340', isVeg: true, tag: 'Sweet Finish', image: '🍫' },
];

export default function HeroSection() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [scanStep, setScanStep] = useState<'scanning' | 'locked' | 'live'>('scanning');

  useEffect(() => {
    const timer1 = setTimeout(() => setScanStep('locked'), 2500);
    const timer2 = setTimeout(() => setScanStep('live'), 4200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-6 max-w-[1240px] mx-auto overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8783c]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Editorial Copy */}
        <div className="lg:col-span-6 text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d2723] border border-[#e8783c]/30 text-[#e8783c] text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Sparkles size={14} />
            <span>Next-Gen Restaurant Tech</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6"
          >
            Your menu changes. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8783c] via-[#ffc928] to-white">
              Your QR doesn't.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#aab7b2] max-w-xl leading-relaxed mb-8"
          >
            Bridge your physical restaurant tables with a dynamic, lightning-fast digital menu. Update prices, sold-out items, and specials in seconds without reprinting a single QR code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <a
              href="#/admin/login"
              className="inline-flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-7 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-[#e8783c]/20 hover:scale-[1.02]"
            >
              <span>Create Your Menu</span>
              <ArrowRight size={18} />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center bg-[#1d2723] hover:bg-white/10 text-white border border-white/15 px-7 py-4 rounded-xl font-semibold text-base transition-all"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left"
          >
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-[#aab7b2]">Permanent QR</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#e8783c]">0.2s</p>
              <p className="text-xs text-[#aab7b2]">Menu Scan Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#ffc928]">0</p>
              <p className="text-xs text-[#aab7b2]">App Download Required</p>
            </div>
          </motion.div>
        </div>

        {/* Right Hero Interactive Scene (Physical Table + QR + iPhone Mockup) */}
        <div className="lg:col-span-6 relative z-10 flex justify-center">
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl bg-gradient-to-b from-[#1d2723] to-[#151c19] border border-white/10 p-6 flex flex-col justify-between overflow-hidden shadow-2xl shadow-black/80">
            {/* Background Texture Simulation (Wooden Table Surface) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top Scene Label */}
            <div className="relative z-10 flex justify-between items-center bg-[#151c19]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold text-white">Table #04 • Live Menu</span>
              </div>
              <span className="text-[10px] text-[#ffc928] font-mono uppercase bg-[#ffc928]/10 px-2 py-0.5 rounded border border-[#ffc928]/20">
                {scanStep === 'scanning' ? 'Scanning QR...' : scanStep === 'locked' ? 'QR Verified' : 'Menu Active'}
              </span>
            </div>

            {/* Center Stage: Scanning Beam Animation to Phone Transition */}
            <div className="relative my-auto py-4 flex flex-col items-center justify-center">
              {/* Scan Beam Container */}
              <AnimatePresence mode="wait">
                {scanStep !== 'live' ? (
                  <motion.div
                    key="qr-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative w-48 h-48 rounded-2xl bg-white p-4 flex flex-col items-center justify-center shadow-2xl border-4 border-[#e8783c]"
                  >
                    <QrCode size={110} className="text-[#151c19]" />
                    <span className="mt-2 text-[10px] font-bold text-[#151c19] uppercase tracking-widest">
                      MENUQR #T4
                    </span>

                    {/* Animated Scanning Beam */}
                    <motion.div
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#e8783c] to-transparent shadow-[0_0_15px_#e8783c]"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone-live"
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <IPhoneMockup badgeText="Live Menu">
                      {/* Realistic Customer Menu Inside Phone */}
                      <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div>
                            <h3 className="font-bold text-sm text-white">Grand Cafe & Bistro</h3>
                            <p className="text-[10px] text-[#aab7b2]">Table #04 • Digital Menu</p>
                          </div>
                          <Utensils size={16} className="text-[#e8783c]" />
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                          <Search size={12} className="absolute left-3 top-2.5 text-white/40" />
                          <input
                            type="text"
                            readOnly
                            placeholder="Search dishes..."
                            className="w-full bg-[#1d2723] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none"
                          />
                        </div>

                        {/* Categories */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                          {['All', 'Mains', 'Pizza', 'Beverages'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors whitespace-nowrap ${
                                activeCategory === cat
                                  ? 'bg-[#e8783c] text-white border-[#e8783c]'
                                  : 'bg-[#1d2723] text-[#aab7b2] border-white/10'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Food Items List */}
                        <div className="space-y-2.5">
                          {SAMPLE_DISHES.filter(
                            (d) => activeCategory === 'All' || d.category === activeCategory
                          ).map((dish) => (
                            <div
                              key={dish.id}
                              className="p-2.5 rounded-xl bg-[#1d2723]/90 border border-white/10 flex items-center justify-between hover:border-[#e8783c]/50 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{dish.image}</span>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-white">
                                      {dish.name}
                                    </span>
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        dish.isVeg ? 'bg-[#34b56a]' : 'bg-[#ff5e4d]'
                                      }`}
                                    />
                                  </div>
                                  <span className="text-[9px] text-[#ffc928] bg-[#ffc928]/10 px-1.5 py-0.2 rounded border border-[#ffc928]/20">
                                    {dish.tag}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-white">{dish.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </IPhoneMockup>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Status Card */}
            <div className="relative z-10 bg-[#151c19]/90 p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#34b56a]" />
                <span className="text-white font-medium text-[11px]">Instant Scan Active</span>
              </div>
              <button
                onClick={() => setScanStep(scanStep === 'live' ? 'scanning' : 'live')}
                className="text-[10px] text-[#e8783c] hover:underline font-semibold"
              >
                {scanStep === 'live' ? 'Re-scan Animation' : 'Skip to Menu'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
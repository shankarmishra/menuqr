import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import {
  QrCode, Sparkles, TrendingUp,
  CheckCircle2, Flame, RefreshCw, ShoppingBag,
  Check, UtensilsCrossed, Plus
} from 'lucide-react';
import PremiumIPhoneMockup from './PremiumIPhoneMockup';

/* ──────────────────────────────────────────────────────────────────────────
   INTERACTIVE LIVE-SYNC SIMULATOR
   "One permanent code. Infinite digital updates."
   Featuring:
   - Compact Premium Light-Theme Owner Dashboard
   - High-End Floating Premium iPhone 16 Pro Mockup (from "Same menu" section)
   - Real-Time Dynamic Pricing, Sold-Out Toggles, Chef's Specials & Theme Shifts
   ────────────────────────────────────────────────────────────────────────── */

interface SimulatorState {
  isPeakPrice: boolean;
  isWingsSoldOut: boolean;
  isChefSpecial: boolean;
  isNightTheme: boolean;
  lastAction: string;
  latencyMs: number;
}

const CATEGORIES = ['All', 'Starters', 'Mains', 'Drinks'];

export default function PhysicalQrSection() {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<string[]>(['dish-1', 'dish-3']);

  // Simulator state controlled by the manager dashboard
  const [simState, setSimState] = useState<SimulatorState>({
    isPeakPrice: false,
    isWingsSoldOut: false,
    isChefSpecial: true,
    isNightTheme: false, // Default to elegant warm daylight bistro theme
    lastAction: 'Initial setup synced',
    latencyMs: 14,
  });

  // Action trigger helper with realistic latency
  const triggerAction = (updater: (prev: SimulatorState) => SimulatorState, actionName: string) => {
    const lat = Math.floor(Math.random() * 8) + 11; // 11ms to 18ms
    setSimState((prev) => ({
      ...updater(prev),
      lastAction: actionName,
      latencyMs: lat,
    }));
    setPulseKey((k) => k + 1);
  };

  const toggleCart = (id: string) => {
    setCartItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Auto-demonstration cycle if visitor doesn't interact
  const autoDemoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoStepRef = useRef(0);

  useEffect(() => {
    if (isHovered || prefersReducedMotion) return;

    autoDemoTimer.current = setInterval(() => {
      demoStepRef.current = (demoStepRef.current + 1) % 4;
      if (demoStepRef.current === 0) {
        triggerAction(
          (s) => ({ ...s, isPeakPrice: !s.isPeakPrice }),
          'Peak Price Surge (+₹50)'
        );
      } else if (demoStepRef.current === 1) {
        triggerAction(
          (s) => ({ ...s, isWingsSoldOut: !s.isWingsSoldOut }),
          simState.isWingsSoldOut ? 'Wings Restocked In-Menu' : 'Kitchen 86’d: Wings Sold Out'
        );
      } else if (demoStepRef.current === 2) {
        triggerAction(
          (s) => ({ ...s, isChefSpecial: !s.isChefSpecial }),
          'Chef’s Daily Special Pushed'
        );
      } else {
        triggerAction(
          (s) => ({ ...s, isNightTheme: !s.isNightTheme }),
          'Menu Ambience Shift Pushed'
        );
      }
    }, 4500);

    return () => {
      if (autoDemoTimer.current) clearInterval(autoDemoTimer.current);
    };
  }, [isHovered, prefersReducedMotion, simState.isWingsSoldOut]);

  // Dynamic theme colors inside phone
  const theme = simState.isNightTheme
    ? {
        bg: '#0E1612',
        surface: '#15221B',
        text: '#F5EBDD',
        subtext: 'rgba(245, 235, 221, 0.65)',
        border: 'rgba(215, 182, 109, 0.25)',
        accent: '#E8783C',
        gold: '#F1D99D',
      }
    : {
        bg: '#FAF8F5',
        surface: '#FFFFFF',
        text: '#1A2B24',
        subtext: '#687770',
        border: 'rgba(26, 43, 36, 0.1)',
        accent: '#E8783C',
        gold: '#D97706',
      };

  return (
    <MotionConfig reducedMotion="user">
      <section className="py-16 md:py-24 bg-[#F6F6F2] relative overflow-hidden">
        {/* Subtle noise and ambient backdrops */}
        <div className="absolute inset-0 texture-fine-noise pointer-events-none opacity-[0.12]" />
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#E8783C]/7 to-transparent rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#1A2B24]/6 to-transparent rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-[1340px] mx-auto px-5 sm:px-8 md:px-12 relative z-10">

          {/* ── Section Header ── */}
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-[#1A2B24] text-[11px] font-black uppercase tracking-widest mb-5 shadow-sm border border-black/6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34B56A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34B56A]" />
              </span>
              <span>Interactive Live-Sync Simulator</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-3xl sm:text-4xl md:text-[54px] font-extrabold text-[#1A2B24] tracking-tight leading-[1.1]"
            >
              One permanent code.{' '}
              <span className="text-[#E8783C] italic font-serif font-normal block sm:inline">
                Infinite digital updates.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-gray-600 text-base md:text-lg mt-4 leading-relaxed font-medium"
            >
              Click any control on the manager deck to test live updates. Watch the guest's phone update in real time with <strong className="text-[#1A2B24] font-bold">zero reprint costs</strong>.
            </motion.p>
          </div>

          {/* ── Main Simulator Sandbox (2 Columns) ── */}
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >

            {/* ══════════════════════════════════════════════════════════
                LEFT: COMPACT PREMIUM LIGHT-THEME OWNER DASHBOARD
               ══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="bg-white/95 backdrop-blur-md border border-[#1A2B24]/10 rounded-[2rem] p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(26,43,36,0.08)] relative overflow-hidden">

                {/* Dashboard Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#E8783C]/10 flex items-center justify-center text-[#E8783C] shrink-0">
                      <QrCode size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-black text-[#1A2B24] tracking-tight">Manager Control Deck</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#34B56A]/15 text-[#16803C]">
                          LIVE
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium">Broadcasting to Table #12 Placard</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block">Latency</span>
                    <span className="text-[11px] font-mono font-black text-[#E8783C] flex items-center justify-end gap-0.5">
                      <Sparkles size={10} /> {simState.latencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Micro Action Controls Header */}
                <div className="my-3.5 flex items-center justify-between text-[11px] font-bold text-gray-500 px-1">
                  <span>Interactive Live Actions:</span>
                  <span className="text-[9px] font-black text-[#E8783C] uppercase tracking-wider">Click to Test</span>
                </div>

                {/* Compact Interactive Controls */}
                <div className="space-y-2.5">

                  {/* 1. Dynamic Pricing Toggle */}
                  <div
                    onClick={() => triggerAction(
                      (s) => ({ ...s, isPeakPrice: !s.isPeakPrice }),
                      simState.isPeakPrice ? 'Reset: Truffle Fries ₹299' : 'Surge: Truffle Fries ₹349'
                    )}
                    className={`cursor-pointer rounded-xl p-3 transition-all duration-300 border flex items-center justify-between group ${
                      simState.isPeakPrice
                        ? 'bg-[#E8783C]/8 border-[#E8783C]/40 shadow-sm'
                        : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        simState.isPeakPrice ? 'bg-[#E8783C] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        <TrendingUp size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-[#1A2B24]">Peak Hour Surge</span>
                          {simState.isPeakPrice && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#E8783C] text-white">
                              +₹50
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Truffle Fries: ₹299 ➔ ₹349</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                        simState.isPeakPrice
                          ? 'bg-[#E8783C] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 group-hover:border-gray-300'
                      }`}
                    >
                      {simState.isPeakPrice ? 'Revert ₹299' : 'Apply +₹50'}
                    </button>
                  </div>

                  {/* 2. 86 / Sold Out Item Toggle */}
                  <div
                    onClick={() => triggerAction(
                      (s) => ({ ...s, isWingsSoldOut: !s.isWingsSoldOut }),
                      simState.isWingsSoldOut ? 'Restocked: Spicy Wings Available' : 'Sold Out: Spicy Wings 86’d'
                    )}
                    className={`cursor-pointer rounded-xl p-3 transition-all duration-300 border flex items-center justify-between group ${
                      simState.isWingsSoldOut
                        ? 'bg-[#EF4444]/8 border-[#EF4444]/40 shadow-sm'
                        : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        simState.isWingsSoldOut ? 'bg-[#EF4444] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        <RefreshCw size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-[#1A2B24]">Kitchen Stock Alert</span>
                          {simState.isWingsSoldOut && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#EF4444] text-white">
                              86'D
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Spicy Wings: Mark Out of Stock</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                        simState.isWingsSoldOut
                          ? 'bg-[#EF4444] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 group-hover:border-gray-300'
                      }`}
                    >
                      {simState.isWingsSoldOut ? 'Restock' : 'Mark Sold Out'}
                    </button>
                  </div>

                  {/* 3. Daily Chef's Special Promotion */}
                  <div
                    onClick={() => triggerAction(
                      (s) => ({ ...s, isChefSpecial: !s.isChefSpecial }),
                      simState.isChefSpecial ? 'Removed: Chef Special' : 'Promoted: Mushroom Risotto Special'
                    )}
                    className={`cursor-pointer rounded-xl p-3 transition-all duration-300 border flex items-center justify-between group ${
                      simState.isChefSpecial
                        ? 'bg-[#F59E0B]/8 border-[#F59E0B]/40 shadow-sm'
                        : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        simState.isChefSpecial ? 'bg-[#F59E0B] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        <Flame size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-[#1A2B24]">Chef’s Daily Special</span>
                          {simState.isChefSpecial && (
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-[#F59E0B] text-white">
                              PROMOTED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Mushroom Risotto: 15% Off Badge</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all ${
                        simState.isChefSpecial
                          ? 'bg-[#F59E0B] text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-200 group-hover:border-gray-300'
                      }`}
                    >
                      {simState.isChefSpecial ? 'Remove' : 'Promote'}
                    </button>
                  </div>

                  {/* 4. Dinner Luxury Ambience Shift */}
                  <div
                    onClick={() => triggerAction(
                      (s) => ({ ...s, isNightTheme: !s.isNightTheme }),
                      simState.isNightTheme ? 'Switched to Bistro Light' : 'Switched to Royal Noir Theme'
                    )}
                    className={`cursor-pointer rounded-xl p-3 transition-all duration-300 border flex items-center justify-between group ${
                      simState.isNightTheme
                        ? 'bg-[#1A2B24]/8 border-[#1A2B24]/30 shadow-sm'
                        : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                        simState.isNightTheme ? 'bg-[#1A2B24] text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
                      }`}>
                        <Sparkles size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-extrabold text-[#1A2B24]">Menu Theme Ambience</span>
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-gray-200 text-gray-700">
                            {simState.isNightTheme ? 'ROYAL NOIR' : 'BISTRO LIGHT'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium">Toggle between day & evening palette</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-white text-gray-700 border border-gray-200 group-hover:border-gray-300 shadow-sm"
                    >
                      {simState.isNightTheme ? 'Day Mode' : 'Night Mode'}
                    </button>
                  </div>

                </div>

                {/* Compact Bottom Proof Metric Strip */}
                <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#34B56A]" />
                    <span><strong className="text-[#1A2B24]">₹0</strong> Reprint Cost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#34B56A]" />
                    <span><strong className="text-[#1A2B24]">0-Sec</strong> Turnaround</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#34B56A]" />
                    <span><strong className="text-[#1A2B24]">1 QR</strong> Forever</span>
                  </div>
                </div>

              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RIGHT: PREMIUM IPHONE 16 PRO MOCKUP (SAME AS "SAME MENU" SECTION)
               ══════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative perspective-[1000px] py-4">

              {/* Data stream sync toast that triggers on every click */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={pulseKey}
                  initial={{ opacity: 0, y: -12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#34B56A]/30 text-[#16803C] text-[11px] font-bold shadow-md z-30"
                >
                  <Check size={13} className="text-[#34B56A]" />
                  <span>{simState.lastAction}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-[#E8783C] font-mono">{simState.latencyMs}ms sync</span>
                </motion.div>
              </AnimatePresence>

              {/* 3D Floating Phone Wrapper */}
              <motion.div
                initial={{ opacity: 0, rotateY: 12, scale: 0.94 }}
                whileInView={{ opacity: 1, rotateY: -3, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                className="relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Ambient Glow behind phone */}
                <motion.div
                  animate={{
                    backgroundColor: simState.isNightTheme
                      ? '#1A2B24'
                      : simState.isPeakPrice
                      ? '#E8783C'
                      : '#34B56A',
                  }}
                  transition={{ duration: 0.7 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[580px] rounded-full blur-[110px] pointer-events-none opacity-40 mix-blend-multiply"
                />

                {/* Floating Live Badge Top Left - Positioned cleanly above phone rim */}
                <div className="absolute -top-10 sm:-top-11 left-0 sm:-left-4 z-30 flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-[#1A2B24] tracking-wide">
                    Live Table View • Table #12
                  </span>
                </div>

                {/* Miniature Permanent QR Stand (Floating on Table Left) */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4.2, ease: 'easeInOut' }}
                  className="hidden sm:flex absolute -left-20 bottom-16 flex-col items-center z-30 select-none"
                >
                  <div className="bg-white rounded-2xl p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.12)] border border-black/8 flex flex-col items-center w-26 text-center">
                    <div className="w-14 h-14 bg-white rounded-xl p-1 shadow-inner ring-1 ring-black/8 mb-1.5 relative overflow-hidden">
                      <QrCode className="w-full h-full text-[#1A2B24]" strokeWidth={1.5} />
                      <motion.div
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                        className="absolute left-0 right-0 h-0.5 bg-[#E8783C] shadow-[0_0_8px_#E8783C]"
                      />
                    </div>
                    <span className="text-[8.5px] font-black uppercase text-[#1A2B24] tracking-wider">TABLE #12</span>
                    <span className="text-[7.5px] font-bold text-[#E8783C] mt-0.5">Permanent Stand</span>
                  </div>
                  <div className="w-14 h-2 bg-black/15 rounded-full blur-[4px] mt-1.5" />
                </motion.div>

                {/* ── THE PREMIUM IPHONE MOCKUP COMPONENT ── */}
                <PremiumIPhoneMockup
                  statusBarTheme={simState.isNightTheme ? 'light' : 'dark'}
                  statusBarBg="bg-transparent"
                  screenClassName="overflow-hidden flex flex-col"
                >
                  <div
                    className="h-full w-full relative flex flex-col select-none transition-colors duration-500 overflow-hidden"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                    }}
                  >
                    {/* Sticky Restaurant Masthead */}
                    <div
                      className="py-2.5 px-3.5 border-b shrink-0 z-20 backdrop-blur-md transition-colors duration-500"
                      style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <UtensilsCrossed size={12} style={{ color: theme.accent }} />
                            <h3 className="text-xs sm:text-[13px] font-black tracking-tight leading-none">
                              The Rustic Spatula
                            </h3>
                          </div>
                          <p
                            className="text-[10px] mt-1 font-sans font-medium tracking-wide"
                            style={{ color: theme.subtext }}
                          >
                            Table #12 • Live Guest View
                          </p>
                        </div>

                        <span
                          className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs"
                          style={{
                            backgroundColor: `${theme.accent}15`,
                            color: theme.accent,
                            borderColor: `${theme.accent}40`,
                          }}
                        >
                          ● LIVE
                        </span>
                      </div>

                      {/* Horizontal Category Navigation Tabs */}
                      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                        {CATEGORIES.map((cat) => {
                          const isCatActive = selectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                              style={{
                                backgroundColor: isCatActive ? theme.accent : 'transparent',
                                color: isCatActive ? '#FFFFFF' : theme.text,
                                border: `1px solid ${isCatActive ? theme.accent : theme.border}`,
                              }}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Scrollable Menu Items Canvas */}
                    <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-2.5 pb-24 relative">

                      {/* Dish 1: Truffle Fries (Dynamic Pricing) */}
                      <motion.div
                        layout
                        className="rounded-2xl p-2.5 border transition-all duration-300 flex gap-2.5 relative overflow-hidden shadow-xs"
                        style={{
                          backgroundColor: theme.surface,
                          borderColor: simState.isPeakPrice ? theme.accent : theme.border,
                        }}
                      >
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {/* Veg dot */}
                              <div className="w-2.5 h-2.5 border border-emerald-600 flex items-center justify-center rounded-[2px] shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              </div>
                              <h4 className="text-[11.5px] font-black line-clamp-1 leading-snug">
                                Truffle Parmesan Fries
                              </h4>
                            </div>
                            <p
                              className="text-[9.5px] font-sans leading-relaxed line-clamp-2"
                              style={{ color: theme.subtext }}
                            >
                              Black truffle oil, aged parmesan, rosemary sea salt.
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                            <div>
                              {simState.isPeakPrice ? (
                                <div className="flex items-center gap-1 font-sans">
                                  <span className="text-[10px] line-through opacity-45">₹299</span>
                                  <motion.span
                                    initial={{ scale: 1.25, color: '#FFD700' }}
                                    animate={{ scale: 1, color: theme.accent }}
                                    className="text-[12px] font-extrabold"
                                  >
                                    ₹349
                                  </motion.span>
                                </div>
                              ) : (
                                <span className="text-[12px] font-extrabold font-sans" style={{ color: theme.accent }}>
                                  ₹299
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleCart('dish-1')}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-sans font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-xs"
                              style={{
                                backgroundColor: cartItems.includes('dish-1') ? theme.accent : 'transparent',
                                color: cartItems.includes('dish-1') ? '#FFFFFF' : theme.text,
                                border: `1px solid ${theme.accent}`,
                              }}
                            >
                              {cartItems.includes('dish-1') ? (
                                <>
                                  <Check size={10} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={10} />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Dish Photo Thumbnail */}
                        <div
                          className="w-[66px] h-[66px] rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border shadow-xs transition-colors"
                          style={{
                            backgroundColor: theme.bg,
                            borderColor: theme.border,
                          }}
                        >
                          <span className="text-2xl select-none" aria-hidden="true">
                            🍟
                          </span>
                          <img
                            src="https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200&auto=format&fit=crop"
                            alt="Truffle Fries"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {simState.isPeakPrice && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm text-[7px] font-sans font-black uppercase tracking-wider bg-[#E8783C] text-white shadow-sm z-10">
                              Peak Surge
                            </span>
                          )}
                        </div>
                      </motion.div>

                      {/* Dish 2: Signature Spicy Wings (Sold Out 86 Toggle) */}
                      <motion.div
                        layout
                        className="rounded-2xl p-2.5 border transition-all duration-300 flex gap-2.5 relative overflow-hidden shadow-xs"
                        style={{
                          backgroundColor: theme.surface,
                          borderColor: simState.isWingsSoldOut ? 'rgba(239, 68, 68, 0.4)' : theme.border,
                          opacity: simState.isWingsSoldOut ? 0.5 : 1,
                        }}
                      >
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {/* Non-veg dot */}
                              <div className="w-2.5 h-2.5 border border-rose-600 flex items-center justify-center rounded-[2px] shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              </div>
                              <h4 className={`text-[11.5px] font-black line-clamp-1 leading-snug ${simState.isWingsSoldOut ? 'line-through' : ''}`}>
                                Signature Spicy Wings
                              </h4>
                            </div>
                            <p
                              className="text-[9.5px] font-sans leading-relaxed line-clamp-2"
                              style={{ color: theme.subtext }}
                            >
                              Hot peri-peri glaze with creamy blue cheese dip.
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                            <span className="text-[12px] font-extrabold font-sans" style={{ color: theme.accent }}>
                              ₹449
                            </span>

                            {simState.isWingsSoldOut ? (
                              <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded bg-[#EF4444] text-white">
                                SOLD OUT
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleCart('dish-2')}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-sans font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-xs"
                                style={{
                                  backgroundColor: cartItems.includes('dish-2') ? theme.accent : 'transparent',
                                  color: cartItems.includes('dish-2') ? '#FFFFFF' : theme.text,
                                  border: `1px solid ${theme.accent}`,
                                }}
                              >
                                {cartItems.includes('dish-2') ? (
                                  <>
                                    <Check size={10} />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={10} />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Dish Photo Thumbnail */}
                        <div
                          className="w-[66px] h-[66px] rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border shadow-xs transition-colors"
                          style={{
                            backgroundColor: theme.bg,
                            borderColor: theme.border,
                          }}
                        >
                          <span className="text-2xl select-none" aria-hidden="true">
                            🍗
                          </span>
                          <img
                            src="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&auto=format&fit=crop"
                            alt="Spicy Wings"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {simState.isWingsSoldOut && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                              <span className="text-[7.5px] font-black text-white uppercase tracking-wider">
                                86'd
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Dish 3: Mushroom Risotto (Chef Special Badge) */}
                      <motion.div
                        layout
                        className="rounded-2xl p-2.5 border transition-all duration-300 flex gap-2.5 relative overflow-hidden shadow-xs"
                        style={{
                          backgroundColor: theme.surface,
                          borderColor: simState.isChefSpecial ? theme.gold : theme.border,
                        }}
                      >
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              {/* Veg dot */}
                              <div className="w-2.5 h-2.5 border border-emerald-600 flex items-center justify-center rounded-[2px] shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              </div>
                              <h4 className="text-[11.5px] font-black line-clamp-1 leading-snug">
                                Wild Mushroom Risotto
                              </h4>
                            </div>
                            <p
                              className="text-[9.5px] font-sans leading-relaxed line-clamp-2"
                              style={{ color: theme.subtext }}
                            >
                              Creamy arborio rice with foraged forest truffles.
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                            <span className="text-[12px] font-extrabold font-sans" style={{ color: theme.gold }}>
                              ₹699
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleCart('dish-3')}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-sans font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-xs"
                              style={{
                                backgroundColor: cartItems.includes('dish-3') ? theme.gold : 'transparent',
                                color: cartItems.includes('dish-3') ? '#FFFFFF' : theme.text,
                                border: `1px solid ${theme.gold}`,
                              }}
                            >
                              {cartItems.includes('dish-3') ? (
                                <>
                                  <Check size={10} />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus size={10} />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Dish Photo Thumbnail */}
                        <div
                          className="w-[66px] h-[66px] rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border shadow-xs transition-colors"
                          style={{
                            backgroundColor: theme.bg,
                            borderColor: theme.border,
                          }}
                        >
                          <span className="text-2xl select-none" aria-hidden="true">
                            🍄
                          </span>
                          <img
                            src="https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=200&auto=format&fit=crop"
                            alt="Mushroom Risotto"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {simState.isChefSpecial && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm text-[7px] font-sans font-black uppercase tracking-wider bg-[#F59E0B] text-white shadow-sm z-10 flex items-center gap-0.5">
                              <Flame size={8} /> 15% Off
                            </span>
                          )}
                        </div>
                      </motion.div>

                    </div>

                    {/* Floating Bottom Table Cart Summary */}
                    <div
                      className="absolute bottom-5 sm:bottom-6 left-3 right-3 p-2.5 rounded-2xl border shadow-xl flex items-center justify-between backdrop-blur-xl z-20 transition-all duration-300"
                      style={{
                        backgroundColor: theme.surface,
                        borderColor: theme.accent,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs text-white"
                          style={{
                            backgroundColor: theme.accent,
                          }}
                        >
                          <ShoppingBag size={13} />
                        </div>
                        <div>
                          <span className="text-[11px] font-sans font-black block leading-none">
                            {cartItems.length} Dishes • ₹{simState.isPeakPrice ? '1,048' : '998'}
                          </span>
                          <span
                            className="text-[9px] font-sans font-medium"
                            style={{ color: theme.subtext }}
                          >
                            Table #12 Active Cart
                          </span>
                        </div>
                      </div>

                      <span
                        className="px-2.5 py-1 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider shadow-xs text-white"
                        style={{
                          backgroundColor: theme.accent,
                        }}
                      >
                        Order Now →
                      </span>
                    </div>
                  </div>
                </PremiumIPhoneMockup>

              </motion.div>

              {/* Real-world proof callout */}
              <div className="mt-5 flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-black/5 text-center">
                <CheckCircle2 size={16} className="text-[#34B56A]" />
                <p className="text-[12px] text-gray-700 font-medium text-left">
                  <strong className="text-[#1A2B24] font-bold">Physical table QR stays untouched.</strong> Cloud updates push in &lt;15ms. Zero reprinting forever.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>
    </MotionConfig>
  );
}

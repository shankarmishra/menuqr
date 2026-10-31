import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Pause,
  MoveHorizontal,
  Flame,
  ShieldCheck,
  TrendingUp,
  QrCode,
  MessageSquare,
  Globe2,
  Zap,
  Coins,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Smartphone
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────────
   MENUSQR 3D ARCHITECTURAL SUPERPOWERS CAROUSEL
   Inspired by ThreeUI Character Carousel (3D Filmstrip & Dynamic Wave)
   Elevated with:
   - 8 Custom Ultra-Realistic Commercial Editorial Photographs
   - Restaurant Value Propositions (Surge, 86 Shield, Upsell, Lifetime QR, KOT, etc.)
   - MenusQR Signature Luxury Aesthetic (Parchment, Obsidian Emerald, Burnt Orange)
   - Discrete Auto-Advance, Friction-Free Inertia Drag, Touch Gestures, & Direct Tabs
   ────────────────────────────────────────────────────────────────────────── */

export interface SuperpowerItem {
  id: string;
  index: string;
  pillar: string;
  title: string;
  shortTitle: string;
  tagline: string;
  metric: string;
  metricLabel: string;
  accentColor: string;
  image: string;
  icon: React.ReactNode;
  oldWay: string;
  newWay: string;
  impactStory: string;
  cardHighlight: string;
}

const SUPERPOWERS: SuperpowerItem[] = [
  {
    id: 'dynamic-surge',
    index: '01',
    pillar: 'REVENUE ENGINE',
    title: 'Dynamic Peak-Hour Surge Pricing',
    shortTitle: 'Dynamic Surge Pricing',
    tagline: 'Automatic Friday & weekend dinner margin capture',
    metric: '+24% RevPASH',
    metricLabel: 'Weekend Revenue Per Seat',
    accentColor: '#FF5E4D',
    image: '/marketing/carousel/dynamic_surge.webp',
    icon: <Flame className="w-4 h-4 text-[#FF5E4D]" />,
    oldWay: 'Locked into fixed paper menu prices for 6 months despite packed Friday night queues.',
    newWay: 'MenusQR automatically shifts evening prices at 8:00 PM without printing a single paper sheet.',
    impactStory: 'Mannat Cafe enabled a ₹30 peak surge on dinner snacks, yielding ₹42,000 extra net profit in month one with zero guest pushback.',
    cardHighlight: 'Auto 8:00 PM Dinner Surge'
  },
  {
    id: 'sold-out-shield',
    index: '02',
    pillar: 'GUEST TRUST',
    title: 'Instant 86’d Sold-Out Shield',
    shortTitle: 'Instant Sold-Out Shield',
    tagline: 'Hide out-of-stock dishes in 3 seconds flat',
    metric: '0 Apologies',
    metricLabel: 'Table Frustration Eliminated',
    accentColor: '#34B56A',
    image: '/marketing/carousel/chef_kitchen.webp',
    icon: <ShieldCheck className="w-4 h-4 text-[#34B56A]" />,
    oldWay: 'Waiters take orders, then return 15 minutes later to tell guests the kitchen ran out of ingredients.',
    newWay: 'Chef taps toggle on their smartphone — out-of-stock items instantly vanish across all 40 tables in real-time.',
    impactStory: 'When fresh tandoori raan ran out on a busy Saturday, one tap prevented 18 frustrated table re-orders.',
    cardHighlight: '1-Tap Kitchen 86 Toggle'
  },
  {
    id: 'smart-upsell',
    index: '03',
    pillar: 'BASKET SIZE',
    title: 'Appetite-Driven Smart Upselling',
    shortTitle: 'Smart Upsell Engine',
    tagline: 'The silent waiter that never forgets to pair drinks & sides',
    metric: '+34% AOV',
    metricLabel: 'Average Order Value Increase',
    accentColor: '#FFC928',
    image: '/marketing/carousel/smart_upsell.webp',
    icon: <TrendingUp className="w-4 h-4 text-[#FFC928]" />,
    oldWay: 'Rush-hour staff is too overwhelmed to remember recommending sides, mocktails, and desserts.',
    newWay: 'Guests selecting a main are offered visual pairing chips (Truffle Fries, Nitro Cold Brew) right at the decision point.',
    impactStory: 'Visual combo prompts led 41% of burger and chaap diners to add cold brews and sides automatically.',
    cardHighlight: 'Appetite-Triggered Pairings'
  },
  {
    id: 'permanent-qr',
    index: '04',
    pillar: 'LIFETIME HARDWARE',
    title: 'One Permanent Tabletop Standee',
    shortTitle: 'Permanent Lifetime QR',
    tagline: 'Never spend a single rupee on menu reprints again',
    metric: '₹48,000 Saved / Yr',
    metricLabel: 'Zero Recurring Print Waste',
    accentColor: '#E8783C',
    image: '/marketing/carousel/walnut_standee.webp',
    icon: <QrCode className="w-4 h-4 text-[#E8783C]" />,
    oldWay: 'Spending ₹12,000 every quarter to reprint grease-stained, torn, outdated paper menus.',
    newWay: 'Mount high-grade solid walnut or acrylic table QR standees once. Update dishes, prices, and specials behind the code forever.',
    impactStory: 'A 28-table restaurant saved ₹54,000 in printing bills in their very first year using permanent MenusQR plaques.',
    cardHighlight: 'Solid Walnut & Brass Plaque'
  },
  {
    id: 'whatsapp-kot',
    index: '05',
    pillar: 'WORKFLOW SYNC',
    title: 'Direct WhatsApp Kitchen KOT',
    shortTitle: 'Instant WhatsApp KOT',
    tagline: 'Zero cost POS hardware • direct chef dispatch',
    metric: '45s Dispatch',
    metricLabel: 'Order-To-Stove Acceleration',
    accentColor: '#10B981',
    image: '/marketing/carousel/whatsapp_kot.webp',
    icon: <MessageSquare className="w-4 h-4 text-[#10B981]" />,
    oldWay: 'Waiters scribble notes on paper slips, walk back and forth, losing precious table turn minutes.',
    newWay: 'Guest orders fire directly to the kitchen chef’s WhatsApp or thermal printer with exact table number and notes.',
    impactStory: 'Order-to-stove time plummeted from 8.5 minutes down to 45 seconds during peak dinner rush.',
    cardHighlight: 'Table #07 Direct Thermal Slip'
  },
  {
    id: 'multilingual',
    index: '06',
    pillar: 'GLOBAL GUESTS',
    title: 'Automatic 12-Language Translation',
    shortTitle: '12-Language Live Menu',
    tagline: 'Zero language barrier for domestic & foreign tourists',
    metric: '100% Clarity',
    metricLabel: 'Global Guest Satisfaction',
    accentColor: '#60A5FA',
    image: '/marketing/carousel/multilingual_tourist.webp',
    icon: <Globe2 className="w-4 h-4 text-[#60A5FA]" />,
    oldWay: 'Tourists struggle to decipher regional spice names, leaving waitstaff stuck trying to translate ingredients.',
    newWay: 'Camera scan detects phone language and translates descriptions, ingredients, and allergy notes seamlessly.',
    impactStory: 'Goa and Jaipur coastal restaurants reported a 3.8x increase in foreign tourist ordering confidence.',
    cardHighlight: 'Native Guest Phone Translation'
  },
  {
    id: 'zero-app',
    index: '07',
    pillar: 'FRICTIONLESS UX',
    title: '400ms Zero-App Lightning Scan',
    shortTitle: 'Zero-App Instant Load',
    tagline: 'No App Store download • no phone OTP barrier',
    metric: '99.8% Scan Rate',
    metricLabel: 'Instant Menu Accessibility',
    accentColor: '#C084FC',
    image: '/marketing/carousel/zero_app_scan.webp',
    icon: <Zap className="w-4 h-4 text-[#C084FC]" />,
    oldWay: 'Apps demanding 60MB downloads or mandatory mobile number OTPs cause 65% of diners to abandon.',
    newWay: 'Camera scan immediately opens a high-speed web app in Safari or Chrome in under 400 milliseconds.',
    impactStory: 'Diners scan, browse, and decide before the waiter even brings water glasses to the table.',
    cardHighlight: '400ms Native Browser PWA'
  },
  {
    id: 'split-tips',
    index: '08',
    pillar: 'STAFF RETENTION',
    title: 'Split Bill & Instant UPI Waiter Tips',
    shortTitle: 'Split Bill & UPI Tipping',
    tagline: 'Faster table turns & 4x happier service staff',
    metric: '4.2x Server Tips',
    metricLabel: 'Direct Digital Waiter Rewards',
    accentColor: '#F43F5E',
    image: '/marketing/carousel/split_bill.webp',
    icon: <Coins className="w-4 h-4 text-[#F43F5E]" />,
    oldWay: 'Groups spend 15 awkward minutes dividing bills; waiters walk back and forth with card machines.',
    newWay: 'Friends split checks on their phones and pay via GPay / PhonePe / Paytm, with 1-tap waiter tip prompts.',
    impactStory: 'Servers earned ₹6,800+ in extra digital tips weekly, dramatically reducing restaurant staff turnover.',
    cardHighlight: 'Split 4 Ways + Direct UPI Tip'
  }
];

type CarouselVariant = 'filmstrip' | 'wave';

export default function CharacterCarouselSection() {
  const [variant, setVariant] = useState<CarouselVariant>('filmstrip');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const count = SUPERPOWERS.length;

  // Simulation physics state
  const stateRef = useRef({
    phase: 0,
    target: 0,
    base: 0,
    pointerX: 0,
    pointerY: 0,
    active: false,
    isHovered: false,
    lastInput: performance.now(),
    isDragging: false,
    startX: 0,
    startBase: 0,
    dragDistance: 0
  });

  // Helper: delta with cyclic wrapping
  const wrappedDelta = useCallback(
    (index: number, phase: number) => {
      let delta = index - phase;
      while (delta > count / 2) delta -= count;
      while (delta < -count / 2) delta += count;
      return delta;
    },
    [count]
  );

  // Navigate to explicit index
  const moveToIndex = useCallback(
    (targetIndex: number) => {
      const s = stateRef.current;
      const currentNearest = ((Math.round(s.target) % count) + count) % count;
      let delta = targetIndex - currentNearest;
      if (delta > count / 2) delta -= count;
      if (delta < -count / 2) delta += count;

      s.base += delta;
      s.target = s.base;
      s.active = false;
      s.lastInput = performance.now();
      setActiveIndex(targetIndex);
    },
    [count]
  );

  const handlePrev = useCallback(() => {
    const s = stateRef.current;
    s.base -= 1;
    s.target = s.base;
    s.active = false;
    s.lastInput = performance.now();
  }, []);

  const handleNext = useCallback(() => {
    const s = stateRef.current;
    s.base += 1;
    s.target = s.base;
    s.active = false;
    s.lastInput = performance.now();
  }, []);

  // Discrete Auto-advance timer (every 4.8 seconds, smooth step to next card)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      const s = stateRef.current;
      if (s.isHovered || s.isDragging || s.active) return;
      if (performance.now() - s.lastInput < 3000) return;

      s.base += 1;
      s.target = s.base;
    }, 4800);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Main 3D render loop
  useEffect(() => {
    let animationFrameId: number;
    let previousTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (time: number) => {
      const s = stateRef.current;
      const deltaTime = Math.min(32, time - previousTime);
      previousTime = time;

      const ease = reducedMotion ? 1 : 1 - Math.pow(0.001, deltaTime / 900);

      // Smoothly glide phase to target
      s.phase += (s.target - s.phase) * ease;

      const currentNearest = ((Math.round(s.phase) % count) + count) % count;
      if (currentNearest !== activeIndex) {
        setActiveIndex(currentNearest);
      }

      const stage = stageRef.current;
      const stageWidth = stage ? stage.clientWidth : window.innerWidth;
      const compact = stageWidth < 680;
      const isTablet = stageWidth >= 680 && stageWidth < 1024;

      // Generous card spacing so cards never collide
      const horizontalSpacing = compact
        ? Math.min(240, Math.max(200, stageWidth * 0.62))
        : isTablet
        ? Math.min(270, Math.max(240, stageWidth * 0.26))
        : Math.min(315, Math.max(280, stageWidth * 0.21));

      // Organic vertical breath for active card
      const breathY = Math.sin(time * 0.0018) * 3;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const delta = wrappedDelta(i, s.phase);
        const distance = Math.abs(delta);

        // Hide cards too far out to preserve performance and prevent screen edge clutter
        if (distance > 2.6) {
          card.style.opacity = '0';
          card.style.pointerEvents = 'none';
          card.style.transform = 'translate(-50%, -50%) scale(0.4)';
          return;
        }

        card.style.pointerEvents = 'auto';

        const focus = Math.exp(-distance * distance * 1.45);
        const side = Math.max(0, 1 - distance / 2.6);
        const direction = Math.sign(delta);

        let x = 0;
        let y = 0;
        let z = 0;
        let scale = 1;
        let rotateX = 0;
        let rotateY = 0;
        let rotateZ = 0;

        if (variant === 'filmstrip') {
          // ThreeUI Concave Filmstrip Arc
          x = delta * horizontalSpacing;
          y = Math.abs(delta) * (compact ? 6 : 8) + (focus * breathY) + s.pointerY * focus * 8;
          z = focus * 140 - distance * 115;
          scale = compact
            ? 0.72 + focus * 0.30
            : 0.76 + focus * 0.28;
          rotateX = -s.pointerY * focus * 4;
          rotateY = -direction * (distance > 0.1 ? 22 + Math.min(distance, 2) * 6 : 0) + s.pointerX * focus * 4;
          rotateZ = delta * 0.4;
        } else {
          // Dynamic Wave Flow
          const wavePeriod = delta * 0.92;
          x = delta * horizontalSpacing;
          y = Math.sin(wavePeriod) * (compact ? 28 : 38) + (focus * breathY) + s.pointerY * focus * 6;
          z = Math.cos(wavePeriod) * (compact ? 70 : 100) + focus * 70 - distance * 60;
          scale = compact
            ? 0.70 + focus * 0.30
            : 0.74 + focus * 0.28;
          rotateX = Math.sin(wavePeriod) * 5 - s.pointerY * focus * 3;
          rotateY = Math.cos(wavePeriod) * 16 + s.pointerX * focus * 4;
          rotateZ = Math.sin(wavePeriod) * -3;
        }

        const opacity = Math.max(0.2, side * 0.75 + focus * 0.25);
        const blurAmount = Math.max(0, distance - 1.2) * 2;

        card.style.setProperty('--focus', focus.toFixed(4));
        card.style.zIndex = String(Math.round(1000 - distance * 100));
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = blurAmount > 0.1 ? `blur(${blurAmount.toFixed(1)}px)` : 'none';
        card.style.transform = [
          'translate(-50%, -50%)',
          `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px)`,
          `rotateX(${rotateX.toFixed(2)}deg)`,
          `rotateY(${rotateY.toFixed(2)}deg)`,
          `rotateZ(${rotateZ.toFixed(2)}deg)`,
          `scale(${scale.toFixed(4)})`
        ].join(' ');

        card.setAttribute('aria-current', i === currentNearest ? 'true' : 'false');
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [variant, count, wrappedDelta, activeIndex]);

  // Pointer & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const s = stateRef.current;
    s.isDragging = true;
    s.startX = e.clientX;
    s.startBase = s.base;
    s.dragDistance = 0;
    s.active = true;
    s.lastInput = performance.now();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    const stage = stageRef.current;
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const nx = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));
    s.pointerX = nx;
    s.pointerY = ny;

    stage.style.setProperty('--pointer-x', `${((nx + 1) * 50).toFixed(1)}%`);

    if (s.isDragging) {
      const deltaX = e.clientX - s.startX;
      s.dragDistance = Math.abs(deltaX);
      const stageWidth = rect.width;
      const sensitivity = stageWidth < 680 ? 150 : 220;
      s.target = s.startBase - deltaX / sensitivity;
      s.lastInput = performance.now();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.isDragging) {
      s.isDragging = false;
      // Snap to nearest integer card
      s.base = Math.round(s.target);
      s.target = s.base;
      s.lastInput = performance.now();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
    s.active = false;
  };

  const handlePointerEnter = () => {
    const s = stateRef.current;
    s.isHovered = true;
    s.lastInput = performance.now();
  };

  const handlePointerLeave = () => {
    const s = stateRef.current;
    s.isHovered = false;
    s.pointerX = 0;
    s.pointerY = 0;
    s.active = false;
    s.lastInput = performance.now();
    if (stageRef.current) {
      stageRef.current.style.setProperty('--pointer-x', '50%');
    }
  };

  // Wheel handling for trackpad / mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    const s = stateRef.current;
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = isHorizontal ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 15) return;

    const direction = Math.sign(delta);
    s.base += direction * 1;
    s.target = s.base;
    s.active = false;
    s.lastInput = performance.now();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handlePrev();
    }
  };

  const currentItem = SUPERPOWERS[activeIndex] || SUPERPOWERS[0];

  return (
    <section
      id="menusqr-superpowers"
      aria-label="MenusQR 8 Superpowers 3D Carousel"
      className="py-10 md:py-14 px-4 sm:px-6 relative overflow-hidden bg-[#FAFAF7] border-y border-menusqr-emerald/5 select-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ── Background Aesthetics matching MenusQR ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-repeat bg-center"
        style={{
          backgroundImage: "url('/assets/brand/vintage-culinary-pattern.svg')",
          backgroundSize: '360px 360px'
        }}
      />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-menusqr-orange/10 via-menusqr-yellow/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ── Section Header ── */}
      <div className="max-w-4xl mx-auto text-center relative z-10 mb-3 sm:mb-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-menusqr-orange/10 border border-menusqr-orange/20 text-menusqr-orange text-xs font-semibold tracking-wide uppercase mb-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-menusqr-orange" />
          <span>The Architecture of Modern Dining</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-menusqr-emerald tracking-tight leading-[1.18]"
        >
          8 Superpowers Every Restaurant Needs. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-menusqr-orange via-amber-600 to-amber-700 bg-clip-text text-transparent">
            Zero Reprints. Total Table Control.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs sm:text-sm md:text-base text-menusqr-neutral-sec max-w-2xl mx-auto mt-2 leading-relaxed"
        >
          Paper menus bleed money every time prices or ingredients shift.
          MenusQR turns every dining table into an instant, intelligent revenue engine.
        </motion.p>

        {/* ── Stage Controls (Modes, Autoplay, Navigation) ── */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4">
          {/* Mode Pill Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 shadow-inner">
            <button
              type="button"
              onClick={() => setVariant('filmstrip')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                variant === 'filmstrip'
                  ? 'bg-menusqr-orange text-white shadow-md'
                  : 'text-menusqr-emerald/80 hover:text-menusqr-emerald'
              }`}
            >
              Filmstrip Arc
            </button>
            <button
              type="button"
              onClick={() => setVariant('wave')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                variant === 'wave'
                  ? 'bg-menusqr-orange text-white shadow-md'
                  : 'text-menusqr-emerald/80 hover:text-menusqr-emerald'
              }`}
            >
              Wave Flow
            </button>
          </div>

          {/* Autoplay Play/Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-xs font-medium text-menusqr-emerald hover:bg-menusqr-white transition-colors shadow-sm cursor-pointer"
            title={isPlaying ? 'Pause Auto-Pan' : 'Resume Auto-Pan'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3 text-menusqr-orange fill-menusqr-orange" />
                <span className="hidden sm:inline text-xs">Auto-Pan</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-menusqr-orange fill-menusqr-orange" />
                <span className="hidden sm:inline text-xs">Play</span>
              </>
            )}
          </button>

          {/* Previous / Next Arrows */}
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Superpower"
              className="w-7 h-7 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-menusqr-emerald flex items-center justify-center hover:bg-menusqr-white hover:border-menusqr-orange/40 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-menusqr-emerald/70 min-w-[45px] text-center">
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Superpower"
              className="w-7 h-7 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-menusqr-emerald flex items-center justify-center hover:bg-menusqr-white hover:border-menusqr-orange/40 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive 3D Stage (Preserves 3D depth and perspective) ── */}
      <div
        ref={stageRef}
        onPointerEnter={handlePointerEnter}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onWheel={handleWheel}
        className="relative w-full h-[370px] sm:h-[410px] md:h-[440px] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none my-1"
        style={{
          perspective: '1350px',
          background:
            'radial-gradient(circle at var(--pointer-x, 50%) 48%, rgba(232, 120, 60, 0.08), transparent 42%)'
        }}
      >
        {/* Soft Left & Right Ambient Vignette Shadows */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAFAF7] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAFAF7] to-transparent z-20 pointer-events-none" />

        {/* ── 3D Card Deck ── */}
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {SUPERPOWERS.map((item, i) => {
            const isCurrent = i === activeIndex;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                type="button"
                onClick={() => {
                  if (stateRef.current.dragDistance < 10) {
                    moveToIndex(i);
                  }
                }}
                onFocus={() => moveToIndex(i)}
                aria-label={`View Superpower ${item.index}: ${item.title}`}
                className="group absolute top-1/2 left-1/2 rounded-2xl overflow-hidden text-left appearance-none outline-none cursor-pointer transition-shadow duration-300"
                style={{
                  width: 'clamp(215px, 19vw, 265px)',
                  aspectRatio: '0.74',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity, filter',
                  backgroundColor: '#0D1411',
                  border: isCurrent
                    ? `2px solid ${item.accentColor}`
                    : '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isCurrent
                    ? `0 22px 45px -8px rgba(0, 0, 0, 0.55), 0 0 30px -4px ${item.accentColor}45`
                    : '0 10px 24px -5px rgba(0, 0, 0, 0.28)'
                }}
              >
                {/* ── Upper Section (68%): Full-Bleed Commercial Editorial Photograph ── */}
                <div className="absolute inset-x-0 top-0 bottom-[32%] overflow-hidden bg-neutral-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    style={{
                      filter: 'contrast(1.04) saturate(1.06)'
                    }}
                    decoding="async"
                  />

                  {/* Gradient shadow over photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1411] via-black/15 to-black/40 pointer-events-none" />

                  {/* Top Floating Badges (Category & Index) */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase font-bold flex items-center gap-1.5 shadow-sm">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      {item.pillar}
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] shadow-sm bg-black/65 backdrop-blur-md"
                      style={{
                        color: item.accentColor,
                        border: `1px solid ${item.accentColor}80`
                      }}
                    >
                      #{item.index}
                    </span>
                  </div>

                  {/* Subtle Accent Pill on Photo Bottom Right */}
                  <div className="absolute bottom-2.5 right-3 z-10 pointer-events-none">
                    <span
                      className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-black/70 backdrop-blur-md shadow-sm border border-white/10"
                      style={{ color: item.accentColor }}
                    >
                      {item.metric.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* ── Lower Section (32%): MenusQR Signature Dark Obsidian Emerald Plaque ── */}
                <div className="absolute inset-x-0 bottom-0 h-[32%] bg-[#111815] text-[#FAF3E0] p-3.5 flex flex-col justify-between border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5">
                      {item.icon}
                      <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate">
                        {item.shortTitle}
                      </span>
                    </div>
                    <span className="block text-[10px] text-[#FAF3E0]/70 truncate mt-0.5">
                      {item.tagline}
                    </span>
                  </div>

                  {/* Bottom Metric Strip */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider truncate"
                      style={{ color: item.accentColor }}
                    >
                      {item.metric} • {item.metricLabel}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                        isCurrent
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-white/50 group-hover:text-white group-hover:bg-menusqr-orange'
                      }`}
                    >
                      {isCurrent ? 'ACTIVE' : 'EXPAND'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Touch / Drag Hint for Users */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] text-menusqr-neutral-sec font-medium bg-[#FAFAF7]/85 backdrop-blur-sm px-3.5 py-1 rounded-full border border-menusqr-emerald/10 shadow-sm">
          <MoveHorizontal className="w-3.5 h-3.5 text-menusqr-orange animate-pulse" />
          <span>Swipe or click any superpower card to inspect</span>
        </div>
      </div>

      {/* ── 8 Superpowers Direct Selector Track ── */}
      <div className="max-w-4xl mx-auto mt-4 px-2 relative z-10">
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2">
          {SUPERPOWERS.map((sp, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={sp.id}
                type="button"
                onClick={() => moveToIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-menusqr-emerald text-white shadow-md scale-105'
                    : 'bg-white/80 hover:bg-white text-menusqr-emerald/70 hover:text-menusqr-emerald border border-menusqr-emerald/10 shadow-xs'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: sp.accentColor }}
                />
                <span className="font-mono text-[10px] opacity-75">{sp.index}</span>
                <span className="hidden sm:inline">{sp.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Focused Superpower Deep-Dive Comparison Panel ── */}
      <div className="max-w-4xl mx-auto mt-6 relative z-10">
        <div
          className="p-5 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-md border border-menusqr-emerald/10 shadow-lg shadow-menusqr-emerald/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden transition-all duration-300"
        >
          {/* Ambient accent stripe from item's color */}
          <div
            className="absolute top-0 left-0 bottom-0 w-2.5 transition-colors duration-300"
            style={{ backgroundColor: currentItem.accentColor }}
          />

          {/* Left: Superpower Breakdown */}
          <div className="flex-1 space-y-3 text-center md:text-left pl-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-menusqr-emerald text-white">
                SUPERPOWER #{currentItem.index}
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border transition-colors duration-300"
                style={{
                  backgroundColor: `${currentItem.accentColor}15`,
                  color: currentItem.accentColor,
                  borderColor: `${currentItem.accentColor}30`
                }}
              >
                {currentItem.pillar}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Live in MenusQR Core
              </span>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-menusqr-emerald tracking-tight">
                {currentItem.title}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-menusqr-neutral-sec mt-0.5">
                {currentItem.tagline}
              </p>
            </div>

            {/* The Old Way vs The MenusQR Way */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-red-50/70 border border-red-200/60 p-3.5 rounded-xl text-left">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                  <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  The Old Paper Menu Way
                </span>
                <p className="text-xs text-red-950 leading-relaxed">
                  {currentItem.oldWay}
                </p>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/60 p-3.5 rounded-xl text-left">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  The MenusQR Breakthrough
                </span>
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  {currentItem.newWay}
                </p>
              </div>
            </div>

            {/* Real World Impact Story */}
            <p className="text-xs text-menusqr-neutral-sec italic bg-menusqr-secondary/50 p-2.5 rounded-xl border border-menusqr-emerald/5">
              <strong className="text-menusqr-emerald font-semibold not-italic">Verified Impact:</strong> “{currentItem.impactStory}”
            </p>
          </div>

          {/* Right: Quantified Impact & CTAs */}
          <div className="flex flex-col items-center md:items-end justify-center gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-menusqr-emerald/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-center md:text-right">
              <span className="text-[10px] font-bold text-menusqr-neutral-muted uppercase tracking-wider block">
                Measured Benefit
              </span>
              <span
                className="text-2xl sm:text-3xl font-black block mt-0.5 transition-colors duration-300"
                style={{ color: currentItem.accentColor }}
              >
                {currentItem.metric}
              </span>
              <span className="text-[11px] font-semibold text-menusqr-neutral-sec">
                {currentItem.metricLabel}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
              <a
                href="/plans"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-menusqr-orange hover:bg-amber-600 text-white shadow-md text-xs font-bold transition-all active:scale-95 cursor-pointer text-center"
              >
                <span>Get MenusQR For Your Restaurant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-menusqr-secondary hover:bg-stone-200 text-menusqr-emerald border border-menusqr-emerald/15 text-xs font-bold transition-all shadow-sm cursor-pointer text-center"
              >
                <Smartphone className="w-3.5 h-3.5 text-menusqr-orange" />
                <span>See How It Works</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

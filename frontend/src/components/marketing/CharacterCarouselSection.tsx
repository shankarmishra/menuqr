import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Smartphone,
  Eye
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────────
   MENUSQR 3D ARCHITECTURAL SUPERPOWERS CAROUSEL
   Inspired by ThreeUI Character Carousel (3D Filmstrip & Dynamic Wave)
   Elevated with:
   - 8 Custom Ultra-Realistic Commercial Editorial Photographs
   - Real-World Restaurant Value Propositions (Surge, 86 Shield, Upsell, etc.)
   - MenusQR Signature Luxury Aesthetic (Parchment, Obsidian Emerald, Burnt Orange)
   - 3D Inertia Drag, Touch Gestures, Wheel Scroll, and Auto-Idle Parallax
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
    tagline: 'Automatic Friday & Weekend Evening Margin Capture',
    metric: '+24% RevPASH',
    metricLabel: 'Weekend Revenue Per Seat',
    accentColor: '#FF5E4D',
    image: '/marketing/carousel/dynamic_surge.jpg',
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
    tagline: 'Hide Out-Of-Stock Dishes in 3 Seconds Flat',
    metric: '0 Embarrassing Apologies',
    metricLabel: 'Table Frustration Eliminated',
    accentColor: '#34B56A',
    image: '/marketing/carousel/chef_kitchen.jpg',
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
    tagline: 'The Silent Waiter That Never Forgets to Pair',
    metric: '+34% Higher AOV',
    metricLabel: 'Average Order Value Increase',
    accentColor: '#FFC928',
    image: '/marketing/carousel/smart_upsell.jpg',
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
    title: 'One Permanent Tabletop QR Standee',
    shortTitle: 'Permanent Lifetime QR',
    tagline: 'Never Spend a Single Rupee on Reprints Again',
    metric: '₹48,000 Saved / Yr',
    metricLabel: 'Zero Recurring Print Waste',
    accentColor: '#E8783C',
    image: '/marketing/carousel/walnut_standee.jpg',
    icon: <QrCode className="w-4 h-4 text-[#E8783C]" />,
    oldWay: 'Spending ₹12,000 every quarter to reprint grease-stained, torn, outdated paper menus.',
    newWay: 'Mount high-grade solid walnut or acrylic table QR standees once. Update dishes, prices, and chef specials behind the code forever.',
    impactStory: 'A 28-table restaurant saved ₹54,000 in printing bills in their very first year using permanent MenusQR plaques.',
    cardHighlight: 'Solid Walnut & Brass Plaque'
  },
  {
    id: 'whatsapp-kot',
    index: '05',
    pillar: 'WORKFLOW SYNC',
    title: 'Direct WhatsApp Kitchen KOT',
    shortTitle: 'Instant WhatsApp KOT',
    tagline: 'Zero Cost POS Hardware • Direct Chef Dispatch',
    metric: '0 Missed Orders',
    metricLabel: 'Order Accuracy & Speed',
    accentColor: '#10B981',
    image: '/marketing/carousel/whatsapp_kot.jpg',
    icon: <MessageSquare className="w-4 h-4 text-[#10B981]" />,
    oldWay: 'Waiters scribble notes on paper slips, walk back and forth, losing precious table turn minutes.',
    newWay: 'Guest orders fire directly to the kitchen chef’s WhatsApp or thermal printer with exact table number and allergies.',
    impactStory: 'Order-to-stove time plummeted from 8.5 minutes down to 45 seconds during peak dinner rush.',
    cardHighlight: 'Table #07 Direct Thermal Slip'
  },
  {
    id: 'multilingual',
    index: '06',
    pillar: 'GLOBAL GUESTS',
    title: 'Automatic 12-Language Translation',
    shortTitle: '12-Language Live Menu',
    tagline: 'Zero Language Barrier For International Diners',
    metric: '100% Clarity',
    metricLabel: 'Global Guest Satisfaction',
    accentColor: '#60A5FA',
    image: '/marketing/carousel/multilingual_tourist.jpg',
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
    tagline: 'No App Store Download • No OTP Phone Barrier',
    metric: '99.8% Scan Rate',
    metricLabel: 'Instant Menu Accessibility',
    accentColor: '#C084FC',
    image: '/marketing/carousel/zero_app_scan.jpg',
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
    tagline: 'Faster Table Turns & 4x Happier Service Staff',
    metric: '4.2x Server Tips',
    metricLabel: 'Direct Digital Waiter Rewards',
    accentColor: '#F43F5E',
    image: '/marketing/carousel/split_bill.jpg',
    icon: <Coins className="w-4 h-4 text-[#F43F5E]" />,
    oldWay: 'Groups spend 15 awkward minutes dividing bills; waiters walk back and forth with credit card machines.',
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
      const currentNearest = ((Math.round(s.phase) % count) + count) % count;
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

  // Main 3D render loop
  useEffect(() => {
    let animationFrameId: number;
    let previousTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (time: number) => {
      const s = stateRef.current;
      const deltaTime = Math.min(32, time - previousTime);
      previousTime = time;

      const ease = reducedMotion ? 1 : 1 - Math.pow(0.001, deltaTime / 1000);

      // Auto-idle motion if user hasn't touched the carousel and isn't hovering
      if (isPlaying && !s.isHovered && !s.active && !s.isDragging && time - s.lastInput > 2400) {
        const idle = time - s.lastInput - 2400;
        s.target = s.base + Math.sin(idle * 0.00035) * 1.85;
      }

      s.phase += (s.target - s.phase) * ease;

      const currentNearest = ((Math.round(s.phase) % count) + count) % count;
      if (currentNearest !== activeIndex) {
        setActiveIndex(currentNearest);
      }

      const stage = stageRef.current;
      const stageWidth = stage ? stage.clientWidth : window.innerWidth;
      const compact = stageWidth < 680;
      const isTablet = stageWidth >= 680 && stageWidth < 1024;

      const horizontalSpacing = compact
        ? Math.min(135, Math.max(95, stageWidth * 0.28))
        : isTablet
        ? Math.min(175, Math.max(130, stageWidth * 0.18))
        : Math.min(210, Math.max(150, stageWidth * 0.145));

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const delta = wrappedDelta(i, s.phase);
        const distance = Math.abs(delta);
        const focus = Math.exp(-distance * distance * 1.32);
        const side = Math.max(0, 1 - distance / 4.4);
        const direction = Math.sign(delta);

        let x = 0;
        let y = 0;
        let z = 0;
        let scale = 1;
        let rotateX = 0;
        let rotateY = 0;
        let rotateZ = 0;

        if (variant === 'filmstrip') {
          // Cinematic 3D Concave Filmstrip
          x = compact
            ? delta * (horizontalSpacing * 0.95)
            : delta * horizontalSpacing;
          y = compact
            ? Math.abs(delta) * 6 + s.pointerY * focus * 8
            : Math.abs(delta) * 7 + s.pointerY * focus * 12;
          z = focus * 160 - distance * 135;
          scale = compact
            ? 0.62 + side * 0.12 + focus * 0.38
            : 0.6 + side * 0.14 + focus * 0.46;
          rotateX = -s.pointerY * focus * 5;
          rotateY = compact
            ? -direction * (distance > 0.15 ? 12 + Math.min(distance, 2.5) * 5 : 0) + s.pointerX * focus * 3
            : -direction * (distance > 0.15 ? 15 + Math.min(distance, 3) * 6 : 0) + s.pointerX * focus * 4;
          rotateZ = delta * 0.55;
        } else {
          // Dynamic Wave Flow
          const wavePeriod = delta * 0.95;
          x = delta * horizontalSpacing;
          y = Math.sin(wavePeriod) * (compact ? 32 : 46) + s.pointerY * focus * 10;
          z = Math.cos(wavePeriod) * (compact ? 80 : 120) + focus * 90 - distance * 70;
          scale = compact
            ? 0.64 + side * 0.12 + focus * 0.36
            : 0.62 + side * 0.14 + focus * 0.44;
          rotateX = Math.sin(wavePeriod) * 5 - s.pointerY * focus * 4;
          rotateY = Math.cos(wavePeriod) * 16 + s.pointerX * focus * 4;
          rotateZ = Math.sin(wavePeriod) * -3.2;
        }

        const opacity = Math.max(0.12, side * 0.74 + focus * 0.26);
        const blurAmount = Math.max(0, distance - 1.25) * 2.2;

        card.style.setProperty('--focus', focus.toFixed(4));
        card.style.zIndex = String(Math.round(1000 - distance * 100));
        card.style.opacity = opacity.toFixed(3);
        card.style.filter = `blur(${blurAmount.toFixed(1)}px)`;
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
  }, [variant, isPlaying, count, wrappedDelta, activeIndex]);

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
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
      const sensitivity = stageWidth < 680 ? 120 : 180;
      s.target = s.startBase - deltaX / sensitivity;
      s.lastInput = performance.now();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.isDragging) {
      s.isDragging = false;
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
    if (Math.abs(delta) < 8) return;

    const direction = Math.sign(delta);
    s.base += direction * 0.75;
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
      className="py-20 md:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#FAFAF7] border-y border-menusqr-emerald/5 select-none"
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
      <div className="max-w-4xl mx-auto text-center relative z-10 mb-8 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-menusqr-orange/10 border border-menusqr-orange/20 text-menusqr-orange text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4"
        >
          <Sparkles className="w-4 h-4 text-menusqr-orange" />
          <span>The Architecture of Modern Dining</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-menusqr-emerald tracking-tight leading-[1.15]"
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
          className="mt-4 text-base sm:text-lg text-menusqr-neutral-sec max-w-2xl mx-auto leading-relaxed"
        >
          Paper menus are static, fragile, and bleed money every time a price changes. MenusQR transforms every dining table into an intelligent real-time revenue engine.
        </motion.p>

        {/* ── View Controls Bar (Filmstrip Arc / Wave Flow, Auto-Pan & Prev/Next) ── */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {/* Variant Selector */}
          <div className="inline-flex p-1 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={() => setVariant('filmstrip')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                variant === 'filmstrip'
                  ? 'bg-menusqr-orange text-white shadow-md'
                  : 'text-menusqr-neutral hover:text-menusqr-emerald'
              }`}
            >
              Filmstrip Arc
            </button>
            <button
              type="button"
              onClick={() => setVariant('wave')}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                variant === 'wave'
                  ? 'bg-menusqr-orange text-white shadow-md'
                  : 'text-menusqr-neutral hover:text-menusqr-emerald'
              }`}
            >
              Wave Flow
            </button>
          </div>

          {/* Autoplay Play/Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-xs sm:text-sm font-medium text-menusqr-emerald hover:bg-menusqr-white transition-colors shadow-sm cursor-pointer"
            title={isPlaying ? 'Pause Auto-Pan' : 'Resume Auto-Pan'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-menusqr-orange fill-menusqr-orange" />
                <span className="hidden sm:inline">Auto-Pan</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-menusqr-orange fill-menusqr-orange" />
                <span className="hidden sm:inline">Play</span>
              </>
            )}
          </button>

          {/* Previous / Next Arrows */}
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Superpower"
              className="w-8 h-8 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-menusqr-emerald flex items-center justify-center hover:bg-menusqr-white hover:border-menusqr-orange/40 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-menusqr-emerald/70 min-w-[50px] text-center">
              {String(activeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Superpower"
              className="w-8 h-8 rounded-full bg-menusqr-secondary border border-menusqr-emerald/10 text-menusqr-emerald flex items-center justify-center hover:bg-menusqr-white hover:border-menusqr-orange/40 transition-colors shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
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
        className="relative w-full h-[470px] sm:h-[540px] md:h-[600px] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none my-2"
        style={{
          perspective: '1450px',
          background:
            'radial-gradient(circle at var(--pointer-x, 50%) 48%, rgba(232, 120, 60, 0.09), transparent 38%)'
        }}
      >
        {/* Soft Left & Right Ambient Vignette Shadows */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAFAF7] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAFAF7] to-transparent z-20 pointer-events-none" />

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
                  width: 'clamp(215px, 22.5vw, 290px)',
                  aspectRatio: '0.72',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity, filter',
                  backgroundColor: '#0F1613',
                  border: isCurrent
                    ? `2px solid ${item.accentColor}`
                    : '1px solid rgba(21, 28, 25, 0.2)',
                  boxShadow: isCurrent
                    ? `0 26px 55px -10px rgba(0, 0, 0, 0.45), 0 0 0 3px ${item.accentColor}50`
                    : '0 12px 28px -6px rgba(0, 0, 0, 0.22)'
                }}
              >
                {/* ── Card Main Section: Real Editorial Photograph ── */}
                <div className="absolute inset-x-0 top-0 bottom-[28%] overflow-hidden bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    style={{
                      filter: 'contrast(1.05) saturate(1.08)'
                    }}
                  />

                  {/* Gradient shadow over photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/45 pointer-events-none" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1 z-10">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[9px] tracking-widest uppercase font-bold flex items-center gap-1 shadow-sm">
                      {item.pillar}
                    </span>

                    <span
                      className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] shadow-sm bg-black/60 backdrop-blur-md"
                      style={{
                        color: item.accentColor,
                        border: `1px solid ${item.accentColor}80`
                      }}
                    >
                      #{item.index}
                    </span>
                  </div>

                  {/* Bottom Highlight Chip on Photo */}
                  <div className="absolute bottom-2.5 inset-x-3 z-10">
                    <div className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 shadow-md flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {item.icon}
                        <span className="text-[11px] font-semibold text-white truncate">
                          {item.cardHighlight}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0"
                        style={{ backgroundColor: `${item.accentColor}30`, color: item.accentColor }}
                      >
                        {item.metric.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Card Footer: MenusQR Signature Dark Emerald Palette ── */}
                <div className="absolute inset-x-0 bottom-0 h-[28%] bg-[#151C19] text-[#FAF3E0] p-3 flex items-center gap-3 border-t border-white/10">
                  {/* Number Circle Badge */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-inner"
                    style={{
                      border: `1px solid ${item.accentColor}`,
                      backgroundColor: `${item.accentColor}18`,
                      color: item.accentColor
                    }}
                  >
                    {item.index}
                  </div>

                  {/* Meta Details */}
                  <div className="min-w-0 flex-1">
                    <span className="block font-bold text-xs sm:text-sm text-white tracking-wide truncate">
                      {item.shortTitle}
                    </span>
                    <span className="block text-[10px] text-[#FAF3E0]/70 truncate mt-0.5">
                      {item.tagline}
                    </span>
                    <span
                      className="block text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate"
                      style={{ color: item.accentColor }}
                    >
                      {item.metricLabel}
                    </span>
                  </div>

                  {/* Quick View Icon */}
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white/70 group-hover:bg-menusqr-orange group-hover:text-white transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Floating Touch / Drag Hint for Users */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[11px] text-menusqr-neutral-sec font-medium bg-[#FAFAF7]/80 backdrop-blur-sm px-3 py-1 rounded-full border border-menusqr-emerald/10 shadow-sm">
          <MoveHorizontal className="w-3.5 h-3.5 text-menusqr-orange animate-pulse" />
          <span>Drag horizontally or click any card to focus</span>
        </div>
      </div>

      {/* ── Focused Superpower Deep-Dive Panel ── */}
      <div className="max-w-4xl mx-auto mt-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-5 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-md border border-menusqr-emerald/10 shadow-lg shadow-menusqr-emerald/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
          >
            {/* Ambient accent stripe from item's color */}
            <div
              className="absolute top-0 left-0 bottom-0 w-2"
              style={{ backgroundColor: currentItem.accentColor }}
            />

            {/* Left: Superpower Breakdown */}
            <div className="flex-1 space-y-3 text-center md:text-left pl-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-menusqr-emerald text-white">
                  SUPERPOWER #{currentItem.index}
                </span>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
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
                <div className="bg-red-50/70 border border-red-200/60 p-3 rounded-xl text-left">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-800 uppercase tracking-wider mb-1">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    The Old Paper Menu Way
                  </span>
                  <p className="text-xs text-red-950 leading-relaxed">
                    {currentItem.oldWay}
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl text-left">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                  className="text-2xl sm:text-3xl font-black block mt-0.5"
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
                  href="/pricing"
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
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

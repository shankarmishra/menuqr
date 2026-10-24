import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search,
  Crown, BookOpen, Layers, MousePointer
} from 'lucide-react';
import './RoyalHeritageSketchbook.css';

export interface SpreadPage {
  url: string;
  title: string;
  subtitle: string;
  chapter: string;
  folio: string;
  badge: string;
  dishCount: string;
}

const PAGES: SpreadPage[] = [
  {
    url: '/assets/sketchbook/spread-0.svg',
    title: 'The Imperial Dastarkhwan',
    subtitle: 'The Royal Cover & Imperial Frontispiece Since 1924',
    chapter: 'Cover & Farman',
    folio: 'Cover',
    badge: 'Shahi Farman',
    dishCount: 'Court Proclamation'
  },
  {
    url: '/assets/sketchbook/spread-1.svg',
    title: 'Chapter I: Tandoor & Sigri',
    subtitle: 'Galouti Kebab Nawabi, Bhatti Murgh & Royal Paneer Pasanda',
    chapter: 'The Royal Grills',
    folio: 'Folio 01 — 02',
    badge: '160 Spices',
    dishCount: '6 Signature Dishes'
  },
  {
    url: '/assets/sketchbook/spread-2.svg',
    title: 'Chapter II: The Mughal Deg',
    subtitle: 'Awadhi Gosht Dum Biryani & 18-Hour Ember Dal Bukhara',
    chapter: 'Handi & Dum Pukht',
    folio: 'Folio 03 — 04',
    badge: 'Purdah Steam',
    dishCount: '4 Dum Pukht Dishes'
  },
  {
    url: '/assets/sketchbook/spread-3.svg',
    title: 'Chapter III: Royal Confections',
    subtitle: 'Shahi Tukda Royale, Zaffrani Phirni & 24K Edible Gold Vark',
    chapter: 'Khansama Desserts',
    folio: 'Folio 05 — 06',
    badge: '24K Gold Leaf',
    dishCount: '5 Royal Confections'
  },
  {
    url: '/assets/sketchbook/spread-4.svg',
    title: 'Chapter IV: The Metamorphosis',
    subtitle: 'From Hand-Pressed Vellum to Contactless 24K Table QR',
    chapter: 'Digital Evolution',
    folio: 'Folio 07 — 08',
    badge: 'Permanent 24K',
    dishCount: 'Living Placard'
  }
];

// Optimized to 10 strips for silky-smooth 60fps GPU performance
const N_STRIPS = 10;
const SPAN = 0.46;
const BETA = 0.58; // Peak curl in radians

export default function RoyalHeritageSketchbook() {
  const [viewMode, setViewMode] = useState<'3d' | 'scroll'>('3d');
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loupeOn, setLoupeOn] = useState(true);
  
  // Turning state
  const [turn, setTurn] = useState<{ dir: 'next' | 'prev'; from: number; to: number; t: number } | null>(null);
  
  // Loupe position (in book coordinates)
  const [loupePos, setLoupePos] = useState({ x: 580, y: 320 });
  const [isHoldingLoupe, setIsHoldingLoupe] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  
  const bookRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageRectRef = useRef<DOMRect | null>(null);
  const sb3dRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const wheelTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Measure book width for CSS variables
  const [bookWidth, setBookWidth] = useState(880);

  useEffect(() => {
    const updateSize = () => {
      if (bookRef.current) {
        const w = bookRef.current.clientWidth;
        setBookWidth(w);
        if (sb3dRef.current) {
          sb3dRef.current.style.setProperty('--bw', `${w}px`);
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Set CSS variables for turning leaf (GPU-friendly math)
  const applyTurnMath = useCallback((t: number) => {
    if (!sb3dRef.current) return;
    const th = Math.PI * t;
    const beta = BETA * Math.sin(Math.PI * t);
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / N_STRIPS;

    sb3dRef.current.style.setProperty('--tt', `${(tt * D).toFixed(2)}deg`);
    sb3dRef.current.style.setProperty('--td', `${(td * D).toFixed(3)}deg`);
    sb3dRef.current.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));

    for (let i = 0; i < stripsRef.current.length; i++) {
      const el = stripsRef.current[i];
      if (!el) continue;
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      el.style.setProperty('--lit', l1.toFixed(3));
      el.style.setProperty('--a1', ((1 - l1) * 0.58).toFixed(3));
      el.style.setProperty('--a2', ((1 - l2) * 0.58).toFixed(3));
    }
  }, []);

  // Page Turn Runner
  const turnTo = useCallback((newIdx: number, dir: 'next' | 'prev') => {
    if (turn !== null) return;
    if (newIdx === idx) return;

    const fromIdx = idx;
    setTurn({ dir, from: fromIdx, to: newIdx, t: 0 });

    const startTime = performance.now();
    const duration = 650; // Optimized 650ms responsive organic turn

    const step = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(1, elapsed / duration);
      // Smooth cubic bezier ease
      const easedT = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

      applyTurnMath(easedT);

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        setIdx(newIdx);
        setTurn(null);
        if (sb3dRef.current) {
          sb3dRef.current.style.setProperty('--shade', '0');
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  }, [idx, turn, applyTurnMath]);

  const handleNext = useCallback(() => {
    if (idx < PAGES.length - 1) {
      turnTo(idx + 1, 'next');
    }
  }, [idx, turnTo]);

  const handlePrev = useCallback(() => {
    if (idx > 0) {
      turnTo(idx - 1, 'prev');
    }
  }, [idx, turnTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // WHEEL SCROLL EVENT: Scrolling over book advances or retreats folios
  const handleWheel = (e: React.WheelEvent) => {
    if (isHoldingLoupe) return;
    if (wheelTimeoutRef.current) return;
    if (Math.abs(e.deltaY) < 20) return;

    if (e.deltaY > 0 && idx < PAGES.length - 1) {
      handleNext();
      wheelTimeoutRef.current = window.setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    } else if (e.deltaY < 0 && idx > 0) {
      handlePrev();
      wheelTimeoutRef.current = window.setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, 500);
    }
  };

  // TOUCH SWIPE GESTURES FOR MOBILE
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isHoldingLoupe) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isHoldingLoupe) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && idx < PAGES.length - 1) {
        handleNext();
      } else if (dx > 0 && idx > 0) {
        handlePrev();
      }
    }
  };

  // HIGH-PERFORMANCE MOUSE TILT: Zero React re-renders & zero layout thrashing
  const handleStageMouseEnter = () => {
    if (stageRef.current) {
      stageRectRef.current = stageRef.current.getBoundingClientRect();
    }
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoldingLoupe) return;
    const rect = stageRectRef.current;
    if (!rect || !sb3dRef.current) return;
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    const ry = (xRatio * 6).toFixed(2);
    const rx = (8 - yRatio * 4).toFixed(2);

    sb3dRef.current.style.setProperty('--rx', `${rx}deg`);
    sb3dRef.current.style.setProperty('--ry', `${ry}deg`);
  };

  const handleStageMouseLeave = () => {
    stageRectRef.current = null;
    if (sb3dRef.current) {
      sb3dRef.current.style.setProperty('--rx', '8deg');
      sb3dRef.current.style.setProperty('--ry', '0deg');
    }
  };

  // Loupe Drag Interaction (Direct DOM update)
  const handleLoupePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsHoldingLoupe(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: loupePos.x,
      initY: loupePos.y,
    };
  };

  const handleLoupePointerMove = (e: React.PointerEvent) => {
    if (!isHoldingLoupe || !dragRef.current || !bookRef.current) return;
    const rect = bookRef.current.getBoundingClientRect();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    const newX = Math.max(80, Math.min(rect.width - 80, dragRef.current.initX + dx));
    const newY = Math.max(80, Math.min(rect.height - 80, dragRef.current.initY + dy));

    setLoupePos({ x: newX, y: newY });
  };

  const handleLoupePointerUp = (e: React.PointerEvent) => {
    if (isHoldingLoupe) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsHoldingLoupe(false);
      dragRef.current = null;
    }
  };

  // Loupe magnification lens sizing
  const loupeRadius = 120;
  const magFactor = 2.4;
  const lensBgSize = bookWidth * magFactor;
  const lensBgX = -loupePos.x * magFactor + loupeRadius;
  const lensBgY = -loupePos.y * magFactor + loupeRadius;

  // Build strip chain for page curl
  const renderStrips = () => {
    if (!turn) return null;
    const { dir, from, to } = turn;
    stripsRef.current = [];

    const gut = bookWidth * 0.5;
    const sw = (bookWidth * SPAN) / N_STRIPS;

    const buildNode = (i: number): React.ReactNode => {
      if (i >= N_STRIPS) return null;

      const A = `-${gut + i * sw}px 0`;
      const B = `${(i + 1) * sw - gut}px 0`;

      const fromUrl = PAGES[from].url;
      const toUrl = PAGES[to].url;

      const frontBg = dir === 'next' ? fromUrl : toUrl;
      const frontPosX = dir === 'next' ? A : B;
      const backBg = dir === 'next' ? toUrl : fromUrl;
      const backPosX = dir === 'next' ? B : A;

      const isEdge = i === N_STRIPS - 1;

      return (
        <div
          key={i}
          className={`strip ${isEdge ? 'edge' : ''}`}
          ref={(node) => {
            if (node) stripsRef.current[i] = node;
          }}
          style={{ '--i': i } as React.CSSProperties}
        >
          <div
            className="face front"
            style={{
              backgroundImage: `url(${frontBg})`,
              backgroundPosition: frontPosX,
            }}
          >
            <div className="sh" />
            <div className="gl" />
          </div>
          <div
            className="face back"
            style={{
              backgroundImage: `url(${backBg})`,
              backgroundPosition: backPosX,
            }}
          >
            <div className="sh" />
            <div className="gl" />
          </div>
          {buildNode(i + 1)}
        </div>
      );
    };

    return (
      <div
        className={`curl ${dir}`}
        style={
          {
            '--n': N_STRIPS,
            '--span': SPAN,
          } as React.CSSProperties
        }
      >
        {buildNode(0)}
      </div>
    );
  };

  const currentSpread = PAGES[turn ? turn.to : idx];

  return (
    <div className="w-full flex flex-col items-center select-none py-1">
      
      {/* TOP CONTROLS & DUAL MODE SWITCHER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-[820px] px-2 mb-3">
        
        {/* Folio Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#D4AF37]/50 shadow-2xs">
          <Crown size={13} className="text-[#AA820A]" />
          <span className="text-xs font-black text-[#8C6808] uppercase tracking-wider">
            Folio Spread {idx + 1} of {PAGES.length} • {currentSpread.folio}
          </span>
        </div>

        {/* View Mode Toggle: 3D Royal Book vs Scroll All Folios */}
        <div className="inline-flex p-0.5 rounded-xl bg-white/90 border border-[#E2DBD0] shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#121815] shadow-xs font-extrabold'
                : 'text-[#6B5E52] hover:text-[#1C1814]'
            }`}
          >
            <BookOpen size={13} />
            <span>3D Interactive Book</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('scroll')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'scroll'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#121815] shadow-xs font-extrabold'
                : 'text-[#6B5E52] hover:text-[#1C1814]'
            }`}
          >
            <Layers size={13} />
            <span>Scroll All 5 Folios</span>
          </button>
        </div>

      </div>

      {/* =========================================================================
          MODE 1: 3D INTERACTIVE SKETCHBOOK WITH WHEEL SCROLL & ZERO LAG
          ========================================================================= */}
      {viewMode === '3d' ? (
        <>
          {/* SPREAD TITLE & PROGRESS PIPS */}
          <div className="text-center max-w-xl px-4 mb-2">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              {PAGES.map((_, p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (p > idx) turnTo(p, 'next');
                    else if (p < idx) turnTo(p, 'prev');
                  }}
                  aria-label={`Go to spread ${p + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === p
                      ? 'w-8 bg-[#D4AF37] shadow-xs'
                      : 'w-2.5 bg-[#DCD4C6] hover:bg-[#AA820A]'
                  }`}
                />
              ))}
            </div>

            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C1814] truncate">
              {currentSpread.title}
            </h3>
            <p className="text-xs text-[#7A6D60] truncate">
              {currentSpread.subtitle}
            </p>
          </div>

          {/* 3D STAGE (With wheel listener & touch swipe) */}
          <div className="sb-wrap w-full max-w-[880px] px-2 sm:px-4">
            <div
              ref={stageRef}
              className="sb-stage"
              onMouseEnter={handleStageMouseEnter}
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Left Navigation Badge */}
              <button
                type="button"
                className="sb-nav-badge left"
                onClick={handlePrev}
                disabled={idx === 0 || turn !== null}
                aria-label="Previous Folio"
                title={idx > 0 ? `Turn to ${PAGES[idx - 1].chapter}` : 'Front Cover'}
              >
                <ChevronLeft size={20} className="text-[#8C6808] shrink-0" />
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#8C6808]">Prev Folio</span>
                  <span className="text-[11px] font-serif font-bold text-[#1C1814] truncate max-w-[80px]">
                    {idx > 0 ? PAGES[idx - 1].folio : 'Cover'}
                  </span>
                </div>
              </button>

              {/* Perspective Container */}
              <div ref={sb3dRef} className="sb-3d">
                <div className="sb-tilt" style={{ '--zoom': zoom } as React.CSSProperties}>
                  {/* Soft Pool Shadows on the Desk */}
                  <div className="sb-cast ambient" aria-hidden="true" />
                  <div className="sb-cast contact" aria-hidden="true" />
                  <div className="sb-cast hair" aria-hidden="true" />

                  {/* The Physical Book */}
                  <div ref={bookRef} className="sb-book">
                    {!turn ? (
                      /* Stationary Spread */
                      <div className="sb-full">
                        <img
                          src={PAGES[idx].url}
                          alt={PAGES[idx].title}
                          draggable={false}
                          loading="eager"
                        />
                      </div>
                    ) : (
                      /* Turning Pages */
                      <>
                        <div className="sb-half left">
                          <img
                            className="sb-half-img"
                            src={turn.dir === 'next' ? PAGES[turn.from].url : PAGES[turn.to].url}
                            alt=""
                            draggable={false}
                          />
                          <div className="gutter-shade left" />
                        </div>
                        <div className="sb-half right">
                          <img
                            className="sb-half-img right"
                            src={turn.dir === 'next' ? PAGES[turn.to].url : PAGES[turn.from].url}
                            alt=""
                            draggable={false}
                          />
                          <div className="gutter-shade right" />
                        </div>
                        {renderStrips()}
                      </>
                    )}

                    {/* Hotzone Click Targets */}
                    <button
                      type="button"
                      className="sb-zone prev"
                      onClick={handlePrev}
                      aria-label="Previous Page Zone"
                    />
                    <button
                      type="button"
                      className="sb-zone next"
                      onClick={handleNext}
                      aria-label="Next Page Zone"
                    />

                    {/* Floating Corner Flip Prompts */}
                    {idx < PAGES.length - 1 && !turn && (
                      <div className="sb-corner-flip right">
                        <span>Click or scroll to flip</span>
                        <ChevronRight size={12} className="text-[#FCEAB2]" />
                      </div>
                    )}
                    {idx > 0 && !turn && (
                      <div className="sb-corner-flip left">
                        <ChevronLeft size={12} className="text-[#FCEAB2]" />
                        <span>Flip back</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 24K Brass Magnifying Glass (Loupe) */}
                <div
                  className={`loupe ${loupeOn ? 'on' : ''} ${isHoldingLoupe ? 'held' : ''}`}
                  style={{
                    transform: `translate(${loupePos.x - loupeRadius}px, ${loupePos.y - loupeRadius}px)`,
                  }}
                  onPointerDown={handleLoupePointerDown}
                  onPointerMove={handleLoupePointerMove}
                  onPointerUp={handleLoupePointerUp}
                  onPointerCancel={handleLoupePointerUp}
                >
                  <span className="grip" title="Drag to inspect royal calligraphy & spices" />
                  <span className="ring" title="Drag magnifier across pages">
                    <span
                      className="lens"
                      style={{
                        backgroundImage: `url(${PAGES[idx].url})`,
                        backgroundSize: `${lensBgSize}px auto`,
                        backgroundPosition: `${lensBgX}px ${lensBgY}px`,
                      }}
                    />
                  </span>
                </div>
              </div>

              {/* Right Navigation Badge */}
              <button
                type="button"
                className="sb-nav-badge right"
                onClick={handleNext}
                disabled={idx === PAGES.length - 1 || turn !== null}
                aria-label="Next Folio"
                title={idx < PAGES.length - 1 ? `Turn to ${PAGES[idx + 1].chapter}` : 'Final Page'}
              >
                <div className="hidden sm:flex flex-col text-right leading-tight">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#8C6808]">Next Folio</span>
                  <span className="text-[11px] font-serif font-bold text-[#1C1814] truncate max-w-[80px]">
                    {idx < PAGES.length - 1 ? PAGES[idx + 1].folio : 'End'}
                  </span>
                </div>
                <ChevronRight size={20} className="text-[#8C6808] shrink-0" />
              </button>
            </div>

            {/* CONTROLS BAR: Zoom & Loupe & Scroll Instruction */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-xl px-3.5 py-2 rounded-xl bg-white/95 border border-[#E2DBD0] backdrop-blur-md text-xs shadow-sm">
              
              {/* Interaction Hint */}
              <div className="flex items-center gap-2 text-[#6B5E52] text-xs">
                <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
                <MousePointer size={12} className="text-[#8C6808]" />
                <span>Scroll wheel or click page edge • Drag brass magnifier</span>
              </div>

              {/* Right Control Buttons */}
              <div className="flex items-center gap-2">
                
                {/* Loupe Toggle */}
                <button
                  type="button"
                  onClick={() => setLoupeOn((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                    loupeOn
                      ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#8C6808]'
                      : 'bg-[#FAF7F0] border-[#E0D7C9] text-[#786657] hover:text-[#1C1814]'
                  }`}
                  title="Toggle Brass Magnifying Loupe"
                >
                  <Search size={13} className={loupeOn ? 'text-[#8C6808]' : ''} />
                  <span>{loupeOn ? 'Loupe 2.4x' : 'Loupe Off'}</span>
                </button>

                {/* Zoom Out / In */}
                <div className="inline-flex bg-[#FAF7F0] p-0.5 rounded-lg border border-[#E0D7C9] items-center">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.9, parseFloat((z - 0.1).toFixed(2))))}
                    disabled={zoom <= 0.9}
                    className="p-1 text-[#786657] hover:text-[#1C1814] disabled:opacity-30 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="px-1.5 font-mono text-[11px] text-[#8C6808] font-bold">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.3, parseFloat((z + 0.1).toFixed(2))))}
                    disabled={zoom >= 1.3}
                    className="p-1 text-[#786657] hover:text-[#1C1814] disabled:opacity-30 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                </div>

              </div>

            </div>

            {/* INTERACTIVE 5-FOLIO THUMBNAIL STRIP */}
            <div className="w-full max-w-[820px] mt-2">
              <div className="flex items-center justify-between px-1 mb-1.5">
                <span className="text-[11px] font-bold text-[#8C6808] uppercase tracking-wider font-serif flex items-center gap-1.5">
                  <Crown size={12} className="text-[#AA820A]" />
                  <span>All 5 Royal Folios (Click Any to Open)</span>
                </span>
                <span className="text-[10px] text-[#8C7A6B]">
                  Use mouse wheel or ← → keys
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PAGES.map((page, pIdx) => {
                  const isActive = idx === pIdx;
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        if (turn) return;
                        if (pIdx > idx) turnTo(pIdx, 'next');
                        else if (pIdx < idx) turnTo(pIdx, 'prev');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between relative group ${
                        isActive
                          ? 'bg-gradient-to-b from-[#FFFDF7] to-[#FDF7EA] border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-md -translate-y-0.5'
                          : 'bg-white hover:bg-[#FAF7F0] border-[#E8E2D5] hover:border-[#D4AF37]/50 shadow-2xs hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black tracking-wider uppercase ${isActive ? 'text-[#8C6808]' : 'text-[#8C7A6B]'}`}>
                          {page.folio}
                        </span>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-xs animate-pulse" />
                        ) : (
                          <span className="text-[9px] font-bold text-[#B0A294] group-hover:text-[#8C6808]">
                            Open ➔
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-serif font-bold leading-snug line-clamp-1 ${isActive ? 'text-[#1C1814]' : 'text-[#4A3B2C]'}`}>
                        {page.chapter}
                      </div>
                      <div className="text-[10px] text-[#8C7A6B] truncate mt-1">
                        {page.subtitle.split(',')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      ) : (
        /* =========================================================================
           MODE 2: CONTINUOUS VERTICAL SCROLL GALLERY (ALL 5 PAGES VISIBLE ON SCROLL)
           ========================================================================= */
        <div className="sb-scroll-gallery px-2">
          <div className="text-center max-w-lg mx-auto mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#8C6808] text-[11px] font-black uppercase tracking-wider mb-1">
              Continuous Folio Gallery
            </span>
            <p className="text-xs text-[#6B5E52]">
              Scroll down to explore all five royal tasting folios in museum-grade clarity.
            </p>
          </div>

          {PAGES.map((page, pIdx) => (
            <div key={pIdx} className="sb-scroll-card">
              <div className="px-4 py-2 bg-gradient-to-r from-[#FAF6EE] to-white border-b border-[#E8E2D5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#8C6808] text-[10px] font-black uppercase tracking-wider">
                    {page.folio}
                  </span>
                  <span className="text-xs font-serif font-bold text-[#1C1814]">
                    {page.title}
                  </span>
                </div>
                <span className="text-[11px] text-[#8C7A6B] font-medium hidden sm:inline">
                  {page.dishCount}
                </span>
              </div>
              <img
                src={page.url}
                alt={page.title}
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

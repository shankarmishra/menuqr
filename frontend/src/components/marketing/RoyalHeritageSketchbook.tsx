import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search,
  Crown
} from 'lucide-react';
import './RoyalHeritageSketchbook.css';

export interface SpreadPage {
  url: string;
  title: string;
  subtitle: string;
  chapter: string;
  folio: string;
}

const PAGES: SpreadPage[] = [
  {
    url: '/assets/sketchbook/spread-0.svg',
    title: 'The Imperial Dastarkhwan',
    subtitle: 'The Royal Cover & Imperial Frontispiece Since 1924',
    chapter: 'Cover & Archives',
    folio: 'Cover'
  },
  {
    url: '/assets/sketchbook/spread-1.svg',
    title: 'Chapter I: Tandoor & Sigri',
    subtitle: 'Galouti Kebab Nawabi, Bhatti Murgh & Royal Paneer Pasanda',
    chapter: 'The Royal Grills',
    folio: 'Folio 01 — 02'
  },
  {
    url: '/assets/sketchbook/spread-2.svg',
    title: 'Chapter II: The Mughal Deg',
    subtitle: 'Awadhi Gosht Dum Biryani & 18-Hour Ember Dal Bukhara',
    chapter: 'Handi & Dum Pukht',
    folio: 'Folio 03 — 04'
  },
  {
    url: '/assets/sketchbook/spread-3.svg',
    title: 'Chapter III: Royal Confections',
    subtitle: 'Shahi Tukda Royale, Zaffrani Phirni & 24K Edible Gold Vark',
    chapter: 'Khansama Desserts',
    folio: 'Folio 05 — 06'
  },
  {
    url: '/assets/sketchbook/spread-4.svg',
    title: 'Chapter IV: The Metamorphosis',
    subtitle: 'From Hand-Pressed Vellum to Contactless 24K Table QR',
    chapter: 'Digital Evolution',
    folio: 'Folio 07 — 08'
  }
];

const N_STRIPS = 16;
const SPAN = 0.46;
const BETA = 0.60; // Peak curl in radians

export default function RoyalHeritageSketchbook() {
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loupeOn, setLoupeOn] = useState(true);
  const [rotX, setRotX] = useState(8);
  const [rotY, setRotY] = useState(0);
  
  // Turning state
  const [turn, setTurn] = useState<{ dir: 'next' | 'prev'; from: number; to: number; t: number } | null>(null);
  
  // Loupe position (in book coordinates)
  const [loupePos, setLoupePos] = useState({ x: 580, y: 320 });
  const [isHoldingLoupe, setIsHoldingLoupe] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initX: number; initY: number } | null>(null);
  
  const bookRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sb3dRef = useRef<HTMLDivElement>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);
  const animFrameRef = useRef<number | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (idx < PAGES.length - 1) turnTo(idx + 1, 'next');
      } else if (e.key === 'ArrowLeft') {
        if (idx > 0) turnTo(idx - 1, 'prev');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [idx, turnTo]);

  // Set CSS variables for turning leaf
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
      el.style.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      el.style.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }, []);

  // Page Turn Runner
  const turnTo = useCallback((newIdx: number, dir: 'next' | 'prev') => {
    if (turn !== null) return;
    if (newIdx === idx) return;

    const fromIdx = idx;
    setTurn({ dir, from: fromIdx, to: newIdx, t: 0 });

    const startTime = performance.now();
    const duration = 720; // 720ms organic turn

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

  const handleNext = () => {
    if (idx < PAGES.length - 1) {
      turnTo(idx + 1, 'next');
    }
  };

  const handlePrev = () => {
    if (idx > 0) {
      turnTo(idx - 1, 'prev');
    }
  };

  // Mouse tilt effect across stage
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isHoldingLoupe) return;
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    setRotY(xRatio * 7); // -3.5 to +3.5 deg
    setRotX(8 - yRatio * 5); // 5.5 to 10.5 deg
  };

  const handleStageMouseLeave = () => {
    if (!isHoldingLoupe) {
      setRotY(0);
      setRotX(8);
    }
  };

  // Loupe Drag Interaction
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

  // Calculate loupe lens magnification styling
  const loupeRadius = 120; // 240px width / 2
  const magFactor = 2.4;
  const lensBgSize = bookWidth * magFactor;
  const lensBgX = -loupePos.x * magFactor + loupeRadius;
  const lensBgY = -loupePos.y * magFactor + loupeRadius;

  // Build strip chain for page curl
  const renderStrips = () => {
    if (!turn) return null;
    const { dir, from, to } = turn;
    stripsRef.current = [];

    // Helper for background positions
    const gut = bookWidth * 0.5;
    const sw = (bookWidth * SPAN) / N_STRIPS;

    // Recursive strip tree builder
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
      
      {/* COMPACT CHAPTER SELECTOR & LIVE TITLE */}
      <div className="text-center max-w-xl px-4 mb-3">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8C6808] uppercase tracking-wider mb-1">
          <Crown size={12} className="text-[#AA820A]" />
          <span>{currentSpread.folio} • {currentSpread.title}</span>
        </div>

        {/* Chapter Folio Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
          {PAGES.map((page, pIdx) => {
            const isActive = idx === pIdx;
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  if (pIdx > idx) turnTo(pIdx, 'next');
                  else if (pIdx < idx) turnTo(pIdx, 'prev');
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#121815] border-[#D4AF37] shadow-sm font-extrabold scale-102'
                    : 'bg-white hover:bg-[#F5EFE6] text-[#6B5E52] hover:text-[#1C1814] border-[#E2DBD0]'
                }`}
              >
                {page.chapter}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D STAGE */}
      <div className="sb-wrap w-full max-w-[880px] px-2 sm:px-4">
        <div
          ref={stageRef}
          className="sb-stage"
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
        >
          {/* Left Arrow */}
          <button
            type="button"
            className="sb-arrow left"
            onClick={handlePrev}
            disabled={idx === 0 || turn !== null}
            aria-label="Previous Page"
          >
            <ChevronLeft size={36} />
          </button>

          {/* Perspective Container */}
          <div ref={sb3dRef} className="sb-3d">
            <div
              className="sb-tilt"
              style={
                {
                  '--rx': `${rotX}deg`,
                  '--ry': `${rotY}deg`,
                  '--zoom': zoom,
                } as React.CSSProperties
              }
            >
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

          {/* Right Arrow */}
          <button
            type="button"
            className="sb-arrow right"
            onClick={handleNext}
            disabled={idx === PAGES.length - 1 || turn !== null}
            aria-label="Next Page"
          >
            <ChevronRight size={36} />
          </button>
        </div>

        {/* CONTROLS BAR: Zoom & Loupe & Instruction */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full max-w-xl px-3.5 py-2 rounded-xl bg-white/95 border border-[#E2DBD0] backdrop-blur-md text-xs shadow-sm">
          
          {/* Interaction Hint */}
          <div className="flex items-center gap-2 text-[#6B5E52] text-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span>Click or drag page edge • Drag brass magnifier</span>
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

      </div>

    </div>
  );
}

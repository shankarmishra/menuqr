import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, Sparkles, RefreshCw, Eye, Layers, ShieldCheck, Wifi, Star, Smartphone } from 'lucide-react';
import RoyalWalnutStickerCard from './RoyalWalnutStickerCard';
import { type StickerThemeId } from './StickerTemplates';

export interface ThreeDPlacardStandProps {
  restaurantName: string;
  category?: string;
  tagline?: string;
  menuUrl: string;
  qrImage: string;
  themeId?: StickerThemeId;
}

export type StandStyle = 'acrylic' | 'walnut-brass' | 'tent-fold';

export default function ThreeDPlacardStand({
  restaurantName,
  category = 'FINE DINING & CULINARY EXCELLENCE',
  tagline = '',
  menuUrl,
  qrImage,
  themeId = 'menusqr-marble-gold',
}: ThreeDPlacardStandProps) {
  // 3D Rotation State
  const [rotY, setRotY] = useState(-18);
  const [rotX, setRotX] = useState(12);
  const [autoSpin, setAutoSpin] = useState(true);
  const [standStyle, setStandStyle] = useState<StandStyle>('acrylic');
  const [isDragging, setIsDragging] = useState(false);

  // Interaction tracking refs
  const dragStartRef = useRef<{ x: number; y: number; startRotY: number; startRotX: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSpinAnimRef = useRef<number | null>(null);

  // Auto-spin animation when not actively dragged
  useEffect(() => {
    if (!autoSpin || isDragging) return;

    let startTime = performance.now();
    const initialRotY = rotY;

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      // Gentle subtle pendular oscillation (-30deg to +30deg)
      const newY = initialRotY + Math.sin(elapsed * 0.75) * 26;
      const newX = 10 + Math.cos(elapsed * 0.6) * 4;
      setRotY(newY);
      setRotX(newX);
      autoSpinAnimRef.current = requestAnimationFrame(loop);
    };

    autoSpinAnimRef.current = requestAnimationFrame(loop);

    return () => {
      if (autoSpinAnimRef.current) cancelAnimationFrame(autoSpinAnimRef.current);
    };
  }, [autoSpin, isDragging]);

  // Pointer Handlers for 360-degree drag rotation
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setAutoSpin(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startRotY: rotY,
      startRotX: rotX,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [rotY, rotX]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const sensitivity = 0.42;
    const nextRotY = dragStartRef.current.startRotY + deltaX * sensitivity;
    const nextRotX = Math.max(-25, Math.min(38, dragStartRef.current.startRotX - deltaY * sensitivity));

    setRotY(nextRotY);
    setRotX(nextRotX);
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  }, []);

  const handleReset = () => {
    setRotY(-18);
    setRotX(12);
    setAutoSpin(false);
  };

  // Compute dynamic specular highlight angle from rotY
  const lightAngle = 135 + (rotY % 360) * 0.8;
  const glassReflectOpacity = Math.max(0.08, Math.min(0.35, Math.abs(Math.cos((rotY * Math.PI) / 180)) * 0.32));

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 3D Control Bar */}
      <div className="w-full max-w-xl mb-4 flex flex-wrap items-center justify-between gap-2.5 px-2">
        {/* Style Selector */}
        <div className="inline-flex bg-[#121915] p-1 rounded-xl border border-[#2a3832] text-xs">
          <button
            type="button"
            onClick={() => setStandStyle('acrylic')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              standStyle === 'acrylic' ? 'bg-[#D4AF37] text-[#140D07] shadow-sm' : 'text-[#849a90] hover:text-white'
            }`}
          >
            <Sparkles size={12} /> Crystal Acrylic
          </button>
          <button
            type="button"
            onClick={() => setStandStyle('walnut-brass')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              standStyle === 'walnut-brass' ? 'bg-[#D4AF37] text-[#140D07] shadow-sm' : 'text-[#849a90] hover:text-white'
            }`}
          >
            <Layers size={12} /> Walnut Pedestal
          </button>
          <button
            type="button"
            onClick={() => setStandStyle('tent-fold')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              standStyle === 'tent-fold' ? 'bg-[#D4AF37] text-[#140D07] shadow-sm' : 'text-[#849a90] hover:text-white'
            }`}
          >
            <Eye size={12} /> Tent Card
          </button>
        </div>

        {/* Orbit / Reset Controls */}
        <div className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSpin(!autoSpin)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              autoSpin
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-[#121915] border-[#2a3832] text-[#849a90] hover:text-white'
            }`}
          >
            <RotateCw size={12} className={autoSpin ? 'animate-spin' : ''} />
            {autoSpin ? 'Orbiting' : 'Auto-Orbit'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="Reset Angle"
            className="p-1.5 rounded-xl bg-[#121915] border border-[#2a3832] text-[#849a90] hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing border border-[#2a3832]/60 bg-radial from-[#19231f] via-[#101714] to-[#0a0f0d] shadow-inner"
        style={{ perspective: '1300px' }}
      >
        {/* Subtle Ambient Studio Lighting in Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Rotating Plaque Assembly */}
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          }}
        >
          {/* Table Surface Grid / Shadow Floor Plane */}
          <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[240px] pointer-events-none"
            style={{
              transform: 'rotateX(90deg) translateZ(-10px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Soft Ambient Contact Shadow */}
            <div
              className="w-[380px] h-[220px] rounded-[100%] blur-xl opacity-75"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(20,13,7,0.45) 45%, rgba(0,0,0,0) 75%)',
              }}
            />
            {/* Deep Sharp Core Cast Shadow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[65px] rounded-[100%] blur-md opacity-85"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(10,5,2,0.95) 0%, rgba(0,0,0,0) 70%)',
              }}
            />
          </div>

          {/* STAND BASE / PEDESTAL */}
          {standStyle === 'walnut-brass' && (
            <div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[215px] z-20 pointer-events-none"
              style={{
                transform: 'translateZ(12px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Handcrafted Walnut Wood Base Block */}
              <div
                className="w-[320px] h-[26px] rounded-md shadow-2xl relative border-t border-[#8D5B28]/40"
                style={{
                  background: 'linear-gradient(180deg, #3D2612 0%, #291809 60%, #170D05 100%)',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.2)',
                }}
              >
                {/* Polished Brass Inlay Plate */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-2 bg-gradient-to-r from-[#D4AF37] via-[#FFF3B0] to-[#997A15] rounded-full opacity-90 shadow-sm" />
              </div>
            </div>
          )}

          {standStyle === 'acrylic' && (
            <div
              className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[218px] z-20 pointer-events-none"
              style={{
                transform: 'translateZ(14px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Clear Bevelled Acrylic Foot Stand */}
              <div
                className="w-[310px] h-[22px] rounded-lg relative"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, rgba(200,225,255,0.2) 100%)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.8)',
                }}
              >
                <div className="absolute inset-x-2 top-0 h-[1px] bg-white/80" />
              </div>
            </div>
          )}

          {/* THE 3D PLACARD TENT BODY (Double Sided) */}
          <div
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
              width: '320px',
              height: '460px',
            }}
          >
            {/* FRONT FACE (Imperial Royal Ivory & Gold Plaque) */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl backface-hidden"
              style={{
                transform: 'translateZ(6px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* High-Resolution Front Plaque Card */}
              <div className="transform scale-[0.79] origin-top-left pointer-events-none">
                <RoyalWalnutStickerCard
                  themeId={themeId}
                  restaurantName={restaurantName}
                  category={category}
                  tagline={tagline}
                  menuUrl={menuUrl}
                  qrImage={qrImage}
                  showStatusBadge={false}
                  showDownloadButtons={false}
                />
              </div>

              {/* Dynamic Glass Bevel & Specular Sheen (Acrylic simulation) */}
              {standStyle === 'acrylic' && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl z-30 transition-opacity"
                  style={{
                    opacity: glassReflectOpacity,
                    background: `linear-gradient(${lightAngle}deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 32%, rgba(255,255,255,0) 65%)`,
                    border: '1px solid rgba(255,255,255,0.55)',
                    boxShadow: 'inset 0 0 16px rgba(255,255,255,0.3)',
                  }}
                />
              )}

              {/* Polished Glass Bevel Edge */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none border border-white/40 shadow-inner z-20" />
            </div>

            {/* BACK FACE (Guest Hospitality & Wi-Fi Side) */}
            <div
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between"
              style={{
                transform: 'rotateY(180deg) translateZ(6px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                background: 'linear-gradient(160deg, #1A130C 0%, #261B11 40%, #150E07 100%)',
                border: '2px solid rgba(212, 175, 55, 0.65)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.8), inset 0 0 25px rgba(212,175,55,0.15)',
              }}
            >
              {/* Top Crest / Brand */}
              <div className="text-center pt-2">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#D4AF37] block">
                  MENUSQR VIP TABLE
                </span>
                <h3 className="font-extrabold text-white text-lg tracking-tight mt-1 truncate">
                  {restaurantName}
                </h3>
                <p className="text-[#849a90] text-[10px] font-medium tracking-wide">
                  TOUCHLESS DIGITAL DINING
                </p>
              </div>

              {/* Center Amenities Badge Grid */}
              <div className="my-auto space-y-2.5">
                {/* Quick Scan Callout */}
                <div className="bg-[#100B06]/70 border border-[#D4AF37]/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Smartphone size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-bold leading-tight">Instant Camera Scan</p>
                    <p className="text-[#849a90] text-[10px]">No app or registration needed</p>
                  </div>
                </div>

                {/* Free Wi-Fi Callout */}
                <div className="bg-[#100B06]/70 border border-[#D4AF37]/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Wifi size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-bold leading-tight">Guest Wi-Fi Available</p>
                    <p className="text-[#849a90] text-[10px]">Ask your server for credentials</p>
                  </div>
                </div>

                {/* Google Reviews Callout */}
                <div className="bg-[#100B06]/70 border border-amber-500/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
                    <Star size={18} className="fill-amber-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-xs font-bold leading-tight">Verified Google Reviews</p>
                    <p className="text-[#849a90] text-[10px]">Tap menu button to review food</p>
                  </div>
                </div>
              </div>

              {/* Bottom Mini QR & Guarantee */}
              <div className="pt-2 border-t border-[#D4AF37]/25 flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Permanent Stand
                  </span>
                  <span className="text-[10px] text-white/70 font-semibold block">
                    100% Water & Grease Proof
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck size={12} /> Live Table
                </div>
              </div>
            </div>

            {/* Thickness Edge Layers (Creates True 3D Depth) */}
            <div
              className="absolute inset-y-0 -left-[4px] w-[8px] bg-gradient-to-r from-white/30 via-[#D4AF37]/60 to-black/40 pointer-events-none"
              style={{
                transform: 'rotateY(-90deg)',
                transformOrigin: 'left center',
              }}
            />
            <div
              className="absolute inset-y-0 -right-[4px] w-[8px] bg-gradient-to-r from-black/40 via-[#D4AF37]/60 to-white/30 pointer-events-none"
              style={{
                transform: 'rotateY(90deg)',
                transformOrigin: 'right center',
              }}
            />
          </div>
        </div>

        {/* Floating Hint Overlay at Bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-30">
          <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[#849a90] text-[11px] font-semibold flex items-center gap-2 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
            <span>Drag or swipe to rotate 360° • Click orbit to auto-showcase</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, QrCode, Smartphone, Utensils, ChevronRight, Eye } from 'lucide-react';
import { MenusQRBrand } from '../brand/MenusQRBrand';

interface SpatialStudioMockupProps {
  className?: string;
  restaurantName?: string;
  tagline?: string;
  headline?: string;
  subheadline?: string;
  showKineticText?: boolean;
}

/**
 * SpatialStudioMockup
 * 
 * Recreates the iconic ThreeUI Launch Film 3D Studio Mockup aesthetic:
 * - 3D Sculpted device tilted in isometric spatial perspective
 * - Interactive cursor-tracking 3D parallax tilt (spring physics)
 * - Deep obsidian studio with warm amber/gold atmospheric backlighting
 * - Glossy floor mirror plane with realistic reflection falloff
 * - Floating ambient ember particles & micro-sparks
 * - Real live MenusQR food items and interactive menu display
 */
export default function SpatialStudioMockup({
  className = '',
  restaurantName = 'Mannat Tandoori Junction',
  tagline = 'Chaap Ka Asli Swad • 100% Pure Soya',
  headline = 'Scan. Order. Indulge.',
  subheadline = 'A cinematic 3D digital menu experience built for modern restaurants.',
  showKineticText = true,
}: SpatialStudioMockupProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'menu' | 'standee'>('menu');

  // Handle smooth 3D parallax on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // 3D Rotation Angles (Base isometric: rotateY -16deg, rotateX 12deg, rotateZ 2deg)
  const rotY = -16 + mousePos.x * 10;
  const rotX = 12 - mousePos.y * 8;
  const rotZ = 2 + mousePos.x * 2;
  const translateY = mousePos.y * 6;

  // Canvas particle embers
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles = Array.from({ length: 42 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.6,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;
        const currentOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));

        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 140, 60, ${currentOpacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(232, 120, 60, 0.8)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full min-h-[640px] lg:min-h-[720px] rounded-3xl overflow-hidden bg-[#07090c] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 md:p-12 select-none ${className}`}
      style={{
        background: 'radial-gradient(ellipse 90% 70% at 50% 30%, #151a24 0%, #0a0d13 60%, #040507 100%)',
      }}
    >
      {/* Background Studio Volumetric Amber Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full pointer-events-none blur-[120px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #e8783c 0%, rgba(232, 120, 60, 0.2) 50%, transparent 80%)',
        }}
      />

      {/* Floating Amber Embers Canvas */}
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70"
      />

      {/* Top Controls / Brand Header */}
      <div className="absolute top-6 inset-x-8 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2">
          <MenusQRBrand size="sm" variant="light" />
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/70">
            3D Spatial Engine
          </span>
        </div>

        {/* Tab switcher: Live Menu vs Standee */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'menu' ? 'bg-[#e8783c] text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone size={13} /> Mobile Menu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('standee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'standee' ? 'bg-[#e8783c] text-white shadow-lg' : 'text-white/60 hover:text-white'
            }`}
          >
            <QrCode size={13} /> Standee Plaque
          </button>
        </div>
      </div>

      {/* Main Content Grid: Kinetic Titles on Left + 3D Mirror Phone on Right */}
      <div className="relative z-20 w-full max-w-6xl grid lg:grid-cols-12 gap-10 items-center mt-10">
        {/* Left Side: Kinetic Typography (ThreeUI Launch Film Style) */}
        {showKineticText && (
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8783c]/15 border border-[#e8783c]/30 text-[#e8783c] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Next-Gen Motion & Spatial Depth
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
              {headline}
            </h1>

            <p className="text-base sm:text-lg text-[#94a3b8] max-w-lg leading-relaxed font-normal">
              {subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="/menu/shankar-dhaba?qr=qr_249da374a9fe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#e8783c] hover:bg-[#f18b50] text-white font-bold text-sm transition-all shadow-xl shadow-[#e8783c]/25 active:scale-95 cursor-pointer"
              >
                <Eye size={16} /> Scan Demo Menu <ChevronRight size={16} />
              </a>
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                60 FPS Fluid 3D Tilt
              </div>
            </div>

            {/* Architecture Metrics (Like ThreeUI bottom spec bar) */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-white/40 uppercase font-mono text-[10px]">Passes</p>
                <p className="text-white font-bold mt-0.5">Studio Mirror Floor</p>
              </div>
              <div>
                <p className="text-white/40 uppercase font-mono text-[10px]">Lighting</p>
                <p className="text-white font-bold mt-0.5">Amber Softbox + Rim</p>
              </div>
              <div>
                <p className="text-white/40 uppercase font-mono text-[10px]">Depth</p>
                <p className="text-white font-bold mt-0.5">1400px Isometric</p>
              </div>
            </div>
          </div>
        )}

        {/* Right Side: The 3D Sculpted Floating Device with Mirror Floor */}
        <div
          className={`${
            showKineticText ? 'lg:col-span-6' : 'col-span-12'
          } relative flex flex-col items-center justify-center py-8`}
          style={{ perspective: '1400px' }}
        >
          {/* Outer 3D Tilt Wrapper */}
          <div
            className="relative transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) translateY(${translateY}px)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* The Sculpted 3D iPhone */}
            <div
              className="relative w-[280px] sm:w-[320px] aspect-[393/852] rounded-[48px] p-[4px] box-border"
              style={{
                background: 'linear-gradient(145deg, #3d4347 0%, #1c1f24 40%, #0d0e12 100%)',
                boxShadow: `
                  15px 30px 60px -10px rgba(0, 0, 0, 0.95),
                  0 0 40px rgba(232, 120, 60, 0.15),
                  inset 0 1px 1px rgba(255, 255, 255, 0.35),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.8)
                `,
              }}
            >
              {/* Outer Titanium Edge Micro-Chamfer */}
              <div className="absolute inset-0 rounded-[48px] border border-white/20 pointer-events-none z-30" />

              {/* Side Volume / Action Buttons */}
              <div className="absolute top-[80px] -left-[4px] w-[4px] h-[22px] bg-[#2a2d33] rounded-l-[2px]" />
              <div className="absolute top-[115px] -left-[4px] w-[4px] h-[40px] bg-[#2a2d33] rounded-l-[2px]" />
              <div className="absolute top-[165px] -left-[4px] w-[4px] h-[40px] bg-[#2a2d33] rounded-l-[2px]" />
              <div className="absolute top-[130px] -right-[4px] w-[4px] h-[55px] bg-[#2a2d33] rounded-r-[2px]" />

              {/* Black Inner Bezel Frame */}
              <div className="relative w-full h-full bg-[#07090b] rounded-[44px] p-[3px] box-border flex flex-col overflow-hidden">
                {/* Phone Screen Display */}
                <div className="relative w-full h-full rounded-[41px] overflow-hidden bg-[#151c19] flex flex-col">
                  {/* Top Status Bar & Dynamic Island */}
                  <div className="w-full h-9 flex items-center justify-between px-6 pt-1 text-white select-none shrink-0 z-40 bg-black/40 backdrop-blur-md">
                    <span className="text-[11px] font-bold font-mono tracking-tight">9:41</span>
                    {/* Dynamic Island */}
                    <div className="w-[84px] h-[20px] bg-black rounded-full flex items-center justify-between px-2.5 border border-white/10 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0a0d0c] opacity-80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0e1624] border border-white/15" />
                    </div>
                    {/* Signal & Battery */}
                    <div className="flex items-center gap-1.5 text-xs opacity-90">
                      <span className="text-[10px]">5G</span>
                      <div className="w-4 h-2 rounded-[2px] border border-white p-[0.5px]">
                        <div className="w-full h-full bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* Screen Content */}
                  <div className="flex-1 w-full overflow-y-auto overflow-x-hidden text-white font-sans text-xs">
                    {activeTab === 'menu' ? (
                      /* MENU MODE */
                      <div className="pb-16">
                        {/* MenusQR Contactless Header */}
                        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-black/60 sticky top-0 z-30">
                          <MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" />
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                            Live Dining
                          </span>
                        </div>

                        {/* Restaurant Hero Card */}
                        <div className="p-3 bg-gradient-to-b from-[#2a1708] to-[#151c19] border-b border-white/10">
                          <h3 className="font-black text-sm text-[#e8783c] uppercase tracking-wide">
                            {restaurantName}
                          </h3>
                          <p className="text-[10px] text-white/70 italic mt-0.5">{tagline}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold text-amber-300">
                              ★ 4.9 (1.2k+ Reviews)
                            </span>
                            <span className="text-[9px] text-white/50">Pure Veg & Soya</span>
                          </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-1.5 p-2 overflow-x-auto border-b border-white/5">
                          {['Chaap Specialties', 'Paneer Tikka', 'Tandoori Roti', 'Beverages'].map((cat, i) => (
                            <span
                              key={cat}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                                i === 0 ? 'bg-[#e8783c] text-white' : 'bg-white/5 text-white/60'
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* Dishes List */}
                        <div className="p-3 space-y-2.5">
                          {[
                            { name: 'Afghani Chaap', desc: 'Creamy cashew marinade, charcoal baked', half: '₹149', full: '₹239' },
                            { name: 'Malai Chaap', desc: 'Rich cream, butter, freshly crushed cardamom', half: '₹159', full: '₹249' },
                            { name: 'Masala Tandoori Chaap', desc: 'Fiery Punjabi spice rub, mint chutney', half: '₹149', full: '₹239' },
                            { name: 'Paneer Malai Tikka', desc: 'Fresh cottage cheese, cream glaze', half: '₹169', full: '₹269' },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                  <h4 className="font-bold text-[11px] text-white">{item.name}</h4>
                                </div>
                                <p className="text-[9px] text-white/50 line-clamp-1 mt-0.5">{item.desc}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="px-2 py-1 rounded-lg bg-[#e8783c]/20 border border-[#e8783c]/30 text-[#e8783c] font-bold text-[10px]">
                                  {item.half}
                                </span>
                                <span className="px-2 py-1 rounded-lg bg-[#e8783c] text-white font-bold text-[10px] shadow-sm">
                                  {item.full}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* STANDEE MODE */
                      <div className="p-4 flex flex-col items-center justify-center min-h-full text-center bg-gradient-to-b from-[#FAF5EB] to-[#ECE1CF] text-[#241603]">
                        <div className="px-3 py-1 rounded-full border border-[#D4AF37] bg-white/80 text-[9px] font-bold uppercase tracking-widest text-[#8C6D23] mb-3">
                          Official Table Standee
                        </div>
                        <h3 className="font-black text-sm uppercase tracking-wider font-serif">
                          {restaurantName}
                        </h3>
                        <p className="text-[9px] text-[#5C4D3C] uppercase tracking-widest mt-0.5 mb-4">
                          North Indian • Tandoori
                        </p>
                        {/* QR Box */}
                        <div className="w-36 h-36 bg-white p-2.5 rounded-2xl shadow-xl border-2 border-[#D4AF37] flex items-center justify-center">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://menusqr.in/menu/shankar-dhaba"
                            alt="QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-serif font-black text-[10px] tracking-widest uppercase mt-4">
                          Point Camera To Scan Menu
                        </p>
                        <p className="text-[8px] font-mono text-[#8C6D23] mt-1">100% CONTACTLESS • NO APP NEEDED</p>
                      </div>
                    )}

                    {/* Floating Bottom Cart Bar */}
                    {activeTab === 'menu' && (
                      <div className="absolute bottom-2 inset-x-2 z-40 bg-[#e8783c] rounded-xl p-2 px-3 flex items-center justify-between text-white shadow-xl">
                        <div className="flex items-center gap-1.5">
                          <Utensils size={12} />
                          <span className="font-bold text-[10px]">2 items • ₹388</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center">
                          View Order <ChevronRight size={12} />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Glass Sheen Specular Arc */}
                  <div
                    className="absolute inset-0 pointer-events-none z-30"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 30%, transparent 60%)',
                    }}
                  />

                  {/* Home Indicator Bar */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/30 z-50 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* --- THREEUI SIGNATURE MIRROR FLOOR REFLECTION --- */}
            {/* Real Planar Reflection Plane with Gaussian Bokeh Falloff & Ambient Blur */}
            <div
              className="absolute -bottom-[210px] sm:-bottom-[240px] inset-x-0 h-[210px] sm:h-[240px] pointer-events-none select-none overflow-hidden"
              style={{
                transform: 'scaleY(-1) rotateX(20deg)',
                opacity: 0.38,
                filter: 'blur(3px)',
                maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, transparent 85%)',
                WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, transparent 85%)',
              }}
            >
              {/* Reflected Device Body */}
              <div
                className="w-[280px] sm:w-[320px] aspect-[393/852] rounded-[48px] p-[4px] box-border opacity-70"
                style={{
                  background: 'linear-gradient(145deg, #3d4347 0%, #1c1f24 40%, #0d0e12 100%)',
                }}
              >
                <div className="w-full h-full bg-[#151c19] rounded-[41px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

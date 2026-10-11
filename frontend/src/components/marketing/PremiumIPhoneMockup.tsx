import type { ReactNode } from 'react';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
  badgeText?: string;
}

export default function PremiumIPhoneMockup({ children, className = '' }: IPhoneMockupProps) {
  return (
    <div
      className={`relative w-[260px] sm:w-[290px] md:w-[310px] aspect-[393/830] rounded-[48px] sm:rounded-[52px] bg-gradient-to-b from-[#2D3330] via-[#1A201D] to-[#0D110F] p-[3px] shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.12)] select-none ${className}`}
    >
      {/* Outer Titanium Edge Highlight */}
      <div className="absolute inset-0 rounded-[48px] sm:rounded-[52px] border border-white/20 pointer-events-none z-50" />

      {/* Side Hardware Buttons */}
      {/* Action Button */}
      <div className="absolute top-[88px] -left-[3px] w-[3px] h-[24px] bg-[#3B4540] rounded-l-[2px] border-l border-white/20 z-40" />
      {/* Volume Up */}
      <div className="absolute top-[124px] -left-[3px] w-[3px] h-[44px] bg-[#3B4540] rounded-l-[2px] border-l border-white/20 z-40" />
      {/* Volume Down */}
      <div className="absolute top-[178px] -left-[3px] w-[3px] h-[44px] bg-[#3B4540] rounded-l-[2px] border-l border-white/20 z-40" />
      {/* Power / Siri Button */}
      <div className="absolute top-[140px] -right-[3px] w-[3px] h-[64px] bg-[#3B4540] rounded-r-[2px] border-r border-white/20 z-40" />

      {/* Black Outer Bezel Frame */}
      <div className="relative w-full h-full bg-[#0A0D0C] rounded-[45px] sm:rounded-[49px] p-[6px] sm:p-[7px] overflow-hidden shadow-inner flex flex-col">
        {/* Dynamic Island Cutout */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[92px] sm:w-[100px] h-[24px] sm:h-[26px] bg-[#000000] rounded-full z-50 flex items-center justify-between px-3 shadow-md border border-white/10 pointer-events-none">
          {/* Subtle sensor glow */}
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
          {/* TrueDepth Camera Lens with sapphire reflection */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#070B12] border border-white/15 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#1A2D48]" />
          </div>
        </div>

        {/* Inner Phone Screen Display */}
        <div className="relative w-full h-full bg-[#FAFAF7] rounded-[39px] sm:rounded-[43px] overflow-hidden flex flex-col">
          {children}

          {/* iOS Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/25 rounded-full z-50 pointer-events-none" />

          {/* Subtle Gloss Reflection Across Screen */}
          <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-[45%] -translate-y-[45%] bg-gradient-to-b from-white/[0.08] via-transparent to-transparent rotate-[25deg] pointer-events-none z-40 mix-blend-overlay" />
        </div>
      </div>
    </div>
  );
}

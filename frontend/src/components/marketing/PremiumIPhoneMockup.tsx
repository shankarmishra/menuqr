import type { ReactNode } from 'react';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
  badgeText?: string;
}

export default function PremiumIPhoneMockup({ children, className = '' }: IPhoneMockupProps) {
  return (
    <div
      className={`relative w-[240px] sm:w-[280px] md:w-[300px] aspect-[393/820] rounded-[42px] sm:rounded-[48px] bg-gradient-to-br from-[#3D4742] via-[#1F2724] to-[#0A0D0C] p-[3px] shadow-[0_30px_70px_rgba(0,0,0,0.55),0_0_25px_rgba(0,0,0,0.25)_inset] select-none ${className}`}
    >
      {/* Outer Metallic Bezel Edge Highlight */}
      <div className="absolute inset-0 rounded-[42px] sm:rounded-[48px] border border-white/20 pointer-events-none z-50" />

      {/* Side Buttons */}
      <div className="absolute top-[100px] -left-[3.5px] w-[3.5px] h-[32px] bg-[#2A3430] rounded-l-md z-40" />
      <div className="absolute top-[148px] -left-[3.5px] w-[3.5px] h-[50px] bg-[#2A3430] rounded-l-md z-40" />
      <div className="absolute top-[210px] -left-[3.5px] w-[3.5px] h-[50px] bg-[#2A3430] rounded-l-md z-40" />
      <div className="absolute top-[165px] -right-[3.5px] w-[3.5px] h-[70px] bg-[#2A3430] rounded-r-md z-40" />

      {/* Black Screen Frame */}
      <div className="relative w-full h-full bg-[#0A0D0C] rounded-[39px] sm:rounded-[45px] p-[6px] sm:p-[8px] overflow-hidden shadow-inner">
        {/* Dynamic Island Cutout */}
        <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[88px] sm:w-[98px] h-[25px] sm:h-[27px] bg-[#0A0D0C] rounded-full z-50 flex items-center justify-end px-2.5 shadow-md border border-white/10">
          <div className="w-3.5 h-3.5 rounded-full bg-[#151C19] border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e2e45]" />
          </div>
        </div>

        {/* Inner Phone Screen Display */}
        <div className="relative w-full h-full bg-[#FAFAF7] rounded-[33px] sm:rounded-[39px] overflow-hidden flex flex-col">
          {children}

          {/* Subtle Glass Reflection Overlay */}
          <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-[45%] -translate-y-[45%] bg-gradient-to-b from-white/10 via-white/5 to-transparent rotate-[25deg] pointer-events-none z-40 mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}

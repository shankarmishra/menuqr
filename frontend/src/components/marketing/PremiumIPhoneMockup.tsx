import type { ReactNode } from 'react';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
  badgeText?: string;
}

export default function PremiumIPhoneMockup({ children, className = '' }: IPhoneMockupProps) {
  return (
    <div
      className={`relative w-[220px] sm:w-[260px] aspect-[393/820] rounded-[38px] sm:rounded-[44px] bg-gradient-to-br from-[#E2E2E2] via-[#999999] to-[#3B3B3B] p-[2.5px] shadow-[0_25px_60px_rgba(0,0,0,0.45),0_0_20px_rgba(0,0,0,0.15)_inset] select-none ${className}`}
    >
      {/* Outer Metallic Bezel Highlights */}
      <div className="absolute inset-0 rounded-[38px] sm:rounded-[44px] shadow-[inset_0_0_6px_rgba(255,255,255,0.8)] pointer-events-none z-50 mix-blend-overlay" />

      {/* Side Buttons */}
      <div className="absolute top-[90px] -left-[3px] w-[3px] h-[30px] bg-[#666666] rounded-l-md z-40" />
      <div className="absolute top-[135px] -left-[3px] w-[3px] h-[48px] bg-[#666666] rounded-l-md z-40" />
      <div className="absolute top-[195px] -left-[3px] w-[3px] h-[48px] bg-[#666666] rounded-l-md z-40" />
      <div className="absolute top-[150px] -right-[3px] w-[3px] h-[65px] bg-[#666666] rounded-r-md z-40" />

      {/* Black Screen Frame */}
      <div className="relative w-full h-full bg-black rounded-[36px] sm:rounded-[42px] p-[6px] sm:p-[7px] overflow-hidden shadow-inner">
        {/* Dynamic Island */}
        <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[85px] sm:w-[95px] h-[24px] sm:h-[26px] bg-black rounded-full z-50 flex items-center justify-end px-2.5 shadow-md border border-white/10">
          <div className="w-3.5 h-3.5 rounded-full bg-[#0d0d0d] border border-white/10 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1e1e60] blur-[0.5px]" />
          </div>
        </div>

        {/* Inner Phone Screen Display */}
        <div className="relative w-full h-full bg-[#FAFAF7] rounded-[30px] sm:rounded-[36px] overflow-hidden flex flex-col">
          {children}

          {/* Glass Glare Overlay */}
          <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-[40%] -translate-y-[40%] bg-gradient-to-b from-white/15 to-transparent rotate-[28deg] pointer-events-none z-40 mix-blend-screen" />
        </div>
      </div>
    </div>
  );
}

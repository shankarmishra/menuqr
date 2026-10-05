import type { ReactNode } from 'react';

interface HeroPhoneProps {
  children: ReactNode;
  className?: string;
}

export default function HeroPhone({ children, className = '' }: HeroPhoneProps) {
  return (
    <div className={`relative w-[260px] sm:w-[300px] aspect-[393/852] rounded-[48px] sm:rounded-[56px] bg-gradient-to-br from-[#d9d9d9] via-[#8c8c8c] to-[#363636] p-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_20px_rgba(0,0,0,0.1)_inset] perspective-1000 transform-gpu ${className}`}>
      
      {/* Outer Metallic Frame (Titanium/Steel finish) */}
      <div className="absolute inset-0 rounded-[48px] sm:rounded-[56px] shadow-[inset_0_0_8px_rgba(255,255,255,0.7),inset_0_4px_6px_rgba(255,255,255,0.5)] pointer-events-none z-50 mix-blend-overlay" />
      
      {/* Physical Hardware Buttons */}
      {/* Mute Switch */}
      <div className="absolute top-[100px] -left-[2px] w-[2px] h-[25px] bg-gradient-to-r from-[#444] to-[#666] rounded-l-md shadow-[inset_1px_0_2px_rgba(255,255,255,0.2)] z-40" />
      {/* Volume Up */}
      <div className="absolute top-[145px] -left-[3px] w-[3px] h-[50px] bg-gradient-to-r from-[#555] to-[#777] rounded-l-md shadow-[inset_1px_0_2px_rgba(255,255,255,0.3)] z-40" />
      {/* Volume Down */}
      <div className="absolute top-[215px] -left-[3px] w-[3px] h-[50px] bg-gradient-to-r from-[#555] to-[#777] rounded-l-md shadow-[inset_1px_0_2px_rgba(255,255,255,0.3)] z-40" />
      {/* Power Button */}
      <div className="absolute top-[170px] -right-[3px] w-[3px] h-[75px] bg-gradient-to-l from-[#555] to-[#777] rounded-r-md shadow-[inset_-1px_0_2px_rgba(255,255,255,0.3)] z-40" />

      {/* Screen Bezel (The actual black border of the glass) */}
      <div className="relative w-full h-full bg-black rounded-[46px] sm:rounded-[54px] p-[6px] sm:p-[8px] overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
        
        {/* Dynamic Island (Camera Cutout) */}
        <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[100px] sm:w-[110px] h-[30px] sm:h-[34px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1),0_5px_15px_rgba(0,0,0,0.5)] border border-white/5">
           {/* Camera Lens detail inside the island */}
           <div className="w-4 h-4 rounded-full bg-[#0a0a0a] border border-white/10 shadow-[inset_0_0_4px_rgba(255,255,255,0.2)] flex items-center justify-center">
             <div className="w-1.5 h-1.5 rounded-full bg-[#111188] blur-[1px]" />
           </div>
        </div>

        {/* Screen Area */}
        <div className="relative w-full h-full bg-white rounded-[40px] sm:rounded-[46px] overflow-hidden">
          
          {/* Main App Content */}
          {children}

          {/* Screen Glass Reflection Overlay */}
          <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-[40%] -translate-y-[40%] bg-gradient-to-b from-white/10 to-transparent rotate-[30deg] pointer-events-none z-40 mix-blend-screen" />
          
          {/* Subtle Screen Glare (Bottom up) */}
          <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-white/5 to-transparent pointer-events-none z-40" />
        </div>
      </div>
    </div>
  );
}



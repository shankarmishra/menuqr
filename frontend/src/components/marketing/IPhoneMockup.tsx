import { Wifi, Battery, Signal } from 'lucide-react';

interface IPhoneMockupProps {
  children: React.ReactNode;
  className?: string;
  badgeText?: string;
  showStatusBar?: boolean;
}

export const IPhoneMockup: React.FC<IPhoneMockupProps> = ({
  children,
  className = '',
  badgeText,
  showStatusBar = true,
}) => {
  return (
    <div
      className={`relative mx-auto w-[300px] sm:w-[320px] md:w-[340px] rounded-[48px] bg-[#0c100e] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-white/10 transition-transform duration-500 hover:scale-[1.01] ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer Titanium Frame Accents */}
      <div className="absolute inset-0 rounded-[48px] border border-white/15 pointer-events-none" />
      <div className="absolute -left-[3px] top-28 h-12 w-[3px] rounded-l bg-[#2a3530]" /> {/* Volume Up */}
      <div className="absolute -left-[3px] top-44 h-12 w-[3px] rounded-l bg-[#2a3530]" /> {/* Volume Down */}
      <div className="absolute -right-[3px] top-36 h-16 w-[3px] rounded-r bg-[#2a3530]" /> {/* Power Button */}

      {/* Screen Container */}
      <div className="relative overflow-hidden rounded-[38px] bg-[#151c19] text-white aspect-[9/19.5] flex flex-col shadow-inner">
        {/* Dynamic Island Header */}
        {showStatusBar && (
          <div className="relative z-30 pt-3 px-6 pb-2 flex justify-between items-center bg-gradient-to-b from-[#151c19]/90 to-transparent">
            {/* Status Bar Clock */}
            <span className="text-[11px] font-semibold text-white/90 tracking-tight">9:41</span>

            {/* Dynamic Island Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 h-4 w-24 bg-black rounded-full flex items-center justify-between px-2 shadow-sm border border-white/5">
              <div className="h-2 w-2 rounded-full bg-[#151c19] border border-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            </div>

            {/* Status Bar Icons */}
            <div className="flex items-center gap-1.5 text-white/90">
              <Signal size={11} />
              <Wifi size={11} />
              <Battery size={13} className="fill-white" />
            </div>
          </div>
        )}

        {/* Optional Context Badge */}
        {badgeText && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 bg-[#e8783c] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md border border-white/20 animate-fade-in">
            {badgeText}
          </div>
        )}

        {/* Screen Content Body */}
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col">
          {children}
        </div>

        {/* Glass Reflection Highlight Layer */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent z-40" />

        {/* Home Indicator Bar */}
        <div className="relative z-30 py-1.5 flex justify-center bg-gradient-to-t from-[#151c19] to-transparent">
          <div className="h-1 w-32 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default IPhoneMockup;

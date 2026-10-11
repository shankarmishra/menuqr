import type { ReactNode } from 'react';

export interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  screenStyle?: React.CSSProperties;
  innerClassName?: string;
  badgeText?: string;

  // Status Bar & Safe Area configuration
  showStatusBar?: boolean;
  statusBarTheme?: 'dark' | 'light';
  statusBarMode?: 'reserved' | 'overlay';
  statusBarBg?: string;
  statusBarBgStyle?: React.CSSProperties;

  // Dynamic Island & Home Indicator configuration
  showDynamicIsland?: boolean;
  showHomeIndicator?: boolean;
  homeIndicatorTheme?: 'dark' | 'light';

  // Overrides
  time?: string;
}

export default function PremiumIPhoneMockup({
  children,
  className = '',
  screenClassName = 'bg-[#FAFAF7]',
  screenStyle,
  innerClassName = '',
  showStatusBar = true,
  statusBarTheme = 'dark',
  statusBarMode = 'reserved',
  statusBarBg = 'bg-transparent',
  statusBarBgStyle,
  showDynamicIsland = true,
  showHomeIndicator = true,
  homeIndicatorTheme,
  time = '9:41',
}: PhoneMockupProps) {
  const isLightText = statusBarTheme === 'light';
  const resolvedHomeTheme = homeIndicatorTheme || (isLightText ? 'light' : 'dark');

  return (
    <div
      className={`relative w-[260px] sm:w-[290px] md:w-[310px] aspect-[393/852] rounded-[48px] sm:rounded-[52px] bg-gradient-to-b from-[#343B37] via-[#1C221F] to-[#0E1210] p-[3px] shadow-[0_28px_70px_-10px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.14)] select-none box-border ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Outer Titanium Edge Subtle Chamfer */}
      <div className="absolute inset-0 rounded-[48px] sm:rounded-[52px] border border-white/10 pointer-events-none z-30" />

      {/* Side Hardware Buttons */}
      {/* Action Button */}
      <div className="absolute top-[88px] -left-[3px] w-[3px] h-[24px] bg-[#363E3A] rounded-l-[2px] border-l border-white/20 z-20 pointer-events-none" />
      {/* Volume Up */}
      <div className="absolute top-[124px] -left-[3px] w-[3px] h-[44px] bg-[#363E3A] rounded-l-[2px] border-l border-white/20 z-20 pointer-events-none" />
      {/* Volume Down */}
      <div className="absolute top-[178px] -left-[3px] w-[3px] h-[44px] bg-[#363E3A] rounded-l-[2px] border-l border-white/20 z-20 pointer-events-none" />
      {/* Power / Side Button */}
      <div className="absolute top-[140px] -right-[3px] w-[3px] h-[64px] bg-[#363E3A] rounded-r-[2px] border-r border-white/20 z-20 pointer-events-none" />

      {/* Black Outer Bezel Frame Chassis */}
      <div className="relative w-full h-full bg-[#0A0D0C] rounded-[45px] sm:rounded-[49px] p-[6px] sm:p-[7px] box-border flex flex-col">
        {/* Inner Phone Screen Display Viewport */}
        <div
          className={`relative w-full h-full rounded-[39px] sm:rounded-[42px] overflow-hidden isolate flex flex-col box-border ${screenClassName}`}
          style={screenStyle}
        >
          {/* iOS Top Status Bar Area */}
          {showStatusBar ? (
            <div
              className={`w-full ${
                statusBarMode === 'reserved'
                  ? 'h-[40px] sm:h-[44px] shrink-0'
                  : 'absolute top-0 inset-x-0 h-[40px] sm:h-[44px] z-40 pointer-events-none'
              } flex items-center justify-between px-6 sm:px-7 select-none ${statusBarBg} ${
                isLightText ? 'text-white' : 'text-[#151C19]'
              }`}
              style={statusBarBgStyle}
            >
              {/* Left: Clock Time */}
              <span className="text-[11px] sm:text-[12px] font-sans font-semibold tracking-tight tabular-nums pl-0.5">
                {time}
              </span>

              {/* Center: Dynamic Island Cutout */}
              {showDynamicIsland ? (
                <div className="w-[90px] sm:w-[98px] h-[23px] sm:h-[25px] bg-[#000000] rounded-full flex items-center justify-between px-2.5 shadow-sm border border-white/10 shrink-0 pointer-events-none select-none">
                  {/* Active Sensor / Microphone indicator */}
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
                  {/* TrueDepth Camera Lens with sapphire reflection */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#070B12] border border-white/15 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-[#1A2D48]" />
                  </div>
                </div>
              ) : (
                <div className="w-1" />
              )}

              {/* Right: Hardware Status Icons */}
              <div className="flex items-center gap-1.5 pr-0.5 opacity-90">
                {/* Cellular Signal (4 bars SVG) */}
                <svg width="13" height="10" viewBox="0 0 17 11" fill="none" className="shrink-0" aria-hidden="true">
                  <rect x="0" y="8" width="3" height="3" rx="0.75" fill="currentColor" />
                  <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.75" fill="currentColor" />
                  <rect x="9" y="3" width="3" height="8" rx="0.75" fill="currentColor" />
                  <rect x="13.5" y="0" width="3" height="11" rx="0.75" fill="currentColor" />
                </svg>
                {/* Wi-Fi Icon */}
                <svg width="12" height="10" viewBox="0 0 16 12" fill="currentColor" className="shrink-0" aria-hidden="true">
                  <path d="M8 9.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM4.1 7.2a5.5 5.5 0 017.8 0 .9.9 0 001.3-1.3 7.3 7.3 0 00-10.4 0 .9.9 0 101.3 1.3zM1.3 4.4a9.5 9.5 0 0113.4 0 .9.9 0 001.3-1.3 11.3 11.3 0 00-16 0 .9.9 0 001.3 1.3z" />
                </svg>
                {/* Battery Indicator */}
                <div className="flex items-center gap-[1px] shrink-0" aria-hidden="true">
                  <div className="w-[18px] h-[9.5px] rounded-[2.5px] border border-current p-[1px] flex items-center">
                    <div className="w-full h-full rounded-[1px] bg-current" />
                  </div>
                  <div className="w-[1.5px] h-[3.5px] rounded-r-[1px] bg-current opacity-80" />
                </div>
              </div>
            </div>
          ) : showDynamicIsland ? (
            /* Standalone Dynamic Island when status bar is disabled */
            <div className="absolute top-[8px] sm:top-[9px] left-1/2 -translate-x-1/2 w-[90px] sm:w-[98px] h-[23px] sm:h-[25px] bg-[#000000] rounded-full z-40 flex items-center justify-between px-2.5 shadow-sm border border-white/10 pointer-events-none select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/90 animate-pulse" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#070B12] border border-white/15 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#1A2D48]" />
              </div>
            </div>
          ) : null}

          {/* Screen Content Viewport */}
          <div
            className={`flex-1 min-h-0 w-full relative flex flex-col ${
              statusBarMode === 'reserved' ? 'overflow-hidden' : 'h-full overflow-hidden'
            } ${innerClassName}`}
          >
            {children}
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          {showHomeIndicator && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full z-40 pointer-events-none">
              <div
                className={`w-full h-full rounded-full ${
                  resolvedHomeTheme === 'light' ? 'bg-white/35' : 'bg-black/25'
                }`}
              />
            </div>
          )}

          {/* Subtle Top Screen Glass Sheen */}
          <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none z-20" />
        </div>
      </div>
    </div>
  );
}

// Named alias for unified phone mockup
export { PremiumIPhoneMockup as PhoneMockup };

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
  const hasCustomWidth = /\bw-\S+/.test(className);
  const widthClasses = hasCustomWidth ? '' : 'w-[260px] sm:w-[290px] md:w-[310px]';

  return (
    <div
      className={`relative ${widthClasses} aspect-[393/852] rounded-[48px] sm:rounded-[52px] bg-gradient-to-b from-[#2E3330] via-[#1B1E1C] to-[#101312] p-[3px] select-none box-border ${className}`}
      style={{
        boxSizing: 'border-box',
        isolation: 'isolate',
        boxShadow:
          '0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 40px 80px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.9)',
      }}
    >
      {/* Outer Titanium Edge Micro-Chamfer */}
      <div className="absolute inset-0 rounded-[48px] sm:rounded-[52px] border border-white/10 pointer-events-none z-30" />

      {/* Discrete Nano-Molded Antenna Bands */}
      <div className="absolute top-[68px] -left-[3px] w-[3px] h-[3px] bg-[#141715] z-30 pointer-events-none" />
      <div className="absolute top-[68px] -right-[3px] w-[3px] h-[3px] bg-[#141715] z-30 pointer-events-none" />
      <div className="absolute bottom-[96px] -left-[3px] w-[3px] h-[3px] bg-[#141715] z-30 pointer-events-none" />
      <div className="absolute bottom-[96px] -right-[3px] w-[3px] h-[3px] bg-[#141715] z-30 pointer-events-none" />

      {/* Side Hardware Buttons (Precision CNC Titanium Finish) */}
      {/* Action Button */}
      <div
        className="absolute top-[82px] -left-[3.5px] w-[3.5px] h-[22px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset -1px 0 0 rgba(0,0,0,0.5)',
        }}
      />
      {/* Volume Up */}
      <div
        className="absolute top-[118px] -left-[3.5px] w-[3.5px] h-[40px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset -1px 0 0 rgba(0,0,0,0.5)',
        }}
      />
      {/* Volume Down */}
      <div
        className="absolute top-[170px] -left-[3.5px] w-[3.5px] h-[40px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset -1px 0 0 rgba(0,0,0,0.5)',
        }}
      />
      {/* Power / Side Button */}
      <div
        className="absolute top-[134px] -right-[3.5px] w-[3.5px] h-[58px] bg-[#2A2E2C] rounded-r-[2px] z-20 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 1px 0 0 rgba(0,0,0,0.5)',
        }}
      />

      {/* Black Outer Bezel Frame Chassis (Ultra-Sleek Uniform Border) */}
      <div className="relative w-full h-full bg-[#060807] rounded-[45px] sm:rounded-[49px] p-[3.5px] sm:p-[4px] box-border flex flex-col overflow-hidden">
        {/* Inner Phone Screen Display Viewport */}
        <div
          className={`relative w-full h-full rounded-[42px] sm:rounded-[45px] overflow-hidden isolate flex flex-col box-border ${screenClassName}`}
          style={{
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
            ...screenStyle,
          }}
        >
          {/* Top Speaker Micro-Slit */}
          <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#0A0D0B] rounded-full z-50 pointer-events-none border-t border-white/10" />

          {/* iOS Top Status Bar Area */}
          {showStatusBar ? (
            <div
              className={`w-full ${
                statusBarMode === 'reserved'
                  ? 'h-[38px] sm:h-[42px] shrink-0'
                  : 'absolute top-0 inset-x-0 h-[38px] sm:h-[42px] z-40 pointer-events-none'
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
                <div className="w-[88px] sm:w-[96px] h-[22px] sm:h-[24px] bg-[#000000] rounded-full flex items-center justify-between px-2.5 shadow-sm border border-white/10 shrink-0 pointer-events-none select-none">
                  {/* Stealth FaceID / Ambient Sensor */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#080B09] border border-white/5 opacity-80" />
                  {/* TrueDepth Camera Lens with sapphire anti-reflective optics */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#080D14] border border-white/15 flex items-center justify-center relative overflow-hidden">
                    {/* Blue/Cyan anti-reflective coating specular arc */}
                    <div className="absolute inset-0 rounded-full border-t border-cyan-400/25" />
                    <div className="w-1 h-1 rounded-full bg-[#16253B]" />
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
            <div className="absolute top-[8px] sm:top-[9px] left-1/2 -translate-x-1/2 w-[88px] sm:w-[96px] h-[22px] sm:h-[24px] bg-[#000000] rounded-full z-40 flex items-center justify-between px-2.5 shadow-sm border border-white/10 pointer-events-none select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-[#080B09] border border-white/5 opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#080D14] border border-white/15 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 rounded-full border-t border-cyan-400/25" />
                <div className="w-1 h-1 rounded-full bg-[#16253B]" />
              </div>
            </div>
          ) : null}

          {/* Screen Content Viewport */}
          <div
            className={`flex-1 min-h-0 w-full relative flex flex-col ${
              statusBarMode === 'reserved' ? 'overflow-hidden' : 'h-full overflow-hidden'
            } ${innerClassName}`}
            style={{ contain: 'paint' }}
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

          {/* Photorealistic Oleophobic Glass Sheen (Subtle Diagonal Specular Reflection) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.015] to-transparent pointer-events-none z-30"
            style={{
              background:
                'linear-gradient(130deg, rgba(255, 255, 255, 0.07) 0%, rgba(255, 255, 255, 0.015) 32%, transparent 60%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Named alias for unified phone mockup
export { PremiumIPhoneMockup as PhoneMockup };

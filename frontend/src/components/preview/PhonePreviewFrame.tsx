import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import { derivePalette } from '../../design-system/palette';
import {
  DEFAULT_VIEWPORT_WIDTH,
  DEFAULT_VIEWPORT_HEIGHT,
  FRAME_BORDER_HORIZONTAL,
  FRAME_BORDER_VERTICAL,
  type PhonePreviewFrameProps,
  type PhonePreviewSyncMessage,
  type PhonePreviewSyncPayload,
} from './previewTypes';

export * from './previewTypes';

/**
 * Standard 390x844 iPhone Viewport Frame with Iframe Isolation & Real-Time postMessage Bridge
 *
 * Implements MENUQR Blueprint Sections 5.5 & 7.7:
 *   - The preview is the real customer view at standard 390x844 iPhone viewport.
 *   - When screen space is tight (e.g. tablet or narrow sidebar), a CSS scale-to-fit
 *     transform `scale(min(1, availableWidth / 410))` preserves the exact 390px
 *     internal layout without clipping or horizontal scroll.
 *   - Same-origin iframe provides full media query and viewport isolation.
 *   - postMessage payload synchronises theme, colors, font pairing, and preset changes in real-time.
 */
export default function PhonePreviewFrame({
  children,
  theme,
  presetId,
  palette,
  viewportWidth = DEFAULT_VIEWPORT_WIDTH,
  viewportHeight = DEFAULT_VIEWPORT_HEIGHT,
  scaleToFit = true,
  badgeText,
  statusBarTheme,
  showDynamicIsland = true,
  showHomeIndicator = true,
  className = '',
  screenClassName = '',
  screenStyle,
  scrollRef,
  useIframe = true,
  onSyncMessage,
  time = '9:41',
}: PhonePreviewFrameProps) {
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeMountNode, setIframeMountNode] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);

  const targetFrameWidth = viewportWidth + FRAME_BORDER_HORIZONTAL;
  const targetFrameHeight = viewportHeight + FRAME_BORDER_VERTICAL;

  // Responsive scale-to-fit calculation
  useEffect(() => {
    if (!scaleToFit) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      if (!outerWrapperRef.current) return;
      const availableWidth = outerWrapperRef.current.clientWidth || targetFrameWidth;
      if (availableWidth < targetFrameWidth) {
        const computedScale = Math.max(0.4, availableWidth / targetFrameWidth);
        setScale(computedScale);
      } else {
        setScale(1);
      }
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined' && outerWrapperRef.current) {
      const ro = new ResizeObserver(() => updateScale());
      ro.observe(outerWrapperRef.current);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }
  }, [scaleToFit, targetFrameWidth]);

  // Handle iframe document setup and stylesheet synchronization
  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Copy stylesheets, style tags, and fonts from parent document head
      const parentHead = document.head;
      const headNodes = parentHead.querySelectorAll('link[rel="stylesheet"], style');
      
      // Clear existing styles if any
      const iframeHead = iframeDoc.head;
      iframeHead.innerHTML = `
        <meta charset="utf-8" />
        <meta name="viewport" content="width=${viewportWidth}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-size-adjust: 100%;
          }
          /* Custom scrollbar matching MENUQR theme */
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 9999px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.35); }
        </style>
      `;

      headNodes.forEach((node) => {
        iframeHead.appendChild(node.cloneNode(true));
      });

      // Set target background
      const bgColor = palette?.bg || (theme?.mode === 'dark' ? '#12100e' : '#fafaf7');
      iframeDoc.body.style.backgroundColor = bgColor;

      setIframeMountNode(iframeDoc.body);
    } catch {
      // Fallback if cross-origin or sandbox prevents direct access
      setIframeMountNode(null);
    }
  }, [viewportWidth, palette?.bg, theme?.mode]);

  // Sync background color changes to iframe document
  useEffect(() => {
    if (iframeMountNode) {
      const bgColor = palette?.bg || (theme?.mode === 'dark' ? '#12100e' : '#fafaf7');
      iframeMountNode.style.backgroundColor = bgColor;
    }
  }, [iframeMountNode, palette?.bg, theme?.mode]);

  // postMessage broadcaster for live real-time synchronization
  useEffect(() => {
    const payload: PhonePreviewSyncPayload = {
      theme: theme ?? null,
      presetId: presetId || theme?.presetId,
      colors: theme
        ? {
            seed: theme.brand.seedColor,
            mode: theme.mode,
            palette: derivePalette(theme.brand.seedColor, theme.mode),
          }
        : undefined,
      fontPairing: theme?.typePair,
      slots: theme?.slots,
      signatureId: theme?.signatureId,
      timestamp: Date.now(),
    };

    const message: PhonePreviewSyncMessage = {
      type: 'MENUQR_THEME_SYNC',
      payload,
    };

    // Send to iframe contentWindow
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(message, '*');
      } catch {
        // Safe ignore
      }
    }

    // Also send on window for in-DOM components
    if (typeof window !== 'undefined') {
      window.postMessage(message, '*');
    }
  }, [theme, presetId, palette]);

  // postMessage listener
  useEffect(() => {
    if (!onSyncMessage || typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MENUQR_THEME_SYNC' && event.data.payload) {
        onSyncMessage(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSyncMessage]);

  // Resolve status bar contrast
  const isDarkBg = theme?.mode === 'dark' || (palette?.bg ? isColorDark(palette.bg) : true);
  const resolvedStatusTheme = statusBarTheme || (isDarkBg ? 'light' : 'dark');
  const isLightStatusText = resolvedStatusTheme === 'light';

  const scaledContainerHeight = Math.round(targetFrameHeight * scale);

  return (
    <div
      ref={outerWrapperRef}
      className={`phone-preview-wrapper w-full flex justify-center items-start select-none ${className}`}
      style={{
        height: `${scaledContainerHeight}px`,
        maxWidth: `${targetFrameWidth}px`,
        position: 'relative',
      }}
    >
      {/* 390x844 Outer Device Frame Chassis */}
      <div
        className="phone-device-frame relative rounded-[48px] bg-gradient-to-b from-[#2E3330] via-[#1B1E1C] to-[#101312] p-[3px] select-none box-border shadow-2xl"
        style={{
          width: `${targetFrameWidth}px`,
          height: `${targetFrameHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
          isolation: 'isolate',
          boxShadow:
            '0 4px 12px -2px rgba(0, 0, 0, 0.4), 0 20px 48px -10px rgba(0, 0, 0, 0.65), 0 40px 80px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Outer Titanium Micro-Chamfer */}
        <div className="absolute inset-0 rounded-[48px] border border-white/10 pointer-events-none z-30" />

        {/* Hardware Buttons */}
        {/* Action Button */}
        <div className="absolute top-[72px] -left-[3.5px] w-[3.5px] h-[22px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none" />
        {/* Volume Up */}
        <div className="absolute top-[108px] -left-[3.5px] w-[3.5px] h-[40px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none" />
        {/* Volume Down */}
        <div className="absolute top-[158px] -left-[3.5px] w-[3.5px] h-[40px] bg-[#2A2E2C] rounded-l-[2px] z-20 pointer-events-none" />
        {/* Power Button */}
        <div className="absolute top-[120px] -right-[3.5px] w-[3.5px] h-[58px] bg-[#2A2E2C] rounded-r-[2px] z-20 pointer-events-none" />

        {/* Inner Black Bezel Chassis */}
        <div className="relative w-full h-full bg-[#0A0D0C] rounded-[45px] p-[7px] box-border flex flex-col overflow-hidden">
          {/* Exact Viewport Display Area (390 x 844) */}
          <div
            className={`relative rounded-[38px] overflow-hidden isolate flex flex-col box-border ${screenClassName}`}
            style={{
              width: `${viewportWidth}px`,
              height: `${viewportHeight}px`,
              backgroundColor: palette?.bg || (theme?.mode === 'dark' ? '#12100e' : '#fafaf7'),
              ...screenStyle,
            }}
          >
            {/* Top Speaker Micro-Slit */}
            <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#0A0D0B] rounded-full z-50 pointer-events-none border-t border-white/10" />

            {/* iOS Top Status Bar Area */}
            <div
              className={`w-full h-[38px] shrink-0 px-6 flex items-center justify-between text-[11px] font-semibold tracking-tight z-40 relative select-none pointer-events-none ${
                isLightStatusText ? 'text-white' : 'text-stone-900'
              }`}
            >
              {/* Left: Time & optional badge */}
              <div className="flex items-center gap-1.5 pl-0.5">
                <span className="font-semibold tracking-tight">{time}</span>
                {badgeText && (
                  <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold uppercase tracking-wider backdrop-blur-xs">
                    {badgeText}
                  </span>
                )}
              </div>

              {/* Center: Dynamic Island / Notch */}
              {showDynamicIsland ? (
                <div className="w-[96px] h-[24px] bg-[#000000] rounded-full flex items-center justify-between px-2.5 shadow-sm border border-white/10 shrink-0 pointer-events-none select-none">
                  {/* Stealth FaceID / Ambient Sensor */}
                  <div className="w-1.5 h-1.5 rounded-full bg-[#080B09] border border-white/5 opacity-80" />
                  {/* TrueDepth Camera Lens with sapphire optics */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#080D14] border border-white/15 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 rounded-full border-t border-cyan-400/25" />
                    <div className="w-1 h-1 rounded-full bg-[#16253B]" />
                  </div>
                </div>
              ) : (
                <div className="w-1" />
              )}

              {/* Right: Hardware Status Icons */}
              <div className="flex items-center gap-1.5 pr-0.5 opacity-90">
                {/* Cellular Signal */}
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

            {/* Inner Viewport Screen Content */}
            <div
              className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden"
              style={{ contain: 'paint' }}
            >
              {useIframe && typeof window !== 'undefined' ? (
                <>
                  <iframe
                    ref={iframeRef}
                    title="Live Phone Menu Preview"
                    onLoad={handleIframeLoad}
                    className="w-full h-full border-none m-0 p-0 block bg-transparent"
                    style={{
                      width: `${viewportWidth}px`,
                      height: '100%',
                      border: 'none',
                    }}
                  />
                  {iframeMountNode && createPortal(children, iframeMountNode)}
                </>
              ) : (
                <div
                  ref={scrollRef}
                  className="w-full h-full overflow-y-auto mq-showcase-preview-frame"
                  style={{ width: `${viewportWidth}px` }}
                >
                  {children}
                </div>
              )}
            </div>

            {/* iOS Bottom Home Indicator Bar */}
            {showHomeIndicator && (
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full z-40 pointer-events-none">
                <div
                  className={`w-full h-full rounded-full ${
                    isLightStatusText ? 'bg-white/35' : 'bg-black/25'
                  }`}
                />
              </div>
            )}

            {/* Specular Oleophobic Glass Sheen */}
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
    </div>
  );
}

function isColorDark(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length < 6) return true;
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 128;
}

export { PhonePreviewFrame as PreviewFrame };

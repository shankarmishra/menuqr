import React, { useEffect, useRef } from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimQrScanner
 * Motion Asset ID: `anim-qr-scanner`
 * Version: 1.0.0
 * 
 * Interactive Micro-Animation:
 * - Dynamic laser sweep scanning down an authentic MENUQR table standee.
 * - Corner finder brackets locking onto target.
 * - Saffron and emerald data packets radiating on successful scan.
 */
export const AnimQrScanner: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
  onComplete,
}) => {
  const animRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!loop && isPlaying && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 2500 / speed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, loop, speed, onComplete]);

  const duration = 2.4 / speed;

  return (
    <svg
      ref={animRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="QR Scanning Interactive Animation"
    >
      <defs>
        {/* Glow Gradients */}
        <linearGradient id="mq-laser-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8783C" stopOpacity="0" />
          <stop offset="25%" stopColor="#E8783C" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FFC928" stopOpacity="1" />
          <stop offset="75%" stopColor="#34B56A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34B56A" stopOpacity="0" />
        </linearGradient>

        <linearGradient id="mq-standee-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E2A24" />
          <stop offset="100%" stopColor="#101714" />
        </linearGradient>

        <radialGradient id="mq-laser-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC928" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#E8783C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#151C19" stopOpacity="0" />
        </radialGradient>

        <filter id="mq-scanner-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <style>{`
          @keyframes mqLaserSweep {
            0% { transform: translateY(0px); opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { transform: translateY(115px); opacity: 0; }
          }
          @keyframes mqBracketLock {
            0%, 100% { transform: scale(1.06); }
            50% { transform: scale(0.98); }
          }
          @keyframes mqPacketBurst {
            0% { transform: scale(0.6); opacity: 0; }
            50% { opacity: 0.9; }
            100% { transform: scale(1.3); opacity: 0; }
          }
          .mq-laser-beam {
            animation: mqLaserSweep ${duration}s ease-in-out ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .mq-bracket {
            animation: mqBracketLock ${duration}s ease-in-out ${loop ? 'infinite' : '1'};
            transform-origin: 160px 140px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .mq-packet-aura {
            animation: mqPacketBurst ${duration}s ease-out ${loop ? 'infinite' : '1'};
            transform-origin: 160px 140px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      {/* Backdrop plate */}
      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Realistic Table QR Standee (Walnut / Acrylic Base) */}
      <g id="table-standee" transform="translate(75, 45)">
        {/* Wooden / Acrylic Base Stand */}
        <polygon points="10,185 160,185 150,198 20,198" fill="#2E1F14" stroke="#D4A359" strokeWidth="1" />
        <rect x="25" y="198" width="120" height="6" rx="2" fill="#1A120B" />

        {/* Acrylic Vertical Plate */}
        <rect
          x="15"
          y="10"
          width="140"
          height="175"
          rx="10"
          fill="url(#mq-standee-body)"
          stroke="#D4A359"
          strokeWidth="1.5"
        />

        {/* Brand Header */}
        <rect x="25" y="20" width="120" height="22" rx="4" fill="#0C1310" />
        <circle cx="36" cy="31" r="4" fill="#E8783C" />
        <text x="46" y="34" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.5">
          Menus<tspan fill="#E8783C">QR</tspan>
        </text>
        <text x="110" y="34" fill="#D4A359" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold">
          TABLE 05
        </text>

        {/* White Matte QR Plaque */}
        <rect x="25" y="48" width="120" height="118" rx="6" fill="#FAFAF7" />

        {/* QR Matrix Geometry */}
        {/* Top Left Finder */}
        <rect x="35" y="58" width="26" height="26" fill="#151C19" rx="3" />
        <rect x="39" y="62" width="18" height="18" fill="#FAFAF7" rx="1" />
        <rect x="43" y="66" width="10" height="10" fill="#151C19" rx="1" />

        {/* Top Right Finder */}
        <rect x="109" y="58" width="26" height="26" fill="#151C19" rx="3" />
        <rect x="113" y="62" width="18" height="18" fill="#FAFAF7" rx="1" />
        <rect x="117" y="66" width="10" height="10" fill="#151C19" rx="1" />

        {/* Bottom Left Finder */}
        <rect x="35" y="130" width="26" height="26" fill="#151C19" rx="3" />
        <rect x="39" y="134" width="18" height="18" fill="#FAFAF7" rx="1" />
        <rect x="43" y="138" width="10" height="10" fill="#151C19" rx="1" />

        {/* QR Bits / Data Cells */}
        <rect x="67" y="58" width="8" height="8" fill="#151C19" rx="1" />
        <rect x="79" y="58" width="6" height="6" fill="#151C19" rx="1" />
        <rect x="91" y="58" width="8" height="8" fill="#151C19" rx="1" />
        <rect x="67" y="70" width="6" height="6" fill="#151C19" rx="1" />
        <rect x="79" y="72" width="12" height="6" fill="#151C19" rx="1" />
        <rect x="97" y="70" width="6" height="6" fill="#151C19" rx="1" />
        <rect x="67" y="84" width="14" height="6" fill="#151C19" rx="1" />
        <rect x="89" y="84" width="6" height="14" fill="#151C19" rx="1" />
        <rect x="101" y="88" width="6" height="6" fill="#151C19" rx="1" />
        <rect x="115" y="88" width="8" height="8" fill="#151C19" rx="1" />

        <rect x="67" y="100" width="6" height="12" fill="#151C19" rx="1" />
        <rect x="79" y="104" width="14" height="6" fill="#151C19" rx="1" />
        <rect x="105" y="104" width="8" height="6" fill="#151C19" rx="1" />
        <rect x="119" y="104" width="6" height="6" fill="#151C19" rx="1" />

        <rect x="67" y="120" width="12" height="6" fill="#151C19" rx="1" />
        <rect x="85" y="118" width="6" height="14" fill="#151C19" rx="1" />
        <rect x="97" y="120" width="14" height="6" fill="#151C19" rx="1" />
        <rect x="117" y="122" width="8" height="8" fill="#151C19" rx="1" />

        <rect x="67" y="136" width="6" height="12" fill="#151C19" rx="1" />
        <rect x="79" y="136" width="8" height="8" fill="#151C19" rx="1" />
        <rect x="93" y="134" width="12" height="6" fill="#151C19" rx="1" />
        <rect x="111" y="136" width="6" height="14" fill="#151C19" rx="1" />

        {/* Center Brand Mark Dot */}
        <circle cx="85" cy="107" r="7" fill="#E8783C" />
        <circle cx="85" cy="107" r="4.5" fill="#FAFAF7" />
        <rect x="83.5" y="105.5" width="3" height="3" fill="#E8783C" />

        {/* Pulse aura emitting from center */}
        <circle cx="85" cy="107" r="28" fill="url(#mq-laser-aura)" className="mq-packet-aura" />

        {/* ── LASER SWEEP SCANNER ── */}
        <g className="mq-laser-beam" transform="translate(20, 52)">
          {/* Laser Line */}
          <line x1="0" y1="0" x2="130" y2="0" stroke="url(#mq-laser-grad)" strokeWidth="3.5" filter="url(#mq-scanner-glow)" />
          {/* Intense center bead */}
          <ellipse cx="65" cy="0" rx="20" ry="3.5" fill="#FFE066" filter="url(#mq-scanner-glow)" />
          <circle cx="65" cy="0" r="2" fill="#FFFFFF" />
          {/* Vertical light trailing gradient */}
          <rect x="0" y="-14" width="130" height="14" fill="url(#mq-laser-aura)" opacity="0.6" />
        </g>
      </g>

      {/* Target Corner Finder Brackets */}
      <g className="mq-bracket">
        {/* Top-Left */}
        <path d="M 90 92 L 90 80 L 102 80" fill="none" stroke="#E8783C" strokeWidth="2.5" strokeLinecap="round" />
        {/* Top-Right */}
        <path d="M 218 80 L 230 80 L 230 92" fill="none" stroke="#E8783C" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bottom-Left */}
        <path d="M 90 196 L 90 208 L 102 208" fill="none" stroke="#34B56A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Bottom-Right */}
        <path d="M 218 208 L 230 208 L 230 196" fill="none" stroke="#34B56A" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Status Pill Badge at bottom */}
      <g transform="translate(90, 246)">
        <rect x="0" y="0" width="140" height="24" rx="12" fill="#182721" stroke="#2E4439" strokeWidth="1" />
        <circle cx="14" cy="12" r="3.5" fill="#34B56A">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.4s" repeatCount="indefinite" />
        </circle>
        <text x="24" y="16" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">
          LIVE OPTICAL LOCK
        </text>
        <text x="114" y="15" fill="#FFC928" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
          ⚡ 40ms
        </text>
      </g>
    </svg>
  );
};

export default AnimQrScanner;

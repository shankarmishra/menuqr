import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimPaymentStamp (Motion Asset #6)
 * Rubber Stamp Slam: Heavy ink rubber stamp slamming onto thermal bill receipt with ink splatter and paper vibration.
 */
export const AnimPaymentStamp: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 1.8 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="Payment Stamp Slam Animation"
    >
      <defs>
        <style>{`
          @keyframes psSlam {
            0% { transform: scale(2.4) translate(-30px, -40px) rotate(-18deg); opacity: 0; }
            45% { opacity: 0.2; }
            50% { transform: scale(0.94) rotate(-5deg); opacity: 1; }
            65% { transform: scale(1.04) rotate(-5deg); opacity: 1; }
            75%, 100% { transform: scale(1) rotate(-5deg); opacity: 1; }
          }
          @keyframes psVibrate {
            0%, 48% { transform: translateY(0); }
            50% { transform: translateY(3px); }
            55% { transform: translateY(-2px); }
            60% { transform: translateY(1px); }
            65%, 100% { transform: translateY(0); }
          }
          @keyframes psSplatter {
            0%, 49% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1); opacity: 1; }
            80%, 100% { transform: scale(1.3); opacity: 0; }
          }
          .ps-stamp {
            animation: psSlam ${duration}s cubic-bezier(0.25, 1, 0.5, 1) ${loop ? 'infinite' : '1'};
            transform-origin: 160px 140px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .ps-paper {
            animation: psVibrate ${duration}s ease-in-out ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .ps-splatter-dots {
            animation: psSplatter ${duration}s ease-out ${loop ? 'infinite' : '1'};
            transform-origin: 160px 140px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* 80mm Thermal Receipt with Paper Vibration */}
      <g className="ps-paper" transform="translate(85, 30)">
        <path
          d="M 0 0 L 150 0 L 150 215 
             L 140 210 L 130 215 L 120 210 L 110 215 L 100 210 L 90 215 L 80 210 L 70 215 L 60 210 L 50 215 L 40 210 L 30 215 L 20 210 L 10 215 L 0 210 Z"
          fill="#FAFAF7"
          stroke="#D8D2C4"
          strokeWidth="1.2"
        />
        <text x="75" y="24" textAnchor="middle" fill="#151C19" fontSize="8" fontFamily="Courier, monospace" fontWeight="bold">
          MANNAT DHABA
        </text>
        <line x1="12" y1="34" x2="138" y2="34" stroke="#151C19" strokeWidth="1" strokeDasharray="3 3" />
        <text x="14" y="48" fill="#151C19" fontSize="7" fontFamily="Courier, monospace">TBL: #04 • TOKEN #024</text>
        <text x="14" y="64" fill="#333333" fontSize="6.5" fontFamily="Courier, monospace">2x Paneer Tikka  640.00</text>
        <text x="14" y="78" fill="#333333" fontSize="6.5" fontFamily="Courier, monospace">2x Butter Naan   120.00</text>
        <line x1="12" y1="88" x2="138" y2="88" stroke="#151C19" strokeWidth="1" strokeDasharray="3 3" />
        <text x="14" y="104" fill="#151C19" fontSize="8" fontFamily="Courier, monospace" fontWeight="bold">TOTAL: ₹760.00</text>
      </g>

      {/* Ink Splatter Particles radiating on impact */}
      <g className="ps-splatter-dots">
        <circle cx="110" cy="120" r="3" fill="#25A25A" />
        <circle cx="215" cy="115" r="2.5" fill="#25A25A" />
        <circle cx="120" cy="180" r="3.5" fill="#25A25A" />
        <circle cx="210" cy="175" r="2" fill="#25A25A" />
      </g>

      {/* Heavy Green "PAID" Rubber Stamp Slam */}
      <g className="ps-stamp" transform="translate(160, 145)">
        <rect x="-55" y="-18" width="110" height="36" rx="4" fill="none" stroke="#25A25A" strokeWidth="3.5" strokeDasharray="70 4 70 4" />
        <text x="0" y="8" textAnchor="middle" fill="#25A25A" fontSize="22" fontFamily="sans-serif" fontWeight="900" letterSpacing="3">
          PAID
        </text>
      </g>
    </svg>
  );
};

export default AnimPaymentStamp;

import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimWaiterToKitchen (Motion Asset #3)
 * Token Glide Trajectory: Order slip gliding smoothly from waiter terminal to kitchen display rail with bounce.
 */
export const AnimWaiterToKitchen: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 2.4 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="Order Glide from Waiter to Kitchen"
    >
      <defs>
        <linearGradient id="wk-path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34B56A" />
          <stop offset="50%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#E8783C" />
        </linearGradient>

        <style>{`
          @keyframes wkSlip {
            0% { transform: translate(50px, 190px) scale(0.7); opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { transform: translate(220px, 70px) scale(1); opacity: 0; }
          }
          @keyframes wkPathDash {
            0% { stroke-dashoffset: 180; }
            100% { stroke-dashoffset: 0; }
          }
          .wk-slip-anim {
            animation: wkSlip ${duration}s cubic-bezier(0.25, 1, 0.5, 1) ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .wk-trail {
            stroke-dasharray: 6 6;
            animation: wkPathDash ${duration}s linear ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Origin: Waiter Station (Bottom Left) */}
      <g transform="translate(30, 170)">
        <rect x="0" y="0" width="70" height="70" rx="10" fill="#16251E" stroke="#2A4032" strokeWidth="1.5" />
        <circle cx="35" cy="25" r="10" fill="#34B56A" opacity="0.3" />
        <circle cx="35" cy="25" r="5" fill="#34B56A" />
        <text x="35" y="48" textAnchor="middle" fill="#FAFAF7" fontSize="7" fontFamily="sans-serif" fontWeight="bold">WAITER DESK</text>
        <text x="35" y="58" textAnchor="middle" fill="#8FA69B" fontSize="6" fontFamily="sans-serif">Table #08</text>
      </g>

      {/* Destination: Kitchen Station Rail (Top Right) */}
      <g transform="translate(220, 40)">
        <rect x="0" y="0" width="75" height="70" rx="10" fill="#16251E" stroke="#E8783C" strokeWidth="1.5" />
        <circle cx="37" cy="25" r="10" fill="#E8783C" opacity="0.3" />
        <circle cx="37" cy="25" r="5" fill="#E8783C" />
        <text x="37" y="48" textAnchor="middle" fill="#FAFAF7" fontSize="7" fontFamily="sans-serif" fontWeight="bold">CHEF KDS</text>
        <text x="37" y="58" textAnchor="middle" fill="#FFC928" fontSize="6" fontFamily="sans-serif">Cooking Station</text>
      </g>

      {/* Curved Trajectory Guideline */}
      <path
        d="M 65 170 C 90 90, 160 80, 220 75"
        fill="none"
        stroke="url(#wk-path-grad)"
        strokeWidth="2.5"
        className="wk-trail"
      />

      {/* Gliding Digital Order Ticket */}
      <g className="wk-slip-anim">
        <rect x="-24" y="-16" width="48" height="32" rx="4" fill="#FAFAF7" stroke="#34B56A" strokeWidth="1.5" />
        <rect x="-18" y="-10" width="36" height="5" rx="1" fill="#E8783C" />
        <line x1="-18" y1="2" x2="10" y2="2" stroke="#333333" strokeWidth="1.5" />
        <line x1="-18" y1="8" x2="5" y2="8" stroke="#666666" strokeWidth="1.2" />
      </g>
    </svg>
  );
};

export default AnimWaiterToKitchen;

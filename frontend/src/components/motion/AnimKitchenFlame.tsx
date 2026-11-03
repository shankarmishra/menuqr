import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimKitchenFlame (Motion Asset #7)
 * Wok Fire Sizzle: Rhythmic dancing flame particles beneath wok with curling fragrant steam wafts.
 */
export const AnimKitchenFlame: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 1.4 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="Wok Fire Sizzle Motion"
    >
      <defs>
        <linearGradient id="kf-fire" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#C0392B" />
          <stop offset="40%" stopColor="#E8783C" />
          <stop offset="80%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#FFF2A8" />
        </linearGradient>

        <style>{`
          @keyframes kfDance {
            0%, 100% { transform: scaleY(1) skewX(0deg); }
            33% { transform: scaleY(1.2) skewX(3deg); }
            66% { transform: scaleY(0.9) skewX(-3deg); }
          }
          @keyframes kfSteam {
            0% { transform: translateY(0) scaleX(1); opacity: 0.8; }
            100% { transform: translateY(-40px) scaleX(1.4); opacity: 0; }
          }
          .kf-flames {
            animation: kfDance ${duration}s ease-in-out ${loop ? 'infinite' : '1'};
            transform-origin: 160px 170px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .kf-steam-waft {
            animation: kfSteam ${duration * 1.8}s ease-out ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#110B08" stroke="#3D2619" strokeWidth="1.5" />

      {/* Fragrant Steam Trails rising from wok */}
      <g className="kf-steam-waft" transform="translate(130, 80)">
        <path d="M 10 30 C 5 15, 20 10, 15 -10" fill="none" stroke="#E8783C" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        <path d="M 40 25 C 45 10, 30 5, 35 -15" fill="none" stroke="#FFC928" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </g>

      {/* Sizzling Wok Pan */}
      <g transform="translate(160, 120)">
        <ellipse cx="0" cy="10" rx="75" ry="24" fill="#1F1A17" stroke="#4A3F38" strokeWidth="2" />
        <path d="M -75 10 C -75 55, 75 55, 75 10 Z" fill="#14110E" stroke="#38302A" strokeWidth="1.5" />
        {/* Brass Wok Handles */}
        <path d="M -78 8 C -90 4, -90 18, -78 14" fill="none" stroke="#D4A359" strokeWidth="3" strokeLinecap="round" />
        <path d="M 78 8 C 90 4, 90 18, 78 14" fill="none" stroke="#D4A359" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Dancing Tandoori Fire Particles underneath */}
      <g className="kf-flames" transform="translate(160, 160)">
        {/* Main Center Fire Tongue */}
        <path d="M -40 10 Q -20 -45, 0 -60 Q 20 -45, 40 10 Q 0 5, -40 10 Z" fill="url(#kf-fire)" opacity="0.9" />
        <path d="M -25 10 Q 0 -40, 25 10 Z" fill="#FFF2A8" opacity="0.95" />
        {/* Flanking Ember Sparks */}
        <circle cx="-50" cy="-10" r="3" fill="#FFC928" />
        <circle cx="50" cy="-15" r="2.5" fill="#E8783C" />
        <circle cx="20" cy="-68" r="2" fill="#FFA64D" />
      </g>

      {/* Cooking Stage Banner below */}
      <g transform="translate(60, 220)">
        <rect x="0" y="0" width="200" height="42" rx="10" fill="#241710" stroke="#E8783C" strokeWidth="1.2" />
        <circle cx="20" cy="21" r="5" fill="#E8783C" />
        <text x="32" y="19" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">COOKING IN PROGRESS</text>
        <text x="32" y="32" fill="#FFA64D" fontSize="7.5" fontFamily="sans-serif">Freshly prepared on high flame</text>
      </g>
    </svg>
  );
};

export default AnimKitchenFlame;

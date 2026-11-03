import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimMenuPublish (Motion Asset #4)
 * Instant Sync Ripple: 86 toggle switch glide with emerald flash and radiating ripple across menu cards.
 */
export const AnimMenuPublish: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 2.2 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="Instant Menu Publish and 86 Toggle"
    >
      <defs>
        <style>{`
          @keyframes mpToggle {
            0%, 45% { transform: translateX(0px); fill: #FF5E4D; }
            55%, 100% { transform: translateX(32px); fill: #34B56A; }
          }
          @keyframes mpTrack {
            0%, 45% { fill: #381B17; stroke: #FF5E4D; }
            55%, 100% { fill: #1B3828; stroke: #34B56A; }
          }
          @keyframes mpRipple {
            0%, 45% { r: 10px; opacity: 0; }
            55% { opacity: 0.8; }
            100% { r: 70px; opacity: 0; }
          }
          .mp-thumb {
            animation: mpToggle ${duration}s ease-in-out ${loop ? 'infinite' : '1'} alternate;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .mp-track {
            animation: mpTrack ${duration}s ease-in-out ${loop ? 'infinite' : '1'} alternate;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .mp-ripple-ring {
            animation: mpRipple ${duration}s ease-out ${loop ? 'infinite' : '1'} alternate;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Ripple ring from toggle */}
      <circle cx="160" cy="110" r="10" fill="none" stroke="#34B56A" strokeWidth="2" className="mp-ripple-ring" />

      {/* Menu Dish Card Preview */}
      <g transform="translate(45, 45)">
        <rect x="0" y="0" width="230" height="130" rx="12" fill="#17241E" stroke="#2D4235" strokeWidth="1.5" />
        <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="14" y="14" width="45" height="45" preserveAspectRatio="xMidYMid meet" />
        <text x="68" y="30" fill="#FAFAF7" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold">Paneer Tikka</text>
        <text x="68" y="44" fill="#FFC928" fontSize="10" fontFamily="sans-serif" fontWeight="900">₹320</text>
        
        {/* Toggle Switch */}
        <g transform="translate(85, 75)">
          <rect x="0" y="0" width="60" height="28" rx="14" className="mp-track" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="10" className="mp-thumb" />
        </g>
      </g>

      {/* Toast Notification Status below */}
      <g transform="translate(50, 200)">
        <rect x="0" y="0" width="220" height="46" rx="10" fill="#182A21" stroke="#34B56A" strokeWidth="1.5" />
        <circle cx="24" cy="23" r="6" fill="#34B56A" />
        <text x="38" y="20" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">INSTANT 86 SYNCED</text>
        <text x="38" y="34" fill="#A8D8BC" fontSize="7" fontFamily="sans-serif">Item state updated on 40 tables in 1.2s</text>
      </g>
    </svg>
  );
};

export default AnimMenuPublish;

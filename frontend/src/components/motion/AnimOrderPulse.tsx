import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimOrderPulse (Motion Asset #2)
 * Incoming Order Bell Wave: Reception bell tilting with radiating soundwaves and spring-loaded counter badge.
 */
export const AnimOrderPulse: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 2 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="New Order Pulse Notification"
    >
      <defs>
        <radialGradient id="op-wave" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8783C" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#FFC928" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#151C19" stopOpacity="0" />
        </radialGradient>

        <style>{`
          @keyframes opRing {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(-12deg); }
            40% { transform: rotate(10deg); }
            60% { transform: rotate(-6deg); }
            80% { transform: rotate(4deg); }
          }
          @keyframes opWave {
            0% { r: 20px; opacity: 0.9; }
            100% { r: 90px; opacity: 0; }
          }
          @keyframes opBadge {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.25); }
          }
          .op-bell {
            animation: opRing ${duration}s ease-in-out ${loop ? 'infinite' : '1'};
            transform-origin: 160px 85px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .op-wave-1 {
            animation: opWave ${duration}s ease-out ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .op-wave-2 {
            animation: opWave ${duration}s ease-out ${loop ? 'infinite' : '1'} ${duration * 0.4}s;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .op-badge {
            animation: opBadge ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${loop ? 'infinite' : '1'};
            transform-origin: 205px 75px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Radiating Sound Waves */}
      <circle cx="160" cy="120" r="20" fill="url(#op-wave)" className="op-wave-1" />
      <circle cx="160" cy="120" r="20" fill="url(#op-wave)" className="op-wave-2" />

      {/* Reception Bell Base */}
      <ellipse cx="160" cy="175" rx="55" ry="14" fill="#0C1310" stroke="#384F41" strokeWidth="1.5" />
      <rect x="156" y="70" width="8" height="20" rx="3" fill="#D4A359" />
      <circle cx="160" cy="68" r="6" fill="#FFE066" />

      {/* Tilting Brass Bell Dome */}
      <g className="op-bell">
        <path d="M 120 160 C 120 100, 200 100, 200 160 C 205 165, 115 165, 120 160 Z" fill="#D4A359" stroke="#9C721A" strokeWidth="2" />
        <ellipse cx="160" cy="162" rx="42" ry="7" fill="#C28F3D" />
      </g>

      {/* Floating Counter Badge "+1 NEW ORDER" */}
      <g className="op-badge">
        <rect x="180" y="60" width="85" height="28" rx="14" fill="#E8783C" stroke="#FFA64D" strokeWidth="1.5" />
        <text x="222" y="78" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="900">
          +1 ORDER
        </text>
      </g>

      {/* Table & Item Ticket Toast below */}
      <g transform="translate(60, 205)">
        <rect x="0" y="0" width="200" height="48" rx="10" fill="#182720" stroke="#34B56A" strokeWidth="1.2" />
        <circle cx="20" cy="24" r="5" fill="#34B56A" />
        <text x="32" y="20" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold">Table #04 (Token #018)</text>
        <text x="32" y="34" fill="#FFC928" fontSize="7.5" fontFamily="sans-serif">2x Paneer Tikka • ₹640</text>
      </g>
    </svg>
  );
};

export default AnimOrderPulse;

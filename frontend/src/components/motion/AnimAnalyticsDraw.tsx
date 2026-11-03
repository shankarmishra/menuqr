import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimAnalyticsDraw (Motion Asset #8)
 * Trajectory Curve Draw: Smooth SVG stroke-dashoffset graph line drawing with staggered metric dot pop-ins.
 */
export const AnimAnalyticsDraw: React.FC<MotionAssetProps> = ({
  isPlaying = true,
  speed = 1,
  loop = true,
  reducedMotion = false,
  className = '',
}) => {
  const duration = 2.5 / speed;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 280"
      className={`select-none w-full h-auto max-w-sm mx-auto ${className}`}
      role="img"
      aria-label="Analytics Line Drawing Animation"
    >
      <defs>
        <linearGradient id="ad-curve-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8783C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E8783C" stopOpacity="0" />
        </linearGradient>

        <style>{`
          @keyframes adDraw {
            0% { stroke-dashoffset: 280; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes adPop {
            0%, 50% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.4); opacity: 1; }
            80%, 100% { transform: scale(1); opacity: 1; }
          }
          .ad-line {
            stroke-dasharray: 280;
            animation: adDraw ${duration}s ease-in-out ${loop ? 'infinite' : '1'} alternate;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .ad-dot-1 {
            animation: adPop ${duration}s ease-out ${loop ? 'infinite' : '1'} alternate;
            transform-origin: 100px 145px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .ad-dot-2 {
            animation: adPop ${duration}s ease-out ${loop ? 'infinite' : '1'} ${duration * 0.3}s alternate;
            transform-origin: 180px 105px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .ad-dot-3 {
            animation: adPop ${duration}s ease-out ${loop ? 'infinite' : '1'} ${duration * 0.6}s alternate;
            transform-origin: 270px 65px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Grid Lines */}
      <g stroke="#1F2F26" strokeWidth="1" strokeDasharray="3 3">
        <line x1="40" y1="70" x2="280" y2="70" />
        <line x1="40" y1="120" x2="280" y2="120" />
        <line x1="40" y1="170" x2="280" y2="170" />
      </g>

      {/* Gradient Fill under Path */}
      <path
        d="M 40 185 Q 90 170, 130 135 T 210 95 T 275 65 L 275 195 L 40 195 Z"
        fill="url(#ad-curve-fill)"
      />

      {/* Main Animated Stroke Line */}
      <path
        d="M 40 185 Q 90 170, 130 135 T 210 95 T 275 65"
        fill="none"
        stroke="#E8783C"
        strokeWidth="3.5"
        strokeLinecap="round"
        className="ad-line"
      />

      {/* Pop-In Data Dots */}
      <circle cx="100" cy="145" r="4.5" fill="#FFC928" className="ad-dot-1" />
      <circle cx="180" cy="105" r="4.5" fill="#34B56A" className="ad-dot-2" />
      <circle cx="270" cy="65" r="6" fill="#FFE580" stroke="#E8783C" strokeWidth="2" className="ad-dot-3" />

      {/* Live Value Pill */}
      <g transform="translate(195, 30)">
        <rect x="0" y="0" width="85" height="24" rx="12" fill="#E8783C" />
        <text x="42" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="900">
          +32.4% ARR
        </text>
      </g>
    </svg>
  );
};

export default AnimAnalyticsDraw;

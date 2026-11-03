import React from 'react';
import type { MotionAssetProps } from './types';

/**
 * AnimAddToCart (Motion Asset #5)
 * Parabolic Dish Toss: Floating dish disk scaling down into cart pill with star sparkle explosion.
 */
export const AnimAddToCart: React.FC<MotionAssetProps> = ({
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
      aria-label="Add Dish to Cart Interactive Motion"
    >
      <defs>
        <style>{`
          @keyframes atcToss {
            0% { transform: translate(50px, 80px) scale(1); opacity: 1; }
            50% { transform: translate(130px, 30px) scale(0.85); opacity: 1; }
            90% { transform: translate(220px, 175px) scale(0.35); opacity: 0.9; }
            100% { transform: translate(220px, 175px) scale(0.2); opacity: 0; }
          }
          @keyframes atcBounce {
            0%, 80% { transform: scale(1); }
            90% { transform: scale(1.18); }
            100% { transform: scale(1); }
          }
          @keyframes atcSparkle {
            0%, 80% { transform: scale(0); opacity: 0; }
            90% { transform: scale(1.4); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          .atc-flying-dish {
            animation: atcToss ${duration}s cubic-bezier(0.25, 1, 0.5, 1) ${loop ? 'infinite' : '1'};
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .atc-cart-btn {
            animation: atcBounce ${duration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${loop ? 'infinite' : '1'};
            transform-origin: 220px 185px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
          .atc-spark {
            animation: atcSparkle ${duration}s ease-out ${loop ? 'infinite' : '1'};
            transform-origin: 220px 185px;
            animation-play-state: ${isPlaying && !reducedMotion ? 'running' : 'paused'};
          }
        `}</style>
      </defs>

      <rect width="320" height="280" rx="16" fill="#131C18" stroke="#23342B" strokeWidth="1.5" />

      {/* Menu Dish Card Item */}
      <g transform="translate(30, 60)">
        <rect x="0" y="0" width="120" height="135" rx="10" fill="#16231C" stroke="#2A3D31" strokeWidth="1.2" />
        <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="15" y="12" width="90" height="55" preserveAspectRatio="xMidYMid meet" />
        <text x="14" y="85" fill="#FAFAF7" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Paneer Tikka</text>
        <text x="14" y="98" fill="#FFC928" fontSize="9" fontFamily="sans-serif" fontWeight="900">₹320</text>
        <rect x="14" y="106" width="92" height="18" rx="4" fill="#E8783C" />
        <text x="60" y="118" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold">+ ADD TO CART</text>
      </g>

      {/* Flying Miniature Plate along Parabolic Arc */}
      <g className="atc-flying-dish">
        <circle cx="0" cy="0" r="22" fill="#FAFAF7" stroke="#34B56A" strokeWidth="2" />
        <image href="/assets/dhaba-cover/paneer_tikka_masala.webp" x="-16" y="-16" width="32" height="32" preserveAspectRatio="xMidYMid meet" />
      </g>

      {/* Gold Sparkle Burst on Cart Impact */}
      <g className="atc-spark">
        <polygon points="220,165 223,178 235,180 223,182 220,195 217,182 205,180 217,178" fill="#FFC928" />
        <circle cx="238" cy="172" r="3" fill="#E8783C" />
        <circle cx="202" cy="195" r="2.5" fill="#34B56A" />
      </g>

      {/* Floating Cart Button */}
      <g className="atc-cart-btn" transform="translate(170, 165)">
        <rect x="0" y="0" width="105" height="42" rx="12" fill="#E8783C" stroke="#FFA64D" strokeWidth="1.5" />
        <circle cx="24" cy="21" r="10" fill="#FFFFFF" opacity="0.2" />
        <text x="42" y="19" fill="#FFFFFF" fontSize="8" fontFamily="sans-serif" fontWeight="bold">VIEW CART</text>
        <text x="42" y="31" fill="#FFE580" fontSize="9" fontFamily="sans-serif" fontWeight="900">1 Item • ₹320</text>
      </g>
    </svg>
  );
};

export default AnimAddToCart;

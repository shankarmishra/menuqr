import React from 'react';

/**
 * Rangeen Signature Art — Inline SVGs
 *
 * Vector ornaments inspired by Indian festive aesthetics, truck art, and dhaba signboards.
 * Uses currentColor or SVG fills without text nodes, ensuring zero truth-lint violations.
 */

export const CornerFlourish: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`atelier-corner-flourish ${className || ''}`}
    aria-hidden="true"
  >
    <path
      d="M2 2H12C12 7.52285 7.52285 12 2 12V2Z"
      fill="currentColor"
      fillOpacity="0.85"
    />
    <circle cx="16" cy="4" r="2" fill="currentColor" fillOpacity="0.6" />
    <circle cx="4" cy="16" r="2" fill="currentColor" fillOpacity="0.6" />
  </svg>
);

export const WaveDivider: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 400 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M0 6 Q 25 0, 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6 T 350 6 T 400 6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="100" cy="6" r="2" fill="currentColor" />
    <circle cx="200" cy="6" r="2.5" fill="currentColor" />
    <circle cx="300" cy="6" r="2" fill="currentColor" />
  </svg>
);

export const Starburst: React.FC<{ className?: string; size?: number }> = ({ className, size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 0L19.5 12.5L32 16L19.5 19.5L16 32L12.5 19.5L0 16L12.5 12.5L16 0Z"
      fill="currentColor"
    />
  </svg>
);

export const ChilliDoodle: React.FC<{ className?: string; size?: number }> = ({ className, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M18 4C16 4 14 5 12 7C9 10 7 14 8 18C8.5 20 10.5 21 12.5 20C15.5 18.5 17.5 15 18 11C18.5 7 18 4 18 4Z"
      fill="currentColor"
    />
    <path
      d="M18 4C19 2.5 20.5 2 22 2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const FestiveStamp: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
    <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    <path
      d="M24 12L26.5 21.5L36 24L26.5 26.5L24 36L21.5 26.5L12 24L21.5 21.5L24 12Z"
      fill="currentColor"
      fillOpacity="0.8"
    />
  </svg>
);

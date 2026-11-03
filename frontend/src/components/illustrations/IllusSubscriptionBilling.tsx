import React from 'react';
import type { IllustrationProps } from './types';
import { SIZE_MAP } from './types';

/**
 * IllusSubscriptionBilling (Asset #11)
 * Communicates: Zero-Lost-Days Protection, Indian Financial Year GST Invoicing, Validity Stacking.
 */
export const IllusSubscriptionBilling: React.FC<IllustrationProps> = ({
  size = 'responsive',
  theme = 'emerald',
  animated = true,
  title = 'MENUQR Subscription Billing',
  description = 'Subscription ledger with GST tax invoice seal and zero-lost-days renewal shield.',
  className = '',
  style,
  ...rest
}) => {
  const sizeConfig = SIZE_MAP[size];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 540 400"
      width={sizeConfig.width}
      className={`select-none ${sizeConfig.className || ''} ${className}`}
      style={style}
      role="img"
      aria-label={title}
      {...rest}
    >
      <defs>
        <linearGradient id="sb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B120F" />
          <stop offset="50%" stopColor="#14211A" />
          <stop offset="100%" stopColor="#080E0B" />
        </linearGradient>

        <linearGradient id="sb-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#FFC928" />
          <stop offset="100%" stopColor="#D4A359" />
        </linearGradient>

        <filter id="sb-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        {animated && (
          <style>{`
            @keyframes sbFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
            @keyframes sbSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .sb-float { animation: sbFloat 4.4s ease-in-out infinite; }
            .sb-seal-spin { animation: sbSpin 20s linear infinite; transform-origin: center; }
          `}</style>
        )}
      </defs>

      <rect width="540" height="400" rx="20" fill={theme === 'parchment' ? '#FAFAF7' : theme === 'neutral' ? '#222F29' : 'url(#sb-bg)'} />
      <rect x="20" y="20" width="500" height="360" rx="16" fill="#101915" stroke="#283C30" strokeWidth="1.5" />

      {/* Golden Validity Stacking Shield (Centerpiece) */}
      <g transform="translate(60, 60)" filter="url(#sb-shadow)">
        <path
          d="M 100 20 L 190 60 L 190 180 C 190 250, 100 280, 100 280 C 100 280, 10 250, 10 180 L 10 60 Z"
          fill="#16251E"
          stroke="url(#sb-gold)"
          strokeWidth="3.5"
        />
        {/* Inner Shield Layer */}
        <path
          d="M 100 38 L 175 72 L 175 174 C 175 230, 100 258, 100 258 C 100 258, 25 230, 25 174 L 25 72 Z"
          fill="#1C2E25"
          stroke="#34B56A"
          strokeWidth="1.5"
        />

        {/* Central Crown / Checkmark Icon */}
        <circle cx="100" cy="110" r="32" fill="#243A30" stroke="url(#sb-gold)" strokeWidth="2" />
        <path d="M 88 110 L 96 118 L 114 100" fill="none" stroke="#34B56A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Zero-Lost-Days Banner */}
        <rect x="30" y="158" width="140" height="28" rx="6" fill="#E8783C" />
        <text x="100" y="176" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontFamily="sans-serif" fontWeight="900" letterSpacing="0.5">
          ZERO LOST DAYS
        </text>

        <text x="100" y="206" textAnchor="middle" fill="#FFC928" fontSize="14" fontFamily="sans-serif" fontWeight="900">
          365 DAYS EXTENSION
        </text>
        <text x="100" y="222" textAnchor="middle" fill="#A4BDB1" fontSize="7.5" fontFamily="sans-serif">
          Stacked onto existing expiration
        </text>
      </g>

      {/* Official Indian GST Tax Invoice Document (Right) */}
      <g transform="translate(280, 70)" filter="url(#sb-shadow)">
        <rect x="0" y="0" width="195" height="245" rx="10" fill="#FAFAF7" stroke="#DCD6C8" strokeWidth="1.5" />
        {/* Invoice Top Header */}
        <rect x="0" y="0" width="195" height="34" rx="10" fill="#151C19" />
        <text x="14" y="21" fill="#FAFAF7" fontSize="8.5" fontFamily="sans-serif" fontWeight="900">
          TAX INVOICE (GST)
        </text>
        <text x="180" y="21" textAnchor="end" fill="#E8783C" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
          MQR/2026-27/00024
        </text>

        {/* Line Items */}
        <g transform="translate(14, 48)">
          <text x="0" y="10" fill="#555555" fontSize="6.5" fontFamily="monospace">ANNUAL SUBSCRIPTION</text>
          <text x="0" y="24" fill="#151C19" fontSize="8" fontFamily="sans-serif" fontWeight="bold">Premium Tier (Unlimited Edits)</text>
          <text x="165" y="24" textAnchor="end" fill="#151C19" fontSize="8" fontFamily="monospace" fontWeight="bold">₹4,999.00</text>

          <line x1="0" y1="36" x2="167" y2="36" stroke="#DDDDDD" strokeWidth="1" />

          <text x="0" y="52" fill="#555555" fontSize="7" fontFamily="sans-serif">CGST (9.0%)</text>
          <text x="165" y="52" textAnchor="end" fill="#333333" fontSize="7.5" fontFamily="monospace">₹449.91</text>

          <text x="0" y="68" fill="#555555" fontSize="7" fontFamily="sans-serif">SGST (9.0%)</text>
          <text x="165" y="68" textAnchor="end" fill="#333333" fontSize="7.5" fontFamily="monospace">₹449.91</text>

          <line x1="0" y1="80" x2="167" y2="80" stroke="#151C19" strokeWidth="1.2" />

          <text x="0" y="98" fill="#151C19" fontSize="9" fontFamily="sans-serif" fontWeight="900">NET TOTAL</text>
          <text x="165" y="98" textAnchor="end" fill="#151C19" fontSize="10" fontFamily="monospace" fontWeight="900">₹5,898.82</text>
        </g>

        {/* Certified Tax Seal Stamp */}
        <g transform="translate(135, 190)" className="sb-seal-spin">
          <circle cx="0" cy="0" r="22" fill="none" stroke="#25A25A" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="0" y="3" textAnchor="middle" fill="#25A25A" fontSize="5.5" fontFamily="sans-serif" fontWeight="bold">GST COMPLIANT</text>
        </g>
      </g>
    </svg>
  );
};

export default IllusSubscriptionBilling;

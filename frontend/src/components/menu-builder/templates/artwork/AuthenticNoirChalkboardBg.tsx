import React from 'react';

/**
 * Authentic Noir Chalkboard Background for Shobharam's Luxury Heritage Menu
 * Replaces generic fast-food graffiti with elegant, subtle culinary chalk dust,
 * faint golden constellation specks, and royal Indian culinary emblems.
 */
export const AuthenticNoirChalkboardBg: React.FC<{
  className?: string;
  opacity?: number;
}> = ({ className = '', opacity = 0.08 }) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity }}
    aria-hidden="true"
  >
    <defs>
      <pattern id="noirChalkPattern" width="240" height="240" patternUnits="userSpaceOnUse">
        {/* Subtle chalk dust stars & culinary motifs */}
        <g stroke="#D4AF37" strokeWidth="0.8" fill="none" opacity="0.6">
          {/* Star Anise / Spice Motif */}
          <path d="M 40 40 L 40 56 M 48 48 L 32 48 M 46 42 L 34 54 M 46 54 L 34 42" strokeWidth="1.2" />
          
          {/* Subtle Cooking Clay Handi Outline */}
          <path d="M 140 35 C 130 35, 125 45, 125 55 C 125 65, 135 70, 150 70 C 165 70, 175 65, 175 55 C 175 45, 170 35, 160 35 Z" />
          <line x1="135" y1="35" x2="165" y2="35" strokeWidth="1.5" />
          <path d="M 145 30 Q 150 25 155 30" strokeWidth="1" />

          {/* Steaming Aroma Whirls */}
          <path d="M 147 22 Q 145 15 149 10" strokeDasharray="2 2" />
          <path d="M 153 22 Q 155 15 151 10" strokeDasharray="2 2" />

          {/* Clove / Cardamom Pod */}
          <path d="M 200 120 C 195 110, 205 105, 210 115 C 215 125, 205 130, 200 120 Z" />
          <line x1="205" y1="125" x2="212" y2="135" />

          {/* Rolling Pin / Belan Outline */}
          <line x1="20" y1="150" x2="70" y2="175" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="147" x2="20" y2="150" strokeWidth="1.2" />
          <line x1="70" y1="175" x2="75" y2="178" strokeWidth="1.2" />

          {/* Brass Thali / Bowl Outline */}
          <ellipse cx="140" cy="180" rx="28" ry="12" />
          <ellipse cx="140" cy="178" rx="24" ry="10" strokeDasharray="3 3" />

          {/* Fine Stipple Dust */}
          <circle cx="85" cy="90" r="1" fill="#D4AF37" />
          <circle cx="95" cy="110" r="0.8" fill="#FFFFFF" />
          <circle cx="170" cy="130" r="1.2" fill="#D4AF37" />
          <circle cx="60" cy="210" r="0.8" fill="#FFFFFF" />
          <circle cx="210" cy="50" r="1" fill="#D4AF37" />
          <circle cx="190" cy="200" r="1" fill="#D4AF37" />
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#noirChalkPattern)" />
  </svg>
);

export default AuthenticNoirChalkboardBg;

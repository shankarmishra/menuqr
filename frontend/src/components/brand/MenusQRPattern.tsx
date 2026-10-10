export function MenusQRPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.045]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Heritage Jaali Latticework & Haveli Arch Pattern */}
        <pattern id="heritage-jaali" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Outer Jaali Lattice Grid */}
          <path
            d="M 60 0 L 120 60 L 60 120 L 0 60 Z"
            fill="none"
            stroke="#151C19"
            strokeWidth="0.5"
            strokeDasharray="3 3"
          />
          {/* Inner Architectural Arch Motifs */}
          <path
            d="M 60 20 C 75 20 90 35 90 60 C 90 85 75 100 60 100 C 45 100 30 85 30 60 C 30 35 45 20 60 20 Z"
            fill="none"
            stroke="#151C19"
            strokeWidth="0.6"
          />
          <path
            d="M 60 32 C 70 32 80 44 80 60 C 80 76 70 88 60 88 C 50 88 40 76 40 60 C 40 44 50 32 60 32 Z"
            fill="none"
            stroke="#E8783C"
            strokeWidth="0.4"
            opacity="0.6"
          />
          {/* Central Floral Star Accent */}
          <circle cx="60" cy="60" r="3" fill="#E8783C" opacity="0.7" />
          <circle cx="0" cy="0" r="2" fill="#151C19" opacity="0.4" />
          <circle cx="120" cy="0" r="2" fill="#151C19" opacity="0.4" />
          <circle cx="0" cy="120" r="2" fill="#151C19" opacity="0.4" />
          <circle cx="120" cy="120" r="2" fill="#151C19" opacity="0.4" />
        </pattern>
      </defs>

      {/* Repeating Indian Heritage Pattern */}
      <rect x="0" y="0" width="100%" height="100%" fill="url(#heritage-jaali)" />

      {/* Subtle Background Radial Ambient Rings */}
      <circle cx="15%" cy="25%" r="450" stroke="#151C19" strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="15%" cy="25%" r="650" stroke="#E8783C" strokeWidth="0.6" strokeDasharray="6 6" fill="none" opacity="0.25" />
      <circle cx="85%" cy="75%" r="550" stroke="#151C19" strokeWidth="0.8" fill="none" opacity="0.35" />
    </svg>
  );
}

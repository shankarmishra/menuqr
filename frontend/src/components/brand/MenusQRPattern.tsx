export function MenusQRPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="brand-corners" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 0 10 L 0 0 L 10 0" stroke="#151C19" strokeWidth="0.5" fill="none" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#brand-corners)" />
      
      {/* Large rings */}
      <circle cx="10%" cy="20%" r="400" stroke="#151C19" strokeWidth="1" fill="none" />
      <circle cx="10%" cy="20%" r="600" stroke="#151C19" strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="90%" cy="80%" r="500" stroke="#151C19" strokeWidth="1" fill="none" />
      <circle cx="90%" cy="80%" r="700" stroke="#151C19" strokeWidth="1" fill="none" opacity="0.5" />
      
      {/* Partial overlaps */}
      <circle cx="50%" cy="-20%" r="600" stroke="#E8783C" strokeWidth="1" fill="none" opacity="0.3" />
    </svg>
  );
}

export function MenusQRPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.045]"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Subtle Background Radial Ambient Rings */}
      <circle cx="15%" cy="25%" r="450" stroke="#151C19" strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="15%" cy="25%" r="650" stroke="#E8783C" strokeWidth="0.6" strokeDasharray="6 6" fill="none" opacity="0.25" />
      <circle cx="85%" cy="75%" r="550" stroke="#151C19" strokeWidth="0.8" fill="none" opacity="0.35" />
    </svg>
  );
}

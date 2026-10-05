export default function IndianPattern() {
  const patternSvg = `data:image/svg+xml,%3Csvg width='240' height='240' viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cg id='flower'%3E%3Cpath d='M 0,-18 C 12,-18 18,-6 18,0 C 18,6 12,18 0,18 C -12,18 -18,6 -18,0 C -18,-6 -12,-18 0,-18 Z' fill='none' stroke='%23E8783C' stroke-width='1.2' opacity='0.4' /%3E%3Cpath d='M 0,-12 C 6,-12 9,-4 9,0 C 9,4 6,12 0,12 C -6,12 -9,4 -9,0 C -9,-4 -6,-12 0,-12 Z' fill='%23E8783C' opacity='0.08' /%3E%3Ccircle cx='0' cy='0' r='3' fill='%23E8783C' opacity='0.6' /%3E%3C/g%3E%3Cg id='star'%3E%3Cpath d='M 0,-24 L 6,-6 L 24,0 L 6,6 L 0,24 L -6,6 L -24,0 L -6,-6 Z' fill='none' stroke='%23151C19' stroke-width='0.8' opacity='0.3' /%3E%3Cpath d='M 0,-18 L 4,-4 L 18,0 L 4,4 L 0,18 L -4,4 L -18,0 L -4,-4 Z' fill='%23E8783C' opacity='0.1' /%3E%3Ccircle cx='0' cy='0' r='2' fill='%23E8783C' opacity='0.5' /%3E%3C/g%3E%3Cg id='motif'%3E%3Cpath d='M 0,-55 C 20,-55 25,-25 55,0 C 25,25 20,55 0,55 C -20,55 -25,25 -55,0 C -25,-25 -20,-55 0,-55 Z' fill='none' stroke='%23151C19' stroke-width='1' opacity='0.15' /%3E%3Cpath d='M -55,0 C -55,20 -25,25 0,55 C 25,25 55,20 55,0 C 55,-20 25,-25 0,-55 C -25,-25 -55,-20 -55,0 Z' fill='none' stroke='%23151C19' stroke-width='1' opacity='0.15' /%3E%3Ccircle cx='0' cy='0' r='38' fill='none' stroke='%23E8783C' stroke-width='1' opacity='0.25' /%3E%3Ccircle cx='0' cy='0' r='34' fill='none' stroke='%23151C19' stroke-width='0.6' stroke-dasharray='4 4' opacity='0.25' /%3E%3Ccircle cx='0' cy='0' r='48' fill='none' stroke='%23151C19' stroke-width='0.4' opacity='0.1' /%3E%3Cuse href='%23flower' transform='scale(1.4)' /%3E%3Cuse href='%23flower' transform='rotate(45) scale(0.9)' /%3E%3Cuse href='%23flower' transform='rotate(90) scale(1.4)' /%3E%3Cuse href='%23flower' transform='rotate(135) scale(0.9)' /%3E%3C/g%3E%3C/defs%3E%3Crect width='240' height='240' fill='%23FAFAF7' /%3E%3Cuse href='%23motif' x='120' y='120' /%3E%3Cuse href='%23motif' x='0' y='0' /%3E%3Cuse href='%23motif' x='240' y='0' /%3E%3Cuse href='%23motif' x='0' y='240' /%3E%3Cuse href='%23motif' x='240' y='240' /%3E%3Cuse href='%23star' x='120' y='0' /%3E%3Cuse href='%23star' x='0' y='120' /%3E%3Cuse href='%23star' x='240' y='120' /%3E%3Cuse href='%23star' x='120' y='240' /%3E%3Cline x1='0' y1='120' x2='240' y2='120' stroke='%23151C19' stroke-width='0.5' stroke-dasharray='2 6' opacity='0.15' /%3E%3Cline x1='120' y1='0' x2='120' y2='240' stroke='%23151C19' stroke-width='0.5' stroke-dasharray='2 6' opacity='0.15' /%3E%3C/svg%3E`;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Full-bleed Seamless Indian Traditional Pattern */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url("${patternSvg}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '240px 240px',
          backgroundPosition: 'center',
          opacity: 0.8
        }}
      />
      {/* Soft gradient fade overlay so it doesn't overpower the text */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF7]/80 via-[#FAFAF7]/60 to-[#FAFAF7]/90" />
    </div>
  );
}

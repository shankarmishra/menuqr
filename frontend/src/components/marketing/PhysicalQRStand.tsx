import ScannableQRCode from './ScannableQRCode';
import { MenusQRBrand } from '../brand/MenusQRBrand';

interface PhysicalQRStandProps {
  qrUrl?: string;
  tableNumber?: string;
  className?: string;
  variant?: 'standard' | 'compact';
}

export default function PhysicalQRStand({
  qrUrl = 'https://menusqr.app/menu/the-garden',
  tableNumber = 'TABLE 12',
  className = '',
  variant = 'standard',
}: PhysicalQRStandProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`relative flex flex-col items-center justify-end select-none perspective-[1200px] ${
        isCompact
          ? 'w-[130px] sm:w-[150px] h-[195px] sm:h-[225px]'
          : 'w-[170px] sm:w-[195px] md:w-[210px] h-[260px] sm:h-[295px] md:h-[315px]'
      } ${className}`}
    >
      {/* 3D Tabletop Perspective Container */}
      <div
        className="relative w-full h-full flex flex-col items-center justify-end transition-transform duration-500 ease-out"
        style={{
          transform: isCompact
            ? 'rotateY(-4deg) rotateX(3deg)'
            : 'rotateY(-6deg) rotateX(4deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Grounded Dual-Layer Table Surface Contact Shadows */}
        {/* 1. Tight dark occlusion shadow immediately under brass base */}
        <div className="absolute -bottom-1.5 w-[84%] h-2.5 bg-black/75 blur-[2.5px] rounded-full transform scale-x-95 z-0 pointer-events-none" />
        {/* 2. Soft diffuse ambient table reflection shadow */}
        <div className="absolute -bottom-5 w-[112%] h-7 bg-black/25 blur-lg rounded-full transform scale-x-105 z-0 pointer-events-none" />

        {/* Refined Table Stand Indicator Badge (Calm & Non-Jittery) */}
        <div
          className={`absolute ${
            isCompact ? '-top-3 -right-2 px-2 py-0.5' : '-top-4 -right-4 px-2.5 py-1'
          } z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md rounded-full border border-stone-200/90 shadow-md text-[#151C19] pointer-events-none`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8783C]" />
          <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-extrabold uppercase tracking-wider`}>
            Tabletop QR
          </span>
        </div>

        {/* The Acrylic & Fine Cotton Card */}
        <div
          className={`relative z-10 ${
            isCompact
              ? 'w-[115px] sm:w-[132px] h-[170px] sm:h-[195px] p-2.5'
              : 'w-[152px] sm:w-[174px] md:w-[188px] h-[228px] sm:h-[258px] md:h-[276px] p-3.5 sm:p-4'
          } bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F1] to-[#F2EDE2] rounded-t-xl rounded-b-sm shadow-[0_4px_16px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col items-center border-t-2 border-[#D4AF37]/50 border-r border-l border-[#E6DFCFA0] transform translate-y-1.5`}
        >
          {/* Subtle Fine Cotton Paper Texture Overlay */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            }}
          />

          {/* Logo Mark */}
          <div className={`flex items-center gap-1.5 ${isCompact ? 'mb-1' : 'mb-2 sm:mb-2.5'} relative z-10`}>
            <MenusQRBrand size={isCompact ? 'xs' : 'sm'} />
          </div>

          {/* Headline */}
          <div
            className={`${
              isCompact ? 'text-[9px] leading-tight mb-2' : 'text-[10px] sm:text-[11px] leading-snug mb-2.5 sm:mb-3'
            } font-sans font-extrabold uppercase tracking-widest text-[#242926] text-center relative z-10`}
          >
            SCAN TO VIEW<br />OUR MENU
          </div>

          {/* Scannable Real QR SVG Container */}
          <div
            className={`bg-white ${
              isCompact ? 'p-1.5 rounded-lg' : 'p-2 sm:p-2.5 rounded-xl'
            } shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(0,0,0,0.06)] relative z-10 my-auto transform-gpu flex items-center justify-center`}
          >
            <ScannableQRCode url={qrUrl} size={isCompact ? 64 : 84} />
          </div>

          {/* Table Number */}
          <div
            className={`${
              isCompact ? 'text-[8px] pt-1.5 tracking-[0.2em]' : 'text-[9px] sm:text-[10px] pt-2 sm:pt-2.5 tracking-[0.24em]'
            } text-[#857B6C] font-bold uppercase mt-auto relative z-10 border-t border-[#E5DECF] w-full text-center`}
          >
            {tableNumber}
          </div>
        </div>

        {/* Weighted Brushed Brass Base */}
        <div
          className={`relative z-20 w-full ${
            isCompact ? 'h-[30px] sm:h-[34px]' : 'h-[36px] sm:h-[42px]'
          } bg-gradient-to-br from-[#E6CB94] via-[#CCA460] to-[#967133] rounded-md shadow-[0_12px_22px_rgba(0,0,0,0.38),inset_0_1.5px_2px_rgba(255,255,255,0.7),inset_0_-2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center border-t border-[#F5E6BD]`}
        >
          {/* Base Top Rim Bevel Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#FFF2CD]/50 rounded-t-md pointer-events-none" />

          {/* Precision Stand Slot Inlay */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[76%] h-[2.5px] bg-[#3B290E] rounded-b-sm shadow-inner pointer-events-none" />

          {/* Subtle Metallic Sheen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 opacity-40 pointer-events-none" />

          {/* Engraved Base Brand Label */}
          <div
            className={`text-[#4E3915] ${
              isCompact ? 'text-[8.5px] tracking-[0.2em]' : 'text-[9.5px] sm:text-[10.5px] tracking-[0.22em]'
            } font-black uppercase opacity-90 shadow-[0_1px_0_rgba(255,255,255,0.35)] relative z-10 translate-y-0.5`}
          >
            MENUSQR
          </div>
        </div>
      </div>
    </div>
  );
}

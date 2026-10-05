import ScannableQRCode from './ScannableQRCode';
import { MenusQRBrand } from '../brand/MenusQRBrand';

interface PhysicalQRStandProps {
  qrUrl?: string;
  tableNumber?: string;
  className?: string;
}

export default function PhysicalQRStand({
  qrUrl = 'https://menusqr.app/menu/the-garden',
  tableNumber = 'TABLE 12',
  className = '',
}: PhysicalQRStandProps) {
  return (
    <div className={`relative flex flex-col items-center justify-end w-[190px] sm:w-[220px] h-[280px] sm:h-[330px] select-none perspective-[1200px] ${className}`}>
      
      {/* 3D Wrapper */}
      <div className="relative w-full h-full flex flex-col items-center justify-end transition-transform duration-700 hover:rotate-0" 
           style={{ transform: 'rotateY(15deg) rotateX(10deg) rotateZ(-3deg)', transformStyle: 'preserve-3d' }}>
           
        {/* Table Surface Shadow */}
        <div className="absolute -bottom-6 w-[120%] h-12 bg-black/40 blur-xl rounded-[100%] transform scale-x-110 translate-z-[-20px]" />

        {/* Outer Floating Annotation Pill */}
        <div className="absolute -top-6 -right-8 z-30 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-lg text-[#151C19] animate-bounce-slow transform translate-z-[40px]">
          <span className="w-2 h-2 rounded-full bg-[#E8783C] animate-pulse" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">SCAN TO VIEW MENU</span>
        </div>

        {/* The Cream Card */}
        <div className="relative z-10 w-[170px] sm:w-[195px] h-[245px] sm:h-[290px] bg-[#FDFBF7] rounded-t-xl rounded-b-sm shadow-[2px_4px_12px_rgba(0,0,0,0.15),inset_-1px_-1px_2px_rgba(0,0,0,0.05),inset_1px_1px_2px_rgba(255,255,255,0.9)] overflow-hidden flex flex-col items-center p-4 border-r-[2px] border-b-[2px] border-[#E8E2D7] transform translate-y-2">
          
          {/* Card Thickness (Simulated with pseudo-elements or borders) */}
          <div className="absolute inset-0 rounded-t-xl rounded-b-sm border-[0.5px] border-[#7A6E63]/10 pointer-events-none" />

          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

          {/* Logo Mark */}
          <div className="flex items-center gap-1.5 mb-3 relative z-10">
            <MenusQRBrand size="sm" />
          </div>

          {/* Headline */}
          <div className="text-[11px] sm:text-[12px] font-sans font-extrabold uppercase tracking-widest text-[#2C302E] text-center leading-tight mb-4 relative z-10">
            SCAN TO VIEW<br />OUR MENU
          </div>

          {/* Scannable Real QR SVG Container */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(0,0,0,0.05)] relative z-10 my-auto transform-gpu">
            <ScannableQRCode url={qrUrl} size={100} />
          </div>

          {/* Table Number */}
          <div className="text-[10px] text-[#8C8476] font-bold uppercase tracking-[0.25em] mt-auto relative z-10 pt-4 border-t border-[#E8E2D7]/50 w-full text-center">
            {tableNumber}
          </div>
        </div>

        {/* Premium Wooden/Metallic Base */}
        <div className="relative z-20 w-full h-[40px] sm:h-[46px] bg-gradient-to-br from-[#E2C792] via-[#C9A363] to-[#9B773C] rounded-md shadow-[0_15px_25px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,0.6),inset_0_-2px_6px_rgba(0,0,0,0.3)] flex items-center justify-center border-t border-[#F2E0B3] transform translate-z-[10px]">
          {/* Base Top Surface (Thickness) */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#F2E0B3]/40 rounded-t-md" />
          
          {/* Card Slot Slit */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-black/60 rounded-b-md shadow-inner" />
          
          {/* Base Reflection */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 opacity-50" />

          {/* Engraved Base Brand Label */}
          <div className="text-[#59421C] text-[10px] sm:text-[11px] font-black tracking-[0.22em] uppercase opacity-90 shadow-[0_1px_0_rgba(255,255,255,0.3)] relative z-10 translate-y-1">
            MENUSQR
          </div>
        </div>

      </div>
    </div>
  );
}

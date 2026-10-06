import HeroCopy from './HeroCopy';
import HeroScene from './HeroScene';
import { MenusQRPattern } from '../brand/MenusQRPattern';

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAF7] min-h-[100svh] lg:min-h-0 lg:h-[clamp(720px,78vh,820px)] flex items-center pt-24 pb-10 lg:py-0">
      {/* Background Texture & Pattern - 100vw Bleed */}
      <div className="absolute inset-0 bg-[#FAFAF7] pointer-events-none -z-20" />
      <div className="absolute inset-0 texture-fine-noise pointer-events-none -z-10 opacity-30" />
      <div className="absolute inset-0 -z-10">
        <MenusQRPattern />
      </div>

      {/* Constrained Content Container - perfectly aligned with SiteHeader */}
      <div className="relative z-10 w-full max-w-[1448px] mx-auto px-6 md:px-12 h-full translate-y-4 lg:translate-y-6">
        {/* CSS Grid split: ~44% (left copy) / 56% (right scene) */}
        <div className="grid grid-cols-1 lg:grid-cols-[44fr_56fr] gap-12 lg:gap-8 h-full items-center">
          
          {/* Left Editorial Copy */}
          <div className="flex flex-col justify-center h-full">
            <HeroCopy />
          </div>

          {/* Right Hero Interactive Scene (Physical Table + QR + iPhone Mockup) */}
          <div className="flex justify-center lg:justify-end h-full items-center relative lg:scale-[0.92] origin-center">
            <HeroScene />
          </div>
        </div>
      </div>
    </section>
  );
}

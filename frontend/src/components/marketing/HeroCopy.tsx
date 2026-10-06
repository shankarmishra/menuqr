import HeroActions from './HeroActions';

export default function HeroCopy() {
  return (
    <div className="max-w-[540px] text-left z-10 w-full">
      <div className="text-[#E8783C] text-xs font-bold uppercase tracking-[0.2em] mb-4">
        THE QR MENU THAT NEVER NEEDS REPRINTING
      </div>

      <h1 className="text-[clamp(2.5rem,5.55vw,5rem)] font-extrabold leading-[1.05] tracking-normal mb-6 w-full max-w-[540px]">
        <span className="block text-[#151C19]">Your menu</span>
        <span className="block text-[#151C19]">changes.</span>
        <span className="block text-[#E8783C]">Your QR code</span>
        <span className="block text-[#E8783C]">doesn&apos;t.</span>
      </h1>

      <p className="text-lg sm:text-xl text-[#626776] max-w-[480px] leading-[1.6] mb-8 font-medium">
        Create your digital menu once, print your QR once, and update everything behind it anytime.
      </p>

      <div>
        <HeroActions />
      </div>
    </div>
  );
}





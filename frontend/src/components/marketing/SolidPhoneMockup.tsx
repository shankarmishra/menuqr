import React, { useState } from 'react';
import clsx from 'clsx';
import MenuTemplateRenderer from '../menu-builder/MenuTemplateRenderer';
import { Wifi, Battery } from 'lucide-react';

interface SolidPhoneMockupProps {
  templateId: string;
  restaurant: any;
  categories: any[];
  items: any[];
  className?: string;
  initialTab?: 'cover' | 'menu' | 'all';
}

export const SolidPhoneMockup: React.FC<SolidPhoneMockupProps> = ({
  templateId,
  restaurant,
  categories,
  items,
  className = '',
  initialTab = 'cover',
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'menu' | 'all'>(initialTab);

  return (
    <div className={clsx('relative flex flex-col items-center select-none', className)}>
      {/* ─── Top Floating Interactive Switcher ─── */}
      <div className="mb-4 z-30 flex items-center gap-1.5 p-1 rounded-full bg-black/80 backdrop-blur-xl border border-[#D7B66D]/45 shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={() => setActiveTab('cover')}
          className={clsx(
            'px-3.5 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'cover'
              ? 'bg-gradient-to-r from-[#D7B66D] to-[#EBD69A] text-[#064F43] shadow-md scale-105'
              : 'text-[#F6EAD1]/70 hover:text-white hover:bg-white/5'
          )}
        >
          Cover
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('menu')}
          className={clsx(
            'px-3.5 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'menu'
              ? 'bg-gradient-to-r from-[#D7B66D] to-[#EBD69A] text-[#064F43] shadow-md scale-105'
              : 'text-[#F6EAD1]/70 hover:text-white hover:bg-white/5'
          )}
        >
          Menu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={clsx(
            'px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'all'
              ? 'bg-gradient-to-r from-[#D7B66D] to-[#EBD69A] text-[#064F43] shadow-md scale-105'
              : 'text-[#F6EAD1]/70 hover:text-white hover:bg-white/5'
          )}
        >
          All
        </button>
      </div>

      {/* ─── Solid Luxury Phone Hardware Chassis ─── */}
      <div className="relative w-full max-w-[340px] sm:max-w-[365px] transition-transform duration-300">
        {/* Hardware Side Buttons */}
        {/* Left Side: Action Button */}
        <div className="absolute -left-[5px] top-[105px] w-[5px] h-[26px] rounded-l-sm bg-gradient-to-r from-[#2c2c2e] to-[#48484a] shadow-xs" />
        {/* Left Side: Volume Up */}
        <div className="absolute -left-[5px] top-[145px] w-[5px] h-[48px] rounded-l-sm bg-gradient-to-r from-[#2c2c2e] to-[#48484a] shadow-xs" />
        {/* Left Side: Volume Down */}
        <div className="absolute -left-[5px] top-[205px] w-[5px] h-[48px] rounded-l-sm bg-gradient-to-r from-[#2c2c2e] to-[#48484a] shadow-xs" />
        {/* Right Side: Power Button */}
        <div className="absolute -right-[5px] top-[160px] w-[5px] h-[72px] rounded-r-sm bg-gradient-to-l from-[#2c2c2e] to-[#48484a] shadow-xs" />

        {/* Outer Titanium Bezel Frame with Metallic Chamfer */}
        <div
          className="relative rounded-[50px] p-[10px] bg-gradient-to-b from-[#48484a] via-[#1c1c1e] to-[#2c2c2e]"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.18),
              0 0 0 2px rgba(28, 28, 30, 0.9),
              0 30px 80px -15px rgba(0, 0, 0, 0.9),
              0 15px 30px -8px rgba(0, 0, 0, 0.75),
              0 0 50px -5px rgba(215, 182, 109, 0.22)
            `,
          }}
        >
          {/* Inner Display Enclosure */}
          <div className="relative w-full h-[580px] sm:h-[620px] rounded-[42px] overflow-hidden bg-[#073D34] flex flex-col border border-black/40">
            {/* iOS Status Bar */}
            <div className="relative z-30 flex items-center justify-between px-6 pt-3 pb-1 text-white select-none pointer-events-none bg-gradient-to-b from-black/70 to-transparent">
              {/* Time */}
              <span className="text-[12px] font-semibold tracking-tight text-white/95 font-sans pl-1">
                9:41
              </span>

              {/* Dynamic Island Pill */}
              <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[96px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 border border-white/10 shadow-md">
                {/* Camera lens with antireflective glint */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a0c] border border-blue-500/25 relative flex items-center justify-center">
                  <span className="w-1 h-1 rounded-full bg-blue-900/60" />
                </div>
                {/* Sensor dot */}
                <div className="w-2 h-2 rounded-full bg-[#121216] border border-white/5" />
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 pr-1 text-white/90">
                {/* Cellular Signal (4 bars SVG) */}
                <svg width="15" height="11" viewBox="0 0 17 11" fill="none" className="inline-block">
                  <rect x="0" y="8" width="3" height="3" rx="0.75" fill="currentColor" />
                  <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.75" fill="currentColor" />
                  <rect x="9" y="3" width="3" height="8" rx="0.75" fill="currentColor" />
                  <rect x="13.5" y="0" width="3" height="11" rx="0.75" fill="currentColor" />
                </svg>
                {/* Wi-Fi */}
                <Wifi size={13} className="text-white/90" />
                {/* Battery */}
                <div className="relative flex items-center">
                  <Battery size={17} className="text-white/90" />
                </div>
              </div>
            </div>

            {/* Inner Live Screen Content */}
            <div
              key={activeTab}
              className="flex-1 w-full overflow-y-auto overflow-x-hidden p-2 custom-scrollbar bg-gradient-to-b from-[#073D34] to-[#042A24]"
            >
              <MenuTemplateRenderer
                templateId={templateId}
                restaurant={restaurant}
                categories={categories}
                items={items}
                compact={true}
              />
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="relative z-30 w-full py-1.5 flex items-center justify-center pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
              <div className="w-[110px] h-[4px] rounded-full bg-white/40 shadow-sm" />
            </div>

            {/* Subtle Diagonal Glass Sheen */}
            <div
              className="absolute inset-0 pointer-events-none z-20 rounded-[42px]"
              style={{
                background:
                  'linear-gradient(125deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 35%, transparent 60%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolidPhoneMockup;

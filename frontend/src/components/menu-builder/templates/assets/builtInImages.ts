import React from 'react';

// Art-directed built-in SVG graphics & atmospheric visual components for each template

export const RoyalMaharajaAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#2A111F] via-[#1A0B13] to-[#2A111F] p-4 text-center ${compact ? 'py-3' : 'py-6 mb-4'}`}>
    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />
    <div className="relative z-10 flex flex-col items-center justify-center">
      <svg className="w-8 h-8 text-[#D4AF37] mb-1 opacity-80" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span className="text-[10px] font-serif uppercase tracking-[0.4em] text-[#D4AF37]">Palace Dining & Heritage Kitchen</span>
    </div>
  </div>
);

export const RajasthaniHeritageAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#C85A32]/40 bg-[#F5EBE6] p-4 text-center ${compact ? 'py-2' : 'py-5 mb-4'}`}>
    <div className="flex items-center justify-center gap-3 text-[#C85A32]">
      <span className="text-xs">✦ ❖ ✦</span>
      <span className="text-[10px] font-serif uppercase tracking-[0.3em] font-bold">Royal House of Rajputana</span>
      <span className="text-xs">✦ ❖ ✦</span>
    </div>
  </div>
);

export const MughalLuxeAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-xl border border-[#E5C158]/40 bg-gradient-to-b from-[#112921] to-[#0B1A15] p-4 text-center ${compact ? 'py-3' : 'py-6 mb-4'}`}>
    <div className="text-[#E5C158] flex flex-col items-center">
      <div className="w-12 h-6 border-t-2 border-x-2 border-[#E5C158]/60 rounded-t-full mb-1" />
      <span className="text-[10px] font-serif uppercase tracking-[0.35em]">Imperial Mughal Culinary Court</span>
    </div>
  </div>
);

export const BanarasiGoldAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#F3E5AB]/40 bg-gradient-to-r from-[#2B1533] via-[#190C1E] to-[#2B1533] p-4 text-center ${compact ? 'py-2' : 'py-5 mb-4'}`}>
    <span className="text-[10px] font-serif uppercase tracking-[0.4em] text-[#F3E5AB]">Woven Gold & Heritage Banquet</span>
  </div>
);

export const SouthIndianHeritageAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#E2C044]/35 bg-[#182B21] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#E2C044] font-semibold">Traditional Dakshin Dining</span>
  </div>
);

export const IndianStreetKitchenAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-md border-2 border-[#FACC15] bg-[#242427] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-xs font-black uppercase tracking-widest text-[#FACC15]">AUTHENTIC INDIAN STREET KITCHEN</span>
  </div>
);

export const ModernIndiaAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden border-b border-[#D97706]/20 bg-[#FFFDF9] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D97706]">Modern Indian Gastronomy</span>
  </div>
);

export const SpiceHouseAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-xl border border-[#E07A5F]/30 bg-[#2C211D] p-3 text-center ${compact ? 'py-2' : 'py-5 mb-4'}`}>
    <span className="text-[10px] font-serif uppercase tracking-[0.3em] text-[#E07A5F]">Artisanal Spice & Dining</span>
  </div>
);

export const MaisonNoirAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#C5A059]/40 bg-[#161618] p-4 text-center ${compact ? 'py-3' : 'py-6 mb-4'}`}>
    <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-[#C5A059]">HAUTE CUISINE & EDITORIAL DINING</span>
  </div>
);

export const IvoryDiningAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#C5A059]/30 bg-[#FFFDF9] p-3 text-center ${compact ? 'py-2' : 'py-5 mb-4'}`}>
    <span className="text-[10px] font-serif uppercase tracking-[0.35em] text-[#C5A059]">Alabaster Fine Dining</span>
  </div>
);

export const GrandTableAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#C8A962]/40 bg-[#141F2E] p-4 text-center ${compact ? 'py-3' : 'py-6 mb-4'}`}>
    <span className="text-[10px] font-serif uppercase tracking-[0.35em] text-[#C8A962]">The Grand Restaurant Table</span>
  </div>
);

export const CoffeeHouseAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded-lg border border-[#D4A373]/30 bg-[#2A211D] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#D4A373]">Artisanal Coffee & Roastery</span>
  </div>
);

export const PaperCafeAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden rounded border border-[#8C6D53]/30 bg-[#FBF6F0] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#8C6D53]">Recycled Paper Craft Kitchen</span>
  </div>
);

export const BombayStreetAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden border-y-2 border-[#EAB308] bg-[#262626] p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-xs font-black uppercase tracking-widest text-[#EAB308]">BOMBAY URBAN STREET FOOD</span>
  </div>
);

export const MinimalEditorialAtmosphere: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`relative overflow-hidden border-b border-black/10 bg-white p-3 text-center ${compact ? 'py-2' : 'py-4 mb-4'}`}>
    <span className="text-[9px] font-sans uppercase tracking-[0.4em] text-black/60">INTERNATIONAL EDITORIAL MENU</span>
  </div>
);

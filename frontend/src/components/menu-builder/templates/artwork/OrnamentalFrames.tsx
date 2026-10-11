import React from 'react';

// ============================================================================
// 01. PALACE DOUBLE GOLD FRAME (Royal Maharaja)
// ============================================================================
export const PalaceGoldFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  goldColor?: string;
}> = ({ children, className = '', goldColor = '#D4AF37' }) => (
  <div
    className={`relative p-4 sm:p-7 rounded-lg border-2 shadow-2xl ${className}`}
    style={{
      borderColor: goldColor,
      boxShadow: `0 0 0 4px rgba(212,175,55,0.12), 0 20px 50px rgba(0,0,0,0.6)`,
    }}
  >
    {/* Inner Fine Inset Rule */}
    <div
      className="absolute inset-1.5 sm:inset-2.5 rounded border pointer-events-none"
      style={{ borderColor: `${goldColor}66` }}
    />

    {/* 4 Corner Rosette Medallions */}
    <svg className="absolute top-1 left-1 w-5 h-5" viewBox="0 0 24 24" fill={goldColor}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 Q14 8 20 8 Q14 10 12 16 Q10 10 4 8 Q10 8 12 2 Z" fillOpacity="0.8" />
    </svg>
    <svg className="absolute top-1 right-1 w-5 h-5 -scale-x-100" viewBox="0 0 24 24" fill={goldColor}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 Q14 8 20 8 Q14 10 12 16 Q10 10 4 8 Q10 8 12 2 Z" fillOpacity="0.8" />
    </svg>
    <svg className="absolute bottom-1 left-1 w-5 h-5 -scale-y-100" viewBox="0 0 24 24" fill={goldColor}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 Q14 8 20 8 Q14 10 12 16 Q10 10 4 8 Q10 8 12 2 Z" fillOpacity="0.8" />
    </svg>
    <svg className="absolute bottom-1 right-1 w-5 h-5 -scale-100" viewBox="0 0 24 24" fill={goldColor}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 Q14 8 20 8 Q14 10 12 16 Q10 10 4 8 Q10 8 12 2 Z" fillOpacity="0.8" />
    </svg>

    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 02. BANARASI ZARI BROCADE FRAME (Banarasi Gold)
// ============================================================================
export const BanarasiZariFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  zariGold?: string;
}> = ({ children, className = '', zariGold = '#FFD700' }) => (
  <div
    className={`relative p-4 sm:p-6 rounded-md border-2 ${className}`}
    style={{
      borderColor: zariGold,
      boxShadow: `inset 0 0 24px rgba(255,215,0,0.08), 0 16px 40px rgba(0,0,0,0.5)`,
    }}
  >
    {/* Zari Gold Ribbon Tracks */}
    <div
      className="absolute top-0 inset-x-0 h-1.5 opacity-80"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, ${zariGold} 0, ${zariGold} 4px, transparent 4px, transparent 8px)`,
      }}
    />
    <div
      className="absolute bottom-0 inset-x-0 h-1.5 opacity-80"
      style={{
        backgroundImage: `repeating-linear-gradient(90deg, ${zariGold} 0, ${zariGold} 4px, transparent 4px, transparent 8px)`,
      }}
    />

    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 03. TEMPLE STONE PILLAR FRAME (Southern Heritage)
// ============================================================================
export const TempleStonePillarFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  maroon?: string;
  brass?: string;
}> = ({ children, className = '', maroon = '#6E1B1B', brass = '#C28838' }) => (
  <div
    className={`relative p-4 sm:p-7 rounded-sm border-2 ${className}`}
    style={{
      borderColor: maroon,
      boxShadow: `0 8px 30px rgba(110,27,27,0.08)`,
    }}
  >
    {/* Top Temple Frieze */}
    <div
      className="absolute top-0 inset-x-0 h-2"
      style={{
        background: `linear-gradient(90deg, ${brass} 0%, ${maroon} 50%, ${brass} 100%)`,
      }}
    />
    {/* Bottom Stepped Plinth */}
    <div
      className="absolute bottom-0 inset-x-0 h-2"
      style={{
        background: `linear-gradient(90deg, ${brass} 0%, ${maroon} 50%, ${brass} 100%)`,
      }}
    />

    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 04. STREET DHABA HEAVY FRAME (Indian Street Kitchen)
// ============================================================================
export const StreetDhabaFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  flameOrange?: string;
  mustardYellow?: string;
}> = ({ children, className = '', flameOrange = '#E85A2A', mustardYellow = '#FACC15' }) => (
  <div
    className={`relative p-4 sm:p-6 rounded-md border-4 shadow-xl ${className}`}
    style={{
      borderColor: flameOrange,
      boxShadow: `6px 6px 0px ${mustardYellow}`,
    }}
  >
    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 05. SWISS ARCHITECTURAL FRAME WITH CROP MARKS (Minimal Editorial)
// ============================================================================
export const SwissArchitecturalFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`relative p-5 sm:p-8 border border-neutral-300/80 bg-white ${className}`}>
    {/* 4 Corner Crop Registration Marks (+) */}
    <span className="absolute -top-2.5 -left-2.5 font-mono text-[10px] text-neutral-400 select-none">+</span>
    <span className="absolute -top-2.5 -right-2.5 font-mono text-[10px] text-neutral-400 select-none">+</span>
    <span className="absolute -bottom-2.5 -left-2.5 font-mono text-[10px] text-neutral-400 select-none">+</span>
    <span className="absolute -bottom-2.5 -right-2.5 font-mono text-[10px] text-neutral-400 select-none">+</span>

    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 06. GRAND BALLROOM REGAL FRAME (The Grand Table)
// ============================================================================
export const GrandBallroomFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  goldColor?: string;
}> = ({ children, className = '', goldColor = '#D4AF37' }) => (
  <div
    className={`relative p-5 sm:p-8 rounded-lg border-2 shadow-2xl ${className}`}
    style={{
      borderColor: goldColor,
      boxShadow: `0 0 0 1px ${goldColor}40, 0 24px 60px rgba(0,0,0,0.7)`,
    }}
  >
    {/* Inner Inset Gold Line */}
    <div
      className="absolute inset-2 sm:inset-3 rounded border pointer-events-none"
      style={{ borderColor: `${goldColor}4D` }}
    />

    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// 07. VINTAGE IRANI GINGHAM CHECKER FRAME (Bombay Street)
// ============================================================================
export const VintageIraniFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  leopoldRed?: string;
}> = ({ children, className = '', leopoldRed = '#C82323' }) => (
  <div
    className={`relative p-4 sm:p-6 rounded-md border-2 ${className}`}
    style={{
      borderColor: leopoldRed,
      boxShadow: `0 8px 24px rgba(200,35,35,0.1)`,
    }}
  >
    {/* Top and Bottom Checkered Edge */}
    <div
      className="absolute top-0 inset-x-0 h-2 rounded-t-sm"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${leopoldRed} 0, ${leopoldRed} 4px, #FFFDF2 4px, #FFFDF2 8px)`,
      }}
    />
    <div
      className="absolute bottom-0 inset-x-0 h-2 rounded-b-sm"
      style={{
        backgroundImage: `repeating-linear-gradient(45deg, ${leopoldRed} 0, ${leopoldRed} 4px, #FFFDF2 4px, #FFFDF2 8px)`,
      }}
    />

    <div className="relative z-10">{children}</div>
  </div>
);

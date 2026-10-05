export default function HeroQRStand() {
  return (
    <div className="relative flex flex-col items-center justify-end w-[180px] sm:w-[220px] h-[280px] sm:h-[340px] perspective-[1500px] transform-gpu">
      
      {/* Subtle back shadow on the table */}
      <div className="absolute -bottom-6 w-full h-12 bg-black/40 blur-xl rounded-full transform scale-x-125 rotate-x-[75deg]" />

      {/* Main Acrylic Body (The transparent/frosted card holding the paper) */}
      <div className="relative z-10 w-[160px] sm:w-[190px] h-[240px] sm:h-[290px] bg-white/40 backdrop-blur-md rounded-t-2xl rounded-b border-[3px] border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_0_15px_rgba(255,255,255,0.8)] overflow-hidden flex flex-col items-center justify-center p-4">
        
        {/* Glass Glare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 pointer-events-none" />
        <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-b from-white/30 to-transparent rotate-[35deg] pointer-events-none" />

        {/* The Paper Menu Inside */}
        <div className="w-full h-full bg-[#FCFCF9] rounded-lg shadow-inner flex flex-col items-center py-5 px-3 sm:px-4 border border-[#E5E0D8] relative overflow-hidden">
          
          {/* Subtle gold inner border */}
          <div className="absolute inset-1 border border-[#D4AF37]/30 rounded-md pointer-events-none" />
          
          {/* Elegant Logo Mark */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#151C19] to-[#2A3631] flex items-center justify-center mb-3 sm:mb-4 shadow-sm border border-[#151C19]/10">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#E8783C]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
               <path d="M12 2L2 7l10 5 10-5-10-5z" />
               <path d="M2 17l10 5 10-5" />
               <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          
          <h4 className="font-serif italic font-medium text-[#151C19] text-xs sm:text-sm tracking-wide text-center leading-relaxed mb-4 relative z-10">
            Scan to view<br/>our menu
          </h4>
          
          {/* QR Code Container with gold framing */}
          <div className="bg-white p-2.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-[#E5E0D8] mt-auto mb-3 relative group">
            <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-22 sm:h-22 fill-[#151C19]">
              <path d="M0 0h28v28H0zM8 8h12v12H8zM42 0h12v28H42zM72 0h28v28H72zM80 8h12v12H80zM0 42h28v12H0zM36 42h16v16H36zM64 42h36v12H64zM0 72h28v28H0zM8 80h12v12H8zM36 72h28v12H36zM72 72h12v28H72zM92 72h8v16H92zM8 44h12v8H8zM80 44h12v8H80z"/>
              <path d="M12 12h4v4h-4zM84 12h4v4h-4zM12 84h4v4h-4z"/>
              <path d="M40 12h8v8h-8zM12 40h8v8h-8zM72 40h8v8h-8zM40 72h8v8h-8zM48 48h12v12h-12z" />
            </svg>
          </div>

          <div className="text-[9px] text-[#8C7A6B] font-bold uppercase tracking-[0.25em] mt-auto relative z-10">
            Table 12
          </div>
        </div>
      </div>

      {/* The Heavy Base (Wood/Metal) */}
      <div className="relative z-20 w-full h-[30px] sm:h-[40px] bg-gradient-to-b from-[#b38b59] to-[#8c6b42] rounded-t-md rounded-b-xl shadow-[0_15px_20px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4)] flex items-center justify-center border-t border-[#d4b087]">
        {/* Base front face texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay rounded-b-xl" />
        
        {/* Slit where the acrylic card sits */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[4px] bg-black/40 rounded-b-sm shadow-inner" />
        
        {/* Engraved Logo */}
        <div className="text-[#5a4225] text-[9px] sm:text-[11px] font-black tracking-widest uppercase opacity-80 shadow-[0_1px_0_rgba(255,255,255,0.3)]">
          MenusQR
        </div>
      </div>

    </div>
  );
}



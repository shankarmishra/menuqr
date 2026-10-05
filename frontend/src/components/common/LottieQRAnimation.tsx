import { Lottie } from 'lottie-react';
import { motion } from 'framer-motion';
import qrScannerData from '../../assets/lottie/qr-scanner.json';

export default function LottieQRAnimation({ className = '' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer Radial Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#e8783c]/35 via-[#ffc928]/25 to-emerald-400/20 blur-3xl animate-pulse pointer-events-none" />

      {/* Radar Ripple Waves */}
      <div className="absolute w-72 h-72 rounded-full border border-[#e8783c]/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
      <div className="absolute w-56 h-56 rounded-full border border-[#ffc928]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />

      {/* Main Holographic Glass Card Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-3xl bg-[#121a16]/90 border border-white/20 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(232,120,60,0.35)] backdrop-blur-2xl flex flex-col items-center justify-between overflow-hidden"
      >
        {/* Lottie HUD Bracket Corners */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#e8783c] rounded-tl" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#e8783c] rounded-tr" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#ffc928] rounded-bl" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#ffc928] rounded-br" />

        {/* Lottie React Canvas Component */}
        <div className="relative w-full h-full flex items-center justify-center p-1">
          <Lottie
            src={qrScannerData}
            loop
            autoplay
            className="w-full h-full drop-shadow-[0_0_12px_rgba(232,120,60,0.5)]"
          />

          {/* Core QR Vector Matrix Overlay */}
          <div className="absolute inset-0 p-6 pointer-events-none flex items-center justify-center">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-90">
              <defs>
                <linearGradient id="lottie-core-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e8783c" />
                  <stop offset="0.5" stopColor="#f29a66" />
                  <stop offset="1" stopColor="#ffc928" />
                </linearGradient>
              </defs>

              {/* QR Finder Patterns */}
              <rect x="8" y="8" width="26" height="26" rx="7" stroke="url(#lottie-core-grad)" strokeWidth="3" fill="#15211b" />
              <rect x="14" y="14" width="14" height="14" rx="4" fill="url(#lottie-core-grad)" className="animate-pulse" />

              <rect x="66" y="8" width="26" height="26" rx="7" stroke="url(#lottie-core-grad)" strokeWidth="3" fill="#15211b" />
              <rect x="72" y="14" width="14" height="14" rx="4" fill="url(#lottie-core-grad)" className="animate-pulse" />

              <rect x="8" y="66" width="26" height="26" rx="7" stroke="url(#lottie-core-grad)" strokeWidth="3" fill="#15211b" />
              <rect x="14" y="72" width="14" height="14" rx="4" fill="url(#lottie-core-grad)" className="animate-pulse" />

              {/* Matrix Data Points */}
              <circle cx="45" cy="12" r="3" fill="#ffffff" />
              <circle cx="55" cy="12" r="3" fill="url(#lottie-core-grad)" />
              <circle cx="45" cy="22" r="3" fill="url(#lottie-core-grad)" />
              <circle cx="55" cy="22" r="3" fill="#ffffff" />

              <circle cx="45" cy="45" r="3.5" fill="#ffc928" className="animate-ping" />
              <circle cx="55" cy="45" r="3.5" fill="#e8783c" />
              <circle cx="45" cy="55" r="3.5" fill="#e8783c" />
              <circle cx="55" cy="55" r="3.5" fill="#ffc928" />

              {/* MenusQR Emblem */}
              <circle cx="50" cy="50" r="11" fill="#0f1613" stroke="url(#lottie-core-grad)" strokeWidth="2" />
              <path d="M 44 47 L 50 54 L 56 47" stroke="#ffc928" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Lottie HUD Status Bar */}
        <div className="relative z-10 w-full text-center border-t border-white/10 pt-2 flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LOTTIE ENGINE
          </span>
          <span className="text-[10px] font-extrabold text-[#ffc928] tracking-widest uppercase">
            60 FPS SCAN
          </span>
        </div>
      </motion.div>
    </div>
  );
}

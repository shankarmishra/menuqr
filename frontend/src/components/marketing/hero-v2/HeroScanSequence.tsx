import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';

interface HeroScanSequenceProps {
  stage: string;
}

export default function HeroScanSequence({ stage }: HeroScanSequenceProps) {
  const isScanning = stage === 'scanning' || stage === 'detected';

  return (
    <AnimatePresence>
      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-30 bg-[#151C19] overflow-hidden"
        >
          {/* iOS Status Bar (White for Camera) */}
          <div className="absolute top-0 left-0 w-full h-[44px] flex justify-between items-center px-6 pt-3 z-50 text-white font-semibold text-[11px] drop-shadow-md">
            <span className="w-10">9:41</span>
            <div className="flex items-center gap-1.5 opacity-100">
              <Signal size={12} className="stroke-[2.5]" />
              <Wifi size={12} className="stroke-[2.5]" />
              <div className="relative flex items-center">
                 <Battery size={16} className="stroke-2" />
                 <div className="absolute left-[2px] top-[4.5px] h-[7px] w-[9px] bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Blurred background simulating camera feed */}
          <div className="absolute inset-0 opacity-40">
            <img 
              src="/marketing/hero/hero-restaurant-poster.webp" 
              alt="" 
              className="w-full h-full object-cover blur-sm scale-110"
              decoding="async"
              loading="lazy"
              width={1376}
              height={768}
            />
          </div>

          {/* Camera UI Overlay */}
          <div className="absolute inset-0 flex flex-col pt-[44px]">
            {/* Viewfinder Target */}
            <div className="flex-1 flex flex-col items-center justify-center relative px-8">
              
              <motion.div 
                animate={{ 
                  scale: stage === 'detected' ? 1.05 : 1,
                  borderColor: stage === 'detected' ? '#34B56A' : 'rgba(255,255,255,0.4)'
                }}
                className="w-full aspect-square border-2 relative rounded-2xl flex items-center justify-center transition-colors duration-300 backdrop-blur-sm bg-white/5"
              >
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />

                {/* Visible QR inside the phone screen to show it's scanning */}
                <div className="w-[60%] h-[60%] opacity-80 mix-blend-screen bg-white rounded-xl p-2 relative overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full fill-black opacity-80">
                     <path d="M0 0h28v28H0zM8 8h12v12H8zM42 0h12v28H42zM72 0h28v28H72zM80 8h12v12H80zM0 42h28v12H0zM36 42h16v16H36zM64 42h36v12H64zM0 72h28v28H0zM8 80h12v12H8zM36 72h28v12H36zM72 72h12v28H72zM92 72h8v16H92zM8 44h12v8H8zM80 44h12v8H80z"/>
                     <path d="M12 12h4v4h-4zM84 12h4v4h-4zM12 84h4v4h-4z"/>
                     <path d="M40 12h8v8h-8zM12 40h8v8h-8zM72 40h8v8h-8zM40 72h8v8h-8zM48 48h12v12h-12z" />
                  </svg>
                </div>

                {/* Scanning Laser Line */}
                {stage === 'scanning' && (
                  <motion.div
                    initial={{ top: '10%' }}
                    animate={{ top: '90%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 right-0 h-0.5 bg-[#FFC928] shadow-[0_0_15px_3px_rgba(255,201,40,0.6)] z-20"
                  />
                )}
                
                {/* Detected Flash/Overlay */}
                <AnimatePresence>
                  {stage === 'detected' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#34B56A]/20 flex items-center justify-center rounded-xl z-30"
                    >
                      <div className="bg-[#34B56A] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        QR Detected
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>

              <div className="mt-8 text-white/60 text-xs font-medium text-center">
                Point at menu QR to order
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-24 w-full flex justify-center items-center pb-4">
              <div className="w-14 h-14 rounded-full border-[3px] border-white/30 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white" />
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



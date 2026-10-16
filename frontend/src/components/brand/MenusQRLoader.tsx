import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenusQRMark } from './MenusQRMark';

export function MenusQRLoader() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    // Always play on load / refresh as requested by user
    return true;
  });

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 950);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="brand-film-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
          style={{ backgroundColor: '#151C19' }}
          role="status"
          aria-label="Loading MenusQR"
        >
          {/* Full Logo Layout (Horizontal) */}
          <div className="relative flex flex-row items-center justify-center gap-6">
            
            {/* Mark */}
            <motion.div
              layoutId="brand-mark-container"
              className="relative w-[100px] h-[100px]"
            >
              <MenusQRMark animated={true} color="#FFFFFF" />
            </motion.div>

            {/* Wordmark */}
            <motion.div
              layoutId="brand-wordmark-container"
              className="flex flex-col text-left justify-center overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ 
                  opacity: 1, 
                  x: 0
                }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                className="text-6xl md:text-7xl font-black tracking-[-0.03em] leading-none"
                style={{ 
                  color: '#FFFFFF', 
                  fontFamily: 'var(--font-brand, system-ui)'
                }}
              >
                Menus<span style={{ color: '#E8783C' }}>QR</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.4, delay: 0.9 }}
                className="font-sans font-extrabold tracking-[0.1em] uppercase mt-2 text-[10px] sm:text-xs text-[#E8783C]"
              >
                PRINT ONCE. UPDATE ANYTIME.
              </motion.div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

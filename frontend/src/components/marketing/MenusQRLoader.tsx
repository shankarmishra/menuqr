import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'menusqr_loader_played_session';

interface MenusQRLoaderProps {
  onComplete?: () => void;
}

export default function MenusQRLoader({ onComplete }: MenusQRLoaderProps) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
    // Always play on refresh as requested
    return true;
  });

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore quota
    }

    // Loader completes at ~2400ms.
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2400);

    return () => clearTimeout(timer);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const primaryColor = '#151C19'; // Deep emerald
  const brandColor = '#E8783C';   // Signature orange
  const surfaceColor = '#FAFAF7'; // Paper/Surface

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="brand-film-loader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none pointer-events-auto"
          style={{ backgroundColor: surfaceColor }}
          role="status"
          aria-label="Loading MenusQR"
        >
          {/* Stage 1: Paper Surface & Subtle Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, ${primaryColor} 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor} 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          <div className="relative flex flex-col items-center justify-center text-center">
            {/* Stage 2 & 4: Mark Construction & Lock */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 0.98, 1] }}
              transition={{ duration: 0.3, delay: 1.2, ease: "easeOut" }}
              className="relative w-24 h-24 sm:w-32 sm:h-32 mb-6"
            >
              <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none">
                {/* Stage 3: Editorial Signature Line */}
                <motion.line
                  x1="24" y1="0" x2="24" y2="48"
                  stroke={brandColor}
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                  initial={{ opacity: 0, y1: 24, y2: 24 }}
                  animate={{ opacity: [0, 0.4, 0], y1: 0, y2: 48 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                />

                {/* Left Column Assembly */}
                <motion.rect x="5" y="5" width="14" height="14" rx="3.5" stroke={primaryColor} strokeWidth="3" fill="none"
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 100 }}
                  style={{ originX: '50%', originY: '50%' }}
                />
                <motion.rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill={primaryColor}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4, type: "spring", stiffness: 200 }}
                  style={{ originX: '50%', originY: '50%' }}
                />
                <motion.rect x="5" y="23" width="14" height="20" rx="3.5" fill={primaryColor}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
                  style={{ originY: '0%' }}
                />

                {/* Right Column Assembly */}
                <motion.rect x="29" y="5" width="14" height="14" rx="3.5" stroke={primaryColor} strokeWidth="3" fill="none"
                  initial={{ opacity: 0, scale: 0.8, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35, type: "spring", stiffness: 100 }}
                  style={{ originX: '50%', originY: '50%' }}
                />
                <motion.rect x="33.5" y="9.5" width="5" height="5" rx="1.5" fill={primaryColor}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.45, type: "spring", stiffness: 200 }}
                  style={{ originX: '50%', originY: '50%' }}
                />
                <motion.rect x="29" y="23" width="14" height="20" rx="3.5" fill={primaryColor}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.5, delay: 0.45, type: "spring", stiffness: 100 }}
                  style={{ originY: '0%' }}
                />

                {/* Signature Brand Accent */}
                <motion.rect x="21" y="37" width="6" height="6" rx="1.5" fill={brandColor}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6, type: "spring", stiffness: 150 }}
                />
              </svg>
            </motion.div>

            {/* Stage 5: Wordmark Reveal */}
            <div className="overflow-hidden mb-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl font-black tracking-[-0.03em] leading-none"
                style={{ color: primaryColor }}
              >
                Menus<span style={{ color: brandColor }}>QR</span>
              </motion.div>
            </div>

            {/* Stage 6: Tagline Reveal */}
            <div className="overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
                className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.24em] uppercase"
                style={{ color: primaryColor, opacity: 0.6 }}
              >
                PRINT ONCE. UPDATE ANYTIME.
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

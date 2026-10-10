import { motion } from 'framer-motion';

export interface MenusQRMarkProps {
  color?: string;
  orange?: string;
  animated?: boolean;
}

export function MenusQRMark({ color = '#151C19', orange = '#E8783C', animated = false }: MenusQRMarkProps) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="electric-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC928" />
          <stop offset="50%" stopColor={orange} />
          <stop offset="100%" stopColor="#FF5E4D" />
        </linearGradient>
      </defs>

      {/* Signature QR Accent Dots - Sleek Geometric Positioning */}
      <motion.g
        initial={animated ? { opacity: 0, scale: 0.9 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: animated ? 0.3 : 0 }}
      >
        {/* Top-Right QR Finder Dot */}
        <rect x="78" y="16" width="10" height="10" rx="3" fill={orange} />
        {/* Bottom-Left Complement Dot */}
        <circle cx="18" cy="84" r="4" fill={color} opacity="0.6" />
      </motion.g>

      {/* Central Lightning M */}
      <motion.path
        d="M 14 84 L 35 16 L 50 48 L 65 16 L 86 84 L 72 84 L 62 44 L 50 66 L 38 44 L 28 84 Z"
        fill="url(#electric-grad)"
        initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        animate={
          animated
          ? { opacity: [0, 1, 0.7, 1], scale: 1 }
          : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.5, delay: animated ? 0.2 : 0, ease: "easeOut" }}
        style={{ originX: '50%', originY: '50%' }}
      />
    </svg>
  );
}

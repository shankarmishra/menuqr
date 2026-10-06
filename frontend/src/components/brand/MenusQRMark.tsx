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

      {/* Outer QR Brackets - High Tech */}
      <motion.g
        initial={animated ? { opacity: 0, scale: 1.3 } : { opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: animated ? 0.7 : 0, type: "spring", stiffness: 200 }}
        style={{ originX: '50%', originY: '50%' }}
      >
        {/* Top Left */}
        <path d="M5 35 V5 H35" stroke={color} strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M15 25 V15 H25" stroke={color} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="18" y="18" width="4" height="4" fill={color} />
        <circle cx="42" cy="10" r="2" fill={color} />
        <circle cx="10" cy="42" r="2" fill={color} />
        
        {/* Top Right */}
        <path d="M95 35 V5 H65" stroke={color} strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M85 25 V15 H75" stroke={color} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="78" y="18" width="4" height="4" fill={color} />
        <circle cx="58" cy="10" r="2" fill={color} />
        <circle cx="90" cy="42" r="2" fill={color} />

        {/* Bottom Left */}
        <path d="M5 65 V95 H35" stroke={color} strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M15 75 V85 H25" stroke={color} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="18" y="78" width="4" height="4" fill={color} />
        <circle cx="42" cy="90" r="2" fill={color} />
        <circle cx="10" cy="58" r="2" fill={color} />

        {/* Bottom Right */}
        <path d="M95 65 V95 H65" stroke={color} strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter" />
        <path d="M85 75 V85 H75" stroke={color} strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        <rect x="78" y="78" width="4" height="4" fill={color} />
        <circle cx="58" cy="90" r="2" fill={color} />
        <circle cx="90" cy="58" r="2" fill={color} />
      </motion.g>

      {/* Central Lightning M */}
      <motion.path
        d="M 18 82 L 36 20 L 50 48 L 64 20 L 82 82 L 68 82 L 59 44 L 50 62 L 41 44 L 32 82 Z"
        fill="url(#electric-grad)"
        initial={animated ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
        animate={
          animated 
          ? { opacity: [0, 1, 0.6, 1], scale: 1 } 
          : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.5, delay: animated ? 0.3 : 0, ease: "easeOut" }}
        style={{ originX: '50%', originY: '50%' }}
      />

      {/* Electric Spark Trails (Only visible during animation) */}
      {animated && (
        <>
          <motion.path
            d="M 18 82 L 36 20 L 50 48"
            stroke="url(#electric-grad-reverse)"
            strokeWidth="3"
            fill="none"
            filter="url(#lightning-glow)"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeIn" }}
          />
          <motion.path
            d="M 82 82 L 64 20 L 50 48"
            stroke="url(#electric-grad-reverse)"
            strokeWidth="3"
            fill="none"
            filter="url(#lightning-glow)"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeIn" }}
          />
        </>
      )}
    </svg>
  );
}

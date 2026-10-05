import type { Variants } from 'framer-motion';

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = (staggerDelay = 0.12): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
});

export const viewportConfig = {
  once: true,
  amount: 0.2,
  margin: '0px 0px -50px 0px',
};

export const smoothSpring = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  mass: 0.8,
};

export const gentleEase = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
};

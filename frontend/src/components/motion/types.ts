export interface MotionAssetProps {
  isPlaying?: boolean;
  speed?: number; // 0.5, 1, 1.5, 2
  loop?: boolean;
  reducedMotion?: boolean;
  className?: string;
  onComplete?: () => void;
}

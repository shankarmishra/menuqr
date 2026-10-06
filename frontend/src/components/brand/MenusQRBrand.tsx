import { motion } from 'framer-motion';
import { MenusQRMark } from './MenusQRMark';

export interface MenusQRBrandProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'light' | 'mono';
  markOnly?: boolean;
  className?: string;
}

export function MenusQRBrand({
  size = 'md',
  variant = 'primary',
  markOnly = false,
  className = '',
}: MenusQRBrandProps) {
  // Sizing
  const markSize = {
    sm: 24,
    md: 36,
    lg: 48,
    xl: 64,
  }[size];

  const wordmarkSize = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  const gap = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    xl: 'gap-4',
  }[size];

  const descriptorSize = {
    sm: 'text-[7px]',
    md: 'text-[8px]',
    lg: 'text-[9px]',
    xl: 'text-[10px]',
  }[size];

  // Colors
  const primaryColor = variant === 'light' ? '#FAFAF7' : '#151C19';
  const orangeColor = variant === 'mono' ? primaryColor : '#E8783C';

  return (
    <div className={`flex items-center ${gap} ${className} cursor-pointer group`} role="banner">
      <motion.div 
        style={{ width: markSize, height: markSize }}
        className="shrink-0 group-hover:rotate-1 transition-transform duration-300"
      >
        <MenusQRMark color={primaryColor} orange={orangeColor} />
      </motion.div>

      {!markOnly && (
        <motion.div 
          className="flex flex-col text-left leading-none justify-center"
        >
          <div 
            className={`font-black tracking-[-0.03em] ${wordmarkSize}`} 
            style={{ 
              color: primaryColor, 
              fontFamily: 'var(--font-brand, system-ui)',
              textShadow: variant === 'light' ? '0 0 10px rgba(250,250,247,0.3)' : '0 0 10px rgba(21,28,25,0.1)'
            }}
          >
            Menus<span style={{ 
              color: orangeColor,
              textShadow: variant === 'mono' ? 'none' : '0 0 15px rgba(232, 120, 60, 0.4)'
            }}>QR</span>
          </div>
          {size !== 'sm' && (
            <div 
              className={`font-mono font-bold tracking-[0.2em] mt-1 opacity-70 ${descriptorSize}`}
              style={{ color: primaryColor }}
            >
              DIGITAL MENU
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

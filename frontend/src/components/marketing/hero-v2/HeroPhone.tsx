import type { ReactNode } from 'react';
import PremiumIPhoneMockup from '../PremiumIPhoneMockup';

interface HeroPhoneProps {
  children: ReactNode;
  className?: string;
}

export default function HeroPhone({ children, className = '' }: HeroPhoneProps) {
  return (
    <PremiumIPhoneMockup
      className={className}
      screenClassName="bg-white"
      statusBarTheme="dark"
    >
      {children}
    </PremiumIPhoneMockup>
  );
}

import React from 'react';

export type IllustrationSize = 'sm' | 'md' | 'lg' | 'xl' | 'responsive' | 'custom';
export type IllustrationTheme = 'emerald' | 'parchment' | 'neutral' | 'transparent';

export interface IllustrationProps extends React.SVGProps<SVGSVGElement> {
  size?: IllustrationSize;
  theme?: IllustrationTheme;
  animated?: boolean;
  title?: string;
  description?: string;
  className?: string;
}

export const SIZE_MAP: Record<IllustrationSize, { width?: number | string; height?: number | string; className?: string }> = {
  sm: { width: 220, height: 176 },
  md: { width: 360, height: 288 },
  lg: { width: 500, height: 400 },
  xl: { width: 640, height: 512 },
  responsive: { width: '100%', className: 'w-full h-auto max-w-full' },
  custom: {},
};

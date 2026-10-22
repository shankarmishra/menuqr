// MENUQR Dynamic Design Engine — Master Renderer

import React from 'react';
import clsx from 'clsx';
import type { LayoutProps } from '../templates/types';
import type { DesignSpecification } from './types';
import { EditorialFineDiningComposition } from './compositions/EditorialFineDiningComposition';
import { ModernImageLedComposition } from './compositions/ModernImageLedComposition';
import { CompactBistroComposition } from './compositions/CompactBistroComposition';
import { HeritageArtboardComposition } from './compositions/HeritageArtboardComposition';

export interface DynamicDesignEngineProps extends LayoutProps {
  spec: DesignSpecification;
  className?: string;
}

const TEXTURE_PATTERNS: Record<DesignSpecification['decorations']['texture'], string> = {
  'subtle-grain': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M20 20l2 2-2 2-2-2z' fill='%23FFFFFF' fill-opacity='0.03'/%3E%3C/svg%3E")`,
  'silk-lattice': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05' fill-rule='evenodd'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z M30 12L48 30L30 48L12 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
  'parchment': `url("data:image/svg+xml,%3Csvg width='40' height='24' viewBox='0 0 40 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24 C0 12, 10 0, 20 0 C30 0, 40 12, 40 24' fill='none' stroke='%23D4AE68' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")`,
  'dots': `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23FFFFFF' fill-opacity='0.04'/%3E%3C/svg%3E")`,
  'clean': 'none',
};

export const DynamicDesignEngine: React.FC<DynamicDesignEngineProps> = (props) => {
  const { spec, compact, className } = props;
  const { colors, typography, decorations } = spec;

  const pattern = TEXTURE_PATTERNS[decorations.texture] || 'none';

  return (
    <div
      className={clsx(
        'w-full transition-all duration-300 relative overflow-hidden',
        compact ? 'p-1 text-xs' : 'p-4 sm:p-8 min-h-screen text-sm',
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: typography.bodyFont,
        backgroundImage: pattern !== 'none' ? pattern : undefined,
      }}
    >
      {(spec.composition === 'heritage-artboard' || spec.themeId === 'pdf-bespoke-theme') && (
        <HeritageArtboardComposition {...props} />
      )}
      {spec.composition === 'editorial' && spec.themeId !== 'pdf-bespoke-theme' && (
        <EditorialFineDiningComposition {...props} />
      )}
      {spec.composition === 'image-showcase' && spec.themeId !== 'pdf-bespoke-theme' && (
        <ModernImageLedComposition {...props} />
      )}
      {spec.composition === 'compact-bistro' && spec.themeId !== 'pdf-bespoke-theme' && (
        <CompactBistroComposition {...props} />
      )}
    </div>
  );
};

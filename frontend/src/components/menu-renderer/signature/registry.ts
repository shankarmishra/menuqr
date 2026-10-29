/**
 * MENUQR Menu Renderer — Signature Composition Registry
 *
 * Maps a `SignatureCompositionId` to the component that owns the whole page for it. Exactly like
 * `slots/registry.ts`, kept as one small lookup table so adding a fourth Signature composition
 * never requires touching `MenuRenderer`.
 */

import type React from 'react';
import type { SignatureCompositionId } from '../../../design-system/theme.types.ts';
import type { SignatureProps } from '../types.ts';
import { HeritageBookletComposition } from './HeritageBookletComposition.tsx';
import { GraphicBookletComposition } from './GraphicBookletComposition.tsx';
import { ChalkboardComposition } from './ChalkboardComposition.tsx';

export const SIGNATURE_COMPONENTS: Record<SignatureCompositionId, React.FC<SignatureProps>> = {
  'heritage-booklet': HeritageBookletComposition,
  'graphic-booklet': GraphicBookletComposition,
  'chalkboard-clipboard': ChalkboardComposition,
};

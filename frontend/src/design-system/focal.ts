/**
 * MENUQR Design System — Focal Point Math
 *
 * Pure coordinate conversion for the focal-point picker. Kept separate from the picker component
 * (`components/menu-renderer/primitives/FocalPointPicker.tsx`) so the part with real bug
 * surface — off-by-one errors, inverted axes, clamping at the edges — is unit-testable without a
 * DOM, and the component itself stays thin.
 */

import type { FocalPoint } from './theme.types.ts';

export type PointerPosition = {
  clientX: number;
  clientY: number;
};

export type ElementBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Convert a pointer/click position in viewport coordinates to a 0-1 focal point relative to an
 * element's bounding box. Clamped, so dragging past the image edge pins to that edge rather than
 * producing an out-of-range value a renderer would have to re-clamp.
 */
export function positionToFocal(position: PointerPosition, bounds: ElementBounds): FocalPoint {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0.5, y: 0.5 };
  return {
    x: clamp01((position.clientX - bounds.left) / bounds.width),
    y: clamp01((position.clientY - bounds.top) / bounds.height),
  };
}

/** Inverse of `positionToFocal`, for placing the draggable dot over the current value. */
export function focalToOffset(focal: FocalPoint, bounds: Pick<ElementBounds, 'width' | 'height'>): { x: number; y: number } {
  return {
    x: clamp01(focal.x) * bounds.width,
    y: clamp01(focal.y) * bounds.height,
  };
}

export type ArrowKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/**
 * Nudge a focal point by keyboard. A fine step by default, a coarser one held with Shift —
 * mirrors the convention used by most design tools (Figma, browser devtools colour pickers).
 */
export function nudgeFocal(focal: FocalPoint, key: ArrowKey, coarse = false): FocalPoint {
  const step = coarse ? 0.1 : 0.02;
  switch (key) {
    case 'ArrowUp':
      return { x: focal.x, y: clamp01(focal.y - step) };
    case 'ArrowDown':
      return { x: focal.x, y: clamp01(focal.y + step) };
    case 'ArrowLeft':
      return { x: clamp01(focal.x - step), y: focal.y };
    case 'ArrowRight':
      return { x: clamp01(focal.x + step), y: focal.y };
    default:
      return focal;
  }
}

/** Human-readable position, for the picker's accessible label and the Studio's status text. */
export function describeFocal(focal: FocalPoint): string {
  const vertical = focal.y < 0.33 ? 'top' : focal.y > 0.66 ? 'bottom' : 'middle';
  const horizontal = focal.x < 0.33 ? 'left' : focal.x > 0.66 ? 'right' : 'centre';
  if (vertical === 'middle' && horizontal === 'centre') return 'centred';
  if (vertical === 'middle') return horizontal;
  if (horizontal === 'centre') return vertical;
  return `${vertical} ${horizontal}`;
}

/**
 * MENUQR Menu Renderer — Focal Point Picker
 *
 * The owner drags a dot onto the part of a photo that matters — the hero dish on a plate, the
 * best angle of a storefront — and every crop generated from that photo anchors there via
 * `object-position`. This is the Design Studio control that writes the `focal` value `SmartImage`
 * already knows how to consume.
 *
 * Deterministic and owner-directed rather than automatic: the owner knows which end of the plate
 * is the dish, and the result is reproducible and free, with nothing to call or train.
 *
 * All coordinate math lives in `design-system/focal.ts` and is unit-tested there; this component
 * is intentionally thin — pointer/keyboard wiring onto that math, nothing more.
 */

import React, { useCallback, useRef, useState } from 'react';
import { describeFocal, nudgeFocal, positionToFocal, type ArrowKey } from '../../../design-system/focal.ts';
import type { FocalPoint } from '../../../design-system/theme.types.ts';
import './FocalPointPicker.css';

const ARROW_KEYS = new Set<ArrowKey>(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

export type FocalPointPickerProps = {
  src: string;
  alt: string;
  value: FocalPoint;
  onChange: (point: FocalPoint) => void;
  /** Disables interaction while a parent is saving, without hiding the current value. */
  disabled?: boolean;
  className?: string;
};

export const FocalPointPicker: React.FC<FocalPointPickerProps> = ({
  src,
  alt,
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const applyFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      onChange(positionToFocal({ clientX, clientY }, frame.getBoundingClientRect()));
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
      applyFromPointer(event.clientX, event.clientY);
    },
    [applyFromPointer, disabled]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging || disabled) return;
      applyFromPointer(event.clientX, event.clientY);
    },
    [applyFromPointer, dragging, disabled]
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled || !ARROW_KEYS.has(event.key as ArrowKey)) return;
      event.preventDefault();
      onChange(nudgeFocal(value, event.key as ArrowKey, event.shiftKey));
    },
    [disabled, onChange, value]
  );

  return (
    <div
      ref={frameRef}
      className={['mq-focal-picker', disabled ? 'mq-focal-picker-disabled' : '', className].filter(Boolean).join(' ')}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Photo focal point for ${alt}. Use arrow keys to adjust.`}
      aria-valuetext={describeFocal(value)}
      aria-disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    >
      <img src={src} alt="" className="mq-focal-picker-image" draggable={false} />
      <div
        className="mq-focal-picker-dot"
        style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
        aria-hidden="true"
      />
    </div>
  );
};

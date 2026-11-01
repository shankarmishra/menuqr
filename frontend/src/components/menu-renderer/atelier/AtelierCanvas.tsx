import React, { useRef, useState, useEffect } from 'react';

/**
 * Atelier 400-Unit Responsive Canvas
 *
 * All blocks are laid out assuming a fixed 400px wide coordinate space.
 * The container measures available width and applies `transform: scale(width / 400)`
 * so that typography, spacing, and artwork scale perfectly without media queries.
 */

export interface AtelierCanvasProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AtelierCanvas: React.FC<AtelierCanvasProps> = ({ children, className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [canvasHeight, setCanvasHeight] = useState<number | undefined>();

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth || 400;
      const computedScale = width / 400;
      setScale(computedScale);
      if (canvasRef.current) {
        setCanvasHeight(canvasRef.current.offsetHeight);
      }
    };

    updateSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateSize();
      });
      if (containerRef.current) ro.observe(containerRef.current);
      if (canvasRef.current) ro.observe(canvasRef.current);
    } else {
      window.addEventListener('resize', updateSize);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={['atelier-viewport', className].filter(Boolean).join(' ')}
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'hidden',
        ...style,
      }}
    >
      <div
        className="atelier-canvas-scaler"
        style={{
          width: `${400 * scale}px`,
          height: canvasHeight ? `${canvasHeight * scale}px` : 'auto',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          ref={canvasRef}
          className="atelier-canvas"
          style={{
            width: '400px',
            minWidth: '400px',
            maxWidth: '400px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AtelierCanvas;

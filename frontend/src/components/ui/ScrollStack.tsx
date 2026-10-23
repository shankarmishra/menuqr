'use client';

import {
  Children,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from 'react';
import './ScrollStack.css';

interface ScrollStackSettings {
  itemDistance: number;
  itemStackDistance: number;
  stackPosition: number | string;
  itemScale: number;
  baseScale: number;
  dimAmount: number;
  blurAmount: number;
  tiltAmount: number;
  rotationAmount: number;
  holdDistance: number;
  smoothScroll: boolean;
  snap: boolean;
  onStackComplete?: () => void;
}

export interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
  style?: CSSProperties;
}

export interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemStackDistance?: number;
  stackPosition?: number | string;
  itemScale?: number;
  baseScale?: number;
  dimAmount?: number;
  blurAmount?: number;
  tiltAmount?: number;
  rotationAmount?: number;
  holdDistance?: number;
  smoothScroll?: boolean;
  snap?: boolean;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const resolveOffset = (value: number | string, size: number): number => {
  if (typeof value === 'number') return value;
  const text = String(value).trim();
  if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
  return parseFloat(text) || 0;
};

const toLength = (value: number | string): string =>
  typeof value === 'number' ? `${value}px` : value;

export const ScrollStackItem = ({ children, itemClassName = '', style }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
    <span className="scroll-stack-card__shade" aria-hidden="true" />
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 160,
  itemStackDistance = 24,
  stackPosition = '96px',
  itemScale = 0.025,
  baseScale = 0.94,
  dimAmount = 0,
  blurAmount = 0,
  tiltAmount = 0,
  rotationAmount = 0,
  holdDistance = 260,
  smoothScroll = false,
  snap = false,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<ScrollStackSettings | null>(null);
  const scheduleRef = useRef<(() => void) | null>(null);
  const invalidateRef = useRef<(() => void) | null>(null);
  const items = Children.toArray(children);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useLayoutEffect(() => {
    settingsRef.current = {
      itemDistance,
      itemStackDistance,
      stackPosition,
      itemScale,
      baseScale,
      dimAmount,
      blurAmount,
      tiltAmount,
      rotationAmount,
      holdDistance,
      smoothScroll,
      snap,
      onStackComplete,
    };
    invalidateRef.current?.();
  });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    const end = endRef.current;
    if (!root || !inner || !end) return undefined;

    const windowed = useWindowScroll;
    const target: Window | HTMLDivElement = windowed ? window : root;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cache = new Map<string, string | number>();
    let frame = 0;
    let complete = false;

    interface LayoutCache {
      isMobile: boolean;
      viewHeight: number;
      viewTop: number;
      stackTop: number;
      heights: number[];
      pitch: number;
      slotDocTops: number[];
      endHeight: number;
    }

    let layoutCache: LayoutCache | null = null;

    const readScroll = () => (windowed ? window.scrollY : root.scrollTop);

    const write = (key: string, value: string | number, apply: (val: any) => void) => {
      if (cache.get(key) === value) return false;
      cache.set(key, value);
      apply(value);
      return true;
    };

    const measureLayout = (): LayoutCache | null => {
      const settings = settingsRef.current;
      const slots = Array.from(inner.children).filter((child) =>
        child.hasAttribute('data-stack-slot')
      ) as HTMLElement[];
      if (!settings || !slots.length) return null;

      const isMobile = window.innerWidth < 768;
      const viewHeight = windowed ? window.innerHeight : root.clientHeight;
      const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      const stackTop = resolveOffset(settings.stackPosition, viewHeight);
      const heights = slots.map((slot) => slot.offsetHeight || 500);

      // Card geometry for horizontal glide
      const firstCard = slots[0]?.querySelector('.scroll-stack-card') as HTMLElement | null;
      const cardWidth = firstCard?.offsetWidth || (isMobile ? window.innerWidth - 32 : 880);
      const gap = isMobile ? 24 : 40;
      const pitch = cardWidth + gap;

      const endHeight = settings.holdDistance + (windowed ? 0 : 200);

      write('endHeight', endHeight, (value) => {
        end.style.height = `${value}px`;
      });

      const innerDocTop = inner.getBoundingClientRect().top - viewTop + readScroll();
      let flow = innerDocTop;
      const slotDocTops: number[] = [];
      for (let i = 0; i < slots.length; i++) {
        slotDocTops.push(flow);
        flow += (heights[i] || 480) + settings.itemDistance;
      }

      return {
        isMobile,
        viewHeight,
        viewTop,
        stackTop,
        heights,
        pitch,
        slotDocTops,
        endHeight,
      };
    };

    const update = () => {
      frame = 0;
      const settings = settingsRef.current;
      const slots = Array.from(inner.children).filter((child) =>
        child.hasAttribute('data-stack-slot')
      ) as HTMLElement[];
      if (!settings || !slots.length) return;

      if (!layoutCache || layoutCache.slotDocTops.length !== slots.length) {
        layoutCache = measureLayout();
      }
      if (!layoutCache) return;

      const { isMobile, viewTop, stackTop, heights, pitch, slotDocTops } = layoutCache;
      const scrollY = readScroll();
      const isReducedMotion = motion.matches;

      if (isMobile) {
        // Mobile view: Natural vertical card layout without horizontal translation or depth occlusions
        slots.forEach((slot, i) => {
          const card = slot.firstElementChild as HTMLElement | null;
          if (!card) return;
          slot.inert = false;
          write(`transform${i}`, '', (value) => {
            card.style.transform = value;
          });
          write(`opacity${i}`, '1', (value) => {
            card.style.opacity = value;
          });
          write(`filter${i}`, '', (value) => {
            card.style.filter = value;
          });
          write(`dim${i}`, '0', (value) => {
            card.style.setProperty('--scroll-stack-dim', value);
          });
        });
        return;
      }

      // Desktop view: Smooth Premium Horizontal Showcase
      // Compute continuous scroll progress index I across cards
      let continuousIndex = 0;
      for (let j = 1; j < slots.length; j++) {
        const pinBefore = viewTop + stackTop;
        const start = pinBefore + (heights[j - 1] || 480);
        const span = Math.max(1, (heights[j - 1] || 480) * 0.85);

        const pinCurrent = viewTop + stackTop;
        const unpinnedTop = (slotDocTops[j] || 0) - scrollY;
        const topJ = Math.max(pinCurrent, unpinnedTop);

        const linearCover = Math.min(1, Math.max(0, (start - topJ) / span));
        const cover = linearCover * linearCover * (3 - 2 * linearCover);
        continuousIndex += cover;
      }

      const activeIdx = Math.min(slots.length - 1, Math.max(0, Math.round(continuousIndex)));
      setActiveCardIndex(activeIdx);

      slots.forEach((slot, i) => {
        const card = slot.firstElementChild as HTMLElement | null;
        if (!card) return;

        const delta = i - continuousIndex;
        const dist = Math.abs(delta);

        // Accessibility: ensure off-screen cards (scrolled past or far ahead) do not trap keyboard focus
        const isOccluded = (continuousIndex - i >= 1.2) || (i - continuousIndex >= 2.4);
        if (slot.inert !== isOccluded) {
          slot.inert = isOccluded;
        }

        if (isReducedMotion) {
          // Reduced motion: bypass transforms, tilt, and dimming completely
          write(`transform${i}`, '', (value) => {
            card.style.transform = value;
          });
          write(`opacity${i}`, '1', (value) => {
            card.style.opacity = value;
          });
          write(`filter${i}`, '', (value) => {
            card.style.filter = value;
          });
          write(`dim${i}`, '0', (value) => {
            card.style.setProperty('--scroll-stack-dim', value);
          });
          return;
        }

        // Horizontal Showcase Motion:
        // Active card: scale 1.0, opacity 1.0, centered in focus
        // Neighboring cards: scale 0.94, opacity 0.72, teasing adjacent designs
        const tx = delta * pitch;
        const scale = Math.max(0.94, 1.0 - 0.06 * Math.min(1, dist));
        const opacity = Math.max(0.72, 1.0 - 0.28 * Math.min(1, dist));

        const transform = `translate3d(${tx.toFixed(1)}px, 0, 0) scale(${scale.toFixed(3)})`;

        write(`transform${i}`, transform, (value) => {
          card.style.transform = value;
        });
        write(`opacity${i}`, opacity.toFixed(3), (value) => {
          card.style.opacity = value;
        });
        write(`filter${i}`, '', (value) => {
          card.style.filter = value;
        });
        write(`dim${i}`, '0', (value) => {
          card.style.setProperty('--scroll-stack-dim', value);
        });
      });

      const done = slots.length > 1 && continuousIndex >= slots.length - 1.01;
      if (done !== complete) {
        complete = done;
        if (done) settings.onStackComplete?.();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const invalidateAndSchedule = () => {
      layoutCache = measureLayout();
      schedule();
    };

    const onScroll = () => {
      schedule();
    };

    const observer = new ResizeObserver(invalidateAndSchedule);
    observer.observe(root);
    observer.observe(inner);
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', invalidateAndSchedule, { passive: true });
    scheduleRef.current = schedule;
    invalidateRef.current = invalidateAndSchedule;
    invalidateAndSchedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', invalidateAndSchedule);
      scheduleRef.current = null;
      invalidateRef.current = null;
    };
  }, [useWindowScroll]);

  return (
    <div
      ref={rootRef}
      className={`scroll-stack ${
        useWindowScroll ? 'scroll-stack--window' : 'scroll-stack--contained'
      } ${className}`.trim()}
    >
      {/* Luxury Progress Indicators on Desktop */}
      <div className="hidden md:flex items-center justify-between px-6 mb-4 max-w-xl mx-auto text-menusqr-emerald/70 font-mono text-xs font-bold uppercase tracking-widest select-none">
        <span className="flex items-center gap-2">
          <span>Design {String(activeCardIndex + 1).padStart(2, '0')}</span>
          <span className="text-menusqr-emerald/30">/</span>
          <span className="text-menusqr-emerald/40">{String(items.length).padStart(2, '0')}</span>
        </span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {items.map((_, dotIdx) => (
            <span
              key={`dot-${dotIdx}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === activeCardIndex
                  ? 'w-6 bg-menusqr-orange shadow-xs'
                  : 'w-1.5 bg-menusqr-emerald/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div ref={innerRef} className="scroll-stack__inner">
        {items.map((child, index) => {
          return (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 && (
                <div aria-hidden="true" style={{ height: Math.max(0, itemDistance) }} />
              )}
              <div
                data-stack-slot=""
                className="scroll-stack__slot"
                style={{
                  top: toLength(stackPosition),
                  zIndex: 20,
                }}
              >
                {child}
              </div>
            </Fragment>
          );
        })}
        <div ref={endRef} className="scroll-stack__end" aria-hidden="true" />
      </div>
    </div>
  );
};

export default ScrollStack;

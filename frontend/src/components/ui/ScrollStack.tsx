'use client';

import {
  Children,
  Fragment,
  isValidElement,
  useLayoutEffect,
  useRef,
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

const scrollsInside = (node: EventTarget | null, stop: Element | null, delta: number): boolean => {
  for (let element = node as HTMLElement | null; element && element !== stop; element = element.parentElement) {
    if (element.scrollHeight <= element.clientHeight + 1) continue;
    const overflow = getComputedStyle(element).overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') continue;
    if (delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) {
      return true;
    }
  }
  return false;
};

export const ScrollStackItem = ({ children, itemClassName = '', style }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()} style={style}>
    {children}
    <span className="scroll-stack-card__shade" aria-hidden="true" />
  </div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 120,
  itemStackDistance = 8,
  stackPosition = '92px',
  itemScale = 0.025,
  baseScale = 0.88,
  dimAmount = 0.14,
  blurAmount = 0,
  tiltAmount = 0,
  rotationAmount = 0,
  holdDistance = 220,
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
    let glide = 0;
    let rest = 0;
    let complete = false;
    let gliding = false;
    let pressed = false;
    let current = 0;
    let goal = 0;
    let written = 0;
    let last = 0;

    interface LayoutCache {
      viewHeight: number;
      viewTop: number;
      stackTop: number;
      offset: number;
      heights: number[];
      slotDocTops: number[];
      padTop: number;
      endHeight: number;
      points: number[];
      reach: number;
    }

    let layoutCache: LayoutCache | null = null;

    const readScroll = () => (windowed ? window.scrollY : root.scrollTop);
    const maxScroll = () =>
      windowed ? document.documentElement.scrollHeight - window.innerHeight : root.scrollHeight - root.clientHeight;
    const writeScroll = (value: number) => {
      written = value;
      if (windowed) {
        window.scrollTo({ top: value, behavior: 'instant' as ScrollBehavior });
      } else {
        root.scrollTo({ top: value, behavior: 'instant' as ScrollBehavior });
      }
    };

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

      const viewHeight = windowed ? window.innerHeight : root.clientHeight;
      const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
      const stackTop = resolveOffset(settings.stackPosition, viewHeight);
      const offset = settings.itemStackDistance;
      const heights = slots.map((slot) => slot.offsetHeight);
      const padTop = windowed ? 0 : stackTop;
      const endHeight =
        settings.holdDistance +
        (windowed ? 0 : Math.max(0, viewHeight - stackTop - (heights[heights.length - 1] || 0)));

      write('padTop', padTop, (value) => {
        inner.style.paddingTop = `${value}px`;
      });
      write('endHeight', endHeight, (value) => {
        end.style.height = `${value}px`;
      });

      const innerDocTop = inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
      let flow = innerDocTop;
      const slotDocTops: number[] = [];
      const points: number[] = [];
      for (let i = 0; i < slots.length; i++) {
        slotDocTops.push(flow);
        points.push(flow - stackTop);
        flow += (heights[i] || 0) + settings.itemDistance;
      }
      const reach = Math.max(40, ((heights[0] || 0) + settings.itemDistance) / 2);

      return {
        viewHeight,
        viewTop,
        stackTop,
        offset,
        heights,
        slotDocTops,
        padTop,
        endHeight,
        points,
        reach,
      };
    };

    const update = () => {
      frame = 0;
      const settings = settingsRef.current;
      const slots = Array.from(inner.children).filter((child) =>
        child.hasAttribute('data-stack-slot')
      ) as HTMLElement[];
      if (!settings || !slots.length) return;

      if (!layoutCache || layoutCache.heights.length !== slots.length) {
        layoutCache = measureLayout();
      }
      if (!layoutCache) return;

      const { viewTop, stackTop, heights, slotDocTops } = layoutCache;
      const scrollY = readScroll();

      const depths = slots.map(() => 0);
      let lastCover = 0;
      for (let j = 1; j < slots.length; j++) {
        const pinBefore = viewTop + stackTop;
        const start = pinBefore + (heights[j - 1] || 0);
        const span = Math.max(1, (heights[j - 1] || 0) * 0.85);
        
        const pinCurrent = viewTop + stackTop;
        const unpinnedTop = (slotDocTops[j] || 0) - scrollY;
        const topJ = Math.max(pinCurrent, unpinnedTop);

        const linearCover = Math.min(1, Math.max(0, (start - topJ) / span));
        // C1 smoothstep easing curve for natural deceleration: 3t^2 - 2t^3
        const cover = linearCover * linearCover * (3 - 2 * linearCover);

        for (let i = 0; i < j; i++) depths[i] += cover;
        lastCover = cover;
      }

      const isReducedMotion = motion.matches;
      const dimStep = Math.min(Math.max(settings.dimAmount, 0), 1);

      slots.forEach((slot, i) => {
        const card = slot.firstElementChild as HTMLElement | null;
        if (!card) return;
        const depth = depths[i];

        // Accessibility: ensure fully occluded cards do not trap keyboard focus
        const isOccluded = depth >= 0.999;
        if (slot.inert !== isOccluded) {
          slot.inert = isOccluded;
        }

        if (isReducedMotion) {
          write(`transform${i}`, '', (value) => {
            card.style.transform = value;
          });
          write(`filter${i}`, '', (value) => {
            card.style.filter = value;
          });
          write(`dim${i}`, '0', (value) => {
            card.style.setProperty('--scroll-stack-dim', value);
          });
          return;
        }

        const lean = Math.min(depth, 1);
        const scale = Math.max(
          settings.baseScale,
          1 - Math.min(depth * settings.itemScale, 1 - settings.baseScale)
        );
        const upwardShift = -Math.min(depth, 3) * (settings.itemStackDistance > 0 ? Math.min(settings.itemStackDistance, 8) : 0);
        const tilt = -lean * settings.tiltAmount;
        const turn = lean * settings.rotationAmount * (i % 2 ? -1 : 1);
        const blur = depth * settings.blurAmount;
        const dim = 1 - Math.pow(1 - dimStep, depth);
        const has3D = Math.abs(tilt) > 0.01 || Math.abs(turn) > 0.01;
        const transform =
          depth < 0.0005
            ? ''
            : has3D
              ? `perspective(1200px) translateY(${upwardShift.toFixed(1)}px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`
              : `translateY(${upwardShift.toFixed(1)}px) scale(${scale.toFixed(4)})`;

        write(`transform${i}`, transform, (value) => {
          card.style.transform = value;
        });
        write(`filter${i}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '', (value) => {
          card.style.filter = value;
        });
        write(`dim${i}`, dim.toFixed(3), (value) => {
          card.style.setProperty('--scroll-stack-dim', value);
        });
      });

      const done = slots.length > 1 && lastCover >= 0.999;
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

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (Math.abs(readScroll() - written) > 2) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      current += (goal - current) * (1 - Math.pow(0.9, dt * 60));
      if (Math.abs(goal - current) < 0.5) current = goal;
      writeScroll(current);
      if (current === goal) {
        gliding = false;
        glide = 0;
        settleSoon();
        return;
      }
      glide = requestAnimationFrame(step);
    };

    const glideTo = (value: number) => {
      goal = Math.min(Math.max(value, 0), maxScroll());
      if (motion.matches) {
        writeScroll(goal);
        return;
      }
      if (gliding) return;
      gliding = true;
      current = readScroll();
      written = current;
      last = performance.now();
      glide = requestAnimationFrame(step);
    };

    const settle = () => {
      rest = 0;
      if (!settingsRef.current?.snap || gliding || pressed || !layoutCache?.points?.length) return;
      const now = readScroll();
      const points = layoutCache.points;
      const nearest = points.reduce((best, point) => (Math.abs(point - now) < Math.abs(best - now) ? point : best));
      const gap = Math.abs(nearest - now);
      if (gap > 1 && gap < layoutCache.reach) glideTo(nearest);
    };

    const settleSoon = () => {
      window.clearTimeout(rest);
      rest = window.setTimeout(settle, 140);
    };

    const onScroll = () => {
      schedule();
      if (!gliding) settleSoon();
    };

    const onWheel = (event: WheelEvent) => {
      if (!settingsRef.current?.smoothScroll || motion.matches || event.defaultPrevented || event.ctrlKey) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const page = windowed ? window.innerHeight : root.clientHeight;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
      if (!delta || scrollsInside(event.target, windowed ? document.body : root, delta)) return;
      const base = gliding ? goal : readScroll();
      if ((delta < 0 && base <= 0) || (delta > 0 && base >= maxScroll() - 0.5)) return;
      event.preventDefault();
      window.clearTimeout(rest);
      glideTo(base + delta);
    };

    const onPress = () => {
      pressed = true;
      window.clearTimeout(rest);
    };

    const onRelease = () => {
      if (!pressed) return;
      pressed = false;
      settleSoon();
    };

    const observer = new ResizeObserver(invalidateAndSchedule);
    observer.observe(root);
    observer.observe(inner);
    target.addEventListener('scroll', onScroll, { passive: true });
    target.addEventListener('wheel', onWheel as EventListener, { passive: false });
    target.addEventListener('pointerdown', onPress as EventListener, { passive: true });
    window.addEventListener('pointerup', onRelease, { passive: true });
    window.addEventListener('pointercancel', onRelease, { passive: true });
    window.addEventListener('resize', invalidateAndSchedule);
    scheduleRef.current = schedule;
    invalidateRef.current = invalidateAndSchedule;
    invalidateAndSchedule();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glide);
      window.clearTimeout(rest);
      observer.disconnect();
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('wheel', onWheel as EventListener);
      target.removeEventListener('pointerdown', onPress as EventListener);
      window.removeEventListener('pointerup', onRelease);
      window.removeEventListener('pointercancel', onRelease);
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
                  zIndex: index + 1,
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

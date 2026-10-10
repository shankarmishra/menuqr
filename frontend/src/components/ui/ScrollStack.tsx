'use client';

import { useLayoutEffect, useRef, useCallback } from 'react';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }: any) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface CardMetric {
  top: number;
  height: number;
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}: any) => {
  const scrollerRef = useRef<any>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const cardMetricsRef = useRef<CardMetric[]>([]);
  const endElementTopRef = useRef<number>(0);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: any, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value) || 0;
  }, []);

  // Measure all cards once on layout/resize - NO DOM LEAKS ON SCROLL
  const measureCards = useCallback(() => {
    const scroller = scrollerRef.current;
    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller?.querySelectorAll('.scroll-stack-card') || []
    ) as HTMLElement[];

    cardsRef.current = cards;

    const metrics: CardMetric[] = [];
    cards.forEach((card) => {
      if (!card) return;
      let offset = 0;
      let current: HTMLElement | null = card;
      while (current) {
        offset += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      metrics.push({
        top: offset,
        height: card.offsetHeight || 500,
      });
    });
    cardMetricsRef.current = metrics;

    const endElement = (useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scroller?.querySelector('.scroll-stack-end')) as HTMLElement | null;

    if (endElement) {
      let endOffset = 0;
      let current: HTMLElement | null = endElement;
      while (current) {
        endOffset += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      endElementTopRef.current = endOffset;
    }
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    isUpdatingRef.current = true;

    const scrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop || 0);
    const containerHeight = useWindowScroll ? window.innerHeight : (scrollerRef.current?.clientHeight || 0);

    const defaultStackPositionPx = stackPosition === 'center' ? 0 : parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const pinEnd = endElementTopRef.current > 0 ? endElementTopRef.current - containerHeight / 2 : 0;

    let topCardIndex = 0;
    const metrics = cardMetricsRef.current;

    if (blurAmount && metrics.length) {
      for (let j = 0; j < metrics.length; j++) {
        const m = metrics[j];
        if (m) {
          const cardStackPos = stackPosition === 'center'
            ? Math.max((containerHeight - m.height) / 2, 0)
            : defaultStackPositionPx;
          const triggerStart = m.top - cardStackPos - itemStackDistance * j;
          if (scrollTop >= triggerStart) {
            topCardIndex = j;
          }
        }
      }
    }

    cardsRef.current.forEach((card: HTMLElement, i: number) => {
      const metric = metrics[i];
      if (!card || !metric) return;

      const cardTop = metric.top;
      const cardHeight = metric.height;
      const cardStackPositionPx = stackPosition === 'center'
        ? Math.max((containerHeight - cardHeight) / 2, 0)
        : defaultStackPositionPx;

      const triggerStart = cardTop - cardStackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = triggerStart;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount && i < topCardIndex) {
        const depthInStack = topCardIndex - i;
        blur = Math.max(0, depthInStack * blurAmount);
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + cardStackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd && pinEnd > 0) {
        translateY = pinEnd - cardTop + cardStackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 10) / 10,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 10) / 10,
        blur: Math.round(blur * 10) / 10
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.2 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.2 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.2;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale})${newTransform.rotation ? ` rotate(${newTransform.rotation}deg)` : ''}`;
        card.style.transform = transform;
        if (blurAmount > 0) {
          card.style.filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
        }

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage
  ]);

  const scheduleCardUpdate = useCallback(() => {
    if (animationFrameRef.current !== null) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    measureCards();

    cardsRef.current.forEach((card: HTMLElement, i: number) => {
      if (i < cardsRef.current.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
    });

    updateCardTransforms();

    const handleResize = () => {
      measureCards();
      updateCardTransforms();
    };

    const scrollTarget = useWindowScroll ? window : scroller;
    if (scrollTarget) {
      scrollTarget.addEventListener('scroll', scheduleCardUpdate, { passive: true });
    }
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      if (scrollTarget) {
        scrollTarget.removeEventListener('scroll', scheduleCardUpdate);
      }
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardMetricsRef.current = [];
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    useWindowScroll,
    scheduleCardUpdate,
    updateCardTransforms,
    measureCards
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;

import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollToTop ensures that when navigating to new pages via React Router,
 * the scroll position resets to the top of the page (0, 0) instead of leaving
 * the user stuck at the bottom near the footer.
 *
 * It respects:
 * 1. Hash anchors (e.g. /#templates) by scrolling smoothly to that element.
 * 2. Browser Back/Forward buttons (POP navigation) where native scroll restoration applies.
 * 3. Smooth page resets with zero layout thrashing.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // If user clicked Browser Back or Forward, let browser manage history position unless targeting an anchor
    if (navType === 'POP' && !hash) {
      return;
    }

    if (hash) {
      const targetId = hash.replace('#', '');
      const timer = window.setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => window.clearTimeout(timer);
    }

    // On standard link click / PUSH navigation, immediately reset window scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, hash, navType]);

  return null;
}

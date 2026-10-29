import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from './analytics';

export default function RouteTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    // Wait a tick so react-helmet has updated document.title for this route.
    const id = window.setTimeout(() => trackPageView(pathname + search), 0);
    return () => window.clearTimeout(id);
  }, [pathname, search]);

  return null;
}

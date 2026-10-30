import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackEvent, trackPageView } from './analytics';

const CTA_PATHS = ['/plans', '/templates', '/signup', '/login', '/purchase/details', '/onboarding'];

export default function RouteTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initAnalytics();
  }, []);

  // One delegated listener covers every contact link and call-to-action, including ones added later.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a');
      const href = link?.getAttribute('href');
      if (!link || !href) return;
      const text = (link.textContent || '').trim().slice(0, 60);

      if (href.startsWith('tel:')) trackEvent('generate_lead', { method: 'phone', link_text: text });
      else if (href.startsWith('mailto:')) trackEvent('generate_lead', { method: 'email', link_text: text });
      else if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackEvent('generate_lead', { method: 'whatsapp', link_text: text });
      else if (CTA_PATHS.some((p) => href === p || href.startsWith(`${p}?`))) {
        trackEvent('cta_click', { link_url: href, link_text: text, page_path: window.location.pathname });
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    // Wait a tick so react-helmet has updated document.title for this route.
    const id = window.setTimeout(() => trackPageView(pathname + search), 0);
    return () => window.clearTimeout(id);
  }, [pathname, search]);

  return null;
}

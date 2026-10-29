const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const ADMIN_HOSTNAME = import.meta.env.VITE_ADMIN_HOSTNAME?.trim();

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

// Only track the public site: skip dev builds, unconfigured envs and the admin host.
const isEnabled = () =>
  import.meta.env.PROD &&
  !!MEASUREMENT_ID &&
  !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname) &&
  !(ADMIN_HOSTNAME && window.location.hostname === ADMIN_HOSTNAME);

export function initAnalytics() {
  if (initialized || !isEnabled()) return;
  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    // gtag.js requires the `arguments` object, not a rest array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  // SPA: page views are sent manually on route change.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  // Events queue on window.dataLayer; load the 170 KB gtag script only after the page is
  // interactive so it never competes with first paint / hydration.
  const loadScript = () => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);
  };
  const whenIdle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadScript, { timeout: 4000 });
    else setTimeout(loadScript, 2000);
  };
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}

export function trackPageView(path: string) {
  if (!initialized || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!initialized || !window.gtag) return;
  window.gtag('event', name, params);
}

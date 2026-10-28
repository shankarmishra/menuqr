import NotFoundPage from './pages/public/NotFoundPage';
import React, { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { MenusQRMark } from './components/brand/MenusQRMark';
import { MenusQRLoader } from './components/brand/MenusQRLoader';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useMatch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/navigation/ScrollToTop';
import HomePage from './pages/HomePage';
import PricingPage from './pages/purchase/PricingPage';

// SEO Landing Pages (Statically bundled for instant prerender hydration)
import DigitalQrMenu from './pages/public/seo/DigitalQrMenu';
import RestaurantQrMenu from './pages/public/seo/RestaurantQrMenu';
import DigitalMenuForRestaurants from './pages/public/seo/DigitalMenuForRestaurants';
import QrMenuForRestaurants from './pages/public/seo/QrMenuForRestaurants';
import RestaurantDigitalMenu from './pages/public/seo/RestaurantDigitalMenu';
import QrOrderingForRestaurants from './pages/public/seo/QrOrderingForRestaurants';

// Public Marketing Pages (Statically bundled to prevent fallback flash on prerendered HTML)
import HowItWorksPage from './pages/public/HowItWorksPage';
import TemplatesPage from './pages/public/TemplatesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';

import { getAdminSession, getClientByMenuSlug } from './pages/admin/clientStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FeatureGate from './components/guards/FeatureGate';
import { ToastProvider } from './components/feedback/ToastProvider';
import QrLandingPage from './pages/public/QrLandingPage';
import { getAdminRedirectUrl, isAdminHostname, isAdminPath } from './utils/hostRouting';

// Resilient chunk loader with automatic 1-time reload on deployment hash change
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((err) => {
      const reloadKey = 'menusqr_chunk_reload';
      const lastReload = typeof window !== 'undefined' ? window.sessionStorage.getItem(reloadKey) : null;
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 30000) {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(reloadKey, String(now));
          window.location.reload();
        }
      }
      throw err;
    })
  );
}

// Fallback spinner matching MENUQR dark theme for full-page SPA loads
function PageFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]" role="status" aria-live="polite">
      <div className="flex items-center gap-2.5">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#aab7b2]/20 border-t-[#e8783c]" />
        <span>Loading...</span>
      </div>
    </div>
  );
}

// Chunk error boundary to catch dynamic bundle loading failures
class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-[360px] place-items-center bg-[#151c19] px-6 text-center text-sm text-[#aab7b2]" role="alert">
          <div className="max-w-md rounded-2xl border border-white/10 bg-[#1d2723] p-8 shadow-xl">
            <p className="font-semibold text-white">Something went wrong loading this page.</p>
            <p className="mt-2 text-xs text-[#aab7b2]">Please check your connection or reload to get the latest version.</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-5 rounded-lg bg-[#e8783c] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d6672b]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy Authenticated App Routes (Restaurant Owner Portal)
const AppLayout = lazyWithRetry(() => import('./layouts/AppLayout'));
const AppDashboard = lazyWithRetry(() => import('./pages/app/Dashboard'));
const AppMenu = lazyWithRetry(() => import('./pages/app/Menu'));
const AppAppearance = lazyWithRetry(() => import('./pages/app/Appearance'));
const AppQrCenter = lazyWithRetry(() => import('./pages/app/QrCenter'));
const AppSubscription = lazyWithRetry(() => import('./pages/app/Subscription'));
const AppSettings = lazyWithRetry(() => import('./pages/app/Settings'));
const AppOrders = lazyWithRetry(() => import('./pages/app/Orders'));

// Lazy Admin Routes
const AdminLayout = lazyWithRetry(() => import('./layouts/AdminLayout'));
const AdminLogin = lazyWithRetry(() => import('./pages/admin/AdminLogin'));
const Dashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'));
const ClientList = lazyWithRetry(() => import('./pages/admin/ClientList'));
const ClientForm = lazyWithRetry(() => import('./pages/admin/ClientForm'));
const QrGenerator = lazyWithRetry(() => import('./pages/admin/QrGenerator'));
const Settings = lazyWithRetry(() => import('./pages/admin/Settings'));
const Orders = lazyWithRetry(() => import('./pages/admin/Orders'));
const Coupons = lazyWithRetry(() => import('./pages/admin/Coupons'));
const Payments = lazyWithRetry(() => import('./pages/admin/Payments'));
const StickerRequests = lazyWithRetry(() => import('./pages/admin/StickerRequests'));

// Lazy Customer / Onboarding / Checkout Routes
const OnboardingWizard = lazyWithRetry(() => import('./pages/public/OnboardingWizard'));
const PurchaseDetailsPage = lazyWithRetry(() => import('./pages/purchase/PurchaseDetailsPage'));
const PurchaseReviewPage = lazyWithRetry(() => import('./pages/purchase/PurchaseReviewPage'));
const PurchaseSuccessPage = lazyWithRetry(() => import('./pages/purchase/PurchaseSuccessPage'));
const TemplateAuditCanvas = lazyWithRetry(() => import('./pages/public/TemplateAuditCanvas'));
const TemplateShowcasePage = lazyWithRetry(() => import('./pages/public/TemplateShowcasePage'));
const MenuPage = lazyWithRetry(() => import('./pages/customer/MenuPage'));

function ProtectedAdminLayout() {
  const location = useLocation();
  const [sessionState, setSessionState] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'error'>('checking');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    let timer: number | undefined;

    async function checkSession(attempt = 1) {
      try {
        const session = await getAdminSession();
        if (!isCurrent) return;
        if (session.authenticated && session.user?.role === 'SUPER_ADMIN') {
          setSessionState('authenticated');
        } else if (attempt === 1) {
          timer = window.setTimeout(() => {
            if (isCurrent) void checkSession(2);
          }, 300);
        } else {
          setSessionState('unauthenticated');
        }
      } catch {
        if (!isCurrent) return;
        if (attempt === 1) {
          timer = window.setTimeout(() => {
            if (isCurrent) void checkSession(2);
          }, 300);
        } else {
          setSessionState('error');
        }
      }
    }

    void checkSession(1);

    const handleUnauthorized = () => setSessionState('unauthenticated');
    window.addEventListener('menusqr:admin-unauthorized', handleUnauthorized);
    return () => {
      isCurrent = false;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('menusqr:admin-unauthorized', handleUnauthorized);
    };
  }, [retry]);

  if (sessionState === 'checking') return <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]">Checking admin session…</div>;
  if (sessionState === 'error') return <div className="grid min-h-screen place-items-center bg-[#151c19] px-5 text-center text-sm text-rose-300"><div><p>Could not connect to the admin API.</p><button type="button" onClick={() => { setSessionState('checking'); setRetry((current) => current + 1); }} className="mt-4 rounded-lg bg-[#e8783c] px-4 py-2 font-semibold text-white">Retry</button></div></div>;
  if (sessionState === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <AdminLayout />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function ProtectedAppLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]">Loading...</div>;
  }

  if (!user || (user.role !== 'RESTAURANT_OWNER' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <AppLayout />
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function AdminPortalRoutes() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin" element={<ProtectedAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients/new/:step?" element={<ClientForm />} />
            <Route path="clients/:clientId/:step?" element={<ClientForm />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="restaurants" element={<ClientList />} />
            <Route path="dhabas" element={<ClientList />} />
            <Route path="cafes" element={<ClientList />} />
            <Route path="orders" element={<Orders />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="sticker-requests" element={<StickerRequests />} />
            <Route path="payments" element={<Payments />} />
            <Route path="qr" element={<QrGenerator />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}

function AdminDomainRedirect({ destination }: { destination: string }) {
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return <div className="grid min-h-screen place-items-center text-sm text-[#53615a]" role="status">Opening admin portal...</div>;
}

function PublicAppRoutes() {
  const menuMatch = useMatch('/menu/:slug');
  const qrMatch = useMatch('/qr/:qrId');
  const auditMatch = useMatch('/audit-preview/:templateId');
  const auditBaseMatch = useMatch('/audit-preview');
  const menuSlug = menuMatch?.params.slug;
  const isCustomerMenuRoute = Boolean(menuSlug || qrMatch || auditMatch || auditBaseMatch);
  const routeKey = menuSlug ? `menu:${menuSlug}` : 'app';
  const [menuName, setMenuName] = useState<{ slug: string; name: string }>();
  const [loadedRoute, setLoadedRoute] = useState(routeKey);
  const loaderName = menuSlug
    ? menuName?.slug === menuSlug ? menuName.name : 'Preparing menu'
    : 'MenusQR';
  const loaderCaption = menuMatch ? 'Preparing your menu' : 'Preparing your experience';
  const isLoading = loadedRoute !== routeKey;
  const adminHostname = import.meta.env.VITE_ADMIN_HOSTNAME?.trim();
  const isAdminRedirect = isAdminPath(window.location.pathname);

  useEffect(() => {
    if (isAdminRedirect) return;
    let isCurrent = true;
    if (menuSlug) {
      setLoadedRoute('');
      void getClientByMenuSlug(menuSlug).then((menu) => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: menu?.businessName ?? 'MenusQR' });
      }).catch(() => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: 'MenusQR' });
      });
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 500;
      const timer = window.setTimeout(() => setLoadedRoute(routeKey), duration);
      return () => {
        isCurrent = false;
        window.clearTimeout(timer);
      };
    } else {
      setLoadedRoute(routeKey);
    }
  }, [menuSlug, routeKey, isAdminRedirect]);

  if (isAdminRedirect) {
    if (!adminHostname) return <NotFoundPage />;
    return <AdminDomainRedirect destination={getAdminRedirectUrl(
      adminHostname,
      window.location.pathname,
      window.location.search,
      window.location.hash,
    )} />;
  }

  return (
    <>
      {!isCustomerMenuRoute && <MenusQRLoader />}
      <Routes>
        {/* Core Public Brand & Commercial SEO Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/digital-qr-menu" element={<DigitalQrMenu />} />
        <Route path="/restaurant-qr-menu" element={<RestaurantQrMenu />} />
        <Route path="/digital-menu-for-restaurants" element={<DigitalMenuForRestaurants />} />
        <Route path="/qr-menu-for-restaurants" element={<QrMenuForRestaurants />} />
        <Route path="/restaurant-digital-menu" element={<RestaurantDigitalMenu />} />
        <Route path="/qr-ordering-for-restaurants" element={<QrOrderingForRestaurants />} />
        
        {/* Pricing & Alias Routes */}
        <Route path="/plans" element={<PricingPage />} />
        <Route path="/digital-menu-pricing" element={<Navigate to="/plans" replace />} />

        {/* Marketing & Support Pages */}
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* Legal Pages & Aliases */}
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-cancellation" element={<RefundPolicyPage />} />
        <Route path="/refund-policy" element={<Navigate to="/refund-cancellation" replace />} />

        {/* Customer Onboarding & Checkout Flow */}
        <Route path="/signup" element={<Navigate to="/purchase/details" replace />} />
        <Route path="/onboarding" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><OnboardingWizard /></Suspense></ChunkErrorBoundary>} />
        <Route path="/purchase/details" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><PurchaseDetailsPage /></Suspense></ChunkErrorBoundary>} />
        <Route path="/purchase/review" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><PurchaseReviewPage /></Suspense></ChunkErrorBoundary>} />
        <Route path="/purchase/success" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><PurchaseSuccessPage /></Suspense></ChunkErrorBoundary>} />
        
        {/* Customer Menu Route */}
        <Route path="/qr/:qrId" element={<QrLandingPage />} />
        <Route path="/menu/:slug" element={<ChunkErrorBoundary><Suspense fallback={null}><MenuPage key={menuSlug} /></Suspense></ChunkErrorBoundary>} />
        <Route path="/audit-preview/:templateId" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><TemplateAuditCanvas /></Suspense></ChunkErrorBoundary>} />
        <Route path="/audit-preview" element={<Navigate to="/audit-preview/royal-maharaja" replace />} />
        <Route path="/template-showcase" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><TemplateShowcasePage /></Suspense></ChunkErrorBoundary>} />
        <Route path="/showcase" element={<Navigate to="/template-showcase" replace />} />

        {/* Auth & Admin */}
        <Route path="/login" element={<ChunkErrorBoundary><Suspense fallback={<PageFallback />}><AdminLogin /></Suspense></ChunkErrorBoundary>} />

        {/* App Dashboard Routes */}
        <Route path="/app" element={<AuthProvider><ProtectedAppLayout /></AuthProvider>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AppDashboard />} />
          <Route path="menu" element={<AppMenu />} />
          <Route path="appearance" element={<FeatureGate capability="menu_management"><AppAppearance /></FeatureGate>} />
          <Route path="qr" element={<AppQrCenter />} />
          <Route path="subscription" element={<AppSubscription />} />
          <Route path="settings" element={<AppSettings />} />
          <Route path="orders" element={<FeatureGate capability="reception_orders"><AppOrders /></FeatureGate>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isLoading && (
        <div 
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050807] transition-opacity duration-300"
          role="status" 
          aria-live="polite" 
          aria-label={`Loading ${loaderName}`}
        >
          <div className="relative flex flex-row items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
            <div className="relative w-[100px] h-[100px]">
              <MenusQRMark animated={true} color="#FFFFFF" />
            </div>

            <div className="flex flex-col text-left justify-center overflow-hidden">
              <div
                className="text-6xl md:text-7xl font-black tracking-[-0.03em] leading-none text-white"
                style={{ fontFamily: 'var(--font-brand, system-ui)' }}
              >
                Menus<span className="text-[#E8783C]">QR</span>
              </div>
              
              <div className="flex flex-col mt-3">
                <div className="text-white text-lg font-bold tracking-tight">{loaderName}</div>
                <div className="text-[#aab7b2] text-xs font-medium uppercase tracking-widest">{loaderCaption}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppRoutes() {
  const adminHostname = import.meta.env.VITE_ADMIN_HOSTNAME;
  return isAdminHostname(window.location.hostname, adminHostname)
    ? <AdminPortalRoutes />
    : <PublicAppRoutes />;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

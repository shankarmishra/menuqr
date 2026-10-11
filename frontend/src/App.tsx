import NotFoundPage from './pages/public/NotFoundPage';
import { useEffect, useState } from 'react';
import { MenusQRMark } from './components/brand/MenusQRMark';
import { MenusQRLoader } from './components/brand/MenusQRLoader';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useMatch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ScrollToTop from './components/navigation/ScrollToTop';
import HomePage from './pages/HomePage';
import SignupPage from './pages/public/SignupPage';
import OnboardingWizard from './pages/public/OnboardingWizard';
import PricingPage from './pages/purchase/PricingPage';
import PurchaseDetailsPage from './pages/purchase/PurchaseDetailsPage';
import PurchaseReviewPage from './pages/purchase/PurchaseReviewPage';
import PurchaseSuccessPage from './pages/purchase/PurchaseSuccessPage';
import MenuPage from './pages/customer/MenuPage';

// SEO Landing Pages
import DigitalQrMenu from './pages/public/seo/DigitalQrMenu';
import RestaurantQrMenu from './pages/public/seo/RestaurantQrMenu';
import DigitalMenuForRestaurants from './pages/public/seo/DigitalMenuForRestaurants';
import QrMenuForRestaurants from './pages/public/seo/QrMenuForRestaurants';
import RestaurantDigitalMenu from './pages/public/seo/RestaurantDigitalMenu';
import QrOrderingForRestaurants from './pages/public/seo/QrOrderingForRestaurants';

// Public Marketing Pages
import HowItWorksPage from './pages/public/HowItWorksPage';
import TemplatesPage from './pages/public/TemplatesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import RefundPolicyPage from './pages/public/RefundPolicyPage';
import TemplateAuditCanvas from './pages/public/TemplateAuditCanvas';

import AdminLayout from './layouts/AdminLayout';
import AppLayout from './layouts/AppLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ClientList from './pages/admin/ClientList';
import QrGenerator from './pages/admin/QrGenerator';
import Settings from './pages/admin/Settings';
import ClientForm from './pages/admin/ClientForm';
import Orders from './pages/admin/Orders';
import Coupons from './pages/admin/Coupons';
import Payments from './pages/admin/Payments';
import StickerRequests from './pages/admin/StickerRequests';
import { getAdminSession, getClientByMenuSlug } from './pages/admin/clientStore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppDashboard from './pages/app/Dashboard';
import AppMenu from './pages/app/Menu';
import AppAppearance from './pages/app/Appearance';
import AppQrCenter from './pages/app/QrCenter';
import AppSubscription from './pages/app/Subscription';
import AppSettings from './pages/app/Settings';
import AppOrders from './pages/app/Orders';

import FeatureGate from './components/guards/FeatureGate';
import { ToastProvider } from './components/feedback/ToastProvider';
import QrLandingPage from './pages/public/QrLandingPage';
import { getAdminRedirectUrl, isAdminHostname, isAdminPath } from './utils/hostRouting';

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
  return <AdminLayout />;
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

  return <AppLayout />;
}

function AdminPortalRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin" element={<ProtectedAdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients/new/:step?" element={<ClientForm />} />
        <Route path="clients/:clientId/:step?" element={<ClientForm />} />
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
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/purchase/details" element={<PurchaseDetailsPage />} />
        <Route path="/purchase/review" element={<PurchaseReviewPage />} />
        <Route path="/purchase/success" element={<PurchaseSuccessPage />} />
        
        {/* Customer Menu Route */}
        <Route path="/qr/:qrId" element={<QrLandingPage />} />
        <Route path="/menu/:slug" element={<MenuPage key={menuSlug} />} />
        <Route path="/audit-preview/:templateId" element={<TemplateAuditCanvas />} />
        <Route path="/audit-preview" element={<Navigate to="/audit-preview/royal-maharaja" replace />} />

        {/* Auth & Admin */}
        <Route path="/login" element={<AdminLogin />} />

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

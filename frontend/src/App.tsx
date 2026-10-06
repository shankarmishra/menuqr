import NotFoundPage from './pages/public/NotFoundPage';
import { useEffect, useState } from 'react';
import { MenusQRMark } from './components/brand/MenusQRMark';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useMatch } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HomePage from './pages/HomePage';
import SignupPage from './pages/public/SignupPage';
import OnboardingWizard from './pages/public/OnboardingWizard';
import PricingPage from './pages/purchase/PricingPage';
import PurchaseDetailsPage from './pages/purchase/PurchaseDetailsPage';
import PurchaseReviewPage from './pages/purchase/PurchaseReviewPage';
import CheckoutPage from './pages/purchase/CheckoutPage';
import PurchaseSuccessPage from './pages/purchase/PurchaseSuccessPage';
import MenuPage from './pages/customer/MenuPage';
import DigitalQrMenu from './pages/public/seo/DigitalQrMenu';
import RestaurantQrMenu from './pages/public/seo/RestaurantQrMenu';
import AdminLayout from './layouts/AdminLayout';
import AppLayout from './layouts/AppLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ClientList from './pages/admin/ClientList';
import QrGenerator from './pages/admin/QrGenerator';
import Settings from './pages/admin/Settings';
import ClientForm from './pages/admin/ClientForm';
import Orders from './pages/admin/Orders';
import Payments from './pages/admin/Payments';
import { getAdminSession, getClientByMenuSlug } from './pages/admin/clientStore';
import { useAuth } from './contexts/AuthContext';
import AppDashboard from './pages/app/Dashboard';
import AppMenu from './pages/app/Menu';
import AppAppearance from './pages/app/Appearance';
import AppQrCenter from './pages/app/QrCenter';
import AppSubscription from './pages/app/Subscription';
import AppSettings from './pages/app/Settings';
import AppOrders from './pages/app/Orders';
import SupabaseTest from './components/SupabaseTest';

function ProtectedAdminLayout() {
  const location = useLocation();
  const [sessionState, setSessionState] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'error'>('checking');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    void getAdminSession().then((session) => {
      if (isCurrent) setSessionState(session.authenticated ? 'authenticated' : 'unauthenticated');
    }).catch(() => {
      if (isCurrent) setSessionState('error');
    });
    const handleUnauthorized = () => setSessionState('unauthenticated');
    window.addEventListener('menusqr:admin-unauthorized', handleUnauthorized);
    return () => {
      isCurrent = false;
      window.removeEventListener('menusqr:admin-unauthorized', handleUnauthorized);
    };
  }, [retry]);

  if (sessionState === 'checking') return <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]">Checking admin sessionâ€¦</div>;
  if (sessionState === 'error') return <div className="grid min-h-screen place-items-center bg-[#151c19] px-5 text-center text-sm text-rose-300"><div><p>Could not connect to the admin API.</p><button type="button" onClick={() => { setSessionState('checking'); setRetry((current) => current + 1); }} className="mt-4 rounded-lg bg-[#e8783c] px-4 py-2 font-semibold text-white">Retry</button></div></div>;
  if (sessionState === 'unauthenticated') return <Navigate to="/admin/login" replace state={{ from: location }} />;
  return <AdminLayout />;
}

function ProtectedAppLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]">Loading...</div>;
  }

  if (!user || (user.role !== 'RESTAURANT_OWNER' && user.role !== 'SUPER_ADMIN')) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <AppLayout />;
}

function AppRoutes() {
  const menuMatch = useMatch('/menu/:slug');
  const menuSlug = menuMatch?.params.slug;
  const routeKey = menuSlug ? `menu:${menuSlug}` : 'app';
  const [menuName, setMenuName] = useState<{ slug: string; name: string }>();
  const [loadedRoute, setLoadedRoute] = useState('');
  const loaderName = menuSlug
    ? menuName?.slug === menuSlug ? menuName.name : 'Preparing menu'
    : 'MenusQR';
  const loaderCaption = menuMatch ? 'Preparing your menu' : 'Preparing your experience';
  const isLoading = loadedRoute !== routeKey;

  useEffect(() => {
    let isCurrent = true;
    if (menuSlug) {
      void getClientByMenuSlug(menuSlug).then((menu) => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: menu?.businessName ?? 'MenusQR' });
      }).catch(() => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: 'MenusQR' });
      });
    }
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 150 : 1100;
    const timer = window.setTimeout(() => setLoadedRoute(routeKey), duration);
    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [menuSlug, routeKey]);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/plans" element={<PricingPage />} />
        <Route path="/purchase/details" element={<PurchaseDetailsPage />} />
        <Route path="/purchase/review" element={<PurchaseReviewPage />} />
        <Route path="/checkout/:orderId" element={<CheckoutPage />} />
        <Route path="/purchase/success" element={<PurchaseSuccessPage />} />
        
        {/* SEO Pages */}
        <Route path="/digital-qr-menu" element={<DigitalQrMenu />} />
        <Route path="/restaurant-qr-menu" element={<RestaurantQrMenu />} />

        {/* Customer Menu Route */}
        <Route path="/menu/:slug" element={<MenuPage key={menuSlug} />} />

        {/* Supabase Test Route */}
        <Route path="/test-supabase" element={<SupabaseTest />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Super Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients/new/:step?" element={<ClientForm />} />
          <Route path="clients/:clientId/:step?" element={<ClientForm />} />
          <Route path="restaurants" element={<ClientList />} />
          <Route path="dhabas" element={<ClientList />} />
          <Route path="cafes" element={<ClientList />} />
          <Route path="orders" element={<Orders />} />
          <Route path="payments" element={<Payments />} />
          <Route path="qr" element={<QrGenerator />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* App Dashboard Routes */}
        <Route path="/app" element={<ProtectedAppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AppDashboard />} />
          <Route path="menu" element={<AppMenu />} />
          <Route path="appearance" element={<AppAppearance />} />
          <Route path="qr" element={<AppQrCenter />} />
          <Route path="subscription" element={<AppSubscription />} />
          <Route path="settings" element={<AppSettings />} />
          <Route path="orders" element={<AppOrders />} />
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

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}



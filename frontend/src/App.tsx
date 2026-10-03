import { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import { HashRouter, Routes, Route, Navigate, useLocation, useMatch } from 'react-router-dom';
import PublicHomePage from './pages/public/PublicHomePage';
import MenuPage from './pages/customer/MenuPage';
import AdminLayout from './layouts/AdminLayout';
import AppLayout from './layouts/AppLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import ClientList from './pages/admin/ClientList';
import QrGenerator from './pages/admin/QrGenerator';
import Settings from './pages/admin/Settings';
import ClientForm from './pages/admin/ClientForm';
import { getAdminSession, getClientByMenuSlug } from './pages/admin/clientStore';
import { useAuth } from './contexts/AuthContext';
import AppDashboard from './pages/app/Dashboard';
import AppMenu from './pages/app/Menu';
import AppAppearance from './pages/app/Appearance';
import AppQrCenter from './pages/app/QrCenter';
import AppSubscription from './pages/app/Subscription';
import AppSettings from './pages/app/Settings';

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
    window.addEventListener('menuqr:admin-unauthorized', handleUnauthorized);
    return () => {
      isCurrent = false;
      window.removeEventListener('menuqr:admin-unauthorized', handleUnauthorized);
    };
  }, [retry]);

  if (sessionState === 'checking') return <div className="grid min-h-screen place-items-center bg-[#151c19] text-sm text-[#aab7b2]">Checking admin session…</div>;
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
    : 'MenuQR';
  const loaderCaption = menuMatch ? 'Preparing your menu' : 'Preparing your experience';
  const isLoading = loadedRoute !== routeKey;

  useEffect(() => {
    let isCurrent = true;
    if (menuSlug) {
      void getClientByMenuSlug(menuSlug).then((menu) => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: menu?.businessName ?? 'MenuQR' });
      }).catch(() => {
        if (isCurrent) setMenuName({ slug: menuSlug, name: 'MenuQR' });
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
        <Route path="/" element={<PublicHomePage />} />

        {/* Customer Menu Route */}
        <Route path="/menu/:slug" element={<MenuPage key={menuSlug} />} />

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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {isLoading && (
        <div className="app-loader" role="status" aria-live="polite" aria-label={`Loading ${loaderName}`}>
          <div className="app-loader-content">
            <div className="app-loader-mark" aria-hidden="true">
              <span className="app-loader-mark-core"><ChefHat size={30} strokeWidth={1.8} /></span>
            </div>
            <p className="app-loader-brand">{loaderName}</p>
            <p className="app-loader-caption">{loaderCaption}</p>
            <div className="app-loader-progress" aria-hidden="true"><span /></div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  if (
    /^\/menu\/[^/]+\/?$/.test(window.location.pathname) &&
    !window.location.hash.startsWith('#/')
  ) {
    window.history.replaceState(
      null,
      '',
      `/#${window.location.pathname}${window.location.search}${window.location.hash}`
    );
  }

  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

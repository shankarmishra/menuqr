import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubscription } from '../pages/app/appStore';
import { Menu, X, LayoutDashboard, UtensilsCrossed, Palette, QrCode, CreditCard, Settings, LogOut, ChefHat, User, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';

const baseNavItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/menu', icon: UtensilsCrossed, label: 'Menu Items' },
  { to: '/app/appearance', icon: Palette, label: 'Appearance' },
  { to: '/app/qr', icon: QrCode, label: 'QR Center' },
  { to: '/app/subscription', icon: CreditCard, label: 'Subscription' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planId, setPlanId] = useState<string>('BASIC');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getSubscription().then(sub => {
      setPlanId(sub?.planId?.toUpperCase() || 'BASIC');
    }).catch(console.error);
  }, []);

  const navItems = planId === 'PREMIUM'
    ? [
        baseNavItems[0],
        { to: '/app/orders', icon: ShoppingBag, label: 'Orders' },
        ...baseNavItems.slice(1)
      ]
    : baseNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = (
    <div className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            clsx(
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4',
              isActive
                ? 'bg-[#e8783c15] text-[#e8783c] border-[#e8783c]'
                : 'border-transparent text-[#9ca3af] hover:bg-[#25322d] hover:text-[#ffffff]'
            )
          }
        >
          <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#151c19] text-[#f3f4f6] font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between h-16 bg-[#1d2723] px-4 border-b border-[#2a3832]">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="text-[#9ca3af] hover:text-white p-2 -ml-2"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <ChefHat className="text-[#e8783c] h-6 w-6" />
          <span className="font-semibold text-white">MenusQR</span>
        </div>
        <button className="text-[#9ca3af] hover:text-white p-2 -mr-2">
          <User className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-[280px] max-w-sm flex-col bg-[#1d2723]">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#2a3832]">
              <div className="flex items-center gap-2">
                <ChefHat className="text-[#e8783c] h-6 w-6" />
                <span className="font-semibold text-white">MenusQR</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#9ca3af] hover:text-white p-2 -mr-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {navLinks}
            <div className="p-4 border-t border-[#2a3832]">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-[#9ca3af] hover:bg-[#25322d] hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[260px] bg-[#1d2723] border-r border-[#2a3832]">
        <div className="flex items-center h-16 px-6 border-b border-[#2a3832]">
          <ChefHat className="text-[#e8783c] h-7 w-7 mr-3" />
          <span className="font-bold text-xl text-white">MenusQR</span>
        </div>
        {navLinks}
        <div className="p-4 border-t border-[#2a3832]">
          <div className="flex items-center mb-4 px-3">
            <div className="bg-[#25322d] p-2 rounded-full mr-3">
              <User className="h-5 w-5 text-[#9ca3af]" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.role === 'SUPER_ADMIN' ? 'Admin' : 'Restaurant'}</p>
              <p className="text-xs text-[#849a90]">Tenant User</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 rounded-md text-sm font-medium text-[#9ca3af] hover:bg-[#25322d] hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

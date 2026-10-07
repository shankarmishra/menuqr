import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlan } from '../lib/usePlan';
import { Menu, LayoutDashboard, UtensilsCrossed, Palette, QrCode, CreditCard, Settings, LogOut, User, Bell, ChevronRight, Store, ChefHat, ShoppingBag } from 'lucide-react';
import { getProfile } from '../pages/app/appStore';
import clsx from 'clsx';

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Loading...');
  const { logout } = useAuth();
  const { sub, can } = usePlan();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getProfile().then(p => setRestaurantName(p.businessName || 'Your Restaurant')).catch(() => setRestaurantName('Restaurant Dashboard'));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const planId = sub?.planId?.toUpperCase() || 'BASIC';
  const isActive = sub?.status === 'ACTIVE';

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { to: '/app/dashboard', icon: LayoutDashboard, label: 'Overview' },
        { to: '/app/menu', icon: UtensilsCrossed, label: 'Menu' },
        { to: '/app/appearance', icon: Palette, label: 'Appearance' },
        { to: '/app/qr', icon: QrCode, label: 'QR Code' },
      ]
    },
    ...(can('reception_orders') ? [{
      title: 'PREMIUM',
      items: [
        { to: '/app/orders', icon: ShoppingBag, label: 'Orders & Reception' }
      ]
    }] : []),
    {
      title: 'BUSINESS',
      items: [
        { to: '/app/subscription', icon: CreditCard, label: 'Subscription' },
        { to: '/app/settings', icon: Settings, label: 'Settings' },
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      <div className="flex items-center h-16 px-6 border-b border-white/5">
        <ChefHat className="text-[#e8783c] h-6 w-6 mr-3" />
        <span className="font-bold text-lg tracking-wide text-white">Menus<span className="text-[#e8783c]">QR</span></span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 text-xs font-bold text-[#87958e] uppercase tracking-wider mb-3">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group',
                      isActive
                        ? 'bg-gradient-to-r from-[#e8783c]/10 to-transparent text-[#e8783c] shadow-[inset_2px_0_0_#e8783c]'
                        : 'text-[#aab7b2] hover:bg-white/5 hover:text-white'
                    )
                  }
                >
                  <item.icon className={clsx("mr-3 h-5 w-5 transition-colors", location.pathname === item.to ? "text-[#e8783c]" : "text-[#87958e] group-hover:text-white")} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-[#aab7b2] hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5 text-[#87958e] group-hover:text-rose-400 transition-colors" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a100d] text-[#fcfaf8] font-sans flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex w-[280px] flex-col bg-[#151c19] border-r border-white/5 animate-in slide-in-from-left">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-[260px] bg-[#151c19] border-r border-white/5 shrink-0 z-20">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Top Bar */}
        <header className="h-16 shrink-0 bg-[#0a100d]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-[#aab7b2] hover:text-white">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Store className="text-[#87958e] hidden sm:block" size={18} />
              <span className="font-bold text-white tracking-wide">{restaurantName}</span>
              <ChevronRight size={14} className="text-white/20 mx-1 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/5 text-[#aab7b2] border border-white/10">{planId}</span>
                {isActive ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">EXPIRED</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-[#aab7b2] hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e8783c] rounded-full border border-[#0a100d]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e8783c] to-[#FFC928] flex items-center justify-center text-white shadow-sm cursor-pointer ml-1">
              <User size={16} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#0a100d]">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

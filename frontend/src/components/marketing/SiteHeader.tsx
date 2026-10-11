import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Menu, X, ArrowUpRight, Sparkles, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MenusQRBrand } from '../brand/MenusQRBrand';

const DESKTOP_NAV_LINKS = [
  { label: 'Digital QR Menu', href: '/digital-qr-menu' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Templates', href: '/templates' },
  { label: 'Pricing Plans', href: '/plans' },
  { label: 'FAQ', href: '/faq' },
];

const MOBILE_NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Digital QR Menu', href: '/digital-qr-menu' },
  { label: 'Restaurant QR Menu', href: '/restaurant-qr-menu' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Templates', href: '/templates' },
  { label: 'Pricing Plans', href: '/plans' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Support', href: '/contact' },
];

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Handle escape key and lock body scroll on mobile menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle click on logo: always scroll to top (smooth if already on homepage, instant otherwise)
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: location.pathname === '/' ? 'smooth' : 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const navContainerVariants: any = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : -16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={navContainerVariants}
        className="fixed top-4 sm:top-5 left-4 sm:left-6 right-4 sm:right-6 z-50 mx-auto max-w-[1400px] h-[72px] bg-[#151C19]/95 backdrop-blur-xl rounded-[20px] border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.65)] flex items-center justify-between px-5 sm:px-6 transition-colors duration-200"
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={handleLogoClick}
            aria-label="MenusQR Homepage"
            className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8783C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151C19] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MenusQRBrand size="sm" variant="light" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1.5 bg-[#1D2723]/90 border border-white/8 px-3 py-1.5 rounded-full h-[44px] shadow-inner"
        >
          {DESKTOP_NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8783C] flex items-center ${
                  isActive
                    ? 'bg-white/12 text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] ring-1 ring-white/15'
                    : 'text-white/70 hover:text-white hover:bg-white/6'
                }`}
              >
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#E8783C] inline-block mr-1.5 animate-pulse shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Client Portal CTA */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E8783C] to-[#F18C50] text-white text-xs font-extrabold uppercase tracking-wider shadow-[0_4px_16px_rgba(232,120,60,0.35)] hover:shadow-[0_6px_22px_rgba(232,120,60,0.5)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8783C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151C19]"
          >
            <span>Client Portal</span>
            <ArrowUpRight
              size={15}
              className="text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8783C] transition-colors"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="mobile-navigation-menu"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute top-[80px] left-0 right-0 bg-[#151C19]/98 border border-white/12 rounded-[22px] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:hidden flex flex-col gap-1.5 z-50 max-h-[calc(100vh-105px)] overflow-y-auto"
            >
              <div className="px-3 py-1 mb-1 text-[11px] font-bold uppercase tracking-widest text-white/40 flex items-center justify-between">
                <span>Navigation</span>
                <span className="flex items-center gap-1 text-[#E8783C]">
                  <Sparkles size={12} /> MenusQR
                </span>
              </div>

              {MOBILE_NAV_LINKS.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-150 min-h-[44px] ${
                      isActive
                        ? 'bg-[#E8783C]/15 text-[#E8783C] border-l-4 border-[#E8783C] font-extrabold shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/6'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight
                      size={16}
                      className={isActive ? 'text-[#E8783C]' : 'text-white/30'}
                    />
                  </Link>
                );
              })}

              <div className="h-px w-full bg-white/10 my-2" />

              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#E8783C] to-[#F18C50] text-white py-3.5 px-5 rounded-xl shadow-[0_4px_16px_rgba(232,120,60,0.35)] hover:shadow-[0_6px_22px_rgba(232,120,60,0.5)] transition-all active:scale-[0.98] min-h-[48px]"
              >
                <span>Client Portal</span>
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Backdrop overlay for closing mobile drawer on outside tap */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-testid="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}

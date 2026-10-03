import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChefHat, Sparkles, ArrowUpRight } from 'lucide-react';

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#151c19]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#151c19]/95 to-transparent py-5'
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-[#1d2723] border border-white/10 group-hover:border-[#e8783c]/50 transition-colors shadow-md">
            <ChefHat className="text-[#e8783c] group-hover:scale-110 transition-transform" size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-xl tracking-tight leading-none group-hover:text-[#ffc928] transition-colors">
              MENUQR
            </span>
            <span className="text-[9px] text-[#e8783c] font-mono tracking-widest uppercase mt-0.5">
              Digital Menu SaaS
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 bg-[#1d2723]/60 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-lg">
          <a
            href="#how-it-works"
            className="text-xs font-semibold text-[#aab7b2] hover:text-white transition-colors relative py-1"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="text-xs font-semibold text-[#aab7b2] hover:text-white transition-colors relative py-1"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-xs font-semibold text-[#aab7b2] hover:text-white transition-colors relative py-1"
          >
            FAQ
          </a>
        </nav>

        {/* CTA Login Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#/admin/login"
            className="relative inline-flex items-center gap-2 bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(232,120,60,0.3)] hover:scale-105 border border-white/20"
          >
            <span>Login</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="md:hidden p-2 rounded-xl bg-[#1d2723] text-white border border-white/10"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-[#151c19] border-t border-white/10 px-6 py-6 space-y-4 shadow-2xl overflow-hidden"
          >
            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="block text-sm font-semibold text-[#aab7b2] hover:text-white py-2 border-b border-white/5"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block text-sm font-semibold text-[#aab7b2] hover:text-white py-2 border-b border-white/5"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setIsOpen(false)}
              className="block text-sm font-semibold text-[#aab7b2] hover:text-white py-2 border-b border-white/5"
            >
              FAQ
            </a>
            <div className="pt-2">
              <a
                href="#/admin/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#e8783c] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center shadow-lg"
              >
                <span>Login</span>
                <Sparkles size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
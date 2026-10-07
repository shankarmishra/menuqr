import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { MenusQRBrand } from '../brand/MenusQRBrand';

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  // Entrance Animation Variants
  const navContainerVariants: any = {
    hidden: { opacity: 0, y: -16 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.05
      } 
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const logoVariants: any = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as any } }
  };

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={navContainerVariants}
      className="fixed top-5 left-6 right-6 z-50 mx-auto max-w-[1400px] h-[72px] bg-[#151C19] rounded-[18px] border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex items-center justify-between px-6"
    >
      {/* Brand Logo */}
      <motion.div variants={logoVariants} className="flex items-center gap-4">
        <a href="#" className="flex items-center">
          <MenusQRBrand size="sm" variant="light" />
        </a>
      </motion.div>

      {/* Desktop Navigation Links (Lighter internal surface) */}
      <motion.nav variants={itemVariants} className="hidden md:flex items-center gap-6 bg-[#1D2723] border border-white/5 px-6 py-2 rounded-full h-[40px]">
        <a href="#how-it-works" className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors">
          How It Works
        </a>
        <a href="#templates" className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors">
          Templates
        </a>
        <a href="#pricing" className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors">
          Pricing
        </a>
        <a href="#faq" className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white transition-colors">
          FAQ
        </a>
      </motion.nav>

      {/* CTA Login Button */}
      <motion.div variants={logoVariants} className="hidden md:flex items-center">
        <a
          href="/login"
          className="group flex items-center gap-2 text-white/90 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <span>Client Portal</span>
          <ArrowUpRight size={16} className="text-[#E8783C] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </motion.div>

      {/* Mobile Hamburger Toggle */}
      <button
        className="md:hidden p-2 text-white/80 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle navigation menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Animated Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-0 right-0 bg-[#151C19] border border-white/10 rounded-2xl p-4 shadow-2xl md:hidden flex flex-col gap-4"
          >
            <a href="#how-it-works" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white py-2 px-4">
              How It Works
            </a>
            <a href="#templates" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white py-2 px-4">
              Templates
            </a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white py-2 px-4">
              Pricing
            </a>
            <a href="#faq" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-white/70 hover:text-white py-2 px-4">
              FAQ
            </a>
            <div className="h-px w-full bg-white/10 my-1" />
            <a href="/login" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-wider text-[#E8783C] hover:text-[#d9672d] py-2 px-4 flex items-center gap-2">
              Client Portal <ArrowUpRight size={16} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}





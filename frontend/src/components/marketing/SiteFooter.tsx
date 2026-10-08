import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MenusQRBrand } from '../brand/MenusQRBrand';
import { ArrowRight } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Digital QR Menu", href: "/digital-qr-menu" },
      { label: "Restaurant QR Menu", href: "/restaurant-qr-menu" },
      { label: "QR Ordering System", href: "/qr-ordering-for-restaurants" },
      { label: "Menu Templates", href: "/templates" },
      { label: "Plans & Pricing", href: "/plans" },
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About MenusQR", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ Center", href: "/faq" },
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-cancellation" },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

export default function SiteFooter() {
  return (
    <footer className="relative bg-[#151C19] text-menusqr-white pt-32 pb-12 overflow-hidden selection:bg-menusqr-orange selection:text-white">
      {/* Background Geometry */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-30">
        <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="450" cy="150" r="300" stroke="var(--color-menusqr-emerald-dark)" strokeWidth="2" strokeDasharray="10 10"/>
          <circle cx="450" cy="150" r="200" stroke="var(--color-menusqr-orange)" strokeWidth="1" strokeDasharray="4 8" opacity="0.3"/>
          <rect x="250" y="-50" width="400" height="400" transform="rotate(45 250 -50)" stroke="var(--color-menusqr-emerald-dark)" strokeWidth="1"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 pointer-events-none opacity-20">
        <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 400L400 400L400 0C400 220.914 220.914 400 0 400Z" fill="url(#paint0_linear)"/>
          <defs>
            <linearGradient id="paint0_linear" x1="200" y1="0" x2="200" y2="400" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--color-menusqr-orange)"/>
              <stop offset="1" stopColor="var(--color-menusqr-emerald)" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative max-w-[1200px] mx-auto px-6 z-10">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Brand & CTA */}
          <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col items-start">
            <Link to="/">
              <MenusQRBrand size="xl" variant="light" className="mb-6" />
            </Link>
            <div className="mb-6 font-mono font-bold tracking-[0.2em] text-menusqr-orange text-xs uppercase bg-menusqr-orange/10 px-3 py-1.5 rounded-sm border border-menusqr-orange/20">
              Digital Menu Infrastructure
            </div>
            <p className="text-menusqr-neutral-muted text-lg max-w-md leading-relaxed mb-10">
              The premier digital menu platform for restaurants, cafés, and food businesses. Permanent table QR codes with instant live menu management.
            </p>
            <div className="flex gap-4">
              <Link to="/plans" className="bg-menusqr-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-[#d6672d] transition-colors flex items-center gap-2">
                Get Started <ArrowRight size={18} />
              </Link>
              <Link to="/how-it-works" className="px-6 py-3 rounded-full font-semibold border border-menusqr-emerald-dark hover:bg-menusqr-emerald-dark text-white transition-colors">
                How It Works
              </Link>
            </div>
          </motion.div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((column, idx) => (
              <motion.div key={idx} variants={itemVariants} className="flex flex-col">
                <h4 className="font-semibold text-menusqr-white mb-6 tracking-wide">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link 
                        to={link.href} 
                        className="text-menusqr-neutral-muted hover:text-menusqr-orange transition-colors text-sm font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-menusqr-emerald-dark text-menusqr-neutral-muted text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="mb-4 md:mb-0">
            &copy; {CURRENT_YEAR} MenusQR. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[#aab7b2]">Official Domain: <a href="https://menusqr.in" className="text-white hover:underline font-semibold">https://menusqr.in</a></span>
            <div className="flex items-center gap-2 ml-4 px-3 py-1.5 rounded-full bg-menusqr-emerald-dark/50 border border-menusqr-emerald-dark">
              <span className="w-2 h-2 rounded-full bg-menusqr-veg animate-pulse"></span>
              <span className="text-xs font-mono font-medium">All systems operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

import { motion } from 'framer-motion';
import { fadeUp, viewportConfig, smoothSpring } from './animations';
import PhysicalQRStand from './PhysicalQRStand';
import IPhoneMockup from './PremiumIPhoneMockup';
import MenuTemplateRenderer from '../menu-builder/MenuTemplateRenderer';
import { Link } from 'react-router-dom';

const mockCategories = [
  { id: 'c1', name: 'Mains', order: 1 },
  { id: 'c2', name: 'Drinks', order: 2 }
];

const mockItems = [
  { id: 'i1', name: 'Truffle Pasta', price: 24, category: 'c1', dietType: 'veg' as const, available: true, description: 'Handmade pasta, black truffle, parmesan' },
  { id: 'i2', name: 'Wagyu Burger', price: 28, category: 'c1', dietType: 'non-veg' as const, available: true, description: 'Caramelized onions, brioche bun' },
  { id: 'i3', name: 'Matcha Latte', price: 6, category: 'c2', dietType: 'veg' as const, available: true }
];

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#151C19] text-white py-24 sm:py-24 px-6">
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
        
        {/* Left: Content */}
        <motion.div 
          className="relative z-10 text-center lg:text-left"
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          <motion.h2 
            variants={fadeUp}
            className="text-[3rem] md:text-[4rem] font-bold text-white mb-8 leading-[1.1]"
          >
            Print it once.<br />
            Update it <span className="relative inline-block">
              anytime.
              {/* Orange Signature Line */}
              <motion.svg
                className="absolute -bottom-2 left-0 w-full overflow-visible text-menusqr-orange"
                viewBox="0 0 200 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M5 15Q50 5 100 10T195 5"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={viewportConfig}
                  transition={{ duration: 1, ease: 'easeInOut', delay: 0.3 }}
                />
              </motion.svg>
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} className="text-xl text-emerald-100/70 mb-10 max-w-lg mx-auto lg:mx-0">
            Join thousands of restaurants saving on printing costs and updating their menus in real-time.
          </motion.p>

          <motion.div variants={fadeUp}>
            <Link 
              to="/plans" 
              className="inline-block bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-10 py-5 rounded-lg font-semibold text-xl transition-colors shadow-lg shadow-orange-500/20"
            >
              Get Started Now
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Visual */}
        <div className="relative h-[500px] sm:h-[600px] flex items-center justify-center lg:justify-end z-10">
          
          {/* Phone (Behind) */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -10 }}
            whileInView={{ opacity: 1, y: 0, rotate: -5 }}
            viewport={viewportConfig}
            transition={{ ...smoothSpring, delay: 0.2 }}
            className="absolute left-1/2 lg:left-auto lg:right-[15%] -translate-x-1/2 lg:translate-x-0 z-0"
          >
            <IPhoneMockup className="scale-[0.85] sm:scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="h-full w-full overflow-hidden rounded-[38px] sm:rounded-[44px] bg-white">
                <MenuTemplateRenderer
                   templateId="template-02"
                   restaurant={{ name: 'The Garden', tagline: 'Fresh & Organic' }}
                   categories={mockCategories}
                   items={mockItems}
                   compact={true}
                />
              </div>
            </IPhoneMockup>
          </motion.div>

          {/* Physical QR (Front, Rising) */}
          <motion.div
            initial={{ opacity: 0, y: 150, rotate: 10 }}
            whileInView={{ opacity: 1, y: 40, rotate: 5 }}
            viewport={viewportConfig}
            transition={{ ...smoothSpring, delay: 0.4 }}
            className="absolute bottom-5 lg:bottom-16 right-0 sm:right-[10%] lg:-right-4 z-10"
          >
            <PhysicalQRStand 
              tableNumber="TABLE 12"
              className="scale-[0.75] sm:scale-90 lg:scale-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" 
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}

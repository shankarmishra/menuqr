import { motion } from 'framer-motion';
import { fadeUp, viewportConfig } from './animations';
import PhysicalQRStand from './PhysicalQRStand';
import IPhoneMockup from './PremiumIPhoneMockup';
import IndianHeritageMenuDisplay from './IndianHeritageMenuDisplay';
import { Link } from 'react-router-dom';

export default function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-[#151C19] text-white py-20 sm:py-24 px-6">
      {/* Background ambient light */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        
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
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#E8783C] text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A] animate-pulse" />
            <span>Permanent QR Infrastructure</span>
          </motion.div>

          <motion.h2 
            variants={fadeUp}
            className="text-[2.75rem] sm:text-[3.5rem] md:text-[4rem] font-bold text-white mb-6 leading-[1.1] tracking-tight"
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

          <motion.p variants={fadeUp} className="text-lg sm:text-xl text-emerald-100/70 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
            Join thousands of restaurants saving on printing costs and updating their menus in real-time.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link 
              to="/plans" 
              className="w-full sm:w-auto text-center bg-[#e8783c] hover:bg-[#ffc928] hover:text-[#151c19] text-white px-9 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started Now →
            </Link>
            <span className="text-xs text-white/50 font-mono">Zero hardware reprinting required</span>
          </motion.div>
        </motion.div>

        {/* Right: Visual Stage (Zero Clipping, Fluid Organic Floating Animation) */}
        <div className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[620px] lg:min-h-[640px] flex items-center justify-center lg:justify-end z-10 overflow-visible select-none py-6">
          {/* Subtle Ambient Floor Occlusion Shadow */}
          <div className="absolute bottom-4 sm:bottom-6 right-1/2 lg:right-[12%] translate-x-1/2 lg:translate-x-0 w-[300px] sm:w-[360px] h-12 bg-black/60 rounded-full blur-2xl pointer-events-none" />

          {/* Unified Device & Hardware Stage */}
          <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px] flex items-center justify-center lg:justify-end">
            
            {/* Phone Mockup (Behind / Left-leaning with Fluid Entrance & Gentle Idle Float) */}
            <motion.div
              initial={{ opacity: 0, y: 70, rotate: -6 }}
              whileInView={{ opacity: 1, y: 0, rotate: -2.5 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="relative z-10 origin-bottom mr-3 sm:mr-8 lg:mr-12"
            >
              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotate: [-2.5, -1.8, -2.5],
                }}
                transition={{
                  duration: 6.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <IPhoneMockup
                  className="w-[210px] sm:w-[245px] md:w-[265px] lg:w-[275px] shadow-[0_28px_70px_rgba(0,0,0,0.7)]"
                  screenClassName="overflow-hidden flex flex-col bg-[#200817]"
                  statusBarTheme="light"
                  statusBarBg="bg-[#280B1E]"
                  badgeText="Live Cloud Menu"
                >
                  <IndianHeritageMenuDisplay
                    restaurantName="The Grand Royal Darbar"
                    tagline="Royal Awadhi & Mughlai Cuisine"
                    tableInfo="TABLE 12 • Royal Balcony Dining"
                    badgeText="24K Palace Dining"
                    highlightItemPrice={480}
                  />
                </IPhoneMockup>
              </motion.div>
            </motion.div>

            {/* Physical QR Stand (Front / Right Foreground with Tactile Spring Entrance & Complementary Float) */}
            <motion.div
              initial={{ opacity: 0, y: 90, scale: 0.9, rotate: 6 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 2.5 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
              className="absolute bottom-1 sm:bottom-3 -right-2 sm:right-1 lg:right-0 z-20 origin-bottom pointer-events-none"
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotate: [2.5, 3.2, 2.5],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
              >
                <PhysicalQRStand 
                  tableNumber="TABLE 12"
                  className="scale-[0.68] sm:scale-[0.78] md:scale-[0.84] lg:scale-[0.90] drop-shadow-[0_24px_45px_rgba(0,0,0,0.75)]" 
                />
              </motion.div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
}

import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { QrCode, Smartphone, Layers, Palette, LayoutGrid, Store } from 'lucide-react';

const STEPS = [
  { 
    id: '01', 
    title: 'Create', 
    subtitle: 'Account Setup',
    desc: 'Register your restaurant identity. No app downloads required. Just a clean, browser-based command center for your brand.',
    Icon: Store,
  },
  { 
    id: '02', 
    title: 'Build', 
    subtitle: 'Digital Menu',
    desc: 'Structure your offerings with categories, dietary tags, and high-resolution imagery using our seamless builder.',
    Icon: LayoutGrid,
  },
  { 
    id: '03', 
    title: 'Design', 
    subtitle: 'Brand Alignment',
    desc: 'Select from professionally crafted templates. Adjust colors and typography to perfectly match your physical restaurant aesthetic.',
    Icon: Palette,
  },
  { 
    id: '04', 
    title: 'QR', 
    subtitle: 'Generate Code',
    desc: 'Your unique, permanent QR code is generated instantly. Export it in ultra-high resolution for professional printing.',
    Icon: QrCode,
  },
  { 
    id: '05', 
    title: 'Place', 
    subtitle: 'Physical Deployment',
    desc: 'Display your customized QR placards across tables, reception desks, and outdoor seating areas.',
    Icon: Layers,
  },
  { 
    id: '06', 
    title: 'Scan', 
    subtitle: 'Live Dining',
    desc: 'Diners scan and browse instantly. You update prices or remove sold-out items in real-time, without ever reprinting.',
    Icon: Smartphone,
  },
];

const ScrollLine = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { scrollYProgress } = useScroll({
    target: svgRef as any,
    offset: ["start center", "end center"]
  });

  const pathLength = useSpring(scrollYProgress, { stiffness: 400, damping: 90 });

  return (
    <div className="absolute left-[24px] md:left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 h-full z-0 pointer-events-none">
      <svg 
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 8 1000" 
        preserveAspectRatio="none"
      >
        <path 
          d="M 4 0 L 4 1000" 
          stroke="currentColor"
          className="text-menusqr-emerald/10"
          strokeWidth="1" 
          fill="none" 
          vectorEffect="non-scaling-stroke"
        />
        <motion.path 
          d="M 4 0 L 4 1000" 
          stroke="currentColor" 
          className="text-menusqr-orange"
          strokeWidth="2" 
          fill="none" 
          vectorEffect="non-scaling-stroke"
          style={{ pathLength }}
        />
      </svg>
    </div>
  );
};

export default function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={containerRef}
      className="py-24 md:py-36 px-6 bg-menusqr-primary relative overflow-hidden" 
      id="how-it-works"
    >
      <div className="absolute inset-0 texture-paper-grain opacity-20 pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto relative z-10">
        <div className="text-center mb-24 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="inline-block border border-menusqr-emerald/10 px-4 py-1.5 rounded-full text-menusqr-emerald text-xs font-semibold tracking-widest uppercase mb-6"
          >
            How It Works
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-menusqr-emerald tracking-tight max-w-4xl mx-auto leading-tight"
          >
            One QR code.<br/>
            <span className="text-menusqr-neutral-muted font-light italic">Endless possibilities.</span>
          </motion.h2>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-5xl mx-auto pl-12 md:pl-0">
          <ScrollLine />

          <div className="flex flex-col gap-24 md:gap-40 relative z-10">
            {STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={step.id} className="relative flex flex-col md:flex-row items-center w-full group">
                  
                  {/* Central Node */}
                  <div className="absolute left-[-24px] md:left-1/2 top-8 md:top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-menusqr-primary border-2 border-menusqr-emerald z-20 flex items-center justify-center transition-colors duration-500 group-hover:border-menusqr-orange">
                    <motion.div 
                      className="w-1.5 h-1.5 rounded-full bg-menusqr-orange opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Text Side */}
                  <div className={`w-full md:w-1/2 flex ${isEven ? 'md:justify-end md:pr-16 md:text-right' : 'md:justify-start md:pl-16 md:order-2'}`}>
                    <motion.div 
                      initial={{ opacity: 0, x: isEven ? -40 : 40, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-150px" }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="relative max-w-md w-full"
                    >
                      {/* Step Number Watermark */}
                      <div className={`text-[6rem] md:text-[8rem] lg:text-[10rem] font-black text-menusqr-emerald/[0.03] leading-none absolute -top-8 md:-top-16 z-0 select-none pointer-events-none font-serif italic ${isEven ? 'left-0 md:left-auto md:-right-12' : 'left-0 md:-left-12'}`}>
                        {step.id}
                      </div>
                      
                      <div className="relative z-10">
                        <h4 className={`text-menusqr-orange font-mono text-xs md:text-sm tracking-widest uppercase mb-3 flex items-center gap-3 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <span className={isEven ? 'md:order-2' : ''}>Step {step.id}</span>
                          <span className={`w-8 h-[1px] bg-menusqr-orange/30 ${isEven ? 'md:order-1' : ''}`}></span>
                          <span className={isEven ? 'md:order-0 text-menusqr-emerald/70' : 'text-menusqr-emerald/70'}>{step.subtitle}</span>
                        </h4>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-menusqr-emerald mb-4 tracking-tight">
                          {step.title}
                        </h3>
                        <p className="text-menusqr-neutral-sec text-base md:text-lg leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Visual Side */}
                  <div className={`w-full md:w-1/2 mt-12 md:mt-0 flex ${isEven ? 'md:justify-start md:pl-16' : 'md:justify-end md:pr-16 md:order-1'}`}>
                     <motion.div 
                        initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.95 }}
                        whileInView={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                        viewport={{ once: true, margin: "-150px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-sm aspect-[4/5] relative flex flex-col justify-between p-8 border border-menusqr-emerald/10 bg-menusqr-white shadow-[0_20px_40px_-15px_rgba(21,28,25,0.05)] mx-auto md:mx-0 transition-transform duration-500 group-hover:-translate-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-menusqr-emerald/30 font-mono text-sm tracking-widest">
                            {step.id} / 06
                          </span>
                          <step.Icon className="text-menusqr-orange w-6 h-6" strokeWidth={1.5} />
                        </div>

                        <div className="flex-1 flex items-center justify-center overflow-hidden">
                           <div className="text-[12rem] font-serif italic text-menusqr-emerald/5 select-none transition-transform duration-700 group-hover:scale-110">
                             {step.title[0]}
                           </div>
                        </div>

                        <div className="text-right border-t border-menusqr-emerald/5 pt-4 mt-4">
                          <span className="text-menusqr-emerald font-semibold text-lg tracking-tight">
                            {step.title}
                          </span>
                        </div>
                      </motion.div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}



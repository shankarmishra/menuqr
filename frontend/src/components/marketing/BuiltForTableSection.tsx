import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, UtensilsCrossed, Coffee, ConciergeBell, ShoppingBag, Sun } from 'lucide-react';

const ENVIRONMENTS = [
  {
    id: 'dining',
    title: 'Fine Dining',
    category: 'Full-Service',
    description: 'Acrylic stand seamlessly integrating into premium table settings without disrupting the ambiance.',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=800&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
    width: 'w-full md:w-[45%]',
    textWidth: 'w-full md:w-[45%]',
    flexDir: 'md:flex-row',
    marginTop: 'mt-0',
    centerText: false
  },
  {
    id: 'cafe',
    title: 'Cafe Counter',
    category: 'Quick Service',
    description: 'Scannable glass decals right at the espresso machine to speed up the morning queue.',
    icon: <Coffee className="w-5 h-5" />,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop',
    aspect: 'aspect-square',
    width: 'w-full md:w-[40%]',
    textWidth: 'w-full md:w-[45%]',
    flexDir: 'md:flex-row-reverse',
    marginTop: 'mt-16 md:mt-32',
    centerText: false
  },
  {
    id: 'reception',
    title: 'Hotel Reception',
    category: 'Hospitality',
    description: 'In-room or lobby QR placements for instant 24/7 room service ordering.',
    icon: <ConciergeBell className="w-5 h-5" />,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
    aspect: 'aspect-[4/3]',
    width: 'w-full md:w-[55%]',
    textWidth: 'w-full md:w-[35%]',
    flexDir: 'md:flex-row',
    marginTop: 'mt-16 md:-mt-16',
    centerText: false
  },
  {
    id: 'takeaway',
    title: 'Takeaway Post',
    category: 'Delivery Hubs',
    description: 'Stickers on delivery bags or pickup counters for quick re-ordering from home.',
    icon: <ShoppingBag className="w-5 h-5" />,
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=800&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
    width: 'w-full md:w-[40%]',
    textWidth: 'w-full md:w-[45%]',
    flexDir: 'md:flex-row-reverse',
    marginTop: 'mt-16 md:-mt-24',
    centerText: false
  },
  {
    id: 'outdoor',
    title: 'Outdoor Patio',
    category: 'Al Fresco',
    description: 'Weather-resistant metallic plaques enduring rain, shine, and spills.',
    icon: <Sun className="w-5 h-5" />,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    aspect: 'aspect-[16/9] md:aspect-[21/9]',
    width: 'w-full',
    textWidth: 'w-full md:w-[60%] mx-auto',
    flexDir: 'flex-col',
    marginTop: 'mt-16 md:mt-24',
    centerText: true
  }
];

const EnvironmentBlock = ({ env }: { env: typeof ENVIRONMENTS[0] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div className={`${env.marginTop} flex flex-col ${env.flexDir} ${env.centerText ? 'items-center text-center' : 'items-center justify-between'} w-full gap-8 md:gap-16`}>
      <div 
        ref={containerRef}
        className={`${env.width} ${env.aspect} relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-menusqr-secondary flex-shrink-0`}
      >
        <motion.img
          src={env.image}
          alt={env.title}
          className="absolute inset-0 w-full h-[130%] object-cover will-change-transform"
          style={{ y, top: "-15%" }}
        />
        
        {/* Subtle QR Overlay */}
        <div className={`absolute ${env.centerText ? 'bottom-6 left-1/2 -translate-x-1/2' : 'bottom-6 right-6'} bg-menusqr-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-menusqr-white/20 flex flex-col items-center`}>
           <div className="w-12 h-12 border-2 border-menusqr-emerald rounded-lg flex items-center justify-center p-1 bg-menusqr-white">
             <div className="w-full h-full bg-menusqr-emerald grid grid-cols-2 gap-[2px] p-[2px]">
               <div className="bg-menusqr-white rounded-[2px]"></div>
               <div className="bg-menusqr-white rounded-[2px]"></div>
               <div className="bg-menusqr-white rounded-[2px]"></div>
               <div className="bg-menusqr-emerald"></div>
             </div>
           </div>
           <span className="text-[9px] font-bold mt-1.5 text-menusqr-emerald uppercase tracking-widest">Scan</span>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: [0.2, 0.75, 0.25, 1] }}
        className={`${env.textWidth} flex flex-col justify-center gap-4 md:gap-6 ${env.centerText ? 'items-center' : 'items-start'}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-menusqr-orange/10 text-menusqr-orange">
            {env.icon}
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-menusqr-orange">
            {env.category}
          </span>
        </div>
        <h3 className="text-3xl md:text-5xl font-extrabold text-menusqr-emerald tracking-tight">
          {env.title}
        </h3>
        <p className="text-lg md:text-xl text-menusqr-neutral-sec leading-relaxed">
          {env.description}
        </p>
      </motion.div>
    </div>
  );
};

export default function BuiltForTableSection() {
  return (
    <section className="py-24 md:py-24 px-6 bg-[#FAFAF7] relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center mb-16 md:mb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-menusqr-orange/10 text-menusqr-orange text-xs font-semibold uppercase tracking-wider mb-6"
        >
          <MapPin size={14} />
          <span>Physical Placement</span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-menusqr-emerald tracking-tight"
        >
          Built for the Physical Table
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-menusqr-neutral-sec max-w-2xl mx-auto mt-6"
        >
          MENUSQR placards are engineered for physical hospitality environments—durable, water-resistant, and high-visibility.
        </motion.p>
      </div>

      <div className="max-w-[1240px] mx-auto flex flex-col gap-8 md:gap-0">
         {ENVIRONMENTS.map((env) => (
           <EnvironmentBlock key={env.id} env={env} />
         ))}
      </div>
    </section>
  );
}

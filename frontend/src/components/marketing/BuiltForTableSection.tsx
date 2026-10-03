import { useState } from 'react';
import { MapPin, Coffee, UtensilsCrossed, Wine, ConciergeBell } from 'lucide-react';

interface EnvironmentSpot {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
  bgGradient: string;
}

const ENVIRONMENTS: EnvironmentSpot[] = [
  {
    id: 'dining-table',
    title: 'Dining Room Table',
    category: 'Full-Service Restaurants',
    description: 'Acrylic or wooden QR stand mounted directly at every table setting for instant scanning.',
    icon: <UtensilsCrossed size={24} className="text-[#e8783c]" />,
    tag: 'Highest Volume',
    bgGradient: 'from-[#1d2723] via-[#151c19] to-[#0d1210]',
  },
  {
    id: 'coffee-counter',
    title: 'Espresso Bar Counter',
    category: 'Cafes & Bakeries',
    description: 'Sticker placard on counter glass for quick takeaway orders and beverage browsing.',
    icon: <Coffee size={24} className="text-[#ffc928]" />,
    tag: 'Quick Scan',
    bgGradient: 'from-[#241e1b] via-[#151c19] to-[#0d1210]',
  },
  {
    id: 'lounge-bar',
    title: 'Cocktail Bar & Lounge',
    category: 'Bars & Pubs',
    description: 'Illuminated table tent with QR code designed for low-light ambiance.',
    icon: <Wine size={24} className="text-[#38bdf8]" />,
    tag: 'Nightlife Ready',
    bgGradient: 'from-[#0f172a] via-[#151c19] to-[#0d1210]',
  },
  {
    id: 'hotel-reception',
    title: 'Hotel & Room Service',
    category: 'Hospitality',
    description: 'In-room QR card allowing guests to order food directly from their bed or desk.',
    icon: <ConciergeBell size={24} className="text-[#34b56a]" />,
    tag: 'In-Room Dining',
    bgGradient: 'from-[#151c19] via-[#1d2723] to-[#0d1210]',
  },
];

export default function BuiltForTableSection() {
  const [activeSpot, setActiveSpot] = useState<string>('dining-table');

  return (
    <section className="py-24 md:py-36 px-6 bg-[#151c19] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d2723] text-[#ffc928] text-xs font-semibold uppercase tracking-wider border border-[#ffc928]/30 mb-4">
          <MapPin size={14} />
          <span>Physical Restaurant Placement</span>
        </div>
        <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-white tracking-tight">
          Built for the Physical Table
        </h2>
        <p className="text-base sm:text-lg text-[#aab7b2] max-w-2xl mx-auto mt-3">
          MENUQR placards are engineered for physical hospitality environments—durable, water-resistant, and high-visibility.
        </p>
      </div>

      <div className="max-w-[1240px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ENVIRONMENTS.map((spot) => {
          const isActive = activeSpot === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => setActiveSpot(spot.id)}
              className={`group relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden aspect-[4/5] bg-gradient-to-b ${
                spot.bgGradient
              } ${
                isActive
                  ? 'border-[#ffc928] shadow-2xl shadow-[#ffc928]/10 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

              <div className="relative z-10 flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-[#151c19]/80 border border-white/10 shadow-lg">
                  {spot.icon}
                </div>
                <span className="text-[10px] font-bold text-[#ffc928] bg-[#ffc928]/10 border border-[#ffc928]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {spot.tag}
                </span>
              </div>

              <div className="relative z-10 my-auto text-center py-4">
                <div className="relative inline-block p-4 rounded-2xl bg-[#151c19]/90 border border-white/15 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  <div className="w-14 h-14 bg-white rounded-xl p-1 flex items-center justify-center mx-auto shadow-inner">
                    <div className="w-full h-full border-2 border-black rounded flex items-center justify-center text-[10px] font-black text-black">
                      QR
                    </div>
                  </div>
                  <span className="text-[9px] text-[#aab7b2] mt-2 block font-mono">
                    Scan for Menu
                  </span>
                </div>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] text-[#aab7b2] uppercase font-mono tracking-wider">
                  {spot.category}
                </span>
                <h3 className="text-lg font-bold text-white group-hover:text-[#ffc928] transition-colors">
                  {spot.title}
                </h3>
                <p className="text-xs text-[#aab7b2] line-clamp-2 leading-relaxed">
                  {spot.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
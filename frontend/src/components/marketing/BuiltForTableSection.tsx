import { useState } from 'react';
import { MapPin, Coffee, UtensilsCrossed, Wine, ConciergeBell } from 'lucide-react';

interface EnvironmentSpot {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
}

const ENVIRONMENTS: EnvironmentSpot[] = [
  {
    id: 'dining-table',
    title: 'Dining Room Table',
    category: 'Full-Service Restaurants',
    description: 'Acrylic or wooden QR stand mounted directly at every table setting for instant scanning.',
    icon: <UtensilsCrossed size={24} className="text-[#e8783c]" />,
    tag: 'Highest Volume',
  },
  {
    id: 'coffee-counter',
    title: 'Espresso Bar Counter',
    category: 'Cafes & Bakeries',
    description: 'Sticker placard on counter glass for quick takeaway orders and beverage browsing.',
    icon: <Coffee size={24} className="text-[#e8783c]" />,
    tag: 'Quick Scan',
  },
  {
    id: 'lounge-bar',
    title: 'Cocktail Bar & Lounge',
    category: 'Bars & Pubs',
    description: 'Illuminated table tent with QR code designed for low-light ambiance.',
    icon: <Wine size={24} className="text-[#e8783c]" />,
    tag: 'Nightlife Ready',
  },
  {
    id: 'hotel-reception',
    title: 'Hotel & Room Service',
    category: 'Hospitality',
    description: 'In-room QR card allowing guests to order food directly from their bed or desk.',
    icon: <ConciergeBell size={24} className="text-[#e8783c]" />,
    tag: 'In-Room Dining',
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

      {/* High-Contrast Bento Grid Cards */}
      <div className="max-w-[1240px] mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ENVIRONMENTS.map((spot) => {
          const isActive = activeSpot === spot.id;
          return (
            <div
              key={spot.id}
              onClick={() => setActiveSpot(spot.id)}
              className={`group relative rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden aspect-[4/5] ${
                isActive
                  ? 'bg-white text-[#151c19] border-white shadow-2xl shadow-white/10 scale-[1.03]'
                  : 'bg-[#1d2723] text-white border-white/10 hover:border-white/30'
              }`}
            >
              {/* Top Tag & Icon */}
              <div className="relative z-10 flex justify-between items-start">
                <div
                  className={`p-3 rounded-2xl border shadow-md transition-colors ${
                    isActive ? 'bg-[#151c19] text-white border-[#151c19]' : 'bg-[#151c19]/80 text-white border-white/10'
                  }`}
                >
                  {spot.icon}
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                    isActive
                      ? 'bg-[#e8783c] text-white border-[#e8783c]'
                      : 'bg-[#ffc928]/10 text-[#ffc928] border-[#ffc928]/20'
                  }`}
                >
                  {spot.tag}
                </span>
              </div>

              {/* Physical Hotspot Graphic Simulation */}
              <div className="relative z-10 my-auto text-center py-4">
                <div
                  className={`relative inline-block p-4 rounded-2xl border shadow-xl group-hover:scale-105 transition-transform duration-300 ${
                    isActive ? 'bg-[#151c19] border-[#151c19] text-white' : 'bg-[#151c19]/90 border-white/15 text-white'
                  }`}
                >
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

              {/* Bottom Details */}
              <div className="relative z-10 space-y-1">
                <span
                  className={`text-[10px] uppercase font-mono tracking-wider ${
                    isActive ? 'text-[#e8783c]' : 'text-[#aab7b2]'
                  }`}
                >
                  {spot.category}
                </span>
                <h3
                  className={`text-lg font-bold transition-colors ${
                    isActive ? 'text-[#151c19]' : 'text-white group-hover:text-[#ffc928]'
                  }`}
                >
                  {spot.title}
                </h3>
                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isActive ? 'text-[#334155]' : 'text-[#aab7b2]'
                  }`}
                >
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
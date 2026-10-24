import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XCircle, 
  Sparkles, 
  QrCode, 
  ArrowRight, 
  Check, 
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

type StoryMode = 'before' | 'after';

interface StoryMoment {
  id: string;
  momentNumber: string;
  momentTitle: string;
  timeTag: string;
  before: {
    badge: string;
    image: string;
    title: string;
    description: string;
    painPoints: string[];
    quote: string;
    quoteAuthor: string;
  };
  after: {
    badge: string;
    image: string;
    title: string;
    description: string;
    features: string[];
    quote: string;
    quoteAuthor: string;
    metric: string;
  };
}

const STORY_MOMENTS: StoryMoment[] = [
  {
    id: 'moment-1',
    momentNumber: '01',
    momentTitle: 'Arrival & Ordering',
    timeTag: 'Minute 0–10',
    before: {
      badge: 'Old Paper Chaos',
      image: '/marketing/reference-menu.png',
      title: '10-Minute Hand-Waving & Sticky Menus',
      description: 'Diners sit awkwardly trying to catch busy waiters’ eyes. They are handed grease-stained, ripped paper menus with pen scribbles and crossed-out prices.',
      painPoints: [
        'Frantic hand-waving for 8–12 minutes',
        'Greasy paper menus with crossed-out prices',
        'Out-of-stock surprises after ordering'
      ],
      quote: '“Bhaiya menu please! 10 minute ho gaye baithe huye...”',
      quoteAuthor: 'Waiting Diner at Table 4'
    },
    after: {
      badge: '1-Second Royal Scan',
      image: '/marketing/carousel/zero_app_scan.jpg',
      title: 'Instant Camera Scan ➔ 60 FPS Visual Menu',
      description: 'Guests scan an elegant acrylic or walnut table stand. In 300ms, a fluid 60 FPS digital menu opens on their phone with high-def photos, dietary tags, and spice levels.',
      features: [
        'Instant scan with phone camera (Zero app download)',
        'Vibrant food photography, calories & spice badges',
        '100% live pricing & instant out-of-stock sync'
      ],
      quote: '“Camera open kiya aur 1 second me pura photo menu khul gaya!”',
      quoteAuthor: 'Delighted Diner at Table 4',
      metric: '0 sec wait time'
    }
  },
  {
    id: 'moment-2',
    momentNumber: '02',
    momentTitle: 'The Cooking Wait',
    timeTag: 'Minute 15–30',
    before: {
      badge: 'Kitchen Black Hole',
      image: '/marketing/carousel/whatsapp_kot.jpg',
      title: 'The 25-Minute Silence & Lost Paper Chits',
      description: 'Servers scribble shorthand on rough chits that get lost in noisy kitchens. Diners sit in silence wondering: “Did the kitchen even start our food?”',
      painPoints: [
        'Handwritten slips blown away by exhaust fans',
        '25 minutes of anxiety and hunger silence',
        'Waiters constantly pestered: “Khana kab aayega?”'
      ],
      quote: '“Bhaiya 25 minute ho gaye, chef ne khana banana start bhi kiya?”',
      quoteAuthor: 'Anxious Diner checking watch'
    },
    after: {
      badge: 'Live Countdown Timer',
      image: '/marketing/carousel/chef_kitchen.jpg',
      title: 'Real-Time Cooking Timer: “Food in 14:28”',
      description: 'Orders chime on the kitchen display tablet + 1-click thermal KOT print. The guest’s phone displays a live ticking countdown clock with flame cooking status.',
      features: [
        'Live ticking countdown timer (MM:SS) on phone',
        'Clear stages: Confirmed ➔ In Tandoor 🔥 ➔ Plated',
        'Zero duplicate cooking or kitchen shouting'
      ],
      quote: '“Phone pe live timer chal raha hai: Food in 14:28 mins. So transparent!”',
      quoteAuthor: 'Relaxed Diner watching live status',
      metric: '100% status clarity'
    }
  },
  {
    id: 'moment-3',
    momentNumber: '03',
    momentTitle: 'Round 2 & Settlement',
    timeTag: 'Minute 35–55',
    before: {
      badge: 'Cold Food & Bill Disputes',
      image: '/marketing/carousel/split_bill.jpg',
      title: 'Cold Curry, Missing Waiter & Billing Errors',
      description: 'Curry is on the table, but guests need 2 more naans. Waiter is busy across the room. Later, handwritten bill includes another table’s drinks by mistake.',
      painPoints: [
        'Curry gets cold while waiting 15m for extra rotis',
        'Wrong items charged from adjacent tables',
        '10-minute queue just to get a card swipe machine'
      ],
      quote: '“Yeh drink humne nahi li thi! Table 3 ka bill hamare me laga diya?”',
      quoteAuthor: 'Disputing Diner at Billing Counter'
    },
    after: {
      badge: '1-Tap Add-On & 5-Star Reviews',
      image: '/marketing/carousel/split_bill.jpg',
      title: 'Hot Naan in 3 Mins & Instant 5-Star Review',
      description: 'Guests tap their active Table Session for instant hot naan add-ons. They pay transparently via UPI in 5 seconds and leave a verified 5-star Google review.',
      features: [
        '1-Tap Round 2 add-ons delivered hot in 3 minutes',
        '100% error-free transparent running table bill',
        'Automated 1-tap 5-star Google Maps review hook'
      ],
      quote: '“1-tap kiya aur garam naan turant aa gaya! 5-star rating de diya Google pe.”',
      quoteAuthor: 'Smiling Diner leaving restaurant',
      metric: '+40% 5-star reviews'
    }
  }
];

export default function DiningStorytellingSection() {
  const [mode, setMode] = useState<StoryMode>('after');

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#FAFAF7] text-gray-900 relative overflow-hidden border-t border-b border-stone-200">
      {/* Background Subtle Atmosphere matching site design */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/40 via-[#FAFAF7] to-stone-100/60 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e8783c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-stone-200 text-[#e8783c] text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles size={14} className="text-[#e8783c]" />
            <span>The Dining Reality • Before vs After MenusQR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 font-serif leading-[1.15]">
            A Tale of Two Dining Experiences: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#e8783c] via-amber-600 to-[#e8783c] bg-clip-text text-transparent italic font-serif">
              Old Paper Chaos vs The MenusQR Royal Flow
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            See exactly what happens to your guests, your staff, and your revenue across the 3 critical moments of every restaurant visit.
          </p>

          {/* Interactive Mode Toggle: Clear & Simple */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white border border-stone-200 shadow-md">
            <button
              type="button"
              onClick={() => setMode('before')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                mode === 'before'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
              }`}
            >
              <XCircle size={16} />
              <span>The Old Way (Paper Menus & Chaos)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('after')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                mode === 'after'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
              }`}
            >
              <Sparkles size={16} />
              <span>With MenusQR (Modern Royal Dining)</span>
            </button>
          </div>
        </div>

        {/* 3 Story Cards: Clean, High-Impact, Crystal Clear Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STORY_MOMENTS.map((moment) => {
            const data = mode === 'before' ? moment.before : moment.after;
            const isBefore = mode === 'before';

            return (
              <motion.div
                key={`${moment.id}-${mode}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between border shadow-lg transition-all ${
                  isBefore
                    ? 'bg-white border-rose-200/80 hover:border-rose-300 ring-1 ring-rose-500/10'
                    : 'bg-white border-emerald-300 hover:border-emerald-400 ring-2 ring-emerald-500/15'
                }`}
              >
                <div>
                  {/* Card Header: Moment Number & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                      Moment {moment.momentNumber} • {moment.timeTag}
                    </span>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isBefore
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {data.badge}
                    </span>
                  </div>

                  {/* Real Image Mockup / Photo Container */}
                  <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden mb-5 bg-stone-100 border border-stone-200 relative group">
                    <img
                      src={data.image}
                      alt={data.title}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isBefore ? 'grayscale-[20%] contrast-95' : 'contrast-105'
                      }`}
                      loading="lazy"
                    />

                    {/* Image Overlay Badge */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3.5">
                      <div className="flex items-center gap-1.5 text-white text-xs font-extrabold drop-shadow">
                        {isBefore ? (
                          <>
                            <AlertTriangle size={14} className="text-rose-400" />
                            <span>Frustrating Guest Experience</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} className="text-amber-400" />
                            <span>Smooth 60 FPS Digital Flow</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mb-2 font-serif">
                    {data.title}
                  </h3>

                  {/* Narrative Description */}
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {data.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="space-y-2 mb-5">
                    {isBefore ? (
                      moment.before.painPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2 text-xs text-rose-900 font-medium">
                          <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))
                    ) : (
                      moment.after.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs text-emerald-950 font-medium">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                          <span>{feature}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Bottom Speech Bubble & Metric */}
                <div className="pt-4 border-t border-stone-100">
                  <div className={`p-3 rounded-2xl text-xs italic leading-snug relative ${
                    isBefore 
                      ? 'bg-rose-50 text-rose-950 border border-rose-100' 
                      : 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                  }`}>
                    {data.quote}
                    <div className="mt-1.5 not-italic text-[10px] font-bold text-gray-500 flex items-center justify-between">
                      <span>— {data.quoteAuthor}</span>
                      {!isBefore && moment.after.metric && (
                        <span className="font-mono text-emerald-700 bg-emerald-200/60 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">
                          {moment.after.metric}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Bottom Industry Proof & Metrics Bar */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-[#e8783c]">
              The Measurable Impact of Royal Dining
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mt-1">
              What Happens When Restaurants Replace Paper with MenusQR
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-[#e8783c] font-mono">0 sec</div>
              <div className="text-xs font-bold text-gray-900 mt-1">Menu Wait Time</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Instant camera scan at table</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">+28%</div>
              <div className="text-xs font-bold text-gray-900 mt-1">Round 2 Re-Orders</div>
              <div className="text-[11px] text-gray-500 mt-0.5">1-click hot naans & desserts</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">35%</div>
              <div className="text-xs font-bold text-gray-900 mt-1">Faster Table Turns</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Seats 2 more table seatings/rush</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-sky-600 font-mono">+40%</div>
              <div className="text-xs font-bold text-gray-900 mt-1">5-Star Google Reviews</div>
              <div className="text-[11px] text-gray-500 mt-0.5">1-click checkout review prompt</div>
            </div>
          </div>

          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/purchase/details"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#e8783c] hover:bg-[#d66a30] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#e8783c]/30 hover:scale-[1.02] active:scale-95"
            >
              <span>Get MenusQR for Your Tables</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold text-sm transition-all border border-stone-200"
            >
              <QrCode size={16} className="text-[#e8783c]" />
              <span>Explore 15 Royal Menu Folios</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

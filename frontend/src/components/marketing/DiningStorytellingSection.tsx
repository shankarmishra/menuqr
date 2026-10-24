import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  ArrowRight,
  MessageSquare,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoryScene {
  id: number;
  actLabel: string;
  timeTag: string;
  stageName: string;
  isProblem: boolean;
  image: string;
  imageBadge: string;
  title: string;
  narrative: string;
  characterDialogue: {
    speaker: string;
    role: string;
    avatarBg: string;
    message: string;
  };
  highlightTag: string;
  metric: string;
}

const CINEMATIC_STORY_SCENES: StoryScene[] = [
  {
    id: 1,
    actLabel: 'ACT 01',
    timeTag: 'Minute 0–10 • Table Seating',
    stageName: 'The Arrival & Hand-Waving Friction',
    isProblem: true,
    image: '/marketing/reference-menu.png',
    imageBadge: '⚠️ OLD PAPER REALITY',
    title: 'Waving Hands for 10 Minutes to Get a Sticky, Torn Menu',
    narrative: 'A hungry family sits down at Table 4 on a packed Friday evening. They wave hands trying to catch busy waiters running past. After 10 minutes of waiting, a server drops a greasy, torn paper menu with scratched-out prices and crossed-out sold-out dishes.',
    characterDialogue: {
      speaker: 'Ramesh Sharma',
      role: 'Hungry Diner at Table 4',
      avatarBg: 'bg-rose-500',
      message: '“Bhaiya please menu to de do! 10 minute se hath hila rahe hain, bachho ko bahut bhookh lagi hai...”'
    },
    highlightTag: 'Pain: 8–12 min delay before first order is even taken',
    metric: '10m Wasted Wait'
  },
  {
    id: 2,
    actLabel: 'ACT 02',
    timeTag: 'Minute 15–30 • Kitchen Black Hole',
    stageName: 'Lost Paper Chits & Anxious Waiting',
    isProblem: true,
    image: '/marketing/carousel/whatsapp_kot.jpg',
    imageBadge: '⚠️ KITCHEN CHAOS',
    title: 'The 25-Minute Silence: Did the Chef Even Start Cooking?',
    narrative: 'The server hurriedly scribbles order shorthand on a rough paper chit. In the loud, steamy kitchen, the paper ticket gets lost or blown away by exhaust fans. Diners sit in cold silence wondering if their food was forgotten.',
    characterDialogue: {
      speaker: 'Pooja Sharma',
      role: 'Anxious Diner checking watch',
      avatarBg: 'bg-amber-600',
      message: '“Bhaiya 25 minute ho gaye, hamara order chef ne start bhi kiya hai ya bhool gaye?”'
    },
    highlightTag: 'Pain: Awkward silence, hunger stress & repeated waiter questioning',
    metric: '25m Black Hole'
  },
  {
    id: 3,
    actLabel: 'ACT 03',
    timeTag: 'The Turning Point • Minute 0–1',
    stageName: 'The 1-Second Camera Scan with MenusQR',
    isProblem: false,
    image: '/marketing/carousel/zero_app_scan.jpg',
    imageBadge: '✨ 300ms INSTANT SCAN',
    title: 'Point Camera at Table Stand ➔ 60 FPS Royal Menu Opens',
    narrative: 'Now see what happens with MenusQR: Diners sit down and spot an ultra-luxury acrylic/walnut table stand. They point their phone camera, scan in 1 second, and a fluid 60 FPS royal tasting menu opens with high-res food photography, calories, and spice levels.',
    characterDialogue: {
      speaker: 'Rohit Verma',
      role: 'Delighted Diner at Table 4',
      avatarBg: 'bg-emerald-600',
      message: '“Arre waah! Camera scan karte hi 1 second me saari dishes ki photo aur rates khul gaye, zero app download!”'
    },
    highlightTag: 'Solution: 0 second wait time • 100% royal luxury first impression',
    metric: '0 sec Wait Time'
  },
  {
    id: 4,
    actLabel: 'ACT 04',
    timeTag: 'Minute 2–18 • Live Kitchen Sync',
    stageName: 'Tension-Free Kitchen & Live Cooking Timer',
    isProblem: false,
    image: '/marketing/carousel/chef_kitchen.jpg',
    imageBadge: '🔥 LIVE TIMER: 14:28',
    title: 'Chef Gets Digital KOT • Diner Watches Live Cooking Timer',
    narrative: 'The order chimes clearly on the kitchen tablet + 1-click 80mm thermal KOT prints for the line cook. Chef Vikram sets 18m prep time. Customer’s phone screen displays a live ticking countdown timer (14:28) with dynamic progress bar and flame cooking status.',
    characterDialogue: {
      speaker: 'Chef Vikram & Guest',
      role: 'Kitchen Cook & Guest Phone',
      avatarBg: 'bg-sky-600',
      message: '“Phone pe live timer chal raha hai: ‘Cooking on Flame 🔥, 14:28 mins remaining’. Kitchen me koi chits nahi gumi!”'
    },
    highlightTag: 'Solution: Total peace of mind • Zero duplicate cooking • Calm kitchen',
    metric: '100% Status Clarity'
  },
  {
    id: 5,
    actLabel: 'ACT 05',
    timeTag: 'Minute 25–45 • Seamless Settlement',
    stageName: 'Hot Naans in 3 Mins & 5-Star Google Reviews',
    isProblem: false,
    image: '/marketing/carousel/split_bill.jpg',
    imageBadge: '⭐ 5-STAR GOOGLE REVIEW',
    title: '1-Tap Round 2 Add-Ons & Instant 5-Star Google Review',
    narrative: 'Mid-meal craving for 2 more naans? Guests tap their active Table Session on their phone. Tandoor fires them instantly — delivered hot in 3 minutes flat! Diners pay transparently via UPI in 5 seconds and leave a verified 5-star Google review.',
    characterDialogue: {
      speaker: 'Happy Customer & Manager',
      role: 'Checkout & Google Reviews',
      avatarBg: 'bg-amber-500',
      message: '“1-tap kiya aur 3 minute me garam naan table pe! Khana zabardast tha, 5-star rating de diya Google pe ⭐⭐⭐⭐⭐”'
    },
    highlightTag: 'Solution: +28% Round 2 sales • 35% faster table turns • 5-star Google reputation',
    metric: '+40% 5-Star Ratings'
  }
];

export default function DiningStorytellingSection() {
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentScene = CINEMATIC_STORY_SCENES[currentSceneIdx] || CINEMATIC_STORY_SCENES[0];

  // Auto-play story playback like a video sequence
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentSceneIdx(prev => (prev + 1) % CINEMATIC_STORY_SCENES.length);
      }, 6000);
    } else {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    }

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying]);

  const handleNext = () => {
    setCurrentSceneIdx(prev => (prev + 1) % CINEMATIC_STORY_SCENES.length);
  };

  const handlePrev = () => {
    setCurrentSceneIdx(prev => (prev === 0 ? CINEMATIC_STORY_SCENES.length - 1 : prev - 1));
  };

  const handleRestart = () => {
    setCurrentSceneIdx(0);
    setIsPlaying(true);
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#FAFAF7] text-gray-900 relative overflow-hidden border-t border-b border-stone-200">
      {/* Background Subtle Atmosphere matching site design */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/50 via-[#FAFAF7] to-stone-100/60 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e8783c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-stone-200 text-[#e8783c] text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles size={14} className="text-[#e8783c]" />
            <span>Cinematic Dining Story • What Really Happens</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 font-serif leading-[1.15]">
            The Friday Night Dining Story: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#e8783c] via-amber-600 to-[#e8783c] bg-clip-text text-transparent italic font-serif">
              From Paper Chaos to Tension-Free Royal Flow
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Watch the full journey: See how hungry guests struggle with paper menus, lost kitchen chits, and cold food — and how MenusQR transforms the entire restaurant into a calm, tension-free experience.
          </p>
        </div>

        {/* Unified Cinematic Story Player (Like a Video Simulator) */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-2xl overflow-hidden p-6 sm:p-10 relative">
          
          {/* Top Video Header: Timeline Scrubber Segments */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
            {CINEMATIC_STORY_SCENES.map((scene, idx) => {
              const isActive = idx === currentSceneIdx;
              const isPassed = idx < currentSceneIdx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setCurrentSceneIdx(idx)}
                  className="text-left group cursor-pointer focus:outline-none"
                >
                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden mb-2">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isActive
                          ? scene.isProblem ? 'bg-rose-500 w-full animate-pulse' : 'bg-emerald-500 w-full animate-pulse'
                          : isPassed
                          ? scene.isProblem ? 'bg-rose-400 w-full' : 'bg-emerald-400 w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#e8783c]' : 'text-gray-400'}`}>
                      {scene.actLabel}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded hidden md:inline ${
                      scene.isProblem ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {scene.isProblem ? 'PROBLEM' : 'SOLUTION'}
                    </span>
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-gray-900 font-extrabold' : 'text-gray-500'}`}>
                    {scene.stageName.split('•')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Cinematic Screen Frame */}
          <motion.div
            key={currentSceneIdx}
            initial={{ opacity: 0.2, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[420px]"
          >
            {/* Left Cinema Frame: Real Photographic Visual with Overlay Badges */}
            <div className="lg:col-span-6 flex justify-center">
              <div className={`w-full max-w-lg rounded-3xl overflow-hidden border-2 shadow-xl relative group ${
                currentScene.isProblem ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-emerald-500 ring-4 ring-emerald-500/15'
              }`}>
                {/* Real Image Container */}
                <div className="aspect-[16/11] w-full bg-stone-900 relative overflow-hidden">
                  <img
                    src={currentScene.image}
                    alt={currentScene.title}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      currentScene.isProblem ? 'contrast-95 brightness-90' : 'contrast-105'
                    }`}
                  />

                  {/* Top Overlay Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-black tracking-wide shadow-md uppercase ${
                      currentScene.isProblem 
                        ? 'bg-rose-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {currentScene.imageBadge}
                    </span>
                  </div>

                  {/* Scene Time Tag Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {currentScene.timeTag.split('•')[0]}
                    </span>
                  </div>

                  {/* Bottom Gradient with Floating Live Status Hook */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <div className="text-sm sm:text-base font-bold font-serif leading-snug drop-shadow-md">
                      {currentScene.stageName}
                    </div>
                    <div className={`text-xs font-bold mt-1 flex items-center gap-1.5 ${
                      currentScene.isProblem ? 'text-rose-300' : 'text-emerald-300'
                    }`}>
                      {currentScene.isProblem ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      <span>{currentScene.metric}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Screenplay Narrative & Real Subtitle Dialogues */}
            <div className="lg:col-span-6 space-y-5 text-left">
              
              {/* Scene Phase Tag */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  currentScene.isProblem 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {currentScene.actLabel} • {currentScene.timeTag}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  currentScene.isProblem ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {currentScene.isProblem ? '🔴 Problem Phase' : '🟢 Tension-Free MenusQR'}
                </span>
              </div>

              {/* Big Headline */}
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif leading-tight">
                {currentScene.title}
              </h3>

              {/* Vivid Narrative */}
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {currentScene.narrative}
              </p>

              {/* Real Subtitle Dialogue / Speech Bubble (What People are Saying) */}
              <div className={`p-4 rounded-2xl border shadow-sm relative ${
                currentScene.isProblem 
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950' 
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center gap-2 text-xs font-bold mb-1.5">
                  <MessageSquare size={14} className={currentScene.isProblem ? 'text-rose-600' : 'text-emerald-600'} />
                  <span>Actual Dialogue in Restaurant:</span>
                </div>
                
                <div className="text-sm sm:text-base font-semibold italic leading-relaxed">
                  {currentScene.characterDialogue.message}
                </div>

                <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-between text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${currentScene.characterDialogue.avatarBg}`} />
                    <span>{currentScene.characterDialogue.speaker} ({currentScene.characterDialogue.role})</span>
                  </span>
                </div>
              </div>

              {/* Highlight Tag */}
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
                currentScene.isProblem 
                  ? 'bg-rose-100/50 text-rose-800 border border-rose-200/60' 
                  : 'bg-emerald-100/50 text-emerald-800 border border-emerald-200/60'
              }`}>
                <span>{currentScene.highlightTag}</span>
                {currentScene.isProblem ? (
                  <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                ) : (
                  <Check size={15} className="text-emerald-600 shrink-0 font-black" />
                )}
              </div>

            </div>
          </motion.div>

          {/* Bottom Video Controller Bar */}
          <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            
            {/* Play/Pause & Restart Controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Story' : 'Play Story Video'}</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 transition-colors border border-stone-200 cursor-pointer"
                title="Restart Story from Act 1"
              >
                <RotateCcw size={15} />
              </button>

              <span className="text-xs font-mono font-bold text-gray-500 hidden sm:inline ml-2">
                Act {currentSceneIdx + 1} of 5 • {currentScene.timeTag.split('•')[0]}
              </span>
            </div>

            {/* Next / Previous Scene Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-800 text-xs font-bold transition-colors border border-stone-200 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} />
                <span>Prev Act</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white text-xs font-extrabold transition-all shadow-md shadow-[#e8783c]/20 flex items-center gap-1 cursor-pointer"
              >
                <span>Next Act</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Industry Proof & Metrics Bar */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl">
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

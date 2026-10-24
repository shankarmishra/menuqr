import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  AlertTriangle, 
  QrCode, 
  ArrowRight, 
  UtensilsCrossed,
  Star,
  Check,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

type StoryMode = 'old_way' | 'menusqr';

interface SceneContent {
  id: number;
  timeTag: string;
  phaseTitle: string;
  guestAction: string;
  storyHeading: string;
  storyNarrative: string;
  speechBubble: string;
  bubbleAuthor: string;
  painOrGainBadge: string;
  metricsBadge: string;
  accentColor: string;
}

const oldWayScenes: SceneContent[] = [
  {
    id: 1,
    timeTag: 'Minute 0–10 • Seated at Table 4',
    phaseTitle: 'The Arrival & Frantic Hand-Waving',
    guestAction: 'Diners sit at table, looking around in vain',
    storyHeading: 'Waiting 10 Minutes Just to Get a Greasy Paper Menu',
    storyNarrative: 'A family arrives hungry on a busy Friday night. They sit down and try to make eye contact with waiters who rush past with trays. After 10 minutes of hand-waving, a waiter drops a sticky, torn paper menu with scribbled prices and cross-outs.',
    speechBubble: '“Bhaiya menu dedo please! 10 minute ho gaye baithe huye...”',
    bubbleAuthor: 'Frustrated Diner at Table 4',
    painOrGainBadge: '10–12 Min Initial Delay',
    metricsBadge: 'High Guest Friction',
    accentColor: 'rose'
  },
  {
    id: 2,
    timeTag: 'Minute 15–35 • In The Kitchen Black Hole',
    phaseTitle: 'The Order Black Hole & Kitchen Screams',
    guestAction: 'Waiting in cold silence with zero updates',
    storyHeading: 'The 25-Minute Silence: Did the Chef Even Start Cooking?',
    storyNarrative: 'The server hastily scribbles handwriting on a rough paper chit. In the loud kitchen, the slip gets soaked in gravy or blown away by exhaust fans. Diners sit in awkward silence wondering if their food will ever arrive.',
    speechBubble: '“Bhaiya khana kab tak aayega? Bachho ko bahut bhookh lagi hai...”',
    bubbleAuthor: 'Anxious Diner checking watch',
    painOrGainBadge: '25 Min Anxious Waiting',
    metricsBadge: 'Kitchen Chaos & Duplicates',
    accentColor: 'rose'
  },
  {
    id: 3,
    timeTag: 'Minute 35–50 • The Dining Freeze',
    phaseTitle: 'The Mid-Meal Roti & Cold Curry Tragedy',
    guestAction: 'Gravy on table, but bread basket is empty',
    storyHeading: 'Craving 2 More Rotis? Watch Your Food Get Ice Cold',
    storyNarrative: 'The curry is piping hot on the table, but guests crave 2 extra Butter Naans. The waiter is across the room settling another bill. By the time someone notices their waving hand 12 minutes later, the curry has turned ice cold.',
    speechBubble: '“Roti khatam ho gayi, waiter mil hi nahi raha. Curry thandi ho gayi yaar...”',
    bubbleAuthor: 'Diner waving hand across hall',
    painOrGainBadge: 'Flow Broken & Cold Food',
    metricsBadge: 'Ruined Dining Mood',
    accentColor: 'rose'
  },
  {
    id: 4,
    timeTag: 'Minute 55–70 • Checkout & Departure',
    phaseTitle: 'The 15-Minute Bill Dispute & Sour Farewell',
    guestAction: 'Waiting for bill, then arguing over mistakes',
    storyHeading: 'Wrong Drinks Charged & Card Machine Battery Dead',
    storyNarrative: 'Asking for the bill takes another 10 minutes. The waiter brings a handwritten rough slip with an extra cold drink mistakenly added from Table 3. An awkward dispute at the cashier leaves a bitter memory for what could have been a nice meal.',
    speechBubble: '“Yeh cold drink humne nahi mangwayi thi! Table 3 ka bill hamare me laga diya?”',
    bubbleAuthor: 'Disputing Diner at Billing Counter',
    painOrGainBadge: '15 Min Checkout Wait',
    metricsBadge: '0 Repeat Visits',
    accentColor: 'rose'
  }
];

const menusqrScenes: SceneContent[] = [
  {
    id: 1,
    timeTag: 'Minute 0–1 • Seated at Table 4',
    phaseTitle: 'The Instant 1-Second Royal Scan',
    guestAction: 'Phone scan table stand in 300 milliseconds',
    storyHeading: 'Scan Table Stand ➔ 60 FPS Royal Menu Opens Instantly',
    storyNarrative: 'Diners sit down and spot a luxury acrylic table placard. They open their camera, scan in 1 second, and a fluid 60 FPS digital tasting menu loads instantly. High-res photographs, spice meters, and chef recommendations guide their choices.',
    speechBubble: '“Arre waah! QR scan karte hi pura visual photo menu khul gaya, zero wait!”',
    bubbleAuthor: 'Delighted Diner at Table 4',
    painOrGainBadge: '0 Second Wait Time',
    metricsBadge: '100% Royal Elegance',
    accentColor: 'emerald'
  },
  {
    id: 2,
    timeTag: 'Minute 2–18 • Kitchen Live Sync',
    phaseTitle: 'Live Ticking Cooking Timer & Status Clarity',
    guestAction: 'Diners track cooking live second-by-second',
    storyHeading: 'Food Arriving in 14:28: Real-Time Cooking Transparency',
    storyNarrative: 'Order sends directly to the kitchen display tablet + prints an 80mm thermal KOT for the cook. Chef Vikram sets prep time. The guest’s phone shows a live ticking countdown timer (14:28) with dynamic progress bar and reassuring status.',
    speechBubble: '“Dekho screen pe timer chal raha hai — ‘Cooking on Flame 🔥, 14:28 mins baaki’.”',
    bubbleAuthor: 'Impressed Guest watching phone',
    painOrGainBadge: '100% Status Transparency',
    metricsBadge: 'Zero Waiter Harassment',
    accentColor: 'emerald'
  },
  {
    id: 3,
    timeTag: 'Minute 20–35 • Seamless Dining',
    phaseTitle: '1-Tap Round 2 Add-On (Delivered in 3 Mins)',
    guestAction: 'Tap active table session for instant hot naans',
    storyHeading: 'Piping Hot Naan in 3 Minutes: No Waving, No Delays',
    storyNarrative: 'While eating, guests tap "Add to Table Session" on their phone to re-order 2 hot Garlic Naans. The kitchen screen chimes "🔥 Round 2 Add-On: Table 4". The tandoor chef fires them instantly — hot bread lands at the table in 3 minutes flat.',
    speechBubble: '“1-tap kiya aur 3 minute me garam naan table pe aa gaya! Super smooth!”',
    bubbleAuthor: 'Happy Diners enjoying dinner',
    painOrGainBadge: '+28% Round 2 Orders',
    metricsBadge: 'Piping Hot Flow',
    accentColor: 'emerald'
  },
  {
    id: 4,
    timeTag: 'Minute 40–45 • Seamless Settlement',
    phaseTitle: 'Instant Transparent Bill & 5-Star Google Review',
    guestAction: 'Tap UPI to pay & 1-tap 5-star Google review',
    storyHeading: '0 Billing Disputes & Glowing 5-Star Reviews',
    storyNarrative: 'The running table total is visible in real-time with zero calculation errors. Diners pay in 5 seconds via UPI scan or cash. Before leaving, a 1-tap Google Review hook prompts a genuine 5-star review, building permanent restaurant reputation.',
    speechBubble: '“Bill bill sab clear hai. Food was amazing, 5-star rating de diya Google pe!”',
    bubbleAuthor: 'Smiling Diner leaving restaurant',
    painOrGainBadge: '0 Errors • 5-Star Reviews',
    metricsBadge: '+40% 5-Star Ratings',
    accentColor: 'emerald'
  }
];

export default function DiningStorytellingSection() {
  const [storyMode, setStoryMode] = useState<StoryMode>('menusqr');
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScenes = storyMode === 'old_way' ? oldWayScenes : menusqrScenes;
  const currentScene = activeScenes[currentSceneIdx] || activeScenes[0];

  // Auto-play story scenes sequence like a video simulation
  useEffect(() => {
    if (isPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSceneIdx(prev => (prev + 1) % 4);
      }, 5500);
    } else {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isPlaying, storyMode]);

  const handleModeSwitch = (mode: StoryMode) => {
    setStoryMode(mode);
    setCurrentSceneIdx(0);
  };

  const handleNext = () => {
    setCurrentSceneIdx(prev => (prev + 1) % 4);
  };

  const handlePrev = () => {
    setCurrentSceneIdx(prev => (prev === 0 ? 3 : prev - 1));
  };

  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 bg-[#FAFAF7] text-gray-900 relative overflow-hidden border-t border-b border-stone-200">
      {/* Background Subtle Atmosphere matching site design */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-100/60 via-[#FAFAF7] to-stone-100/40 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e8783c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-stone-200 text-[#e8783c] text-xs font-bold tracking-widest uppercase mb-4">
            <Sparkles size={14} className="text-[#e8783c]" />
            <span>Interactive Story Experience</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 font-serif leading-[1.15]">
            A Tale of Two Tables: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#e8783c] via-amber-600 to-[#e8783c] bg-clip-text text-transparent italic font-serif">
              The Friday Night Dining Story
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Step into the shoes of your diners and kitchen staff. Watch the real friction that happens with old paper menus — and the seamless magic when MenusQR powers your tables.
          </p>

          {/* Interactive Story Mode Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-white border border-stone-200 shadow-md">
            <button
              type="button"
              onClick={() => handleModeSwitch('old_way')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                storyMode === 'old_way'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
              }`}
            >
              <XCircle size={16} />
              <span>The Old Way (Paper Chaos)</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('menusqr')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                storyMode === 'menusqr'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-stone-50'
              }`}
            >
              <Sparkles size={16} />
              <span>The MenusQR Way (Royal Flow)</span>
            </button>
          </div>
        </div>

        {/* Main Story Theater Canvas */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-xl overflow-hidden p-6 sm:p-10 relative">
          
          {/* Top Story Timeline Progress Bar (Like an Animated Video / Story scrubber) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-8">
            {activeScenes.map((scene, idx) => {
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
                          ? storyMode === 'old_way' ? 'bg-rose-500 w-full animate-pulse' : 'bg-emerald-500 w-full animate-pulse'
                          : isPassed
                          ? storyMode === 'old_way' ? 'bg-rose-400 w-full' : 'bg-emerald-400 w-full'
                          : 'w-0'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-mono font-bold uppercase ${isActive ? 'text-[#e8783c]' : 'text-gray-400'}`}>
                      Act 0{idx + 1}
                    </span>
                    <span className="hidden sm:inline text-[10px] text-gray-500 font-medium">
                      {scene.timeTag.split('•')[0]}
                    </span>
                  </div>
                  <div className={`text-xs font-bold truncate mt-0.5 ${isActive ? 'text-gray-900 font-extrabold' : 'text-gray-500'}`}>
                    {scene.phaseTitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Animated Scene Presentation */}
          <motion.div
            key={`${storyMode}-${currentSceneIdx}`}
            initial={{ opacity: 0.2, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[380px]"
          >
              {/* Left Column: Comic Narrative & Character Dialogue */}
              <div className="lg:col-span-6 space-y-5 text-left">
                
                {/* Phase & Time Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                    storyMode === 'old_way' 
                      ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {currentScene.timeTag}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    storyMode === 'old_way' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {currentScene.metricsBadge}
                  </span>
                </div>

                {/* Big Story Headline */}
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 font-serif leading-tight">
                  {currentScene.storyHeading}
                </h3>

                {/* Vivid Story Narrative */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {currentScene.storyNarrative}
                </p>

                {/* Comic Character Speech Bubble */}
                <div className={`p-4 rounded-2xl relative border shadow-sm ${
                  storyMode === 'old_way'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}>
                  <div className="text-xs sm:text-sm font-semibold italic leading-relaxed">
                    {currentScene.speechBubble}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {currentScene.bubbleAuthor}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      storyMode === 'old_way' ? 'bg-rose-200/60 text-rose-800' : 'bg-emerald-200/60 text-emerald-800'
                    }`}>
                      {currentScene.painOrGainBadge}
                    </span>
                  </div>
                </div>

                {/* Navigation & Auto-Play Controls */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isPlaying ? 'Pause Story' : 'Auto Play'}</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 transition-colors border border-stone-200 cursor-pointer"
                      title="Previous Scene"
                      aria-label="Previous scene"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-mono font-bold text-gray-400 px-2">
                      {currentSceneIdx + 1} / 4
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 transition-colors border border-stone-200 cursor-pointer"
                      title="Next Scene"
                      aria-label="Next scene"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Visual Story Scene Graphic Mockup */}
              <div className="lg:col-span-6 flex justify-center">
                {storyMode === 'old_way' ? (
                  /* Old Paper Chaos Visual Scene Graphic */
                  <div className="w-full max-w-md rounded-3xl bg-stone-50 border-2 border-rose-200 p-6 shadow-lg text-left relative overflow-hidden select-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />

                    {/* Scene Illustration Visual Header */}
                    <div className="flex items-center justify-between border-b border-rose-200 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                          <XCircle size={18} />
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-rose-700">
                          {currentSceneIdx === 0 && 'Dirty Laminated Paper Slip'}
                          {currentSceneIdx === 1 && 'Lost Kitchen Paper Chit'}
                          {currentSceneIdx === 2 && 'Cold Food & Missing Waiter'}
                          {currentSceneIdx === 3 && 'Disputed Handwritten Bill'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        OLD REALITY
                      </span>
                    </div>

                    {/* Scene-Specific Graphical Representation */}
                    {currentSceneIdx === 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-inner font-serif relative">
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-mono font-bold uppercase rotate-12 shadow">
                          SOLD OUT
                        </div>
                        <div className="text-xs text-amber-900 font-bold uppercase tracking-wider mb-2">
                          🍽️ Restro Menu Card (Greasy & Stained)
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center p-2 rounded bg-white/80 border border-amber-200">
                            <div>
                              <div className="font-bold text-gray-800">Paneer Tikka Angara</div>
                              <div className="text-[10px] text-gray-400">Old price scratched out with red pen</div>
                            </div>
                            <div className="font-mono">
                              <span className="line-through text-rose-500 mr-1.5">₹260</span>
                              <span className="text-gray-900 font-bold">₹310</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-2 rounded bg-white/80 border border-rose-200 opacity-60">
                            <div>
                              <div className="font-bold text-gray-500 line-through">Mutton Galouti Kebab</div>
                              <div className="text-[10px] text-rose-600">Out of Stock sticker applied</div>
                            </div>
                            <span className="text-rose-600 font-mono text-[10px] font-bold">UNAVAILABLE</span>
                          </div>
                        </div>
                        <div className="mt-3 text-[11px] text-rose-700 font-sans font-bold flex items-center justify-between">
                          <span>✋ Impatiently waving hand...</span>
                          <span>11 mins waiting</span>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 1 && (
                      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center font-mono space-y-3">
                        <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                          ⏱️ Waiting In The Dark
                        </div>
                        <div className="text-4xl font-black text-rose-600 font-mono tracking-tight animate-pulse">
                          24:18
                        </div>
                        <div className="text-xs text-gray-600">
                          Minutes passed without a single status update
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-rose-200 text-xs text-rose-900 text-left space-y-1 font-sans">
                          <div>• Server wrote chit on rough paper</div>
                          <div>• Chit lost near tandoor counter</div>
                          <div className="font-bold text-rose-700">• Guests asking: "Bhaiya khana kab aayega?"</div>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 2 && (
                      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 font-sans space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-sky-900">
                          <span>🍛 Dal Makhani on Table</span>
                          <span className="text-sky-700 text-[10px] bg-sky-100 px-2 py-0.5 rounded">TURNING COLD ❄️</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-sky-200 text-xs space-y-1.5 text-gray-700">
                          <div className="flex justify-between">
                            <span>Main Curry Served:</span>
                            <span className="font-mono font-bold text-gray-900">8:32 PM</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-bold">
                            <span>Need 2 Extra Naans:</span>
                            <span>Waiter busy 5 tables away</span>
                          </div>
                          <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                            By the time extra rotis arrive at 8:46 PM, dinner is ice cold and appetite is lost.
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 3 && (
                      <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 font-mono text-xs space-y-2">
                        <div className="flex justify-between items-center text-stone-800 font-bold border-b border-stone-200 pb-2">
                          <span>🧾 Rough Handwritten Chit</span>
                          <span className="text-rose-600 font-bold text-[10px]">DISPUTED TOTAL</span>
                        </div>
                        <div className="space-y-1 text-gray-700 text-[11px]">
                          <div className="flex justify-between">
                            <span>1x Paneer Tikka</span>
                            <span>₹310</span>
                          </div>
                          <div className="flex justify-between">
                            <span>2x Butter Naan</span>
                            <span>₹120</span>
                          </div>
                          <div className="flex justify-between text-rose-600 font-bold bg-rose-100 px-1 py-0.5 rounded">
                            <span>⚠️ 1x Fresh Lime (Table 3 error)</span>
                            <span>₹90</span>
                          </div>
                          <div className="border-t border-stone-300 pt-1 flex justify-between font-bold text-gray-900">
                            <span>Total Scribbled:</span>
                            <span>₹520 (Error!)</span>
                          </div>
                        </div>
                        <div className="text-[10px] text-gray-500 italic pt-1">
                          Awkward billing argument at counter • 10 minute card swipe delay
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 font-bold">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Old dining reality wastes 25+ mins
                      </span>
                    </div>
                  </div>
                ) : (
                  /* MenusQR Transformation Graphic: High-Quality Smartphone Simulation */
                  <div className="w-full max-w-md rounded-3xl bg-white border-2 border-emerald-500 p-6 shadow-2xl text-left relative overflow-hidden select-none ring-4 ring-emerald-500/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

                    {/* Scene Illustration Visual Header */}
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                          <CheckCircle2 size={18} />
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                          {currentSceneIdx === 0 && 'Instant 300ms QR Stand Scan'}
                          {currentSceneIdx === 1 && 'Live Kitchen Countdown Timer'}
                          {currentSceneIdx === 2 && '1-Tap Round 2 Dining Session'}
                          {currentSceneIdx === 3 && 'Instant UPI & 5-Star Review'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        MENUSQR FLOW
                      </span>
                    </div>

                    {/* Scene-Specific Modern Visuals */}
                    {currentSceneIdx === 0 && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 font-sans space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <Sparkles size={13} className="text-[#e8783c]" />
                            The Royal Awadh • Table 4
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ⚡ 280ms Instant Open
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-sm flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#e8783c]/15 border border-[#e8783c]/30 flex items-center justify-center shrink-0">
                            <UtensilsCrossed size={20} className="text-[#e8783c]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
                              <span>Mutton Galouti Kebab</span>
                              <span className="text-[10px] text-amber-600">🌶️ Chef Special</span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">Saffron infused smoked patties</div>
                            <div className="text-xs font-black text-gray-900 font-mono mt-0.5">₹380</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-[#e8783c] text-white text-[11px] font-black shrink-0">
                            + ADD
                          </span>
                        </div>

                        <div className="text-[11px] text-emerald-700 font-bold flex items-center justify-between">
                          <span>✓ 60 FPS Smooth Swiping</span>
                          <span>Zero app download required</span>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 1 && (
                      <div className="p-4 rounded-2xl bg-gradient-to-b from-stone-900 to-[#121915] text-white font-mono text-center space-y-3 shadow-inner">
                        <div className="flex items-center justify-between text-[11px] border-b border-white/10 pb-2">
                          <span className="text-amber-300 font-bold flex items-center gap-1">
                            <Flame size={13} className="text-[#e8783c] animate-bounce" />
                            COOKING ON FLAME
                          </span>
                          <span className="text-emerald-400 font-bold">TABLE 4</span>
                        </div>

                        <div className="text-4xl font-black text-white font-mono tracking-tight my-1 drop-shadow-md">
                          14:28
                        </div>
                        <div className="text-[11px] text-amber-200 font-bold">
                          Food landing at your table in 14 minutes
                        </div>

                        {/* Animated Progress Bar */}
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#e8783c] to-emerald-400"
                            style={{ width: '68%' }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                          <span>✓ Chef Confirmed</span>
                          <span>🔥 In Tandoor</span>
                          <span>⚪ Heading to Table</span>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 2 && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 font-sans space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <Clock size={14} className="text-emerald-600" />
                            Active Table Session (Round 2)
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">
                            3 MIN DELIVERY
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-emerald-200 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-gray-900">2x Garlic Butter Naan</div>
                            <div className="text-[10px] text-emerald-600">Added to ongoing table tab in 1 click</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-gray-900">₹160</div>
                            <span className="text-[10px] text-emerald-700 font-bold">⚡ Sent to Tandoor</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold text-gray-700 pt-1 border-t border-emerald-200">
                          <span>Combined Table Bill:</span>
                          <span className="font-black text-emerald-700 text-sm font-mono">₹1,140</span>
                        </div>
                      </div>
                    )}

                    {currentSceneIdx === 3 && (
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 font-sans space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-900 flex items-center gap-1">
                            <Receipt size={14} className="text-emerald-600" />
                            Instant Digital Settlement
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            0 CALCULATION ERRORS
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-stone-200 space-y-1.5 text-xs">
                          <div className="flex justify-between text-gray-600">
                            <span>All Dishes (Rounds 1 & 2):</span>
                            <span className="font-mono font-bold text-gray-900">₹1,140</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-stone-100">
                            <span className="font-bold text-emerald-600">UPI / Card / Cash:</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              PAID IN 5 SECONDS
                            </span>
                          </div>
                        </div>

                        {/* 5-Star Google Review Prompt Hook */}
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star size={13} fill="currentColor" />
                            <Star size={13} fill="currentColor" />
                            <Star size={13} fill="currentColor" />
                            <Star size={13} fill="currentColor" />
                            <Star size={13} fill="currentColor" />
                            <span className="text-[11px] text-gray-800 font-bold ml-1">5-Star Google Review</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#e8783c] underline">Tap to Post</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" />
                        35% faster table turnover • Delighted guests
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

          {/* Bottom Interactive ROI Bar */}
          <div className="mt-10 pt-8 border-t border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-[#e8783c] font-mono">0 sec</div>
              <div className="text-xs font-bold text-gray-900 mt-0.5">Initial Wait Time</div>
              <div className="text-[10px] text-gray-500">Instant scan at table</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">+28%</div>
              <div className="text-xs font-bold text-gray-900 mt-0.5">Round 2 Re-Orders</div>
              <div className="text-[10px] text-gray-500">Hot naans, drinks & dessert</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">35%</div>
              <div className="text-xs font-bold text-gray-900 mt-0.5">Faster Table Turns</div>
              <div className="text-[10px] text-gray-500">+2 table seatings/rush</div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="text-2xl sm:text-3xl font-black text-sky-600 font-mono">+40%</div>
              <div className="text-xs font-bold text-gray-900 mt-0.5">5-Star Google Reviews</div>
              <div className="text-[10px] text-gray-500">1-click farewell review hook</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/purchase/details"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#e8783c] hover:bg-[#d66a30] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#e8783c]/25 hover:scale-[1.02] active:scale-95"
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

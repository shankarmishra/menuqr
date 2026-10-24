import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, 
  ChefHat, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  XCircle, 
  QrCode,
  ArrowRight,
  Clock,
  Flame,
  Receipt,
  Smartphone,
  Play,
  RotateCcw,
  Star,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

type StoryPerspective = 'customer' | 'restaurant';

interface StoryChapter {
  id: string;
  title: string;
  stageBadge: string;
  before: {
    title: string;
    description: string;
    tag: string;
    visualDetail: string;
  };
  after: {
    title: string;
    description: string;
    tag: string;
    visualDetail: string;
    metric?: string;
  };
}

const customerChapters: StoryChapter[] = [
  {
    id: 'c1',
    title: 'The Arrival & First Impressions',
    stageBadge: 'Minute 0–5 • Table Seating',
    before: {
      title: 'The Frantic Hand-Wave & Sticky Paper',
      description: 'Diners sit awkwardly, waving hands trying to catch a busy waiter’s eye. They are handed grease-stained, ripped paper menus with struck-through prices and crossed-out sold-out dishes.',
      tag: 'Pain: 8-12 min delay before first order',
      visualDetail: 'Sticky laminate • Pen scribbles • Frustrated guests'
    },
    after: {
      title: 'Instant 1-Second Royal Scan',
      description: 'Diners scan a handcrafted luxury acrylic/brass table stand. In 300ms, a fluid 60 FPS royal tasting menu opens on their smartphone with high-res food photography, spicy levels, and dietary badges.',
      tag: 'Experience: Zero wait, 100% royal elegance',
      visualDetail: 'Instant 60fps folio • Vibrant dish visuals • Diet filters',
      metric: '0 sec wait time'
    }
  },
  {
    id: 'c2',
    title: 'The Cooking Wait & Status Uncertainty',
    stageBadge: 'Minute 10–25 • In The Kitchen',
    before: {
      title: 'The 25-Minute Anxious Black Box',
      description: 'Diners sit in cold silence wondering: "Did the kitchen forget our order? Has the chef even started cooking?" Guests repeatedly stop busy waitstaff to ask for updates.',
      tag: 'Pain: Stress, hunger anxiety & awkward silence',
      visualDetail: 'Uncertainty • Cold waiting • "Bhaiya khana kab aayega?"'
    },
    after: {
      title: 'Live Second-by-Second Countdown Timer',
      description: 'Diners watch a live ticking countdown timer (e.g. "Food arriving in 14:28") right on their phone. Clear status steppers: Confirmed by Kitchen ➔ Cooking on Flame 🔥 ➔ Plated & Ready.',
      tag: 'Experience: Reassuring transparency & delight',
      visualDetail: 'Live ticking timer (MM:SS) • Visual cooking progress',
      metric: '100% status clarity'
    }
  },
  {
    id: 'c3',
    title: 'The Mid-Meal Craving (Round 2 Add-Ons)',
    stageBadge: 'Minute 25–45 • Dining & Second Rounds',
    before: {
      title: 'The "Food Gets Cold" Roti Struggle',
      description: 'Curry is on the table, but guests crave 2 more Butter Naans or another cold drink. The waiter is across the room taking another order. By the time the bread arrives, the food is ice cold.',
      tag: 'Pain: Lost appetite & ruined dining flow',
      visualDetail: 'Cold curry • Waiter unavailable • Dinner ruined'
    },
    after: {
      title: 'Seamless 1-Tap Table Session Add-On',
      description: 'Guests tap their active Table Session on their phone to add hot naans or a dessert. The kitchen instantly receives "🔔 Round 2 Add-On: Table 4" and delivers hot bread in 3 minutes flat.',
      tag: 'Experience: Hot food flow without waiting',
      visualDetail: '3.5h table session • Round 2 in 1 click • Piping hot delivery',
      metric: '+28% dessert/drink orders'
    }
  },
  {
    id: 'c4',
    title: 'The Final Bill & Departure',
    stageBadge: 'Minute 50–60 • Bill Settlement',
    before: {
      title: 'The 15-Minute Bill Wait & Calculation Errors',
      description: 'Asking for the bill takes another 10 minutes. Waitstaff brings a handwritten slip with an extra cold drink mistakenly added from Table 3. Awkward bill disputes end the meal on a sour note.',
      tag: 'Pain: Billing disputes & checkout friction',
      visualDetail: 'Wrong items charged • Slow card machine • Bad memory'
    },
    after: {
      title: 'Transparent Table Total & Instant Google Review',
      description: 'Transparent live cumulative table bill visible at all times. Diners pay via cash or quick UPI scanner. Before leaving, a 1-tap Google Review button prompts honest 5-star customer ratings.',
      tag: 'Experience: Flawless farewell & 5-star Google reviews',
      visualDetail: 'Zero billing errors • Instant UPI / cash • 5-star review hook',
      metric: '+40% 5-star Google ratings'
    }
  }
];

const restaurantChapters: StoryChapter[] = [
  {
    id: 'r1',
    title: 'Peak Dinner Rush Command',
    stageBadge: '8:30 PM • Packed Dining Hall',
    before: {
      title: 'The Screaming Kitchen & Lost Kacha Slips',
      description: 'Servers frantically scribble handwriting that the tandoor chef cannot read. Paper order tickets get soaked with gravy or blown away by kitchen exhaust fans. Utter panic during peak rush.',
      tag: 'Pain: 25% server time wasted running slips',
      visualDetail: 'Illegible handwriting • Lost slips • Shouted orders'
    },
    after: {
      title: 'Digital KDS Reception & 1-Click Thermal KOT',
      description: 'Orders chime clearly on the kitchen tablet with table number, large bold dish names, and exact cooking notes. 1-click print outputs an 80mm thermal KOT slip for the line cook in seconds.',
      tag: 'Efficiency: Calm, coordinated digital kitchen',
      visualDetail: 'Digital order stream • Thermal KOT print • Zero lost tickets',
      metric: '35% faster table turn'
    }
  },
  {
    id: 'r2',
    title: 'Kitchen Cook Redundancy & Waste',
    stageBadge: 'Live Operations • Food Preparation',
    before: {
      title: 'The Accidental Double-Cooking Disaster',
      description: 'Customer asks another waiter for their missing dish; waiter re-enters it; the kitchen cooks 2 Dal Makhani by mistake. Margins get eaten away by kitchen re-fire waste and table confusion.',
      tag: 'Pain: High food wastage & eroded profits',
      visualDetail: 'Duplicate dishes • Spoiled inventory • Angry manager'
    },
    after: {
      title: 'Multi-Round Kitchen Item Distinction',
      description: 'When Table 4 orders Round 2, the kitchen screen clearly separates: "🔥 NEW DISHES TO COOK NOW (Round 2)" from "✅ ALREADY DELIVERED (Do not recook)". Chefs never duplicate food.',
      tag: 'Efficiency: Exact portioning & zero kitchen waste',
      visualDetail: 'New vs Delivered separation • Chef item checklist',
      metric: 'Zero duplicate dishes'
    }
  },
  {
    id: 'r3',
    title: 'Menu Price Updates & Seasonal Changes',
    stageBadge: 'Management • Costs & Margins',
    before: {
      title: 'The ₹30,000 Paper Re-Printing Tax',
      description: 'When paneer or oil prices rise, or when introducing a summer mango special, reprinting 50 laminated royal menus costs ₹15,000–₹30,000 and takes 7 days. Sticking ugly stickers looks cheap.',
      tag: 'Pain: Heavy printing bills & frozen prices',
      visualDetail: 'Expensive reprints • Delayed price adjustments • Ugly stickers'
    },
    after: {
      title: '3-Second Instant Updates with Permanent QR',
      description: 'Change prices, toggle out-of-stock items, or add seasonal specials in 3 seconds from your smartphone dashboard. The permanent table QR placards never need to be reprinted or replaced.',
      tag: 'Efficiency: Dynamic pricing & ₹0 reprint cost',
      visualDetail: 'Instant dashboard sync • Permanent metal/wood QR',
      metric: '₹36,000/yr saved'
    }
  },
  {
    id: 'r4',
    title: 'Table Turnover & Average Order Value (AOV)',
    stageBadge: 'Business Growth • Revenue & Margins',
    before: {
      title: 'Table Bottlenecks & Lost Dessert Sales',
      description: 'Tables remain occupied for 75+ minutes just waiting for physical menus and paper bills. Diners skip ice cream or beverages because waving down a waiter takes too long.',
      tag: 'Pain: Lost revenue during peak dining hours',
      visualDetail: 'Long wait times outside • Tables idle • Missed upsells'
    },
    after: {
      title: '+24% Higher Bill Size & Rapid Table Turns',
      description: 'Diners easily order appetizers, mocktails, and desserts with frictionless 1-tap ease. Table turnover shrinks by 18 minutes, allowing you to seat 2 more table seatings per evening.',
      tag: 'Efficiency: Maximized revenue per square foot',
      visualDetail: 'Higher average spend • Faster table cycles • Smiling guests',
      metric: '+24% higher AOV'
    }
  }
];

// Rich Visual Graphic Illustration for each Chapter (Before vs After)
function ChapterVisualGraphic({ chapterId, isBefore }: { chapterId: string; isBefore: boolean }) {
  if (isBefore) {
    // Broken Reality Illustrations
    switch (chapterId) {
      case 'c1':
        return (
          <div className="relative p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-left font-serif overflow-hidden select-none">
            {/* Grease Stain & Torn Paper Simulation */}
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-amber-600/15 blur-lg pointer-events-none" />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-900/50 text-rose-300 border border-rose-700/60 text-[10px] font-mono font-bold uppercase rotate-6">
              SOLD OUT
            </div>
            
            <div className="text-[11px] uppercase tracking-wider text-amber-500 font-bold mb-2 flex items-center gap-1.5">
              <span>📄 Torn Paper Menu</span>
              <span className="text-[10px] text-rose-400 font-mono">(Stained & Outdated)</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-black/40 border border-amber-900/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-amber-200">Paneer Tikka Angara</div>
                  <div className="text-[10px] text-slate-400">Old price scratched out with red pen</div>
                </div>
                <div className="text-right font-mono">
                  <span className="line-through text-rose-400 mr-1.5">₹260</span>
                  <span className="text-amber-300 font-bold">₹310</span>
                </div>
              </div>

              <div className="p-2 rounded bg-black/40 border border-rose-900/30 flex justify-between items-center opacity-60">
                <div>
                  <div className="font-bold text-slate-300 line-through">Mutton Galouti Kebab</div>
                  <div className="text-[10px] text-rose-400">Out of Stock (Torn sticker applied)</div>
                </div>
                <div className="text-rose-400 font-mono text-xs font-bold">UNAVAILABLE</div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-rose-900/30 flex items-center justify-between text-[11px] text-rose-400 font-mono">
              <span>⏳ Waving hand for waiter...</span>
              <span className="font-bold">9 mins waiting</span>
            </div>
          </div>
        );

      case 'c2':
        return (
          <div className="relative p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-left font-mono overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-rose-900/30 pb-2 mb-3">
              <span className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                <Clock size={13} className="text-rose-400" />
                <span>Waiting Without Any Update</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-black">
                BLACK BOX
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 text-center">
              <div className="text-3xl font-black text-rose-400 font-mono tracking-tight animate-pulse">
                24:15
              </div>
              <div className="text-[11px] text-rose-300/80 mt-1">
                Minutes elapsed since order taken on paper
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-rose-300/80">
                <span>❓ Has the kitchen even fired the order?</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300/80">
                <span>❓ Waitstaff: "Bhaiya 2 minute me aa raha hai" (3 times)</span>
              </div>
            </div>
          </div>
        );

      case 'c3':
        return (
          <div className="relative p-4 rounded-2xl bg-sky-950/20 border border-sky-900/40 text-left font-mono overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-sky-900/30 pb-2 mb-2">
              <span className="text-xs text-sky-300 font-bold">Cold Curry & Lost Waiter</span>
              <span className="text-[10px] text-rose-400 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-800">
                DINING FLOW BROKEN
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-sky-800/30 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>🍛 Dal Makhani on table</span>
                <span className="text-sky-300 text-[11px]">Getting ice cold ❄️</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>🫓 Need 2 more Butter Naans</span>
                <span className="text-rose-400 text-[11px]">Waiter occupied across room</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 italic">
              "By the time the extra roti arrives 15 minutes later, everyone has lost their appetite."
            </div>
          </div>
        );

      case 'c4':
        return (
          <div className="relative p-4 rounded-2xl bg-stone-950/40 border border-rose-900/40 text-left font-mono select-none">
            <div className="text-[11px] text-rose-300 font-bold mb-2 flex items-center justify-between">
              <span>🧾 Messy Handwritten Parchi</span>
              <span className="text-rose-400 text-[10px]">Error Prone</span>
            </div>

            <div className="p-2.5 rounded bg-black/60 border border-stone-800 text-[11px] space-y-1.5 text-slate-300">
              <div className="flex justify-between">
                <span>1x Paneer Tikka</span>
                <span>₹310</span>
              </div>
              <div className="flex justify-between">
                <span>2x Butter Naan</span>
                <span>₹120</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold bg-rose-500/10 px-1 rounded">
                <span>⚠️ 1x Fresh Lime (Table 3 accident)</span>
                <span>₹90</span>
              </div>
              <div className="border-t border-stone-700 pt-1 flex justify-between font-bold text-white">
                <span>Total scribbled</span>
                <span>₹520 (Disputed!)</span>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-rose-300">
              Awkward arguments at cashier • Card machine out of signal • Bad final memory
            </div>
          </div>
        );

      // Restaurant POV chapters
      case 'r1':
        return (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-left font-mono select-none">
            <div className="text-xs text-rose-300 font-bold mb-2 flex items-center justify-between">
              <span>📌 The Chaos Kitchen Board</span>
              <span className="text-[10px] text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded">RUSH COLLAPSE</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-rose-800/30 text-xs space-y-1.5 text-slate-300">
              <div>• 14 scribbled paper slips skewered on rusty nails</div>
              <div>• Gravy oil spilled over table numbers</div>
              <div>• Chef screams: "Ye Table 5 ka kacha slip kahan gaya?!"</div>
            </div>
          </div>
        );

      case 'r2':
        return (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-left font-mono select-none">
            <div className="text-xs text-amber-300 font-bold mb-2 flex items-center justify-between">
              <span>🗑️ Duplicate Cooking Wastage</span>
              <span className="text-[10px] text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded">PROFIT EATEN</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-amber-800/30 text-xs space-y-1.5 text-slate-300">
              <div>• Waiter A entered Dal Makhani for Table 7</div>
              <div>• Waiter B re-entered it because customer complained</div>
              <div className="text-rose-400 font-bold">• 2 bowls cooked, 1 tossed into trash bin</div>
            </div>
          </div>
        );

      case 'r3':
        return (
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-rose-900/40 text-left font-mono select-none">
            <div className="text-xs text-rose-300 font-bold mb-2 flex items-center justify-between">
              <span>💸 The Paper Printing Tax</span>
              <span className="text-[10px] text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded">HIGH EXPENSE</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-stone-800 text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Print Shop Invoice:</span>
                <span className="text-rose-400 font-bold">₹28,500</span>
              </div>
              <div className="text-[11px] text-slate-400">50 Leatherette Folders + Laminated Paper Inserts</div>
              <div className="text-[11px] text-amber-300 pt-1">Takes 7 days to deliver, prices frozen in meantime.</div>
            </div>
          </div>
        );

      case 'r4':
        return (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-left font-mono select-none">
            <div className="text-xs text-rose-300 font-bold mb-2 flex items-center justify-between">
              <span>🚶 Bottle-Necked Dining Room</span>
              <span className="text-[10px] text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded">LOST SEATS</span>
            </div>
            <div className="p-3 rounded-xl bg-black/50 border border-rose-800/30 text-xs space-y-1 text-slate-300">
              <div>• Tables sit idle 18 extra minutes just waiting for paper menus & bills</div>
              <div>• Walk-in diners leave seeing the queue outside</div>
              <div className="text-rose-300 font-bold">• 2 fewer seatings per table each evening</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  // The Royal Renaissance (With MenusQR) Visual Illustrations
  switch (chapterId) {
    case 'c1':
      return (
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#1b2520] to-[#121915] border border-amber-500/40 text-left shadow-lg select-none">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2.5">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>Royal Heritage Digital Folio</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40">
              ⚡ 280ms Instant Open
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <UtensilsCrossed size={20} className="text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span>Galouti Kebab Folio</span>
                <span className="text-[10px] text-amber-400 font-mono">🌶️ Chef Special</span>
              </div>
              <div className="text-[10px] text-slate-300 truncate">Melt-in-mouth smoked lamb patties with saffron</div>
              <div className="text-xs font-black text-amber-300 font-mono mt-0.5">₹380</div>
            </div>
            <span className="px-2 py-1 rounded bg-[#e8783c] text-white text-[10px] font-black shrink-0">
              + ADD
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-300 flex items-center gap-1">
              <Check size={11} className="text-emerald-400" /> 60 FPS Fluid Swipes
            </span>
            <span>Zero app download required</span>
          </div>
        </div>
      );

    case 'c2':
      return (
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#18231e] to-[#111714] border-2 border-[#e8783c] text-left shadow-xl select-none">
          <div className="flex items-center justify-between border-b border-[#e8783c]/30 pb-2 mb-2.5">
            <span className="text-xs text-amber-300 font-extrabold flex items-center gap-1.5">
              <Flame size={14} className="text-[#e8783c] animate-pulse" />
              <span>LIVE KITCHEN COUNTDOWN TIMER</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black animate-pulse">
              COOKING ON FLAME
            </span>
          </div>

          {/* Big Live Digital Clock Simulation */}
          <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-center relative overflow-hidden">
            <div className="text-3xl font-black text-white font-mono tracking-tight flex items-center justify-center gap-2">
              <Clock size={20} className="text-[#e8783c] animate-spin" style={{ animationDuration: '6s' }} />
              <span>14:28</span>
            </div>
            <div className="text-[11px] text-amber-200 font-bold mt-1">
              Estimated Table Delivery • Table 4
            </div>
            
            {/* Dynamic Progress Bar */}
            <div className="w-full bg-[#1e2a24] h-2 rounded-full mt-2.5 overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#e8783c] to-emerald-400"
                style={{ width: '68%' }}
              />
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-emerald-300">
            <span>✓ Kitchen Confirmed</span>
            <span>🔥 Tandoor Fired</span>
            <span className="text-slate-400">⚪ Heading to Table</span>
          </div>
        </div>
      );

    case 'c3':
      return (
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#1b2520] to-[#121915] border border-emerald-500/40 text-left shadow-lg select-none">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2.5">
            <span className="text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <Sparkles size={13} className="text-emerald-400" />
              <span>Table 4 Active Session (3.5h Window)</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/20">
              Round 2 Hot Add-On
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 flex justify-between items-center text-xs">
            <div>
              <div className="font-bold text-white">2x Garlic Butter Naan</div>
              <div className="text-[10px] text-emerald-400">Added to ongoing table tab in 1 click</div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-white">₹160</div>
              <span className="text-[10px] text-emerald-300 font-bold">⚡ Sent to Tandoor</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300 border-t border-white/10 pt-2">
            <span>Cumulative Table Total:</span>
            <span className="font-black text-emerald-300 text-sm">₹1,140</span>
          </div>
        </div>
      );

    case 'c4':
      return (
        <div className="relative p-4 rounded-2xl bg-gradient-to-b from-[#1b2520] to-[#121915] border border-amber-500/40 text-left shadow-lg select-none">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-2.5">
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <Receipt size={13} className="text-amber-400" />
              <span>Crystal Clear Digital Bill</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-black">
              100% ACCURACY
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>All Dishes (Rounds 1 & 2)</span>
              <span className="font-mono font-bold text-white">₹1,140</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/10">
              <span className="font-bold text-emerald-400">Instant UPI QR / Cash</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">PAID</span>
            </div>
          </div>

          {/* 5-Star Review Prompt Hook */}
          <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-300 text-xs font-bold">
              <Star size={13} fill="currentColor" />
              <Star size={13} fill="currentColor" />
              <Star size={13} fill="currentColor" />
              <Star size={13} fill="currentColor" />
              <Star size={13} fill="currentColor" />
              <span className="text-[10px] text-white ml-1">5-Star Google Review</span>
            </div>
            <span className="text-[10px] font-bold text-amber-400 underline">Tap to Post</span>
          </div>
        </div>
      );

    // Restaurant POV chapters
    case 'r1':
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18231e] to-[#121815] border border-emerald-500/40 text-left shadow-lg select-none">
          <div className="text-xs text-emerald-300 font-bold mb-2 flex items-center justify-between">
            <span>🖥️ Digital KDS Tablet + 80mm Thermal KOT</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              CALM KITCHEN
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-xs space-y-1.5 text-slate-200">
            <div className="flex justify-between font-bold text-white">
              <span>TABLE 4 • DINE-IN</span>
              <span className="text-amber-400 font-mono">1-Click Thermal Print</span>
            </div>
            <div className="text-[11px] text-emerald-300">• 1x Galouti Kebab (Medium Spicy)</div>
            <div className="text-[11px] text-emerald-300">• 2x Butter Naan</div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">Line cook ticks items off as finished. Zero missed tickets.</div>
          </div>
        </div>
      );

    case 'r2':
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18231e] to-[#121815] border border-amber-500/40 text-left shadow-lg select-none">
          <div className="text-xs text-amber-300 font-bold mb-2 flex items-center justify-between">
            <span>🔥 Multi-Round Item Separation</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              ZERO WASTE
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs space-y-1.5">
            <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-[11px]">
              🔥 NEW TO COOK NOW (Round 2): 2x Garlic Naan
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300/80 text-[11px] line-through">
              ✅ ALREADY DELIVERED (Round 1): 1x Dal Makhani
            </div>
          </div>
        </div>
      );

    case 'r3':
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18231e] to-[#121815] border border-amber-500/40 text-left shadow-lg select-none">
          <div className="text-xs text-amber-300 font-bold mb-2 flex items-center justify-between">
            <span>📱 3-Second Instant Price Update</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              ₹0 REPRINT COST
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-xs space-y-1.5 text-slate-200">
            <div className="flex justify-between items-center">
              <span>Paneer Tikka:</span>
              <span className="font-mono text-emerald-400 font-bold">₹280 ➔ ₹320 (Instant)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Mango Kulfi Special:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">ACTIVE NOW</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">All 30 table QR stands instantly display the new pricing in 1 second.</div>
          </div>
        </div>
      );

    case 'r4':
      return (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#18231e] to-[#121815] border border-emerald-500/40 text-left shadow-lg select-none">
          <div className="text-xs text-emerald-300 font-bold mb-2 flex items-center justify-between">
            <span>🚀 35% Faster Table Turnover</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              +24% REVENUE
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/30 text-xs space-y-1.5 text-slate-200">
            <div className="flex justify-between">
              <span>Average Seating Time:</span>
              <span className="font-mono font-bold text-emerald-300">54m (vs 76m on paper)</span>
            </div>
            <div className="flex justify-between">
              <span>Extra Table Turns:</span>
              <span className="font-mono font-bold text-amber-300">+2 seatings / table</span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10">Zero bottleneck • Happy smiling diners • Higher tip volume</div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Interactive Live Timer Simulator Widget for Website Visitors
function InteractiveLiveTimerSimulator() {
  const [simulatedSeconds, setSimulatedSeconds] = useState<number>(868); // 14:28
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeStage, setActiveStage] = useState<'cooking' | 'ready'>('cooking');

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimulatedSeconds(prev => {
        if (prev <= 1) {
          setActiveStage('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFastForward = () => {
    setSimulatedSeconds(5);
    setActiveStage('cooking');
    setIsPlaying(true);
  };

  const handleReset = () => {
    setSimulatedSeconds(868);
    setActiveStage('cooking');
    setIsPlaying(true);
  };

  return (
    <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#17221d] via-[#121a16] to-[#0c120f] border-2 border-[#e8783c]/50 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#e8783c]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Information Column */}
        <div className="max-w-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8783c]/15 border border-[#e8783c]/30 text-amber-300 text-xs font-mono font-bold uppercase mb-3">
            <Smartphone size={14} className="text-[#e8783c]" />
            <span>Interactive Live Demo</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white font-serif leading-tight">
            Test-Drive the Live Customer Cooking Timer
          </h3>

          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            This is the exact screen your diners see on their mobile phones when they place an order at Table 4. No more anxious waiting or repeatedly calling waiters — real-time second-by-second transparency.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/15 cursor-pointer"
            >
              <Play size={13} className={isPlaying ? 'text-amber-400' : 'text-slate-400'} />
              <span>{isPlaying ? 'Pause Simulator' : 'Resume Clock'}</span>
            </button>

            <button
              type="button"
              onClick={handleFastForward}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-colors border border-amber-500/40 cursor-pointer"
            >
              <Flame size={13} className="text-[#e8783c]" />
              <span>Fast-Forward to 00:05</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Phone Mockup with Live Animated Clock */}
        <div className="w-full max-w-[340px] rounded-3xl bg-[#090d0b] border-4 border-[#2b3a33] p-4 shadow-2xl shadow-black/80 relative">
          {/* Phone Top Notch / Speaker */}
          <div className="w-28 h-4 bg-[#151c19] rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-8 h-1 bg-white/20 rounded-full" />
          </div>

          <div className="rounded-2xl bg-gradient-to-b from-[#18231e] to-[#101714] border border-amber-500/30 p-4 text-center">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/10 pb-2 mb-3">
              <span className="text-amber-300 font-bold">The Royal Awadh</span>
              <span className="text-white font-bold">Table 4</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-300 mb-2">
              <Flame size={12} className="text-[#e8783c] animate-bounce" />
              <span>{activeStage === 'cooking' ? 'COOKING ON FLAME' : 'PLATED & READY TO SERVE'}</span>
            </div>

            {/* Big Countdown Number */}
            <div className="text-4xl font-black text-white font-mono tracking-tight my-2 drop-shadow-md">
              {formatTime(simulatedSeconds)}
            </div>

            <div className="text-[11px] text-slate-300">
              {activeStage === 'cooking' 
                ? 'Your dishes are in the tandoor. Arriving hot!'
                : '🎉 Dish is plated! Heading to Table 4 right now!'}
            </div>

            {/* Dynamic Progress Indicator */}
            <div className="w-full bg-black/50 h-2 rounded-full mt-3 overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#e8783c] to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, ((900 - simulatedSeconds) / 900) * 100))}%` }}
              />
            </div>

            {/* Order Items Summary */}
            <div className="mt-3 pt-3 border-t border-white/10 text-left text-xs space-y-1">
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>1x Mutton Galouti Kebab</span>
                <span className="text-emerald-400 font-mono">Cooking</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span>2x Garlic Butter Naan</span>
                <span className="text-emerald-400 font-mono">In Tandoor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiningStorytellingSection() {
  const [perspective, setPerspective] = useState<StoryPerspective>('customer');
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(0);

  const activeChapters = perspective === 'customer' ? customerChapters : restaurantChapters;
  const currentChapter = activeChapters[selectedChapterIndex] || activeChapters[0];

  const handlePerspectiveChange = (p: StoryPerspective) => {
    setPerspective(p);
    setSelectedChapterIndex(0);
  };

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#0e1412] text-white relative overflow-hidden border-t border-b border-white/10">
      {/* Background Subtle Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-[#0e1412] to-[#0a0f0d] pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#e8783c]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1240px] mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Sparkles size={13} className="text-[#e8783c]" />
            <span>The Dining Reality • Before & After MenusQR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-serif leading-tight">
            The Tale of Two Tables: <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              The Hidden Chaos vs Royal Majesty
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-300/80 leading-relaxed">
            Every evening, restaurants lose diners, patience, and profits to greasy paper menus, chaotic kitchen slips, and frantic hand-waving. Here is the true story of what happens before and after MenusQR touches your tables.
          </p>

          {/* Perspective Selector: Customer POV vs Restaurant POV */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl bg-[#17211d] border border-[#2a3832] shadow-xl">
            <button
              type="button"
              onClick={() => handlePerspectiveChange('customer')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                perspective === 'customer'
                  ? 'bg-[#e8783c] text-white shadow-lg shadow-[#e8783c]/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UtensilsCrossed size={16} />
              <span>The Diner's Perspective (Customer)</span>
            </button>
            <button
              type="button"
              onClick={() => handlePerspectiveChange('restaurant')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                perspective === 'restaurant'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat size={16} />
              <span>The Kitchen & Owner Perspective (Restaurant)</span>
            </button>
          </div>
        </div>

        {/* Story Chapters Navigation Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-10">
          {activeChapters.map((chapter, idx) => {
            const isSelected = idx === selectedChapterIndex;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => setSelectedChapterIndex(idx)}
                className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? perspective === 'customer'
                      ? 'bg-[#1b2520] border-[#e8783c] shadow-lg shadow-[#e8783c]/15 ring-1 ring-[#e8783c]/40'
                      : 'bg-[#1b2520] border-emerald-500 shadow-lg shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                    : 'bg-[#141b18]/70 border-[#24332d] hover:bg-[#18221e] text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400">
                  Chapter 0{idx + 1}
                </div>
                <div className={`text-xs sm:text-sm font-extrabold leading-snug ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {chapter.title}
                </div>
                <div className="text-[11px] text-slate-400">
                  {chapter.stageBadge.split('•')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Comparative Story Stage: Before vs After Side-by-Side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${perspective}-${selectedChapterIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch"
          >
            {/* Left Card: The Broken Reality (Without MenusQR) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-rose-950/20 via-[#161d1a] to-[#121815] border border-rose-500/30 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <XCircle size={18} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                      The Broken Reality (Without MenusQR)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-rose-300/80 font-bold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                    Old Paper Chaos
                  </span>
                </div>

                <div className="text-xs font-mono text-rose-300/70 font-bold mb-1">
                  {currentChapter.stageBadge}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-rose-100 font-serif leading-snug mb-3">
                  {currentChapter.before.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {currentChapter.before.description}
                </p>

                {/* Embedded Visual Graphic Simulation */}
                <ChapterVisualGraphic chapterId={currentChapter.id} isBefore={true} />
              </div>

              <div className="mt-8 pt-5 border-t border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs text-rose-300 font-bold">
                  <AlertTriangle size={14} className="shrink-0 text-rose-400" />
                  <span>{currentChapter.before.tag}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/30 border border-rose-500/20 text-xs text-slate-400 font-mono">
                  ⚠️ Reality: {currentChapter.before.visualDetail}
                </div>
              </div>
            </div>

            {/* Right Card: The Royal Renaissance (With MenusQR) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1b2621] via-[#151f1a] to-[#121916] border-2 border-[#e8783c] flex flex-col justify-between shadow-2xl relative overflow-hidden ring-1 ring-[#e8783c]/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-[#e8783c]/30 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-[#e8783c]/20 text-[#e8783c]">
                      <CheckCircle2 size={18} />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      The Royal Renaissance (With MenusQR)
                    </span>
                  </div>
                  {currentChapter.after.metric && (
                    <span className="text-xs font-black text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 shadow-sm animate-pulse">
                      {currentChapter.after.metric}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-amber-400/80 font-bold mb-1">
                  {currentChapter.stageBadge}
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white font-serif leading-snug mb-3">
                  {currentChapter.after.title}
                </h3>

                <p className="text-sm text-slate-200 leading-relaxed mb-6">
                  {currentChapter.after.description}
                </p>

                {/* Embedded Visual Graphic Simulation */}
                <ChapterVisualGraphic chapterId={currentChapter.id} isBefore={false} />
              </div>

              <div className="mt-8 pt-5 border-t border-[#e8783c]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <Sparkles size={14} className="shrink-0 text-amber-400" />
                  <span>{currentChapter.after.tag}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/30 text-xs text-emerald-200 font-mono flex items-center justify-between">
                  <span>✨ Experience: {currentChapter.after.visualDetail}</span>
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-2" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Interactive Live Timer Simulator Widget (Visible on Customer Perspective) */}
        {perspective === 'customer' && (
          <InteractiveLiveTimerSimulator />
        )}

        {/* Bottom Industry Proof & Metrics Bar */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-[#141c19] border border-[#2a3832] shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-400">
              The Measurable ROI of Royal Dining
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white mt-1">
              What Happens When Restaurants Switch to MenusQR
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-[#e8783c] font-mono">35%</div>
              <div className="text-xs font-bold text-white mt-1">Faster Table Turns</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Seats 2 more table seatings per dinner rush</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">+24%</div>
              <div className="text-xs font-bold text-white mt-1">Higher Average Check</div>
              <div className="text-[11px] text-slate-400 mt-0.5">1-click Round 2 naans, drinks & desserts</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">₹36,000+</div>
              <div className="text-xs font-bold text-white mt-1">Annual Reprint Savings</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Zero paper, laminate, or sticker costs forever</div>
            </div>

            <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
              <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">0</div>
              <div className="text-xs font-bold text-white mt-1">Kitchen Duplicate Errors</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Smart multi-round dish separation</div>
            </div>
          </div>

          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/purchase/details"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#e8783c] hover:bg-[#f08b55] text-white font-extrabold text-sm transition-all shadow-lg shadow-[#e8783c]/30 hover:scale-[1.02] active:scale-95"
            >
              <span>Transform Your Restaurant Tables</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10"
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

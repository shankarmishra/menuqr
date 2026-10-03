import { useState } from 'react';
import { Check, Palette, Eye, Save } from 'lucide-react';
import { updateSettings } from './appStore';

interface TemplateOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
  bg: string;
  text: string;
  accent: string;
  font: string;
  renderType: 'gold-stars' | 'yellow-brush' | 'wavy-badge' | 'bifold-wood' | 'larana-wave' | 'teal-starburst' | 'minimal-white' | 'street-food' | 'royal-crimson' | 'craving-grid';
}

const TEMPLATES: TemplateOption[] = [
  { id: 'gold-stars', name: '1. Golden Star Luxury', badge: 'Fine Dining', desc: 'Dark obsidian, gold stardust border, centered luxury layout', bg: '#0d0d0d', text: '#f5e6d0', accent: '#ffc928', font: 'serif', renderType: 'gold-stars' },
  { id: 'yellow-brush', name: '2. Yellow Brush Chalkboard', badge: 'Chalkboard', desc: 'Chalkboard texture, yellow brush badge, top dish photo', bg: '#1a1d20', text: '#ffffff', accent: '#ffc928', font: 'sans-serif', renderType: 'yellow-brush' },
  { id: 'wavy-badge', name: '3. Wavy Graphic Badges', badge: 'Poster Layout', desc: 'Yellow wavy header badges, section category division cards', bg: '#121418', text: '#ffffff', accent: '#ffc928', font: 'sans-serif', renderType: 'wavy-badge' },
  { id: 'bifold-wood', name: '4. Bifold Wood Master', badge: 'Grill & Bar', desc: 'Dark wood texture, yellow paint headers, food dish thumbnails', bg: '#161412', text: '#f8fafc', accent: '#e8783c', font: 'sans-serif', renderType: 'bifold-wood' },
  { id: 'larana-wave', name: '5. Larana Wave Bistro', badge: 'Modern Bistro', desc: 'Top wave graphic, clean 2-column text list, bottom photo gallery', bg: '#151b1e', text: '#ffffff', accent: '#e8783c', font: 'sans-serif', renderType: 'larana-wave' },
  { id: 'teal-starburst', name: '6. Teal Card & Starburst', badge: 'Best Seller', desc: 'Deep teal slate backdrop, rounded cards, starburst badge', bg: '#0a1d24', text: '#e2f1f8', accent: '#ffc928', font: 'sans-serif', renderType: 'teal-starburst' },
  { id: 'minimal-white', name: '7. Minimalist Linen', badge: 'Minimal White', desc: 'Crisp white background, hairline dividers, elegant serif typography', bg: '#ffffff', text: '#111827', accent: '#e8783c', font: 'serif', renderType: 'minimal-white' },
  { id: 'street-food', name: '8. Vibrant Street Food', badge: 'Cafe & QSR', desc: 'Vibrant orange pills, Veg/Non-Veg badge indicators', bg: '#faf8f4', text: '#111827', accent: '#e8783c', font: 'sans-serif', renderType: 'street-food' },
  { id: 'royal-crimson', name: '9. Royal Indian Spice', badge: 'Indian Cuisine', desc: 'Deep crimson & gold border framing, intricate Indian dish cards', bg: '#1c0f0a', text: '#fde8d0', accent: '#ffc928', font: 'serif', renderType: 'royal-crimson' },
  { id: 'craving-grid', name: '10. Image Craving Grid', badge: 'Photo Focused', desc: 'Large food photography cards with floating price overlays', bg: '#0f172a', text: '#f8fafc', accent: '#38bdf8', font: 'sans-serif', renderType: 'craving-grid' },
];

export default function Appearance() {
  const [selectedTemplateId, setSelectedTemplateId] = useState('gold-stars');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const sampleDishes = [
    { name: 'Smoked Salmon Tartare', price: '₹420', desc: 'Avocado & goat cheese', veg: false, emoji: '🥩' },
    { name: 'Grilled Filet Mignon', price: '₹780', desc: 'Red wine reduction', veg: false, emoji: '🍖' },
    { name: 'Wild Mushroom Risotto', price: '₹520', desc: 'Truffle oil & parmesan', veg: true, emoji: '🍄' },
    { name: 'Chocolate Fondant', price: '₹340', desc: 'Vanilla bean ice cream', veg: true, emoji: '🍫' },
  ];

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await updateSettings({ activeTemplate: selectedTemplateId });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#e8783c]" /> Menu Templates & Appearance
          </h1>
          <p className="text-[#9ca3af] text-sm mt-1">
            Choose from 10 distinct template layouts. Switching templates updates your mobile customer menu instantly without changing your permanent QR code.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#e8783c] hover:bg-[#d96227] text-white font-semibold px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save & Apply Template'}
        </button>
      </div>

      {/* Main Grid: Left Templates list, Right Phone Previewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 10 Templates Selector Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
            Select Menu Template (10 Options)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => {
              const isSelected = t.id === selectedTemplateId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#e8783c] bg-[#e8783c]/10 shadow-md ring-1 ring-[#e8783c]'
                      : 'border-[#2a3832] bg-[#1d2723] hover:border-[#e8783c]/50 hover:translate-y-[-2px]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#e8783c]/20 text-[#e8783c]">
                        {t.badge}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#e8783c]" />}
                    </div>
                    <h3 className="font-bold text-white text-sm">{t.name}</h3>
                    <p className="text-xs text-[#9ca3af] mt-1">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Phone Live Preview Frame */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#e8783c]" /> Live Template Preview
          </div>
          
          <div
            className="w-[280px] h-[540px] rounded-[40px] border-4 border-[#3c3e42] shadow-2xl overflow-hidden relative flex flex-col"
            style={{ background: selectedTemplate.bg, color: selectedTemplate.text, fontFamily: selectedTemplate.font === 'serif' ? 'Georgia, serif' : 'system-ui' }}
          >
            {/* Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-end pr-2">
              <div className="w-2 h-2 rounded-full bg-[#111]" />
            </div>

            {/* Screen Content */}
            <div className="p-4 pt-10 flex-1 flex flex-col">
              {/* Golden Star Luxury */}
              {selectedTemplate.renderType === 'gold-stars' && (
                <div className="text-center flex-1 flex flex-col gap-3 uppercase">
                  <div className="text-[10px] tracking-widest text-[#ffc928]">✦ MENU ✦</div>
                  <div className="text-xs font-bold tracking-wider">YOUR RESTAURANT</div>
                  {['STARTER', 'MAIN COURSE', 'DESSERT'].map((cat) => (
                    <div key={cat} className="border-b border-[#ffc928]/30 pb-2">
                      <div className="text-[9px] font-bold text-[#ffc928] tracking-wider">{cat}</div>
                      {sampleDishes.slice(0, 1).map((d) => (
                        <div key={d.name} className="mt-1">
                          <div className="text-[10px] font-semibold">{d.name}</div>
                          <div className="text-[9px] text-[#ffc928]">{d.price}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Yellow Brush Chalkboard */}
              {selectedTemplate.renderType === 'yellow-brush' && (
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="bg-[#ffc928] text-black font-extrabold text-xs uppercase p-1.5 rounded text-center">
                    FOOD MENU
                  </div>
                  {sampleDishes.map((d) => (
                    <div key={d.name} className="flex justify-between text-[10px] border-b border-white/20 pb-1">
                      <span>{d.name}</span>
                      <span className="text-[#ffc928] font-bold">{d.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Minimalist White */}
              {selectedTemplate.renderType === 'minimal-white' && (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="text-center border-b border-black/20 pb-2">
                    <div className="text-xs font-bold text-[#111827]">RESTAURANT MENU</div>
                  </div>
                  {sampleDishes.map((d) => (
                    <div key={d.name} className="flex justify-between text-[10px] border-b border-gray-200 pb-1">
                      <div>
                        <div className="font-semibold text-[#111827]">{d.name}</div>
                        <div className="text-[8px] text-gray-500">{d.desc}</div>
                      </div>
                      <span className="font-bold text-[#111827]">{d.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Generic Fallback Render for rest */}
              {!['gold-stars', 'yellow-brush', 'minimal-white'].includes(selectedTemplate.renderType) && (
                <div className="flex-1 flex flex-col gap-2.5">
                  <div className="text-center font-bold text-xs uppercase pb-2 border-b border-current opacity-80">
                    {selectedTemplate.name.replace(/^\d+\.\s*/, '')}
                  </div>
                  {sampleDishes.map((d) => (
                    <div key={d.name} className="p-2 rounded bg-white/10 flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-bold">{d.name}</div>
                        <div className="text-[8px] opacity-70">{d.desc}</div>
                      </div>
                      <span className="font-bold" style={{ color: selectedTemplate.accent }}>{d.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

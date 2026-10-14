import { useState, useRef } from 'react';
import { Copy, ExternalLink, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { STICKER_TEMPLATES } from './StickerTemplates';
import RoyalWalnutStickerCard, { type StickerThemeId } from './RoyalWalnutStickerCard';

interface ClientProps {
  id: string;
  businessName: string;
  category: string;
  menuSlug: string;
  tagline?: string;
  logo?: string;
}

interface Props {
  client?: ClientProps | null;
  menuUrl: string;
  qrImage: string;
}

export default function MenusQRStickerGenerator({ client, menuUrl, qrImage }: Props) {
  const [templateId, setTemplateId] = useState<StickerThemeId>('menusqr-walnut-gold');
  const [copied, setCopied] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);
  
  const template = STICKER_TEMPLATES.find((t) => t.id === templateId) || STICKER_TEMPLATES[0];

  const restaurantName = client?.businessName || 'shankar hotel';
  const category = client?.category || 'RESTAURANT & CAFE';
  const tagline = client?.tagline || 'Digital Menu';

  const downloadStickerPNG = async () => {
    if (!stickerRef.current) return;
    try {
      const dataUrl = await toPng(stickerRef.current, { cacheBust: true, quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `${client?.menuSlug || 'menu'}-sticker.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download sticker PNG:', err);
    }
  };

  const copyMenuLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full bg-[#0d1210] p-4 sm:p-8 text-white font-sans rounded-2xl border border-white/10 shadow-2xl">
      
      {/* Theme Switcher Tabs */}
      <div className="w-full max-w-xl mb-6 flex flex-col items-center gap-2">
        <div className="flex items-center justify-between w-full text-xs text-[#aab7b2]">
          <span className="font-semibold uppercase tracking-wider">Select Sticker Theme</span>
          <span className="text-[#2ec4b6] flex items-center gap-1"><CheckCircle2 size={13}/> Instant Render</span>
        </div>
        <div className="flex gap-2.5 w-full overflow-x-auto pb-1 scrollbar-hide">
          {STICKER_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id as StickerThemeId)}
              className="shrink-0 rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer"
              style={{ 
                borderColor: templateId === t.id ? t.accentColor : 'rgba(255,255,255,0.1)',
                backgroundColor: templateId === t.id ? `${t.accentColor}25` : 'rgba(255,255,255,0.04)',
                color: templateId === t.id ? t.accentColor : '#94a39d'
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- INSTANT ARTWORK DISPLAY STAGE --- */}
      <div className="relative flex justify-center w-full py-2">
        <RoyalWalnutStickerCard
          stickerRef={stickerRef}
          themeId={templateId}
          restaurantName={restaurantName}
          category={category}
          tagline={tagline}
          menuUrl={menuUrl}
          qrImage={qrImage}
          showStatusBadge={true}
          showDownloadButtons={false}
        />
      </div>

      {/* --- QUICK ACTION BUTTONS BAR --- */}
      <div className="w-full max-w-xl mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <button
            type="button"
            onClick={() => void downloadStickerPNG()}
            className="flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-extrabold text-[#0a2e1f] transition-all hover:brightness-110 cursor-pointer shadow-lg"
            style={{ backgroundColor: template.accentColor }}
          >
            <ImageIcon size={16} /> Download PNG
          </button>
          
          <button
            type="button"
            onClick={() => void copyMenuLink()}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 px-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10 cursor-pointer"
          >
            <Copy size={16} /> {copied ? 'Link Copied!' : 'Copy Link'}
          </button>
          
          {menuUrl && (
            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 px-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <ExternalLink size={16} /> Open Menu
            </a>
          )}
        </div>
      </div>

    </div>
  );
}

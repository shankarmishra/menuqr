import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, Smartphone, Layers } from 'lucide-react';
import { DEMO_RESTAURANT, isTemplateDark } from '../../data/menuTemplates';
import type { MenuTemplate } from '../../data/menuTemplates';
import MenuTemplateRenderer from './MenuTemplateRenderer';
import PremiumIPhoneMockup from '../marketing/PremiumIPhoneMockup';
import IsolatedMobileFrame from './IsolatedMobileFrame';

interface TemplatePreviewModalProps {
  template: MenuTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  isCurrentTemplate: boolean;
  clientRestaurantData?: {
    name: string;
    tagline?: string;
    cuisine?: string;
    categories: Array<{ id: string; name: string; order: number }>;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      category: string;
      dietType: 'veg' | 'non-veg';
      available: boolean;
      image?: string;
    }>;
  };
}

export default function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onSelect,
  isCurrentTemplate,
  clientRestaurantData,
}: TemplatePreviewModalProps) {
  if (!isOpen || !template) return null;

  const restaurantToUse = clientRestaurantData || DEMO_RESTAURANT;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#1D2723] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#151C19]">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-[#E8783C]/10 border border-[#E8783C]/30 text-[#E8783C] text-xs font-bold uppercase tracking-wider">
                {template.categories[0] || 'Design'}
              </span>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{template.name}</h3>
                <p className="text-xs text-[#8A9AAC]">{template.description}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#8A9AAC] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Side-by-Side Details & Preview */}
          <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-12 gap-8 items-start">
            {/* Left Col: Features & Specs */}
            <div className="md:col-span-5 space-y-6">
              <div className="bg-[#151C19] rounded-2xl p-5 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={14} className="text-[#D4AF37]" /> Design Architectural Features
                </h4>

                <div className="space-y-3 text-xs text-[#8A9AAC]">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Layout Architecture</span>
                    <span className="font-semibold text-white capitalize">{template.layout.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Header Treatment</span>
                    <span className="font-semibold text-white capitalize">{template.layout.headerStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Item Card Style</span>
                    <span className="font-semibold text-white capitalize">{template.layout.itemStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Category Badges</span>
                    <span className="font-semibold text-white capitalize">{template.layout.categoryStyle}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Typography Theme</span>
                    <span className="font-semibold text-white capitalize">{template.typography.style}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#151C19] rounded-2xl p-5 border border-white/5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
                  <Smartphone size={14} className="text-[#34B56A]" /> Instant Personalization
                </h4>
                <p className="text-xs text-[#8A9AAC] leading-relaxed">
                  Selecting this template will immediately populate your restaurant name, categories, dishes, prices, and branding. Zero manual redesign needed.
                </p>
              </div>

              <div className="pt-2">
                {isCurrentTemplate ? (
                  <div className="w-full py-3.5 rounded-xl bg-[#34B56A]/10 border border-[#34B56A]/30 text-[#34B56A] font-bold text-center text-sm flex items-center justify-center gap-2">
                    <Check size={16} /> Currently Active Template
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSelect(template.id);
                      onClose();
                    }}
                    className="w-full py-4 rounded-xl bg-[#E8783C] hover:bg-[#f18b50] text-white font-bold text-sm transition-all shadow-lg shadow-[#E8783C]/20 flex items-center justify-center gap-2"
                  >
                    <Layers size={16} /> Use This Template
                  </button>
                )}
              </div>
            </div>

            {/* Right Col: High Res Phone Frame Preview */}
            <div className="md:col-span-7 flex justify-center py-2">
              <PremiumIPhoneMockup
                className="!w-[330px] sm:!w-[360px] max-w-full shadow-2xl"
                badgeText="Interactive Preview"
                statusBarTheme={isTemplateDark(template) ? 'light' : 'dark'}
                homeIndicatorTheme={isTemplateDark(template) ? 'light' : 'dark'}
                screenStyle={{ backgroundColor: template.colors.bg }}
                screenClassName=""
              >
                <IsolatedMobileFrame backgroundColor={template.colors.bg}>
                  <div className="h-full w-full overflow-y-auto">
                    <MenuTemplateRenderer
                      templateId={template.id}
                      restaurant={{
                        name: restaurantToUse.name,
                        tagline: restaurantToUse.tagline,
                        cuisine: restaurantToUse.cuisine,
                      }}
                      categories={restaurantToUse.categories}
                      items={restaurantToUse.items as any}
                      compact={false}
                    />
                  </div>
                </IsolatedMobileFrame>
              </PremiumIPhoneMockup>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}





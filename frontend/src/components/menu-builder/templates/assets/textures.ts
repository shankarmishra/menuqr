// High-visibility material textures (3% - 8% opacity) for all 15 MenusQR signature templates

export const TEMPLATE_TEXTURES = {
  // 01. Royal Maharaja: Crimson/Midnight Velvet & Brass Filigree
  royalMaharaja: {
    bg: `bg-[#180912]`,
    gradient: `bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-[#2D1022] via-[#180912] to-[#0A0307]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.07' fill-rule='evenodd'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z M30 12L48 30L30 48L12 30Z'/%3E%3C/g%3E%3C/svg%3E")`,
    textColor: `text-[#FAF3E0]`,
    accentColor: `#D4AF37`,
  },

  // 02. Rajasthani Heritage: Sandstone Parchment & Botanical Lace
  rajasthaniHeritage: {
    bg: `bg-[#F7EBD7]`,
    gradient: `bg-gradient-to-b from-[#FCF5E9] via-[#F7EBD7] to-[#EAD7B8]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='24' viewBox='0 0 40 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24 C0 12, 10 0, 20 0 C30 0, 40 12, 40 24' fill='none' stroke='%23D4AE68' stroke-opacity='0.08' stroke-width='1'/%3E%3Ccircle cx='20' cy='3' r='1' fill='%23D76C3C' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    textColor: `text-[#35463E]`,
    accentColor: `#D76C3C`,
  },

  // 03. Mughal Luxe: Emerald Velvet Marble & Gold Ogee Arch Lattice
  mughalLuxe: {
    bg: `bg-[#073D34]`,
    gradient: `bg-gradient-to-b from-[#064F43] via-[#073D34] to-[#052C25]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 Q60 30 30 60 Q0 30 30 0 Z' fill='none' stroke='%23D7B66D' stroke-opacity='0.08' stroke-width='1.5'/%3E%3C/svg%3E")`,
    textColor: `text-[#F6EAD1]`,
    accentColor: `#D7B66D`,
  },

  // 04. Banarasi Gold: Deep Crimson Woven Silk Brocade Lattice
  banarasiGold: {
    bg: `bg-[#1A0A18]`,
    gradient: `bg-gradient-to-b from-[#2F112B] via-[#1A0A18] to-[#0E050D]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 L20 0 L40 20 L20 40 Z M10 20 L20 10 L30 20 L20 30 Z' fill='%23F3E5AB' fill-opacity='0.07'/%3E%3C/svg%3E")`,
    textColor: `text-[#F3E5AB]`,
    accentColor: `#F3E5AB`,
  },

  // 05. South Indian Heritage: Banana Leaf Green & Bronze Kolam Pattern
  southIndianHeritage: {
    bg: `bg-[#0E1A13]`,
    gradient: `bg-gradient-to-b from-[#172A1F] via-[#0E1A13] to-[#080F0B]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='25' cy='25' r='16' fill='none' stroke='%23E2C044' stroke-opacity='0.06' stroke-width='1.5'/%3E%3Cpath d='M25 0 L25 50 M0 25 L50 25' stroke='%23E2C044' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")`,
    textColor: `text-[#E2C044]`,
    accentColor: `#E2C044`,
  },

  // 06. Indian Street Kitchen: Chalkboard & Halftone Print Texture
  indianStreetKitchen: {
    bg: `bg-[#18181A]`,
    gradient: `bg-gradient-to-b from-[#252528] via-[#18181A] to-[#0F0F10]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23FFFFFF' fill-opacity='0.06'/%3E%3Ccircle cx='15' cy='15' r='1.5' fill='%23FACC15' fill-opacity='0.05'/%3E%3C/svg%3E")`,
    textColor: `text-white`,
    accentColor: `#FACC15`,
  },

  // 07. Modern India: Saffron Minimalist Fine Paper Grain
  modernIndia: {
    bg: `bg-[#FAF7F0]`,
    gradient: `bg-gradient-to-b from-[#FFFDF7] via-[#FAF7F0] to-[#F3EEE3]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 h60 v60 h-60 z' fill='none' stroke='%23D97706' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")`,
    textColor: `text-[#2D241E]`,
    accentColor: `#D97706`,
  },

  // 08. Spice House: Earthy Cinnamon & Cardamom Clay
  spiceHouse: {
    bg: `bg-[#1E1512]`,
    gradient: `bg-gradient-to-b from-[#2C1F1B] via-[#1E1512] to-[#120B09]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 0 L48 24 L24 48 L0 24 Z' fill='%23E07A5F' fill-opacity='0.06'/%3E%3C/svg%3E")`,
    textColor: `text-[#F5EBE6]`,
    accentColor: `#E07A5F`,
  },

  // 09. Maison Noir: Dark Charcoal Fine Dining Paper
  maisonNoir: {
    bg: `bg-[#0C0C0D]`,
    gradient: `bg-gradient-to-b from-[#171719] via-[#0C0C0D] to-[#050506]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='1' fill='%23C5A059' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    textColor: `text-[#E0E0E0]`,
    accentColor: `#C5A059`,
  },

  // 10. Ivory Dining: Parchment Paper & Gold Linework
  ivoryDining: {
    bg: `bg-[#FDFBF5]`,
    gradient: `bg-gradient-to-b from-[#FFFDF8] via-[#FDFBF5] to-[#F5F0E4]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q30 0 60 30 Q30 60 0 30 Z' fill='none' stroke='%23C5A059' stroke-opacity='0.06' stroke-width='1.5'/%3E%3C/svg%3E")`,
    textColor: `text-[#2C2523]`,
    accentColor: `#C5A059`,
  },

  // 11. Grand Table: Classic Navy Leather & Antique Brass
  grandTable: {
    bg: `bg-[#0B121C]`,
    gradient: `bg-gradient-to-b from-[#142030] via-[#0B121C] to-[#05080E]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 h50 v50 h-50 z' fill='none' stroke='%23C8A962' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")`,
    textColor: `text-[#E2E8F0]`,
    accentColor: `#C8A962`,
  },

  // 12. Coffee House: Espresso Craft Paper Grain
  coffeeHouse: {
    bg: `bg-[#1B1411]`,
    gradient: `bg-gradient-to-b from-[#2A1E1A] via-[#1B1411] to-[#100A08]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='16' cy='16' r='1.5' fill='%23D4A373' fill-opacity='0.07'/%3E%3C/svg%3E")`,
    textColor: `text-[#F5EBE6]`,
    accentColor: `#D4A373`,
  },

  // 13. Paper Cafe: Recycled Kraft Paper & Typewriter Ink Texture
  paperCafe: {
    bg: `bg-[#F3E9DD]`,
    gradient: `bg-gradient-to-b from-[#FAF4EC] via-[#F3E9DD] to-[#E9DAC9]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 h40 v40 h-40 z' fill='none' stroke='%238C6D53' stroke-opacity='0.07' stroke-width='1'/%3E%3C/svg%3E")`,
    textColor: `text-[#3A2E2B]`,
    accentColor: `#8C6D53`,
  },

  // 14. Bombay Street: Urban Halftone & Poster Yellow Accent
  bombayStreet: {
    bg: `bg-[#161616]`,
    gradient: `bg-gradient-to-b from-[#252525] via-[#161616] to-[#0A0A0A]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23EAB308' fill-opacity='0.08'/%3E%3C/svg%3E")`,
    textColor: `text-white`,
    accentColor: `#EAB308`,
  },

  // 15. Minimal Editorial: Swiss Fine Offset Paper Grain
  minimalEditorial: {
    bg: `bg-[#F9F9F9]`,
    gradient: `bg-gradient-to-b from-[#FFFFFF] via-[#F9F9F9] to-[#EFEFEF]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 h60 v60 h-60 z' fill='none' stroke='%23000000' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")`,
    textColor: `text-black`,
    accentColor: `#000000`,
  }
};

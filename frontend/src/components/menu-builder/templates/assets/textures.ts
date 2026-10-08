// Template-specific CSS/SVG texture patterns and decorative SVG elements

export const TEMPLATE_TEXTURES = {
  // 01. Royal Maharaja: Velvet texture & brass arch motif
  royalMaharaja: {
    bg: `bg-[#1A0B13]`,
    gradient: `bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2A111F] via-[#1A0B13] to-[#0D0509]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20Z' fill='%23D4AF37' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
    borderGold: `border-[#D4AF37]/30`,
  },

  // 02. Rajasthani Heritage: Sandstone texture & terracotta block-print linework
  rajasthaniHeritage: {
    bg: `bg-[#FDFBF7]`,
    gradient: `bg-gradient-to-b from-[#F5EBE6] via-[#FDFBF7] to-[#F2E3DB]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z M30 10 L50 30 L30 50 L10 30 Z' fill='%23C85A32' fill-opacity='0.03'/%3E%3C/svg%3E")`,
    terracottaBorder: `border-[#C85A32]/40`,
  },

  // 03. Mughal Luxe: Emerald velvet & gold geometric arches
  mughalLuxe: {
    bg: `bg-[#0B1A15]`,
    gradient: `bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#112921] via-[#0B1A15] to-[#050D0A]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0 Q50 25 25 50 Q0 25 25 0 Z' fill='%23E5C158' fill-opacity='0.02'/%3E%3C/svg%3E")`,
    emeraldGold: `border-[#E5C158]/35`,
  },

  // 04. Banarasi Gold: Woven silk lattice texture
  banarasiGold: {
    bg: `bg-[#190C1E]`,
    gradient: `bg-gradient-to-b from-[#2B1533] via-[#190C1E] to-[#100714]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 L15 0 L30 15 L15 30 Z' fill='none' stroke='%23F3E5AB' stroke-opacity='0.05' stroke-width='1'/%3E%3C/svg%3E")`,
    silkBorder: `border-[#F3E5AB]/40`,
  },

  // 05. South Indian Heritage: Banana leaf green & kolam line art
  southIndianHeritage: {
    bg: `bg-[#0F1E16]`,
    gradient: `bg-gradient-to-b from-[#182B21] via-[#0F1E16] to-[#0A140F]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='12' fill='none' stroke='%23E2C044' stroke-opacity='0.04' stroke-width='1'/%3E%3Cpath d='M20 0 L20 40 M0 20 L40 20' stroke='%23E2C044' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")`,
    bronzeBorder: `border-[#E2C044]/35`,
  },

  // 06. Indian Street Kitchen: Chalkboard & craft paper
  indianStreetKitchen: {
    bg: `bg-[#18181B]`,
    gradient: `bg-gradient-to-b from-[#242427] via-[#18181B] to-[#0F0F11]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23FFFFFF' fill-opacity='0.03'/%3E%3C/svg%3E")`,
    yellowBorder: `border-[#FACC15]`,
  },

  // 07. Modern India: Saffron minimalist paper
  modernIndia: {
    bg: `bg-[#FAF7F2]`,
    gradient: `bg-gradient-to-b from-[#FFFDF9] via-[#FAF7F2] to-[#F5EFE6]`,
    overlayPattern: `none`,
    saffronBorder: `border-[#D97706]/20`,
  },

  // 08. Spice House: Earthy cardamom & cinnamon clay
  spiceHouse: {
    bg: `bg-[#1F1714]`,
    gradient: `bg-gradient-to-b from-[#2C211D] via-[#1F1714] to-[#140F0D]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 0 L36 18 L18 36 L0 18 Z' fill='%23E07A5F' fill-opacity='0.02'/%3E%3C/svg%3E")`,
    terracottaBorder: `border-[#E07A5F]/30`,
  },

  // 09. Maison Noir: Luxury dark charcoal fine-dining
  maisonNoir: {
    bg: `bg-[#0D0D0E]`,
    gradient: `bg-gradient-to-b from-[#161618] via-[#0D0D0E] to-[#070708]`,
    overlayPattern: `none`,
    luxeBorder: `border-[#C5A059]/40`,
  },

  // 10. Ivory Dining: Alabaster paper & gold foil
  ivoryDining: {
    bg: `bg-[#FDFBF7]`,
    gradient: `bg-gradient-to-b from-[#FFFDF9] via-[#FDFBF7] to-[#F4EFE6]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q30 0 60 30 Q30 60 0 30 Z' fill='none' stroke='%23C5A059' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")`,
    goldBorder: `border-[#C5A059]/30`,
  },

  // 11. Grand Table: Classic brass rules & navy backdrop
  grandTable: {
    bg: `bg-[#0C131D]`,
    gradient: `bg-gradient-to-b from-[#141F2E] via-[#0C131D] to-[#06090F]`,
    overlayPattern: `none`,
    navyBrass: `border-[#C8A962]/40`,
  },

  // 12. Coffee House: Espresso paper texture
  coffeeHouse: {
    bg: `bg-[#1C1613]`,
    gradient: `bg-gradient-to-b from-[#2A211D] via-[#1C1613] to-[#120E0C]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23D4A373' fill-opacity='0.04'/%3E%3C/svg%3E")`,
    amberBorder: `border-[#D4A373]/30`,
  },

  // 13. Paper Cafe: Craft paper grain
  paperCafe: {
    bg: `bg-[#F4EBE1]`,
    gradient: `bg-gradient-to-b from-[#FBF6F0] via-[#F4EBE1] to-[#ECE1D3]`,
    overlayPattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 h40 v40 h-40 z' fill='none' stroke='%238C6D53' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")`,
    craftBorder: `border-[#8C6D53]/30`,
  },

  // 14. Bombay Street: Urban poster yellow accent & grain
  bombayStreet: {
    bg: `bg-[#171717]`,
    gradient: `bg-gradient-to-b from-[#262626] via-[#171717] to-[#0A0A0A]`,
    overlayPattern: `none`,
    urbanYellow: `border-[#EAB308]`,
  },

  // 15. Minimal Editorial: Swiss white & strict monochrome grid
  minimalEditorial: {
    bg: `bg-[#FAFAFA]`,
    gradient: `bg-gradient-to-b from-[#FFFFFF] via-[#FAFAFA] to-[#F0F0F0]`,
    overlayPattern: `none`,
    swissBorder: `border-black/15`,
  }
};

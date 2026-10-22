# Mannat Tandoori Junction — Visual & Interactive Regression Report (Phase 7)

> **Audit Date:** 2026-10-23  
> **Target Production Slugs:** `/menu/shankar-dhaba` & `/menu/mannat-tandoori-junction`  
> **Source Document:** `Art Board 3.pdf` (17 Pages; Page 17 strictly excluded)  
> **Test Harness:** Playwright automated multi-viewport regression suite (`scripts/verify_phase7_regression.cjs`)

---

## 1. Executive Summary & Verification Matrix

| Objective / Requirement | Target Standard | Verified Result | Status |
| :--- | :--- | :--- | :--- |
| **Page 17 Exclusion** | Completely exclude Instagram QR code & promotional poster | Removed from DOM, physical files deleted, 0 references | **PASS** |
| **Real QR Integrity** | Preserve MENUQR table QRs, slugs & ordering routes | `/menu/shankar-dhaba` & `/menu/mannat-tandoori-junction` active | **PASS** |
| **12 Authentic Chapters** | Mirror Page 3 Table of Contents (Pages 4–16) | 12 chapters with single authentic banner per chapter | **PASS** |
| **Page-Specific Atmospheres** | No single global background; chapter-specific themes | 10 distinct chapter styles in `HeritageArtboard.css` | **PASS** |
| **Pure Asset Extraction** | Deterministic crops from 1240x1754 with 0% text leak | 35+ pure food crops, 12 banners; no text tables/prices | **PASS** |
| **Interactive Portion Ordering**| Half / Full portions with direct `+ ADD` actions | `HALF: ₹149 +`, `FULL: ₹239 +`, single items `ADD +` | **PASS** |
| **Momo 3-Tier Matrix** | 3 preparation columns (Veg, Paneer, Corn N Cheese) | Color-coded matrix table with earthen platter below | **PASS** |
| **Cart & Ordering Integration** | Add to cart updates count, total and floating bar | Floating bar appears with `🛒 1 item • ₹149 • View Cart` | **PASS** |
| **Build & Typecheck** | Zero TypeScript errors, clean bundle & prerender | `npm --prefix frontend run build` exited with code 0 | **PASS** |

---

## 2. Page 17 Critical Exclusion Audit

- **Investigation:**
  - The previous code had embedded `footer_mascot.webp` (Page 17 promotional poster with Instagram QR and `@mannat_tandoori_junction` social handle) as a trailing footer card in `HeritageArtboardComposition.tsx`.
- **Remediation:**
  - Deleted lines 825–838 in `HeritageArtboardComposition.tsx`.
  - Deleted `footer_mascot.png` and `footer_mascot.webp` from all directories (`frontend/public`, `frontend/dist`, and `backend`).
  - Replaced the promotional poster with an elegant, non-intrusive brand signoff using typography and the authentic Page 1 circular mascot crop.
  - Zero empty sections, trailing whitespace, or promotional banners remain at the end of the menu.
- **Evidence Screenshot:** [`qa-screenshots/mannat/phase7_04_mobile_desserts_footer.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_04_mobile_desserts_footer.png)

---

## 3. Chapter-Specific Visual Themes (Mirroring the PDF)

Rather than rendering all chapters in identical generic white boxes, each chapter now uses its genuine source-inspired color palette and decorative borders:

1. **MTJ Tandoori Snacks & Kebabs (Pages 4 & 5):**  
   - Class: `.chapter-theme-tandoori`  
   - Palette: Royal Crimson (`#9E0D24`, `#CE182C`) with Imperial Gold (`#FAB700`) double border and corner florets.
2. **MTJ Crunch House, Soups & Salads (Page 6):**  
   - Class: `.chapter-theme-crunch`  
   - Palette: Golden Sand (`#D97706`) and Herbal Emerald (`#10B981`) accents.
3. **MTJ Signature Gravies & Breads (Pages 7 & 8):**  
   - Class: `.chapter-theme-gravies`  
   - Palette: Shahi Saffron (`#B45309`) and Terracotta Rust (`#9A3412`) warmth.
4. **MTJ Thalis & Street Food (Page 9):**  
   - Class: `.chapter-theme-thalis`  
   - Palette: Royal Dhaba Antique Olive (`#3A4035`) and Marigold Gold.
5. **MTJ Momo Junction (Page 10):**  
   - Class: `.chapter-theme-momos`  
   - Palette: Himalayan Forest Green (`#1B3B2B`) with Tibetan wave vector header and color-coded variant cells.
6. **MTJ Indo-Chinese Wok (Page 11):**  
   - Class: `.chapter-theme-chinese`  
   - Palette: Deep Lacquer Red (`#881337`) with golden wok styling.
7. **MTJ Café Quick Bites & Lebanese (Page 12):**  
   - Class: `.chapter-theme-cafe`  
   - Palette: Artisanal Deli Cream & Warm Mustard Ochre (`#FFFBEB`, `#D97706`).
8. **Stone Baked Pizzas & Burgers (Pages 13 & 14):**  
   - Class: `.chapter-theme-pizzas`  
   - Palette: Italian Stone Oven Terracotta (`#B91C1C`).
9. **Brews, Thick Shakes & Coolers (Page 15):**  
   - Class: `.chapter-theme-brews`  
   - Palette: Roasted Espresso Mocha (`#451A03`) and Frosted Mint (`#065F46`).
10. **MTJ Sweet Treats & Desserts (Page 16):**  
    - Class: `.chapter-theme-desserts`  
    - Palette: Midnight Truffle Slate (`#0F172A`) with Royal Gold Sizzler trim.

---

## 4. Verified Screenshot Gallery

| Test Case | Viewport | Target Elements Verified | Artifact Path |
| :--- | :--- | :--- | :--- |
| **Top Masthead & Tandoori** | Mobile `393 x 852` | Chef logo, search bar, chapter pills, Malai Chaap portion buttons | [`qa-screenshots/mannat/phase7_01_mobile_masthead_tandoori.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_01_mobile_masthead_tandoori.png) |
| **Momo Junction 3-Tier Matrix** | Mobile `393 x 852` | Tibetan wave header, Veg/Paneer/Cheese table, earthen momo platter | [`qa-screenshots/mannat/phase7_02_mobile_momo_junction.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_02_mobile_momo_junction.png) |
| **Pizzas, Brioche Burger & Garlic Bread** | Mobile `393 x 852` | Thin crust pizza, pure burger photo (0% text leak), garlic bread | [`qa-screenshots/mannat/phase7_03_mobile_pizzas_burgers.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_03_mobile_pizzas_burgers.png) |
| **Desserts & Excluded Page 17** | Mobile `393 x 852` | Hot brownie sizzler card, zero Instagram poster, clean brand signoff | [`qa-screenshots/mannat/phase7_04_mobile_desserts_footer.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_04_mobile_desserts_footer.png) |
| **Interactive Cart Bar** | Mobile `393 x 852` | Floating cart bar popup with item count and subtotal on portion click | [`qa-screenshots/mannat/phase7_05_cart_verified.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_05_cart_verified.png) |
| **Desktop Hero Overview** | Desktop `1280 x 800`| Widescreen responsive layout, sticky navigation bar, high-DPI plates | [`qa-screenshots/mannat/phase7_06_desktop_hero_overview.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_06_desktop_hero_overview.png) |
| **Desktop Momo 3-Tier Matrix** | Desktop `1280 x 800`| Full 3-column matrix table with all variants and instant add buttons | [`qa-screenshots/mannat/phase7_07_desktop_momo_matrix.png`](file:///C:/Users/xshan/Desktop/menuqr/qa-screenshots/mannat/phase7_07_desktop_momo_matrix.png) |

---

## 5. Verification Commands for Local Reproducibility

```bash
# 1. Seed database with authentic Mannat menu for both slugs
node scripts/seed_mannat_restaurant.cjs

# 2. Recompile frontend bundle
npm --prefix frontend run build

# 3. Execute automated Playwright regression audit
node scripts/verify_phase7_regression.cjs

# 4. Verify test cart interaction
node test_cart.cjs
```

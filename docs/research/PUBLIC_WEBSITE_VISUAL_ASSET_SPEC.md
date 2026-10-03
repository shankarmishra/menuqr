# Public Website Visual V2 — Visual Asset & Art Direction Specification

## 1. iPhone 16 Pro Device Mockup Geometry & CSS Rules

To replace crude CSS rectangles with a photorealistic smartphone framing:

### Dimensions & Geometry
- **Logical Canvas:** 320px × 640px (scaled appropriately for desktop/mobile layouts).
- **Outer Frame:** `border-radius: 48px`, background `#1a1a1a`.
- **Titanium Bezel:** `border: 4px solid #3b3c3e`, `box-shadow: inset 0 0 8px rgba(255,255,255,0.12), inset 0 0 16px rgba(0,0,0,0.8)`.
- **Dynamic Island (Camera Notch):**
  - Width: 100px, Height: 28px, Top Offset: 10px.
  - Background: `#000000`.
  - Inner details: Dual lens reflection dots (`#111` with radial glare `#444`).
- **Screen Container:** `border-radius: 40px`, overflow `hidden`, inset border `1px solid rgba(255,255,255,0.08)`.
- **Screen Reflection Glare:** Absolute overlay `background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 100%)`, pointer-events `none`.
- **Drop Shadow:** `box-shadow: 0 30px 60px -12px rgba(0,0,0,0.6), 0 18px 36px -18px rgba(232,120,60,0.15)`.

---

## 2. Physical QR Sticker & Placard Visuals

To ground MENUQR in real-world restaurant hardware:

### Acrylic Table Placard
- **Material:** Ultra-clear acrylic stand with a dark emerald menu insert.
- **Base Stand:** Wooden walnut or brushed metallic base block at the bottom (`height: 18px`, `background: linear-gradient(180deg, #2a2521, #171412)`).
- **Placard Insert:**
  - Background: `#faf8f5` (warm cream paper texture) or `#151c19` (Dark Emerald premium card).
  - Border: `1px solid rgba(255,255,255,0.1)`.
  - Bevel Edge: `box-shadow: 0 1px 0 rgba(255,255,255,0.2) inset, 0 -1px 0 rgba(0,0,0,0.4) inset`.
  - Print Detailing: MenuQR logo, golden accent borders (`#ffc928`), high-contrast QR code, table number badge, and "Scan for Digital Menu" typography.
- **Physical Shadows:** Soft directional shadow projecting onto the virtual table surface (`filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5))`).

---

## 3. 10 Structurally Distinct Menu Templates

Rather than identical cards with different background colors, each template must embody distinct visual architecture, typography, and content layout:

1. **Minimal:** Clean, white-space heavy layout with elegant serif headings, hairline dividers, and price aligned right.
2. **Luxury:** Dark obsidian backdrop (`#0d0d0d`), gold foil accents (`#ffc928`), elegant script typography, centered item titles.
3. **Modern:** Bold sans-serif typography, vibrant orange tags (`#e8783c`), badge indicators for "Chef's Special".
4. **Cafe:** Warm cream parchment palette (`#f5f0e8`), coffee-bean watermarks, compact dual-column layout for drinks.
5. **Indian Restaurant:** Deep royal crimson/emerald tones, intricate border patterns, prominent Veg/Non-Veg indicators (`#34b56a` / `#ff5e4d`).
6. **Fine Dining:** Single-column tasting menu format, dish descriptions emphasized, course breakdown (Amuse-Bouche, Main, Dessert).
7. **Bakery:** Soft pastel warmth, grid card layout with prominent pastry imagery tags and price pills.
8. **Premium Dark:** Deep charcoal slate (`#1e293b`), neon green accent lines, compact high-density layout.
9. **Classic:** Traditional bistro style, double-line borders, boxed daily specials section.
10. **Image-Heavy:** Large food photography cards with floating title & price overlays for visual craving appeal.

---

## 4. Physical Restaurant Environment Compositions ("Built for the Table")

Replace generic isolated cards with environmental backdrops:
- **Dining Table Scene:** Dark walnut wood grain texture background with dhabas/restaurant table setup.
- **Cafe Counter Scene:** Marble counter texture with espresso machine silhouette and tabletop QR stand.
- **Reception Scene:** Sleek glass counter near entrance placard.
- **Takeaway Scene:** Pickup counter context with quick-scan wall placard.
- **Outdoor Terrace Scene:** Patio table setting with weather-resistant QR stand.

# Phase 2 Design Specification: Restaurant Dashboard (`/app`)

## 1. Global Theme & Brand Guidelines
- **Background Color:** Dark Emerald (`#151c19`) - Used for the main app background.
- **Surface Color:** Card Surface (`#1d2723`) - Used for sidebar, cards, modals, and dropdowns.
- **Surface Hover/Active:** Slightly lighter surface (`#25322d`) for hovered rows, active sidebar links.
- **Primary Accent:** Primary Orange (`#e8783c`) - Used for primary buttons, active indicators, and important links.
- **Primary Accent Hover:** Lighter Orange (`#f08b55`).
- **Text Primary:** White (`#ffffff`) or Off-White (`#f3f4f6`) - Main headings and primary text.
- **Text Secondary:** Muted Green/Gray (`#9ca3af` or `#849a90`) - Secondary text, labels, and placeholders.
- **Borders/Dividers:** Subtle Dark Green (`#2a3832`) - Used sparingly to separate sections.

## 2. Layout Structure (App Shell)

### Desktop Layout (md: `768px` and above)
- **Sidebar (Left):** 
  - Fixed width: `260px` (Collapsible to `80px` for power users).
  - Background: `#1d2723`.
  - Border-right: `1px solid #2a3832`.
  - Content: Logo/Brand mark at top, vertical navigation links, user profile / tenant switcher at the bottom.
- **Main Content Area (Right):**
  - Fills remaining width.
  - Background: `#151c19`.
  - Padding: `2rem` (32px) uniformly around the content.
  - Max-width constraint on content: `1200px` (centered horizontally).

### Mobile Layout (Below `768px`)
- **Header (Top):**
  - Fixed height: `64px`.
  - Background: `#1d2723`.
  - Content: Hamburger icon (left), Brand Logo (center), User Profile icon (right).
- **Sidebar (Off-canvas):**
  - Slides in from left when hamburger is clicked. Full height, width `280px`.
  - Overlay: Dark semi-transparent background over main content.
- **Main Content Area:**
  - Padding reduced to `1rem` (16px).

## 3. Typography
- **Font Family:** Inter (or similar modern sans-serif like system-ui).
- **Headings:**
  - H1 (Page Title): `24px` (Desktop), `20px` (Mobile), Semi-bold, `#ffffff`.
  - H2 (Section/Card Title): `18px`, Medium, `#ffffff`.
  - H3 (Sub-section): `14px`, Semi-bold, text-transform uppercase, `#9ca3af`.
- **Body Text:**
  - Base: `14px`, Regular, `#f3f4f6`.
  - Small/Metadata: `12px`, Regular, `#849a90`.

## 4. UI Components

### Navigation Links (Sidebar)
- **Default State:** Transparent background, text `#9ca3af`, icon `#9ca3af`.
- **Hover State:** Background `#25322d`, text `#ffffff`, icon `#ffffff`.
- **Active State:** Background `#e8783c15` (15% opacity orange), text `#e8783c`, left-border indicator `4px solid #e8783c`.

### Buttons
- **Primary Button:** Background `#e8783c`, Text `#ffffff`, Border-radius `6px` or `8px`. Padding: `8px 16px`. Hover: `#f08b55`.
- **Secondary Button:** Background `#25322d`, Text `#ffffff`, Border `1px solid #2a3832`. Hover: Background `#2a3832`.
- **Ghost/Text Button:** Transparent background, Text `#e8783c`. Hover: underline or background `#e8783c15`.

### Cards & Panels
- **Background:** `#1d2723`.
- **Border Radius:** `12px` (Soft, modern feel).
- **Border:** `1px solid #2a3832` (optional, use mainly for separation if needed).
- **Shadow:** None (Quiet Chrome) - rely on color contrast between `#151c19` and `#1d2723`.
- **Padding:** `24px` internal padding.

### Forms & Inputs
- **Input Background:** `#151c19` (inset feel against the `#1d2723` card).
- **Border:** `1px solid #2a3832`.
- **Focus State:** Border `#e8783c`, Ring `2px solid #e8783c33`.
- **Text:** `#ffffff`.
- **Labels:** `14px`, Medium, `#f3f4f6`, margin-bottom `8px`.

### Tables (Data Density)
- **Header Row:** Background `#1d2723`, text uppercase `12px`, `#849a90`, border-bottom `1px solid #2a3832`.
- **Data Row:** Background `#1d2723`, border-bottom `1px solid #2a3832`.
- **Row Hover:** Background `#25322d`.
- **Cell Padding:** `12px 16px` (tight enough for density, large enough for touch).

## 5. Spacing System (Tailwind Scale)
- Utilize standard Tailwind spacing (`p-4`, `p-6`, `gap-4`, `gap-6`).
- Emphasize vertical rhythm: `24px` spacing between major sections, `16px` between related elements.

## 6. Implementation Notes for Agent B
- Build the layout using CSS Grid/Flexbox or Tailwind CSS.
- Ensure the Mobile Header and Desktop Sidebar are mutually exclusive based on standard breakpoints (`hidden md:flex`, `md:hidden`).
- Build reusable UI components (e.g., `Card`, `Button`, `Input`) early to maintain consistency across `/app` sub-routes.
- The UI should feel "Dark-First" native; don't rely on generic light-mode templates inverted.

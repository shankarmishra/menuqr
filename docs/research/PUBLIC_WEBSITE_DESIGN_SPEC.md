# PUBLIC WEBSITE DESIGN SPECIFICATION

## Global Design System

### 1. Color Palette (Strict Enforcement)
- **Backgrounds**: Dark Emerald `#151c19` (main page background), Card Surface `#1d2723` (section cards, interactive panels).
- **Accents**: Primary Orange `#e8783c` (primary buttons, key highlights, active states), Warm Yellow `#ffc928` (secondary accents, warnings in timelines).
- **Indicators**: Veg Green `#34b56a`, Non-Veg Red `#ff5e4d` (used within menu UI demos).
- **Text**: White for primary text, light gray for secondary text to ensure high contrast against dark backgrounds.

### 2. Typography
- **Font Stack**: (Existing system stack: Inter, SF Pro, system-ui).
- **Scale**:
  - H1 (Hero): 4rem / 64px (Desktop) | 2.5rem / 40px (Mobile) - Bold, tight tracking.
  - H2 (Section): 3rem / 48px (Desktop) | 2rem / 32px (Mobile) - Semi-bold.
  - H3 (Card): 1.5rem / 24px - Medium.
  - Body (Primary): 1.125rem / 18px - Regular.
  - Body (Secondary): 0.875rem / 14px - Regular.

### 3. Layout & Spacing
- **Container**: Max-width `1200px` for content, centered. Full bleed for background sections.
- **Spacing Scale**: Base 4px. Standard section padding: `120px` top/bottom (Desktop), `64px` (Mobile). Standard gap: `24px` to `32px`.
- **Header**: Sticky glassmorphism header (blur 8px, `#151c19` with 80% opacity). Desktop: inline navigation. Mobile: Hamburger opening a full-screen or side-drawer navigation.

### 4. Animation Principles
- **Style**: Physical, precise, tactile. No floating blobs.
- **Timing**: Fast and snappy (duration `200ms` - `400ms`).
- **Easing**: Custom cubic-bezier (e.g., `cubic-bezier(0.25, 1, 0.5, 1)`) for mechanical, precise stops.
- **Accessibility**: Wrap all non-essential animations in `prefers-reduced-motion: no-preference`.

---

## 12 Narrative Chapters: Composition & Choreography

### 1. Cinematic Hero
- **Layout**: Center aligned text. Headline: "Your menu changes. Your QR doesn't." Primary CTA: "Create Your Menu" (`#e8783c`). Secondary: "See How It Works" (Ghost button).
- **Visuals**: A high-fidelity animated sequence: Sticker machine prints QR → physical QR lands on a table → phone hovers over → live menu interface boots up.
- **Animation**: On load, elements sequence in. The QR-to-phone sequence loops seamlessly.

### 2. One QR, Countless Updates
- **Layout**: 50/50 split screen. Left: Restaurant dashboard (editing a menu item price). Right: Mobile phone showing the live update.
- **Animation**: Scroll-driven or triggered timeline. As user scrolls, the price on the left changes, and a brief highlight/ping occurs on the right side showing the live update.

### 3. Physical QR → Digital Menu
- **Layout**: Full-width feature section.
- **Visuals**: A tactile, close-up visualization of a phone camera scanning a QR code.
- **Animation**: Parallax scroll effect. Phone frame moves into view, viewfinder locks onto the QR code with a mechanical "snap" effect, screen transitions to the menu UI.

### 4. Built for the Table
- **Layout**: Bento grid or 3-column layout showing physical environments.
- **Visuals**: High-quality renders/images of the QR sticker in context: Restaurant Table, Coffee Shop Counter, Hotel Reception.
- **Interaction**: Hovering over a card slightly scales up the image (1.02x) and reveals a subtle border glow in Warm Yellow (`#ffc928`).

### 5. Template Gallery
- **Layout**: Horizontal scrolling carousel or masonry grid.
- **Visuals**: Showcasing 10 distinct UI templates. These are structurally different (list, grid, image-heavy, minimal), not just color swaps.
- **Animation**: Smooth horizontal scroll (draggble on mobile).

### 6. Restaurant Dashboard Demo
- **Layout**: Large, centered mock-up of the desktop web dashboard on a Card Surface (`#1d2723`).
- **Visuals**: Emphasizing the simplicity of adding an item, tagging it Veg/Non-Veg.
- **Animation**: Automated, self-playing cursor animation clicking through a simple flow.

### 7. Subscription + QR Protection
- **Layout**: Vertical timeline or progress track.
- **Visuals**: Timeline showing states: Active (Green) → Warning (Yellow) → Expired (Grayed out) → Renewed (Green).
- **Animation**: Scroll-linked. As the user scrolls down, the timeline fills up, highlighting how the physical QR remains the same even if the subscription lapses and is renewed.

### 8. How MENUQR Works
- **Layout**: 6-step connected workflow, zigzag or linear grid layout.
- **Content**: Short, punchy copy for each step.
- **Visuals**: Simple, elegant iconography or mini-UI snippets for each step.

### 9. Customer Experience
- **Layout**: Mobile phone frame pinned to the side (or center), while text scrolls past.
- **Visuals**: The phone shows a scrolling menu.
- **Animation**: Scroll-jacking/Sticky positioning. The phone stays in place while the user reads about features like category navigation, allergen info, and fast loading.

### 10. Pricing
- **Layout**: Clean pricing cards side-by-side. Use "For Independent Restaurants" or similar ICP labels.
- **Visuals**: Cards use Card Surface (`#1d2723`). The "Pro" or recommended tier has a subtle Primary Orange (`#e8783c`) border.
- **State**: Use config data. If not available, elegantly display "Coming Soon" with an email capture form.

### 11. FAQ
- **Layout**: Accordion style list, centered. Max-width `800px` for readability.
- **Interaction**: Clicking expands the answer. Fast height animation (`200ms`) with an arrow icon rotating 180 degrees.

### 12. Final CTA
- **Layout**: Large, bold section. Background might have a very subtle, dark watermark of a QR code.
- **Content**: "Print it once. Update it anytime."
- **Action**: Large Primary CTA button.
- **Animation**: Simple fade-in and slide-up on reveal.

---

## Technical & Performance Constraints
- **Mobile Adjustments**: At `768px` and below, all multi-column layouts stack vertically. The sticky scroll-jacking in Section 9 should be disabled or simplified to avoid frustrating mobile users. Font sizes reduce as specified in the typography scale.
- **Loading/States**: 
  - Provide skeleton screens for any dynamic components (like the pricing if fetched from an API).
  - Empty states in demos should look deliberate and clean.
- **Performance**: Use WebP/AVIF for images. The heavy animations (Hero, Dashboard Demo) must be lazy-loaded using `IntersectionObserver` so they only run and consume CPU when visible. Use CSS transforms (`translate`, `scale`) for animations instead of animating layout properties.

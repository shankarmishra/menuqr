# MENUQR Public Website Visual 2.0 Design Specification

## 1. iPhone 16 Pro Mockup Geometry & CSS Styling Rules
To achieve a premium, photorealistic iPhone 16 Pro representation entirely via CSS (or SVG-driven CSS), follow these specific styling rules.

**Base Geometry & Materials:**
- **Dimensions:** 393px width, 852px height (logical dimensions).
- **Border Radius:** 55px outer radius, 48px inner screen radius.
- **Bezel (Titanium):**
  - Outer border: `4px solid #45474a`
  - Inset shadow to simulate curved edge: `inset 0 0 10px rgba(255, 255, 255, 0.1), inset 0 0 20px rgba(0, 0, 0, 0.4)`
- **Dynamic Island (Camera Island):**
  - Width: 125px, Height: 37px
  - Top Offset: 11px
  - Border Radius: 20px
  - Background: `#000000`
  - Sensors/Camera (inner elements): Subtle radial gradients to simulate lens reflections (`radial-gradient(circle at 30% 30%, #333, #000 60%)`).
- **Screen Reflections:**
  - Overlay gradient on the screen container: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0) 100%)`
  - Blend mode: `screen`
- **3D Perspective (Transformations):**
  - Base perspective: `perspective(1200px)`
  - Default resting rotation: `rotateX(15deg) rotateY(-20deg)`
  - Hover/Active states should subtly alter `rotateX` and `rotateY` by +/- 5deg based on mouse tracking or scroll position.

## 2. Hero 8-Second Cinematic Timeline Choreography (0s - 8s)
The hero section must seamlessly transition from a physical QR to a digital menu without breaks.

- **0.0s - 1.5s: The Physical Entity**
  - A photorealistic QR placard (Dark Emerald `#151c19` card surface) sits centered, slightly tilted back (`rotateX(20deg)`).
  - A spotlight passes over it, emphasizing the texture.
- **1.5s - 3.0s: The Approach & Viewfinder Lock**
  - The "camera" pushes in (scale up 1.5x) on the QR code.
  - Viewfinder corners (Primary Orange `#e8783c`) fade in around the QR code.
  - A subtle scan beam (horizontal line with `rgba(232, 120, 60, 0.8)`) sweeps down and back up over 1s.
- **3.0s - 4.5s: The iPhone Unfurls**
  - The QR code "morphs" or is engulfed by the iPhone 16 Pro mockup scaling up from the center of the QR code.
  - The transition uses a scale and opacity crossfade: QR scales down, Phone scales up, rotating from flat to upright (`rotateX(0) rotateY(0)`).
- **4.5s - 6.5s: Live Menu Loading & Rendering**
  - The iPhone screen goes from black to lighting up.
  - The MENUQR logo splashes on screen (150ms).
  - The UI populates instantly. Staggered fade-up (Y offset +20px) of menu categories and items (300ms each, staggered by 100ms).
- **6.5s - 8.0s: Resting State & Auto-Scroll**
  - The phone settles into a subtle floating animation (`translateY` oscillating by 10px over 4s).
  - The menu on the phone screen begins a slow, smooth automatic scroll downwards to demonstrate content depth.

## 3. Section 2: Live Price Update Split-Screen Specs
Demonstrates real-time synchronization between the restaurant dashboard and the customer's phone.

**Layout:**
- **Left Panel (Dashboard):** 60% width, styled as a web app interface (`#1d2723` surface, `#151c19` background).
- **Right Panel (iPhone):** 40% width, showcasing the live menu.

**Animation Trigger Sequence (Looping every 6s):**
1. **t=0s:** Left panel shows a menu item "Truffle Pasta" with price `₹280`. Right panel shows the same.
2. **t=1s:** A simulated cursor moves to the price field on the left panel (Ease-in-out, 400ms).
3. **t=1.5s:** Cursor clicks. The field highlights. Text updates rapidly: `₹280` -> backspace -> `₹320`.
4. **t=2.5s:** Cursor moves to and clicks a green "Save" button (`#34b56a`).
5. **t=3.0s:** A pulse effect (Primary Orange `#e8783c`, 400ms) travels from the left panel to the right panel.
6. **t=3.5s:** The price on the right panel (iPhone) flashes briefly and updates from `₹280` to `₹320`.
7. **t=5.0s:** Reset to `₹280` off-camera for the next loop.

## 4. Section 4: Built for the Table - Physical Environment Composition
Showcase the QR code in highly realistic physical contexts.

- **Scene 1: The Wooden Table (Fine Dining/Cafe)**
  - Background Texture: High-resolution dark walnut wood grain.
  - Lighting: Warm, moody, dappled light (simulating a window).
  - Asset: An acrylic table tent card holding the MENUQR code. Casts a realistic drop shadow (`rgba(0,0,0,0.5) blur 20px, offset Y 15px`).
- **Scene 2: The Marble Counter (QSR/Bar)**
  - Background Texture: White/Grey Carrara marble with sharp, specular reflections.
  - Lighting: Bright, overhead cool lighting.
  - Asset: A flat sticker QR on the counter, with a subtle raised edge and gloss finish.
- **Interactions:**
  - Users can toggle between these environments via "Hotspot" dots overlaying the section.
  - Switching scenes triggers a smooth crossfade (500ms) of background textures and assets, maintaining the exact position of the QR code.

## 5. Section 5: Template Gallery - 3D Carousel Specs
A high-performance 3D carousel showcasing 10 structurally distinct templates (not just color variations).

- **Structure:** 10 distinct phone frames arranged in a 3D cylindrical projection.
- **Geometry:**
  - Active (Center) item: `scale(1) translateZ(200px) opacity(1)`.
  - Adjacent items: `scale(0.8) translateX(+/- 300px) translateZ(100px) opacity(0.6) rotateY(+/- 25deg)`.
  - Background items: Folded backward, fading to `opacity(0)`.
- **Navigation:**
  - Drag-to-spin (horizontal scroll/swipe).
  - Arrow buttons.
- **Transition:** Spring-physics based rotation (stiffness: 120, damping: 14) for a snappy but organic stop.
- **Content:** The phone screens must display actual varied structural layouts (e.g., list view with small thumbnails, grid view with large images, text-heavy elegant minimalist view).

## 6. Section 7: Subscription Story State Machine Timeline
A visual narrative explaining what happens when a subscription expires and is renewed.

**Visual Component:** A single, constant physical QR sticker on the left, and a corresponding phone screen on the right.

**States (Triggered by vertical scroll or timeline clicks):**
1. **State A (Active):**
   - Timeline Marker: Green (`#34b56a`).
   - Phone Screen: Displays the full, vibrant digital menu.
2. **State B (Warning - 7 Days Left):**
   - Timeline Marker: Yellow (`#ffc928`).
   - Phone Screen: Menu remains active. A subtle, non-intrusive banner appears at the bottom of the restaurant *dashboard* (shown inset), not the customer menu.
3. **State C (Expired):**
   - Timeline Marker: Red (`#ff5e4d`).
   - Phone Screen: Menu is replaced by a clean, polite "Menu temporarily unavailable" screen.
4. **State D (Renewed):**
   - Timeline Marker: Green (`#34b56a`).
   - Phone Screen: Instant transition back to the full menu.
   - **Key Visual:** Throughout this entire state machine, an overlay line connects the unchanged physical QR code to the phone, heavily emphasizing that the physical printed code *never* breaks or needs reprinting.

## 7. Motion Scale & Easing Curves
Strict adherence to these easing functions is required to maintain the "Physical, Precise, Tactile" brand feel.

- **Micro-Interactions (150ms - 250ms):**
  - Use for: Button hovers, tooltips, field focus.
  - Curve: `cubic-bezier(0.2, 0, 0, 1)` (Deceleration/Out). Snappy, immediate response.
- **Standard Transitions (300ms - 500ms):**
  - Use for: Modal opens, tab switches, dropdowns, list item appearances.
  - Curve: `cubic-bezier(0.4, 0, 0.2, 1)` (Standard/Ease-in-out). Smooth, natural flow.
- **Cinematic & Spatial Movements (700ms - 1400ms):**
  - Use for: Hero sequence transitions, 3D carousel rotations, major scroll-triggered scene changes.
  - Curve: `cubic-bezier(0.65, 0, 0.05, 1)` (Tension/Spring-like). Starts slightly slow, moves fast through the middle, aggressively decelerates to a precise stop. No bouncing.

## 8. Responsive Behavior Rules
- **320px - 375px (Small Mobile):**
  - Stack everything. The 3D carousel becomes a flat horizontal scroll snapping list.
  - Hero sequence scales down the phone mockup to 280px width.
  - Split-screen (Section 2) becomes a vertical stack (Dashboard top, Phone bottom).
- **430px (Large Mobile):**
  - Optimize typography (increase base size slightly).
  - Ensure touch targets are at least 48x48px.
- **768px (Tablet Portrait):**
  - Split-screen features can remain horizontal if space permits, or use a 50/50 split.
  - 3D carousel returns, but with a tighter radius and fewer visible adjacent items (3 instead of 5).
- **1024px (Tablet Landscape / Small Desktop):**
  - Full desktop layout applies.
  - Hero sequence occupies full viewport height (100vh).
- **1280px - 1440px (Desktop):**
  - Max width container set to 1200px to ensure line lengths don't become unreadable.
  - Cinematic animations (Hero, 3D effects) utilize full screen width for dramatic effect.

---
*Created by Agent C (UI/UX) as per Phase 2 requirements.*

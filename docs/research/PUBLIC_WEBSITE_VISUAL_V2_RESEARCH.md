# Public Website Visual V2 — Web & Animation Research

## 1. Executive Summary
This research document establishes the visual benchmark and motion strategy for MENUQR Public Website Visual 2.0. To elevate the site to an Awwwards-level / Apple-style product launch experience, we analyzed high-end SaaS marketing platforms, hospitality technology products, photorealistic 3D CSS device techniques, and QR scan animations.

---

## 2. LottieFiles QR Animation Research & Licensing Analysis

### Source URL Inspected:
`https://lottiefiles.com/free-animations/qr-code`

### Analyzed Animations & Patterns:

1. **Pattern 1: Matrix QR Formation (Dot Grid Assembly)**
   - *Visual Behavior:* Individual QR matrix modules/dots animate into place using a staggered scale + opacity entrance.
   - *Observation:* Creates a high-tech "fabrication" feeling.
   - *License & Usage Note:* Lottie animation files often carry specific attribution requirements or proprietary JSON structures. 
   - *MENUQR Decision:* **Recreate using Framer Motion + SVG grid**. We can generate dynamic SVG paths for QR patterns with CSS `strokeDashoffset` and staggered `scale` entrance for 100% control, zero external bundle overhead, and zero licensing ambiguity.

2. **Pattern 2: Laser Scan Beam & Viewfinder Lock**
   - *Visual Behavior:* Glowing horizontal laser beam sweeps top-to-bottom over the QR code, while 4 corner viewfinder brackets pulse and contract around the QR boundary. Upon sweep completion, a radial wave pulse expands outwards.
   - *Observation:* Immediately signals "Scan Detected".
   - *License & Usage Note:* External Lottie assets may lag on mobile devices if loaded via heavy JS runtimes.
   - *MENUQR Decision:* **Recreate using pure CSS keyframes & Framer Motion**. Animate a linear gradient beam (`linear-gradient(180deg, transparent, rgba(232, 120, 60, 0.8), transparent)`) with CSS `transform: translateY()`, paired with animated SVG viewfinder corner brackets (`stroke: #e8783c`).

3. **Pattern 3: Tactile Holographic / Glass QR Card**
   - *Visual Behavior:* Subtle 3D tilt response as mouse/scroll moves, with a specular light glare crossing the acrylic surface.
   - *Observation:* Adds physical depth and tangible realism to digital representations.
   - *MENUQR Decision:* **Recreate using CSS 3D Transforms & Gradient Glare Overlay**.

---

## 3. Apple-Style Product Storytelling & Motion System

### Key Visual & Interaction Benchmarks:
1. **Device Mockup Realism (iPhone 16 Pro):**
   - Photorealistic curved titanium frame (`#45474a` border with inner specular inset shadow).
   - Dynamic Island camera notch with lens reflection details.
   - Glass reflection overlay (`linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)`).
   - Deep multi-layered drop shadows (`0 25px 50px -12px rgba(0, 0, 0, 0.7)`).
2. **Tactile Physical Signage:**
   - Physical table stand with acrylic depth, bevels, paper grain texture, and table surface shadow.
3. **Motion Curves & Micro-Interactions:**
   - **Cinematic Entrance:** `cubic-bezier(0.16, 1, 0.3, 1)` (smooth deceleration over 800ms).
   - **Interactive Spring:** `stiffness: 300, damping: 30` for ultra-responsive hover and click feedback.
   - **Scroll Choreography:** `whileInView` with `viewport: { once: true, margin: '-80px' }` to prevent viewport reflow jank.

---

## 4. Reduced Motion (`prefers-reduced-motion: reduce`)
For users with motion sensitivity:
- Disable 3D tilt rotations (`rotateX(0)`, `rotateY(0)`).
- Replace multi-stage camera/zoom transitions with clean 200ms opacity fades.
- Maintain full functional interactivity (all CTAs, price update demos, and template browsing remain 100% accessible).

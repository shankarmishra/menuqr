# Public Website Visual V2 — QA Audit & Verification

## 1. Visual Acceptance Matrix

| Visual Domain | Target Criteria | Status | Verification Notes |
|---------------|-----------------|--------|-------------------|
| **Hero Composite** | Photorealistic iPhone 16 Pro + 3D Acrylic Placard + Laser Scan Beam | PASS | Verified titanium bezel geometry, Dynamic Island notch, glass glare, and scan beam sweep. |
| **Section 02 Live Update** | Synchronized Dashboard Price Edit (₹280 → ₹320) + iPhone Menu Update | PASS | Animate loop with pulse transition and prominent "SAME QR — NO REPRINT" green badge. |
| **Section 03 Physical Bridge** | 3D Perspective Placard -> Phone Viewport | PASS | 3D transform rotation with scan beam line. |
| **Section 04 Context Grid** | Hospitality Placement Environments | PASS | 5 context cards (Dining Table, Cafe Counter, Reception, Takeaway, Outdoor). |
| **Section 05 Template Gallery** | 10 Structurally Distinct Menu Templates | PASS | 10 templates featuring unique typography, card structures, and layout personalities. |
| **Section 06 Dashboard Demo** | Browser Frame with Auto-Cycling Tabs | PASS | 4 tabs (Dashboard, Menu Editor, Appearance, QR Center) with demo metrics. |
| **Section 07 Subscription** | State Machine Timeline & QR Identity Preservation | PASS | 6-step lifecycle timeline demonstrating QR identity preservation. |
| **Section 08 How It Works** | 6 Step Onboarding Flow | PASS | Sequential step numbers (`01` to `06`) with iconography. |
| **Section 09 Customer View** | Photorealistic iPhone 16 Pro Search & Filters | PASS | Phone mockup with search bar, Veg/Non-Veg filter pills (`#34b56a` / `#ff5e4d`), and dish cards. |
| **Section 10 Pricing** | Annual Plan Presentation | PASS | Featured card with gold accent borders (`#ffc928`) and feature checklist. |
| **Section 11 FAQ** | Accordion Q&A | PASS | 8 expandable questions resolving QR permanence and renewal safety. |
| **Section 12 Final CTA & Footer** | Closing Banner & Brand Footer | PASS | Large headline *"Print it once. Update it anytime."* + footer navigation. |
| **Responsive Form Factors** | 320px, 375px, 768px, 1024px, 1440px | PASS | Responsive collapse, off-canvas mobile drawer navigation, no horizontal overflow. |
| **Accessibility & Reduced Motion**| `@media (prefers-reduced-motion: reduce)` | PASS | Fallbacks disable heavy CSS 3D transforms and keyframe loops while preserving interactivity. |
| **Engineering Build** | `npm run build` & `oxlint` | PASS | 0 TypeScript errors, 0 oxlint errors. |

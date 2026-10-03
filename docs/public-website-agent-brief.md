# Public Marketing Website — Agent Brief

## Track Goal
Build a premium, cinematic public marketing website for MENUQR that tells one continuous product story:
Problem → Physical QR → MENUQR fabrication → Scan → Live mobile menu → Restaurant edits menu → Customer sees update → Same QR remains → Templates → Subscription protection → CTA.

## Brand Palette (DO NOT REPLACE)
- Dark Emerald: `#151c19`
- Card Surface: `#1d2723`
- Primary Orange: `#e8783c`
- Secondary Warm Yellow: `#ffc928`
- Veg Green: `#34b56a`
- Non-Veg Red: `#ff5e4d`

## 12 Narrative Chapters
1. Cinematic Hero (sticker machine → QR → phone → live menu)
2. One QR, Countless Updates (split-screen: panel edits ↔ customer menu updates)
3. Physical QR → Digital Menu (tactile scan animation)
4. Built for the Table (realistic physical placement: table, counter, reception)
5. Template Gallery (10 distinct templates, NOT color swaps)
6. Restaurant Dashboard Demo (animated dashboard walkthrough)
7. Subscription + QR Protection (timeline: active → warning → expired → renew → same QR)
8. How MENUQR Works (6-step connected workflow)
9. Customer Experience (phone visualization with scrolling menu)
10. Pricing (premium pricing UI, use config data or "coming soon")
11. FAQ (real objections answered)
12. Final CTA ("Print it once. Update it anytime.")

## File Ownership
- **Agent C (UI/UX):** `docs/research/PUBLIC_WEBSITE_UI_RESEARCH.md`, `docs/research/PUBLIC_WEBSITE_DESIGN_SPEC.md`
- **Agent A (Backend):** `backend/server.js` (only if contact form needed)
- **Agent B (Frontend):** `frontend/src/pages/public/**`, `frontend/src/components/marketing/**`
- **Agent D (QA):** `docs/PUBLIC_WEBSITE_QA.md`

## Execution Order
1. Agent C + Agent A (parallel)
2. Agent B (after C's design spec is ready)
3. Agent D (after B's implementation)

## Hero Copy Direction
- Headline: "Your menu changes. Your QR doesn't."
- Primary CTA: "Create Your Menu"
- Secondary CTA: "See How It Works"

## Animation Principles
Physical, Precise, Tactile, Controlled, Fast, Purposeful.
NO random floating blobs, excessive neon, or pointless parallax.

## Performance Rules
- Lazy loading for below-fold sections
- Code splitting for heavy components
- Optimized SVG/images
- Animations stop when not visible
- Support `prefers-reduced-motion`

## DO NOT
- Replace the brand palette
- Create a generic Hero → 3 cards → Pricing → FAQ layout
- Use fake production metrics
- Copy external assets without license verification
- Touch Restaurant Panel, Menu Builder, or QR Sticker Generator code

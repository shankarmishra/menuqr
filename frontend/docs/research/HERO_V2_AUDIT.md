# HERO V2 AUDIT

## 1. File Inspection
The current hero section is comprised of:
- `HeroSection.tsx`: The layout, typography, and animated entrance containers.
- `HeroScanMenuInteractive.tsx`: The monolithic state-machine that renders the QR placard and the CSS iPhone.
- `IPhoneMockup.tsx`: The CSS/HTML shell simulating an iPhone 16 Pro.
- `animations.ts`: The Framer Motion variant exports (fadeUp, scaleIn, staggerContainer).
- `AnimatedCounter.tsx`: The metrics counting component.
- `index.css`: The `mqr-bg-drift` and `mqr-pulse-glow` keyframe animations.

## 2. What should be deleted
- **The "Dark Tech SaaS" visual language**:
  - `bg-[#0f1512]` background in `HeroSection.tsx`.
  - Gradient mesh glow `div`s with `animate-[mqr-bg-drift_20s_ease-in-out_infinite_alternate]`.
  - Dot matrix grid `div`.
  - The pulsing glow shadow on the CTA (`animate-[mqr-pulse-glow_3s_infinite_alternate]`).
- **Fake Metrics & Dashboard Elements**:
  - The "100% Permanent QR", "0.2s Menu Scan Time", and "0 App Install" row using `<AnimatedCounter>`.
  - The top "Eyebrow" pill containing "Next-Gen Table Tech Platform 2.0".
  - The yellow connecting laser beam (`ArrowRight`).
- **The Monolith**:
  - `HeroScanMenuInteractive.tsx` must be deleted and broken down into layered, storytelling-focused components.

## 3. What can be reused
- `IPhoneMockup.tsx`: It provides a solid physical shape, but needs its dark neon styling stripped down to look photorealistic (e.g. realistic bezels, glass reflections, and shadows, avoiding flat neon colors).
- `animations.ts`: The spring physics constants and basic `fadeUp` can be reused, but they must be adapted to a slower, more deliberate cinematic pacing.
- The concept of the 3-step scan loop (`scanning` -> `scanned` -> `menu`), but expanded to a full 7-step narrative (`idle` -> `same-qr`).

## 4. What should become a real asset
- **The MENUQR QR Code**: Currently rendered as a generic inline SVG. It must be rendered using the actual MENUQR component to represent reality.
- **The Live Menu Screen**: Must represent the *actual* restaurant menu layout, not a generic set of text blocks.

## 5. What should be replaced by video
- The empty dark void background. This must be replaced with the 3 cinematic restaurant environment videos requested:
  - Video 01: Hero Establishing Shot (Table + Physical QR)
  - Video 02: Hand + Phone Scan (Close-up)
  - Video 03: Restaurant Table Atmosphere

## 6. What should remain React-driven
- The Menu UI inside the phone (prices changing in real-time).
- The Physical QR (overlaying the video so it remains sharp and un-distorted).
- The "Scan" lock-on animation (using Framer Motion for realism).
- All storytelling typography (Headlines, "SAME QR" labels).
- All CTAs and interactions.

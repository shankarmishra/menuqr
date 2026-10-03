# Public Website Visual V2 — Current State Visual Audit

## 1. Audit Overview
While the current website compiled and passed basic structural tests, a strict visual audit reveals several areas where the presentation feels like a generic SaaS template rather than a premium, photorealistic product experience.

---

## 2. Identified Visual Deficiencies & Weaknesses

### Hero Section
- **Deficiency:** The iPhone mockup is rendered as a flat CSS box with basic rounded corners (`#000` with `border: 2px solid #333`). It lacks titanium bezels, Dynamic Island lens details, screen reflections, and realistic device depth.
- **Deficiency:** The QR stand is flat and lacks physical material textures (wood grain, acrylic bevels, table surface drop shadows).
- **Remediation:** Replace with the photorealistic iPhone 16 Pro CSS geometry and 3D acrylic placard composition defined in `PUBLIC_WEBSITE_VISUAL_ASSET_SPEC.md`.

### Live Update Demo (Section 02)
- **Deficiency:** The editor panel and phone menu update instantaneously without visual connecting pulses or interactive feedback.
- **Remediation:** Implement a 6-second animated loop with smooth cursor movement, price highlight transitions, and a pulsing synchronization signal.

### Built for the Table (Section 04)
- **Deficiency:** Renders as 5 standalone cards against a dark background, lacking environmental context.
- **Remediation:** Introduce subtle wood grain, marble counter, and ambient lighting backdrop textures behind cards to ground the physical hardware context.

### Template Gallery (Section 05)
- **Deficiency:** Cards rely primarily on color box variations rather than structural architectural layout differences.
- **Remediation:** Build 10 distinct template preview layouts (serif vs sans, tasting menu single column vs dual-column drink cards, grid image cards, Indian border accents).

### Device Frame Inconsistencies
- **Deficiency:** Device mockups across sections 01, 03, 06, and 09 have slightly varying border radii and lack uniform glass reflection overlays.
- **Remediation:** Standardize all phone mockups around a unified `iPhone16ProFrame` component.

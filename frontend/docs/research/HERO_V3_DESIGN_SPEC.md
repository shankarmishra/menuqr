# HERO V3 Design Spec

## Global Color System
- Background: #FAFAF7 (Warm off-white)
- Pure White: #FFFFFF
- Deep Emerald: #151C19
- Emerald Surface: #1D2723
- Brand Orange: #E8783C
- Gold: #FFC928
- Veg Green: #34B56A
- Non-Veg Red: #FF5E4D
- Text: #151C19
- Muted: #626776

## Layout & Composition
- **Desktop**: Left text (45%), Right visual scene (55%). Visual scene sits in a 1000px perspective box for depth.
- **Mobile**: Eyebrow -> Headline -> Copy -> CTAs -> Visual Scene -> Micro Proof Row.
- **Depth**: Background video environment, midground Physical QR, foreground Customer Phone.

## Core Visual Storytelling Sequence
1. **Idle**: Restaurant environment established. Physical QR on table.
2. **Focus**: Subtle blur, "Scan to view menu" prompt appears.
3. **Scanning**: Customer phone moves in. Camera view active with scanline.
4. **Detected**: Camera recognizes QR code.
5. **Menu Open**: Phone displays digital menu (The Garden).
6. **Menu Update**: Restaurant dashboard slides in, updates price of Paneer Tikka from ₹240 to ₹280. Phone menu dynamically reflects the new price.
7. **Same QR Proof**: Final validation reading "SAME QR. NEW PRICE." appears, anchoring the core message that the physical QR stand did not change.

## Assets
- Video/Poster assets are rendered via `<video>` elements with photorealistic placeholders for restaurant, scanning sequence, and physical stand.
- QR code is a crisp, valid inline SVG matching MENUQR branding.

# HERO V2 ASSET LICENSES

This document tracks all external media assets used in the Hero V2 section to ensure commercial safety.

## 1. Video Assets (To Be Generated)

### `restaurant-scene.webm`
- **Source**: AI Generated (Runway Gen-3 / Luma)
- **Creator**: In-house generation via prompt (see `HERO_V2_VIDEO_PROMPTS.md`)
- **License**: Commercial rights owned by prompt creator (Standard for paid AI tiers)
- **Usage**: Background environment
- **Modification**: Compressed to WebM, cropped for responsive layouts.
- **Attribution**: None required.

### `restaurant-scan.webm`
- **Source**: AI Generated
- **Creator**: In-house generation
- **License**: Commercial rights owned
- **Usage**: Scan interaction layer
- **Attribution**: None required.

## 2. Static Assets

### `hero-poster.webp`
- **Source**: Extracted frame from `restaurant-scene.webm`
- **License**: Same as video (Owned)
- **Usage**: `<video poster="...">` fallback for low bandwidth/mobile.

### iPhone Mockup
- **Source**: DOM/CSS Native implementation (`HeroPhone.tsx`)
- **Creator**: Built in-house based on standard device dimensions.
- **License**: Owned code. No Apple trademarks/logos used.
- **Usage**: Phone container for UI.

### QR Code
- **Source**: SVG `<path>` generated dynamically or hardcoded inline.
- **License**: N/A (Mathematics/Code)
- **Usage**: The physical QR code overlay.

## 3. Lottie / External Animations
- **None**. All animations are built natively using React and Framer Motion to avoid licensing/attribution conflicts.

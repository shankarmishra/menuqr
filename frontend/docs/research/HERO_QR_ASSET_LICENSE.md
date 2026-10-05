# LOTTIEFILES QR ASSET LICENSING RESEARCH

## Overview
LottieFiles hosts thousands of "Free" animations, but commercial usage rights vary depending on the creator and the specific license applied (e.g., Lottie Simple License vs. CC BY 4.0). 

## Analysis of Candidate Assets
If we search `https://lottiefiles.com/free-animations/qr-code`:

1. **Asset**: "QR Code Scan" by various creators.
   - **Format**: `.lottie`, `.json`.
   - **Visuals**: Often a glowing blue/green laser passing over a QR code.
   - **Licensing Risk**: Many free assets require attribution (Creative Commons Attribution). Putting an attribution link in the hero section of a premium SaaS product breaks the immersion and looks unprofessional.

2. **Asset**: "QR Code Success"
   - **Licensing Risk**: Even if CC0 (Public Domain) or Lottie Simple License, the styling rarely matches our specific brand colors (Deep Emerald and Warm Orange) out of the box, requiring complex CSS variable mapping or direct JSON editing.

## Decision: DO NOT USE LOTTIEFILES
Given the strict requirement for a premium, non-generic aesthetic, and the risk of ambiguous licensing or mandatory attribution in a commercial hero section, we will **NOT** use Lottie assets.

### Alternative Approach (Approved)
We will build the scan behavior completely natively using:
- **React/DOM**: For the camera viewfinder brackets.
- **Framer Motion**: For the scan line and focus transition.
- **SVG**: For the actual MENUQR QR code.

**Benefits:**
- 100% Commercial safe (we own the code).
- Zero attribution required.
- Matches the `#E8783C` and `#34B56A` brand colors perfectly.
- Lighter payload than loading the Lottie-web player.

# CLIENT PANEL V2 VISUAL QA REPORT

## Tested User Journeys & Verified Viewports

### 1. Template Marketplace Studio (`/app/appearance`)
- **Verified Viewports:** 1440px, 1280px, 1024px, 768px, 390px.
- **Visual Checks:** Search filtering works instantly. All 12 category chips filter 20 designs. Rendered mini-menu cards display actual restaurant typography, borders, and colors. Full Preview modal renders live phone frame correctly.

### 2. Menu Studio & Split Screen (`/app/menu`)
- **Verified Viewports:** 1440px, 1280px, 1024px, 768px, 390px.
- **Visual Checks:** Left column dish cards display Veg (green #34B56A) & Non-Veg (red #FF5E4D) dots. Inline price editing updates live preview instantly. Availability toggle instantly updates live preview.

### 3. Permanent QR Studio & Production Animation (`/app/qr`)
- **Verified Viewports:** 1440px, 1280px, 1024px, 768px, 390px.
- **Visual Checks:** "Run Production Animation" triggers 7-phase sequence in modal. "Test Real-Time QR Invariance" proves price updates leave QR code unchanged. Physical stand mockups render accurately. High-res PNG & SVG downloads work cleanly.

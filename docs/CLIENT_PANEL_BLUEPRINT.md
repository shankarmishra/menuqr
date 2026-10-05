# MENUQR Client Panel — Complete Product Blueprint

This document captures the core product vision, layout strategy, and functional architecture for the MENUQR Client Panel (the restaurant owner's dashboard).

## 1. Product Vision
The Client Panel is NOT a standard CRUD application. It is a **premium restaurant-management workspace**.
- **Fast, visual, simple**.
- Every action must have an **immediate visual preview**.
- The main jobs are: Menu Creation → Update → QR Use → Appearance Change → Subscription Maintenance.

## 2. Dashboard Structure
Main Navigation (Sidebar on Desktop, Drawer on Mobile):
1. Overview
2. Menu (Categories, Items)
3. Appearance
4. QR Center
5. Subscription
6. Restaurant Profile
7. Settings
8. Help

## 3. Core Principles
- **No giant gradients / Fake Metrics:** Stats must be real and useful (e.g., '42 Items', '7 Categories', '86 Days Left').
- **The "SAME QR" USP:** Remind the user constantly that updating the menu or renewing the subscription means the *physical QR code remains unchanged*.
- **Left/Right Split View:** Almost everywhere possible, editing controls are on the LEFT, and a **Live Phone Preview** is on the RIGHT.
- **Fast Edits:** Price edits and availability toggles must be lightning fast (e.g. click to edit price -> enter -> save).
- **Premium Themes:** Avoid tech grids or neon. Use #151C19 (Canvas), #202A26 (Surface), #E8783C (Primary), and #D4AF37 (Highlight).

## 4. Specific Section Guidelines

### Overview / Dashboard Home
- Top Greeting: "Good evening, [Restaurant Name]" with a "Live" indicator.
- Hero Card emphasizing the Permanent QR.
- Four main stat cards.
- Quick Actions (+ Add Item, Customize Menu, Open QR Center).
- Lightweight Recent Activity.

### Menu Editor
- Clean workspace organized by Categories.
- Drag-and-drop reordering with soft spring animations (no exaggerated bouncing).
- Add Item uses a right-side drawer (not a full new page).
- **Availability Toggle:** 1-click ON/OFF that reflects live instantly.
- **Veg/Non-Veg:** Strictly use #34B56A and #FF5E4D.

### Appearance
- Do not use abstract color swatches. Show **actual visual template thumbnails**.
- Selected state has an orange outline and check badge.
- Live preview transitions smoothly between templates without a full page reload.
- Curated customization (Logo, Cover, Name, Accent Color). Don't let users break the design.

### QR Center (Implemented)
- High-Res Download (PNG/SVG).
- Live preview of the QR code with Brand Colors and Corner Shape customization.

### Subscription
- Clear states: Active, Warning (10 days left), Expired.
- Emphasize that renewing reactivates the SAME QR code.

## 5. Security & Multi-Tenancy
- The backend dictates tenant separation. Never trust 	enantId from the frontend payload directly.
- The QR Code relationship points to the restaurant's stable slug (/menu/the-artisan), NOT a static JSON blob.

## 6. What NOT to Build
- Do NOT build a POS system, inventory management, payroll, CRM, or table reservations for V1.
- Stick strictly to: Digital Menu + Permanent QR + Restaurant Menu Management.

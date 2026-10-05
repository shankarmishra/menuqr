# CLIENT MENU EDITOR SPECIFICATION

## 1. Split Workspace Architecture
The Menu Studio (`src/pages/app/Menu.tsx`) provides a side-by-side workspace:
- **Left Column:** Category tabs, search filtering, dish list with fast inline price editing, availability toggles (● Live / ○ Off), Veg/Non-Veg indicators (#34B56A / #FF5E4D), edit & delete buttons, and slide-over Add/Edit Item Drawer.
- **Right Column:** High-end Phone Frame rendering the live customer menu using `MenuTemplateRenderer`.

## 2. Instant Feedback Protocol
- **Inline Price Edit:** Clicking any item price (e.g. ₹280) turns it into an active input field. Hitting Enter or clicking ✓ immediately updates the state and re-renders the Live Phone Preview.
- **Availability Toggle:** 1-click toggles live availability on the customer menu.
- **Slide-over Drawer:** Smooth spring animation drawer for adding or editing full dish details.

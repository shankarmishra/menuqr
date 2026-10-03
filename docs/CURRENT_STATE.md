# CURRENT STATE AUDIT REPORT

## 1. WHAT ALREADY WORKS
* **Frontend Web App**: React 19 + Vite setup is fully functional.
* **Customer Menu (`/menu/:slug`)**: Basic rendering of menu items grouped by category, searchable, and filtered by veg/non-veg.
* **Super Admin Panel (`/admin`)**: A centralized dashboard that lists all clients (restaurants, dhabas, cafes).
* **Client Onboarding Form**: Multi-step form to create a new client and define their menu items.
* **Menu Items Editor**: React-based form to add/edit menu items with prices, categories, and diet types.
* **QR Code Generator**: Generates a standard QR code pointing to `/menu/:slug`.
* **Backend API**: Node.js + Express/HTTP API functioning with basic CRUD for clients.
* **Database**: PostgreSQL integration works; clients are stored as relational tables. (Historically MongoDB)
* **Authentication**: Basic Super Admin login using a single global password and session token.

## 2. WHAT PARTIALLY WORKS
* **Theming**: Currently, categories have assigned colors, but there is no dedicated "Theme Engine" or "Template Selection" for restaurants.
* **QR Permanence**: Relies entirely on the `menuSlug` not changing, but there is no robust underlying QR mapping ID.
* **Image Management**: Fields exist for `heroImage` and `image` (URL strings), but there is no integrated file upload/compression system.

## 3. WHAT IS BROKEN / MISSING
* **Restaurant Panel (Tenant Portal)**: Does NOT exist. Currently, the Super Admin manages *everything* for *everyone*. Restaurants cannot log in to manage their own menus.
* **Subscription Management**: Missing. The database has `plan`, `billingCycle`, and `status`, but no actual lifecycle logic, expiry dates, or enforcement.
* **Subscription Enforcement**: Public menus are served indefinitely. There is no block at expiry.
* **Analytics**: No tracking of QR scans or menu views.

## 4. WHAT SHOULD REMAIN
* **Tech Stack**: React 19, Vite, Tailwind CSS, Framer Motion, Node.js, PostgreSQL.
* **Public Menu Foundation**: The fast, mobile-optimized approach to the customer menu is good and should be expanded upon.
* **Admin Layout Foundation**: The sidebar and basic structure of the admin panel are solid.

## 5. WHAT SHOULD BE REFACTORED
* **Data Model**: Separate `Client` (SaaS tenant/restaurant account) from `Menu` and `Subscription`.
* **Authentication**: Refactor to support JWT or robust session management for *multiple* roles (Super Admin vs. Restaurant Owner).
* **Menu Slug / QR Resolution**: Create a robust resolution mechanism that maps a permanent QR ID to a Menu, even if the slug changes.

## 6. WHAT SHOULD BE REMOVED
* **Global Admin Assumption**: Remove the assumption that `/admin` is the only authenticated area. It needs to be split into `/admin` (Super Admin) and `/app` (Restaurant Panel).

## 7. WHAT MUST BE ADDED
* **Subscription Enforcement Middleware**: Backend logic to block menu rendering if the subscription is expired.
* **Restaurant Owner Accounts**: Login, tenant isolation, and dedicated dashboard.
* **Theme & Template Engine**: Reusable menu layout templates and color configuration.
* **Notification Engine**: Robust 10-day expiry warnings and automated alerts.

## 8. SECURITY RISKS
* **Lack of Tenant Isolation**: Since there are no restaurant accounts yet, the API currently only checks for the global Admin session. Once restaurant accounts are added, IDOR (Insecure Direct Object Reference) vulnerabilities will be a high risk if tenant isolation is not strictly enforced.
* **Public API Abuse**: The `/api/public/menus/:slug` endpoint lacks rate limiting, making it susceptible to scraping or DoS attacks.

## 9. UX PROBLEMS
* **No Restaurant Autonomy**: Restaurant owners must contact the Super Admin to change a price.
* **Infinite Scroll / Rendering**: Customer menu renders all items at once; a restaurant with 500 items will experience DOM lag.

## 10. ARCHITECTURE RISKS
* **Monolithic Client Record**: Storing all menu items directly inside the `Client` document (`input.menuItems` array up to 300 items) will lead to massive document sizes and update conflicts. Menu items should be separate relational tables.

## 11. PERFORMANCE RISKS
* **Image Loading**: Raw image URLs are used without a CDN, lazy loading, or resizing pipeline, which will severely impact the customer menu load time on mobile networks.


# MenusQR — MASTER PRODUCT SPECIFICATION

## 1. Executive Summary
MenusQR is a B2B SaaS platform that modernizes how restaurants, cafes, and dhabas present their menus. By providing a permanent QR code paired with a dynamic, highly customizable digital menu, the platform eliminates the need for recurring printing costs. MenusQR ensures that menu updates (prices, availability, new items) are reflected instantly while maintaining a strict subscription-based access model. 

## 2. Product Vision
To be the most reliable, fast, and premium digital menu infrastructure for food businesses, bridging the gap between physical dining and digital convenience without requiring app installations.

## 3. Target Users
1. **Public Customers**: Diners visiting the restaurant who scan the QR code to view the menu on their mobile devices.
2. **Restaurant Owners / Managers**: The primary SaaS tenants who purchase subscriptions, manage menu items, update prices, and track performance.
3. **Super Admins**: The MenusQR platform operators who manage the overall SaaS health, billing, tenant lifecycle, and templates.

## 4. User Personas
* **Ravi (Dhaba Owner)**: Low technical literacy. Needs a dead-simple way to turn items "off" when they run out. Uses a smartphone for all management.
* **Priya (Fine Dining Manager)**: High technical literacy. Cares deeply about branding, typography, and premium aesthetics. Needs multiple templates and high-res image support.
* **Arjun (Customer)**: Hungry, impatient, poor 4G connection. Needs the menu to load instantly without lag or app downloads.

## 5. Product Value Proposition
> "Update your menu endlessly without ever changing your QR code."
MenusQR saves printing costs, allows real-time dynamic pricing, improves hygiene, and elevates the dining experience through beautiful, customizable digital menus.

## 6. Core Product Flow
1. **Onboarding**: Restaurant registers and purchases a subscription.
2. **Setup**: Restaurant configures profile and inputs menu items (or uploads a CSV).
3. **Theming**: Restaurant selects a premium template and brand colors.
4. **QR Generation**: Platform generates a permanent, unique QR code.
5. **Deployment**: Restaurant prints the QR and places it on tables.
6. **Dining**: Customer scans QR → Server validates subscription → Menu loads.
7. **Maintenance**: Restaurant updates prices dynamically via the mobile-friendly dashboard.

## 7. Business Rules
* **QR Permanence**: A generated QR code is permanently tied to the restaurant's public identity. Updating the menu, theme, or restaurant details MUST NEVER invalidate or regenerate the primary QR code.
* **Subscription Enforcement**: Public access to the digital menu is strictly contingent upon an active subscription.
* **Tenant Isolation**: Restaurant A must never have API or dashboard access to Restaurant B's data.

## 8. Subscription Lifecycle
* `ACTIVE`: Subscription is paid and valid. Menu is publicly accessible.
* `EXPIRING_SOON`: (10 days prior to expiry). Menu remains publicly accessible. Persistent dashboard warnings activate.
* `EXPIRED`: Subscription lapsed. Public menu access is **BLOCKED** and replaced with a "Menu Unavailable" screen. Dashboard access remains for renewal purposes.
* `SUSPENDED`: Manually blocked by Super Admin (e.g., policy violation). Public menu blocked.

## 9. QR Lifecycle
* **Creation**: Generated upon first successful onboarding. Maps to a unique identifier (e.g., `/m/rest-id`).
* **Active Use**: Scanned by diners. Resolves to the active menu if the subscription is valid.
* **Expired Use**: Scanned by diners. Resolves to the "Menu Unavailable" screen. The QR code is NOT deleted.
* **Renewal**: Upon subscription renewal, the EXACT SAME QR code seamlessly resumes serving the active menu.

## 10. Restaurant Panel
The core SaaS portal for tenants (Desktop & Mobile responsive).
* **Dashboard**: Key metrics (Menu Status, Scans, Days Left).
* **Menu Builder**: Categories and Items CRUD.
* **Appearance**: Template selection, color themes, logo upload.
* **QR Center**: Download SVG/PNG, print guidelines.
* **Subscription**: Plan details, renewal billing.
* **Settings**: Restaurant profile, opening hours, contact info.

## 11. Super Admin Panel
The internal tool for MenusQR operators.
* **Dashboard**: Total active tenants, MRR, system alerts.
* **Restaurants**: Global list of all tenants, impersonation, suspension toggle.
* **Subscriptions**: Expiry tracking, manual renewals, payment overrides.
* **Audit Logs**: Global system logs for security.

## 12. Public Marketing Website
A high-converting SaaS landing page.
* **Hero**: Clear value prop + interactive QR-to-Phone animation.
* **Features**: "One QR, Countless Updates" visual demonstration.
* **Templates**: Gallery of available menu designs.
* **Pricing**: Transparent tiered subscription plans.

## 13. Customer Digital Menu
The end-user experience upon scanning.
* **Header**: Restaurant branding, name, location.
* **Navigation**: Sticky category pills, Search bar, Veg/Non-Veg toggles.
* **Item Grid**: Fast-loading cards with images, dietary badges, and prices.
* **Performance**: Sub-second First Contentful Paint (FCP), heavily cached, CDN-backed images.

## 14. Menu Builder
A highly intuitive, non-technical editor.
* **Option B (Draft → Publish)** is recommended to prevent accidental broken menus during bulk edits.
* Support for variants (Half/Full), dietary tags (Veg/Vegan), and quick availability toggles (Instantly mark "Out of Stock").

## 15. Theme System
A robust configuration engine (not hardcoded separate apps).
* Uses a `themeConfig` object: `{ templateId, primaryColor, font, borderRadius }`.
* Prevents inaccessible color combinations via contrast checking algorithms before saving.

## 16. Template System
Professionally designed layouts injected via the Theme System.
* `Template 01 - Minimal`: Clean, text-heavy, high contrast.
* `Template 02 - Premium Dark`: Luxury aesthetic, dark canvas, gold/accent highlights.
* `Template 03 - Visual`: Image-heavy, Pinterest-style masonry grid for cafes/bakeries.
* Templates vary structurally (e.g., sticky headers vs. bottom sheets) not just in CSS colors.

## 17. Authentication
* **Super Admin**: JWT or secure HTTP-only session cookies. Global access.
* **Restaurant Owner**: JWT or secure HTTP-only session cookies scoped tightly to their `tenantId`.
* **Public Customer**: No authentication required to view active menus.

## 18. Authorization
* Role-Based Access Control (RBAC).
* Endpoints like `PUT /api/restaurants/:id/menu` must assert that the authenticated user actually owns `:id`.
* The `requireSubscription` middleware enforces that `GET /api/public/menus/:id` only returns 200 OK if the subscription is active.

## 19. Multi-Tenant Architecture
* Logical isolation via `tenantId` (or `clientId`) foreign keys on all documents (Menu Items, Analytics, Subscriptions).
* Enforced at the database query level (e.g., `db.menuItems.find({ tenantId: req.user.tenantId })`).

## 20. Data Model
* `Users` (Super Admins and Restaurant Owners)
* `Clients / Tenants` (Restaurant Profile, Settings, ThemeConfig)
* `Subscriptions` (Plan, Status, Expiry)
* `MenuItems` (Normalized collection linked to Client)
* `MenuCategories` (Defines sort order and visibility)
* `QRCodes` (Permanent mapping to a Client)

## 21. API Architecture
* RESTful JSON API using Node.js & Express.
* **Namespaces**:
  * `/api/admin/*` - Super Admin restricted.
  * `/api/tenant/*` - Restaurant Owner restricted.
  * `/api/public/*` - Unauthenticated, highly cached, read-only.

## 22. Analytics
* Lightweight event tracking.
* Events: `QR_SCAN`, `MENU_VIEW`, `CATEGORY_CLICK`.
* Tracked asynchronously to avoid blocking the customer menu load time.

## 23. Notifications
* **System**: Centralized notification queue (PostgreSQL `notifications` table).
* **Delivery**: Resend API for email delivery.
* **Logic**: Automated CRON job checks `expiryDate - 10 days` to inject `WARNING` alerts into the Restaurant Panel.

## 24. Security
* **No Sensitive Data in QR**: QR code only contains `https://MenusQR.in/m/CLIENT_PUBLIC_ID`.
* **IDOR Prevention**: All tenant routes must validate ownership.
* **Rate Limiting**: Apply strict limits to login endpoints and public menu endpoints to prevent scraping.
* **Secrets**: `DATABASE_URL`, `JWT_SECRET`, and `RESEND_API_KEY` stored securely in environment variables.

## 25. SEO
* **Marketing Site**: Full semantic HTML, OpenGraph tags, high lighthouse score.
* **Customer Menu**: `robots="noindex, nofollow"` to prevent Google from indexing private restaurant URLs, unless the restaurant explicitly opts in.

## 26. Accessibility
* Target: WCAG 2.2 AA.
* High contrast defaults in templates.
* `aria-live` regions for dynamic menu filtering.
* Keyboard-navigable Restaurant Panel and Marketing Site.
* Touch targets > 44px on mobile menus.

## 27. Performance
* **Images**: Processed via CDN (e.g., Cloudinary) for WebP/AVIF compression.
* **Caching**: Redis or aggressive HTTP `Cache-Control` headers for public menu data, invalidated on publish.
* **Bundle Size**: Vite code-splitting to ensure the customer menu payload is < 150kb JS.

## 28. Responsive Rules
* **Customer Menu**: Mobile-first design (320px to 430px optimized). Desktop views center the mobile frame or use a tailored grid.
* **Restaurant Panel**: Fully fluid (Mobile, Tablet, Desktop). Crucial actions (toggling availability, changing price) must be thumb-accessible.

## 29. Animation Rules
* Powered by Framer Motion.
* `duration: 0.2s` for micro-interactions (buttons, toggles).
* `duration: 0.4s` for page transitions (spring physics).
* Respect `prefers-reduced-motion` media queries globally.

## 30. Design System
* **Colors**: Base `#151c19` (Dark Emerald) with `#e8783c` (Orange) as the primary brand accent.
* **Typography**: Clean Sans-Serif (e.g., Inter or system-ui) for legibility.
* **Spacing**: 4px baseline grid (4, 8, 12, 16, 24, 32, 48, 64).
* **Radius**: Standardized tokens (`sm: 4px`, `md: 8px`, `lg: 12px`, `pill: 9999px`).

## 31. Component System
Reusable UI library encompassing:
* `Button` (variants: solid, outline, ghost)
* `Input`, `Select`, `Toggle`
* `Toast` (global notification manager)
* `Skeleton` (loading shimmers)
* `MenuItemCard` (Customer public UI)
* `MenuEditorRow` (Restaurant Admin UI)

## 32. Error States
* **Expired Subscription**: "This menu is temporarily unavailable. Please contact the restaurant." (No system info leaked).
* **Invalid QR**: 404 page styled with MenusQR branding.
* **Network Failure**: "Unable to load menu. Check your connection." with a `[Retry]` button.

## 33. Loading States
* Avoid blank white screens.
* **Initial App Load**: Branded bouncing ChefHat loader (already implemented).
* **Data Fetching**: Skeleton loaders mimicking the shape of the expected content (e.g., image placeholders and text bars).

## 34. Empty States
* **No Menu Items**: "Your menu is empty. Add your first dish to get started." + CTA button.
* **No Notifications**: "You're all caught up!"
* Illustrations should be warm, friendly, and culinary-themed.

## 35. Edge Cases
* **Slug Change**: If a restaurant changes its slug (`/menu/old-cafe` to `/menu/new-cafe`), the permanent QR ID (`/m/12345`) simply resolves to the new slug. The printed QR is unaffected.
* **Massive Menus**: For >200 items, implement virtualization (e.g., `@tanstack/react-virtual`) so the browser DOM doesn't crash on budget smartphones.

## 36. Failure Scenarios
* **Database Down**: Serve static 500 error page gracefully.
* **CDN Down**: Fallback to text-only menu rendering; images gracefully collapse.

## 37. Migration Strategy
* Current monolithic `Client` documents must be parsed. The `menuItems` array must be extracted into the new `MenuItems` collection, setting the `tenantId` to the parent Client's ID.
* Existing slugs must be mapped to new permanent QR IDs, and new QR codes generated internally without breaking legacy slug access.

## 38. Implementation Phases
* **PHASE 0**: Audit + Architecture (Current Phase)
* **PHASE 1**: Database Normalization + Tenant Auth
* **PHASE 2**: Restaurant SaaS Panel Foundation
* **PHASE 3**: Menu Builder Refactor
* **PHASE 4**: Theme Engine & Templates
* **PHASE 5**: Permanent QR & Subscription Enforcement
* **PHASE 6**: Customer Menu Polish
* **PHASE 7**: Super Admin Tools
* **PHASE 8**: Marketing Website & Production Readiness

## 39. Testing Strategy
* **Unit Tests**: Business logic (`validateClient`, `checkSubscriptionStatus`).
* **Integration Tests**: Core API flows (`POST /api/tenant/menu` → `GET /api/public/menus/:id`).
* **E2E Tests**: Cypress or Playwright testing the customer scanning flow and checkout/cart interaction.

## 40. Production Checklist
* [ ] Database indexes applied (`tenantId`, `qrId`).
* [ ] CORS strictly locked to frontend origins.
* [ ] Environment variables validated on startup.
* [ ] CDN configured and caching rules verified.
* [ ] Daily database backups enabled.
* [ ] HTTPS enforced on all public traffic.
* [ ] Error tracking (Sentry) and uptime monitoring configured.

---
**End of Specification.**
*DO NOT COMMENCE IMPLEMENTATION UNTIL AUTHORIZED.*

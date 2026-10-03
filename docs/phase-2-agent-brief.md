# Phase 2 Agent Brief: Restaurant Panel Foundation

## Phase Goal
Build the core foundation of the Restaurant Owner dashboard (`/app`), replacing the single-admin UI with a proper multi-tenant SaaS layout. Implement the required backend APIs to support this dashboard.

## File Ownership Map
- **Agent A (Backend):** `backend/server.js`, `backend/schema.sql`, `backend/db.js`
- **Agent B (Frontend):** `frontend/src/pages/app/**`, `frontend/src/components/layout/**`, `frontend/src/hooks/**`
- **Agent C (UI/UX):** `docs/research/PHASE_2_UI_RESEARCH.md`, `frontend/src/styles/**`, `frontend/src/components/ui/**`
- **Agent D (QA):** `tests/**`, `docs/PHASE_2_QA.md`

## Scope by Agent
### Agent A (Backend/Data/Security)
- Build APIs: `GET /api/app/profile`, `GET /api/app/dashboard`, `GET /api/app/subscription`, `GET /api/app/qr`, `PATCH /api/app/settings`.
- Enforce `enforceTenant` middleware for all `/api/app/*` routes.
- Validate inputs securely. No full menu CRUD yet.

### Agent B (Frontend/Product)
- Build the App Shell (`/app`) with a responsive sidebar and mobile header.
- Implement sub-routes: Dashboard, Menu, Appearance, QR Center, Subscription, Settings.
- Connect state and handle loading/error states for fetching tenant data.

### Agent C (UI/UX Research & Design)
- **Research first:** Review modern SaaS dashboards, restaurant tech (Toast, Square, etc). Create `PHASE_2_UI_RESEARCH.md`.
- Ensure the design aligns with the established brand (Dark Emerald `#151c19`, Card Surface `#1d2723`, Primary Orange `#e8783c`).
- Draft the Design Specification, then apply styles and animations to Agent B's components.

### Agent D (QA/Integration)
- Write integration tests.
- Verify tenant isolation (cross-tenant access should fail).
- Verify responsive layout across breakpoints (320px to 1440px).
- Verify WCAG 2.2 AA accessibility (keyboard nav, contrast).

## Dependencies & Risks
- **Dependency:** Agent B and C must collaborate on the frontend structure. Agent B builds the wireframe components; Agent C styles them. Agent A must finalize API contracts early.
- **Risk:** Routing conflicts with the existing `/admin` legacy routes. Make sure `/app` is strictly separated.

## Acceptance Criteria
1. Restaurant Owner can log in and land on `/app`.
2. App shell displays Sidebar (desktop) and Hamburger menu (mobile).
3. APIs correctly fetch data scoped ONLY to the logged-in user's `tenant_id`.
4. UI is visually premium, matching the brand guidelines.
5. All breakpoints are verified. No horizontal scrolling.

# PHASE 3 IMPLEMENTATION PLAN

## Overview
This document outlines the master execution plan for making MENUQR work end-to-end with real PostgreSQL persistence and API integrations, replacing all frontend mocks. 

## 1. Inspection & State
- Database: basic schema exists (`users`, `clients`, `menus` etc.), missing `appearance_settings` and `qr_codes` properly integrated.
- Auth: basic JWT/session auth exists, but tenant isolation needs strict enforcement.
- Frontend: `Menu.tsx`, `Appearance.tsx`, `QrCenter.tsx`, `Dashboard.tsx` all rely on mock data (`DEMO_RESTAURANT`, `setTimeout`).
- Payment/Signup: Marketing UI exists, but no real signup to payment pipeline.

## 2. Multi-Agent Team

### Group 1: Foundation (Parallel Execution)
- **AGENT A (DB/Backend)**: Expand `schema.sql`, add `appearance_settings`, refine FKs, setup `db.js` helpers for new tables. Owns the DB foundation.
- **AGENT B (Auth/Signup/Payment)**: Implement full signup flow, Stripe test mode (or similar fake payment hook), account activation.
- **AGENT G (Admin)**: Connect admin dashboard with real APIs, build endpoints to fetch all restaurants, subscriptions.
- **AGENT I (Security/Tenant Isolation)**: Review `auth.js` and `server.js` to ensure `tenant_id` is always derived from token and enforced across all routes.

### Group 2: Core Product (Parallel Execution)
- **AGENT C (Menu Builder)**: API endpoints for `menus`, `menu_categories`, `menu_items`. React Query/fetch hooks in `Menu.tsx`. Replace `DEMO_RESTAURANT`.
- **AGENT D (Template Studio)**: API for `appearance_settings`. Update `Appearance.tsx` to persist and load chosen template, logo, etc.
- **AGENT E (QR Studio)**: Idempotent QR generation API. Update `QrCenter.tsx`. Serve actual public customer menu resolving from QR slug.
- **AGENT F (Subscription)**: Subscription API, expiry logic, 10-day warnings in Dashboard. QR blocking logic on expiry.
- **AGENT H (UX Integration)**: Global loading states, error states, and Toast notifications connected to real API errors across Client panel.

### Group 3: QA & Validation
- **AGENT J (E2E QA)**: Run the Master E2E Test through Playwright/browser automation. Validate every step from Signup to Renew.

## 3. Git & Integration Strategy
- Commit regularly with `feat: phase 3 [module]` messages.
- Pause and verify integration (TypeScript build, backend startup) after Group 1 and Group 2.
- Conflict resolution: Orchestrator handles overlapping file modifications explicitly.

# MIGRATION NOTES (v1)

## Overview
This document covers the Phase 1 schema migration from the legacy monolithic `Client` structure to a normalized multi-tenant architecture.

### Old Structure
The legacy `clients` collection stored all data inside a single document:
```json
{
  "id": "tenant_123",
  "businessName": "Cafe",
  "menuSlug": "cafe-slug",
  "menuItems": [
    { "id": "item_1", "name": "Coffee" }
  ]
}
```

### New Structure
Data is decoupled across specific bounded contexts:
- `clients`: Contains only business details, branding, and contact info. Receives a new immutable `publicId`.
- `menuItems`: Independent collection. Each item links to `tenantId`.
- `qrCodes`: Independent collection resolving `qrId` to a `publicId` (and by extension, the active menu).
- `subscriptions`: Independent collection tracking `tenantId`'s billing plan and expiry.

### Migration Mapping
1. **publicId**: Auto-generated `cl_...` identifier injected into `clients`.
2. **menuItems**: Plucked from `clients` and bulk inserted into `menuItems` using `upsert` with `tenantId = client.id`.
3. **subscriptions**: A default 1-year 'Starter' subscription is generated with `status = 'Active'` to ensure existing clients are not instantly locked out.
4. **qrCodes**: A default `qr_...` code is mapped to the new `publicId`.

## Legacy Client Account Handling
### Challenge
Legacy clients have business profiles but **do not possess Restaurant Owner (User) accounts**, and therefore cannot log in yet.

### Safe Workflow
* We **DO NOT** invent random plaintext passwords.
* We **DO NOT** create `User` accounts automatically during migration.
* **Phase 2 Workflow**:
  1. The Super Admin panel will expose a new "Send Invite" button next to legacy clients.
  2. Clicking this generates a secure, single-use activation link.
  3. The restaurant owner receives an email (via Resend), clicks the link, and establishes their own password.
  4. Only then is the `User` record created in MongoDB, bound safely to the existing `tenantId`.

## Rollback Considerations
* The migration script (`migrate-v1.js`) does **not** `delete` the legacy `client.menuItems` array from the `clients` collection.
* This ensures that if the new endpoints fail, a quick rollback to the old API routes is perfectly safe without data loss.
* Once the UI fully adopts the decoupled `menuItems` endpoints in Phase 2, a cleanup script can safely prune the old arrays.

## Migration Result Status
* **IMPLEMENTED**: Migration script logic built.
* **NOT VERIFIED**: Real-world execution count pending local MongoDB availability testing.

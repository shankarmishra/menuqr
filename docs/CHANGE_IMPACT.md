# CHANGE IMPACT ANALYSIS

This document maps the proposed architectural changes to the existing codebase, highlighting affected layers and associated risks.

## 1. Restaurant Tenant Accounts
* **Required Change**: Introduce distinct user accounts for Restaurant Owners.
* **Affected Frontend**: 
  * Require new `/login` flow for restaurants.
  * Require new `/app/*` routing for the Restaurant Panel.
* **Affected Backend**: 
  * New authentication endpoints (`/api/auth/restaurant/login`).
  * Middleware for tenant isolation (`requireRestaurantAuth`).
* **Affected Database**: 
  * New `Users` or `Accounts` collection.
* **Risk**: High (Core security and routing change).
* **Priority**: P0

## 2. Subscription Expiry Enforcement
* **Required Change**: Block public menu access when a subscription is expired.
* **Affected Frontend**: 
  * `MenuPage.tsx` must handle `403 Forbidden` or `Payment Required` state and display the "Menu Unavailable" screen.
* **Affected Backend**: 
  * `GET /api/public/menus/:slug` must check `subscription.status` and `subscription.expiryDate`.
* **Affected Database**: 
  * `Clients` collection needs robust subscription lifecycle fields (or a separate `Subscriptions` collection).
* **Risk**: High (Critical business rule).
* **Priority**: P0

## 3. Permanent QR Resolution
* **Required Change**: Decouple QR codes from mutable slugs.
* **Affected Frontend**: 
  * `QrGenerator.tsx` must generate QR pointing to a permanent ID (e.g., `/m/:qrId`) instead of `/menu/:slug`.
* **Affected Backend**: 
  * New endpoint to resolve `/m/:qrId` to the active menu slug.
* **Affected Database**: 
  * New `QRCodes` collection or `qrId` field on the `Client`.
* **Risk**: Medium.
* **Priority**: P0

## 4. Menu Data Normalization
* **Required Change**: Move `menuItems` out of the monolithic `Client` document into a dedicated collection for scalability.
* **Affected Frontend**: 
  * `MenuItemsEditor.tsx` needs to save items independently rather than sending the entire 300-item array on every keystroke/save.
* **Affected Backend**: 
  * New CRUD endpoints for `/api/menu-items`.
* **Affected Database**: 
  * New `MenuItems` collection linked by `clientId`.
* **Risk**: High (Data migration and rewrite of core editor).
* **Priority**: P1

## 5. Theme & Template Engine
* **Required Change**: Allow restaurants to select from 12+ templates and customize colors.
* **Affected Frontend**: 
  * `MenuPage.tsx` must dynamically import or switch layouts based on `templateId`.
  * Inject CSS variables for custom colors.
* **Affected Backend**: 
  * Save `themeConfig` JSON object.
* **Affected Database**: 
  * `themeConfig` field added to the Menu/Client.
* **Risk**: Low (Additive UI feature).
* **Priority**: P1

## 6. Image Management & CDN
* **Required Change**: Prevent heavy raw images from slowing down the public menu.
* **Affected Frontend**: 
  * Replace native `<input type="url">` with a file uploader.
* **Affected Backend**: 
  * Integration with S3/R2/Cloudinary for image uploads.
* **Affected Database**: 
  * Store optimized CDN URLs.
* **Risk**: Medium (Infrastructure dependency).
* **Priority**: P1

# PHASE 3 API CONTRACT

## 1. Auth & Onboarding
- `POST /api/auth/signup` - Creates user, client (restaurant), and starts subscription trial.
- `POST /api/auth/login` - Authenticates user, creates session.
- `POST /api/auth/logout` - Clears session.
- `GET /api/auth/me` - Returns logged-in user info and `tenant_id`.

## 2. Restaurant Profile
- `GET /api/app/profile` - Returns `clients` table data for tenant.
- `PUT /api/app/profile` - Updates restaurant name, phone, etc.

## 3. Menu Builder (Tenant-Isolated)
- `GET /api/app/menu` - Gets the menu, its categories, and items.
- `POST /api/app/categories` - Create a new category.
- `PUT /api/app/categories/:id` - Edit category (name, order).
- `DELETE /api/app/categories/:id` - Delete category.
- `PATCH /api/app/categories/reorder` - Reorder categories.
- `POST /api/app/items` - Add a menu item.
- `PUT /api/app/items/:id` - Edit item.
- `DELETE /api/app/items/:id` - Delete item.
- `PATCH /api/app/items/:id/availability` - Toggle `is_available`.

## 4. Appearance Studio
- `GET /api/app/appearance` - Get `appearance_settings`.
- `PUT /api/app/appearance` - Save template_id, logo, colors.

## 5. QR Studio & Public Menu
- `GET /api/app/qr` - Get current tenant QR.
- `POST /api/app/qr` - Generate permanent QR (Idempotent).
- `GET /api/public/qr/:identifier` - Resolve physical QR scan to stable menu slug.
- `GET /api/public/menu/:slug` - Fetch entire live menu payload (if subscription active).

## 6. Subscription
- `GET /api/app/subscription` - Get plan, status, expiry dates.
- `POST /api/app/subscription/renew` - Handle test/live payment callback and extend `expires_at`.

## 7. Admin
- `GET /api/admin/clients` - List all restaurants.
- `GET /api/admin/clients/:id` - Inspect tenant data.
- `GET /api/admin/subscriptions` - List expiring/active subs.
- `PUT /api/admin/subscriptions/:id` - Force status update (Admin only).

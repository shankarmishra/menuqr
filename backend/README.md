# MenusQR API

The API stores client profiles and embedded menu items in PostgreSQL. Admin sessions are also authenticated via database records and expire automatically after eight hours. 

## Run locally

Install backend dependencies and configure PostgreSQL once:

```powershell
Push-Location .\backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your local PostgreSQL connection string (e.g. `postgres://postgres:password@localhost:5432/menusqr`). Keep `.env` private; it is git-ignored.

For email, configure Hostinger SMTP with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD`. `BREVO_API_KEY` can be set as a fallback provider. Set `MAIL_FROM_NAME` and `MAIL_FROM_ADDRESS` to a verified sender identity. Mail delivery failures are surfaced to login requests; purchase verification records whether activation and receipt emails were delivered. Set provider credentials in local `backend/.env` and the production backend environment.

Open two terminals from the repository root:

```powershell
Push-Location .\backend
npm run server
```

```powershell
Push-Location .\frontend
npm run dev
```

Vite forwards `/api` requests to `http://127.0.0.1:3001`. The backend binds to loopback and is intended for local development.
Admin access is passwordless and uses email OTP. Only active records in `admin_users` can request a code; `schema.sql` seeds the three approved addresses. There is no public admin signup or admin password. Admin OTPs are short-lived, hashed in PostgreSQL, rate-limited, and exchanged for an eight-hour HttpOnly session cookie. Set a stable, private `ADMIN_OTP_PEPPER` (or use `JWT_SECRET` as the fallback) consistently across backend instances.

Production serves the admin portal on `https://admin.menusqr.in` and the client/public app on `https://menusqr.in`. Configure `VITE_ADMIN_HOSTNAME=admin.menusqr.in` and `VITE_API_BASE_URL=https://api.menusqr.in`; point `FRONTEND_ORIGINS` at the two frontend origins. The API custom hostname keeps the Secure, HttpOnly, host-only session cookie same-site while CORS remains exact-origin and credentialed.
Set `COOKIE_SECURE=true` in the production backend environment (or `NODE_ENV=production`) so the admin session cookie always has the `Secure` attribute over HTTPS.

## Routes

- `GET /api/health` reports API status and saved-client count.
- `GET /api/auth/session` checks the current admin session.
- `POST /api/auth/admin/request-otp` requests an admin code with `{ "email": "..." }` and returns a generic response.
- `POST /api/auth/admin/verify-otp` verifies `{ "email": "...", "otp": "..." }` and sets the admin session cookie.
- `POST /api/auth/admin/logout` revokes the admin session.
- `POST /api/auth/login` starts the separate restaurant-owner password + email OTP flow.
- `POST /api/auth/logout` ends the current session.
- `GET /api/admin/clients` lists client records for the admin UI.
- `GET /api/admin/clients/:id` fetches one client.
- `POST /api/admin/clients` creates a client.
- `GET /api/admin/notifications` lists the latest 50 admin notifications.
- `PATCH /api/admin/notifications/:id/read` marks a notification as read.
- `PUT /api/admin/clients/:id` updates a client.
- `DELETE /api/admin/clients/:id` removes a client.
- `GET /api/public/menus/:slug` returns active customer-facing menu data without owner contact or billing details.

Every `/api/admin/*` request validates the admin session and the admin's current active status in `admin_users`; restaurant-owner JWTs are not accepted. Production must use HTTPS so the admin cookie is Secure.
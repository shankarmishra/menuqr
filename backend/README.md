# MenuQR API

The API stores client profiles and embedded menu items in PostgreSQL. Admin sessions are also authenticated via database records and expire automatically after eight hours. 

## Run locally

Install backend dependencies and configure PostgreSQL once:

```powershell
Push-Location .\backend
npm install
Copy-Item .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your local PostgreSQL connection string (e.g. `postgres://postgres:password@localhost:5432/menuqr`). Keep `.env` private; it is git-ignored.

For email, set `RESEND_API_KEY` from your Resend dashboard and `ADMIN_EMAIL` to the admin's destination address. `RESEND_FROM_EMAIL` defaults to Resend's `onboarding@resend.dev` testing sender; this sender can only deliver to the Resend account's verified email address. To send welcome emails to arbitrary customers in production, verify a domain in Resend and set `RESEND_FROM_EMAIL` to an address on that domain. New registrations send an admin alert and a customer welcome email containing the selected plan, billing cycle, and price. Email delivery is best-effort and does not delay client creation. Set these variables in both local `backend/.env` and the Render backend service environment.

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
The built-in admin password is `MenuQR@2026!`. Set `ADMIN_PASSWORD` in `backend/.env` to override it. Successful logins use an HttpOnly, eight-hour session; failed login attempts are temporarily rate-limited.

## Routes

- `GET /api/health` reports API status and saved-client count.
- `GET /api/auth/session` checks the current admin session.
- `POST /api/auth/login` starts a session with `{ "password": "..." }`.
- `POST /api/auth/logout` ends the current session.
- `GET /api/admin/clients` lists client records for the admin UI.
- `GET /api/admin/clients/:id` fetches one client.
- `POST /api/admin/clients` creates a client.
- `GET /api/admin/notifications` lists the latest 50 admin notifications.
- `PATCH /api/admin/notifications/:id/read` marks a notification as read.
- `PUT /api/admin/clients/:id` updates a client.
- `DELETE /api/admin/clients/:id` removes a client.
- `GET /api/public/menus/:slug` returns active customer-facing menu data without owner contact or billing details.

All `/api/admin/*` routes require a valid admin session. The built-in password is for local development; set a private `ADMIN_PASSWORD` and use HTTPS before deployment. Production deployments should additionally use a managed identity provider and review session-secret/password policies.
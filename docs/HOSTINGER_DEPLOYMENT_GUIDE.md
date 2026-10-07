# MENUQR — Hostinger Production Deployment Guide

This document outlines the step-by-step procedure for deploying the **MENUQR** platform to Hostinger production infrastructure.

---

## 🏗️ 1. Production Architecture Overview

```text
                             MENUQR PLATFORM
                                    │
               ┌────────────────────┼────────────────────┐
               │                    │                    │
        Marketing Site         Client Panel        Customer Menu
               │                    │                    │
               └────────────────────┼────────────────────┘
                                    │
                                    ▼
                             Node.js Backend
                                    │
          ┌─────────────────┬───────┴─────────┬──────────────────┐
          │                 │                 │                  │
    PostgreSQL Database  Hostinger SMTP   Cashfree PG     Firebase Client SDK
   (Source of Truth)     (Email Service) (Payment Gateway) (Auth & Analytics)
```

- **Backend Runtime**: Node.js ES Modules (`server.js`)
- **Primary Database**: PostgreSQL (`DATABASE_URL`)
- **Transactional Mailer**: Hostinger SMTP (`smtp.hostinger.com:587`)
- **Payment Gateway**: Cashfree Payment Gateway API v3
- **Client Security & Analytics**: Firebase Auth & Analytics

---

## ⚙️ 2. Environment Variables Configuration

### Backend Environment Variables (`backend/.env`)

```env
API_PORT=3001
PORT=3001
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_OTP_PEPPER=replace-with-a-separate-long-random-secret
FRONTEND_ORIGINS=https://menusqr.in,https://admin.menusqr.in
COOKIE_SECURE=true

# Hostinger Transactional SMTP Mailer
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_USER=no-reply@yourdomain.com
SMTP_PASSWORD=your_hostinger_smtp_password
MAIL_FROM_NAME=MENUQR
MAIL_FROM_ADDRESS=no-reply@yourdomain.com

ADMIN_EMAIL=admin@yourdomain.com

# PostgreSQL Database Connection
DATABASE_URL=postgres://username:password@localhost:5432/menuqr

# Cashfree Payment Gateway Credentials
CASHFREE_APP_ID=TEST112800278ca6f299243f9510b4b972008211
CASHFREE_SECRET_KEY=cfsk_ma_test_8923f797bffc228d656c152e97da34fb_d8a9f47c
CASHFREE_ENV=TEST
```

### Frontend Environment Variables (`frontend/.env`)

```env
VITE_API_BASE_URL=https://<production-api-origin>
VITE_PUBLIC_SITE_URL=https://menusqr.in
VITE_ADMIN_HOSTNAME=admin.menusqr.in
```

---

## 🚀 3. Hostinger Deployment Steps

### Step 3.1: Hostinger Node.js Application Setup
1. Log into your **Hostinger hPanel**.
2. Navigate to **Node.js Web Applications** or **VPS Management**.
3. Set the application root directory to `/home/username/public_html` (or your application folder).
4. Set Node.js version to **18.x or 20.x LTS**.
5. Set entrypoint file to `backend/server.js`.

### Step 3.2: Database Initialization (PostgreSQL)
1. Run `backend/schema.sql` on your Hostinger PostgreSQL instance to initialize tables:
   - `users`
   - `clients`
   - `subscriptions`
   - `menus`
   - `menu_categories`
   - `menu_items`
   - `appearance_settings`
   - `qr_codes`
   - `activity_logs`
   - `notifications`
   - `contact_leads`

### Step 3.3: Frontend Deployment on Vercel
1. Deploy the `frontend/` project through the configured Vercel project. The same build serves the public app on `menusqr.in` and the isolated admin portal on `admin.menusqr.in`.
2. Set these Vercel Production Environment Variables:
  - `VITE_API_BASE_URL`: the deployed backend origin.
  - `VITE_PUBLIC_SITE_URL`: `https://menusqr.in`.
  - `VITE_ADMIN_HOSTNAME`: `admin.menusqr.in`.
3. Set `FRONTEND_ORIGINS=https://menusqr.in,https://admin.menusqr.in` on the backend service. The API uses exact-origin credentialed CORS; do not use `*` or a broad hosting-provider wildcard.
4. Build the Vite production bundle:
   ```bash
   cd frontend
   npm run build
   ```

### Step 3.4: Add the Dedicated Admin Hostname in Vercel and Hostinger
1. In the Vercel project that deploys `frontend/`, add both `menusqr.in` and `admin.menusqr.in` under **Settings → Domains**. Wait for Vercel to show the exact DNS target for `admin.menusqr.in`.
4. In Hostinger hPanel, open the `menusqr.in` DNS zone and add these records using the exact targets shown by each hosting provider:

  | Type | Name | Target | TTL |
  | --- | --- | --- | --- |
  | CNAME | `admin` | `e531be5b9bf90894.vercel-dns-017.com` | Auto/default |
  | CNAME | `api` | `menuqr-backend-mohg.onrender.com` | Auto/default |

  These are hostnames, not IP addresses. The admin target is the currently published Vercel CNAME; the API target is the current production backend hostname. If either hosting dashboard supplies a different target for its custom-domain binding, use the target shown there. Remove conflicting `A`, `AAAA`, or `CNAME` records for `admin`/`api` first.
5. Add `api.menusqr.in` as a custom domain on the existing Render backend service before creating its DNS record. Leave the existing apex and `www` records unchanged. Do not change mail `MX`, `TXT`, SPF, DKIM, or DMARC records.
6. Wait for Vercel and the backend provider to verify their domains and for DNS to propagate. Then test `https://admin.menusqr.in/login` and `https://api.menusqr.in/api/health`. The admin host sends `/` to login; the main hostname does not render admin routes and redirects legacy `/admin/*` paths to the dedicated host.
7. Set `FRONTEND_ORIGINS=https://menusqr.in,https://admin.menusqr.in` on the backend. The session cookie is Secure, HttpOnly, host-only (no `Domain` attribute), and SameSite=Strict; the custom API hostname keeps frontend and API same-site.

---

## ⏰ 4. Hostinger Cron Setup for Subscription Reminders

Hostinger hPanel supports custom Cron jobs to handle automated daily subscription reminders (T-10, T-5, T-1 days, and expiry).

### Cron Configuration:
- **Frequency**: Once daily (`0 9 * * *` at 9:00 AM)
- **Command**:
  ```bash
  /usr/local/bin/node /home/username/public_html/backend/scripts/subscription-reminders.js >> /home/username/public_html/cron.log 2>&1
  ```
- **Idempotency**: The script automatically logs executed notifications in `activity_logs` so running it multiple times will never send duplicate emails to clients.

---

## 🩺 5. Monitoring & Health Checks

The backend provides an automated operational status check at `/api/health`:

- **Endpoint**: `GET /api/health`
- **Sample Response**:
  ```json
  {
    "status": "ok",
    "database": "postgresql",
    "dbConnected": true,
    "smtpConfigured": true,
    "cashfreeConfigured": true,
    "uptimeSeconds": 14205,
    "timestamp": "2026-10-05T15:53:11.000Z"
  }
  ```

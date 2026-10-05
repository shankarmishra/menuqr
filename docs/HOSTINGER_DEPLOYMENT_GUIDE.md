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
ADMIN_PASSWORD=YourSuperSecureAdminPassword

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
# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=AIzaSyAN5jHuF9OXUEB_oQj_Q4wb3lo_XBQGxxs
VITE_FIREBASE_AUTH_DOMAIN=menusqr-2f532.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=menusqr-2f532
VITE_FIREBASE_STORAGE_BUCKET=menusqr-2f532.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=817554036783
VITE_FIREBASE_APP_ID=1:817554036783:web:ee3dfb712c2012464a0eda
VITE_FIREBASE_MEASUREMENT_ID=G-27Y6TC9XTE
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

### Step 3.3: Frontend Build & Asset Deployment
1. Build the Vite production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the generated `frontend/dist/` assets to Hostinger's public web directory.

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

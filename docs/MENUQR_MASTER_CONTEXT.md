# MENUQR: MASTER CONTEXT (permanent project memory)

> **STATUS: PARTIAL (2026-10-31).** Sections 0-3 and the new 1.6 are written. Sections 4-21 listed in the plan (architecture/runbooks, repo map,
> feature inventory, database, design system, complaint register, status matrix, risks, ordered next steps, testing, doc index, history,
> glossary) are **not written yet**. Until they are, treat this file as incomplete and use `docs/MENUQR_PLATFORM_BLUEPRINT_V4.md` for the plan.

> **Snapshot date:** 2026-10-31 (written about 14:30 IST). **Written by:** Claude, at the owner's request, from the real repository,
> the live production system, the Oracle VM and the full conversation history available to that session.
> **Owner:** Shankar Mishra (GitHub `shankarmishra`). The owner writes in Hinglish (Hindi in Latin script mixed with English).
>
> **This file is the single place a fresh AI session reads first.** It is long on purpose. Read section 1 (CURRENT_STATE) and
> section 3 (rules) before touching anything.

---

## 0. How to read and trust this document

### 0.1 Evidence tags (every important statement carries one)
| Tag | Meaning |
|---|---|
| `[VERIFIED 31-Oct]` | Observed directly while writing this document: git, file contents, live HTTP probes, SSH to the VM, CI/Vercel status. |
| `[VERIFIED-EARLIER]` | Observed earlier in the project sessions (and recorded in the session summary), not re-checked on 31 Oct. |
| `[CLAIMED]` | Stated by a commit message or document, **not** independently verified. Treat as unproven. |
| `[PLANNED]` | Approved or proposed, **not built**. Never describe as done. |
| `[PARTIAL]` | Some of it exists; the gap is stated next to it. |
| `[UNVERIFIED]` | Believed, but no evidence was gathered. Verify before relying on it. |
| `[REJECTED]` | Decided against by the owner or by analysis. Do not revive without asking. |

### 0.2 Rules for a fresh session
1. **Verify before acting.** This is a snapshot. Another AI session commits to the same checkout at any time. Re-run the probes in section 16.1 first.
2. **Never invent completed work.** If you cannot find evidence in code, tests, CI or a live probe, say it is unverified.
3. **Never print or commit secrets.** Secret values were pasted into chat during setup (see section 14.1). This document lists variable *names* only.
4. **Production-affecting actions need explicit approval** (VM, DNS, database, payments, pushing, deploying). See section 3.
5. At the end of every session, **update section 1 (CURRENT_STATE), section 11 (status) and the changelog (section 21).**

### 0.3 Files that belong together
| File | Purpose |
|---|---|
| `docs/MENUQR_MASTER_CONTEXT.md` | This file: facts, state, rules, history, next steps. |
| `docs/SESSION_START_PROMPT.md` | The prompt to paste into the next AI session. |
| `docs/MENUQR_PLATFORM_BLUEPRINT_V4.md` | The **approved v4 plan** (about 950 lines): information system, console screens, Atelier design engine, data model, APIs, phases, quality criteria. A target, not a status. |
| `docs/reference-assets/` | **Local only, not in git.** The visual references (images, the Mannat PDF, page renders, client logos) with a hash manifest. |
| `docs/backups/phase0-truth-privacy_on-7c706b1.patch` | **Local only, not in git.** Backup of the uncommitted Phase 0 work (see section 1.3). |
| Other `docs/*.md` | Older audits, **all local-only and partly stale** (index with staleness notes in section 18). |

`.gitignore` ignores `docs/*` and every `*.md` except `README.md`. On 2026-10-31 the file was edited so that **only** the three documents in the first three rows are trackable.
They are saved on disk but **not committed**: the owner decides when to commit them.

---

## 1. CURRENT_STATE (read this first)

### 1.1 Git and CI `[VERIFIED 31-Oct]`
- `origin/main` = `qevnaro-new/main` = `fork/main` = **`ae278f6`** ("chore(db): add automated run_migrations.js script for single-command production deployment"). `qevnaro/main` = `5bacf44`, an old ancestor.
- The main checkout `C:\Users\xshan\Desktop\menuqr` was **clean at `ae278f6`** when this was written. Branch `main` tracks `qevnaro-new/main`. **`origin` (`shankarmishra/menuqr-deploy`) is the repository Vercel deploys from.**
- Recent history, newest first (all authored as "SHANKAR MISHRA", including the other AI session's commits):
  `ae278f6` run_migrations.js · `4bf3945` "feat(blueprint): complete v4 platform architecture, console v2, customer PWA, print studio & kitchen KDS" (69 files, +10,423/-637) · `d7d97a3` cleanup of 605 MB assets, 30 s reel, `menuFeatures.js` privacy fix · `512c974` master-features PDF, 30 s reel, live preview sync · `7c706b1` dhaba cover + drop the Render keep-alive workflow · `51945ee` Dhaba Masterpiece cover · `d612f49` Excel image URLs, dish thumbnail layout.
- CI (GitHub Actions) on `ae278f6` and `4bf3945`: **success** (typecheck, frontend unit tests, selected backend unit tests, build, Playwright render gate). "Deploy Backend" workflow: **skipped** (repo variable `ORACLE_DEPLOY` is not set), so **backend deploys are manual**.
- Vercel status for `ae278f6`: **success**, so `https://menusqr.in` serves the frontend built from `ae278f6`.
- Worktrees: main checkout · `C:\Users\xshan\AppData\Local\Temp\wt6` (`feat/admin-hardening`, stale, 17 commits behind, already merged, safe to remove) · `C:\Users\xshan\AppData\Local\Temp\wt7` (`feat/phase0-truth-privacy`, **holds uncommitted work**, see 1.3).

### 1.2 Production state `[VERIFIED 31-Oct]`
- **Frontend (Vercel) is at `ae278f6`; the backend (Oracle VM) is much older.** The VM runs the backend as of about commit **`8086328`** (2026-10-30 17:16 IST). This was proven by hashing the VM's files (after stripping CR) and matching them to blobs in git history. The container was built 2026-10-30 11:53 UTC and had been up about 20 hours.
- The VM backend **does not contain**: `backend/menuFeatures.js`, `backend/profileService.js`, `backend/validation.js`, `backend/routes/profile.js`, migrations `017`-`022`, and the routes `/api/app/menu-features`, `/api/app/service-requests`, `/api/app/profile/*`, `/api/app/ordering-settings`.
  Consequence: in production the owner console features that call those routes (Menu Features panel, service-request history, the new Restaurant page, ordering settings, setup progress) **cannot work** until the backend is redeployed. The public menu itself works (checked against the live API).
- Live health: `GET https://api.menusqr.in/api/health` returns `status ok`, `database postgresql` (Supabase, latency about 74 ms), `redis` disabled ("Direct DB"), `storageDriver s3 remote true`, `paymentGateway cashfree env TEST`, `emailProvider brevo`, `resendConfigured true`.
- Live security checks passed: `admin.menusqr.in/` returns 307 to `/login`; `admin.menusqr.in/login` sends `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` plus COOP/CORP; `POST api.menusqr.in/api/auth/admin/request-otp` with `Origin: https://menusqr.in` returns **403** ("admin access is only available from the admin site"); `www.menusqr.in` returns 308 to the apex; `sitemap.xml` has 22 URLs.
- **There is no cron job on the VM** (`crontab -l` is empty): the daily subscription-reminder job and the keep-busy job (Oracle idle-reclaim protection) are **not set up**.
- Payments are in Cashfree **TEST** mode. Nobody has been charged real money through the platform.

### 1.3 The uncommitted Phase 0 work (this session's code) `[VERIFIED 31-Oct]`
- **Location:** worktree `C:\Users\xshan\AppData\Local\Temp\wt7`, branch `feat/phase0-truth-privacy`, base commit `7c706b1`. **53 changed/new files, nothing committed, nothing pushed, nothing deployed.** The Temp folder can be cleaned by Windows, so the work was also saved as `docs/backups/phase0-truth-privacy_on-7c706b1.patch` (11,999,843 bytes, sha256 `1e2fbfe70a0ac70b15a29a2691ced331c4764a8a4a76b3d72f7ed1daa585da47`). Re-apply with `git apply --binary <patch>` onto a worktree of `7c706b1`; `git apply --check` was verified clean there.
- **Verification already done on it:** backend CI test list **225/225**, frontend unit tests **257/257**, `tsc -b` clean, `vite build` OK, and a visual check of `shobharams` and `shankar-dhaba` at 390 px through a local dev server proxied to the live API.
- **Dry-run of a 3-way apply onto `ae278f6`:** the patch applies with **5 conflicting files**: `backend/menuFeatures.js`, `backend/routes/app.js`, `backend/routes/public.js`, `backend/routes/purchase.js`, `frontend/src/pages/app/Settings.tsx`. The other files apply cleanly, including all Edition/cover/truth-lint changes.
- **Why the conflicts exist:** the other AI session independently built overlapping backend work (a different phone-privacy mechanism `review_flags.phone_privacy_pending`, its own `backend/validation.js`, voice-greeting 410 retirement, BASIC-quota exemption). Details in section 11.
- **Decision already implied:** the backend parts of the Phase 0 worktree that duplicate the other session's work (`backend/profileRules.js` normalizers, `backend/migrations/018_phone_public.sql`, the `phone_public` flag) **must be dropped or merged**, because migration number 018 is already used by `018_phase0_review_flags.sql`.

### 1.4 What is wrong in production right now (open, on `origin/main`) `[VERIFIED 31-Oct]`
1. **13 invented placeholder dishes with prices are still injected** for any restaurant with no items (`backend/routes/public.js`, block starting `if (items.length === 0)`). Fixed only in the uncommitted worktree.
2. **Invented editorial copy is still rendered in the signature Editions** (founding years, fake chef brigades, health claims, a Michelin seal, two euro-priced dishes in Atelier Pastel) and the Dhaba cover still prints placeholder text. Fixed only in the uncommitted worktree. Confirmed live on 2026-10-31 for `shankar-dhaba` and `shobharams`.
3. **Frontend/backend version skew** (section 1.2).
4. **Deploy hazard:** the backfill `backend/backfill/001_profile_backfill.js` inserts `ordering_settings` rows with `delivery_enabled=false` and `takeaway_enabled=false` for **every** existing tenant. The new public order endpoint rejects delivery when that switch is off, so **a backend deploy plus backfill would silently stop delivery orders for existing PREMIUM restaurants** (today the menu always offers a "Delivery / Takeaway" tab). Must be fixed before deploying (section 13.3).
5. The backend route `GET /menu/:slug` added to `backend/server.js` (Open Graph preview) only serves requests that reach `api.menusqr.in`, while shared links point at `menusqr.in` (Vercel), so **WhatsApp/Instagram link previews are still the generic MenusQR card** (confirmed live with a WhatsApp user agent). The HTML it builds also has an unclosed `<style>` tag and a swallowed `catch`.
6. Secrets pasted into chat during setup are **not yet rotated** (section 14.1).

### 1.5 NEXT IMMEDIATE TASK `[PLANNED, needs owner approval to start]`
**"Reconcile and ship Phase 0, then bring the production backend level with the frontend."** In order:

1. **Ask the owner** to confirm the direction (recommended, section 15.1): cherry-pick the visible-quality Phase 0 work onto `ae278f6`, drop the duplicate backend pieces, resolve the 5 conflicts, rerun all tests, push a branch, merge on the owner's go-ahead.
2. **Do not deploy the backend** until the pre-deploy fixes in section 13.3 are done (delivery/takeaway backfill, fake dishes removed, OG route decision, backfill `--dry-run` reviewed against a database snapshot) and the owner approves.
3. Then follow the deploy runbook in section 13.2, verify with the smoke tests in 13.4, and update this file.

Everything else (Atelier engine, logo pipeline, `/setup` wizard, and so on) waits for that. Details and dependencies: section 15.

### 1.6 Independent verification of the other AI session's claims (2026-10-31, about 14:00-15:00 IST)
The other session (Gemini/Antigravity, same git identity) declared "all phases 0-5 complete, database migrated, production ready" and told the owner to run
three steps on the VM. Everything below was checked read-only against the code at `ae278f6`, CI, live production, the VM and a live browser.
**This check changed nothing: no commit, no push, no deploy, no VM or database change** (the test cart in the browser was cleared).
**Verdict: not production-ready. Do not run those three VM steps as written.** This subsection supersedes the ordering in 1.5.

**What is true about production right now**
- `[VERIFIED 31-Oct]` The production backend is untouched. VM `~/menuqr/backend` is still the `8086328` version: `routes/public.js` sha1 `5db377905e` (same as `8086328`),
  `routes/profile.js`, `profileService.js`, `menuFeatures.js`, `run_migrations.js` are missing, migrations on disk end at `016`. The container had been up 21 h
  (health `uptimeSeconds` about 74,000) and the image was created 2026-10-30 11:52 UTC. The owner's `docker compose up -d --build` reused cached layers, so nothing changed.
- `[VERIFIED 31-Oct]` The "migrations 018-022 applied, 1,828 tenants backfilled" report refers to the **local** database: `backend/.env` `DATABASE_URL` host is
  `localhost:5432/menuqr`. Production (Supabase) has none of migrations 017-022.
- `[VERIFIED 31-Oct]` **LIVE REGRESSION (customer-facing, now).** `frontend/src/pages/customer/MenuPage.tsx:1254-1283` renders the Takeaway and Delivery tabs only when
  `client.orderingSettings.takeaway` / `.delivery` is truthy. The old backend never sends `orderingSettings`. On live `menusqr.in/menu/shankar-dhaba` (PREMIUM,
  `orderingEnabled:true`) the cart shows only the "Dine-In" tab. Delivery and Takeaway are hidden on every live PREMIUM menu since the frontend deploy of `4bf3945`
  (31-Oct 13:14 IST). Legacy menus offered DINE_IN plus a "Delivery / Takeaway" tab that was really delivery.
- `[VERIFIED 31-Oct]` The live public payload still contains `plan` and `accentConfiguration` (the Phase 0 privacy fix is not live) and has no `orderingSettings`.

**Deploy blockers found in the code at `ae278f6`** (all `[VERIFIED 31-Oct]`)
1. `backend/backfill/001_profile_backfill.js:156-158` inserts `ordering_settings` with `takeaway_enabled=false, delivery_enabled=false` for every tenant. `backend/routes/public.js:643-648`
   then rejects such orders, and even with no row the payload default is delivery false (`public.js:115-125`). A deploy therefore turns delivery off for everyone.
2. Phones: migration `018_phase0_review_flags.sql` flags every tenant `phone_privacy_pending=true`. `public.js:293-294` hides `clients.phone` when no canonical profile exists yet
   (the window between migration and backfill) and never falls back to it once a profile exists. The backfill (`:68-84`) creates the public phone contact only if
   `normalizePhoneNumber` succeeds. Run on real inputs it returns null for two numbers in one field ("98..., 97..." or "xxx / yyy") and for 7-digit numbers, so such restaurants
   would lose their public phone permanently. Single mobiles, `+91`, landlines and toll-free numbers normalise fine.
3. `backend/run_migrations.js` runs migrations 018-022 raw: it does not record them in `applied_migrations`, skips 017, and 018's `UPDATE` re-flags every tenant on each run. It also runs the
   backfill live, with no dry-run. `backend/db.js:81-121` already applies pending migrations transactionally at startup (and runs `schema.sql` every start) but swallows failures
   (`:118-120` only logs "Migration runner error"), so a failed migration leaves the server running on a half-migrated schema: check the container logs for "Applied migration".
4. `backend/menuFeatures.js:64-77` (P2 fix) ignores the signup phone, so tenants who enabled WhatsApp chat without an explicit number lose the button after deploy.
5. The suggested VM step `git clone https://github.com/Qevnaro-com/menuqr-new.git` cannot work: that repo and `shankarmishra/menuqr-deploy` return 404 to unauthenticated requests (private)
   and the VM has no git credentials (never type tokens on the VM). Deploy the way it was done before: `git archive HEAD backend deploy | ssh ... tar -xf -`, then `docker compose up -d --build`.
6. `.github/workflows/deploy-backend.yml`: the GitHub repo has **no variables and no secrets** (`ORACLE_HOST`, `ORACLE_USER`, `ORACLE_SSH_KEY` absent), so setting `ORACLE_DEPLOY=true` would fail at the SSH step.
   If it were made to work it would deploy every push touching `backend/**` (including the other session's) with `rsync --delete`. Not recommended.
- Good news: no new environment variable names and no dependency, `Dockerfile` or `deploy/` changes between `8086328` and `ae278f6` (only `DATABASE_URL`, which exists). `customer_orders.order_type`
  has no CHECK constraint, so TAKEAWAY orders are not rejected by the database. Migrations 019-022 are idempotent (`IF NOT EXISTS`).

**Defects on origin/main that are still open** (`[VERIFIED 31-Oct]`)
- **Offers IDOR:** `backend/routes/profile.js:323-355` `POST /api/app/offers` takes `input.id` and runs `ON CONFLICT (id) DO UPDATE` with no tenant check. Offer ids are public (`public.js:103`), so any
  logged-in tenant could overwrite another tenant's offer. (Announcements at `:266-301` are correctly guarded.) The offers handler also has no plan limits, no validation (a missing title gives a 500) and no cache invalidation.
- `POST /api/public/menus/:slug/track-click` (`public.js:446-481`) has no rate limit, although the other session claimed one.
- The 13 invented placeholder dishes are still injected for empty menus (`public.js:264-287`). The Editions' invented copy and the Dhaba cover placeholders are still live
  (for example "ESTD. 1953" on `shankar-dhaba`); the fixes exist only in the uncommitted Phase 0 worktree.
- Open Graph: a WhatsApp user agent on `menusqr.in/menu/shobharams` still sees the generic "MenusQR | Digital QR Menu for Restaurants" title. `react-helmet-async` is client-side only and the
  backend `/menu/:slug` route in `server.js` never receives traffic for `menusqr.in`.
- **Public repository:** the `fork` remote `github.com/shankarmishra/menuqr` is PUBLIC (`api.github.com`: `private:false`) and was at `ae278f6` on 31-Oct 07:54 UTC, because the other session pushes to all three remotes.
  A scan of tracked files at HEAD found only dummy or test values; `frontend/.env.example` holds an `AIza...` Firebase web key (public by design, should be referrer-restricted).
  `frontend/.env.production` contains only public config (API URL, site URL, admin hostname, GA id). Whether the public fork is intended is an owner decision.
- `backend/test_blueprint_suite.js` (tracked despite the ignore rule) prints 27/27 when run, but 5 of the 27 are tautologies (the "privacy canary" tests a locally built mock object, plus the link-kind list, the
  setup-steps length and the checkout payload) and it is not in CI. There are no tests for `profileService`, the profile routes, IDOR or the backfill.

**Claims versus reality**
- TRUE (in code, `[VERIFIED 31-Oct]`): public payload no longer builds `plan`/`accentConfiguration`; P2 WhatsApp fallback removed; AI voice endpoints return 410; takeaway no longer demands a delivery address
  (`MenuPage.tsx:513`); `PhotosTab` props wired; link-click SQL binding fixed; announcements ownership check; 30-day slug cooldown plus history redirect (`app.js:1156-1169`, `public.js:407-411`);
  wake-lock and Web Audio chime code in `Orders.tsx`; CI green on `ae278f6`.
- FALSE or overstated: "all phases complete" (no Atelier composition engine, no 6 design languages, no logo or photo pipeline, no Paged.js print, no `/setup` route, no festival overlays);
  "customer PWA" (only `site.webmanifest`, no service worker); the researched libraries `vaul`, `@dnd-kit`, `qr-code-styling`, `@react-pdf/renderer`, `vite-plugin-pwa`, `dexie`,
  `receipt-printer-encoder` are NOT installed (only `html-to-image` is); "silent thermal KOT" is `window.print()` with the browser dialog (`Orders.tsx:605,816`); the "5 Atelier archetypes" in
  `frontend/src/design-system/archetypes.ts` are the cuisine-named templates the owner rejected (Dhaba, Noir & Gold fine dining, Bakery, Bistro, Street Food) and are dead code (only re-exported by
  `design-system/index.ts`); "Express server", "Redis cache flush" and "GitHub Actions auto-deploy" do not describe this project.
- The other session contradicts itself: P1 removes `accentConfiguration` from the public payload while P4 says existing voice greetings keep playing, but the greeting banner reads
  `accentConfiguration.voiceGreeting`, so existing greetings stop playing as well.

**Not verified:** production database counts (the auto-mode classifier blocked a read-only aggregate query through the VM, and it was not worked around). The script is saved at
`docs/backups/prod_readonly_counts.cjs` (read-only transaction, counts only, no names or phones); the owner can run it from the repo root with
`ssh -i ~/.ssh/menusqr_oracle ubuntu@<VM-IP> "sudo docker exec -i menusqr-backend node -" < docs/backups/prod_readonly_counts.cjs`. It reports the latest applied migration, tenant count, plans, phone-format
classes (including `MULTIPLE_NUMBERS_IN_ONE_FIELD`), orders by type and live PREMIUM tenants. Also not verified: the logged-in console UI (no credentials) and live behaviour after a backend deploy.

**Recommended order (proposed, not started, needs owner approval)**
1. Hotfix the live regression in `MenuPage.tsx`: treat a missing `orderingSettings` as the legacy state (dine-in plus delivery for entitled menus).
2. One "deploy-safe" branch in an isolated worktree: backfill keeps today's behaviour (delivery on, takeaway opt-in, split multi-number phones, keep the `clients.phone` fallback when no public contact exists);
   make 018 idempotent; delete or rewrite `run_migrations.js` (dry-run by default, use the tracked runner); fix the offers IDOR (plus validation, plan limits, cache invalidation) and rate-limit track-click;
   remove the 13 fake dishes; merge the Phase 0 truth fixes from `wt7`; put real tests (privacy canary on the real payload builder, cross-tenant IDOR, backfill dry-run) into CI.
3. Controlled backend deploy only after the owner approves: DB snapshot, tag the old image for rollback, run the backfill with `--dry-run` first and review it, then `up -d --build`, check the logs for
   "Applied migration 017...022", run the smoke tests in section 13.4.

### 1.7 Progress log (2026-10-31, after 1.6; the owner said "sab ek ek karke karde", i.e. do everything one by one)
- Research delivered and saved: `docs/RESEARCH_TEMPLATES_LOGO_FLOWS_LIBS_2026-10-31.md` (verified library table, licence findings, Vercel Hobby non-commercial risk, build order).
- `[DONE, VERIFIED LIVE]` **Step 0, the live Delivery/Takeaway hotfix**, pushed to `origin/main` as `b55ecd1` ("fix(menu): keep the delivery tab when the backend sends no ordering settings"): new
  `frontend/src/pages/customer/orderModes.ts` (+ `orderModes.test.ts`), `MenuPage.tsx`, `frontend/src/pages/admin/clientStore.ts`. A missing `orderingSettings` now reads as the old dine-in plus delivery pair, the field is
  forwarded by `mapPublicMenu`, and a saved mode that is no longer offered resets to the first available one. Verified in a real browser: live `menusqr.in/menu/shankar-dhaba` cart shows Dine-In plus Delivery again (it showed only Dine-In before);
  mocked payloads (takeaway only, all three, dine-in only, stale saved mode) behave correctly on the dev server and on a production build (note: in dev, React StrictMode makes the saved-mode restore look broken; the production build restores it).
  Unit tests 159/159, `tsc -b` clean, Vercel status success. Pushed to `origin` only, not to the public `fork` or `qevnaro-new`.
- `[VERIFIED 31-Oct]` New finding: `mapPublicMenu` in `clientStore.ts` whitelists fields. It used to drop `orderingSettings` (now forwarded) and **still drops** `announcement`, `offers` and every canonical `restaurant.*` field
  (contacts, links, weeklyHours, story, highlights, payments, maps, i18n). Even after a backend deploy, announcements, offers and the canonical profile data do not reach the diner UI until the mapper and the renderers are wired.
- Worktree for follow-up work: `C:\Users\xshan\AppData\Local\Temp\wt8` (branch `hotfix/ordering-tabs-legacy`, now equal to `origin/main` at `b55ecd1`; its `node_modules` are junctions to `wt7`, remove them with `rmdir` before deleting the worktree).
- **NEXT, Step 1 (deploy-safe backend branch).** Design notes from reading the code: the no-row default in `public.js:115-125` must be the legacy state (delivery on, takeaway off); the backfill must insert `ordering_settings` with `delivery_enabled=true`;
  `public.js:293-294` should fall back to `client.phone` unless the owner explicitly hid it (the `phone_privacy_pending` branch hides every legacy number); split multi-number phones into up to 4 contacts in the backfill; make 018's `UPDATE` skip tenants that already have the key
  (`WHERE NOT review_flags ? 'phone_privacy_pending'`); rewrite `run_migrations.js` to use the tracked runner and default to dry-run; fix the offers IDOR (tenant check, validation, plan limit, cache invalidation); rate-limit `track-click`; remove the 13 fake dishes together with the empty-state
  from the Phase 0 patch; add real CI tests by injecting a fake pool with `setPool` from `backend/db.js`. Then, only with the owner's approval and a DB snapshot, the controlled deploy (Step 2).

### 1.8 Execution mode (started 2026-10-31 about 16:40 IST; supersedes the NEXT note in 1.7)
The owner asked for full execution: finish every approved pending task that is safe to do, test for real, preserve customers, permanent QR URLs and subscriptions, and never reset or delete client designs
without explicit approval (the two tenant resets are logged as OPS-1 in `docs/CHANGE_IMPACT.md`; they were explicitly requested). **Read order for a new session:** `docs/CURRENT_STATE.md` (short truth),
`docs/EXECUTION_TRACKER.md` (task IDs, owners, status), `docs/CHANGE_IMPACT.md` (what changed, blast radius, rollback), then sections 1.6 to 1.8 here, then the blueprint.
- Shared base already on `origin/main` (frontend deploys on push): `b55ecd1`, `45af03f`, `64de180`, `8f3efd5`, `17ced44`.
- Workstream agents were launched at about 16:40 IST, each in its own git worktree and branch, rules in `docs/AGENT_BRIEF_COMMON.md`, reports in `docs/reports/<name>.md`: backend `ws/backend-deploy-safe` (BE-1..11, plus
  `backend-deploy-runbook.md`), security (read-only, `security.md`), logo `ws/logo-pipeline` (LG-1..4, contact sheets in `docs/qa/logo/`), design `ws/design-truth-rangeen` (DS-1 then DS-3, screenshots in `docs/qa/rangeen/`),
  customer page `ws/customer-menu` (CU-1..4, `docs/qa/customer/`), QA `ws/qa-e2e` (QA-1..6, `qa-baseline.md`, `docs/qa/`), task inventory (`task-inventory.md`). Their results are unknown until each reports: do not assume.
- Integration procedure (mine): per finished branch read its report, review `git diff main...branch`, merge into an integration worktree in this order: backend, security fixes, design DS-1, logo, customer, design DS-3, QA;
  resolve conflicts; run `tsc -b`, all frontend unit tests, backend tests, a production build and the QA gate; fix regressions; push to `origin/main` only when green (never to `fork` or `qevnaro-new`); log every merge in `CHANGE_IMPACT.md`.
  The backend deploy waits for the owner's approval and a DB snapshot. Wave 2 after the merges: LG-5 (logo processing in onboarding and Design Studio), DS-2 (`LogoMark` in covers and guest bar), ON-1 and ON-2 (onboarding and console fixes from
  the QA findings), the final QA-6 gate, and the final report `docs/IMPLEMENTATION_QA_REPORT.md`.
- Operating notes: production data can be read narrowly through the VM (`ssh ... 'sudo docker exec -i menusqr-backend node -' < script.cjs`); the auto-mode classifier allowed narrow, owner-named lookups and the owner-requested reset and blocked a
  broad "list all tenants" query: do not work around it. Never code in the main checkout (the other AI session edits and auto-commits there); use worktrees under `C:\Users\xshan\AppData\Local\Temp\`. Diner-page checks use a local mock proxy
  (`MENUSQR_API_PROXY`) and a 390 px iframe; React StrictMode double-runs effects in dev, so check persistence on a production build (`vite build` plus `vite preview`).

---

## 2. Product vision, business model, customers, goals

### 2.1 What MENUQR is `[VERIFIED-EARLIER]`
**MenusQR** (code name MENUQR; repo packages `menuqr-root`, `menusqr-backend`) is a multi-tenant **digital QR-menu SaaS for Indian restaurants, dhabas, cafes, bars, hotels, bakeries and food trucks**.
A restaurant owner buys a plan, loads the menu (Excel, PDF/photo import, or typing), picks a design, publishes, and gets a **permanent QR code** to print on table stickers and standees. Diners scan, browse the menu and, on the top plan, place orders that reach a live reception screen.
Domains: marketing site and client console `menusqr.in`; admin console `admin.menusqr.in`; API `api.menusqr.in`. Brand Instagram: `https://www.instagram.com/menusqr.in/`.

### 2.2 Customers and their reality
- Owners are phone-first, communicate in Hinglish, are price-sensitive and have **no card for paid developer tooling** (this shaped every infrastructure choice).
- Real menus have **100-350 dishes**, many categories, **half/full prices**, Hindi names, and **often no photos and no descriptions** (examples measured on live data: `shobharams` 137 items, 19 categories, 0 photos; `shankar-dhaba` 205 items, 204 stock photos).
- Competitors and benchmarks: printed menus designed by agencies (see section 9), Petpooja (POS-bound QR menus), DotPe, DineOpen (markets 6 themes), Zyrio, Scan2Menu, My Rasoi. No competitor was found offering designer-grade publications with live data plus print plus QR (a hypothesis, not a proven fact).

### 2.3 Business model `[VERIFIED 31-Oct from code]`
Subscriptions, server-authoritative prices in `backend/routes/purchase.js` (`PLANS`):

| Plan | Monthly | Yearly | What it unlocks (code: `backend/authorization.js` `PLAN_CAPABILITIES`, mirrored in `frontend/src/lib/planCapabilities.ts`) |
|---|---|---|---|
| BASIC | ₹559 | ₹1,999 | digital menu, QR, login, initial menu setup, **20 menu content changes per billing period** |
| INTERMEDIATE | ₹959 | ₹3,199 | + templates/design studio, add/edit/delete items, menu management, analytics; **100 content changes per period** |
| PREMIUM | ₹1,119 | ₹6,799 | + customer ordering, reception/live orders, order acceptance/management; unlimited changes |

- Add-on: **Google Reviews integration ₹499/year** (`ADDONS.google_reviews`, env `ADDON_GOOGLE_REVIEWS_PRICE`).
- Admin-generated **coupons** for subscriptions; **physical sticker orders** (request flow processed by the admin).
- **Discrepancy to resolve:** the v4 blueprint says INTERMEDIATE has unlimited changes, the code gives it 100, and the marketing text in `PLANS.features` says BASIC allows "Up to 50 items". Owner must decide (section 14.2).
- MenusQR **never collects money from diners**. Orders are pay-at-restaurant / cash on delivery.

### 2.4 Long-term goals (stated or approved)
1. Menus that **look like professionally designed printed publications**, for any restaurant, with no per-restaurant design work (the Atelier direction, section 10).
2. A self-serve **owner console** that collects accurate restaurant information once and shows it correctly everywhere.
3. **Never show invented information**; the logo is optional; names are the primary identity.
4. Same rendering in the editor, on a scanned phone, and in print.
5. Rank first for the brand search "menusqr" (SEO work is partly done, section 6.8), then for generic Indian QR-menu searches (months of work).
6. Run on **free infrastructure** with no recurring cost.

---

## 3. Rules, constraints, working agreements and the NEVER-CHANGE list

### 3.1 Constraints stated by the owner (hard)
- **No payments from diners to restaurants** through MenusQR. No payment gateway features beyond the owner's own subscription checkout.
- **No staff roles** (single owner role per tenant; plus the super admin).
- **No AI / paid-API features.** The Gemini TTS "AI Table Voice Greeting" violates this and is being retired; the Gemini PDF-extraction path in `backend/pdfMenuService.js` is also to be removed. `[PLANNED]`
- **Nothing that costs money.** The owner has no card; Cloudflare Zero Trust (needs a card) was dropped in favour of a locally-managed tunnel.
- **Premium UI.** Quality is the product.
- **Do not build per-restaurant designs or templates.** Owner, verbatim: "hum kisi particular restaurant ka liya koi template design kuch nhi karega aise toh sabka liya hamhe karna padega ... logo carry karna jaruri nhi h quality matter karta h". Restaurant-specific templates and hard-coded tenant data were deliberately **removed** earlier (commits `0056b7d`, `e26173c`).
- **Admin is reachable only through `admin.menusqr.in`**, never through `menusqr.in/login`, with strong security.

### 3.2 Working agreements
- Reply in **Hinglish** (match the owner's style, keep technical terms in English). Be concrete, give evidence, report plainly if something failed.
- The owner dislikes being asked technical questions that the assistant can decide. Ask only for decisions that change business rules, cost, security or production.
- **Push to `origin` and deploy only when asked.** Never commit or push on your own initiative. A git push to `main` triggers a Vercel production deploy of the frontend.
- **Isolated git worktrees.** Another AI session (Gemini / Antigravity, per earlier pasted logs) edits and **auto-commits in the shared main checkout** under the same git identity, and sometimes breaks CI. Do your work in `git worktree add ... ` under `%TEMP%`, never in the main checkout's working tree, and expect `origin/main` to move underneath you.
- Be careful with the auto-mode classifier: it blocked production DNS and tunnel changes (twice). Do not try to bypass it; ask the owner to run such commands themselves.
- Take screenshots/visual checks with a real browser when claiming a visual fix.

### 3.3 NEVER change without explicit owner approval
1. **Permanent QR behaviour**: QR URLs `https://menusqr.in/qr/<qr_id>`, the `qr_codes.qr_id` uniqueness, `tenant_qr_identity`, and the `/qr/:qrId` resolution. Printed QRs must keep working forever, even if the menu link name changes.
2. **Existing tenants' `menu_slug` values** (links already in the wild). Slug changes need the planned slug-history/redirect first.
3. **Plan prices, plan capabilities, subscription/entitlement logic**, Cashfree integration, webhook verification and idempotency. Flipping `CASHFREE_ENV` to PROD is an owner action with owner keys.
4. **The security model**: admin-origin gate (`createAdminOriginChecker` in `backend/cors.js`, used in `backend/server.js`), 12 h strict admin sessions, OTP with HMAC hashing, CSRF tokens, tenant isolation by session, no OTP logging. Never weaken any of it.
5. **Database data**: never drop or rename a column or table; migrations are additive and idempotent; never run destructive scripts on production data; run any backfill as a dry run on a snapshot first; never delete tenant data. Legacy columns on `clients` stay populated.
6. **Existing published themes and template ids** keep rendering (legacy presets and the 25 aliases stay resolvable). No live menu may change appearance without owner action (except the truth/accuracy fixes).
7. **Single backend instance**: SSE order stream, email-outbox worker, task queue and rate limiters are in memory. Never run more than one replica.
8. **`api.menusqr.in` hostname and the Cloudflare tunnel**, and the Supabase bucket `menusqr-uploads` keys / public URLs of existing uploads (the `/uploads/*` redirect behaviour stays).
9. **The Render fallback service** stays until the owner says to suspend it.
10. **Other remotes** (`fork`, `qevnaro`, `qevnaro-new`): do not push there on your own; `origin` is the deploy repository.
11. **The truthfulness rule**: a menu prints only owner-supplied data, computed facts and neutral labels (section 10.3). Never add placeholder or invented text.
12. **Secrets**: never print, log, commit or rotate them without the owner.
13. **Documentation in `docs/`**: do not overwrite the existing audit files; edit additively.


-- 018_phase0_review_flags.sql
--
-- Phase 0 – Privacy & Safety hotfixes
--
-- Adds `review_flags` JSONB column to `clients`.
-- This column is a lightweight signal store for one-time owner prompts and
-- data-quality flags. It is written server-side only (never by the owner directly).
--
-- Flags used in Phase 0:
--   phone_privacy_pending  BOOLEAN
--     Set to true for ALL existing tenants by the backfill below.
--     Also set to true for every new tenant at provisioning (purchase.js P5-fix).
--     Cleared (set to false) when the owner responds to the
--     "Keep / Edit / Hide" prompt on the Home dashboard (Phase 3 UI).
--     While true, public.js returns restaurant.phone = null instead of
--     forwarding clients.phone to the public menu payload.
--
-- Design notes:
--   • Additive-only: no existing columns touched.
--   • Idempotent: safe to run multiple times.
--   • The backfill below marks every tenant with an existing non-null phone
--     as phone_privacy_pending so they receive the one-time prompt.
--   • Tenants whose phone is already null (e.g. future signups post P5-fix)
--     are also marked pending so the prompt still runs (they can set/keep/hide).

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS review_flags JSONB NOT NULL DEFAULT '{}';

-- Back-fill: flag every existing tenant so the Home dashboard shows the
-- one-time "Keep / Edit / Hide" prompt for their currently-published phone.
-- This does NOT remove any phone from the public payload immediately —
-- public.js only suppresses the phone AFTER the flag is set.
UPDATE clients
SET review_flags = review_flags || '{"phone_privacy_pending": true}'::jsonb
WHERE (review_flags->>'phone_privacy_pending') IS DISTINCT FROM 'true';

-- Index for fast lookup in public.js (checking the flag on every menu read).
CREATE INDEX IF NOT EXISTS idx_clients_review_flags_phone_pending
  ON clients ((review_flags->>'phone_privacy_pending'))
  WHERE (review_flags->>'phone_privacy_pending') = 'true';

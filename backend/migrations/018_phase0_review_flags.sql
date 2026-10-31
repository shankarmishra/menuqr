-- 018_phase0_review_flags.sql
--
-- Phase 0 - Privacy & Safety hotfixes
--
-- Adds `review_flags` JSONB column to `clients`.
-- This column is a lightweight signal store for one-time owner prompts and
-- data-quality flags. It is written server-side only (never by the owner directly).
--
-- Flags used in Phase 0:
--   phone_privacy_pending  BOOLEAN
--     Set to true for every existing tenant that does not have the key yet (below).
--     Also set to true for every new tenant at provisioning (purchase.js P5-fix).
--     Cleared (set to false) when the owner answers the "Keep / Edit / Hide" prompt
--     on the Home dashboard.
--     It ONLY drives that one-time prompt. It never hides a phone number: the public
--     menu keeps showing the restaurant's number until the owner explicitly hides it
--     (see resolvePublicPhone in publicMenuPayload.js).
--   phone_hidden  BOOLEAN
--     Written by the application when the owner explicitly chooses to hide the phone.
--
-- Design notes:
--   - Additive-only: no existing columns touched.
--   - Idempotent: safe to run multiple times. The UPDATE below skips every tenant that
--     already has the key, so re-running the file (for example when the tracked runner
--     applies it to a database where it was run by hand) never resets an owner's answer.

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS review_flags JSONB NOT NULL DEFAULT '{}';

-- Back-fill: flag every existing tenant that has no answer recorded yet so the Home
-- dashboard shows the one-time "Keep / Edit / Hide" prompt. A tenant that already has the
-- key (true, or false after the owner answered) is left exactly as it is.
UPDATE clients
SET review_flags = review_flags || '{"phone_privacy_pending": true}'::jsonb
WHERE NOT (review_flags ? 'phone_privacy_pending');

-- Index for fast lookup of the tenants that still have to answer the prompt.
CREATE INDEX IF NOT EXISTS idx_clients_review_flags_phone_pending
  ON clients ((review_flags->>'phone_privacy_pending'))
  WHERE (review_flags->>'phone_privacy_pending') = 'true';

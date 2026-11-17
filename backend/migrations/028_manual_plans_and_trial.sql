-- 027_manual_plans_and_trial.sql
-- MENUQR: Offline (manually paid) plan activation by super admin + 14-day free trial.
--
-- subscriptions.source        GATEWAY (Cashfree checkout) | MANUAL (activated by super admin) | TRIAL
-- subscriptions.custom_features  NULL = use the plan's default capabilities;
--                                a JSON array of capability keys = exactly these capabilities.
-- manual_plan_grants          ledger of every offline deal (amount agreed, how it was paid, duration).

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'GATEWAY',
  ADD COLUMN IF NOT EXISTS custom_features JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS manual_grant_id UUID DEFAULT NULL;

CREATE TABLE IF NOT EXISTS manual_plan_grants (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          VARCHAR(255) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan_id            VARCHAR(50) NOT NULL,
  list_price         NUMERIC(12, 2),
  agreed_amount      NUMERIC(12, 2) NOT NULL CHECK (agreed_amount >= 0),
  currency           VARCHAR(10) NOT NULL DEFAULT 'INR',
  payment_mode       VARCHAR(30) NOT NULL,
  payment_reference  VARCHAR(255),
  paid_on            DATE,
  duration_value     INTEGER NOT NULL CHECK (duration_value > 0),
  duration_unit      VARCHAR(10) NOT NULL CHECK (duration_unit IN ('DAYS', 'MONTHS', 'YEARS')),
  starts_at          TIMESTAMPTZ NOT NULL,
  expires_at         TIMESTAMPTZ NOT NULL,
  enabled_features   JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes              TEXT,
  status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'REVOKED')),
  granted_by         VARCHAR(255) NOT NULL,
  revoked_at         TIMESTAMPTZ,
  revoked_by         VARCHAR(255),
  revoke_reason      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_manual_plan_grants_tenant ON manual_plan_grants(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_plan_grants_created ON manual_plan_grants(created_at DESC);

-- One free trial per email / phone, even if the restaurant is later deleted.
CREATE TABLE IF NOT EXISTS trial_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(30),
  tenant_id   VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_trial_registrations_email ON trial_registrations (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS uq_trial_registrations_phone ON trial_registrations (phone) WHERE phone IS NOT NULL;

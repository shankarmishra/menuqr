-- Migration 004: Single-Use Email Verification Grants for Checkout Security

CREATE TABLE IF NOT EXISTS email_verification_grants (
  id VARCHAR(255) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL DEFAULT 'checkout',
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verification_grants_token ON email_verification_grants(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_grants_email_purpose ON email_verification_grants(email, purpose);

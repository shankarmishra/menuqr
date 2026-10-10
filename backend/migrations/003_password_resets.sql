-- Migration 003: Password Resets Table & Index
-- Provisions password_resets table for deployments where Migration 001 was already marked applied prior to password_resets inclusion.

CREATE TABLE IF NOT EXISTS password_resets (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  ip_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email_created
  ON password_resets (email, created_at DESC);

-- Admin sessions used to last 15 days. Cap any still-open session to 12 hours from now so the
-- shorter lifetime applies immediately instead of after the old sessions run out.
UPDATE admin_sessions
SET expires_at = LEAST(expires_at, NOW() + INTERVAL '12 hours')
WHERE expires_at > NOW() + INTERVAL '12 hours';

-- Query to find users affected by Issue #3 (unawaited Promise password_hash)
-- Usage: psql "$DATABASE_URL" -f backend/scripts/find-corrupted-password-hashes.sql

SELECT 
    id, 
    email, 
    role, 
    tenant_id, 
    password_hash, 
    created_at
FROM users
WHERE password_hash = '[object Promise]'
   OR password_hash LIKE '%Promise%'
   OR password_hash IS NULL
ORDER BY created_at DESC;

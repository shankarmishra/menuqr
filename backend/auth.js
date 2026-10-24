import jwt from 'jsonwebtoken';
import { parseCookie as parse, stringifySetCookie as serialize } from 'cookie';
import { randomBytes, pbkdf2, createHash, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { pool, queryPortable } from './db.js';

const pbkdf2Async = promisify(pbkdf2);

// Use a secure JWT secret from env or generate a temporary one (not ideal for production restarts, but safe for dev)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}
const COOKIE_NAME = 'menusqr_auth';

const PBKDF2_ITERATIONS = 600000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

// Password Hashing (OWASP recommended PBKDF2-HMAC-SHA256 600,000 iterations)
export async function hashPassword(password) {
  if (typeof password !== 'string' || !password) {
    throw new Error('Password must be a non-empty string.');
  }
  const saltBuf = randomBytes(16);
  const derivedKey = await pbkdf2Async(password, saltBuf, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  return `$pbkdf2-sha256$i=${PBKDF2_ITERATIONS}$l=${PBKDF2_KEYLEN}$${saltBuf.toString('hex')}$${derivedKey.toString('hex')}`;
}

export function isLegacyHash(storedHash) {
  if (typeof storedHash !== 'string' || !storedHash) return true;
  return !storedHash.startsWith('$pbkdf2-sha256$');
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || !password || typeof storedHash !== 'string' || !storedHash) {
    return false;
  }

  // 1. Current OWASP Standard Format: $pbkdf2-sha256$i=600000$l=32$<salt_hex>$<hash_hex>
  if (storedHash.startsWith('$pbkdf2-sha256$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 6) return false;
    const iterationsMatch = parts[2].match(/^i=(\d+)$/);
    const keylenMatch = parts[3].match(/^l=(\d+)$/);
    if (!iterationsMatch || !keylenMatch) return false;
    const iterations = parseInt(iterationsMatch[1], 10);
    const keylen = parseInt(keylenMatch[1], 10);
    const saltHex = parts[4];
    const originalHashHex = parts[5];
    if (!saltHex || !originalHashHex || iterations < 1000) return false;

    try {
      const saltBuf = Buffer.from(saltHex, 'hex');
      const expectedBuf = Buffer.from(originalHashHex, 'hex');
      const derivedBuf = await pbkdf2Async(password, saltBuf, iterations, keylen, 'sha256');
      return derivedBuf.length === expectedBuf.length && timingSafeEqual(derivedBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  // 2. Previous PBKDF2-SHA512 10,000 iterations format: <salt_hex>:<hash_hex>
  if (storedHash.includes(':')) {
    const [saltHex, originalHashHex] = storedHash.split(':');
    if (!saltHex || !originalHashHex) return false;
    try {
      const expectedBuf = Buffer.from(originalHashHex, 'hex');
      const derivedBuf = await pbkdf2Async(password, saltHex, 10000, 64, 'sha512');
      return derivedBuf.length === expectedBuf.length && timingSafeEqual(derivedBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  // 3. Legacy un-salted SHA-256 format (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(storedHash)) {
    try {
      const inputHashBuf = createHash('sha256').update(password).digest();
      const expectedBuf = Buffer.from(storedHash, 'hex');
      return inputHashBuf.length === expectedBuf.length && timingSafeEqual(inputHashBuf, expectedBuf);
    } catch {
      return false;
    }
  }

  return false;
}

// Token Generation
export function generateAuthToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId || null,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15d' });
}

export function generateAuthCookie(userOrToken) {
  const token = typeof userOrToken === 'string' ? userOrToken : generateAuthToken(userOrToken);
  const secure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';

  return serialize({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 15 * 24 * 60 * 60, // 15 days (1,296,000 seconds)
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}

export function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
  return serialize({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 0,
    ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
  });
}



// Helpers for native Node HTTP requests
import { verifyAdminSession } from './adminAuth.js';

export async function getAuthenticatedUser(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role === 'SUPER_ADMIN') {
      // Disallow JWTs representing SUPER_ADMIN to ensure complete isolation
      return null; 
    }
    
    // Check if user still exists in DB
    const res = await queryPortable(pool, 'SELECT id, role, tenant_id FROM users WHERE id = ?', [decoded.id]);
    const currentUser = res.rows[0];
    if (!currentUser) return null;

    return {
      id: String(currentUser.id),
      role: currentUser.role,
      tenantId: currentUser.tenant_id || null,
    };
  } catch (error) {
    console.error('JWT Verify Error:', error.message);
    return null;
  }
}

export async function enforceAuth(req) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    const err = new Error('Authentication required.');
    err.status = 401;
    throw err;
  }
  return user;
}

export async function enforceSuperAdmin(req) {
  const cookies = parse(req.headers.cookie || '');
  const bearerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const adminToken = cookies['menusqr_admin_session'] || bearerToken;
  
  if (adminToken) {
    const adminUser = await verifyAdminSession(adminToken);
    if (adminUser) return adminUser;
  }
  
  const err = new Error('Authentication required.');
  err.status = 401;
  throw err;
}

export async function enforceTenant(req) {
  const user = await enforceAuth(req);
  if (user.role !== 'RESTAURANT_OWNER' || !user.tenantId) {
    const err = new Error('Forbidden. Tenant access required.');
    err.status = 403;
    throw err;
  }
  return user;
}

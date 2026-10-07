import jwt from 'jsonwebtoken';
import { parseCookie as parse, stringifySetCookie as serialize } from 'cookie';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

// Use a secure JWT secret from env or generate a temporary one (not ideal for production restarts, but safe for dev)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is missing.");
  process.exit(1);
}
const COOKIE_NAME = 'menusqr_auth';

// Password Hashing (PBKDF2)
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  const [salt, originalHash] = storedHash.split(':');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Token Generation
export function generateAuthCookie(user) {
  const payload = {
    id: user.id,
    role: user.role,
    tenantId: user.tenantId || null,
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  
  return serialize({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

export function clearAuthCookie() {
  return serialize({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

import { pool, queryPortable } from './db.js';

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
  const adminToken = cookies['menusqr_admin_session'];
  
  if (adminToken) {
    const adminUser = await verifyAdminSession(adminToken);
    if (adminUser) return adminUser;
  }
  
  const err = new Error('Forbidden. Super Admin access required.');
  err.status = 403;
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

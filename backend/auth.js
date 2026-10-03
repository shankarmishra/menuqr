import jwt from 'jsonwebtoken';
import { parseCookie as parse, stringifySetCookie as serialize } from 'cookie';
import { randomBytes, pbkdf2Sync } from 'node:crypto';

// Use a secure JWT secret from env or generate a temporary one (not ideal for production restarts, but safe for dev)
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');
const COOKIE_NAME = 'menuqr_auth';

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

// Helpers for native Node HTTP requests
export function getAuthenticatedUser(req) {
  try {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies[COOKIE_NAME] || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT Verify Error:', error.message);
    return null;
  }
}

export function enforceAuth(req) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    const err = new Error('Authentication required.');
    err.status = 401;
    throw err;
  }
  return user;
}

export function enforceSuperAdmin(req) {
  const user = enforceAuth(req);
  if (user.role !== 'SUPER_ADMIN') {
    const err = new Error('Forbidden. Super Admin access required.');
    err.status = 403;
    throw err;
  }
  return user;
}

export function enforceTenant(req) {
  const user = enforceAuth(req);
  if (user.role !== 'RESTAURANT_OWNER' || !user.tenantId) {
    const err = new Error('Forbidden. Tenant access required.');
    err.status = 403;
    throw err;
  }
  return user;
}

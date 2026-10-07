import fs from 'fs';
let content = fs.readFileSync('backend/routes/auth.js', 'utf8');

// 1. Remove admin block from login
content = content.replace(/} else \{\s+const \{ verifyAdminPassword.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n    \}/s, '}');

// 2. Remove SUPER_ADMIN branch
content = content.replace(/if \(user\.role === 'SUPER_ADMIN'\) \{.*?return true;\n    \}/s, '');

// 3. Remove isAdmin logic from verify-login-otp
content = content.replace(/if \(isAdmin\) \{.*?\} else \{\s+const session/s, 'const session');
// Remove closing bracket of the else
content = content.replace(/sessionUser = session\.user;\n    \}/s, 'sessionUser = session.user;');

// 4. Inject new admin routes before "if (request.method === 'GET' && url.pathname === '/api/auth/session')"
const adminRoutes = `
  // NEW ADMIN ROUTES
  if (request.method === 'POST' && url.pathname === '/api/auth/admin/request-otp') {
    const input = await readJson(request);
    const email = input?.email?.trim().toLowerCase();
    if (!email) throw apiError(400, 'Email is required.');

    const { requestAdminOtp } = await import('../adminAuth.js');
    const address = getClientIp(request);
    
    try {
      const result = await requestAdminOtp(email, address);
      if (result) {
        const { sendLoginOtpEmail } = await import('../email.js');
        void sendLoginOtpEmail({ email, otp: result.otp, ownerName: 'Admin' }).catch(() => {});
        if (process.env.NODE_ENV === 'test') {
           sendJson(response, 200, { success: true, message: 'If an admin account exists, an OTP has been sent.', _testOtp: result.otp });
           return true;
        }
      }
    } catch (err) {
      if (err.status === 429) throw err;
    }
    
    sendJson(response, 200, { success: true, message: 'If an admin account exists, an OTP has been sent.' });
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/admin/verify-otp') {
    const input = await readJson(request);
    const { email, otp } = input || {};
    if (!email || !otp) throw apiError(400, 'Email and OTP are required.');

    const { verifyAdminOtp } = await import('../adminAuth.js');
    const address = getClientIp(request);
    
    let result;
    try {
      result = await verifyAdminOtp(email.trim().toLowerCase(), otp, address);
    } catch (err) {
      throw apiError(err.status || 401, err.message);
    }

    const { serialize } = await import('cookie');
    const cookie = serialize('menusqr_admin_session', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    
    response.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie });
    response.end(JSON.stringify({ authenticated: true, role: 'SUPER_ADMIN', email: result.email }));
    return true;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/admin/logout') {
    const { serialize, parse } = await import('cookie');
    const cookies = parse(request.headers.cookie || '');
    const adminToken = cookies['menusqr_admin_session'];
    if (adminToken) {
      const { clearAdminSession } = await import('../adminAuth.js');
      await clearAdminSession(adminToken);
    }
    const cookie = serialize('menusqr_admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });
    response.writeHead(200, { 'Content-Type': 'application/json', 'Set-Cookie': cookie });
    response.end(JSON.stringify({ authenticated: false }));
    return true;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {`;

content = content.replace("  if (request.method === 'GET' && url.pathname === '/api/auth/session') {", adminRoutes);

fs.writeFileSync('backend/routes/auth.js', content, 'utf8');
console.log('auth.js rewritten successfully');

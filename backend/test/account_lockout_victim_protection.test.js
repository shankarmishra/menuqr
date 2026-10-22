import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { pool, connectDB } from '../db.js';
import authRoutes from '../routes/auth.js';
import { hashPassword } from '../auth.js';

function mockRequest(method, body = null, headers = {}, remoteAddress = '198.51.100.5') {
  const req = body ? Readable.from([Buffer.from(JSON.stringify(body))]) : Readable.from([]);
  req.method = method;
  req.headers = { 'content-type': 'application/json', ...headers };
  req.socket = { remoteAddress };
  return req;
}

function mockResponse() {
  let statusCode = 200;
  let headers = {};
  let body = '';
  return {
    writeHead(status, hdrs) {
      statusCode = status;
      headers = hdrs || {};
    },
    end(str) {
      body = str || '';
    },
    get statusCode() { return statusCode; },
    get body() { return body; }
  };
}

test('Check (b): Attacker cannot DoS legitimate victim via account lockout (Compound Account+IP)', async (t) => {
  await connectDB(process.env.DATABASE_URL);

  const timestamp = Date.now();
  const userId = `user_victim_${timestamp}`;
  const victimEmail = `restaurant_owner_${timestamp}@example.com`;
  const password = 'SuperSecretOwnerPassword123!';
  const passwordHash = await hashPassword(password);

  const attackerIp = '203.0.113.55';
  const victimIp = '198.51.100.77';

  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, onboarding_state)
     VALUES ($1, $2, $3, 'RESTAURANT_OWNER', 'COMPLETED')`,
    [userId, victimEmail, passwordHash]
  );

  t.after(async () => {
    await pool.query('DELETE FROM client_otp_challenges WHERE email = $1', [victimEmail]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  // Step 1: Attacker at attackerIp tries 5 wrong passwords to lock out the victim
  for (let i = 1; i <= 5; i++) {
    const req = mockRequest('POST', { email: victimEmail, password: `WrongPassword_${i}` }, {}, attackerIp);
    const res = mockResponse();
    await assert.rejects(
      async () => authRoutes(req, res, new URL('http://localhost/api/auth/login')),
      (err) => err.status === 401 || err.status === 429
    );
  }

  // Step 2: Attacker is locked out from attackerIp
  const attackerAttempt6 = mockRequest('POST', { email: victimEmail, password: 'AnotherGuess' }, {}, attackerIp);
  const attackerRes6 = mockResponse();
  await assert.rejects(
    async () => authRoutes(attackerAttempt6, attackerRes6, new URL('http://localhost/api/auth/login')),
    (err) => err.status === 429 && err.message.includes('locked'),
    'Attacker IP must be locked out after 5 failures'
  );

  // Step 3: Legitimate victim from victimIp enters the CORRECT password
  // In vulnerable code, victim was globally locked out and rejected with 429!
  // In secure code, legitimate victim with correct password is NOT denied service.
  const victimReq = mockRequest('POST', { email: victimEmail, password: password }, {}, victimIp);
  const victimRes = mockResponse();

  await authRoutes(victimReq, victimRes, new URL('http://localhost/api/auth/login'));
  assert.equal(victimRes.statusCode, 200, 'Legitimate victim must NOT be locked out by attacker');

  const loginData = JSON.parse(victimRes.body);
  assert.equal(loginData.requireOtp, true, 'Victim receives 2-Step OTP verification challenge');

  // Step 4: Verify DB failed_attempts counter was reset on successful password verification
  const dbUser = await pool.query('SELECT failed_attempts, locked_until FROM users WHERE id = $1', [userId]);
  assert.equal(dbUser.rows[0].failed_attempts, 0, 'failed_attempts counter must be reset to 0');
  assert.equal(dbUser.rows[0].locked_until, null, 'locked_until must be reset to null');
});

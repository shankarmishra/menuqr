import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.resolve(__dirname, '..');
const TEST_SECRET = 'cf_secret_key_webhook_test_123';

function findFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function waitForServer(baseUrl) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server failed to start')), 15000);
    const poll = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/health`);
        if (res.ok) {
          clearTimeout(timeout);
          resolve();
          return;
        }
      } catch {}
      setTimeout(poll, 150);
    };
    poll();
  });
}

test('Batch 2 #4: Webhook endpoints must not be blocked by browser Origin/Referer checks', async (t) => {
  const port = await findFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;

  const serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      CASHFREE_SECRET_KEY: TEST_SECRET,
    },
    stdio: 'ignore',
  });

  t.after(() => {
    serverProcess.kill('SIGINT');
  });

  await waitForServer(baseUrl);

  await t.test('Cashfree server-to-server webhook with Origin: https://api.cashfree.com must NOT be rejected with 403 Forbidden', async () => {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify({ type: 'TEST_PING' });
    const signature = createHmac('sha256', TEST_SECRET).update(`${timestamp}${payload}`).digest('base64');

    const res = await fetch(`${baseUrl}/api/webhooks/cashfree`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-webhook-timestamp': timestamp,
        'x-webhook-signature': signature,
        'origin': 'https://api.cashfree.com',
        'referer': 'https://api.cashfree.com/events/dispatch',
      },
      body: payload,
    });

    const data = await res.json().catch(() => ({}));

    // BUG CHECK: In vulnerable server.js, origin header triggers 403 Forbidden before reaching the route!
    assert.notEqual(
      res.status,
      403,
      `VULNERABILITY: Validly signed webhook rejected with 403 Forbidden due to Origin/Referer header: ${JSON.stringify(data)}`
    );
  });
});

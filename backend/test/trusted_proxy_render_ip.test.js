import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp } from '../utils.js';

function mockReq(headers = {}, remoteAddress = '10.0.0.1') {
  return {
    headers,
    socket: { remoteAddress }
  };
}

test('Check (a): TRUST_PROXY on Render accurately extracts real client IP without trusting spoofed XFF', () => {
  const origTrustProxy = process.env.TRUST_PROXY;
  const origHops = process.env.TRUST_PROXY_HOPS;

  try {
    process.env.TRUST_PROXY = 'true';
    delete process.env.TRUST_PROXY_HOPS;

    // 1. Attacker attempts to spoof XFF by prepending fake IP '1.2.3.4'.
    // Render receives request from real client 203.0.113.195 and forwards: "1.2.3.4, 203.0.113.195"
    const reqSpoofed = mockReq({
      'x-forwarded-for': '1.2.3.4, 203.0.113.195'
    }, '10.0.0.1');

    const resolvedIp = getClientIp(reqSpoofed);
    assert.equal(resolvedIp, '203.0.113.195', 'Must extract actual client IP appended by Render proxy, NOT leftmost spoofed IP');

    // 2. Standard single IP in XFF
    const reqSingle = mockReq({
      'x-forwarded-for': '203.0.113.88'
    }, '10.0.0.1');
    assert.equal(getClientIp(reqSingle), '203.0.113.88');

    // 3. Cloudflare edge header takes precedence
    const reqCf = mockReq({
      'cf-connecting-ip': '198.51.100.77',
      'x-forwarded-for': '1.1.1.1, 10.0.0.2'
    }, '10.0.0.1');
    assert.equal(getClientIp(reqCf), '198.51.100.77');

    // 4. Render X-Real-IP takes precedence over XFF
    const reqRealIp = mockReq({
      'x-real-ip': '198.51.100.66',
      'x-forwarded-for': '1.1.1.1, 10.0.0.2'
    }, '10.0.0.1');
    assert.equal(getClientIp(reqRealIp), '198.51.100.66');

    // 5. When TRUST_PROXY is disabled, headers are ignored
    delete process.env.TRUST_PROXY;
    const reqUntrusted = mockReq({
      'x-forwarded-for': '1.2.3.4, 203.0.113.195',
      'x-real-ip': '203.0.113.195'
    }, '192.0.2.1');
    assert.equal(getClientIp(reqUntrusted), '192.0.2.1', 'Untrusted proxy must use socket address');
  } finally {
    process.env.TRUST_PROXY = origTrustProxy;
    process.env.TRUST_PROXY_HOPS = origHops;
  }
});

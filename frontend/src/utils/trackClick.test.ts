import test from 'node:test';
import assert from 'node:assert/strict';
import { trackClick, trackClickRequest } from './trackClick.ts';

type Call = { url: string; init: RequestInit };
const recorder = () => {
  const calls: Call[] = [];
  const send = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(new Response('{}'));
  }) as unknown as typeof fetch;
  return { calls, send };
};

test('the beacon posts only the kind to the menu track-click route', () => {
  const { url, init } = trackClickRequest('https://api.example.test', 'my-dhaba', 'instagram');
  assert.equal(url, 'https://api.example.test/api/public/menus/my-dhaba/track-click');
  assert.equal(init.method, 'POST');
  assert.deepEqual(JSON.parse(String(init.body)), { kind: 'instagram' });
  assert.equal(init.keepalive, true);
  assert.equal(init.credentials, undefined);
});

test('a slug is escaped in the route', () => {
  assert.equal(trackClickRequest('', 'a/b c', 'call').url, '/api/public/menus/a%2Fb%20c/track-click');
});

test('trackClick sends one request and does not wait for it', () => {
  const { calls, send } = recorder();
  const result = trackClick('beacon-one', 'whatsapp', { send, baseUrl: '', now: 1_000 });
  assert.equal(result, undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/public/menus/beacon-one/track-click');
});

test('a double tap of the same kind counts once, other kinds and later taps count', () => {
  const { calls, send } = recorder();
  trackClick('beacon-two', 'call', { send, baseUrl: '', now: 10_000 });
  trackClick('beacon-two', 'call', { send, baseUrl: '', now: 10_500 });
  trackClick('beacon-two', 'share', { send, baseUrl: '', now: 10_600 });
  trackClick('beacon-two', 'call', { send, baseUrl: '', now: 12_100 });
  assert.deepEqual(calls.map((call) => JSON.parse(String(call.init.body)).kind), ['call', 'share', 'call']);
});

test('no slug means no request, and a failing network never throws', async () => {
  const { calls, send } = recorder();
  trackClick(undefined, 'call', { send, baseUrl: '' });
  assert.equal(calls.length, 0);

  const failing = (() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
  assert.doesNotThrow(() => trackClick('beacon-three', 'call', { send: failing, baseUrl: '', now: 50_000 }));
  const throwing = (() => {
    throw new Error('blocked');
  }) as unknown as typeof fetch;
  assert.doesNotThrow(() => trackClick('beacon-four', 'call', { send: throwing, baseUrl: '', now: 60_000 }));
  await new Promise((resolve) => setTimeout(resolve, 0));
});

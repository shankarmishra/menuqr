import test from 'node:test';
import assert from 'node:assert/strict';
import { allowHit, isBotAgent, recordMenuHit } from '../menuStats.js';
import { istHourBucket } from '../istTime.js';

test('istHourBucket: follows IST wall clock', () => {
  assert.deepEqual(istHourBucket(new Date('2026-01-01T18:29:00Z')), { day: '2026-01-01', hour: 23 });
  assert.deepEqual(istHourBucket(new Date('2026-01-01T18:30:00Z')), { day: '2026-01-02', hour: 0 });
  assert.deepEqual(istHourBucket(new Date('2026-06-15T06:45:00Z')), { day: '2026-06-15', hour: 12 });
});

test('isBotAgent: drops crawlers and empty agents, keeps phones', () => {
  assert.equal(isBotAgent(''), true);
  assert.equal(isBotAgent(undefined), true);
  assert.equal(isBotAgent('WhatsApp/2.23 A'), true);
  assert.equal(isBotAgent('Mozilla/5.0 (compatible; Googlebot/2.1)'), true);
  assert.equal(isBotAgent('facebookexternalhit/1.1'), true);
  assert.equal(isBotAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'), false);
});

test('allowHit: caps per key per window and resets after it', () => {
  const store = new Map();
  for (let i = 0; i < 3; i += 1) assert.equal(allowHit(store, 'a', 1000, 3, 60000), true);
  assert.equal(allowHit(store, 'a', 2000, 3, 60000), false);
  assert.equal(allowHit(store, 'b', 2000, 3, 60000), true, 'other keys are independent');
  assert.equal(allowHit(store, 'a', 61001, 3, 60000), true, 'window rolled over');
});

test('recordMenuHit: upserts into the right hour and column', async () => {
  const calls = [];
  const db = { query: async (sql, params) => { calls.push({ sql, params }); } };
  const at = new Date('2026-01-01T18:35:00Z'); // 00:05 IST on the 2nd
  await recordMenuHit(db, 't1', 'qr', at);
  await recordMenuHit(db, 't1', 'direct', at);
  assert.deepEqual(calls[0].params, ['t1', '2026-01-02', 0, 1, 0]);
  assert.deepEqual(calls[1].params, ['t1', '2026-01-02', 0, 0, 1]);
  assert.match(calls[0].sql, /ON CONFLICT \(tenant_id, day, hour\)/);
});

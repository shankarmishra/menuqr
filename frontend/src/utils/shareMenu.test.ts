import test from 'node:test';
import assert from 'node:assert/strict';
import { copyText, shareMenu } from './shareMenu.ts';

const menu = { title: 'Test Dhaba', url: 'https://menusqr.in/menu/test-dhaba' };

test('the share sheet is used when the browser has one', async () => {
  const shared: unknown[] = [];
  const result = await shareMenu(menu, { share: async (data) => void shared.push(data), writeText: async () => assert.fail('must not copy') });
  assert.equal(result, 'shared');
  assert.deepEqual(shared, [{ title: 'Test Dhaba', url: 'https://menusqr.in/menu/test-dhaba' }]);
});

test('without a share sheet the link is copied', async () => {
  const copied: string[] = [];
  assert.equal(await shareMenu(menu, { writeText: async (text) => void copied.push(text) }), 'copied');
  assert.deepEqual(copied, [menu.url]);
});

test('closing the share sheet is a cancel, not a failure, and copies nothing', async () => {
  const cancel = Object.assign(new Error('closed'), { name: 'AbortError' });
  const result = await shareMenu(menu, { share: async () => Promise.reject(cancel), writeText: async () => assert.fail('must not copy') });
  assert.equal(result, 'cancelled');
});

test('a share sheet that breaks falls back to copying', async () => {
  const copied: string[] = [];
  const result = await shareMenu(menu, { share: async () => Promise.reject(new Error('boom')), writeText: async (text) => void copied.push(text) });
  assert.equal(result, 'copied');
  assert.deepEqual(copied, [menu.url]);
});

test('the legacy copy path is used when the clipboard API refuses', async () => {
  const legacy: string[] = [];
  const env = { writeText: async () => Promise.reject(new Error('denied')), legacyCopy: (text: string) => (legacy.push(text), true) };
  assert.equal(await copyText('hello', env), true);
  assert.deepEqual(legacy, ['hello']);
});

test('nothing to share with and nothing to copy with is reported as a failure', async () => {
  assert.equal(await shareMenu(menu, {}), 'failed');
  assert.equal(await copyText('x', { legacyCopy: () => false }), false);
  assert.equal(await copyText('x', { legacyCopy: () => { throw new Error('no'); } }), false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {
  isNonPublicIp,
  parsePublicHttpUrl,
  isOwnImageUrl,
  fetchPublicImage,
  mirrorExternalImages,
} from '../externalImageMirror.js';

test('isNonPublicIp blocks private, loopback, metadata and reserved addresses', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '192.168.0.5', '172.16.0.1', '172.31.255.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1']) {
    assert.equal(isNonPublicIp(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '151.101.1.1', '172.32.0.1', '2606:4700::1111']) {
    assert.equal(isNonPublicIp(ip), false, ip);
  }
});

test('parsePublicHttpUrl accepts normal web URLs only', () => {
  assert.ok(parsePublicHttpUrl('https://upload.wikimedia.org/a/b.jpg'));
  assert.ok(parsePublicHttpUrl('http://images.unsplash.com/photo.jpg'));
  for (const bad of ['ftp://x.com/a.jpg', 'file:///etc/passwd', 'javascript:alert(1)', 'http://127.0.0.1/a.jpg', 'http://169.254.169.254/latest/meta-data', 'http://localhost/a.jpg', 'https://user:pw@x.com/a.jpg', 'http://x.com:8080/a.jpg', 'not a url', '']) {
    assert.equal(parsePublicHttpUrl(bad), null, bad);
  }
});

test('isOwnImageUrl recognises our own storage and relative paths', () => {
  const env = { ASSET_BASE_URL: 'https://cdn.menusqr.in/assets' };
  assert.equal(isOwnImageUrl('/uploads/a.webp', env), true);
  assert.equal(isOwnImageUrl('https://cdn.menusqr.in/assets/dishes/a.webp', env), true);
  assert.equal(isOwnImageUrl('https://upload.wikimedia.org/a.jpg', env), false);
  assert.equal(isOwnImageUrl('', env), true);
});

test('fetchPublicImage refuses a server on the loopback interface (SSRF guard)', async () => {
  const server = http.createServer((_, res) => { res.writeHead(200, { 'content-type': 'image/png' }); res.end('x'); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const { port } = server.address();
  try {
    await assert.rejects(() => fetchPublicImage(`http://127.0.0.1:${port}/a.png`));
  } finally {
    server.close();
  }
});

test('mirrorExternalImages leaves own, relative and blocked links untouched and never throws', async () => {
  const items = [
    { imageUrl: '/uploads/a.webp' },
    { imageUrl: 'http://127.0.0.1/a.jpg' },
    { imageUrl: '' },
    { imageUrl: undefined },
  ];
  const before = JSON.stringify(items);
  const stats = await mirrorExternalImages(items, 'tenant-x', { env: {} });
  assert.equal(JSON.stringify(items), before);
  assert.equal(stats.mirrored, 0);
});

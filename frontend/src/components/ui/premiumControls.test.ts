import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { prerender } from 'react-dom/static';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..', '..');

let vite: ViteDevServer;
const load = (p: string) => vite.ssrLoadModule(p);
let SegmentedControl: React.ComponentType<any>;
let MercurySwitch: React.ComponentType<any>;
let OdometerNumber: React.ComponentType<any>;
let formatOdometerText: (v: number, d?: number) => string;
let GemRating: React.ComponentType<any>;
let OtpInput: React.ComponentType<any>;
let sanitizeOtp: (raw: string, n: number) => string;
let formatCountdown: (s: number) => string;

before(async () => {
  vite = await createServer({
    configFile: false,
    root: frontendRoot,
    logLevel: 'error',
    appType: 'custom',
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_ui'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [{ name: 'stub-css', enforce: 'pre' as const, load(id: string) { return /\.css(\?|$)/.test(id) ? 'export default ""' : undefined; } }, react()],
  });
  SegmentedControl = (await load('/src/components/ui/SegmentedControl.tsx')).default;
  MercurySwitch = (await load('/src/components/ui/MercurySwitch.tsx')).default;
  const odo = await load('/src/components/ui/OdometerNumber.tsx');
  OdometerNumber = odo.default;
  formatOdometerText = odo.formatOdometerText;
  GemRating = (await load('/src/components/ui/GemRating.tsx')).default;
  const otp = await load('/src/components/ui/OtpInput.tsx');
  OtpInput = otp.default;
  sanitizeOtp = otp.sanitizeOtp;
  formatCountdown = otp.formatCountdown;
});

after(async () => { await vite?.close(); });

async function html(el: React.ReactElement) {
  const { prelude } = await prerender(el);
  return (await new Response(prelude).text()).replace(/<!--.*?-->/g, '');
}
const noop = () => {};

test('SegmentedControl is a radio group with exactly one checked, tabbable option', async () => {
  const out = await html(React.createElement(SegmentedControl, {
    ariaLabel: 'Mode', value: 'b', onChange: noop,
    options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }],
  }));
  assert.ok(out.includes('role="radiogroup"') && out.includes('aria-label="Mode"'));
  assert.equal(out.match(/aria-checked="true"/g)?.length, 1);
  assert.equal(out.match(/tabindex="0"/g)?.length, 1);
  assert.ok(out.includes('translateX(100%)'), 'blob sits under the 2nd option');
});

test('MercurySwitch is a real switch with a name', async () => {
  const on = await html(React.createElement(MercurySwitch, { checked: true, onChange: noop, label: 'Old stickers' }));
  assert.ok(on.includes('role="switch"') && on.includes('aria-checked="true"') && on.includes('aria-label="Old stickers"'));
  const off = await html(React.createElement(MercurySwitch, { checked: false, onChange: noop, label: 'x', disabled: true }));
  assert.ok(off.includes('aria-checked="false"') && off.includes('disabled'));
});

test('OdometerNumber formats Indian money and gives screen readers the plain value', async () => {
  assert.equal(formatOdometerText(123456.5, 2), '1,23,456.50');
  assert.equal(formatOdometerText(Number.NaN), '0');
  const out = await html(React.createElement(OdometerNumber, { value: 3199, prefix: '₹', fractionDigits: 2 }));
  assert.ok(out.includes('class="mq-sr-only">₹<!-- -->3,199.00') || out.includes('mq-sr-only">₹3,199.00'), 'plain value for screen readers');
  assert.ok(out.includes('aria-hidden="true"'), 'reels hidden from screen readers');
});

test('GemRating marks the chosen gem and lights the ones before it', async () => {
  const out = await html(React.createElement(GemRating, { value: 3, onChange: noop }));
  assert.equal(out.match(/role="radio"/g)?.length, 5);
  assert.equal(out.match(/data-lit="true"/g)?.length, 3);
  assert.ok(out.includes('aria-label="3 of 5"'));
});

test('OtpInput: one box per digit, SMS autofill on the first, digits only', async () => {
  const out = await html(React.createElement(OtpInput, { value: '12', onChange: noop, length: 6 }));
  assert.equal(out.match(/class="mq-otp__cell"/g)?.length, 6);
  assert.ok(out.includes('autoComplete="one-time-code"') || out.includes('autocomplete="one-time-code"'));
  assert.ok(out.includes('inputMode="numeric"') || out.includes('inputmode="numeric"'));
  assert.equal(sanitizeOtp(' 12-34 a56 789', 6), '123456');
  assert.equal(formatCountdown(125), '2:05');
  assert.equal(formatCountdown(-3), '0:00');
  const timed = await html(React.createElement(OtpInput, { value: '', onChange: noop, expiresInSeconds: 300 }));
  assert.ok(timed.includes('Code expires in 5:00'));
});

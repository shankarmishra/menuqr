/**
 * usePlan.adversarial.stress.mjs
 * Milestone 4 Challenger 2 — Empirical Stress Test Suite
 *
 * Adversarially challenges:
 * 1. Singleton Invariant: 100 simultaneous component mounts -> exactly 1 EventSource
 * 2. Real-Time Zero-Reload Unlock: plan_updated event -> instant in-memory update with ZERO spinner flash
 * 3. Clean Teardown: 100 -> 0 unmounts -> EventSource closed, 0 active connections
 * 4. Remount Lifecycle: Re-mounting creates a fresh singleton connection cleanly
 * 5. Concurrency Flapping / Churn: 50 -> 25 -> 100 -> 50 -> 0 transitions
 * 6. Network Failure & Exponential Backoff: onerror triggers close + exponential reconnect delays
 * 7. Adversarial Payloads & Robustness: Malformed JSON, flood, and missing attributes
 */

import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '..');
const PORT = 5198;

async function run() {
  console.log('================================================================');
  console.log('M4 CHALLENGER 2: SSE SINGLETON & MULTI-MOUNT ADVERSARIAL SUITE');
  console.log('================================================================\n');

  // 1. Launch Vite Dev Server programmatically
  console.log(`[Setup] Starting Vite server on 127.0.0.1:${PORT}...`);
  const vite = await createServer({
    root: frontendRoot,
    server: { host: '127.0.0.1', port: PORT },
    logLevel: 'error',
  });
  await vite.listen();
  console.log(`[Setup] Vite dev server listening at http://127.0.0.1:${PORT}`);

  // 2. Launch Chromium browser
  console.log('[Setup] Launching Chromium browser via Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Mock stateful subscription endpoint
  let backendSubscriptionState = {
    planId: 'BASIC',
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
    contentChangesRemaining: 30,
    contentChangesLimit: 30,
  };

  await page.route('**/api/app/subscription', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(backendSubscriptionState),
    });
  });

  const testResults = [];
  function recordPass(name, detail = '') {
    console.log(`  ✔ PASS: ${name} ${detail ? `(${detail})` : ''}`);
    testResults.push({ name, status: 'PASS', detail });
  }
  function recordFail(name, error) {
    console.error(`  ✖ FAIL: ${name}:`, error.message);
    testResults.push({ name, status: 'FAIL', error: error.message });
  }

  try {
    // Navigate to test harness
    await page.goto(`http://127.0.0.1:${PORT}/tests/sse_stress.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__SSE_TEST__ !== 'undefined');
    console.log('[Setup] Test harness loaded in browser.\n');

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: 100 Simultaneous Component Mounts (Singleton Invariant)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('[Test 1] 100 Simultaneous Component Mounts (Singleton Invariant)');
    try {
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(100));
      await page.waitForSelector('[data-testid="consumer-99"]', { timeout: 10000 });

      const count = await page.locator('[data-testid^="consumer-"]').count();
      assert.equal(count, 100, `Expected 100 mounted components, got ${count}`);

      const stats = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(stats.totalCreated, 1, `CRITICAL: Expected exactly 1 EventSource created, got ${stats.totalCreated}`);
      assert.equal(stats.activeCount, 1, `CRITICAL: Expected exactly 1 active EventSource, got ${stats.activeCount}`);

      const instance = stats.instances[0];
      assert.equal(instance.url, '/api/app/orders/stream', `Unexpected URL: ${instance.url}`);
      assert.equal(instance.options?.withCredentials, true, 'withCredentials must be true');
      assert.ok(instance.listenerTypes.includes('plan_updated'), "EventSource must register listener for 'plan_updated'");

      // Verify all 100 components reflect initial BASIC state
      const basicCount = await page.locator('[data-plan="basic"]').count();
      assert.equal(basicCount, 100, `Expected all 100 components to have plan="basic", got ${basicCount}`);

      const ordersNoCount = await page.locator('[data-orders="false"]').count();
      assert.equal(ordersNoCount, 100, `Expected all 100 components to have can('reception_orders')=false, got ${ordersNoCount}`);

      recordPass('Singleton SSE Invariant with 100 mounts', `Created: ${stats.totalCreated}, Active: ${stats.activeCount}`);
    } catch (err) {
      recordFail('Singleton SSE Invariant with 100 mounts', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: Instant Capability Unlock & Zero Spinner Flash
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 2] Instant Capability Unlock & Zero Spinner Flash on plan_updated');
    try {
      await page.evaluate(() => window.__SSE_TEST__.clearComponentRecords());
      await page.evaluate(() => window.__SSE_TEST__.clearCustomEventDispatched());

      const futureDate = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
      backendSubscriptionState = {
        planId: 'PREMIUM',
        status: 'ACTIVE',
        expiresAt: futureDate,
        contentChangesRemaining: 30,
        contentChangesLimit: null,
      };
      const startTime = Date.now();

      // Dispatch real-time upgrade event over SSE
      await page.evaluate((expDate) => {
        window.__SSE_TEST__.simulatePlanUpdated({
          type: 'plan_updated',
          plan: 'PREMIUM',
          planId: 'PREMIUM',
          expiresAt: expDate,
          orderId: 'ord_adversarial_test_01',
          orderSubtype: 'UPGRADE',
          timestamp: Date.now(),
        });
      }, futureDate);

      // Wait until all 100 components report plan="premium"
      await page.waitForFunction(() => {
        const premium = document.querySelectorAll('[data-plan="premium"]');
        return premium.length === 100;
      }, { timeout: 5000 });

      const elapsed = Date.now() - startTime;

      // Verify all 100 have capability unlocked immediately
      const premiumOrdersCount = await page.locator('[data-orders="true"]').count();
      assert.equal(premiumOrdersCount, 100, `Expected all 100 components to have can('reception_orders')=true, got ${premiumOrdersCount}`);

      // Verify custom DOM event was received
      const customEvent = await page.evaluate(() => window.__SSE_TEST__.getCustomEventDispatched());
      assert.ok(customEvent, 'Expected menusqr:plan-updated window event to be dispatched');
      assert.equal(customEvent.planId, 'PREMIUM');
      assert.equal(customEvent.status, 'ACTIVE');
      assert.equal(customEvent.orderId, 'ord_adversarial_test_01');

      // CRITICAL INVARIANT: Zero Spinner Flash Verification
      // Inspect every render record across all 100 components during the transition
      const records = await page.evaluate(() => window.__SSE_TEST__.getComponentRecords());
      let spinnerFlashes = 0;
      let totalRenders = 0;

      for (let i = 0; i < 100; i++) {
        const compRecords = records[i] || [];
        totalRenders += compRecords.length;
        for (const r of compRecords) {
          if (r.loading === true) {
            spinnerFlashes++;
          }
        }
      }

      assert.equal(
        spinnerFlashes,
        0,
        `CRITICAL REGRESSION: Detected ${spinnerFlashes} loading spinner flashes across ${totalRenders} renders during real-time plan unlock!`
      );

      recordPass(
        'Zero Spinner Flash & Instant Capability Unlock',
        `100/100 unlocked in ${elapsed}ms | Spinner flashes: 0 / ${totalRenders} renders`
      );
    } catch (err) {
      recordFail('Zero Spinner Flash & Instant Capability Unlock', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: Unmount to 0 (Clean Teardown & Resource Release)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 3] Unmount to 0 Consumers (Clean Teardown)');
    try {
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);

      const stats = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(stats.activeCount, 0, `CRITICAL: Expected 0 active EventSource after unmount to 0, got ${stats.activeCount}`);

      const latest = stats.instances[stats.instances.length - 1];
      assert.equal(latest.closed, true, 'EventSource must be closed on unmount to 0');

      recordPass('Clean Teardown to 0 Consumers', `Active EventSource: ${stats.activeCount}, Closed: ${latest.closed}`);
    } catch (err) {
      recordFail('Clean Teardown to 0 Consumers', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: Remount Lifecycle (Fresh Singleton After Teardown)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 4] Remount Lifecycle (Fresh Singleton After Teardown)');
    try {
      // Remount 1 consumer
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(1));
      await page.waitForSelector('[data-testid="consumer-0"]');

      const statsRemount = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(statsRemount.totalCreated, 2, `Expected totalCreated=2, got ${statsRemount.totalCreated}`);
      assert.equal(statsRemount.activeCount, 1, `Expected activeCount=1, got ${statsRemount.activeCount}`);

      const newInstance = statsRemount.instances[statsRemount.instances.length - 1];
      assert.equal(newInstance.closed, false, 'New EventSource must be open');

      // Teardown again
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);

      const statsTeardown2 = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(statsTeardown2.activeCount, 0, `Expected activeCount=0, got ${statsTeardown2.activeCount}`);

      recordPass('Remount Lifecycle', `Total created: ${statsRemount.totalCreated}, Cleanly torn down again`);
    } catch (err) {
      recordFail('Remount Lifecycle', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: Concurrency Flapping / High-Churn Turbulence
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 5] Concurrency Flapping / High-Churn Turbulence (50 -> 25 -> 100 -> 50 -> 0)');
    try {
      // Step A: Mount 50
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(50));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 50);
      let s = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(s.activeCount, 1, 'Step A: activeCount must be 1');

      // Step B: Down to 25
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(25));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 25);
      s = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(s.activeCount, 1, 'Step B: activeCount must be 1');

      // Step C: Up to 100
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(100));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 100);
      s = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(s.activeCount, 1, 'Step C: activeCount must be 1');

      // Step D: Down to 50
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(50));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 50);
      s = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(s.activeCount, 1, 'Step D: activeCount must be 1');

      // Step E: Down to 0
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);
      s = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(s.activeCount, 0, 'Step E: activeCount must be 0');

      recordPass('Concurrency Flapping Invariant', 'Active EventSource remained strictly 1 during churn, 0 on final unmount');
    } catch (err) {
      recordFail('Concurrency Flapping Invariant', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 6: Network Failure & Exponential Reconnection Backoff
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 6] Network Failure & Exponential Reconnection Backoff');
    try {
      // Mount 1 consumer to initiate SSE
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(1));
      await page.waitForSelector('[data-testid="consumer-0"]');

      // Disable autoOpen to simulate continuous outage where handshake cannot succeed
      await page.evaluate(() => window.__SSE_TEST__.setAutoOpen(false));

      let stats = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      const initialTotal = stats.totalCreated;

      // Trigger Error 1 (reconnectAttempts = 1 -> delay: 1000 * 1.5^1 + [0..500]ms = ~1500-2000ms)
      console.log('    Triggering network error #1 (simulating outage)...');
      const t1Start = Date.now();
      await page.evaluate(() => window.__SSE_TEST__.simulateError());

      // Verify connection closed immediately
      stats = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(stats.activeCount, 0, 'EventSource must be closed immediately upon error');

      // Wait for reconnect #1
      await page.waitForFunction(
        (target) => window.__SSE_TEST__.getEventSourceStats().totalCreated >= target,
        initialTotal + 1,
        { timeout: 5000 }
      );
      const delay1 = Date.now() - t1Start;
      console.log(`    Reconnect #1 occurred after ${delay1}ms (nominal: 1500-2000ms)`);
      assert.ok(delay1 >= 1300 && delay1 <= 2400, `Reconnect #1 delay outside expected window: ${delay1}ms`);

      // Trigger Error 2 on reconnect #1 (reconnectAttempts = 2 -> delay: 1000 * 1.5^2 + [0..500]ms = ~2250-2750ms)
      console.log('    Triggering network error #2 (outage continues)...');
      const t2Start = Date.now();
      await page.evaluate(() => window.__SSE_TEST__.simulateError());

      await page.waitForFunction(
        (target) => window.__SSE_TEST__.getEventSourceStats().totalCreated >= target,
        initialTotal + 2,
        { timeout: 6000 }
      );
      const delay2 = Date.now() - t2Start;
      console.log(`    Reconnect #2 occurred after ${delay2}ms (nominal: 2250-2750ms)`);
      assert.ok(delay2 >= 2000 && delay2 <= 3300, `Reconnect #2 delay outside expected window: ${delay2}ms`);
      assert.ok(delay2 > delay1, `Backoff progression violation: delay2 (${delay2}ms) should be > delay1 (${delay1}ms)`);

      // Simulate successful open on the latest connection
      console.log('    Simulating connection restore (open)...');
      await page.evaluate(() => window.__SSE_TEST__.setAutoOpen(true));
      await page.evaluate(() => window.__SSE_TEST__.simulateOpen());

      // Teardown
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);

      recordPass(
        'Exponential Backoff Reconnection',
        `Attempt 1: ${delay1}ms | Attempt 2: ${delay2}ms | Monotonic progression verified`
      );
    } catch (err) {
      recordFail('Exponential Backoff Reconnection', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 7: Malformed Payloads & Adversarial Flooding
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 7] Malformed Payloads & Adversarial Flooding Robustness');
    try {
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(10));
      await page.waitForSelector('[data-testid="consumer-9"]');

      // 1. Send completely invalid JSON
      await page.evaluate(() => window.__SSE_TEST__.simulatePlanUpdated('<<MALFORMED_JSON_STRING%%$$'));

      // 2. Send empty string
      await page.evaluate(() => window.__SSE_TEST__.simulatePlanUpdated(''));

      // 3. Send null / empty object
      await page.evaluate(() => window.__SSE_TEST__.simulatePlanUpdated({}));

      // Verify all 10 components are still alive and rendered
      const liveCount = await page.locator('[data-testid^="consumer-"]').count();
      assert.equal(liveCount, 10, 'All components must survive malformed payloads without unmounting or crashing');

      // 4. Send flood of 50 rapid valid events
      backendSubscriptionState = {
        planId: 'PREMIUM',
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 100000).toISOString(),
        contentChangesRemaining: 30,
        contentChangesLimit: null,
      };

      for (let i = 0; i < 50; i++) {
        await page.evaluate((idx) => {
          window.__SSE_TEST__.simulatePlanUpdated({
            plan: idx % 2 === 0 ? 'INTERMEDIATE' : 'PREMIUM',
            expiresAt: new Date(Date.now() + 100000).toISOString(),
          });
        }, i);
      }

      // Check final state
      await page.waitForFunction(() => {
        const p = document.querySelector('[data-testid="consumer-0"]')?.getAttribute('data-plan');
        return p === 'premium' || p === 'intermediate';
      });

      // Teardown
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);

      recordPass('Malformed Payloads & Flooding', '10/10 survived malformed JSON, empty payloads, and 50 rapid events');
    } catch (err) {
      recordFail('Malformed Payloads & Flooding', err);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 8: Reconnection Timer Cancellation on Unmount (Zero Ghost Connections)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[Test 8] Reconnection Timer Cancellation on Unmount (Zero Ghost Connections)');
    try {
      // Mount 1 consumer
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(1));
      await page.waitForSelector('[data-testid="consumer-0"]');

      const statsBefore = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      const totalBefore = statsBefore.totalCreated;

      // Trigger error to schedule reconnect timer (delay ~1500-2000ms)
      await page.evaluate(() => window.__SSE_TEST__.simulateError());

      // Immediately unmount consumer to 0 before timer fires
      await page.evaluate(() => window.__SSE_TEST__.setConsumerCount(0));
      await page.waitForFunction(() => document.querySelectorAll('[data-testid^="consumer-"]').length === 0);

      // Wait 2800ms (longer than the ~1500-2000ms timer)
      await new Promise((r) => setTimeout(r, 2800));

      // Verify that NO ghost connection was created
      const statsAfter = await page.evaluate(() => window.__SSE_TEST__.getEventSourceStats());
      assert.equal(
        statsAfter.totalCreated,
        totalBefore,
        `GHOST CONNECTION LEAK: A new EventSource was created after unmount! Before: ${totalBefore}, After: ${statsAfter.totalCreated}`
      );
      assert.equal(statsAfter.activeCount, 0, 'Active EventSource count must be 0');

      recordPass('Zero Ghost Connections on Teardown', 'Reconnect timer was cleanly aborted upon unmount');
    } catch (err) {
      recordFail('Zero Ghost Connections on Teardown', err);
    }

  } finally {
    await browser.close();
    await vite.close();
    console.log('\n[Teardown] Browser and Vite server stopped.');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('ADVERSARIAL STRESS TEST SUMMARY');
  console.log('================================================================');
  const passes = testResults.filter((r) => r.status === 'PASS').length;
  const fails = testResults.filter((r) => r.status === 'FAIL').length;
  console.log(`Total tests: ${testResults.length} | Passed: ${passes} | Failed: ${fails}`);

  for (const r of testResults) {
    if (r.status === 'PASS') {
      console.log(`  [PASS] ${r.name} - ${r.detail}`);
    } else {
      console.log(`  [FAIL] ${r.name} - ${r.error}`);
    }
  }

  if (fails > 0) {
    console.error(`\nFAILED: ${fails} test(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\nSUCCESS: 100% of adversarial stress tests passed.`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

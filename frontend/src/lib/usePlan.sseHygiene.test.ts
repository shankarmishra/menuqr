import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..');

// ---------------------------------------------------------------------------
// Mock EventSource Implementation
// ---------------------------------------------------------------------------
class MockEventSource {
  public url: string;
  public options?: any;
  public closed = false;
  public readyState = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSED
  public onopen: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public listeners: Record<string, ((e: any) => void)[]> = {};

  constructor(url: string, options?: any) {
    this.url = url;
    this.options = options;
    mockState.eventSources.push(this);
  }

  addEventListener(type: string, fn: (e: any) => void) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(fn);
  }

  removeEventListener(type: string, fn: (e: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== fn);
    }
  }

  close() {
    this.closed = true;
    this.readyState = 2;
  }

  simulateOpen() {
    this.readyState = 1;
    if (this.onopen) this.onopen();
    (this.listeners['open'] || []).forEach(fn => fn({ type: 'open' }));
    (this.listeners['connected'] || []).forEach(fn => fn({ type: 'connected' }));
  }

  simulateError() {
    if (this.onerror) this.onerror();
    (this.listeners['error'] || []).forEach(fn => fn({ type: 'error' }));
  }

  simulatePlanUpdated(data: any) {
    const event = { data: JSON.stringify(data) };
    (this.listeners['plan_updated'] || []).forEach(fn => fn(event));
  }
}

// ---------------------------------------------------------------------------
// Mock Environment & Tracking
// ---------------------------------------------------------------------------
interface TrackedTimer {
  id: any;
  cb: () => void;
  ms?: number;
}

interface MockState {
  eventSources: MockEventSource[];
  windowListeners: Record<string, ((e?: any) => void)[]>;
  documentListeners: Record<string, ((e?: any) => void)[]>;
  activeUsePlanTimeouts: Map<any, TrackedTimer>;
  activeUsePlanIntervals: Map<any, TrackedTimer>;
  fetchCalls: string[];
  latestCleanup: (() => void) | null;
}

const mockState: MockState = {
  eventSources: [],
  windowListeners: {},
  documentListeners: {},
  activeUsePlanTimeouts: new Map(),
  activeUsePlanIntervals: new Map(),
  fetchCalls: [],
  latestCleanup: null,
};

// Setup mock window & document on globalThis
globalThis.window = {
  addEventListener(type: string, fn: (e?: any) => void) {
    mockState.windowListeners[type] = mockState.windowListeners[type] || [];
    mockState.windowListeners[type].push(fn);
  },
  removeEventListener(type: string, fn: (e?: any) => void) {
    if (mockState.windowListeners[type]) {
      mockState.windowListeners[type] = mockState.windowListeners[type].filter(l => l !== fn);
    }
  },
  dispatchEvent(evt: any) {
    (mockState.windowListeners[evt.type] || []).forEach(fn => fn(evt));
    return true;
  },
} as any;

globalThis.document = {
  visibilityState: 'visible',
  addEventListener(type: string, fn: (e?: any) => void) {
    mockState.documentListeners[type] = mockState.documentListeners[type] || [];
    mockState.documentListeners[type].push(fn);
  },
  removeEventListener(type: string, fn: (e?: any) => void) {
    if (mockState.documentListeners[type]) {
      mockState.documentListeners[type] = mockState.documentListeners[type].filter(l => l !== fn);
    }
  },
  dispatchEvent(evt: any) {
    (mockState.documentListeners[evt.type] || []).forEach(fn => fn(evt));
    return true;
  },
} as any;

(globalThis as any).EventSource = MockEventSource;

// Intercept timers to monitor active timers/intervals specifically from usePlan.ts
const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const originalSetInterval = globalThis.setInterval;
const originalClearInterval = globalThis.clearInterval;

(globalThis as any).setTimeout = (cb: any, ms?: number, ...args: any[]) => {
  const stack = new Error().stack || '';
  const isFromUsePlan = stack.includes('usePlan.ts');

  const id = originalSetTimeout(() => {
    if (isFromUsePlan) {
      mockState.activeUsePlanTimeouts.delete(id);
    }
    cb(...args);
  }, ms, ...args);

  if (isFromUsePlan) {
    mockState.activeUsePlanTimeouts.set(id, { id, cb, ms });
  }

  return id;
};

(globalThis as any).clearTimeout = (id: any) => {
  mockState.activeUsePlanTimeouts.delete(id);
  originalClearTimeout(id);
};

(globalThis as any).setInterval = (cb: any, ms?: number, ...args: any[]) => {
  const stack = new Error().stack || '';
  const isFromUsePlan = stack.includes('usePlan.ts');

  const id = originalSetInterval(cb, ms, ...args);

  if (isFromUsePlan) {
    mockState.activeUsePlanIntervals.set(id, { id, cb, ms });
  }

  return id;
};

(globalThis as any).clearInterval = (id: any) => {
  mockState.activeUsePlanIntervals.delete(id);
  originalClearInterval(id);
};

// Mock fetch for appStore requests
const originalFetch = globalThis.fetch;
(globalThis as any).fetch = async (url: string) => {
  mockState.fetchCalls.push(url);
  const payload = JSON.stringify({
    subscription: {
      planId: 'BASIC',
      status: 'ACTIVE',
      expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      contentChangesRemaining: 30,
      contentChangesLimit: 30,
    },
  });
  return {
    ok: true,
    status: 200,
    clone() { return this; },
    text: async () => payload,
    json: async () => JSON.parse(payload),
  } as any;
};

// React hook dispatcher mock
(React as any).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H = {
  useState: (init: any) => [typeof init === 'function' ? init() : init, () => {}],
  useEffect: (cb: () => (() => void) | void) => {
    const res = cb();
    if (typeof res === 'function') {
      mockState.latestCleanup = res;
    }
  },
  useCallback: (fn: any) => fn,
};

let vite: ViteDevServer;

before(async () => {
  vite = await createServer({
    configFile: false,
    root: frontendRoot,
    logLevel: 'error',
    appType: 'custom',
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_useplan'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [react()],
  });
});

after(async () => {
  globalThis.setTimeout = originalSetTimeout;
  globalThis.clearTimeout = originalClearTimeout;
  globalThis.setInterval = originalSetInterval;
  globalThis.clearInterval = originalClearInterval;
  globalThis.fetch = originalFetch;
  await vite?.close();
});

// Helper to get a freshly evaluated usePlan module
async function loadFreshUsePlanModule(): Promise<{ usePlan: () => any; computeSubState: any }> {
  // Clear mock state
  mockState.eventSources = [];
  mockState.windowListeners = {};
  mockState.documentListeners = {};
  mockState.activeUsePlanTimeouts.clear();
  mockState.activeUsePlanIntervals.clear();
  mockState.fetchCalls = [];
  mockState.latestCleanup = null;
  (globalThis.document as any).visibilityState = 'visible';

  // Invalidate in Vite module graph if previously loaded
  const modNode = vite.moduleGraph.urlToModuleMap.get('/src/lib/usePlan.ts');
  if (modNode) {
    vite.moduleGraph.invalidateModule(modNode);
  }

  const mod = await vite.ssrLoadModule('/src/lib/usePlan.ts');
  return mod as any;
}

function mountConsumer(usePlan: () => any): () => void {
  mockState.latestCleanup = null;
  usePlan();
  const unmountFn = mockState.latestCleanup;
  assert.ok(unmountFn, 'usePlan effect must return an unmount cleanup function');
  return unmountFn;
}

function triggerVisibilityChange(state: 'visible' | 'hidden') {
  (globalThis.document as any).visibilityState = state;
  const listeners = mockState.documentListeners['visibilitychange'] || [];
  listeners.forEach(fn => fn());
}

function triggerFocus() {
  const listeners = mockState.windowListeners['focus'] || [];
  listeners.forEach(fn => fn());
}

function fireLatestUsePlanTimeout() {
  const entries = Array.from(mockState.activeUsePlanTimeouts.entries());
  if (entries.length === 0) return false;
  const [id, timer] = entries[entries.length - 1];
  mockState.activeUsePlanTimeouts.delete(id);
  originalClearTimeout(id);
  timer.cb();
  return true;
}

// ---------------------------------------------------------------------------
// ADVERSARIAL CHALLENGE TEST SUITES
// ---------------------------------------------------------------------------

describe('M4 Adversarial: SSE Socket Hygiene & Ref-Counting Guards', () => {

  it('Suite 1: Zero Consumers (sseRefCount === 0) strictly prevents EventSource and polling loops', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // Invariant: Initial state with 0 consumers mounted
    assert.equal(mockState.eventSources.length, 0, 'No EventSource should be created at module initialization');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'No intervals should be active');

    // Attack 1.1: Trigger visibilitychange to visible with 0 consumers
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 0, 'visibilitychange (visible) must NOT open EventSource when refCount === 0');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'visibilitychange must NOT start fallback polling when refCount === 0');

    // Attack 1.2: Trigger visibilitychange to hidden with 0 consumers
    triggerVisibilityChange('hidden');
    assert.equal(mockState.eventSources.length, 0, 'visibilitychange (hidden) must NOT open EventSource when refCount === 0');

    // Attack 1.3: Trigger window focus with 0 consumers
    triggerFocus();
    assert.equal(mockState.eventSources.length, 0, 'window focus must NOT open EventSource when refCount === 0');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'window focus must NOT start fallback polling when refCount === 0');

    // Attack 1.4: High-frequency burst of 100 alternating focus and visibility changes
    for (let i = 0; i < 50; i++) {
      triggerVisibilityChange(i % 2 === 0 ? 'visible' : 'hidden');
      triggerFocus();
    }
    assert.equal(mockState.eventSources.length, 0, 'Burst storm of 100 events must NEVER open an EventSource when refCount === 0');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Burst storm must NEVER start fallback polling when refCount === 0');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'Burst storm must NEVER schedule reconnect timeouts when refCount === 0');
  });

  it('Suite 2: Single Consumer (sseRefCount === 1) opens socket, reuses singleton on focus/visibility, and cleans up on unmount', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // Mount 1 consumer
    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1, 'Mounting first consumer must open exactly 1 EventSource connection');
    const es = mockState.eventSources[0];
    assert.equal(es.url, '/api/app/orders/stream', 'EventSource must connect to orders stream endpoint');
    assert.deepEqual(es.options, { withCredentials: true }, 'EventSource must include withCredentials: true');
    assert.equal(es.closed, false, 'EventSource must be open and active');

    // Simulate open
    es.simulateOpen();

    // Trigger focus and visibility change while consumer is mounted
    triggerVisibilityChange('visible');
    triggerFocus();
    assert.equal(mockState.eventSources.length, 1, 'Focus and visibility must REUSE the existing socket, NOT create duplicate');
    assert.equal(es.closed, false, 'Socket must remain open');

    // Background tab
    triggerVisibilityChange('hidden');
    assert.equal(es.closed, false, 'Socket must remain open when tab is backgrounded');

    // Foreground tab again
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 1, 'Socket count must remain 1 after foregrounding');

    // Unmount consumer
    unmount();
    assert.equal(es.closed, true, 'Unmounting the sole consumer must close the EventSource connection');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Unmounting must ensure no fallback polling intervals remain');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'Unmounting must clear any reconnect timeouts');

    // Post-unmount focus/visibility attacks
    triggerFocus();
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 1, 'No new EventSource may be opened after unmount');
  });

  it('Suite 3: Multi-Consumer Ref-Counting (1 -> 2 -> 3 -> 2 -> 1 -> 0) maintains singleton and closes on exact 0', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // Mount Consumer 1 (refCount = 1)
    const unmount1 = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1, 'Consumer 1 creates EventSource');
    const es = mockState.eventSources[0];
    es.simulateOpen();

    // Mount Consumer 2 (refCount = 2)
    const unmount2 = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1, 'Consumer 2 shares existing EventSource singleton');
    assert.equal(es.closed, false, 'EventSource remains active');

    // Mount Consumer 3 (refCount = 3)
    const unmount3 = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1, 'Consumer 3 shares existing EventSource singleton');

    // Unmount Consumer 1 (refCount = 2)
    unmount1();
    assert.equal(es.closed, false, 'Unmounting Consumer 1 must NOT close socket while 2 consumers remain');

    // Unmount Consumer 2 (refCount = 1)
    unmount2();
    assert.equal(es.closed, false, 'Unmounting Consumer 2 must NOT close socket while 1 consumer remains');

    // Focus / visibility with refCount = 1
    triggerFocus();
    assert.equal(mockState.eventSources.length, 1, 'Focus with 1 consumer must keep existing socket');

    // Unmount Consumer 3 (refCount = 0)
    unmount3();
    assert.equal(es.closed, true, 'Unmounting Consumer 3 (refCount === 0) must strictly close socket');

    // Rapid focus after all unmounted
    triggerFocus();
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 1, 'Post-unmount events must NOT spawn any new sockets');
  });

  it('Suite 4: Chaos Churn: 50 rapid mount/unmount flapping cycles with visibility changes leave 0 dangling sockets or timers', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    for (let cycle = 0; cycle < 50; cycle++) {
      // Mount A
      const unmountA = mountConsumer(usePlan);
      assert.equal(mockState.eventSources[mockState.eventSources.length - 1].closed, false);

      // Background tab while mounted
      triggerVisibilityChange('hidden');

      // Mount B
      const unmountB = mountConsumer(usePlan);

      // Unmount A
      unmountA();

      // Foreground tab
      triggerVisibilityChange('visible');
      triggerFocus();

      // Unmount B (refCount reaches 0)
      unmountB();

      // Invariant after every cycle at refCount === 0:
      const latestEs = mockState.eventSources[mockState.eventSources.length - 1];
      assert.equal(latestEs.closed, true, `Cycle ${cycle}: socket must be closed when refCount reaches 0`);
      assert.equal(mockState.activeUsePlanTimeouts.size, 0, `Cycle ${cycle}: no pending reconnect timeouts at refCount 0`);
      assert.equal(mockState.activeUsePlanIntervals.size, 0, `Cycle ${cycle}: no active polling intervals at refCount 0`);

      // Fire events while at refCount 0
      triggerFocus();
      triggerVisibilityChange('visible');
    }

    // Final total check
    const openSockets = mockState.eventSources.filter(s => !s.closed);
    assert.equal(openSockets.length, 0, 'All EventSources must be closed at conclusion of churn test');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'No reconnect timers leaked');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'No fallback polling intervals leaked');
  });

  it('Suite 5: Degraded State & Fallback Polling is strictly cancelled and guarded on unmount', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // Mount 1 consumer
    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1);
    const es1 = mockState.eventSources[0];

    // Simulate 3 consecutive connection failures to trigger fallback polling
    es1.simulateError(); // Attempt 1
    assert.equal(es1.closed, true);
    assert.equal(mockState.activeUsePlanTimeouts.size, 1, 'Reconnect timer scheduled for attempt 1');

    // Fire reconnect timer callback (Attempt 2)
    assert.ok(fireLatestUsePlanTimeout(), 'Fired attempt 1 timer');
    assert.equal(mockState.eventSources.length, 2, 'Reconnect attempt 2 created EventSource');
    const es2 = mockState.eventSources[1];

    es2.simulateError(); // Attempt 2 failure
    assert.equal(es2.closed, true);
    assert.equal(mockState.activeUsePlanTimeouts.size, 1, 'Reconnect timer scheduled for attempt 2');

    // Fire reconnect timer callback (Attempt 3)
    assert.ok(fireLatestUsePlanTimeout(), 'Fired attempt 2 timer');
    assert.equal(mockState.eventSources.length, 3, 'Reconnect attempt 3 created EventSource');
    const es3 = mockState.eventSources[2];

    es3.simulateError(); // Attempt 3 -> trips reconnectAttempts >= 3 -> startFallbackPolling()
    assert.equal(mockState.activeUsePlanIntervals.size, 1, 'Fallback polling interval (45s) must be started after 3 failures');

    // Now, unmount the consumer while fallback polling is active!
    unmount();

    // Invariant: Unmounting MUST immediately stop fallback polling and clear reconnect timers
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Fallback polling interval MUST be cancelled on unmount');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'Reconnect timeout MUST be cancelled on unmount');

    // Attack: User changes tabs and focuses window while degraded unmounted state
    for (let i = 0; i < 10; i++) {
      triggerVisibilityChange('visible');
      triggerFocus();
    }

    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Fallback polling must NOT restart while refCount === 0');
    assert.equal(mockState.eventSources.length, 3, 'No new EventSource instances created while refCount === 0');
  });

  it('Suite 6: Race Condition Guard: Reconnect timer callback executing after unmount is safely aborted', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    const unmount = mountConsumer(usePlan);
    const es = mockState.eventSources[0];

    // Trigger error -> schedules reconnectTimer
    es.simulateError();
    assert.equal(mockState.activeUsePlanTimeouts.size, 1, 'Reconnect timer scheduled');

    // Now unmount before timer executes
    unmount();
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'Unmount clears reconnect timer');

    // What if an asynchronous callback was already queued in the event loop?
    // In usePlan.ts:
    // reconnectTimer = setTimeout(() => { reconnectTimer = null; if (sseRefCount > 0) connectSSE(); }, delay);
    // Because sseRefCount === 0, the inner guard `if (sseRefCount > 0)` and `connectSSE()` guard prevent connection!
    const countBefore = mockState.eventSources.length;
    triggerFocus();
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, countBefore, 'Ref count guard prevents any post-unmount connection');
  });

  it('Suite 7: Resilient Negative Ref-Count Clamping', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1);

    // Call unmount once (refCount = 0)
    unmount();
    assert.equal(mockState.eventSources[0].closed, true);

    // Call unmount a second time (e.g. React StrictMode anomaly or double cleanup)
    // In usePlan.ts: if (sseRefCount <= 0) { sseRefCount = 0; ... }
    assert.doesNotThrow(() => {
      unmount();
    }, 'Duplicate unmount must not throw');

    // Verify system can cleanly mount a new consumer after redundant cleanup
    const unmountNew = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 2, 'New consumer after clamped 0 refCount successfully opens socket');
    assert.equal(mockState.eventSources[1].closed, false, 'New socket is open');

    unmountNew();
    assert.equal(mockState.eventSources[1].closed, true, 'New socket closes cleanly on unmount');
  });

});

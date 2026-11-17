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
  pendingFetchResolvers: Array<() => void>;
}

const mockState: MockState = {
  eventSources: [],
  windowListeners: {},
  documentListeners: {},
  activeUsePlanTimeouts: new Map(),
  activeUsePlanIntervals: new Map(),
  fetchCalls: [],
  latestCleanup: null,
  pendingFetchResolvers: [],
};

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

const originalFetch = globalThis.fetch;
let holdFetch = false;

(globalThis as any).fetch = async (url: string) => {
  mockState.fetchCalls.push(url);
  if (holdFetch) {
    await new Promise<void>(resolve => {
      mockState.pendingFetchResolvers.push(resolve);
    });
  }
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
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_challenger'),
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

async function loadFreshUsePlanModule(): Promise<{ usePlan: () => any; computeSubState: any }> {
  mockState.eventSources = [];
  mockState.windowListeners = {};
  mockState.documentListeners = {};
  mockState.activeUsePlanTimeouts.clear();
  mockState.activeUsePlanIntervals.clear();
  mockState.fetchCalls = [];
  mockState.latestCleanup = null;
  mockState.pendingFetchResolvers = [];
  holdFetch = false;
  (globalThis.document as any).visibilityState = 'visible';

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

function fireNextUsePlanTimeout() {
  const entries = Array.from(mockState.activeUsePlanTimeouts.entries());
  if (entries.length === 0) return false;
  const [id, timer] = entries[0];
  mockState.activeUsePlanTimeouts.delete(id);
  originalClearTimeout(id);
  timer.cb();
  return true;
}

// ---------------------------------------------------------------------------
// ADVERSARIAL CHALLENGER 2 TEST SUITES
// ---------------------------------------------------------------------------

describe('M4 Iteration 2 Challenger 2: Deep Adversarial SSE Socket Lifecycle', () => {

  it('Vector C1: Mega-Storm of 1,000 randomized events at sseRefCount === 0 strictly guarantees zero socket leaks', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    assert.equal(mockState.eventSources.length, 0);

    for (let i = 0; i < 1000; i++) {
      const roll = i % 4;
      if (roll === 0) triggerVisibilityChange('visible');
      else if (roll === 1) triggerVisibilityChange('hidden');
      else if (roll === 2) triggerFocus();
      else (globalThis.window as any).dispatchEvent(new Event('menusqr:plan-updated'));
    }

    assert.equal(mockState.eventSources.length, 0, 'Zero EventSources created across 1,000 events');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Zero polling intervals started');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'Zero timeouts scheduled');
  });

  it('Vector C2: Network severance in background tab & immediate resuscitation on foreground tab before timer fires', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // 1. Mount 1 consumer
    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1);
    const es1 = mockState.eventSources[0];
    es1.simulateOpen();

    // 2. Tab switched to background
    triggerVisibilityChange('hidden');
    assert.equal(es1.closed, false, 'Socket remains open in background');

    // 3. Network connection drops while backgrounded
    es1.simulateError();
    assert.equal(es1.closed, true, 'es1 was closed upon error');
    assert.equal(mockState.activeUsePlanTimeouts.size, 1, 'Reconnect timer scheduled');

    // 4. User brings tab back to foreground BEFORE reconnect timer expires
    triggerVisibilityChange('visible');
    triggerFocus();

    // Expect: usePlan notices visible & focus and immediately connects new socket!
    assert.equal(mockState.eventSources.length, 2, 'Foreground event immediately creates replacement EventSource');
    const es2 = mockState.eventSources[1];
    assert.equal(es2.closed, false, 'es2 is active');
    es2.simulateOpen();

    // 5. Now the pending reconnect timer from es1 fires!
    // Since es2 is already connected, it MUST NOT create a 3rd duplicate socket.
    assert.ok(fireNextUsePlanTimeout(), 'Fired pending reconnect timeout');
    assert.equal(mockState.eventSources.length, 2, 'Must NOT open a duplicate 3rd socket when es2 is already active');
    assert.equal(es2.closed, false, 'es2 remains active');

    // 6. Clean unmount
    unmount();
    assert.equal(es2.closed, true, 'es2 is closed upon unmount');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'No pending timers after unmount');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'No pending intervals after unmount');
  });

  it('Vector C3: Degraded state fallback polling (>=3 errors) cleanly shuts down on successful reconnect', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1);

    // Trip 3 errors to trigger fallback polling
    for (let attempt = 1; attempt <= 3; attempt++) {
      const currentEs = mockState.eventSources[mockState.eventSources.length - 1];
      currentEs.simulateError();
      if (attempt < 3) {
        fireNextUsePlanTimeout();
      }
    }

    assert.equal(mockState.activeUsePlanIntervals.size, 1, 'Fallback polling interval active after 3 errors');

    // Fire the reconnect timer to create the 4th socket attempt
    assert.ok(fireNextUsePlanTimeout());
    assert.equal(mockState.eventSources.length, 4);
    const healthyEs = mockState.eventSources[3];

    // Healthy connection connects!
    healthyEs.simulateOpen();

    // Invariant: Polling interval MUST be stopped immediately upon open!
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'Fallback polling cancelled upon successful connection');

    unmount();
    assert.equal(healthyEs.closed, true);
    assert.equal(mockState.activeUsePlanIntervals.size, 0);
    assert.equal(mockState.activeUsePlanTimeouts.size, 0);
  });

  it('Vector C4: Component unmounts while fetch is in-flight: no resurrection of SSE or timers', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    // Hold fetch so it remains in-flight
    holdFetch = true;

    // Mount consumer: triggers initial fetchSubscriptionData and connectSSE
    const unmount = mountConsumer(usePlan);
    assert.equal(mockState.eventSources.length, 1);
    assert.equal(mockState.pendingFetchResolvers.length, 1, 'Fetch is in-flight');

    // Immediately unmount consumer before fetch completes
    unmount();
    assert.equal(mockState.eventSources[0].closed, true, 'EventSource closed on unmount');

    // Now resolve the in-flight fetch
    holdFetch = false;
    mockState.pendingFetchResolvers.forEach(res => res());
    mockState.pendingFetchResolvers = [];

    // Let microtasks run
    await new Promise(r => originalSetTimeout(r, 10));

    // Assert: resolving fetch did NOT resurrect SSE or schedule timers
    assert.equal(mockState.eventSources.length, 1, 'No new EventSource created after in-flight fetch resolved');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'No intervals created');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'No timeouts created');

    // Post-unmount attacks
    triggerFocus();
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 1, 'Ref count remains 0 and ignores events');
  });

  it('Vector C5: Asynchronous plan_updated event arrives during unmount boundary', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    const unmount = mountConsumer(usePlan);
    const es = mockState.eventSources[0];
    es.simulateOpen();

    // Fire plan_updated event
    assert.doesNotThrow(() => {
      es.simulatePlanUpdated({
        planId: 'PREMIUM',
        expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(),
        orderId: 'ord_test_999',
      });
      unmount();
    }, 'Simultaneous plan_updated and unmount must execute safely without error');

    assert.equal(es.closed, true, 'Socket closed cleanly');
    assert.equal(mockState.activeUsePlanTimeouts.size, 0);
    assert.equal(mockState.activeUsePlanIntervals.size, 0);
  });

  it('Vector C6: Multi-Tenant asymmetric consumer lifecycle (C0..C9) preserves singleton and closes on exact 0', async () => {
    const { usePlan } = await loadFreshUsePlanModule();

    const unmountFns: Array<() => void> = [];

    // Mount 10 consumers
    for (let i = 0; i < 10; i++) {
      unmountFns.push(mountConsumer(usePlan));
    }

    assert.equal(mockState.eventSources.length, 1, 'All 10 consumers share exactly 1 EventSource singleton');
    const es = mockState.eventSources[0];
    es.simulateOpen();

    // Unmount first 5 consumers in random order
    const toUnmountFirst = [3, 7, 0, 9, 2];
    for (const idx of toUnmountFirst) {
      unmountFns[idx]();
      assert.equal(es.closed, false, `Socket remains open while other consumers exist (after unmounting ${idx})`);
    }

    // Fire bursts of focus & visibility events
    for (let i = 0; i < 20; i++) {
      triggerFocus();
      triggerVisibilityChange(i % 2 === 0 ? 'visible' : 'hidden');
    }
    assert.equal(mockState.eventSources.length, 1, 'No new sockets created during multi-consumer focus events');
    assert.equal(es.closed, false, 'Socket still open');

    // Unmount remaining 5 consumers: 1, 4, 5, 6, 8
    const remaining = [1, 4, 5, 6, 8];
    for (let i = 0; i < remaining.length; i++) {
      const idx = remaining[i];
      unmountFns[idx]();
      if (i === remaining.length - 1) {
        assert.equal(es.closed, true, 'Socket strictly closes when the very last consumer unmounts');
      } else {
        assert.equal(es.closed, false, `Socket remains open with ${remaining.length - 1 - i} consumers left`);
      }
    }

    assert.equal(mockState.activeUsePlanTimeouts.size, 0, 'No dangling timeouts');
    assert.equal(mockState.activeUsePlanIntervals.size, 0, 'No dangling intervals');

    // Post-zero attacks
    triggerFocus();
    triggerVisibilityChange('visible');
    assert.equal(mockState.eventSources.length, 1, 'Strictly 0 sockets opened post-unmount');
  });

});

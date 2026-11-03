import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { usePlan } from '../src/lib/usePlan';

// Instrumented EventSource class to track connections and simulate SSE events
export class InstrumentedEventSource {
  static instances: InstrumentedEventSource[] = [];
  static activeCount = 0;
  static totalCreated = 0;

  url: string;
  options: any;
  listeners: Record<string, Function[]> = {};
  onopen: Function | null = null;
  onerror: Function | null = null;
  closed = false;
  id: number;
  createdAt: number;

  static autoOpen = true;

  constructor(url: string, options: any) {
    this.id = ++InstrumentedEventSource.totalCreated;
    InstrumentedEventSource.activeCount++;
    InstrumentedEventSource.instances.push(this);
    this.url = url;
    this.options = options;
    this.createdAt = performance.now();

    // Auto-open on next tick to simulate connection handshake if autoOpen is enabled
    if (InstrumentedEventSource.autoOpen) {
      setTimeout(() => {
        if (!this.closed && this.onopen) {
          this.onopen(new Event('open'));
        }
      }, 5);
    }
  }

  addEventListener(type: string, listener: Function) {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: Function) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event: Event): boolean {
    const list = this.listeners[event.type] || [];
    for (const l of list) l(event);
    return true;
  }

  close() {
    if (!this.closed) {
      this.closed = true;
      InstrumentedEventSource.activeCount--;
    }
  }

  simulateMessage(eventType: string, data: string) {
    const evt = new MessageEvent(eventType, { data });
    this.dispatchEvent(evt);
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

// Ensure global EventSource is installed
(window as any).InstrumentedEventSource = InstrumentedEventSource;
if (!(window as any).EventSource || (window as any).EventSource !== InstrumentedEventSource) {
  (window as any).EventSource = InstrumentedEventSource;
}

export interface RenderRecord {
  time: number;
  loading: boolean;
  plan: string;
  canReceptionOrders: boolean;
}

const componentRecords: Record<number, RenderRecord[]> = {};
let customEventDispatched: any = null;

window.addEventListener('menusqr:plan-updated', (e: any) => {
  customEventDispatched = e.detail;
});

function Consumer({ id }: { id: number }) {
  const { plan, loading, can, subState, sub } = usePlan();
  const canReceptionOrders = can('reception_orders');

  if (!componentRecords[id]) componentRecords[id] = [];
  componentRecords[id].push({
    time: performance.now(),
    loading,
    plan,
    subState,
    sub,
    canReceptionOrders,
  });

  return (
    <div
      data-testid={`consumer-${id}`}
      data-plan={plan}
      data-loading={loading ? 'true' : 'false'}
      data-orders={canReceptionOrders ? 'true' : 'false'}
    >
      Consumer #{id}: Plan={plan} | Loading={loading ? 'YES' : 'NO'} | Orders={canReceptionOrders ? 'YES' : 'NO'}
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    (window as any).__setConsumerCount = (n: number) => setCount(n);
  }, []);

  return (
    <div id="test-container" style={{ padding: 20 }}>
      <h1>Active Consumers: {count}</h1>
      <div id="consumers-list">
        {Array.from({ length: count }, (_, i) => (
          <Consumer key={i} id={i} />
        ))}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

(window as any).__SSE_TEST__ = {
  setConsumerCount: (n: number) => (window as any).__setConsumerCount(n),
  getComponentRecords: () => componentRecords,
  clearComponentRecords: () => {
    for (const key of Object.keys(componentRecords)) {
      delete componentRecords[Number(key)];
    }
  },
  getCustomEventDispatched: () => customEventDispatched,
  clearCustomEventDispatched: () => {
    customEventDispatched = null;
  },
  getEventSourceStats: () => ({
    totalCreated: InstrumentedEventSource.totalCreated,
    activeCount: InstrumentedEventSource.activeCount,
    instances: InstrumentedEventSource.instances.map(inst => ({
      id: inst.id,
      url: inst.url,
      options: inst.options,
      closed: inst.closed,
      createdAt: inst.createdAt,
      listenerTypes: Object.keys(inst.listeners),
    })),
  }),
  simulatePlanUpdated: (payload: any) => {
    const instances = InstrumentedEventSource.instances;
    const latest = instances[instances.length - 1];
    if (!latest) throw new Error('No EventSource has been constructed');
    const dataStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    latest.simulateMessage('plan_updated', dataStr);
  },
  simulateError: () => {
    const instances = InstrumentedEventSource.instances;
    const latest = instances[instances.length - 1];
    if (!latest) throw new Error('No EventSource has been constructed');
    latest.simulateError();
  },
  simulateOpen: () => {
    const instances = InstrumentedEventSource.instances;
    const latest = instances[instances.length - 1];
    if (!latest) throw new Error('No EventSource has been constructed');
    if (latest.onopen) latest.onopen(new Event('open'));
  },
  setAutoOpen: (val: boolean) => {
    InstrumentedEventSource.autoOpen = val;
  },
  resetStats: () => {
    InstrumentedEventSource.instances = [];
    InstrumentedEventSource.activeCount = 0;
    InstrumentedEventSource.totalCreated = 0;
    InstrumentedEventSource.autoOpen = true;
  },
};

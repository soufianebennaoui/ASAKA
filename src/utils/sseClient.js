// ═══════════════════════════════════════════════════════════
//  Shared SSE Singleton
//
//  The browser allows at most 6 concurrent HTTP/1.1 connections
//  per origin. Previously every hook (useRealtimeOrders,
//  useRealtimeCustomers, useRealtimeData x5) opened its OWN
//  EventSource — that's 7 persistent connections, leaving ZERO
//  slots for regular fetch() calls like login.
//
//  This singleton keeps exactly ONE EventSource open and lets
//  all hooks subscribe to it by event name.
// ═══════════════════════════════════════════════════════════
const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

let es         = null;          // the single shared EventSource
let refCount   = 0;             // how many hooks are using it
const handlers = new Map();     // eventName → Set<listener fn>

function getOrOpenEventSource() {
  if (!es || es.readyState === EventSource.CLOSED) {
    es = new EventSource(`${API}/api/orders/events`);
    es.onerror = () => {};      // auto-reconnects

    // Route incoming events to the correct subscriber set
    es.onmessage = () => {};    // we use named events only
    es.addEventListener('open', () => {
      // On reconnect, re-attach all named listeners
      handlers.forEach((fns, name) => {
        fns.forEach(fn => {
          // EventSource keeps listeners across reconnects — nothing to do
        });
      });
    });
  }
  return es;
}

/**
 * Subscribe to a named SSE event.
 * Returns an unsubscribe function — call it in the hook's cleanup.
 *
 *   const unsub = sseSubscribe('orders', (data) => setOrders(data));
 *   return () => unsub();
 */
export function sseSubscribe(eventName, callback) {
  refCount++;
  const src = getOrOpenEventSource();

  // Wrapper so we can remove it by reference
  const listener = (e) => {
    try {
      const data = JSON.parse(e.data);
      if (Array.isArray(data)) callback(data);
    } catch {}
  };

  src.addEventListener(eventName, listener);

  if (!handlers.has(eventName)) handlers.set(eventName, new Set());
  handlers.get(eventName).add(listener);

  return function unsubscribe() {
    if (es) es.removeEventListener(eventName, listener);
    handlers.get(eventName)?.delete(listener);
    refCount--;
    // Close the connection only when no hook is listening any more
    if (refCount <= 0 && es) {
      es.close();
      es = null;
      refCount = 0;
    }
  };
}

// ═══════════════════════════════════════════════════════════
//  useRealtimeOrders
//
//  Connects to the Express/PostgreSQL backend.
//  • Loads all orders on mount (GET /api/orders)
//  • Subscribes to Server-Sent Events for real-time push
//    → any status change by the admin instantly reaches
//      every connected device (customer phone, admin tablet…)
//  • setOrders writes to the DB (POST / PATCH) — the SSE
//    broadcast from the server keeps all clients in sync
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';
import { sseSubscribe } from './sseClient';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export function useRealtimeOrders() {
  const [orders, setOrdersState] = useState([]);

  // ── Initial fetch + SSE subscription ─────────────────
  useEffect(() => {
    // 1. Load current orders immediately
    fetch(`${API}/api/orders`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrdersState(data); })
      .catch(err => console.warn('[Asaka] Could not reach API server:', err.message));

    // 2. Subscribe to the shared SSE singleton (no new connection opened)
    const unsub = sseSubscribe('orders', (data) => setOrdersState(data));
    return () => unsub();
  }, []);

  // ── setOrders: smart writer that goes through the API ─
  //
  //  FrontApp and BackApp call setOrders() the same way they
  //  always did (passing a value or an updater function).
  //  We inspect the change to decide which API call to make:
  //    • New order added  → POST /api/orders
  //    • Status changed   → PATCH /api/orders/:id
  //  The SSE broadcast from the server then updates all clients.
  const setOrders = useCallback((updater) => {
    setOrdersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      // Detect new orders (present in next but not prev)
      const prevIds = new Set(prev.map(o => o.id));
      const newOrders = next.filter(o => !prevIds.has(o.id));

      newOrders.forEach(order => {
        fetch(`${API}/api/orders`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(order),
        }).catch(err => console.warn('[Asaka] POST /api/orders failed:', err.message));
      });

      // Detect status changes (same id, different status)
      const prevMap = new Map(prev.map(o => [o.id, o]));
      next.forEach(order => {
        const old = prevMap.get(order.id);
        if (old && old.status !== order.status) {
          fetch(`${API}/api/orders/${encodeURIComponent(order.id)}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status: order.status }),
          }).catch(err => console.warn('[Asaka] PATCH /api/orders failed:', err.message));
        }
      });

      // Optimistic local update — SSE will confirm with DB truth shortly
      return next;
    });
  }, []);

  return [orders, setOrders];
}

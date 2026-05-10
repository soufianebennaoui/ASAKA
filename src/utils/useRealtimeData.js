// ═══════════════════════════════════════════════════════════
//  useRealtimeData — generic hook for any PostgreSQL-backed entity
//
//  Usage:
//    const [data, api] = useRealtimeData('/api/offers', 'offers', []);
//
//  api: { upsert(obj), patch(id, patch), remove(id), bulkUpsert(arr) }
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { sseSubscribe } from './sseClient';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export function useRealtimeData(endpoint, sseEvent, defaultValue = []) {
  const [data, setData] = useState(defaultValue);

  // ── Load on mount ──────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}${endpoint}`)
      .then(r => r.json())
      .then(rows => { if (Array.isArray(rows)) setData(rows); })
      .catch(() => {}); // keep default if server unreachable

    // ── Subscribe to the shared SSE singleton ─────────────────
    const unsub = sseSubscribe(sseEvent, (rows) => setData(rows));
    return () => unsub();
  }, [endpoint, sseEvent]);

  // ── API helpers ────────────────────────────────────────────
  const upsert = async (obj) => {
    await fetch(`${API}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(obj),
    });
  };

  const patch = async (id, changes) => {
    await fetch(`${API}${endpoint}/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(changes),
    });
  };

  const remove = async (id) => {
    await fetch(`${API}${endpoint}/${id}`, { method: 'DELETE' });
  };

  const bulkUpsert = async (arr) => {
    await fetch(`${API}${endpoint}/bulk`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(arr),
    });
  };

  return [data, { upsert, patch, remove, bulkUpsert, setData }];
}

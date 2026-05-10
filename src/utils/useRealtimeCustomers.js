// ═══════════════════════════════════════════════════════════
//  useRealtimeCustomers
//  Mirrors useRealtimeOrders but for the customers table.
//  Provides [customers, api] where api has:
//    api.create(customer)  → POST  /api/customers
//    api.update(id, patch) → PATCH /api/customers/:id
//    api.remove(id)        → DELETE /api/customers/:id
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { sseSubscribe } from './sseClient';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

export function useRealtimeCustomers() {
  const [customers, setCustomers] = useState([]);

  // ── Load + subscribe ──────────────────────────────────
  useEffect(() => {
    fetch(`${API}/api/customers`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCustomers(data); })
      .catch(err => console.warn('[Asaka] Could not reach API (customers):', err.message));

    // Subscribe to the shared SSE singleton
    const unsub = sseSubscribe('customers', (data) => setCustomers(data));
    return () => unsub();
  }, []);

  // ── API helpers ───────────────────────────────────────
  const create = async (customer) => {
    const res = await fetch(`${API}/api/customers`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(customer),
    });
    if (res.status === 409) throw new Error('email_exists');
    if (!res.ok) throw new Error('server_error');
    return res.json(); // returns saved customer with real DB id
  };

  const update = async (id, patch) => {
    await fetch(`${API}/api/customers/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(patch),
    });
  };

  const remove = async (id) => {
    await fetch(`${API}/api/customers/${id}`, { method: 'DELETE' });
  };

  return [customers, { create, update, remove }];
}

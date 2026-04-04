import { useState, useEffect, useRef } from 'react';

// ── Web Audio "ding" — no audio file needed ───────────────────────────────
function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [
      { freq: 880, start: 0,    dur: 0.15 },   // A5  — first ding
      { freq: 1108, start: 0.18, dur: 0.15 },  // C#6 — second ding (higher)
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur + 0.4);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime  + start + dur + 0.45);
    });
  } catch {
    // AudioContext not supported or blocked — silently ignore
  }
}

/**
 * Tracks new (unseen) orders in the back office.
 * - Shows a count badge on the Orders menu item
 * - Fires a toast + ding sound when a new order arrives (even from another tab)
 */
export function useOrderNotifications(ordersData, activeTab) {
  // IDs the BO has already "seen" — persisted across refreshes
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('asaka_seen_orders') || '[]')); }
    catch { return new Set(); }
  });

  // Queue of toast notifications to show
  const [toasts, setToasts] = useState([]);
  const prevLengthRef = useRef(ordersData.length);

  // When BO opens the Orders tab → mark all as seen
  useEffect(() => {
    if (activeTab === 'orders') {
      const allIds = ordersData.map(o => o.id);
      setSeenIds(new Set(allIds));
      localStorage.setItem('asaka_seen_orders', JSON.stringify(allIds));
    }
  }, [activeTab, ordersData]);

  // Detect newly arrived orders (works across tabs via ordersData from useSharedState)
  useEffect(() => {
    const newOrders = ordersData.filter(o => !seenIds.has(o.id));
    if (newOrders.length === 0) { prevLengthRef.current = ordersData.length; return; }

    // Only react when the list actually grew (not on initial load)
    if (ordersData.length > prevLengthRef.current) {
      const latest = newOrders[0];

      // 🔔 Play notification sound
      playDing();

      // Show toast
      setToasts(prev => [{
        id:       Date.now(),
        orderId:  latest.id,
        customer: latest.customer || 'Client',
        total:    latest.total    || '',
      }, ...prev].slice(0, 5));
    }
    prevLengthRef.current = ordersData.length;
  }, [ordersData, seenIds]);

  // Auto-dismiss oldest toast after 6 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => setToasts(prev => prev.slice(0, -1)), 6000);
    return () => clearTimeout(t);
  }, [toasts]);

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));
  const unseenCount  = ordersData.filter(o => !seenIds.has(o.id)).length;

  return { unseenCount, toasts, dismissToast };
}

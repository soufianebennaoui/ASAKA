/**
 * Asaka Sushi — Lightweight Toast Notification System
 * No external dependency, pure React + CSS animations
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Toast Store (singleton pub/sub) ──────────────────────────────────────────
const listeners = new Set();
let idCounter = 0;

export const toast = {
  _emit(type, message, opts = {}) {
    const id = ++idCounter;
    const item = { id, type, message, duration: opts.duration ?? 3500 };
    listeners.forEach(fn => fn({ action: 'add', item }));
    return id;
  },
  success: (msg, opts) => toast._emit('success', msg, opts),
  error:   (msg, opts) => toast._emit('error',   msg, opts),
  info:    (msg, opts) => toast._emit('info',     msg, opts),
  dismiss: (id) => listeners.forEach(fn => fn({ action: 'remove', id })),
};

// ─── ToastContainer component ─────────────────────────────────────────────────
const ICONS = { success: '✅', error: '❌', info: 'ℹ️' };
const COLORS = {
  success: { bg: '#052e16', border: '#22c55e40', text: '#86efac', icon: '#22c55e' },
  error:   { bg: '#2d0a0a', border: '#ef444440', text: '#fca5a5', icon: '#ef4444' },
  info:    { bg: '#0c1a2e', border: '#4fc3f740', text: '#bae6fd', icon: '#4fc3f7' },
};

function ToastItem({ item, onRemove }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[item.type] || COLORS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(item.id), 300);
    }, item.duration);
    return () => clearTimeout(t);
  }, [item.id, item.duration, onRemove]);

  return (
    <div
      onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 14, padding: '12px 16px',
        marginBottom: 8, cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(110%) scale(0.9)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        maxWidth: 340, minWidth: 240,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{ICONS[item.type]}</span>
      <span style={{ color: c.text, fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.4 }}>
        {item.message}
      </span>
    </div>
  );
}

export function ToastContainer() {
  const [items, setItems] = useState([]);

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  useEffect(() => {
    const handler = ({ action, item, id }) => {
      if (action === 'add') setItems(prev => [...prev, item]);
      if (action === 'remove') remove(id);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, [remove]);

  if (items.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', top: 80, right: 16, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {items.map(item => (
        <div key={item.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem item={item} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}

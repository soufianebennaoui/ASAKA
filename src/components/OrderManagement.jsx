// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — OrderManagement (Backoffice)
//  Live order stream with:
//  • 60s client cancellation lock (cannot accept during window)
//  • After window: Accept / Cancel / Contact panel
//    – tel: call, WhatsApp message, WhatsApp call, SMS
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from 'react';
import {
  Filter, MapPin, CheckCircle2, Clock, AlertCircle,
  Phone, MessageSquare, Ban, Check, RefreshCw, X,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────
function normalizePhone(raw = '') {
  // Strip spaces / dashes; ensure starts with + or 00
  const digits = raw.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('00')) return '+' + digits.slice(2);
  // Moroccan local: 06/07 → +2126/+2127
  if (/^0[67]/.test(digits)) return '+212' + digits.slice(1);
  return digits;
}

function waMessageUrl(rawPhone, text) {
  const phone = normalizePhone(rawPhone).replace('+', '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function waCallUrl(rawPhone) {
  const phone = normalizePhone(rawPhone).replace('+', '');
  return `https://wa.me/${phone}`;
}

function smsUrl(rawPhone, text) {
  return `sms:${normalizePhone(rawPhone)}?body=${encodeURIComponent(text)}`;
}

function buildContactMessage(order) {
  return `Bonjour ${order.customer} 👋, c'est Asaka Sushi 🍣.\nNous essayons de vous joindre concernant votre commande ${order.id} (${order.total}).\nSi vous ne répondez pas dans les prochaines minutes, nous serons dans l'obligation d'annuler votre commande. Merci de nous contacter dès que possible.`;
}

// ── Lock countdown hook ───────────────────────────────────
function useLockSecs(cancelWindowEnd) {
  const calc = () =>
    cancelWindowEnd ? Math.max(0, Math.round((cancelWindowEnd - Date.now()) / 1000)) : 0;

  const [secs, setSecs] = useState(calc);

  useEffect(() => {
    if (!cancelWindowEnd) { setSecs(0); return; }
    if (calc() <= 0) { setSecs(0); return; }
    const t = setInterval(() => {
      const remaining = Math.max(0, Math.round((cancelWindowEnd - Date.now()) / 1000));
      setSecs(remaining);
      if (remaining === 0) clearInterval(t);
    }, 500);
    return () => clearInterval(t);
  }, [cancelWindowEnd]);

  return secs;
}

// ── Lock Ring ─────────────────────────────────────────────
const LockRing = ({ secs, total = 60 }) => {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const frac = Math.min(1, secs / total);
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 -rotate-90 flex-shrink-0">
      <circle cx="12" cy="12" r={r} fill="none" stroke="#3f3320" strokeWidth="2.5"/>
      <circle cx="12" cy="12" r={r} fill="none"
        stroke={secs > 20 ? '#fbbf24' : '#f59e0b'}
        strokeWidth="2.5"
        strokeDasharray={`${frac * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.4s linear' }}
      />
    </svg>
  );
};

// ── Status helpers ────────────────────────────────────────
const STATUS_LABELS = {
  new:               { label: 'Nouvelle',       color: 'text-amber-400',   bg: 'bg-amber-500/10  border-amber-500/30' },
  prep:              { label: 'En préparation', color: 'text-blue-400',    bg: 'bg-blue-500/10   border-blue-500/30'  },
  ready:             { label: 'Prête',          color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  delivering:        { label: 'En livraison',   color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/30' },
  done:              { label: 'Terminée',       color: 'text-zinc-400',    bg: 'bg-zinc-700/30   border-zinc-600/30'  },
  cancelled:         { label: 'Annulée',        color: 'text-red-400',     bg: 'bg-red-500/10    border-red-500/30'   },
  cancelled_by_client: { label: 'Annulée (client)', color: 'text-red-400', bg: 'bg-red-500/10    border-red-500/30'   },
};

const PLATFORM_COLORS = {
  Glovo:    'bg-[#ffb800]/15 text-[#ffb800] border-[#ffb800]/30',
  Jumia:    'bg-zinc-700/40  text-zinc-300  border-zinc-600/30',
  Direct:   'bg-salmon-500/15 text-salmon-400 border-salmon-500/30',
  'Site Web': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
};

const statusNext = {
  new:        'prep',
  prep:       'ready',
  ready:      'delivering',
  delivering: 'done',
};

// ── Contact panel ─────────────────────────────────────────
const ContactPanel = ({ order }) => {
  const phone = order.phone;
  if (!phone) return (
    <p className="text-xs text-zinc-500 mt-2 italic">Aucun numéro renseigné</p>
  );

  const msg = buildContactMessage(order);

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {/* Call */}
      <a href={`tel:${normalizePhone(phone)}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-emerald-500/15 text-emerald-400 border border-emerald-500/30
          hover:bg-emerald-500/25 transition-colors">
        <Phone size={13}/>
        Appeler
      </a>

      {/* WhatsApp message */}
      <a href={waMessageUrl(phone, msg)} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-[#25d366]/15 text-[#25d366] border border-[#25d366]/30
          hover:bg-[#25d366]/25 transition-colors">
        <MessageSquare size={13}/>
        WA Message
      </a>

      {/* WhatsApp call */}
      <a href={waCallUrl(phone)} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-[#25d366]/10 text-[#25d366] border border-[#25d366]/20
          hover:bg-[#25d366]/20 transition-colors">
        <Phone size={13}/>
        WA Appel
      </a>

      {/* SMS */}
      <a href={smsUrl(phone, msg)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
          bg-blue-500/15 text-blue-400 border border-blue-500/30
          hover:bg-blue-500/25 transition-colors">
        <MessageSquare size={13}/>
        SMS
      </a>
    </div>
  );
};

// ── Order Row ─────────────────────────────────────────────
const OrderRow = ({ order, onAdvance, onCancel }) => {
  const lockSecs     = useLockSecs(order.cancelWindowEnd);
  const isLocked     = lockSecs > 0;
  const isCancelled  = order.status === 'cancelled' || order.status === 'cancelled_by_client';
  const isDone       = order.status === 'done';
  const canAdvance   = !isLocked && !isCancelled && !isDone && statusNext[order.status];

  const st = STATUS_LABELS[order.status] || STATUS_LABELS.new;
  const pl = PLATFORM_COLORS[order.platform] || PLATFORM_COLORS.Direct;

  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      isCancelled
        ? 'bg-red-500/5  border-red-500/20'
        : isLocked
          ? 'bg-amber-500/5 border-amber-500/20'
          : 'bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700/60'
    }`}>
      {/* Main row */}
      <div className="px-4 py-3 flex flex-wrap gap-y-2 gap-x-3 items-start">

        {/* Order ID + time */}
        <div className="w-20 flex-shrink-0">
          <div className="font-bold text-zinc-100 text-sm">{order.id}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{order.time}</div>
        </div>

        {/* Customer + items */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-200 text-sm truncate">{order.customer}</div>
          <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{order.items}</div>
          {order.phone && (
            <div className="text-xs text-zinc-500 mt-0.5">{order.phone}</div>
          )}
        </div>

        {/* Platform */}
        <span className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold border ${pl}`}>
          {order.platform}
        </span>

        {/* Status badge */}
        <span className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
          {st.label}
        </span>

        {/* Total */}
        <div className="self-start text-right">
          <div className="text-emerald-400 font-bold text-sm">{order.total}</div>
          {order.mode && (
            <div className="text-xs text-zinc-500 mt-0.5">
              {order.mode === 'delivery' ? '🛵 Livraison' : '🥡 Emporter'}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="self-start p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200
            hover:bg-zinc-700/40 transition-colors">
          <svg viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {/* Lock banner */}
      {isLocked && (
        <div className="mx-4 mb-3 rounded-xl bg-amber-500/10 border border-amber-500/25
          px-3 py-2 flex items-center gap-2.5">
          <LockRing secs={lockSecs} total={60}/>
          <span className="text-amber-300 text-xs font-semibold">
            Fenêtre d'annulation client — {lockSecs}s restantes
          </span>
          <span className="ml-auto text-amber-400/60 text-xs">
            Acceptation disponible dans {lockSecs}s
          </span>
        </div>
      )}

      {/* Action panel — visible when row expanded OR when lock expired */}
      {(expanded || (!isLocked && !isDone && !isCancelled)) && (
        <div className={`px-4 pb-3 border-t border-zinc-800/40 pt-3 ${expanded ? '' : ''}`}>

          {/* Action buttons */}
          {!isCancelled && !isDone && (
            <div className="flex flex-wrap gap-2">
              {/* Advance status */}
              {canAdvance && (
                <button
                  onClick={() => onAdvance(order.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold
                    bg-emerald-500/20 text-emerald-300 border border-emerald-500/30
                    hover:bg-emerald-500/30 active:scale-95 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={isLocked}>
                  <Check size={14}/>
                  {order.status === 'new' ? 'Accepter' :
                   order.status === 'prep' ? 'Marquer prête' :
                   order.status === 'ready' ? 'En livraison' :
                   'Terminer'}
                </button>
              )}

              {/* Cancel */}
              <button
                onClick={() => onCancel(order.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold
                  bg-red-500/15 text-red-400 border border-red-500/30
                  hover:bg-red-500/25 active:scale-95 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={isLocked}>
                <Ban size={14}/>
                Annuler
              </button>
            </div>
          )}

          {/* Cancelled label */}
          {isCancelled && (
            <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
              <X size={14}/> Commande annulée
            </div>
          )}

          {/* Contact panel */}
          {!isCancelled && <ContactPanel order={order}/>}
        </div>
      )}

      {/* Location info when expanded */}
      {expanded && order.location && (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-1.5 text-xs text-zinc-400">
            <MapPin size={12} className="mt-0.5 flex-shrink-0 text-zinc-500"/>
            {order.location}
          </div>
          {order.address && order.address !== order.location && (
            <div className="text-xs text-zinc-500 mt-1 ml-4">{order.address}</div>
          )}
          {order.gpsLink && (
            <a href={order.gpsLink} target="_blank" rel="noopener noreferrer"
              className="ml-4 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1 block">
              📍 Voir sur la carte
            </a>
          )}
          {order.pickupTime && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
              <Clock size={12} className="flex-shrink-0"/>
              Retrait : {order.pickupTime}
            </div>
          )}
          {order.paymentMethod && (
            <div className="text-xs text-zinc-500 mt-1 ml-4">
              Paiement : {order.paymentMethod === 'card' ? '💳 Carte' : '💵 Espèces'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
const FILTER_OPTS = ['Tout', 'Nouveau', 'En cours', 'Annulé', 'Terminé'];

const OrderManagement = ({ ordersData, setOrdersData }) => {
  const [filter, setFilter] = useState('Tout');

  const advanceOrder = useCallback((id) => {
    setOrdersData(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = statusNext[o.status];
      return next ? { ...o, status: next } : o;
    }));
  }, [setOrdersData]);

  const cancelOrderBO = useCallback((id) => {
    setOrdersData(prev => prev.map(o =>
      o.id === id ? { ...o, status: 'cancelled' } : o,
    ));
  }, [setOrdersData]);

  const filtered = ordersData.filter(o => {
    if (filter === 'Tout')    return true;
    if (filter === 'Nouveau') return o.status === 'new';
    if (filter === 'En cours') return o.status === 'prep' || o.status === 'ready' || o.status === 'delivering';
    if (filter === 'Annulé')  return o.status === 'cancelled' || o.status === 'cancelled_by_client';
    if (filter === 'Terminé') return o.status === 'done';
    return true;
  });

  // Counts for badges
  const counts = {
    Nouveau: ordersData.filter(o => o.status === 'new').length,
    'En cours': ordersData.filter(o => ['prep','ready','delivering'].includes(o.status)).length,
    Annulé:  ordersData.filter(o => o.status === 'cancelled' || o.status === 'cancelled_by_client').length,
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Live Orders</h2>
          <p className="text-sm text-zinc-400 mt-1">
            {ordersData.length} commande{ordersData.length !== 1 ? 's' : ''} · flux multi-canal
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTS.map(opt => (
            <button key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all
                border flex items-center gap-1.5 ${
                filter === opt
                  ? 'bg-zinc-700 text-zinc-100 border-zinc-500'
                  : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-600'
              }`}>
              {opt}
              {counts[opt] > 0 && (
                <span className={`text-[10px] font-black rounded-full px-1.5 py-0.5 leading-none ${
                  opt === 'Nouveau' ? 'bg-amber-500 text-black' :
                  opt === 'En cours' ? 'bg-blue-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {counts[opt]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 py-16 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-zinc-400 text-sm">Aucune commande dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderRow
              key={order.id}
              order={order}
              onAdvance={advanceOrder}
              onCancel={cancelOrderBO}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

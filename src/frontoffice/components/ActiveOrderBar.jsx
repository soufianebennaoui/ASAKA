// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — ActiveOrderBar
//  Persistent floating bar (outside page router) that lets the
//  client track / cancel their latest order from anywhere in the app.
//
//  States:
//    • cancel window open  → countdown ring + "Annuler" + link to confirmation
//    • cancel window over  → pulsing dot + order mode + "Suivi →" + dismiss ×
//    • cancelled           → nothing (parent hides this component)
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';

// ── Tiny SVG countdown ring ─────────────────────────────────
const RADIUS   = 18;
const CIRC     = 2 * Math.PI * RADIUS;
const DURATION = 60; // seconds

function CancelRing({ secsLeft }) {
  const progress = Math.max(0, Math.min(1, secsLeft / DURATION));
  const dash     = progress * CIRC;
  const color    = secsLeft > 20 ? '#f59e0b' : secsLeft > 8 ? '#f97316' : '#ef4444';

  return (
    <svg width="44" height="44" className="flex-shrink-0 -rotate-90">
      {/* track */}
      <circle
        cx="22" cy="22" r={RADIUS}
        fill="none"
        stroke="#374151"
        strokeWidth="3"
      />
      {/* draining arc */}
      <circle
        cx="22" cy="22" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${dash} ${CIRC}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.4s' }}
      />
      {/* seconds label — rotated back so text reads normally */}
      <text
        x="22" y="22"
        dominantBaseline="middle"
        textAnchor="middle"
        className="rotate-90"
        style={{
          transform: 'rotate(90deg)',
          transformOrigin: '22px 22px',
          fill: color,
          fontSize: '10px',
          fontWeight: '700',
          fontFamily: 'sans-serif',
        }}
      >
        {secsLeft}s
      </text>
    </svg>
  );
}

// ── Mode / step helpers ─────────────────────────────────────
function modeEmoji(mode) {
  if (mode === 'delivery') return '🛵';
  if (mode === 'takeaway') return '🥡';
  return '🍣';
}

const STEP_LABELS_TAKEAWAY = [
  'Commande reçue',
  'En préparation',
  'Prête',
  'À emporter',
  'Bon appétit !',
];
const STEP_LABELS_DELIVERY = [
  'Commande reçue',
  'En préparation',
  'Emballée',
  'En route',
  'Livrée !',
];

function stepLabel(mode, step) {
  const labels = mode === 'delivery' ? STEP_LABELS_DELIVERY : STEP_LABELS_TAKEAWAY;
  return labels[Math.min(step, labels.length - 1)] || 'En cours…';
}

// ── Main component ──────────────────────────────────────────
/**
 * Props:
 *   lastOrderId           string   e.g. "#1101"
 *   lastOrderCancelWindowEnd  number  Date.now() + 60_000
 *   lastOrderMode         string   'takeaway' | 'delivery' | null
 *   cancelOrder           fn(id)
 *   navigate              fn(page)
 *   onDismiss             fn()     called when × is clicked
 */
export default function ActiveOrderBar({
  lastOrderId,
  lastOrderCancelWindowEnd,
  lastOrderMode,
  lastOrderStep,
  lastOrderCancelled,
  cancelOrder,
  navigate,
  onDismiss,
}) {
  // ── Countdown ─────────────────────────────────────────────
  const [secsLeft,         setSecsLeft]         = useState(0);
  const [cancelWindowOpen, setCancelWindowOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lastOrderCancelWindowEnd - Date.now()) / 1000));
      setSecsLeft(remaining);
      setCancelWindowOpen(remaining > 0);
      if (remaining <= 0 && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    tick(); // immediate first paint
    intervalRef.current = setInterval(tick, 500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [lastOrderCancelWindowEnd]);

  // If cancelled from outside (FrontApp), hide the bar (must be after hooks)
  if (lastOrderCancelled) return null;

  // ── Handlers ──────────────────────────────────────────────
  const handleCancel = (e) => {
    e.stopPropagation();
    cancelOrder(lastOrderId);
    onDismiss(); // FrontApp sets lastOrderCancelled → bar hides via the guard above
  };

  const handleGoToConfirmation = () => {
    navigate('confirmation');
  };

  // ── Cancel-window view ────────────────────────────────────
  if (cancelWindowOpen) {
    return (
      <div
        className="
          fixed bottom-20 sm:bottom-6 left-1/2
          z-[9990]
          w-[calc(100%-2rem)] max-w-sm
          bg-asaka-800 border border-amber-500/40
          rounded-2xl shadow-2xl shadow-black/60
          px-4 py-3
          flex items-center gap-3
        "
        style={{ transform: 'translateX(-50%)', animation: 'activeBarIn 0.3s ease-out' }}
      >
        {/* Ring */}
        <button
          onClick={handleGoToConfirmation}
          className="focus:outline-none flex-shrink-0"
          aria-label="Voir la confirmation"
        >
          <CancelRing secsLeft={secsLeft} />
        </button>

        {/* Text */}
        <button
          onClick={handleGoToConfirmation}
          className="flex-1 text-left focus:outline-none"
        >
          <p className="text-white font-bold text-sm leading-tight">
            Commande {lastOrderId}
          </p>
          <p className="text-amber-400 text-xs mt-0.5 leading-snug">
            Annulation possible encore {secsLeft}s
          </p>
        </button>

        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="
            flex-shrink-0
            px-3 py-1.5
            rounded-xl
            bg-red-600 hover:bg-red-500 active:bg-red-700
            text-white text-xs font-bold
            transition-colors
          "
        >
          Annuler
        </button>

        {/* Arrow to confirmation */}
        <button
          onClick={handleGoToConfirmation}
          className="flex-shrink-0 text-asaka-400 hover:text-white transition-colors pl-1"
          aria-label="Voir la confirmation"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    );
  }

  // ── In-progress view (cancel window closed) ───────────────
  return (
    <div
      className="
        fixed bottom-20 sm:bottom-6 left-1/2
        z-[9990]
        w-[calc(100%-2rem)] max-w-sm
        bg-asaka-800 border border-green-500/30
        rounded-2xl shadow-2xl shadow-black/60
        px-4 py-3
        flex items-center gap-3
      "
      style={{ transform: 'translateX(-50%)', animation: 'activeBarIn 0.3s ease-out' }}
    >
      {/* Mode emoji + pulsing dot */}
      <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center">
        <span className="text-2xl select-none">{modeEmoji(lastOrderMode)}</span>
        {/* green pulse */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm leading-tight truncate">
          {lastOrderId}
        </p>
        <p className="text-green-400 text-xs mt-0.5 truncate">
          {stepLabel(lastOrderMode, lastOrderStep ?? 0)}
        </p>
      </div>

      {/* Suivi button */}
      <button
        onClick={handleGoToConfirmation}
        className="
          flex-shrink-0
          px-3 py-1.5
          rounded-xl
          bg-green-600 hover:bg-green-500 active:bg-green-700
          text-white text-xs font-bold
          transition-colors
          flex items-center gap-1
        "
      >
        Suivi
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dismiss × */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="flex-shrink-0 text-asaka-500 hover:text-asaka-300 transition-colors pl-1"
        aria-label="Fermer"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

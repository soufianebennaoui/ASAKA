// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — OrderConfirmation
//  5-step status timeline, 60s client cancellation window,
//  countdown, call button, review prompt
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { RESTAURANT, ORDER_CONFIG } from '../../data/asakaData';
import { sanitize } from '../../utils/security';
import { toast } from '../../utils/toast';

// 5-step order timeline
const STEPS_TAKEAWAY = [
  { emoji: '✅', label: 'Commande reçue',     desc: 'Votre commande a été enregistrée' },
  { emoji: '👨‍🍳', label: 'En préparation',    desc: 'Le chef prépare votre commande' },
  { emoji: '📦', label: 'Prête',              desc: 'Votre commande est prête à récupérer' },
  { emoji: '🥡', label: 'À emporter',         desc: 'Venez récupérer votre commande' },
  { emoji: '🎉', label: 'Bon appétit !',      desc: 'Merci pour votre commande !' },
];

const STEPS_DELIVERY = [
  { emoji: '✅', label: 'Commande reçue',     desc: 'Votre commande a été enregistrée' },
  { emoji: '👨‍🍳', label: 'En préparation',    desc: 'Le chef prépare votre commande' },
  { emoji: '📦', label: 'Emballée',           desc: 'Votre commande est emballée avec soin' },
  { emoji: '🛵', label: 'En route',           desc: 'Le livreur est en chemin' },
  { emoji: '🎉', label: 'Livrée !',           desc: 'Votre commande est arrivée. Bon appétit !' },
];

// ── Review Form ───────────────────────────────────────────
const ReviewForm = ({ orderId, onSubmit }) => {
  const [stars, setStars]     = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const googleReviewUrl = RESTAURANT.placeId
    ? `https://search.google.com/local/writereview?placeid=${RESTAURANT.placeId}`
    : null;

  const handleSubmit = () => {
    if (stars === 0) { toast.error('Sélectionnez une note'); return; }
    const clean = sanitize(comment, 500);
    onSubmit?.({ stars, comment: clean, orderId });
    setSubmitted(true);
    toast.success('Merci pour votre avis ! Il sera publié après validation.');
  };

  if (submitted) {
    return (
      <div className="card-asaka p-6 text-center">
        <div className="text-4xl mb-3">🙏</div>
        <h3 className="text-white font-black text-lg mb-1">Merci !</h3>
        <p className="text-asaka-muted text-sm">
          Votre avis a été soumis et sera publié après validation.
        </p>
        {googleReviewUrl && (
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-asaka-300 text-xs
              hover:text-white transition-colors font-semibold">
            Laisser aussi un avis sur Google ↗
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="card-asaka p-5">
      <h3 className="text-white font-bold text-base mb-1">Votre avis</h3>
      <p className="text-asaka-muted text-xs mb-4">
        Comment était votre expérience Asaka Sushi ?
      </p>

      {/* Stars */}
      <div className="flex gap-2 justify-center mb-4">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s}
            onClick={() => setStars(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            className="text-4xl transition-transform hover:scale-110 tap-target">
            {s <= (hovered || stars)
              ? <span style={{ color: '#f59e0b' }}>★</span>
              : <span style={{ color: '#334155' }}>★</span>
            }
          </button>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Partagez votre expérience... (optionnel)"
        rows={3}
        className="input-asaka resize-none text-sm mb-4"
        maxLength={500}
      />
      <div className="text-asaka-600 text-xs text-right mb-4">{comment.length}/500</div>

      <button onClick={handleSubmit} className="btn-primary w-full py-3 text-sm">
        Envoyer mon avis
      </button>

      {googleReviewUrl && (
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 mt-3 text-asaka-400 text-xs
            hover:text-asaka-300 transition-colors">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12 12-5.373 12-12S18.628 0 12 0zm5.82 17.45c-1.345 1.364-3.186 2.21-5.22 2.21-4.09 0-7.41-3.32-7.41-7.41 0-2.036.84-3.876 2.2-5.22l10.43 10.42z"/>
          </svg>
          Laisser un avis sur Google Maps
        </a>
      )}
    </div>
  );
};

// ── Cancel Ring SVG ───────────────────────────────────────
const CancelRing = ({ secsLeft, totalSecs }) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const progress = secsLeft / totalSecs;
  return (
    <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#3f1a1a" strokeWidth="3.5"/>
      <circle cx="22" cy="22" r={r} fill="none"
        stroke={secsLeft > 5 ? '#f87171' : '#ef4444'}
        strokeWidth="3.5"
        strokeDasharray={`${progress * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.9s linear' }}
      />
    </svg>
  );
};

// ════════════════════════════════════════════════════════════
//  ORDER CONFIRMATION
// ════════════════════════════════════════════════════════════
const CANCEL_TOTAL_SECS = 15;

const OrderConfirmation = ({
  navigate,
  lastOrderId,
  lastOrderPoints,
  lastOrderTotal,
  lastOrderMode,
  lastOrderCancelWindowEnd,
  lastOrderStep,       // driven by FrontApp — persists across navigation
  lastOrderCancelled,  // driven by FrontApp — true if cancelled from anywhere
  cancelOrder,
  currentCustomer,
  openAuth,
  cart,
}) => {
  const isDelivery = lastOrderMode === 'delivery';
  const STEPS      = isDelivery ? STEPS_DELIVERY : STEPS_TAKEAWAY;
  // Step comes from FrontApp — always correct even after re-navigation
  const step       = lastOrderStep ?? 0;

  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  // ── Cancel window state (local UI only) ─────────────────
  const [cancelled, setCancelled]   = useState(lastOrderCancelled || false);
  const [cancelSecs, setCancelSecs] = useState(() => {
    if (!lastOrderCancelWindowEnd) return 0;
    return Math.max(0, Math.round((lastOrderCancelWindowEnd - Date.now()) / 1000));
  });
  const cancelWindowOpen = cancelSecs > 0 && !cancelled;

  // Sync if cancelled from ActiveOrderBar while away from this page
  useEffect(() => {
    if (lastOrderCancelled) setCancelled(true);
  }, [lastOrderCancelled]);

  // Tick the cancel window down
  useEffect(() => {
    if (cancelSecs <= 0) return;
    const t = setInterval(() => {
      setCancelSecs(s => {
        if (s <= 1) { clearInterval(t); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const handleCancelOrder = () => {
    if (!cancelWindowOpen) return;
    cancelOrder?.(lastOrderId);
    setCancelled(true);
  };

  // Show review form 3 seconds after the cancel window has closed
  useEffect(() => {
    if (cancelWindowOpen) return;
    if (cancelled) return;
    const t = setTimeout(() => setShowReview(true), 3000);
    return () => clearTimeout(t);
  }, [cancelWindowOpen, cancelled]); // re-fires the moment cancelWindowOpen flips to false

  // Step advancement is now owned by FrontApp — no local driver needed here

  const estimatedTime = isDelivery
    ? `${ORDER_CONFIG?.estimatedDelivery ?? 45} min`
    : `${ORDER_CONFIG?.estimatedTakeaway ?? 20} min`;

  // ── Cancelled screen ────────────────────────────────────
  if (cancelled) {
    return (
      <div className="min-h-screen bg-asaka-900 pt-20 pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-red-900/30 border-2 border-red-500
            flex items-center justify-center text-4xl mx-auto mb-5">
            ❌
          </div>
          <h1 className="text-white font-black text-2xl mb-2">Commande annulée</h1>
          <p className="text-asaka-muted text-sm mb-1">
            {lastOrderId && <span className="text-asaka-400 font-semibold">{lastOrderId}</span>}
          </p>
          <p className="text-asaka-muted text-sm mb-8">
            Votre commande a bien été annulée. Vous n'avez pas été débité.
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('menu')}
              className="btn-primary w-full py-3.5 text-sm">
              Commander à nouveau 🍣
            </button>
            <button onClick={() => navigate('home')}
              className="btn-ghost w-full py-3 text-sm text-asaka-muted hover:text-white">
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-asaka-900 pt-20 pb-24">
      <div className="max-w-xl mx-auto px-4">

        {/* Success header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500
            flex items-center justify-center text-4xl mx-auto mb-4 animate-scale-in">
            ✅
          </div>
          <h1 className="text-white font-black text-2xl">Commande confirmée !</h1>
          <p className="text-asaka-muted text-sm mt-2">
            {lastOrderId && <span className="text-asaka-300 font-bold">{lastOrderId} · </span>}
            Durée estimée : <span className="text-white font-bold">{estimatedTime}</span>
          </p>
        </div>

        {/* ── Cancel window ──────────────────────────────── */}
        {cancelWindowOpen && (
          <div className="mb-5 rounded-2xl border-2 border-red-500/40 bg-red-900/20
            px-5 py-4 flex items-center gap-4">
            {/* Ring */}
            <div className="relative w-14 h-14 flex-shrink-0">
              <CancelRing secsLeft={cancelSecs} totalSecs={CANCEL_TOTAL_SECS} />
              <span className="absolute inset-0 flex items-center justify-center
                text-red-300 font-black text-sm">
                {cancelSecs}s
              </span>
            </div>
            {/* Text + button */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                Annulation possible encore {cancelSecs}s
              </p>
              <p className="text-red-300/70 text-xs mt-0.5">
                Après ce délai, votre commande sera transmise au restaurant.
              </p>
            </div>
            <button
              onClick={handleCancelOrder}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black
                bg-red-500 hover:bg-red-400 active:scale-95 text-white transition-all">
              Annuler
            </button>
          </div>
        )}

        {/* Points earned */}
        {lastOrderPoints > 0 && (
          <div className="glass rounded-2xl px-5 py-4 mb-5 flex items-center gap-4">
            <div className="text-3xl">⭐</div>
            <div>
              <div className="text-white font-bold text-sm">
                +{lastOrderPoints} points gagnés !
              </div>
              <div className="text-asaka-muted text-xs mt-0.5">
                Utilisables sur votre prochaine commande
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card-asaka p-5 mb-5">
          <h2 className="text-white font-bold text-base mb-4">Statut de votre commande</h2>

          {cancelWindowOpen ? (
            /* ── Waiting state: cancel window still running ── */
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="relative w-12 h-12">
                <svg className="animate-spin w-12 h-12 text-asaka-600" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-60" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl">⏳</span>
              </div>
              <p className="text-asaka-300 font-bold text-sm">En attente de transmission…</p>
              <p className="text-asaka-600 text-xs text-center leading-relaxed">
                Le suivi démarrera automatiquement<br/>une fois le délai d'annulation écoulé.
              </p>
            </div>
          ) : (
            /* ── Live timeline ── */
            <div className="space-y-4">
              {STEPS.map((s, i) => {
                const done    = i < step;
                const current = i === step;
                const future  = i > step;
                return (
                  <div key={i} className="flex items-start gap-4">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        text-lg transition-all duration-500 ${
                        done    ? 'bg-green-900/40 border-2 border-green-500' :
                        current ? 'bg-asaka-500/30 border-2 border-asaka-300 animate-pulse' :
                                  'bg-asaka-900 border-2 border-asaka-700/40'
                      }`}>
                        {done ? '✅' : s.emoji}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-0.5 h-6 mt-1 transition-all duration-500 ${
                          done ? 'bg-green-500/50' : 'bg-asaka-700/40'
                        }`} />
                      )}
                    </div>
                    {/* Text */}
                    <div className={`pt-1.5 transition-all duration-300 ${
                      future ? 'opacity-40' : 'opacity-100'
                    }`}>
                      <div className={`font-bold text-sm ${current ? 'text-asaka-300' : 'text-white'}`}>
                        {s.label}
                      </div>
                      <div className="text-asaka-muted text-xs mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Call restaurant */}
        <a href={`tel:${RESTAURANT.phone}`}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
            glass-light text-white font-bold text-sm mb-4
            hover:bg-asaka-700/30 transition-all active:scale-[0.98]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
          </svg>
          Appeler le restaurant
        </a>

        {/* Review form */}
        {showReview && !reviewDone && (
          <div className="mb-4 animate-fade-up">
            <ReviewForm
              orderId={lastOrderId}
              onSubmit={() => setReviewDone(true)}
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!currentCustomer && (
            <button onClick={() => openAuth('signup')}
              className="btn-secondary w-full py-3.5 text-sm flex items-center justify-center gap-2">
              💎 Créer un compte pour gagner des points
            </button>
          )}
          <button onClick={() => navigate('menu')}
            className="btn-primary w-full py-3.5 text-sm">
            Commander à nouveau 🍣
          </button>
          <button onClick={() => navigate('home')}
            className="btn-ghost w-full py-3 text-sm text-asaka-muted hover:text-white">
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

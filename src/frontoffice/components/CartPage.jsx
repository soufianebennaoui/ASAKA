// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — CartPage  (v2)
//  Items list + simplified totals + mode selection sheet
//  Tip · Coupon · Full details are in UnifiedCheckout
// ═══════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { useCartStore, selectAppliedCoupon, cartActions } from '../../store/useCartStore';
import { useDragDismiss } from '../hooks/useDragDismiss';

// ── Mode selection bottom sheet ───────────────────────────
const ModeSheet = ({ current, onSelect, onClose }) => {
  const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);
  const MODES = [
    {
      id:    'takeaway',
      emoji: '🥡',
      label: 'À Emporter',
      desc:  'Venez récupérer votre commande en boutique',
      color: 'border-asaka-500/60 bg-asaka-500/10 text-asaka-300 hover:bg-asaka-500/15',
    },
    {
      id:    'delivery',
      emoji: '🛵',
      label: 'Livraison',
      desc:  'Livraison à votre adresse',
      color: 'border-cyan-500/60 bg-cyan-900/15 text-cyan-300 hover:bg-cyan-900/25',
    },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-asaka-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-asaka-800
          border-t border-asaka-700/50 rounded-t-3xl px-5 pt-4
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...panelDragProps}>
        <div className="flex justify-center mb-5" {...dragHandleProps}>
          <div className="w-10 h-1.5 bg-asaka-500 rounded-full" />
        </div>
        <h3 className="text-white font-black text-lg mb-1">Mode de commande</h3>
        <p className="text-asaka-500 text-sm mb-5">Choisissez comment vous souhaitez commander</p>
        <div className="space-y-3">
          {MODES.map(m => (
            <button key={m.id} onClick={() => onSelect(m.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border
                transition-all duration-200 active:scale-[0.98] ${m.color} ${
                current === m.id ? 'ring-2 ring-white/20' : ''
              }`}>
              <span className="text-3xl">{m.emoji}</span>
              <div className="text-left flex-1">
                <div className="font-black text-base flex items-center gap-2">
                  {m.label}
                  {current === m.id && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10
                      font-bold opacity-70">Actuel</span>
                  )}
                </div>
                <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="w-5 h-5 opacity-60 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
              </svg>
            </button>
          ))}
        </div>
        <button onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl glass-light text-asaka-500 font-bold text-sm">
          Annuler
        </button>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
//  CART PAGE
// ════════════════════════════════════════════════════════════
const CartPage = ({
  navigate,
  cart,
  updateCartQty,
  removeFromCart,
  cartTotal,
  orderMode,
  setOrderMode,
  currentCustomer,
  activeDiscount,
  getDiscountedPrice,
}) => {
  // sheetIntent: null | 'change' (update mode, stay on cart)
  //                    | 'proceed' (update mode, then go to checkout)
  const [sheetIntent, setSheetIntent] = useState(null);

  // Coupon applied (from store — for display in summary)
  const appliedCoupon = useCartStore(selectAppliedCoupon);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-asaka-900 flex flex-col items-center justify-center
        px-6 pt-24 text-center">
        <div className="text-7xl mb-5">🛒</div>
        <h2 className="text-white font-black text-2xl mb-2">Panier vide</h2>
        <p className="text-asaka-muted text-sm mb-8">
          Ajoutez des plats depuis notre menu
        </p>
        <button onClick={() => navigate('menu')} className="btn-primary px-8 py-3.5 text-sm">
          Voir le menu 🍣
        </button>
      </div>
    );
  }

  const subtotal  = cartTotal;
  const discount  = activeDiscount > 0 ? Math.round(subtotal * activeDiscount / 100) : 0;

  // Main CTA: if mode already set go straight to checkout,
  // otherwise open sheet in 'proceed' mode (select → then navigate).
  const handleProceed = () => {
    if (orderMode) {
      navigate('checkout');
    } else {
      setSheetIntent('proceed');
    }
  };

  // Called when client picks a mode inside the sheet.
  const handleModeSelect = (mode) => {
    setOrderMode(mode);
    const intent = sheetIntent;
    setSheetIntent(null);
    if (intent === 'proceed') {
      navigate('checkout');
    }
    // intent === 'change' → just update, stay on cart
  };

  return (
    <div className="min-h-screen bg-asaka-900 pt-20 sm:pt-24 pb-32">
      <div className="max-w-xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('menu')}
            className="w-10 h-10 rounded-xl glass-light flex items-center justify-center
              text-asaka-muted hover:text-white transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
          </button>
          <div className="flex-1 flex items-center justify-between">
            <h1 className="text-white font-black text-2xl">Mon Panier</h1>
            <span className="text-asaka-muted text-sm">
              {cart.reduce((s, c) => s + c.qty, 0)} article{cart.reduce((s, c) => s + c.qty, 0) > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cart.map(({ item, qty }) => {
            const price = getDiscountedPrice ? getDiscountedPrice(item.price) : item.price;
            return (
              <div key={item.id} className="card-asaka flex items-center gap-4 p-4">
                <div className="w-12 h-12 flex items-center justify-center
                  bg-asaka-900 rounded-xl border border-asaka-700/40 flex-shrink-0 overflow-hidden">
                  {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-[10px] text-asaka-600 text-center leading-tight">Image<br/>vide</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-bold text-sm truncate">{item.name}</div>
                  <div className="text-asaka-300 font-black text-sm mt-0.5">
                    {(price * qty).toFixed(0)} DH
                    {price < item.price && (
                      <span className="text-asaka-600 line-through text-xs ml-1.5">
                        {(item.price * qty).toFixed(0)} DH
                      </span>
                    )}
                  </div>
                </div>
                {/* Qty controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => updateCartQty(item.id, qty - 1)}
                    className="w-8 h-8 rounded-xl glass-light flex items-center justify-center
                      text-asaka-muted hover:text-white transition-colors tap-target">
                    {qty === 1 ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="w-3.5 h-3.5 text-red-400">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                      </svg>
                    )}
                  </button>
                  <span className="text-white font-black text-sm w-5 text-center">{qty}</span>
                  <button onClick={() => updateCartQty(item.id, qty + 1)}
                    className="w-8 h-8 rounded-xl glass-light flex items-center justify-center
                      text-asaka-muted hover:text-white transition-colors tap-target">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected mode chip (if mode already chosen) */}
        {orderMode && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 border ${
            orderMode === 'delivery'
              ? 'border-cyan-700/40 bg-cyan-900/10'
              : 'border-asaka-500/40 bg-asaka-500/10'
          }`}>
            <span className="text-xl">{orderMode === 'delivery' ? '🛵' : '🥡'}</span>
            <div className="flex-1">
              <div className={`font-bold text-sm ${
                orderMode === 'delivery' ? 'text-cyan-300' : 'text-asaka-300'
              }`}>
                {orderMode === 'delivery' ? 'Livraison' : 'À Emporter'}
              </div>
              <div className="text-asaka-600 text-xs">Mode sélectionné</div>
            </div>
            <button
              onClick={() => setSheetIntent('change')}
              className="text-xs text-asaka-500 hover:text-asaka-300 underline transition-colors">
              Changer
            </button>
          </div>
        )}

        {/* Order subtotal */}
        <div className="glass rounded-2xl p-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-asaka-muted">Sous-total</span>
            <span className="text-white font-bold">{subtotal} DH</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-asaka-muted">Remise compte ({activeDiscount}%)</span>
              <span className="text-green-400 font-bold">-{discount} DH</span>
            </div>
          )}
          {appliedCoupon && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">🎟️</span>
                <span className="text-green-400 text-sm font-bold">{appliedCoupon.code}</span>
              </div>
              <button onClick={() => cartActions.removeCoupon()}
                className="text-xs text-asaka-600 hover:text-red-400 transition-colors underline">
                Retirer
              </button>
            </div>
          )}
          <div className="border-t border-asaka-700/40 pt-3 flex justify-between">
            <span className="text-asaka-500 text-xs">Frais de livraison, pourboire et coupon calculés à la prochaine étape</span>
          </div>
        </div>

        {/* Account discount teaser */}
        {!currentCustomer && (
          <div className="bg-asaka-500/10 border border-asaka-500/25 rounded-xl p-3 mb-5
            text-xs text-asaka-300">
            💡 <span className="font-semibold">Créez un compte</span> pour obtenir 10% de
            réduction et cumuler des points fidélité.
          </div>
        )}

        {/* Proceed CTA — always "Confirmer la commande" */}
        <button onClick={handleProceed}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2">
          Confirmer la commande
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>

      </div>

      {/* Mode selection sheet — opens for both "Changer" and CTA (no mode) */}
      {sheetIntent && (
        <ModeSheet
          current={orderMode}
          onSelect={handleModeSelect}
          onClose={() => setSheetIntent(null)}
        />
      )}
    </div>
  );
};

export default CartPage;

// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Cart + Order Store
//  useSyncExternalStore-based (React 19 built-in, no deps)
//  Drop-in Zustand replacement — same selector API
//  Ready for API conversion: buildOrderPayload() returns DTO
// ═══════════════════════════════════════════════════════════
import { useSyncExternalStore } from 'react';
import { ORDER_CONFIG } from '../data/asakaData';

// ── Internal mutable state ─────────────────────────────────
const _state = {
  cart:           [],    // [{ item, qty }]
  orderMode:      null,  // null | 'takeaway' | 'delivery'
  tip:            0,
  savedAddresses: [],    // [{ id, name, address, gpsLink }]
  appliedCoupon:  null,  // coupon object currently applied to this order
};

const _listeners = new Set();

const _emit   = () => _listeners.forEach(fn => fn());
const _get    = () => _state;

function _set(updater) {
  const next = typeof updater === 'function' ? updater(_state) : updater;
  // Shallow-merge at top level to avoid accidental full replacement
  Object.keys(next).forEach(k => { _state[k] = next[k]; });
  _emit();
}

function _subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// ── Public hook ────────────────────────────────────────────
/**
 * useCartStore(selector?)
 * selector defaults to identity — returns the whole state snapshot.
 * Components re-render only when the selected slice changes.
 */
export function useCartStore(selector = s => s) {
  return useSyncExternalStore(
    _subscribe,
    () => selector(_get()),
    () => selector(_get()),
  );
}

// ── Selectors ──────────────────────────────────────────────
export const selectCart           = s => s.cart;
export const selectCartCount      = s => s.cart.reduce((sum, c) => sum + c.qty, 0);
export const selectCartTotal      = s => s.cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
export const selectOrderMode      = s => s.orderMode;
export const selectTip            = s => s.tip;
export const selectSavedAddresses = s => s.savedAddresses;
export const selectAppliedCoupon  = s => s.appliedCoupon;

// ── Actions ────────────────────────────────────────────────
export const cartActions = {
  addToCart(item, qty = 1) {
    const existing = _state.cart.find(c => c.item.id === item.id);
    if (existing) {
      _set({
        cart: _state.cart.map(c =>
          c.item.id === item.id ? { ...c, qty: c.qty + qty } : c,
        ),
      });
    } else {
      _set({ cart: [..._state.cart, { item, qty }] });
    }
  },

  removeFromCart(itemId) {
    _set({ cart: _state.cart.filter(c => c.item.id !== itemId) });
  },

  updateCartQty(itemId, qty) {
    if (qty <= 0) { cartActions.removeFromCart(itemId); return; }
    _set({ cart: _state.cart.map(c => c.item.id === itemId ? { ...c, qty } : c) });
  },

  clearCart() {
    _set({ cart: [], appliedCoupon: null });
  },

  setOrderMode(mode) {
    if (mode === null || mode === 'takeaway' || mode === 'delivery') {
      _set({ orderMode: mode });
    }
  },

  setTip(amount) {
    _set({ tip: Math.max(0, parseFloat(amount) || 0) });
  },

  // ── Saved delivery addresses ───────────────────────────
  addSavedAddress({ name, address, gpsLink = '' }) {
    const id = `addr-${Date.now()}`;
    _set({ savedAddresses: [..._state.savedAddresses, { id, name, address, gpsLink }] });
    return id;
  },

  updateSavedAddress(id, patch) {
    _set({
      savedAddresses: _state.savedAddresses.map(a =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    });
  },

  removeSavedAddress(id) {
    _set({ savedAddresses: _state.savedAddresses.filter(a => a.id !== id) });
  },

  // Bulk-load addresses from a customer profile (called on login/signup)
  // Replaces in-memory list so there are no duplicates across sessions.
  loadAddresses(addresses = []) {
    _set({ savedAddresses: [...addresses] });
  },

  // ── Coupon / promo code ────────────────────────────────
  applyCoupon(coupon) {
    _set({ appliedCoupon: coupon });
  },

  removeCoupon() {
    _set({ appliedCoupon: null });
  },

  // Also clear the coupon when cart is cleared (order placed)
};

// ── Order DTO builder ──────────────────────────────────────
/**
 * Assembles a clean order payload from the current store state.
 * This is the single source of truth for order calculations.
 * When you connect a real API, POST this object directly.
 *
 * @param {object} opts
 * @param {object}  opts.currentCustomer  - logged-in customer or null
 * @param {object}  [opts.extra={}]       - form fields (name, phone, address, pickupTime, …)
 * @param {number}  [opts.activeDiscount] - % off from active offers
 * @param {number}  [opts.pointsUsed]     - loyalty points redeemed
 * @param {string}  [opts.paymentMethod]  - 'cash' | 'card'
 * @returns {object} order DTO
 */
export function buildOrderPayload({
  currentCustomer,
  extra          = {},
  activeDiscount = 0,
  pointsUsed     = 0,
  paymentMethod  = 'cash',
}) {
  const { cart, orderMode, tip, appliedCoupon } = _get();

  const subtotal       = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
  const pointsValue    = ORDER_CONFIG?.pointsValue ?? 0.1;
  const pointsDiscount = pointsUsed * pointsValue;
  const offerDiscount  = activeDiscount > 0 ? subtotal * (activeDiscount / 100) : 0;
  // Coupon discount — computed from the store's appliedCoupon
  const couponDiscount = appliedCoupon
    ? (appliedCoupon.type === 'percent'
        ? Math.round(subtotal * appliedCoupon.value / 100)
        : Math.min(appliedCoupon.value, subtotal))
    : 0;
  const mode           = extra.type || orderMode || 'takeaway';
  const deliveryFee    = mode === 'delivery' ? (ORDER_CONFIG?.deliveryFee ?? 20) : 0;
  const resolvedTip    = extra.tip ?? tip ?? 0;
  const total          = Math.max(
    0,
    subtotal + resolvedTip - pointsDiscount - offerDiscount - couponDiscount + deliveryFee,
  );
  const roundedTotal   = Math.round(total);
  const pointsEarned   = Math.floor(roundedTotal);

  const location = mode === 'delivery'
    ? `Livraison — ${extra.address || extra.gpsLink || ''}`
    : `À Emporter — ${extra.name || ''}`;

  return {
    // Order identity
    mode,
    location,
    // Financial
    subtotal,
    tip:            resolvedTip,
    pointsDiscount,
    offerDiscount,
    deliveryFee,
    roundedTotal,
    // Loyalty
    pointsUsed,
    pointsEarned,
    // Items (snapshot)
    items:         cart,
    itemsLabel:    cart.map(c => `${c.qty}x ${c.item.name}`).join(', '),
    // Customer
    customer:      currentCustomer,
    customerName:  currentCustomer ? currentCustomer.name : (extra.name || 'Client'),
    // Form fields
    extra,
    paymentMethod,
    phone:         extra.phone  || '',
    address:       extra.address || '',
    gpsLink:       extra.gpsLink || '',
    pickupTime:    extra.pickupTime || '',
  };
}

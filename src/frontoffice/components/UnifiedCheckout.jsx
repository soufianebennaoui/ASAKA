// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — UnifiedCheckout  (v2)
//  Full checkout page: customer info → address → payment
//  → tip → coupon → order summary → confirm
//  Pointed inline errors + summary error banner
//  Modify-info redirect to profile page
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { useDragDismiss } from '../hooks/useDragDismiss';
import {
  sanitize, validateForm, takeawaySchema, deliverySchema,
  getGpsLink, buildWhatsAppMessage, rateLimiter,
} from '../../utils/security';
import {
  RESTAURANT, ORDER_CONFIG, isCouponValid, computeCouponDiscount,
} from '../../data/asakaData';
import { formatPhoneDisplay, getCountryFromPhone } from '../../data/countryCodes';
import { toast } from '../../utils/toast';
import {
  useCartStore,
  selectCart,
  selectCartTotal,
  selectSavedAddresses,
  selectAppliedCoupon,
  cartActions,
} from '../../store/useCartStore';

const PICKUP_TIMES = [
  'Dans 15 min', 'Dans 30 min', 'Dans 45 min', 'Dans 1h', 'Dans 1h30',
];
const DELIVERY_FEE = ORDER_CONFIG?.deliveryFee ?? 20;
const TIP_OPTIONS  = ORDER_CONFIG?.tipOptions  ?? [0, 5, 10, 15];

// ── Inline field error ────────────────────────────────────
const FieldError = ({ msg }) =>
  msg ? (
    <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5 font-medium">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        className="w-3.5 h-3.5 flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      {msg}
    </p>
  ) : null;

// ── Error summary banner ──────────────────────────────────
const ErrorBanner = ({ errors }) => {
  const msgs = Object.values(errors).filter(Boolean);
  if (!msgs.length) return null;
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-950/30 px-4 py-4 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className="w-4 h-4 text-red-400 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
        <p className="text-red-400 font-black text-sm">
          {msgs.length === 1 ? '1 erreur à corriger' : `${msgs.length} erreurs à corriger`}
        </p>
      </div>
      <ul className="space-y-1">
        {msgs.map((m, i) => (
          <li key={i} className="text-red-300 text-xs flex items-start gap-1.5">
            <span className="flex-shrink-0 mt-0.5">•</span>
            <span>{m}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── WhatsApp Confirm Modal ────────────────────────────────
function WaConfirmModal({ whatsappUrl, onConfirmWeb, onClose, total }) {
  const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);
  return (
  <>
    <div className="fixed inset-0 bg-asaka-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
    <div
      ref={panelRef}
      className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-asaka-800
        border-t border-asaka-700/50 rounded-t-3xl px-5 pb-8 pt-4"
      style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
      {...panelDragProps}>
      <div className="flex justify-center mb-5" {...dragHandleProps}>
        <div className="w-10 h-1.5 bg-asaka-500 rounded-full" />
      </div>
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">🍣</div>
        <h2 className="text-white font-black text-xl mb-1">Confirmer la commande</h2>
        <p className="text-asaka-muted text-sm">Comment souhaitez-vous confirmer ?</p>
        <p className="text-asaka-300 font-bold mt-2">Total : {total} DH</p>
      </div>
      <div className="space-y-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
          onClick={onConfirmWeb}
          className="flex items-center gap-4 p-4 rounded-2xl w-full text-left
            bg-[#25d366]/10 border border-[#25d366]/30 text-[#25d366]
            hover:bg-[#25d366]/20 transition-all active:scale-[0.98]">
          <svg viewBox="0 0 24 24" className="w-7 h-7 flex-shrink-0" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <div>
            <div className="font-bold text-sm">Confirmer via WhatsApp</div>
            <div className="text-[#25d366]/70 text-xs">Commande pré-remplie dans WhatsApp</div>
          </div>
        </a>
        <button onClick={onConfirmWeb}
          className="flex items-center gap-4 p-4 rounded-2xl w-full text-left
            bg-asaka-500/15 border border-asaka-500/30 text-asaka-300
            hover:bg-asaka-500/25 transition-all active:scale-[0.98]">
          <div className="w-7 h-7 rounded-full bg-asaka-500/30 flex items-center justify-center
            text-base flex-shrink-0">🌐</div>
          <div>
            <div className="font-bold text-sm">Confirmer sur le site</div>
            <div className="text-asaka-muted text-xs">Commande enregistrée directement</div>
          </div>
        </button>
      </div>
    </div>
  </>
  );
}

// ── Saved address card ────────────────────────────────────
const SavedAddressCard = ({ addr, selected, onSelect, onDelete }) => (
  <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
    selected
      ? 'border-asaka-500/60 bg-asaka-500/10'
      : 'border-asaka-700/40 bg-asaka-800/50 hover:border-asaka-600/50'
  }`} onClick={onSelect}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
      selected ? 'bg-asaka-500 text-white' : 'bg-asaka-700 text-asaka-muted'
    }`}>📍</div>
    <div className="flex-1 min-w-0">
      <div className="text-white font-bold text-sm truncate">{addr.name}</div>
      <div className="text-asaka-muted text-xs truncate">{addr.address || 'Position GPS sauvegardée'}</div>
    </div>
    <button onClick={e => { e.stopPropagation(); onDelete(addr.id); }}
      className="w-7 h-7 rounded-lg glass-light flex items-center justify-center
        text-asaka-muted hover:text-red-400 transition-colors flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </div>
);

// ── Section heading ───────────────────────────────────────
const SectionLabel = ({ step, title }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className="w-6 h-6 rounded-full bg-asaka-500 flex items-center justify-center
      text-white font-black text-[11px] flex-shrink-0">
      {step}
    </div>
    <h2 className="text-white font-black text-base">{title}</h2>
  </div>
);

// ════════════════════════════════════════════════════════════
//  UNIFIED CHECKOUT
// ════════════════════════════════════════════════════════════
const UnifiedCheckout = ({
  navigate,
  orderMode,
  setOrderMode,
  placeOrder,
  currentCustomer,
  activeDiscount,
  getDiscountedPrice,
  setFrontCustomers,
  setCurrentCustomer,
}) => {
  const cart           = useCartStore(selectCart);
  const cartTotal      = useCartStore(selectCartTotal);
  const savedAddresses = useCartStore(selectSavedAddresses);
  const appliedCoupon  = useCartStore(selectAppliedCoupon);

  // Auto-select primary address when delivery mode
  const _initPrimary = () => {
    if (orderMode !== 'delivery' || savedAddresses.length === 0) return null;
    return savedAddresses.find(a => a.primary) || savedAddresses[0];
  };
  const _initPrimaryAddr = _initPrimary();

  const [form, setForm] = useState({
    name:          currentCustomer?.name  || '',
    phone:         currentCustomer?.phone || '',
    address:       _initPrimaryAddr?.address  || '',
    pickupTime:    PICKUP_TIMES[1],
    gpsLink:       _initPrimaryAddr?.gpsLink  || '',
    tip:           0,
    paymentMethod: 'cash',
    pointsUsed:    0,
  });
  const [errors,       setErrors]       = useState({});
  const [gpsLoading,   setGpsLoading]   = useState(false);
  const [showWaModal,  setShowWaModal]  = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [submitting,   setSubmitting]   = useState(false);

  // Coupon UI state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Saved-address UI state
  const [selectedAddrId, setSelectedAddrId] = useState(_initPrimaryAddr?.id || null);
  // showNewAddr: false = showing saved list, true = adding new address
  const [showNewAddr,    setShowNewAddr]     = useState(savedAddresses.length === 0);
  // new-address method choice: null | 'typed' | 'gps'
  const [newAddrMethod,  setNewAddrMethod]   = useState(null);
  // GPS state for the new-address flow
  const [newGpsState,    setNewGpsState]     = useState('idle'); // idle|loading|found|denied|error
  const [newGpsResult,   setNewGpsResult]    = useState(null);
  const [newGpsApproved, setNewGpsApproved]  = useState(false);
  const [saveAddrName,   setSaveAddrName]    = useState('');
  const [wantToSave,     setWantToSave]      = useState(false);

  // Error banner scroll ref
  const errorBannerRef = useRef(null);

  const isDelivery = orderMode === 'delivery';
  const isTakeaway = orderMode === 'takeaway';

  useEffect(() => {
    if (isDelivery) setForm(prev => ({ ...prev, paymentMethod: 'cash' }));
  }, [isDelivery]);

  useEffect(() => {
    if (currentCustomer) {
      setForm(prev => ({
        ...prev,
        name:  currentCustomer.name  || prev.name,
        phone: currentCustomer.phone || prev.phone,
      }));
    }
  }, [currentCustomer]);

  // Auto-select primary address if savedAddresses loads after initial render
  // (handles the case where cart store populates slightly after component mounts)
  useEffect(() => {
    if (!isDelivery || selectedAddrId || showNewAddr) return;
    if (savedAddresses.length === 0) return;
    const primary = savedAddresses.find(a => a.primary) || savedAddresses[0];
    if (primary) {
      setSelectedAddrId(primary.id);
      setShowNewAddr(false);
      setForm(prev => ({ ...prev, address: primary.address || '', gpsLink: primary.gpsLink || '' }));
    }
  }, [savedAddresses]); // eslint-disable-line

  const handleSelectSavedAddr = (addr) => {
    setSelectedAddrId(addr.id);
    setShowNewAddr(false);
    setForm(prev => ({ ...prev, address: addr.address || '', gpsLink: addr.gpsLink || '' }));
    setErrors(prev => ({ ...prev, address: '', gpsLink: '' }));
  };

  const handleNewAddr = () => {
    setSelectedAddrId(null);
    setShowNewAddr(true);
    setNewAddrMethod(null);
    setNewGpsState('idle');
    setNewGpsResult(null);
    setNewGpsApproved(false);
    setWantToSave(false);
    setSaveAddrName('');
    setForm(prev => ({ ...prev, address: '', gpsLink: '' }));
  };

  const handleBackToSaved = () => {
    // Re-select primary and go back to saved list
    const primary = savedAddresses.find(a => a.primary) || savedAddresses[0];
    if (primary) {
      handleSelectSavedAddr(primary);
    } else {
      setShowNewAddr(false);
      setSelectedAddrId(null);
    }
    setNewAddrMethod(null);
    setNewGpsState('idle');
    setNewGpsResult(null);
    setNewGpsApproved(false);
  };

  const chooseNewAddrMethod = (method) => {
    setNewAddrMethod(method);
    if (method === 'gps') handleNewAddrGps();
  };

  const handleNewAddrGps = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible sur ce navigateur.');
      setNewAddrMethod(null);
      return;
    }
    setNewGpsState('loading');
    setNewGpsResult(null);
    setNewGpsApproved(false);
    setForm(prev => ({ ...prev, gpsLink: '', address: '' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const link = `https://maps.google.com/?q=${lat},${lon}`;
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`,
            { headers: { 'Accept-Language': 'fr' } },
          );
          const data = await res.json();
          const display = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
          setNewGpsResult({ display, lat, lon, link });
        } catch {
          setNewGpsResult({ display: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, link });
        }
        setNewGpsState('found');
      },
      (err) => { setNewGpsState(err.code === 1 ? 'denied' : 'error'); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const approveNewAddrGps = () => {
    if (!newGpsResult) return;
    setNewGpsApproved(true);
    setForm(prev => ({ ...prev, gpsLink: newGpsResult.link, address: newGpsResult.display }));
    setErrors(prev => ({ ...prev, address: '', gpsLink: '' }));
    // Auto-name: first meaningful segment of the Nominatim display string
    const autoName = newGpsResult.display.split(',')[0].trim().slice(0, 50) || 'Position GPS';
    setSaveAddrName(autoName);
  };

  const update = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'address' || field === 'gpsLink') setSelectedAddrId(null);
  };

  // ── GPS ─────────────────────────────────────────────────
  const handleGps = async () => {
    setGpsLoading(true);
    try {
      const result = await getGpsLink();
      if (!result) throw new Error('GPS indisponible');
      update('gpsLink', result.link);
      setErrors(prev => ({ ...prev, address: '' }));
      toast.success('Position GPS enregistrée ✓');
    } catch {
      toast.error('GPS non disponible sur ce réseau. Saisissez l\'adresse manuellement.');
    } finally {
      setGpsLoading(false);
    }
  };

  // ── Coupon handlers ──────────────────────────────────────
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Entrez un code promo'); return; }
    const found = (currentCustomer?.coupons || []).find(c => c.code.toUpperCase() === code);
    if (!found) { setCouponError('Code promo introuvable — vérifiez votre saisie'); return; }
    const { valid, reason } = isCouponValid(found, cartTotal);
    if (!valid) { setCouponError(reason); return; }
    cartActions.applyCoupon(found);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    cartActions.removeCoupon();
    setCouponError('');
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = () => {
    if (submitting) return;

    if (!rateLimiter.check('checkout', 3, 60000)) {
      toast.error('Trop de tentatives. Réessayez dans quelques secondes.');
      return;
    }

    // For logged-in customers use their profile data directly so that
    // any pre-filled values they cannot edit don't fail form validation.
    const effectiveName  = currentCustomer
      ? (currentCustomer.name  || '')
      : form.name;
    const effectivePhone = currentCustomer
      ? (currentCustomer.phone || '')
      : form.phone;

    const cleaned = {
      name:       sanitize(effectiveName,  80),
      phone:      sanitize(effectivePhone, 30),
      address:    sanitize(form.address,  200),
      gpsLink:    sanitize(form.gpsLink,  300),
      pickupTime: form.pickupTime,   // ← was missing — caused "créneau requis" even when set
    };

    const schema = isDelivery ? deliverySchema : takeawaySchema;
    const { valid, errors: errs } = validateForm(
      { ...cleaned, hasGps: !!cleaned.gpsLink },
      schema,
    );

    // Logged-in user with no phone on their profile → point to profile page
    if (currentCustomer && !cleaned.phone) {
      errs.phone = 'Numéro de téléphone manquant — ajoutez-le dans votre profil';
    }

    // Delivery: need address OR GPS
    if (isDelivery && !cleaned.gpsLink && cleaned.address.length < 10) {
      errs.address = 'Adresse requise — au moins 10 caractères, ou utilisez le GPS';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll the error banner into view
      setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      return;
    }

    // Save address if requested — persist to cart store AND customer profile
    if (isDelivery && wantToSave && currentCustomer) {
      // Auto-generate name from GPS result or typed text if not explicitly set
      const resolvedName = saveAddrName.trim()
        || cleaned.address.split(',')[0].trim().slice(0, 50)
        || 'Mon adresse';
      const existingAddrs = currentCustomer.savedAddresses || [];
      const newAddr = {
        id:      `addr-${Date.now()}`,
        name:    sanitize(resolvedName, 60),
        address: cleaned.address,
        gpsLink: cleaned.gpsLink,
        // First address saved → make it primary automatically
        primary: existingAddrs.length === 0,
      };
      const updatedAddrs = [...existingAddrs, newAddr];
      // 1. Cart store (drives the address selector in checkout)
      cartActions.addSavedAddress(newAddr);
      // 2. currentCustomer (drives the Settings sheet display)
      const updatedCustomer = { ...currentCustomer, savedAddresses: updatedAddrs };
      setCurrentCustomer?.(updatedCustomer);
      // 3. frontCustomers list (persists across navigation)
      setFrontCustomers?.(prev => prev.map(c =>
        c.id === currentCustomer.id ? updatedCustomer : c,
      ));
      toast.success('Adresse sauvegardée ✓');
    }

    const extra = {
      type: orderMode, name: cleaned.name, phone: cleaned.phone,
      address: cleaned.address, gpsLink: cleaned.gpsLink,
      pickupTime: form.pickupTime, tip: form.tip,
    };

    const waUrl = buildWhatsAppMessage({
      restaurantPhone: RESTAURANT.whatsapp,
      customerName:    cleaned.name,
      customerPhone:   cleaned.phone,
      mode:            orderMode,
      items:           cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price })),
      address:         isDelivery ? (cleaned.gpsLink || cleaned.address) : undefined,
      pickupTime:      isTakeaway ? form.pickupTime : undefined,
      total:           cartTotal + (isDelivery ? DELIVERY_FEE : 0),
      tip:             form.tip,
    });

    setPendingOrder({ extra, waUrl });
    setShowWaModal(true);
  };

  const confirmOrder = () => {
    if (!pendingOrder || submitting) return;
    setSubmitting(true);
    setShowWaModal(false);
    try {
      placeOrder({
        tip:           form.tip,
        paymentMethod: form.paymentMethod,
        pointsUsed:    form.pointsUsed,
        extra:         pendingOrder.extra,
      });
      navigate('confirmation');
    } catch {
      toast.error('Erreur lors de la commande. Réessayez.');
      setSubmitting(false);
    }
  };

  // Totals
  const deliveryFee    = isDelivery ? DELIVERY_FEE : 0;
  const discount       = activeDiscount > 0 ? Math.round(cartTotal * activeDiscount / 100) : 0;
  const couponDiscount = computeCouponDiscount(appliedCoupon, cartTotal);
  const total          = Math.max(0, cartTotal + deliveryFee + (form.tip || 0) - discount - couponDiscount);

  // Field class helper — highlights the input border red when there's an error
  const fc = (field) =>
    `input-asaka ${errors[field] ? 'border-red-500/70 focus:border-red-500 bg-red-950/10' : ''}`;

  // Phone display for the customer info card
  const phoneDisplay = currentCustomer?.phone
    ? `${getCountryFromPhone(currentCustomer.phone).flag} ${formatPhoneDisplay(currentCustomer.phone)}`
    : form.phone || '—';

  const hasErrors = Object.values(errors).some(Boolean);

  // step counter
  let step = 0;
  const S = () => { step++; return step; };

  return (
    <div className="min-h-screen bg-asaka-900 pt-16 sm:pt-20 pb-16">
      <div className="max-w-xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 py-5 mb-2">
          <button onClick={() => navigate('cart')}
            className="w-10 h-10 rounded-xl glass-light flex items-center justify-center
              text-asaka-muted hover:text-white transition-colors flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
            </svg>
          </button>
          <div>
            <h1 className="text-white font-black text-xl">
              {isTakeaway ? '🥡 À Emporter' : '🛵 Livraison'}
            </h1>
            <p className="text-asaka-muted text-xs">Vérifiez vos informations et confirmez</p>
          </div>
        </div>

        {/* ── Error summary banner (scrolled to on submit error) ── */}
        <div ref={errorBannerRef}>
          <ErrorBanner errors={errors} />
        </div>

        <div className="space-y-5">

          {/* ── 1. Customer info card ─────────────────────── */}
          <div className="card-asaka p-5">
            <div className="flex items-center justify-between mb-4">
              <SectionLabel step={S()} title="Vos informations" />
              {currentCustomer && (
                <button onClick={() => navigate('profile')}
                  className="flex items-center gap-1.5 text-xs text-asaka-500
                    hover:text-asaka-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/>
                  </svg>
                  Modifier sur le profil
                </button>
              )}
            </div>

            {currentCustomer ? (
              /* Logged-in: show pre-filled info */
              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-asaka-900/50
                  border border-asaka-700/30">
                  <span className="text-asaka-600 text-xs w-16 flex-shrink-0">Nom</span>
                  <span className="text-white font-semibold text-sm">{currentCustomer.name}</span>
                </div>
                <div className={`flex items-center gap-3 py-2.5 px-3 rounded-xl border ${
                  !currentCustomer.phone
                    ? 'bg-red-950/20 border-red-700/40'
                    : 'bg-asaka-900/50 border-asaka-700/30'
                }`}>
                  <span className="text-asaka-600 text-xs w-16 flex-shrink-0">Tél.</span>
                  {currentCustomer.phone ? (
                    <span className="text-white font-semibold text-sm">{phoneDisplay}</span>
                  ) : (
                    <button onClick={() => navigate('profile')}
                      className="text-red-400 text-xs font-semibold underline hover:text-red-300
                        transition-colors text-left">
                      Numéro manquant — ajoutez-le dans votre profil
                    </button>
                  )}
                </div>
                {currentCustomer.email && (
                  <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-asaka-900/50
                    border border-asaka-700/30">
                    <span className="text-asaka-600 text-xs w-16 flex-shrink-0">Email</span>
                    <span className="text-white font-semibold text-sm truncate">
                      {currentCustomer.email}
                    </span>
                  </div>
                )}
                <p className="text-asaka-700 text-[10px] px-1">
                  Ces informations sont tirées de votre profil. Cliquez « Modifier sur le profil » pour les mettre à jour.
                </p>
              </div>
            ) : (
              /* Guest: editable fields */
              <div className="space-y-4">
                <div>
                  <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                    Nom complet *
                  </label>
                  <input type="text" value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Votre prénom et nom"
                    className={fc('name')} autoComplete="name" />
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                    Téléphone *
                  </label>
                  <input type="tel" value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="06 77 88 99 66 ou +212677889966"
                    className={fc('phone')} autoComplete="tel" />
                  <FieldError msg={errors.phone} />
                </div>
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl
                  bg-asaka-700/20 border border-asaka-700/30 text-xs text-asaka-600">
                  <span className="flex-shrink-0 mt-0.5">💡</span>
                  <span>
                    Créez un compte pour sauvegarder vos infos et ne plus les ressaisir à chaque commande.
                    {' '}<button onClick={() => navigate('profile')}
                      className="text-asaka-400 underline hover:text-asaka-200 transition-colors">
                      Créer un compte
                    </button>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. Address (delivery only) ────────────────── */}
          {isDelivery && (
            <div className="card-asaka p-5">
              <SectionLabel step={S()} title="Adresse de livraison" />

              {/* ── Saved addresses list (default view) ───────── */}
              {!showNewAddr && (
                <>
                  {savedAddresses.length > 0 ? (
                    <>
                      <p className="text-asaka-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                        Adresses sauvegardées
                      </p>
                      <div className="space-y-2 mb-3">
                        {savedAddresses.map(addr => (
                          <SavedAddressCard
                            key={addr.id}
                            addr={addr}
                            selected={selectedAddrId === addr.id}
                            onSelect={() => handleSelectSavedAddr(addr)}
                            onDelete={id => {
                              cartActions.removeSavedAddress(id);
                              if (selectedAddrId === id) handleNewAddr();
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : null}

                  <button onClick={handleNewAddr}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                      text-xs font-bold border border-dashed border-asaka-700/50
                      text-asaka-muted hover:text-white hover:border-asaka-500/60
                      hover:bg-asaka-700/10 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
                    </svg>
                    Utiliser une autre adresse
                  </button>

                  <FieldError msg={errors.address} />
                </>
              )}

              {/* ── New address flow ───────────────────────────── */}
              {showNewAddr && (
                <div>
                  {/* Step 1: choose method */}
                  {!newAddrMethod && (
                    <div>
                      <p className="text-asaka-600 text-xs mb-3">
                        Comment souhaitez-vous indiquer votre adresse ?
                      </p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button onClick={() => chooseNewAddrMethod('typed')}
                          className="flex flex-col items-center gap-2 py-4 rounded-2xl
                            border-2 border-asaka-700/50 bg-asaka-900/40
                            hover:border-asaka-500/60 hover:bg-asaka-700/20 transition-all group">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            className="w-6 h-6 text-asaka-300 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                          </svg>
                          <span className="text-white font-bold text-xs">Saisir</span>
                          <span className="text-asaka-600 text-[10px]">Tapez votre adresse</span>
                        </button>
                        <button onClick={() => chooseNewAddrMethod('gps')}
                          className="flex flex-col items-center gap-2 py-4 rounded-2xl
                            border-2 border-asaka-700/50 bg-asaka-900/40
                            hover:border-asaka-500/60 hover:bg-asaka-700/20 transition-all group">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                            className="w-6 h-6 text-asaka-300 group-hover:text-white transition-colors">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                          </svg>
                          <span className="text-white font-bold text-xs">GPS</span>
                          <span className="text-asaka-600 text-[10px]">Détection auto</span>
                        </button>
                      </div>
                      {/* Back to saved list */}
                      {savedAddresses.length > 0 && (
                        <button onClick={handleBackToSaved}
                          className="text-xs text-asaka-500 hover:text-asaka-300 transition-colors">
                          ← Choisir parmi mes adresses
                        </button>
                      )}
                    </div>
                  )}

                  {/* Step 2a: typed */}
                  {newAddrMethod === 'typed' && (
                    <div>
                      <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                        Adresse de livraison <span className="text-red-400">*</span>
                      </label>
                      <textarea value={form.address}
                        onChange={e => { update('address', e.target.value); update('gpsLink', ''); }}
                        placeholder="N° appartement, rue, quartier, ville… (ex : Appt 3, Rue Mohammed V, Agadir)"
                        rows={3}
                        className={`${fc('address')} resize-none`}
                        autoComplete="street-address"
                        autoFocus
                      />
                      <FieldError msg={errors.address} />
                      {!errors.address && (
                        <p className="text-asaka-700 text-[10px] mt-1 mb-3">
                          Min. 10 caractères — soyez précis pour faciliter la livraison.
                        </p>
                      )}
                      <button onClick={() => setNewAddrMethod(null)}
                        className="text-[10px] text-asaka-600 hover:text-asaka-400 transition-colors">
                        ← Changer de méthode
                      </button>
                    </div>
                  )}

                  {/* Step 2b: GPS */}
                  {newAddrMethod === 'gps' && (
                    <div className="space-y-3">
                      {/* Loading */}
                      {newGpsState === 'loading' && (
                        <div className="rounded-2xl border border-asaka-600/40 bg-asaka-800/40
                          p-5 text-center">
                          <div className="relative w-12 h-12 mx-auto mb-3">
                            <svg className="animate-spin w-12 h-12 text-asaka-400" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-20" cx="12" cy="12" r="10"
                                stroke="currentColor" strokeWidth="3"/>
                              <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xl">📍</span>
                          </div>
                          <p className="text-white font-bold text-sm">Détection en cours…</p>
                          <p className="text-asaka-500 text-xs mt-1 leading-relaxed">
                            Veuillez patienter, nous récupérons votre position.
                          </p>
                        </div>
                      )}

                      {/* Denied */}
                      {newGpsState === 'denied' && (
                        <div className="rounded-2xl border border-amber-600/40 bg-amber-900/10 p-4">
                          <p className="text-amber-400 text-xs font-bold mb-1">Localisation refusée</p>
                          <p className="text-amber-300/70 text-[11px] mb-3">
                            Activez la localisation dans les paramètres du navigateur, puis réessayez.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => { setNewGpsState('idle'); handleNewAddrGps(); }}
                              className="flex-1 py-2 rounded-xl bg-asaka-600/30 border border-asaka-600/40
                                text-asaka-300 text-xs font-bold hover:bg-asaka-600/50 transition-all">
                              Réessayer
                            </button>
                            <button onClick={() => setNewAddrMethod('typed')}
                              className="flex-1 py-2 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                              Saisir manuellement
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Error */}
                      {newGpsState === 'error' && (
                        <div className="rounded-2xl border border-red-600/30 bg-red-900/10 p-4">
                          <p className="text-red-400 text-xs font-bold mb-1">Erreur de localisation</p>
                          <p className="text-red-300/60 text-[11px] mb-3">
                            Impossible d'obtenir la position. Réessayez ou saisissez l'adresse.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => { setNewGpsState('idle'); handleNewAddrGps(); }}
                              className="flex-1 py-2 rounded-xl bg-asaka-600/30 border border-asaka-600/40
                                text-asaka-300 text-xs font-bold hover:bg-asaka-600/50 transition-all">
                              Réessayer
                            </button>
                            <button onClick={() => setNewAddrMethod('typed')}
                              className="flex-1 py-2 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                              Saisir manuellement
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Found — approval gate */}
                      {newGpsState === 'found' && newGpsResult && (
                        <div className={`rounded-2xl border p-4 transition-all ${
                          newGpsApproved
                            ? 'border-green-600/50 bg-green-900/15'
                            : 'border-asaka-600/40 bg-asaka-800/40'
                        }`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-asaka-600/50 flex items-center
                              justify-center text-lg flex-shrink-0">
                              {newGpsApproved ? '✅' : '📍'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-xs mb-0.5">
                                {newGpsApproved ? 'Position confirmée !' : 'Position détectée'}
                              </p>
                              <p className="text-asaka-400 text-[11px] leading-relaxed">
                                {newGpsResult.display}
                              </p>
                            </div>
                          </div>
                          {!newGpsApproved ? (
                            <div className="flex gap-2">
                              <button onClick={approveNewAddrGps}
                                className="flex-1 py-2.5 rounded-xl bg-asaka-500/20 border border-asaka-500/40
                                  text-asaka-200 text-xs font-bold hover:bg-asaka-500/30 transition-all">
                                ✓ Utiliser cette adresse
                              </button>
                              <button onClick={() => setNewAddrMethod(null)}
                                className="px-3 py-2.5 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                  text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                                Ignorer
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => { setNewGpsApproved(false); setNewGpsState('idle'); setNewGpsResult(null); setForm(prev => ({ ...prev, gpsLink: '', address: '' })); }}
                              className="text-[10px] text-asaka-700 hover:text-red-400 transition-colors">
                              Modifier la position
                            </button>
                          )}
                        </div>
                      )}

                      {newGpsState !== 'loading' && (
                        <button onClick={() => setNewAddrMethod(null)}
                          className="text-[10px] text-asaka-600 hover:text-asaka-400 transition-colors">
                          ← Changer de méthode
                        </button>
                      )}
                    </div>
                  )}

                  {/* Save address option — shown once an address is ready */}
                  {currentCustomer && newAddrMethod &&
                    ((newAddrMethod === 'typed' && form.address.length >= 5) ||
                     (newAddrMethod === 'gps'   && newGpsApproved)) && (
                    <div className="glass rounded-xl p-3.5 mt-3">
                      <label className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setWantToSave(v => !v)}>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                          flex-shrink-0 transition-all ${
                          wantToSave
                            ? 'bg-asaka-500 border-asaka-500'
                            : 'border-asaka-600 bg-transparent'
                        }`}>
                          {wantToSave && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                              className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                          )}
                        </div>
                        <span className="text-white text-sm font-medium">
                          Sauvegarder cette adresse dans mon profil
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Cash on delivery notice */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mt-3
                bg-asaka-800/60 border border-asaka-700/40 text-sm">
                <span className="text-2xl">💵</span>
                <div>
                  <div className="text-white font-bold">Paiement à la livraison</div>
                  <div className="text-asaka-muted text-xs">Espèces uniquement pour les livraisons</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Pickup time (takeaway only) ───────────────── */}
          {isTakeaway && (
            <div className="card-asaka p-5">
              <SectionLabel step={S()} title="Heure de retrait" />
              <div className="flex gap-2 flex-wrap">
                {PICKUP_TIMES.map(t => (
                  <button key={t} type="button" onClick={() => update('pickupTime', t)}
                    className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-bold
                      transition-all ${
                      form.pickupTime === t
                        ? 'bg-asaka-500 text-white'
                        : 'glass-light text-asaka-muted hover:text-white'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.pickupTime} />
            </div>
          )}

          {/* ── Payment method (takeaway only) ───────────── */}
          {isTakeaway && (
            <div className="card-asaka p-5">
              <SectionLabel step={S()} title="Paiement" />
              <div className="flex gap-2">
                {[
                  { id: 'cash', emoji: '💵', label: 'Espèces' },
                  { id: 'card', emoji: '💳', label: 'Carte' },
                ].map(pm => (
                  <button key={pm.id} type="button"
                    onClick={() => update('paymentMethod', pm.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                      text-sm font-bold transition-all ${
                      form.paymentMethod === pm.id
                        ? 'bg-asaka-500 text-white'
                        : 'glass-light text-asaka-muted hover:text-white'
                    }`}>
                    <span>{pm.emoji}</span>
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Tip ──────────────────────────────────────── */}
          <div className="card-asaka p-5">
            <SectionLabel step={S()} title="Pourboire (optionnel)" />
            <div className="flex gap-2 flex-wrap">
              {TIP_OPTIONS.map(t => (
                <button key={t} type="button" onClick={() => update('tip', t)}
                  className={`flex-1 min-w-[60px] py-2.5 rounded-xl text-sm font-bold
                    transition-all ${
                    form.tip === t
                      ? 'bg-asaka-500 text-white'
                      : 'glass-light text-asaka-muted hover:text-white'
                  }`}>
                  {t === 0 ? 'Non' : `+${t} DH`}
                </button>
              ))}
            </div>
            {form.tip > 0 && (
              <p className="text-asaka-600 text-xs mt-2 text-center">
                Merci pour votre générosité 🙏
              </p>
            )}
          </div>

          {/* ── Coupon ───────────────────────────────────── */}
          <div className="card-asaka p-5">
            <SectionLabel step={S()} title="Code promo" />

            {appliedCoupon ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                bg-green-900/20 border border-green-700/35">
                <span className="text-lg">🎟️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-green-400 font-black text-sm">{appliedCoupon.code}</div>
                  <div className="text-green-600 text-xs truncate">{appliedCoupon.description}</div>
                </div>
                <div className="text-green-400 font-black text-sm flex-shrink-0">
                  -{couponDiscount} DH
                </div>
                <button onClick={handleRemoveCoupon}
                  className="w-7 h-7 rounded-lg glass-light flex items-center justify-center
                    text-asaka-muted hover:text-red-400 transition-colors flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Entrez votre code promo"
                    className={`input-asaka flex-1 uppercase text-sm tracking-wider ${
                      couponError ? 'border-red-500/70 bg-red-950/10' : ''
                    }`}
                    maxLength={30} />
                  <button onClick={handleApplyCoupon}
                    className="px-4 py-2.5 rounded-xl bg-asaka-500 hover:bg-asaka-400
                      text-white font-bold text-sm transition-all active:scale-95 flex-shrink-0">
                    Appliquer
                  </button>
                </div>
                {couponError && (
                  <FieldError msg={couponError} />
                )}

                {/* Available coupon chips */}
                {currentCustomer && (currentCustomer.coupons || []).filter(c => !c.usedAt).length > 0 && (
                  <div className="mt-3">
                    <p className="text-asaka-600 text-[10px] font-bold uppercase tracking-widest mb-2">
                      Mes coupons disponibles
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentCustomer.coupons || [])
                        .filter(c => !c.usedAt)
                        .map(c => {
                          const { valid } = isCouponValid(c, cartTotal);
                          return (
                            <button key={c.id}
                              onClick={() => {
                                if (!valid) return;
                                cartActions.applyCoupon(c);
                                setCouponError('');
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border
                                text-xs font-bold transition-all ${
                                valid
                                  ? 'border-asaka-500/50 bg-asaka-500/10 text-asaka-300 hover:bg-asaka-500/20 active:scale-95'
                                  : 'border-asaka-800/50 bg-asaka-900/40 text-asaka-700 cursor-not-allowed opacity-60'
                              }`}>
                              <span>🎟️</span>
                              <span>{c.code}</span>
                              <span className="text-asaka-400 font-black">
                                {c.type === 'percent' ? `-${c.value}%` : `-${c.value} DH`}
                              </span>
                              {!valid && c.minOrder > cartTotal && (
                                <span className="text-[9px] font-normal text-asaka-700">
                                  Min. {c.minOrder} DH
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {!currentCustomer && (
                  <p className="text-asaka-700 text-xs mt-2">
                    💡 <span className="text-asaka-500">Créez un compte</span> pour recevoir des coupons.
                  </p>
                )}
              </>
            )}
          </div>

          {/* ── Order summary ─────────────────────────────── */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h2 className="text-white font-bold text-base mb-1">Récapitulatif</h2>
            {[
              { label: 'Articles',                                        value: `${cartTotal} DH` },
              ...(deliveryFee > 0 ? [{ label: '🛵 Frais de livraison', value: `+${deliveryFee} DH` }] : []),
              ...(discount > 0    ? [{ label: `Remise (${activeDiscount}%)`, value: `-${discount} DH`,       green: true }] : []),
              ...(couponDiscount > 0 ? [{ label: `Coupon (${appliedCoupon?.code})`, value: `-${couponDiscount} DH`, green: true }] : []),
              ...(form.tip > 0   ? [{ label: '🙏 Pourboire',             value: `+${form.tip} DH` }] : []),
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-asaka-muted">{row.label}</span>
                <span className={row.green ? 'text-green-400 font-semibold' : 'text-white'}>
                  {row.value}
                </span>
              </div>
            ))}
            <div className="border-t border-asaka-700/40 pt-3 flex justify-between">
              <span className="text-white font-bold text-base">Total</span>
              <span className="text-asaka-300 font-black text-xl">{total} DH</span>
            </div>
          </div>
        </div>

        {/* ── Submit ──────────────────────────────────────── */}
        {hasErrors && (
          <p className="text-center text-red-400 text-xs mt-5 mb-1 font-medium">
            ↑ Veuillez corriger les erreurs indiquées avant de continuer
          </p>
        )}
        <button onClick={handleSubmit} disabled={submitting}
          className="btn-primary w-full py-4 text-base mt-4 flex items-center justify-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Traitement…
            </>
          ) : (
            <>Confirmer la commande · {total} DH</>
          )}
        </button>
      </div>

      {showWaModal && pendingOrder && (
        <WaConfirmModal
          whatsappUrl={pendingOrder.waUrl}
          onConfirmWeb={confirmOrder}
          onClose={() => setShowWaModal(false)}
          total={total}
        />
      )}
    </div>
  );
};

export default UnifiedCheckout;

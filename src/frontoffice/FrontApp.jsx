// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Front Office App Shell (refactored)
//  Cart + orderMode now live in useCartStore (no prop-drilling)
//  Auth + page routing remain here (BO bridge state)
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import FrontNavbar from './components/FrontNavbar';
import BottomNav from './components/BottomNav';
import OffersBanner from './components/OffersBanner';
import HomePage from './components/HomePage';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import UnifiedCheckout from './components/UnifiedCheckout';
import OrderConfirmation from './components/OrderConfirmation';
import CustomerAuth from './components/CustomerAuth';
import CustomerProfile from './components/CustomerProfile';
import Footer from './components/Footer';
import ActiveOrderBar from './components/ActiveOrderBar';
import EntreNous from './components/EntreNous';
import FidelitePage from './components/FidelitePage';
import { ToastContainer } from '../utils/toast';
import { ORDER_CONFIG } from '../data/asakaData';
import {
  useCartStore,
  selectCart,
  selectCartCount,
  selectCartTotal,
  selectOrderMode,
  selectAppliedCoupon,
  cartActions,
  buildOrderPayload,
} from '../store/useCartStore';
import { generateWelcomeCoupon } from '../data/asakaData';

const ImageLightbox = ({ image, onClose }) => {
  if (!image) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm transition-opacity" onClick={onClose}>
       <button onClick={onClose} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
       </button>
       <img src={image} className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded" alt="Agrandissement" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

// ── Welcome screen shown right after account creation ────────
const WelcomeScreen = ({ customer, onDismiss, onOrder }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-6"
      style={{ background: 'rgba(3,9,20,0.92)', backdropFilter: 'blur(8px)' }}
      onClick={onDismiss}
    >
      <div
        className="bg-asaka-800 border border-asaka-600/40 rounded-3xl px-8 py-10
          max-w-sm w-full text-center shadow-2xl"
        style={{ animation: 'slideUp 0.4s cubic-bezier(0.34,1.2,0.64,1) both' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-white font-black text-2xl mb-2">
          Bienvenue, {customer.name.split(' ')[0]} !
        </h2>
        <p className="text-asaka-400 text-sm mb-1">Votre compte Asaka est créé.</p>
        {(customer.coupons || []).length > 0 && (
          <p className="text-asaka-300 text-xs font-semibold mt-2 mb-5 px-4 py-2 rounded-xl
            bg-asaka-500/10 border border-asaka-500/25">
            🎟️ Un coupon de bienvenue vous attend dans votre profil !
          </p>
        )}
        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={onOrder}
            className="btn-primary w-full py-3 text-sm font-bold"
          >
            Commander maintenant 🍣
          </button>
          <button
            onClick={onDismiss}
            className="text-asaka-600 text-xs hover:text-asaka-400 transition-colors py-1"
          >
            Continuer à explorer
          </button>
        </div>
        {/* Progress bar auto-dismiss */}
        <div className="mt-4 h-0.5 bg-asaka-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-asaka-500 rounded-full"
            style={{ animation: 'shrink 4s linear forwards' }}
          />
        </div>
      </div>
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  );
};

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

const FrontApp = ({
  onGoToBackoffice,
  ordersData,
  setOrdersData,
  frontCustomers,
  setFrontCustomers,
  customerApi,        // { create, update, remove } → talks to PostgreSQL
  activeOffers = [],
  avisData = [],
  setAvisData,
  menuItems = [],
  categories = [],
}) => {
  // ── Theme (always dark for Asaka) ─────────────────────
  const [theme] = useState('dark');
  const isLight = false;

  // ── ordersLoaded: true once the DB data has arrived ───
  // This prevents the confirmation page from showing step=0
  // (blue "new order" square) before ordersData is populated.
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  useEffect(() => {
    if (!ordersLoaded && ordersData.length > 0) setOrdersLoaded(true);
  }, [ordersData.length]);         // eslint-disable-line

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // ── Routing ───────────────────────────────────────────
  // If the customer had an active order when they last left, send them
  // back to the confirmation page automatically on reload.
  const [page, setPage] = useState(() => {
    try {
      const savedOrderId = localStorage.getItem('asaka_last_order_id');
      return savedOrderId ? 'confirmation' : 'home';
    } catch { return 'home'; }
  });

  // ── Last Order — persisted to localStorage so a page refresh
  //    doesn't lose the active order or its live status tracker ──
  const [lastOrderId, setLastOrderId] = useState(() => {
    try { return localStorage.getItem('asaka_last_order_id') || null; } catch { return null; }
  });
  const [lastOrderPoints, setLastOrderPoints] = useState(() => {
    try { return Number(localStorage.getItem('asaka_last_order_points') || 0); } catch { return 0; }
  });
  const [lastOrderTotal, setLastOrderTotal] = useState(() => {
    try { return Number(localStorage.getItem('asaka_last_order_total') || 0); } catch { return 0; }
  });
  const [lastOrderMode, setLastOrderMode] = useState(() => {
    try { return localStorage.getItem('asaka_last_order_mode') || null; } catch { return null; }
  });
  const [lastOrderCancelWindowEnd, setLastOrderCancelWindowEnd] = useState(() => {
    try { return Number(localStorage.getItem('asaka_last_order_cancel_end') || 0) || null; } catch { return null; }
  });
  const [orderBarDismissed, setOrderBarDismissed] = useState(false);

  // Keep localStorage in sync whenever these values change
  useEffect(() => {
    try {
      if (lastOrderId)              localStorage.setItem('asaka_last_order_id',          lastOrderId);
      else                          localStorage.removeItem('asaka_last_order_id');
      localStorage.setItem('asaka_last_order_points',       String(lastOrderPoints));
      localStorage.setItem('asaka_last_order_total',        String(lastOrderTotal));
      if (lastOrderMode)            localStorage.setItem('asaka_last_order_mode',        lastOrderMode);
      else                          localStorage.removeItem('asaka_last_order_mode');
      if (lastOrderCancelWindowEnd) localStorage.setItem('asaka_last_order_cancel_end', String(lastOrderCancelWindowEnd));
      else                          localStorage.removeItem('asaka_last_order_cancel_end');
    } catch {}
  }, [lastOrderId, lastOrderPoints, lastOrderTotal, lastOrderMode, lastOrderCancelWindowEnd]);

  // ── Lightbox ──────────────────────────────────────────
  const [lightboxImage, setLightboxImage] = useState(null);

  // ── Auth ──────────────────────────────────────────────
  const [showAuth,         setShowAuth]         = useState(false);
  const [authMode,         setAuthMode]         = useState('login');
  const [welcomeCustomer,  setWelcomeCustomer]  = useState(null); // signup success screen
  // Persisted to localStorage so a page refresh keeps the customer logged in
  const [currentCustomer, setCurrentCustomer]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('asaka_customer_session') || 'null'); } catch { return null; }
  });

  // Keep customer session in localStorage in sync whenever it changes
  useEffect(() => {
    try {
      if (currentCustomer) localStorage.setItem('asaka_customer_session', JSON.stringify(currentCustomer));
      else                  localStorage.removeItem('asaka_customer_session');
    } catch {}
  }, [currentCustomer]);

  // ── Store reads (no local cart state needed) ──────────
  const cart           = useCartStore(selectCart);
  const cartCount      = useCartStore(selectCartCount);
  const cartTotal      = useCartStore(selectCartTotal);
  const orderMode      = useCartStore(selectOrderMode);
  const appliedCoupon  = useCartStore(selectAppliedCoupon);

  // ── Navigation ────────────────────────────────────────
  const navigate = (target) => {
    window.scrollTo(0, 0);
    setPage(target);
    setShowAuth(false); // always close auth card on any navigation
  };

  // Safety-net: whenever the active page changes (including back-nav),
  // force the scroll position to the very top after the paint.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  // ── Derived Order Step from Back-Office ───────────────
  const activeOrderInBO = ordersData.find(o => o.id === lastOrderId);
  let lastOrderStep = 0;
  let lastOrderCancelled = false;

  if (activeOrderInBO) {
    if (activeOrderInBO.status === 'cancelled' || activeOrderInBO.status === 'cancelled_by_client') {
      lastOrderCancelled = true;
    } else {
      switch (activeOrderInBO.status) {
        case 'new':        lastOrderStep = 0; break;
        case 'prep':       lastOrderStep = 1; break;
        case 'ready':      lastOrderStep = 2; break;
        case 'delivering': lastOrderStep = 3; break;
        case 'done':       lastOrderStep = 5; break;
        default:           lastOrderStep = 0; break;
      }
    }
  }


  // ── Auth helpers ──────────────────────────────────────
  const openAuth    = (mode = 'login') => { setAuthMode(mode); setShowAuth(true); };
  const handleLogin = (customer) => {
    setCurrentCustomer(customer);
    try { localStorage.setItem('asaka_customer_session', JSON.stringify(customer)); } catch {}
    // Restore this customer's saved addresses into the cart store
    cartActions.loadAddresses(customer.savedAddresses || []);
    setShowAuth(false);
  };

  const handleSignup = async (newCustomer) => {
    const customer = {
      ...newCustomer,
      points:         0,
      totalOrders:    0,
      totalSpent:     0,
      orderHistory:   [],
      favorites:      [],
      coupons:        [generateWelcomeCoupon()],
      joinedDate:     new Date().toLocaleDateString('fr-MA'),
      savedAddresses: newCustomer.savedAddresses || [],
    };
    try {
      // Save to PostgreSQL — returns the customer with the real DB id
      const saved = await customerApi.create(customer);
      setCurrentCustomer(saved);
      try { localStorage.setItem('asaka_customer_session', JSON.stringify(saved)); } catch {}
      cartActions.loadAddresses(saved.savedAddresses || []);
      setShowAuth(false);
      setWelcomeCustomer(saved); // show welcome screen
    } catch (err) {
      if (err.message === 'email_exists') {
        toast.error('Cet email est déjà utilisé.');
        return;
      }
      // Fallback: use local data if server unreachable
      setCurrentCustomer(customer);
      try { localStorage.setItem('asaka_customer_session', JSON.stringify(customer)); } catch {}
      cartActions.loadAddresses(customer.savedAddresses);
      setShowAuth(false);
      setWelcomeCustomer(customer);
    }
    // setShowAuth(false) is called above in each branch
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    try { localStorage.removeItem('asaka_customer_session'); } catch {}
    if (page === 'profile') navigate('home');
  };

  // ── Offer discount helpers ────────────────────────────
  const activeDiscount = activeOffers.length > 0
    ? Math.max(...activeOffers.map(o => o.discountPercent))
    : 0;

  const getDiscountedPrice = (originalPrice) => {
    if (!activeOffers.length) return originalPrice;
    return activeDiscount > 0
      ? Math.round(originalPrice * (1 - activeDiscount / 100))
      : originalPrice;
  };

  // ── Order placement ───────────────────────────────────
  // Reads cart from store via buildOrderPayload, writes to ordersData (BO bridge)
  // placeOrder is async so it can fetch a unique server-side ID before inserting.
  const placeOrder = async ({ tip = 0, paymentMethod = 'cash', pointsUsed = 0, extra = {} }) => {
    const payload = buildOrderPayload({ currentCustomer, extra: { ...extra, tip }, activeDiscount, pointsUsed, paymentMethod });

    // Get a unique sequential order ID from the DB sequence (never duplicates)
    let orderId;
    try {
      const res = await fetch(`${API}/api/orders/next-id`);
      const data = await res.json();
      orderId = data.id; // e.g. "#1101"
    } catch {
      // Fallback: timestamp-based ID if server is unreachable
      orderId = `#${Date.now().toString().slice(-5)}`;
    }

    const newOrder = {
      id:            orderId,
      customer:      payload.customerName,  // account holder name (CRM)
      deliveryName:  payload.deliveryName,  // recipient name (may differ)
      deliveryPhone: payload.deliveryPhone,
      items:         payload.itemsLabel,
      rawItems:      payload.items,
      payload:       payload, // Provide full financial/customer metadata
      total:         `${payload.roundedTotal} DH`,
      status:        'new',
      platform:      'Site Web',
      time:          'Maintenant',
      location:      payload.location,
      paymentMethod: payload.paymentMethod,
      tip:           `${payload.tip} DH`,
      source:        'frontoffice',
      mode:          payload.mode,
      phone:         payload.phone,
      address:       payload.address,
      gpsLink:       payload.gpsLink,
      pickupTime:    payload.pickupTime,
    };

    const cancelWindowEnd = Date.now() + 15_000;
    setOrdersData(prev => [{ ...newOrder, cancelWindowEnd }, ...prev]);

    // Update customer loyalty stats + mark coupon used
    if (currentCustomer) {
      // If a coupon was applied, mark it as used
      const updatedCoupons = appliedCoupon
        ? (currentCustomer.coupons || []).map(c =>
            c.id === appliedCoupon.id
              ? { ...c, usedAt: new Date().toLocaleDateString('fr-MA'), usedOnOrder: orderId }
              : c,
          )
        : (currentCustomer.coupons || []);

      const updated = {
        ...currentCustomer,
        points: Math.max(0, (currentCustomer.points || 0) - payload.pointsUsed) + payload.pointsEarned,
        totalOrders:  (currentCustomer.totalOrders  || 0) + 1,
        totalSpent:   (currentCustomer.totalSpent   || 0) + payload.roundedTotal,
        coupons:      updatedCoupons,
        orderHistory: [
          {
            id:       orderId,
            date:     new Date().toLocaleDateString('fr-MA'),
            total:    payload.roundedTotal,
            items:    cart.map(c => c.item.name),
            mode:     payload.mode,
            status:   'active',   // 'active' | 'cancelled'
            review:   null,       // awaiting customer review
          },
          ...(currentCustomer.orderHistory || []),
        ],
      };
      setCurrentCustomer(updated);
      customerApi?.update(updated.id, updated).catch(() => {});
    }

    setLastOrderId(orderId);
    setLastOrderPoints(payload.pointsEarned);
    setLastOrderTotal(payload.roundedTotal);
    setLastOrderMode(payload.mode);
    setLastOrderCancelWindowEnd(cancelWindowEnd);
    setOrderBarDismissed(false); // always show bar for new orders

    cartActions.clearCart();
    cartActions.setOrderMode(null);
    return orderId;
  };

  // ── Clear persisted order (called when order is done/dismissed) ──
  const clearLastOrder = () => {
    setLastOrderId(null);
    setLastOrderPoints(0);
    setLastOrderTotal(0);
    setLastOrderMode(null);
    setLastOrderCancelWindowEnd(null);
    try {
      ['asaka_last_order_id','asaka_last_order_points','asaka_last_order_total',
       'asaka_last_order_mode','asaka_last_order_cancel_end'].forEach(k => localStorage.removeItem(k));
    } catch {}
  };

  // ── Cancel Order (client-side, within 15s window) ─────
  const cancelOrder = (orderId) => {
    // 1. Mark as cancelled in the backoffice bridge
    setOrdersData(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled_by_client' } : o,
    ));
    // 2. Mark as cancelled in the customer's order history so it shows correctly in profile
    if (currentCustomer) {
      const updated = {
        ...currentCustomer,
        orderHistory: (currentCustomer.orderHistory || []).map(o =>
          o.id === orderId ? { ...o, status: 'cancelled' } : o,
        ),
      };
      setCurrentCustomer(updated);
      customerApi?.update(updated.id, updated).catch(() => {});
    }
  };

  // ── Shared props ─────────────────────────────────────
  // Cart state removed — pages import from useCartStore directly.
  // Only BO-bridge + auth + navigation props remain here.
  const sharedProps = {
    navigate,
    openLightbox: setLightboxImage,
    // Auth
    currentCustomer,
    openAuth,
    handleLogout,
    // BO bridge
    placeOrder,
    // Theme
    isLight,
    theme,
    // Offers
    activeOffers,
    activeDiscount,
    getDiscountedPrice,
    avisData,
    setAvisData,
    menuItems,
    categories,
    // Last order (for confirmation page)
    lastOrderId,
    lastOrderPoints,
    lastOrderTotal,
    lastOrderMode,
    cancelOrder,
    clearLastOrder,
    lastOrderCancelWindowEnd,
    lastOrderStep,
    lastOrderCancelled,
    ordersLoaded,           // ← NEW: prevents blue-square flash before DB load
    // Legacy cart props — kept for backward compat while pages migrate to store
    cart,
    cartCount,
    cartTotal,
    addToCart:      cartActions.addToCart,
    removeFromCart: cartActions.removeFromCart,
    updateCartQty:  cartActions.updateCartQty,
    clearCart:      cartActions.clearCart,
    orderMode,
    setOrderMode:   cartActions.setOrderMode,
    // Address persistence — lets UnifiedCheckout write new addresses back to the profile
    setFrontCustomers,
    setCurrentCustomer,
    customerApi,            // ← passed so CustomerProfile can POST reviews to DB
  };

  // ── Page renderer ──────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'home':         return <HomePage          {...sharedProps} />;
      case 'menu':         return <MenuPage          {...sharedProps} />;
      case 'cart':         return <CartPage          {...sharedProps} />;
      case 'checkout':     return <UnifiedCheckout   {...sharedProps} />;
      case 'confirmation': return <OrderConfirmation {...sharedProps} />;
      case 'entre-nous':   return <EntreNous         {...sharedProps} />;
      case 'fidelite':     return <FidelitePage      {...sharedProps} />;
      case 'profile':      return <CustomerProfile   {...sharedProps} setCurrentCustomer={setCurrentCustomer} setFrontCustomers={setFrontCustomers} setAvisData={setAvisData} />;
      default:             return <HomePage          {...sharedProps} />;
    }
  };

  const hideBottomNav = ['checkout', 'confirmation'].includes(page);

  return (
    <div className="min-h-screen bg-obsidian-950 text-white font-sans antialiased">
      {/* Desktop top navbar */}
      <FrontNavbar
        {...sharedProps}
        currentPage={page}
        onGoToBackoffice={onGoToBackoffice}
      />

      {/* Offers banner */}
      {(page === 'home' || page === 'menu') && activeOffers.length > 0 && (
        <div className="pt-16 sm:pt-20">
          <OffersBanner
            offers={activeOffers}
            navigate={navigate}
            theme={theme}
          />
        </div>
      )}

      {/* Main content */}
      <main className={!hideBottomNav ? 'pb-20 sm:pb-0' : ''}>
        {renderPage()}
      </main>

      {/* Desktop footer */}
      {!['checkout', 'confirmation'].includes(page) && (
        <Footer
          navigate={navigate}
          onGoToBackoffice={onGoToBackoffice}
          isLight={isLight}
        />
      )}

      {/* Mobile bottom navigation */}
      {!hideBottomNav && (
        <div className="sm:hidden">
          <BottomNav
            currentPage={page}
            navigate={navigate}
            cartCount={cartCount}
            currentCustomer={currentCustomer}
            openAuth={openAuth}
          />
        </div>
      )}

      {/* Active order floating bar — survives navigation */}
      {lastOrderId && page !== 'confirmation' && !orderBarDismissed && (
        <ActiveOrderBar
          lastOrderId={lastOrderId}
          lastOrderCancelWindowEnd={lastOrderCancelWindowEnd}
          lastOrderMode={lastOrderMode}
          lastOrderStep={lastOrderStep}
          lastOrderCancelled={lastOrderCancelled}
          cancelOrder={cancelOrder}
          navigate={navigate}
          onDismiss={() => { setOrderBarDismissed(true); clearLastOrder(); }}
          ordersLoaded={ordersLoaded}
        />
      )}

      {/* Auth modal */}
      {showAuth && (
        <CustomerAuth
          mode={authMode}
          setMode={setAuthMode}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onClose={() => setShowAuth(false)}
          frontCustomers={frontCustomers}
        />
      )}

      {/* ── Welcome screen after signup ─────────────────── */}
      {welcomeCustomer && (
        <WelcomeScreen
          customer={welcomeCustomer}
          onDismiss={() => setWelcomeCustomer(null)}
          onOrder={() => { setWelcomeCustomer(null); navigate('menu'); }}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />

      {/* Image Lightbox */}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};

export default FrontApp;

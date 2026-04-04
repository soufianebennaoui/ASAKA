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

const FrontApp = ({
  onGoToBackoffice,
  ordersData,
  setOrdersData,
  frontCustomers,
  setFrontCustomers,
  activeOffers = [],
  avisData = [],
  setAvisData,
  menuItems = [],
  categories = [],
}) => {
  // ── Theme (always dark for Asaka) ─────────────────────
  const [theme] = useState('dark');
  const isLight = false;

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // ── Routing ───────────────────────────────────────────
  const [page, setPage] = useState('home');

  // ── Last Order ────────────────────────────────────────
  const [lastOrderId,            setLastOrderId]            = useState(null);
  const [lastOrderPoints,        setLastOrderPoints]        = useState(0);
  const [lastOrderTotal,         setLastOrderTotal]         = useState(0);
  const [lastOrderMode,          setLastOrderMode]          = useState(null);
  const [lastOrderCancelWindowEnd, setLastOrderCancelWindowEnd] = useState(null);
  const [orderBarDismissed,        setOrderBarDismissed]        = useState(false);

  // ── Lightbox ──────────────────────────────────────────
  const [lightboxImage, setLightboxImage] = useState(null);

  // ── Auth ──────────────────────────────────────────────
  const [showAuth,         setShowAuth]         = useState(false);
  const [authMode,         setAuthMode]         = useState('login');
  const [currentCustomer, setCurrentCustomer]  = useState(null);

  // ── Store reads (no local cart state needed) ──────────
  const cart           = useCartStore(selectCart);
  const cartCount      = useCartStore(selectCartCount);
  const cartTotal      = useCartStore(selectCartTotal);
  const orderMode      = useCartStore(selectOrderMode);
  const appliedCoupon  = useCartStore(selectAppliedCoupon);

  // ── Navigation ────────────────────────────────────────
  const navigate = (target) => {
    // Snap to top BEFORE React renders the new page so the content
    // always appears anchored to the top of the viewport.
    window.scrollTo(0, 0);
    setPage(target);
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
        case 'done':       lastOrderStep = 4; break;
        default:           lastOrderStep = 0; break;
      }
    }
  }


  // ── Auth helpers ──────────────────────────────────────
  const openAuth    = (mode = 'login') => { setAuthMode(mode); setShowAuth(true); };
  const handleLogin = (customer) => {
    setCurrentCustomer(customer);
    // Restore this customer's saved addresses into the cart store
    cartActions.loadAddresses(customer.savedAddresses || []);
    setShowAuth(false);
  };

  const handleSignup = (newCustomer) => {
    const customer = {
      ...newCustomer,
      id:             frontCustomers.length + 1,
      points:         0,
      totalOrders:    0,
      totalSpent:     0,
      orderHistory:   [],
      favorites:      [],
      coupons:        [generateWelcomeCoupon()],  // 10% welcome coupon
      joinedDate:     new Date().toLocaleDateString('fr-MA'),
      savedAddresses: newCustomer.savedAddresses || [],
    };
    setFrontCustomers(prev => [...prev, customer]);
    setCurrentCustomer(customer);
    // Pre-load any addresses they entered at signup into the cart store
    cartActions.loadAddresses(customer.savedAddresses);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
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
  const placeOrder = ({ tip = 0, paymentMethod = 'cash', pointsUsed = 0, extra = {} }) => {
    const payload  = buildOrderPayload({ currentCustomer, extra: { ...extra, tip }, activeDiscount, pointsUsed, paymentMethod });
    const orderId  = `#${1100 + ordersData.length}`;

    const newOrder = {
      id:            orderId,
      customer:      payload.customerName,
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
      setFrontCustomers(prev => prev.map(c =>
        c.id === currentCustomer.id ? updated : c,
      ));
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
      setFrontCustomers(prev => prev.map(c =>
        c.id === currentCustomer.id ? updated : c,
      ));
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
    lastOrderCancelWindowEnd,
    lastOrderStep,
    lastOrderCancelled,
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
  };

  // ── Page renderer ──────────────────────────────────────
  const renderPage = () => {
    switch (page) {
      case 'home':         return <HomePage          {...sharedProps} />;
      case 'menu':         return <MenuPage          {...sharedProps} />;
      case 'cart':         return <CartPage          {...sharedProps} />;
      case 'checkout':     return <UnifiedCheckout   {...sharedProps} />;
      case 'confirmation': return <OrderConfirmation {...sharedProps} />;
      case 'profile':      return <CustomerProfile   {...sharedProps} setCurrentCustomer={setCurrentCustomer} setFrontCustomers={setFrontCustomers} setAvisData={setAvisData} />;
      default:             return <HomePage          {...sharedProps} />;
    }
  };

  const hideBottomNav = ['checkout', 'confirmation'].includes(page);

  return (
    <div className="min-h-screen bg-asaka-900 text-white font-sans antialiased">
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
          onDismiss={() => setOrderBarDismissed(true)}
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

      {/* Toast notifications */}
      <ToastContainer />

      {/* Image Lightbox */}
      <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
};

export default FrontApp;

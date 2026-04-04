// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Back Office App Shell
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import MenuEditor from './components/MenuEditor';
import Customers from './components/Customers';
import Settings from './components/Settings';
import Login from './components/Login';
import OrderManagement from './components/OrderManagement';
import OffersModule from './components/OffersModule';
import Analytics from './components/Analytics';
import { useOrderNotifications } from './hooks/useOrderNotifications';
import Avis from './components/Avis';

const BackApp = ({
  onGoToWebsite,
  inventoryData, setInventoryData,
  ordersData,    setOrdersData,
  customersData, setCustomersData,
  usersData,     setUsersData,
  offers,        setOffers,
  avisData,      setAvisData,
  menuItems,     setMenuItems,
  categories,    setCategories,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab]             = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen]     = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('asaka_theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('asaka_theme', theme);
  }, [theme]);

  const handleLogin  = () => setIsAuthenticated(true);
  const toggleTheme  = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  // ── Order notifications ───────────────────────────────────
  const { unseenCount, toasts, dismissToast } = useOrderNotifications(
    ordersData,
    activeTab,
  );

  // ── Content renderer ──────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard ordersData={ordersData} customersData={customersData} />;
      case 'orders':    return <OrderManagement ordersData={ordersData} setOrdersData={setOrdersData} />;
      case 'customers': return <Customers customersData={customersData} setCustomersData={setCustomersData} />;
      case 'avis':     return <Avis avisData={avisData} setAvisData={setAvisData} />;
      case 'offers':    return <OffersModule offers={offers} setOffers={setOffers} />;
      case 'inventory': return <Inventory inventoryData={inventoryData} setInventoryData={setInventoryData} />;
      case 'analytics': return <Analytics ordersData={ordersData} customersData={customersData} />;
      case 'admin':     return (
        <MenuEditor
          menuItems={menuItems} setMenuItems={setMenuItems}
          categories={categories} setCategories={setCategories}
        />
      );
      case 'settings':  return <Settings usersData={usersData} setUsersData={setUsersData} />;
      default:          return <Dashboard ordersData={ordersData} customersData={customersData} />;
    }
  };

  if (!isAuthenticated) {
    return <Login usersData={usersData} onLogin={handleLogin} onGoToWebsite={onGoToWebsite} />;
  }

  return (
    <div className={`${theme} font-sans`}>
      <div className="flex h-screen bg-asaka-950 text-white overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
          onGoToWebsite={onGoToWebsite}
          unseenOrdersCount={unseenCount}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header 
            theme={theme} 
            toggleTheme={toggleTheme} 
            unseenCount={unseenCount} 
            onOpenOrders={() => setActiveTab('orders')} 
            onToggleSidebar={() => setIsSidebarOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-asaka-950 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>
        </div>
      </div>

      {/* ── Order Toast Notifications ─────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-asaka-800 border border-asaka-300/30 rounded-2xl shadow-glow-blue p-4 w-80 animate-fade-in"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-asaka-300/15 flex items-center justify-center shrink-0">
              <ShoppingBag size={18} className="text-asaka-300" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-asaka-300 uppercase tracking-wider mb-0.5">
                Nouvelle commande 🎉
              </p>
              <p className="text-sm font-medium text-white truncate">
                {toast.orderId} — {toast.customer}
              </p>
              {toast.total && (
                <p className="text-xs text-asaka-muted mt-0.5">{toast.total}</p>
              )}
              <button
                onClick={() => { setActiveTab('orders'); dismissToast(toast.id); }}
                className="mt-2 text-xs text-asaka-300 hover:text-white font-semibold transition-colors"
              >
                Voir les commandes →
              </button>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-asaka-muted hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackApp;

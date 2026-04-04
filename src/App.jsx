import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import FrontApp from './frontoffice/FrontApp';
import BackApp from './backoffice/BackApp';
import { useSharedState } from './utils/useSharedState';
import { CATEGORIES, MENU_ITEMS } from './data/menuData';

// ── Helper: map a front-office customer → back-office CRM row ──────────────
const toBoCustomer = (fc) => ({
  id:          fc.id,
  name:        fc.name,
  phone:       fc.phone  || '',
  email:       fc.email  || '',
  password:    fc.password || '',
  savedAddresses: fc.savedAddresses || [],
  totalOrders: fc.totalOrders || 0,
  totalSpent:  typeof fc.totalSpent === 'number'
    ? `${fc.totalSpent} DH`
    : (fc.totalSpent || '0 DH'),
  status:      (fc.totalOrders || 0) >= 10 ? 'VIP'
             : (fc.totalOrders || 0) >= 3  ? 'Regular'
             : 'New',
  lastOrder:   fc.orderHistory?.[0]?.date || 'Jamais',
  points:      fc.points || 0,
  joinedDate:  fc.joinedDate || '',
});

function AppInner() {
  const navigate = useNavigate();

  // ── All shared state uses useSharedState:
  //    ✔ survives page refresh (localStorage)
  //    ✔ syncs instantly across browser tabs (storage event)

  // Offers (BO manages → FO displays)
  const [offers, setOffers] = useSharedState('asaka_offers', []);

  // Orders (FO creates → BO views & updates)
  const [ordersData, setOrdersData] = useSharedState('asaka_orders', []);

  // Avis / Reviews (BO manages → FO displays)
  const [avisData, setAvisData] = useSharedState('asaka_avis', []);

  // Inventory (BO manages)
  const [inventoryData, setInventoryData] = useSharedState('asaka_inventory', []);

  // BO staff accounts
  const [usersData, setUsersData] = useSharedState('asaka_users', [
    { id: 'USR-001', name: 'Admin', email: 'admin@asakasushi.ma', role: 'Admin', status: 'Active', lastLogin: 'Maintenant' },
  ]);

  // Front-office customer accounts — single source of truth
  const [frontCustomers, setFrontCustomers] = useSharedState('asaka_customers', []);

  // Shared Dynamic Menu
  const [categories, setCategories] = useSharedState('asaka_menu_cats', CATEGORIES);
  const [menuItems, setMenuItems] = useSharedState('asaka_menu_items', MENU_ITEMS);

  // ── Auto-Migration: Fill missing images with category-specific default images ──
  useEffect(() => {
    const hasMissingImages = menuItems.some(i => !i.image);
    const hasMissingCatImages = categories.some(c => !c.image);

    if (hasMissingImages) {
      const updated = menuItems.map(item => {
        if (item.image) return item;
        let defaultImage = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop'; // Sushi
        
        if (item.category === 'soupes') defaultImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop'; // Soup
        else if (item.category === 'wok') defaultImage = 'https://images.unsplash.com/photo-1612929633738-8fe01f7c745f?q=80&w=600&auto=format&fit=crop'; // Wok
        else if (item.category === 'brochettes') defaultImage = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=600&auto=format&fit=crop'; // Yakitori
        else if (item.category === 'tapas') defaultImage = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&auto=format&fit=crop'; // Dumplings
        else if (item.category === 'salades') defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'; // Salad bowl
        else if (item.category === 'poke') defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop'; // Poke
        else if (item.category === 'desserts') defaultImage = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop'; // Mochi/Dessert
        
        return { ...item, image: defaultImage };
      });
      setMenuItems(updated);
    }

    if (hasMissingCatImages) {
      const updatedCats = categories.map(cat => {
        if (cat.image) return cat;
        return { ...cat, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=150&auto=format&fit=crop' };
      });
      setCategories(updatedCats);
    }
  }, [menuItems, categories, setMenuItems, setCategories]);

  // ── Active offers filter ──────────────────────────────────────────────────
  const activeOffers = offers.filter(o => {
    if (!o.isActive) return false;
    const now   = new Date();
    const start = new Date(o.startDate);
    const end   = new Date(o.endDate);
    end.setHours(23, 59, 59);
    return now >= start && now <= end;
  });

  // ── Live computed BO customers from frontCustomers ────────────────────────
  const customersData = frontCustomers.map(toBoCustomer);

  // Bridge setter: BO edits/deletes/adds flow back into frontCustomers ───────
  const setCustomersData = (newBoArray) => {
    if (!Array.isArray(newBoArray)) return;
    setFrontCustomers(prev => {
      const prevMap = new Map(prev.map(fc => [fc.id, fc]));
      return newBoArray.map(boc => {
        if (prevMap.has(boc.id)) {
          // Merge BO-edited fields back into the existing front customer
          return { ...prevMap.get(boc.id), name: boc.name, phone: boc.phone, email: boc.email, password: boc.password, savedAddresses: boc.savedAddresses };
        }
        // Brand-new customer added manually from BO
        return {
          id:             boc.id,
          name:           boc.name,
          phone:          boc.phone  || '',
          email:          boc.email  || '',
          password:       '',
          points:         0,
          totalOrders:    boc.totalOrders || 0,
          totalSpent:     0,
          orderHistory:   [],
          favorites:      [],
          coupons:        [],
          savedAddresses: [],
          joinedDate:     new Date().toLocaleDateString('fr-MA'),
        };
      });
    });
  };

  // ── Props bundles ─────────────────────────────────────────────────────────
  const backProps = {
    onGoToWebsite: () => navigate('/'),
    inventoryData, setInventoryData,
    ordersData,    setOrdersData,
    customersData, setCustomersData,
    usersData,     setUsersData,
    offers,        setOffers,
    avisData,      setAvisData,
    menuItems,     setMenuItems,
    categories,    setCategories,
  };

  const frontProps = {
    onGoToBackoffice: () => navigate('/admin'),
    ordersData,
    setOrdersData,
    frontCustomers,
    setFrontCustomers,
    activeOffers,
    avisData,
    setAvisData,
    menuItems,
    categories,
  };

  return (
    <Routes>
      <Route path="/"     element={<FrontApp {...frontProps} />} />
      <Route path="/admin" element={<BackApp  {...backProps}  />} />
      <Route path="*"     element={<FrontApp {...frontProps} />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;

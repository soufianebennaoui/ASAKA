import React, { useEffect, useRef } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import FrontApp from './frontoffice/FrontApp';
import BackApp from './backoffice/BackApp';
import { useSharedState } from './utils/useSharedState';
import { useRealtimeOrders } from './utils/useRealtimeOrders';
import { useRealtimeCustomers } from './utils/useRealtimeCustomers';
import { useRealtimeData } from './utils/useRealtimeData';
import { CATEGORIES, MENU_ITEMS } from './data/menuData';


function AppInner() {
  const navigate = useNavigate();

  // ── Real-time data from PostgreSQL via SSE ──────────────────

  // Orders (FO creates → BO views & updates, real-time via SSE)
  const [ordersData, setOrdersData] = useRealtimeOrders();

  // Customers (FO creates/updates, BO views)
  const [frontCustomers, customerApi] = useRealtimeCustomers();

  // Offers (BO manages → FO displays)
  const [offers, offersApi] = useRealtimeData('/api/offers', 'offers', []);

  // Avis / Reviews (BO manages → FO displays)
  const [avisData, avisApi] = useRealtimeData('/api/avis', 'avis', []);

  // Inventory (BO manages)
  const [inventoryData, inventoryApi] = useRealtimeData('/api/inventory', 'inventory', []);

  // Menu Items (BO manages → FO displays)
  const [menuItems, menuItemsApi] = useRealtimeData('/api/menu-items', 'menuItems', MENU_ITEMS);

  // Menu Categories (BO manages → FO displays)
  const [categories, categoriesApi] = useRealtimeData('/api/categories', 'categories', CATEGORIES);

  // BO staff accounts — still fetched via /api/staff (managed in Settings)
  const [usersData, setUsersData] = useSharedState('asaka_users', [
    { id: 'USR-001', name: 'Admin', email: 'admin@asakasushi.ma', role: 'Admin', status: 'Active', lastLogin: 'Maintenant' },
  ]);

  // ── Auto-Migration: Fill missing images with category-specific default images ──
  // Guard: only run once after the first real data load to avoid infinite loop.
  const migrated = useRef(false);
  useEffect(() => {
    // Wait until we have actual data (not the default fallback empty state)
    if (migrated.current) return;
    if (menuItems.length === 0 && categories.length === 0) return;

    const hasMissingImages    = menuItems.some(i  => !i.image);
    const hasMissingCatImages = categories.some(c => !c.image);

    if (!hasMissingImages && !hasMissingCatImages) {
      migrated.current = true; // nothing to do
      return;
    }

    migrated.current = true; // mark done before any async work

    if (hasMissingImages) {
      const updated = menuItems.map(item => {
        if (item.image) return item;
        let defaultImage = 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&auto=format&fit=crop'; // Sushi
        if (item.category === 'soupes')     defaultImage = 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'wok')        defaultImage = 'https://images.unsplash.com/photo-1612929633738-8fe01f7c745f?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'brochettes') defaultImage = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'tapas')      defaultImage = 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'salades')    defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'poke')       defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
        else if (item.category === 'desserts')   defaultImage = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop';
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
  // Only re-run when the data arrays change length (new DB load), not on every item update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems.length, categories.length]);

  // ── Setter bridges so BO components can call setXxx(newArray) ────────────
  // These intercept the old useSharedState pattern and redirect to the API.

  const setOffers = (newVal) => {
    const next = typeof newVal === 'function' ? newVal(offers) : newVal;
    if (!Array.isArray(next)) return;
    // Diff: upsert changed/added offers, delete removed ones
    const nextIds = new Set(next.map(o => o.id));
    // Upsert all items in next (catches adds + edits)
    next.forEach(o => offersApi.upsert(o).catch(() => {}));
    // Delete removed items
    offers.forEach(o => { if (!nextIds.has(o.id)) offersApi.remove(o.id).catch(() => {}); });
  };

  const setAvisData = (newVal) => {
    const next = typeof newVal === 'function' ? newVal(avisData) : newVal;
    if (!Array.isArray(next)) return;
    const nextIds = new Set(next.map(a => a.id));
    // Upsert all
    next.forEach(a => {
      if (a.id) avisApi.patch(a.id, a).catch(() => {});
      else       avisApi.upsert(a).catch(() => {});
    });
    // Delete removed
    avisData.forEach(a => { if (!nextIds.has(a.id)) avisApi.remove(a.id).catch(() => {}); });
  };

  const setInventoryData = (newVal) => {
    const next = typeof newVal === 'function' ? newVal(inventoryData) : newVal;
    if (!Array.isArray(next)) return;
    const nextIds = new Set(next.map(i => i.id));
    next.forEach(i => inventoryApi.upsert(i).catch(() => {}));
    inventoryData.forEach(i => { if (!nextIds.has(i.id)) inventoryApi.remove(i.id).catch(() => {}); });
  };

  const setMenuItems = (newVal) => {
    const next = typeof newVal === 'function' ? newVal(menuItems) : newVal;
    if (!Array.isArray(next)) return;
    menuItemsApi.bulkUpsert(next).catch(() => {});
  };

  const setCategories = (newVal) => {
    const next = typeof newVal === 'function' ? newVal(categories) : newVal;
    if (!Array.isArray(next)) return;
    categoriesApi.bulkUpsert(next).catch(() => {});
  };

  // ── Active offers filter ──────────────────────────────────────────────────
  const activeOffers = offers.filter(o => {
    if (!o.isActive) return false;
    const now   = new Date();
    const start = new Date(o.startDate);
    const end   = new Date(o.endDate);
    end.setHours(23, 59, 59);
    return now >= start && now <= end;
  });

  // ── BO customers = front customers (same data, same DB) ──────────────────
  const customersData = frontCustomers.map(fc => ({
    ...fc,
    totalSpent: typeof fc.totalSpent === 'number' ? `${fc.totalSpent} DH` : (fc.totalSpent || '0 DH'),
    status:     (fc.totalOrders || 0) >= 10 ? 'VIP' : (fc.totalOrders || 0) >= 3 ? 'Regular' : 'New',
    lastOrder:  fc.orderHistory?.[0]?.date || 'Jamais',
  }));

  // BO edits (name, phone, email) flow back to PostgreSQL via PATCH ──────────
  const setCustomersData = (newBoArray) => {
    if (!Array.isArray(newBoArray)) return;
    newBoArray.forEach(boc => {
      customerApi.update(boc.id, {
        name:  boc.name,
        phone: boc.phone,
        email: boc.email,
        password: boc.password,
        savedAddresses: boc.savedAddresses,
      });
    });
  };

  // Helpers so FrontApp can create/update customers in DB ───────────────────
  const setFrontCustomers = (updaterOrArray) => {
    // FrontApp sometimes calls setFrontCustomers(prev => [...prev, newCustomer])
    // We handle the most common patterns here.
    if (typeof updaterOrArray === 'function') {
      const next = updaterOrArray(frontCustomers);
      // Find newly added customers and persist them
      const existingIds = new Set(frontCustomers.map(c => c.id));
      next.forEach(c => {
        if (!existingIds.has(c.id)) {
          customerApi.create(c).catch(() => {});
        } else {
          customerApi.update(c.id, c).catch(() => {});
        }
      });
    }
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
    customerApi,
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

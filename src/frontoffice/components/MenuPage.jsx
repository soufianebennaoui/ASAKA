// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — MenuPage
//  Features: search, category tabs, grid/list view,
//            ItemBottomSheet, FAB cart button
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sanitize } from '../../utils/security';
import { toast } from '../../utils/toast';
import { useDragDismiss } from '../hooks/useDragDismiss';

// ── Item Bottom Sheet ─────────────────────────────────────
const ItemBottomSheet = ({ item, onClose, addToCart, getDiscountedPrice, openLightbox }) => {
  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);
  const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 300);
  };

  const handleAdd = () => {
    addToCart(item, qty);
    toast.success(`${qty}x ${item.name} ajouté !`);
    handleClose();
  };

  const price = getDiscountedPrice ? getDiscountedPrice(item.price) : item.price;
  const discounted = price < item.price;

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className="bottom-sheet-overlay"
        style={closing ? { opacity: 0, transition: 'opacity 0.25s ease' } : {}}
        onClick={handleClose}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className="bottom-sheet-panel"
        style={closing ? {
          transform: 'translateY(100%)',
          transition: 'transform 0.3s ease',
        } : {}}
        {...panelDragProps}>

        {/* Handle bar — drag to dismiss */}
        <div className="flex justify-center pt-3 pb-1" {...dragHandleProps}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>

        <div className="px-5 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5 mt-2">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl shadow-md pointer-events-none" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-obsidian-900 flex items-center justify-center text-salmon-500 text-[10px] text-center border border-obsidian-800/50">Vide</div>
                )}
                {item.isSignature && (
                  <span className="text-[11px] bg-salmon-500/20 text-salmon-500
                    border border-salmon-500/30 rounded-full px-2.5 py-1 font-bold">
                    ✨ Signature
                  </span>
                )}
                {item.isPopular && !item.isSignature && (
                  <span className="text-[11px] bg-amber-900/30 text-amber-400
                    border border-amber-800/30 rounded-full px-2.5 py-1 font-bold">
                    🔥 Populaire
                  </span>
                )}
              </div>
              <h2 className="text-white font-black text-xl leading-tight">{item.name}</h2>
              {item.pieces && (
                <p className="text-champagne-muted text-sm mt-0.5">{item.pieces} pièces</p>
              )}
            </div>
            <button onClick={handleClose}
              className="w-9 h-9 rounded-xl glass-light flex items-center justify-center
                text-champagne-muted hover:text-white transition-colors flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Description */}
          <p className="text-champagne-muted text-sm leading-relaxed mb-5">
            {item.description}
          </p>

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="mb-5">
              <h3 className="text-white text-sm font-bold mb-2">Ingrédients</h3>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ing, i) => (
                  <span key={i}
                    className="text-xs bg-obsidian-900 border border-obsidian-700/40
                      text-champagne-muted rounded-lg px-2.5 py-1 capitalize">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {item.tags.map((tag, i) => (
                <span key={i} className="text-[11px] text-obsidian-400 font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Price + qty + add */}
          <div className="flex items-center gap-4 mt-6">
            {/* Qty controls */}
            <div className="flex items-center gap-3 glass rounded-xl px-1">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-salmon-500
                  hover:text-white transition-colors tap-target">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
                </svg>
              </button>
              <span className="text-white font-black text-lg w-6 text-center">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-9 flex items-center justify-center text-salmon-500
                  hover:text-white transition-colors tap-target">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>

            {/* Add to cart */}
            <button onClick={handleAdd}
              className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              <span>
                Ajouter · {(price * qty).toFixed(0)} DH
                {discounted && <s className="ml-1 text-xs opacity-60">{item.price * qty} DH</s>}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Menu Item Card (grid view) ────────────────────────────
const ItemCard = ({ item, onOpen, getDiscountedPrice, openLightbox }) => {
  const price = getDiscountedPrice ? getDiscountedPrice(item.price) : item.price;
  const discounted = price < item.price;

  return (
    <button
      onClick={() => onOpen(item)}
      className="card-asaka-hover text-left flex flex-col overflow-hidden group active:scale-[0.97]
        transition-transform duration-150">
      {/* Emoji area */}
      <div className="flex items-center justify-center h-32
        bg-obsidian-900 relative w-full overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none" />
        ) : (
           <div className="text-obsidian-400 text-xs">Image manquante</div>
        )}
        {item.isSignature && (
          <span className="absolute top-2 right-2 text-[10px] bg-salmon-500/30 text-salmon-500
            border border-salmon-500/40 rounded-full px-1.5 py-0.5 font-bold">✨</span>
        )}
        {item.isPopular && !item.isSignature && (
          <span className="absolute top-2 right-2 text-[10px] bg-amber-900/30 text-amber-400
            border border-amber-800/30 rounded-full px-1.5 py-0.5 font-bold">🔥</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 flex-1">
          {item.name}
        </h3>
        {item.pieces && (
          <p className="text-champagne-muted text-xs mt-0.5">{item.pieces} pcs</p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <div>
            <span className="text-salmon-500 font-black text-sm">{price} DH</span>
            {discounted && (
              <s className="text-champagne-muted text-xs ml-1">{item.price}</s>
            )}
          </div>
          <div className="w-7 h-7 rounded-lg bg-salmon-500/20 border border-salmon-500/30
            flex items-center justify-center text-salmon-500 group-hover:bg-salmon-500
            group-hover:text-white transition-all duration-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

// ── Menu Item Row (list view) ─────────────────────────────
const ItemRow = ({ item, onOpen, getDiscountedPrice, openLightbox }) => {
  const price = getDiscountedPrice ? getDiscountedPrice(item.price) : item.price;

  return (
    <button
      onClick={() => onOpen(item)}
      className="card-asaka-hover w-full text-left flex items-center gap-4 p-4
        active:scale-[0.98] transition-transform duration-150">
      <div className="w-14 h-14 rounded-xl bg-obsidian-950 flex items-center justify-center
        flex-shrink-0 border border-obsidian-800/40 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover pointer-events-none" />
        ) : (
          <span className="text-[10px] text-obsidian-400 text-center leading-tight">Image<br/>vide</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
          {item.isSignature && (
            <span className="text-[10px] text-salmon-500 flex-shrink-0">✨</span>
          )}
        </div>
        <p className="text-champagne-muted text-xs mt-0.5 line-clamp-1">{item.description}</p>
        {item.pieces && (
          <p className="text-obsidian-400 text-xs mt-0.5">{item.pieces} pièces</p>
        )}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-salmon-500 font-black text-sm">{price} DH</div>
        <div className="w-7 h-7 rounded-lg bg-salmon-500/20 border border-salmon-500/30
          flex items-center justify-center text-salmon-500 mt-1 ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      </div>
    </button>
  );
};

// ── Mode Selection Sheet ──────────────────────────────────
const ModeSheet = ({ current, onSelect, onClose }) => {
  const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);
  const MODES = [
    {
      id:    'takeaway',
      emoji: '🥡',
      label: 'À Emporter',
      desc:  'Venez récupérer votre commande en boutique',
      color: 'border-salmon-500/60 bg-salmon-500/10 text-salmon-500 hover:bg-salmon-500/15',
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
      <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-obsidian-900
          border-t border-obsidian-800/50 rounded-t-3xl px-5 pt-4
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...panelDragProps}>
        <div className="flex justify-center mb-5" {...dragHandleProps}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>
        <h3 className="text-white font-black text-lg mb-1">Mode de commande</h3>
        <p className="text-salmon-500 text-sm mb-5">Choisissez comment vous souhaitez commander</p>
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
          className="w-full mt-4 py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
          Annuler
        </button>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
//  MENU PAGE
// ════════════════════════════════════════════════════════════
const MenuPage = ({
  navigate,
  addToCart,
  cartCount = 0,
  cartTotal = 0,
  orderMode,
  setOrderMode,
  getDiscountedPrice,
  activeDiscount,
  menuItems = [],
  categories = [],
  openLightbox,
}) => {
  const [search, setSearch]             = useState('');
  const [activeCategory, setCategory]   = useState('all');
  const [viewMode, setViewMode]         = useState('grid'); // 'grid' | 'list'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModeSheet, setShowModeSheet] = useState(false);
  const [expandCategories, setExpandCategories] = useState(false);

  const searchRef      = useRef(null);
  const tabsRef        = useRef(null);
  const stickyHeaderRef = useRef(null);
  const categoryRefs   = useRef({});

  // ── Search filter (memoised) ──────────────────────────
  const cleanSearch = useMemo(
    () => sanitize(search, 80).toLowerCase(),
    [search],
  );

  const filtered = useMemo(() => menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    if (!cleanSearch) return matchCat;
    return matchCat && (
      item.name.toLowerCase().includes(cleanSearch) ||
      item.description.toLowerCase().includes(cleanSearch) ||
      item.tags?.some(t => t.toLowerCase().includes(cleanSearch))
    );
  }), [cleanSearch, activeCategory]);

  // ── Group by category (memoised) ─────────────────────
  const grouped = useMemo(() => categories.map(cat => ({
    ...cat,
    items: filtered.filter(i => i.category === cat.id),
  })).filter(g => g.items.length > 0), [filtered]);

  // ── Scroll to category ───────────────────────────────
  // Uses requestAnimationFrame so the layout settles after setCategory()
  // re-render before we read getBoundingClientRect.
  const scrollToCategory = useCallback((catId) => {
    setCategory(catId);
    if (catId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // One frame delay — lets React re-render before we measure
    requestAnimationFrame(() => {
      const el      = categoryRefs.current[catId];
      if (!el) return;
      const headerH = stickyHeaderRef.current?.offsetHeight ?? 140;
      const top     = el.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  }, []);

  // ── Count per category (for badges) ─────────────────
  const catCounts = categories.reduce((acc, cat) => {
    acc[cat.id] = menuItems.filter(i => i.category === cat.id).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-obsidian-950">
      {/* ── Sticky header ── */}
      <div ref={stickyHeaderRef} className="sticky top-0 z-30 bg-obsidian-950/95 backdrop-blur-xl
        border-b border-obsidian-800/40 pt-16 sm:pt-20">

        {/* Search bar */}
        <div className="px-4 py-3">
          <div className="relative flex items-center gap-3">
            <div className="flex-1 relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-muted pointer-events-none">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Chercher un plat..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-asaka pl-10 pr-10 py-2.5 text-sm"
              />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-champagne-muted
                    hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex glass rounded-xl p-1 gap-1 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'grid'
                    ? 'bg-salmon-500 text-white'
                    : 'text-champagne-muted hover:text-white'
                }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd"
                    d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z"
                    clipRule="evenodd"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === 'list'
                    ? 'bg-salmon-500 text-white'
                    : 'text-champagne-muted hover:text-white'
                }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd"
                    d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Active discount banner */}
          {activeDiscount > 0 && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl
              bg-amber-900/20 border border-amber-700/30 text-amber-400 text-xs font-semibold">
              <span>🎉</span>
              <span>Offre active : -{activeDiscount}% sur tout le menu !</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center px-4 mb-2">
          <span className="text-champagne-muted text-xs font-bold uppercase tracking-wider">Catégories</span>
          <button onClick={() => setExpandCategories(!expandCategories)} className="text-salmon-500 text-xs font-medium hover:text-asaka-400 transition-colors">
            {expandCategories ? 'Afficher en ligne' : 'Afficher tout'}
          </button>
        </div>
        {/* Category tabs */}
        <div ref={tabsRef} className={`flex gap-2 px-4 pb-3 ${expandCategories ? 'flex-wrap' : 'overflow-x-auto no-scrollbar'}`}>
          {/* "Tout" tab */}
          <button
            onClick={() => scrollToCategory('all')}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl
              text-xs font-bold transition-all duration-200 ${
              activeCategory === 'all'
                ? 'bg-salmon-500 text-white shadow-glow-salmon'
                : 'glass-light text-champagne-muted hover:text-white'
            }`}>
            🍽️ Tout
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-obsidian-800 text-champagne-muted'
            }`}>
              {menuItems.length}
            </span>
          </button>

          {categories.map(cat => {
            const count = filtered.filter(i => i.category === cat.id).length;
            if (count === 0 && cleanSearch) return null;
            return (
              <button key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                  text-xs font-bold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-salmon-500 text-white shadow-glow-salmon'
                    : 'glass-light text-champagne-muted hover:text-white'
                }`}>
                {cat.image ? (
                  <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : null}
                {cat.name}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat.id
                      ? 'bg-white/20 text-white'
                      : 'bg-obsidian-800 text-champagne-muted'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-32">
        {/* Order mode banner */}
        {orderMode && (
          <div className={`flex items-center justify-between mt-4 mb-2 px-4 py-3 rounded-2xl
            border text-sm font-semibold ${
            orderMode === 'takeaway'
              ? 'bg-salmon-500/15 border-salmon-500/30 text-salmon-500'
              : 'bg-cyan-900/20 border-cyan-700/30 text-cyan-300'
          }`}>
            <span>
              {orderMode === 'takeaway' ? '🥡 Mode: À Emporter' : '🛵 Mode: Livraison'}
            </span>
            <button
              onClick={() => setShowModeSheet(true)}
              className="text-xs opacity-70 hover:opacity-100 underline transition-opacity">
              Changer
            </button>
          </div>
        )}

        {/* Mode selection sheet */}
        {showModeSheet && (
          <ModeSheet
            current={orderMode}
            onSelect={(mode) => { setOrderMode(mode); setShowModeSheet(false); }}
            onClose={() => setShowModeSheet(false)}
          />
        )}

        {/* Search empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-white font-bold text-lg">Aucun résultat</div>
            <div className="text-champagne-muted text-sm mt-1">
              Essayez un autre terme de recherche
            </div>
            <button onClick={() => setSearch('')}
              className="mt-4 btn-secondary px-6 py-2 text-sm">
              Effacer la recherche
            </button>
          </div>
        )}

        {/* Grouped categories */}
        {grouped.map(group => (
          <div key={group.id} className="mt-8"
            ref={el => categoryRefs.current[group.id] = el}>
            {/* Category header */}
            <div className="flex items-center gap-3 mb-4">
              {group.image && (
                 <img src={group.image} alt="" className="w-8 h-8 rounded-full object-cover shadow-md" />
              )}
              <div>
                <h2 className="text-white font-black text-lg leading-none">{group.name}</h2>
                <p className="text-champagne-muted text-xs mt-0.5">{group.items.length} plats</p>
              </div>
              <div className="flex-1 h-px bg-obsidian-800/40 ml-2" />
            </div>

            {/* Items */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 gap-3">
                {group.items.map(item => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onOpen={setSelectedItem}
                    getDiscountedPrice={getDiscountedPrice}
                    openLightbox={openLightbox}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {group.items.map(item => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onOpen={setSelectedItem}
                    getDiscountedPrice={getDiscountedPrice}
                    openLightbox={openLightbox}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FAB Cart Button ── */}
      {cartCount > 0 && (
        <div className="fixed bottom-[76px] sm:bottom-6 left-0 right-0 z-40 flex justify-center
          pointer-events-none px-4">
          <button
            onClick={() => navigate('cart')}
            className="pointer-events-auto btn-primary px-6 py-4 flex items-center gap-4
              rounded-2xl shadow-glow-salmon min-w-[240px] justify-between
              animate-scale-in">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
              </svg>
              <span className="font-bold">{cartCount} article{cartCount > 1 ? 's' : ''}</span>
            </div>
            <span className="font-black text-base">{cartTotal} DH →</span>
          </button>
        </div>
      )}

      {/* ── Item Bottom Sheet ── */}
      {selectedItem && (
        <ItemBottomSheet
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          addToCart={addToCart}
          getDiscountedPrice={getDiscountedPrice}
          openLightbox={openLightbox}
        />
      )}
    </div>
  );
};

export default MenuPage;

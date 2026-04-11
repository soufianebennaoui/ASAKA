/**
 * Asaka Sushi — Mobile Bottom Navigation Bar
 * 5 tabs: Home · Menu · Cart · Profile · More (Entre Nous + Fidélité)
 */
import React, { useState } from 'react';
import { Avatar } from './CustomerProfile';

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Accueil',
    icon: ({ active }) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M2.25 12L11.204 3.045a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75V19.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v4.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V9.75"/>
      </svg>
    ),
  },
  {
    id: 'menu',
    label: 'Menu',
    icon: ({ active }) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth={active ? 0 : 1.8}
        className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"/>
      </svg>
    ),
  },
  {
    id: 'cart',
    label: 'Panier',
    icon: ({ active, cartCount }) => (
      <div className="relative">
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={active ? 0 : 1.8}
          className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
        </svg>
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-sea-blue-500 text-obsidian-950 text-[10px] font-black
            rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none
            shadow-glow-sea">
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>
    ),
  },
  {
    id: 'profile',
    label: 'Compte',
    icon: ({ active, currentCustomer }) => {
      if (currentCustomer?.avatarUrl || currentCustomer?.avatarEmoji) {
        return (
          <div className={`w-6 h-6 rounded-lg overflow-hidden border-2 transition-all ${
            active ? 'border-sea-blue-400' : 'border-obsidian-700/60'
          }`}>
            <Avatar customer={currentCustomer} size="xs"
              className="w-full h-full" />
          </div>
        );
      }
      return (
        <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={active ? 0 : 1.8}
          className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
        </svg>
      );
    },
  },
];

const MORE_ITEMS = [
  {
    id: 'entre-nous',
    label: 'Entre Nous',
    emoji: '🏯',
    desc: 'Notre histoire & le chef',
  },
  {
    id: 'fidelite',
    label: 'Fidélité',
    emoji: '🎯',
    desc: 'Vos points & récompenses',
  },
];

const BottomNav = ({ currentPage, navigate, cartCount = 0, currentCustomer, openAuth }) => {
  const [showMore, setShowMore] = useState(false);

  const handleTabPress = (tabId) => {
    if (tabId === 'profile') {
      if (currentCustomer) {
        navigate('profile');
      } else {
        openAuth('login');
      }
      return;
    }
    navigate(tabId);
  };

  const isMoreActive = currentPage === 'entre-nous' || currentPage === 'fidelite';

  return (
    <>
      {/* More drawer overlay */}
      {showMore && (
        <div
          className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More drawer panel */}
      {showMore && (
        <div
          className="fixed inset-x-0 z-[66] bg-obsidian-900 border-t border-obsidian-700/60 rounded-t-3xl shadow-2xl"
          style={{
            bottom: 'calc(60px + env(safe-area-inset-bottom))',
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1) forwards',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 bg-obsidian-600 rounded-full" />
          </div>

          <div className="px-4 pb-4 pt-2">
            <p className="text-obsidian-400 text-[11px] uppercase tracking-widest font-semibold mb-3 px-1">
              Explorer
            </p>
            <div className="grid grid-cols-2 gap-3">
              {MORE_ITEMS.map(item => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { navigate(item.id); setShowMore(false); }}
                    className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border transition-all text-left ${
                      active
                        ? 'bg-sea-blue-500/10 border-sea-blue-500/40'
                        : 'bg-obsidian-800/60 border-obsidian-700/40 hover:border-sea-blue-500/20'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <p className={`font-bold text-sm ${active ? 'text-sea-blue-400' : 'text-champagne'}`}>
                        {item.label}
                      </p>
                      <p className="text-obsidian-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="bottom-nav">
        <div className="flex items-stretch h-[60px]">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.id || (item.id === 'profile' && currentPage === 'profile');
            return (
              <button
                key={item.id}
                onClick={() => { setShowMore(false); handleTabPress(item.id); }}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 tap-target relative
                  transition-all duration-200 active:scale-90"
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-sea-blue-400"
                    style={{ boxShadow: '0 0 8px rgba(79,195,247,0.8)' }}
                  />
                )}
                <span className={`transition-colors duration-200 ${
                  active ? 'text-sea-blue-400' : 'text-champagne-muted'
                }`} style={active ? { filter: 'drop-shadow(0 0 6px rgba(79,195,247,0.5))' } : {}}>
                  <item.icon active={active} cartCount={cartCount} currentCustomer={currentCustomer} />
                </span>
                <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                  active ? 'text-sea-blue-400' : 'text-champagne-muted'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setShowMore(prev => !prev)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 tap-target relative
              transition-all duration-200 active:scale-90"
            aria-label="Plus"
          >
            {(isMoreActive || showMore) && (
              <span
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-sea-blue-400"
                style={{ boxShadow: '0 0 8px rgba(79,195,247,0.8)' }}
              />
            )}
            <span className={`transition-colors duration-200 ${
              isMoreActive || showMore ? 'text-sea-blue-400' : 'text-champagne-muted'
            }`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
                <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <span className={`text-[10px] font-semibold transition-colors duration-200 ${
              isMoreActive || showMore ? 'text-sea-blue-400' : 'text-champagne-muted'
            }`}>
              Plus
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

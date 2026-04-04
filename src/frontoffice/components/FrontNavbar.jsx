// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — FrontNavbar
//  Desktop-only top bar (mobile uses BottomNav)
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { RESTAURANT } from '../../data/asakaData';
import { Avatar } from './CustomerProfile';

const FrontNavbar = ({
  navigate,
  currentPage,
  cartCount = 0,
  currentCustomer,
  openAuth,
  handleLogout,
  onGoToBackoffice,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { id: 'home',  label: 'Accueil' },
    { id: 'menu',  label: 'Menu' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-asaka-900/95 backdrop-blur-xl border-b border-asaka-700/40 py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('home')}
          className="flex items-center gap-2 group">
          <span className="text-2xl">🏯</span>
          <span className="font-black text-lg tracking-tight">
            <span className="text-gradient-ice">Asaka</span>
            <span className="text-white"> Sushi</span>
          </span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => navigate(link.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentPage === link.id
                  ? 'bg-asaka-500/20 text-asaka-300'
                  : 'text-asaka-muted hover:text-white hover:bg-asaka-800/50'
              }`}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Commander CTA */}
          <button
            onClick={() => navigate('menu')}
            className="hidden sm:flex btn-primary px-5 py-2 text-xs font-bold
              items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            Commander
          </button>

          {/* Cart button */}
          <button onClick={() => navigate('cart')}
            className="relative w-10 h-10 rounded-xl glass-light flex items-center justify-center
              text-asaka-muted hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-asaka-300 text-asaka-900
                text-[10px] font-black rounded-full min-w-[18px] h-[18px]
                flex items-center justify-center px-1">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Account */}
          {currentCustomer ? (
            <button onClick={() => navigate('profile')}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl
                glass-light text-asaka-muted hover:text-white transition-colors">
              <Avatar customer={currentCustomer} size="sm" />
              <span className="text-xs font-semibold max-w-[80px] truncate text-white">
                {currentCustomer.name?.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button onClick={() => openAuth('login')}
              className="hidden sm:flex btn-secondary px-4 py-2 text-xs">
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default FrontNavbar;

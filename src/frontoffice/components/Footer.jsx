// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Footer
//  Compact, desktop-focused (mobile uses BottomNav)
// ═══════════════════════════════════════════════════════════
import React from 'react';
import { RESTAURANT } from '../../data/asakaData';

const Footer = ({ navigate, onGoToBackoffice }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="hidden sm:block bg-asaka-950 border-t border-asaka-800/60">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏯</span>
              <span className="font-black text-base">
                <span className="text-gradient-ice">Asaka</span>
                <span className="text-white"> Sushi</span>
              </span>
            </div>
            <p className="text-asaka-muted text-sm leading-relaxed">
              L'art japonais, livré à votre porte.
              Casablanca · Sidi Maarouf
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Navigation</h4>
            <div className="space-y-2">
              {[
                { label: 'Accueil', page: 'home' },
                { label: 'Menu',    page: 'menu' },
                { label: 'Compte',  page: 'profile' },
              ].map(l => (
                <button key={l.page} onClick={() => navigate(l.page)}
                  className="block text-asaka-muted text-sm hover:text-asaka-300
                    transition-colors">
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-asaka-muted">
              <p>{RESTAURANT.address}</p>
              <a href={`tel:${RESTAURANT.phone}`}
                className="block hover:text-asaka-300 transition-colors">
                {RESTAURANT.phone}
              </a>
              <p>{RESTAURANT.hours.weekdays.label}</p>
              <p>{RESTAURANT.hours.weekend.label}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-asaka-800/60 pt-5 flex items-center justify-between">
          <p className="text-asaka-muted text-xs">
            © {year} Asaka Sushi. Tous droits réservés.
          </p>
          <button onClick={onGoToBackoffice}
            className="text-asaka-700 hover:text-asaka-muted text-xs transition-colors">
            Admin ↗
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

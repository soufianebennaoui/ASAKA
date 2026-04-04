import React, { useState } from 'react';
import { Search, Moon, Sun, Bell, ShoppingBag, Menu } from 'lucide-react';

const Header = ({ theme, toggleTheme, unseenCount = 0, onOpenOrders, onToggleSidebar }) => {
  const [showBell, setShowBell] = useState(false);

  return (
    <header className="h-16 border-b border-asaka-700/50 bg-asaka-900/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      {/* Search & Menu */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-asaka-muted hover:text-white hover:bg-asaka-800/60 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-asaka-muted" size={18} />
          <input
            type="text"
            placeholder="Rechercher commandes, clients, articles..."
            className="w-full bg-asaka-800/60 border border-asaka-700/50 rounded-xl pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-asaka-300/60 focus:ring-1 focus:ring-asaka-300/30 transition-colors text-white placeholder:text-asaka-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => { onOpenOrders?.(); setShowBell(false); }}
          className="relative flex items-center justify-center p-2 bg-asaka-800/60 border border-asaka-700/40 text-asaka-muted rounded-xl hover:bg-asaka-700/60 hover:text-white transition-colors w-10 h-10"
          title="Commandes"
        >
          <Bell size={18} className={unseenCount > 0 ? 'text-asaka-300' : ''} />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 animate-pulse">
              {unseenCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 bg-asaka-800/60 border border-asaka-700/40 text-asaka-muted rounded-xl hover:bg-asaka-700/60 hover:text-white transition-colors w-10 h-10"
          title="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun  size={18} className="text-asaka-300" />
            : <Moon size={18} className="text-asaka-300" />}
        </button>
      </div>
    </header>
  );
};

export default Header;

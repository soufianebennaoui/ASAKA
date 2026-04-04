import React from 'react';
import { Search, Moon, Sun } from 'lucide-react';

const Header = ({ theme, toggleTheme }) => {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-200">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative w-64 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search orders, customers, items..." 
            className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 transition-colors text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 bg-gray-100 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors w-10 h-10"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-blue-500" />}
        </button>
      </div>
    </header>
  );
};

export default Header;

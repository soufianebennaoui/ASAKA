import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Package,
  Users,
  TrendingUp,
  Settings,
  Database,
  Globe
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onGoToWebsite }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'offers', label: 'Offres & Promos', icon: Tag, badge: 'NEW' },
    { id: 'inventory', label: 'Inventaire', icon: Package },
    { id: 'customers', label: 'Clients', icon: Users },
    { id: 'analytics', label: 'Analytiques', icon: TrendingUp },
    { id: 'admin', label: 'Base de données', icon: Database },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex-col hidden md:flex transition-colors duration-200">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-200 dark:border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-white font-bold text-sm">SS</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Salmon Sushi
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Back Office · Casablanca</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4 px-3">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-orange-500' : 'text-gray-400 dark:text-zinc-500'} />
              <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-3">
        {onGoToWebsite && (
          <button
            onClick={onGoToWebsite}
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-sm font-medium"
          >
            <Globe size={16} />
            <span>Voir le Site Client</span>
          </button>
        )}
        <div className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium text-gray-900 dark:text-zinc-200 truncate">Admin</p>
            <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">admin@salmonsushi.ma</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

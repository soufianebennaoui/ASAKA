import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Package,
  Users,
  TrendingUp,
  Settings,
  Edit3,
  Globe,
  Star
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onGoToWebsite, unseenOrdersCount = 0, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'orders',    label: 'Commandes',         icon: ShoppingBag },
    { id: 'offers',    label: 'Offres & Promos',   icon: Tag, badge: 'NEW' },
    { id: 'avis',      label: 'Avis Clients',      icon: Star },
    { id: 'inventory', label: 'Inventaire',        icon: Package },
    { id: 'customers', label: 'Clients',           icon: Users },
    { id: 'analytics', label: 'Analytiques',       icon: TrendingUp },
    { id: 'admin',     label: 'Éditer le menu',   icon: Edit3 },
    { id: 'settings',  label: 'Paramètres',      icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-asaka-950/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-asaka-900 border-r border-asaka-700/50 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      {/* Brand */}
      <div className="p-6 flex items-center space-x-3 border-b border-asaka-700/50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-asaka-500 to-asaka-300 flex items-center justify-center flex-shrink-0 shadow-glow-blue">
          <span className="text-white font-bold text-sm">AS</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-white">Asaka Sushi</h1>
          <p className="text-xs text-asaka-muted">Back Office · Casablanca</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-semibold text-asaka-muted uppercase tracking-widest mb-3 px-3">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-asaka-500/15 border border-asaka-500/30 text-asaka-300'
                  : 'text-asaka-muted hover:bg-asaka-800/60 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-asaka-300' : 'text-asaka-muted'} />
              <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
              {/* Unseen orders badge */}
              {item.id === 'orders' && unseenOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center animate-pulse">
                  {unseenOrdersCount}
                </span>
              )}
              {/* Other badges (e.g. NEW) */}
              {item.badge && item.id !== 'orders' && (
                <span className="bg-asaka-300/20 text-asaka-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-asaka-700/50 space-y-3">
        {onGoToWebsite && (
          <button
            onClick={onGoToWebsite}
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-asaka-300/10 border border-asaka-300/20 text-asaka-300 hover:bg-asaka-300/20 transition-colors text-sm font-medium"
          >
            <Globe size={16} />
            <span>Voir le Site Client</span>
          </button>
        )}
        <div className="bg-asaka-800/60 border border-asaka-700/40 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-asaka-500 to-asaka-300 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium text-white truncate">Admin</p>
            <p className="text-xs text-asaka-muted truncate">admin@asakasushi.ma</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Sidebar;

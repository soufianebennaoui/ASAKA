import React from 'react';
import { 
  Moon, 
  Calendar, 
  Target, 
  Users,
  ChevronRight
} from 'lucide-react';

const RamadanModule = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <Moon className="text-amber-500" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center">
              Ramadan Ops
              <span className="ml-3 text-xs font-semibold bg-amber-500 text-zinc-950 px-2 py-1 rounded-md">Live</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-1">Manage Iftar pre-orders and buffet scaling</p>
          </div>
        </div>
        
        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold rounded-lg transition-colors flex items-center">
          <Calendar size={16} className="mr-2" />
          Iftar Pre-Orders
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI 1 */}
        <div className="glass-panel p-6 border-amber-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={64} className="text-amber-500" />
          </div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Ramadan Revenue Target</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-amber-500">112k</span>
            <span className="text-sm text-zinc-500">/ 180k Dh</span>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800/50">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-zinc-400">Progress</span>
              <span className="text-amber-500 font-bold">62%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel p-6 relative overflow-hidden">
          <h3 className="text-sm font-medium text-zinc-400 mb-2">Peak Staffing Demand</h3>
          <div className="flex justify-between items-end mt-4">
            <div>
              <span className="text-3xl font-bold text-zinc-100">18:30</span>
              <span className="text-sm text-zinc-500 ml-2">- 21:00</span>
            </div>
            <Users size={24} className="text-zinc-500" />
          </div>
          <p className="mt-3 text-xs text-rose-400 bg-rose-400/10 inline-block px-2 py-1 rounded border border-rose-400/20">
            Alert: Need +2 Delivery Drivers today
          </p>
        </div>

        {/* Action Panel */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors">
              <span className="text-sm text-zinc-200">Toggle Ftour Menu Items</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors">
              <span className="text-sm text-zinc-200">Send WhatsApp Promo</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-6">Today's Iftar Pre-Orders (Pickup 18:00 - 18:45)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tag: 'Box Ftour Royal', count: 14, val: '2,100 Dh' },
            { tag: 'Sushi Platter (40p)', count: 8, val: '1,600 Dh' },
            { tag: 'Harira Asian Twist', count: 24, val: '840 Dh' },
            { tag: 'Nems Assortment', count: 18, val: '540 Dh' },
          ].map((item, i) => (
            <div key={i} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-4">
              <div className="text-3xl font-bold text-zinc-100 mb-1">{item.count}</div>
              <div className="text-sm font-medium text-amber-500 mb-2">{item.tag}</div>
              <div className="text-xs text-zinc-500">{item.val} projected</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RamadanModule;

import React from 'react';
import { 
  AlertTriangle, 
  Package, 
  RefreshCw,
  TrendingDown
} from 'lucide-react';

const Inventory = ({ inventoryData }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Smart Inventory</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Real-time stock tracking with auto-alerts</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-salmon-500 hover:bg-salmon-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm dark:shadow-none">
          <RefreshCw size={16} />
          <span>Sync Stock</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-rose-200 dark:border-rose-500/20 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center space-x-3 text-rose-500 dark:text-rose-400 mb-2">
            <AlertTriangle size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Critical Stock (2)</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Items below minimum threshold. Reorder required immediately.</p>
        </div>
        
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center space-x-3 text-gray-900 dark:text-zinc-100 mb-2">
            <TrendingDown size={20} className="text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-semibold">Waste Tracking</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Waste reduced by 12% this week (Saving ~450 Dh)</p>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="flex items-center space-x-3 text-gray-900 dark:text-zinc-100 mb-2">
            <Package size={20} className="text-salmon-500" />
            <h3 className="font-semibold">Supplier Orders</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">1 delivery arriving today at 15:00 from "Casa Seafoods"</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-transparent">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Core Ingredients</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-800/60 p-5">
          {inventoryData.map((item, idx) => (
            <div key={idx} className="py-4 flex items-center justify-between group">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900 dark:text-zinc-200">{item.name}</h4>
                  {item.status === 'critical' && (
                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 uppercase">
                      Critical
                    </span>
                  )}
                  {item.status === 'warning' && (
                    <span className="ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase">
                      Low
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-zinc-500 mt-1">
                  <span>Target Min: {item.min}</span>
                  <span className="mx-2">•</span>
                  <span>Cost: {item.cost} Dh / unit</span>
                </div>
              </div>

              <div className="w-64 px-4 hidden md:block">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 dark:text-zinc-400">Capacity</span>
                  <span className="text-gray-700 dark:text-zinc-300 font-medium">{Math.floor((item.stock / (item.min * 2)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      item.status === 'critical' ? 'bg-rose-500' : 
                      item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} 
                    style={{ width: `${Math.min(100, (item.stock / (item.min * 2)) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="w-24 text-right">
                <div className={`text-xl font-bold ${
                  item.status === 'critical' ? 'text-rose-500 dark:text-rose-400' : 
                  item.status === 'warning' ? 'text-amber-500 dark:text-amber-400' : 'text-gray-900 dark:text-zinc-100'
                }`}>
                  {item.stock}
                </div>
              </div>
              
              <div className="w-24 text-right ml-4">
                <button className={`px-3 py-1.5 text-xs font-semibold rounded ${
                  item.status === 'critical' 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300'
                } transition-colors`}>
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;

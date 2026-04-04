import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { time: '12:00', glovo: 1200, jumia: 800, direct: 400 },
  { time: '14:00', glovo: 2100, jumia: 1200, direct: 800 },
  { time: '16:00', glovo: 800, jumia: 500, direct: 300 },
  { time: '18:00', glovo: 1500, jumia: 900, direct: 600 },
  { time: '20:00', glovo: 3800, jumia: 2100, direct: 1200 },
  { time: '22:00', glovo: 4200, jumia: 1800, direct: 1500 },
  { time: '00:00', glovo: 1100, jumia: 600, direct: 400 },
];

const StatCard = ({ title, value, change, isPositive, icon: Icon }) => (
  <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-zinc-100">{value}</h3>
      </div>
      <div className="p-2 bg-gray-100 dark:bg-zinc-800/50 rounded-lg">
        <Icon size={20} className="text-salmon-500" />
      </div>
    </div>
    <div className={`flex items-center mt-4 text-sm ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
      {isPositive ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
      <span className="font-medium">{change}</span>
      <span className="text-gray-400 dark:text-zinc-500 ml-2">vs yesterday</span>
    </div>
  </div>
);

const Dashboard = ({ ordersData = [], customersData = [] }) => {
  // Calculate dynamic metrics
  const totalOrders = ordersData.length;
  const activeCustomers = customersData.length;
  
  // Calculate revenue by parsing "240 Dh" strings
  const totalRevenue = ordersData.reduce((sum, order) => {
    const amount = Number(order.total.replace(/[^0-9.-]+/g,""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Group by platform for market share
  const typeCounts = ordersData.reduce((acc, order) => {
    const type = order.platform || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  const glovoCount = typeCounts['Glovo'] || 0;
  const jumiaCount = typeCounts['Jumia'] || 0;
  const directCount = typeCounts['Direct'] || 0;
  
  const getPercentage = (count) => {
    if (totalOrders === 0) return 0;
    return Math.round((count / totalOrders) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Overview</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Today's metrics across all Casablanca locations</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 text-sm font-medium bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-800 dark:text-zinc-100">
            Today
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-transparent border border-transparent text-gray-500 dark:text-zinc-400 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900/50 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors">
            This Week
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`${totalRevenue.toLocaleString()} Dh`} 
          change="+12.5%" 
          isPositive={true} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Total Orders" 
          value={totalOrders} 
          change="+8.2%" 
          isPositive={true} 
          icon={ShoppingBag} 
        />
        <StatCard 
          title="Avg. Delivery Time" 
          value="28 min" 
          change="-2 min" 
          isPositive={true} 
          icon={Clock} 
        />
        <StatCard 
          title="Active Customers" 
          value={activeCustomers} 
          change="+1.2%" 
          isPositive={true} 
          icon={Users} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Revenue by Channel (Peak Hours)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlovo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffb800" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorJumia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fe4d09" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fe4d09" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="glovo" name="Glovo" stroke="#ffb800" strokeWidth={2} fillOpacity={1} fill="url(#colorGlovo)" />
                <Area type="monotone" dataKey="jumia" name="Jumia" stroke="#71717a" strokeWidth={2} fillOpacity={1} fill="url(#colorJumia)" />
                <Area type="monotone" dataKey="direct" name="Direct" stroke="#fe4d09" strokeWidth={2} fillOpacity={1} fill="url(#colorDirect)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors duration-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">Market Share (Dynamic)</h3>
          <div className="space-y-6 mt-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Glovo</span>
                <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getPercentage(glovoCount)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-[#ffb800] h-2 rounded-full transition-all duration-500" style={{ width: `${getPercentage(glovoCount)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{glovoCount} Orders today</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Jumia Food</span>
                <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getPercentage(jumiaCount)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-gray-400 dark:bg-zinc-400 h-2 rounded-full transition-all duration-500" style={{ width: `${getPercentage(jumiaCount)}%` }}></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{jumiaCount} Orders today</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Direct / Dine-in</span>
                <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{getPercentage(directCount)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-salmon-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getPercentage(directCount)}%` }}></div>
              </div>
              <p className="text-xs text-salmon-600 dark:text-salmon-400/80 mt-1">{directCount} Orders today (Optimal margin)</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">
              Target for Q3: Increase direct orders to 30% to save ~8,000 Dh/month in commissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

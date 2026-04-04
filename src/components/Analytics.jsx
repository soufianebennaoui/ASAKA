import React from 'react';
import { TrendingUp, ShoppingBag, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const weekData = [
  { day: 'Lun', orders: 42, revenue: 5800 },
  { day: 'Mar', orders: 38, revenue: 5200 },
  { day: 'Mer', orders: 55, revenue: 7400 },
  { day: 'Jeu', orders: 48, revenue: 6900 },
  { day: 'Ven', orders: 72, revenue: 9800 },
  { day: 'Sam', orders: 95, revenue: 13200 },
  { day: 'Dim', orders: 88, revenue: 12400 },
];

const categoryData = [
  { name: 'Rolls', value: 38 },
  { name: 'Sashimi', value: 20 },
  { name: 'Poke', value: 15 },
  { name: 'Platters', value: 12 },
  { name: 'Wok', value: 10 },
  { name: 'Entrées', value: 5 },
];

const Analytics = ({ ordersData = [], customersData = [] }) => {
  const totalRevenue = ordersData.reduce((sum, order) => {
    const amount = Number(order.total.replace(/[^0-9.-]+/g, ''));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const vipCount = customersData.filter(c => c.status === 'VIP').length;
  const avgOrderValue = ordersData.length > 0 ? Math.round(totalRevenue / ordersData.length) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Analytics</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Performance hebdomadaire & répartition des ventes</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenu Semaine', value: `${totalRevenue.toLocaleString()} Dh`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Commandes / 7j', value: ordersData.length, icon: ShoppingBag, color: 'text-blue-400' },
          { label: 'Panier Moyen', value: `${avgOrderValue} Dh`, icon: TrendingUp, color: 'text-amber-400' },
          { label: 'Clients VIP', value: vipCount, icon: Users, color: 'text-salmon-500' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none">
            <div className="flex items-center space-x-2 mb-2">
              <kpi.icon size={18} className={kpi.color} />
              <span className="text-xs text-gray-500 dark:text-zinc-500 font-medium">{kpi.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
        <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-5">Revenu par Jour (cette semaine)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="day" stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={v => `${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
                formatter={v => [`${v} Dh`, 'Revenu']}
              />
              <Bar dataKey="revenue" fill="#fe4d09" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders + Category side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend */}
        <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-5">Tendance Commandes</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h3 className="text-base font-semibold text-gray-900 dark:text-zinc-100 mb-5">Répartition par Catégorie</h3>
          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-xs text-gray-600 dark:text-zinc-400 mb-1">
                  <span>{cat.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-zinc-200">{cat.value}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-salmon-500 to-orange-400 h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${cat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

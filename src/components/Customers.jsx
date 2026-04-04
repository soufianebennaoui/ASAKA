import React, { useState } from 'react';
import { Filter, Users, Phone, MapPin, Search } from 'lucide-react';

const Customers = ({ customersData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customersData.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'vip': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'regular': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'new': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center">
            <Users className="mr-3 text-salmon-500" />
            Customer Directory
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage and view customer relationships</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-salmon-500 focus:border-salmon-500 outline-none text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm dark:shadow-none transition-colors duration-200"
            />
          </div>
          <button className="p-2 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0 bg-white dark:bg-transparent shadow-sm dark:shadow-none">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Customer / ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Lifetime Orders</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-zinc-200 group-hover:text-salmon-500 dark:group-hover:text-salmon-400 transition-colors">{customer.name}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">{customer.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600 dark:text-zinc-300 text-sm">
                        <Phone size={14} className="mr-2 text-gray-400 dark:text-zinc-500" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 dark:text-zinc-200 font-medium">{customer.totalOrders} Orders</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">Last: {customer.lastOrder}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-emerald-500 dark:text-emerald-400">{customer.totalSpent}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-zinc-500">
                    No customers found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Customers;

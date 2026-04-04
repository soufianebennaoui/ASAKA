import React, { useState } from 'react';
import { Filter, Users, Phone, MapPin, Search, Edit2, X } from 'lucide-react';

const Customers = ({ customersData, setCustomersData }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
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
            <Users className="mr-3 text-asaka-500" />
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
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-sm rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-asaka-500 focus:border-asaka-500 outline-none text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 shadow-sm dark:shadow-none transition-colors duration-200"
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
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-zinc-200 group-hover:text-asaka-500 dark:group-hover:text-asaka-300 transition-colors">{customer.name}</div>
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
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setEditingCustomer(customer)} className="p-2 text-gray-400 hover:text-asaka-500 transition-colors bg-gray-100 dark:bg-zinc-800 rounded-lg">
                        <Edit2 size={16} />
                      </button>
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

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-zinc-100">Edit Customer Info</h3>
              <button onClick={() => setEditingCustomer(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-zinc-100">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setCustomersData(customersData.map(c => c.id === editingCustomer.id ? editingCustomer : c));
              setEditingCustomer(null);
            }} className="p-6 space-y-4 text-sm text-gray-700 dark:text-zinc-300">
              <div>
                <label className="block mb-1.5 font-semibold text-gray-900 dark:text-zinc-100">Name</label>
                <input type="text" value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-asaka-500 outline-none" required />
              </div>
              <div>
                <label className="block mb-1.5 font-semibold text-gray-900 dark:text-zinc-100">Email</label>
                <input type="email" value={editingCustomer.email} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-asaka-500 outline-none" />
              </div>
              <div>
                <label className="block mb-1.5 font-semibold text-gray-900 dark:text-zinc-100">Phone</label>
                <input type="text" value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-asaka-500 outline-none" />
              </div>
              <div>
                <label className="block mb-1.5 font-semibold text-gray-900 dark:text-zinc-100">Password (Reset)</label>
                <input type="text" value={editingCustomer.password} onChange={e => setEditingCustomer({...editingCustomer, password: e.target.value})} placeholder="Reset new password" className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-asaka-500 outline-none" />
              </div>
              <div>
                <label className="block mb-1.5 font-semibold text-gray-900 dark:text-zinc-100">Location (Main Address)</label>
                <input type="text" value={editingCustomer.savedAddresses?.[0]?.street || ''} onChange={e => setEditingCustomer({...editingCustomer, savedAddresses: [{...editingCustomer.savedAddresses?.[0], street: e.target.value}]})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-lg p-2.5 focus:ring-1 focus:ring-asaka-500 outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingCustomer(null)} className="flex-1 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 font-semibold transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-asaka-500 hover:bg-asaka-600 text-white rounded-lg font-bold transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

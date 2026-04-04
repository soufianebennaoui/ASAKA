import React, { useState } from 'react';
import { Database, Plus, Save, Trash2, Edit2, X, Package, ShoppingBag, Users } from 'lucide-react';

const AdminDatabase = ({ 
  inventoryData, setInventoryData,
  ordersData, setOrdersData,
  customersData, setCustomersData
}) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({});

  // Reset forms when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
    setAddForm({});
  };

  // --- INVENTORY LOGIC ---
  const getInventoryStatus = (stock, min) => {
    if (stock <= min * 0.5) return 'critical';
    if (stock <= min) return 'warning';
    return 'good';
  };

  const saveInventoryEdit = (index) => {
    const newData = [...inventoryData];
    newData[index] = {
      ...editForm,
      stock: Number(editForm.stock),
      min: Number(editForm.min),
      cost: Number(editForm.cost),
      status: getInventoryStatus(Number(editForm.stock), Number(editForm.min))
    };
    setInventoryData(newData);
    setEditingId(null);
  };

  const saveNewInventory = () => {
    if (!addForm.name) return alert('Name required');
    setInventoryData([...inventoryData, {
      ...addForm,
      stock: Number(addForm.stock || 0),
      min: Number(addForm.min || 0),
      cost: Number(addForm.cost || 0),
      status: getInventoryStatus(Number(addForm.stock || 0), Number(addForm.min || 0))
    }]);
    setIsAdding(false);
    setAddForm({});
  };

  // --- ORDERS LOGIC ---
  const saveOrderEdit = (index) => {
    const newData = [...ordersData];
    newData[index] = { ...editForm };
    setOrdersData(newData);
    setEditingId(null);
  };

  const saveNewOrder = () => {
    if (!addForm.id || !addForm.customer) return alert('ID and Customer required');
    setOrdersData([{
      id: addForm.id,
      customer: addForm.customer,
      items: addForm.items || '',
      total: addForm.total || '0 Dh',
      status: addForm.status || 'new',
      platform: addForm.platform || 'Direct',
      time: 'Just now',
      location: addForm.location || ''
    }, ...ordersData]);
    setIsAdding(false);
    setAddForm({});
  };

  // --- CUSTOMERS LOGIC ---
  const saveCustomerEdit = (index) => {
    const newData = [...customersData];
    newData[index] = { ...editForm, totalOrders: Number(editForm.totalOrders) };
    setCustomersData(newData);
    setEditingId(null);
  };

  const saveNewCustomer = () => {
    if (!addForm.id || !addForm.name) return alert('ID and Name required');
    setCustomersData([...customersData, {
      id: addForm.id,
      name: addForm.name,
      phone: addForm.phone || '',
      totalOrders: Number(addForm.totalOrders || 0),
      totalSpent: addForm.totalSpent || '0 Dh',
      status: addForm.status || 'New',
      lastOrder: 'Never'
    }]);
    setIsAdding(false);
    setAddForm({});
  };

  // --- SHARED LOGIC ---
  const startEdit = (item, index) => {
    setEditingId(index);
    setEditForm({ ...item });
  };

  const deleteItem = (dataArray, setData, index) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const newData = [...dataArray];
      newData.splice(index, 1);
      setData(newData);
    }
  };

  // --- RENDERERS ---
  const renderInventoryTable = () => (
    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
      <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
        <tr className="border-b border-gray-200 dark:border-zinc-800">
          <th className="px-6 py-3">Ingredient</th>
          <th className="px-6 py-3">Stock</th>
          <th className="px-6 py-3">Min</th>
          <th className="px-6 py-3">Cost (Dh)</th>
          <th className="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
        {isAdding && (
          <tr className="bg-gray-50 dark:bg-zinc-800/30">
            <td className="px-6 py-3"><input type="text" placeholder="Name" onChange={e => setAddForm({...addForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 focus:outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="number" placeholder="Stock" onChange={e => setAddForm({...addForm, stock: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 focus:outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="number" placeholder="Min" onChange={e => setAddForm({...addForm, min: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 focus:outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="number" placeholder="Cost" onChange={e => setAddForm({...addForm, cost: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 focus:outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3 text-right">
              <button onClick={saveNewInventory} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
            </td>
          </tr>
        )}
        {inventoryData.map((item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
            {editingId === idx ? (
              <>
                <td className="px-6 py-3"><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="number" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="number" value={editForm.min} onChange={e => setEditForm({...editForm, min: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="number" value={editForm.cost} onChange={e => setEditForm({...editForm, cost: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => saveInventoryEdit(idx)} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
                </td>
              </>
            ) : (
              <>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-zinc-100">{item.name}</td>
                <td className={`px-6 py-3 font-semibold ${item.status === 'critical' ? 'text-rose-500 dark:text-rose-400' : item.status === 'warning' ? 'text-amber-500 dark:text-amber-400' : 'text-gray-700 dark:text-zinc-300'}`}>{item.stock}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400">{item.min}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400">{item.cost}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => startEdit(item, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-salmon-500 dark:hover:text-salmon-400 mr-3 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem(inventoryData, setInventoryData, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderOrdersTable = () => (
    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
      <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
        <tr className="border-b border-gray-200 dark:border-zinc-800">
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Customer</th>
          <th className="px-6 py-3">Platform</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
        {isAdding && (
          <tr className="bg-gray-50 dark:bg-zinc-800/30">
            <td className="px-6 py-3"><input type="text" placeholder="#ID" onChange={e => setAddForm({...addForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-16 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="text" placeholder="Customer" onChange={e => setAddForm({...addForm, customer: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3">
              <select onChange={e => setAddForm({...addForm, platform: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                <option value="Direct">Direct</option>
                <option value="Glovo">Glovo</option>
                <option value="Jumia">Jumia</option>
              </select>
            </td>
            <td className="px-6 py-3">
              <select onChange={e => setAddForm({...addForm, status: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                <option value="new">New</option>
                <option value="prep">Prep</option>
                <option value="ready">Ready</option>
                <option value="delivering">Delivering</option>
              </select>
            </td>
            <td className="px-6 py-3 text-right">
              <button onClick={saveNewOrder} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
            </td>
          </tr>
        )}
        {ordersData.map((item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
            {editingId === idx ? (
              <>
                <td className="px-6 py-3"><input type="text" value={editForm.id} onChange={e => setEditForm({...editForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-16 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="text" value={editForm.customer} onChange={e => setEditForm({...editForm, customer: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3">
                  <select value={editForm.platform} onChange={e => setEditForm({...editForm, platform: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                    <option value="Direct">Direct</option>
                    <option value="Glovo">Glovo</option>
                    <option value="Jumia">Jumia</option>
                  </select>
                </td>
                <td className="px-6 py-3">
                  <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                    <option value="new">New</option>
                    <option value="prep">Prep</option>
                    <option value="ready">Ready</option>
                    <option value="delivering">Delivering</option>
                  </select>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => saveOrderEdit(idx)} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
                </td>
              </>
            ) : (
              <>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-zinc-100">{item.id}</td>
                <td className="px-6 py-3 text-gray-800 dark:text-zinc-300">{item.customer}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400">{item.platform}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400 capitalize">{item.status}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => startEdit(item, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-salmon-500 dark:hover:text-salmon-400 mr-3 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem(ordersData, setOrdersData, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderCustomersTable = () => (
    <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
      <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
        <tr className="border-b border-gray-200 dark:border-zinc-800">
          <th className="px-6 py-3">ID</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Phone</th>
          <th className="px-6 py-3">Orders</th>
          <th className="px-6 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
        {isAdding && (
          <tr className="bg-gray-50 dark:bg-zinc-800/30">
            <td className="px-6 py-3"><input type="text" placeholder="ID" onChange={e => setAddForm({...addForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="text" placeholder="Name" onChange={e => setAddForm({...addForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="text" placeholder="Phone" onChange={e => setAddForm({...addForm, phone: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3"><input type="number" placeholder="Orders" onChange={e => setAddForm({...addForm, totalOrders: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
            <td className="px-6 py-3 text-right">
              <button onClick={saveNewCustomer} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
            </td>
          </tr>
        )}
        {customersData.map((item, idx) => (
          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
            {editingId === idx ? (
              <>
                <td className="px-6 py-3"><input type="text" value={editForm.id} onChange={e => setEditForm({...editForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3"><input type="number" value={editForm.totalOrders} onChange={e => setEditForm({...editForm, totalOrders: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500" /></td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => saveCustomerEdit(idx)} className="text-emerald-500 dark:text-emerald-400 mr-2"><Save size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
                </td>
              </>
            ) : (
              <>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-zinc-100">{item.id}</td>
                <td className="px-6 py-3 text-gray-800 dark:text-zinc-300">{item.name}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400">{item.phone}</td>
                <td className="px-6 py-3 text-gray-600 dark:text-zinc-400">{item.totalOrders}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => startEdit(item, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-salmon-500 dark:hover:text-salmon-400 mr-3 transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => deleteItem(customersData, setCustomersData, idx)} className="text-gray-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center">
            <Database className="mr-3 text-salmon-500" />
            Central Database
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage all system mock data in one place</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-salmon-500 hover:bg-salmon-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm dark:shadow-none"
          disabled={isAdding}
        >
          <Plus size={16} />
          <span>Add Record</span>
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => handleTabChange('inventory')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'inventory' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <Package size={16} />
          <span>Inventory DB</span>
        </button>
        <button 
          onClick={() => handleTabChange('orders')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'orders' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <ShoppingBag size={16} />
          <span>Orders DB</span>
        </button>
        <button 
          onClick={() => handleTabChange('customers')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'customers' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <Users size={16} />
          <span>Customers DB</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex justify-between items-center transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {activeTab === 'inventory' && 'Inventory Items'}
            {activeTab === 'orders' && 'Live Orders'}
            {activeTab === 'customers' && 'Customer Profiles'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-zinc-500">
            {activeTab === 'inventory' && inventoryData.length}
            {activeTab === 'orders' && ordersData.length}
            {activeTab === 'customers' && customersData.length} records
          </span>
        </div>
        
        <div className="overflow-x-auto">
          {activeTab === 'inventory' && renderInventoryTable()}
          {activeTab === 'orders' && renderOrdersTable()}
          {activeTab === 'customers' && renderCustomersTable()}
        </div>
      </div>
    </div>
  );
};

export default AdminDatabase;

import React, { useState } from 'react';
import { Settings as SettingsIcon, Users, UserPlus, Edit2, Trash2, Save, X, Shield } from 'lucide-react';

const Settings = ({ usersData, setUsersData }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    role: 'Staff',
    status: 'Active'
  });

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
      case 'Manager': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      default: return 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ ...user });
  };

  const saveEdit = (id) => {
    setUsersData(usersData.map(u => u.id === id ? { ...editForm, id } : u));
    setEditingId(null);
  };

  const deleteUser = (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsersData(usersData.filter(u => u.id !== id));
    }
  };

  const saveNewUser = () => {
    if (!addForm.name || !addForm.email) return alert('Name and Email required');
    const newId = `USR-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    setUsersData([...usersData, {
      ...addForm,
      id: newId,
      lastLogin: 'Never'
    }]);
    setIsAdding(false);
    setAddForm({ role: 'Staff', status: 'Active' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">System Settings</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage users, preferences, and integrations</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'users' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <Users size={16} />
          <span>User Management</span>
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'general' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <SettingsIcon size={16} />
          <span>General Preferences</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
          <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-transparent flex justify-between items-center transition-colors">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 flex items-center">
              <Shield className="mr-2 text-salmon-500" size={18} />
              Access Control
            </h3>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium rounded transition-colors shadow-sm dark:shadow-none"
              disabled={isAdding}
            >
              <UserPlus size={16} />
              <span>Invite User</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
              <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
                <tr className="border-b border-gray-200 dark:border-zinc-800">
                  <th className="px-6 py-3">Name / Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Last Login</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
                {isAdding && (
                  <tr className="bg-gray-50 dark:bg-zinc-800/30">
                    <td className="px-6 py-3">
                      <input type="text" placeholder="Full Name" onChange={e => setAddForm({...addForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 mb-2 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 block" />
                      <input type="email" placeholder="Email Address" onChange={e => setAddForm({...addForm, email: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 block" />
                    </td>
                    <td className="px-6 py-3">
                      <select onChange={e => setAddForm({...addForm, role: e.target.value})} defaultValue="Staff" className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <select onChange={e => setAddForm({...addForm, status: e.target.value})} defaultValue="Active" className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-3 text-gray-400 dark:text-zinc-500 align-middle">
                      Pending
                    </td>
                    <td className="px-6 py-3 text-right align-middle">
                      <button onClick={saveNewUser} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
                      <button onClick={() => setIsAdding(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
                    </td>
                  </tr>
                )}
                
                {usersData.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
                    {editingId === user.id ? (
                      <>
                        <td className="px-6 py-3">
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 mb-2 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 block" />
                          <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 block" />
                        </td>
                        <td className="px-6 py-3">
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Staff">Staff</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-zinc-400 align-middle">{user.lastLogin}</td>
                        <td className="px-6 py-3 text-right align-middle">
                          <button onClick={() => saveEdit(user.id)} className="text-emerald-500 dark:text-emerald-400 mr-2 hover:opacity-80"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300"><X size={16} /></button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900 dark:text-zinc-100">{user.name}</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{user.email}</div>
                        </td>
                        <td className="px-6 py-3 align-middle">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 align-middle">
                          <span className={`inline-flex items-center space-x-1.5 ${user.status === 'Active' ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-zinc-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-gray-400 dark:bg-zinc-500'}`}></span>
                            <span>{user.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 dark:text-zinc-400 align-middle">{user.lastLogin}</td>
                        <td className="px-6 py-3 text-right align-middle">
                          {user.role !== 'Admin' || usersData.filter(u => u.role === 'Admin').length > 1 ? (
                            <>
                              <button onClick={() => startEdit(user)} className="text-gray-400 dark:text-zinc-500 hover:text-salmon-500 dark:hover:text-salmon-400 mr-3 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => deleteUser(user.id)} className="text-gray-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-zinc-500 italic">Primary Admin</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors duration-200">
            <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Store Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Store Name</label>
                <input type="text" defaultValue="Salmon Sushi - Sidi Maarouf" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded px-3 py-2 text-sm outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1">Contact Phone</label>
                <input type="text" defaultValue="+212 522 00 00 00" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded px-3 py-2 text-sm outline-none focus:border-salmon-500 focus:ring-1 focus:ring-salmon-500 transition-colors" />
              </div>
              <button className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded text-sm font-medium hover:bg-zinc-800 dark:hover:bg-white transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

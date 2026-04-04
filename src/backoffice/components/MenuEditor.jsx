import React, { useState } from 'react';
import { Edit3, Plus, Save, Trash2, X, UtensilsCrossed, FolderTree, Upload } from 'lucide-react';

const MenuEditor = ({
  menuItems, setMenuItems,
  categories, setCategories
}) => {
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'categories'
  
  // States for Categories
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState({});
  const [isAddingCat, setIsAddingCat] = useState(false);

  // States for Items
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({});
  const [isAddingItem, setIsAddingItem] = useState(false);

  /* --- CATEGORIES LOGIC --- */
  const saveCatEdit = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...catForm, id } : c));
    setEditingCatId(null);
  };

  const saveNewCat = () => {
    if (!catForm.id || !catForm.name) return alert('L\'identifiant et le nom sont requis');
    if (categories.find(c => c.id === catForm.id)) return alert('Cet identifiant existe déjà');
    setCategories([...categories, { ...catForm, image: catForm.image || '' }]);
    setIsAddingCat(false);
    setCatForm({});
  };

  const deleteCat = (id) => {
    if (window.confirm('Voulez-vous supprimer cette catégorie ?')) {
      setCategories(categories.filter(c => c.id !== id));
      // Optional: Cascade delete items or reassign them
    }
  };

  /* --- ITEMS LOGIC --- */
  const saveItemEdit = (id) => {
    setMenuItems(menuItems.map(m => m.id === id ? { ...itemForm, id, price: Number(itemForm.price) } : m));
    setEditingItemId(null);
  };

  const saveNewItem = () => {
    if (!itemForm.id || !itemForm.name || !itemForm.price) return alert('ID, Nom et Prix sont obligatoires');
    if (menuItems.find(m => m.id === itemForm.id)) return alert('Cet identifiant existe déjà');
    
    setMenuItems([{
      ...itemForm,
      price: Number(itemForm.price),
      image: itemForm.image || '',
      description: itemForm.description || '',
      pieces: itemForm.pieces ? Number(itemForm.pieces) : null,
      isPopular: Boolean(itemForm.isPopular),
      isSignature: Boolean(itemForm.isSignature)
    }, ...menuItems]);
    setIsAddingItem(false);
    setItemForm({});
  };

  const deleteItem = (id) => {
    if (window.confirm('Voulez-vous supprimer cet article ?')) {
      setMenuItems(menuItems.filter(m => m.id !== id));
    }
  };

  /* --- IMAGE COMPRESSION & UPLOAD --- */
  const handleImageUpload = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
    };
  };

  const FileUploader = ({ onChange, currentImage }) => (
    <div className="flex flex-col items-center gap-2">
      {currentImage && (
        <img src={currentImage} alt="preview" className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-zinc-700" />
      )}
      <label className="cursor-pointer bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-xs px-2 py-1.5 rounded shadow-sm hover:bg-gray-50 flex items-center gap-1.5 text-gray-700 dark:text-zinc-300 transition-colors">
        <Upload size={14} />
        <span className="font-medium">Choisir</span>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files[0];
            handleImageUpload(file, onChange);
          }} 
        />
      </label>
    </div>
  );

  /* --- RENDERERS --- */
  const renderCategoriesTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
        <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
          <tr className="border-b border-gray-200 dark:border-zinc-800">
            <th className="px-6 py-3">Image URL</th>
            <th className="px-6 py-3">Identifiant (ID)</th>
            <th className="px-6 py-3">Nom</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
          {isAddingCat && (
            <tr className="bg-gray-50 dark:bg-zinc-800/30">
              <td className="px-6 py-3">
                <FileUploader onChange={(dataUrl) => setCatForm({...catForm, image: dataUrl})} currentImage={catForm.image} />
              </td>
              <td className="px-6 py-3">
                <input type="text" placeholder="id-unique" onChange={e => setCatForm({...catForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none" />
              </td>
              <td className="px-6 py-3">
                <input type="text" placeholder="Nom de Catégorie" onChange={e => setCatForm({...catForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none" />
              </td>
              <td className="px-6 py-3 text-right">
                <button onClick={saveNewCat} className="text-emerald-500 dark:text-emerald-400 mr-2"><Save size={16} /></button>
                <button onClick={() => setIsAddingCat(false)} className="text-gray-400 dark:text-zinc-500"><X size={16} /></button>
              </td>
            </tr>
          )}
          {categories.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
              {editingCatId === c.id ? (
                <>
                  <td className="px-6 py-3">
                    <FileUploader onChange={(dataUrl) => setCatForm({...catForm, image: dataUrl})} currentImage={catForm.image} />
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-zinc-100">{c.id}</td>
                  <td className="px-6 py-3"><input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none" /></td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => saveCatEdit(c.id)} className="text-emerald-500 dark:text-emerald-400 mr-2"><Save size={16} /></button>
                    <button onClick={() => setEditingCatId(null)} className="text-gray-400 dark:text-zinc-500"><X size={16} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-3">
                    {c.image ? <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-zinc-700" /> : <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xs text-gray-400">Vide</div>}
                  </td>
                  <td className="px-6 py-3 text-gray-800 dark:text-zinc-300">{c.id}</td>
                  <td className="px-6 py-3 font-bold text-gray-900 dark:text-zinc-100">{c.name}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => { setEditingCatId(c.id); setCatForm({...c}); }} className="text-gray-400 hover:text-asaka-500 mr-3"><Edit3 size={16} /></button>
                    <button onClick={() => deleteCat(c.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderItemsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-600 dark:text-zinc-400">
        <thead className="text-xs text-gray-500 dark:text-zinc-500 uppercase bg-gray-50 dark:bg-zinc-800/50">
          <tr className="border-b border-gray-200 dark:border-zinc-800">
            <th className="px-4 py-3">Image URL</th>
            <th className="px-4 py-3">ID / Nom</th>
            <th className="px-4 py-3">Catégorie</th>
            <th className="px-4 py-3">Prix</th>
            <th className="px-4 py-3">Options</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/60">
          {isAddingItem && (
            <tr className="bg-gray-50 dark:bg-zinc-800/30">
              <td className="px-4 py-3">
                <FileUploader onChange={(dataUrl) => setItemForm({...itemForm, image: dataUrl})} currentImage={itemForm.image} />
              </td>
              <td className="px-4 py-3">
                <input type="text" placeholder="ID Unique" onChange={e => setItemForm({...itemForm, id: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 mb-1 outline-none" />
                <input type="text" placeholder="Nom Complet" onChange={e => setItemForm({...itemForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none" />
              </td>
              <td className="px-4 py-3">
                <select onChange={e => setItemForm({...itemForm, category: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none w-full">
                  <option value="">-- Choisir --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td className="px-4 py-3">
                <input type="number" placeholder="Prix" onChange={e => setItemForm({...itemForm, price: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none" />
              </td>
              <td className="px-4 py-3 flex space-x-2">
                 <label className="flex items-center text-xs space-x-1 cursor-pointer"><input type="checkbox" onChange={e => setItemForm({...itemForm, isPopular: e.target.checked})} /><span>Populaire</span></label>
                 <label className="flex items-center text-xs space-x-1 cursor-pointer"><input type="checkbox" onChange={e => setItemForm({...itemForm, isSignature: e.target.checked})} /><span>Signature</span></label>
              </td>
              <td className="px-4 py-3 text-right">
                <button onClick={saveNewItem} className="text-emerald-500 dark:text-emerald-400 mr-2"><Save size={16} /></button>
                <button onClick={() => setIsAddingItem(false)} className="text-gray-400 dark:text-zinc-500"><X size={16} /></button>
              </td>
            </tr>
          )}
          {menuItems.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors">
              {editingItemId === m.id ? (
                <>
                  <td className="px-4 py-3">
                    <FileUploader onChange={(dataUrl) => setItemForm({...itemForm, image: dataUrl})} currentImage={itemForm.image} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-[10px] text-gray-500">{m.id}</div>
                    <input type="text" value={itemForm.name || ''} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-full p-1.5 outline-none" />
                  </td>
                  <td className="px-4 py-3">
                    <select value={itemForm.category || ''} onChange={e => setItemForm({...itemForm, category: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded p-1.5 outline-none w-full">
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><input type="number" value={itemForm.price || ''} onChange={e => setItemForm({...itemForm, price: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 rounded w-20 p-1.5 outline-none" /></td>
                  <td className="px-4 py-3 flex flex-col space-y-1">
                     <label className="flex items-center text-xs space-x-1 cursor-pointer"><input type="checkbox" checked={itemForm.isPopular || false} onChange={e => setItemForm({...itemForm, isPopular: e.target.checked})} /><span>Populaire</span></label>
                     <label className="flex items-center text-xs space-x-1 cursor-pointer"><input type="checkbox" checked={itemForm.isSignature || false} onChange={e => setItemForm({...itemForm, isSignature: e.target.checked})} /><span>Signature</span></label>
                     <input type="number" placeholder="Pièces (ex: 6)" value={itemForm.pieces || ''} onChange={e => setItemForm({...itemForm, pieces: e.target.value})} className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded w-full p-1 mt-1 text-[10px]" />
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    <button onClick={() => saveItemEdit(m.id)} className="text-emerald-500 dark:text-emerald-400 mr-2 mt-1"><Save size={16} /></button>
                    <button onClick={() => setEditingItemId(null)} className="text-gray-400 dark:text-zinc-500 mt-1"><X size={16} /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3">
                    {m.image ? <img src={m.image} alt={m.name} className="w-10 h-10 object-cover rounded-md border border-gray-200 dark:border-zinc-700" /> : <div className="w-10 h-10 rounded-md bg-gray-200 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-xs text-gray-400">Vide</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900 dark:text-zinc-100">{m.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{m.id}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-zinc-400 text-xs">
                    {categories.find(c => c.id === m.category)?.name || m.category}
                  </td>
                  <td className="px-4 py-3 font-bold text-asaka-500">{m.price} DH</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {m.isPopular && <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] px-1.5 py-0.5 rounded">Populaire</span>}
                      {m.isSignature && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-1.5 py-0.5 rounded">Signature</span>}
                      {m.pieces && <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] px-1.5 py-0.5 rounded">{m.pieces} pcs</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditingItemId(m.id); setItemForm({...m}); }} className="text-gray-400 hover:text-asaka-500 mr-3"><Edit3 size={16} /></button>
                    <button onClick={() => deleteItem(m.id)} className="text-gray-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 flex items-center">
            <Edit3 className="mr-3 text-asaka-500" />
            Éditer le Menu
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Créez, modifiez ou supprimez vos produits et catégories</p>
        </div>
        <button 
          onClick={() => activeTab === 'items' ? setIsAddingItem(true) : setIsAddingCat(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-asaka-500 hover:bg-asaka-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm dark:shadow-none"
        >
          <Plus size={16} />
          <span>Ajouter {activeTab === 'items' ? 'Article' : 'Catégorie'}</span>
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'items' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <UtensilsCrossed size={16} />
          <span>Articles du Menu</span>
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium border rounded-md transition-all ${
            activeTab === 'categories' ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 shadow-sm' : 'border-transparent text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-300'
          }`}
        >
          <FolderTree size={16} />
          <span>Catégories</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex justify-between items-center transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {activeTab === 'items' ? 'Liste des Articles' : 'Liste des Catégories'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-zinc-500">
            {activeTab === 'items' ? menuItems.length : categories.length} éléments
          </span>
        </div>
        
        {activeTab === 'items' ? renderItemsTable() : renderCategoriesTable()}
      </div>
    </div>
  );
};

export default MenuEditor;

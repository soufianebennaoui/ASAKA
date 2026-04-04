import React, { useState } from 'react';
import { Star, Plus, Trash2, Eye, EyeOff, Edit3, Check, X } from 'lucide-react';

const Stars = ({ count = 5, size = 14 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i < count ? '#f59e0b' : 'none'} stroke={i < count ? '#f59e0b' : '#475569'}
        strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
      </svg>
    ))}
  </div>
);

const emptyForm = { name: '', stars: 5, text: '', date: "Aujourd'hui", published: true, images: [] };

export default function Avis({ avisData = [], setAvisData }) {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState(emptyForm);

  const published = avisData.filter(a => a.published).length;

  // ── helpers ────────────────────────────────────────────────
  const openAdd  = () => { setForm(emptyForm); setEditId(null); setShowAdd(true); };
  const openEdit = (a) => { setForm({ ...a }); setEditId(a.id); setShowAdd(true); };
  const closeForm = () => { setShowAdd(false); setEditId(null); };

  const save = () => {
    if (!form.name.trim() || !form.text.trim()) return;
    if (editId !== null) {
      setAvisData(prev => prev.map(a => a.id === editId ? { ...form, id: editId } : a));
    } else {
      setAvisData(prev => [...prev, { ...form, id: Date.now() }]);
    }
    closeForm();
  };

  const remove  = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      setAvisData(prev => prev.filter(a => a.id !== id));
    }
  };
  const toggle  = (id) => setAvisData(prev => prev.map(a => a.id === id ? { ...a, published: !a.published } : a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Avis Clients</h1>
          <p className="text-asaka-muted text-sm mt-1">
            {avisData.length} avis · <span className="text-green-400">{published} publiés</span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-asaka-500 hover:bg-asaka-400 text-white rounded-xl font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Ajouter un avis
        </button>
      </div>

      {/* Add / Edit form */}
      {showAdd && (
        <div className="bg-asaka-800/60 border border-asaka-700/50 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-base">
            {editId !== null ? 'Modifier l\'avis' : 'Nouvel avis'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs text-asaka-muted font-semibold uppercase tracking-wider block mb-1">Nom du client</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Youssef B."
                className="w-full bg-asaka-900 border border-asaka-700/50 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-asaka-300/60 transition-colors placeholder:text-asaka-muted"
              />
            </div>
            {/* Date */}
            <div>
              <label className="text-xs text-asaka-muted font-semibold uppercase tracking-wider block mb-1">Date</label>
              <input
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                placeholder="Il y a 2 jours"
                className="w-full bg-asaka-900 border border-asaka-700/50 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-asaka-300/60 transition-colors placeholder:text-asaka-muted"
              />
            </div>
            {/* Stars */}
            <div>
              <label className="text-xs text-asaka-muted font-semibold uppercase tracking-wider block mb-1">Note</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, stars: s }))}>
                    <svg width={22} height={22} viewBox="0 0 24 24"
                      fill={s <= form.stars ? '#f59e0b' : 'none'}
                      stroke={s <= form.stars ? '#f59e0b' : '#475569'} strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-xs text-asaka-muted font-semibold uppercase tracking-wider block mb-1">Commentaire</label>
            <textarea
              rows={3}
              value={form.text}
              onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
              placeholder="Commentaire du client..."
              className="w-full bg-asaka-900 border border-asaka-700/50 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-asaka-300/60 transition-colors resize-none placeholder:text-asaka-muted"
            />
          </div>

          {/* Images (during edit) */}
          {form.images?.length > 0 && (
            <div>
              <label className="text-xs text-asaka-muted font-semibold uppercase tracking-wider block mb-2">Photos jointes</label>
              <div className="flex gap-2">
                {form.images.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 group">
                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-asaka-600/40" />
                    <button onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                        items-center justify-center text-white text-xs font-bold leading-none
                        hidden group-hover:flex shadow-lg" title="Supprimer l'image">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${form.published ? 'bg-asaka-500' : 'bg-asaka-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.published ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-white">Publier sur le site</span>
          </label>

          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-asaka-500 hover:bg-asaka-400 text-white rounded-xl text-sm font-semibold transition-colors">
              <Check size={15} /> Enregistrer
            </button>
            <button onClick={closeForm} className="flex items-center gap-2 px-4 py-2 bg-asaka-700/60 hover:bg-asaka-700 text-asaka-muted hover:text-white rounded-xl text-sm font-semibold transition-colors">
              <X size={15} /> Annuler
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {avisData.length === 0 && !showAdd && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⭐</div>
          <p className="text-white font-bold text-lg">Aucun avis</p>
          <p className="text-asaka-muted text-sm mt-1 mb-6">Ajoutez des avis clients à afficher sur le site.</p>
          <button onClick={openAdd} className="px-5 py-2.5 bg-asaka-500 hover:bg-asaka-400 text-white rounded-xl font-semibold text-sm transition-colors">
            Ajouter le premier avis
          </button>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {avisData.map(avis => (
          <div
            key={avis.id}
            className={`bg-asaka-800/40 border rounded-2xl p-5 transition-all ${avis.published ? 'border-asaka-700/40' : 'border-asaka-700/20 opacity-60'}`}
          >
            <div className="flex items-start justify-between gap-3">
              {/* Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-asaka-600 to-asaka-300 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {avis.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-bold text-sm">{avis.name}</span>
                    {avis.published
                      ? <span className="text-[10px] text-green-400 font-semibold">● Publié</span>
                      : <span className="text-[10px] text-asaka-muted font-semibold">○ Masqué</span>
                    }
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars count={avis.stars} size={11} />
                    <span className="text-asaka-muted text-xs">{avis.date}</span>
                  </div>
                  <p className="text-asaka-muted text-sm mt-2 leading-relaxed line-clamp-2">{avis.text}</p>
                  
                  {/* Attached Images */}
                  {avis.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {avis.images.map((src, i) => (
                        <a key={i} href={src} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition-opacity">
                          <img src={src} alt="" className="w-12 h-12 object-cover rounded-lg border border-asaka-700/50" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => toggle(avis.id)}
                  title={avis.published ? 'Masquer' : 'Publier'}
                  className="p-2 rounded-xl text-asaka-muted hover:text-white hover:bg-asaka-700/60 transition-colors"
                >
                  {avis.published ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => openEdit(avis)}
                  className="p-2 rounded-xl text-asaka-muted hover:text-asaka-300 hover:bg-asaka-700/60 transition-colors"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => remove(avis.id)}
                  className="p-2 rounded-xl text-asaka-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

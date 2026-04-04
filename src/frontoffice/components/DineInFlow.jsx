import React, { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';

// DineInFlow is now just a table-selection step.
// After confirming: sets orderMode='dine-in', saves tableNumber,
// then goes to checkout (if cart has items) or menu (to browse first).

const DineInFlow = ({
  tableNumber,
  setTableNumber,
  setOrderMode,
  cartCount = 0,
  navigate,
  isLight = false,
  language = 'fr',
}) => {
  const t = (fr, en, ar) => language === 'ar' ? ar : language === 'en' ? en : fr;
  const [selected, setSelected] = useState(tableNumber || '');
  const tables = Array.from({ length: 20 }, (_, i) => String(i + 1));

  const confirm = () => {
    if (!selected.trim()) return;
    setTableNumber(selected.trim());
    setOrderMode('dine-in');
    // If cart already has items → go straight to checkout; else browse menu first
    navigate(cartCount > 0 ? 'checkout' : 'menu');
  };

  const textPrimary   = isLight ? 'text-gray-900'   : 'text-white';
  const textMuted     = isLight ? 'text-gray-500'   : 'text-zinc-400';
  const faintText     = isLight ? 'text-gray-400'   : 'text-zinc-600';
  const divider       = isLight ? 'bg-gray-200'     : 'bg-white/10';
  const tableInactive = isLight
    ? 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
    : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-orange-500/30';
  const inputCls = isLight
    ? 'w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-orange-400 rounded-xl text-gray-900 placeholder:text-gray-400 outline-none text-sm text-center transition-all'
    : 'w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-orange-500/50 rounded-xl text-white placeholder:text-zinc-600 outline-none text-sm text-center transition-all';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center">

        <div className="w-20 h-20 rounded-3xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mx-auto mb-6">
          <MapPin size={36} className="text-orange-400" />
        </div>

        <h1 className={`text-3xl font-extrabold mb-2 ${textPrimary}`}>
          {t('Votre Table ?', 'Your Table?', 'طاولتك؟')}
        </h1>
        <p className={`text-sm mb-8 ${textMuted}`}>
          {t(
            'Sélectionnez votre table pour commander directement depuis votre place.',
            'Select your table to order directly from your seat.',
            'اختر طاولتك للطلب مباشرة من مكانك.'
          )}
        </p>

        {/* Table grid */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {tables.map(t => (
            <button
              key={t}
              onClick={() => setSelected(t)}
              className={`h-11 rounded-xl font-bold text-sm transition-all ${
                selected === t
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 scale-105'
                  : tableInactive
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`flex-1 h-px ${divider}`} />
          <span className={`text-xs flex-shrink-0 ${faintText}`}>
            {t('ou entrez manuellement', 'or type it', 'أو اكتبه يدوياً')}
          </span>
          <div className={`flex-1 h-px ${divider}`} />
        </div>
        <input
          type="text"
          placeholder={t('Numéro de table...', 'Table number...', 'رقم الطاولة...')}
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className={`${inputCls} mb-6`}
          onKeyDown={e => e.key === 'Enter' && confirm()}
        />

        <button
          onClick={confirm}
          disabled={!selected.trim()}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center space-x-2"
        >
          <span>
            {selected.trim()
              ? t(`Table ${selected} — Continuer`, `Table ${selected} — Continue`, `طاولة ${selected} — استمرار`)
              : t('Choisissez une table', 'Choose a table', 'اختر طاولة')}
          </span>
          <ArrowRight size={18} />
        </button>

        {cartCount > 0 && (
          <p className={`text-xs mt-3 ${faintText}`}>
            {t(
              `Vous avez ${cartCount} article(s) dans votre panier — vous serez redirigé vers la caisse.`,
              `You have ${cartCount} item(s) in your cart — you'll go straight to checkout.`,
              `لديك ${cartCount} عنصر في سلتك — ستنتقل مباشرة للدفع.`
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default DineInFlow;

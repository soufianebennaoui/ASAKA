// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — CustomerProfile  (v2)
//  • 2 tabs: Fidélité · Commandes
//  • Settings slide-up from ⚙️ gear in profile card
//  • Logout button top-right (always visible)
//  • Avatar: emoji set OR real photo upload (camera / gallery)
//  • Always-visible ✏️ edit pen on avatar (no hover needed)
//  • Reviews per order with text + image upload
//  • OTP flow for email/phone change
//  • Asaka color hierarchy throughout
// ═══════════════════════════════════════════════════════════
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDragDismiss } from '../hooks/useDragDismiss';
import { getBadge, getNextBadge, POINTS_VALUE, MIN_REDEEM, BADGES, isCouponValid, computeCouponDiscount } from '../../data/asakaData';
import {
  COUNTRY_CODES, DEFAULT_COUNTRY,
  normalizePhone, isValidPhone, getCountryFromPhone, formatPhoneDisplay,
} from '../../data/countryCodes';
import { cartActions, useCartStore, selectCart } from '../../store/useCartStore';
import { toast } from '../../utils/toast';

// ── 5 emoji placeholder avatars ───────────────────────────
const EMOJI_AVATARS = ['🐉', '🦊', '🐼', '🐬', '🦅'];

// ── Avatar display helper ─────────────────────────────────
// Returns the src for an <img> or the emoji string
export const getAvatarDisplay = (customer) => {
  if (!customer) return null;
  if (customer.avatarUrl)   return { type: 'img',   src: customer.avatarUrl };
  if (customer.avatarEmoji) return { type: 'emoji', emoji: customer.avatarEmoji };
  return { type: 'initials', text: customer.name?.[0]?.toUpperCase() || '?' };
};

// ── Reusable Avatar component ─────────────────────────────
export const Avatar = ({ customer, size = 'md', className = '' }) => {
  const display = getAvatarDisplay(customer);
  const sizes = {
    xs: 'w-6 h-6 text-xs rounded-lg',
    sm: 'w-8 h-8 text-sm rounded-xl',
    md: 'w-10 h-10 text-base rounded-xl',
    lg: 'w-14 h-14 text-2xl rounded-2xl',
    xl: 'w-16 h-16 text-3xl rounded-2xl',
  };
  const cls = `${sizes[size] || sizes.md} flex items-center justify-center overflow-hidden
    flex-shrink-0 bg-gradient-to-br from-obsidian-700 to-salmon-500 ${className}`;

  if (display?.type === 'img') {
    return (
      <div className={cls}>
        <img src={display.src} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  if (display?.type === 'emoji') {
    return <div className={cls}>{display.emoji}</div>;
  }
  return (
    <div className={cls + ' text-white font-black'}>
      {display?.text || '?'}
    </div>
  );
};

// ── Inline mini country selector (for profile phone change) ──
const MiniCountrySelector = ({ selected, onChange }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = query.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial.includes(query) || c.code.toLowerCase().includes(query.toLowerCase()))
    : COUNTRY_CODES;

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="flex items-center gap-1.5 h-full px-3 py-2.5 rounded-l-xl
          border border-r-0 border-obsidian-700/50 bg-obsidian-700/40 hover:bg-obsidian-700/60
          text-white transition-all min-w-[84px]">
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="text-sm font-bold text-salmon-500">{selected.dial}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`w-3 h-3 text-obsidian-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-[200] mb-1 w-60 bg-obsidian-800
          border border-obsidian-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-obsidian-700/30">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Pays…"
              className="w-full bg-obsidian-900/60 border border-obsidian-700/40 rounded-xl
                px-3 py-1.5 text-white text-xs placeholder:text-obsidian-400 outline-none
                focus:border-salmon-500/60" autoFocus />
          </div>
          <div className="overflow-y-auto max-h-44">
            {filtered.map(c => (
              <button key={c.code} type="button"
                onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left
                  hover:bg-obsidian-700/40 transition-colors text-xs ${
                  selected.code === c.code ? 'bg-obsidian-700/30' : ''
                }`}>
                <span className="text-base w-5 text-center">{c.flag}</span>
                <span className="flex-1 text-champagne truncate">{c.name}</span>
                <span className="text-salmon-500 font-bold flex-shrink-0">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── OTP change modal (phone + email, with WhatsApp OTP option) ──
const ChangeFieldModal = ({ field, current, onClose, onSave }) => {
  const { panelRef: cfPanelRef, dragHandleProps: cfDragHandle, panelDragProps: cfPanelDrag } = useDragDismiss(onClose);
  const [step,       setStep]       = useState('input');
  const [newVal,     setNewVal]     = useState('');
  const [country,    setCountry]    = useState(
    field === 'phone' && current ? getCountryFromPhone(current) : DEFAULT_COUNTRY,
  );
  const [otpMethod,  setOtpMethod]  = useState('sms');   // 'sms' | 'whatsapp'
  const [otp,        setOtp]        = useState('');
  const [demoOtp,    setDemoOtp]    = useState('');      // shown in demo mode
  const [err,        setErr]        = useState('');

  const isPhone = field === 'phone';
  const label   = isPhone ? 'téléphone' : 'email';

  // Build full E.164 phone
  const fullPhone = isPhone ? normalizePhone(newVal, country.dial) : newVal;

  const sendOtp = () => {
    if (!newVal.trim()) { setErr(`Entrez votre nouveau ${label}`); return; }
    if (isPhone && !isValidPhone(newVal, country.dial)) {
      setErr('Numéro invalide'); return;
    }
    if (!isPhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newVal)) {
      setErr('Email invalide'); return;
    }
    setErr('');

    // Demo: generate a visible OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setDemoOtp(code);

    if (isPhone && otpMethod === 'whatsapp') {
      // Open WhatsApp with pre-filled OTP message sent TO the user's number
      const waNum = fullPhone.replace(/^\+/, '');
      const msg   = `Votre code de vérification Asaka Sushi : *${code}*\n\nNe partagez ce code avec personne.`;
      window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
      toast.info('WhatsApp ouvert — entrez le code reçu ci-dessous.');
    } else {
      const dest = isPhone ? fullPhone : newVal;
      toast.info(`[Démo] Code OTP : ${code} — envoyé à ${dest}`);
    }
    setStep('otp');
  };

  const verifyOtp = () => {
    if (otp.length < 4) { setErr('Code invalide'); return; }
    if (demoOtp && otp !== demoOtp) { setErr('Code incorrect'); return; }
    const savedValue = isPhone ? fullPhone : newVal.trim();
    if (isPhone) {
      onSave('phone', savedValue);
      onSave('phoneCountry', country.code);
    } else {
      onSave(field, savedValue);
    }
    setStep('done');
    setTimeout(onClose, 1400);
  };

  return (
    <>
      <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={cfPanelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-obsidian-800
          border-t border-obsidian-700/50 rounded-t-3xl px-6 pt-4
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...cfPanelDrag}>
        <div className="flex justify-center mb-5" {...cfDragHandle}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>

        {step === 'input' && (
          <>
            <h3 className="text-white font-black text-lg mb-1">Modifier le {label}</h3>
            <p className="text-salmon-500 text-sm mb-4">
              Actuel : <span className="text-salmon-500">
                {isPhone && current ? `${getCountryFromPhone(current).flag} ${formatPhoneDisplay(current)}` : (current || '—')}
              </span>
            </p>

            {/* Phone: country selector + number input */}
            {isPhone ? (
              <>
                <div className="flex rounded-xl border border-obsidian-700/50 mb-2 overflow-visible">
                  <MiniCountrySelector selected={country} onChange={c => { setCountry(c); setErr(''); }} />
                  <input type="tel" value={newVal}
                    onChange={e => { setNewVal(e.target.value); setErr(''); }}
                    placeholder={country.code === 'MA' ? '06 77 88 99 66' : 'Numéro local'}
                    className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm
                      placeholder:text-obsidian-400 outline-none min-w-0 rounded-r-xl"
                    autoFocus />
                </div>
                {country.code === 'MA' && (
                  <p className="text-obsidian-400 text-[10px] mb-3">
                    Formats : 0677889966 · 00212677889966 · +212677889966
                  </p>
                )}

                {/* OTP delivery method */}
                <p className="text-obsidian-400 text-xs font-semibold mb-2">Recevoir le code via</p>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setOtpMethod('sms')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-sm font-bold border transition-all ${
                      otpMethod === 'sms'
                        ? 'bg-salmon-500/20 border-salmon-500/50 text-salmon-500'
                        : 'glass-light border-obsidian-700/40 text-obsidian-400 hover:text-salmon-500'
                    }`}>
                    <span>📱</span> SMS
                  </button>
                  <button type="button" onClick={() => setOtpMethod('whatsapp')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-sm font-bold border transition-all ${
                      otpMethod === 'whatsapp'
                        ? 'bg-[#25d366]/15 border-[#25d366]/40 text-[#25d366]'
                        : 'glass-light border-obsidian-700/40 text-obsidian-400 hover:text-salmon-500'
                    }`}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
                </div>
                {otpMethod === 'whatsapp' && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl
                    bg-[#25d366]/8 border border-[#25d366]/20 mb-4 text-xs text-[#25d366]/70">
                    <span className="flex-shrink-0 mt-0.5">💡</span>
                    <span>Idéal si vous n'avez pas de forfait SMS. WhatsApp s'ouvrira automatiquement.</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <input type="email" value={newVal}
                  onChange={e => { setNewVal(e.target.value); setErr(''); }}
                  placeholder="nouveau@email.com"
                  className="input-asaka mb-2" autoFocus />
                <p className="text-obsidian-400 text-xs mb-4">
                  Un code de vérification sera envoyé à votre nouvelle adresse email.
                </p>
              </>
            )}

            {err && <p className="text-red-400 text-xs mb-3 flex items-center gap-1"><span>⚠️</span> {err}</p>}
            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
                Annuler
              </button>
              <button onClick={sendOtp}
                className="flex-1 py-3 rounded-xl btn-primary text-sm font-bold">
                Envoyer le code
              </button>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h3 className="text-white font-black text-lg mb-1">Vérification</h3>
            <p className="text-salmon-500 text-sm mb-1">
              Code envoyé via{' '}
              {isPhone && otpMethod === 'whatsapp'
                ? <span className="text-[#25d366]">WhatsApp</span>
                : <span className="text-salmon-500">SMS/Email</span>
              }{' '}
              à <span className="text-salmon-500">
                {isPhone ? formatPhoneDisplay(fullPhone) : newVal}
              </span>
            </p>
            {/* Demo OTP hint */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl
              bg-amber-900/20 border border-amber-700/30 mb-4 text-xs">
              <span>🔑</span>
              <span className="text-amber-400">Mode démo — votre code : </span>
              <span className="text-amber-300 font-black tracking-widest">{demoOtp}</span>
            </div>

            <input type="number" value={otp}
              onChange={e => { setOtp(e.target.value.slice(0, 6)); setErr(''); }}
              placeholder="······" autoFocus
              className="input-asaka mb-2 text-center text-2xl tracking-[0.5em] font-black" />
            {err && <p className="text-red-400 text-xs mb-2">{err}</p>}
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep('input')}
                className="flex-1 py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
                Retour
              </button>
              <button onClick={verifyOtp}
                className="flex-1 py-3 rounded-xl btn-primary text-sm font-bold">
                Confirmer
              </button>
            </div>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-white font-bold text-lg">
              {label.charAt(0).toUpperCase() + label.slice(1)} modifié !
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// ── Avatar picker sheet ───────────────────────────────────
const AvatarPickerSheet = ({ customer, onClose, onSave }) => {
  const { panelRef: apPanelRef, dragHandleProps: apDragHandle, panelDragProps: apPanelDrag } = useDragDismiss(onClose);
  const galleryRef = useRef(null);
  const cameraRef  = useRef(null);
  const [preview,  setPreview]  = useState(null);
  const [selected, setSelected] = useState(customer?.avatarEmoji || null);

  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setSelected(null); // Clear emoji selection when photo chosen
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (preview)  { onSave({ avatarUrl: preview, avatarEmoji: null }); onClose(); return; }
    if (selected) { onSave({ avatarEmoji: selected, avatarUrl: null  }); onClose(); return; }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={apPanelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-obsidian-800
          border-t border-obsidian-700/50 rounded-t-3xl px-6 pt-4
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...apPanelDrag}>
        <div className="flex justify-center mb-5" {...apDragHandle}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>
        <h3 className="text-white font-black text-lg text-center mb-1">Photo de profil</h3>
        <p className="text-obsidian-400 text-xs text-center mb-5">Choisissez un avatar ou ajoutez votre photo</p>

        {/* Photo preview */}
        {preview && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img src={preview} alt="preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-salmon-500 shadow-glow-salmon" />
              <button onClick={() => setPreview(null)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full
                  flex items-center justify-center text-white text-xs font-bold">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Camera / Gallery upload buttons */}
        <div className="flex gap-3 mb-5">
          {/* Gallery */}
          <button onClick={() => galleryRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl
              border border-obsidian-700/40 bg-obsidian-900/50 text-salmon-500
              hover:border-salmon-500/50 hover:text-salmon-500 transition-all active:scale-[0.97]">
            <span className="text-2xl">🖼️</span>
            <span className="text-xs font-bold">Galerie</span>
          </button>
          <input ref={galleryRef} type="file" accept="image/*"
            className="hidden" onChange={e => readFile(e.target.files?.[0])} />

          {/* Camera */}
          <button onClick={() => cameraRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl
              border border-obsidian-700/40 bg-obsidian-900/50 text-salmon-500
              hover:border-salmon-500/50 hover:text-salmon-500 transition-all active:scale-[0.97]">
            <span className="text-2xl">📷</span>
            <span className="text-xs font-bold">Caméra</span>
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="user"
            className="hidden" onChange={e => readFile(e.target.files?.[0])} />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-obsidian-700/40" />
          <span className="text-obsidian-400 text-xs">ou choisir un avatar</span>
          <div className="flex-1 h-px bg-obsidian-700/40" />
        </div>

        {/* Emoji avatars */}
        <div className="flex justify-center gap-3 mb-6">
          {EMOJI_AVATARS.map(emoji => (
            <button key={emoji} onClick={() => { setSelected(emoji); setPreview(null); }}
              className={`w-14 h-14 rounded-2xl text-3xl flex items-center justify-center
                border-2 transition-all active:scale-95 ${
                selected === emoji && !preview
                  ? 'border-salmon-500 bg-salmon-500/20 shadow-glow-salmon scale-110'
                  : 'border-obsidian-700/40 bg-obsidian-900 hover:border-obsidian-600'
              }`}>
              {emoji}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
            Annuler
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-xl btn-primary text-sm font-bold"
            disabled={!preview && !selected}>
            Enregistrer
          </button>
        </div>
      </div>
    </>
  );
};

// ── Settings bottom sheet ─────────────────────────────────
const SettingsSheet = ({ customer, onClose, onChangeField, onGoogleConnect, onFacebookConnect, onPersist }) => {
  const { panelRef: ssPanelRef, dragHandleProps: ssDragHandle, panelDragProps: ssPanelDrag } = useDragDismiss(onClose);
  // 2FA local state (persisted via onPersist when toggled)
  const [twoFaEnabled, setTwoFaEnabled] = useState(!!customer.twoFaEnabled);
  const [twoFaMethod,  setTwoFaMethod]  = useState(customer.twoFaMethod || 'sms');

  // ── Address management state ─────────────────────────────
  const [showAddAddr,        setShowAddAddr]        = useState(false);
  const [addAddrMethod,      setAddAddrMethod]      = useState(null); // null | 'typed' | 'gps'
  const [addAddrTyped,       setAddAddrTyped]       = useState('');
  const [addAddrName,        setAddAddrName]        = useState('');
  const [addAddrGpsState,    setAddAddrGpsState]    = useState('idle');
  const [addAddrGpsResult,   setAddAddrGpsResult]   = useState(null);
  // ── Edit-in-place state ───────────────────────────────────
  const [editingAddrId,  setEditingAddrId]  = useState(null);
  const [editAddrName,   setEditAddrName]   = useState('');
  const [editAddrTyped,  setEditAddrTyped]  = useState('');
  const [addAddrGpsApproved, setAddAddrGpsApproved] = useState(false);

  const savedAddresses = customer.savedAddresses || [];
  const primaryId      = savedAddresses.find(a => a.primary)?.id || savedAddresses[0]?.id;

  const handleSetPrimary = (id) => {
    const updated = savedAddresses.map(a => ({ ...a, primary: a.id === id }));
    onPersist({ savedAddresses: updated });
    toast.success('Adresse principale mise à jour.');
  };

  const handleDeleteAddress = (id) => {
    let updated = savedAddresses.filter(a => a.id !== id);
    if (updated.length > 0 && !updated.some(a => a.primary)) {
      updated[0] = { ...updated[0], primary: true };
    }
    onPersist({ savedAddresses: updated });
    toast.info('Adresse supprimée.');
  };

  const startEditAddress = (addr) => {
    setEditingAddrId(addr.id);
    setEditAddrName(addr.name || '');
    setEditAddrTyped(addr.address || '');
    setShowAddAddr(false); // close the add-form if open
  };

  const cancelEditAddress = () => {
    setEditingAddrId(null);
    setEditAddrName('');
    setEditAddrTyped('');
  };

  const handleUpdateAddress = () => {
    if (editAddrTyped.trim().length < 5) { toast.error('Adresse trop courte (min. 5 caractères).'); return; }
    const updated = savedAddresses.map(a =>
      a.id === editingAddrId
        ? { ...a, name: editAddrName.trim() || a.name, address: editAddrTyped.trim() }
        : a,
    );
    onPersist({ savedAddresses: updated });
    toast.success('Adresse mise à jour ✓');
    cancelEditAddress();
  };

  const handleAddrGps = () => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non disponible sur ce navigateur.');
      setAddAddrMethod(null);
      return;
    }
    setAddAddrGpsState('loading');
    setAddAddrGpsResult(null);
    setAddAddrGpsApproved(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        const link = `https://maps.google.com/?q=${lat},${lon}`;
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fr`,
            { headers: { 'Accept-Language': 'fr' } },
          );
          const data = await res.json();
          setAddAddrGpsResult({ display: data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, link });
        } catch {
          setAddAddrGpsResult({ display: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, link });
        }
        setAddAddrGpsState('found');
      },
      (err) => { setAddAddrGpsState(err.code === 1 ? 'denied' : 'error'); },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  };

  const chooseAddrMethod = (method) => {
    setAddAddrMethod(method);
    if (method === 'gps') handleAddrGps();
  };

  const resetAddForm = () => {
    setShowAddAddr(false);
    setAddAddrMethod(null);
    setAddAddrTyped('');
    setAddAddrName('');
    setAddAddrGpsState('idle');
    setAddAddrGpsResult(null);
    setAddAddrGpsApproved(false);
  };

  const handleSaveAddress = () => {
    let newAddr = null;
    if (addAddrMethod === 'typed') {
      if (addAddrTyped.trim().length < 5) { toast.error('Adresse trop courte.'); return; }
      newAddr = {
        id:      `addr-t-${Date.now()}`,
        name:    addAddrName.trim() || 'Mon adresse',
        address: addAddrTyped.trim(),
        gpsLink: '',
        primary: savedAddresses.length === 0,
      };
    } else if (addAddrMethod === 'gps') {
      if (!addAddrGpsApproved || !addAddrGpsResult) { toast.error('Approuvez d\'abord la position.'); return; }
      newAddr = {
        id:      `addr-g-${Date.now()}`,
        name:    addAddrName.trim() || 'Ma position GPS',
        address: addAddrGpsResult.display,
        gpsLink: addAddrGpsResult.link,
        primary: savedAddresses.length === 0,
      };
    }
    if (!newAddr) return;
    onPersist({ savedAddresses: [...savedAddresses, newAddr] });
    toast.success('Adresse enregistrée !');
    resetAddForm();
  };

  const toggle2FA = () => {
    const next = !twoFaEnabled;
    setTwoFaEnabled(next);
    onPersist({ twoFaEnabled: next, twoFaMethod: next ? twoFaMethod : customer.twoFaMethod || 'sms' });
  };

  const setMethod = (method) => {
    setTwoFaMethod(method);
    onPersist({ twoFaMethod: method });
  };

  const phoneDisplay = customer.phone
    ? `${getCountryFromPhone(customer.phone).flag} ${formatPhoneDisplay(customer.phone)}`
    : '—';

  return (
    <>
      <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={ssPanelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-obsidian-800
          border-t border-obsidian-700/50 rounded-t-3xl px-5 pt-4 overflow-y-auto max-h-[85vh]
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...ssPanelDrag}>
        <div className="flex justify-center mb-5" {...ssDragHandle}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>
        <h3 className="text-salmon-500 font-black text-sm uppercase tracking-wider mb-4">Paramètres du compte</h3>

        {/* Personal info */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center justify-between py-3 border-b border-obsidian-700/30">
            <div>
              <p className="text-obsidian-400 text-xs">Nom</p>
              <p className="text-champagne text-sm font-semibold">{customer.name}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-obsidian-700/30">
            <div>
              <p className="text-obsidian-400 text-xs">Email</p>
              <p className="text-salmon-500 text-sm">{customer.email || '—'}</p>
            </div>
            <button onClick={() => onChangeField('email')}
              className="text-xs text-salmon-500 hover:text-salmon-500 border border-obsidian-700/50
                hover:border-salmon-500/50 px-3 py-1.5 rounded-lg transition-all">
              Modifier
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-obsidian-700/30">
            <div>
              <p className="text-obsidian-400 text-xs">Téléphone</p>
              <p className="text-salmon-500 text-sm">{phoneDisplay}</p>
            </div>
            <button onClick={() => onChangeField('phone')}
              className="text-xs text-salmon-500 hover:text-salmon-500 border border-obsidian-700/50
                hover:border-salmon-500/50 px-3 py-1.5 rounded-lg transition-all">
              Modifier
            </button>
          </div>
          {customer.joinedDate && (
            <div className="py-3">
              <p className="text-obsidian-400 text-xs">Membre depuis</p>
              <p className="text-salmon-500 text-sm">{customer.joinedDate}</p>
            </div>
          )}
        </div>

        {/* ── 2FA Security Section ─────────────────────────────── */}
        <div className="rounded-2xl border border-obsidian-700/40 bg-obsidian-900/40 p-4 mb-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔐</span>
              <p className="text-white font-bold text-sm">Double authentification</p>
            </div>
            {/* Toggle switch */}
            <button type="button" onClick={toggle2FA}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                twoFaEnabled ? 'bg-salmon-500' : 'bg-obsidian-700/60'
              }`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow
                transition-transform duration-200 ${twoFaEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Security benefit message */}
          <p className="text-obsidian-400 text-xs mb-3 leading-relaxed">
            Protégez vos points, badges et coupons. Activez la 2FA pour sécuriser vos récompenses
            et ne plus jamais les perdre.
          </p>

          {/* Method selector — only shown when 2FA is on */}
          {twoFaEnabled && (
            <div className="mt-3 pt-3 border-t border-obsidian-700/30">
              <p className="text-salmon-500 text-[11px] font-semibold uppercase tracking-wide mb-2">
                Méthode de vérification
              </p>
              <div className="flex flex-col gap-2">
                {/* SMS */}
                <button type="button" onClick={() => setMethod('sms')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    twoFaMethod === 'sms'
                      ? 'border-salmon-500/60 bg-salmon-500/15 text-champagne'
                      : 'border-obsidian-700/40 text-obsidian-400 hover:border-obsidian-600/50'
                  }`}>
                  <span className="text-xl w-6 text-center">📱</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">SMS</p>
                    <p className="text-[11px] text-obsidian-400">Code envoyé par message texte</p>
                  </div>
                  {twoFaMethod === 'sms' && <span className="text-salmon-500 text-sm">✓</span>}
                </button>

                {/* Email */}
                <button type="button" onClick={() => setMethod('email')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    twoFaMethod === 'email'
                      ? 'border-salmon-500/60 bg-salmon-500/15 text-champagne'
                      : 'border-obsidian-700/40 text-obsidian-400 hover:border-obsidian-600/50'
                  }`}>
                  <span className="text-xl w-6 text-center">📧</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Email</p>
                    <p className="text-[11px] text-obsidian-400">Code envoyé à votre adresse email</p>
                  </div>
                  {twoFaMethod === 'email' && <span className="text-salmon-500 text-sm">✓</span>}
                </button>

                {/* Authenticator App */}
                <button type="button" onClick={() => setMethod('app')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    twoFaMethod === 'app'
                      ? 'border-salmon-500/60 bg-salmon-500/15 text-champagne'
                      : 'border-obsidian-700/40 text-obsidian-400 hover:border-obsidian-600/50'
                  }`}>
                  <span className="text-xl w-6 text-center">🔑</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Application d'authentification</p>
                    <p className="text-[11px] text-obsidian-400">Google Authenticator, Authy, etc.</p>
                  </div>
                  {twoFaMethod === 'app' && <span className="text-salmon-500 text-sm">✓</span>}
                </button>
              </div>

              {/* Contextual tip */}
              <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-xl
                bg-obsidian-700/20 border border-obsidian-700/30 text-xs text-obsidian-400">
                <span className="flex-shrink-0 mt-0.5">💡</span>
                <span>
                  {twoFaMethod === 'app'
                    ? 'Scannez le QR code avec votre application lors de la prochaine connexion.'
                    : twoFaMethod === 'email'
                    ? 'Un code à 6 chiffres sera envoyé à votre email à chaque connexion.'
                    : 'Un code à 6 chiffres vous sera envoyé par SMS à chaque connexion.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Addresses Section ──────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-obsidian-400 text-xs font-semibold uppercase tracking-wider">
              Mes adresses
            </p>
            {!showAddAddr && (
              <button onClick={() => setShowAddAddr(true)}
                className="text-xs text-salmon-500 hover:text-champagne border border-obsidian-700/50
                  hover:border-salmon-500/50 px-3 py-1.5 rounded-lg transition-all">
                + Ajouter
              </button>
            )}
          </div>

          {/* Existing addresses */}
          {savedAddresses.length === 0 && !showAddAddr && (
            <p className="text-obsidian-400 text-xs italic py-2">Aucune adresse enregistrée.</p>
          )}
          {savedAddresses.map((addr) => {
            const isPrimary = addr.id === primaryId;
            const isEditing = editingAddrId === addr.id;
            return (
              <div key={addr.id}
                className={`rounded-2xl border mb-2 p-3.5 transition-all ${
                  isEditing
                    ? 'border-salmon-500/50 bg-obsidian-700/20'
                    : isPrimary
                      ? 'border-salmon-500/40 bg-salmon-500/8'
                      : 'border-obsidian-700/30 bg-obsidian-900/30'
                }`}>

                {isEditing ? (
                  /* ── Inline edit form ─────────────────── */
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-sm">Modifier l'adresse</span>
                      <button onClick={cancelEditAddress}
                        className="w-7 h-7 rounded-lg glass-light flex items-center justify-center
                          text-salmon-500 hover:text-white transition-colors text-lg leading-none">
                        ×
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-obsidian-400 text-xs font-semibold mb-1 block">
                          Nom <span className="text-obsidian-400 font-normal">(ex: Maison, Bureau)</span>
                        </label>
                        <input type="text" value={editAddrName}
                          onChange={e => setEditAddrName(e.target.value)}
                          placeholder="Nom de l'adresse"
                          className="input-asaka text-sm py-2.5"
                          maxLength={40} autoFocus />
                      </div>
                      <div>
                        <label className="text-obsidian-400 text-xs font-semibold mb-1 block">
                          Adresse
                        </label>
                        <textarea value={editAddrTyped}
                          onChange={e => setEditAddrTyped(e.target.value)}
                          rows={2}
                          className="input-asaka resize-none text-sm"
                          placeholder="Ex : 12 Rue Ibn Battouta, Agadir, 80000" />
                        {addr.gpsLink && (
                          <p className="text-[10px] text-obsidian-400 mt-1 flex items-center gap-1">
                            <span>📍</span>
                            <span>La position GPS reste liée — seul le texte est modifié.</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={handleUpdateAddress}
                        disabled={editAddrTyped.trim().length < 5}
                        className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold
                          disabled:opacity-40 disabled:cursor-not-allowed">
                        Mettre à jour
                      </button>
                      <button onClick={cancelEditAddress}
                        className="px-4 py-2.5 rounded-xl bg-obsidian-800/60 border border-obsidian-700/40
                          text-salmon-500 text-xs font-bold hover:text-salmon-500 transition-all">
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display view ─────────────────────── */
                  <>
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg flex-shrink-0 mt-0.5">{addr.gpsLink ? '📍' : '🏠'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-white font-bold text-sm">{addr.name}</span>
                          {isPrimary && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black
                              bg-salmon-500/25 text-salmon-500 border border-salmon-500/35">
                              ★ Principale
                            </span>
                          )}
                          {addr.gpsLink && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full
                              bg-green-900/30 text-green-400 border border-green-700/30">
                              GPS
                            </span>
                          )}
                        </div>
                        <p className="text-salmon-500 text-xs leading-relaxed line-clamp-2">
                          {addr.address}
                        </p>
                        {addr.gpsLink && (
                          <a href={addr.gpsLink} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] text-cyan-500 hover:text-cyan-300 transition-colors mt-0.5 block">
                            Voir sur la carte ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-obsidian-700/20">
                      {!isPrimary && (
                        <button onClick={() => handleSetPrimary(addr.id)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold
                            border border-obsidian-600/35 bg-obsidian-700/15 text-salmon-500
                            hover:bg-obsidian-600/25 hover:text-white transition-all">
                          ★ Principale
                        </button>
                      )}
                      <button onClick={() => startEditAddress(addr)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold
                          border border-salmon-500/35 bg-salmon-500/10 text-salmon-500
                          hover:bg-salmon-500/20 hover:text-white transition-all flex items-center
                          justify-center gap-1">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"/>
                        </svg>
                        Modifier
                      </button>
                      <button onClick={() => handleDeleteAddress(addr.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold
                          border border-red-700/30 bg-red-900/8 text-red-400
                          hover:bg-red-900/20 transition-all">
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Add address inline form */}
          {showAddAddr && (
            <div className="rounded-2xl border border-obsidian-600/40 bg-obsidian-800/50 p-4 mt-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm">Nouvelle adresse</span>
                <button onClick={resetAddForm}
                  className="w-7 h-7 rounded-lg glass-light flex items-center justify-center
                    text-salmon-500 hover:text-white transition-colors text-lg leading-none">
                  ×
                </button>
              </div>

              {/* Name field — visible once method chosen */}
              {addAddrMethod && (
                <div className="mb-3">
                  <label className="text-obsidian-400 text-xs font-semibold mb-1 block">
                    Nom <span className="text-obsidian-400 font-normal">(ex : Maison, Bureau)</span>
                  </label>
                  <input type="text" value={addAddrName}
                    onChange={e => setAddAddrName(e.target.value)}
                    placeholder={addAddrMethod === 'gps' ? 'Ma position GPS' : 'Mon adresse'}
                    className="input-asaka text-sm py-2.5"
                    maxLength={40}
                  />
                </div>
              )}

              {/* Method choice */}
              {!addAddrMethod && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => chooseAddrMethod('typed')}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-xl
                      border-2 border-obsidian-700/50 bg-obsidian-900/40
                      hover:border-salmon-500/60 hover:bg-obsidian-700/25 transition-all group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      className="w-5 h-5 text-salmon-500 group-hover:text-white transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                    </svg>
                    <span className="text-white font-bold text-xs">Saisir</span>
                  </button>
                  <button onClick={() => chooseAddrMethod('gps')}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-xl
                      border-2 border-obsidian-700/50 bg-obsidian-900/40
                      hover:border-salmon-500/60 hover:bg-obsidian-700/25 transition-all group">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      className="w-5 h-5 text-salmon-500 group-hover:text-white transition-colors">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <span className="text-white font-bold text-xs">GPS</span>
                  </button>
                </div>
              )}

              {/* Typed input */}
              {addAddrMethod === 'typed' && (
                <div>
                  <label className="text-obsidian-400 text-xs font-semibold mb-1 block">Adresse</label>
                  <textarea value={addAddrTyped} onChange={e => setAddAddrTyped(e.target.value)}
                    placeholder="Ex : 12 Rue Ibn Battouta, Agadir, 80000"
                    rows={2} className="input-asaka resize-none text-sm" autoFocus/>
                  <button onClick={() => setAddAddrMethod(null)}
                    className="mt-1 text-[10px] text-obsidian-400 hover:text-salmon-500 transition-colors">
                    ← Changer de méthode
                  </button>
                </div>
              )}

              {/* GPS flow */}
              {addAddrMethod === 'gps' && (
                <div className="space-y-2">
                  {addAddrGpsState === 'loading' && (
                    <div className="rounded-xl border border-obsidian-600/40 bg-obsidian-900/50 p-4 text-center">
                      <div className="relative w-10 h-10 mx-auto mb-2">
                        <svg className="animate-spin w-10 h-10 text-salmon-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center">📍</span>
                      </div>
                      <p className="text-white font-bold text-xs">Détection en cours…</p>
                      <p className="text-salmon-500 text-[11px] mt-1">
                        Veuillez patienter, cela peut prendre quelques secondes.
                      </p>
                    </div>
                  )}
                  {(addAddrGpsState === 'denied' || addAddrGpsState === 'error') && (
                    <div className="rounded-xl border border-amber-600/35 bg-amber-900/10 p-3">
                      <p className="text-amber-400 text-xs font-bold mb-1">
                        {addAddrGpsState === 'denied' ? 'Localisation refusée' : 'Erreur de localisation'}
                      </p>
                      <p className="text-amber-300/60 text-[11px] mb-2">
                        {addAddrGpsState === 'denied'
                          ? 'Activez la localisation dans les paramètres du navigateur.'
                          : 'Une erreur s\'est produite. Réessayez ou saisissez l\'adresse.'}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => { setAddAddrGpsState('idle'); handleAddrGps(); }}
                          className="flex-1 py-1.5 rounded-lg bg-obsidian-700/30 text-salmon-500 text-xs font-bold
                            border border-obsidian-600/40 hover:bg-obsidian-600/40 transition-all">
                          Réessayer
                        </button>
                        <button onClick={() => setAddAddrMethod('typed')}
                          className="flex-1 py-1.5 rounded-lg bg-obsidian-800/60 text-salmon-500 text-xs font-bold
                            border border-obsidian-700/40 hover:text-salmon-500 transition-all">
                          Saisir manuellement
                        </button>
                      </div>
                    </div>
                  )}
                  {addAddrGpsState === 'found' && addAddrGpsResult && (
                    <div className={`rounded-xl border p-3 transition-all ${
                      addAddrGpsApproved
                        ? 'border-green-600/45 bg-green-900/12'
                        : 'border-obsidian-600/40 bg-obsidian-900/40'
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-lg flex-shrink-0">{addAddrGpsApproved ? '✅' : '📍'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-xs mb-0.5">
                            {addAddrGpsApproved ? 'Position approuvée' : 'Position détectée'}
                          </p>
                          <p className="text-salmon-500 text-[11px] leading-relaxed">
                            {addAddrGpsResult.display}
                          </p>
                        </div>
                      </div>
                      {!addAddrGpsApproved ? (
                        <div className="flex gap-2">
                          <button onClick={() => setAddAddrGpsApproved(true)}
                            className="flex-1 py-2 rounded-lg bg-salmon-500/20 border border-salmon-500/40
                              text-champagne text-xs font-bold hover:bg-salmon-500/30 transition-all">
                            ✓ Approuver
                          </button>
                          <button onClick={resetAddForm}
                            className="px-3 py-2 rounded-lg bg-obsidian-800/60 border border-obsidian-700/40
                              text-salmon-500 text-xs font-bold hover:text-salmon-500 transition-all">
                            Ignorer
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => { setAddAddrGpsApproved(false); setAddAddrGpsState('idle'); setAddAddrGpsResult(null); }}
                          className="text-[10px] text-obsidian-400 hover:text-red-400 transition-colors">
                          Modifier la position
                        </button>
                      )}
                    </div>
                  )}
                  {addAddrGpsState !== 'loading' && (
                    <button onClick={() => setAddAddrMethod(null)}
                      className="text-[10px] text-obsidian-400 hover:text-salmon-500 transition-colors">
                      ← Changer de méthode
                    </button>
                  )}
                </div>
              )}

              {/* Save button */}
              {addAddrMethod && (
                <button onClick={handleSaveAddress}
                  disabled={
                    (addAddrMethod === 'typed' && addAddrTyped.trim().length < 5) ||
                    (addAddrMethod === 'gps' && !addAddrGpsApproved)
                  }
                  className="w-full mt-3 py-3 rounded-xl btn-primary text-xs font-bold
                    disabled:opacity-40 disabled:cursor-not-allowed">
                  Enregistrer l'adresse
                </button>
              )}
            </div>
          )}
        </div>

        {/* Social logins */}
        <div className="space-y-2 mb-5">
          <p className="text-obsidian-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Connexions sociales
          </p>
          {/* Google */}
          <button onClick={onGoogleConnect}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              customer.googleId
                ? 'border-green-700/40 bg-green-900/15 text-green-400'
                : 'border-obsidian-700/40 bg-obsidian-800/50 text-salmon-500 hover:border-obsidian-600/50'
            }`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold">Google</div>
              <div className="text-xs opacity-60">
                {customer.googleId ? 'Connecté' : 'Connecter votre compte Google'}
              </div>
            </div>
            {customer.googleId && <span className="text-green-400 text-sm">✓</span>}
          </button>

          {/* Facebook */}
          <button onClick={onFacebookConnect}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
              customer.facebookId
                ? 'border-[#1877f2]/40 bg-[#1877f2]/10 text-[#1877f2]'
                : 'border-obsidian-700/40 bg-obsidian-800/50 text-salmon-500 hover:border-obsidian-600/50'
            }`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold" style={{ color: customer.facebookId ? '#1877f2' : undefined }}>
                Facebook
              </div>
              <div className="text-xs opacity-60">
                {customer.facebookId ? 'Connecté' : 'Connecter votre compte Facebook'}
              </div>
            </div>
            {customer.facebookId && <span style={{ color: '#1877f2' }} className="text-sm">✓</span>}
          </button>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
          Fermer
        </button>
      </div>
    </>
  );
};

// ── Review bottom sheet ───────────────────────────────────
const ReviewSheet = ({ order, onClose, onSubmit }) => {
  const { panelRef: rvPanelRef, dragHandleProps: rvDragHandle, panelDragProps: rvPanelDrag } = useDragDismiss(onClose);
  const [stars,   setStars]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [images,  setImages]  = useState([]);
  const galleryRef = useRef(null);
  const cameraRef  = useRef(null);

  const addImage = (file) => {
    if (!file || !file.type.startsWith('image/') || images.length >= 3) return;
    const reader = new FileReader();
    reader.onload = e => setImages(prev => [...prev, e.target.result]);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!stars) { toast.error('Donnez au moins 1 étoile'); return; }
    onSubmit({ stars, comment: comment.trim(), images, date: new Date().toLocaleDateString('fr-MA') });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-obsidian-950/80 backdrop-blur-sm" style={{ zIndex: 45 }} onClick={onClose} />
      <div
        ref={rvPanelRef}
        className="fixed bottom-0 inset-x-0 max-w-lg mx-auto bg-obsidian-800
          border-t border-obsidian-700/50 rounded-t-3xl px-5 pt-4
          pb-20 sm:pb-8"
        style={{ zIndex: 60, animation: 'slideUp 0.3s cubic-bezier(.34,1.56,.64,1) both' }}
        {...rvPanelDrag}>
        <div className="flex justify-center mb-5" {...rvDragHandle}>
          <div className="w-10 h-1.5 bg-salmon-500 rounded-full" />
        </div>

        {/* Order info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-obsidian-700 flex items-center justify-center text-lg">
            {order.mode === 'delivery' ? '🛵' : '🥡'}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{order.id}</p>
            <p className="text-salmon-500 text-xs">{order.date} · {order.total} DH</p>
          </div>
        </div>

        {/* Star rating */}
        <p className="text-salmon-500 text-xs font-semibold mb-2">Votre note *</p>
        <div className="flex gap-2 mb-5">
          {[1,2,3,4,5].map(s => (
            <button key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onTouchStart={() => setHovered(s)}
              onTouchEnd={() => { setStars(s); setHovered(0); }}
              onClick={() => setStars(s)}
              className="text-3xl transition-transform active:scale-90">
              {s <= (hovered || stars) ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        {/* Comment */}
        <p className="text-salmon-500 text-xs font-semibold mb-2">Commentaire</p>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec les autres clients..."
          rows={3}
          className="input-asaka resize-none mb-4"
          maxLength={500}
        />

        {/* Photo upload */}
        <p className="text-salmon-500 text-xs font-semibold mb-2">
          Photos ({images.length}/3)
        </p>
        <div className="flex gap-2 mb-5">
          {/* Uploaded images previews */}
          {images.map((src, i) => (
            <div key={i} className="relative w-16 h-16">
              <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-obsidian-600/40" />
              <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full
                  flex items-center justify-center text-white text-xs font-bold leading-none">
                ×
              </button>
            </div>
          ))}

          {/* Add buttons */}
          {images.length < 3 && (
            <>
              <button onClick={() => galleryRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-dashed border-obsidian-600/50
                  bg-obsidian-900/50 flex flex-col items-center justify-center gap-1
                  text-obsidian-400 hover:border-salmon-500 transition-all">
                <span className="text-xl">🖼️</span>
                <span className="text-[9px]">Galerie</span>
              </button>
              <button onClick={() => cameraRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-dashed border-obsidian-600/50
                  bg-obsidian-900/50 flex flex-col items-center justify-center gap-1
                  text-obsidian-400 hover:border-salmon-500 transition-all">
                <span className="text-xl">📷</span>
                <span className="text-[9px]">Caméra</span>
              </button>
            </>
          )}
          <input ref={galleryRef} type="file" accept="image/*"
            className="hidden" onChange={e => addImage(e.target.files?.[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={e => addImage(e.target.files?.[0])} />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl glass-light text-salmon-500 font-bold text-sm">
            Annuler
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl btn-primary text-sm font-bold">
            Publier l'avis ✓
          </button>
        </div>
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════
//  MAIN PROFILE PAGE
// ════════════════════════════════════════════════════════════
const CustomerProfile = ({
  navigate,
  currentCustomer,
  handleLogout,
  openAuth,
  setFrontCustomers,
  setCurrentCustomer,
  setAvisData,
  menuItems = [],
}) => {
  const [activeTab,       setActiveTab]       = useState('avantages');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [changeField,     setChangeField]     = useState(null);
  const [reviewingOrder,  setReviewingOrder]  = useState(null);


  // ── Cart access (for coupon apply + navigate) ─────────
  const cart = useCartStore(selectCart);

  // ── Persist helper ────────────────────────────────────
  const persist = useCallback((patch) => {
    if (!currentCustomer) return;
    const updated = { ...currentCustomer, ...patch };
    setCurrentCustomer?.(updated);
    setFrontCustomers?.(prev => prev.map(c => c.id === currentCustomer.id ? updated : c));
    // Keep the cart-store address list in sync so UnifiedCheckout always
    // reflects the latest state (add / delete / set-primary from Settings)
    if (patch.savedAddresses) {
      cartActions.loadAddresses(patch.savedAddresses);
    }
  }, [currentCustomer, setCurrentCustomer, setFrontCustomers]);

  // ── Not logged in ─────────────────────────────────────
  if (!currentCustomer) {
    return (
      <div className="min-h-screen bg-obsidian-900 flex flex-col items-center justify-center
        px-6 pt-24 text-center">
        <div className="text-7xl mb-5">👤</div>
        <h2 className="text-white font-black text-2xl mb-2">Espace fidélité</h2>
        <p className="text-salmon-500 text-sm mb-8">Connectez-vous pour accéder à votre profil et vos points</p>
        <button onClick={() => openAuth('login')} className="btn-primary px-8 py-3.5 text-sm mb-3">
          Se connecter
        </button>
        <button onClick={() => openAuth('signup')} className="btn-secondary px-8 py-3 text-sm">
          Créer un compte
        </button>
      </div>
    );
  }

  // ── Computed values ───────────────────────────────────
  const badge       = getBadge(currentCustomer.totalOrders || 0);
  const nextInfo    = getNextBadge(currentCustomer.totalOrders || 0);
  const curBadgeIdx = BADGES.findIndex(b => b.name === badge.name);
  const tierStart   = badge.minOrders;
  const tierEnd     = nextInfo?.badge.minOrders ?? tierStart + 1;
  const progress    = nextInfo
    ? Math.round(((currentCustomer.totalOrders - tierStart) / (tierEnd - tierStart)) * 100)
    : 100;
  const pointsValue = Math.floor((currentCustomer.points || 0) * POINTS_VALUE);
  const canRedeem   = (currentCustomer.points || 0) >= MIN_REDEEM;

  const history          = currentCustomer.orderHistory || [];
  // Only active (non-cancelled) orders are eligible for reviews
  const pendingReviews   = history.filter(o => !o.review && o.status !== 'cancelled');
  const completedReviews = history.filter(o => o.review);

  // ── Handlers ─────────────────────────────────────────
  const handleAvatarSave = (patch) => persist(patch);

  // handleFieldSave is called once per field by ChangeFieldModal.
  // When saving a phone number the modal calls onSave('phone', …) then
  // onSave('phoneCountry', …) before closing itself — so we must NOT call
  // setChangeField(null) on either of those two calls; the modal handles closing.
  const handleFieldSave = (field, value) => {
    persist({ [field]: value });
    // phoneCountry is always saved as a companion to phone — the modal closes itself
    if (field !== 'phone' && field !== 'phoneCountry') {
      setChangeField(null);
    }
  };

  const handleGoogleConnect = () => {
    toast.info('Connexion Google — disponible dans la prochaine mise à jour.');
  };
  const handleFacebookConnect = () => {
    toast.info('Connexion Facebook — disponible dans la prochaine mise à jour.');
  };

  const handleReviewSubmit = (orderId, review) => {
    // 1. Update local customer history
    const updated = {
      ...currentCustomer,
      orderHistory: history.map(o => o.id === orderId ? { ...o, review } : o),
    };
    setCurrentCustomer?.(updated);
    setFrontCustomers?.(prev => prev.map(c => c.id === currentCustomer.id ? updated : c));

    // 2. Push to Back-Office Avis pool (unpublished by default)
    setAvisData?.(prev => [{
      id: Date.now(),
      name: currentCustomer.name,
      stars: review.stars,
      text: review.comment,
      date: review.date,
      badge: 'Nouveau',
      published: false
    }, ...prev]);

    toast.success('Avis publié ! Merci 🍣');
  };

  const TABS = [
    { id: 'avantages', label: 'Avantages', emoji: '🎁' },
    { id: 'points',    label: 'Fidélité',  emoji: '⭐' },
    { id: 'history',   label: 'Commandes', emoji: '📋' },
    { id: 'reviews',   label: 'Avis',      emoji: '✍️' },
  ];

  return (
    <div className="min-h-screen bg-obsidian-900 pt-20 pb-28">
      <div className="max-w-xl mx-auto px-4">

        {/* ════════════════════════════════════════════
            PROFILE HEADER CARD
        ════════════════════════════════════════════ */}
        <div className="glass rounded-3xl p-5 mb-5 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,195,247,0.07), transparent)' }} />

          {/* Top-right controls: settings + logout */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
              className="w-8 h-8 rounded-xl glass-light flex items-center justify-center
                text-salmon-500 hover:text-salmon-500 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            <button onClick={handleLogout}
              className="w-8 h-8 rounded-xl flex items-center justify-center
                bg-red-900/30 border border-red-800/40 text-red-400
                hover:bg-red-900/50 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
              </svg>
            </button>
          </div>

          {/* Avatar + info row */}
          <div className="flex items-start gap-4 relative z-10 pr-20">
            {/* Avatar — always-visible edit pen */}
            <button onClick={() => setShowAvatarPicker(true)}
              className="relative flex-shrink-0">
              <Avatar customer={currentCustomer} size="xl"
                className={`border-2 ${badge.bgClass || 'border-obsidian-600/40'}`} />
              {/* Edit pen — always visible, not just on hover */}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-salmon-500
                rounded-lg flex items-center justify-center border-2 border-obsidian-900
                shadow-glow-salmon">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                  className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
                </svg>
              </div>
            </button>

            {/* Name + contact */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-black text-xl leading-tight truncate mb-1.5">
                {currentCustomer.name}
              </h1>

              {/* Phone */}
              {currentCustomer.phone && (
                <p className="text-salmon-500 text-xs flex items-center gap-1.5 truncate mb-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    className="w-3 h-3 flex-shrink-0 text-obsidian-400">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
                  </svg>
                  <span className="truncate">
                    {getCountryFromPhone(currentCustomer.phone).flag}{' '}
                    {formatPhoneDisplay(currentCustomer.phone)}
                  </span>
                </p>
              )}

              {/* Email */}
              {currentCustomer.email && (
                <p className="text-salmon-500 text-xs flex items-center gap-1.5 truncate mb-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                    className="w-3 h-3 flex-shrink-0 text-obsidian-400">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                  </svg>
                  <span className="truncate">{currentCustomer.email}</span>
                </p>
              )}

              {/* Primary address */}
              {(() => {
                const addrs = currentCustomer.savedAddresses || [];
                const primary = addrs.find(a => a.primary) || addrs[0];
                if (!primary) return null;
                return (
                  <p className="text-salmon-500 text-xs flex items-center gap-1.5 truncate mb-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                      className="w-3 h-3 flex-shrink-0 text-obsidian-400">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    <span className="truncate">{primary.address}</span>
                  </p>
                );
              })()}

              {/* Badge pill */}
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  text-xs font-bold ${badge.textColor} ${badge.bgClass || 'bg-obsidian-800 border border-obsidian-700/40'}`}>
                  {badge.emoji} {badge.name}
                </span>
                <span className="text-obsidian-400 text-xs">
                  {currentCustomer.totalOrders || 0} cmd{(currentCustomer.totalOrders || 0) !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 relative z-10">
            <div className="flex justify-between text-xs mb-1.5">
              <span className={`font-bold ${badge.textColor}`}>{badge.emoji} {badge.name}</span>
              {nextInfo ? (
                <span className="text-obsidian-400">
                  {nextInfo.badge.emoji} {nextInfo.badge.name} — {nextInfo.remaining} cmd{nextInfo.remaining !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-salmon-500 font-bold">Niveau max 👑</span>
              )}
            </div>
            <div className="h-1.5 bg-obsidian-900 rounded-full overflow-hidden border border-obsidian-800">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(100, progress)}%`,
                  background: 'linear-gradient(90deg,#1565c0,#4fc3f7)',
                  boxShadow: '0 0 8px rgba(79,195,247,0.5)',
                }} />
            </div>
            <p className="text-obsidian-400 text-[11px] mt-1">{badge.perks}</p>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { value: currentCustomer.totalOrders || 0,                  label: 'Commandes', color: 'text-white' },
            { value: currentCustomer.points || 0,                       label: 'Points',    color: 'text-salmon-500', sub: `≈ ${pointsValue} DH` },
            { value: `${Math.round(currentCustomer.totalSpent || 0)} DH`, label: 'Dépensé',  color: 'text-champagne' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl py-4 px-3 text-center">
              <div className={`${s.color} font-black text-xl leading-none`}>{s.value}</div>
              <div className="text-obsidian-400 text-xs mt-1">{s.label}</div>
              {s.sub && <div className="text-obsidian-400 text-[10px] mt-0.5">{s.sub}</div>}
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────── */}
        <div className="flex gap-2 mb-4">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-salmon-500 text-white'
                  : 'glass-light text-obsidian-400 hover:text-white'
              }`}>
              {tab.emoji} {tab.label}
              {tab.id === 'avantages' && (currentCustomer.coupons || []).filter(c => !c.usedAt && !(c.expiresAt && new Date(c.expiresAt) < new Date())).length > 0 && (
                <span className="ml-1.5 bg-salmon-500 text-white text-[9px] font-black
                  px-1.5 py-0.5 rounded-full">
                  {(currentCustomer.coupons || []).filter(c => !c.usedAt && !(c.expiresAt && new Date(c.expiresAt) < new Date())).length}
                </span>
              )}
              {tab.id === 'history' && history.length > 0 && (
                <span className="ml-1 text-salmon-500 font-normal">({history.length})</span>
              )}
              {tab.id === 'reviews' && pendingReviews.length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-salmon-500 text-[9px] font-black
                  px-1.5 py-0.5 rounded-full">
                  {pendingReviews.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            TAB: AVANTAGES (Solde + Promos)
        ══════════════════════════════════════════ */}
        {activeTab === 'avantages' && (
          <div className="space-y-4">

            {/* — Solde de points — */}
            <div className="card-asaka p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-obsidian-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Solde de points
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-salmon-500 font-black text-3xl">{currentCustomer.points || 0}</span>
                    <span className="text-obsidian-400 text-sm">pts</span>
                  </div>
                  <p className="text-salmon-500 text-xs mt-0.5">≈ {pointsValue} DH de réduction</p>
                </div>
                <div className="text-4xl">⭐</div>
              </div>
              {canRedeem ? (
                <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-3">
                  <p className="text-green-400 font-bold text-xs">✅ Points utilisables à la caisse</p>
                  <p className="text-salmon-500 text-xs mt-0.5">
                    Utilisez vos points lors du checkout pour réduire votre total.
                  </p>
                </div>
              ) : (
                <div className="border border-obsidian-800 rounded-xl p-3">
                  <p className="text-obsidian-400 text-xs">
                    Encore {MIN_REDEEM - (currentCustomer.points || 0)} pts pour débloquer les récompenses
                  </p>
                  <div className="h-1.5 bg-obsidian-900 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-salmon-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((currentCustomer.points || 0) / MIN_REDEEM) * 100)}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* — Promos & Coupons — */}
            <div className="card-asaka p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-salmon-500 font-bold text-[10px] uppercase tracking-widest">
                  Promos & Coupons
                </h3>
                {(currentCustomer.coupons || []).filter(c => !c.usedAt).length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                    bg-salmon-500/15 text-salmon-500 border border-salmon-500/25">
                    {(currentCustomer.coupons || []).filter(c => !c.usedAt).length} actif{(currentCustomer.coupons || []).filter(c => !c.usedAt).length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {(currentCustomer.coupons || []).length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🎟️</div>
                  <p className="text-obsidian-400 text-sm">Aucun coupon pour le moment.</p>
                  <p className="text-obsidian-400 text-xs mt-1">
                    Les coupons apparaîtront ici après promotions ou récompenses.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(currentCustomer.coupons || []).map(coupon => {
                    const isUsed    = !!coupon.usedAt;
                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                    const inactive  = isUsed || isExpired;
                    return (
                      <div key={coupon.id} className={`rounded-xl border p-3.5 transition-all ${
                        inactive
                          ? 'border-obsidian-800/30 bg-obsidian-900/40 opacity-55'
                          : 'border-obsidian-600/30 bg-obsidian-800/40'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                            flex-shrink-0 text-base ${
                            inactive ? 'bg-obsidian-800 text-obsidian-400' : 'bg-salmon-500/20 text-salmon-500'
                          }`}>🎟️</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-black text-sm tracking-wider ${
                                inactive ? 'text-obsidian-400' : 'text-white'
                              }`}>{coupon.code}</span>
                              <span className={`font-black text-sm ${
                                inactive ? 'text-obsidian-400' : 'text-salmon-500'
                              }`}>
                                {coupon.type === 'percent' ? `-${coupon.value}%` : `-${coupon.value} DH`}
                              </span>
                              {isUsed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold
                                  bg-obsidian-900 text-obsidian-400 border border-obsidian-800">Utilisé</span>
                              )}
                              {isExpired && !isUsed && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold
                                  bg-red-950 text-red-700 border border-red-900/50">Expiré</span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 truncate ${
                              inactive ? 'text-obsidian-400' : 'text-salmon-500'
                            }`}>{coupon.description}</p>
                            {isUsed && coupon.usedOnOrder && (
                              <p className="text-[10px] text-obsidian-400 mt-0.5">
                                Utilisé sur commande {coupon.usedOnOrder} · {coupon.usedAt}
                              </p>
                            )}
                            {coupon.expiresAt && !isExpired && !isUsed && (
                              <p className="text-[10px] text-amber-700 mt-0.5">
                                Expire le {new Date(coupon.expiresAt).toLocaleDateString('fr-MA')}
                              </p>
                            )}
                            {coupon.minOrder > 0 && !inactive && (
                              <p className="text-[10px] text-obsidian-400 mt-0.5">
                                Commande minimum : {coupon.minOrder} DH
                              </p>
                            )}
                          </div>
                          {!inactive && (
                            <button
                              onClick={() => {
                                const cartSubtotal = cart.reduce((s, c) => s + c.item.price * c.qty, 0);
                                if (cart.length === 0) {
                                  toast.info('Ajoutez des articles au panier d\'abord 🛒');
                                  navigate('menu');
                                  return;
                                }
                                const { valid, reason } = isCouponValid(coupon, cartSubtotal);
                                if (!valid) { toast.error(reason); return; }
                                cartActions.applyCoupon(coupon);
                                toast.success(`Coupon ${coupon.code} appliqué ! 🎟️`);
                                navigate('cart');
                              }}
                              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold
                                bg-salmon-500/15 border border-salmon-500/30 text-salmon-500
                                hover:bg-salmon-500/25 transition-all active:scale-95">
                              Appliquer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: FIDÉLITÉ
        ══════════════════════════════════════════ */}
        {activeTab === 'points' && (
          <div className="space-y-4">
            {/* 6 tiers */}
            <div className="card-asaka p-5">
              <h3 className="text-salmon-500 font-bold text-[10px] uppercase tracking-widest mb-4">
                Niveaux de fidélité
              </h3>
              <div className="space-y-2">
                {BADGES.map((b, i) => {
                  const orders    = currentCustomer.totalOrders || 0;
                  const unlocked  = orders >= b.minOrders;
                  const isCurrent = b.name === badge.name;
                  const isNext    = i === curBadgeIdx + 1;
                  return (
                    <div key={b.name} className={`rounded-xl p-3.5 border transition-all ${
                      isCurrent
                        ? `${b.bgClass} ring-1 ring-asaka-400/20`
                        : unlocked
                          ? 'border-obsidian-800/30 bg-obsidian-800/20'
                          : 'border-obsidian-900 bg-obsidian-900/60 opacity-50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl ${!unlocked ? 'grayscale' : ''}`}>{b.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm ${
                              isCurrent ? b.textColor : unlocked ? 'text-salmon-500' : 'text-obsidian-400'
                            }`}>{b.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold
                                bg-salmon-500/20 text-salmon-500 border border-salmon-500/30">
                                Actuel
                              </span>
                            )}
                            {unlocked && !isCurrent && (
                              <span className="text-green-500 text-xs">✓</span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 ${unlocked ? 'text-obsidian-400' : 'text-obsidian-400'}`}>
                            {b.minOrders === 0 ? 'Niveau de départ' : `À partir de ${b.minOrders} commandes`}
                          </p>
                        </div>
                        <span className={`text-xs font-black ${
                          b.discount > 0 ? (isCurrent ? b.textColor : 'text-obsidian-400') : 'text-obsidian-400'
                        }`}>
                          {b.discount > 0 ? `-${b.discount}%` : '—'}
                        </span>
                      </div>
                      {/* Reward preview for next tier */}
                      {b.reward && isNext && (
                        <div className="mt-2.5 pt-2.5 border-t border-obsidian-800/60 text-xs">
                          <p className="text-salmon-500 font-semibold">
                            {b.reward.emoji} Prochain palier : {b.reward.label}
                          </p>
                          <p className="text-obsidian-400 mt-0.5">{b.reward.details}</p>
                        </div>
                      )}
                      {/* Current reward */}
                      {b.reward && isCurrent && (
                        <div className="mt-2.5 pt-2.5 border-t border-obsidian-700/30 text-xs">
                          <p className={`font-bold ${b.textColor}`}>
                            {b.reward.emoji} {b.perks}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: COMMANDES (orders only, no reviews)
        ══════════════════════════════════════════ */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Pending-reviews nudge */}
            {pendingReviews.length > 0 && (
              <button onClick={() => setActiveTab('reviews')}
                className="w-full flex items-center gap-3 p-4 rounded-2xl
                  border border-amber-700/40 bg-amber-900/10 text-left
                  hover:bg-amber-900/15 transition-all active:scale-[0.98]">
                <span className="text-2xl">✍️</span>
                <div className="flex-1">
                  <p className="text-amber-400 font-black text-sm">
                    {pendingReviews.length} avis à laisser
                  </p>
                  <p className="text-obsidian-400 text-xs mt-0.5">
                    Donnez votre avis et recevez une offre exclusive — voir l'onglet Avis →
                  </p>
                </div>
              </button>
            )}

            {/* Empty state */}
            {history.length === 0 && (
              <div className="card-asaka p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <div className="text-salmon-500 font-bold text-base">Aucune commande</div>
                <div className="text-obsidian-400 text-sm mt-1">Vos commandes apparaîtront ici</div>
                <button onClick={() => navigate('menu')}
                  className="btn-primary px-6 py-2.5 text-sm mt-4">
                  Commander 🍣
                </button>
              </div>
            )}

            {/* Order cards — info only */}
            {history.map((order, i) => {
              const isCancelled = order.status === 'cancelled';
              return (
              <div key={i} className={`card-asaka p-4 ${isCancelled ? 'opacity-80' : ''}`}>
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-salmon-500 font-black text-sm">{order.id}</span>
                      {isCancelled ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                          bg-red-900/30 text-red-400 border border-red-800/30">
                          ✕ Annulée
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                          bg-green-900/30 text-green-400 border border-green-800/30">
                          ✓ Livrée
                        </span>
                      )}
                      {order.mode && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                          bg-obsidian-800/60 text-salmon-500 border border-obsidian-700/30">
                          {order.mode === 'delivery' ? '🛵 Livraison' : '🥡 À Emporter'}
                        </span>
                      )}
                      {order.review && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold
                          bg-amber-900/20 text-amber-500 border border-amber-800/30">
                          ⭐ Avis laissé
                        </span>
                      )}
                    </div>
                    <p className="text-obsidian-400 text-xs mt-1">{order.date}</p>
                  </div>
                  <span className={`font-black text-base flex-shrink-0 ml-3 ${
                    isCancelled ? 'text-obsidian-400 line-through' : 'text-champagne'
                  }`}>
                    {order.total} DH
                  </span>
                </div>

                {/* Items preview */}
                {order.items?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {order.items.slice(0, 4).map((name, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded-lg
                        bg-obsidian-900/60 border border-obsidian-700/30 text-salmon-500">
                        {name}
                      </span>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-[10px] px-2 py-1 rounded-lg
                        bg-obsidian-900/60 border border-obsidian-700/30 text-obsidian-400">
                        +{order.items.length - 4} autre{order.items.length - 4 > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}

                {/* Stars summary if review exists */}
                {order.review && (
                  <div className="flex items-center gap-1 pt-2 border-t border-obsidian-700/20">
                    <div className="flex">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className="text-xs">
                          {s <= order.review.stars ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                    {order.review.comment && (
                      <p className="text-obsidian-400 text-xs truncate ml-1">{order.review.comment}</p>
                    )}
                  </div>
                )}

                {/* ── Reorder actions ── */}
                <div className="flex gap-2 pt-3 mt-1 border-t border-obsidian-700/20">
                  {/* Reorder — same items loaded to cart */}
                  <button
                    onClick={() => {
                      const found   = [];
                      (order.items || []).forEach(name => {
                        const match = menuItems.find(m => m.name === name);
                        if (match) found.push(match);
                      });
                      if (found.length === 0) {
                        toast.error('Aucun article de cette commande n\'est encore au menu.');
                        return;
                      }
                      cartActions.clearCart();
                      found.forEach(item => cartActions.addToCart(item, 1));
                      navigate('cart');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3
                      rounded-xl border border-salmon-500/40 bg-salmon-500/10 text-salmon-500
                      text-xs font-bold hover:bg-salmon-500/20 transition-all active:scale-[0.97]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      className="w-3.5 h-3.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                    </svg>
                    {isCancelled ? 'Re-commander' : 'Commander à nouveau'}
                  </button>

                  {/* Modify — same items + go to menu to add more */}
                  {isCancelled && (
                    <button
                      onClick={() => {
                        const found = (order.items || [])
                          .map(name => menuItems.find(m => m.name === name))
                          .filter(Boolean);
                        cartActions.clearCart();
                        found.forEach(item => cartActions.addToCart(item, 1));
                        navigate('menu');
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3
                        rounded-xl border border-amber-700/35 bg-amber-900/10 text-amber-400
                        text-xs font-bold hover:bg-amber-900/20 transition-all active:scale-[0.97]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3.5 h-3.5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 5v14M5 12h14"/>
                      </svg>
                      Modifier &amp; ajouter
                    </button>
                  )}

                  {/* Browse menu from scratch */}
                  {!isCancelled && (
                    <button
                      onClick={() => navigate('menu')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3
                        rounded-xl border border-obsidian-700/40 bg-obsidian-800/40 text-salmon-500
                        text-xs font-bold hover:bg-obsidian-700/40 transition-all active:scale-[0.97]">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        className="w-3.5 h-3.5 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
                      </svg>
                      Depuis le menu
                    </button>
                  )}
                </div>

              </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════
            TAB: AVIS (standalone reviews)
        ══════════════════════════════════════════ */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Pending reviews — with CTA */}
            {pendingReviews.length > 0 && (
              <div className="card-asaka p-4 border border-amber-700/30">
                <h3 className="text-amber-400 font-black text-sm mb-1">
                  ✍️ Avis en attente ({pendingReviews.length})
                </h3>
                <p className="text-obsidian-400 text-xs mb-3">
                  Partagez votre expérience et recevez une offre exclusive pour chaque avis publié !
                </p>
                <div className="space-y-2">
                  {pendingReviews.map((order, i) => (
                    <div key={i}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl
                        border border-obsidian-700/30 bg-obsidian-900/40">
                      <div className="w-9 h-9 rounded-xl bg-obsidian-700 flex items-center
                        justify-center text-lg flex-shrink-0">
                        {order.mode === 'delivery' ? '🛵' : '🥡'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-champagne font-bold text-sm">{order.id}</div>
                        <div className="text-obsidian-400 text-xs">{order.date} · {order.total} DH</div>
                        {order.items?.length > 0 && (
                          <div className="text-obsidian-400 text-[10px] mt-0.5 truncate">
                            {order.items.slice(0, 2).join(', ')}
                            {order.items.length > 2 ? ` +${order.items.length - 2}` : ''}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setReviewingOrder(order)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl
                          border border-amber-700/40 bg-amber-900/10 text-amber-400 text-xs font-bold
                          hover:bg-amber-900/20 transition-all active:scale-95">
                        <span>✍️</span>
                        <span>Donner un avis</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed reviews */}
            {completedReviews.length > 0 && (
              <div className="card-asaka p-4">
                <h3 className="text-salmon-500 font-bold text-[10px] uppercase tracking-widest mb-3">
                  Mes avis publiés ({completedReviews.length})
                </h3>
                <div className="space-y-4">
                  {completedReviews.map((order, i) => (
                    <div key={i} className={`${i > 0 ? 'pt-4 border-t border-obsidian-700/20' : ''}`}>
                      {/* Order reference */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-salmon-500 font-bold text-xs">{order.id}</span>
                          <span className="text-obsidian-400 text-[10px]">{order.date}</span>
                        </div>
                        <span className="text-salmon-500 text-xs">{order.total} DH</span>
                      </div>
                      {/* Stars */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className="text-base">
                              {s <= order.review.stars ? '⭐' : '☆'}
                            </span>
                          ))}
                        </div>
                        <span className="text-obsidian-400 text-xs">{order.review.date}</span>
                      </div>
                      {/* Comment */}
                      {order.review.comment && (
                        <p className="text-salmon-500 text-sm leading-relaxed">
                          "{order.review.comment}"
                        </p>
                      )}
                      {/* Photos */}
                      {order.review.images?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {order.review.images.map((src, j) => (
                            <img key={j} src={src} alt=""
                              className="w-14 h-14 rounded-xl object-cover border border-obsidian-600/30" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {history.length === 0 && (
              <div className="card-asaka p-8 text-center">
                <div className="text-4xl mb-3">✍️</div>
                <div className="text-salmon-500 font-bold text-base">Aucun avis pour l'instant</div>
                <div className="text-obsidian-400 text-sm mt-1">
                  Passez votre première commande pour pouvoir laisser un avis
                </div>
                <button onClick={() => navigate('menu')}
                  className="btn-primary px-6 py-2.5 text-sm mt-4">
                  Commander 🍣
                </button>
              </div>
            )}

            {history.length > 0 && pendingReviews.length === 0 && completedReviews.length === 0 && (
              <div className="card-asaka p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-salmon-500 text-sm font-bold">Tous vos avis sont à jour !</p>
              </div>
            )}
          </div>
        )}
        {/* (Addresses managed via ⚙️ Settings) */}
        {activeTab === 'addresses_DISABLED' && (
          <div className="space-y-4">
            {/* Address cards */}
            {savedAddresses.length === 0 ? (
              <div className="card-asaka p-8 text-center">
                <div className="text-4xl mb-3">📍</div>
                <p className="text-salmon-500 font-bold text-base">Aucune adresse enregistrée</p>
                <p className="text-obsidian-400 text-sm mt-1">
                  Ajoutez une adresse pour commander plus rapidement
                </p>
                <button onClick={() => setShowAddAddr(true)}
                  className="btn-primary px-6 py-2.5 text-sm mt-4">
                  + Ajouter une adresse
                </button>
              </div>
            ) : (
              <>
                {savedAddresses.map((addr) => {
                  const isPrimary = addr.id === primaryId;
                  return (
                    <div key={addr.id}
                      className={`rounded-2xl border p-4 transition-all ${
                        isPrimary
                          ? 'border-salmon-500/50 bg-salmon-500/10'
                          : 'border-obsidian-700/40 bg-obsidian-800/30'
                      }`}>
                      {/* Header row */}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                          text-lg flex-shrink-0 ${
                          isPrimary ? 'bg-salmon-500/30' : 'bg-obsidian-700/40'
                        }`}>
                          {addr.gpsLink ? '📍' : '🏠'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-bold text-sm">{addr.name}</span>
                            {isPrimary && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-black
                                bg-salmon-500/30 text-salmon-500 border border-salmon-500/40">
                                ★ Principale
                              </span>
                            )}
                            {addr.gpsLink && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold
                                bg-green-900/30 text-green-400 border border-green-700/30">
                                GPS
                              </span>
                            )}
                          </div>
                          <p className="text-salmon-500 text-xs mt-1 leading-relaxed">
                            {addr.address}
                          </p>
                          {addr.gpsLink && (
                            <a href={addr.gpsLink} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-cyan-500 hover:text-cyan-300 mt-0.5
                                transition-colors inline-block">
                              Voir sur la carte ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Action row */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-obsidian-700/20">
                        {!isPrimary && (
                          <button onClick={() => handleSetPrimary(addr.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold
                              border border-obsidian-600/40 bg-obsidian-700/20 text-salmon-500
                              hover:bg-obsidian-600/30 hover:text-white transition-all active:scale-95">
                            ★ Définir comme principale
                          </button>
                        )}
                        <button onClick={() => handleDeleteAddress(addr.id)}
                          className="px-3 py-2 rounded-xl text-xs font-bold
                            border border-red-700/30 bg-red-900/10 text-red-400
                            hover:bg-red-900/20 transition-all active:scale-95">
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add new */}
                <button onClick={() => setShowAddAddr(true)}
                  className="w-full py-4 rounded-2xl border-2 border-dashed
                    border-obsidian-700/40 text-salmon-500 text-sm font-bold
                    hover:border-salmon-500/50 hover:text-salmon-500 transition-all">
                  + Ajouter une adresse
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {showAvatarPicker && (
        <AvatarPickerSheet
          customer={currentCustomer}
          onClose={() => setShowAvatarPicker(false)}
          onSave={handleAvatarSave}
        />
      )}

      {showSettings && (
        <SettingsSheet
          customer={currentCustomer}
          onClose={() => setShowSettings(false)}
          onChangeField={(field) => { setShowSettings(false); setChangeField(field); }}
          onGoogleConnect={handleGoogleConnect}
          onFacebookConnect={handleFacebookConnect}
          onPersist={persist}
        />
      )}

      {changeField && (
        <ChangeFieldModal
          field={changeField}
          current={currentCustomer[changeField]}
          onClose={() => setChangeField(null)}
          onSave={handleFieldSave}
        />
      )}

      {reviewingOrder && (
        <ReviewSheet
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmit={(review) => handleReviewSubmit(reviewingOrder.id, review)}
        />
      )}
    </div>
  );
};

export default CustomerProfile;

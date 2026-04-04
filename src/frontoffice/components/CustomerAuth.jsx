// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — CustomerAuth
//  Login + Signup modal, Asaka design
//  OWASP: sanitize, validate, rate limit
//  Phone: country code selector (Morocco default), all formats
// ═══════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';
import { useDragDismiss } from '../hooks/useDragDismiss';
import { sanitize, validateForm, rateLimiter } from '../../utils/security';
import { ACCOUNT_DISCOUNT } from '../../data/asakaData';
import {
  COUNTRY_CODES, DEFAULT_COUNTRY,
  normalizePhone, isValidPhone,
} from '../../data/countryCodes';
import { toast } from '../../utils/toast';

// ── Google Identity Services loader ─────────────────────────
const GOOGLE_CLIENT_ID   = import.meta.env?.VITE_GOOGLE_CLIENT_ID   || '';
const FACEBOOK_APP_ID    = import.meta.env?.VITE_FACEBOOK_APP_ID    || '';

function loadGsi() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) { resolve(window.google.accounts.id); return; }
    const s = document.createElement('script');
    s.src  = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => resolve(window.google?.accounts?.id);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

function decodeGoogleToken(token) {
  try {
    const payload = token.split('.')[1];
    const padded   = payload + '='.repeat((4 - payload.length % 4) % 4);
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
}

function loadFbSdk(appId) {
  return new Promise((resolve) => {
    if (window.FB) { resolve(window.FB); return; }
    window.fbAsyncInit = function () {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
      resolve(window.FB);
    };
    const s = document.createElement('script');
    s.src   = 'https://connect.facebook.net/fr_FR/sdk.js';
    s.async = true; s.defer = true;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

// ── Country Code Selector ─────────────────────────────────
const CountrySelector = ({ selected, onChange }) => {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const ref                 = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = query.trim()
    ? COUNTRY_CODES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial.includes(query) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : COUNTRY_CODES;

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="flex items-center gap-1.5 h-full px-3 py-2.5 rounded-l-xl
          border border-r-0 border-asaka-700/50 bg-asaka-700/40 hover:bg-asaka-700/60
          text-white transition-all min-w-[88px]">
        <span className="text-lg leading-none">{selected.flag}</span>
        <span className="text-sm font-bold text-asaka-300">{selected.dial}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`w-3 h-3 text-asaka-600 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-[200] mt-1 w-64 bg-asaka-800
          border border-asaka-700/50 rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: 'slideUp 0.15s ease-out' }}>
          {/* Search */}
          <div className="p-2 border-b border-asaka-700/30">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un pays…"
              className="w-full bg-asaka-900/60 border border-asaka-700/40 rounded-xl
                px-3 py-2 text-white text-xs placeholder:text-asaka-700 outline-none
                focus:border-asaka-500/60"
              autoFocus
            />
          </div>
          {/* List */}
          <div className="overflow-y-auto max-h-52">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-asaka-700 text-xs">Aucun résultat</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                    hover:bg-asaka-700/40 transition-colors text-sm ${
                    selected.code === c.code ? 'bg-asaka-700/30' : ''
                  }`}>
                  <span className="text-base w-6 text-center">{c.flag}</span>
                  <span className="flex-1 text-asaka-200 text-xs truncate">{c.name}</span>
                  <span className="text-asaka-500 font-bold text-xs flex-shrink-0">{c.dial}</span>
                  {selected.code === c.code && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                      className="w-3.5 h-3.5 text-asaka-400 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Auth Component ───────────────────────────────────
const CustomerAuth = ({ mode, setMode, onLogin, onSignup, onClose, frontCustomers = [] }) => {
  const { panelRef, dragHandleProps, panelDragProps } = useDragDismiss(onClose);
  const [form, setForm]           = useState({ name: '', email: '', phone: '', password: '' });
  const [country, setCountry]     = useState(DEFAULT_COUNTRY); // Morocco default
  const [errors, setErrors]       = useState({});
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const googleBtnRef              = useRef(null);
  const [gsiReady, setGsiReady]   = useState(false);

  // ── Address state (signup only) ──────────────────────────
  // addressMethod: null = pick method, 'typed' = show textarea, 'gps' = GPS flow
  const [addressMethod, setAddressMethod] = useState(null);
  const [typedAddress, setTypedAddress]   = useState('');
  // gpsState: 'idle' | 'loading' | 'found' | 'denied' | 'error'
  const [gpsState,    setGpsState]    = useState('idle');
  const [gpsResult,   setGpsResult]   = useState(null);   // { display, lat, lon, link }
  const [gpsApproved, setGpsApproved] = useState(false);

  const isLogin = mode === 'login';

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── Google GIS init ─────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGsi().then(gsi => {
      if (!gsi) return;
      gsi.initialize({
        client_id:             GOOGLE_CLIENT_ID,
        callback:              handleGoogleCredential,
        auto_select:           false,
        cancel_on_tap_outside: true,
      });
      setGsiReady(true);
    });
  }, []);

  useEffect(() => {
    if (!gsiReady || !googleBtnRef.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'filled_black', size: 'large', width: '100%',
      text:  isLogin ? 'signin_with' : 'signup_with', locale: 'fr',
    });
  }, [gsiReady, isLogin]);

  // ── Facebook ─────────────────────────────────────────────
  const handleFacebookLogin = async () => {
    if (fbLoading) return;
    if (!FACEBOOK_APP_ID) { toast.info('Connexion Facebook bientôt disponible.'); return; }
    setFbLoading(true);
    try {
      const FB = await loadFbSdk(FACEBOOK_APP_ID);
      if (!FB) { toast.error('SDK Facebook non disponible'); setFbLoading(false); return; }
      FB.login((response) => {
        if (response.authResponse) {
          FB.api('/me', { fields: 'name,email,id' }, (userData) => {
            const { name, email, id: facebookId } = userData;
            const existing = frontCustomers.find(
              c => c.email?.toLowerCase() === email?.toLowerCase() || c.facebookId === facebookId,
            );
            if (existing) {
              onLogin({ ...existing, facebookId });
              toast.success(`Bon retour, ${existing.name} ! 🍣`);
            } else {
              onSignup({ name: name || 'Client Asaka', email: email || '', phone: '', facebookId,
                phoneCountry: DEFAULT_COUNTRY.code });
              toast.success('Compte Facebook connecté ! Bienvenue 🍣');
            }
          });
        } else { toast.error('Connexion Facebook annulée'); }
        setFbLoading(false);
      }, { scope: 'email,public_profile' });
    } catch { toast.error('Erreur Facebook'); setFbLoading(false); }
  };

  // ── Google credential ────────────────────────────────────
  const handleGoogleCredential = (response) => {
    const payload = decodeGoogleToken(response.credential);
    if (!payload) { toast.error('Authentification Google échouée'); return; }
    const { email, name, sub: googleId } = payload;
    const existing = frontCustomers.find(c => c.email?.toLowerCase() === email?.toLowerCase());
    if (existing) {
      onLogin({ ...existing, googleId });
      toast.success(`Bon retour, ${existing.name} ! 🍣`);
    } else {
      onSignup({ name: name || email.split('@')[0], email, phone: '', googleId,
        phoneCountry: DEFAULT_COUNTRY.code });
      toast.success('Compte Google connecté ! Bienvenue 🍣');
    }
  };

  const update = (f, v) => {
    setForm(prev => ({ ...prev, [f]: v }));
    setErrors(prev => ({ ...prev, [f]: '' }));
  };

  // Build the full E.164 phone from form.phone + selected country
  const getFullPhone = () => normalizePhone(form.phone, country.dial);

  // ── Choose address method ─────────────────────────────────
  const chooseMethod = (method) => {
    setAddressMethod(method);
    if (method === 'gps') handleGps();
  };

  const resetAddressMethod = () => {
    setAddressMethod(null);
    setTypedAddress('');
    setGpsState('idle');
    setGpsResult(null);
    setGpsApproved(false);
  };

  // ── GPS detection (signup only) ──────────────────────────
  const handleGps = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas disponible sur ce navigateur.');
      setAddressMethod(null);
      return;
    }
    setGpsState('loading');
    setGpsResult(null);
    setGpsApproved(false);
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
          const display = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
          setGpsResult({ display, lat, lon, link });
        } catch {
          // Nominatim unavailable — fall back to raw coords
          setGpsResult({ display: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon, link });
        }
        setGpsState('found');
      },
      (err) => {
        setGpsState(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Build the savedAddresses array from what the user provided during signup
  const buildSignupAddresses = () => {
    const addrs = [];
    if (typedAddress.trim().length >= 5) {
      addrs.push({
        id:      `addr-t-${Date.now()}`,
        name:    'Adresse principale',
        address: typedAddress.trim(),
        gpsLink: '',
      });
    }
    if (gpsApproved && gpsResult) {
      addrs.push({
        id:      `addr-g-${Date.now() + 1}`,
        name:    'Ma position GPS',
        address: gpsResult.display,
        gpsLink: gpsResult.link,
      });
    }
    return addrs;
  };

  const validate = () => {
    const errs = {};
    if (!isLogin && !sanitize(form.name, 80).trim()) errs.name = 'Nom requis';
    if (!sanitize(form.email, 100).trim())                 errs.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (!form.phone.trim()) {
      errs.phone = 'Téléphone requis';
    } else if (!isValidPhone(form.phone, country.dial)) {
      errs.phone = `Numéro invalide pour ${country.name}`;
    }
    if (!form.password || form.password.length < 6) errs.password = 'Mot de passe (min 6 car.)';
    return errs;
  };

  const handleSubmit = () => {
    if (loading) return;
    if (!rateLimiter.check('auth', 5, 60000)) {
      toast.error('Trop de tentatives. Réessayez dans 1 minute.');
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    const email     = sanitize(form.email, 100).toLowerCase();
    const fullPhone = getFullPhone();

    setTimeout(() => {
      if (isLogin) {
        const found = frontCustomers.find(
          c => c.email?.toLowerCase() === email && c.password === form.password,
        );
        if (found) {
          onLogin(found);
          toast.success(`Bon retour, ${found.name} !`);
        } else {
          setErrors({ email: 'Email ou mot de passe incorrect' });
          setLoading(false);
        }
      } else {
        const exists = frontCustomers.some(c => c.email?.toLowerCase() === email);
        if (exists) {
          setErrors({ email: 'Un compte existe déjà avec cet email' });
          setLoading(false);
          return;
        }
        onSignup({
          name:           sanitize(form.name, 80),
          email,
          phone:          fullPhone,              // stored as E.164
          phoneCountry:   country.code,           // ISO code, e.g. 'MA'
          password:       form.password,
          savedAddresses: buildSignupAddresses(), // typed + GPS-approved addresses
        });
        toast.success('Compte créé ! Bienvenue chez Asaka Sushi 🍣');
      }
    }, 600);
  };

  // ── Phone input placeholder ────────────────────────────
  const getPhonePlaceholder = () => {
    if (country.code === 'MA') return '06 77 88 99 66';
    return 'Numéro local';
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center" style={{ zIndex: 60 }}>
        <div
          ref={panelRef}
          className="bg-asaka-800 border border-asaka-600/40 rounded-t-3xl sm:rounded-3xl
            w-full sm:max-w-md mx-auto overflow-y-auto max-h-[92vh] sm:max-h-[90vh]"
          style={{ animation: 'slideUp 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards' }}
          {...panelDragProps}>

          {/* Handle — drag to dismiss on mobile */}
          <div className="flex justify-center pt-3 sm:hidden" {...dragHandleProps}>
            <div className="w-10 h-1.5 bg-asaka-500 rounded-full" />
          </div>

          <div className="px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-white font-black text-xl">
                  {isLogin ? 'Connexion' : 'Créer un compte'}
                </h2>
                <p className="text-asaka-muted text-sm mt-0.5">
                  {isLogin
                    ? 'Accédez à votre espace fidélité'
                    : `Profitez de ${ACCOUNT_DISCOUNT}% de réduction dès la 1ère commande`}
                </p>
              </div>
              <button onClick={onClose}
                className="w-9 h-9 rounded-xl glass-light flex items-center justify-center
                  text-asaka-muted hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Discount teaser (signup only) */}
            {!isLogin && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5
                bg-asaka-500/10 border border-asaka-500/25">
                <span className="text-2xl">💎</span>
                <div>
                  <div className="text-asaka-300 font-bold text-sm">
                    -{ACCOUNT_DISCOUNT}% sur vos commandes
                  </div>
                  <div className="text-asaka-muted text-xs">
                    + Points fidélité dès votre 1ère commande
                  </div>
                </div>
              </div>
            )}

            {/* Social sign-in buttons */}
            <div className="mb-5 space-y-2.5">
              {/* Google */}
              {GOOGLE_CLIENT_ID ? (
                <>
                  <div ref={googleBtnRef} className="w-full" />
                  {!gsiReady && (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl
                      glass-light text-asaka-muted text-sm">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Chargement Google…
                    </div>
                  )}
                </>
              ) : (
                <button type="button"
                  onClick={() => toast.info('Connexion Google bientôt disponible.')}
                  className="w-full flex items-center gap-3 py-3.5 rounded-xl
                    border border-asaka-700/40 bg-asaka-800/60 text-asaka-300 font-semibold
                    text-sm hover:border-asaka-600/50 transition-all active:scale-[0.98]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 ml-3" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="flex-1 text-center">
                    {isLogin ? 'Continuer avec Google' : "S'inscrire avec Google"}
                  </span>
                </button>
              )}

              {/* Facebook */}
              <button type="button" onClick={handleFacebookLogin} disabled={fbLoading}
                className="w-full flex items-center gap-3 py-3.5 rounded-xl
                  border border-[#1877f2]/30 bg-[#1877f2]/10 text-[#64a5f5] font-semibold
                  text-sm hover:bg-[#1877f2]/20 transition-all active:scale-[0.98]
                  disabled:opacity-50">
                {fbLoading ? (
                  <svg className="animate-spin w-5 h-5 ml-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 ml-3" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
                <span className="flex-1 text-center">
                  {fbLoading ? 'Connexion…' : (isLogin ? 'Continuer avec Facebook' : "S'inscrire avec Facebook")}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-asaka-700/50" />
                <span className="text-asaka-700 text-xs font-semibold">ou</span>
                <div className="flex-1 h-px bg-asaka-700/50" />
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                    Nom complet *
                  </label>
                  <input type="text" value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Votre prénom et nom"
                    className={`input-asaka ${errors.name ? 'border-red-500/60' : ''}`}
                    autoComplete="name" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                  Email *
                </label>
                <input type="email" value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="votre@email.com"
                  className={`input-asaka ${errors.email ? 'border-red-500/60' : ''}`}
                  autoComplete="email" />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Phone field with country code selector */}
              <div>
                <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                  Téléphone *
                </label>
                <div className={`flex rounded-xl border overflow-visible ${
                  errors.phone ? 'border-red-500/60' : 'border-asaka-700/50'
                }`}>
                  <CountrySelector selected={country} onChange={c => {
                    setCountry(c);
                    setErrors(prev => ({ ...prev, phone: '' }));
                  }} />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder={getPhonePlaceholder()}
                    className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm
                      placeholder:text-asaka-700 outline-none rounded-r-xl min-w-0"
                    autoComplete="tel-national"
                  />
                </div>
                {/* Morocco format hints */}
                {country.code === 'MA' && (
                  <p className="text-asaka-700 text-[10px] mt-1">
                    Formats acceptés : 0677889966 · 00212677889966 · +212677889966
                  </p>
                )}
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-asaka-muted text-xs font-semibold mb-1.5 block">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    placeholder="Minimum 6 caractères"
                    className={`input-asaka pr-11 ${errors.password ? 'border-red-500/60' : ''}`}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-asaka-muted
                      hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className="w-4 h-4">
                      {showPass ? (
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* ── Address section (signup only) ─────────────── */}
              {!isLogin && (
                <div>
                  <label className="text-asaka-muted text-xs font-semibold mb-2 flex items-center gap-1.5">
                    Adresse de livraison
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-asaka-700/50
                      text-asaka-600 font-normal">Optionnel</span>
                  </label>

                  {/* ── Step 1: choose method ──────────────────── */}
                  {!addressMethod && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => chooseMethod('typed')}
                        className="flex flex-col items-center justify-center gap-2 py-4 px-3
                          rounded-2xl border-2 border-asaka-700/50 bg-asaka-800/40
                          hover:border-asaka-500/60 hover:bg-asaka-700/30
                          text-asaka-300 transition-all group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                          className="w-6 h-6 group-hover:text-white transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
                        </svg>
                        <span className="text-xs font-bold">Saisir l'adresse</span>
                        <span className="text-[10px] text-asaka-600 text-center leading-tight">
                          Tapez votre adresse manuellement
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => chooseMethod('gps')}
                        className="flex flex-col items-center justify-center gap-2 py-4 px-3
                          rounded-2xl border-2 border-asaka-700/50 bg-asaka-800/40
                          hover:border-asaka-500/60 hover:bg-asaka-700/30
                          text-asaka-300 transition-all group">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                          className="w-6 h-6 group-hover:text-white transition-colors">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                        </svg>
                        <span className="text-xs font-bold">Position GPS</span>
                        <span className="text-[10px] text-asaka-600 text-center leading-tight">
                          Détection automatique
                        </span>
                      </button>
                    </div>
                  )}

                  {/* ── Step 2a: typed address ─────────────────── */}
                  {addressMethod === 'typed' && (
                    <div>
                      <textarea
                        value={typedAddress}
                        onChange={e => setTypedAddress(e.target.value)}
                        placeholder="Ex : 12 Rue Ibn Battouta, Agadir, 80000"
                        rows={2}
                        className="input-asaka resize-none text-sm leading-relaxed"
                        autoComplete="street-address"
                        autoFocus
                      />
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-asaka-700 text-[10px]">
                          Enregistrée automatiquement dans votre profil.
                        </p>
                        <button type="button" onClick={resetAddressMethod}
                          className="text-[10px] text-asaka-600 hover:text-asaka-400 transition-colors underline">
                          Changer de méthode
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2b: GPS flow ──────────────────────── */}
                  {addressMethod === 'gps' && (
                    <div>
                      {/* Loading state */}
                      {gpsState === 'loading' && (
                        <div className="rounded-2xl border border-asaka-600/40 bg-asaka-800/40
                          p-5 text-center">
                          <div className="flex items-center justify-center mb-3">
                            <div className="relative w-12 h-12">
                              <svg className="animate-spin w-12 h-12 text-asaka-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-20" cx="12" cy="12" r="10"
                                  stroke="currentColor" strokeWidth="3"/>
                                <path className="opacity-80" fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-lg">📍</span>
                            </div>
                          </div>
                          <p className="text-white font-bold text-sm mb-1">
                            Détection en cours…
                          </p>
                          <p className="text-asaka-500 text-xs leading-relaxed">
                            Nous récupérons votre position. Veuillez patienter, cela peut prendre quelques secondes.
                          </p>
                        </div>
                      )}

                      {/* GPS error: denied */}
                      {gpsState === 'denied' && (
                        <div className="rounded-2xl border border-amber-600/40 bg-amber-900/10 p-4">
                          <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                              className="w-4 h-4 flex-shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                            </svg>
                            Accès refusé
                          </p>
                          <p className="text-amber-300/70 text-[11px] mb-3">
                            Activez la localisation dans les paramètres de votre navigateur, puis réessayez.
                          </p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setGpsState('idle'); handleGps(); }}
                              className="flex-1 py-2 rounded-xl bg-asaka-600/30 border border-asaka-600/40
                                text-asaka-300 text-xs font-bold hover:bg-asaka-600/50 transition-all">
                              Réessayer
                            </button>
                            <button type="button" onClick={resetAddressMethod}
                              className="flex-1 py-2 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                              Saisir manuellement
                            </button>
                          </div>
                        </div>
                      )}

                      {/* GPS error: generic */}
                      {gpsState === 'error' && (
                        <div className="rounded-2xl border border-red-600/30 bg-red-900/10 p-4">
                          <p className="text-red-400 text-xs font-semibold mb-2">Impossible d'obtenir la position</p>
                          <p className="text-red-300/60 text-[11px] mb-3">
                            Une erreur s'est produite. Réessayez ou saisissez l'adresse manuellement.
                          </p>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => { setGpsState('idle'); handleGps(); }}
                              className="flex-1 py-2 rounded-xl bg-asaka-600/30 border border-asaka-600/40
                                text-asaka-300 text-xs font-bold hover:bg-asaka-600/50 transition-all">
                              Réessayer
                            </button>
                            <button type="button" onClick={resetAddressMethod}
                              className="flex-1 py-2 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                              Saisir manuellement
                            </button>
                          </div>
                        </div>
                      )}

                      {/* GPS result — requires explicit approval */}
                      {gpsState === 'found' && gpsResult && (
                        <div className={`rounded-2xl border p-4 transition-all ${
                          gpsApproved
                            ? 'border-green-600/50 bg-green-900/15'
                            : 'border-asaka-600/40 bg-asaka-800/40'
                        }`}>
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-asaka-600/50 flex items-center
                              justify-center flex-shrink-0 text-lg">
                              {gpsApproved ? '✅' : '📍'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-bold mb-0.5">
                                {gpsApproved ? 'Position enregistrée !' : 'Position détectée'}
                              </p>
                              <p className="text-asaka-400 text-[11px] leading-relaxed">
                                {gpsResult.display}
                              </p>
                            </div>
                          </div>

                          {!gpsApproved ? (
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setGpsApproved(true)}
                                className="flex-1 py-2.5 rounded-xl bg-asaka-500/20 border border-asaka-500/40
                                  text-asaka-200 text-xs font-bold hover:bg-asaka-500/30 transition-all">
                                ✓ Approuver et enregistrer
                              </button>
                              <button type="button" onClick={resetAddressMethod}
                                className="px-3 py-2.5 rounded-xl bg-asaka-800/60 border border-asaka-700/40
                                  text-asaka-500 text-xs font-bold hover:text-asaka-300 transition-all">
                                Ignorer
                              </button>
                            </div>
                          ) : (
                            <button type="button"
                              onClick={() => { setGpsApproved(false); setGpsState('idle'); setGpsResult(null); }}
                              className="text-[10px] text-asaka-700 hover:text-red-400 transition-colors">
                              Retirer cette adresse GPS
                            </button>
                          )}
                        </div>
                      )}

                      {/* Change method link (when idle — shouldn't normally show) */}
                      {gpsState === 'idle' && (
                        <button type="button" onClick={resetAddressMethod}
                          className="w-full text-center text-xs text-asaka-600 hover:text-asaka-400
                            transition-colors mt-1">
                          ← Changer de méthode
                        </button>
                      )}

                      {/* Always show change method at bottom when not loading */}
                      {gpsState !== 'loading' && gpsState !== 'idle' && (
                        <button type="button" onClick={resetAddressMethod}
                          className="mt-2 text-[10px] text-asaka-700 hover:text-asaka-500 transition-colors block">
                          ← Changer de méthode
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2
                disabled:opacity-50">
              {loading ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                isLogin ? '✓ Se connecter' : '🍣 Créer mon compte'
              )}
            </button>

            {/* Switch mode */}
            <p className="text-center text-asaka-muted text-sm mt-4">
              {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              {' '}
              <button onClick={() => { setMode(isLogin ? 'signup' : 'login'); setErrors({}); }}
                className="text-asaka-300 font-bold hover:text-white transition-colors">
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerAuth;

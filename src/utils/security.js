/**
 * ASAKA SUSHI — Security Utilities
 * OWASP-compliant input sanitization & validation
 * Applied on ALL user inputs: forms, search, URLs
 */

// ─── Sanitize ─────────────────────────────────────────────────────────────────
/**
 * Strip HTML tags, trim whitespace, limit length
 * Prevents XSS and oversized inputs
 */
export const sanitize = (value, maxLength = 500) => {
  if (typeof value !== 'string') return '';
  return value
    .trim()
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')      // strip JS protocol
    .replace(/on\w+\s*=/gi, '')        // strip inline event handlers
    .slice(0, maxLength);
};

/**
 * Sanitize an entire form object
 */
export const sanitizeForm = (data) => {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    clean[key] = typeof value === 'string' ? sanitize(value) : value;
  }
  return clean;
};

// ─── Validators ───────────────────────────────────────────────────────────────
export const validators = {
  /**
   * Phone: accepts all common formats — Moroccan local (06/07), 00-prefix, +prefix,
   * or any international number in E.164. Normalizes before checking.
   * Moroccan formats accepted:
   *   0677889966 | 00212677889966 | +212677889966
   *   0777889966 | 00212777889966 | +212777889966
   */
  phone: (v) => {
    if (!v) return false;
    const clean = v.trim().replace(/[\s\-\.\(\)]/g, '');
    // E.164 already
    if (/^\+[1-9]\d{6,14}$/.test(clean))    return true;
    // 00-prefix international
    if (/^00[1-9]\d{5,13}$/.test(clean))     return true;
    // Moroccan local 06/07 XXXXXXXX
    if (/^0[67]\d{8}$/.test(clean))          return true;
    // Bare local digits (7-12 digits, needs dial code from UI)
    if (/^\d{7,12}$/.test(clean))            return true;
    return false;
  },

  /**
   * Full name: 2+ chars, letters + spaces + hyphens only
   */
  name: (v) => v && v.trim().length >= 2 && /^[\p{L}\s\-'.]+$/u.test(v.trim()),

  /**
   * Email (basic, not required in most forms)
   */
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),

  /**
   * Address: at least 10 characters
   */
  address: (v) => v && sanitize(v).length >= 10,

  /**
   * Non-empty string
   */
  required: (v) => v !== null && v !== undefined && String(v).trim().length > 0,

  /**
   * Search query: max 100 chars, no suspicious patterns
   */
  searchQuery: (v) => {
    if (!v || v.trim().length === 0) return true; // empty is OK
    const clean = sanitize(v, 100);
    return clean.length > 0 && !/[<>{}\\]/.test(clean);
  },

  /**
   * Tip amount: number 0-500
   */
  tip: (v) => {
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 500;
  },

  /**
   * Quantity: integer 1-99
   */
  quantity: (v) => {
    const n = parseInt(v);
    return !isNaN(n) && n >= 1 && n <= 99;
  },
};

// ─── Form Schema Validation ────────────────────────────────────────────────────
/**
 * Validate a form against a schema
 * Returns { valid: boolean, errors: { fieldName: errorMessage } }
 */
export const validateForm = (data, schema) => {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    for (const rule of rules) {
      const result = rule.validate(value);
      if (!result) {
        errors[field] = rule.message;
        break;
      }
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
};

// ─── Rate Limiter (UI-side) ────────────────────────────────────────────────────
/**
 * Simple in-memory rate limiter for form submissions
 * Prevents double-submit and spam clicking
 */
const rateLimits = new Map();

export const rateLimiter = {
  /**
   * Check if action is allowed (max `limit` calls per `windowMs`)
   */
  check: (key, limit = 3, windowMs = 60000) => {
    const now = Date.now();
    const record = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    if (record.count >= limit) return false;

    record.count += 1;
    rateLimits.set(key, record);
    return true;
  },

  reset: (key) => rateLimits.delete(key),
};

// ─── Order Schemas ─────────────────────────────────────────────────────────────
export const takeawaySchema = {
  name: [
    { validate: validators.required, message: 'Le nom est requis — veuillez saisir votre prénom et nom' },
    { validate: validators.name,     message: 'Nom invalide — minimum 2 caractères, lettres uniquement' },
  ],
  phone: [
    { validate: validators.required, message: 'Le numéro de téléphone est requis' },
    {
      validate: validators.phone,
      message:  'Numéro de téléphone invalide — formats acceptés : 0677889966 · 00212677889966 · +212677889966',
    },
  ],
  pickupTime: [
    { validate: validators.required, message: 'Choisissez un créneau de retrait' },
  ],
};

export const deliverySchema = {
  name: [
    { validate: validators.required, message: 'Le nom est requis — veuillez saisir votre prénom et nom' },
    { validate: validators.name,     message: 'Nom invalide — minimum 2 caractères, lettres uniquement' },
  ],
  phone: [
    { validate: validators.required, message: 'Le numéro de téléphone est requis' },
    {
      validate: validators.phone,
      message:  'Numéro de téléphone invalide — formats acceptés : 0677889966 · 00212677889966 · +212677889966',
    },
  ],
  // Address / GPS validated inline (combined check)
};

// ─── GPS Helper ───────────────────────────────────────────────────────────────
/**
 * Get GPS coordinates and generate Google Maps link
 * Returns Promise<{ link, lat, lng } | null>
 */
export const getGpsLink = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      resolve(null); return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        resolve({
          lat,
          lng,
          link: `https://maps.google.com/?q=${lat},${lng}`,
        });
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 },
    );
  });
};

// ─── WhatsApp Message Builder ─────────────────────────────────────────────────
/**
 * Build the pre-filled WhatsApp order message
 * items format: [{ name, qty, price }] — flat objects
 */
export const buildWhatsAppMessage = ({
  restaurantPhone,
  customerName,
  customerPhone,
  mode,
  items = [],
  total = 0,
  tip = 0,
  pickupTime,
  address,
}) => {
  const cartLines = items
    .map(i => `• ${i.qty}× ${i.name} — ${(i.price * i.qty).toFixed(0)} DH`)
    .join('\n');

  const grandTotal = total + (parseFloat(tip) || 0);
  const modeLabel  = mode === 'takeaway' ? '🥡 À Emporter' : '🛵 Livraison';

  const lines = [
    '🍱 *Nouvelle Commande — Asaka Sushi*',
    '',
    `👤 ${sanitize(customerName || '', 60)}`,
    `📞 ${sanitize(customerPhone || '', 20)}`,
    `${modeLabel}${pickupTime ? ` · ⏰ ${pickupTime}` : ''}`,
    mode === 'delivery' && address ? `📍 ${sanitize(address, 300)}` : null,
    '',
    '🛒 *Articles :*',
    cartLines || '—',
    '',
    `💰 Total : ${grandTotal} DH`,
    parseFloat(tip) > 0 ? `🙏 Pourboire : ${tip} DH` : null,
    '',
    '✅ En attente de confirmation',
  ].filter(l => l !== null).join('\n');

  const waNum = (restaurantPhone || import.meta.env?.VITE_RESTAURANT_WHATSAPP || '+212600000000')
    .replace(/\D/g, '');
  return `https://wa.me/${waNum}?text=${encodeURIComponent(lines)}`;
};

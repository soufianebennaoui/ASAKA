// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Country Codes
//  Full list of dial codes with flag emojis (French names)
//  Morocco is first and default.
//  Used in: CustomerAuth signup, CustomerProfile phone change
// ═══════════════════════════════════════════════════════════

export const COUNTRY_CODES = [
  // ── Maghreb & Middle East (most relevant for this context) ──
  { code: 'MA', name: 'Maroc',               flag: '🇲🇦', dial: '+212' },
  { code: 'DZ', name: 'Algérie',             flag: '🇩🇿', dial: '+213' },
  { code: 'TN', name: 'Tunisie',             flag: '🇹🇳', dial: '+216' },
  { code: 'LY', name: 'Libye',               flag: '🇱🇾', dial: '+218' },
  { code: 'EG', name: 'Égypte',              flag: '🇪🇬', dial: '+20'  },
  { code: 'SA', name: 'Arabie Saoudite',     flag: '🇸🇦', dial: '+966' },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪', dial: '+971' },
  { code: 'QA', name: 'Qatar',               flag: '🇶🇦', dial: '+974' },
  { code: 'KW', name: 'Koweït',              flag: '🇰🇼', dial: '+965' },
  { code: 'BH', name: 'Bahreïn',             flag: '🇧🇭', dial: '+973' },
  { code: 'OM', name: 'Oman',                flag: '🇴🇲', dial: '+968' },
  { code: 'JO', name: 'Jordanie',            flag: '🇯🇴', dial: '+962' },
  { code: 'LB', name: 'Liban',               flag: '🇱🇧', dial: '+961' },
  { code: 'SY', name: 'Syrie',               flag: '🇸🇾', dial: '+963' },
  { code: 'IQ', name: 'Irak',                flag: '🇮🇶', dial: '+964' },
  { code: 'PS', name: 'Palestine',           flag: '🇵🇸', dial: '+970' },
  { code: 'YE', name: 'Yémen',               flag: '🇾🇪', dial: '+967' },
  { code: 'SD', name: 'Soudan',              flag: '🇸🇩', dial: '+249' },
  { code: 'MR', name: 'Mauritanie',          flag: '🇲🇷', dial: '+222' },
  { code: 'SN', name: 'Sénégal',             flag: '🇸🇳', dial: '+221' },
  { code: 'ML', name: 'Mali',                flag: '🇲🇱', dial: '+223' },

  // ── Europe ──────────────────────────────────────────────
  { code: 'FR', name: 'France',              flag: '🇫🇷', dial: '+33'  },
  { code: 'ES', name: 'Espagne',             flag: '🇪🇸', dial: '+34'  },
  { code: 'BE', name: 'Belgique',            flag: '🇧🇪', dial: '+32'  },
  { code: 'NL', name: 'Pays-Bas',            flag: '🇳🇱', dial: '+31'  },
  { code: 'DE', name: 'Allemagne',           flag: '🇩🇪', dial: '+49'  },
  { code: 'IT', name: 'Italie',              flag: '🇮🇹', dial: '+39'  },
  { code: 'PT', name: 'Portugal',            flag: '🇵🇹', dial: '+351' },
  { code: 'GB', name: 'Royaume-Uni',         flag: '🇬🇧', dial: '+44'  },
  { code: 'CH', name: 'Suisse',              flag: '🇨🇭', dial: '+41'  },
  { code: 'SE', name: 'Suède',               flag: '🇸🇪', dial: '+46'  },
  { code: 'NO', name: 'Norvège',             flag: '🇳🇴', dial: '+47'  },
  { code: 'DK', name: 'Danemark',            flag: '🇩🇰', dial: '+45'  },
  { code: 'FI', name: 'Finlande',            flag: '🇫🇮', dial: '+358' },
  { code: 'AT', name: 'Autriche',            flag: '🇦🇹', dial: '+43'  },
  { code: 'PL', name: 'Pologne',             flag: '🇵🇱', dial: '+48'  },
  { code: 'RU', name: 'Russie',              flag: '🇷🇺', dial: '+7'   },
  { code: 'TR', name: 'Turquie',             flag: '🇹🇷', dial: '+90'  },

  // ── Africa ──────────────────────────────────────────────
  { code: 'NG', name: 'Nigéria',             flag: '🇳🇬', dial: '+234' },
  { code: 'GH', name: 'Ghana',               flag: '🇬🇭', dial: '+233' },
  { code: 'CI', name: 'Côte d\'Ivoire',      flag: '🇨🇮', dial: '+225' },
  { code: 'CM', name: 'Cameroun',            flag: '🇨🇲', dial: '+237' },
  { code: 'ET', name: 'Éthiopie',            flag: '🇪🇹', dial: '+251' },
  { code: 'KE', name: 'Kenya',               flag: '🇰🇪', dial: '+254' },
  { code: 'ZA', name: 'Afrique du Sud',      flag: '🇿🇦', dial: '+27'  },
  { code: 'TZ', name: 'Tanzanie',            flag: '🇹🇿', dial: '+255' },

  // ── Americas ─────────────────────────────────────────────
  { code: 'US', name: 'États-Unis',          flag: '🇺🇸', dial: '+1'   },
  { code: 'CA', name: 'Canada',              flag: '🇨🇦', dial: '+1'   },
  { code: 'MX', name: 'Mexique',             flag: '🇲🇽', dial: '+52'  },
  { code: 'BR', name: 'Brésil',              flag: '🇧🇷', dial: '+55'  },
  { code: 'AR', name: 'Argentine',           flag: '🇦🇷', dial: '+54'  },

  // ── Asia & Oceania ────────────────────────────────────────
  { code: 'CN', name: 'Chine',               flag: '🇨🇳', dial: '+86'  },
  { code: 'JP', name: 'Japon',               flag: '🇯🇵', dial: '+81'  },
  { code: 'IN', name: 'Inde',                flag: '🇮🇳', dial: '+91'  },
  { code: 'PK', name: 'Pakistan',            flag: '🇵🇰', dial: '+92'  },
  { code: 'BD', name: 'Bangladesh',          flag: '🇧🇩', dial: '+880' },
  { code: 'ID', name: 'Indonésie',           flag: '🇮🇩', dial: '+62'  },
  { code: 'MY', name: 'Malaisie',            flag: '🇲🇾', dial: '+60'  },
  { code: 'SG', name: 'Singapour',           flag: '🇸🇬', dial: '+65'  },
  { code: 'AU', name: 'Australie',           flag: '🇦🇺', dial: '+61'  },
  { code: 'NZ', name: 'Nouvelle-Zélande',    flag: '🇳🇿', dial: '+64'  },
];

// Morocco is default
export const DEFAULT_COUNTRY = COUNTRY_CODES[0];

// ── Phone normalization ─────────────────────────────────────
/**
 * Normalizes any phone input to E.164 format (+XXXXXXXXXXX).
 * Handles all common Moroccan formats and international formats.
 *
 * Supported patterns:
 *  - `0677889966`      → +212677889966   (Moroccan local 06/07)
 *  - `00212677889966`  → +212677889966   (international 00-prefix)
 *  - `+212677889966`   → +212677889966   (already E.164)
 *  - `677889966`       → +{dialCode}677889966  (local without 0, + selected country)
 *  - `+33612345678`    → unchanged
 */
export const normalizePhone = (raw, selectedDial = '+212') => {
  if (!raw) return '';
  // Strip spaces, dashes, dots, parens
  const clean = raw.trim().replace(/[\s\-\.\(\)]/g, '');

  // Already full E.164: +XXXXXXXXXXX
  if (/^\+[1-9]\d{5,14}$/.test(clean)) return clean;

  // 00-prefix international: 00XXXXXXXXXXX
  if (/^00[1-9]\d{5,13}$/.test(clean)) return '+' + clean.slice(2);

  // Moroccan local with 0-prefix: 06/07 + 8 digits = 10 digits
  if (/^0[67]\d{8}$/.test(clean)) return '+212' + clean.slice(1);

  // Local number without country code (user typed just the significant digits)
  // e.g., 677889966 with Morocco selected → +212677889966
  if (/^\d{6,12}$/.test(clean) && selectedDial) {
    // If the number starts with 0, strip it (common in many countries)
    const significant = clean.startsWith('0') ? clean.slice(1) : clean;
    return selectedDial + significant;
  }

  return clean; // pass through as-is
};

/**
 * Returns true if the raw input (after normalization) is a valid E.164 number.
 */
export const isValidPhone = (raw, selectedDial = '+212') => {
  const normalized = normalizePhone(raw, selectedDial);
  return /^\+[1-9]\d{6,14}$/.test(normalized);
};

/**
 * Formats a normalized E.164 number for display.
 * +212677889966 → +212 6 77 88 99 66
 */
export const formatPhoneDisplay = (e164) => {
  if (!e164 || !e164.startsWith('+')) return e164;
  // Find matching country
  const country = COUNTRY_CODES.find(c => e164.startsWith(c.dial));
  if (!country) return e164;
  const local = e164.slice(country.dial.length);
  // Group in pairs after the first digit for readability
  const grouped = local.replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5').trim();
  return `${country.dial} ${grouped}`;
};

/**
 * Given an E.164 number, find the matching country object.
 */
export const getCountryFromPhone = (e164) => {
  if (!e164) return DEFAULT_COUNTRY;
  // Sort by dial length desc to match more specific codes first (+212 before +21)
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  return sorted.find(c => e164.startsWith(c.dial)) || DEFAULT_COUNTRY;
};

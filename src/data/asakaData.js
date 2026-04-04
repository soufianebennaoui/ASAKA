// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — Menu & Loyalty Data
//  Keep structure compatible with all components
//  Real menu content to be provided by client
// ═══════════════════════════════════════════════════════════

// ── Loyalty Constants (configurable from backoffice) ──────
export const POINTS_PER_DH = 1;        // 1 point per 1 DH spent
export const POINTS_VALUE   = 0.1;     // 1 point = 0.10 DH discount
export const MIN_REDEEM     = 100;     // Minimum 100 points to redeem
export const ACCOUNT_DISCOUNT = 10;   // % discount for registered accounts (backoffice)

// ── Loyalty Tiers (6-level, BO-configurable) ───────────────
// Each tier unlocks on reaching `minOrders`.
// `reward` describes the one-time gift on the milestone order.
// `discount` is the ongoing % off from that tier onward.
// All fields can be overridden per-client from the back-office.
export const BADGES = [
  {
    name:       'Regular',
    minOrders:  0,
    emoji:      '🍽️',
    color:      'from-asaka-700 to-asaka-600',
    textColor:  'text-asaka-muted',
    bgClass:    'bg-asaka-800 border-asaka-700/40',
    discount:   0,
    reward:     null,
    perks:      'Bienvenue chez Asaka Sushi !',
    description:'Point de départ de votre aventure sushi.',
  },
  {
    name:       'Bronze',
    minOrders:  10,
    emoji:      '🥢',
    color:      'from-amber-700 to-amber-900',
    textColor:  'text-amber-400',
    bgClass:    'bg-amber-950/40 border-amber-800/40',
    discount:   5,
    reward: {
      label:   '-5% sur la commande #11',
      details: '+ 1 amuse-bouche au choix',
      emoji:   '🎁',
    },
    perks:      '-5% + amuse-bouche offert',
    description:'Débloqué à 10 commandes. Votre 11ème commande vous offre 5% de réduction et un amuse-bouche de votre choix.',
  },
  {
    name:       'Argent',
    minOrders:  25,
    emoji:      '🌸',
    color:      'from-slate-300 to-slate-500',
    textColor:  'text-slate-300',
    bgClass:    'bg-slate-800/40 border-slate-600/30',
    discount:   10,
    reward: {
      label:   '-10% sur la commande #26',
      details: '+ 2 amuse-bouches au choix',
      emoji:   '🌸',
    },
    perks:      '-10% + 2 amuse-bouches offerts',
    description:'Débloqué à 25 commandes. Votre 26ème commande vous offre 10% de réduction et 2 amuse-bouches.',
  },
  {
    name:       'Or',
    minOrders:  50,
    emoji:      '⭐',
    color:      'from-yellow-400 to-amber-500',
    textColor:  'text-yellow-400',
    bgClass:    'bg-yellow-950/40 border-yellow-700/30',
    discount:   15,
    reward: {
      label:   '-15% sur la commande #51',
      details: '+ plateau sushi + amuse-bouche + livraison offerte 1 semaine',
      emoji:   '🏆',
    },
    perks:      '-15% + plateau sushi + 1 sem. livraison gratuite',
    description:'Débloqué à 50 commandes. Votre 51ème commande : 15% off, un plateau sushi, un amuse-bouche, et la livraison gratuite pendant 1 semaine.',
  },
  {
    name:       'Diamant',
    minOrders:  75,
    emoji:      '💎',
    color:      'from-cyan-300 to-blue-500',
    textColor:  'text-cyan-300',
    bgClass:    'bg-cyan-950/40 border-cyan-700/30',
    discount:   20,
    reward: {
      label:   '-20% sur la commande #76',
      details: '+ 2 semaines livraison gratuite + commande pour 2 offerte',
      emoji:   '💎',
    },
    perks:      '-20% + 2 sem. livraison + commande pour 2',
    description:'Débloqué à 75 commandes. Votre 76ème commande : 20% off, 2 semaines de livraison gratuite, et une commande complète pour 2 personnes (amuse-bouches, sushis, dessert, boisson).',
  },
  {
    name:       'Sushiman',
    minOrders:  100,
    emoji:      '🍣',
    color:      'from-asaka-300 to-asaka-500',
    textColor:  'text-asaka-200',
    bgClass:    'bg-asaka-700/40 border-asaka-400/30',
    discount:   25,
    reward: {
      label:   '-25% sur la commande #101',
      details: '+ livraison gratuite 1 mois + commande familiale pour 4',
      emoji:   '👑',
    },
    perks:      '-25% + livraison 1 mois + commande famille pour 4',
    description:'Débloqué à 100 commandes. Votre 101ème commande : 25% off, livraison gratuite pendant 1 mois, et une commande famille pour 4 personnes (amuse-bouches, soupes, sushis, dessert, boisson).',
  },
];

// ── Get current badge based on total orders ───────────────
export const getBadge = (totalOrders) => {
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (totalOrders >= BADGES[i].minOrders) return BADGES[i];
  }
  return BADGES[0];
};

// ── Get next badge and orders remaining ───────────────────
export const getNextBadge = (totalOrders) => {
  const current = getBadge(totalOrders);
  const idx     = BADGES.findIndex(b => b.name === current.name);
  if (idx === BADGES.length - 1) return null;
  const next      = BADGES[idx + 1];
  const remaining = next.minOrders - totalOrders;
  return { badge: next, remaining };
};

// ── Coupon utilities ──────────────────────────────────────
/**
 * Generates a welcome coupon for new account registrations.
 * Stored in customer.coupons[] and applicable to any future order.
 */
export const generateWelcomeCoupon = () => ({
  id:          `WELCOME-${Date.now()}`,
  code:        'BIENVENUE10',
  type:        'percent',
  value:       ACCOUNT_DISCOUNT,          // 10 (from backoffice constant)
  description: `-${ACCOUNT_DISCOUNT}% de bienvenue — merci de nous rejoindre !`,
  minOrder:    0,
  expiresAt:   null,                      // null = no expiry (BO can set one later)
  usedAt:      null,
  usedOnOrder: null,
  source:      'welcome',
});

/**
 * Validates a coupon against the current order subtotal.
 * @returns {{ valid: boolean, reason?: string }}
 */
export const isCouponValid = (coupon, orderSubtotal = 0) => {
  if (!coupon)            return { valid: false, reason: 'Coupon introuvable' };
  if (coupon.usedAt)      return { valid: false, reason: 'Ce coupon a déjà été utilisé' };
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, reason: 'Ce coupon a expiré' };
  }
  if (coupon.minOrder > 0 && orderSubtotal < coupon.minOrder) {
    return { valid: false, reason: `Commande minimum de ${coupon.minOrder} DH requise` };
  }
  return { valid: true };
};

/**
 * Computes the discount amount for a coupon.
 * @returns {number} discount in DH
 */
export const computeCouponDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (coupon.type === 'percent') return Math.round(subtotal * coupon.value / 100);
  return Math.min(coupon.value, subtotal);
};

// ── Menu Categories ───────────────────────────────────────
export const CATEGORIES = [
  { id: 'formules',   name: 'Formules Midi',                  emoji: '🍱' },
  { id: 'tapas',      name: 'Tapas & Nems',                   emoji: '🍤' },
  { id: 'soupes',     name: 'Soupes',                         emoji: '🍲' },
  { id: 'salades',    name: 'Salades',                        emoji: '🥗' },
  { id: 'maki',       name: 'Maki & Nigiri & Temaki',         emoji: '🍣' },
  { id: 'california', name: 'California (4 pièces)',          emoji: '🍙' },
  { id: 'speciaux',   name: 'Spéciaux (4 pièces)',            emoji: '✨' },
  { id: 'sushi-fry',  name: 'Sushi Fry',                      emoji: '🌟' },
  { id: 'aromaki',    name: 'Aromaki (6 pièces)',              emoji: '🎨' },
  { id: 'chirashi',   name: 'Chirashi & Sashimi & Tartare',   emoji: '🍛' },
  { id: 'poke',       name: 'Poke & Boom Cheese',             emoji: '💥' },
  { id: 'brochettes', name: 'Brochettes & Tempura',           emoji: '🔥' },
  { id: 'wok',        name: 'Wok & Thaï',                     emoji: '🍜' },
  { id: 'plateaux',   name: 'Plateaux & Boxes',               emoji: '📦' },
  { id: 'bentos',     name: 'Bentos',                         emoji: '🎁' },
  { id: 'desserts',   name: 'Desserts & Boissons',            emoji: '🍰' },
];

// ── Menu Items ────────────────────────────────────────────
// NOTE: Prices in MAD. Replace with real content from client.
export const MENU_ITEMS = [

  // ─── FORMULES MIDI (12h-15h, Lundi–Vendredi) ──────────
  {
    id: 'menu-thai',
    category: 'formules',
    name: 'Menu Thaï',
    price: 90,
    description: 'Soupe dégustation, Mini salade Viet, Plats thaï (boeuf, poulets), 2 beignets crevettes, 2 croquettes fromage',
    ingredients: ['soupe', 'salade vietnamienne', 'boeuf', 'poulet', 'crevettes', 'fromage'],
    pieces: null,
    emoji: '🌶️',
    isSignature: false,
    isPopular: true,
    tags: ['viande', 'crevettes', 'thai'],
    image: null,
  },
  {
    id: 'menu-brochettes',
    category: 'formules',
    name: 'Menu Brochettes',
    price: 85,
    description: 'Soupe dégustation, Mini salade Viet, Brochettes mixtes (boeuf fromage, tsucan, saumon), 3 Nems poulets, 2 croquettes fromage',
    ingredients: ['soupe', 'salade vietnamienne', 'boeuf', 'fromage', 'saumon', 'poulet', 'crevettes'],
    pieces: null,
    emoji: '🔥',
    isSignature: false,
    isPopular: true,
    tags: ['viande', 'saumon', 'brochettes'],
    image: null,
  },
  {
    id: 'menu-wok',
    category: 'formules',
    name: 'Menu Wok',
    price: 80,
    description: 'Soupe dégustation, Mini salade Viet, Wok au choix (poulet, boeuf, poisson), 3 Nems poulet',
    ingredients: ['soupe', 'salade vietnamienne', 'wok', 'poulet', 'boeuf', 'poisson'],
    pieces: null,
    emoji: '🍜',
    isSignature: false,
    isPopular: false,
    tags: ['wok', 'poulet', 'boeuf'],
    image: null,
  },
  {
    id: 'menu-sushi',
    category: 'formules',
    name: 'Menu Sushi',
    price: 95,
    description: 'Soupe dégustation, Mini salade Viet, 12 pièces sushi au choix, Maki concombre',
    ingredients: ['soupe', 'salade vietnamienne', 'saumon', 'thon', 'crevettes', 'riz', 'nori'],
    pieces: 14,
    emoji: '🍣',
    isSignature: true,
    isPopular: true,
    tags: ['sushi', 'saumon', 'thon'],
    image: null,
  },

  // ─── TAPAS & NEMS ──────────────────────────────────────
  {
    id: 'nems-poulet',
    category: 'tapas',
    name: 'Nems Poulet (4 pcs)',
    price: 45,
    description: 'Rouleaux croustillants au poulet, sauce nuoc-mâm',
    ingredients: ['poulet', 'vermicelle', 'légumes', 'sauce nuoc-mâm'],
    pieces: 4,
    emoji: '🍤',
    isSignature: false,
    isPopular: true,
    tags: ['poulet', 'frit'],
    image: null,
  },
  {
    id: 'beignets-crevettes',
    category: 'tapas',
    name: 'Beignets Crevettes (4 pcs)',
    price: 55,
    description: 'Crevettes tempura légères et croustillantes, sauce cocktail',
    ingredients: ['crevettes', 'pâte tempura', 'sauce cocktail'],
    pieces: 4,
    emoji: '🦐',
    isSignature: false,
    isPopular: true,
    tags: ['crevettes', 'frit', 'tempura'],
    image: null,
  },
  {
    id: 'croquettes-fromage',
    category: 'tapas',
    name: 'Croquettes Fromage (4 pcs)',
    price: 40,
    description: 'Croquettes fondantes au fromage fondu, croustillant doré',
    ingredients: ['fromage', 'chapelure', 'œuf'],
    pieces: 4,
    emoji: '🧀',
    isSignature: false,
    isPopular: false,
    tags: ['fromage', 'frit', 'végétarien'],
    image: null,
  },
  {
    id: 'gyoza',
    category: 'tapas',
    name: 'Gyoza (6 pcs)',
    price: 55,
    description: 'Raviolis japonais poêlés, farce poulet & légumes, sauce soja-gingembre',
    ingredients: ['poulet', 'chou', 'oignon vert', 'gingembre', 'sauce soja'],
    pieces: 6,
    emoji: '🥟',
    isSignature: false,
    isPopular: true,
    tags: ['japonais', 'poulet', 'vapeur'],
    image: null,
  },
  {
    id: 'edamame',
    category: 'tapas',
    name: 'Edamame',
    price: 35,
    description: 'Fèves de soja vapeur, fleur de sel',
    ingredients: ['edamame', 'sel'],
    pieces: null,
    emoji: '🫘',
    isSignature: false,
    isPopular: false,
    tags: ['végétarien', 'vapeur'],
    image: null,
  },

  // ─── SOUPES ────────────────────────────────────────────
  {
    id: 'soupe-miso',
    category: 'soupes',
    name: 'Soupe Miso',
    price: 35,
    description: 'Soupe miso traditionnelle, tofu, wakamé, oignon vert',
    ingredients: ['pâte miso', 'tofu', 'algue wakamé', 'oignon vert', 'dashi'],
    pieces: null,
    emoji: '🍲',
    isSignature: false,
    isPopular: true,
    tags: ['japonais', 'végétarien', 'chaud'],
    image: null,
  },
  {
    id: 'soupe-ramen',
    category: 'soupes',
    name: 'Ramen Asaka',
    price: 75,
    description: 'Bouillon tonkotsu, nouilles ramen, porc effiloché, œuf mollet, nori, maïs',
    ingredients: ['bouillon tonkotsu', 'ramen', 'porc', 'œuf', 'maïs', 'nori', 'menma'],
    pieces: null,
    emoji: '🍜',
    isSignature: true,
    isPopular: true,
    tags: ['japonais', 'porc', 'chaud', 'signature'],
    image: null,
  },
  {
    id: 'soupe-degustation',
    category: 'soupes',
    name: 'Soupe Dégustation',
    price: 40,
    description: 'Soupe légère aux légumes, volaille et vermicelles',
    ingredients: ['poulet', 'légumes', 'vermicelles', 'gingembre'],
    pieces: null,
    emoji: '🥣',
    isSignature: false,
    isPopular: false,
    tags: ['léger', 'poulet'],
    image: null,
  },

  // ─── SALADES ───────────────────────────────────────────
  {
    id: 'salade-viet',
    category: 'salades',
    name: 'Salade Vietnamienne',
    price: 45,
    description: 'Salade fraîche aux vermicelles, herbes aromatiques, sauce nuoc-mâm',
    ingredients: ['vermicelle', 'carotte', 'concombre', 'menthe', 'coriandre', 'cacahuètes'],
    pieces: null,
    emoji: '🥗',
    isSignature: false,
    isPopular: true,
    tags: ['végétarien', 'frais'],
    image: null,
  },
  {
    id: 'salade-saumon',
    category: 'salades',
    name: 'Salade Saumon',
    price: 65,
    description: 'Salade verte, saumon fumé, avocat, radis daïkon, vinaigrette sésame',
    ingredients: ['saumon fumé', 'avocat', 'daïkon', 'sésame', 'citron', 'salade verte'],
    pieces: null,
    emoji: '🐟',
    isSignature: false,
    isPopular: false,
    tags: ['saumon', 'frais', 'avocat'],
    image: null,
  },

  // ─── MAKI & NIGIRI & TEMAKI ────────────────────────────
  {
    id: 'maki-saumon',
    category: 'maki',
    name: 'Maki Saumon (6 pcs)',
    price: 45,
    description: 'Riz vinaigré, saumon frais, nori',
    ingredients: ['riz', 'saumon', 'nori'],
    pieces: 6,
    emoji: '🍣',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'classique'],
    image: null,
  },
  {
    id: 'maki-thon',
    category: 'maki',
    name: 'Maki Thon (6 pcs)',
    price: 45,
    description: 'Riz vinaigré, thon rouge frais, nori',
    ingredients: ['riz', 'thon', 'nori'],
    pieces: 6,
    emoji: '🍣',
    isSignature: false,
    isPopular: true,
    tags: ['thon', 'classique'],
    image: null,
  },
  {
    id: 'maki-concombre',
    category: 'maki',
    name: 'Maki Concombre (6 pcs)',
    price: 35,
    description: 'Riz vinaigré, concombre frais, nori',
    ingredients: ['riz', 'concombre', 'nori'],
    pieces: 6,
    emoji: '🥒',
    isSignature: false,
    isPopular: false,
    tags: ['végétarien', 'léger'],
    image: null,
  },
  {
    id: 'nigiri-saumon',
    category: 'maki',
    name: 'Nigiri Saumon (2 pcs)',
    price: 50,
    description: 'Boudin de riz vinaigré, tranche de saumon frais',
    ingredients: ['riz', 'saumon'],
    pieces: 2,
    emoji: '🍱',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'classique', 'nigiri'],
    image: null,
  },
  {
    id: 'temaki-saumon',
    category: 'maki',
    name: 'Temaki Saumon',
    price: 55,
    description: 'Cône de nori, saumon, riz, avocat, concombre',
    ingredients: ['nori', 'riz', 'saumon', 'avocat', 'concombre'],
    pieces: 1,
    emoji: '🌮',
    isSignature: false,
    isPopular: false,
    tags: ['saumon', 'cône'],
    image: null,
  },

  // ─── CALIFORNIA (4 pcs) ────────────────────────────────
  {
    id: 'cali-avocat',
    category: 'california',
    name: 'California Avocat',
    price: 45,
    description: 'Riz envers, avocat, concombre, sésame',
    ingredients: ['riz', 'avocat', 'concombre', 'sésame', 'nori'],
    pieces: 4,
    emoji: '🥑',
    isSignature: false,
    isPopular: true,
    tags: ['végétarien', 'avocat'],
    image: null,
  },
  {
    id: 'cali-saumon',
    category: 'california',
    name: 'California Saumon',
    price: 55,
    description: 'Riz envers, saumon, avocat, concombre, tobiko',
    ingredients: ['riz', 'saumon', 'avocat', 'concombre', 'tobiko', 'nori'],
    pieces: 4,
    emoji: '🍣',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'avocat'],
    image: null,
  },
  {
    id: 'cali-crevettes',
    category: 'california',
    name: 'California Crevettes',
    price: 55,
    description: 'Riz envers, crevettes tempura, avocat, sauce sriracha',
    ingredients: ['riz', 'crevettes', 'avocat', 'sriracha', 'nori'],
    pieces: 4,
    emoji: '🦐',
    isSignature: false,
    isPopular: false,
    tags: ['crevettes', 'épicé'],
    image: null,
  },
  {
    id: 'cali-asaka',
    category: 'california',
    name: 'California Asaka ✨',
    price: 65,
    description: 'Création signature : saumon, cream cheese, avocat, tobiko orange, sauce miel-soja',
    ingredients: ['riz', 'saumon', 'cream cheese', 'avocat', 'tobiko', 'miel', 'soja'],
    pieces: 4,
    emoji: '⭐',
    isSignature: true,
    isPopular: true,
    tags: ['signature', 'saumon', 'avocat'],
    image: null,
  },

  // ─── SPÉCIAUX (4 pcs) ─────────────────────────────────
  {
    id: 'special-dragon',
    category: 'speciaux',
    name: 'Dragon Roll',
    price: 75,
    description: 'Riz envers, crevettes tempura, avocat tranché, sauce anguille',
    ingredients: ['riz', 'crevettes', 'avocat', 'sauce anguille', 'sésame'],
    pieces: 4,
    emoji: '🐉',
    isSignature: true,
    isPopular: true,
    tags: ['signature', 'crevettes', 'avocat'],
    image: null,
  },
  {
    id: 'special-volcano',
    category: 'speciaux',
    name: 'Volcano Roll',
    price: 80,
    description: 'Saumon grillé, fromage fondu, sauce volcano épicée, oignon croustillant',
    ingredients: ['saumon', 'cream cheese', 'sauce épicée', 'oignon frit', 'riz'],
    pieces: 4,
    emoji: '🌋',
    isSignature: true,
    isPopular: true,
    tags: ['signature', 'saumon', 'épicé', 'chaud'],
    image: null,
  },
  {
    id: 'special-rainbow',
    category: 'speciaux',
    name: 'Rainbow Roll',
    price: 85,
    description: '6 variétés de poissons disposées en arc-en-ciel, avocat',
    ingredients: ['saumon', 'thon', 'daurade', 'crevettes', 'avocat', 'riz', 'nori'],
    pieces: 4,
    emoji: '🌈',
    isSignature: false,
    isPopular: true,
    tags: ['mixte', 'premium'],
    image: null,
  },

  // ─── SUSHI FRY ─────────────────────────────────────────
  {
    id: 'fry-saumon',
    category: 'sushi-fry',
    name: 'Sushi Fry Saumon (4 pcs)',
    price: 65,
    description: 'California frit en tempura doré, saumon, avocat, sauce spicy',
    ingredients: ['riz', 'saumon', 'avocat', 'pâte tempura', 'sauce spicy'],
    pieces: 4,
    emoji: '✨',
    isSignature: false,
    isPopular: true,
    tags: ['frit', 'saumon', 'chaud'],
    image: null,
  },
  {
    id: 'fry-poulet',
    category: 'sushi-fry',
    name: 'Sushi Fry Poulet (4 pcs)',
    price: 60,
    description: 'California frit en tempura, poulet katsu, sauce teriyaki',
    ingredients: ['riz', 'poulet', 'teriyaki', 'pâte tempura', 'sésame'],
    pieces: 4,
    emoji: '🍗',
    isSignature: false,
    isPopular: false,
    tags: ['frit', 'poulet', 'chaud'],
    image: null,
  },

  // ─── AROMAKI (6 pcs) ───────────────────────────────────
  {
    id: 'aromaki-saumon',
    category: 'aromaki',
    name: 'Aromaki Saumon',
    price: 70,
    description: 'Maki enveloppé dans soja papier, saumon, avocat, cream cheese, sauce fumée',
    ingredients: ['soja papier', 'riz', 'saumon', 'avocat', 'cream cheese'],
    pieces: 6,
    emoji: '🎨',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'avocat', 'premium'],
    image: null,
  },
  {
    id: 'aromaki-asaka',
    category: 'aromaki',
    name: 'Aromaki Asaka Signature',
    price: 80,
    description: 'Création exclusive : saumon flambé, truffe noire, cream cheese, yuzu',
    ingredients: ['soja papier', 'riz', 'saumon', 'truffe', 'cream cheese', 'yuzu'],
    pieces: 6,
    emoji: '🏆',
    isSignature: true,
    isPopular: true,
    tags: ['signature', 'saumon', 'premium', 'exclusif'],
    image: null,
  },

  // ─── CHIRASHI & SASHIMI & TARTARE ─────────────────────
  {
    id: 'chirashi-saumon',
    category: 'chirashi',
    name: 'Chirashi Saumon',
    price: 95,
    description: 'Bol de riz vinaigré, tranches de saumon frais, tobiko, sésame, wasabi',
    ingredients: ['riz', 'saumon', 'tobiko', 'sésame', 'wasabi', 'gingembre mariné'],
    pieces: null,
    emoji: '🍛',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'bol', 'frais'],
    image: null,
  },
  {
    id: 'sashimi-mix',
    category: 'chirashi',
    name: 'Sashimi Mix (9 pcs)',
    price: 110,
    description: 'Sélection de 3 poissons : saumon, thon, daurade, servis avec soja et wasabi',
    ingredients: ['saumon', 'thon', 'daurade', 'wasabi', 'gari'],
    pieces: 9,
    emoji: '🐟',
    isSignature: false,
    isPopular: true,
    tags: ['poisson', 'frais', 'premium'],
    image: null,
  },
  {
    id: 'tartare-saumon',
    category: 'chirashi',
    name: 'Tartare Saumon Avocat',
    price: 85,
    description: 'Tartare de saumon coupé au couteau, avocat, échalotes, citron vert, tobiko',
    ingredients: ['saumon', 'avocat', 'échalotes', 'citron vert', 'tobiko', 'soja'],
    pieces: null,
    emoji: '🥑',
    isSignature: true,
    isPopular: true,
    tags: ['saumon', 'avocat', 'frais', 'signature'],
    image: null,
  },

  // ─── POKE & BOOM CHEESE ────────────────────────────────
  {
    id: 'poke-saumon',
    category: 'poke',
    name: 'Poke Saumon',
    price: 90,
    description: 'Bol hawaïen : riz, saumon, edamame, carotte, avocat, sauce poke maison',
    ingredients: ['riz', 'saumon', 'edamame', 'carotte', 'avocat', 'sauce poke', 'sésame'],
    pieces: null,
    emoji: '🌺',
    isSignature: false,
    isPopular: true,
    tags: ['bol', 'hawaïen', 'saumon'],
    image: null,
  },
  {
    id: 'boom-cheese',
    category: 'poke',
    name: 'Boom Cheese Roll (4 pcs)',
    price: 75,
    description: 'Roll crémeux au cream cheese fondu et sauce boom épicée, crevettes, avocat',
    ingredients: ['cream cheese', 'crevettes', 'avocat', 'sauce boom', 'riz', 'nori'],
    pieces: 4,
    emoji: '💥',
    isSignature: true,
    isPopular: true,
    tags: ['créatif', 'épicé', 'crevettes'],
    image: null,
  },

  // ─── BROCHETTES & TEMPURA ──────────────────────────────
  {
    id: 'brochette-boeuf',
    category: 'brochettes',
    name: 'Brochettes Bœuf Fromage (3 pcs)',
    price: 70,
    description: 'Brochettes de bœuf mariné, fromage fondu, sauce teriyaki',
    ingredients: ['bœuf', 'fromage', 'poivron', 'sauce teriyaki', 'oignon'],
    pieces: 3,
    emoji: '🥩',
    isSignature: false,
    isPopular: true,
    tags: ['bœuf', 'fromage', 'grillé'],
    image: null,
  },
  {
    id: 'brochette-saumon',
    category: 'brochettes',
    name: 'Brochettes Saumon Tsucan (3 pcs)',
    price: 75,
    description: 'Brochettes de saumon mariné tsucan, sauce citron-herbes',
    ingredients: ['saumon', 'marinade tsucan', 'citron', 'herbes'],
    pieces: 3,
    emoji: '🐟',
    isSignature: false,
    isPopular: false,
    tags: ['saumon', 'grillé'],
    image: null,
  },
  {
    id: 'tempura-legumes',
    category: 'brochettes',
    name: 'Tempura Légumes (6 pcs)',
    price: 55,
    description: 'Légumes de saison en tempura légère, sauce tentsuyu',
    ingredients: ['courgette', 'poivron', 'champignon', 'patate douce', 'pâte tempura'],
    pieces: 6,
    emoji: '🥦',
    isSignature: false,
    isPopular: false,
    tags: ['végétarien', 'tempura', 'frit'],
    image: null,
  },

  // ─── WOK & THAÏ ────────────────────────────────────────
  {
    id: 'wok-poulet',
    category: 'wok',
    name: 'Wok Poulet',
    price: 75,
    description: 'Poulet sauté au wok, légumes croquants, sauce soja-sésame, riz blanc',
    ingredients: ['poulet', 'poivron', 'champignon', 'bok choy', 'sauce soja', 'sésame', 'riz'],
    pieces: null,
    emoji: '🍗',
    isSignature: false,
    isPopular: true,
    tags: ['poulet', 'wok', 'légumes'],
    image: null,
  },
  {
    id: 'wok-crevettes',
    category: 'wok',
    name: 'Wok Crevettes',
    price: 85,
    description: 'Crevettes sautées au wok, sauce thaï, nouilles de riz',
    ingredients: ['crevettes', 'nouilles riz', 'sauce thaï', 'citronelle', 'gingembre'],
    pieces: null,
    emoji: '🦐',
    isSignature: false,
    isPopular: false,
    tags: ['crevettes', 'wok', 'thaï'],
    image: null,
  },
  {
    id: 'pad-thai',
    category: 'wok',
    name: 'Pad Thaï Crevettes',
    price: 90,
    description: 'Pad Thaï traditionnel, crevettes, œuf, cacahuètes, sauce tamarin, lime',
    ingredients: ['crevettes', 'nouilles riz', 'œuf', 'cacahuètes', 'tamarin', 'lime', 'oignon vert'],
    pieces: null,
    emoji: '🍜',
    isSignature: false,
    isPopular: true,
    tags: ['crevettes', 'thaï', 'classique'],
    image: null,
  },

  // ─── PLATEAUX & BOXES ──────────────────────────────────
  {
    id: 'plateau-decouverte',
    category: 'plateaux',
    name: 'Plateau Découverte (24 pcs)',
    price: 180,
    description: 'Assortiment : 8 maki saumon, 4 California avocat, 4 nigiri saumon, 4 nems, 4 gyoza',
    ingredients: ['saumon', 'avocat', 'riz', 'nori', 'poulet', 'légumes'],
    pieces: 24,
    emoji: '📦',
    isSignature: false,
    isPopular: true,
    tags: ['partage', 'découverte', 'mixte'],
    image: null,
  },
  {
    id: 'box-asaka',
    category: 'plateaux',
    name: 'Box Asaka Premium (32 pcs)',
    price: 280,
    description: 'Sélection premium du chef : maki, california, spéciaux, sashimi, aromaki signature',
    ingredients: ['saumon', 'thon', 'crevettes', 'avocat', 'cream cheese', 'truffe'],
    pieces: 32,
    emoji: '🏆',
    isSignature: true,
    isPopular: true,
    tags: ['premium', 'partage', 'signature'],
    image: null,
  },
  {
    id: 'box-solo',
    category: 'plateaux',
    name: 'Box Solo (16 pcs)',
    price: 130,
    description: 'Box individuelle : 6 maki, 4 california, 4 spéciaux, 2 nigiri',
    ingredients: ['saumon', 'avocat', 'riz', 'nori'],
    pieces: 16,
    emoji: '🎁',
    isSignature: false,
    isPopular: true,
    tags: ['solo', 'pratique'],
    image: null,
  },

  // ─── BENTOS ────────────────────────────────────────────
  {
    id: 'bento-poulet',
    category: 'bentos',
    name: 'Bento Poulet Teriyaki',
    price: 95,
    description: 'Riz, poulet teriyaki, salade, maki x4, soupe miso, gari',
    ingredients: ['poulet', 'sauce teriyaki', 'riz', 'maki', 'soupe miso'],
    pieces: null,
    emoji: '🎁',
    isSignature: false,
    isPopular: true,
    tags: ['poulet', 'complet'],
    image: null,
  },
  {
    id: 'bento-saumon',
    category: 'bentos',
    name: 'Bento Saumon Grillé',
    price: 110,
    description: 'Riz, filet de saumon grillé, salade, maki x4, soupe miso, dessert',
    ingredients: ['saumon', 'riz', 'maki', 'soupe miso', 'salade', 'dessert'],
    pieces: null,
    emoji: '🐟',
    isSignature: false,
    isPopular: true,
    tags: ['saumon', 'complet'],
    image: null,
  },

  // ─── DESSERTS & BOISSONS ───────────────────────────────
  {
    id: 'mochi-saumon',
    category: 'desserts',
    name: 'Mochi Glace (3 pcs)',
    price: 45,
    description: 'Mochi japonais fourrés à la glace : vanille, framboise, matcha',
    ingredients: ['farine mochi', 'glace vanille', 'glace framboise', 'glace matcha'],
    pieces: 3,
    emoji: '🍡',
    isSignature: false,
    isPopular: true,
    tags: ['dessert', 'japonais', 'glace'],
    image: null,
  },
  {
    id: 'fondant-matcha',
    category: 'desserts',
    name: 'Fondant Matcha',
    price: 50,
    description: 'Fondant coulant au thé matcha, glace vanille, coulis de framboise',
    ingredients: ['matcha', 'chocolat blanc', 'glace vanille', 'framboise'],
    pieces: null,
    emoji: '🍵',
    isSignature: true,
    isPopular: true,
    tags: ['dessert', 'matcha', 'chaud'],
    image: null,
  },
  {
    id: 'thé-japonais',
    category: 'desserts',
    name: 'Thé Japonais',
    price: 25,
    description: 'Sélection : Matcha, Sencha, Genmaicha, Hojicha',
    ingredients: ['thé japonais'],
    pieces: null,
    emoji: '🍵',
    isSignature: false,
    isPopular: false,
    tags: ['boisson', 'chaud', 'japonais'],
    image: null,
  },
  {
    id: 'limonade-yuzu',
    category: 'desserts',
    name: 'Limonade Yuzu',
    price: 35,
    description: 'Limonade maison au yuzu et gingembre, légèrement pétillante',
    ingredients: ['yuzu', 'gingembre', 'eau pétillante', 'miel'],
    pieces: null,
    emoji: '🍋',
    isSignature: true,
    isPopular: true,
    tags: ['boisson', 'frais', 'maison'],
    image: null,
  },
  {
    id: 'sake',
    category: 'desserts',
    name: 'Saké Chaud / Froid',
    price: 45,
    description: 'Saké traditionnel japonais servi chaud ou froid',
    ingredients: ['saké'],
    pieces: null,
    emoji: '🍶',
    isSignature: false,
    isPopular: false,
    tags: ['boisson', 'alcool', 'japonais'],
    image: null,
  },
];

// ── Featured items (backoffice-configurable) ──────────────
// IDs of items shown in homepage search suggestions
export const FEATURED_ITEMS = [
  'cali-asaka', 'volcano-roll', 'box-asaka', 'aromaki-asaka',
  'tartare-saumon', 'fondant-matcha', 'poke-saumon', 'boom-cheese',
];

// ── Restaurant Info ───────────────────────────────────────
export const RESTAURANT = {
  name:      import.meta.env.VITE_RESTAURANT_NAME      || 'Asaka Sushi',
  whatsapp:  import.meta.env.VITE_RESTAURANT_WHATSAPP  || '+212600000000',
  phone:     import.meta.env.VITE_RESTAURANT_PHONE     || '+212522000000',
  address:   import.meta.env.VITE_RESTAURANT_ADDRESS   || 'Sidi Maarouf, Casablanca',
  instagram: import.meta.env.VITE_RESTAURANT_INSTAGRAM || '@asakasushi',
  facebook:  import.meta.env.VITE_RESTAURANT_FACEBOOK  || 'https://facebook.com/asakasushi',
  placeId:   import.meta.env.VITE_GOOGLE_MAPS_PLACE_ID || '',
  mapsUrl:   'https://maps.google.com/?q=Asaka+Sushi+Casablanca',
  hours: {
    weekdays: { open: '12:00', close: '23:00', label: 'Lun–Ven : 12h – 23h' },
    weekend:  { open: '11:00', close: '00:00', label: 'Sam–Dim : 11h – 00h' },
    formuleMidi: 'Formules Midi disponibles Lun–Ven, 12h–15h',
  },
};

// ── Order config (backoffice-configurable) ────────────────
export const ORDER_CONFIG = {
  minDeliveryOrder: 80,      // MAD
  deliveryFee: 20,           // MAD (0 = free)
  estimatedTakeaway: 20,     // minutes
  estimatedDelivery: 45,     // minutes
  tipOptions: [0, 5, 10, 15],
  confirmationDelay: 30,     // seconds for post-order countdown
};

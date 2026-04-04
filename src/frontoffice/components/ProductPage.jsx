import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingBag, Flame, Leaf, AlertCircle, ChefHat } from 'lucide-react';

const ProductPage = ({
  navigate,
  itemId,
  addToCart,
  cart = [],
  language = 'fr',
  isLight = false,
  getDiscountedPrice,
  activeDiscount = 0,
  menuItems = [],
  openLightbox,
}) => {
  const item = menuItems.find(i => i.id === itemId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!item) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-20 ${isLight ? 'bg-gray-50' : 'bg-[#0d0d0d]'}`}>
        <div className="text-center px-6">
          <div className="text-8xl mb-6 animate-bounce">🍣</div>
          <p className={`text-xl font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-zinc-300'}`}>
            {language === 'ar' ? 'الطبق غير موجود' : language === 'en' ? 'Item Not Found' : 'Plat introuvable'}
          </p>
          <p className={`text-sm mb-6 ${isLight ? 'text-gray-500' : 'text-zinc-500'}`}>
            {language === 'ar' ? 'تعذر العثور على هذا العنصر' : language === 'en' ? 'This item could not be found' : 'Ce plat n\'a pas pu être trouvé'}
          </p>
          <button
            onClick={() => navigate('menu')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full transition-all shadow-lg shadow-orange-500/30"
          >
            ← {language === 'ar' ? 'القائمة' : language === 'en' ? 'Back to Menu' : 'Retour au Menu'}
          </button>
        </div>
      </div>
    );
  }

  // ── Safe field access with fallbacks ────────────────────────────────────
  const ingredients   = Array.isArray(item.ingredients) ? item.ingredients : [];
  const allergens     = Array.isArray(item.allergens) ? item.allergens : [];
  const tags          = Array.isArray(item.tags) ? item.tags : [];
  const gradient      = item.gradient   || 'from-orange-500 to-red-600';
  const description   = item.longDescription || item.description || '';
  const calories      = item.calories   || 0;
  const pieces        = item.pieces     || null;
  const servings      = item.servings   || null;
  const volume        = item.volume     || null;
  const isSpicy       = !!(item.spicy   || tags.includes('epice') || tags.includes('épicé'));
  const isVegetarian  = !!(item.vegetarian || tags.includes('vege'));
  const isSignature   = item.isSignature || false;
  const isPopular     = item.isPopular   || false;

  const cartEntry = cart.find(c => c.item.id === item.id);
  const cartQty   = cartEntry ? cartEntry.qty : 0;

  const discountedPrice = getDiscountedPrice ? getDiscountedPrice(item.price) : item.price;
  const hasDiscount     = activeDiscount > 0 && discountedPrice < item.price;

  const related = menuItems
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (addToCart) addToCart(item, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
    setQty(1);
  };

  // ── Theme helpers ────────────────────────────────────────────────────────
  const pageBg        = isLight ? 'bg-gray-50'                                   : 'bg-[#0d0d0d]';
  const cardBg        = isLight ? 'bg-white border-gray-200 shadow-sm'           : 'bg-white/5 border-white/10';
  const textPrimary   = isLight ? 'text-gray-900'                                : 'text-white';
  const textSecondary = isLight ? 'text-gray-600'                                : 'text-zinc-400';
  const textMuted     = isLight ? 'text-gray-400'                                : 'text-zinc-500';
  const pillBg        = isLight ? 'bg-gray-100 border-gray-200 text-gray-600'   : 'bg-white/5 border-white/10 text-zinc-400';
  const divider       = isLight ? 'border-gray-200'                              : 'border-white/10';
  const qtyBtnBase    = isLight
    ? 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-800'
    : 'bg-white/10 hover:bg-white/15 border-white/20 text-white';
  const relatedCard   = isLight
    ? 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-orange-100/80'
    : 'bg-white/5 border-white/10 hover:border-orange-500/30';

  const t = (fr, en, ar) =>
    language === 'ar' ? ar : language === 'en' ? en : fr;

  return (
    <div className={`min-h-screen pt-20 pb-24 ${pageBg}`}>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 mb-10">
        <button
          onClick={() => navigate('menu')}
          className={`flex items-center space-x-2 text-sm font-medium transition-colors ${isLight ? 'text-gray-500 hover:text-gray-900' : 'text-zinc-400 hover:text-white'}`}
        >
          <ArrowLeft size={18} />
          <span>{t('Retour au Menu', 'Back to Menu', 'العودة إلى القائمة')}</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Visual Column ─────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Gradient hero card */}
            <div className={`relative rounded-3xl bg-gradient-to-br ${gradient} h-72 sm:h-80 md:h-[400px] flex items-center justify-center overflow-hidden shadow-2xl`}>
              {/* Decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 rounded-full border border-white/10 animate-[spin_30s_linear_infinite]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-44 h-44 rounded-full border border-white/15 animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              {/* Japanese kanji watermark */}
              <span className="absolute bottom-4 right-5 text-8xl opacity-10 font-bold text-white select-none pointer-events-none">
                鮨
              </span>

              {/* Image */}
              <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                {item.image ? (
                  <img src={item.image} alt={item.name} onClick={() => openLightbox(item.image)} className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 cursor-pointer" />
                ) : (
                  <div className="text-white/50 border-2 border-dashed border-white/30 rounded-3xl w-full h-full flex items-center justify-center text-sm font-bold tracking-wider uppercase">Image manquante</div>
                )}
              </div>

              {/* Signature / Popular badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                {isSignature && (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-orange-500/60 rounded-full text-orange-300 text-xs font-bold">
                    ★ Signature
                  </span>
                )}
                {isPopular && (
                  <span className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-yellow-500/60 rounded-full text-yellow-300 text-xs font-bold">
                    🔥 {t('Populaire', 'Popular', 'شعبي')}
                  </span>
                )}
              </div>

              {/* Discount badge */}
              {hasDiscount && (
                <div className="absolute top-4 right-4 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 z-20">
                  <span className="text-white font-extrabold text-sm leading-tight text-center">-{activeDiscount}%</span>
                </div>
              )}
            </div>

            {/* Info pills */}
            <div className="flex flex-wrap gap-2">
              {calories > 0 && (
                <span className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs ${pillBg}`}>
                  <Flame size={13} className="text-orange-400" />
                  <span>{calories} kcal</span>
                </span>
              )}
              {pieces && pieces > 1 && (
                <span className={`px-3 py-1.5 border rounded-full text-xs ${pillBg}`}>
                  🍽️ {pieces} {t('pièces', 'pieces', 'قطعة')}
                </span>
              )}
              {servings && (
                <span className={`px-3 py-1.5 border rounded-full text-xs ${pillBg}`}>
                  👥 {servings}
                </span>
              )}
              {volume && (
                <span className={`px-3 py-1.5 border rounded-full text-xs ${pillBg}`}>
                  📦 {volume}
                </span>
              )}
              {isSpicy && (
                <span className={`px-3 py-1.5 border rounded-full text-xs ${isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-900/40 border-red-500/30 text-red-400'}`}>
                  🌶️ {t('Épicé', 'Spicy', 'حار')}
                </span>
              )}
              {isVegetarian && (
                <span className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-full text-xs ${isLight ? 'bg-green-50 border-green-200 text-green-700' : 'bg-green-900/40 border-green-500/30 text-green-400'}`}>
                  <Leaf size={12} />
                  <span>{t('Végétarien', 'Vegetarian', 'نباتي')}</span>
                </span>
              )}
            </div>
          </div>

          {/* ── Info Column ───────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Category breadcrumb */}
            <p className="text-orange-500 text-xs font-bold uppercase tracking-widest">
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </p>

            {/* Item name */}
            <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight ${textPrimary}`}>
              {item.name}
            </h1>

            {/* Description */}
            {description && (
              <p className={`leading-relaxed text-base ${textSecondary}`}>{description}</p>
            )}

            {/* Ingredients */}
            {ingredients.length > 0 && (
              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${textMuted}`}>
                  {t('Ingrédients', 'Ingredients', 'المكونات')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 border rounded-full text-xs capitalize ${isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/20 text-orange-300'}`}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens */}
            {allergens.length > 0 && (
              <div className={`flex items-start space-x-3 p-3 border rounded-xl ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-900/20 border-amber-500/20'}`}>
                <AlertCircle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-amber-500 text-xs font-bold mb-1">{t('Allergènes', 'Allergens', 'مسببات الحساسية')}</p>
                  <p className={`text-xs ${isLight ? 'text-amber-700' : 'text-amber-300/80'}`}>{allergens.join(' · ')}</p>
                </div>
              </div>
            )}

            {/* ── Price + Add to Cart ─────────────────────────────────── */}
            <div className={`pt-5 border-t ${divider}`}>
              <div className="flex items-center justify-between mb-5">
                {/* Price */}
                <div>
                  <p className={`text-xs mb-1 ${textMuted}`}>
                    {t('Prix', 'Price', 'السعر')}
                  </p>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-3xl font-extrabold text-orange-500">
                        {discountedPrice} <span className="text-lg text-orange-400/70">Dh</span>
                      </span>
                      <span className={`text-base line-through ${textMuted}`}>{item.price} Dh</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-extrabold text-orange-500">
                      {item.price} <span className="text-lg text-orange-400/70">Dh</span>
                    </span>
                  )}
                </div>

                {/* Qty selector */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${qtyBtnBase}`}
                  >
                    <Minus size={16} />
                  </button>
                  <span className={`font-extrabold text-xl w-6 text-center ${textPrimary}`}>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-all shadow-lg shadow-orange-500/30"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart button */}
              <button
                onClick={handleAdd}
                className={`w-full flex items-center justify-center space-x-3 py-4 font-bold text-base rounded-2xl transition-all duration-300 shadow-xl hover:scale-[1.01] text-white ${
                  added
                    ? 'bg-green-500 shadow-green-500/30'
                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30 hover:shadow-orange-500/50'
                }`}
              >
                {added ? (
                  <>
                    <span className="text-xl">✓</span>
                    <span>{t('Ajouté au Panier !', 'Added to Cart!', 'تمت الإضافة!')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>
                      {t('Ajouter au Panier', 'Add to Cart', 'أضف للسلة')} · {(hasDiscount ? discountedPrice : item.price) * qty} Dh
                    </span>
                  </>
                )}
              </button>

              {cartQty > 0 && !added && (
                <p className="text-center text-orange-500/70 text-xs mt-3">
                  ✓ {cartQty} {t('déjà dans votre panier', 'already in your cart', 'في سلتك')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Items ──────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-20 mb-4">
            <div className={`flex items-center justify-between mb-6`}>
              <h2 className={`text-2xl font-extrabold ${textPrimary}`}>
                {t('Vous Aimerez Aussi', 'You Might Also Like', 'قد يعجبك أيضاً')}
              </h2>
              <button
                onClick={() => navigate('menu')}
                className="text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
              >
                {t('Voir tout →', 'See all →', 'عرض الكل ←')}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  className={`group border rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${relatedCard}`}
                  onClick={() => navigate('product', { itemId: rel.id })}
                >
                  <div className={`h-24 bg-gradient-to-br ${rel.gradient || 'from-orange-500 to-red-600'} flex items-center justify-center relative overflow-hidden`}>
                    {rel.image ? (
                        <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                        <span className="text-white/50 text-xs font-bold uppercase">Vide</span>
                    )}
                    {rel.isPopular && (
                      <span className="absolute top-1.5 right-1.5 text-xs">🔥</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className={`text-xs font-bold truncate mb-1 ${textPrimary}`}>{rel.name}</h3>
                    <p className="text-orange-500 text-xs font-extrabold">{rel.price} Dh</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;

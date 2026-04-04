// ═══════════════════════════════════════════════════════════
//  ASAKA SUSHI — HomePage
//  Sections: Hero · MenuPreview · HowItWorks · OwnerSection
//            LoyaltyTeaser · LocationContact · ReviewsSection
// ═══════════════════════════════════════════════════════════
import React, { useEffect, useRef, useState } from 'react';
import { RESTAURANT } from '../../data/asakaData';

// ── Intersection Observer reveal hook ────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold }
    );
    // Start all child .reveal elements
    el.querySelectorAll('.reveal').forEach(child => obs.observe(child));
    // Also observe the container itself
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

// Better: per-element reveal
function RevealObserver({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : {}}>
      {children}
    </div>
  );
}

// ── Static sample reviews ─────────────────────────────────
const SAMPLE_REVIEWS = [
  { id: 1, name: 'Khadija M.', stars: 5, text: 'La California Asaka est absolument divine ! La livraison était rapide et les sushis arrivés frais. Je recommande vivement.', date: 'Il y a 2 jours', badge: 'Or' },
  { id: 2, name: 'Youssef A.', stars: 5, text: 'Meilleur restaurant sushi de Casablanca. Le Volcano Roll et les aromakis signature sont à tomber. Bravo au chef !', date: 'Il y a 5 jours', badge: 'Argent' },
  { id: 3, name: 'Sara B.', stars: 5, text: 'Service impeccable, qualité au rendez-vous à chaque commande. Le fondant matcha est juste parfait comme dessert.', date: 'Il y a 1 semaine', badge: 'Diamant' },
  { id: 4, name: 'Omar K.', stars: 5, text: 'Le plateau découverte pour 2 personnes était généreux et varié. Parfait pour une soirée entre amis.', date: 'Il y a 2 semaines', badge: 'Bronze' },
];

// ── Stars helper ──────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════
//  HERO SECTION
// ════════════════════════════════════════════════════════════
const HeroSection = ({ navigate }) => {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-asaka-950 via-asaka-900 to-asaka-800" />

      {/* Ambient blobs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[500px] h-[500px] rounded-full bg-asaka-500/10 blur-[100px] pointer-events-none
        animate-glow-pulse" />
      <div className="absolute bottom-0 right-0 w-80 h-80
        rounded-full bg-asaka-300/5 blur-[70px] pointer-events-none" />
      <div className="absolute top-20 left-0 w-60 h-60
        rounded-full bg-asaka-600/8 blur-[60px] pointer-events-none" />

      {/* Glow rings */}
      <div className="glow-ring" style={{ width: 300, height: 300,
        top: '50%', left: '50%', transform: 'translate(-50%,-58%)' }} />
      <div className="glow-ring-reverse" style={{ width: 440, height: 440,
        top: '50%', left: '50%', transform: 'translate(-50%,-58%)' }} />
      <div className="glow-ring" style={{ width: 580, height: 580,
        top: '50%', left: '50%', transform: 'translate(-50%,-58%)',
        animationDuration: '35s', opacity: 0.4 }} />

      {/* Floating emoji particles */}
      {['🍣','🥢','🌸','⭐','🍱'].map((emoji, i) => (
        <span key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{
            top:    `${15 + i * 16}%`,
            left:   `${8 + i * 19}%`,
            opacity: 0.25,
            animation: `floatParticle ${8 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.4}s`,
            '--dx1': `${20 - i * 8}px`,
            '--dy1': `${-25 - i * 5}px`,
            '--dx2': `${-15 + i * 6}px`,
            '--dy2': `${-10 - i * 4}px`,
          }}>
          {emoji}
        </span>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Badge */}
        <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-asaka-500/15 border border-asaka-500/25 text-asaka-300 text-xs font-semibold
            tracking-wider uppercase mb-5">
            🏯 Casablanca · Sidi Maarouf
          </span>
        </div>

        {/* Heading */}
        <div className="animate-fade-up" style={{ animationDelay: '0.12s' }}>
          <h1 className="text-[56px] sm:text-7xl font-black leading-none tracking-tight mb-3">
            <span className="text-gradient-ice">Asaka</span>
            <br />
            <span className="text-white">Sushi</span>
          </h1>
          <p className="text-asaka-muted text-base sm:text-lg font-light tracking-wide mb-2">
            L'art japonais, livré à votre porte
          </p>
          <p className="text-asaka-600 text-sm">
            Casablanca's finest sushi experience
          </p>
        </div>

        {/* Stats */}
        <div className="animate-fade-up flex items-center justify-center gap-8 my-8"
          style={{ animationDelay: '0.2s' }}>
          {[
            { v: '4.9★', l: 'Note' },
            { v: '500+', l: 'Avis' },
            { v: '45min', l: 'Livraison' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className="text-white font-black text-xl leading-none">{s.v}</div>
              <div className="text-asaka-muted text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Service badges — display only, show available ordering modes */}
        <div className="animate-fade-up flex flex-col sm:flex-row gap-3 justify-center"
          style={{ animationDelay: '0.28s' }}>
          <div className="flex items-center justify-center gap-3 px-7 py-4 rounded-2xl
            border border-asaka-500/30 bg-asaka-500/10 text-asaka-300 select-none">
            <span className="text-2xl">🥡</span>
            <div className="text-left">
              <div className="font-black text-base leading-tight">À Emporter</div>
              <div className="text-asaka-500 text-xs mt-0.5">Commandez &amp; récupérez</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 px-7 py-4 rounded-2xl
            border border-cyan-700/30 bg-cyan-900/10 text-cyan-300 select-none">
            <span className="text-2xl">🛵</span>
            <div className="text-left">
              <div className="font-black text-base leading-tight">Livraison</div>
              <div className="text-cyan-600 text-xs mt-0.5">Livré chez vous</div>
            </div>
          </div>
        </div>

        {/* Commander CTA */}
        <div className="animate-fade-up mt-4" style={{ animationDelay: '0.34s' }}>
          <button
            onClick={() => navigate('menu')}
            className="btn-primary px-10 py-4 text-base flex items-center
              justify-center gap-3 mx-auto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
            </svg>
            Commander maintenant
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-up mt-14" style={{ animationDelay: '0.4s' }}>
          <div className="w-6 h-10 border border-asaka-600/60 rounded-full mx-auto
            flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-asaka-300 rounded-full animate-bounce" />
          </div>
          <p className="text-asaka-600 text-xs mt-2 tracking-widest">SCROLL</p>
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════
//  MENU PREVIEW
// ════════════════════════════════════════════════════════════
const MenuPreviewSection = ({ navigate, menuItems = [], openLightbox }) => {
  const popularItems = menuItems
    .filter(i => i.isPopular || i.isSignature)
    .slice(0, 6);

  return (
    <section className="py-24 px-4">
      <div className="max-w-xl mx-auto">
        <RevealObserver className="text-center mb-10">
          <span className="text-asaka-300 text-xs font-bold tracking-widest uppercase">
            Nos Créations
          </span>
          <h2 className="text-3xl font-black text-white mt-2">Menu Signature</h2>
          <p className="text-asaka-muted mt-2 text-sm">
            Sélection de nos plats les plus appréciés
          </p>
        </RevealObserver>

        <div className="grid grid-cols-2 gap-3">
          {popularItems.map((item, i) => (
            <RevealObserver key={item.id} delay={i * 0.07}>
              <button
                onClick={() => navigate('menu')}
                className="card-asaka-hover group p-4 text-left w-full h-full flex flex-col">
                <div className="mb-3 rounded-lg overflow-hidden h-24 bg-asaka-900/50 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} onClick={(e) => { e.stopPropagation(); openLightbox(item.image); }} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-asaka-500 text-[10px] border border-asaka-700/50 rounded-lg">Image vide</div>
                  )}
                </div>
                <div className="text-white font-bold text-sm leading-tight">{item.name}</div>
                {item.pieces && (
                  <div className="text-asaka-muted text-xs mt-0.5">{item.pieces} pièces</div>
                )}
                <div className="text-asaka-muted text-xs mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-asaka-300 font-black text-sm">{item.price} DH</span>
                  {item.isSignature && (
                    <span className="text-[10px] bg-asaka-500/20 text-asaka-300
                      border border-asaka-500/30 rounded-full px-2 py-0.5 font-semibold">
                      ✨ Signature
                    </span>
                  )}
                </div>
              </button>
            </RevealObserver>
          ))}
        </div>

        <RevealObserver className="text-center mt-8" delay={0.5}>
          <button onClick={() => navigate('menu')} className="btn-primary px-8 py-3 text-sm">
            Voir tout le menu →
          </button>
        </RevealObserver>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════
//  HOW IT WORKS
// ════════════════════════════════════════════════════════════
const HowItWorksSection = ({ navigate, setOrderMode }) => {
  const STEPS = [
    { num: '01', kanji: '選択', emoji: '🍣', title: 'Choisissez',
      desc: 'Parcourez notre menu et ajoutez vos plats préférés au panier en un tap.' },
    { num: '02', kanji: '確認', emoji: '📝', title: 'Confirmez',
      desc: 'Renseignez vos infos et confirmez en ligne ou via WhatsApp en 30 secondes.' },
    { num: '03', kanji: '配達', emoji: '🛵', title: 'Recevez',
      desc: 'Suivez votre commande en temps réel — livraison à domicile ou retrait rapide.' },
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Japanese decorative kanji */}
      <div className="absolute right-[-20px] top-10 opacity-[0.04] select-none pointer-events-none
        text-[220px] font-black text-white leading-none">
        食
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        <RevealObserver className="text-center mb-12">
          <span className="text-asaka-300 text-xs font-bold tracking-widest uppercase">
            Comment commander
          </span>
          <h2 className="text-3xl font-black text-white mt-2">Simple & Rapide</h2>
          <p className="text-asaka-muted mt-2 text-sm">3 étapes, moins de 2 minutes</p>
        </RevealObserver>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <RevealObserver key={step.num} delay={i * 0.12}>
              <div className="glass-light rounded-2xl p-5 flex items-start gap-5">
                <div className="flex-shrink-0 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-asaka-500/20 border border-asaka-500/30
                    flex items-center justify-center text-2xl mb-1">
                    {step.emoji}
                  </div>
                  <div className="text-asaka-600 text-[10px] font-bold tracking-wider">
                    {step.kanji}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-asaka-600 text-xs font-black">{step.num}</span>
                    <h3 className="text-white font-bold text-base">{step.title}</h3>
                  </div>
                  <p className="text-asaka-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </RevealObserver>
          ))}
        </div>

        <RevealObserver className="mt-8 text-center" delay={0.45}>
          <button
            onClick={() => { setOrderMode?.('delivery'); navigate('menu'); }}
            className="btn-primary px-8 py-3.5 text-sm">
            Commencer ma commande 🍣
          </button>
        </RevealObserver>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════
//  OWNER / CHEF SECTION
// ════════════════════════════════════════════════════════════
const OwnerSection = () => (
  <section className="py-24 px-4">
    <div className="max-w-xl mx-auto">
      <RevealObserver>
        <div className="glass rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-asaka-500/10 rounded-full
            blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 opacity-[0.04] text-[110px] leading-none
            select-none pointer-events-none font-black text-white">
            匠
          </div>

          <div className="relative z-10">
            <div className="flex items-start gap-5 mb-6">
              {/* Photo placeholder — replace src with real image */}
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden
                bg-gradient-to-br from-asaka-600 to-asaka-300
                flex items-center justify-center text-4xl shadow-glow-blue">
                🧑‍🍳
              </div>
              <div>
                <h3 className="text-white font-black text-xl">Le Chef</h3>
                <p className="text-asaka-300 text-sm">Fondateur & Chef — Asaka Sushi</p>
                <a href={`https://instagram.com/${(RESTAURANT.instagram||'').replace('@','')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-asaka-400 text-xs
                    hover:text-asaka-300 transition-colors font-semibold">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  {RESTAURANT.instagram}
                </a>
              </div>
            </div>

            <blockquote className="text-asaka-muted text-sm leading-relaxed
              border-l-2 border-asaka-500 pl-4 mb-6 italic">
              "Chaque rouleau est une œuvre. J'ai fondé Asaka Sushi avec une seule obsession :
              vous offrir l'expérience japonaise la plus authentique à Casablanca.
              Des ingrédients frais, des techniques maîtrisées, une passion sans compromis."
            </blockquote>

            <div className="flex gap-4">
              {[
                { v: '10+', l: "Ans d'expérience" },
                { v: '50K+', l: 'Abonnés' },
                { v: '4.9★', l: 'Note moyenne' },
              ].map(s => (
                <div key={s.l} className="flex-1 text-center
                  glass-light rounded-xl py-3">
                  <div className="text-asaka-300 font-black text-lg">{s.v}</div>
                  <div className="text-asaka-muted text-[10px] leading-tight mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealObserver>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════
//  LOYALTY TEASER
// ════════════════════════════════════════════════════════════
const LoyaltyTeaser = ({ navigate, openAuth, currentCustomer }) => (
  <section className="py-24 px-4">
    <div className="max-w-xl mx-auto">
      <RevealObserver>
        <div className="relative overflow-hidden rounded-3xl p-8
          border border-asaka-500/30"
          style={{ background: 'linear-gradient(135deg, #0d1b2a, #1a2d4a, #1565c0)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-asaka-300/5 to-transparent" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-asaka-300/10
            rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="text-4xl mb-3">💎</div>
            <h2 className="text-2xl font-black text-white mb-2">Programme Fidélité</h2>
            <p className="text-asaka-muted text-sm leading-relaxed mb-6">
              Cumulez des points à chaque commande et débloquez des avantages exclusifs.
              Créez un compte gratuit et profitez dès votre 1ère commande.
            </p>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {[
                { emoji: '🥢', name: 'Bronze',  sub: 'Dès le 1er ordre' },
                { emoji: '🌸', name: 'Argent',  sub: '5 commandes' },
                { emoji: '⭐', name: 'Or',       sub: '15 commandes' },
                { emoji: '💎', name: 'Diamant', sub: '30 commandes' },
              ].map(tier => (
                <div key={tier.name} className="glass-light rounded-xl py-3 px-2 text-center">
                  <div className="text-xl mb-1">{tier.emoji}</div>
                  <div className="text-white text-[11px] font-bold">{tier.name}</div>
                  <div className="text-asaka-muted text-[9px] mt-0.5 leading-tight">{tier.sub}</div>
                </div>
              ))}
            </div>

            {currentCustomer ? (
              <button onClick={() => navigate('profile')}
                className="btn-primary w-full py-3.5 text-sm">
                Voir mon compte →
              </button>
            ) : (
              <button onClick={() => openAuth('signup')}
                className="btn-primary w-full py-3.5 text-sm">
                Créer un compte gratuit →
              </button>
            )}
          </div>
        </div>
      </RevealObserver>
    </div>
  </section>
);

// ════════════════════════════════════════════════════════════
//  LOCATION & CONTACT
// ════════════════════════════════════════════════════════════
const LocationSection = () => {
  const mapsUrl = RESTAURANT.placeId
    ? `https://www.google.com/maps/place/?q=place_id:${RESTAURANT.placeId}`
    : RESTAURANT.mapsUrl;

  return (
    <section className="py-24 px-4">
      <div className="max-w-xl mx-auto">
        <RevealObserver className="text-center mb-8">
          <span className="text-asaka-300 text-xs font-bold tracking-widest uppercase">
            Nous trouver
          </span>
          <h2 className="text-3xl font-black text-white mt-2">Localisation</h2>
        </RevealObserver>

        <RevealObserver>
          <div className="glass rounded-3xl p-6 space-y-5">
            {[
              { emoji: '📍', title: 'Adresse', content: RESTAURANT.address },
              { emoji: '🕐', title: 'Horaires',
                content: `${RESTAURANT.hours.weekdays.label}\n${RESTAURANT.hours.weekend.label}` },
            ].map(row => (
              <div key={row.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-asaka-500/20 border border-asaka-500/30
                  flex items-center justify-center text-lg flex-shrink-0">
                  {row.emoji}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{row.title}</div>
                  <div className="text-asaka-muted text-sm mt-0.5 whitespace-pre-line leading-relaxed">
                    {row.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Phone row */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-asaka-500/20 border border-asaka-500/30
                flex items-center justify-center text-lg flex-shrink-0">
                📞
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Téléphone</div>
                <a href={`tel:${RESTAURANT.phone}`}
                  className="text-asaka-300 text-sm mt-0.5 hover:text-white transition-colors">
                  {RESTAURANT.phone}
                </a>
              </div>
            </div>

            {/* Google Maps CTA */}
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl
                bg-asaka-500/15 border border-asaka-500/35 text-asaka-300 font-bold text-sm
                hover:bg-asaka-500/25 hover:border-asaka-300/40 hover:text-white
                transition-all duration-200 active:scale-[0.98]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
              </svg>
              Ouvrir dans Google Maps
            </a>

            {/* Social row */}
            <div className="flex gap-2.5 pt-1">
              <a href={`https://instagram.com/${(RESTAURANT.instagram||'').replace('@','')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                  glass-light text-asaka-muted hover:text-white transition-colors text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a href={RESTAURANT.facebook} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                  glass-light text-asaka-muted hover:text-white transition-colors text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a href={`https://wa.me/${(RESTAURANT.whatsapp||'').replace(/\D/g,'')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                  glass-light text-asaka-muted hover:text-[#25d366] transition-colors text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </RevealObserver>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════
//  REVIEWS SECTION
// ════════════════════════════════════════════════════════════
const ReviewsSection = ({ avisData = [], setAvisData, currentCustomer, openAuth }) => {
  // Use published live reviews from BO; fall back to static samples if none
  const reviews = avisData.filter(a => a.published).length > 0
    ? avisData.filter(a => a.published)
    : SAMPLE_REVIEWS;
  const [active, setActive] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [stars, setStars]       = useState(5);
  const [text, setText]         = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!showForm) setActive(a => (a + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(t);
  }, [reviews.length, showForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentCustomer) return openAuth('login');
    if (!text.trim()) return;

    // Send to back-office (unpublished by default)
    setAvisData?.(prev => [{
      id: Date.now(),
      name: currentCustomer.name,
      stars,
      text,
      date: new Date().toLocaleDateString('fr-MA'),
      badge: 'Nouveau',
      published: false
    }, ...prev]);

    setSubmitted(true);
    setTimeout(() => { setShowForm(false); setSubmitted(false); setText(''); setStars(5); }, 3000);
  };

  return (
    <section className="py-24 px-4">
      <div className="max-w-xl mx-auto">
        <RevealObserver className="text-center mb-8">
          <span className="text-asaka-300 text-xs font-bold tracking-widest uppercase">
            Ce qu'ils disent
          </span>
          <h2 className="text-3xl font-black text-white mt-2">Avis Clients</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Stars count={5} />
            <span className="text-white font-bold text-sm">4.9 / 5</span>
            <span className="text-asaka-muted text-sm">· 500+ avis</span>
          </div>
        </RevealObserver>

        <div className="space-y-4">
          {reviews.map((review, i) => (
            <RevealObserver key={review.id} delay={i * 0.08}>
              <div className={`card-asaka p-5 transition-all duration-500 cursor-pointer
                ${active === i
                  ? 'border-asaka-500/70 shadow-glow-blue'
                  : 'opacity-80 hover:opacity-100'
                }`}
                onClick={() => setActive(i)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br
                      from-asaka-600 to-asaka-300 flex items-center justify-center
                      text-white font-black text-sm flex-shrink-0">
                      {review.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-bold text-sm">{review.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Stars count={review.stars} size={11} />
                        <span className="text-asaka-muted text-[11px]">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  {/* Verified badge */}
                  <span className="text-green-400 text-[10px] flex items-center gap-0.5 flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.491 4.491 0 01-3.497-1.307 4.492 4.492 0 01-1.307-3.497A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"/>
                    </svg>
                    Vérifié
                  </span>
                </div>
                <p className="text-asaka-muted text-sm leading-relaxed">{review.text}</p>
                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-asaka-700/30">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-asaka-600/40 opacity-80 group-hover:opacity-100 transition-opacity">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </RevealObserver>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                active === i
                  ? 'w-6 h-2 bg-asaka-300'
                  : 'w-2 h-2 bg-asaka-700 hover:bg-asaka-500'
              }`} />
          ))}
        </div>

        {/* Call to action & Form */}
        <RevealObserver className="mt-12 max-w-md mx-auto" delay={0.2}>
          {!showForm ? (
            <button
              onClick={() => currentCustomer ? setShowForm(true) : openAuth('login')}
              className="w-full py-4 rounded-xl border-2 border-dashed border-asaka-500/40 text-asaka-300 font-bold hover:bg-asaka-500/10 hover:border-asaka-500/60 transition-all flex justify-center items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
              </svg>
              Racontez-nous votre expérience
            </button>
          ) : submitted ? (
            <div className="glass-light rounded-2xl p-6 text-center animate-fade-up">
              <div className="text-4xl mb-3">🙏</div>
              <h3 className="text-white font-bold text-lg">Merci {currentCustomer?.name.split(' ')[0]} !</h3>
              <p className="text-asaka-muted text-sm mt-1">Votre avis a été soumis avec succès.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Votre Avis</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-asaka-muted hover:text-white">
                  ✕
                </button>
              </div>

              <div className="mb-4 flex flex-col items-center">
                <span className="text-xs text-asaka-muted font-bold uppercase tracking-widest mb-2">Note</span>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setStars(s)} className="hover:scale-110 transition-transform">
                      <svg width={28} height={28} viewBox="0 0 24 24"
                        fill={s <= stars ? '#f59e0b' : 'none'}
                        stroke={s <= stars ? '#f59e0b' : '#475569'} strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Qu'avez-vous pensé de votre commande ?"
                rows={3}
                required
                className="w-full bg-asaka-900/50 border border-asaka-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-asaka-300/50 placeholder:text-asaka-muted/70 resize-none mb-4"
              />

              <button type="submit" className="btn-primary w-full py-3.5 text-sm">
                Envoyer mon avis
              </button>
            </form>
          )}
        </RevealObserver>
      </div>
    </section>
  );
};

// ════════════════════════════════════════════════════════════
//  HOMEPAGE — Assembly
// ════════════════════════════════════════════════════════════
const HomePage = ({
  navigate,
  addToCart,
  setOrderMode,
  currentCustomer,
  openAuth,
  avisData = [],
  setAvisData,
  menuItems = [],
  openLightbox,
}) => (
  <div>
    <HeroSection navigate={navigate} />
    <MenuPreviewSection navigate={navigate} addToCart={addToCart} menuItems={menuItems} openLightbox={openLightbox} />
    <HowItWorksSection navigate={navigate} setOrderMode={setOrderMode} />
    <OwnerSection />
    <LoyaltyTeaser navigate={navigate} openAuth={openAuth} currentCustomer={currentCustomer} />
    <LocationSection />
    <ReviewsSection avisData={avisData} setAvisData={setAvisData} currentCustomer={currentCustomer} openAuth={openAuth} />
  </div>
);

export default HomePage;

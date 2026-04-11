import React from 'react';
import { RESTAURANT } from '../../data/asakaData';

// ── Mock data ────────────────────────────────────────────────
const PROMOTIONS = [
  {
    id: 'box-asaka',
    name: 'Box Asaka Premium',
    desc: 'Sélection premium du chef avec nos meilleurs saumons finement tranchés, assortiment maki, california et spéciaux.',
    options: [{ pcs: 32, price: 280 }, { pcs: 16, price: 150 }],
    tag: 'Signature',
    emoji: '🍱',
  },
  {
    id: 'plateau-decouverte',
    name: 'Plateau Découverte',
    desc: 'Assortiment mixte parfait pour commencer : maki saumon, california avocat, nigiri et gyoza dorés.',
    options: [{ pcs: 24, price: 180 }, { pcs: 12, price: 95 }],
    tag: 'Populaire',
    emoji: '🍣',
  },
];

const COMPACT_ITEMS = [
  { id: 'mochi',  name: 'Mochi Glacé',     desc: 'Vanille, framboise, matcha',           price: 45,  info: '3 pcs', emoji: '🍡' },
  { id: 'bento',  name: 'Bento Saumon',    desc: 'Riz, filet grillé, soupe, maki',       price: 110, info: 'Box',   emoji: '🍱' },
  { id: 'yuzu',   name: 'Limonade Yuzu',   desc: 'Maison, pétillante au gingembre',      price: 35,  info: '33cl',  emoji: '🍋' },
  { id: 'cali',   name: 'Asaka Roll',      desc: 'Saumon, cream cheese, truffe',          price: 65,  info: '8 pcs', emoji: '🥢' },
];

const SAMPLE_REVIEWS = [
  { id: 1, name: 'Khadija M.', stars: 5, text: "Un voyage culinaire ! La qualité du saumon est exceptionnelle.", date: 'Il y a 2 jours' },
  { id: 2, name: 'Youssef A.', stars: 5, text: "Le meilleur sushi de Casablanca, et de loin. Service irréprochable.", date: 'Il y a 5 jours' },
  { id: 3, name: 'Sara B.',    stars: 5, text: "Commande arrivée rapide, présentation soignée comme au restaurant.", date: 'Il y a 1 semaine' },
];

const HomePage = ({ navigate }) => {
  return (
    <div className="bg-obsidian-950 text-champagne font-serif overflow-hidden">

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-[90svh] flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-sea-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-salmon-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div className="text-left space-y-6">
            <div className="inline-flex items-center gap-2 text-salmon-500 text-sm font-sans uppercase tracking-[0.25em] mb-2">
              <span className="w-6 h-px bg-salmon-500 inline-block" />
              Casablanca · Maroc
            </div>
            <h1 className="text-6xl md:text-8xl tracking-wider text-brush text-champagne leading-tight">
              ENJOY<br />
              REAL<br />
              <span className="text-salmon-500">JAPANESE</span><br />
              FOOD
            </h1>
            <p className="text-champagne-muted text-lg max-w-md font-sans">
              Saumon premium, sashimi délicat, rolls signature du chef. Une expérience authentique, livrée chez vous.
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('menu')}
                className="btn-salmon px-8 py-3 text-sm tracking-wide font-sans"
              >
                Commander Maintenant
              </button>
              <button
                onClick={() => navigate('entre-nous')}
                className="btn-secondary px-8 py-3 text-sm tracking-wide font-sans"
              >
                Notre Histoire →
              </button>
            </div>
          </div>

          {/* Right: floating sushi art */}
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="absolute w-[280px] h-[280px] bg-obsidian-800 rounded-full flex items-center justify-center border border-obsidian-700/50 shadow-2xl">
              <span className="text-9xl">🍣</span>
            </div>
            <div className="absolute w-[340px] h-[340px] border border-salmon-500/20 rounded-full border-dashed animate-spin-slow" />
            <div className="absolute w-[390px] h-[390px] border border-sea-blue-500/10 rounded-full animate-spin-reverse" />
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 text-center font-sans z-10 px-4">
          {[
            { val: '500+', label: 'Commandes / mois' },
            { val: '4.9★', label: 'Note moyenne' },
            { val: '30min', label: 'Livraison moyenne' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-salmon-500 font-black text-xl">{s.val}</div>
              <div className="text-champagne-muted text-xs uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NOS PLATEAUX ─────────────────────────────────── */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-salmon-500 text-xs font-sans uppercase tracking-[0.25em]">À la carte</span>
          <h2 className="text-4xl md:text-5xl text-brush text-champagne tracking-widest uppercase mt-2">Nos Plateaux</h2>
        </div>

        <div className="space-y-24">
          {PROMOTIONS.map((promo, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={promo.id} className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                {/* Image block */}
                <div className="flex-1 flex justify-center w-full">
                  <div className="w-64 h-64 md:w-80 md:h-80 bg-obsidian-800 rounded-3xl transform rotate-3 flex items-center justify-center shadow-glow-salmon border border-obsidian-700/50 transition-transform hover:scale-105 hover:rotate-0 duration-300">
                    <span className="text-8xl">{promo.emoji}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-end gap-4">
                    <h3 className="text-3xl md:text-4xl font-bold font-sans tracking-tight text-champagne">{promo.name}</h3>
                    {promo.tag === 'Signature' && (
                      <span className="text-salmon-500 text-xs font-bold uppercase tracking-wider mb-2">✦ {promo.tag}</span>
                    )}
                  </div>
                  <p className="text-champagne-muted max-w-sm">{promo.desc}</p>

                  {/* Options Table */}
                  <div className="bg-obsidian-800 rounded-xl overflow-hidden border border-obsidian-700 max-w-sm font-sans">
                    {promo.options.map((opt, i) => (
                      <div key={i} className={`flex justify-between p-4 ${i < promo.options.length - 1 ? 'border-b border-obsidian-700 bg-obsidian-700/20' : ''}`}>
                        <span className="text-champagne-muted font-medium">{opt.pcs} pièces</span>
                        <span className="text-salmon-500 font-bold">{opt.price} MAD</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => navigate('menu')} className="btn-salmon px-6 py-2.5 text-sm font-sans">
                    Voir le Menu →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── POPULAIRE ────────────────────────────────────── */}
      <section className="py-24 px-4 bg-obsidian-900 border-y border-obsidian-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sea-blue-500 text-xs font-sans uppercase tracking-[0.25em]">Sélection du chef</span>
            <h2 className="text-4xl md:text-5xl text-brush text-champagne tracking-widest uppercase mt-2">Populaire</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-10">
            {COMPACT_ITEMS.map((item) => (
              <div
                key={item.id}
                className="flex gap-6 items-center group cursor-pointer"
                onClick={() => navigate('menu')}
              >
                <div className="w-20 h-20 rounded-full bg-obsidian-800 border-2 border-transparent group-hover:border-salmon-500/60 flex items-center justify-center transition-colors flex-shrink-0">
                  <span className="text-3xl">{item.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1 border-b border-obsidian-700 pb-1 font-sans">
                    <h4 className="text-lg font-bold text-champagne group-hover:text-salmon-500 transition-colors truncate">{item.name}</h4>
                    <span className="text-lg font-bold text-salmon-500 ml-2 flex-shrink-0">{item.price} MAD</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-champagne-muted text-sm">{item.desc}</p>
                    <span className="text-obsidian-400 text-xs uppercase tracking-wider ml-2 flex-shrink-0">{item.info}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button onClick={() => navigate('menu')} className="btn-secondary px-8 py-3 text-sm tracking-widest font-sans uppercase">
              Voir Tout Le Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── LOCALISATION ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-salmon-500 text-xs font-sans uppercase tracking-[0.25em]">Où nous trouver</span>
            <h2 className="text-4xl text-brush text-champagne mt-2 mb-6">Nous Rendre Visite</h2>
            <div className="space-y-4 text-champagne-muted font-sans">
              <div className="flex items-start gap-3">
                <span className="text-salmon-500 mt-1">📍</span>
                <div>
                  <p className="text-champagne font-semibold">{RESTAURANT.address}</p>
                  <p className="text-sm">Ouvert tous les jours · 11h30 – 23h00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-salmon-500 mt-1">📞</span>
                <div>
                  <p className="text-champagne font-semibold">{RESTAURANT.phone}</p>
                  <p className="text-sm">Réservations & commandes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sea-blue-500 mt-1">💬</span>
                <div>
                  <p className="text-champagne font-semibold">WhatsApp</p>
                  <p className="text-sm">{RESTAURANT.whatsapp}</p>
                </div>
              </div>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(RESTAURANT.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 btn-salmon px-6 py-2.5 text-sm font-sans"
            >
              Ouvrir dans Maps →
            </a>
          </div>

          {/* Embedded Map */}
          <div className="h-64 md:h-80 rounded-3xl overflow-hidden border border-obsidian-700/60 relative group">
            <iframe
              title="Asaka Sushi — Localisation"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26320!2d-7.6445486!3d33.5216462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda62d43d3c22be7:0x477d98f3e452102a!2sSalmon+sushi+Casablanca!5e0!3m2!1sfr!2sma!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(20%) contrast(1.05)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Overlay button to open in maps app */}
            <a
              href="https://maps.app.goo.gl/7S9m3er7m5KswGbD8"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-obsidian-950/90 backdrop-blur-md text-champagne
                text-xs font-bold px-4 py-2 rounded-xl border border-obsidian-700/60
                hover:border-salmon-500/50 hover:text-salmon-500 transition-all
                opacity-0 group-hover:opacity-100 duration-200"
            >
              Ouvrir dans Maps →
            </a>
          </div>


        </div>
      </section>

      {/* ── AVIS CLIENTS ─────────────────────────────────── */}
      <section className="py-24 px-4 bg-obsidian-900 border-t border-obsidian-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-salmon-500 text-xs font-sans uppercase tracking-[0.25em]">Témoignages</span>
            <h2 className="text-4xl md:text-5xl text-brush text-champagne tracking-widest uppercase mt-2">Avis Clients</h2>
            <p className="text-champagne-muted mt-3">Ils ont goûté, ils ont adoré.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SAMPLE_REVIEWS.map(rev => (
              <div key={rev.id} className="card-asaka p-6 flex flex-col justify-between hover:border-salmon-500/30 transition-colors">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(rev.stars)].map((_, i) => (
                      <span key={i} className="text-salmon-500 text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-champagne italic border-l-2 border-salmon-500 pl-4 text-sm leading-relaxed">"{rev.text}"</p>
                </div>
                <div className="mt-6">
                  <p className="font-bold text-sm text-salmon-500 font-sans">{rev.name}</p>
                  <p className="text-xs text-obsidian-400">{rev.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

import React from 'react';

const EntreNous = () => {
  return (
    <div className="pt-28 pb-32 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl text-brush text-champagne mb-4">Entre Nous</h1>
        <p className="text-champagne-muted text-lg max-w-2xl mx-auto font-serif">
          Découvrez l'histoire de notre chef et la philosophie qui anime Asaka Sushi.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
        <div className="space-y-6 text-champagne-muted font-serif">
          <p className="text-xl text-champagne">
            "La cuisine japonaise n'est pas seulement une question de goût, c'est un art de vivre."
          </p>
          <p>
            Notre fondateur a passé des années à perfectionner l'art du sushi blanc, en respectant les traditions tout en y apportant une touche de modernité.
          </p>
          <p>
            Chez Asaka, nous sélectionnons méticuleusement chaque ingrédient. Notre saumon est tranché frais chaque jour, et notre riz est préparé selon une recette secrète transmise de génération en génération.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden glass border-obsidian-700/60 p-2">
          {/* We will add an image later if desired */}
          <div className="aspect-[4/5] bg-obsidian-950 rounded-xl flex items-center justify-center">
            <span className="text-brush text-6xl text-obsidian-700 opacity-50">Chef</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl text-brush text-salmon mb-6">Notre Philosophie</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Fraîcheur', desc: 'Des arrivages quotidiens pour vous garantir la meilleure qualité.' },
            { title: 'Savoir-Faire', desc: 'Des maîtres sushis passionnés par leur art.' },
            { title: 'Partage', desc: 'Une expérience culinaire à vivre ensemble.' }
          ].map((item, i) => (
            <div key={i} className="card-asaka p-6 text-center">
              <h3 className="text-xl text-champagne font-bold mb-3">{item.title}</h3>
              <p className="text-champagne-muted text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntreNous;

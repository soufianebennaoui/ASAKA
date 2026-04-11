import React from 'react';
import { BADGES } from '../../data/asakaData';

const FidelitePage = () => {
  return (
    <div className="pt-28 pb-32 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl text-brush text-champagne mb-4">Programme de Fidélité</h1>
        <p className="text-champagne-muted text-lg max-w-2xl mx-auto font-serif">
          Parce que votre fidélité mérite d'être récompensée. Découvrez nos paliers et vos avantages.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {BADGES.map((tier, idx) => (
          <div key={tier.name} className={`card-asaka p-6 relative overflow-hidden group ${idx === BADGES.length - 1 ? 'border-salmon-500/50' : ''}`}>
            {idx === BADGES.length - 1 && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-salmon-400 to-salmon-600"></div>
            )}
            <div className="text-4xl mb-4">{tier.emoji}</div>
            <h2 className={`text-xl font-bold mb-2 ${idx >= 2 ? 'text-salmon-500' : 'text-champagne'}`}>
              {tier.name}
            </h2>
            <div className="text-champagne-muted text-xs mb-4 pb-4 border-b border-obsidian-700">
              {idx === 0 ? 'Dès votre première commande' : `À partir de ${tier.minOrders} commandes`}
            </div>
            
            <ul className="space-y-3">
              {tier.discount > 0 && (
                <li className="flex items-start gap-3">
                  <span className="text-salmon-500 mt-0.5">✦</span>
                  <span className="text-champagne-muted text-xs">Jusqu'à {tier.discount}% de réduction.</span>
                </li>
              )}
              <li className="flex items-start gap-3">
                <span className="text-salmon-500 mt-0.5">✦</span>
                <span className="text-champagne-muted text-xs">{tier.perks}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-salmon-500 mt-0.5">✦</span>
                <span className="text-champagne-muted text-xs">{tier.description}</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <div className="inline-block p-8 rounded-3xl bg-obsidian-800 border border-obsidian-700/60 max-w-2xl w-full">
          <h3 className="text-2xl text-champagne font-bold mb-4">Comment ça marche ?</h3>
          <p className="text-champagne-muted font-serif">
            À chaque commande, vous progressez vers le niveau suivant. Plus vous commandez, plus les avantages deviennent exclusifs.
            Vos badges débloquent des réductions et des amuse-bouches offerts !
          </p>
        </div>
      </div>
    </div>
  );
};

export default FidelitePage;

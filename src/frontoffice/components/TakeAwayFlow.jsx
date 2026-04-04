import React, { useEffect } from 'react';

// TakeAwayFlow is now a smart redirect:
// Sets orderMode = 'takeaway', then goes to checkout if cart has items, else to menu.

const TakeAwayFlow = ({ navigate, setOrderMode, cartCount = 0 }) => {
  useEffect(() => {
    setOrderMode('takeaway');
    navigate(cartCount > 0 ? 'checkout' : 'menu');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-bounce">🥡</div>
        <p className="text-zinc-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
};

export default TakeAwayFlow;

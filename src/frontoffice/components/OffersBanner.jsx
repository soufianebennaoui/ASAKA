import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Tag, Sparkles } from 'lucide-react';

const OffersBanner = ({ offers = [], navigate, language = 'fr', theme = 'dark' }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const activeOffer = offers[currentSlide];
  if (!activeOffer || dismissed || offers.length === 0) return null;

  const slides = activeOffer.slides || [];
  const slide = slides[slideIndex] || { title: activeOffer.name, subtitle: '', ctaText: '' };

  const next = () => setSlideIndex(i => (i + 1) % Math.max(slides.length, 1));
  const prev = () => setSlideIndex(i => (i - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [slides.length, slideIndex]);

  const bgStyle = slide.imageUrl
    ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const discount = activeOffer.discountPercent;
  const bannerColor = activeOffer.bannerColor || '#c2400c';

  const discountLabel = language === 'ar' ? `خصم ${discount}%` : language === 'en' ? `${discount}% OFF` : `-${discount}%`;

  return (
    <div
      className="relative overflow-hidden"
      style={{ background: slide.imageUrl ? undefined : `linear-gradient(135deg, ${bannerColor}dd, ${bannerColor}aa)` }}
    >
      {/* Background image overlay */}
      {slide.imageUrl && (
        <div className="absolute inset-0" style={bgStyle}>
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Content */}
          <div className="text-center sm:text-left flex-1">
            {/* Offer tag */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-3">
              <Sparkles size={12} />
              <span>{activeOffer.name}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {slide.title || activeOffer.name}
            </h2>
            {slide.subtitle && (
              <p className="text-white/80 text-sm sm:text-base max-w-xl mb-4">{slide.subtitle}</p>
            )}

            {/* Deals list */}
            {activeOffer.deals && activeOffer.deals.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                {activeOffer.deals.slice(0, 3).map(deal => (
                  <div key={deal.id} className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20">
                    <Tag size={12} className="text-white/70" />
                    <span className="text-white text-xs font-medium">{deal.name}</span>
                    {deal.discountedPrice && (
                      <span className="text-white font-bold text-xs">{deal.discountedPrice} Dh</span>
                    )}
                    {deal.originalPrice && deal.discountedPrice && (
                      <span className="text-white/50 text-xs line-through">{deal.originalPrice} Dh</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-3 justify-center sm:justify-start">
              {slide.ctaText && (
                <button
                  onClick={() => navigate('menu')}
                  className="px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-full text-sm hover:bg-orange-50 transition-colors shadow-lg"
                >
                  {slide.ctaText}
                </button>
              )}
              {!slide.ctaText && (
                <button
                  onClick={() => navigate('menu')}
                  className="px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-full text-sm hover:bg-orange-50 transition-colors shadow-lg"
                >
                  {language === 'ar' ? 'اطلب الآن' : language === 'en' ? 'Order Now' : 'Commander'}
                </button>
              )}
            </div>
          </div>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/30 flex flex-col items-center justify-center shadow-xl">
              <span className="text-2xl sm:text-3xl font-black text-white leading-none">-{discount}%</span>
              <span className="text-white/70 text-xs text-center mt-1">
                {language === 'ar' ? 'خصم' : language === 'en' ? 'discount' : 'réduction'}
              </span>
            </div>
          )}
        </div>

        {/* Slide indicators */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center sm:justify-start space-x-2 mt-4">
            <button onClick={prev} className="p-1 text-white/60 hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
            <button onClick={next} className="p-1 text-white/60 hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-4 text-white/60 hover:text-white p-1 transition-colors z-20"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default OffersBanner;

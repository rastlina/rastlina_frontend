// src/components/home/HeroSection.tsx
// Full-width image slider — image only, no overlays.
// Auto-slides every 5 seconds. Dot pagination. Data from /store/home-data/.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import initialSlides from 'virtual:rastlina-hero';

const HeroSection = () => {
  const { data, loading } = useHomeData();
  const slides = loading ? initialSlides : data.hero_slides;
  const [current, setCurrent] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const activeSlide = slides[current] ?? slides[0];
  const optimizedSlide = initialSlides.find(slide => slide.image === activeSlide?.image);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1 || !imageLoaded) return;
    const t = setTimeout(() => {
      setImageLoaded(false);
      setCurrent(i => (i + 1) % slides.length);
    }, 10000);
    return () => clearTimeout(t);
  }, [slides.length, imageLoaded, current]);

  if (loading && !slides.length) {
    return (
      <section className="relative w-full h-[50vh] md:h-[80vh] bg-gray-100 animate-pulse" />
    );
  }

  if (!slides.length) return null;

  return (
     <section className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden bg-[#F8F7F4] -mt-[1px]">
      {/* Slides */}
        <div
          className="absolute inset-0"
        >
          <Link
            to={activeSlide.link_url || '/shop'}
            className="block w-full h-full"
            tabIndex={0}
          >
            <img
              src={optimizedSlide?.optimizedImage || activeSlide.image}
              srcSet={optimizedSlide ? `${optimizedSlide.mobileImage} 768w, ${optimizedSlide.optimizedImage} 1600w` : undefined}
              sizes="100vw"
              onLoad={() => setImageLoaded(true)}
              onError={event => {
                event.currentTarget.removeAttribute('srcset');
                if (event.currentTarget.getAttribute('src') !== activeSlide.image) event.currentTarget.src = activeSlide.image;
              }}
              alt="Rastlina Banner"
              className="w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              draggable={false}
            />
          </Link>
        </div>

      {/* Dot pagination */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setImageLoaded(false); setCurrent(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 shadow-sm ${
                i === current ? 'w-8 h-1.5 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;

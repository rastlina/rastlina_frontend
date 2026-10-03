// src/components/home/HeroSection.tsx
// One stable, responsive banner keeps the main message visible during loading.
import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import initialSlides from 'virtual:rastlina-hero';
import { useEffect, useRef } from 'react';

const HeroSection = ({ onReady }: { onReady?: () => void }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    // The prerendered image may have loaded before hydration attaches onLoad.
    if (imageRef.current?.complete) {
      if (imageRef.current.naturalWidth > 0) onReady?.();
      else imageRef.current.dispatchEvent(new Event('error'));
    }
  }, [onReady]);
  const { data, loading, error } = useHomeData();
  const slides = loading || error ? initialSlides : data.hero_slides;
  const activeSlide = slides[0];
  const optimizedSlide = initialSlides.find(slide => slide.image === activeSlide?.image);

  if (loading && !slides.length) {
    return (
      <section className="relative w-full h-[50vh] md:h-[80vh] bg-gray-100 animate-pulse" />
    );
  }

  if (!slides.length) return null;

  return (
     <section className="relative w-full md:h-[80vh] overflow-hidden bg-[#F8F7F4] -mt-[1px]">
      {/* Slides */}
        <div
          className="relative md:absolute md:inset-0"
        >
          <Link
            to={activeSlide.link_url || '/shop'}
            className="block w-full md:h-full"
            tabIndex={0}
          >
            <picture>
              {optimizedSlide?.mobileAvif && <source type="image/avif"
                srcSet={`${optimizedSlide.mobileAvif} 768w, ${optimizedSlide.optimizedAvif} 1600w`} sizes="100vw" />}
            <img
              ref={imageRef}
              src={optimizedSlide?.optimizedImage || activeSlide.image}
              srcSet={optimizedSlide ? `${optimizedSlide.mobileImage} 768w, ${optimizedSlide.optimizedImage} 1600w` : undefined}
              sizes="100vw"
              onLoad={onReady}
              onError={event => {
                const avifSource = event.currentTarget.closest('picture')?.querySelector('source[srcset]');
                if (avifSource) {
                  avifSource.removeAttribute('srcset');
                  return;
                }
                event.currentTarget.removeAttribute('srcset');
                if (event.currentTarget.getAttribute('src') !== activeSlide.image) event.currentTarget.src = activeSlide.image;
              }}
              alt="Rastlina Banner"
              className="w-full h-auto md:h-full md:object-cover"
              width={1600}
              height={894}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              draggable={false}
            />
            </picture>
          </Link>
        </div>

    </section>
  );
};

export default HeroSection;

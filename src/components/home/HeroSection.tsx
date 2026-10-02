// src/components/home/HeroSection.tsx
// One stable, responsive banner keeps the main message visible during loading.
import { Link } from 'react-router-dom';
import { useHomeData } from '@/hooks/useHomeData';
import initialSlides from 'virtual:rastlina-hero';

const HeroSection = () => {
  const { data, loading } = useHomeData();
  const slides = loading ? initialSlides : data.hero_slides;
  const activeSlide = slides[0];
  const optimizedSlide = initialSlides.find(slide => slide.image === activeSlide?.image);

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

    </section>
  );
};

export default HeroSection;

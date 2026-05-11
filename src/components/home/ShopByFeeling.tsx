// src/components/home/ShopByFeeling.tsx
// "Curate Your Atmosphere" section — fetches featured SpaceTags from API.
// Single horizontal row with CSS scroll snap, left/right arrows on desktop,
// native touch swipe on mobile. Scrollbar hidden.
import { useRef, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomeData } from '@/hooks/useHomeData';

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[260px] md:w-[300px] snap-start">
    <div className="aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse" />
  </div>
);

const ShopByFeeling = () => {
  const { data, loading } = useHomeData();
  const spaces = data.featured_spaces;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    el.addEventListener('scroll', updateState, { passive: true });
    return () => el.removeEventListener('scroll', updateState);
  }, [spaces, updateState]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[data-space-card]') as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 276;
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  }, []);

  if (!loading && spaces.length === 0) return null;

  return (
    <section className="py-12 bg-[#F8F7F4]">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1A3831]">
              Curate Your Atmosphere
            </h2>
            <p className="text-sm text-gray-500 mt-1">Plants selected for your space</p>
          </div>

          {/* Arrows — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canLeft}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#1A3831] hover:text-[#1A3831] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canRight}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#1A3831] hover:text-[#1A3831] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : spaces.map((space) => (
                <Link
                  key={space.id}
                  to={`/shop?space=${space.slug}`}
                  data-space-card
                  className="flex-shrink-0 w-[260px] md:w-[300px] snap-start group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 shadow-sm block"
                >
                  {space.image ? (
                    <img
                      src={space.image}
                      alt={space.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1A3831] to-[#667D00] flex items-center justify-center">
                      <span className="text-6xl">{space.icon || '🌿'}</span>
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 w-full p-5 text-white">
                    <h3 className="text-xl font-serif font-bold mb-0.5">{space.name}</h3>
                    <span className="text-xs uppercase tracking-widest font-bold border-b border-white/60 pb-0.5 opacity-80">
                      Shop Now
                    </span>
                  </div>
                </Link>
              ))
          }
          <div className="flex-shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default ShopByFeeling;
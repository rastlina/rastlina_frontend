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
          
        </div>

        {/* Slider */}
        {/* Slider Wrapper */}
<div className="relative">

  {/* Left Arrow */}
  <button
  onClick={() => scroll('left')}
  disabled={!canLeft}
  className="
    hidden md:flex
    absolute left-2 md:left-[-22px]
    top-1/2 -translate-y-1/2 z-20
    w-10 h-10 md:w-12 md:h-12
    rounded-full
    bg-white/95 backdrop-blur
    shadow-xl border border-gray-200
    items-center justify-center
    hover:scale-105 hover:border-[#1A3831]
    transition-all duration-300
    disabled:opacity-50
  "
>
  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-[#1A3831]" />
</button>

  {/* Right Arrow */}
  <button
  onClick={() => scroll('right')}
  disabled={!canRight}
  className="
    hidden md:flex
    absolute right-2 md:right-[-22px]
    top-1/2 -translate-y-1/2 z-20
    w-10 h-10 md:w-12 md:h-12
    rounded-full
    bg-white/95 backdrop-blur
    shadow-xl border border-gray-200
    items-center justify-center
    hover:scale-105 hover:border-[#1A3831]
    transition-all duration-300
    disabled:opacity-50
  "
>
  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-[#1A3831]" />
</button>
  {/* Actual Slider */}
  <div
    ref={scrollRef}
    className="
  flex gap-4 overflow-x-auto snap-x snap-mandatory
  pb-2 scroll-smooth
  px-2 md:px-0
"
    style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    }}
  >
    {loading
      ? Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))
      : spaces.map((space) => (
          <Link
            key={space.id}
            to={`/shop?space=${space.slug}`}
            data-space-card
            className="
              flex-shrink-0
              w-[260px] md:w-[300px]
              snap-start group relative
              aspect-[3/4]
              rounded-[28px]
              overflow-hidden
              bg-gray-200
              shadow-sm
              block
            "
          >
            {space.image ? (
              <img
                src={space.image}
                alt={space.name}
                className="
                  w-full h-full object-cover
                  transition-transform duration-700
                  group-hover:scale-110
                "
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A3831] to-[#667D00] flex items-center justify-center">
                <span className="text-6xl">
                  {space.icon || '🌿'}
                </span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 w-full p-5 text-white">
              <h3 className="text-2xl font-serif font-bold mb-1">
                {space.name}
              </h3>

              <span className="text-xs uppercase tracking-[0.25em] font-bold opacity-90">
                SHOP NOW
              </span>
            </div>
          </Link>
        ))}

    <div
      className="flex-shrink-0 w-4 md:w-6"
      aria-hidden="true"
    />
  </div>
</div>
      </div>
    </section>
  );
};

export default ShopByFeeling;
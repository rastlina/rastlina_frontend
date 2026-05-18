// src/components/home/WatchAndShopSection.tsx
// "Watch & Shop" homepage section.
// Same slider pattern as ProductSlider — snap scroll, desktop arrows, mobile swipe.
// Fetches up to 4 active Watch & Shop items.

import { useRef, useCallback, useState, useEffect } from 'react';

import { useWatchAndShopList } from '@/hooks/useWatchAndShop';
import { WatchAndShopCard } from '@/components/watch-and-shop/WatchAndShopCard';

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] snap-start">
    <div className="aspect-[9/16] rounded-2xl bg-gray-100 animate-pulse" />
  </div>
);

// ── Section ───────────────────────────────────────────────────────────────────
const WatchAndShopSection = () => {
  const { items, loading } = useWatchAndShopList();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [items, updateScrollState]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('[class*="snap-start"]') as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 16 : 276;
    el.scrollBy({ left: dir === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  }, []);

  // Don't render the section if we have nothing to show (and not loading)
  if (!loading && items.length === 0) return null;

  return (
    <section className="py-12 bg-[#0F1E17]">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-7 px-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
              Watch & Shop
            </h2>
            <p className="text-[#667D00] text-sm font-medium mt-0.5">
              See it in action — then get it
            </p>
          </div>

          {/* Arrow controls — desktop */}
          
        </div>

        {/* Slider */}
        <div
          ref={scrollRef}
          className="
flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 scroll-smooth
md:justify-center
"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map((item, i) => (
                <WatchAndShopCard key={item.id} item={item} index={i} />
              ))
          }
          {/* Trailing spacer */}
          
        </div>

        {/* Mobile hint dots */}
        {!loading && items.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4 md:hidden">
            {items.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/30"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WatchAndShopSection;
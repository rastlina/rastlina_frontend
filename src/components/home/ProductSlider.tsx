// src/components/home/ProductSlider.tsx
// Reusable horizontal product slider used by all homepage product sections.
// Premium floating arrows like luxury ecommerce UI.

import { useRef, useCallback, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard, type ApiProduct } from '@/components/products/ProductCard';

interface ProductSliderProps {
  title: string;
  products: ApiProduct[];
  viewAllHref: string;
  bgColor?: string;
  loading?: boolean;
}

// Skeleton card
const SkeletonCard = () => (
  <div className="flex-shrink-0 w-[200px] sm:w-[220px] md:w-[240px] snap-start">
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white">
      <div className="aspect-[4/5] bg-gray-100 animate-pulse" />

      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-5 bg-gray-100 rounded animate-pulse w-1/3" />
      </div>
    </div>
  </div>
);

export const ProductSlider = ({
  title,
  products,
  viewAllHref,
  bgColor = 'bg-white',
  loading = false,
}: ProductSliderProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Update arrow states
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;

    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 8);

    setCanScrollRight(
      el.scrollLeft < el.scrollWidth - el.clientWidth - 8
    );
  }, []);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    updateScrollState();

    el.addEventListener('scroll', updateScrollState, {
      passive: true,
    });

    return () =>
      el.removeEventListener('scroll', updateScrollState);
  }, [products, updateScrollState]);

  // Scroll by card width
  const scroll = useCallback((dir: 'left' | 'right') => {
    const el = scrollRef.current;

    if (!el) return;

    const card = el.querySelector(
      '[data-card]'
    ) as HTMLElement | null;

    const cardWidth = card
      ? card.offsetWidth + 16
      : 260;

    el.scrollBy({
      left: dir === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="container-custom">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            {title}
          </h2>

          <Link
            to={viewAllHref}
            className="
              bg-[#1A3831]
              text-white
              px-4 py-2
              rounded-full
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              hover:bg-[#112520]
              transition-colors
              shadow-sm
            "
          >
            View All
          </Link>
        </div>

        {/* Slider Wrapper */}
        <div className="relative">

          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="
              hidden md:flex
              absolute left-[-22px]
              top-1/2 -translate-y-1/2
              z-20
              w-12 h-12
              rounded-full
              bg-white/95
              backdrop-blur
              shadow-xl
              border border-gray-200
              items-center justify-center
              hover:scale-105
              hover:border-[#1A3831]
              transition-all duration-300
              disabled:opacity-50
            "
          >
            <ChevronLeft className="h-5 w-5 text-[#1A3831]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="
              hidden md:flex
              absolute right-[-22px]
              top-1/2 -translate-y-1/2
              z-20
              w-12 h-12
              rounded-full
              bg-white/95
              backdrop-blur
              shadow-xl
              border border-gray-200
              items-center justify-center
              hover:scale-105
              hover:border-[#1A3831]
              transition-all duration-300
              disabled:opacity-50
            "
          >
            <ChevronRight className="h-5 w-5 text-[#1A3831]" />
          </button>

          {/* Left Fade */}
          {canScrollLeft && (
            <div className="
              hidden md:block
              absolute left-0 top-0 bottom-0
              w-12
              bg-gradient-to-r
              from-white/90 to-transparent
              z-10
              pointer-events-none
            " />
          )}

          {/* Slider */}
          <div
            ref={scrollRef}
            className="
              flex gap-4
              overflow-x-auto
              snap-x snap-mandatory
              scroll-smooth
              pb-2
            "
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <style>
              {`
                .product-slider-hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : products.map((product, i) => (
                  <div
                    key={product.id}
                    data-card
                    className="
                      flex-shrink-0
                      w-[200px]
                      sm:w-[220px]
                      md:w-[240px]
                      snap-start
                    "
                  >
                    <ProductCard
                      product={product}
                      index={i}
                    />
                  </div>
                ))}

            {/* End Spacer */}
            <div
              className="flex-shrink-0 w-4 md:w-8"
              aria-hidden="true"
            />
          </div>

          {/* Right Fade */}
          {canScrollRight && (
            <div className="
              hidden md:block
              absolute right-0 top-0 bottom-0
              w-12
              bg-gradient-to-l
              from-white/90 to-transparent
              z-10
              pointer-events-none
            " />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
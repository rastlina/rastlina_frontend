// src/components/home/HeroSection.tsx
// Full-width image slider — image only, no overlays.
// Auto-slides every 5 seconds. Dot pagination. Data from /store/home-data/.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useHomeData } from '@/hooks/useHomeData';

const HeroSection = () => {
  const { data, loading } = useHomeData();
  const slides = data.hero_slides;
  const [current, setCurrent] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setCurrent(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (loading) {
    return (
      <section className="relative w-full h-[50vh] md:h-[80vh] bg-gray-100 animate-pulse" />
    );
  }

  if (!slides.length) return null;

  return (
    <section className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden bg-[#F8F7F4]">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Link
            to={slides[current].link_url || '/shop'}
            className="block w-full h-full"
            tabIndex={0}
          >
            <img
              src={slides[current].image}
              alt="Rastlina Banner"
              className="w-full h-full object-cover"
              draggable={false}
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Dot pagination */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
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
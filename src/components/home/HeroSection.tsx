// src/components/home/HeroSection.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Specific Images for this component
import heroImage from '@/assets/hero-living-room.jpg';
import balconyImg from '@/assets/category-balcony.jpg';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { id: 1, image: heroImage, link: "/shop" },
    { id: 2, image: balconyImg, link: "/shop?cat=outdoor" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[50vh] md:h-[80vh] w-full overflow-hidden bg-white">
      <Link to={slides[currentSlide].link} className="block w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img 
              src={slides[currentSlide].image} 
              alt="Hero Offer" 
              className="w-full h-full object-cover" 
            />
          </motion.div>
        </AnimatePresence>
      </Link>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 transition-all duration-300 rounded-full shadow-md ${
              index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/60'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
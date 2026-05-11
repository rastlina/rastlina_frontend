// src/components/product-detail/ImageGallery.tsx

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Share2,
} from 'lucide-react';
import type { ProductImage } from '@/pages/ProductDetail';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
  onShare?: () => void;
}

export const ImageGallery = ({
  images,
  productName,
  onShare,
}: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const thumbsRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Reset active image when color changes
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const el = thumbsRef.current?.children[
      activeIndex
    ] as HTMLElement | undefined;

    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeIndex]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  // Mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev();
    }

    touchStartX.current = null;
  };

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i + 1) % images.length);
      }

      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i - 1 + images.length) % images.length);
      }

      if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handler);

    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, images.length]);

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  if (!images.length) {
    return (
      <div className="aspect-square rounded-2xl bg-[#F8F7F4] flex items-center justify-center">
        <span className="text-gray-300 text-sm">No image</span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col gap-3"
      >
        {/* ───────────────── DESKTOP ───────────────── */}
        <div className="hidden lg:flex gap-4">
          {/* Thumbnails */}
          {images.length > 1 && (
            <div
              className="flex flex-col gap-2.5 overflow-y-auto max-h-[560px] pr-1 scrollbar-thin scrollbar-thumb-gray-200"
              style={{ scrollbarWidth: 'thin' }}
            >
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`flex-shrink-0 w-[76px] h-[76px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    activeIndex === idx
                      ? 'border-[#1A3831] shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={img.image}
                    alt={img.alt_text || `${productName} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 relative group">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F7F4] cursor-zoom-in"
              onClick={() => openLightbox(activeIndex)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[activeIndex]?.id}
                  src={images[activeIndex]?.image}
                  alt={images[activeIndex]?.alt_text || productName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </AnimatePresence>

              {/* Share */}
              {onShare && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white z-10"                >
                  <Share2 className="h-4 w-4 text-gray-700" />
                </button>
              )}

              {/* Zoom */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                <ZoomIn className="h-4 w-4 text-gray-600" />
              </div>

              {/* Desktop Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prev();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft className="h-5 w-5 text-gray-800" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      next();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight className="h-5 w-5 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {activeIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>

        {/* ───────────────── MOBILE ───────────────── */}
        <div className="lg:hidden">
          <div
            className="relative aspect-square rounded-2xl overflow-hidden bg-[#F8F7F4] cursor-pointer group"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => openLightbox(activeIndex)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={images[activeIndex]?.id}
                src={images[activeIndex]?.image}
                alt={images[activeIndex]?.alt_text || productName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* MOBILE LEFT ARROW */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md z-10"
              >
                <ChevronLeft className="h-4 w-4 text-gray-800" />
              </button>
            )}

            {/* MOBILE RIGHT ARROW */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md z-10"
              >
                <ChevronRight className="h-4 w-4 text-gray-800" />
              </button>
            )}

            {/* Dots */}
            </div>
        </div>
      </motion.div>

      {/* ───────────────── LIGHTBOX ───────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close */}
            <button
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 z-10 transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev */}
            {images.length > 1 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 z-10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (i) => (i - 1 + images.length) % images.length
                  );
                }}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              src={images[lightboxIndex]?.image}
              alt={productName}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            {images.length > 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 z-10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => (i + 1) % images.length);
                }}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
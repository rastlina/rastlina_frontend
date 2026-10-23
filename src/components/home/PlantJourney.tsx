import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { mountJourney } from './journey/controller.mjs';
import markup from './journey/markup.html?raw';
import './journey/journey.css';

export default function PlantJourney({ onReady }: { onReady?: () => void }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const poster = element.querySelector<HTMLImageElement>('#nursery-window .film-poster');
    let cancelled = false;
    let started = false;
    let frame = 0;
    let dispose: (() => void) | undefined;
    const start = () => {
      if (cancelled || started) return;
      started = true;
      // Paint the lightweight poster before HD video downloads and decoders start.
      const decoded = poster?.decode?.().catch(() => {}) || Promise.resolve();
      decoded.then(() => {
        if (cancelled) return;
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (cancelled) return;
            onReady?.();
            dispose = mountJourney(element, { assetBase: '/journey/assets', scrollOffset: 110 });
          });
        });
      });
    };
    poster?.addEventListener('load', start, { once: true });
    poster?.addEventListener('error', start, { once: true });
    if (!poster || poster.complete) start();
    const timeout = window.setTimeout(start, 3000);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      poster?.removeEventListener('load', start);
      poster?.removeEventListener('error', start);
      dispose?.();
    };
  }, [onReady]);

  return <>
    <Helmet><link rel="preload" as="image" type="image/avif" href="/optimized/journey-first-1600.avif" imageSrcSet="/optimized/journey-first-768.avif 768w, /optimized/journey-first-1600.avif 1600w" imageSizes="100vw" /></Helmet>
    <div ref={root} className="plant-journey is-autoplay" data-plant-journey dangerouslySetInnerHTML={{ __html: markup }} />
  </>;
}

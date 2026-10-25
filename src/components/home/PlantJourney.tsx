import { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
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
    const activate = () => {
      import('./journey/controller.mjs').then(({ mountJourney }) => {
        if (cancelled || dispose) return;
        dispose = mountJourney(element, { assetBase: '/journey/assets', scrollOffset: 110 });
        element.querySelector<HTMLElement>('#nursery-error')!.hidden = true;
      }).catch(() => {
        if (!cancelled) element.querySelector<HTMLElement>('#nursery-error')!.hidden = false;
      });
    };
    const start = () => {
      if (cancelled || started) return;
      started = true;
      // Shopping controls hydrate before the optional film controller downloads.
      const decoded = poster?.decode?.().catch(() => {}) || Promise.resolve();
      decoded.then(() => {
        if (cancelled) return;
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => {
            if (cancelled) return;
            onReady?.();
            activate();
          });
        });
      });
    };
    poster?.addEventListener('load', start, { once: true });
    poster?.addEventListener('error', start, { once: true });
    if (!poster || poster.complete) start();
    const timeout = window.setTimeout(start, 3000);
    const retry = element.querySelector<HTMLButtonElement>('#nursery-retry');
    const retryActivation = () => { if (!dispose) activate(); };
    retry?.addEventListener('click', retryActivation);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      poster?.removeEventListener('load', start);
      poster?.removeEventListener('error', start);
      retry?.removeEventListener('click', retryActivation);
      dispose?.();
    };
  }, [onReady]);

  return <>
    <Helmet><link rel="preload" as="image" type="image/avif" fetchPriority="high" href="/optimized/journey-first-1600.avif" imageSrcSet="/optimized/journey-first-768.avif 768w, /optimized/journey-first-1600.avif 1600w" imageSizes="100vw" /></Helmet>
    <div ref={root} className="plant-journey is-autoplay" data-plant-journey dangerouslySetInnerHTML={{ __html: markup }} />
  </>;
}

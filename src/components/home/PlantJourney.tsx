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
    const ready = () => onReady?.();
    poster?.addEventListener('load', ready, { once: true });
    if (poster?.complete && poster.naturalWidth > 0) ready();
    const dispose = mountJourney(element, { assetBase: '/journey/assets', scrollOffset: 110 });
    return () => {
      poster?.removeEventListener('load', ready);
      dispose();
    };
  }, [onReady]);

  return <>
    <Helmet><link rel="preload" as="image" href="/journey/assets/story-01-start.webp" /></Helmet>
    <div ref={root} className="plant-journey is-autoplay" data-plant-journey dangerouslySetInnerHTML={{ __html: markup }} />
  </>;
}

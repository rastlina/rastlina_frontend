// src/pages/Home.tsx
import PlantJourney from '@/components/home/PlantJourney';
import './home-premium.css';
import { lazy, Suspense, startTransition, useCallback, useEffect, useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Link } from 'react-router-dom';

const HomeSections = lazy(() => import('@/components/home/HomeSections'));

const Home = () => {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const journey = document.querySelector('[data-plant-journey]');
      document.body.classList.toggle('rastlina-light-shop', Boolean(journey && journey.getBoundingClientRect().bottom <= 112));
    };
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update(); });
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      document.body.classList.remove('rastlina-light-shop');
    };
  }, []);
  const [sectionsReady, setSectionsReady] = useState(false);
  const showSections = useCallback(() => {
    startTransition(() => setSectionsReady(true));
  }, []);
  const onHeroReady = useCallback(() => {
    // Let the browser paint the first screen before mounting the catalogue.
    requestAnimationFrame(() => requestAnimationFrame(showSections));
  }, [showSections]);
  useEffect(() => {
    // Automatic fallback: no scrolling or user interaction is required.
    const timeout = window.setTimeout(showSections, 3000);
    return () => window.clearTimeout(timeout);
  }, [showSections]);
  return (
    <main className="home-content home-refined w-full overflow-x-clip pt-[110px]">
      <Seo
        title="Buy Indoor Plants Online in India | Rastlina"
        description="Shop ready-to-gift indoor plants online at Rastlina. Each set includes a healthy plant, self-watering pot and soil mix, with doorstep delivery across India."
        schema={[{
          '@context': 'https://schema.org',
          '@type': ['Organization', 'OnlineStore'],
          '@id': 'https://www.rastlina.com/#organization',
          name: 'Rastlina Nature Hub Private Limited',
          legalName: 'Rastlina Nature Hub Private Limited',
          taxID: '36AAPCR7860K1ZK',
          alternateName: 'Rastlina',
          description: 'Ready-to-gift indoor plant sets with healthy plants, self-watering pots and soil mix, delivered across India.',
          url: 'https://www.rastlina.com/',
          logo: 'https://www.rastlina.com/logo-optimized.webp',
          email: 'info.rastlina@gmail.com',
          telephone: '+91-81438-14466',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '4th Floor, Lake View Towers, Safari Nagar, Kondapur',
            addressLocality: 'Hyderabad',
            postalCode: '500084',
            addressCountry: 'IN',
          },
          sameAs: [
            'https://www.instagram.com/rastlina_naturehub/',
            'https://www.facebook.com/profile.php?id=61590309719114',
          ],
        }, {
          '@context': 'https://schema.org', '@type': 'WebSite',
          '@id': 'https://www.rastlina.com/#website', name: 'Rastlina',
          alternateName: 'Rastlina Nature Hub', url: 'https://www.rastlina.com/',
          publisher: { '@id': 'https://www.rastlina.com/#organization' },
        }]}
      />
      <h1 className="sr-only">Buy Indoor Plants Online in India</h1>
      <PlantJourney onReady={onHeroReady} />
      <section className="container-custom max-w-4xl py-12 text-center text-[#18392a]" aria-labelledby="plant-gifts-heading">
        <h2 id="plant-gifts-heading" className="font-serif text-3xl">Ready-to-gift plant sets for your space</h2>
        <p className="mt-4 leading-7">Choose a living plant gift with a self-watering pot and soil mix included. Browse the current plant selection, match its care needs to your room, and find a gift for a birthday, housewarming or thank-you.</p>
        <nav className="mt-6 flex flex-wrap justify-center gap-6" aria-label="Explore Rastlina">
          <Link to="/shop" className="underline">Shop indoor plants</Link>
          <Link to="/bulk" className="underline">Corporate plant gifts</Link>
          <Link to="/blog/2" className="underline">Peace lily care guide</Link>
          <Link to="/about" className="underline">About Rastlina</Link>
        </nav>
      </section>
      {sectionsReady ? (
        <Suspense fallback={<div className="min-h-[1200px]" aria-label="Loading plant collections" />}>
          <HomeSections />
        </Suspense>
      ) : <div className="min-h-[1200px]" aria-label="Loading plant collections" />}
    </main>
  );
};

export default Home;

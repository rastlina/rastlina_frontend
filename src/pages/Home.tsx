// src/pages/Home.tsx
import HeroSection from '@/components/home/HeroSection';
import SocialProof from '@/components/home/SocialProof';
import { lazy, Suspense, startTransition, useCallback, useEffect, useState } from 'react';
import { Seo } from '@/components/seo/Seo';

const HomeSections = lazy(() => import('@/components/home/HomeSections'));

const Home = () => {
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
    <main className="home-content w-full overflow-x-hidden pt-[110px]">
      <Seo
        title="Buy Indoor Plants Online in India | Rastlina"
        description="Shop ready-to-gift indoor plants online at Rastlina. Each set includes a healthy plant, self-watering pot and soil mix, with doorstep delivery across India."
        schema={{
          '@context': 'https://schema.org',
          '@type': ['Organization', 'OnlineStore'],
          name: 'Rastlina Nature Hub Private Limited',
          legalName: 'Rastlina Nature Hub Private Limited',
          taxID: '36AAPCR7860K1ZK',
          alternateName: 'Rastlina',
          description: 'Ready-to-gift indoor plant sets with healthy plants, self-watering pots and soil mix, delivered across India.',
          url: 'https://www.rastlina.com/',
          logo: 'https://www.rastlina.com/logo.png',
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
        }}
      />
      <h1 className="sr-only">Buy Indoor Plants Online in India</h1>
      <HeroSection onReady={onHeroReady} />
      <section className="bg-[#F8F7F4] px-4 py-8 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif text-2xl font-bold text-[#1A3831] md:text-3xl">
            Ready-to-Gift Indoor Plants for Every Occasion
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#4A5A51] md:text-base">
            Every Rastlina set is thoughtfully prepared with a healthy indoor plant, self-watering pot and soil mix—ready to gift and easy to enjoy.
          </p>
        </div>
      </section>
      <SocialProof />
      {sectionsReady ? (
        <Suspense fallback={<div className="min-h-[1200px]" aria-label="Loading plant collections" />}>
          <HomeSections />
        </Suspense>
      ) : <div className="min-h-[1200px]" aria-label="Loading plant collections" />}
    </main>
  );
};

export default Home;

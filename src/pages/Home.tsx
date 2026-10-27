// src/pages/Home.tsx
import PlantJourney from '@/components/home/PlantJourney';
import DiwaliWelcome from '@/components/home/DiwaliWelcome';
import './home-premium.css';
import { lazy, Suspense, startTransition, useCallback, useEffect, useState } from 'react';
import { Seo } from '@/components/seo/Seo';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Gift, Leaf, BookOpen, Sprout, Search } from 'lucide-react';

const HomeSections = lazy(() => import('@/components/home/HomeSections'));

const Home = () => {
  const navigate = useNavigate();
  const [plantSearch, setPlantSearch] = useState('');
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
      <DiwaliWelcome />
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
            addressRegion: 'Telangana',
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
      <div className="home-shopping-entry">
        <form role="search" aria-label="Find your plant" onSubmit={event => {
          event.preventDefault();
          if (plantSearch.trim()) navigate(`/shop?search=${encodeURIComponent(plantSearch.trim())}`);
        }}>
          <Search size={18} aria-hidden="true" />
          <input type="search" aria-label="Find a plant" placeholder="Search plants, e.g. Snake or ZZ" value={plantSearch} onChange={event => setPlantSearch(event.target.value)} />
          <button type="submit" aria-label="Find plants"><ArrowUpRight size={19} aria-hidden="true" /></button>
        </form>
        <nav aria-label="Start shopping">
          <Link className="home-shop-primary" to="/shop?main_category=plants">Shop all plants <ArrowUpRight size={17} aria-hidden="true" /></Link>
          <a href="#home-best-sellers" onClick={showSections}>Bestsellers <span aria-hidden="true">↓</span></a>
        </nav>
      </div>
      <PlantJourney onReady={onHeroReady} />
      <section className="home-gift-intro container-custom text-center text-[#18392a]" aria-labelledby="plant-gifts-heading">
        <h2 id="plant-gifts-heading" className="font-serif text-3xl">Plants, ready to gift.</h2>
        <p className="mt-2 leading-7">Indoor plants in self-watering pots, ready to gift.</p>
        <nav className="home-quick-links" aria-label="Explore Rastlina">
          <Link to="/shop?main_category=plants"><Leaf aria-hidden="true" /><span>Shop plants</span><ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/bulk"><Gift aria-hidden="true" /><span>Corporate gifts</span><ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/blog/1"><BookOpen aria-hidden="true" /><span>Top 10 Vastu Plants</span><ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/about"><Sprout aria-hidden="true" /><span>About Rastlina</span><ArrowUpRight aria-hidden="true" /></Link>
        </nav>
      </section>
      <div id="home-best-sellers" className="home-shopping-sections">
      {sectionsReady ? (
        <Suspense fallback={<div className="min-h-[1200px]" aria-label="Loading plant collections" />}>
          <HomeSections />
        </Suspense>
      ) : <div className="min-h-[1200px]" aria-label="Loading plant collections" />}
      </div>
    </main>
  );
};

export default Home;

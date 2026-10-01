// src/pages/Home.tsx
import HeroSection from '@/components/home/HeroSection';
import SocialProof from '@/components/home/SocialProof';
import CreativeCategories from '@/components/home/CreativeCategories';
import ShopByFeeling from '@/components/home/ShopByFeeling';
import BestSellers from '@/components/home/BestSellers';
import NewArrivals from '@/components/home/NewArrivals';
import WatchAndShopSection from '@/components/home/WatchAndShopSection';
import OffersSection from '@/components/home/OffersSection';
import SelfWateringSection from '@/components/home/SelfWateringSection';
import GardenEssentials from '@/components/home/GardenEssentials';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import CombosSection from '@/components/home/CombosSection';
import Testimonials from '@/components/home/Testimonials';

import Blogs from '@/components/home/Blogs';
import GrowingSimple from '@/components/home/GrowingSimple';
import WhatsAppButton from '@/components/home/WhatsAppButton';
import { Seo } from '@/components/seo/Seo';

const Home = () => {
  return (
    <main className="w-full overflow-x-hidden pt-[110px]">
      <Seo
        title="Buy Indoor Plants & Planters Online in India | Rastlina"
        description="Shop healthy indoor plants, self-watering planters, seeds and plant-care essentials online at Rastlina. Fast delivery across India."
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Rastlina Nature Hub Private Limited',
          alternateName: 'Rastlina',
          url: 'https://www.rastlina.com/',
          logo: 'https://www.rastlina.com/logo.png',
          email: 'info.rastlina@gmail.com',
          telephone: '+91-99154-73575',
          sameAs: [
            'https://www.instagram.com/rastlina_naturehub/',
            'https://www.facebook.com/profile.php?id=61590309719114',
          ],
        }}
      />
      <h1 className="sr-only">Buy Indoor Plants and Planters Online in India</h1>
      <HeroSection />
      <SocialProof />
      <CreativeCategories />
      <ShopByFeeling />
      <BestSellers />
      <WatchAndShopSection />
      <NewArrivals />
     
      <SelfWateringSection />
      <GardenEssentials />
      <WhyChooseUs />
      <OffersSection />
      <CombosSection />
      <Testimonials />
     
      <Blogs />
      <GrowingSimple />
      <WhatsAppButton />
    </main>
  );
};

export default Home;

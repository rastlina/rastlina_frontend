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

const Home = () => {
  return (
    <main className="w-full overflow-x-hidden pt-[110px]">
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
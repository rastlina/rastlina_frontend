// src/pages/Home.tsx
import HeroSection from '@/components/home/HeroSection';
import SocialProof from '@/components/home/SocialProof';
import CreativeCategories from '@/components/home/CreativeCategories';
import ShopByFeeling from '@/components/home/ShopByFeeling';
import BestSellers from '@/components/home/BestSellers';
import WatchAndBuy from '@/components/home/WatchAndBuy';
import NewArrivals from '@/components/home/NewArrivals';
import SelfWateringSection from '@/components/home/SelfWateringSection';
import GardenEssentials from '@/components/home/GardenEssentials';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import OffersSection from '@/components/home/OffersSection';
import CombosSection from '@/components/home/CombosSection';
import Testimonials from '@/components/home/Testimonials';
import Blogs from '@/components/home/Blogs';
import GrowingSimple from '@/components/home/GrowingSimple';
import WhatsAppButton from '@/components/home/WhatsAppButton';

const Home = () => {
  return (
    // FIX: Added pt-[120px] right here so the HeroSection isn't hidden under the fixed header
    <main className="w-full overflow-x-hidden pt-[120px]">
      <HeroSection />
      <SocialProof />
      <CreativeCategories />
      <ShopByFeeling />
      
      {/* Reordered Sections: Best Sellers -> Watch & Shop -> Fresh Arrivals */}
      <BestSellers />
      <WatchAndBuy />
      <NewArrivals />
      
      <SelfWateringSection />
      <GardenEssentials />
      
      {/* 1. WHY CHOOSE US (Moved Between Fresh Arrivals and Offers) */}
      <WhyChooseUs />

      <OffersSection />
      <CombosSection />
      
      {/* 2. TESTIMONIALS */}
      <Testimonials />

      {/* 3. BLOGS */}
      <Blogs />

      <GrowingSimple />

      <WhatsAppButton />
    </main>
  );
};

export default Home;
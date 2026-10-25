// src/components/home/BestSellers.tsx
import { useHomeData } from '@/hooks/useHomeData';
import { ProductSlider } from './ProductSlider';

const BestSellers = () => {
  const { data, loading } = useHomeData();

  return (
    <ProductSlider
      title="Best-Selling Plants"
      sectionClassName="home-bestsellers"
      eyebrow="01 / The favourites"
      subtitle="Find your favourite. Choose your options on the next page."
      products={data.best_sellers}
      viewAllHref="/shop?is_best_seller=true"
      bgColor="bg-white"
      loading={loading}
    />
  );
};

export default BestSellers;

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
      subtitle="Find your favourite and add a little green to your cart."
      products={data.best_sellers}
      viewAllHref="/shop?is_best_seller=true"
      bgColor="bg-white"
      loading={loading}
    />
  );
};

export default BestSellers;

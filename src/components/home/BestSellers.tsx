// src/components/home/BestSellers.tsx
import { useHomeData } from '@/hooks/useHomeData';
import { ProductSlider } from './ProductSlider';

const BestSellers = () => {
  const { data, loading } = useHomeData();

  return (
    <ProductSlider
      title="Best-Selling Plants"
      sectionClassName="home-bestsellers"
      eyebrow="03 / The favourites"
      subtitle="Good company, chosen again and again."
      products={data.best_sellers}
      viewAllHref="/shop?is_best_seller=true"
      bgColor="bg-white"
      loading={loading}
    />
  );
};

export default BestSellers;

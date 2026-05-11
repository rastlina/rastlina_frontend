// src/components/home/NewArrivals.tsx
import { useHomeData } from '@/hooks/useHomeData';
import { ProductSlider } from './ProductSlider';

const NewArrivals = () => {
  const { data, loading } = useHomeData();
  return (
    <ProductSlider
      title="Fresh Arrivals"
      products={data.new_arrivals}
      viewAllHref="/shop?is_new_arrival=true"
      bgColor="bg-[#FAFAF8]"
      loading={loading}
    />
  );
};

export default NewArrivals;
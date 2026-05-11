// src/components/home/OffersSection.tsx
// "Golden Deals" — products with is_best_deal=true from API.
// Horizontal snap slider + "Shop All Deals" CTA below.
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useHomeData } from '@/hooks/useHomeData';
import { ProductSlider } from './ProductSlider';

const OffersSection = () => {
  const { data, loading } = useHomeData();

  if (!loading && data.best_deals.length === 0) return null;

  return (
    <section className="bg-[#F8F7F4]">
      <div className="pt-12">
        <div className="container-custom">
          <div className="text-center mb-2">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
              Golden Deals
            </h2>
            <p className="text-sm text-gray-500 mt-1">Exclusive offers just for you</p>
          </div>
        </div>

        <ProductSlider
          title=""
          products={data.best_deals}
          viewAllHref="/shop?is_best_deal=true"
          bgColor="bg-[#F8F7F4]"
          loading={loading}
        />
      </div>

      {/* CTA */}
      {!loading && data.best_deals.length > 0 && (
        <div className="text-center pb-12 -mt-4">
          <Link to="/shop?is_best_deal=true">
            <Button className="bg-[#1A3831] hover:bg-[#112520] text-white font-bold px-10 h-12 text-[11px] uppercase tracking-[0.2em] rounded-full shadow-md transition-colors">
              Shop All Deals
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
};

export default OffersSection;
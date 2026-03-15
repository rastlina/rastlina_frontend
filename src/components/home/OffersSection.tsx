import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { getOfferProducts } from '@/data/products';

const OffersSection = () => {
  const offerProducts = getOfferProducts().slice(0, 4);
  if (offerProducts.length === 0) return null;

  return (
    <section className="py-16 bg-secondary-custom">
      <div className="container-custom">
        <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-2">Golden Deals</h2>
            <p className="text-gray-600">Exclusive offers just for you</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {offerProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
        <div className="text-center mt-12">
             <Link to="/shop?onOffer=true">
                <Button className="bg-accent-gold hover:opacity-90 text-white font-bold px-10 py-6 text-lg rounded-none shadow-md">
                  SHOP ALL DEALS
                </Button>
             </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
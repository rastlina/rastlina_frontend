import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/products';

const NewArrivals = () => {
  const newProducts = products.slice(0, 4);
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
            <h2 className="text-3xl font-serif text-foreground">Fresh Arrivals</h2>
            <Link to="/shop?sort=new" className="text-primary font-medium hover:underline flex items-center gap-1">
              See All <ChevronRight className="h-4 w-4" />
            </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {newProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
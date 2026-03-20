import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';
import { products } from '@/data/products';

const BestSellers = () => {
  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif text-gray-900">Best Sellers</h2>
            <Link 
              to="/shop?sort=rating" 
              className="bg-primary text-white px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 flex items-center gap-1 transition-opacity shadow-sm"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {bestSellers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
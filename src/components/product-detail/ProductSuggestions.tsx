import { ProductCard, ApiProduct } from '@/components/products/ProductCard';

interface SuggestionsProps {
  title: string;
  products: ApiProduct[]; // Typed for safety
  bgColor?: string;
}

export const ProductSuggestions = ({ title, products, bgColor = "bg-white" }: SuggestionsProps) => {
  if (products.length === 0) return null;

  return (
    <section className={`py-20 ${bgColor} border-t border-gray-100`}>
      <div className="container-custom">
        <h2 className="text-3xl font-serif font-black text-gray-900 mb-10 text-center md:text-left">
          {title}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((item, i) => (
            <ProductCard key={item.id} product={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
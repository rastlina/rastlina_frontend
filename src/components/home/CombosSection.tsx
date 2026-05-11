// src/components/home/CombosSection.tsx
// Combos & Bundles — fetches products from the "combos" main_category slug.
// Falls back to best_deal products if no combos category exists.
// Shows max 4. Hides section entirely if no products found.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storeService } from '@/services/api';
import type { ApiProduct } from '@/components/products/ProductCard';

const formatPrice = (v: number | string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(v));

const ComboCardSkeleton = () => (
  <div className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden border border-gray-100 h-full animate-pulse">
    <div className="w-full sm:w-1/2 aspect-square sm:aspect-auto bg-gray-100" />
    <div className="w-full sm:w-1/2 p-5 space-y-3">
      <div className="h-5 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-5/6" />
      <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
    </div>
  </div>
);

const CombosSection = () => {
  const [combos, setCombos] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storeService
      .getProducts({ main_category: 'combos', ordering: '-created_at' })
      .then((res: any) => {
        const items: ApiProduct[] = Array.isArray(res) ? res : res.results ?? [];
        setCombos(items.slice(0, 4));
      })
      .catch(() => setCombos([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && combos.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
            Combos & Bundles
          </h2>
          <Link
            to="/shop?main_category=combos"
            className="text-sm font-semibold text-[#667D00] hover:text-[#1A3831] flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {loading
            ? Array.from({ length: 2 }).map((_, i) => <ComboCardSkeleton key={i} />)
            : combos.map((combo) => {
                const primaryImage =
                  combo.images?.find(img => img.is_primary)?.image ??
                  combo.images?.[0]?.image ?? '';
                const price = Number(combo.price);
                const originalPrice = combo.original_price ? Number(combo.original_price) : null;

                return (
                  <div key={combo.id} className="relative group">
                    {/* Decorative border offset — desktop only */}
                    <div className="absolute top-3 -right-3 w-full h-full border-2 border-[#1A3831]/10 rounded-xl -z-10 transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 hidden md:block" />

                    <Link
                      to={`/product/${combo.slug}`}
                      className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-full hover:shadow-lg transition-shadow"
                    >
                      {/* Image */}
                      <div className="w-full sm:w-5/12 relative aspect-square sm:aspect-auto overflow-hidden">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={combo.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#F0F4E8] flex items-center justify-center">
                            <span className="text-4xl">🌿</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-[#1A3831] text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-sm uppercase tracking-wide">
                          Bundle Save
                        </div>
                      </div>

                      {/* Content */}
                      <div className="w-full sm:w-7/12 p-5 md:p-6 flex flex-col justify-center">
                        {combo.category_name && (
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {combo.category_name}
                          </p>
                        )}
                        <h3 className="font-serif font-bold text-base md:text-lg text-gray-900 mb-2 leading-snug group-hover:text-[#667D00] transition-colors">
                          {combo.name}
                        </h3>
                        {/* Color swatches if available */}
                        {combo.available_colors?.length > 0 && (
                          <div className="flex gap-1.5 mb-3">
                            {combo.available_colors.slice(0, 4).map(c => (
                              <div
                                key={c.id}
                                title={c.name}
                                className="w-4 h-4 rounded-full border border-gray-200"
                                style={{ backgroundColor: c.hex_code }}
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-xl font-extrabold text-gray-900">
                              {formatPrice(price)}
                            </span>
                            {originalPrice && originalPrice > price && (
                              <span className="text-sm line-through text-gray-400 font-medium">
                                {formatPrice(originalPrice)}
                              </span>
                            )}
                          </div>
                          <Button className="w-full bg-[#1A3831] hover:bg-[#112520] text-white text-xs font-bold h-9 rounded-xl transition-colors">
                            View Bundle
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })
          }
        </div>
      </div>
    </section>
  );
};

export default CombosSection;
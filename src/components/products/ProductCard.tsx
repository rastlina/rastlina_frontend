// src/components/products/ProductCard.tsx
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/utils/variantHelpers';

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string | number;
  original_price?: string | number | null;
  discount_percentage: number;
  images: Array<{
    id: number;
    image: string;
    is_primary: boolean;
    color_id?: number | null;
    color_hex?: string | null;
  }>;
  available_sizes: Array<{ id: number; name: string }>;
  available_colors: Array<{ id: number; name: string; hex_code: string }>;
  review_count: number;
  average_rating: number;
  in_stock: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_best_deal: boolean;
  care_level?: string;
  category_name?: string;
  main_category_name?: string;
}

interface ProductCardProps {
  product: ApiProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const availableColors = product.available_colors ?? [];

  // Primary image
  const primaryImages = product.images.filter((img) => img.is_primary);

  const displayImage =
    primaryImages[0] || product.images[0];

  const price = Number(product.price);
  const originalPrice = product.original_price
    ? Number(product.original_price)
    : null;

  const hasDiscount =
    originalPrice !== null && originalPrice > price;

  const hasReviews = product.review_count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.06, 0.4),
      }}
      className="group h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex-1 flex flex-col"
      >
        {/* ── Image ── */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F7F4]">
          <img
            src={displayImage?.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Out of stock overlay */}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-xs font-bold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span
                className="text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide"
                style={{ background: '#1A3831' }}
              >
                -{product.discount_percentage}%
              </span>
            )}

            {product.is_best_deal && !hasDiscount && (
              <span
                className="text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide"
                style={{ background: '#BFA275' }}
              >
                Deal
              </span>
            )}

            {product.is_new_arrival && (
              <span
                className="text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide"
                style={{ background: '#667D00' }}
              >
                New
              </span>
            )}

            {product.is_best_seller && (
              <span
                className="text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide"
                style={{ background: '#1A3831' }}
              >
                Bestseller
              </span>
            )}
          </div>

          {/* Floating Rating */}
          {hasReviews && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
              <Star className="h-3 w-3 fill-[#BFA275] text-[#BFA275]" />

              <span className="text-[11px] font-bold text-gray-800">
                {Number(product.average_rating).toFixed(1)}
              </span>

              <span className="text-[10px] text-gray-500">
                ({product.review_count})
              </span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="p-3.5 flex flex-col gap-1 flex-1">
          {/* Category */}
          {(product.category_name ||
            product.main_category_name) && (
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {product.category_name ??
                product.main_category_name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-serif font-bold text-[15px] text-gray-900 line-clamp-2 leading-tight mt-1 group-hover:text-[#667D00] transition-colors">
            {product.name}
          </h3>

          {/* Color swatches */}
          {availableColors.length > 0 && (
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {availableColors
                .slice(0, 6)
                .map((c) => (
                  <div
                    key={c.id}
                    title={c.name}
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{
                      backgroundColor: c.hex_code,
                    }}
                  />
                ))}

              {availableColors.length > 6 && (
                <span className="text-[10px] text-gray-400 self-center">
                  +{availableColors.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-2">
            <span className="text-lg font-extrabold text-gray-900">
              {formatPrice(price)}
            </span>

            {hasDiscount && originalPrice && (
              <>
                <span className="text-sm text-gray-400 line-through font-medium">
                  {formatPrice(originalPrice)}
                </span>

                <span className="text-xs font-bold text-green-600">
                  {product.discount_percentage}% off
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
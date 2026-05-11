import { motion } from 'framer-motion';
import { Star, Truck, ShieldCheck } from 'lucide-react';
import { ProductVariant, DeliveryEstimate } from '@/pages/ProductDetail'; // Import shared types

interface ProductInfoProps {
  name: string;
  reviewCount: number;
  averageRating: number;
  price: number;
  originalPrice: number | null;
  discountPercentage: number;
  activeVariant: ProductVariant | null;
  deliveryEstimates: DeliveryEstimate[];
  onShare: () => void;
  badges: {
    isNewArrival: boolean;
    isBestSeller: boolean;
    isBestDeal: boolean;
  };
}

const formatPrice = (v: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(v));

export const ProductInfo = ({
  name,
  reviewCount,
  averageRating,
  price,
  originalPrice,
  discountPercentage,
  activeVariant,
  deliveryEstimates,
  onShare,
  badges
}: ProductInfoProps) => {
  // Use price from active variant or base price[cite: 39]
  const displayPrice = activeVariant ? activeVariant.final_price : price;

const displayOriginalPrice = activeVariant
  ? activeVariant.final_original_price
  : originalPrice;

// Correct live discount calculation
const calculatedDiscount =
  displayOriginalPrice && displayOriginalPrice > displayPrice
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-gray-900 tracking-tight leading-tight">
            {name}
          </h1>
          
        </div>

        <div className="flex items-center gap-4 mt-4 flex-wrap">

  {/* Reviews */}
  {reviewCount > 0 && (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(averageRating || 0)
                ? "fill-[#BFA275] text-[#BFA275]"
                : "text-gray-300 fill-none"
            }`}
          />
        ))}
      </div>

      <span className="font-bold text-gray-900 text-sm">
        {averageRating}
      </span>

      <span className="text-sm text-gray-500 font-medium">
        ({reviewCount} {reviewCount === 1 ? "Review" : "Reviews"})
      </span>
    </div>
  )}

  {/* Best Seller Badge */}
  {badges.isBestSeller && (
    <span className="text-xs font-bold text-primary uppercase bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
      Best Seller
    </span>
  )}
</div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-extrabold text-gray-900">{formatPrice(displayPrice)}</span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <>
              <span className="text-xl text-gray-400 line-through font-bold">{formatPrice(displayOriginalPrice)}</span>
              <span className="bg-[#1A3831] text-white font-extrabold px-3 py-1 rounded-lg text-sm">
  Save {calculatedDiscount}%
</span>
            </>
          )}
        </div>

        {deliveryEstimates.length > 0 && (
          <div className="bg-[#F8F7F4] border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
              <Truck className="h-5 w-5 text-primary" />
              <h4 className="uppercase tracking-tight text-xs">Estimated Delivery</h4>
            </div>
            <div className="space-y-2">
              {deliveryEstimates.map((est, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600">{est.region}:</span>
                  <span className="text-gray-900 font-extrabold">{est.estimate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
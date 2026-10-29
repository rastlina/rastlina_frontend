// src/components/product-detail/FixedBottomBar.tsx
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { ProductVariant } from '@/pages/ProductDetail';
import { formatPrice } from '@/utils/variantHelpers';
import { canIncrement } from '@/utils/cartCalculations';

interface FixedBottomBarProps {
  productName: string;
  productImage: string;
  canAddToCart: boolean;
  activeVariant: ProductVariant | null;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  basePrice: number;
}

export const FixedBottomBar = ({
  productName,
  productImage,
  canAddToCart,
  activeVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
  basePrice,
}: FixedBottomBarProps) => {
  const displayPrice = activeVariant ? activeVariant.final_price : basePrice;
  const stock = activeVariant?.stock ?? 0;
  const canInc = canAddToCart && canIncrement(quantity, stock);
  const canDec = quantity > 1;

  return (
    <div role="region" aria-label="Product purchase bar" className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-[#CBD9C9] bg-[#E8F0E8]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:rounded-t-3xl">
      <div className="container-custom flex items-center justify-between gap-3 px-3 py-2.5 lg:gap-4 lg:px-4 lg:py-3">

        {/* Product identity remains visible on phones as well as desktop. */}
        <div className="flex min-w-0 flex-1 items-center gap-2.5 lg:gap-3">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="h-16 w-16 shrink-0 rounded-xl border border-[#E8E4DB] bg-[#F8F7F4] object-cover lg:h-14 lg:w-14 lg:rounded-lg"
              loading="lazy"
            />
          ) : (
            <div aria-hidden="true" className="h-16 w-16 shrink-0 rounded-xl bg-[#F8F7F4] lg:h-14 lg:w-14 lg:rounded-lg" />
          )}
          <div className="min-w-0 flex-1 lg:flex-none">
            <p className="line-clamp-2 break-words font-serif text-[13px] font-bold leading-tight text-gray-900 lg:max-w-[min(42vw,30rem)] lg:text-base">
              {productName}
            </p>
            {activeVariant && (
              <p className="mt-0.5 hidden truncate text-xs font-bold uppercase tracking-wider text-gray-500 lg:block">
                {[activeVariant.size_name, activeVariant.color_name].filter(Boolean).join(' · ')}
              </p>
            )}
            <span className="mt-1 block whitespace-nowrap text-xl font-extrabold leading-7 tracking-tight text-[#1A3831] min-[360px]:text-[22px] lg:hidden">
              {formatPrice(displayPrice * quantity)}
            </span>
          </div>
        </div>

        {/* Quantity, total price and basket action stay usable at narrow widths. */}
        <div className="flex shrink-0 items-center justify-end lg:gap-3">
          {/* Quantity selector — only when variant is in stock */}
          {canAddToCart && (
            <div className="hidden items-center gap-2 rounded-xl border border-[#E5D9C5] bg-[#F8F7F4] px-1 lg:flex">
              <button
                onClick={() => canDec && onQuantityChange(quantity - 1)}
                disabled={!canDec}
                className="w-8 h-9 flex items-center justify-center text-gray-700 hover:text-[#1A3831] disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center font-extrabold text-gray-900 text-sm">
                {quantity}
              </span>
              <button
                onClick={() => canInc && onQuantityChange(quantity + 1)}
                disabled={!canInc}
                className="w-8 h-9 flex items-center justify-center text-gray-700 hover:text-[#1A3831] disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Price */}
          <span className="hidden whitespace-nowrap font-extrabold text-lg text-gray-900 lg:inline">
            {formatPrice(displayPrice * quantity)}
          </span>

          {/* CTA */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className={[
              'product-cart-cta flex min-h-14 w-32 shrink-0 items-center justify-center gap-2 rounded-xl px-2.5 py-3 text-xs font-extrabold shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3831] focus-visible:ring-offset-2 min-[360px]:w-[136px] lg:min-h-12 lg:w-auto lg:rounded-full lg:px-6 lg:uppercase lg:tracking-wider',
              canAddToCart
                ? 'bg-[#1A3831] text-white hover:bg-[#112520]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none',
            ].join(' ')}
          >
            <ShoppingBag className="h-4 w-4" />
            {canAddToCart ? <>
              <span className="whitespace-nowrap lg:hidden">Add to Cart</span>
              <span className="hidden whitespace-nowrap lg:inline">Add to Basket</span>
            </> : <span className="whitespace-nowrap">Out of Stock</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

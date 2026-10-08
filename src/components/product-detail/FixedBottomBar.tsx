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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E8E4DB] bg-[#FFFEFC]/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="container-custom flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">

        {/* Product identity remains visible on phones as well as desktop. */}
        <div className="flex min-w-0 items-center gap-2.5 sm:flex-1 sm:gap-3">
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              className="h-12 w-12 shrink-0 rounded-lg border border-[#E8E4DB] bg-[#F8F7F4] object-cover sm:h-14 sm:w-14"
              loading="lazy"
            />
          ) : (
            <div aria-hidden="true" className="h-12 w-12 shrink-0 rounded-lg bg-[#F8F7F4] sm:h-14 sm:w-14" />
          )}
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="line-clamp-2 font-serif text-sm font-bold leading-tight text-gray-900 sm:max-w-[min(42vw,30rem)] sm:text-base">
              {productName}
            </p>
            {activeVariant && (
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-gray-500 sm:text-xs">
                {[activeVariant.size_name, activeVariant.color_name].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* Quantity, total price and basket action stay usable at narrow widths. */}
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
          {/* Quantity selector — only when variant is in stock */}
          {canAddToCart && (
            <div className="flex items-center gap-2 bg-[#F8F7F4] rounded-xl border border-gray-200 px-1">
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
          <span className="whitespace-nowrap font-extrabold text-gray-900 text-base sm:text-lg">
            {formatPrice(displayPrice * quantity)}
          </span>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className={[
              'flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wide shadow-md transition-all active:scale-95 sm:min-h-12 sm:flex-none sm:gap-2 sm:px-6 sm:py-3 sm:text-xs sm:tracking-wider',
              canAddToCart
                ? 'bg-[#1A3831] text-white hover:bg-[#112520]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none',
            ].join(' ')}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="whitespace-nowrap">{canAddToCart ? 'Add to Basket' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

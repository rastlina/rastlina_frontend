// src/components/product-detail/FixedBottomBar.tsx
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import type { ProductVariant } from '@/pages/ProductDetail';
import { formatPrice } from '@/utils/variantHelpers';
import { canIncrement } from '@/utils/cartCalculations';

interface FixedBottomBarProps {
  productName: string;
  canAddToCart: boolean;
  activeVariant: ProductVariant | null;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  basePrice: number;
}

export const FixedBottomBar = ({
  productName,
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
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="container-custom py-3 md:py-4 flex items-center justify-between gap-4">

        {/* Left: product name + variant */}
        <div className="min-w-0 flex-1 hidden sm:block">
          <p className="font-serif font-extrabold text-gray-900 text-lg truncate leading-tight">
            {productName}
          </p>
          {activeVariant && (
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              {[activeVariant.size_name, activeVariant.color_name].filter(Boolean).join(' · ')}
              
            </p>
          )}
        </div>

        {/* Right: quantity + price + CTA */}
        <div className="flex items-center gap-3 flex-shrink-0">
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
              <span className="w-6 text-center font-extrabold text-gray-900 text-sm">
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
          <span className="font-extrabold text-gray-900 text-lg hidden sm:block">
            {formatPrice(displayPrice * quantity)}
          </span>

          {/* CTA */}
          <button
            onClick={onAddToCart}
            disabled={!canAddToCart}
            className={[
              'flex items-center gap-2 font-extrabold rounded-full px-7 py-3.5 text-sm uppercase tracking-wider transition-all active:scale-95 shadow-md',
              canAddToCart
                ? 'bg-[#1A3831] text-white hover:bg-[#112520]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none',
            ].join(' ')}
          >
            <ShoppingBag className="h-4 w-4" />
            {canAddToCart ? 'Add to Basket' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};
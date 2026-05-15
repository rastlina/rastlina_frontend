// src/components/cart/CartDrawer.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, Truck, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const formatPrice = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);

export const CartDrawer = () => {
  const {
    isOpen, closeCart,
    items, removeFromCart, updateQuantity,
    totals, totalItems,
    appliedCoupon, removeCoupon,
    nextCoupon, remainingForNextCoupon,
    freeShippingProgress, remainingForFreeShipping,
    siteConfig,
  } = useCart();

  const navigate = useNavigate();
  const subtotal = totals.subtotal;
  const totalSaved = totals.totalSavings;
  const freeShippingUnlocked = remainingForFreeShipping === 0 && siteConfig.free_shipping_threshold > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#1A3831]">
                Your Cart
                {totalItems > 0 && (
                  <span className="ml-2 text-xs font-semibold text-gray-400 normal-case tracking-normal">
                    ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                  </span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Free shipping / coupon nudge banner ── */}
            {items.length > 0 && (
              <div className={`px-5 py-4 flex flex-col gap-3 border-b ${
                freeShippingUnlocked ? 'bg-[#667D00]/10 border-[#667D00]/20' : 'bg-[#F8F7F4] border-gray-100'
              }`}>
                {/* Free shipping progress */}
                {siteConfig.free_shipping_threshold > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Truck className={`h-3.5 w-3.5 flex-shrink-0 ${freeShippingUnlocked ? 'text-[#667D00]' : 'text-gray-400'}`} />
                      <p className="text-xs font-medium text-gray-700">
                        {freeShippingUnlocked
                          ? <span className="text-[#667D00] font-bold">🎉 You unlocked Free Delivery!</span>
                          : <>Add <span className="font-bold text-[#1A3831]">{formatPrice(remainingForFreeShipping)}</span> more for Free Delivery</>
                        }
                      </p>
                    </div>
                    
                  </div>
                )}

                {/* Coupon nudge — show only if not already auto-applied */}
                {!appliedCoupon && nextCoupon && remainingForNextCoupon > 0 && (
                  <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5 mt-0.5">
                    <Tag className="h-3 w-3 text-[#BFA275] flex-shrink-0" />
                    Add{' '}
                    <span className="font-bold text-[#1A3831]">{formatPrice(remainingForNextCoupon)}</span>
                    {' '}more to get{' '}
                    <span className="font-bold text-[#667D00]">
                      {nextCoupon.discount_type === 'percentage'
  ? `${Number(nextCoupon.value)}% OFF`
  : `${formatPrice(nextCoupon.value)} OFF`}
                    </span>
                  </p>
                )}

                {/* Auto-applied coupon chip */}
                {appliedCoupon && (
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#667D00]" />
                      <span className="text-xs font-bold text-[#667D00]">
                        {appliedCoupon.code} applied — saving {formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                    
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                  <div className="w-20 h-20 rounded-full bg-[#F8F7F4] flex items-center justify-center mb-5">
                    <ShoppingBag className="h-9 w-9 text-gray-300" strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-serif font-bold text-[#1A3831] mb-2">
                    Your cart is empty
                  </p>
                  <p className="text-sm text-gray-500 mb-7 leading-relaxed">
  Add plants, planters, and seeds to create your perfect space.
</p>

<Button
  onClick={closeCart}
  asChild
  className="bg-[#1A3831] hover:bg-[#112520] text-white rounded-full px-8 h-11 font-bold tracking-wide uppercase text-xs w-full"
>
  <Link to="/shop">Browse Products</Link>
</Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map(item => {
                    const imageUrl = item.product.images?.[0]?.image;
                    const lineTotal = item.price * item.quantity;
                    const lineOriginal = item.originalPrice * item.quantity;
                    const lineSaved = lineOriginal - lineTotal;

                    return (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        className="flex gap-4 p-5"
                      >
                        {/* Product image */}
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-[#F8F7F4] border border-gray-100"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="flex justify-between items-start gap-2">
                            <Link
                              to={`/product/${item.product.slug}`}
                              onClick={closeCart}
                              className="font-semibold text-[#1A3831] text-sm leading-snug line-clamp-2 hover:underline"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-0.5"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Variant info */}
                          <p className="text-[11px] text-gray-400 font-medium">
                            {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                          </p>

                          {/* Color swatch */}
                          {item.selectedColorHex && (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: item.selectedColorHex }}
                              />
                            </div>
                          )}

                          {/* Qty + Price */}
                          <div className="flex items-center justify-between mt-auto pt-2">
                            {/* Quantity */}
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-7 text-center font-bold text-[13px] text-[#1A3831]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Prices */}
                            {/* Prices */}
<div className="text-right flex flex-col items-end">
  <div className="flex items-center gap-2">
    {lineSaved > 0 && (
      <span className="text-xs text-gray-400 line-through font-medium">
        {formatPrice(lineOriginal)}
      </span>
    )}

    <p className="font-extrabold text-[#1A3831] text-sm">
      {formatPrice(lineTotal)}
    </p>
  </div>

  {lineSaved > 0 && (
    <div className="mt-1 px-2 py-0.5 rounded-full bg-[#667D00]/10">
      <p className="text-[10px] text-[#667D00] font-extrabold uppercase tracking-wide">
        You Save {formatPrice(lineSaved)}
      </p>
    </div>
  )}
</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                {/* Savings summary */}
                {totalSaved > 0 && (
                  <div className="flex items-center justify-between py-2 px-3 bg-[#F0F4E8] rounded-xl">
                    <span className="text-xs font-bold text-[#667D00] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Total Savings
                    </span>
                    <span className="text-xs font-bold text-[#667D00]">
                      {formatPrice(totalSaved)}
                    </span>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2">

 

  {totals.couponDiscount > 0 && appliedCoupon && (
    <div className="flex justify-between text-sm text-[#667D00]">
      <span className="flex items-center gap-1">
        <Tag className="h-3 w-3" />
        Coupon ({appliedCoupon.code})
      </span>

      <span className="font-bold">
        −{formatPrice(totals.couponDiscount)}
      </span>
    </div>
  )}

  <div className="flex justify-between text-sm text-gray-700">
    <span>Subtotal</span>
    <span className="font-bold">
      {formatPrice(totals.subtotal)}
    </span>
  </div>

  {/* SHIPPING */}

  {/* Shipping */}
{/* SHIPPING */}
<div className="flex justify-between text-sm text-gray-700">
  <span>Shipping</span>

  {totals.shipping === 0 ? (
    <span className="font-bold text-[#667D00]">
      FREE
    </span>
  ) : (
    <span className="font-bold text-[#1A3831]">
      {formatPrice(totals.shipping)}
    </span>
  )}
</div>


  <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
    <span className="font-bold text-[#1A3831] text-base">
      To Pay
    </span>

    <span className="font-extrabold text-[#1A3831] text-2xl">
      {formatPrice(totals.total)}
    </span>
  </div>

</div>

                {/* Checkout CTA */}
                <Button
                  onClick={() => { closeCart(); navigate('/checkout'); }}
                  className="w-full bg-[#1A3831] hover:bg-[#112520] text-white h-12 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors shadow-md"
                >
                  Checkout — {formatPrice(totals.total)}
                </Button>

                <p className="text-center text-[10px] text-gray-400 font-medium">
                  Secure checkout · Razorpay encrypted
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
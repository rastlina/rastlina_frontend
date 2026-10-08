// src/components/cart/CartDrawer.tsx
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
    appliedCoupon, removeCoupon, availableCoupons,
    siteConfig,
  } = useCart();

  const navigate = useNavigate();
  const subtotal = totals.subtotal;
  const totalSaved = totals.totalSavings;
  const freeDeliveryTarget = Number(siteConfig.free_shipping_threshold || 499);
  const tenPercentTarget = 999;
  const progressPercent = Math.min(100, Math.max(0, (subtotal / tenPercentTarget) * 100));
  const tenPercentCoupon = availableCoupons.find(coupon =>
    coupon.discount_type === 'percentage' && Number(coupon.value) === 10 && Number(coupon.min_order_value) === tenPercentTarget
  );
  const tenPercentApplied = Boolean(
    tenPercentCoupon && appliedCoupon?.code === tenPercentCoupon.code && subtotal >= tenPercentTarget
  );
  const rewardStage = subtotal >= tenPercentTarget
    ? 'discount-unlocked'
    : subtotal >= freeDeliveryTarget
      ? 'delivery-unlocked'
      : 'progress';

  const rewardCelebration = (
    <span key={rewardStage} className="reward-milestone-popup" role="status" aria-live="polite">
      <span className="text-[#CDA85C] motion-safe:animate-[reward-confetti_900ms_ease-out_1]">✦</span>
      <span className="text-[#155B46] motion-safe:animate-[reward-pop_650ms_cubic-bezier(.2,.8,.2,1)_1]">🎉</span>
      <span className="text-[#91A96D] motion-safe:animate-[reward-confetti_900ms_ease-out_1]" style={{ animationDelay: '140ms' }}>✧</span>
      <span>{rewardStage === 'discount-unlocked' ? '10% discount unlocked!' : 'Free delivery unlocked!'}</span>
    </span>
  );

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <div
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

            {/* ── Two-stage delivery and savings progress ── */}
            {items.length > 0 && (
              <div className="border-b border-[#DCE5DA] bg-[#F2F6F0] px-4 py-3.5">
                <p className="mb-2.5 text-xs font-medium text-[#243B31]" aria-live="polite">
                  {subtotal < freeDeliveryTarget ? (
                    <>Add <strong>{formatPrice(freeDeliveryTarget - subtotal)}</strong> more to unlock free delivery</>
                  ) : subtotal < tenPercentTarget ? (
                    <>{rewardCelebration}<strong className="text-[#155B46] motion-safe:animate-[reward-congrats_750ms_cubic-bezier(.2,.8,.2,1)_1]">Congratulations! Free delivery unlocked!</strong> Add <strong>{formatPrice(tenPercentTarget - subtotal)}</strong> more to unlock 10% off</>
                  ) : tenPercentApplied ? (
                    <>{rewardCelebration}<strong className="text-[#155B46] motion-safe:animate-[reward-congrats_750ms_cubic-bezier(.2,.8,.2,1)_1]">Congratulations! Your 10% discount is applied.</strong></>
                  ) : (
                    <>{rewardCelebration}<strong className="text-[#155B46] motion-safe:animate-[reward-congrats_750ms_cubic-bezier(.2,.8,.2,1)_1]">Congratulations! Your cart unlocked the 10% off milestone.</strong></>
                  )}
                </p>

                <div className="relative mx-1 h-8" role="img" aria-label={`Cart progress ${Math.round(progressPercent)} percent toward 10 percent savings at ₹999`}>
                  <div className="absolute inset-x-0 top-3.5 h-1.5 rounded-full bg-[#D5DED2]" />
                  <div
                    className="absolute left-0 top-3.5 h-1.5 rounded-full bg-gradient-to-r from-[#1A6B50] to-[#94B56C] transition-[width] duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <span className="absolute left-1/2 top-[11px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#F2F6F0] bg-[#A7B99A]" aria-hidden="true" />
                  <span
                    className="absolute top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#F2F6F0] bg-[#155B46] text-white shadow-md transition-[left] duration-700 ease-out"
                    style={{ left: `${Math.min(96, Math.max(4, progressPercent))}%` }}
                    aria-hidden="true"
                  >
                    <Truck className="h-4 w-4" />
                  </span>
                  <span className={`absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border text-[10px] font-extrabold shadow-sm transition-colors duration-500 ${subtotal >= tenPercentTarget ? 'border-[#155B46] bg-[#155B46] text-white' : 'border-[#155B46] bg-white text-[#155B46]'}`}>10%</span>
                </div>

                <div className="mt-1 flex justify-between text-[9px] font-semibold uppercase tracking-wide text-[#637568]">
                  <span>Free delivery · {formatPrice(freeDeliveryTarget)}</span>
                  <span>10% off · ₹999</span>
                </div>
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

  {totals.couponDiscount > 0 && appliedCoupon && (
    <div className="flex justify-between text-sm font-semibold text-[#667D00]">
      <span>Discount — {appliedCoupon.discount_type === 'percentage' ? `${Number(appliedCoupon.value)}% off` : appliedCoupon.code}</span>
      <span>−{formatPrice(totals.couponDiscount)}</span>
    </div>
  )}


  <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-100">
    <span className="font-bold text-[#1A3831] text-base">
      To Pay
    </span>

    {totals.couponDiscount > 0 && (
      <span className="mr-2 text-sm font-semibold text-gray-400 line-through">
        {formatPrice(totals.total + totals.couponDiscount)}
      </span>
    )}
    <span key={totals.total} className="reward-total-value inline-block origin-center font-extrabold text-[#1A3831] text-2xl">
      {formatPrice(totals.total)}
    </span>
  </div>

</div>

                {/* Checkout CTA */}
                <Button
                  onClick={() => { closeCart(); navigate('/checkout'); }}
                  className="flex w-full items-center justify-center gap-2 bg-[#1A3831] hover:bg-[#112520] text-white min-h-12 rounded-xl px-2 font-bold text-xs sm:text-sm uppercase tracking-wide transition-colors shadow-md"
                >
                  <span className="whitespace-nowrap">Checkout — {formatPrice(totals.total)}</span>
                  <span aria-label="PhonePe, Google Pay and CRED UPI" className="flex shrink-0 items-center -space-x-2">
                    <span title="PhonePe UPI" className="z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-[#5F259F] text-[11px] font-black normal-case text-white">पे</span>
                    <span title="Google Pay UPI" className="z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-white">
                      <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                        <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                        <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                        <path fill="#FBBC05" d="M12.6 27.5a12 12 0 0 1 0-7v-5.3H5.8a20 20 0 0 0 0 17.6l6.8-5.3Z" />
                        <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.2 29.5 4 24 4A20 20 0 0 0 5.8 15.2l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z" />
                      </svg>
                    </span>
                    <span title="CRED UPI" className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A3831] bg-black text-white">
                      <svg aria-hidden="true" viewBox="0 0 32 32" className="h-5 w-5" fill="none">
                        <path d="M7 2.5h18v16L16 27 7 21V2.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M11 7h11v4H11v6l5 3 5-3v-2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        <path d="m13.5 15 2.5 1.5 3-1.8" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
                        <text x="16" y="32" textAnchor="middle" fill="currentColor" fontSize="4.2" fontWeight="800" letterSpacing=".8">CRED</text>
                      </svg>
                      <span className="sr-only">CRED</span>
                    </span>
                  </span>
                </Button>

                <p className="text-center text-[10px] text-gray-400 font-medium">
                  Secure checkout · Razorpay encrypted
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

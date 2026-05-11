// src/pages/CheckoutPage.tsx
// Production-grade checkout page for Rastlina.
// Online payment only (Razorpay) — no COD.
// Supports: saved addresses, coupon codes, exchange codes, order summary.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Tag, X, ChevronRight, ShieldCheck, Truck,
  CheckCircle, MapPin,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { authService, orderService, storeService } from '@/services/api';
import { toast } from 'sonner';
import AddressManager from '@/components/profile/AdressManager'; // Added AddressManager import

// ─── Formatters ───────────────────────────────────────────────────────────────

const formatPrice = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);

// ─── Declare Razorpay on window ───────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, totals, appliedCoupon, removeCoupon, applyCoupon, siteConfig, clearCart } = useCart();
  const navigate = useNavigate();

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [navigate]);

  // ── Address state ──────────────────────────────────────────────────────────
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);

  // ── Coupon state ───────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Order state ────────────────────────────────────────────────────────────
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ── Checkout price calculations ────────────────────────────────────────────
  const checkoutCalc = useMemo(() => {
    const subtotal = totals.subtotal;
    const couponDiscount = appliedCoupon?.discount ?? 0;
    
    const afterDiscounts = Math.max(0, subtotal - couponDiscount );

    const freeThreshold = siteConfig.free_shipping_threshold;
    const shippingFlat = siteConfig.shipping_fee;
    const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : shippingFlat;

    const tax = siteConfig.tax_percentage > 0
      ? Math.round((afterDiscounts * siteConfig.tax_percentage) / 100)
      : 0;

    const total = afterDiscounts + shipping + tax;

    return { subtotal, couponDiscount, shipping, tax, total };
  }, [totals.subtotal, appliedCoupon, siteConfig]);

  // ── Coupon apply/remove ────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (appliedCoupon) {
      removeCoupon();
      setCouponInput('');
      return;
    }
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await storeService.validateCoupon(couponInput.trim(), totals.subtotal);
      applyCoupon({
        code: couponInput.trim().toUpperCase(),
        discount_type: res.discount_type,
        value: res.discount_type === 'percentage'
          ? Number(res.code_value ?? res.value ?? 0)
          : Number(res.discount),
        min_order_value: Number(res.min_order_value ?? 0),
        discount: Number(res.discount),
      });
      toast.success(res.message || 'Coupon applied!');
    } catch (err: any) {
      toast.error(err?.error || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Place order + Razorpay ─────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    if (!selectedAddress) {
      setCheckoutError('Please add or select a delivery address to continue');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!acceptedPolicy) {
      setCheckoutError('Please accept the return & exchange policy');
      return;
    }
    if (items.length === 0) {
      setCheckoutError('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: items.map(item => ({
          product_id: item.product.id,
          variant_id: item.variantId,
          price: item.price,
          quantity: item.quantity,
        })),
        payment_method: 'Online',
        coupon_code: appliedCoupon?.code ?? '',
        
        accepted_return_policy: acceptedPolicy,
        // Address fields mapped from selectedAddress object
        first_name: selectedAddress.first_name,
        last_name: selectedAddress.last_name,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        apartment: selectedAddress.apartment ?? '',
        landmark: selectedAddress.landmark ?? '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip_code: selectedAddress.zip_code,
        country: selectedAddress.country ?? 'India',
      };

      const res = await orderService.createOrder(orderPayload);

      // Launch Razorpay
      const options = {
        key: res.key,
        amount: res.amount,
        currency: res.currency ?? 'INR',
        name: 'Rastlina',
        description: 'Plants & Planters',
        order_id: res.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await orderService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success('🎉 Payment successful! Order confirmed.');
            navigate('/profile?tab=orders');
          } catch {
            toast.error('Payment verification failed. Please contact support with your payment ID.');
          }
        },
        prefill: {
          name: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
          contact: selectedAddress.phone,
          email: authService.getStoredUser()?.email ?? '',
        },
        theme: { color: '#1A3831' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled. Your order has been saved — complete payment anytime.');
            setIsPlacingOrder(false);
          },
        },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please refresh the page and try again.');
        setIsPlacingOrder(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again or use a different payment method.');
        setIsPlacingOrder(false);
      });
      rzp.open();
    } catch (err: any) {
      const message = err?.error || err?.detail || 'Order failed. Please try again.';
      setCheckoutError(message);
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };

  // ─── Empty cart redirect ───────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 pt-[120px]">
        <p className="text-2xl font-serif font-bold text-gray-900">Your cart is empty</p>
        <Link to="/shop" className="text-[#667D00] font-bold hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-[120px]">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/shop" className="text-sm text-gray-400 hover:text-[#667D00] transition-colors font-medium">
            ← Continue Shopping
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">

            {/* ── DELIVERY ADDRESS USING ADDRESSMANAGER ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <AddressManager 
                onSelect={(addr) => setSelectedAddress(addr)}
                selectedId={selectedAddress?.id}
              />
            </div>

            {/* ── PAYMENT METHOD ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-serif font-extrabold text-gray-900 text-lg mb-4">
                Payment
              </h2>

              {/* Online only — single tile */}
              <div className="p-4 rounded-xl border-2 border-[#1A3831] bg-[#1A3831]/5 flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#1A3831] bg-[#1A3831] flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">💳 Online Payment</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    UPI, Credit / Debit Cards, Net Banking — secured by Razorpay
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-[#667D00] font-medium">
                <ShieldCheck className="h-4 w-4" />
                <span>256-bit SSL encrypted · PCI DSS compliant</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: ORDER SUMMARY ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 lg:sticky lg:top-28">
              <h2 className="font-serif font-extrabold text-gray-900 text-lg">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(item => {
                  const imageUrl = item.product.images?.[0]?.image;
                  return (
                    <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-center gap-3">
                      {/* Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F8F7F4] border border-gray-100 flex-shrink-0">
                        {imageUrl
                          ? <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full" />
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                          {' · '}Qty: {item.quantity}
                        </p>
                      </div>
                      {/* Price */}
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <hr className="border-gray-100" />

              {/* ── Coupon Code ── */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Coupon Code
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-[#F0F4E8] border border-[#667D00]/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#667D00]" />
                      <span className="text-sm font-bold text-[#667D00]">
                        {appliedCoupon.code} — Save {formatPrice(appliedCoupon.discount)}
                      </span>
                    </div>
                    <button
                      onClick={() => { removeCoupon(); setCouponInput(''); }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Enter coupon code"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2.5 bg-[#1A3831] text-white text-sm font-bold rounded-xl hover:bg-[#112520] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Price Breakdown ── */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatPrice(checkoutCalc.subtotal)}</span>
                </div>
                
                {checkoutCalc.couponDiscount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-sm text-[#667D00]">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {appliedCoupon.code}
                    </span>
                    <span className="font-medium">−{formatPrice(checkoutCalc.couponDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Shipping
                  </span>
                  <span className={`font-medium ${checkoutCalc.shipping === 0 ? 'text-[#667D00]' : ''}`}>
                    {checkoutCalc.shipping === 0 ? 'FREE' : formatPrice(checkoutCalc.shipping)}
                  </span>
                </div>
                {checkoutCalc.tax > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">{formatPrice(checkoutCalc.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-extrabold text-gray-900">Total</span>
                  <span className="font-extrabold text-2xl text-gray-900">
                    {formatPrice(checkoutCalc.total)}
                  </span>
                </div>
              </div>

              {/* ── Return policy ── */}
              <div className="bg-[#F8F7F4] rounded-xl p-4 space-y-3 border border-gray-100">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  Return & Exchange Policy
                </p>
                <ul className="text-xs text-gray-500 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#667D00] mt-0.5 flex-shrink-0">•</span>
                    15-day exchange for product defects only
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#667D00] mt-0.5 flex-shrink-0">•</span>
                    No cash refunds — exchange or store credit only
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#667D00] mt-0.5 flex-shrink-0">•</span>
                    Exchange must be equal or higher value
                  </li>
                </ul>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPolicy}
                    onChange={e => setAcceptedPolicy(e.target.checked)}
                    className="mt-0.5 accent-[#1A3831] flex-shrink-0"
                  />
                  <span className="text-xs text-gray-700 font-semibold leading-relaxed">
                    I have read and accept the return & exchange policy
                  </span>
                </label>
              </div>

              {/* Error message */}
              {checkoutError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                  {checkoutError}
                </div>
              )}

              {/* Place order CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={[
                  'w-full py-4 rounded-xl font-extrabold text-sm uppercase tracking-widest',
                  'transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md',
                  isPlacingOrder
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-[#1A3831] hover:bg-[#112520] text-white',
                ].join(' ')}
              >
                {isPlacingOrder ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>Pay {formatPrice(checkoutCalc.total)} <ChevronRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="text-center text-[10px] text-gray-400 font-medium">
                Secured by Razorpay · Your payment data is encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
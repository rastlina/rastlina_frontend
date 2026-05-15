// src/pages/CheckoutPage.tsx
// Rastlina — Production checkout page.
// Supports: guest checkout, authenticated checkout, Razorpay,
//           AddressManager integration, coupon codes, exchange codes,
//           guest login encouragement banner, post-order account prompt.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Loader2, Tag, X, ChevronRight, ShieldCheck, Truck,
  CheckCircle, Gift, LogIn, UserPlus, AlertCircle, Info,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService, orderService, storeService } from '@/services/api';
import { toast } from 'sonner';
import AddressManager from '@/components/profile/AdressManager';

// ─── Declare Razorpay on window ───────────────────────────────────────────────

declare global {
  interface Window { Razorpay: any; }
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);

// ─── Indian states ────────────────────────────────────────────────────────────

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

// ─── Guest address form ───────────────────────────────────────────────────────

interface GuestAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  landmark: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

const EMPTY_GUEST: GuestAddress = {
  first_name: '', last_name: '', email: '', phone: '',
  address: '', apartment: '', landmark: '',
  city: '', state: '', zip_code: '', country: 'India',
};

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder = '', type = 'text',
  required = false, half = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean; half?: boolean;
}) {
  return (
    <div className={half ? 'col-span-1' : 'col-span-2 sm:col-span-1'}>
      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all bg-white"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const {
    items, totals, appliedCoupon, removeCoupon, applyCoupon,
    siteConfig, clearCart,
  } = useCart();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const isLoggedIn = !!authUser;

  // ── Address state ──────────────────────────────────────────────────────────
  // For logged-in users: address comes from AddressManager (saved addresses)
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  // For guests: manual form
  const [guestForm, setGuestForm] = useState<GuestAddress>(EMPTY_GUEST);
  const setGF = useCallback(
    (field: keyof GuestAddress) => (val: string) =>
      setGuestForm(prev => ({ ...prev, [field]: val })),
    [],
  );

  // ── Coupon state ───────────────────────────────────────────────────────────
  const [couponInput, setCouponInput] = useState(appliedCoupon?.code ?? '');
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Exchange code state ────────────────────────────────────────────────────
  const [exchangeInput, setExchangeInput] = useState('');
  const [appliedExchange, setAppliedExchange] = useState<{
    code: string; originalOrderValue: number;
  } | null>(null);
  const [exchangeLoading, setExchangeLoading] = useState(false);

  // ── Order state ────────────────────────────────────────────────────────────
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ── Post-order success state (guest) ───────────────────────────────────────
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: number;
    guestEmail: string;
    isGuest: boolean;
  } | null>(null);

  // Keep coupon input in sync if CartContext auto-applies one
  useEffect(() => {
    if (appliedCoupon?.code) setCouponInput(appliedCoupon.code);
  }, [appliedCoupon?.code]);

  // ── Price calculations ─────────────────────────────────────────────────────
  const checkoutCalc = useMemo(() => {
    const subtotal = totals.subtotal;
    const couponDiscount = appliedCoupon?.discount ?? 0;
    const exchangeDiscount = appliedExchange
      ? Math.min(appliedExchange.originalOrderValue, subtotal)
      : 0;

    const afterDiscounts = Math.max(0, subtotal - couponDiscount - exchangeDiscount);

    const freeThreshold = siteConfig.free_shipping_threshold;
    const shippingFlat = siteConfig.shipping_fee;
    const shipping =
      freeThreshold > 0 && subtotal >= freeThreshold ? 0 : shippingFlat;

    const tax =
      siteConfig.tax_percentage > 0
        ? Math.round((afterDiscounts * siteConfig.tax_percentage) / 100)
        : 0;

    const total = afterDiscounts + shipping + tax;

    return { subtotal, couponDiscount, exchangeDiscount, shipping, tax, total };
  }, [totals.subtotal, appliedCoupon, appliedExchange, siteConfig]);

  // ── Coupon handlers ────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (appliedCoupon) {
      removeCoupon();
      setCouponInput('');
      return;
    }
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await storeService.validateCoupon(
        couponInput.trim().toUpperCase(),
        totals.subtotal,
      );
applyCoupon({
  code: couponInput.trim().toUpperCase(),
  discount_type: res.discount_type,
  value: Number(res.value ?? 0),
  min_order_value: Number(res.min_order_value ?? 0),
  discount: Number(res.discount ?? 0),
});
      toast.success(res.message || 'Coupon applied!');
    } catch (err: any) {
      toast.error(err?.error || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Exchange code handlers ─────────────────────────────────────────────────
  const handleApplyExchange = async () => {
    if (appliedExchange) {
      setAppliedExchange(null);
      setExchangeInput('');
      return;
    }
    if (!exchangeInput.trim()) return;
    setExchangeLoading(true);
    try {
      const res = await orderService.validateExchangeCode(exchangeInput.trim().toUpperCase());
      setAppliedExchange({
        code: res.code,
        originalOrderValue: res.original_order_value,
      });
      toast.success(res.message || 'Exchange code applied!');
    } catch (err: any) {
      toast.error(err?.error || 'Invalid or expired exchange code');
    } finally {
      setExchangeLoading(false);
    }
  };

  // ── Validate guest form ────────────────────────────────────────────────────
  const validateGuestForm = (): string | null => {
    if (!guestForm.first_name.trim()) return 'First name is required';
    if (!guestForm.email.trim() || !/\S+@\S+\.\S+/.test(guestForm.email))
      return 'A valid email address is required';
    if (!guestForm.phone.trim() || guestForm.phone.replace(/\D/g, '').length < 10)
      return 'A valid 10-digit phone number is required';
    if (!guestForm.address.trim()) return 'Street address is required';
    if (!guestForm.city.trim()) return 'City is required';
    if (!guestForm.state.trim()) return 'State is required';
    if (!guestForm.zip_code.trim()) return 'PIN code is required';
    return null;
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setCheckoutError(null);

    // Address validation
    if (isLoggedIn && !selectedAddress) {
      setCheckoutError('Please select or add a delivery address to continue.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!isLoggedIn) {
      const formError = validateGuestForm();
      if (formError) {
        setCheckoutError(formError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!acceptedPolicy) {
      setCheckoutError('Please accept the return & exchange policy to continue.');
      return;
    }
    if (items.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    // Build the address block depending on auth state
    const addr = isLoggedIn ? selectedAddress : guestForm;

    const orderPayload = {
      items: items.map(item => ({
        product_id: item.product.id,
        variant_id: item.variantId,
        price: item.price,
        quantity: item.quantity,
      })),
      payment_method: 'Online',
      coupon_code: appliedCoupon?.code ?? '',
      exchange_code: appliedExchange?.code ?? '',
      accepted_return_policy: acceptedPolicy,
      // Address fields
      first_name: addr.first_name ?? '',
      last_name: addr.last_name ?? '',
      phone: addr.phone ?? '',
      email: isLoggedIn ? (authUser?.email ?? '') : guestForm.email,
      address: addr.address ?? addr.shipping_address ?? '',
      apartment: addr.apartment ?? '',
      landmark: addr.landmark ?? '',
      city: addr.city ?? '',
      state: addr.state ?? '',
      zip_code: addr.zip_code ?? '',
      country: addr.country ?? 'India',
    };

    try {
      const res = await orderService.createOrder(orderPayload);

      if (!window.Razorpay) {
        toast.error('Payment gateway failed to load. Please refresh the page.');
        setIsPlacingOrder(false);
        return;
      }

      const rzpOptions = {
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

    // Clear everything after successful payment
    clearCart();
    removeCoupon();
    setAppliedExchange(null);
    setCouponInput('');
    setExchangeInput('');

    toast.success('🎉 Payment successful! Your order is confirmed.');

    if (isLoggedIn) {
      navigate('/profile?tab=orders');
    } else {
      setOrderSuccess({
        orderId: res.order_id,
        guestEmail: guestForm.email,
        isGuest: true,
      });
      setIsPlacingOrder(false);
    }
  } catch {
            toast.error(
              'Payment verification failed. Contact support with payment ID: ' +
              response.razorpay_payment_id,
            );
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: `${addr.first_name ?? ''} ${addr.last_name ?? ''}`.trim(),
          contact: addr.phone ?? '',
          email: isLoggedIn ? (authUser?.email ?? '') : guestForm.email,
        },
        theme: { color: '#1A3831' },
        modal: {
          ondismiss: () => {
            toast.error(
              'Payment cancelled. Your order is saved — you can complete payment anytime.',
            );
            setIsPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again or use a different method.');
        setIsPlacingOrder(false);
      });
      rzp.open();
    } catch (err: any) {
      const message = err?.error || err?.detail || 'Checkout failed. Please try again.';
      setCheckoutError(message);
      toast.error(message);
      setIsPlacingOrder(false);
    }
  };

  // ─── Success screen (guest) ────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-[120px] flex items-start justify-center px-4">
        <div className="max-w-lg w-full space-y-6 py-12">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-[#1A3831] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#1A3831]/20">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-extrabold text-gray-900">
              Order Confirmed!
            </h1>
            <p className="text-gray-500 text-sm">
              Order #{orderSuccess.orderId} · Confirmation sent to{' '}
              <strong>{orderSuccess.guestEmail}</strong>
            </p>
          </div>

          {/* Track order CTA */}
          {/* Order Details */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
    Order Details
  </p>

  <div className="bg-[#F8F7F4] rounded-xl p-4 border border-gray-100">
    <p className="text-xs text-gray-500 mb-1">
      Your Order ID
    </p>

    <p className="text-2xl font-black text-[#1A3831] tracking-wide">
      #{orderSuccess.orderId}
    </p>
  </div>

  <p className="text-xs text-gray-500 leading-relaxed">
    Please save this order ID for future reference. We will contact you within 24 hours via mail/phone number.
  </p>
</div>

          {/* Create account nudge */}
          <div className="bg-[#F0F4E8] rounded-2xl border border-[#667D00]/20 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#667D00]" />
              <p className="text-sm font-bold text-[#1A3831]">
                Save time on your next order
              </p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Create a free account to save your addresses, track all orders in one place,
              and checkout faster next time.
            </p>
            <div className="flex gap-3">
              <Link
                to={`/signup?email=${encodeURIComponent(orderSuccess.guestEmail)}`}
                className="flex-1 text-center py-2.5 bg-[#1A3831] text-white text-xs font-bold rounded-xl hover:bg-[#112520] transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login?redirect=/checkout"
                className="flex-1 text-center py-2.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Empty cart ────────────────────────────────────────────────────────────
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

  // ─── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-[120px]">
      <div className="container mx-auto px-4 max-w-6xl py-8">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/shop"
            className="text-sm text-gray-400 hover:text-[#667D00] transition-colors font-medium"
          >
            ← Continue Shopping
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gray-900">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

          {/* ═══════════════════════════════ LEFT COLUMN ══════════════════════ */}
          <div className="space-y-6">

            {/* ── GUEST LOGIN ENCOURAGEMENT BANNER ───────────────────────────── */}
            {!isLoggedIn && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1A3831]/8 flex items-center justify-center flex-shrink-0">
                    <LogIn className="h-5 w-5 text-[#1A3831]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">Have an account?</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Login to track orders, save addresses &amp; checkout faster.
                    </p>
                    <div className="flex gap-3 mt-3">
                      <Link
                        to="/login?redirect=/checkout"
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1A3831] px-4 py-2 rounded-xl hover:bg-[#112520] transition-colors"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        Login / Create Account
                      </Link>
                      
                    </div>
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-300 flex-shrink-0">
                    Optional
                  </div>
                </div>
              </div>
            )}

            {/* ── DELIVERY ADDRESS ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-serif font-extrabold text-gray-900 text-lg mb-5">
                Delivery Address
              </h2>

              {isLoggedIn ? (
                /* Logged-in: use AddressManager with onSelect */
                <AddressManager
                  onSelect={(addr: any) => setSelectedAddress(addr)}
                  selectedId={selectedAddress?.id}
                />
              ) : (
                /* Guest: manual address form */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="First Name" required
                      value={guestForm.first_name} onChange={setGF('first_name')}
                      placeholder="Aryan"
                    />
                    <Field
                      label="Last Name"
                      value={guestForm.last_name} onChange={setGF('last_name')}
                      placeholder="Sharma"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Email Address" required type="email"
                      value={guestForm.email} onChange={setGF('email')}
                      placeholder="aryan@example.com"
                    />
                    <Field
                      label="Phone Number" required type="tel"
                      value={guestForm.phone} onChange={setGF('phone')}
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                      Street Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      value={guestForm.address}
                      onChange={e => setGF('address')(e.target.value)}
                      placeholder="House / Flat no., Street name"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Apartment / Floor"
                      value={guestForm.apartment} onChange={setGF('apartment')}
                      placeholder="Apt 4B (optional)"
                    />
                    <Field
                      label="Landmark"
                      value={guestForm.landmark} onChange={setGF('landmark')}
                      placeholder="Near Metro Station (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="City" required
                      value={guestForm.city} onChange={setGF('city')}
                      placeholder="Mumbai"
                    />
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        State <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={guestForm.state}
                        onChange={e => setGF('state')(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all bg-white"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="PIN Code" required
                      value={guestForm.zip_code} onChange={setGF('zip_code')}
                      placeholder="400001"
                    />
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        Country
                      </label>
                      <input
                        value="India"
                        disabled
                        className="w-full border border-gray-100 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      We'll send your order confirmation and tracking updates to the email/mobile number above.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── PAYMENT METHOD ───────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-serif font-extrabold text-gray-900 text-lg mb-4">
                Payment
              </h2>
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

          {/* ═══════════════════════════════ RIGHT COLUMN ═════════════════════ */}
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
                    <div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F8F7F4] border border-gray-100 flex-shrink-0">
                        {imageUrl
                          ? <img src={imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}
                          {' · '}Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {fmt(item.price * item.quantity)}
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
                        {appliedCoupon.code} — Save {fmt(appliedCoupon.discount)}
                      </span>
                    </div>
                    <button
                      onClick={() => { removeCoupon(); setCouponInput(''); }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
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

              {/* ── Exchange Code ── */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  Exchange Code
                </label>
                {appliedExchange ? (
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-bold text-amber-700">{appliedExchange.code}</p>
                        <p className="text-[10px] text-amber-600">
                          Discount: {fmt(Math.min(appliedExchange.originalOrderValue, totals.subtotal))}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setAppliedExchange(null); setExchangeInput(''); }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={exchangeInput}
                      onChange={e => setExchangeInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyExchange()}
                      placeholder="YC-XXXXXXXX"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all"
                    />
                    <button
                      onClick={handleApplyExchange}
                      disabled={exchangeLoading || !exchangeInput.trim()}
                      className="px-4 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                    >
                      {exchangeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Price Breakdown ── */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{fmt(checkoutCalc.subtotal)}</span>
                </div>

                {checkoutCalc.couponDiscount > 0 && appliedCoupon && (
                  <div className="flex justify-between text-sm text-[#667D00]">
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" /> {appliedCoupon.code}
                    </span>
                    <span className="font-medium">−{fmt(checkoutCalc.couponDiscount)}</span>
                  </div>
                )}

                {checkoutCalc.exchangeDiscount > 0 && appliedExchange && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span className="flex items-center gap-1">
                      <Gift className="h-3 w-3" /> {appliedExchange.code}
                    </span>
                    <span className="font-medium">−{fmt(checkoutCalc.exchangeDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5" /> Shipping
                  </span>
                  <span className={`font-medium ${checkoutCalc.shipping === 0 ? 'text-[#667D00]' : ''}`}>
                    {checkoutCalc.shipping === 0 ? 'FREE' : fmt(checkoutCalc.shipping)}
                  </span>
                </div>

                {checkoutCalc.tax > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">{fmt(checkoutCalc.tax)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="font-extrabold text-gray-900">Total</span>
                  <span className="font-extrabold text-2xl text-gray-900">
                    {fmt(checkoutCalc.total)}
                  </span>
                </div>
              </div>

              {/* ── Return & Exchange Policy ── */}
              <div className="bg-[#F8F7F4] rounded-xl p-4 space-y-3 border border-gray-100">
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                  Return &amp; Exchange Policy
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
                    Exchange value must be equal or higher
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
                    I have read and accept the return &amp; exchange policy
                  </span>
                </label>
              </div>

              {/* Error */}
              {checkoutError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-medium">{checkoutError}</p>
                </div>
              )}

              {/* CTA */}
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
                  <>Pay {fmt(checkoutCalc.total)} <ChevronRight className="h-4 w-4" /></>
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
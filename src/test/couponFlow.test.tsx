import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { PromoCodeInput } from '@/components/cart/PromoCodeInput';
import { bestAutomaticCoupon, isAutomaticCoupon, normalizeCoupon, validatedCoupon } from '@/utils/couponPolicy';
import { calculateCartTotals } from '@/utils/cartCalculations';

const mocks = vi.hoisted(() => ({ active: vi.fn(), validate: vi.fn(), config: vi.fn(), quote: vi.fn() }));
vi.mock('@/services/api', () => ({ storeService: {
  getActiveCoupons: mocks.active, validateCoupon: mocks.validate, getSiteConfig: mocks.config, getPromotionQuote: mocks.quote,
} }));
const definitions = [
  { code: 'DIWALI10', discount_type: 'percentage' as const, value: 10, min_order_value: 199 },
  { code: 'INFLU', discount_type: 'fixed' as const, value: 179, min_order_value: 199 },
  { code: '10% OFF', discount_type: 'percentage' as const, value: 10, min_order_value: 999 },
];
let cart: ReturnType<typeof useCart>;
function Probe() { cart = useCart(); return <><output data-testid="discount">{cart.totals.couponDiscount}</output><PromoCodeInput /></>; }
function start(price = 379) {
  localStorage.setItem('rastlina_cart_v2', JSON.stringify([{ product: { id: 1, name: 'Plant', slug: 'plant' }, quantity: 1, selectedSize: 'Small', selectedColor: 'White', price, originalPrice: price, stock: 20, variantId: 1 }]));
  return render(<CartProvider><Probe /></CartProvider>);
}
async function settled() { await waitFor(() => expect(cart.couponPending).toBe(false)); }
beforeEach(() => {
  localStorage.clear();
  mocks.active.mockResolvedValue(definitions);
  mocks.config.mockResolvedValue({ free_shipping_threshold: 499, shipping_fee: 99, tax_percentage: 0 });
  mocks.validate.mockImplementation(async (code, subtotal) => {
    const coupon = definitions.find(c => c.code === code);
    if (!coupon || subtotal < coupon.min_order_value) throw { error: 'Minimum order requirement not met' };
    // Matches the deployed API: validation intentionally omits value/minimum.
    return { success: true, code, discount_type: coupon.discount_type, discount: 1 };
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('coupon eligibility and non-stacking', () => {
  it('never opts campaign codes into automatic application, even with a flag', () => {
    expect(isAutomaticCoupon({ ...definitions[0], auto_apply: true })).toBe(false);
    expect(isAutomaticCoupon({ ...definitions[1], auto_apply: true })).toBe(false);
    expect(bestAutomaticCoupon(definitions, 998)).toBeNull();
    expect(bestAutomaticCoupon(definitions, 999)?.code).toBe('10% OFF');
    expect(bestAutomaticCoupon([{ ...definitions[1], code: 'NEW_PRIVATE_CODE' }], 2000)).toBeNull();
  });
  it('normalizes decimal strings and clamps discounts to the subtotal', () => {
    const coupon = normalizeCoupon({ ...definitions[1], value: '179.00', min_order_value: '199.00' } as never);
    expect(validatedCoupon(coupon, 379).discount).toBe(179);
    expect(validatedCoupon({ ...coupon, value: 999 }, 379).discount).toBe(379);
    const totals = calculateCartTotals([{ price: 999, quantity: 1, stock: 2 }], validatedCoupon(definitions[2], 999), 499, 99);
    expect(totals.couponDiscount).toBe(99.9);
    expect(totals.total).toBe(899.1);
    expect(totals.shipping).toBe(0);
  });
  it('drops legacy automatically saved INFLU instead of silently restoring it', async () => {
    localStorage.setItem('rastlina_coupon_v2', JSON.stringify({ ...definitions[1], discount: 179 }));
    start(); await waitFor(() => expect(cart.items).toHaveLength(1)); await settled();
    expect(cart.appliedCoupon).toBeNull(); expect(mocks.validate).not.toHaveBeenCalled();
    expect(cart.availableCoupons.map(c => c.code)).toEqual(['10% OFF']);
    expect(localStorage.getItem('rastlina_coupon_v2')).toBeNull();
  });
  it('applies manual INFLU from the cart entry and recalculates after quantity changes', async () => {
    start(); await waitFor(() => expect(cart.items).toHaveLength(1));
    fireEvent.change(screen.getByLabelText('Promo code'), { target: { value: ' influ ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(cart.appliedCoupon?.code).toBe('INFLU')); await settled();
    expect(cart.totals.total).toBe(299); expect(cart.totals.couponDiscount).toBe(179);
    expect(localStorage.getItem('rastlina_manual_coupon_v3')).toBe('"INFLU"');
    await act(async () => { cart.updateQuantity(1, 'Small', 'White', 3); });
    await waitFor(() => expect(cart.appliedCoupon?.validated_subtotal).toBe(1137));
    expect(cart.totals.couponDiscount).toBe(179); expect(cart.totals.shipping).toBe(0);
  });
  it('replaces the automatic discount with exactly one entered code and restores it on removal', async () => {
    start(999); await waitFor(() => expect(cart.appliedCoupon?.code).toBe('10% OFF'));
    await act(async () => { await cart.applyCouponCode('INFLU'); }); await settled();
    expect(cart.appliedCoupon?.code).toBe('INFLU'); expect(cart.totals.couponDiscount).toBe(179);
    await act(async () => { await cart.applyCouponCode('DIWALI10'); }); await settled();
    expect(cart.appliedCoupon?.code).toBe('DIWALI10'); expect(cart.totals.couponDiscount).toBe(99.9);
    await act(async () => { cart.removeCoupon(); });
    await waitFor(() => expect(cart.appliedCoupon?.code).toBe('10% OFF'));
  });
  it('removes an automatic offer immediately below its threshold', async () => {
    start(); await waitFor(() => expect(cart.items).toHaveLength(1));
    await act(async () => { cart.updateQuantity(1, 'Small', 'White', 3); });
    await waitFor(() => expect(cart.appliedCoupon?.code).toBe('10% OFF'));
    await act(async () => { cart.updateQuantity(1, 'Small', 'White', 1); });
    expect(cart.totals.couponDiscount).toBe(0); expect(cart.appliedCoupon).toBeNull();
  });
  it('rejects invalid codes and preserves the eligible automatic offer', async () => {
    start(999); await waitFor(() => expect(cart.appliedCoupon?.code).toBe('10% OFF'));
    await act(async () => { await expect(cart.applyCouponCode('INVALID')).rejects.toBeTruthy(); });
    await waitFor(() => expect(cart.appliedCoupon?.code).toBe('10% OFF')); await settled();
    expect(cart.totals.couponDiscount).toBe(99.9);
  });
  it('revalidates restored manual selections against expiry and usage limits', async () => {
    localStorage.setItem('rastlina_manual_coupon_v3', '"INFLU"');
    mocks.validate.mockRejectedValue({ error: 'Coupon has expired' });
    start(); await waitFor(() => expect(mocks.validate).toHaveBeenCalled()); await settled();
    expect(cart.appliedCoupon).toBeNull(); expect(cart.totals.couponDiscount).toBe(0);
    expect(localStorage.getItem('rastlina_manual_coupon_v3')).toBeNull();
  });
  it('ignores a slow validation response for an older cart', async () => {
    let resolveOld: (v: unknown) => void;
    mocks.validate.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }));
    start(999); await waitFor(() => expect(mocks.validate).toHaveBeenCalled());
    await act(async () => { cart.updateQuantity(1, 'Small', 'White', 0); });
    await act(async () => { resolveOld!({ success: true, code: '10% OFF' }); });
    expect(cart.appliedCoupon).toBeNull(); expect(cart.totals.couponDiscount).toBe(0);
  });
});

function modernQuote(subtotal: number, code = '') {
  const isCreator = code === 'INFLU';
  const selected = [
    ...(code ? [{ ...definitions.find(c => c.code === code)!, auto_apply: false }] : []),
    ...(!isCreator && subtotal >= 999 && code !== '10% OFF' ? [{ ...definitions[2], auto_apply: true }] : []),
  ];
  let left = subtotal;
  const rows = selected.map(c => {
    const discount = Math.min(left, c.discount_type === 'fixed' ? c.value : Math.round(subtotal * c.value) / 100);
    left -= discount;
    return { ...c, discount, free_shipping: isCreator, staff_only: isCreator,
      min_order_value: isCreator ? 0 : c.min_order_value, shipping_discount: isCreator && subtotal < 499 ? 99 : 0 };
  });
  const discount = rows.reduce((sum, c) => sum + c.discount, 0);
  const shipping = isCreator || subtotal >= 499 ? 0 : 99;
  return { policy_version: 2, subtotal, applied_discounts: rows, coupon_discount: discount,
    shipping_discount: isCreator && subtotal < 499 ? 99 : 0, shipping_fee: shipping, tax: 0,
    total: Math.round((subtotal - discount + shipping) * 100) / 100 };
}
function modernConfig() {
  mocks.config.mockResolvedValue({ free_shipping_threshold: 499, shipping_fee: 99, tax_percentage: 0, promotion_policy_version: 2 });
  mocks.quote.mockImplementation(async (subtotal, code) => modernQuote(subtotal, code));
}

it('combines DIWALI10 and automatic 10% only after the backend advertises policy 2', async () => {
  modernConfig(); start(2274);
  await waitFor(() => expect(cart.pricingReady && cart.appliedCoupons.length).toBe(1));
  await act(async () => { await cart.applyCouponCode('DIWALI10'); }); await settled();
  expect(cart.appliedCoupons.map(c => c.code)).toEqual(['DIWALI10', '10% OFF']);
  expect(cart.totals.couponDiscount).toBe(454.8);
  expect(cart.totals.total).toBe(1819.2);
});
it('creator INFLU removes shipping below the public free-delivery threshold', async () => {
  modernConfig(); start(199);
  await waitFor(() => expect(cart.pricingPolicyVersion).toBe(2)); await settled();
  await act(async () => { await cart.applyCouponCode('INFLU'); }); await settled();
  expect(cart.totals.shipping).toBe(0); expect(cart.totals.shippingDiscount).toBe(99);
  expect(cart.totals.total).toBe(20);
  expect(cart.appliedCoupons.map(c => c.code)).toEqual(['INFLU']);
});
it('removing a modern manual code leaves just the automatic offer', async () => {
  modernConfig(); start(2274);
  await waitFor(() => expect(cart.pricingReady && cart.appliedCoupons.length).toBe(1));
  await act(async () => { await cart.applyCouponCode('DIWALI10'); }); await settled();
  await act(async () => { cart.removeCoupon(); }); await settled();
  expect(cart.appliedCoupons.map(c => c.code)).toEqual(['10% OFF']);
  expect(cart.totals.couponDiscount).toBe(227.4);
});
it('blocks checkout pricing on quote failure and allows a retry', async () => {
  modernConfig(); mocks.quote.mockRejectedValueOnce(new Error('Network failure')); start(2274);
  await waitFor(() => expect(cart.pricingError).toBeTruthy());
  expect(cart.pricingReady).toBe(false);
  expect(cart.totals.couponDiscount).toBe(0);
  await act(async () => { cart.retryPromotions(); }); await settled();
  expect(cart.pricingReady).toBe(true); expect(cart.totals.couponDiscount).toBe(227.4);
});

it('blocks fallback shipping and promotions when delivery rules cannot load, then recovers on retry', async () => {
  modernConfig(); mocks.config.mockRejectedValueOnce(new Error('Network failure')); start(1137);
  await waitFor(() => expect(cart.pricingError).toContain('Unable to load delivery'));
  expect(cart.pricingReady).toBe(false);
  expect(mocks.quote).not.toHaveBeenCalled();
  await act(async () => { cart.retryPromotions(); });
  await waitFor(() => expect(cart.pricingReady).toBe(true));
  expect(cart.pricingPolicyVersion).toBe(2);
  expect(cart.totals.total).toBe(1023.3);
});

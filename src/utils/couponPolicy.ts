import { calculateCouponDiscount, type AppliedCoupon } from './cartCalculations';

export interface CouponDefinition {
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  auto_apply?: boolean;
}

export const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

// The current backend has no auto-apply flag. Only the advertised public offer
// opts in; private campaign codes must always be entered by the customer.
export function isAutomaticCoupon(coupon: CouponDefinition): boolean {
  const code = normalizeCouponCode(coupon.code);
  if (code === 'INFLU' || code === 'DIWALI10') return false;
  return coupon.auto_apply === true || code === '10% OFF';
}

export function normalizeCoupon(coupon: CouponDefinition): CouponDefinition {
  return { ...coupon, code: normalizeCouponCode(coupon.code),
    value: Number(coupon.value), min_order_value: Number(coupon.min_order_value) };
}

export function bestAutomaticCoupon(coupons: CouponDefinition[], subtotal: number) {
  return coupons.filter(c => isAutomaticCoupon(c) && subtotal > 0 && subtotal >= c.min_order_value)
    .sort((a, b) => calculateCouponDiscount(subtotal, { ...b, discount: 0 })
      - calculateCouponDiscount(subtotal, { ...a, discount: 0 }))[0] ?? null;
}

export function validatedCoupon(definition: CouponDefinition, subtotal: number): AppliedCoupon {
  const coupon = { ...normalizeCoupon(definition), discount: 0, validated_subtotal: subtotal };
  return { ...coupon, discount: calculateCouponDiscount(subtotal, coupon) };
}

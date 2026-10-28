import type { AppliedCoupon } from './cartCalculations';

export interface PromotionQuote {
  subtotal: number;
  coupons: AppliedCoupon[];
  couponDiscount: number;
  shippingDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}
const amount = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw { error: 'Unable to verify the order total. Please retry.' };
  return parsed;
};

const record = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw { error: 'Unable to verify the order total. Please retry.' };
  return value as Record<string, unknown>;
};
export function parsePromotionQuote(input: unknown, subtotal: number): PromotionQuote {
  const raw = record(input);
  if (raw?.policy_version !== 2 || amount(raw.subtotal) !== subtotal || !Array.isArray(raw.applied_discounts)) {
    throw { error: 'Your cart changed. Please retry the offer check.' };
  }
  const codes = new Set<string>();
  const coupons = raw.applied_discounts.map((input: unknown): AppliedCoupon => {
    const row = record(input);
    if (typeof row.code !== 'string' || codes.has(row.code) || (row.discount_type !== 'percentage' && row.discount_type !== 'fixed')) {
      throw { error: 'Unable to verify the applied offers. Please retry.' };
    }
    codes.add(row.code);
    return { code: row.code, discount_type: row.discount_type, value: amount(row.value),
      min_order_value: amount(row.min_order_value), discount: amount(row.discount),
      validated_subtotal: subtotal, free_shipping: row.free_shipping === true,
      shipping_discount: amount(row.shipping_discount), auto_apply: row.auto_apply === true,
      staff_only: row.staff_only === true };
  });
  const quote = { subtotal, coupons, couponDiscount: amount(raw.coupon_discount),
    shippingDiscount: amount(raw.shipping_discount), shipping: amount(raw.shipping_fee),
    tax: amount(raw.tax), total: amount(raw.total) };
  const sum = coupons.reduce((total, coupon) => total + coupon.discount, 0);
  if (quote.couponDiscount > subtotal || Math.abs(sum - quote.couponDiscount) > .001 ||
      Math.abs(subtotal - quote.couponDiscount + quote.shipping + quote.tax - quote.total) > .001) {
    throw { error: 'Unable to verify the order total. Please retry.' };
  }
  return quote;
}

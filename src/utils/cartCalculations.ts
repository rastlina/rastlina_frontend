// src/utils/cartCalculations.ts
// Pure utility functions for cart pricing — no side effects, fully typed

export interface CartPricingItem {
  price: number;           // actual sale price per unit
  original_price?: number | null; // MRP / crossed-out price
  quantity: number;
  stock: number;           // max allowed quantity
}

export interface CartTotals {
  subtotal: number;         // sum of price × qty
  originalSubtotal: number; // sum of original_price × qty (MRP total)
  itemSavings: number;      // originalSubtotal - subtotal (from sale prices)
  couponDiscount: number;   // reduction from applied coupon
  shipping: number;         // 0 if free shipping unlocked
  tax: number;              // tax amount (if applicable)
  total: number;            // final amount to pay
  totalSavings: number;     // itemSavings + couponDiscount
}

export interface AppliedCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  discount: number;
}
// ─── Core Calculations ────────────────────────────────────────────────────────

export function calculateSubtotal(items: CartPricingItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateOriginalSubtotal(items: CartPricingItem[]): number {
  return items.reduce((sum, item) => {
    const original = item.original_price ?? item.price;
    return sum + original * item.quantity;
  }, 0);
}

export function calculateItemSavings(items: CartPricingItem[]): number {
  const orig = calculateOriginalSubtotal(items);
  const sale = calculateSubtotal(items);
  return Math.max(0, orig - sale);
}

export function calculateCouponDiscount(
  subtotal: number,
  coupon: AppliedCoupon | null,
): number {
  if (!coupon) return 0;
  if (subtotal < coupon.min_order_value) return 0;
  if (coupon.discount_type === 'percentage') {
    return Math.round((subtotal * coupon.value) / 100);
  }
  return Math.min(coupon.value, subtotal); // fixed discount can't exceed subtotal
}

export function calculateShipping(
  subtotal: number,
  freeShippingThreshold: number,
  baseShippingFee: number,
): number {

  // Shipping disabled globally
  if (baseShippingFee <= 0) return 0;

  // Free shipping disabled
  if (freeShippingThreshold <= 0) {
    return baseShippingFee;
  }

  // Unlock free shipping
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }

  return baseShippingFee;
}

export function calculateRemainingForFreeShipping(
  subtotal: number,
  freeShippingThreshold: number,
): number {

  if (freeShippingThreshold <= 0) {
    return 0;
  }

  return Math.max(0, freeShippingThreshold - subtotal);
}

export function calculateRemainingForCoupon(
  subtotal: number,
  minOrderValue: number,
): number {
  return Math.max(0, minOrderValue - subtotal);
}

export function calculateFreeShippingProgress(
  subtotal: number,
  freeShippingThreshold: number,
): number {

  if (freeShippingThreshold <= 0) {
    return 100;
  }

  return Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );
}

/** Master function — computes all cart totals in one call */
export function calculateCartTotals(
  items: CartPricingItem[],
  coupon: AppliedCoupon | null,
  freeShippingThreshold: number,
  baseShippingFee: number,
  taxPercentage = 0,
): CartTotals {
  const subtotal = calculateSubtotal(items);
  const originalSubtotal = calculateOriginalSubtotal(items);
  const itemSavings = calculateItemSavings(items);
  const couponDiscount = calculateCouponDiscount(subtotal, coupon);
  const afterCoupon = Math.max(0, subtotal - couponDiscount);
const shipping = calculateShipping(
  afterCoupon,
  freeShippingThreshold,
  baseShippingFee
);
  const tax = taxPercentage > 0 ? Math.round((afterCoupon * taxPercentage) / 100) : 0;
  const total = afterCoupon + shipping + tax;
  const totalSavings = itemSavings + couponDiscount;

  return {
    subtotal,
    originalSubtotal,
    itemSavings,
    couponDiscount,
    shipping,
    tax,
    total,
    totalSavings,
  };
}

// ─── Stock Helpers ────────────────────────────────────────────────────────────

/** Clamp quantity between 1 and stock */
export function clampQuantity(qty: number, stock: number): number {
  return Math.max(1, Math.min(qty, stock));
}

export function canIncrement(qty: number, stock: number): boolean {
  return qty < stock;
}
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AppliedDiscounts } from '@/components/cart/AppliedDiscounts';
import { validatedCoupon } from '@/utils/couponPolicy';

const state = vi.hoisted(() => ({ cart: {} as any }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => state.cart }));
const automatic = { code: '10% OFF', discount_type: 'percentage' as const, value: 10, min_order_value: 999 };
beforeEach(() => {
  state.cart = { appliedCoupon: null, totals: { subtotal: 2274, couponDiscount: 0 }, availableCoupons: [automatic], couponPending: false };
});
afterEach(cleanup);

it('names a manually applied percentage code and shows its exact deduction', () => {
  state.cart.appliedCoupon = validatedCoupon({ ...automatic, code: 'DIWALI10', min_order_value: 199 }, 2274);
  state.cart.totals.couponDiscount = 227.4;
  render(<AppliedDiscounts />);
  const section = screen.getByRole('region', { name: 'Applied discounts' });
  expect(within(section).getByText('Promo code — DIWALI10')).toBeVisible();
  expect(within(section).getAllByText('−₹227.40')).toHaveLength(2);
  expect(within(section).getByText('Total discounts')).toBeVisible();
  expect(within(section).queryByText('Discount — 10% off')).not.toBeInTheDocument();
});

it('shows the automatic offer separately as eligible without deducting it twice', () => {
  state.cart.appliedCoupon = validatedCoupon({ ...automatic, code: 'INFLU', discount_type: 'fixed', value: 179, min_order_value: 199 }, 2274);
  state.cart.totals.couponDiscount = 179;
  render(<AppliedDiscounts />);
  expect(screen.getByText('Promo code — INFLU')).toBeVisible();
  expect(screen.getByText('Automatic discount — 10% OFF')).toBeVisible();
  expect(screen.getByText('₹227.40')).toBeVisible();
  expect(screen.getByText(/Eligible · Not added to total/)).toBeVisible();
  expect(screen.getAllByText('−₹179.00')).toHaveLength(2);
  expect(screen.queryByText('−₹406.40')).not.toBeInTheDocument();
});

it('shows the applied automatic 10% offer once, including at the exact ₹999 boundary', () => {
  state.cart.totals = { subtotal: 999, couponDiscount: 99.9 };
  state.cart.appliedCoupon = validatedCoupon(automatic, 999);
  render(<AppliedDiscounts />);
  expect(screen.getAllByText('Automatic discount — 10% OFF')).toHaveLength(1);
  expect(screen.getAllByText('−₹99.90')).toHaveLength(2);
  expect(screen.queryByText(/Eligible/)).not.toBeInTheDocument();
});

it('does not advertise the automatic offer below its minimum', () => {
  state.cart.totals = { subtotal: 998, couponDiscount: 99.8 };
  state.cart.appliedCoupon = validatedCoupon({ ...automatic, code: 'DIWALI10', min_order_value: 199 }, 998);
  render(<AppliedDiscounts />);
  expect(screen.getByText('Promo code — DIWALI10')).toBeVisible();
  expect(screen.queryByText('Automatic discount — 10% OFF')).not.toBeInTheDocument();
});

it('does not call an offer applied while server validation is pending', () => {
  state.cart.couponPending = true;
  render(<AppliedDiscounts />);
  expect(screen.getByRole('status')).toHaveTextContent('Checking offer eligibility');
  expect(screen.getByText('Eligible · Waiting for validation.')).toBeVisible();
  expect(screen.getByText('₹0.00')).toBeVisible();
  expect(screen.queryByText('−₹227.40')).not.toBeInTheDocument();
});

it('hides the block when no promotion applies or is eligible', () => {
  state.cart.totals.subtotal = 379;
  render(<AppliedDiscounts />);
  expect(screen.queryByRole('region', { name: 'Applied discounts' })).not.toBeInTheDocument();
});

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import CheckoutPage from '@/pages/CheckoutPage';
const mocks = vi.hoisted(() => ({ create: vi.fn(), verify: vi.fn(), clear: vi.fn(), remove: vi.fn(), ready: true }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 1, email: 'staff@example.invalid' } }) }));
vi.mock('@/services/api', () => ({ authService: {}, orderService: { createOrder: mocks.create, verifyPayment: mocks.verify } }));
vi.mock('@/components/profile/AdressManager', () => ({ default: ({ onSelect }: { onSelect: (address: unknown) => void }) =>
  <button onClick={() => onSelect({ first_name: 'Test', last_name: 'Staff', address: 'Test street', city: 'Test city', state: 'Test state', zip_code: '500001', phone: '9000000000' })}>Select test address</button> }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({
  items: [{ product: { id: 1, name: 'Plant', slug: 'plant' }, price: 100, quantity: 1, variantId: 1 }],
  totals: { subtotal: 100, couponDiscount: 100, shipping: 0, shippingDiscount: 99, tax: 0, total: 0 },
  appliedCoupon: { code: 'INFLU', discount: 100 }, appliedCoupons: [{ code: 'INFLU', discount: 100, free_shipping: true, shipping_discount: 99 }],
  availableCoupons: [], pricingPolicyVersion: 2, pricingReady: mocks.ready, manualCouponCode: 'INFLU',
  couponPending: false, siteConfig: { shipping_fee: 99, free_shipping_threshold: 499, tax_percentage: 0 },
  clearCart: mocks.clear, removeCoupon: mocks.remove,
}) }));
beforeEach(() => { mocks.ready = true; mocks.create.mockResolvedValue({ order_id: 23, payment_required: false }); });
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function setup() {
  render(<MemoryRouter initialEntries={['/checkout']}><Routes><Route path="/checkout" element={<CheckoutPage />} /><Route path="/profile" element={<h1>Order history</h1>} /></Routes></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Select test address' }));
  fireEvent.click(screen.getByRole('checkbox', { name: /I have read and accept/ }));
}
it('confirms a server-approved fully covered order without loading or verifying a gateway payment', async () => {
  setup(); fireEvent.click(screen.getByRole('button', { name: 'Place order — no payment required' }));
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Order history' })).toBeVisible());
  expect(mocks.create.mock.calls[0][0]).toMatchObject({ coupon_code: 'INFLU', promotion_policy_version: 2 });
  expect(mocks.clear).toHaveBeenCalledOnce(); expect(mocks.remove).toHaveBeenCalledOnce();
  expect(mocks.verify).not.toHaveBeenCalled();
  expect(document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')).toBeNull();
});
it('blocks order creation until server pricing has been verified', () => {
  mocks.ready = false; setup();
  const button = screen.getByRole('button', { name: 'Place order — no payment required' });
  expect(button).toBeDisabled(); fireEvent.click(button);
  expect(mocks.create).not.toHaveBeenCalled();
});

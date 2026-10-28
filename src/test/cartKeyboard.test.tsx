import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider, useCart } from '@/contexts/CartContext';

const api = vi.hoisted(() => ({ quote: vi.fn() }));
vi.mock('@/services/api', () => ({ storeService: {
  getActiveCoupons: async () => [
    { code: 'DIWALI10', discount_type: 'percentage', value: 10, min_order_value: 199, auto_apply: false },
    { code: '10% OFF', discount_type: 'percentage', value: 10, min_order_value: 999, auto_apply: true },
  ],
  getSiteConfig: async () => ({ promotion_policy_version: 2, shipping_fee: 99, free_shipping_threshold: 499 }),
  getPromotionQuote: api.quote,
} }));
let cart: ReturnType<typeof useCart>;
function Cart() { cart = useCart(); return <CartDrawer />; }
function start() {
  localStorage.setItem('rastlina_cart_v2', JSON.stringify([1, 2, 3].map(id => ({
    product: { id, slug: `plant-${id}`, name: `Plant ${id}` }, quantity: 1, price: 379,
    originalPrice: 599, stock: 4, variantId: id, selectedSize: 'Small', selectedColor: 'Ivory',
  }))));
  return render(<MemoryRouter><CartProvider><Cart /></CartProvider></MemoryRouter>);
}
beforeEach(() => {
  localStorage.clear();
  api.quote.mockImplementation(async (subtotal: number, code = '') => {
    if (code && code !== 'DIWALI10') throw { error: 'Invalid promo code.' };
    const rows = [
      ...(code ? [{ code, discount_type: 'percentage', value: 10, min_order_value: 199, auto_apply: false }] : []),
      ...(subtotal >= 999 ? [{ code: '10% OFF', discount_type: 'percentage', value: 10, min_order_value: 999, auto_apply: true }] : []),
    ].map(row => ({ ...row, discount: Math.round(subtotal * 10) / 100, shipping_discount: 0 }));
    const discount = rows.reduce((total, row) => total + row.discount, 0);
    const shipping = subtotal >= 499 ? 0 : 99;
    return { policy_version: 2, subtotal, applied_discounts: rows, coupon_discount: discount,
      shipping_fee: shipping, shipping_discount: 0, tax: 0, total: Math.round((subtotal - discount + shipping) * 100) / 100 };
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
async function ready() {
  await waitFor(() => expect(cart.pricingReady).toBe(true));
  act(() => cart.openCart());
  await waitFor(() => expect(cart.pricingReady && !cart.couponPending).toBe(true));
  fireEvent.click(screen.getByRole('button', { name: 'Promo code' }));
  return screen.getByRole('textbox', { name: 'Promo code' });
}

it('keeps a typed code and focus when the visual viewport shrinks for the keyboard', async () => {
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0 });
  vi.stubGlobal('visualViewport', viewport);
  const view = start();
  const input = await ready();
  input.focus();
  fireEvent.change(input, { target: { value: 'diwali' } });
  act(() => { viewport.height = 360; viewport.offsetTop = 18; viewport.dispatchEvent(new Event('resize')); });
  expect(screen.getByRole('dialog')).toHaveStyle('--cart-visible-height: 360px; --cart-visible-top: 18px');
  expect(input).toHaveFocus();
  expect(input).toHaveValue('diwali');
  expect(screen.getByTestId('cart-scroll-area')).toContainElement(input);
  expect(screen.getByTestId('cart-scroll-area')).toContainElement(screen.getByRole('region', { name: 'Price details' }));
  view.unmount();
  viewport.dispatchEvent(new Event('resize'));
  expect(document.body.style.overflow).not.toBe('hidden');
});

it('applies and removes a manually typed code while preserving all products and automatic savings', async () => {
  start(); const input = await ready();
  input.focus(); fireEvent.change(input, { target: { value: 'diwali10' } });
  fireEvent.submit(input.closest('form')!);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Checkout — ₹909.60' })).toBeEnabled());
  expect(screen.getByRole('button', { name: 'Checkout — ₹909.60' })).not.toHaveTextContent('₹909.60');
  expect(screen.getAllByText('₹909.60')).toHaveLength(1);
  expect(screen.getByLabelText('PhonePe, Google Pay and CRED UPI')).toBeVisible();
  expect(input).toHaveValue('');
  expect(input).not.toHaveFocus();
  const celebration = screen.getByText('DIWALI10 applied!').closest('.reward-milestone-popup')!;
  expect(celebration).toBeVisible();
  fireEvent.animationEnd(celebration.querySelector('span')!);
  expect(screen.getByText('DIWALI10 applied!')).toBeVisible();
  fireEvent.animationEnd(celebration);
  expect(screen.queryByText('DIWALI10 applied!')).not.toBeInTheDocument();
  const discounts = screen.getByRole('region', { name: 'Applied discounts' });
  expect(discounts).toHaveTextContent('Promo code — DIWALI10');
  expect(discounts).toHaveTextContent('Automatic — 10% OFF');
  expect(discounts).toHaveTextContent('−₹227.40');
  expect(within(screen.getByRole('region', { name: 'Cart products' })).getAllByRole('article')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'Remove promo code' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Checkout — ₹1,023.30' })).toBeEnabled());
});

it('keeps invalid text editable and preserves the previous quote after a rejected submission', async () => {
  start(); const input = await ready();
  input.focus(); fireEvent.change(input, { target: { value: 'INVALID' } });
  fireEvent.submit(input.closest('form')!);
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid promo code.'));
  expect(input).toHaveFocus(); expect(input).toHaveValue('INVALID');
  expect(screen.queryByText('INVALID applied!')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Checkout — ₹1,023.30' })).toBeEnabled();
});

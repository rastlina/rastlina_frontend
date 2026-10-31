import type { ReactNode } from 'react';
import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import CheckoutPage from '@/pages/CheckoutPage';
import LoginPage from '@/pages/LoginPage';

vi.mock('@react-oauth/google', () => ({ GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children, useGoogleLogin: () => vi.fn() }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: null, isLoggedIn: false, login: vi.fn(), signup: vi.fn(), googleLogin: vi.fn() }) }));
vi.mock('@/services/api', () => ({ authService: {}, orderService: {} }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({
  items: [{ product: { id: 1, name: 'Plant', slug: 'plant' }, price: 249, quantity: 1, variantId: 1 }],
  totals: { subtotal: 249, couponDiscount: 0, shipping: 99, shippingDiscount: 0, tax: 0, total: 348, totalSavings: 0 },
  appliedCoupon: null, appliedCoupons: [], availableCoupons: [], pricingPolicyVersion: 2, pricingReady: false,
  couponPending: false, siteConfig: { shipping_fee: 99, free_shipping_threshold: 499, tax_percentage: 0 },
  clearCart: vi.fn(), removeCoupon: vi.fn(),
}) }));
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

it('associates guest delivery labels and supplies useful mobile keyboard and autofill hints', () => {
  render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
  expect(screen.getByRole('textbox', { name: /First Name/ })).toHaveAttribute('autocomplete', 'given-name');
  expect(screen.getByRole('textbox', { name: /Phone Number/ })).toHaveAttribute('type', 'tel');
  expect(screen.getByRole('textbox', { name: /PIN Code/ })).toHaveAttribute('inputmode', 'numeric');
  expect(screen.getByRole('textbox', { name: /Street Address/ })).toHaveAttribute('autocomplete', 'address-line1');
  expect(screen.getByRole('combobox', { name: /State/ })).toHaveAttribute('autocomplete', 'address-level1');
  expect(screen.getByRole('textbox', { name: 'Exchange Code' })).toHaveAttribute('id', 'checkout-exchange-code');
  expect(screen.getByRole('button', { name: 'Apply exchange code' })).toBeDisabled();
});

it('opens the working account creation route without putting the customer email in its URL', () => {
  render(<MemoryRouter initialEntries={[{ pathname: '/login', search: '?mode=signup', state: { email: 'guest@example.invalid' } }]}><LoginPage /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  expect(screen.getByLabelText('Email Address')).toHaveValue('guest@example.invalid');
  expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('autocomplete', 'new-password');
  expect(screen.getByLabelText('Phone (optional)')).toHaveAttribute('type', 'tel');
  expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
});

it('keeps email sign-in available when Google sign-in is not configured', () => {
  vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
  render(<MemoryRouter><LoginPage /></MemoryRouter>);
  expect(within(screen.getByLabelText('Password').closest('form')!).getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Continue with Google' })).not.toBeInTheDocument();
});

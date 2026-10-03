import { act, cleanup, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { CartProvider, useCart } from '@/contexts/CartContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

const savedUser = { id: 1, email: 'test@example.invalid', first_name: 'Test', last_name: 'User' };
vi.mock('@/services/api', () => ({
  storeService: { getSiteConfig: async () => null, getActiveCoupons: async () => [] },
  authService: {
    getStoredUser: () => JSON.parse(localStorage.getItem('rastlinaUser') || 'null'),
    isLoggedIn: () => Boolean(localStorage.getItem('rastlinaToken')),
    getProfile: async () => JSON.parse(localStorage.getItem('rastlinaUser') || 'null'),
    logout: vi.fn(),
  },
}));

afterEach(() => { cleanup(); localStorage.clear(); document.body.innerHTML = ''; });

it('hydrates without replacing saved customer or cart data with empty defaults', async () => {
  const savedCart = [{
    product: { id: 1, name: 'Snake Plant', slug: 'snake-plant' }, quantity: 2,
    selectedSize: 'Medium', selectedColor: 'White', selectedColorHex: '#fff',
    price: 499, originalPrice: 499, stock: 10, variantId: 1,
  }];
  localStorage.setItem('rastlina_cart_v2', JSON.stringify(savedCart));
  localStorage.setItem('rastlinaUser', JSON.stringify(savedUser));
  localStorage.setItem('rastlinaToken', 'test-token');
  function Probe() {
    const { totalItems } = useCart();
    const { user } = useAuth();
    return <div>{totalItems} items; {user?.first_name || 'Guest'}</div>;
  }
  const app = <AuthProvider><CartProvider><Probe /></CartProvider></AuthProvider>;
  const container = document.createElement('div');
  container.innerHTML = renderToString(app);
  expect(container.textContent).toBe('0 items; Guest');
  document.body.appendChild(container);
  const onRecoverableError = vi.fn();
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => { root = hydrateRoot(container, app, { onRecoverableError }); });
  expect(screen.getByText('2 items; Test')).toBeInTheDocument();
  expect(onRecoverableError).not.toHaveBeenCalled();
  expect(JSON.parse(localStorage.getItem('rastlina_cart_v2')!)).toEqual(savedCart);
  expect(JSON.parse(localStorage.getItem('rastlinaUser')!)).toEqual(savedUser);
  await act(async () => root!.unmount());
});

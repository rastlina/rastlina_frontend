import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { selectHomeBestSellers } from '@/hooks/useHomeData';
import type { ApiProduct } from '@/components/products/ProductCard';

const mocks = vi.hoisted(() => ({ close: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({
  isOpen: true, closeCart: mocks.close, items: [], totalItems: 0,
  totals: { subtotal: 0, totalSavings: 0 }, siteConfig: {}, availableCoupons: [],
}) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('keeps cart focus inside the drawer, closes on Escape and restores the page', () => {
  const launcher = document.createElement('button');
  document.body.append(launcher);
  launcher.focus();
  const { unmount } = render(<MemoryRouter><CartDrawer /></MemoryRouter>);
  expect(screen.getByRole('dialog', { name: 'Your Cart' })).toHaveAttribute('aria-modal', 'true');
  const close = screen.getByRole('button', { name: 'Close cart' });
  const browse = screen.getByRole('link', { name: 'Browse Products' });
  expect(close).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(browse).toHaveFocus();
  fireEvent.keyDown(browse, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(close, { key: 'Escape' });
  expect(mocks.close).toHaveBeenCalledOnce();
  unmount();
  expect(document.body.style.overflow).not.toBe('hidden');
  expect(launcher).toHaveFocus();
  launcher.remove();
});

it('shows available individual plants before bundles without duplicates', () => {
  const plant = (id: number, name: string, in_stock = true) => ({ id, name, in_stock }) as ApiProduct;
  const products = [plant(1, 'Snake & Jade - Set of 2'), plant(2, 'ZZ Plant'), plant(3, 'Unavailable', false), plant(2, 'ZZ Plant'), plant(4, 'Syngonium')];
  expect(selectHomeBestSellers(products).map(product => product.id)).toEqual([2, 4, 1]);
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { FixedBottomBar } from '@/components/product-detail/FixedBottomBar';
import type { ProductVariant } from '@/pages/ProductDetail';

afterEach(cleanup);
const variant = { id: 28, size_name: 'Small', color_name: 'Ivory', stock: 3, final_price: 449 } as ProductVariant;
const base = { productName: 'Syngonium White Butterfly', productImage: '/plant.webp', activeVariant: variant,
  quantity: 1, canAddToCart: true, basePrice: 599, onAddToCart: vi.fn(), onQuantityChange: vi.fn() };

it('uses the selected variant total and keeps the cart action working', () => {
  const add = vi.fn();
  render(<FixedBottomBar {...base} quantity={2} onAddToCart={add} />);
  expect(screen.getAllByText('₹898')).toHaveLength(2); // Mobile and desktop price placements.
  expect(screen.getByRole('img', { name: base.productName })).toHaveAttribute('src', '/plant.webp');
  fireEvent.click(screen.getByRole('button', { name: /Add to Cart/ }));
  expect(add).toHaveBeenCalledOnce();
});

it('preserves quantity stock limits and prevents buying an unavailable selection', () => {
  const change = vi.fn(), add = vi.fn();
  const view = render(<FixedBottomBar {...base} quantity={3} onQuantityChange={change} />);
  expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
  expect(change).toHaveBeenCalledWith(2);
  view.rerender(<FixedBottomBar {...base} canAddToCart={false} onAddToCart={add} />);
  fireEvent.click(screen.getByRole('button', { name: 'Out of Stock' }));
  expect(add).not.toHaveBeenCalled();
});

it('keeps a missing-image, no-variant product usable without a broken image', () => {
  render(<FixedBottomBar {...base} productImage="" activeVariant={null} canAddToCart={false} basePrice={1299} />);
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getAllByText('₹1,299')).toHaveLength(2);
  expect(screen.getByRole('region', { name: 'Product purchase bar' })).toBeInTheDocument();
});

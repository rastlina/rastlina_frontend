import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';
import { ProductCard, type ApiProduct } from '@/components/products/ProductCard';

const product: ApiProduct = {
  id: 1, name: 'Snake Plant', slug: 'snake-plant', sku: 'TEST',
  price: 499, discount_percentage: 0,
  images: [{ id: 1, image: '/plant.webp', is_primary: true }],
  available_sizes: [], available_colors: [], review_count: 0, average_rating: 0,
  in_stock: true, is_new_arrival: false, is_best_seller: true, is_best_deal: false,
};

afterEach(cleanup);

it('renders a visible product immediately without entrance-animation styles', () => {
  const { container } = render(<MemoryRouter><ProductCard product={product} index={7} /></MemoryRouter>);
  expect(container.firstElementChild).not.toHaveAttribute('style');
  expect(screen.getByRole('link')).toHaveAttribute('href', '/product/snake-plant');
  expect(screen.getByText('Snake Plant')).toBeInTheDocument();
});

it('keeps product images lazy with reserved dimensions', () => {
  render(<MemoryRouter><ProductCard product={product} /></MemoryRouter>);
  const image = screen.getByAltText('Snake Plant');
  expect(image).toHaveAttribute('loading', 'lazy');
  expect(image).toHaveAttribute('width', '480');
  expect(image).toHaveAttribute('height', '600');
});

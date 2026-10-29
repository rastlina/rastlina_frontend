import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import ProductDetail from '@/pages/ProductDetail';
import { ColorSelector } from '@/components/product-detail/ProductSelector';
import type { ApiProductDetail, ProductVariant } from '@/pages/ProductDetail';

const mocks = vi.hoisted(() => ({ add: vi.fn(), product: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({ addToCart: mocks.add }) }));
vi.mock('@/components/product-detail/ImageGallery', () => ({ ImageGallery: () => <div aria-label="Product photos" /> }));
vi.mock('@/services/api', () => ({
  storeService: { getProductBySlug: mocks.product, getRelatedProducts: async () => ({ results: [] }), getFAQs: async () => [] },
  authService: { isLoggedIn: () => false },
}));
const variant = { id: 28, size_id: 1, size_name: 'Small', color_id: null, color_name: '', color_hex: '',
  stock: 48, final_price: 449, final_original_price: 599, in_stock: true } as ProductVariant;
const product = { id: 25, name: 'Lucky Bamboo', slug: 'lucky-bamboo', sku: 'LAYOUT-TEST', price: '449.00', original_price: '599.00',
  variants: [variant], available_sizes: [{ id: 1, name: 'Small' }], available_colors: [], images: [], reviews: [],
  review_count: 0, average_rating: 0, description: '🌿 A living gift for desks and new beginnings.',
  sunlight: 'Filtered, indirect light.', watering: 'Water when the upper layer of soil is dry.', temperature: '18–30°C',
  care_instructions_list: ['Keep away from direct AC airflow.'], what_you_get_list: ['Lucky Bamboo plant', 'Self-watering pot with soil mix'],
} as unknown as ApiProductDetail;
beforeEach(() => mocks.product.mockResolvedValue(product));
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); });

it('shows the included Ivory option for an unnamed variant while preserving its real selection', () => {
  const select = vi.fn();
  render(<ColorSelector colors={[]} variants={[variant]} selectedSizeId={1} selectedColorId={null} onSelect={select} />);
  const ivory = screen.getByRole('button', { name: 'Ivory' });
  expect(ivory).toHaveAttribute('aria-pressed', 'true'); fireEvent.click(ivory);
  expect(select).toHaveBeenCalledWith(null);
});
it('keeps explicit backend colours and stock controls instead of creating a second Ivory choice', () => {
  const select = vi.fn();
  render(<ColorSelector colors={[{ id: 2, name: 'Ivory', hex_code: '#fff' }, { id: 3, name: 'Black', hex_code: '#000' }]}
    variants={[{ ...variant, color_id: 2 }, { ...variant, id: 29, color_id: 3, stock: 0, in_stock: false }]}
    selectedSizeId={1} selectedColorId={2} onSelect={select} />);
  expect(screen.getAllByRole('button', { name: 'Ivory' })).toHaveLength(1);
  expect(screen.getByRole('button', { name: 'Black' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Ivory' })); expect(select).toHaveBeenCalledWith(2);
});
it('keeps description, care and included details accessible beside the selectors without changing the purchasable variant', async () => {
  render(<HelmetProvider><MemoryRouter initialEntries={['/product/lucky-bamboo']}><Routes>
    <Route path="/product/:slug" element={<ProductDetail />} />
  </Routes></MemoryRouter></HelmetProvider>);
  expect(await screen.findByRole('button', { name: 'Ivory' })).toHaveAttribute('aria-pressed', 'true');
  const tabs = screen.getByRole('tablist', { name: 'Product information' });
  const description = within(tabs).getByRole('tab', { name: 'Description' });
  fireEvent.keyDown(description, { key: 'ArrowRight' });
  expect(within(tabs).getByRole('tab', { name: 'Care Guide' })).toHaveAttribute('aria-selected', 'true');
  expect(await screen.findByText('18–30°C')).toBeInTheDocument();
  fireEvent.click(within(tabs).getByRole('tab', { name: "What's Included" }));
  expect(await screen.findByText('Self-watering pot with soil mix')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Add to Basket/ }));
  await waitFor(() => expect(mocks.add).toHaveBeenCalledOnce());
  expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ id: 25 }), 'Small', 'Standard', '', 449, 599, 48, 28, 1);
});

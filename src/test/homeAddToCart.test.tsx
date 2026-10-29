import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { ProductCard, type ApiProduct } from '@/components/products/ProductCard';

const mocks = vi.hoisted(() => ({ add: vi.fn(), get: vi.fn(), error: vi.fn() }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({ addToCart: mocks.add }) }));
vi.mock('@/services/api', () => ({ storeService: { getProductBySlug: mocks.get } }));
vi.mock('sonner', () => ({ toast: { error: mocks.error } }));
const card = { id: 1, name: 'Snake Plant', slug: 'snake-plant', price: 199, images: [],
  available_sizes: [], available_colors: [], in_stock: true, review_count: 0, average_rating: 0 } as ApiProduct;
const variant = { id: 17, size_id: 3, size_name: 'Small', color_id: 2, color_name: 'Ivory', color_hex: '#fff',
  final_price: '329.00', final_original_price: '499.00', stock: 4, in_stock: true };
const detail = { ...card, original_price: '499.00', variants: [variant],
  images: [{ image: '/global.webp', is_primary: true, color_id: null }, { image: '/ivory.webp', is_primary: true, color_id: 2 }] };
const open = () => render(<MemoryRouter><ProductCard product={card} quickAdd /></MemoryRouter>);
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it('adds the current available variant and price without navigating or nesting the button in a link', async () => {
  mocks.get.mockResolvedValue(detail); open();
  const add = screen.getByRole('button', { name: 'Add to Cart: Snake Plant' });
  expect(add.closest('a')).toBeNull();
  expect(screen.getByRole('link')).not.toHaveTextContent('Choose options');
  fireEvent.click(add);
  await waitFor(() => expect(mocks.add).toHaveBeenCalledOnce());
  expect(mocks.get).toHaveBeenCalledWith('snake-plant');
  expect(mocks.add).toHaveBeenCalledWith(expect.objectContaining({ id: 1, images: [{ image: '/ivory.webp', is_primary: true, color_id: 2 }] }),
    'Small', 'Ivory', '#fff', 329, 499, 4, 17, 1);
});
it('requires an explicit choice when multiple options are available', async () => {
  mocks.get.mockResolvedValue({ ...detail, variants: [variant, { ...variant, id: 18, color_name: 'Black', color_id: 4, final_price: '349.00' }] });
  open(); fireEvent.click(screen.getByRole('button', { name: 'Add to Cart: Snake Plant' }));
  const dialog = await screen.findByRole('dialog', { name: 'Snake Plant' }, { timeout: 5000 });
  expect(mocks.add).not.toHaveBeenCalled();
  expect(within(dialog).getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('radio', { name: /Black/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: /Add to Cart/ }));
  expect(mocks.add).toHaveBeenCalledWith(expect.anything(), 'Small', 'Black', '#fff', 349, 499, 4, 18, 1);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});
it('blocks repeat clicks while fetching and does not add a now-unavailable variant', async () => {
  let finish: (value: unknown) => void;
  mocks.get.mockReturnValue(new Promise(resolve => { finish = resolve; })); open();
  const add = screen.getByRole('button', { name: 'Add to Cart: Snake Plant' });
  fireEvent.click(add); fireEvent.click(add); expect(add).toBeDisabled();
  expect(mocks.get).toHaveBeenCalledOnce();
  finish!({ ...detail, variants: [{ ...variant, stock: 0, in_stock: false }] });
  await waitFor(() => expect(add).toBeEnabled());
  expect(mocks.error).toHaveBeenCalledWith('This plant is currently out of stock.');
  expect(mocks.add).not.toHaveBeenCalled();
});
it('allows retry after an upstream failure without adding a guessed option', async () => {
  mocks.get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(detail); open();
  const add = screen.getByRole('button', { name: 'Add to Cart: Snake Plant' });
  fireEvent.click(add);
  await waitFor(() => expect(mocks.error).toHaveBeenCalled());
  expect(mocks.add).not.toHaveBeenCalled(); fireEvent.click(add);
  await waitFor(() => expect(mocks.add).toHaveBeenCalledOnce());
});

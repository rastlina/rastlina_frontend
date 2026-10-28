import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import OrderHistory from '@/components/profile/OrderHistory';
import { prepareReorder } from '@/utils/reorder';
import type { ApiProductDetail } from '@/pages/ProductDetail';

const mocks = vi.hoisted(() => ({ fetch: vi.fn(), add: vi.fn() }));
vi.mock('@/services/api', () => ({ storeService: { getProductBySlug: mocks.fetch }, orderService: {} }));
vi.mock('@/contexts/CartContext', () => ({ useCart: () => ({ items: [], addToCart: mocks.add }) }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const product = () => ({ id: 5, name: 'Plant', slug: 'plant', price: '399', original_price: '599', images: [],
  variants: [{ id: 7, size_name: 'Small', color_name: 'Ivory', color_hex: '#fff', stock: 5, in_stock: true, final_price: 429, final_original_price: 629 }] }) as unknown as ApiProductDetail;
const oldItem = { product_name: 'Old plant', product_slug: 'plant', variant_label: 'Small / Ivory', quantity: 3 };

it('reorders the original option using current price and stock', async () => {
  const result = await prepareReorder([oldItem], async () => product());
  expect(result.lines[0]).toMatchObject({ price: 429, originalPrice: 629, variantId: 7, quantity: 3, selectedColor: 'Ivory' });
});
it('caps duplicates and existing cart quantities to available stock', async () => {
  const current = (await prepareReorder([{ ...oldItem, quantity: 2 }], async () => product())).lines;
  const result = await prepareReorder([oldItem, oldItem], async () => product(), current);
  expect(result.lines).toHaveLength(1);
  expect(result.lines[0].quantity).toBe(3);
  expect(result.adjusted).toHaveLength(1);
});
it('skips unavailable and ambiguous options without substituting a different colour', async () => {
  const changed = product(); changed.variants[0].color_name = 'Pink';
  const result = await prepareReorder([oldItem], async () => changed);
  expect(result.lines).toEqual([]); expect(result.unavailable).toEqual(['Old plant']);
});
it('handles removed products and out-of-stock variants', async () => {
  const empty = product(); empty.variants[0].stock = 0;
  expect((await prepareReorder([oldItem], async () => empty)).lines).toEqual([]);
  expect((await prepareReorder([oldItem], async () => { throw Error('404'); })).unavailable).toHaveLength(1);
});
it('shows Buy again in order history and adds current items without expanding the card', async () => {
  mocks.fetch.mockResolvedValue(product());
  const order = { id: 12, order_status: 'Delivered', payment_status: 'Paid', total_amount: '10', created_at: '2026-10-01', items: [{ ...oldItem, id: 1, price: 1, item_total: 3 }] };
  render(<MemoryRouter><OrderHistory orders={[order as ComponentProps<typeof OrderHistory>['orders'][number]]} loading={false} currentPage={1} totalPages={1} totalOrders={1} onPageChange={vi.fn()} onRefresh={vi.fn()} /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Buy again order #12' }));
  await waitFor(() => expect(mocks.add).toHaveBeenCalled());
  expect(mocks.add.mock.calls[0].slice(4)).toEqual([429, 629, 5, 7, 3]);
  expect(screen.queryByText('Items in this Order')).not.toBeInTheDocument();
});

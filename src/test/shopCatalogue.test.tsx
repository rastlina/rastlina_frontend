import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Shop from '@/pages/Shop';

const mocks = vi.hoisted(() => ({ products: vi.fn(), filters: vi.fn(), categories: vi.fn() }));
vi.mock('@/services/api', () => ({
  storeService: { getProducts: mocks.products, getFilterOptions: mocks.filters, getCategories: mocks.categories },
}));
vi.mock('@/components/products/ProductCard', () => ({
  ProductCard: ({ product }: { product: { name: string } }) => <div>{product.name}</div>,
}));
vi.mock('@/components/seo/Seo', () => ({ Seo: () => null }));

const products = [
  { id: 1, name: 'Jade', price: 199, category_slug: 'best-sellers', category_name: 'Best-Selling Plants', main_category_slug: 'plants', main_category_name: 'Indoor Plants' },
  { id: 2, name: 'Calathea Ornata', price: 399, category_slug: 'calathea', category_name: 'Calathea Plants', main_category_slug: 'Categories', main_category_name: 'Plant Types' },
  { id: 3, name: 'Plant Combo', price: 699, category_slug: 'combos-of-2', category_name: '2-Plant Combos', main_category_slug: 'combos-bundles', main_category_name: 'Plant Combos' },
];

beforeEach(() => {
  // Match the public API boundary: a main-category filter excludes the other groups.
  mocks.products.mockImplementation(async (params: Record<string, string>) => {
    const matches = products.filter(p => (!params.main_category || p.main_category_slug === params.main_category)
      && (!params.category || p.category_slug === params.category)
      && (!params.search || p.name.toLowerCase().includes(params.search.toLowerCase())));
    return params.ordering === 'price' ? [...matches].sort((a, b) => a.price - b.price) : matches;
  });
  mocks.categories.mockResolvedValue(products.map(p => ({ id: p.id, name: p.category_name, slug: p.category_slug,
    main_category_name: p.main_category_name, main_category_slug: p.main_category_slug })));
  mocks.filters.mockResolvedValue({
    price_range: { min: 199, max: 699 }, sizes: [], colors: [], spaces: [],
    categories: [], care_levels: [], has_pet_friendly: false, has_air_purifying: false,
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const openShop = (url: string) => render(<MemoryRouter initialEntries={[url]}><Shop /></MemoryRouter>);

it('shows plants from themed collections, plant types and bundles, lowest price first', async () => {
  openShop('/shop?main_category=plants');
  expect(await screen.findByText('3 products')).toBeInTheDocument();
  expect(screen.getByText('Jade')).toBeInTheDocument();
  expect(screen.getByText('Calathea Ornata')).toBeInTheDocument();
  expect(screen.getByText('Plant Combo')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'All Indoor Plants' })).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toHaveValue('price');
  expect(mocks.products).toHaveBeenLastCalledWith({ ordering: 'price' });
  expect(mocks.filters).toHaveBeenCalledWith({});
});

it('keeps a selected collection working when it belongs to Plant Types', async () => {
  openShop('/shop?main_category=plants&category=calathea');
  expect(await screen.findByText('1 product')).toBeInTheDocument();
  expect(screen.getByText('Calathea Ornata')).toBeInTheDocument();
  expect(screen.queryByText('Jade')).not.toBeInTheDocument();
  expect(mocks.products).toHaveBeenLastCalledWith({ category: 'calathea', ordering: 'price' });
  expect(mocks.filters).toHaveBeenCalledWith({ category: 'calathea' });
});

it('keeps the separate combo page scoped to its own products', async () => {
  openShop('/shop?main_category=combos-bundles');
  expect(await screen.findByText('1 product')).toBeInTheDocument();
  expect(screen.getByText('Plant Combo')).toBeInTheDocument();
  expect(screen.queryByText('Jade')).not.toBeInTheDocument();
  expect(mocks.products).toHaveBeenLastCalledWith({ main_category: 'combos-bundles', ordering: '-created_at' });
});

it('honours a visitor-selected sort on the all-plants page', async () => {
  openShop('/shop?main_category=plants&ordering=-price');
  await waitFor(() => expect(mocks.products).toHaveBeenLastCalledWith({ ordering: '-price' }));
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'name' } });
  await waitFor(() => expect(mocks.products).toHaveBeenLastCalledWith({ ordering: 'name' }));
});

it('can search for a plant in another collection while retaining a space filter', async () => {
  openShop('/shop?main_category=plants&search=calathea&space=office');
  expect(await screen.findByText('1 product')).toBeInTheDocument();
  expect(screen.getByText('Calathea Ornata')).toBeInTheDocument();
  expect(mocks.products).toHaveBeenLastCalledWith({ search: 'calathea', space: 'office', ordering: 'price' });
});

it('preserves the general shop default ordering', async () => {
  openShop('/shop');
  await waitFor(() => expect(mocks.products).toHaveBeenLastCalledWith({ ordering: '-created_at' }));
});

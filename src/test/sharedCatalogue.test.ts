import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createCatalogueLoader } from '@/server/catalogue';

const plant = (id: number, changes = {}) => ({ id, slug: `plant-${id}`, name: `Plant ${id}`,
  price: '199.00', category_slug: 'best-sellers', main_category_slug: 'plants', care_level: 'easy',
  pet_friendly: false, air_purifying: true, is_new_arrival: false, is_best_seller: true,
  is_trending: false, is_best_deal: false, in_stock: true,
  space_tags: [{ slug: 'office' }, { slug: 'living-room' }], available_sizes: [{ name: 'Small' }],
  available_colors: [{ name: 'Ivory White' }], images: [{ id: 1, is_primary: true }, { id: 2 }], ...changes });
const products = [plant(3), plant(1, { category_slug: 'exotic-beauties', price: '349.00', pet_friendly: true }),
  plant(2, { space_tags: [{ slug: 'bedroom' }], price: '499.00', available_sizes: [{ name: 'Medium' }], is_best_seller: false })];
beforeEach(() => vi.stubGlobal('AbortSignal', { timeout: () => undefined }));
function fixture() {
  const values = new Map<string, unknown>();
  const cache = { get: vi.fn(async (key: string) => values.get(key) ?? null), set: vi.fn(async (key: string, value: unknown) => { values.set(key, value); }) };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => products });
  vi.stubGlobal('fetch', fetch);
  return { values, cache, fetch, load: createCatalogueLoader(async () => cache) };
}
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

it('shares one current ordered feed across collections and filters without changing any card values', async () => {
  const { load, fetch } = fixture();
  const first = await load(new URLSearchParams('ordering=price'));
  const filtered = await load(new URLSearchParams('ordering=price&space=office&category=best-sellers&size=small&color=white&min_price=199&max_price=300&air_purifying=true&is_best_seller=true'));
  expect(first.data).toHaveLength(3);
  expect(filtered.data).toEqual([{ ...products[0], images: [products[0].images[0]] }]);
  expect(filtered.source).toBe('shared'); expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('https://api.rastlina.com/api/store/products/?ordering=price');
  expect((await load(new URLSearchParams('ordering=price&pet_friendly=true'))).data).toHaveLength(1);
  expect((await load(new URLSearchParams('ordering=price&main_category=planters'))).data).toEqual([]);
  expect((await load(new URLSearchParams('ordering=price&care_level=hard'))).data).toEqual([]);
});
it('retains backend ordering and preserves search semantics instead of searching incomplete cards', async () => {
  const { load, fetch } = fixture();
  await load(new URLSearchParams('ordering=-price'));
  await load(new URLSearchParams('search=gift&category=best-sellers&ordering=name'));
  expect(fetch.mock.calls.map(call => call[0])).toEqual([
    'https://api.rastlina.com/api/store/products/?ordering=-price',
    'https://api.rastlina.com/api/store/products/?search=gift&category=best-sellers&ordering=name',
  ]);
});
it('coalesces concurrent filters into one origin request and does not compound cache ages', async () => {
  vi.useFakeTimers(); const { load, fetch } = fixture();
  await Promise.all([load(new URLSearchParams('space=office')), load(new URLSearchParams('space=bedroom'))]);
  expect(fetch).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(41001);
  const result = await load(new URLSearchParams('space=living-room'));
  expect(result.remaining).toBe(18); expect(result.age).toBe(41);
  vi.advanceTimersByTime(19000);
  await load(new URLSearchParams('space=office'));
  expect(fetch).toHaveBeenCalledTimes(2);
});
it('refreshes changes after expiry and never serves expired data when the origin fails', async () => {
  vi.useFakeTimers(); const { load, fetch } = fixture();
  await load(new URLSearchParams());
  vi.advanceTimersByTime(60001);
  fetch.mockResolvedValueOnce({ ok: true, json: async () => [plant(4, { price: '299.00', in_stock: false })] });
  expect((await load(new URLSearchParams())).data).toEqual([expect.objectContaining({ id: 4, price: '299.00', in_stock: false })]);
  vi.advanceTimersByTime(60001); fetch.mockResolvedValueOnce({ ok: false });
  await expect(load(new URLSearchParams())).rejects.toThrow('Catalogue unavailable');
});
it('keeps public API fallback working if shared caching is unavailable or pagination appears', async () => {
  const { fetch } = fixture();
  const direct = createCatalogueLoader(async () => { throw new Error('cache offline'); });
  await direct(new URLSearchParams('space=office'));
  expect(fetch).toHaveBeenCalledTimes(1);
  const { load, cache } = fixture();
  vi.mocked(global.fetch).mockResolvedValue({ ok: true, json: async () => ({ count: 10, next: 'next-page', results: [products[0]] }) } as Response);
  const result = await load(new URLSearchParams('space=office'));
  expect(result.data).toEqual(expect.objectContaining({ count: 10, next: 'next-page' }));
  expect(cache.set).not.toHaveBeenCalled();
});
it('falls back for missing filtering fields rather than silently dropping products', async () => {
  const { load, fetch, cache } = fixture();
  fetch.mockResolvedValue({ ok: true, json: async () => [{ id: 1, images: [] }] });
  expect((await load(new URLSearchParams('space=office'))).data).toEqual([{ id: 1, images: [] }]);
  expect(cache.set).not.toHaveBeenCalled();
});

import { afterEach, expect, it, vi } from 'vitest';
import { catalogueBootstrap } from '@/lib/catalogueBootstrap.mjs';
import { storeService } from '@/services/api';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('axios', () => ({ default: { create: () => ({ get: mocks.get,
  interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
}) } }));

const initial = () => (window as Window & { __rastlinaCatalogue?: { key: string; startedAt: number; request: Promise<unknown> } }).__rastlinaCatalogue;
const plants = [{ id: 1, name: 'Jade', images: [{ is_primary: true, image: 'https://api.rastlina.com/media/products/jade.webp' }] }];
afterEach(() => {
  delete (window as Window & { __rastlinaCatalogue?: unknown }).__rastlinaCatalogue;
  localStorage.clear(); history.replaceState({}, '', '/');
  document.head.querySelectorAll('link[rel="preload"]').forEach(link => link.remove());
  vi.clearAllMocks(); vi.unstubAllGlobals();
});

it('fetches all plant collections before the app, warms visible images and reuses the same request', async () => {
  history.replaceState({}, '', '/shop?main_category=plants');
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => plants });
  vi.stubGlobal('fetch', fetch);
  window.eval(catalogueBootstrap('https://api.rastlina.com/api'));
  expect(initial()?.key).toBe('ordering=price');
  expect(await storeService.getProducts({ ordering: 'price' })).toEqual(plants);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(mocks.get).not.toHaveBeenCalled();
  expect(document.head.querySelector('link[as="image"]')).toHaveAttribute('href', plants[0].images[0].image);
});

it('does not reuse one collection for a different filter, or stale data after 30 seconds', async () => {
  history.replaceState({}, '', '/shop?category=calathea');
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => plants }));
  mocks.get.mockResolvedValue({ data: [{ id: 2 }] });
  window.eval(catalogueBootstrap('https://api.rastlina.com/api'));
  expect(await storeService.getProducts({ category: 'jade', ordering: '-created_at' })).toEqual([{ id: 2 }]);
  initial()!.startedAt -= 31000;
  await storeService.getProducts({ category: 'calathea', ordering: '-created_at' });
  expect(mocks.get).toHaveBeenCalledTimes(2);
});

it('falls back to the normal request when the early public request fails', async () => {
  history.replaceState({}, '', '/shop?main_category=plants');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  mocks.get.mockResolvedValue({ data: plants });
  window.eval(catalogueBootstrap('https://api.rastlina.com/api'));
  expect(await storeService.getProducts({ ordering: 'price' })).toEqual(plants);
  expect(mocks.get).toHaveBeenCalledTimes(1);
});

it('keeps authenticated catalogue requests separate', () => {
  history.replaceState({}, '', '/shop'); localStorage.setItem('rastlinaToken', 'test-token');
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  window.eval(catalogueBootstrap('https://api.rastlina.com/api'));
  expect(fetch).not.toHaveBeenCalled(); expect(initial()).toBeUndefined();
});

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/collection';
import { loadCatalogue } from '../../api/catalogue';
import { canonicalUrl } from '../lib/seoUrls';
import { collectionSeo } from '../lib/collectionSeo';
import { collectionPageHtml } from '../server/collectionHtml';

vi.mock('../../api/catalogue.js', () => ({ loadCatalogue: vi.fn() }));
vi.mock('node:fs/promises', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  const readFile = vi.fn(async () => '<!doctype html><html><head><title>Rastlina</title></head><body><div id="root"></div><script src="/assets/app.js" type="module"></script></body></html>');
  return { ...actual, readFile, default: { ...actual, readFile } };
});
const categories = [{ name: 'Exotic Plants', slug: 'exotic-beauties', main_category_slug: 'plants', main_category_name: 'Indoor Plants', product_count: 1 },
  { name: 'Syngonium Plants', slug: 'syngonium', product_count: 0 }];
const products = [{ name: 'Ledebouria Socialis', slug: 'ledebouria-socialis', price: '379.00', in_stock: true, category_name: 'Exotic Plants', images: [{ image: 'https://api.rastlina.com/media/test.webp', is_primary: true }] }];
function responseFixture() {
  const result = { code: 0, body: '', headers: {} as Record<string, string> };
  const response = { setHeader(key: string, value: string) { result.headers[key] = value; }, status(value: number) { result.code = value; return this; }, send(value: string) { result.body = value; } };
  return { result, response };
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('AbortSignal', { timeout: () => undefined });
  vi.mocked(loadCatalogue).mockResolvedValue({ data: products, remaining: 60, source: 'shared', age: 0 });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => categories }));
});
afterEach(() => vi.unstubAllGlobals());

it('serves category-specific content, canonical and product links before JavaScript', async () => {
  const { result, response } = responseFixture();
  await handler({ url: '/shop?category=exotic-beauties' }, response);
  expect(result.code).toBe(200);
  expect(result.body).toContain('<h1>Exotic Plants</h1>');
  expect(result.body).toContain('href="https://www.rastlina.com/shop?category=exotic-beauties"');
  expect(result.body).toContain('href="/product/ledebouria-socialis"');
  expect(result.body).toContain('₹379.00');
  expect(result.body).toContain('"@type":"CollectionPage"');
  expect(result.body).toContain('"@type":"ItemList"');
  expect(result.body).toContain('/assets/app.js');
  expect(result.headers['X-Robots-Tag']).toBeUndefined();
});

it('keeps path aliases and sorting/tracking variants on one collection canonical', async () => {
  const { result, response } = responseFixture();
  await handler({ url: '/api/collection?collection_category=exotic-beauties&ordering=price&utm_source=test' }, response);
  expect(result.code).toBe(200);
  expect(result.body).toContain('href="https://www.rastlina.com/shop?category=exotic-beauties"');
  expect(canonicalUrl('/shop/exotic-beauties?ordering=-price')).toBe('https://www.rastlina.com/shop?category=exotic-beauties');
  expect(canonicalUrl('/shop?main_category=plants')).toBe('https://www.rastlina.com/shop');
  expect(vi.mocked(loadCatalogue).mock.calls[0][0].has('utm_source')).toBe(false);
});

it('retains the complete Plants catalogue and its existing price sort', async () => {
  const { result, response } = responseFixture();
  await handler({ url: '/shop?main_category=plants' }, response);
  expect(result.body).toContain('<h1>All Indoor Plants</h1>');
  const params = vi.mocked(loadCatalogue).mock.calls[0][0];
  expect(params.has('main_category')).toBe(false);
  expect(params.get('ordering')).toBe('price');
});

it('excludes search and utility facets without hiding their product links', async () => {
  const { result, response } = responseFixture();
  await handler({ url: '/shop?search=leaf&color=ivory' }, response);
  expect(result.code).toBe(200);
  expect(result.headers['X-Robots-Tag']).toBe('noindex, follow');
  expect(result.headers['Cache-Control']).toBe('no-store');
  expect(result.body).toContain('href="/product/ledebouria-socialis"');
  expect(collectionSeo('/shop?category=exotic-beauties&max_price=500', 'Exotic Plants').noIndex).toBe(true);
});

it('returns genuine 404 for unknown categories and noindex for empty valid collections', async () => {
  vi.mocked(loadCatalogue).mockResolvedValue({ data: [], remaining: 60, source: 'shared', age: 0 });
  const missing = responseFixture();
  await handler({ url: '/shop?category=missing' }, missing.response);
  expect(missing.result.code).toBe(404);
  const empty = responseFixture();
  await handler({ url: '/shop?category=syngonium' }, empty.response);
  expect(empty.result.code).toBe(200);
  expect(empty.result.body).toContain('<h1>Syngonium Plants</h1>');
  expect(empty.result.headers['X-Robots-Tag']).toBe('noindex, follow');
});

it('returns temporary failure rather than a false empty collection during an outage', async () => {
  vi.mocked(loadCatalogue).mockRejectedValue(new Error('Catalogue unavailable'));
  const { result, response } = responseFixture();
  await handler({ url: '/shop?category=exotic-beauties' }, response);
  expect(result.code).toBe(503);
  expect(result.headers['Retry-After']).toBe('60');
  expect(result.headers['Cache-Control']).toBe('no-store');
  expect(result.headers['X-Robots-Tag']).toBeUndefined();
});

it('rejects duplicate/invalid filters and non-public writes before fetching products', async () => {
  for (const request of [{ url: '/shop?category=a&category=b' }, { url: '/shop?min_price=oops' }, { url: '/shop', method: 'POST' }, { url: '/shop', headers: { Authorization: 'not-a-real-token' } }]) {
    const { result, response } = responseFixture();
    await handler(request, response);
    expect([400, 405]).toContain(result.code);
  }
  expect(loadCatalogue).not.toHaveBeenCalled();
});

it('escapes untrusted product content and refuses invalid prices', () => {
  const template = '<html><head><title>Rastlina</title></head><body><div id="root"></div></body></html>';
  const html = collectionPageHtml(template, '/shop', new URLSearchParams(), categories, [{ ...products[0], name: '</script><script>alert(1)</script>' }]).html;
  expect(html).not.toContain('<script>alert(1)</script>');
  expect(html).toContain('\\u003c/script>');
  expect(() => collectionPageHtml(template, '/shop', new URLSearchParams(), categories, [{ ...products[0], price: 'missing' }])).toThrow('Incomplete collection product');
});

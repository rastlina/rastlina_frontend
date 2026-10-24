import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/page';
import { productPageHtml } from '../server/pageHtml';
import type { ApiProductDetail } from '../pages/ProductDetail';

const shell = '<!doctype html><html><head><title>Rastlina</title><meta name="robots" content="index, follow"></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>';
vi.mock('node:fs/promises', async importOriginal => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  const readFile = vi.fn(async (path: string) => path.endsWith('article-data.json') ? '[]' : '<!doctype html><html data-server-test-shell><head><title>Rastlina</title></head><body><div id="root"></div></body></html>');
  // Vite's Node builtin interop can use either the named export or default.
  // Both must be stubbed: CI intentionally runs tests before dist exists.
  return { ...actual, readFile, default: { ...actual.default, readFile } };
});
beforeEach(() => vi.stubGlobal('AbortSignal', { timeout: () => undefined }));
afterEach(() => vi.unstubAllGlobals());

function product() {
  return {
    name: 'Snake Green', slug: 'snake-green', sku: 'SNAK-02', price: '399.00', in_stock: true,
    description: '🌿 Snake Green: Upright green foliage for your indoor collection.\n🪴 Includes a self-watering pot.', care_instructions_list: [], what_you_get_list: [], images: [{ image: 'https://api.rastlina.com/media/snake.webp', is_primary: true }],
    variants: [{ id: 1, final_price: 300, in_stock: false }, { id: 2, final_price: 450, in_stock: true }],
    review_count: 0, average_rating: 0,
  } as unknown as ApiProductDetail;
}
function responseFixture() {
  const result = { code: 0, body: '', headers: {} as Record<string, string> };
  const response = { setHeader(name: string, value: string) { result.headers[name] = value; }, status(code: number) { result.code = code; return response; }, send(body: string) { result.body = body; } };
  return { result, response };
}

it('serves the product canonical, visible details and the default purchasable variant quote before JavaScript', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => product() }));
  const { result, response } = responseFixture();
  await handler({ query: { kind: 'product', slug: 'snake-green' } }, response);
  expect(result.code).toBe(200);
  expect(result.body).toContain('data-server-test-shell');
  expect(result.body).toContain('href="https://www.rastlina.com/product/snake-green"');
  expect(result.body).toContain('<h1>Snake Green</h1>');
  expect(result.body).toContain('🌿 Snake Green: Upright green foliage for your indoor collection.');
  expect(result.body).toContain(JSON.stringify(product().description));
  expect(result.body).toContain('₹450.00');
  expect(result.body).toContain('"price":450');
  expect(result.body).toContain('https://schema.org/InStock');
  expect(result.body).not.toContain('aggregateRating');
});

it('returns HTTP 404 and noindex for a nonexistent product', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  const { result, response } = responseFixture();
  await handler({ query: { kind: 'product', slug: 'does-not-exist' } }, response);
  expect(result.code).toBe(404);
  expect(result.headers['X-Robots-Tag']).toContain('noindex');
  expect(result.body).toContain('Shop current plants');
});

it('returns temporary failure for an API outage rather than removing a valid product from search', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
  const { result, response } = responseFixture();
  await handler({ query: { kind: 'product', slug: 'snake-green' } }, response);
  expect(result.code).toBe(503);
  expect(result.headers['Retry-After']).toBe('60');
  expect(result.headers['X-Robots-Tag']).toBeUndefined();
});

it('rejects an invalid slug without making an upstream request', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  const { result, response } = responseFixture();
  await handler({ query: { kind: 'product', slug: '../accounts' } }, response);
  expect(result.code).toBe(404);
  expect(fetch).not.toHaveBeenCalled();
});

it('escapes catalogue HTML and script delimiters in visible content and JSON-LD', () => {
  const malicious = { ...product(), name: '</script><script>alert(1)</script>', description: '<img src=x onerror=alert(1)>' };
  const html = productPageHtml(shell, malicious);
  expect(html).not.toContain('<script>alert(1)</script>');
  expect(html).not.toContain('<img src=x onerror');
  expect(html).toContain('\\u003c/script>');
  expect(html).toContain('/assets/app.js');
});

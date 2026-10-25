import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/catalogue';
beforeEach(() => vi.stubGlobal('AbortSignal', { timeout: () => undefined }));
afterEach(() => vi.unstubAllGlobals());
function fixture() {
  const result = { code: 0, body: '', headers: {} as Record<string, string> };
  const response = { setHeader(key: string, value: string) { result.headers[key] = value; }, status(code: number) { result.code = code; return response; }, send(body: string) { result.body = body; } };
  return { result, response };
}
it('preserves every product, price, stock and filter while sending only each card image', async () => {
  const products = Array.from({ length: 90 }, (_, id) => ({ id, price: '199.00', in_stock: id % 2 === 0, available_colors: [{ id: 1 }], images: [{ id: 1, is_primary: false }, { id: 2, is_primary: true }] }));
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => products }); vi.stubGlobal('fetch', fetch);
  const { result, response } = fixture(); await handler({ url: '/api/catalogue?space=office&ordering=price' }, response);
  const body = JSON.parse(result.body); expect(body).toHaveLength(90);
  expect(body[1]).toEqual({ ...products[1], images: [products[1].images[1]] });
  expect(fetch.mock.calls[0][0]).toBe('https://api.rastlina.com/api/store/products/?ordering=price&space=office');
  expect(result.headers['Cache-Control']).toContain('s-maxage=60'); expect(result.code).toBe(200);
});
it('preserves pagination metadata from the public service', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ count: 1, results: [{ id: 1 }], next: null }) }));
  const { result, response } = fixture(); await handler({ url: '/api/catalogue' }, response);
  expect(JSON.parse(result.body)).toEqual({ count: 1, results: [{ id: 1, images: [] }], next: null });
});
it('does not cache failures as an empty catalogue', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  const { result, response } = fixture(); await handler({ url: '/api/catalogue' }, response);
  expect(result.code).toBe(503); expect(result.headers['Cache-Control']).toBe('no-store');
});
it('rejects authenticated, write and unsupported-query requests before upstream access', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  for (const request of [{ method: 'POST' }, { headers: { authorization: 'test-token' } }, { headers: { Authorization: 'test-token' } }, { url: '/api/catalogue?destination=https://example.test' }, { url: '/api/catalogue?category=jade&category=calathea' }]) {
    const { result, response } = fixture(); await handler(request, response);
    expect(result.code).toBeGreaterThanOrEqual(400); expect(result.headers['Cache-Control']).toBe('no-store');
  }
  expect(fetch).not.toHaveBeenCalled();
});

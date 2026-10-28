import { afterEach, expect, it, vi } from 'vitest';
import handler from '../../api/promotions';
async function request(action = 'config', method = 'GET', extra = {}) {
  let status = 0; let body = ''; const headers: Record<string, string> = {};
  const response = { setHeader: (name: string, value: string) => { headers[name] = value; },
    status: (value: number) => { status = value; return response; }, send: (value: string) => { body = value; } };
  await handler({ url: `/api/promotions?action=${action}`, method, ...extra }, response);
  return { status, body: JSON.parse(body), headers };
}
afterEach(() => vi.unstubAllGlobals());
it('fetches live configuration without forwarding browser cookies or untrusted host headers', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ promotion_policy_version: 2 }), { headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', fetch);
  const result = await request('config', 'GET', { headers: { cookie: 'private-cookie', 'x-forwarded-host': 'preview.invalid', 'x-vercel-forwarded-for': '203.0.113.5' } });
  expect(result.status).toBe(200); expect(result.headers['Cache-Control']).toBe('private, no-store');
  expect(fetch.mock.calls[0][0]).toBe('https://admin.rastlina.com/api/store/config/');
  expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('cookie');
  expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('x-forwarded-host');
  expect(fetch.mock.calls[0][1].headers['X-Forwarded-For']).toBe('203.0.113.5');
});
it('forwards the signed-in token and quote data to the fixed backend', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{"total":"909.60"}', { headers: { 'Content-Type': 'application/json' } }));
  vi.stubGlobal('fetch', fetch);
  const result = await request('quote', 'POST', { headers: { authorization: 'Bearer test-token' }, body: { order_total: 1137, coupon_code: 'DIWALI10', destination: 'https://untrusted.invalid' } });
  expect(result.body.total).toBe('909.60');
  expect(fetch.mock.calls[0][0]).toBe('https://admin.rastlina.com/api/store/promotion-quote/');
  expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer test-token');
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ order_total: 1137, coupon_code: 'DIWALI10' });
});
it('preserves backend promo validation errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"error":"Invalid promo code."}', { status: 400, headers: { 'Content-Type': 'application/json' } })));
  expect(await request('validate', 'POST', { body: { code: 'INVALID', order_total: 379 } })).toMatchObject({ status: 400, body: { error: 'Invalid promo code.' } });
});
it('rejects unknown destinations, wrong methods and invalid bodies before calling the backend', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  expect((await request('https://untrusted.invalid')).status).toBe(400);
  expect((await request('config', 'POST')).status).toBe(405);
  expect((await request('quote', 'POST', { body: [] })).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
});
it('returns a safe retry error if the backend returns HTML or is unavailable', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<h1>Private server traceback</h1>', { status: 400, headers: { 'Content-Type': 'text/html' } })));
  const result = await request();
  expect(result.status).toBe(503); expect(JSON.stringify(result)).not.toContain('traceback');
});

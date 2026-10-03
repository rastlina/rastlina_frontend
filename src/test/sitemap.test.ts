import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/sitemap';

afterEach(() => vi.unstubAllGlobals());
// jsdom's AbortSignal lacks Node's timeout method used by the server handler.
beforeEach(() => vi.stubGlobal('AbortSignal', { timeout: vi.fn(() => undefined) }));

function responseFixture() {
  const result = { code: 0, body: '', headers: {} as Record<string, string> };
  const response = {
    setHeader(name: string, value: string) { result.headers[name] = value; },
    status(code: number) { result.code = code; return response; },
    send(body: string) { result.body = body; },
  };
  return { result, response };
}

it('includes public policies, unique encoded products, and excludes private pages', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [
    { slug: 'snake-plant' }, { slug: 'snake-plant' }, { slug: '' }, { slug: 'plant & pot' },
  ] }));
  const { result, response } = responseFixture();
  await handler(null, response);
  expect(result.code).toBe(200);
  expect(result.headers['Content-Type']).toContain('application/xml');
  expect(result.body.match(/\/product\/snake-plant/g)).toHaveLength(1);
  expect(result.body).toContain('/product/plant%20%26%20pot');
  for (const path of ['privacy-policy', 'terms-and-conditions', 'replacement-policy']) expect(result.body).toContain(`/${path}</loc>`);
  for (const path of ['login', 'profile', 'checkout']) expect(result.body).not.toContain(`/${path}</loc>`);
});

it('returns temporary failure instead of a misleading empty product sitemap', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
  const { result, response } = responseFixture();
  await handler(null, response);
  expect(result.code).toBe(503);
});

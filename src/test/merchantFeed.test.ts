import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import handler from '../../api/merchant-feed';
import { loadMerchantProducts, merchantFeed } from '../server/merchantFeed';
import { productSeo } from '../lib/productSeo';
import type { ApiProductDetail } from '../pages/ProductDetail';

const product = () => ({ id: 1, sku: 'PLANT-01', name: 'Plant & Pot', slug: 'plant-pot', price: '199.00', in_stock: true,
  description: '🌿 Plant <set> with a self-watering pot & soil mix.\u0001', category_name: 'Exotic Plants',
  variants: [{ id: 1, final_price: 149, in_stock: false, size_name: 'Small' }, { id: 2, final_price: 249, in_stock: true, size_name: 'Medium' }],
  images: [{ image: 'https://api.rastlina.com/media/plant.webp', is_primary: true }], review_count: 0,
} as unknown as ApiProductDetail);
const resultFixture = () => {
  const result = { code: 0, body: '', headers: {} as Record<string, string> };
  const response = { setHeader(key: string, value: string) { result.headers[key] = value; }, status(code: number) { result.code = code; return this; }, send(body: string) { result.body = body; } };
  return { result, response };
};
beforeEach(() => vi.stubGlobal('AbortSignal', { timeout: () => undefined }));
afterEach(() => vi.unstubAllGlobals());

it('emits valid Google XML with the same default purchasable variant as the landing page', () => {
  const input = product();
  const xml = merchantFeed([input]);
  const document = new DOMParser().parseFromString(xml, 'text/xml');
  expect(document.querySelector('parsererror')).toBeNull();
  const field = (name: string) => document.getElementsByTagNameNS('http://base.google.com/ns/1.0', name)[0]?.textContent;
  expect(field('price')).toBe(`${productSeo(input).price.toFixed(2)} INR`);
  expect(field('availability')).toBe('in_stock');
  expect(field('size')).toBe('Medium');
  expect(field('link')).toBe('https://www.rastlina.com/product/plant-pot');
  expect(field('id')).toBe('PLANT-01');
  expect(field('identifier_exists')).toBe('no');
  expect(field('gtin')).toBeUndefined();
  expect(field('mpn')).toBeUndefined();
  expect(field('structured_title')).toContain('trained_algorithmic_mediaPlant & Pot');
  expect(field('structured_description')).toContain('Plant <set> with a self-watering pot & soil mix.');
  expect(xml).not.toContain('\u0001');
  expect(document.getElementsByTagNameNS('http://base.google.com/ns/1.0', 'title')).toHaveLength(0);
});

it('does not advertise stock when every variant is unavailable', () => {
  const input = product(); input.variants.forEach(variant => { variant.in_stock = false; });
  expect(merchantFeed([input])).toContain('<g:availability>out_of_stock</g:availability>');
  expect(merchantFeed([input])).toContain('<g:price>149.00 INR</g:price>');
});

it('refuses empty, duplicate or incomplete products rather than publishing a misleading feed', () => {
  for (const input of [[], [product(), product()], [{...product(), variants: undefined}], [{...product(), images: []}], [{...product(), variants: [], price: '0'}]]) {
    expect(() => merchantFeed(input as ApiProductDetail[])).toThrow();
  }
});

it('loads complete paginated catalogues and refuses pagination away from the public product service', async () => {
  const fetch = vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('plant-pot/') ? product() : url.includes('page=2') ? {results:[],next:null} : {results:[{slug:'plant-pot'}],next:'?page=2'} }));
  vi.stubGlobal('fetch', fetch);
  expect(await loadMerchantProducts(undefined!)).toHaveLength(1);
  expect(fetch).toHaveBeenCalledTimes(3);
  fetch.mockImplementation(async () => ({ok:true,json:async()=>({results:[],next:'https://example.com/private'})}));
  await expect(loadMerchantProducts(undefined!)).rejects.toThrow('Invalid catalogue pagination');
});

it('serves a public feed while rejecting writes, private credentials and arbitrary filters', async () => {
  const fetch = vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('plant-pot/') ? product() : [{slug:'plant-pot'}] }));
  vi.stubGlobal('fetch', fetch);
  const good = resultFixture();
  await handler({url:'/merchant-feed.xml'}, good.response);
  expect(good.result.code).toBe(200);
  expect(good.result.body).toContain('<g:id>PLANT-01</g:id>');
  expect(good.result.headers['Cache-Control']).toMatch(/s-maxage=\d+, must-revalidate/);
  fetch.mockClear();
  for (const request of [{method:'POST'}, {headers:{Authorization:'not-a-real-token'}}, {url:'/merchant-feed.xml?search=leaf'}]) {
    const check = resultFixture(); await handler(request, check.response);
    expect([400,405]).toContain(check.result.code);
  }
  expect(fetch).not.toHaveBeenCalled();
});

it('returns 503 without a partial catalogue if any product fetch fails', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({ok:!url.endsWith('plant-pot/'),json:async()=>[{slug:'plant-pot'}]})));
  const check = resultFixture(); await handler({}, check.response);
  expect(check.result.code).toBe(503);
  expect(check.result.headers['Cache-Control']).toBe('no-store');
  expect(check.result.headers['Retry-After']).toBe('60');
  expect(check.result.body).not.toContain('<item>');
});

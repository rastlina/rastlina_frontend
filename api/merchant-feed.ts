import { loadMerchantProducts, merchantFeed } from '../src/server/merchantFeed.js';

type RequestLike = { url?: string; method?: string; headers?: Record<string, unknown> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'application/xml; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex');
  if ((request.method && !['GET', 'HEAD'].includes(request.method)) || Object.keys(request.headers || {}).some(key => key.toLowerCase() === 'authorization')) {
    response.status(405).send('Public feed requests only'); return;
  }
  if (new URL(request.url || '/', 'https://www.rastlina.com').search) {
    response.status(400).send('Feed does not accept filters'); return;
  }
  const started = Date.now();
  try {
    const products = await loadMerchantProducts(AbortSignal.timeout(45000));
    const xml = merchantFeed(products);
    const remaining = Math.max(0, 60 - Math.ceil((Date.now() - started) / 1000));
    if (remaining) response.setHeader('Cache-Control', `public, max-age=0, s-maxage=${remaining}, must-revalidate`);
    response.status(200).send(request.method === 'HEAD' ? '' : xml);
  } catch {
    // An incomplete feed could incorrectly remove products from Google.
    // Fail the whole refresh so Google can retain its previous successful data.
    response.setHeader('Retry-After', '60');
    response.status(503).send('Product feed temporarily unavailable');
  }
}

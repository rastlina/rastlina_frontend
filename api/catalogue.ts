import { createCatalogueLoader } from '../src/server/catalogue.js';

const loadCatalogue = createCatalogueLoader(async () => {
  if (!process.env.VERCEL) return null;
  const { getCache } = await import('@vercel/functions');
  return getCache();
});

type RequestLike = { url?: string; method?: string; headers?: Record<string, string | string[] | undefined> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };
const allowed = new Set(['main_category', 'category', 'space', 'size', 'color', 'search', 'ordering', 'care_level', 'pet_friendly', 'air_purifying', 'min_price', 'max_price', 'is_new_arrival', 'is_best_seller', 'is_best_deal', 'is_trending']);

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if ((request.method && request.method !== 'GET') || Object.keys(request.headers || {}).some(key => key.toLowerCase() === 'authorization')) {
    response.status(405).send('{"error":"Public GET requests only"}'); return;
  }
  const params = new URL(request.url || '/', 'https://www.rastlina.com').searchParams;
  if ([...params].some(([key, value]) => !allowed.has(key) || value.length > 200 || params.getAll(key).length !== 1)) {
    response.status(400).send('{"error":"Invalid catalogue filters"}'); return;
  }
  params.sort();
  try {
    const { data, remaining, source, age } = await loadCatalogue(params);
    // Subtract the snapshot's age so the two cache layers never compound to
    // keep an old price/availability card beyond one minute.
    if (remaining > 0) response.setHeader('Cache-Control', `public, max-age=0, s-maxage=${remaining}, must-revalidate`);
    response.setHeader('X-Rastlina-Catalogue', source);
    response.setHeader('X-Rastlina-Catalogue-Age', String(age));
    response.status(200).send(JSON.stringify(data));
  } catch {
    response.status(503).send('{"error":"Catalogue temporarily unavailable"}');
  }
}

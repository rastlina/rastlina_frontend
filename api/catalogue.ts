type RequestLike = { url?: string; method?: string; headers?: Record<string, string | string[] | undefined> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };
const allowed = new Set(['main_category', 'category', 'space', 'size', 'color', 'search', 'ordering', 'care_level', 'pet_friendly', 'air_purifying', 'min_price', 'max_price', 'is_new_arrival', 'is_best_seller', 'is_best_deal', 'is_trending']);

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if ((request.method && request.method !== 'GET') || request.headers?.authorization) {
    response.status(405).send('{"error":"Public GET requests only"}'); return;
  }
  const params = new URL(request.url || '/', 'https://www.rastlina.com').searchParams;
  if ([...params].some(([key, value]) => !allowed.has(key) || value.length > 200)) {
    response.status(400).send('{"error":"Invalid catalogue filters"}'); return;
  }
  params.sort();
  try {
    // Only public catalogue cards are cached, for one minute. Quotes and stock
    // are still validated by the existing product and checkout services.
    const upstream = await fetch(`https://api.rastlina.com/api/store/products/?${params}`, {
      signal: AbortSignal.timeout(10000), redirect: 'error',
    });
    if (!upstream.ok) throw new Error('Catalogue unavailable');
    const data = await upstream.json();
    const products = Array.isArray(data) ? data : data.results;
    if (!Array.isArray(products)) throw new Error('Invalid catalogue');
    const cards = products.map(product => {
      const images = Array.isArray(product.images) ? product.images : [];
      const primary = images.find(image => image.is_primary) || images[0];
      // The card displays one image; full galleries stay on the product page.
      return { ...product, images: primary ? [primary] : [] };
    });
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=60');
    response.status(200).send(JSON.stringify(Array.isArray(data) ? cards : { ...data, results: cards }));
  } catch {
    response.status(503).send('{"error":"Catalogue temporarily unavailable"}');
  }
}

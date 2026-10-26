import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadCatalogue } from './catalogue.js';
import { collectionFilters } from '../src/lib/collectionSeo.js';
import { collectionPageHtml, type CollectionCategory, type CollectionProduct } from '../src/server/collectionHtml.js';
import { pageHtml } from '../src/server/pageHtml.js';

type RequestLike = { url?: string; method?: string; query?: Record<string, string | string[] | undefined>; headers?: Record<string, unknown> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };
let shell: Promise<string> | undefined;
const getShell = () => shell ||= readFile(join(process.cwd(), 'dist/server-shell.html'), 'utf8').catch(error => { shell = undefined; throw error; });

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if ((request.method && request.method !== 'GET' && request.method !== 'HEAD') || Object.keys(request.headers || {}).some(key => key.toLowerCase() === 'authorization')) {
    response.status(405).send('Public collection requests only'); return;
  }
  try {
    const incoming = new URL(request.url || '/shop', 'https://www.rastlina.com');
    const params = new URLSearchParams(incoming.search);
    const routeCategory = request.query?.collection_category ?? params.get('collection_category');
    params.delete('collection_category');
    if (Array.isArray(routeCategory)) {
      response.setHeader('X-Robots-Tag', 'noindex, follow'); response.status(400).send('Invalid category route'); return;
    }
    if (typeof routeCategory === 'string' && routeCategory && !params.get('category')) params.set('category', routeCategory);
    for (const key of [...params.keys()]) if (!collectionFilters.has(key)) params.delete(key);
    if ([...params].some(([key, value]) => value.length > 200 || params.getAll(key).length !== 1) ||
      ['min_price', 'max_price'].some(key => params.get(key) && !Number.isFinite(Number(params.get(key))))) {
      response.setHeader('X-Robots-Tag', 'noindex, follow'); response.status(400).send('Invalid collection filters'); return;
    }
    const filters = new URLSearchParams(params);
    if (filters.get('main_category') === 'plants') { filters.delete('main_category'); if (!filters.get('ordering')) filters.set('ordering', 'price'); }
    for (const key of ['is_best_deal', 'is_new_arrival', 'is_best_seller']) if (filters.get(key)) filters.set(key, 'true');
    const started = Date.now();
    const [{ data, remaining }, categoryResponse] = await Promise.all([
      loadCatalogue(filters), fetch('https://api.rastlina.com/api/store/categories/', { signal: AbortSignal.timeout(10000), redirect: 'error' }),
    ]);
    if (!categoryResponse.ok) throw new Error('Categories unavailable');
    const categoryData = await categoryResponse.json();
    const categories: CollectionCategory[] = Array.isArray(categoryData) ? categoryData : categoryData?.results;
    const products: CollectionProduct[] = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(categories) || !categories.every(category => typeof category.name === 'string' && typeof category.slug === 'string') || !Array.isArray(products)) throw new Error('Incomplete collection');
    if (params.get('category') && !categories.some(category => category.slug === params.get('category'))) {
      response.setHeader('X-Robots-Tag', 'noindex, follow');
      response.status(404).send(pageHtml(await getShell(), { title: 'Collection Not Found | Rastlina', description: 'Browse the current Rastlina plant collections.', path: '/shop', noIndex: true }, '<main class="seo-preview"><h1>Collection not found</h1><a href="/shop">Browse current plants</a></main>')); return;
    }
    const query = params.toString();
    const path = `/shop${query ? `?${query}` : ''}`;
    const page = collectionPageHtml(await getShell(), path, params, categories, products);
    if (page.noIndex) response.setHeader('X-Robots-Tag', 'noindex, follow');
    const cacheSeconds = Math.max(0, remaining - Math.ceil((Date.now() - started) / 1000));
    if (!params.get('search') && cacheSeconds > 0) response.setHeader('Cache-Control', `public, max-age=0, s-maxage=${cacheSeconds}, must-revalidate`);
    response.status(200).send(page.html);
  } catch {
    response.setHeader('Retry-After', '60');
    response.status(503).send('<!doctype html><html lang="en"><head><title>Collection temporarily unavailable | Rastlina</title></head><body><h1>Please try again shortly</h1><a href="/">Rastlina home</a></body></html>');
  }
}

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { applyProductEditorial } from '../src/data/productEditorial.js';
import { articlePageHtml, pageHtml, productPageHtml, type Article } from '../src/server/pageHtml.js';
import type { ApiProductDetail } from '../src/pages/ProductDetail';

type RequestLike = { url?: string; query?: Record<string, string | string[] | undefined> };
type ResponseLike = { setHeader(name: string, value: string): void; status(code: number): ResponseLike; send(body: string): void };
let shell: Promise<string> | undefined;
const getShell = () => shell ||= readFile(join(process.cwd(), 'dist/server-shell.html'), 'utf8').catch(error => { shell = undefined; throw error; });
let articles: Promise<Article[]> | undefined;
const getArticles = () => articles ||= readFile(join(process.cwd(), 'dist/article-data.json'), 'utf8').then(JSON.parse);

export default async function handler(request: RequestLike, response: ResponseLike) {
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  const parsed = new URL(request.url || '/', 'https://www.rastlina.com');
  const kind = request.query?.kind ?? parsed.searchParams.get('kind');
  const slug = request.query?.slug ?? parsed.searchParams.get('slug');
  const missing = async () => {
    response.setHeader('X-Robots-Tag', 'noindex, follow');
    response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
    response.status(404).send(pageHtml(await getShell(), {
      title: 'Page Not Found | Rastlina', description: 'The requested Rastlina page was not found. Browse our current indoor plants.', path: '/not-found', noIndex: true,
    }, '<main class="seo-preview"><h1>Page not found</h1><p>This page is no longer available at this address.</p><nav><a href="/">Rastlina home</a><a href="/shop">Shop current plants</a></nav></main>'));
  };
  try {
    if (typeof slug !== 'string' || !slug || slug.length > 200 || /[/?#\\]/.test(slug) || [...slug].some(character => character.codePointAt(0)! < 32)) return await missing();
    if (kind === 'product') {
      // Fetch current public product data on request; prices and stock are not frozen at build time.
      const apiResponse = await fetch(`https://api.rastlina.com/api/store/products/${encodeURIComponent(slug)}/`, { signal: AbortSignal.timeout(10000) });
      if (apiResponse.status === 404) return await missing();
      if (!apiResponse.ok) throw new Error('Product service unavailable');
      const product = applyProductEditorial(await apiResponse.json() as ApiProductDetail);
      if (!product.slug || !product.name || !Array.isArray(product.variants) || !Array.isArray(product.images)) throw new Error('Incomplete product response');
      response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60');
      response.status(200).send(productPageHtml(await getShell(), product));
      return;
    }
    if (kind === 'article') {
      const article = (await getArticles()).find(item => String(item.id) === slug);
      if (!article) return await missing();
      response.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
      response.status(200).send(articlePageHtml(await getShell(), article));
      return;
    }
    return await missing();
  } catch {
    // An upstream outage is temporary, not evidence that a product has disappeared.
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Retry-After', '60');
    response.status(503).send('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Temporarily unavailable | Rastlina</title></head><body><h1>Please try again shortly</h1><p>Rastlina is temporarily unavailable.</p><a href="/shop">Shop plants</a></body></html>');
  }
}

type Product = {
  slug: string;
};

type ResponseLike = {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike;
  send(body: string): void;
};

const SITE_URL = 'https://www.rastlina.com';
const PRODUCT_API_URL = 'https://api.rastlina.com/api/store/products/';

function xmlEscape(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[character] || character);
}

function urlEntry(path: string, changefreq: string, priority: string) {
  return `<url><loc>${SITE_URL}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

export default async function handler(_: unknown, response: ResponseLike) {
  try {
    const productResponse = await fetch(PRODUCT_API_URL, { signal: AbortSignal.timeout(20000) });
    if (!productResponse.ok) throw new Error(`Product API returned ${productResponse.status}`);

    const products = (await productResponse.json()) as Product[];
    const staticEntries = [
      urlEntry('/', 'weekly', '1.0'),
      urlEntry('/shop', 'daily', '0.9'),
      urlEntry('/bulk', 'monthly', '0.5'),
      urlEntry('/blog/1', 'monthly', '0.6'),
      urlEntry('/blog/2', 'monthly', '0.6'),
      urlEntry('/blog/3', 'monthly', '0.6'),
      urlEntry('/shipping-policy', 'yearly', '0.3'),
      urlEntry('/returns-refund-policy', 'yearly', '0.3'),
      urlEntry('/privacy-policy', 'yearly', '0.3'),
      urlEntry('/terms-and-conditions', 'yearly', '0.3'),
      urlEntry('/replacement-policy', 'yearly', '0.3'),
    ];
    const productEntries = [...new Set(products.map(({ slug }) => slug).filter(Boolean))].map((slug) =>
      urlEntry(`/product/${xmlEscape(encodeURIComponent(slug))}`, 'weekly', '0.8'),
    );

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...staticEntries, ...productEntries].join('')}</urlset>`;
    response.setHeader('Content-Type', 'application/xml; charset=utf-8');
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    response.status(200).send(sitemap);
  } catch {
    response.status(503).send('Sitemap temporarily unavailable');
  }
}

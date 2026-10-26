import type { ApiProductDetail } from '../pages/ProductDetail';
import { applyProductEditorial } from '../data/productEditorial.js';
import { defaultProductVariant, productSeo } from '../lib/productSeo.js';
import { SITE_URL } from '../lib/seoUrls.js';

// XML 1.0 cannot contain these control characters from otherwise valid API text.
// eslint-disable-next-line no-control-regex
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
  .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim();
const xml = (value: string) => clean(value).replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!);
const tag = (name: string, value: string) => `<g:${name}>${xml(value)}</g:${name}>`;
const structured = (name: string, value: string) => `<g:${name}>${tag('digital_source_type', 'trained_algorithmic_media')}${tag('content', value)}</g:${name}>`;

export function merchantFeed(products: ApiProductDetail[]) {
  if (!products.length) throw new Error('Empty merchant catalogue');
  const seen = new Set<string>();
  const items = products.map(input => {
    if (!input || !Array.isArray(input.variants) || !Array.isArray(input.images)) throw new Error('Incomplete merchant product');
    const product = applyProductEditorial(input);
    const variant = defaultProductVariant(product);
    const metadata = productSeo(product, variant);
    const id = product.sku?.trim() || (Number.isInteger(product.id) ? `rastlina-${product.id}` : '');
    if (!id || id.length > 50 || seen.has(id) || !product.name?.trim() || !product.slug || /[/?#\\]/.test(product.slug) || !Number.isFinite(metadata.price) || metadata.price <= 0) throw new Error('Invalid merchant identity or price');
    seen.add(id);
    const primary = product.images.find(image => image.is_primary) || product.images[0];
    const image = primary && new URL(primary.image);
    if (!image || image.protocol !== 'https:' || !['api.rastlina.com', 'www.rastlina.com', 'rastlina.com'].includes(image.hostname)) throw new Error('Invalid merchant image');
    const title = Array.from(clean(product.name)).slice(0, 150).join('');
    const description = Array.from(clean(product.description || `${product.name}. A live plant set supplied with a self-watering pot and soil mix. Follow the individual plant care guide.`)).slice(0, 5000).join('');
    // The owner confirmed these plant sets have internal SKUs only, with no
    // registered retail barcodes or manufacturer part numbers. Never invent them.
    return `<item>${tag('id', id)}${structured('structured_title', title)}${structured('structured_description', description)}${tag('link', `${SITE_URL}${metadata.path}`)}${tag('image_link', image.href)}${tag('price', `${metadata.price.toFixed(2)} INR`)}${tag('availability', metadata.inStock ? 'in_stock' : 'out_of_stock')}${tag('condition', 'new')}${tag('brand', 'Rastlina')}${tag('identifier_exists', 'no')}${tag('product_type', `Plants > ${product.category_name || 'Plant sets'}`)}${variant?.size_name ? tag('size', variant.size_name) : ''}${variant?.color_name ? tag('color', variant.color_name) : ''}</item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>Rastlina plant catalogue</title><link>${SITE_URL}/</link><description>Current plant sets from Rastlina Nature Hub Private Limited.</description>${items.join('')}</channel></rss>`;
}

export async function loadMerchantProducts(signal: AbortSignal): Promise<ApiProductDetail[]> {
  const root = 'https://api.rastlina.com/api/store/products/';
  const slugs: string[] = [];
  const visited = new Set<string>();
  let next: string | null = root;
  while (next) {
    const url = new URL(next, root);
    if (url.origin !== 'https://api.rastlina.com' || url.pathname !== '/api/store/products/' || visited.has(url.href) || visited.size >= 50) throw new Error('Invalid catalogue pagination');
    visited.add(url.href);
    const response = await fetch(url.href, { signal, redirect: 'error' });
    if (!response.ok) throw new Error('Merchant catalogue unavailable');
    const data = await response.json();
    const page = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(page) || page.some(product => typeof product?.slug !== 'string' || !product.slug || /[/?#\\]/.test(product.slug))) throw new Error('Incomplete merchant catalogue');
    slugs.push(...page.map(product => product.slug));
    next = Array.isArray(data) ? null : data.next || null;
  }
  if (new Set(slugs).size !== slugs.length || !slugs.length) throw new Error('Invalid merchant catalogue');
  const products: ApiProductDetail[] = new Array(slugs.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(8, slugs.length) }, async () => {
    while (cursor < slugs.length) {
      const index = cursor++;
      const response = await fetch(`${root}${encodeURIComponent(slugs[index])}/`, { signal, redirect: 'error' });
      if (!response.ok) throw new Error('Merchant product unavailable');
      const product = await response.json();
      if (product?.slug !== slugs[index]) throw new Error('Mismatched merchant product');
      products[index] = product;
    }
  }));
  return products;
}

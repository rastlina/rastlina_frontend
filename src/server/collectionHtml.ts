import { collectionSeo } from '../lib/collectionSeo.js';
import { normalizeProductName } from '../utils/productName.js';
import { escapeHtml, pageHtml } from './pageHtml.js';
import { SITE_URL } from '../lib/seoUrls.js';

export type CollectionCategory = { name: string; slug: string; main_category_name?: string; main_category_slug?: string; product_count?: number };
export type CollectionProduct = { name: string; slug: string; price: string | number; in_stock?: boolean;
  category_name?: string; main_category_name?: string; images: Array<{ image: string; is_primary?: boolean }> };

export function collectionHeading(params: URLSearchParams, categories: CollectionCategory[], products: CollectionProduct[]) {
  if (params.get('search')) return `Results for "${params.get('search')}"`;
  if (params.get('is_best_deal')) return 'Exclusive Offers';
  if (params.get('is_new_arrival')) return 'New Arrivals';
  if (params.get('is_best_seller')) return 'Best-Selling Plants';
  if (params.get('category')) return categories.find(category => category.slug === params.get('category'))?.name || products[0]?.category_name || 'Plant Collection';
  if (params.get('space')) return products[0] && 'space_tags' in products[0]
    ? (products[0].space_tags as Array<{ slug: string; name: string }>).find(tag => tag.slug === params.get('space'))?.name || params.get('space')!
    : params.get('space')!;
  if (params.get('size')) return `${params.get('size')} Products`;
  if (params.get('main_category') === 'plants') return 'All Indoor Plants';
  if (params.get('main_category')) return categories.find(category => category.main_category_slug === params.get('main_category'))?.main_category_name || products[0]?.main_category_name || 'Plant Collection';
  return 'All Products';
}

export function collectionPageHtml(template: string, path: string, params: URLSearchParams, categories: CollectionCategory[], products: CollectionProduct[]) {
  const heading = collectionHeading(params, categories, products);
  const metadata = collectionSeo(path, heading, products.length === 0);
  const cards = products.map((product, index) => {
    const price = Number(product.price);
    if (!product.name || !product.slug || !Number.isFinite(price) || price < 0 || !Array.isArray(product.images)) throw new Error('Incomplete collection product');
    const name = normalizeProductName(product.name);
    const image = (product.images.find(image => image.is_primary) || product.images[0])?.image;
    const imageUrl = image ? new URL(image, SITE_URL) : null;
    return `<li><a href="/product/${escapeHtml(encodeURIComponent(product.slug))}">${imageUrl?.protocol === 'https:' ? `<img src="${escapeHtml(imageUrl.href)}" alt="${escapeHtml(name)}" width="480" height="480" loading="${index < 2 ? 'eager' : 'lazy'}"/>` : ''}<h2>${escapeHtml(name)}</h2></a><p>₹${escapeHtml(price.toFixed(2))}${product.in_stock === false ? ' — Out of stock' : ''}</p></li>`;
  }).join('');
  const links = categories.filter(category => Number(category.product_count) > 0).map(category => `<a href="/shop?category=${escapeHtml(encodeURIComponent(category.slug))}">${escapeHtml(category.name)}</a>`).join('');
  return { noIndex: metadata.noIndex, html: pageHtml(template, { ...metadata, schema: {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: heading, url: metadata.path,
    mainEntity: { '@type': 'ItemList', numberOfItems: products.length, itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, name: normalizeProductName(product.name), url: `${SITE_URL}/product/${encodeURIComponent(product.slug)}` })) },
  } }, `<main class="seo-preview"><nav aria-label="Breadcrumb"><a href="/">Rastlina</a><a href="/shop">Shop all plants</a></nav><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(metadata.intro)}</p><p>Plant sets include a self-watering pot and soil mix. Check the individual listing for the exact plant or combo, size and current availability.</p><p>${products.length} product${products.length === 1 ? '' : 's'} currently shown</p>${products.length ? `<ul class="collection-grid">${cards}</ul>` : '<p>No products are currently available with these filters. <a href="/shop">Browse all plants</a>.</p>'}<nav aria-label="Plant collections">${links}</nav></main><style>.seo-preview .collection-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:24px;list-style:none;padding:0}.seo-preview .collection-grid img{aspect-ratio:1;object-fit:contain}.seo-preview .collection-grid h2{font-size:20px}.seo-preview nav{flex-wrap:wrap}</style>`) };
}

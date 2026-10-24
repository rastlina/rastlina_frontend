import { canonicalUrl, schemaJson, SITE_URL } from '../lib/seoUrls.js';
import { productSeo } from '../lib/productSeo.js';
import type { ApiProductDetail } from '../pages/ProductDetail';
import { vastuArticleMarkup } from '../lib/vastuArticleMarkup.js';

export const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]!);

export type PageMetadata = { title: string; description: string; path: string; image?: string; schema?: unknown; noIndex?: boolean; type?: string };

export function pageHtml(template: string, metadata: PageMetadata, body: string) {
  const canonical = canonicalUrl(metadata.path);
  const title = escapeHtml(metadata.title);
  const description = escapeHtml(metadata.description);
  const image = escapeHtml(new URL(metadata.image || '/og-image.webp', SITE_URL).toString());
  const head = `<meta data-rh="true" name="description" content="${description}"/>
<meta data-rh="true" name="robots" content="${metadata.noIndex ? 'noindex, follow' : 'index, follow'}"/>
<link data-rh="true" rel="canonical" href="${escapeHtml(canonical)}"/>
<meta data-rh="true" property="og:title" content="${title}"/>
<meta data-rh="true" property="og:description" content="${description}"/>
<meta data-rh="true" property="og:url" content="${escapeHtml(canonical)}"/>
<meta data-rh="true" property="og:type" content="${escapeHtml(metadata.type || 'website')}"/>
<meta data-rh="true" property="og:image" content="${image}"/>
<meta data-rh="true" property="og:site_name" content="Rastlina"/>
<meta data-rh="true" property="og:locale" content="en_IN"/>
<meta data-rh="true" name="twitter:card" content="summary_large_image"/>
<meta data-rh="true" name="twitter:title" content="${title}"/>
<meta data-rh="true" name="twitter:description" content="${description}"/>
<meta data-rh="true" name="twitter:image" content="${image}"/>
${metadata.schema ? `<script data-rh="true" type="application/ld+json">${schemaJson(metadata.schema)}</script>` : ''}
<style>.seo-preview{max-width:1100px;margin:auto;padding:130px 24px 48px;color:#18392a}.seo-preview nav{display:flex;gap:20px;margin-bottom:24px}.seo-preview h1{font-size:clamp(28px,4vw,44px);margin:20px 0}.seo-preview p,.seo-preview li{line-height:1.8;margin:12px 0}.seo-preview a{color:#315d39;text-decoration:underline}.seo-preview img{width:100%;max-width:480px;height:auto;object-fit:contain}.seo-preview ul{padding-left:24px;list-style:disc}.seo-preview h2{font-size:24px;margin-top:28px}.seo-preview .price{font-size:26px}.seo-preview .product-layout{display:grid;grid-template-columns:1fr 1fr;gap:32px}@media(max-width:700px){.seo-preview .product-layout{grid-template-columns:1fr}}</style>`;
  if (!template.includes('<div id="root"></div>')) throw new Error('Invalid server page shell');
  return template.replace(/<title[^>]*>[^<]*<\/title>/, `<title data-rh="true">${title}</title>`)
    .replace(/<meta[^>]*name="robots"[^>]*>/g, '')
    .replace('</head>', `${head}</head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

export function productPageHtml(template: string, product: ApiProductDetail) {
  const metadata = productSeo(product);
  if (!Number.isFinite(metadata.price)) throw new Error('Product price is unavailable');
  const paragraphs = product.description.split(/\n+/).filter(Boolean).map(text => `<p>${escapeHtml(text)}</p>`).join('');
  const care = product.care_instructions_list.map(text => `<li>${escapeHtml(text)}</li>`).join('');
  const included = product.what_you_get_list.map(text => `<li>${escapeHtml(text)}</li>`).join('');
  const body = `<main class="seo-preview"><nav aria-label="Breadcrumb"><a href="/">Rastlina</a><a href="/shop">Shop plants</a></nav>
<div class="product-layout"><div>${metadata.image ? `<img src="${escapeHtml(metadata.image)}" alt="${escapeHtml(product.name)}" width="600" height="600" fetchpriority="high"/>` : ''}</div>
<div><h1>${escapeHtml(product.name)}</h1><p class="price">₹${escapeHtml(metadata.price.toFixed(2))}</p><p>${metadata.inStock ? 'In stock' : 'Out of stock'}</p>
${product.review_count > 0 ? `<p>${escapeHtml(product.average_rating)}/5 from ${escapeHtml(product.review_count)} reviews</p>` : ''}${paragraphs}
<h2>What is included</h2><ul>${included}</ul><h2>Plant care</h2><p>${escapeHtml(product.sunlight)}. ${escapeHtml(product.watering)}</p><ul>${care}</ul>
<noscript><p>Enable JavaScript to select a size and complete checkout.</p></noscript></div></div></main>`;
  return pageHtml(template, { ...metadata, type: 'product' }, body);
}

export type Article = { id: number; title: string; excerpt: string; image: string; imageAlt?: string; date: string; publishedDate: string; modifiedDate?: string; content: string };
export function articlePageHtml(template: string, article: Article) {
  const path = `/blog/${article.id}`;
  return pageHtml(template, {
    title: `${article.title} | Rastlina`, description: article.excerpt, path, image: article.image, type: 'article',
    schema: {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: article.title, image: article.image,
      datePublished: article.publishedDate, ...(article.modifiedDate ? { dateModified: article.modifiedDate } : {}),
      mainEntityOfPage: `${SITE_URL}${path}`,
      publisher: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Rastlina Nature Hub Private Limited', url: `${SITE_URL}/` },
    },
  }, article.id === 1 ? vastuArticleMarkup(article) : `<main class="seo-preview"><nav><a href="/">Rastlina</a><a href="/shop">Shop indoor plants</a></nav><article><h1>${escapeHtml(article.title)}</h1><p><time datetime="${escapeHtml(article.publishedDate)}">${escapeHtml(article.date)}</time></p><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt || article.title)}" width="1200" height="800"/>${article.content}</article></main>`);
}

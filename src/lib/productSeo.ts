import type { ApiProductDetail, ProductVariant } from '../pages/ProductDetail';
import { SITE_URL } from './seoUrls';

export function defaultProductVariant(product: ApiProductDetail) {
  return product.variants.find(variant => variant.in_stock) || product.variants[0] || null;
}

export function productSeo(product: ApiProductDetail, variant: ProductVariant | null = defaultProductVariant(product)) {
  const path = `/product/${encodeURIComponent(product.slug)}`;
  const price = Number(variant?.final_price ?? product.price);
  const inStock = variant ? variant.in_stock : product.in_stock;
  const description = `Shop ${product.name} with a self-watering pot and soil mix at Rastlina. A living plant gift with care guidance and delivery across India.`;
  const images = product.images.map(image => new URL(image.image, SITE_URL).toString());
  const primaryImage = product.images.find(image => image.is_primary)?.image || product.images[0]?.image;
  const schema = {
    '@context': 'https://schema.org', '@type': 'Product',
    '@id': `${SITE_URL}${path}#product`, name: product.name, sku: product.sku,
    description: product.description, image: images,
    brand: { '@type': 'Brand', name: 'Rastlina' },
    ...(Number.isFinite(price) && price >= 0 ? { offers: {
      '@type': 'Offer', url: `${SITE_URL}${path}`, priceCurrency: 'INR', price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Rastlina Nature Hub Private Limited' },
    } } : {}),
    ...(product.review_count > 0 && product.average_rating >= 1 && product.average_rating <= 5 ? {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: product.average_rating, reviewCount: product.review_count },
    } : {}),
  };
  return {
    title: `Buy ${product.name} Online in India | Rastlina`, description,
    path, image: primaryImage, price, inStock,
    schema: [schema, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}${path}` },
      ],
    }],
  };
}

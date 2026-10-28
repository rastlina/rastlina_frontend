import type { CartItem } from '@/contexts/CartContext';
import type { ApiProductDetail, ProductVariant } from '@/pages/ProductDetail';

export interface ReorderItem {
  product_name: string;
  product_slug?: string;
  variant_id?: number | null;
  variant_label?: string;
  quantity: number;
}
const normal = (value: string) => value.trim().toLowerCase().replace(/\s*\/\s*/g, '/');

function sameVariant(item: ReorderItem, variant: ProductVariant) {
  const label = normal(item.variant_label || '');
  const labels = [
    [variant.size_name, variant.color_name].filter(Boolean).join('/'),
    [variant.size_name, variant.color_name || 'Standard'].filter(Boolean).join('/'),
  ];
  return label !== '' && labels.some(value => normal(value) === label);
}

/** Reorders use current catalogue prices and stock, never the historical amount or coupon. */
export async function prepareReorder(
  items: ReorderItem[],
  fetchProduct: (slug: string) => Promise<ApiProductDetail>,
  existing: CartItem[] = [],
) {
  const requests = new Map<string, Promise<ApiProductDetail>>();
  const lines = new Map<string, CartItem>();
  const unavailable: string[] = [];
  const adjusted: string[] = [];
  const results = await Promise.allSettled(items.map(item => {
    if (!item.product_slug) return Promise.reject(new Error('Product no longer available'));
    if (!requests.has(item.product_slug)) requests.set(item.product_slug, fetchProduct(item.product_slug));
    return requests.get(item.product_slug)!;
  }));
  results.forEach((result, index) => {
    const item = items[index];
    if (result.status !== 'fulfilled') { unavailable.push(item.product_name); return; }
    const product = result.value;
    const candidates = product.variants.filter(variant => sameVariant(item, variant));
    const variant = product.variants.find(variant => variant.id === item.variant_id)
      || (candidates.length === 1 ? candidates[0] : null)
      || (!item.variant_label && product.variants.length === 1 ? product.variants[0] : null);
    if (!variant || !variant.in_stock || variant.stock < 1) { unavailable.push(item.product_name); return; }
    const price = Number(variant.final_price ?? Number(product.price) + Number(variant.price_override || 0));
    const wanted = Math.floor(Number(item.quantity));
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(wanted) || wanted < 1) { unavailable.push(item.product_name); return; }
    const key = `${product.id}:${variant.id}`;
    const alreadyInCart = existing.filter(line => line.product.id === product.id && line.variantId === variant.id)
      .reduce((sum, line) => sum + line.quantity, 0);
    const prepared = lines.get(key);
    const quantity = Math.min(wanted, Math.max(0, variant.stock - alreadyInCart - (prepared?.quantity || 0)));
    if (quantity < wanted) adjusted.push(item.product_name);
    if (!quantity) return;
    if (prepared) { prepared.quantity += quantity; return; }
    lines.set(key, {
      product: { id: product.id, name: product.name, slug: product.slug, images: product.images },
      quantity, selectedSize: variant.size_name, selectedColor: variant.color_name || 'Standard',
      selectedColorHex: variant.color_hex || '', price,
      originalPrice: Math.max(price, Number(variant.final_original_price ?? product.original_price ?? price)),
      stock: variant.stock, variantId: variant.id,
    });
  });
  return { lines: [...lines.values()], unavailable, adjusted };
}

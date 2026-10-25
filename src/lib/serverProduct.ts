import type { ApiProductDetail } from '@/pages/ProductDetail';

// Reuse only fresh public data already fetched by the product-page server.
// Never carry a quote across slugs or into an authenticated session.
export function serverProduct(slug?: string): ApiProductDetail | null {
  if (!slug || typeof document === 'undefined') return null;
  try {
    if (localStorage.getItem('rastlinaToken')) return null;
    const raw = document.getElementById('rastlina-product-data')?.textContent;
    if (!raw) return null;
    const { product, generatedAt } = JSON.parse(raw);
    if (product?.slug !== slug || !Number.isFinite(generatedAt) || Date.now() - generatedAt > 120000 || generatedAt > Date.now() + 5000) return null;
    if (!Array.isArray(product.variants) || !Array.isArray(product.images) || !Array.isArray(product.available_sizes) || !Array.isArray(product.available_colors)) return null;
    return product;
  } catch { return null; }
}

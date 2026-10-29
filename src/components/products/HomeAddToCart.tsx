import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { storeService } from '@/services/api';
import { normalizeProductName } from '@/utils/productName';
import type { ApiProductDetail, ProductVariant } from '@/pages/ProductDetail';
import type { ApiProduct } from './ProductCard';

const QuickAddOptions = lazy(() => import('./QuickAddOptions'));
const available = (variant: ProductVariant) => variant.in_stock && Number(variant.stock) > 0 && Number.isFinite(Number(variant.final_price)) && Number(variant.final_price) >= 0;

export default function HomeAddToCart({ product }: { product: ApiProduct }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ApiProductDetail | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const add = (detail: ApiProductDetail, variant: ProductVariant) => {
    if (!available(variant)) return;
    const images = variant.color_id ? detail.images.filter(image => image.color_id === variant.color_id) : detail.images;
    const image = images.find(image => image.is_primary) || images[0] || detail.images.find(image => image.is_primary) || detail.images[0];
    addToCart({ id: detail.id, slug: detail.slug, name: normalizeProductName(detail.name), original_price: detail.original_price,
      images: image ? [{ image: image.image, is_primary: true, color_id: variant.color_id }] : [] },
      variant.size_name, variant.color_name || 'Standard', variant.color_hex || '', Number(variant.final_price),
      Number(variant.final_original_price ?? variant.final_price), Number(variant.stock), variant.id, 1);
  };

  const start = async () => {
    if (busy.current || !product.in_stock) return;
    busy.current = true; setLoading(true);
    try {
      // The list card is not a quote. Load current variant prices and stock only
      // on click, keeping the homepage light and avoiding arbitrary options.
      const detail: ApiProductDetail = await storeService.getProductBySlug(product.slug);
      if (!mounted.current) return;
      if (detail.id !== product.id || detail.slug !== product.slug || !Array.isArray(detail.variants) || !Array.isArray(detail.images)) throw new Error('Invalid product');
      const stocked = detail.variants.filter(available);
      if (!stocked.length) toast.error('This plant is currently out of stock.');
      else if (stocked.length === 1) add(detail, stocked[0]);
      else setOptions({ ...detail, variants: stocked });
    } catch {
      if (mounted.current) toast.error('Unable to add this plant. Please try again.');
    } finally {
      busy.current = false;
      if (mounted.current) setLoading(false);
    }
  };

  return <>
    <button type="button" className="product-card-action home-card-add" onClick={start}
      disabled={loading || !product.in_stock || Boolean(options)} aria-busy={loading}
      aria-label={`${product.in_stock ? 'Add to Cart' : 'Out of Stock'}: ${product.name}`}>
      <span>{loading ? 'Adding…' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}</span>
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
    </button>
    {options && <Suspense fallback={<p className="px-3 pb-3 text-xs" role="status">Loading plant options…</p>}>
      <QuickAddOptions product={options} onClose={() => setOptions(null)} onAdd={variant => { setOptions(null); add(options, variant); }} />
    </Suspense>}
  </>;
}

// src/pages/ProductDetail.tsx
// Fully API-integrated product detail page
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { storeService } from '@/services/api';
import { useCart } from '@/contexts/CartContext';
import { FAQ } from '@/components/product-detail/ProductFAQ';
import { ImageGallery } from '@/components/product-detail/ImageGallery';
import { ProductInfo } from '@/components/product-detail/ProductInfo';
import { SizeSelector, ColorSelector } from '@/components/product-detail/ProductSelector';
import { ProductTabs } from '@/components/product-detail/ProductTabs';
import { ProductReviews } from '@/components/product-detail/ProductReviews';
import { WhyChooseUs } from '@/components/product-detail/WhyChooseUs';
import { ProductSuggestions } from '@/components/product-detail/ProductSuggestions';
import { ProductFAQ } from '@/components/product-detail/ProductFAQ';
import { FixedBottomBar } from '@/components/product-detail/FixedBottomBar';

// ─── Types matching the backend serializer exactly ────────────────────────────

export interface ProductVariant {
  id: number;
  size_id: number;
  size_name: string;
  color_id: number | null;
  color_name: string | null;
  color_hex: string | null;
  stock: number;
  price_override: number;
  final_price: number;
  final_original_price: number | null;
  in_stock: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
  color_id: number | null;
  color_name: string | null;
  color_hex: string | null;
}

export interface DeliveryEstimate {
  id: number;
  region: string;
  estimate: string;
  order: number;
}

export interface Review {
  id: number;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  variant_info: string;
  is_verified_purchase: boolean;
  is_featured: boolean;
  date: string;
}

export interface ApiProductDetail {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  original_price: string | null;
  discount_percentage: number;
  care_level: string;
  pet_friendly: boolean | null;
  air_purifying: boolean;
  sunlight: string;
  watering: string;
  temperature: string;
  growth_rate: string;
  description: string;
  care_instructions_list: string[];
  what_you_get_list: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  delivery_estimates: DeliveryEstimate[];
  reviews: Review[];
  review_count: number;
  average_rating: number;
  available_sizes: { id: number; name: string }[];
  available_colors: { id: number; name: string; hex_code: string }[];
  in_stock: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_best_deal: boolean;
  category_name: string;
  category_slug: string;
  main_category_slug: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Given current size & color selections, find the matching variant */
export function findVariant(
  variants: ProductVariant[],
  sizeId: number | null,
  colorId: number | null
): ProductVariant | null {
  if (!sizeId) return null;
  const exact = variants.find(v => v.size_id === sizeId && v.color_id === colorId);
  if (exact) return exact;
  return variants.find(v => v.size_id === sizeId && v.color_id === null) || null;
}

/** Images to show for a given color: color-specific + generic (color_id null) */
export function imagesForColor(images: ProductImage[], colorId: number | null): ProductImage[] {
  if (!colorId) return images;
  const colorSpecific = images.filter(img => img.color_id === colorId);
  const generic = images.filter(img => img.color_id === null);
  return colorSpecific.length > 0 ? [...colorSpecific, ...generic] : images;
}

/**
 * Get the best cart image for a variant:
 * - Primary image for selected color first
 * - Falls back to any primary image
 * - Falls back to first image
 */
function getCartImage(images: ProductImage[], colorId: number | null): string {
  const colorFiltered = colorId
    ? images.filter(img => img.color_id === colorId)
    : images;

  // Primary image for this color
  const colorPrimary = colorFiltered.find(img => img.is_primary);
  if (colorPrimary) return colorPrimary.image;

  // Any color image
  if (colorFiltered.length > 0) return colorFiltered[0].image;

  // Global primary fallback
  const globalPrimary = images.find(img => img.is_primary);
  if (globalPrimary) return globalPrimary.image;

  // Last resort
  return images[0]?.image ?? '';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <main className="bg-white pt-[120px] pb-32">
    <div className="container mx-auto px-4 max-w-7xl py-4">
      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
        <div className="space-y-5">
          <div className="h-10 bg-gray-100 rounded animate-pulse w-3/4" />
          <div className="h-6 bg-gray-100 rounded animate-pulse w-1/3" />
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse w-1/2" />
        </div>
      </div>
    </div>
  </main>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // FIX: quantity lives here and is passed down to FixedBottomBar
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);

  // Reset quantity whenever the variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedSizeId, selectedColorId]);

  // Fetch product + related + FAQs in parallel
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    Promise.all([
      storeService.getProductBySlug(slug),
      storeService.getRelatedProducts(slug),
      storeService.getFAQs(),
    ])
      .then(([prod, related, faqData]) => {
        setProduct(prod);
        setRelatedProducts(related?.results || []);

        const validatedFaqs: FAQ[] = (faqData || []).map((item: any, index: number) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          order: item.order ?? index,
        }));
        setFaqs(validatedFaqs);

        // Default: first variant with stock, else just first variant
        const firstStocked = prod.variants.find((v: ProductVariant) => v.in_stock);
        const firstVariant = firstStocked || prod.variants[0];
        if (firstVariant) {
          setSelectedSizeId(firstVariant.size_id);
          setSelectedColorId(firstVariant.color_id);
        } else if (prod.available_sizes[0]) {
          setSelectedSizeId(prod.available_sizes[0].id);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Recently viewed — read/write localStorage, fetch mini product data
  useEffect(() => {
    if (!product?.slug) return;
    const stored: string[] = JSON.parse(
      localStorage.getItem('rastlinaRecentlyViewed') || '[]'
    );
    const updated = [product.slug, ...stored.filter(s => s !== product.slug)].slice(0, 6);
    localStorage.setItem('rastlinaRecentlyViewed', JSON.stringify(updated));

    const slugsToFetch = updated.filter(s => s !== product.slug).slice(0, 4);
    if (!slugsToFetch.length) return;
    Promise.all(slugsToFetch.map(s => storeService.getProductBySlug(s).catch(() => null)))
      .then(results => setRecentlyViewed(results.filter(Boolean)));
  }, [product?.slug]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const activeVariant = product
    ? findVariant(product.variants, selectedSizeId, selectedColorId)
    : null;

  const displayImages = product
    ? imagesForColor(product.images, selectedColorId)
    : [];

  const canAddToCart = !!activeVariant?.in_stock;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleColorSelect = useCallback((colorId: number | null) => {
    setSelectedColorId(colorId);
    if (!product) return;
    const variant = product.variants.find(
      v => v.color_id === colorId && v.size_id === selectedSizeId
    );
    if (!variant) {
      const fallback = product.variants.find(v => v.color_id === colorId);
      if (fallback) setSelectedSizeId(fallback.size_id);
    }
  }, [product, selectedSizeId]);

  const handleSizeSelect = useCallback((sizeId: number) => {
    setSelectedSizeId(sizeId);
    if (!product) return;
    const variant = product.variants.find(
      v => v.size_id === sizeId && v.color_id === selectedColorId
    );
    if (!variant) {
      const fallback = product.variants.find(v => v.size_id === sizeId);
      if (fallback) setSelectedColorId(fallback.color_id);
    }
  }, [product, selectedColorId]);

  // FIX: quantity guard — can't exceed stock, can't go below 1
  const handleQuantityChange = useCallback((newQty: number) => {
    if (!activeVariant) return;
    const clamped = Math.max(1, Math.min(newQty, activeVariant.stock));
    setQuantity(clamped);
  }, [activeVariant]);

  const handleAddToCart = useCallback(() => {
    if (!product || !activeVariant || !activeVariant.in_stock) return;

    // FIX: Use color-filtered primary image for cart display
    const cartImageUrl = getCartImage(product.images, selectedColorId);

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        // CartItem.product.images array — CartDrawer uses images[0].image
        images: [{ image: cartImageUrl, is_primary: true, color_id: selectedColorId }],
        original_price: product.original_price,
      },
      activeVariant.size_name,                              // sizeName
      activeVariant.color_name || 'Standard',              // colorName
      activeVariant.color_hex || '',                       // colorHex
      activeVariant.final_price,                           // price
      activeVariant.final_original_price ?? activeVariant.final_price, // originalPrice
      activeVariant.stock,                                 // stock (for cart validation)
      activeVariant.id,                                    // variantId
      quantity,                                            // FIX: pass actual quantity
    );
  }, [product, activeVariant, selectedColorId, quantity, addToCart]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out ${product?.name} on Rastlina!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        // Could toast here if needed
      });
    }
  }, [product]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <Skeleton />;

  if (error || !product) {
    return (
      <div className="pt-[120px] pb-32 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-2xl font-serif font-bold text-gray-900 mb-4">Product not found</p>
        <Link to="/shop" className="text-[#667D00] font-bold hover:underline">
          ← Back to Shop
        </Link>
      </div>
    );
  }
  // console.log('PRODUCT DATA', product);

  return (
    <main className="bg-white pt-[120px] pb-32 relative">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-7xl py-3">
        <nav className="text-sm text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#667D00] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#667D00] transition-colors">Shop</Link>
          {product.category_name && (
            <>
              <span>/</span>
              <Link
                to={`/shop?category=${product.category_slug}`}
                className="hover:text-[#667D00] transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[180px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Primary Product Section ── */}
      <section className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* Left: Image Gallery */}
          <ImageGallery
            images={displayImages}
            productName={product.name}
            onShare={handleShare}
          />

          {/* Right: Info + Selectors (sticky on desktop) */}
          <div className="space-y-7 lg:sticky lg:top-36 lg:self-start">
            <ProductInfo
              name={product.name}
              reviewCount={product.review_count}
              averageRating={product.average_rating}
              price={Number(product.price)}
              originalPrice={product.original_price ? Number(product.original_price) : null}
              discountPercentage={product.discount_percentage}
              activeVariant={activeVariant}
              deliveryEstimates={product.delivery_estimates}
              onShare={handleShare}
              badges={{
                isNewArrival: product.is_new_arrival,
                isBestSeller: product.is_best_seller,
                isBestDeal: product.is_best_deal,
              }}
            />

            <div className="space-y-5 pt-1">
              {product.variants.length > 0 && (
                <SizeSelector
                  variants={product.variants}
                  selectedSizeId={selectedSizeId}
                  selectedColorId={selectedColorId}
                  onSelect={handleSizeSelect}
                />
              )}

              {product.available_colors.length > 0 && (
                <ColorSelector
                  colors={product.available_colors}
                  variants={product.variants}
                  selectedColorId={selectedColorId}
                  selectedSizeId={selectedSizeId}
                  onSelect={handleColorSelect}
                />
              )}
            </div>

            {/* Out of stock notice */}
            {!canAddToCart && product.variants.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold">
                {activeVariant
                  ? 'This variant is currently out of stock. Try a different size or color.'
                  : 'Select a size and color to check availability.'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Tabs: Description / Care Guide / What's Included ── */}
      <ProductTabs product={product} />

      {/* ── Reviews ── */}
      <ProductReviews
        reviews={product.reviews}
        reviewCount={product.review_count}
        averageRating={product.average_rating}
        productSlug={product.slug}
        activeVariant={activeVariant}
      />

      {/* ── Why Choose Rastlina (static) ── */}
      <WhyChooseUs />

      {/* ── You Might Also Like ── */}
      {relatedProducts.length > 0 && (
        <ProductSuggestions
          title="You Might Also Like"
          products={relatedProducts}
          bgColor="bg-[#F8F7F4]"
        />
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <ProductSuggestions
          title="Recently Viewed"
          products={recentlyViewed}
          bgColor="bg-white"
        />
      )}

      {/* ── FAQ ── */}
      <ProductFAQ faqs={faqs} />

      {/* ── Fixed Bottom Bar ── */}
      <FixedBottomBar
        productName={product.name}
        canAddToCart={canAddToCart}
        activeVariant={activeVariant}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        onAddToCart={handleAddToCart}
        basePrice={Number(product.price)}
      />
    </main>
  );
};

export default ProductDetail;
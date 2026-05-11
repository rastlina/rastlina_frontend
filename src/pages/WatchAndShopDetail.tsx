// src/pages/WatchAndShopDetail.tsx
// Watch & Shop detail page.
//
// Architecture:
//   LEFT  → WatchAndShopVideo (replaces ImageGallery)
//   RIGHT → ALL existing ProductDetail right-column components (zero changes)
//   BELOW → ALL existing ProductDetail below-fold sections (zero changes)
//
// Cart logic, stock checks, quantity, variants — IDENTICAL to ProductDetail.
// The only difference from ProductDetail is the media section on the left.

import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/contexts/CartContext';
import { storeService } from '@/services/api';
import { useWatchAndShopDetail } from '@/hooks/useWatchAndShop';

// Reuse EVERY sub-component from the existing product detail system
import { ProductInfo } from '@/components/product-detail/ProductInfo';
import { SizeSelector, ColorSelector } from '@/components/product-detail/ProductSelector';
import { ProductTabs } from '@/components/product-detail/ProductTabs';
import { ProductReviews } from '@/components/product-detail/ProductReviews';
import { WhyChooseUs } from '@/components/product-detail/WhyChooseUs';
import { ProductSuggestions } from '@/components/product-detail/ProductSuggestions';
import { ProductFAQ } from '@/components/product-detail/ProductFAQ';
import { FixedBottomBar } from '@/components/product-detail/FixedBottomBar';
import { WatchAndShopVideo } from '@/watch-and-shop/WatchAndShopVideo';

// Reuse helpers and types from ProductDetail
import {
  findVariant,
  imagesForColor,
  type ProductVariant,
  type ApiProductDetail,
} from '@/pages/ProductDetail';
import type { FAQ } from '@/components/product-detail/ProductFAQ';

// ── Helper: best product image for cart (NOT the video thumbnail) ─────────────
function getCartImage(
  images: ApiProductDetail['images'],
  colorId: number | null
): string {
  const filtered = colorId
    ? images.filter(img => img.color_id === colorId)
    : images;
  return (
    filtered.find(img => img.is_primary)?.image ??
    filtered[0]?.image ??
    images.find(img => img.is_primary)?.image ??
    images[0]?.image ??
    ''
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <main className="bg-white pt-[120px] pb-32">
    <div className="container mx-auto px-4 max-w-7xl py-4">
      <div className="h-4 w-56 bg-gray-100 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Video placeholder */}
        <div className="w-full aspect-video lg:aspect-[4/5] rounded-2xl bg-gray-900 animate-pulse" />
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const WatchAndShopDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  // Watch & Shop item + linked product
  const { data, loading, error } = useWatchAndShopDetail(slug);

  // These mirror ProductDetail state exactly
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const product = data?.product ?? null;
  const watchItem = data?.watchItem ?? null;

  // Reset quantity when variant changes
  useEffect(() => { setQuantity(1); }, [selectedSizeId, selectedColorId]);

  // Once product is loaded: set default variant, fetch related + FAQs
  useEffect(() => {
    if (!product) return;

    // Default variant — first with stock
    const firstStocked = product.variants.find((v: ProductVariant) => v.in_stock);
    const firstVariant = firstStocked || product.variants[0];
    if (firstVariant) {
      setSelectedSizeId(firstVariant.size_id);
      setSelectedColorId(firstVariant.color_id);
    } else if (product.available_sizes[0]) {
      setSelectedSizeId(product.available_sizes[0].id);
    }

    // Fetch related products + FAQs in parallel
    Promise.all([
      storeService.getRelatedProducts(product.slug),
      storeService.getFAQs(),
    ]).then(([related, faqData]) => {
      setRelatedProducts(related?.results || []);
      setFaqs(
        (faqData || []).map((item: any, idx: number) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
          order: item.order ?? idx,
        }))
      );
    }).catch(() => {});
  }, [product?.slug]);

  // Recently viewed — track by product slug (same key as ProductDetail)
  useEffect(() => {
    if (!product?.slug) return;
    const stored: string[] = JSON.parse(
      localStorage.getItem('rastlinaRecentlyViewed') || '[]'
    );
    const updated = [product.slug, ...stored.filter(s => s !== product.slug)].slice(0, 6);
    localStorage.setItem('rastlinaRecentlyViewed', JSON.stringify(updated));

    const toFetch = updated.filter(s => s !== product.slug).slice(0, 4);
    if (!toFetch.length) return;
    Promise.all(toFetch.map(s => storeService.getProductBySlug(s).catch(() => null)))
      .then(results => setRecentlyViewed(results.filter(Boolean)));
  }, [product?.slug]);

  // ── Derived state ─────────────────────────────────────────────────────────
  const activeVariant = product
    ? findVariant(product.variants, selectedSizeId, selectedColorId)
    : null;

  const canAddToCart = !!activeVariant?.in_stock;

  // ── Handlers — identical to ProductDetail ─────────────────────────────────

  const handleSizeSelect = useCallback((sizeId: number) => {
    setSelectedSizeId(sizeId);
    if (!product) return;
    const match = product.variants.find(
      v => v.size_id === sizeId && v.color_id === selectedColorId
    );
    if (!match) {
      const fallback = product.variants.find(v => v.size_id === sizeId);
      if (fallback) setSelectedColorId(fallback.color_id);
    }
  }, [product, selectedColorId]);

  const handleColorSelect = useCallback((colorId: number | null) => {
    setSelectedColorId(colorId);
    if (!product) return;
    const match = product.variants.find(
      v => v.color_id === colorId && v.size_id === selectedSizeId
    );
    if (!match) {
      const fallback = product.variants.find(v => v.color_id === colorId);
      if (fallback) setSelectedSizeId(fallback.size_id);
    }
  }, [product, selectedSizeId]);

  const handleQuantityChange = useCallback((newQty: number) => {
    if (!activeVariant) return;
    setQuantity(Math.max(1, Math.min(newQty, activeVariant.stock)));
  }, [activeVariant]);

  const handleAddToCart = useCallback(() => {
    if (!product || !activeVariant || !activeVariant.in_stock) return;

    // Cart uses the PRODUCT image — never the video thumbnail
    const cartImageUrl = getCartImage(product.images, selectedColorId);

    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        images: [{ image: cartImageUrl, is_primary: true, color_id: selectedColorId }],
        original_price: product.original_price,
      },
      activeVariant.size_name,
      activeVariant.color_name || 'Standard',
      activeVariant.color_hex || '',
      activeVariant.final_price,
      activeVariant.final_original_price ?? activeVariant.final_price,
      activeVariant.stock,
      activeVariant.id,
      quantity,
    );
  }, [product, activeVariant, selectedColorId, quantity, addToCart]);

  const handleShare = useCallback(() => {
    const shareData = {
      title: watchItem?.title || product?.name,
      text: `Watch & Shop: ${watchItem?.title || product?.name} on Rastlina!`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  }, [watchItem, product]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <Skeleton />;

  if (error || !data || !product || !watchItem) {
    return (
      <div className="pt-[120px] pb-32 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-2xl font-serif font-bold text-gray-900 mb-4">
          Video not found
        </p>
        <Link to="/" className="text-[#667D00] font-bold hover:underline">
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white pt-[120px] pb-32 relative">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-7xl py-3">
        <nav className="text-sm text-gray-500 font-medium flex items-center gap-1.5 flex-wrap">
          <Link to="/" className="hover:text-[#667D00] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#667D00] font-semibold">Watch & Shop</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">
            {watchItem.title}
          </span>
        </nav>
      </div>

      {/* ── Primary Section: Video + Product Right Column ── */}
      <section className="container mx-auto px-4 max-w-7xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

          {/* LEFT: Video player (replaces ImageGallery entirely) */}
          <div className="lg:sticky lg:top-36 lg:self-start">
            <WatchAndShopVideo
              videoUrl={watchItem.video_url}
              thumbnail={watchItem.thumbnail}
              productName={watchItem.title}
              mode="detail"
              autoplay
            />

            {/* Video title below player — desktop */}
            <div className="hidden lg:flex items-center gap-2 mt-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Watch & Shop
                </p>
                <p className="font-serif font-bold text-gray-700 text-sm truncate">
                  {watchItem.title}
                </p>
              </div>
              <button
                onClick={handleShare}
                className="text-xs text-[#667D00] font-bold hover:underline flex-shrink-0"
              >
                Share Video
              </button>
            </div>
          </div>

          {/* RIGHT: Existing product info — zero changes from ProductDetail */}
          <div className="space-y-7 lg:self-start">
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

            {/* Out of stock notice — identical to ProductDetail */}
            {!canAddToCart && product.variants.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold">
                {activeVariant
                  ? 'This variant is currently out of stock. Try a different size or color.'
                  : 'Select a size and color to check availability.'}
              </div>
            )}

            {/* Also available as normal product link */}
            <p className="text-xs text-gray-400 font-medium">
              View full details →{' '}
              <Link
                to={`/product/${product.slug}`}
                className="text-[#667D00] font-bold hover:underline"
              >
                {product.name}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Below fold: EVERY section identical to ProductDetail ── */}

      <ProductTabs product={product} />

      <ProductReviews
        reviews={product.reviews}
        reviewCount={product.review_count}
        averageRating={product.average_rating}
        productSlug={product.slug}
        activeVariant={activeVariant}
      />

      <WhyChooseUs />

      {relatedProducts.length > 0 && (
        <ProductSuggestions
          title="You Might Also Like"
          products={relatedProducts}
          bgColor="bg-[#F8F7F4]"
        />
      )}

      {recentlyViewed.length > 0 && (
        <ProductSuggestions
          title="Recently Viewed"
          products={recentlyViewed}
          bgColor="bg-white"
        />
      )}

      <ProductFAQ faqs={faqs} />

      {/* Fixed bottom bar — IDENTICAL to ProductDetail */}
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

export default WatchAndShopDetail;
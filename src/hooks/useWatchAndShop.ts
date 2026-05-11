// src/hooks/useWatchAndShop.ts
// Hook for Watch & Shop data. WatchAndShop items are purely a content/marketing
// layer — all ecommerce data comes from the linked product_slug.
import { useState, useEffect } from 'react';
import { storeService } from '@/services/api';
import type { ApiProductDetail } from '@/pages/ProductDetail';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WatchAndShopItem {
  id: number;
  title: string;
  slug: string;
  video_url: string;       // YouTube URL, direct MP4, or embed URL
  thumbnail: string;       // fallback image while video loads
  order: number;
  is_active: boolean;
  product_slug: string;    // slug of the linked Product
  product?: ApiProductDetail; // hydrated after second fetch
}

// ─── List Hook ────────────────────────────────────────────────────────────────

export function useWatchAndShopList() {
  const [items, setItems] = useState<WatchAndShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    storeService
      .getWatchAndShop()
     .then((response: any) => {
  if (cancelled) return;

  const data = response.watch_and_shop || response || [];

  const active = data.filter(
    (i: WatchAndShopItem) => i.is_active
  );

  setItems(active);
})
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { items, loading, error };
}

// ─── Detail Hook ──────────────────────────────────────────────────────────────

export interface WatchAndShopDetail {
  watchItem: WatchAndShopItem;
  product: ApiProductDetail;
}

export function useWatchAndShopDetail(slug: string | undefined) {
  const [data, setData] = useState<WatchAndShopDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    // Step 1: fetch the WatchAndShop item
    storeService
      .getWatchAndShopBySlug(slug)
      .then(async (watchItem: WatchAndShopItem) => {
        if (cancelled) return;

        // Step 2: fetch the linked product using its product_slug
        const product = await storeService.getProductBySlug(watchItem.product_slug);
        if (!cancelled) {
          setData({ watchItem, product });
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug]);

  return { data, loading, error };
}
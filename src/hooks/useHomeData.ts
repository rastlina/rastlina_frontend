// src/hooks/useHomeData.ts
// Fetches all homepage data in a single API call.
// Each section reads from the same cached response — zero duplicate requests.
import { useState, useEffect } from 'react';
import { storeService } from '@/services/api';
import type { ApiProduct } from '@/components/products/ProductCard';

export interface HeroSlide {
  id: number;
  image: string;
  link_url?: string;
}

export interface FeaturedCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  main_category_slug?: string;
}

export interface FeaturedSpace {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
}

export interface FeaturedReview {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  is_verified_purchase: boolean;
}

export interface HomeData {
  hero_slides: HeroSlide[];
  new_arrivals: ApiProduct[];
  best_sellers: ApiProduct[];
  trending: ApiProduct[];
  best_deals: ApiProduct[];
  featured_categories: FeaturedCategory[];
  featured_spaces: FeaturedSpace[];
  featured_reviews: FeaturedReview[];
}

const EMPTY: HomeData = {
  hero_slides: [],
  new_arrivals: [],
  best_sellers: [],
  trending: [],
  best_deals: [],
  featured_categories: [],
  featured_spaces: [],
  featured_reviews: [],
};

export function useHomeData() {
  const [data, setData] = useState<HomeData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    storeService
      .getHomeData()
      .then((res: HomeData) => {
        if (!cancelled) {
          setData({
            hero_slides: res.hero_slides ?? [],
            new_arrivals: (res.new_arrivals ?? []).slice(0, 8),
            best_sellers: (res.best_sellers ?? []).slice(0, 8),
            trending: (res.trending ?? []).slice(0, 8),
            best_deals: (res.best_deals ?? []).slice(0, 8),
            featured_categories: res.featured_categories ?? [],
            featured_spaces: res.featured_spaces ?? [],
            featured_reviews: res.featured_reviews ?? [],
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
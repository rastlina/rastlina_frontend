// A short-lived, public catalogue shared across collection filters. Never used
// for product quotes, carts, checkout, authenticated requests or search text.
type Product = {
  id: number; slug: string; category_slug: string; main_category_slug: string;
  price: string | number; care_level: string;
  space_tags: Array<{ slug: string }>; available_sizes: Array<{ name: string }>;
  available_colors: Array<{ name: string }>; images: Array<{ is_primary?: boolean }>;
  [key: string]: unknown;
};
type Snapshot = { products: Product[]; fetchedAt: number };
type Cache = { get(key: string): Promise<unknown>; set(key: string, value: unknown, options: { ttl: number }): Promise<unknown> };
const lifetime = 60_000;
const orders = new Set(['price', '-price', '-created_at', 'created_at', 'name', '-name']);

export function cardProducts(products: Product[]) {
  return products.map(product => {
    const images = Array.isArray(product.images) ? product.images : [];
    const primary = images.find(image => image.is_primary) || images[0];
    return { ...product, images: primary ? [primary] : [] };
  });
}

function complete(products: unknown): products is Product[] {
  return Array.isArray(products) && products.every(product => product &&
    typeof product.id === 'number' && typeof product.slug === 'string' &&
    typeof product.category_slug === 'string' && typeof product.main_category_slug === 'string' &&
    Number.isFinite(Number(product.price)) && typeof product.care_level === 'string' &&
    ['pet_friendly', 'air_purifying', 'is_new_arrival', 'is_best_seller', 'is_trending', 'is_best_deal'].every(key => typeof product[key] === 'boolean') &&
    ['space_tags', 'available_sizes', 'available_colors', 'images'].every(key => Array.isArray(product[key])));
}

function matches(product: Product, params: URLSearchParams) {
  for (const key of ['main_category', 'category']) {
    if (params.get(key) && product[`${key}_slug`] !== params.get(key)) return false;
  }
  if (params.get('space') && !product.space_tags.some(tag => tag.slug === params.get('space'))) return false;
  if (params.get('size') && !product.available_sizes.some(size => size.name.toLowerCase() === params.get('size')!.toLowerCase())) return false;
  if (params.get('color') && !product.available_colors.some(color => color.name.toLowerCase().includes(params.get('color')!.toLowerCase()))) return false;
  if (params.get('care_level') && product.care_level !== params.get('care_level')) return false;
  for (const key of ['pet_friendly', 'air_purifying', 'is_new_arrival', 'is_best_seller', 'is_trending', 'is_best_deal']) {
    if (params.get(key) === 'true' && !product[key]) return false;
  }
  if (params.get('min_price') && Number(product.price) < Number(params.get('min_price'))) return false;
  if (params.get('max_price') && Number(product.price) > Number(params.get('max_price'))) return false;
  return true;
}

export function createCatalogueLoader(getCache: () => Promise<Cache | null> = async () => null) {
  // Coalesce simultaneous requests only; the durable cache supplies expiry.
  const pending = new Map<string, Promise<Snapshot | null>>();
  async function origin(params: URLSearchParams) {
    const response = await fetch(`https://api.rastlina.com/api/store/products/?${params}`, {
      signal: AbortSignal.timeout(10000), redirect: 'error',
    });
    if (!response.ok) throw new Error('Catalogue unavailable');
    const data = await response.json();
    const products = Array.isArray(data) ? data : data?.results;
    if (!Array.isArray(products)) throw new Error('Invalid catalogue');
    const cards = cardProducts(products);
    return Array.isArray(data) ? cards : { ...data, results: cards };
  }
  return async (params: URLSearchParams) => {
    const fallback = async () => ({ data: await origin(params), remaining: 60, source: 'origin', age: 0 });
    // Search includes description/SKU/brand fields not present on catalogue
    // cards. Keep its exact backend semantics, as well as paginated responses.
    if (params.get('search') || ['min_price', 'max_price'].some(key => params.get(key) && !Number.isFinite(Number(params.get(key))))) return fallback();
    const requested = params.get('ordering') || '-created_at';
    const ordering = orders.has(requested) ? requested : '-created_at';
    const key = `rastlina:public-catalogue:v1:${ordering}`;
    let cache: Cache | null = null;
    try { cache = await getCache(); } catch { /* Cache availability cannot hide products. */ }
    // Without the shared cache, retain the original single origin request.
    if (!cache) return fallback();
    let snapshot: Snapshot | null = null;
    try {
      const candidate = await cache.get(key) as Snapshot | null;
      const age = candidate ? Date.now() - candidate.fetchedAt : Infinity;
      if (candidate && age >= 0 && age < lifetime && complete(candidate.products)) snapshot = candidate;
    } catch { /* Read through to the public service. */ }
    let source = 'shared';
    if (!snapshot) {
      source = 'origin';
      if (!pending.has(key)) {
        const request = (async () => {
          const data = await origin(new URLSearchParams({ ordering }));
          if (!complete(data)) return null;
          const fresh = { products: data, fetchedAt: Date.now() };
          try { await cache!.set(key, fresh, { ttl: lifetime / 1000 }); } catch { /* Serve fresh data even when a cache write fails. */ }
          return fresh;
        })().finally(() => pending.delete(key));
        pending.set(key, request);
      }
      snapshot = await pending.get(key)!;
    }
    if (!snapshot) return fallback();
    const age = Math.max(0, Date.now() - snapshot.fetchedAt);
    return { data: snapshot.products.filter(product => matches(product, params)),
      remaining: Math.max(0, 60 - Math.ceil(age / 1000)), source, age: Math.floor(age / 1000) };
  };
}

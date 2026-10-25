// Start the public catalogue request while the browser downloads the app.
// Only the exact matching query can consume it; failed or old requests fall
// back to the normal API. Never reuse it for an authenticated customer.
export function catalogueKey(params) {
  return new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== '').sort(([a], [b]) => a.localeCompare(b))).toString();
}

export function catalogueBootstrap() {
  return `(() => {
    if (!/^\\/shop(?:\\/|$)/.test(location.pathname)) return;
    try { if (localStorage.getItem('rastlinaToken')) return; } catch { return; }
    const query = new URLSearchParams(location.search);
    const params = {};
    for (const key of ['main_category','category','space','size','color','search','ordering','care_level','pet_friendly','air_purifying','min_price','max_price','is_new_arrival','is_best_seller','is_best_deal','is_trending']) {
      if (query.get(key)) params[key] = query.get(key);
    }
    const allPlants = params.main_category === 'plants';
    if (allPlants) delete params.main_category;
    if (!params.category && location.pathname.startsWith('/shop/')) params.category = decodeURIComponent(location.pathname.slice(6));
    if (!params.ordering) params.ordering = allPlants ? 'price' : '-created_at';
    const key = (${catalogueKey.toString()})(params);
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 10000);
    window.__rastlinaCatalogue = { key, startedAt: Date.now(),
      request: fetch('/api/catalogue?' + key, { credentials: 'omit', signal: controller.signal })
        .then(response => response.ok ? response.json() : null).then(data => {
          const products = Array.isArray(data) ? data : data?.results || [];
          for (const product of products.slice(0, 2)) {
            const images = product.images || [];
            const source = (images.find(image => image.is_primary) || images[0])?.image;
            if (!source) continue;
            const url = new URL(source, location.origin);
            if (url.origin !== 'https://api.rastlina.com' || !url.pathname.startsWith('/media/products/')) continue;
            const preload = document.createElement('link');
            preload.rel = 'preload'; preload.setAttribute('as', 'image'); preload.href = url.href; preload.fetchPriority = 'high';
            document.head.appendChild(preload);
          }
          return data;
        }).catch(() => null).finally(() => clearTimeout(deadline)) };
  })();`;
}

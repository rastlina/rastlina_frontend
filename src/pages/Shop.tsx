// src/pages/Shop.tsx
// Fully API-integrated shop page with dynamic filters from backend
import { useSearchParams, useNavigate, useLocation, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { storeService } from '@/services/api';
import { ProductCard, ApiProduct } from '@/components/products/ProductCard';
import { Seo } from '@/components/seo/Seo';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShopCategory {
  id: number;
  name: string;
  slug: string;
  main_category_name?: string;
  main_category_slug?: string;
}

interface FilterOptions {
  price_range: { min: number; max: number };
  sizes: Array<{ id: number; name: string }>;
  colors: Array<{ id: number; name: string; hex_code: string }>;
  care_levels: string[];
  spaces: Array<{ id: number; name: string; slug: string }>;
  categories: ShopCategory[];
  has_pet_friendly: boolean;
  has_air_purifying: boolean;
}

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

// WhatsApp float button

export default function Shop() {
  const location = useLocation();
  const { category: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read all active URL filters
  const urlMainCat = searchParams.get('main_category') || '';
  // The Plants landing link spans every plant collection and bundle.
  const isAllPlants = urlMainCat === 'plants';
  const requestMainCat = isAllPlants ? '' : urlMainCat;
  const urlCat = searchParams.get('category') || routeCategory || '';
  const urlSpace = searchParams.get('space') || '';
  const urlSize = searchParams.get('size') || '';
  const urlColor = searchParams.get('color') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlOrdering = searchParams.get('ordering') || (isAllPlants ? 'price' : '-created_at');
  const urlBestDeal = searchParams.get('is_best_deal') || '';
  const urlNewArrival = searchParams.get('is_new_arrival') || '';
  const urlBestSeller = searchParams.get('is_best_seller') || '';
  const urlPetFriendly = searchParams.get('pet_friendly') === 'true';
  const urlAirPurifying = searchParams.get('air_purifying') === 'true';
  const urlMinPrice = searchParams.get('min_price') || '';
  const urlMaxPrice = searchParams.get('max_price') || '';

  // Local filter state (separate from URL so "Apply" commits them)
  const [showFilters, setShowFilters] = useState(false);
  const filterSheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showFilters || window.matchMedia('(min-width: 1024px)').matches) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const nodes = () => Array.from(filterSheetRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])') ?? []);
    nodes()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setShowFilters(false); }
      if (event.key !== 'Tab') return;
      const focusable = nodes(), first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      previousFocus?.focus();
    };
  }, [showFilters]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(urlOrdering);

  // Local filter working state
  const [localPrice, setLocalPrice] = useState<[number, number]>([0, 99999]);
  const [localSizes, setLocalSizes] = useState<string[]>(urlSize ? [urlSize] : []);
  const [localColors, setLocalColors] = useState<string[]>(urlColor ? [urlColor] : []);
  const [localSpaces, setLocalSpaces] = useState<string[]>(urlSpace ? [urlSpace] : []);
  const [localPetFriendly, setLocalPetFriendly] = useState(false);
  const [localAirPurifying, setLocalAirPurifying] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState('price');

  // Count active filters
  const activeFilterCount = [
    Boolean(urlSize), Boolean(urlColor), Boolean(urlSpace),
    urlPetFriendly, urlAirPurifying, Boolean(urlMinPrice || urlMaxPrice),
  ].filter(Boolean).length;

  // Category labels must also resolve for collections with no products.
  useEffect(() => {
    storeService.getCategories().then(data => {
      setCategories(Array.isArray(data) ? data : data.results || []);
    }).catch(() => {});
  }, []);

  // Fetch filter options whenever main filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (requestMainCat) params.main_category = requestMainCat;
    if (urlCat) params.category = urlCat;
    storeService.getFilterOptions(params).then((opts: FilterOptions) => {
      setFilterOptions(opts);

    }).catch(() => {});
  }, [requestMainCat, urlCat]);

  // Keep the filter sheet in sync after applying, clearing or browser navigation.
  useEffect(() => {
    setLocalSizes(urlSize ? [urlSize] : []);
    setLocalColors(urlColor ? [urlColor] : []);
    setLocalSpaces(urlSpace ? [urlSpace] : []);
    setLocalPetFriendly(urlPetFriendly);
    setLocalAirPurifying(urlAirPurifying);
    if (filterOptions) setLocalPrice([
      urlMinPrice && Number.isFinite(Number(urlMinPrice)) ? Number(urlMinPrice) : filterOptions.price_range.min,
      urlMaxPrice && Number.isFinite(Number(urlMaxPrice)) ? Number(urlMaxPrice) : filterOptions.price_range.max,
    ]);
  }, [urlSize, urlColor, urlSpace, urlPetFriendly, urlAirPurifying, urlMinPrice, urlMaxPrice, filterOptions]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (requestMainCat) params.main_category = requestMainCat;
      if (urlCat) params.category = urlCat;
      if (urlSpace) params.space = urlSpace;
      if (urlSize) params.size = urlSize;
      if (urlColor) params.color = urlColor;
      if (urlSearch) params.search = urlSearch;
      if (urlBestDeal) params.is_best_deal = 'true';
      if (urlNewArrival) params.is_new_arrival = 'true';
      if (urlBestSeller) params.is_best_seller = 'true';
      if (urlPetFriendly) params.pet_friendly = true;
      if (urlAirPurifying) params.air_purifying = true;
      if (urlMinPrice && Number.isFinite(Number(urlMinPrice))) params.min_price = Number(urlMinPrice);
      if (urlMaxPrice && Number.isFinite(Number(urlMaxPrice))) params.max_price = Number(urlMaxPrice);
      params.ordering = ordering;

      const data = await storeService.getProducts(params);
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [requestMainCat, urlCat, urlSpace, urlSize, urlColor, urlSearch, urlBestDeal, urlNewArrival, urlBestSeller, urlPetFriendly, urlAirPurifying, urlMinPrice, urlMaxPrice, ordering]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setOrdering(urlOrdering); }, [urlOrdering]);

  const applyFilters = () => {
    const params: Record<string, string> = {};
    if (urlMainCat) params.main_category = urlMainCat;
    if (urlCat) params.category = urlCat;
    if (urlSearch) params.search = urlSearch;
    if (urlBestDeal) params.is_best_deal = 'true';
    if (urlNewArrival) params.is_new_arrival = 'true';
    if (urlBestSeller) params.is_best_seller = 'true';
    if (localSizes.length === 1) params.size = localSizes[0];
    if (localColors.length === 1) params.color = localColors[0];
    if (localSpaces.length === 1) params.space = localSpaces[0];
    if (localPetFriendly) params.pet_friendly = 'true';
    if (localAirPurifying) params.air_purifying = 'true';
    if (filterOptions && localPrice[0] > filterOptions.price_range.min) params.min_price = String(localPrice[0]);
    if (filterOptions && localPrice[1] < filterOptions.price_range.max) params.max_price = String(localPrice[1]);
    params.ordering = ordering;
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const params: Record<string, string> = {};
    if (urlMainCat) params.main_category = urlMainCat;
    if (urlCat) params.category = urlCat;
    if (urlSearch) params.search = urlSearch;
    setSearchParams(params);
    setLocalSizes([]); setLocalColors([]); setLocalSpaces([]);
    setLocalPetFriendly(false); setLocalAirPurifying(false);
    if (filterOptions) setLocalPrice([filterOptions.price_range.min, filterOptions.price_range.max]);
    setShowFilters(false);
  };

  const categoryName = categories.find(category => category.slug === urlCat)?.name
    || filterOptions?.categories.find(category => category.slug === urlCat)?.name
    || products[0]?.category_name || 'Plant Collection';
  const mainCategoryName = categories.find(category => category.main_category_slug === urlMainCat)?.main_category_name
    || products[0]?.main_category_name || 'Plant Collection';

  // Page title
const getTitle = () => {
  if (urlSearch) return `Results for "${urlSearch}"`;

  if (urlBestDeal) return 'Exclusive Offers';

  if (urlNewArrival) return 'New Arrivals';

  if (urlBestSeller) return 'Best-Selling Plants';

  if (urlCat) {
    return categoryName;
  }

  if (urlSpace) {
    return (
      filterOptions?.spaces.find(s => s.slug === urlSpace)?.name ||
      urlSpace
    );
  }

  if (urlSize) {
    return `${urlSize} Products`;
  }

  if (urlMainCat) {
    return isAllPlants ? 'All Indoor Plants' : mainCategoryName;
  }

  // UPDATED DEFAULT TITLE
  return 'All Products';
};

  return (
    <main className="min-h-screen bg-[#FAFAF7] pt-[110px]" style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <Seo
        title={`${getTitle()} | Buy Indoor Plants Online | Rastlina`}
        description={`Browse ${getTitle().toLowerCase()} at Rastlina. Shop ready-to-gift indoor plants with a self-watering pot and soil mix, delivered across India.`}
        path={`${location.pathname}${location.search}`}
        noIndex={Boolean(urlSearch)}
      />
      <div className="shop-catalogue max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#667D00]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#667D00]">Shop</Link>
          {(urlMainCat || urlCat) && <><span>/</span><span className="text-gray-700 font-medium">{urlCat ? categoryName : mainCategoryName}</span></>}
        </nav>

        {/* Header row */}
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A3831]">{getTitle()}</h1>
            <p className="text-sm text-gray-600 mt-1 min-h-5" aria-live="polite">{loading ? 'Loading plants…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <select
              aria-label="Sort products"
              value={ordering}
              onChange={e => {
                setOrdering(e.target.value);
                const p = new URLSearchParams(searchParams);
                p.set('ordering', e.target.value);
                setSearchParams(p);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#667D00] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium bg-white hover:border-[#667D00] transition-colors relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#1A3831] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {(urlSize || urlColor || urlSpace || urlBestDeal || urlNewArrival) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {urlSize && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-[#1A3831]/10 text-[#1A3831] px-3 py-1.5 rounded-full">
                Size: {urlSize}
                <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('size'); setSearchParams(p); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {urlColor && (
              <span className="flex items-center gap-1.5 text-xs font-medium bg-[#1A3831]/10 text-[#1A3831] px-3 py-1.5 rounded-full">
                Color: {urlColor}
                <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('color'); setSearchParams(p); }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">Clear all</button>
          </div>
        )}

        <div className="flex gap-6">
          {/* ── FILTER SIDEBAR (desktop) ── */}
          <>
            {showFilters && filterOptions && (
              <aside
                className="w-64 flex-shrink-0 hidden lg:block motion-safe:animate-in motion-safe:fade-in"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-[90px] shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-800 text-base">Filters</h2>
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
                  </div>

                  <FilterSections
                    filterOptions={filterOptions}
                    localPrice={localPrice} setLocalPrice={setLocalPrice}
                    localSizes={localSizes} setLocalSizes={v => setLocalSizes(localSizes.includes(v) ? [] : [v])}
                    localColors={localColors} setLocalColors={v => setLocalColors(localColors.includes(v) ? [] : [v])}
                    localSpaces={localSpaces} setLocalSpaces={v => setLocalSpaces(localSpaces.includes(v) ? [] : [v])}
                    localPetFriendly={localPetFriendly} setLocalPetFriendly={setLocalPetFriendly}
                    localAirPurifying={localAirPurifying} setLocalAirPurifying={setLocalAirPurifying}
                    activeSection={activeFilterSection} setActiveSection={setActiveFilterSection}
                  />

                  <button onClick={applyFilters}
                    className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white transition"
                    style={{ background: '#1A3831' }}>
                    Apply Filters
                  </button>
                </div>
              </aside>
            )}
          </>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5" role="status" aria-label="Loading plants">
                {Array.from({ length: 8 }, (_, index) => <div key={index} className="rounded-2xl overflow-hidden border border-gray-100 bg-white" aria-hidden="true"><div className="aspect-square bg-[#F0F0E9]" /><div className="h-32" /></div>)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
<p className="font-semibold text-gray-700 text-lg">No plants found</p>
                <button onClick={clearFilters} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#1A3831' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 md:gap-5 ${showFilters ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <>
          {showFilters && filterOptions && (
            <div
              className="lg:hidden fixed inset-0 z-[60] bg-black/40 flex items-end"
              onClick={() => setShowFilters(false)}
            >
              <div
                ref={filterSheetRef} role="dialog" aria-modal="true" aria-label="Plant filters"
                className="mobile-filter-sheet bg-white w-full rounded-t-3xl max-h-[85dvh] overflow-y-auto overscroll-contain motion-safe:animate-in motion-safe:slide-in-from-bottom motion-safe:duration-300"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-800 text-lg">Filters</h2>
                    <button aria-label="Close filters" className="min-w-11 min-h-11 flex items-center justify-center" onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-gray-400" /></button>
                  </div>
                  <FilterSections
                    filterOptions={filterOptions}
                    localPrice={localPrice} setLocalPrice={setLocalPrice}
                    localSizes={localSizes} setLocalSizes={v => setLocalSizes(localSizes.includes(v) ? [] : [v])}
                    localColors={localColors} setLocalColors={v => setLocalColors(localColors.includes(v) ? [] : [v])}
                    localSpaces={localSpaces} setLocalSpaces={v => setLocalSpaces(localSpaces.includes(v) ? [] : [v])}
                    localPetFriendly={localPetFriendly} setLocalPetFriendly={setLocalPetFriendly}
                    localAirPurifying={localAirPurifying} setLocalAirPurifying={setLocalAirPurifying}
                    activeSection={activeFilterSection} setActiveSection={setActiveFilterSection}
                  />
                  <div className="filter-sheet-actions flex gap-3 mt-5">
                    <button onClick={clearFilters} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">Clear</button>
                    <button onClick={applyFilters} className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#1A3831' }}>Apply</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
      
    </main>
  );
}

// ─── Filter Sections Component ────────────────────────────────────────────────
function FilterSection({ title, open, toggle, children }: {
  title: string; open: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={toggle} aria-expanded={open} className="flex items-center justify-between w-full min-h-11 mb-3">
        <span className="text-sm font-bold text-gray-700">{title}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <>
        {open && (
          <div>
            {children}
          </div>
        )}
      </>
    </div>
  );
}

function FilterSections({
  filterOptions, localPrice, setLocalPrice,
  localSizes, setLocalSizes, localColors, setLocalColors,
  localSpaces, setLocalSpaces, localPetFriendly, setLocalPetFriendly,
  localAirPurifying, setLocalAirPurifying, activeSection, setActiveSection,
}: any) {
  const toggleSection = (s: string) => setActiveSection(activeSection === s ? '' : s);
  const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div>
      {/* Price */}
      <FilterSection title="Price Range" open={activeSection === 'price'} toggle={() => toggleSection('price')}>
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>{formatINR(localPrice[0])}</span>
            <span>{formatINR(localPrice[1])}</span>
          </div>
          <input type="range" min={filterOptions.price_range.min} max={filterOptions.price_range.max}
            value={localPrice[1]} onChange={e => setLocalPrice([localPrice[0], Number(e.target.value)])}
            className="w-full accent-[#1A3831]" />
        </div>
      </FilterSection>

      {/* Size */}
      {filterOptions.sizes.length > 0 && (
        <FilterSection title="Size" open={activeSection === 'size'} toggle={() => toggleSection('size')}>
          <div className="flex flex-wrap gap-2">
            {filterOptions.sizes.map((s: any) => (
              <button key={s.id} onClick={() => setLocalSizes(s.name)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${localSizes.includes(s.name) ? 'border-[#1A3831] bg-[#1A3831] text-white' : 'border-gray-200 text-gray-700 hover:border-[#667D00]'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Color */}
      {filterOptions.colors.length > 0 && (
        <FilterSection title="Pot Color" open={activeSection === 'color'} toggle={() => toggleSection('color')}>
          <div className="flex flex-wrap gap-2.5">
            {filterOptions.colors.map((c: any) => (
              <button key={c.id} onClick={() => setLocalColors(c.name)}
                title={c.name}
                className={`relative w-7 h-7 rounded-full border-2 transition-all ${localColors.includes(c.name) ? 'border-[#1A3831] scale-110' : 'border-gray-200 hover:scale-110'}`}
                style={{ background: c.hex_code || '#ddd' }}>
                {localColors.includes(c.name) && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-2 h-2 bg-white rounded-full shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>
          {localColors.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">{localColors.join(', ')}</p>
          )}
        </FilterSection>
      )}

      {/* Space tags */}
      {filterOptions.spaces.length > 0 && (
        <FilterSection title="Space" open={activeSection === 'space'} toggle={() => toggleSection('space')}>
          <div className="space-y-1.5">
            {filterOptions.spaces.map((sp: any) => (
              <label key={sp.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input type="checkbox" checked={localSpaces.includes(sp.slug)} onChange={() => setLocalSpaces(sp.slug)}
                  className="w-4 h-4 rounded accent-[#1A3831]" />
                <span className="text-sm text-gray-700 group-hover:text-[#667D00] font-medium">{sp.name}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Care */}
      {(filterOptions.has_pet_friendly || filterOptions.has_air_purifying) && (
        <FilterSection title="Plant Features" open={activeSection === 'care'} toggle={() => toggleSection('care')}>
          <div className="space-y-2">
            {filterOptions.has_pet_friendly && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={localPetFriendly} onChange={e => setLocalPetFriendly(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1A3831]" />
                <span className="text-sm text-gray-700 font-medium">🐾 Pet Friendly</span>
              </label>
            )}
            {filterOptions.has_air_purifying && (
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={localAirPurifying} onChange={e => setLocalAirPurifying(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#1A3831]" />
                <span className="text-sm text-gray-700 font-medium">💨 Air Purifying</span>
              </label>
            )}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

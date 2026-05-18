// src/pages/Shop.tsx
// Fully API-integrated shop page with dynamic filters from backend
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, X, ChevronDown, Loader2, Search } from 'lucide-react';
import { storeService } from '@/services/api';
import { ProductCard, ApiProduct } from '@/components/products/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterOptions {
  price_range: { min: number; max: number };
  sizes: Array<{ id: number; name: string }>;
  colors: Array<{ id: number; name: string; hex_code: string }>;
  care_levels: string[];
  spaces: Array<{ id: number; name: string; slug: string }>;
  categories: Array<{ id: number; name: string; slug: string; main_category_name?: string }>;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read all active URL filters
  const urlMainCat = searchParams.get('main_category') || '';
  const urlCat = searchParams.get('category') || '';
  const urlSpace = searchParams.get('space') || '';
  const urlSize = searchParams.get('size') || '';
  const urlColor = searchParams.get('color') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlOrdering = searchParams.get('ordering') || '-created_at';
  const urlBestDeal = searchParams.get('is_best_deal') || '';
  const urlNewArrival = searchParams.get('is_new_arrival') || '';
  const urlBestSeller = searchParams.get('is_best_seller') || '';

  // Local filter state (separate from URL so "Apply" commits them)
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
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
    localSizes.length > 0,
    localColors.length > 0,
    localSpaces.length > 0,
    localPetFriendly,
    localAirPurifying,
    localPrice[0] > 0 || (filterOptions && localPrice[1] < filterOptions.price_range.max),
  ].filter(Boolean).length;

  // Fetch filter options whenever main filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    if (urlMainCat) params.main_category = urlMainCat;
    if (urlCat) params.category = urlCat;
    storeService.getFilterOptions(params).then((opts: FilterOptions) => {
      setFilterOptions(opts);
      setLocalPrice([opts.price_range.min, opts.price_range.max]);
    }).catch(() => {});
  }, [urlMainCat, urlCat]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (urlMainCat) params.main_category = urlMainCat;
      if (urlCat) params.category = urlCat;
      if (urlSpace) params.space = urlSpace;
      if (urlSize) params.size = urlSize;
      if (urlColor) params.color = urlColor;
      if (urlSearch) params.search = urlSearch;
      if (urlBestDeal) params.is_best_deal = 'true';
      if (urlNewArrival) params.is_new_arrival = 'true';
      if (urlBestSeller) params.is_best_seller = 'true';
      params.ordering = ordering;

      const data = await storeService.getProducts(params);
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [urlMainCat, urlCat, urlSpace, urlSize, urlColor, urlSearch, urlBestDeal, urlNewArrival, urlBestSeller, ordering]);

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

  // Page title
// Page title
const getTitle = () => {
  if (urlSearch) return `Results for "${urlSearch}"`;

  if (urlBestDeal) return 'Exclusive Offers';

  if (urlNewArrival) return 'New Arrivals';

  if (urlBestSeller) return 'Best Sellers';

  if (urlCat) {
    return products[0]?.category_name || urlCat;
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
    return urlMainCat.charAt(0).toUpperCase() + urlMainCat.slice(1);
  }

  // UPDATED DEFAULT TITLE
  return 'All Products';
};

  const toggle = <T,>(arr: T[], val: T) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  return (
    <div className="min-h-screen bg-[#FAFAF7] pt-[110px]" style={{ fontFamily: "'Lora', Georgia, serif" }}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#667D00]">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#667D00]">Shop</Link>
          {(urlMainCat || urlCat) && <><span>/</span><span className="text-gray-700 font-medium capitalize">{urlCat || urlMainCat}</span></>}
        </nav>

        {/* Header row */}
        <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1A3831]">{getTitle()}</h1>
            {!loading && (
              <p className="text-sm text-gray-400 mt-1">{products.length} product{products.length !== 1 ? 's' : ''}</p>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <select
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
          <AnimatePresence>
            {showFilters && filterOptions && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-64 flex-shrink-0 hidden lg:block"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-[90px] shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-800 text-base">Filters</h2>
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Clear all</button>
                  </div>

                  <FilterSections
                    filterOptions={filterOptions}
                    localPrice={localPrice} setLocalPrice={setLocalPrice}
                    localSizes={localSizes} setLocalSizes={v => setLocalSizes(toggle(localSizes, v))}
                    localColors={localColors} setLocalColors={v => setLocalColors(toggle(localColors, v))}
                    localSpaces={localSpaces} setLocalSpaces={v => setLocalSpaces(toggle(localSpaces, v))}
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
              </motion.aside>
            )}
          </AnimatePresence>

          {/* ── PRODUCT GRID ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#667D00]" />
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
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showFilters && filterOptions && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end"
              onClick={() => setShowFilters(false)}
            >
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-gray-800 text-lg">Filters</h2>
                    <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-gray-400" /></button>
                  </div>
                  <FilterSections
                    filterOptions={filterOptions}
                    localPrice={localPrice} setLocalPrice={setLocalPrice}
                    localSizes={localSizes} setLocalSizes={v => setLocalSizes(toggle(localSizes, v))}
                    localColors={localColors} setLocalColors={v => setLocalColors(toggle(localColors, v))}
                    localSpaces={localSpaces} setLocalSpaces={v => setLocalSpaces(toggle(localSpaces, v))}
                    localPetFriendly={localPetFriendly} setLocalPetFriendly={setLocalPetFriendly}
                    localAirPurifying={localAirPurifying} setLocalAirPurifying={setLocalAirPurifying}
                    activeSection={activeFilterSection} setActiveSection={setActiveFilterSection}
                  />
                  <div className="flex gap-3 mt-5">
                    <button onClick={clearFilters} className="flex-1 py-3 rounded-xl text-sm font-bold border border-gray-200 text-gray-600">Clear</button>
                    <button onClick={applyFilters} className="flex-1 py-3 rounded-xl text-sm font-bold text-white" style={{ background: '#1A3831' }}>Apply</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );
}

// ─── Filter Sections Component ────────────────────────────────────────────────
function FilterSection({ title, open, toggle, children }: {
  title: string; open: boolean; toggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0">
      <button onClick={toggle} className="flex items-center justify-between w-full mb-3">
        <span className="text-sm font-bold text-gray-700">{title}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
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
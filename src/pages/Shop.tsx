import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, Check, Loader2, Leaf, ArrowUpDown, Star, ShoppingBag } from 'lucide-react';
import { products, Product } from '@/data/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

// --- NEW MODERN PRODUCT CARD COMPONENT ---
const ModernProductCard = ({ product, index }: { product: Product; index: number }) => {
  const { addToCart } = useCart();
  const defaultSize = product.sizes[0];
  const defaultColor = product.colors[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 border border-transparent hover:border-gray-100"
    >
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#F8F7F4] rounded-2xl mb-4 block">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.onOffer && (
            <span className="bg-[#BFA275] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              Sale
            </span>
          )}
          {product.discount > 0 && product.originalPrice > product.price && (
            <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              -{product.discount}%
            </span>
          )}
        </div>

        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col px-2 pb-4">
        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="font-serif font-bold text-[17px] text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <Star className="w-3.5 h-3.5 fill-[#BFA275] text-[#BFA275]" />
          <span className="text-[13px] font-bold text-gray-900">{product.rating}</span>
          <span className="text-[12px] text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className="font-extrabold text-lg text-gray-900">
            {formatPrice(defaultSize.price)}
          </span>
          {product.originalPrice > defaultSize.price && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            addToCart(product, defaultSize.label, defaultColor, defaultSize.price);
          }}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-sm py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

// --- WHATSAPP BUTTON ---
const WhatsAppButton = () => {
  const phoneNumber = "919915473575"; 
  const message = "Hi Rastlina! I'm interested in your plants.";
  
  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[60] bg-primary hover:bg-primary/90 text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
};


export default function Shop() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("Price"); 
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // URL Params
  const urlCategory = searchParams.get("cat");
  const urlType = searchParams.get("type");
  const urlCollection = searchParams.get("collection");
  const urlOnOffer = searchParams.get("onOffer");
  const urlSearch = searchParams.get("search");
  const urlSort = searchParams.get("sort");

  // State
  const [allSizes, setAllSizes] = useState<string[]>([]);
  const [allColors, setAllColors] = useState<string[]>([]);
  
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState(urlSort || "featured"); 
  
  const [loading, setLoading] = useState(true);

  const availableTags = [
    { label: 'Air Purifying', value: 'clean-air' },
    { label: 'Pet Friendly', value: 'pet-friendly' },
    { label: 'Good Luck / Vastu', value: 'good-luck' },
    { label: 'Low Maintenance', value: 'easy' },
    { label: 'Flowering', value: 'flowering' }
  ];

  // Logic to determine Title
  const getPageTitle = () => {
    if (urlSearch) return `Search Results for "${urlSearch}"`;
    if (urlOnOffer) return "Exclusive Offers";
    
    if (urlCollection === 'sleep') return "Sleep Better Collection";
    if (urlCollection === 'work') return "Focus & Work Collection";
    if (urlCollection === 'air') return "Breathe Easy Collection";
    if (urlCollection === 'vastu') return "Good Luck & Vastu";
    if (urlCollection === 'self-watering') return "Self-Watering Planters";

    if (urlType === 'pots') return "Planters & Pots";
    if (urlType === 'seeds') return "Organic Seeds";
    if (urlType === 'care') return "Plant Care & Tools";
    if (urlType === 'combo') return "Combos & Bundles";
    
    if (urlCategory) return `${urlCategory.replace('-', ' ')} Plants`;

    if (!urlCategory && !urlType && !urlCollection) {
        if (urlSort === 'rating') return "Best Sellers";
        if (urlSort === 'new') return "Fresh Arrivals";
    }

    return "All Plants";
  };

  // Logic to determine Breadcrumb path
  const getBreadcrumbPath = () => {
    let path = "Home / Shop";
    
    if (urlCategory) path += ` / ${urlCategory.replace('-', ' ')}`;
    else if (urlType) path += ` / ${urlType.replace('-', ' ')}`;
    else if (urlCollection) path += ` / ${urlCollection.replace('-', ' ')}`;
    else if (urlOnOffer) path += ` / offers`;
    else if (urlSearch) path += ` / search`;

    return <nav className="text-xs text-gray-500 mb-2 uppercase tracking-wider capitalize">{path}</nav>;
  };

  useEffect(() => {
    setLoading(true);
    if (urlSort) setSortBy(urlSort);

    setTimeout(() => {
        const sizes = new Set<string>();
        const colors = new Set<string>();
        products.forEach(p => {
            p.sizes.forEach(s => sizes.add(s.label));
            p.colors.forEach(c => colors.add(c));
        });
        setAllSizes(Array.from(sizes));
        setAllColors(Array.from(colors));
        setLoading(false);
    }, 500);
  }, [urlSort]);

  const toggleFilter = (item: string, list: string[], setList: (a: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search
      if (urlSearch) {
        const lower = urlSearch.toLowerCase();
        if (!product.name.toLowerCase().includes(lower) && 
            !product.category.some(c => c.includes(lower)) && 
            !product.description.toLowerCase().includes(lower)) return false;
      }

      // 2. Collections
      if (urlCollection === 'self-watering') {
          if (!product.selfWatering) return false;
      }
      else if (urlCollection) {
         if (urlCollection === 'sleep' && !product.category.includes('bedroom')) return false;
         if (urlCollection === 'work' && !product.category.includes('office')) return false;
         if (urlCollection === 'air' && !product.category.includes('clean-air')) return false;
         if (urlCollection === 'vastu' && !product.category.includes('good-luck')) return false;
      }

      // 3. Other params
      if (urlOnOffer && !product.onOffer) return false;
      if (urlType && product.type !== urlType) return false;
      if (urlCategory && !product.category.includes(urlCategory)) return false;

      // 4. Client Filters
      if (product.price > priceRange[1]) return false;
      if (selectedSizes.length > 0 && !selectedSizes.some(s => product.sizes.map(ps=>ps.label).includes(s))) return false;
      if (selectedColors.length > 0 && !selectedColors.some(c => product.colors.includes(c))) return false;
      if (onlyInStock && !product.inStock) return false;
      if (selectedTags.length > 0) {
         const matchesTag = selectedTags.some(tag => {
            if (tag === 'pet-friendly') return product.petSafe;
            if (tag === 'easy') return product.careLevel === 'Very Easy' || product.careLevel === 'Easy';
            return product.category.includes(tag);
         });
         if (!matchesTag) return false;
      }
      
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "new") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); 
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0; 
    });
  }, [products, priceRange, selectedSizes, selectedColors, selectedTags, onlyInStock, sortBy, urlCategory, urlType, urlOnOffer, urlCollection, urlSearch]);

  const sliderStyle = {
    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(priceRange[1] / 5000) * 100}%, #e5e7eb ${(priceRange[1] / 5000) * 100}%, #e5e7eb 100%)`
  };

  const mobileFilterTabs = ["Price", "Size", "Color", "Tags", "Availability"];

  const renderMobileFilterContent = () => {
    switch (activeFilterTab) {
      case "Price":
        return (
          <div className="p-4">
            <h4 className="font-bold mb-4 text-[color:var(--foreground)]">Max Price: ₹{priceRange[1]}</h4>
            <input type="range" min="0" max="5000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary" style={sliderStyle} />
            <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium"><span>₹0</span><span>₹5000+</span></div>
          </div>
        );
      case "Color": return <div className="p-4 space-y-3">{allColors.map(color => (<label key={color} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary" checked={selectedColors.includes(color)} onChange={() => toggleFilter(color, selectedColors, setSelectedColors)} /><span className="text-gray-700 capitalize">{color}</span></label>))}</div>;
      case "Size": return <div className="p-4 grid grid-cols-2 gap-3">{allSizes.map(size => (<button key={size} onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)} className={`py-2 px-3 text-sm border rounded transition-all ${selectedSizes.includes(size) ? "bg-primary text-white border-primary" : "border-gray-200 text-gray-600"}`}>{size}</button>))}</div>;
      case "Tags": return <div className="p-4 space-y-3">{availableTags.map(tag => (<label key={tag.value} className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary" checked={selectedTags.includes(tag.value)} onChange={() => toggleFilter(tag.value, selectedTags, setSelectedTags)} /><span className="text-gray-700">{tag.label}</span></label>))}</div>;
      case "Availability": return <div className="p-4"><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 border-gray-300 rounded text-primary focus:ring-primary" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} /><span className="text-gray-700">In Stock Only</span></label></div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-[120px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"> 
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-gray-100 pb-6">
          <div>
            {getBreadcrumbPath()}
            <h1 className="text-3xl md:text-4xl font-serif text-primary capitalize">
              {getPageTitle()}
            </h1>
            <p className="text-gray-500 text-sm mt-2">{filteredProducts.length} Products Found</p>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-600 font-medium text-sm">Sort By:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200 text-gray-700"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="new">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filter Strip */}
        <div className="md:hidden sticky top-[80px] z-30 bg-white border-b border-gray-100 py-3 mb-6 -mx-4 px-4 shadow-sm flex items-center justify-between">
            <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)] border border-gray-200 rounded-full px-4 py-1.5 active:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
            <div className="flex items-center relative">
                <ArrowUpDown className="w-3 h-3 text-gray-500 mr-2" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-8 border-none shadow-none bg-transparent p-0 text-sm font-medium justify-end text-gray-700 focus:ring-0"><SelectValue placeholder="Sort by" /></SelectTrigger>
                  <SelectContent align="end"><SelectItem value="featured">Featured</SelectItem><SelectItem value="rating">Top Rated</SelectItem><SelectItem value="price-low">Price: Low</SelectItem><SelectItem value="price-high">Price: High</SelectItem></SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="space-y-8 sticky top-36">
              <div><h3 className="font-bold text-sm text-[color:var(--foreground)] mb-4 uppercase tracking-wider">Price</h3><input type="range" min="0" max="5000" step="100" value={priceRange[1]} onChange={(e) => setPriceRange([0, parseInt(e.target.value)])} className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-primary" style={sliderStyle} /><div className="flex justify-between text-xs text-gray-500 mt-2 font-medium"><span>₹0</span><span>₹{priceRange[1]}</span></div></div>
              <div><h3 className="font-bold text-sm text-[color:var(--foreground)] mb-4 uppercase tracking-wider">Category & Benefits</h3><div className="space-y-2">{availableTags.map(tag => (<label key={tag.value} className="flex items-center space-x-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary" checked={selectedTags.includes(tag.value)} onChange={() => toggleFilter(tag.value, selectedTags, setSelectedTags)} /><span className="text-sm text-gray-600 group-hover:text-primary transition-colors">{tag.label}</span></label>))}</div></div>
              <div><h3 className="font-bold text-sm text-[color:var(--foreground)] mb-4 uppercase tracking-wider">Size</h3><div className="flex flex-wrap gap-2">{allSizes.map(size => (<button key={size} onClick={() => toggleFilter(size, selectedSizes, setSelectedSizes)} className={`px-3 py-1.5 text-xs border rounded transition-all ${selectedSizes.includes(size) ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:border-primary"}`}>{size}</button>))}</div></div>
              <div><h3 className="font-bold text-sm text-[color:var(--foreground)] mb-4 uppercase tracking-wider">Pot Color</h3><div className="space-y-2">{allColors.map(color => (<label key={color} className="flex items-center space-x-3 cursor-pointer group"><div className={`w-5 h-5 rounded-full border border-gray-200 flex items-center justify-center transition-colors ${selectedColors.includes(color) ? 'ring-2 ring-primary ring-offset-1' : ''}`} style={{ backgroundColor: color.toLowerCase() === 'terracotta' ? '#E2725B' : color.toLowerCase() }}>{selectedColors.includes(color) && <Check className={`w-3 h-3 ${color.toLowerCase() === 'white' ? 'text-black' : 'text-white'}`} />}</div><span className="text-sm text-gray-600 group-hover:text-primary capitalize">{color}</span><input type="checkbox" className="hidden" checked={selectedColors.includes(color)} onChange={() => toggleFilter(color, selectedColors, setSelectedColors)} /></label>))}</div></div>
              <div><label className="flex items-center space-x-3 cursor-pointer group"><input type="checkbox" className="w-4 h-4 border-gray-300 rounded text-primary focus:ring-primary" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} /><span className="text-sm font-medium text-gray-700 group-hover:text-primary">In Stock Only</span></label></div>
              <button onClick={() => {setSelectedSizes([]); setSelectedColors([]); setSelectedTags([]); setOnlyInStock(false); setPriceRange([0,5000])}} className="text-xs text-primary underline font-medium hover:text-accent-gold">Clear All Filters</button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? <div className="flex flex-col justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary mb-4" /><p className="text-sm text-gray-500">Loading plants...</p></div> : filteredProducts.length === 0 ? <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200"><Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" /><h3 className="text-lg font-serif mb-2 text-gray-900">No products found</h3><p className="text-gray-500 mb-6">We couldn't find what you were looking for.</p><button onClick={() => {navigate('/shop')}} className="text-primary font-semibold hover:underline">Clear Search</button></div> : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-10">
                {filteredProducts.map((product, i) => (
                  // Using the new modern component here
                  <ModernProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
          <div className="relative bg-white w-[85%] h-full shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-primary font-serif">Filter Plants</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 bg-white rounded-full shadow-sm text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 bg-gray-50 border-r border-gray-100 overflow-y-auto">
                {mobileFilterTabs.map(tab => (<button key={tab} onClick={() => setActiveFilterTab(tab)} className={`w-full text-left px-3 py-4 text-xs font-semibold border-l-4 transition-colors ${activeFilterTab === tab ? "bg-white border-primary text-primary shadow-sm" : "border-transparent text-gray-500 hover:bg-gray-100"}`}>{tab}</button>))}
              </div>
              <div className="w-2/3 bg-white overflow-y-auto">{renderMobileFilterContent()}</div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => {setSelectedSizes([]); setSelectedColors([]); setSelectedTags([]); setOnlyInStock(false); setPriceRange([0,5000])}} className="flex-1 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg border border-gray-200">Reset</button>
              <button onClick={() => setShowFilters(false)} className="flex-1 py-3 text-sm font-semibold text-white bg-primary rounded-lg shadow-md">Apply</button>
            </div>
          </div>
        </div>
      )}
      
      <WhatsAppButton />
    </div>
  );
}
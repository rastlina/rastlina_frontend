// src/components/layout/Header.tsx
// Dynamic navbar — all data from /api/store/navbar/
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Menu, X, ChevronDown, ChevronRight,
  Briefcase, Search, User, Leaf, Tag,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { storeService } from '@/services/api';
import { contentService } from '@/services/api';
// ─── Types ────────────────────────────────────────────────────────────────────
interface NavCategory { id: number; name: string; slug: string; image?: string; }
interface MainCat { id: number; name: string; slug: string; icon: string; order: number; categories: NavCategory[]; }
interface HeroSlide { id: number; image: string; title: string; subtitle: string; link_url: string; }
interface SpaceTag { id: number; name: string; slug: string; icon: string; }
interface SizeOption { id: number; name: string; }
interface NavbarData {
  main_categories: MainCat[];
  hero_slides: HeroSlide[];
  featured_spaces: SpaceTag[];

  plants_sizes: SizeOption[];
  planters_sizes: SizeOption[];
  seeds_sizes: SizeOption[];
}

// ─── Announcement Bar ─────────────────────────────────────────────────────────
interface AnnouncementItem {
  id: number;
  text: string;
  is_active: boolean;
  order: number;
}

interface HomeContentResponse {
  announcement_bars?: AnnouncementItem[];
}

const DEFAULT_OFFERS = [
  '🌿 Free Shipping on orders above ₹1999',
  '✨ Buy 2 Plants @ ₹699 — Use Code: GREEN2',
  '🏺 Flat 20% OFF on Ceramic Planters',
];

const TopBar = () => {
  const [offers, setOffers] = useState<string[]>(DEFAULT_OFFERS);
  const [idx, setIdx] = useState(0);

  // Fetch dynamic announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data: HomeContentResponse =
          await contentService.getHomeContent();

        const backendOffers =
          data?.announcement_bars
            ?.map((item) => item.text)
            ?.filter(Boolean) || [];

        // Replace defaults ONLY if backend has data
        if (backendOffers.length > 0) {
          setOffers(backendOffers);
        }

      } catch (error) {
        console.error('Announcement fetch failed:', error);

        // fallback remains automatically
        setOffers(DEFAULT_OFFERS);
      }
    };

    fetchAnnouncements();
  }, []);

  // Auto rotate
  useEffect(() => {
    if (offers.length <= 1) return;

    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [offers]);

  return (
    <div className="bg-[#1A3831] text-white py-2.5 flex items-center justify-center h-[38px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-xs md:text-sm font-medium tracking-wide text-center px-4"
        >
          {offers[idx]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default TopBar;

// ─── Plants Mega Menu ────────────────────────────────────────────────────────
// ─── Plants Mega Menu ────────────────────────────────────────────────────────
const PlantsMegaMenu = ({
  heroSlides,
  categories,
  spaces,
  sizes,
  closeMenu,
  isScrolled,
}: {
  heroSlides: HeroSlide[];
  categories: NavCategory[];
  spaces: SpaceTag[];
  sizes: SizeOption[];
  closeMenu: () => void;
  isScrolled: boolean;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroSlides.length);
    }, 3000); 
    return () => clearInterval(interval);
  }, [heroSlides]);

  const currentSlide = heroSlides[currentImageIndex];

  return (
    <>
      <div
  className={`fixed inset-0 z-40 bg-transparent transition-all duration-300 ${
    isScrolled ? 'top-[72px]' : 'top-[110px]'
  }`}
  onClick={closeMenu}
/>
      
<motion.div
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
  className={`fixed left-0 w-full z-50 pointer-events-none transition-all duration-300 ${
    isScrolled ? 'top-[72px]' : 'top-[110px]'
  }`}
>
  <div className="container mx-auto px-4 pointer-events-auto">
          <div className="bg-white shadow-2xl border border-gray-100 rounded-b-2xl p-8 grid grid-cols-12 gap-8 w-full max-w-[1400px] mx-auto relative z-50">
            
            {/* LEFT: Hero Banner + Top Picks (col-span-5) */}
            <div className="col-span-5 flex flex-col gap-6">
              {/* Hero Slide */}
              <Link 
                to={currentSlide?.link_url || '/shop?main_category=plants'} 
                onClick={closeMenu} 
                className="rounded-xl overflow-hidden h-28 relative group cursor-pointer block shadow-sm bg-[#1A3831]"
              >
                <AnimatePresence mode="sync">
                  {currentSlide && (
                    <motion.img
                      key={currentImageIndex}
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-center p-6 z-10">
                  <div>
                    {currentSlide?.subtitle && (
                      <p className="text-white/90 text-xs uppercase tracking-widest font-bold mb-1">
                        {currentSlide.subtitle}
                      </p>
                    )}
                    <span className="text-white font-serif font-bold text-xl">
                      {currentSlide?.title || 'Shop All Plants'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Top Picks - Shop by Size */}
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#1A3831] mb-4">Shop by Size</h3>
                <div className="space-y-3">
                  {sizes.map((size, index) => (
                    <Link 
                      key={size.id} 
                      to={`/shop?main_category=plants&size=${size.name}`} 
                      onClick={closeMenu}
                      className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                    >
                     
                      <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">
                        {size.name} Plants
                      </span>
                    </Link>
                  ))}
                  <Link 
                    to="/shop?main_category=plants" 
                    onClick={closeMenu}
                    className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                  >
                    
                    <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">
                      All Plants
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* MIDDLE: Shop by Type (col-span-4) */}
            <div className="col-span-4 border-l border-gray-100 pl-8">
              <h3 className="font-serif font-bold text-2xl text-[#1A3831] mb-6">Shop by Type</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      to={`/shop?category=${cat.slug}`} 
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2.5 text-gray-600 hover:text-[#667D00] group border-b border-transparent hover:border-gray-50 transition-all"
                    >
                      <span className="font-semibold text-[15px]">{cat.name}</span>
                      <ChevronRight className="h-4 w-4 text-[#667D00] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"/>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Shop by Space (col-span-3) */}
            <div className="col-span-3 pl-4">
              <h3 className="font-serif font-bold text-2xl text-[#1A3831] mb-6">Shop by Space</h3>
              <ul className="space-y-2">
                {spaces.map((space) => (
                  <li key={space.id}>
                    <Link 
                      to={`/shop?space=${space.slug}`} 
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2.5 text-gray-600 hover:text-[#667D00] group border-b border-transparent hover:border-gray-50 transition-all"
                    >
                      <span className="font-semibold text-[15px]">{space.name}</span>
                      <ChevronRight className="h-4 w-4 text-[#667D00] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"/>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </motion.div>
    </>
  );
};
// ─── Simple Dropdown ─────────────────────────────────────────────────────────
const SimpleDropdown = ({ categories, mainSlug, closeMenu }: {
  categories: NavCategory[]; mainSlug: string; closeMenu: () => void;
}) => (
  <>
    <div className="fixed inset-0 top-[120px] z-40" onClick={closeMenu} />
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="absolute top-full left-0 w-56 z-50 pt-1"
    >
      <div className="bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden">
        <Link
          to={`/shop?main_category=${mainSlug}`}
          onClick={closeMenu}
          className="block px-4 py-3 text-sm font-bold text-[#1A3831] hover:bg-green-50 border-b border-gray-50 transition-colors"
        >
          View All
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/shop?category=${cat.slug}`}
            onClick={closeMenu}
            className="block px-4 py-3 text-sm font-medium text-gray-700 hover:text-[#667D00] hover:bg-gray-50 transition-colors"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </motion.div>
  </>
);

// ─── Main Header ──────────────────────────────────────────────────────────────
export const Header = () => {
  const [navData, setNavData] = useState<NavbarData | null>(null);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { openCart, totalItems } = useCart();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 10);
  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // Fetch navbar data
  useEffect(() => {
    storeService.getNavbarData().then(setNavData).catch(() => {});
  }, []);
  

  // Fetch sizes for plants megamenu
useEffect(() => {
  storeService.getNavbarData()
    .then((data) => {
      setNavData(data);
    })
    .catch((err) => console.error("Navbar fetch error:", err));
}, []);

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOpen(false);
      setMobileOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const mainCats = navData?.main_categories || [];
  const heroSlides = navData?.hero_slides || [];
  const featuredSpaces = navData?.featured_spaces || [];
const plantSizes = navData?.plants_sizes || [];
  // Plants category = first main category slug 'plants'
  const plantsCat = mainCats.find(c => c.slug === 'plants');
  const plantsCategories = plantsCat?.categories || [];

  // Static extra nav items (Offers, Bulk)
  const extraNavItems = [
    { label: 'Offers', href: '/shop?is_best_deal=true', highlight: true, icon: <Tag className="h-3.5 w-3.5" /> },
    { label: 'Bulk', href: '/bulk', icon: <Briefcase className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white">
      {/* Announcement bar */}
<div
  className={[
    "transition-all duration-300 overflow-hidden",
    isScrolled
      ? "max-h-0 opacity-0 -translate-y-full"
      : "max-h-[38px] opacity-100 translate-y-0"
  ].join(" ")}
>
  <TopBar />
</div>

<header className="bg-white w-full relative border-b border-transparent">
          <div className="container mx-auto px-4 max-w-7xl">

          {/* ── MOBILE ── */}
          <div className="lg:hidden h-[70px] flex items-center justify-between">
            <button className="p-2 -ml-2 text-[#1A3831]" onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false); }}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/logo.png" alt="Rastlina" className="h-10 w-auto object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Link>
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-800" onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileOpen(false); }}>
                <Search className="h-5 w-5" />
              </button>
              <button className="relative p-2 text-[#1A3831]" onClick={openCart}>
                <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FACC15] text-black text-[10px] font-extrabold rounded-full h-4.5 w-4.5 min-w-[18px] h-[18px] flex items-center justify-center shadow-sm px-0.5">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── DESKTOP ── */}
          <div className="hidden lg:flex items-center h-[72px] gap-6">
            <Link to="/" className="flex-shrink-0">
              <img src="/logo.png" alt="Rastlina" className="h-14 w-auto object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </Link>

<nav className="flex items-center gap-1 flex-1 justify-center">
  {/* Keep THIS instance of the Plants menu */}
  {plantsCat && (
    <div className="relative h-full flex items-center">
      <button
        onClick={() => setActiveDropdown(activeDropdown === 'plants' ? null : 'plants')}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all ${
          activeDropdown === 'plants' ? 'bg-green-50 text-[#667D00]' : 'text-gray-900 hover:text-[#667D00] hover:bg-green-50'
        }`}
      >
        <Leaf className="h-4 w-4 text-[#667D00]" fill="currentColor" />
        {plantsCat.name}
        <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${activeDropdown === 'plants' ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {activeDropdown === 'plants' && (
          <PlantsMegaMenu
  heroSlides={heroSlides}
  categories={plantsCategories}
  spaces={featuredSpaces}
  sizes={plantSizes}
  closeMenu={() => setActiveDropdown(null)}
  isScrolled={isScrolled}
/>
        )}
      </AnimatePresence>
    </div>
  )}

              {/* Other main categories — simple dropdown */}
              {mainCats.filter(c => c.slug !== 'plants').map(cat => (
                <div key={cat.id} className="relative h-full flex items-center">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === cat.slug ? null : cat.slug)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-[#667D00] px-3 py-2 rounded-lg hover:bg-green-50 transition-all"
                  >
                    {cat.name}
                    {cat.categories.length > 0 && (
                      <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${activeDropdown === cat.slug ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeDropdown === cat.slug && cat.categories.length > 0 && (
                      <SimpleDropdown categories={cat.categories} mainSlug={cat.slug} closeMenu={() => setActiveDropdown(null)} />
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Extra static items */}
              {extraNavItems.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setActiveDropdown(null)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-all ${
                    item.highlight
                      ? 'font-bold text-[#BFA275] hover:bg-amber-50'
                      : 'font-medium text-gray-900 hover:text-[#667D00] hover:bg-green-50'
                  }`}
                >
                  {item.icon}{item.label}
                </Link>
              ))}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <form onSubmit={handleSearch} className="relative w-52">
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-9 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:border-[#667D00] focus:ring-1 focus:ring-[#667D00] bg-gray-50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#667D00]">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <Link to={user ? '/profile' : '/login'} className="p-2 text-gray-800 hover:text-[#667D00] transition-colors relative">
                <User className="h-6 w-6" />
                {user && (
                  <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#667D00] rounded-full border-2 border-white" />
                )}
              </Link>

              <button className="relative p-2 text-[#1A3831]" onClick={openCart}>
                <ShoppingBag className="h-7 w-7 stroke-[1.5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FACC15] text-black text-[10px] font-extrabold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-sm px-1">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        

        {/* Mobile search bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-4 py-3">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text" placeholder="Search plants, seeds, pots..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#667D00] focus:ring-1 focus:ring-[#667D00] bg-gray-50"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#667D00]">
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="lg:hidden absolute top-[70px] left-0 w-full bg-white border-t border-gray-100 z-40 overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 108px)' }}
            >
              <div className="px-4 py-4 space-y-1 pb-10">
                {/* Profile */}
                <div
                  onClick={() => { navigate(user ? '/profile' : '/login'); setMobileOpen(false); }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#1A3831]/5 mb-4 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#1A3831] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#1A3831] text-sm">{user ? `${user.first_name || 'My Account'}` : 'Login / Sign Up'}</p>
                    <p className="text-xs text-gray-400">{user ? user.email : 'Sign in to your account'}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                {/* Plants with sub-sections */}
                {plantsCat && (
                  <div className="border-b border-gray-100">
                    <div className="flex items-center justify-between py-3" onClick={() => setMobileExpanded(mobileExpanded === 'plants' ? null : 'plants')}>
                      <span className="font-serif text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-[#667D00]" fill="currentColor" /> {plantsCat.name}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${mobileExpanded === 'plants' ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {mobileExpanded === 'plants' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="pb-4 space-y-1 pl-2">
                            
                            {/* By Size */}
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 mb-1">By Size</p>
                            {(plantSizes.length ? plantSizes : [{ id: 0, name: 'Small' }, { id: 1, name: 'Medium' }, { id: 2, name: 'Large' }]).map(s => (
                              <Link key={s.id} to={`/shop?main_category=plants&size=${s.name}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2 text-sm text-gray-700 hover:text-[#667D00] font-medium">{s.name} Plants</Link>
                            ))}
                            {/* By Type */}
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">By Type</p>
                            {plantsCategories.map(cat => (
                              <Link key={cat.id} to={`/shop?category=${cat.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2 text-sm text-gray-700 hover:text-[#667D00] font-medium">{cat.name}</Link>
                            ))}
                            {/* By Space */}
                            {featuredSpaces.length > 0 && (
                              <>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">By Space</p>
                                {featuredSpaces.map(sp => (
                                  <Link key={sp.id} to={`/shop?space=${sp.slug}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2 text-sm text-gray-700 hover:text-[#667D00] font-medium">{sp.name}</Link>
                                ))}

                              </>
                              
                            )}
                            {/* All Plants */}
<Link
  to="/shop?main_category=plants"
  onClick={() => setMobileOpen(false)}
  className="block py-2 text-sm font-semibold text-[#1A3831] hover:text-[#667D00]"
>
  All Plants
</Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Other main categories */}
                {mainCats.filter(c => c.slug !== 'plants').map(cat => (
                  <div key={cat.id} className="border-b border-gray-100">
                    <div className="flex items-center justify-between py-3" onClick={() => setMobileExpanded(mobileExpanded === cat.slug ? null : cat.slug)}>
                      <Link to={`/shop?main_category=${cat.slug}`} onClick={() => setMobileOpen(false)}
                        className="font-serif text-base font-semibold text-gray-900">{cat.name}</Link>
                      {cat.categories.length > 0 && (
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${mobileExpanded === cat.slug ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                    <AnimatePresence>
                      {mobileExpanded === cat.slug && cat.categories.length > 0 && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="pb-4 space-y-1 pl-2">
                            {cat.categories.map(sub => (
                              <Link key={sub.id} to={`/shop?category=${sub.slug}`}
                                onClick={() => setMobileOpen(false)}
                                className="block py-2 text-sm text-gray-700 hover:text-[#667D00] font-medium">{sub.name}</Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Extra items */}
                {extraNavItems.map(item => (
                  <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 py-3 font-serif text-base font-semibold border-b border-gray-100 ${item.highlight ? 'text-[#BFA275]' : 'text-gray-900'}`}>
                    {item.icon}{item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, ChevronDown, ChevronRight, Briefcase, Search, User, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA STRUCTURE ---
const navItems = [
  {
    label: 'Plants',
    type: 'megamenu',
    href: '/shop',
    // Colored Leaf icon to highlight this as the main menu item
    icon: <Leaf className="h-4 w-4 mr-1 text-[#667D00]" fill="currentColor" />,
    items: [
      { label: 'All Plants', href: '/shop' },
      { label: 'Large & Extra Large', href: '/shop?size=large' },
      { label: 'Indoor Plants', href: '/shop?cat=indoor' },
      { label: 'Air Purifying Plants', href: '/shop?cat=air-purifying' },
      { label: 'Flowering Plants', href: '/shop?cat=flowering' },
      { label: 'Pet Friendly Plants', href: '/shop?cat=pet-friendly' },
      { label: 'Living Room Plants', href: '/shop?space=living-room' },
      { label: 'Office Plants', href: '/shop?space=office' },
    ]
  },
  {
    label: 'Planters',
    type: 'dropdown', 
    href: '/shop?type=pots',
    items: [
      { label: 'Ceramic Pots', href: '/shop?type=pots&mat=ceramic' },
      { label: 'Terracotta', href: '/shop?type=pots&mat=terracotta' },
      { label: 'Metal Stands', href: '/shop?type=pots&mat=metal' },
    ]
  },
  {
    label: 'Seeds',
    type: 'dropdown', 
    href: '/shop?type=seeds',
    items: [
      { label: 'Vegetable Seeds', href: '/shop?type=seeds&cat=veg' },
      { label: 'Flower Seeds', href: '/shop?type=seeds&cat=flower' },
      { label: 'Herb Seeds', href: '/shop?type=seeds&cat=herb' },
    ]
  },
  {
    label: 'Care',
    type: 'dropdown',
    href: '/shop?type=care',
    items: [
      { label: 'Fertilizers', href: '/shop?type=care&cat=food' },
      { label: 'Tools', href: '/shop?type=care&cat=tools' },
      { label: 'Soil Mix', href: '/shop?type=care&cat=soil' },
    ]
  },
  {
    label: 'Combos',
    type: 'link',
    href: '/shop?type=combo',
    highlight: 'text-[#BFA275] font-bold'
  },
  {
    label: 'Offers',
    type: 'link',
    href: '/shop?onOffer=true',
    highlight: 'text-[#BFA275] font-bold tracking-wide',
  },
  {
    label: 'Bulk',
    type: 'link',
    href: '/contact',
    icon: <Briefcase className="h-4 w-4 mr-1" />
  }
];

// --- ANNOUNCEMENT BAR ---
const TopBar = () => {
  const offers = [
    "🌿 Free Shipping on orders above ₹1999",
    "✨ Buy 2 Plants @ ₹699 - Use Code: GREEN2",
    "🏺 Flat 20% OFF on Ceramic Planters"
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
 <div className="bg-primary text-white py-2.5 overflow-hidden relative z-50 h-[40px] flex items-center justify-center">
      <div className="container-custom flex justify-center items-center w-full">
        <p className="text-xs md:text-sm font-medium tracking-wide text-white text-center truncate px-4">
            {offers[index]}
        </p>
      </div>
    </div>
  );
};

// --- NEW: PLANTS MEGA MENU COMPONENT ---
const PlantsMegaMenu = ({ closeMenu }: { closeMenu: () => void }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideImages = [
    "https://images.unsplash.com/photo-1604762524889-3e2fcc145683?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597055905063-cb60e334ba99?q=80&w=800&auto=format&fit=crop"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed inset-0 top-[120px] z-40 cursor-default" onClick={closeMenu} />
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute top-[80px] left-0 w-full z-50 cursor-default"
      >
        <div className="container-custom">
          <div className="bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 rounded-b-2xl p-8 grid grid-cols-12 gap-8 w-full max-w-6xl mx-auto relative z-50">
            
            {/* LEFT: Banner & Top Picks (col-span-5) */}
            <div className="col-span-5 flex flex-col gap-6">
              <Link to="/shop?collection=self-watering" onClick={closeMenu} className="rounded-xl overflow-hidden h-28 relative group cursor-pointer block shadow-sm bg-[#1A3831]">
                <AnimatePresence mode="sync">
                  <motion.img
                    key={currentImageIndex}
                    src={slideImages[currentImageIndex]}
                    alt="Featured Collection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-center p-6 z-10">
                  <div>
                    <p className="text-white/90 text-xs uppercase tracking-widest font-bold mb-1">Introducing</p>
                    <span className="text-white font-serif font-bold text-xl">Self Watering Pots</span>
                  </div>
                </div>
              </Link>

              <div>
                <h3 className="font-serif font-bold text-2xl text-[#1A3831] mb-4">Rastlina Top Picks</h3>
                <div className="space-y-3">
                  <Link to="/shop" onClick={closeMenu} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src="https://images.unsplash.com/photo-1597055905063-cb60e334ba99?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="All Plants"/>
                    </div>
                    <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">All Plants</span>
                  </Link>
                  <Link to="/shop?size=large" onClick={closeMenu} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=100&h=100&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Large Plants"/>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-white bg-[#BFA275] px-2 py-0.5 rounded-md w-fit mb-1">New</span>
                      <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">Large & Extra-Large</span>
                    </div>
                  </Link>
                  <Link to="/shop?size=medium" onClick={closeMenu} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&h=100&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Medium Plants"/>
                    </div>
                    <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">Medium Plants</span>
                  </Link>
                  <Link to="/shop?size=small" onClick={closeMenu} className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                    <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=100&h=100&fit=crop" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Small Plants"/>
                    </div>
                    <span className="font-bold text-gray-800 group-hover:text-[#667D00] transition-colors text-base">Small Plants</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* MIDDLE: Shop by Type (col-span-4) */}
            <div className="col-span-4 border-l border-gray-100 pl-8">
              <h3 className="font-serif font-bold text-2xl text-[#1A3831] mb-6">Shop by Type</h3>
              <ul className="space-y-2">
                {[
                  { label: 'All Plants', href: '/shop' },
                  { label: 'Indoor Plants', href: '/shop?cat=indoor' },
                  { label: 'Air Purifying Plants', href: '/shop?cat=air-purifying' },
                  { label: 'Flowering Plants', href: '/shop?cat=flowering' },
                  { label: 'Pet Friendly Plants', href: '/shop?cat=pet-friendly' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href} 
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2.5 text-gray-600 hover:text-[#667D00] group border-b border-transparent hover:border-gray-50 transition-all"
                    >
                      <span className="font-semibold text-[15px]">{link.label}</span>
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
                {[
                  { label: 'Living Room', href: '/shop?space=living-room' },
                  { label: 'Office Desk', href: '/shop?space=office' },
                  { label: 'Bedroom', href: '/shop?space=bedroom' },
                  { label: 'Balcony / Outdoor', href: '/shop?space=balcony' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.href} 
                      onClick={closeMenu}
                      className="flex items-center justify-between py-2.5 text-gray-600 hover:text-[#667D00] group border-b border-transparent hover:border-gray-50 transition-all"
                    >
                      <span className="font-semibold text-[15px]">{link.label}</span>
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


export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { openCart, totalItems } = useCart();

  // === FIX: SCROLL TRACKING STATE ===
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hide TopBar if scrolled more than 30px down
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // ===================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMobileSearchOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMenuClick = (label: string, type: string, href: string) => {
    if (type === 'megamenu' || type === 'dropdown') {
      setActiveDropdown(activeDropdown === label ? null : label);
    } else {
      setActiveDropdown(null);
      navigate(href);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 shadow-sm">
      
      {/* === FIX: WRAPPER TO HIDE TOPBAR ON SCROLL === */}
      <div 
        className={`transition-all duration-300 overflow-hidden ${
          isScrolled ? 'h-0 opacity-0' : 'h-[40px] opacity-100'
        }`}
      >
        <TopBar />
      </div>
      {/* ============================================= */}

      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300 w-full relative">
        <div className="container-custom">
          
          {/* =========================================
              MOBILE HEADER (Compact)
             ========================================= */}
          <div className="lg:hidden h-20 relative flex items-center justify-between px-2">
            
            {/* Left: Menu Button */}
            <div className="flex items-center w-1/4">
              <button 
                className="p-2 -ml-2 text-[#1A3831]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-2/4">
                <img 
                  src="/logo.png" 
                  alt="Rasilina" 
                  className="h-10 w-auto object-contain" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center justify-end gap-1 w-1/4">
              <button 
                className="p-2 text-gray-900 hover:text-[#667D00] transition-colors"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              >
                <Search className="h-6 w-6" />
              </button>
              
              <Button variant="ghost" size="icon" onClick={openCart} className="hover:bg-transparent p-0 relative h-10 w-10">
                <div className="relative text-[#1A3831] flex items-center justify-center">
                  <ShoppingBag className="!h-7 !w-7 stroke-[1.5]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FACC15] text-black text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Button>
            </div>
          </div>

          {/* =========================================
              DESKTOP HEADER (Full)
             ========================================= */}
          <div className="hidden lg:flex items-center justify-between h-20 gap-4">
            <Link to="/" className="flex items-center flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Rasilina" 
                  className="h-16 w-auto object-contain" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
            </Link>

            <nav className="flex items-center gap-6 xl:gap-8 justify-center flex-1 px-4">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group h-full flex items-center"
                >
                  <button
                    onClick={() => handleMenuClick(item.label, item.type, item.href)}
                    className={`flex items-center gap-1 text-sm xl:text-base transition-colors py-8 outline-none ${
                      item.highlight 
                        ? item.highlight 
                        : 'text-gray-900 hover:text-[#667D00] font-medium'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {(item.type === 'dropdown' || item.type === 'megamenu') && (
                      <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Dropdown Render Logic */}
                  <AnimatePresence>
                    {activeDropdown === item.label && item.type === 'dropdown' && item.items && (
                      <>
                        <div className="fixed inset-0 top-[120px] z-40 cursor-default" onClick={() => setActiveDropdown(null)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 pt-0 w-56 z-50"
                        >
                          <div className="bg-white shadow-xl border border-gray-100 p-2 rounded-b-lg relative z-50">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                to={subItem.href}
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-3 text-sm font-medium text-gray-900 hover:text-[#667D00] hover:bg-gray-50 transition-colors rounded-md"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-4 flex-shrink-0">
              <form onSubmit={handleSearch} className="relative w-48 xl:w-64">
                <input 
                  type="text" 
                  placeholder="Search plants..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-[#667D00] focus:ring-1 focus:ring-[#667D00] bg-gray-50/50"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#667D00] transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </form>

              <Link to="/profile" className="text-gray-900 hover:text-[#667D00] transition-colors p-1">
                <User className="h-7 w-7" />
              </Link>

              {/* Redesigned Large Cart Icon - Desktop */}
              <Button variant="ghost" size="icon" onClick={openCart} className="hover:bg-transparent p-0 relative h-12 w-12 ml-1">
                <div className="relative text-[#1A3831] flex items-center justify-center">
                  <ShoppingBag className="!h-8 !w-8 stroke-[1.5]" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FACC15] text-black text-[11px] font-extrabold rounded-full h-[22px] w-[22px] flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* --- RENDER MEGA MENU OUTSIDE THE NAV SO IT SPANS WIDE --- */}
        <AnimatePresence>
          {activeDropdown === 'Plants' && (
            <PlantsMegaMenu closeMenu={() => setActiveDropdown(null)} />
          )}
        </AnimatePresence>

        {/* MOBILE SEARCH BAR */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="container-custom py-4">
                <form onSubmit={handleSearch} className="relative">
                  <input 
                    type="text" 
                    placeholder="Search plants, seeds, pots..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-200 text-base focus:outline-none focus:border-[#667D00] focus:ring-1 focus:ring-[#667D00] bg-gray-50"
                    autoFocus
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#667D00]">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MOBILE MENU DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="lg:hidden bg-white absolute top-20 left-0 w-full h-[calc(100vh-5rem)] z-40 border-t border-gray-200 overflow-y-auto pb-32"
            >
              <div className="container-custom py-4">
                
                <div 
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-[#1A3831]/5 rounded-xl p-4 mb-6 flex items-center gap-4 cursor-pointer active:bg-[#1A3831]/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-[#1A3831] text-[#BFA275] rounded-full flex items-center justify-center shadow-sm">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A3831] text-base">My Account</h3>
                    <p className="text-xs text-gray-500">Login / Sign Up</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <div key={item.label} className="border-b border-gray-100 last:border-0">
                      <div 
                        className="flex items-center justify-between py-4"
                        onClick={() => {
                          if (item.type === 'dropdown' || item.type === 'megamenu') {
                            setMobileExpanded(mobileExpanded === item.label ? null : item.label);
                          } else {
                            setMobileMenuOpen(false);
                          }
                        }}
                      >
                        <Link 
                          to={item.href}
                          className={`text-lg font-serif font-medium flex items-center gap-2 ${
                              item.highlight ? item.highlight : 'text-gray-900'
                          }`}
                        >
                          {item.icon} {item.label}
                        </Link>
                        {(item.type === 'dropdown' || item.type === 'megamenu') && (
                          <ChevronDown className={`h-5 w-5 transition-transform ${mobileExpanded === item.label ? 'rotate-180' : ''}`} />
                        )}
                      </div>

                      <AnimatePresence>
                        {(item.type === 'dropdown' || item.type === 'megamenu') && mobileExpanded === item.label && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-gray-50 -mx-4 px-8"
                          >
                            <div className="py-2 flex flex-col gap-3 pb-6">
                              {item.items?.map((subItem) => (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="text-base text-[#1A3831] hover:text-[#667D00] py-1.5 font-medium"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
};
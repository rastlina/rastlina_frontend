import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, Droplets, Sun, Thermometer, Ruler, PawPrint, Check, 
  Truck, ShieldCheck, BookOpen, Plus, Minus, HelpCircle,
  Leaf, Palette, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getProductBySlug, formatPrice, products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/products/ProductCard';

// Static FAQs for all products
const FAQS = [
  {
    question: "How do you ensure the plant arrives safely?",
    answer: "We use specially designed, eco-friendly packaging that keeps the plant secure, retains moisture, and provides airflow during transit."
  },
  {
    question: "What if my plant arrives damaged?",
    answer: "We have a 30-day survival guarantee. If your plant arrives damaged or struggles within the first 30 days, we will guide you back to health or replace it for free."
  },
  {
    question: "Do you provide care instructions?",
    answer: "Yes! Every plant comes with a detailed physical care card, and you can always refer to the 'Care Guide' tab on this page."
  },
  {
    question: "Are the self-watering pots easy to use?",
    answer: "Extremely easy. You just fill the bottom reservoir once a week, and the capillary wick draws up exactly the amount of water the plant needs."
  }
];

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const product = getProductBySlug(slug || '');
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState(product?.sizes[1] || product?.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [activeTab, setActiveTab] = useState<'care' | 'included' | 'reviews'>('care');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Local Storage Logic for Recently Viewed
  useEffect(() => {
    if (product && product.slug) {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updatedSlugs = [product.slug, ...stored.filter((s: string) => s !== product.slug)].slice(0, 4);
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedSlugs));
      
      const recentProducts = updatedSlugs
        .filter((s) => s !== product.slug)
        .map((s) => getProductBySlug(s))
        .filter(Boolean);
        
      setRecentlyViewed(recentProducts);
    }
  }, [product?.slug]);

  if (!product) {
    return (
      <div className="container-custom py-32 text-center">
        <h1 className="text-2xl font-serif font-extrabold text-gray-900">Product not found</h1>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize.label, selectedColor, selectedSize.price);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Rastlina!`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Get recommended products (same category, excluding current product)
  const recommendedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const displayRecommendations = recommendedProducts.length > 0 
    ? recommendedProducts 
    : products.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <main className="bg-background pt-[120px] pb-32 relative">
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <p className="text-sm text-muted-foreground font-medium">
          Home / Shop / <span className="text-gray-900 font-bold">{product.name}</span>
        </p>
      </div>

      {/* Product Section */}
      <section className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
          
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4 sticky top-36">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info - Sticky Desktop right column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6 lg:sticky lg:top-36 lg:self-start w-full"
          >
            <div>
              {/* Bold & Dark Name + Share Button */}
              <div className="flex justify-between items-start gap-4 mb-2">
                <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-gray-900 tracking-tight">
                  {product.name}
                </h1>
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0 mt-1"
                  aria-label="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 text-gray-900">
                  <Star className="h-5 w-5 fill-accent-gold text-accent-gold" />
                  <span className="font-extrabold">{product.rating}</span>
                </div>
                <span className="text-gray-600 font-medium">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Bold Price & Estimated Delivery */}
            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-gray-900">
                  {formatPrice(selectedSize?.price || product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through font-bold">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="bg-primary/10 text-primary font-extrabold px-3 py-1 rounded-full text-sm">
                      Save {product.discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Estimated Delivery Block */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                  <Truck className="h-5 w-5 text-primary" />
                  <h4>Estimated Delivery</h4>
                </div>
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-600">Within Telangana:</span>
                  <span className="text-gray-900 font-extrabold">3 - 5 days</span>
                  <span className="text-gray-600">Other States:</span>
                  <span className="text-gray-900 font-extrabold">5 - 7 days</span>
                </div>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-extrabold text-gray-900 mb-3 text-lg">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-3 rounded-xl border-2 transition-all ${
                      selectedSize?.label === size.label
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    <span className={`block text-sm font-extrabold ${selectedSize?.label === size.label ? 'text-white' : 'text-gray-900'}`}>
                      {size.label}
                    </span>
                    <span className={`block text-xs font-bold mt-1 ${selectedSize?.label === size.label ? 'text-gray-300' : 'text-gray-500'}`}>
                      {formatPrice(size.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-extrabold text-gray-900 mb-3 text-lg">Select Pot Color</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-5 py-2.5 rounded-xl border-2 font-bold transition-all ${
                      selectedColor === color
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-900'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-muted border-y border-gray-200">
        <div className="container-custom py-12">
          {/* Tab Headers */}
          <div className="flex gap-6 mb-8 border-b border-gray-300 overflow-x-auto no-scrollbar">
            {[
              { id: 'care', label: 'Care Guide' },
              { id: 'included', label: "What's Included" },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-2 font-extrabold whitespace-nowrap transition-colors border-b-4 -mb-[2px] ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'care' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {[
                { icon: Droplets, label: 'Watering', value: product.waterFrequency },
                { icon: Sun, label: 'Light', value: product.light },
                { icon: Thermometer, label: 'Temperature', value: '18-25°C' },
                { icon: Ruler, label: 'Growth', value: 'Moderate' },
                { icon: PawPrint, label: 'Pet Safe', value: product.petSafe ? 'Yes' : 'No' },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                  <div className="bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="font-extrabold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'included' && (
            <div className="max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <ul className="space-y-4">
                {[
                  `${product.name} plant`,
                  'Self-watering ceramic pot',
                  'Premium potting mix',
                  'Care instruction card',
                  '30-day survival guarantee',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="bg-primary/10 p-1 rounded-full"><Check className="h-4 w-4 text-primary" /></div>
                    <span className="font-bold text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-3xl">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-extrabold text-gray-500">
                        PS
                      </div>
                      <div>
                        <span className="font-extrabold text-gray-900 block">Priya S.</span>
                        <div className="flex text-accent-gold mt-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-400">2 weeks ago</span>
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    Absolutely love my new {product.name}! It arrived in perfect condition and the self-watering pot is a game changer. Already seeing new growth! Highly recommended.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-extrabold text-gray-900">Why Choose Rastlina?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <Droplets className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-extrabold text-gray-900 mb-2">Self Watering</h3>
              <p className="text-sm text-gray-600 font-medium">Designed for ease and elegance.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <Palette className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-extrabold text-gray-900 mb-2">Aesthetic Designs</h3>
              <p className="text-sm text-gray-600 font-medium">Stylish planters to match interiors.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-extrabold text-gray-900 mb-2">Innovative Care</h3>
              <p className="text-sm text-gray-600 font-medium">Expert tips and growing support.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <Leaf className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-extrabold text-gray-900 mb-2">Healthy Plants</h3>
              <p className="text-sm text-gray-600 font-medium">Handpicked and nurtured.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products Section */}
      <section className="py-16 bg-muted border-t border-gray-200">
        <div className="container-custom">
          <h2 className="text-3xl font-serif font-extrabold text-gray-900 mb-8 text-center md:text-left">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {displayRecommendations.map((item, i) => (
              <ProductCard key={item.id} product={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="container-custom">
            <h2 className="text-3xl font-serif font-extrabold text-gray-900 mb-8 text-center md:text-left">Recently Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {recentlyViewed.map((item, i) => (
                <ProductCard key={item.id} product={item} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      <section className="py-16 bg-muted border-t border-gray-200">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10 flex flex-col items-center">
            <HelpCircle className="h-10 w-10 text-primary mb-3" />
            <h2 className="text-3xl font-serif font-extrabold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left"
                >
                  <span className="font-extrabold text-gray-900 text-lg">{faq.question}</span>
                  {openFaq === index ? (
                    <Minus className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-0 text-gray-600 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FIXED BOTTOM BAR - Aligned content as requested */}
      <div className="fixed bottom-0 left-0 w-full bg-[#f4f2ec] border-t border-gray-300 py-4 px-4 md:px-8 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.08)]">
        <div className="container-custom flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-serif font-extrabold text-gray-900 text-xl lg:text-3xl truncate max-w-[200px] md:max-w-xl lg:max-w-3xl">
              {product.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 pr-2 md:pr-8">
            <Button 
              onClick={handleAddToCart} 
              className="font-extrabold bg-[#1A3831] hover:bg-[#112520] text-white rounded-full shadow-lg px-8 lg:px-16 py-6 text-sm lg:text-lg uppercase tracking-wider transition-transform active:scale-95"
            >
              ADD TO BASKET
            </Button>
          </div>
        </div>
      </div>

    </main>
  );
};

export default ProductDetail;
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronDown, Loader2, MapPin, Truck, ShieldCheck, 
  CheckSquare, Square, CreditCard, Info, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext'; // Adjust path if needed

// --- WHATSAPP BUTTON ---
const WhatsAppButton = () => {
  const phoneNumber = "919915473575"; 
  const message = "Hi Rastlina! I'm interested in your plants.";
  
  return (
    <a 
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-white p-3.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    </a>
  );
};

const INDIAN_STATES = [
  { code: 'AP', name: 'Andhra Pradesh' }, { code: 'AR', name: 'Arunachal Pradesh' },
  { code: 'AS', name: 'Assam' }, { code: 'BR', name: 'Bihar' },
  { code: 'CG', name: 'Chhattisgarh' }, { code: 'GA', name: 'Goa' },
  { code: 'GJ', name: 'Gujarat' }, { code: 'HR', name: 'Haryana' },
  { code: 'HP', name: 'Himachal Pradesh' }, { code: 'JH', name: 'Jharkhand' },
  { code: 'KA', name: 'Karnataka' }, { code: 'KL', name: 'Kerala' },
  { code: 'MP', name: 'Madhya Pradesh' }, { code: 'MH', name: 'Maharashtra' },
  { code: 'DL', name: 'Delhi' }, { code: 'TG', name: 'Telangana' },
  // ... add others as needed
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Simple Input Component for the form to keep it clean
const FormInput = ({ className = '', error, ...props }: any) => (
  <input
    {...props}
    className={`w-full h-12 px-4 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
      error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
    } ${className}`}
  />
);

const CheckoutPage = () => {
  // FIX: Renamed 'items' to 'cartItems' during destructuring to fix the TypeScript error
  const { items: cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  
  const [config] = useState({
    shipping_fee: 99,
    free_shipping_threshold: 1999,
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '', 
    lastName: '', 
    phone: '',
    street: '', 
    landmark: '',
    city: '', 
    state: '',
    pincode: '', 
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [hasAttemptedPay, setHasAttemptedPay] = useState(false);

  // Totals Calculation
  const totals = useMemo(() => {
    const sub = Number(subtotal) || 0;
    const shipping = sub >= config.free_shipping_threshold || sub === 0 ? 0 : Number(config.shipping_fee);
    const discount = appliedCoupon ? Number(appliedCoupon.discount) : 0;
    const finalTotal = sub + shipping - discount;
    return { sub, shipping, discount, finalTotal };
  }, [subtotal, config, appliedCoupon]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    const mandatoryFields = ['email', 'firstName', 'lastName', 'street', 'city', 'state', 'pincode', 'phone'];

    mandatoryFields.forEach(field => {
      if (!formData[field as keyof typeof formData]?.trim()) {
        newErrors[field] = true;
      }
    });

    const phoneRegex = /^[0-9]{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) newErrors.phone = true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) newErrors.email = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidatingCoupon(true);
    // Mock API Call
    setTimeout(() => {
      if (couponCode === "PLANTLOVE") {
        setAppliedCoupon({ discount: 200, message: "₹200 Off Applied!" });
      } else {
        setAppliedCoupon(null);
      }
      setIsValidatingCoupon(false);
    }, 800);
  };

  const handlePayment = async () => {
    setHasAttemptedPay(true);
    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);
    
    // Simulate Payment Processing for Prototype
    setTimeout(() => {
      setIsProcessing(false);
      // Removed navigation and cart clearing so nothing happens on click
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] pt-[120px] pb-20">
      <main className="container-custom max-w-6xl">
        
        {/* Header Area */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-900 tracking-tight">Checkout</h1>
          <p className="text-gray-500 mt-2 font-medium">Complete your order securely below.</p>
        </div>
        
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN - FORM */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Contact / Guest Checkout Section */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" /> Contact Details
                </h2>
                <div className="text-sm font-medium text-gray-500">
                  Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Log in</Link>
                </div>
              </div>
              
              <div className="space-y-4">
                <FormInput 
                  type="email" 
                  placeholder="Email Address *" 
                  value={formData.email}
                  onChange={(e: any) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
                
                {/* Guest Checkout Opt-in */}
                <div 
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => setCreateAccount(!createAccount)}
                >
                  <div className="mt-0.5">
                    {createAccount ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} className="text-gray-300 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-800">Create an account for faster checkout next time</span>
                    <p className="text-xs text-gray-500 mt-0.5">We'll use your email to create a secure Rastlina account.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Details Section */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-primary" /> Delivery Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput 
                  placeholder="First Name *" 
                  value={formData.firstName}
                  onChange={(e: any) => handleInputChange('firstName', e.target.value)}
                  error={errors.firstName}
                />
                <FormInput 
                  placeholder="Last Name *" 
                  value={formData.lastName}
                  onChange={(e: any) => handleInputChange('lastName', e.target.value)}
                  error={errors.lastName}
                />
                
                <FormInput 
                  className="md:col-span-2" 
                  placeholder="Street Address / House No. *" 
                  value={formData.street}
                  onChange={(e: any) => handleInputChange('street', e.target.value)}
                  error={errors.street}
                />
                
                <FormInput 
                  className="md:col-span-2" 
                  placeholder="Apartment, suite, landmark, etc. (Optional)" 
                  value={formData.landmark}
                  onChange={(e: any) => handleInputChange('landmark', e.target.value)}
                />
                
                <FormInput 
                  placeholder="City *" 
                  value={formData.city}
                  onChange={(e: any) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                />

                <div className="relative">
                  <select
                    className={`w-full h-12 px-4 rounded-xl border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none ${
                      errors.state ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary'
                    }`}
                    value={formData.state}
                    onChange={(e: any) => handleInputChange('state', e.target.value)}
                  >
                    <option value="">Select State *</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.code}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                </div>
                
                <FormInput 
                  placeholder="PIN Code *" 
                  value={formData.pincode}
                  onChange={(e: any) => handleInputChange('pincode', e.target.value)}
                  error={errors.pincode}
                  maxLength={6}
                />
                
                <FormInput 
                  placeholder="Mobile Number *" 
                  value={formData.phone}
                  onChange={(e: any) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  maxLength={10}
                />
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 sticky top-36 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Order Summary</h3>
              
              {/* Items List (Preview) */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.length > 0 ? cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 relative">
                      {/* FIX: Used item.product.image */}
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      {/* FIX: Used item.product.name */}
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">{item.selectedSize} {item.selectedColor && `| ${item.selectedColor}`}</p>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-gray-500 text-sm">Your cart is empty.</div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pt-6 border-t border-gray-100">
                <div className="flex gap-2">
                  <input 
                    placeholder="Gift card or discount code" 
                    className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-primary"
                    value={couponCode} 
                    onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                  />
                  <Button 
                    onClick={handleApplyCoupon} 
                    disabled={isValidatingCoupon || !couponCode} 
                    className="bg-gray-900 hover:bg-gray-800 text-white h-12 px-6 rounded-xl font-bold transition-all"
                  >
                    {isValidatingCoupon ? <Loader2 className="animate-spin h-4 w-4" /> : "Apply"}
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="mt-3 text-sm font-bold text-primary flex items-center gap-1.5">
                    <ShieldCheck size={16}/> {appliedCoupon.message}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">{formatPrice(totals.sub)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">Shipping</span>
                  {totals.shipping === 0 ? (
                    <span className="text-primary font-bold">Free</span>
                  ) : (
                    <span className="text-gray-900 font-bold">{formatPrice(totals.shipping)}</span>
                  )}
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(totals.discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4 mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-extrabold text-primary">{formatPrice(totals.finalTotal)}</span>
                </div>
              </div>

              {/* Policy Note */}
              <div className="mb-6 p-4 bg-[#F8F7F4] border border-[#E5E0D8] rounded-xl flex items-start gap-3">
                <Info className="text-[#73592F] h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-gray-700">
                  By completing your order, you agree to our <Link to="/terms" className="underline font-bold">Terms</Link> and <Link to="/privacy" className="underline font-bold">Privacy Policy</Link>. 
                  <span className="block mt-1 font-bold text-primary">🌿 30-Day Plant Survival Guarantee included.</span>
                </p>
              </div>

              {/* Checkout Button */}
              <Button 
                onClick={handlePayment} 
                disabled={isProcessing || cartItems.length === 0} 
                className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-extrabold text-base shadow-[0_8px_20px_rgba(29,29,0,0.2)] active:scale-[0.98] transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Processing...</span>
                ) : (
                  <span className="flex items-center gap-2"><CreditCard size={20} /> Pay {formatPrice(totals.finalTotal)}</span>
                )}
              </Button>
              
              <div className="mt-6 text-center flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={14} />
                <span className="text-[11px] font-bold tracking-widest uppercase">
                  Secure Encrypted Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  );
};

export default CheckoutPage;
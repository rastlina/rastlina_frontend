
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop"; 
import WhatsAppButton from "./components/home/WhatsAppButton";
import Index from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import WatchAndShopDetail from '@/pages/WatchAndShopDetail';
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact'; // Imported Contact Page
import LoginPage from './pages/LoginPage';
import BlogDetail from '@/pages/BlogDetail';
import CheckoutPage from '@/pages/CheckoutPage';
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import ReturnsRefundPolicyPage from './pages/ReturnsRefundPage';
import ReplacementPolicyPage from "./pages/ReplacementPolicyPage";


const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <AuthProvider>   {/* ✅ ADD THIS */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />

              <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1">
                  <Routes>
                    
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:category" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms-and-conditions" element={<TermsPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/returns-refund-policy" element={<ReturnsRefundPolicyPage />} />
                    <Route path="/replacement-policy" element={<ReplacementPolicyPage />} />
                     <Route path="/watch-shop/:slug" element={<WatchAndShopDetail />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/bulk" element={<Contact />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Footer />
                <CartDrawer />
                <WhatsAppButton />
              </div>

            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>   {/* ✅ END */}
  </GoogleOAuthProvider>
);

export default App;
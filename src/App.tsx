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
import Shop from "./pages/Shop";
import NotFound from "./pages/NotFound";
import UserProfile from './pages/UserProfile';
import Contact from './pages/Contact'; // Imported Contact Page

import CheckoutPage from '@/pages/CheckoutPage';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* ScrollToTop ensures page starts at top on navigation */}
          <ScrollToTop />
          
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:category" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                
                {/* --- Main Functional Routes --- */}
                <Route path="/profile" element={<UserProfile />} />
                
                {/* THIS IS THE KEY FIX: Linking /contact to the Contact page */}
                <Route path="/contact" element={<Contact />} />

                {/* --- Placeholder / Information Routes --- */}
                {/* Note: Removed duplicate /contact route that pointed to Index */}
                <Route path="/about" element={<Index />} />
                <Route path="/shipping" element={<Index />} />
                <Route path="/returns" element={<Index />} />
                <Route path="/faqs" element={<Index />} />
                <Route path="/quiz" element={<Index />} />
                <Route path="/learn" element={<Index />} />
                <Route path="/gift" element={<Shop />} />
                
                <Route path="/checkout" element={<CheckoutPage />} />
                {/* 404 Route - Always last */}
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
);

export default App;
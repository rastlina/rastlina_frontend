import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop"; 
import WhatsAppButton from "./components/home/WhatsAppButton";
import { RouteSeo } from '@/components/seo/RouteSeo';
import Index from "./pages/Home";
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const WatchAndShopDetail = lazy(() => import('./pages/WatchAndShopDetail'));
const Shop = lazy(() => import('./pages/Shop'));
const NotFound = lazy(() => import('./pages/NotFound'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Contact = lazy(() => import('./pages/Contact'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnsRefundPolicyPage = lazy(() => import('./pages/ReturnsRefundPage'));
const ReplacementPolicyPage = lazy(() => import('./pages/ReplacementPolicyPage'));

const queryClient = new QueryClient();

function RouteBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  // The eager homepage must hydrate as one tree before provider effects update.
  // Lazy routes still retain their normal loading boundary.
  return pathname === '/' ? <>{children}</> :
    <Suspense fallback={<div className="min-h-[60vh] pt-36 text-center" role="status">Loading Rastlina…</div>}>{children}</Suspense>;
}
const META_PIXEL_ID = '1051662191229917';

type MetaPixel = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
};

type MetaPixelWindow = Window & {
  fbq?: MetaPixel;
  _fbq?: MetaPixel;
};

const App = ({ Router = BrowserRouter }: { Router?: ComponentType<{ children: ReactNode }> }) => {
  useEffect(() => {
    const pixelWindow = window as MetaPixelWindow;
    if (pixelWindow.fbq) return;

    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    } as MetaPixel;
    fbq.queue = [];
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    pixelWindow.fbq = fbq;
    pixelWindow._fbq = fbq;

    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
    // Queue events immediately, but do not compete with first-screen resources.
    const loadPixel = () => {
      const appendScript = () => {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      };
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(appendScript, { timeout: 2000 });
      } else {
        globalThis.setTimeout(appendScript, 0);
      }
    };
    if (document.readyState === 'complete') loadPixel();
    else window.addEventListener('load', loadPixel, { once: true });
  }, []);

  return (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <Router>
                <RouteSeo />
                <ScrollToTop />
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <div className="flex-1">
                    <RouteBoundary>
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
                    </RouteBoundary>
                  </div>
                  <Footer />
                  <CartDrawer />
                  <WhatsAppButton />
                </div>
              </Router>
            </CartProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
  );
};

export default App;

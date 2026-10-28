// src/contexts/CartContext.tsx
import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useMemo, useRef,
} from 'react';
import { toast } from 'sonner';
import {
  calculateCartTotals,
  type CartTotals,
  type AppliedCoupon,
  calculateRemainingForFreeShipping,
  calculateRemainingForCoupon,
  calculateFreeShippingProgress,
  clampQuantity,
} from '@/utils/cartCalculations';
import { storeService } from '@/services/api';
import { bestAutomaticCoupon, isAutomaticCoupon, normalizeCoupon, normalizeCouponCode, validatedCoupon } from '@/utils/couponPolicy';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: {
    id: number;
    name: string;
    slug: string;
    images?: Array<{ image: string; is_primary: boolean; color_id?: number | null }>;
    original_price?: number | string | null;
  };
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  selectedColorHex: string;
  price: number;
  originalPrice: number;
  stock: number;
  variantId: number | null;
}

// A coupon fetched from the backend (not yet applied — just known)
export interface AvailableCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_value: number;
  auto_apply?: boolean;
}

interface SiteConfig {
  free_shipping_threshold: number;
  shipping_fee: number;
  tax_percentage: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: AppliedCoupon | null;
  siteConfig: SiteConfig;
  availableCoupons: AvailableCoupon[];

  totals: CartTotals;
  totalItems: number;
  freeShippingProgress: number;
  remainingForFreeShipping: number;

  // The nearest coupon the user hasn't unlocked yet (for nudge banner)
  nextCoupon: AvailableCoupon | null;
  // Amount needed to reach nextCoupon threshold
  remainingForNextCoupon: number;

  addToCart: (
    product: CartItem['product'],
    sizeName: string,
    colorName: string,
    colorHex: string,
    price: number,
    originalPrice: number,
    stock: number,
    variantId: number | null,
    quantity?: number,
  ) => void;
  removeFromCart: (productId: number, sizeName: string, colorName: string) => void;
  updateQuantity: (productId: number, sizeName: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  applyCouponCode: (code: string) => Promise<void>;
  couponPending: boolean;
  removeCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  updateSiteConfig: (config: Partial<SiteConfig>) => void;
  remainingForCoupon: (minOrderValue: number) => number;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: SiteConfig = {
  free_shipping_threshold: 999,
  shipping_fee: 0,
  tax_percentage: 0,
};

const CART_KEY = 'rastlina_cart_v2';
const COUPON_KEY = 'rastlina_manual_coupon_v3';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadCoupon(): string | null {
  try {
    // Legacy entries may have been applied without consent. Never restore them.
    localStorage.removeItem('rastlina_coupon_v2');
    const saved = JSON.parse(localStorage.getItem(COUPON_KEY) || 'null');
    return typeof saved === 'string' ? normalizeCouponCode(saved) : null;
  } catch { return null; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [manualCode, setManualCode] = useState<string | null>(null);
  const [couponPending, setCouponPending] = useState(false);
  const validationRequest = useRef(0);
  const currentSubtotal = useRef(0);
  const [storageReady, setStorageReady] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  useEffect(() => {
    setItems(loadCart());
    setManualCode(loadCoupon());
    setStorageReady(true);
  }, []);

  // Persist cart
  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }, [items, storageReady]);

  // Persist coupon
  useEffect(() => {
    if (!storageReady) return;
    try {
      if (manualCode) localStorage.setItem(COUPON_KEY, JSON.stringify(manualCode));
      else localStorage.removeItem(COUPON_KEY);
    } catch {}
  }, [manualCode, storageReady]);

  // Refresh admin rules on mount and whenever the drawer visibility changes.
  useEffect(() => {
    storeService.getSiteConfig().then((cfg: any) => {
      if (cfg) {
        setSiteConfig({
          free_shipping_threshold: Number(cfg.free_shipping_threshold ?? 999),
          shipping_fee: Number(cfg.shipping_fee ?? 0),
          tax_percentage: Number(cfg.tax_percentage ?? 0),
        });
      }
    }).catch(() => {});

    // Fetch active coupons — used for auto-apply + nudge banners
    storeService.getActiveCoupons().then((coupons: AvailableCoupon[]) => {
      // Sort ascending by min_order_value so we find the cheapest to unlock first
      const sorted = [...(coupons || [])].map(normalizeCoupon).sort(
        (a, b) => a.min_order_value - b.min_order_value
      );
      setAvailableCoupons(sorted);
    }).catch(() => {});
  }, [isOpen]);

  // ── Totals ────────────────────────────────────────────────────────────────

  const totals = useMemo(() => calculateCartTotals(
    items.map(i => ({
      price: i.price,
      original_price: i.originalPrice,
      quantity: i.quantity,
      stock: i.stock,
    })),
    appliedCoupon,
    siteConfig.free_shipping_threshold,
    siteConfig.shipping_fee,
    siteConfig.tax_percentage,
  ), [items, appliedCoupon, siteConfig]);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const freeShippingProgress = useMemo(
    () => calculateFreeShippingProgress(totals.subtotal, siteConfig.free_shipping_threshold),
    [totals.subtotal, siteConfig.free_shipping_threshold],
  );

  const remainingForFreeShipping = useMemo(
    () => calculateRemainingForFreeShipping(totals.subtotal, siteConfig.free_shipping_threshold),
    [totals.subtotal, siteConfig.free_shipping_threshold],
  );

  const remainingForCoupon = useCallback(
    (minOrderValue: number) => calculateRemainingForCoupon(totals.subtotal, minOrderValue),
    [totals.subtotal],
  );

  currentSubtotal.current = totals.subtotal;

  // Always validate with the server: dates, active status, usage limit and
  // minimum spend are authoritative there. A manual selection replaces auto.
  const validateCode = useCallback(async (code: string, subtotal: number) => {
    const [response, definitions] = await Promise.all([
      storeService.validateCoupon(code, subtotal), storeService.getActiveCoupons(),
    ]);
    const definition = (definitions as AvailableCoupon[]).map(normalizeCoupon)
      .find(c => c.code === normalizeCouponCode(response.code || code));
    if (!definition || subtotal < definition.min_order_value || !Number.isFinite(definition.value) || !Number.isFinite(definition.min_order_value) || response.success !== true) throw { error: 'This promo code is no longer available.' };
    return validatedCoupon(definition, subtotal);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const subtotal = totals.subtotal;
    const candidate = manualCode || bestAutomaticCoupon(availableCoupons, subtotal)?.code;
    const request = ++validationRequest.current;
    setAppliedCoupon(null);
    if (!candidate || subtotal <= 0) {
      setCouponPending(false);
      if (subtotal <= 0) setManualCode(null);
      return;
    }
    setCouponPending(true);
    validateCode(candidate, subtotal).then(coupon => {
      if (validationRequest.current === request) setAppliedCoupon(coupon);
    }).catch((error) => {
      if (validationRequest.current !== request) return;
      if (manualCode) {
        setManualCode(null);
        toast.info(error?.error || 'Promo code removed. Please check its requirements.');
      }
    }).finally(() => {
      if (validationRequest.current === request) setCouponPending(false);
    });
    return () => { ++validationRequest.current; };
  }, [totals.subtotal, manualCode, availableCoupons, storageReady, isOpen, validateCode]);

  const applyCouponCode = useCallback(async (input: string) => {
    const code = normalizeCouponCode(input);
    const subtotal = currentSubtotal.current;
    if (!code || subtotal <= 0) throw { error: 'Add an item and enter a promo code.' };
    const request = ++validationRequest.current;
    setCouponPending(true);
    try {
      const coupon = await validateCode(code, subtotal);
      if (request !== validationRequest.current || subtotal !== currentSubtotal.current) {
        throw { error: 'Your cart changed. Please apply the code again.' };
      }
      setManualCode(code);
      setAppliedCoupon(coupon);
    } catch (error) {
      if (request === validationRequest.current) setAvailableCoupons(previous => [...previous]);
      throw error;
    } finally {
      if (request === validationRequest.current) setCouponPending(false);
    }
  }, [validateCode]);

  // ── Next coupon nudge ─────────────────────────────────────────────────────
  // The nearest coupon threshold the user hasn't yet reached
  const nextCoupon = useMemo((): AvailableCoupon | null => {
    const subtotal = totals.subtotal;
    return availableCoupons.find(c => isAutomaticCoupon(c) && c.min_order_value > subtotal) ?? null;
  }, [totals.subtotal, availableCoupons]);

  const remainingForNextCoupon = useMemo(() => {
    if (!nextCoupon) return 0;
    return Math.max(0, nextCoupon.min_order_value - totals.subtotal);
  }, [nextCoupon, totals.subtotal]);

  // ── Cart line key ─────────────────────────────────────────────────────────

  const lineKey = (productId: number, sizeName: string, colorName: string) =>
    `${productId}__${sizeName}__${colorName}`;

  // ── Actions ───────────────────────────────────────────────────────────────

  const addToCart = useCallback((
    product: CartItem['product'],
    sizeName: string,
    colorName: string,
    colorHex: string,
    price: number,
    originalPrice: number,
    stock: number,
    variantId: number | null,
    quantity = 1,
  ) => {
    if (stock <= 0) {
      toast.error('This item is out of stock.');
      return;
    }

    setItems(prev => {
      const existIdx = prev.findIndex(
        i => lineKey(i.product.id, i.selectedSize, i.selectedColor)
          === lineKey(product.id, sizeName, colorName)
      );

      if (existIdx >= 0) {
        const existing = prev[existIdx];
        const newQty = existing.quantity + quantity;
        if (newQty > stock) {
          toast.warning(`Only ${stock} units available. Already have ${existing.quantity} in cart.`);
          return prev;
        }
        const updated = [...prev];
        updated[existIdx] = { ...existing, quantity: newQty };
        return updated;
      }

      const safeQty = clampQuantity(quantity, stock);
      return [...prev, {
        product,
        quantity: safeQty,
        selectedSize: sizeName,
        selectedColor: colorName,
        selectedColorHex: colorHex,
        price,
        originalPrice,
        stock,
        variantId,
      }];
    });

    const trackedQuantity = clampQuantity(quantity, stock);
    (window as any).fbq?.('track', 'AddToCart', {
      value: price * trackedQuantity,
      currency: 'INR',
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: 'product',
      contents: [{
        id: String(product.id),
        quantity: trackedQuantity,
        item_price: price,
      }],
    });

    // Show the cart immediately so customers can review the item they just added.
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: number, sizeName: string, colorName: string) => {
    setItems(prev => prev.filter(
      i => lineKey(i.product.id, i.selectedSize, i.selectedColor)
        !== lineKey(productId, sizeName, colorName)
    ));
  }, []);

  const updateQuantity = useCallback((
    productId: number,
    sizeName: string,
    colorName: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeName, colorName);
      return;
    }
    setItems(prev => prev.map(item => {
      if (lineKey(item.product.id, item.selectedSize, item.selectedColor)
        !== lineKey(productId, sizeName, colorName)) return item;
      if (quantity > item.stock) {
        toast.warning(`Only ${item.stock} units available.`);
        return { ...item, quantity: item.stock };
      }
      return { ...item, quantity };
    }));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(p => !p), []);
  const removeCoupon = useCallback(() => {
    ++validationRequest.current;
    setManualCode(null);
    setAppliedCoupon(null);
    setCouponPending(false);
  }, []);
  const updateSiteConfig = useCallback((config: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...config }));
  }, []);

  return (
    <CartContext.Provider value={{
      items, isOpen, appliedCoupon: appliedCoupon?.validated_subtotal === totals.subtotal ? appliedCoupon : null, siteConfig, availableCoupons: availableCoupons.filter(isAutomaticCoupon),
      totals, totalItems, freeShippingProgress, remainingForFreeShipping,
      nextCoupon, remainingForNextCoupon,
      addToCart, removeFromCart, updateQuantity, clearCart,
      applyCouponCode, couponPending, removeCoupon,
      openCart, closeCart, toggleCart,
      updateSiteConfig, remainingForCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

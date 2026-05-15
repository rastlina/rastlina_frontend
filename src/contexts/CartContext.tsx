// src/contexts/CartContext.tsx
import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useMemo,
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
  canIncrement,
} from '@/utils/cartCalculations';
import { storeService } from '@/services/api';

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
  applyCoupon: (coupon: AppliedCoupon) => void;
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
const COUPON_KEY = 'rastlina_coupon_v2';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function loadCoupon(): AppliedCoupon | null {
  try {
    const raw = localStorage.getItem(COUPON_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(loadCoupon);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  // Persist cart
  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  // Persist coupon
  useEffect(() => {
    try {
      if (appliedCoupon) localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      else localStorage.removeItem(COUPON_KEY);
    } catch {}
  }, [appliedCoupon]);

  // Fetch site config + available coupons on mount
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
      const sorted = [...(coupons || [])].sort(
        (a, b) => a.min_order_value - b.min_order_value
      );
      setAvailableCoupons(sorted);
    }).catch(() => {});
  }, []);

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

  // ── Auto-apply best eligible coupon ──────────────────────────────────────
  // When subtotal changes: find best applicable coupon (highest discount) and apply if none applied
  useEffect(() => {
    if (availableCoupons.length === 0) return;
    const subtotal = totals.subtotal;

    // Find all coupons the cart qualifies for
    const eligible = availableCoupons.filter(c => subtotal >= c.min_order_value);
    if (eligible.length === 0) {
      // If previously auto-applied coupon no longer qualifies, remove it
      if (appliedCoupon) {
        const stillValid = availableCoupons.find(c => c.code === appliedCoupon.code);
        if (stillValid && subtotal < stillValid.min_order_value) {
          setAppliedCoupon(null);
          toast.info('Coupon removed — minimum order requirement no longer met.');
        }
      }
      return;
    }

    // Pick best coupon: highest flat discount value
    const best = eligible.reduce((prev, curr) => {
      const prevDiscount = prev.discount_type === 'percentage'
        ? (subtotal * prev.value) / 100
        : prev.value;
      const currDiscount = curr.discount_type === 'percentage'
        ? (subtotal * curr.value) / 100
        : curr.value;
      return currDiscount > prevDiscount ? curr : prev;
    });

    // Only auto-apply if user hasn't manually applied something better
    const bestDiscount = best.discount_type === 'percentage'
  ? Math.round((subtotal * Number(best.value)) / 100)
  : Number(best.value);

const currentDiscount = appliedCoupon
  ? (
      appliedCoupon.discount_type === 'percentage'
        ? Math.round((subtotal * Number(appliedCoupon.value)) / 100)
        : Number(appliedCoupon.value)
    )
  : 0;

if (!appliedCoupon || currentDiscount < bestDiscount) {
setAppliedCoupon({
  code: best.code,
  discount_type: best.discount_type,
  value: Number(best.value),
  min_order_value: Number(best.min_order_value),
  discount: bestDiscount,
});
      if (!appliedCoupon) {
        toast.success(`🎉 Coupon ${best.code} applied automatically!`, { duration: 3000 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totals.subtotal, availableCoupons]);

  // ── Next coupon nudge ─────────────────────────────────────────────────────
  // The nearest coupon threshold the user hasn't yet reached
  const nextCoupon = useMemo((): AvailableCoupon | null => {
    const subtotal = totals.subtotal;
    return availableCoupons.find(c => c.min_order_value > subtotal) ?? null;
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

    // Open cart drawer after adding
   
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
  const applyCoupon = useCallback((coupon: AppliedCoupon) => setAppliedCoupon(coupon), []);
  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);
  const updateSiteConfig = useCallback((config: Partial<SiteConfig>) => {
    setSiteConfig(prev => ({ ...prev, ...config }));
  }, []);

  return (
    <CartContext.Provider value={{
      items, isOpen, appliedCoupon, siteConfig, availableCoupons,
      totals, totalItems, freeShippingProgress, remainingForFreeShipping,
      nextCoupon, remainingForNextCoupon,
      addToCart, removeFromCart, updateQuantity, clearCart,
      applyCoupon, removeCoupon,
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
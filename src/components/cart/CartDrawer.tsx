import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { isAutomaticCoupon } from '@/utils/couponPolicy';
import { PromoCodeInput } from './PromoCodeInput';
import { AppliedDiscounts } from './AppliedDiscounts';
import { CartPaymentIcons } from './CartPaymentIcons';
import './cart-drawer.css';

const formatPrice = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(value);

export const CartDrawer = () => {
  const { isOpen, closeCart, items, removeFromCart, updateQuantity, totals, totalItems,
    appliedCoupon, appliedCoupons, availableCoupons, couponPending, pricingReady,
    pricingPolicyVersion, siteConfig } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]',
    ) ?? []).filter(node => !node.closest('[hidden]'));
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeCart(); }
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawerRef.current?.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawerRef.current?.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
    };
    // iOS and Android can resize only the visual viewport when the keyboard opens.
    // Fit the drawer to that visible area and keep the whole promo form reachable.
    const viewport = window.visualViewport;
    const fitViewport = () => {
      drawerRef.current?.style.setProperty('--cart-visible-height', `${viewport?.height ?? window.innerHeight}px`);
      drawerRef.current?.style.setProperty('--cart-visible-top', `${viewport?.offsetTop ?? 0}px`);
      if (document.activeElement instanceof HTMLInputElement && drawerRef.current?.contains(document.activeElement)) {
        document.activeElement.closest('form')?.scrollIntoView?.({ block: 'nearest', behavior: 'instant' });
      }
    };
    fitViewport();
    viewport?.addEventListener('resize', fitViewport);
    viewport?.addEventListener('scroll', fitViewport);
    window.addEventListener('resize', fitViewport);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      viewport?.removeEventListener('resize', fitViewport);
      viewport?.removeEventListener('scroll', fitViewport);
      window.removeEventListener('resize', fitViewport);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, closeCart]);

  const subtotal = totals.subtotal;
  const freeDeliveryTarget = Number(siteConfig.free_shipping_threshold ?? 499);
  const tenPercentCoupon = availableCoupons.find(coupon => isAutomaticCoupon(coupon)
    && coupon.discount_type === 'percentage' && Number(coupon.value) === 10);
  const tenPercentTarget = Number(tenPercentCoupon?.min_order_value ?? 999);
  const progressPercent = Math.min(100, Math.max(0, subtotal / tenPercentTarget * 100));
  const tenPercentApplied = Boolean(tenPercentCoupon && subtotal >= tenPercentTarget &&
    (pricingPolicyVersion >= 2 ? appliedCoupons?.some(c => c.code === tenPercentCoupon.code) : appliedCoupon?.code === tenPercentCoupon.code));
  const shippingWaiver = appliedCoupons?.find(coupon => coupon.free_shipping);
  const combinedOffer = pricingPolicyVersion >= 2 && appliedCoupons?.some(c => c.code === 'DIWALI10' && c.value === 10) && tenPercentApplied;

  if (!isOpen) return null;
  return <>
    <div onClick={closeCart} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
    <div ref={drawerRef} role="dialog" aria-modal="true" aria-labelledby="cart-heading" className="shopping-cart-drawer">
      <header className="cart-drawer-header">
        <h2 id="cart-heading">Your Cart {totalItems > 0 && <span>({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>}</h2>
        <button onClick={closeCart} className="cart-icon-button" aria-label="Close cart"><X size={20} /></button>
      </header>

      <div className="cart-drawer-scroll" data-testid="cart-scroll-area">
        {items.length === 0 ? <div className="cart-empty">
          <ShoppingBag size={42} strokeWidth={1.5} className="text-gray-300" />
          <h3>Your cart is empty</h3>
          <p>Add plants, planters, and seeds to create your perfect space.</p>
          <Button onClick={closeCart} asChild className="h-12 rounded-lg bg-[#1A3831] px-8 text-white"><Link to="/shop">Browse Products</Link></Button>
        </div> : <>
          <section className="cart-rewards" aria-label="Cart rewards">
            <p aria-live="polite">{shippingWaiver ? <><strong>Free shipping with {shippingWaiver.code}.</strong> No minimum spend.</>
              : subtotal < freeDeliveryTarget ? <>Add <strong>{formatPrice(freeDeliveryTarget - subtotal)}</strong> for free delivery.</>
              : subtotal < tenPercentTarget ? <><strong>Free delivery unlocked.</strong> Add {formatPrice(tenPercentTarget - subtotal)} for 10% off.</>
              : tenPercentApplied ? <strong>{combinedOffer ? 'DIWALI10 + automatic 10% off applied — 20% total savings.' : 'Automatic 10% off applied. Free delivery unlocked.'}</strong>
              : <strong>{pricingReady ? 'Free delivery unlocked. Your selected offer is applied.' : 'Checking delivery and available offers…'}</strong>}</p>
            <div className="cart-progress" role="img" aria-label={`Cart progress ${Math.round(progressPercent)} percent toward 10 percent savings at ${tenPercentTarget}`}>
              <span style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="cart-reward-labels"><span>Free delivery · {formatPrice(freeDeliveryTarget)}</span><span>10% off · {formatPrice(tenPercentTarget)}</span></div>
          </section>

          <section aria-label="Cart products" className="cart-products">
            {items.map(item => {
              const image = item.product.images?.[0]?.image;
              const lineTotal = item.price * item.quantity;
              const original = item.originalPrice * item.quantity;
              const saved = original - lineTotal;
              return <article key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="cart-product-line">
                <Link to={`/product/${item.product.slug}`} onClick={closeCart} className="cart-product-image">
                  {image ? <img src={image} alt={item.product.name} /> : <ShoppingBag size={28} className="text-gray-300" />}
                </Link>
                <div className="cart-product-description">
                  <Link to={`/product/${item.product.slug}`} onClick={closeCart}>{item.product.name}</Link>
                  <p>{[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')}</p>
                </div>
                <button onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)} className="cart-icon-button cart-remove-item" aria-label="Remove item"><Trash2 size={16} /></button>
                <div className="cart-product-controls">
                  <div className="cart-quantity">
                    <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="Increase quantity"><Plus size={14} /></button>
                  </div>
                  <div className="cart-line-price">
                    {saved > 0 && <s>{formatPrice(original)}</s>}
                    <strong>{formatPrice(lineTotal)}</strong>
                    {saved > 0 && <small>Save {formatPrice(saved)}</small>}
                  </div>
                </div>
              </article>;
            })}
          </section>

          <PromoCodeInput compact />
          <section className="cart-price-details" aria-label="Price details">
            {totals.totalSavings > 0 && <div className="cart-savings"><span><CheckCircle2 size={14} /> Total savings</span><strong>{formatPrice(totals.totalSavings)}</strong></div>}
            <dl className="cart-summary-rows">
              <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div><dt>Shipping</dt><dd className={totals.shipping === 0 ? 'cart-free-shipping' : ''}>{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</dd></div>
              {totals.tax > 0 && <div><dt>Tax</dt><dd>{formatPrice(totals.tax)}</dd></div>}
            </dl>
            <AppliedDiscounts compact />
          </section>
        </>}
      </div>

      {items.length > 0 && <footer className="cart-checkout-footer">
        <div className="cart-payable"><span>To Pay</span>
          {totals.couponDiscount > 0 && <s>{formatPrice(totals.total + totals.couponDiscount + (totals.shippingDiscount || 0))}</s>}
          <strong aria-live="polite">{formatPrice(totals.total)}</strong>
        </div>
          <Button disabled={couponPending || pricingReady === false} aria-label={`Checkout — ${formatPrice(totals.total)}`}
            onClick={() => { closeCart(); navigate('/checkout'); }} className="cart-checkout-button">
            <span>Checkout</span><CartPaymentIcons />
          </Button>
        <p className="cart-secure-checkout">Secure checkout · Razorpay encrypted</p>
      </footer>}
    </div>
  </>;
};

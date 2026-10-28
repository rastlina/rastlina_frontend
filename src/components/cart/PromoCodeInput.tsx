import { useId, useState } from 'react';
import { Loader2, Tag, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export function PromoCodeInput() {
  const { appliedCoupon, applyCouponCode, removeCoupon, couponPending, totals, appliedCoupons, pricingPolicyVersion, pricingError, retryPromotions } = useCart();
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const apply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || busy || couponPending) return;
    setBusy(true);
    setMessage('');
    try {
      await applyCouponCode(code);
      setCode('');
      setError(false);
      setMessage(pricingPolicyVersion >= 2 ? 'Promo code applied. Eligible automatic savings are included.' : 'Promo code applied. One offer per order.');
    } catch (failure: unknown) {
      setError(true);
      setMessage((failure as { error?: string })?.error || 'Unable to apply this code. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <section className="space-y-2 border-t border-gray-100 p-4" aria-label="Promo codes">
      <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-semibold text-[#1A3831]">
        <Tag className="h-4 w-4" /> Promo code
      </label>
      {(pricingPolicyVersion >= 2 ? appliedCoupons : appliedCoupon ? [appliedCoupon] : []).map(coupon => (
        <div key={coupon.code} className="flex items-center justify-between gap-2 rounded-lg bg-[#F0F4E8] pl-3 text-xs text-[#496000]">
          <span><strong>{coupon.code}</strong> applied · −{(pricingPolicyVersion >= 2 ? coupon.discount : totals.couponDiscount).toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          {(!coupon.auto_apply || pricingPolicyVersion < 2) && <button type="button" onClick={() => { removeCoupon(); setMessage(''); }} aria-label="Remove promo code" className="flex min-h-11 min-w-11 items-center justify-center"><X className="h-4 w-4" /></button>}
        </div>
      ))}
      {pricingError && <div role="alert" className="text-xs text-red-600">{pricingError} <button type="button" onClick={retryPromotions} className="min-h-11 underline">Retry offer check</button></div>}
      <form onSubmit={apply} className="flex gap-2">
        <input id={inputId} value={code} onChange={event => { setCode(event.target.value); setMessage(''); }}
          placeholder="Enter promo code" autoComplete="off" autoCapitalize="characters" spellCheck={false}
          aria-describedby={messageId} aria-invalid={error && Boolean(message)}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base uppercase text-[#1A3831] placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-[#155B46]" />
        <button type="submit" disabled={busy || couponPending || !code.trim()} className="flex min-h-11 min-w-[72px] items-center justify-center rounded-lg bg-[#1A3831] px-3 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Applying promo code" /> : 'Apply'}
        </button>
      </form>
      <p id={messageId} role={error && message ? 'alert' : 'status'} className={`text-xs ${error && message ? 'text-red-600' : 'text-gray-600'}`}>
        {message || (couponPending ? 'Checking offer eligibility…' : pricingPolicyVersion >= 2 ? 'DIWALI10 combines with the automatic 10% offer on orders of ₹999 or more.' : 'One promo code per order. Enter a code to replace the current offer.')}
      </p>
    </section>
  );
}

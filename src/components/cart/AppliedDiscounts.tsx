import { useCart } from '@/contexts/CartContext';
import { calculateCouponDiscount } from '@/utils/cartCalculations';
import { bestAutomaticCoupon, isAutomaticCoupon } from '@/utils/couponPolicy';

const money = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(amount);

/** Show deductions separately from eligible offers so the total never implies stacking. */
export function AppliedDiscounts() {
  const { appliedCoupon, totals, availableCoupons, couponPending } = useCart();
  const automaticOffer = bestAutomaticCoupon(availableCoupons, totals.subtotal);
  const applied = appliedCoupon && totals.couponDiscount > 0 ? appliedCoupon : null;
  const otherAutomaticOffer = automaticOffer && applied?.code !== automaticOffer.code
    ? automaticOffer : null;
  const automaticAmount = otherAutomaticOffer
    ? calculateCouponDiscount(totals.subtotal, { ...otherAutomaticOffer, discount: 0 }) : 0;

  if (!applied && !otherAutomaticOffer && !couponPending) return null;

  return (
    <section aria-label="Applied discounts" className="space-y-2 border-y border-gray-100 py-3 text-xs sm:text-sm">
      <h3 className="font-bold text-[#1A3831]">Applied discounts</h3>
      {applied && (
        <div className="flex items-start justify-between gap-3 font-semibold text-[#667D00]">
          <span className="min-w-0 break-words">{isAutomaticCoupon(applied) ? 'Automatic discount' : 'Promo code'} — {applied.code}</span>
          <span className="shrink-0 tabular-nums">−{money(totals.couponDiscount)}</span>
        </div>
      )}
      {couponPending && <p role="status" className="text-xs text-gray-500">Checking offer eligibility…</p>}
      {otherAutomaticOffer && (
        <div className="rounded-lg bg-[#F5F7F2] px-2.5 py-2 text-[#496000]">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 break-words font-semibold">Automatic discount — {otherAutomaticOffer.code}</span>
            <span className="shrink-0 tabular-nums">{money(automaticAmount)}</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-600">
            {applied ? 'Eligible · Not added to total. Remove your promo code to use this offer.'
              : couponPending ? 'Eligible · Waiting for validation.' : 'Eligible · Not applied.'}
          </p>
        </div>
      )}
      <div className="flex justify-between gap-3 border-t border-gray-100 pt-2 font-bold text-[#1A3831]">
        <span>Total discounts</span>
        <span className="shrink-0 tabular-nums">{totals.couponDiscount > 0 ? '−' : ''}{money(totals.couponDiscount)}</span>
      </div>
    </section>
  );
}

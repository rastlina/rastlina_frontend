// src/components/profile/OrderHistory.tsx
// Rastlina — full-featured order history component.
// Changes vs previous version:
//   • Exchange request: single button, no "Upgrade" option, fixed API payload
//   • Return request: new button using submitOrderReturnRequest
//   • Request badge shown on collapsed order card
//   • Pending orders never reach this component (filtered by backend + OrderListView)

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  RotateCcw, AlertCircle, Gift, ShoppingBag, X, ArrowLeftRight,
} from 'lucide-react';
import { orderService } from '@/services/api';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<string, {
  color: string; icon: any; label: string; step: number;
}> = {
  Processing: { color: 'text-blue-700 bg-blue-50 border-blue-200',           icon: Clock,       label: 'Processing', step: 0 },
  Confirmed:  { color: 'text-[#1A3831] bg-[#1A3831]/10 border-[#1A3831]/20', icon: CheckCircle, label: 'Confirmed',  step: 1 },
  Shipped:    { color: 'text-purple-700 bg-purple-50 border-purple-200',      icon: Truck,       label: 'Shipped',    step: 2 },
  Delivered:  { color: 'text-green-700 bg-green-50 border-green-200',         icon: CheckCircle, label: 'Delivered',  step: 3 },
  Cancelled:  { color: 'text-red-700 bg-red-50 border-red-200',               icon: XCircle,     label: 'Cancelled',  step: -1 },
};

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  Paid:             'text-green-700 bg-green-50',
  Pending:          'text-yellow-700 bg-yellow-50',
  Failed:           'text-red-700 bg-red-50',
  Refunded:         'text-blue-700 bg-blue-50',
  'Refund Pending': 'text-orange-700 bg-orange-50',
};

const STATUS_STEPS = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

const fmt = (v: number | string) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(Number(v));

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

// ─── Exchange Request Modal ───────────────────────────────────────────────────

interface ExchangeModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function ExchangeModal({ orderId, onClose, onSuccess }: ExchangeModalProps) {
  const [form, setForm] = useState({ defect_description: '', defect_video_url: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.defect_description.trim()) {
      toast.error('Please describe the defect');
      return;
    }
    setSubmitting(true);
    try {
      await orderService.submitExchangeRequest(orderId, {
        defect_description: form.defect_description.trim(),
        defect_video_url: form.defect_video_url.trim() || undefined,
      });
      toast.success('Exchange request submitted! We will review within 2–3 business days.');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.defect_description?.[0] ||
        err?.error ||
        err?.detail ||
        'Failed to submit request. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif font-extrabold text-xl text-gray-900">Exchange Request</h2>
            <p className="text-sm text-gray-500 mt-1">For product defects only — an exchange code will be generated if approved.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Exchange Policy</p>
          </div>
          <ul className="text-xs text-amber-700 space-y-1 pl-6 list-disc">
            <li>Valid only for confirmed product defects</li>
            <li>No cash refunds — exchange replacement only</li>
            <li>Replacement must be equal or higher value</li>
            <li>Decision within 2–3 business days</li>
          </ul>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Describe the Defect *
          </label>
          <textarea
            rows={4}
            value={form.defect_description}
            onChange={e => setForm(f => ({ ...f, defect_description: e.target.value }))}
            placeholder="E.g. 'The plant arrived with broken stems and damaged leaves.'"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Defect Video Link <span className="font-normal normal-case text-gray-400">(Recommended)</span>
          </label>
          <input
            value={form.defect_video_url}
            onChange={e => setForm(f => ({ ...f, defect_video_url: e.target.value }))}
            placeholder="YouTube or Google Drive link"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all"
          />
          <p className="text-[10px] text-gray-400 mt-1 italic">A video significantly speeds up the review process.</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-[#1A3831] hover:bg-[#112520] text-white py-3 rounded-xl font-extrabold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : 'Submit Exchange Request'}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Return Request Modal ─────────────────────────────────────────────────────

interface ReturnModalProps {
  orderId: number;
  onClose: () => void;
  onSuccess: () => void;
}

function ReturnModal({ orderId, onClose, onSuccess }: ReturnModalProps) {
  const [form, setForm] = useState({ reason: '', video_url: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.reason.trim()) {
      toast.error('Please describe your reason for returning');
      return;
    }
    setSubmitting(true);
    try {
      await orderService.submitOrderReturnRequest(orderId, {
        reason: form.reason.trim(),
        video_url: form.video_url.trim() || undefined,
      });
      toast.success('Return request submitted! Our team will review within 2–3 business days.');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err?.reason?.[0] ||
        err?.error ||
        err?.detail ||
        'Failed to submit return request. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif font-extrabold text-xl text-gray-900">Return Request</h2>
            <p className="text-sm text-gray-500 mt-1">Request a product return. We will review and process accordingly.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Return Policy</p>
          </div>
          <ul className="text-xs text-blue-700 space-y-1 pl-6 list-disc">
            <li>Must be within 15 days of delivery</li>
            <li>We review each request individually</li>
            <li>You will be contacted about next steps</li>
          </ul>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Reason for Return *
          </label>
          <textarea
            rows={4}
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            placeholder="E.g. 'Product not as described. Received a completely different item.'"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
            Video / Photo Link <span className="font-normal normal-case text-gray-400">(Optional)</span>
          </label>
          <input
            value={form.video_url}
            onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
            placeholder="YouTube or Google Drive link"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1A3831] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-[#1A3831] hover:bg-[#112520] text-white py-3 rounded-xl font-extrabold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : 'Submit Return Request'}
          </button>
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Request Badge (shown on collapsed card) ──────────────────────────────────

function RequestBadges({ order }: { order: any }) {
  const exchangeReqs: any[] = order.return_requests ?? [];
  const returnReqs: any[] = order.order_return_requests ?? [];
  const all = [...exchangeReqs, ...returnReqs];
  if (!all.length) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {exchangeReqs.map((req: any) => (
        <span
          key={`ex-${req.id}`}
          className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${
            req.status === 'Approved'
              ? 'bg-[#F0F4E8] border-[#667D00]/30 text-[#667D00]'
              : req.status === 'Rejected'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          <ArrowLeftRight className="h-2.5 w-2.5" />
          Exchange {req.status}
        </span>
      ))}
      {returnReqs.map((req: any) => (
        <span
          key={`ret-${req.id}`}
          className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${
            req.status === 'Approved' || req.status === 'Completed'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : req.status === 'Rejected'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-orange-50 border-orange-200 text-orange-700'
          }`}
        >
          <RotateCcw className="h-2.5 w-2.5" />
          Return {req.status}
        </span>
      ))}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: any;
  expanded: boolean;
  onToggle: () => void;
  onCancelled: () => void;
  onRequestSuccess: () => void;
}

function OrderCard({ order, expanded, onToggle, onCancelled, onRequestSuccess }: OrderCardProps) {
  const [cancelling, setCancelling] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const statusCfg = ORDER_STATUS_CONFIG[order.order_status] ?? ORDER_STATUS_CONFIG.Processing;
  const StatusIcon = statusCfg.icon;
  const firstItem = order.items?.[0];
  const isCancelled = order.order_status === 'Cancelled';

  // can_request_return_legacy / can_request_exchange
  const canExchange = order.can_request_exchange ?? order.can_request_return_legacy ?? order.can_request_return ?? false;
  const canReturn = order.can_request_return ?? false;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await orderService.cancelOrder(order.id);
      toast.success(res.message || 'Order cancelled successfully.');
      onCancelled();
    } catch (err: any) {
      toast.error(err?.error || 'Could not cancel this order.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

        {/* Collapsed row */}
        <div onClick={onToggle} className="p-5 cursor-pointer hover:bg-[#FAFAF8] transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#F8F7F4] border border-gray-100">
              {firstItem?.image_url ? (
                <img src={firstItem.image_url} alt={firstItem.product_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-200" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {firstItem?.product_name || `Order #${order.id}`}
                    {order.items?.length > 1 && (
                      <span className="text-gray-400 font-normal"> +{order.items.length - 1} more</span>
                    )}
                  </p>
                  {firstItem?.variant_label && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      {firstItem.variant_label}
                    </p>
                  )}
                </div>
                <p className="font-extrabold text-gray-900 text-base flex-shrink-0">
                  {fmt(order.total_amount)}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs text-gray-400">
                  #{order.id} · {fmtDate(order.created_at)}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusCfg.color}`}>
                  <StatusIcon className="h-3 w-3" /> {statusCfg.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLOR[order.payment_status] || 'text-gray-500 bg-gray-100'}`}>
                  {order.payment_status}
                </span>
              </div>

              {/* Progress bar */}
              {!isCancelled && (
                <div className="flex items-center gap-0.5 mt-3">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentStep = STATUS_STEPS.indexOf(order.order_status);
                    return (
                      <div key={step} className="flex-1">
                        <div className={`h-1 rounded-full transition-all duration-500 ${idx <= currentStep ? 'bg-[#667D00]' : 'bg-gray-200'}`} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Request status badges — visible on collapsed card */}
              <RequestBadges order={order} />
            </div>

            <div className="flex-shrink-0 mt-0.5">
              {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-gray-100 p-5 space-y-6">

                {/* Items */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Items in this Order</p>
                  <div className="space-y-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3 bg-[#F8F7F4] rounded-xl p-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          {item.image_url
                            ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-gray-200" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {item.product_slug ? (
                              <Link to={`/product/${item.product_slug}`} className="hover:text-[#667D00] transition-colors">
                                {item.product_name}
                              </Link>
                            ) : item.product_name}
                          </p>
                          {item.variant_label && (
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{item.variant_label}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">{fmt(item.price)} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-extrabold text-gray-900 flex-shrink-0">{fmt(item.item_total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-[#F8F7F4] rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Price Breakdown</p>
                  {[
                    { label: 'Subtotal', value: fmt(order.subtotal) },
                    Number(order.discount_amount) > 0 && { label: 'Discount', value: `−${fmt(order.discount_amount)}`, green: true },
                    { label: 'Shipping', value: Number(order.shipping_fee) === 0 ? 'FREE' : fmt(order.shipping_fee), green: Number(order.shipping_fee) === 0 },
                    Number(order.tax_amount) > 0 && { label: 'Tax', value: fmt(order.tax_amount) },
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{row.label}</span>
                      <span className={`font-medium ${row.green ? 'text-[#667D00]' : 'text-gray-900'}`}>{row.value}</span>
                    </div>
                  ))}
                  {order.coupon_code && (
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                      <Gift className="h-3 w-3" />
                      Coupon: <span className="font-mono font-bold text-gray-600">{order.coupon_code}</span>
                    </p>
                  )}
                  {order.exchange_code_used && (
                    <p className="text-xs text-[#667D00] flex items-center gap-1.5">
                      <Gift className="h-3 w-3" />
                      Exchange code: <span className="font-mono font-bold">{order.exchange_code_used}</span>
                    </p>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-extrabold text-gray-900 text-sm">Total Paid</span>
                    <span className="font-extrabold text-gray-900 text-base">{fmt(order.total_amount)}</span>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Address</p>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p className="font-semibold text-gray-900">{order.first_name} {order.last_name}</p>
                    <p>{order.shipping_address}{order.apartment ? `, ${order.apartment}` : ''}</p>
                    {order.landmark && <p className="text-xs">Near: {order.landmark}</p>}
                    <p>{order.city}, {order.state} — {order.zip_code}</p>
                    <p className="text-xs text-gray-400">📞 {order.phone}</p>
                  </div>
                </div>

                {/* Tracking */}
                {order.tracking_link && (
                  <div className="bg-[#1A3831]/5 border border-[#1A3831]/20 rounded-xl p-4">
                    <p className="text-[10px] font-black text-[#1A3831] uppercase tracking-widest mb-1">Shipment Tracking</p>
                    {order.tracking_note && <p className="text-sm text-gray-700 mb-2">{order.tracking_note}</p>}
                    <a href={order.tracking_link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#667D00] hover:underline">
                      <Truck className="h-4 w-4" /> Track your package →
                    </a>
                  </div>
                )}

                {/* Exchange request results */}
                {order.return_requests?.map((req: any) => (
                  <div key={req.id} className={`rounded-xl p-4 border ${
                    req.status === 'Approved' ? 'bg-[#F0F4E8] border-[#667D00]/30'
                    : req.status === 'Rejected' ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        req.status === 'Approved' ? 'bg-[#667D00]/20 text-[#667D00]'
                        : req.status === 'Rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-500">Exchange Request</span>
                    </div>
                    {req.admin_notes && <p className="text-sm text-gray-700 mb-3">{req.admin_notes}</p>}
                    {req.exchange_code && (
                      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Exchange Code</p>
                        <p className="font-mono font-extrabold text-2xl text-[#667D00] tracking-[0.2em] mt-2">{req.exchange_code.code}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Min order: {fmt(req.exchange_code.original_order_value)}
                          {req.exchange_code.expires_at && <> · Expires {fmtDate(req.exchange_code.expires_at)}</>}
                        </p>
                        <Link to="/shop" className="inline-flex items-center gap-1 text-xs font-bold text-[#1A3831] hover:underline mt-3">
                          <ShoppingBag className="h-3 w-3" /> Shop now to use this code →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}

                {/* Return request results */}
                {order.order_return_requests?.map((req: any) => (
                  <div key={req.id} className={`rounded-xl p-4 border ${
                    req.status === 'Approved' || req.status === 'Completed' ? 'bg-blue-50 border-blue-200'
                    : req.status === 'Rejected' ? 'bg-red-50 border-red-200'
                    : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        req.status === 'Approved' || req.status === 'Completed' ? 'bg-blue-100 text-blue-700'
                        : req.status === 'Rejected' ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-gray-500">Return Request</span>
                      {req.refund_initiated && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          Refund Initiated
                        </span>
                      )}
                    </div>
                    {req.admin_notes && <p className="text-sm text-gray-700">{req.admin_notes}</p>}
                  </div>
                ))}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {order.can_cancel && (
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex items-center gap-2 text-sm font-bold text-red-600 border border-red-200 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <XCircle className="h-4 w-4" />
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}

                  {/* Exchange Request button — only if no existing exchange request */}
                  {canExchange && !order.return_requests?.length && (
                    <button
                      onClick={() => setShowExchangeModal(true)}
                      className="flex items-center gap-2 text-sm font-bold text-gray-600 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Exchange Request
                    </button>
                  )}

                  {/* Return Request button — only if no existing return request */}
                  {canReturn && !order.order_return_requests?.length && (
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="flex items-center gap-2 text-sm font-bold text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Return Request
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showExchangeModal && (
          <ExchangeModal
            orderId={order.id}
            onClose={() => setShowExchangeModal(false)}
            onSuccess={onRequestSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReturnModal && (
          <ReturnModal
            orderId={order.id}
            onClose={() => setShowReturnModal(false)}
            onSuccess={onRequestSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main OrderHistory ────────────────────────────────────────────────────────

interface OrderHistoryProps {
  orders: any[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function OrderHistory({
  orders,
  loading,
  currentPage,
  totalPages,
  totalOrders,
  onPageChange,
  onRefresh,
}: OrderHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = useCallback((id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-[#F8F7F4] rounded-3xl border border-gray-100">
        <Package className="h-14 w-14 text-gray-200 mx-auto mb-4" />
        <p className="font-serif font-extrabold text-gray-900 text-lg mb-2">No orders yet</p>
        <p className="text-sm text-gray-400 mb-6">Your order history will appear here once you place an order.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-[#1A3831] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#112520] transition-colors"
        >
          <ShoppingBag className="h-4 w-4" /> Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {totalOrders > 0 && (
        <p className="text-xs text-gray-400 font-medium">
          {totalOrders} {totalOrders === 1 ? 'order' : 'orders'} total
        </p>
      )}

      <div className="space-y-4">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            expanded={expandedId === order.id}
            onToggle={() => handleToggle(order.id)}
            onCancelled={onRefresh}
            onRequestSuccess={onRefresh}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm text-gray-400 font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}